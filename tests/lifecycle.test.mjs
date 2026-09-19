import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const FIXTURE = path.join(ROOT, "tests", "fixture");
const SCRIPTS = path.join(ROOT, "kit", ".constitution", "method", "scripts");
const HAVE_UV = spawnSync("uv", ["--version"], { stdio: "ignore" }).status === 0;
const PY_ENV = { ...process.env, PYTHONDONTWRITEBYTECODE: "1" };

function requireUv(t) {
  if (HAVE_UV) return false;
  t.skip("uv is not installed");
  return true;
}

function runValidate(cwd) {
  try {
    return execFileSync("uv", ["run", path.join(SCRIPTS, "validate.py"), "--root", ".", "--check"],
                        { cwd, encoding: "utf8", env: PY_ENV, stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    return `${e.stdout || ""}${e.stderr || ""}`;
  }
}

function runLifecycle(cwd, args = []) {
  try {
    return {
      success: true,
      output: execFileSync("uv", ["run", path.join(SCRIPTS, "lifecycle.py"), "--root", ".", ...args],
                           { cwd, encoding: "utf8", env: PY_ENV, stdio: ["ignore", "pipe", "pipe"] })
    };
  } catch (e) {
    return {
      success: false,
      output: `${e.stdout || ""}${e.stderr || ""}`,
      exitCode: e.status
    };
  }
}

function registerMoneyArea(dir) {
  const compYaml = path.join(dir, ".control", "registry", "components.yaml");
  fs.writeFileSync(compYaml, fs.readFileSync(compYaml, "utf8").replace("logical_components: []", `logical_components:
  - id: LC-1
    name: "Money Handler"
    component: checkout
    area: money
    container: app`));
}

function makeRepo(setupFn) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-lifecycle-"));
  fs.cpSync(FIXTURE, tmp, { recursive: true });
  registerMoneyArea(tmp);
  const g = (...args) => execFileSync("git", args, { cwd: tmp, stdio: "ignore" });
  g("init", "-q");
  g("add", "-A");
  g("-c", "user.email=test@wdi", "-c", "user.name=test", "commit", "-qm", "initial");
  if (setupFn) setupFn(tmp, g);
  return tmp;
}

test("archived-spec-closed: fails when an open spec points into .archive/", (t) => {
  if (requireUv(t)) return;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-arch-fail-"));
  fs.cpSync(FIXTURE, tmp, { recursive: true });
  const specsYaml = path.join(tmp, ".control", "registry", "specs.yaml");
  fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
    .replace("_bmad-output/specs/spec-1-checkout/", ".archive/specs/spec-1-checkout/"));
  try {
    const out = runValidate(tmp);
    assert.match(out, /archived-spec-closed\s+SPEC-1/,
      `archived-spec-closed should fail on open spec in .archive/:\n${out}`);
    assert.match(out, /only closed specs may be archived/,
      `archived-spec-closed error message should guide user:\n${out}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("spec-folder-location: fails when a spec points into .work/", (t) => {
  if (requireUv(t)) return;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-work-fail-"));
  fs.cpSync(FIXTURE, tmp, { recursive: true });
  const specsYaml = path.join(tmp, ".control", "registry", "specs.yaml");
  fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
    .replace("_bmad-output/specs/spec-1-checkout/", ".work/SPEC-1-checkout/"));
  try {
    const out = runValidate(tmp);
    assert.match(out, /spec-folder-location\s+SPEC-1/,
      `spec-folder-location should fail on spec in .work/:\n${out}`);
    assert.match(out, /is inside `\.work\/` — `\.work\/` is execution scratch only/,
      `spec-folder-location error message should guide user:\n${out}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("spec-folder-location: fails when an active spec points outside allowed roots", (t) => {
  if (requireUv(t)) return;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-root-fail-"));
  fs.cpSync(FIXTURE, tmp, { recursive: true });
  const specsYaml = path.join(tmp, ".control", "registry", "specs.yaml");
  fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
    .replace("_bmad-output/specs/spec-1-checkout/", "docs/specs/spec-1-checkout/"));
  try {
    const out = runValidate(tmp);
    assert.match(out, /spec-folder-location\s+SPEC-1/,
      `spec-folder-location should fail on spec in docs/:\n${out}`);
    assert.match(out, /outside allowed roots/,
      `spec-folder-location error message should mention allowed roots:\n${out}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("spec-folder-location: passes when an active spec points into .scratch/", (t) => {
  if (requireUv(t)) return;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-scratch-pass-"));
  fs.cpSync(FIXTURE, tmp, { recursive: true });
  registerMoneyArea(tmp);
  const specsYaml = path.join(tmp, ".control", "registry", "specs.yaml");
  fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
    .replace("_bmad-output/specs/spec-1-checkout/", ".scratch/SPEC-1-checkout/"));
  const srcDir = path.join(tmp, "_bmad-output", "specs", "spec-1-checkout");
  const destDir = path.join(tmp, ".scratch", "SPEC-1-checkout");
  fs.mkdirSync(path.dirname(destDir), { recursive: true });
  fs.renameSync(srcDir, destDir);
  try {
    const out = runValidate(tmp);
    assert.match(out, /GREEN — no findings/,
      `active spec in .scratch/ should validate green:\n${out}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("archived-spec-closed: passes when a closed spec points into .archive/", (t) => {
  if (requireUv(t)) return;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-arch-pass-"));
  fs.cpSync(FIXTURE, tmp, { recursive: true });
  registerMoneyArea(tmp);
  const specsYaml = path.join(tmp, ".control", "registry", "specs.yaml");
  fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
    .replace("status: open", "status: closed\n    spec_folder: .archive/specs/spec-1-checkout/"));
  const srcDir = path.join(tmp, "_bmad-output", "specs", "spec-1-checkout");
  const destDir = path.join(tmp, ".archive", "specs", "spec-1-checkout");
  fs.mkdirSync(path.dirname(destDir), { recursive: true });
  fs.renameSync(srcDir, destDir);
  try {
    const out = runValidate(tmp);
    assert.match(out, /GREEN — no findings/,
      `closed spec in .archive/ should validate green:\n${out}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("pruned closed spec passes validation when spec folder is absent from disk", (t) => {
  if (requireUv(t)) return;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-pruned-pass-"));
  fs.cpSync(FIXTURE, tmp, { recursive: true });
  registerMoneyArea(tmp);
  const specsYaml = path.join(tmp, ".control", "registry", "specs.yaml");
  fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
    .replace("status: open", "status: closed"));
  const srcDir = path.join(tmp, "_bmad-output", "specs", "spec-1-checkout");
  fs.rmSync(srcDir, { recursive: true, force: true });
  try {
    const out = runValidate(tmp);
    assert.match(out, /GREEN — no findings/,
      `pruned closed spec should validate green:\n${out}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("cites-resolve skips .archive/ in PAST_RECORD", (t) => {
  if (requireUv(t)) return;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-past-arch-"));
  fs.cpSync(FIXTURE, tmp, { recursive: true });
  const archFile = path.join(tmp, ".archive", "specs", "historical-notes.md");
  fs.mkdirSync(path.dirname(archFile), { recursive: true });
  fs.writeFileSync(archFile, "This historical record cites `.what/nonexistent-historical-spec.md`.\n");
  try {
    const out = runValidate(tmp);
    assert.doesNotMatch(out, /cites-resolve.*historical-notes\.md/,
      `.archive/ must be part of PAST_RECORD and skipped by cites-resolve:\n${out}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py CLI flags: refuses invalid combinations", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo();
  try {
    // neither archive nor prune
    const r1 = runLifecycle(tmp, ["--spec", "SPEC-1"]);
    assert.equal(r1.success, false);
    assert.match(r1.output, /must specify either --archive or --prune/);

    // both archive and prune
    const r2 = runLifecycle(tmp, ["--spec", "SPEC-1", "--archive", "--prune"]);
    assert.equal(r2.success, false);
    assert.match(r2.output, /cannot specify both --archive and --prune/);

    // neither spec nor all-closed
    const r3 = runLifecycle(tmp, ["--archive"]);
    assert.equal(r3.success, false);
    assert.match(r3.output, /must specify either --spec <id> or --all-closed/);

    // both spec and all-closed
    const r4 = runLifecycle(tmp, ["--spec", "SPEC-1", "--all-closed", "--archive"]);
    assert.equal(r4.success, false);
    assert.match(r4.output, /cannot specify both --spec and --all-closed/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py preflight: refuses when git working tree is dirty", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo((dir) => {
    fs.writeFileSync(path.join(dir, "dirty.txt"), "uncommitted change");
  });
  try {
    const res = runLifecycle(tmp, ["--spec", "SPEC-1", "--archive"]);
    assert.equal(res.success, false);
    assert.match(res.output, /git working tree has uncommitted changes/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py preflight: refuses when spec is not closed", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo();
  try {
    const res = runLifecycle(tmp, ["--spec", "SPEC-1", "--archive"]);
    assert.equal(res.success, false);
    assert.match(res.output, /only closed specs may be archived or pruned/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py preflight: refuses when memlog has artifact referencing spec folder", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo((dir, g) => {
    const specsYaml = path.join(dir, ".control", "registry", "specs.yaml");
    fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
      .replace("status: open", "status: closed")
      .replace("_bmad-output/specs/spec-1-checkout/", ".scratch/spec-1-checkout/"));
    const srcDir = path.join(dir, "_bmad-output", "specs", "spec-1-checkout");
    const destDir = path.join(dir, ".scratch", "spec-1-checkout");
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    fs.renameSync(srcDir, destDir);

    const memlog = path.join(dir, ".control", "memlog", "autopilot-DEC-001.md");
    fs.writeFileSync(memlog, [
      "---",
      "artifact: .scratch/spec-1-checkout/",
      "---",
      "# Autopilot ledger",
    ].join("\n"));

    g("add", "-A");
    g("-c", "user.email=test@wdi", "-c", "user.name=test", "commit", "-qm", "prepare");
  });

  try {
    const res = runLifecycle(tmp, ["--spec", "SPEC-1", "--archive"]);
    assert.equal(res.success, false);
    assert.match(res.output, /run provenance must not be broken/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py --dry-run: reports planned actions without modifying files or git", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo((dir, g) => {
    const specsYaml = path.join(dir, ".control", "registry", "specs.yaml");
    fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
      .replace("status: open", "status: closed")
      .replace("_bmad-output/specs/spec-1-checkout/", ".scratch/spec-1-checkout/"));
    const srcDir = path.join(dir, "_bmad-output", "specs", "spec-1-checkout");
    const destDir = path.join(dir, ".scratch", "spec-1-checkout");
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    fs.renameSync(srcDir, destDir);
    g("add", "-A");
    g("-c", "user.email=test@wdi", "-c", "user.name=test", "commit", "-qm", "prepare");
  });

  try {
    const res = runLifecycle(tmp, ["--spec", "SPEC-1", "--archive", "--dry-run"]);
    assert.equal(res.success, true);
    assert.match(res.output, /\[dry-run\] would git mv/);
    assert.match(res.output, /\[dry-run\] would update `spec_folder/);
    assert.ok(fs.existsSync(path.join(tmp, ".scratch", "spec-1-checkout")),
      "source directory should remain intact on dry-run");
    assert.ok(!fs.existsSync(path.join(tmp, ".archive", "specs", "spec-1-checkout")),
      "archive destination should not be created on dry-run");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py --archive: archives spec folder, updates specs.yaml, and validates green", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo((dir, g) => {
    const specsYaml = path.join(dir, ".control", "registry", "specs.yaml");
    fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
      .replace("status: open", "status: closed")
      .replace("_bmad-output/specs/spec-1-checkout/", ".scratch/spec-1-checkout/"));
    const srcDir = path.join(dir, "_bmad-output", "specs", "spec-1-checkout");
    const destDir = path.join(dir, ".scratch", "spec-1-checkout");
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    fs.renameSync(srcDir, destDir);
    g("add", "-A");
    g("-c", "user.email=test@wdi", "-c", "user.name=test", "commit", "-qm", "prepare");
  });

  try {
    const res = runLifecycle(tmp, ["--spec", "SPEC-1", "--archive"]);
    assert.equal(res.success, true, `lifecycle --archive failed:\n${res.output}`);
    assert.ok(fs.existsSync(path.join(tmp, ".archive", "specs", "spec-1-checkout")),
      "target should exist in .archive/specs/spec-1-checkout");
    assert.ok(!fs.existsSync(path.join(tmp, ".scratch", "spec-1-checkout")),
      "source .scratch/spec-1-checkout should no longer exist");

    const specsText = fs.readFileSync(path.join(tmp, ".control", "registry", "specs.yaml"), "utf8");
    assert.match(specsText, /spec_folder:\s*\.archive\/specs\/spec-1-checkout\//,
      "specs.yaml spec_folder should be updated to .archive/specs/spec-1-checkout/");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py --prune: removes spec folder with git rm, keeps specs.yaml metadata, and validates green", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo((dir, g) => {
    const specsYaml = path.join(dir, ".control", "registry", "specs.yaml");
    fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
      .replace("status: open", "status: closed")
      .replace("_bmad-output/specs/spec-1-checkout/", ".scratch/spec-1-checkout/"));
    const srcDir = path.join(dir, "_bmad-output", "specs", "spec-1-checkout");
    const destDir = path.join(dir, ".scratch", "spec-1-checkout");
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    fs.renameSync(srcDir, destDir);
    g("add", "-A");
    g("-c", "user.email=test@wdi", "-c", "user.name=test", "commit", "-qm", "prepare");
  });

  try {
    const res = runLifecycle(tmp, ["--spec", "SPEC-1", "--prune"]);
    assert.equal(res.success, true, `lifecycle --prune failed:\n${res.output}`);
    assert.ok(!fs.existsSync(path.join(tmp, ".scratch", "spec-1-checkout")),
      "source .scratch/spec-1-checkout should be deleted from filesystem");

    const specsText = fs.readFileSync(path.join(tmp, ".control", "registry", "specs.yaml"), "utf8");
    assert.match(specsText, /id:\s*SPEC-1/,
      "specs.yaml should preserve the spec record after prune");
    assert.match(specsText, /id:\s*SPEC-1-01/,
      "specs.yaml should preserve ticket traceability after prune");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py --all-closed: archives all closed specs", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo((dir, g) => {
    const specsYaml = path.join(dir, ".control", "registry", "specs.yaml");
    fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
      .replace("status: open", "status: closed")
      .replace("_bmad-output/specs/spec-1-checkout/", ".scratch/spec-1-checkout/"));
    const srcDir = path.join(dir, "_bmad-output", "specs", "spec-1-checkout");
    const destDir = path.join(dir, ".scratch", "spec-1-checkout");
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    fs.renameSync(srcDir, destDir);
    g("add", "-A");
    g("-c", "user.email=test@wdi", "-c", "user.name=test", "commit", "-qm", "prepare");
  });

  try {
    const res = runLifecycle(tmp, ["--all-closed", "--archive"]);
    assert.equal(res.success, true, `lifecycle --all-closed failed:\n${res.output}`);
    assert.ok(fs.existsSync(path.join(tmp, ".archive", "specs", "spec-1-checkout")));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("archived_spec_closed: catches Windows backslash path (.archive\\specs\\...)", (t) => {
  if (requireUv(t)) return;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-arch-win-"));
  fs.cpSync(FIXTURE, tmp, { recursive: true });
  const specsYaml = path.join(tmp, ".control", "registry", "specs.yaml");
  fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
    .replace("_bmad-output/specs/spec-1-checkout/", ".archive\\specs\\spec-1-checkout\\"));
  try {
    const out = runValidate(tmp);
    assert.match(out, /archived-spec-closed\s+SPEC-1/,
      `archived_spec_closed should catch backslash path on Windows:\n${out}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py --spec --prune: refuses to prune an already archived spec", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo((dir, g) => {
    const specsYaml = path.join(dir, ".control", "registry", "specs.yaml");
    fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
      .replace("status: open", "status: closed")
      .replace("_bmad-output/specs/spec-1-checkout/", ".archive/specs/spec-1-checkout/"));
    const srcDir = path.join(dir, "_bmad-output", "specs", "spec-1-checkout");
    const destDir = path.join(dir, ".archive", "specs", "spec-1-checkout");
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    fs.renameSync(srcDir, destDir);
    g("add", "-A");
    g("-c", "user.email=test@wdi", "-c", "user.name=test", "commit", "-qm", "archived");
  });

  try {
    const res = runLifecycle(tmp, ["--spec", "SPEC-1", "--prune"]);
    assert.equal(res.success, false);
    assert.match(res.output, /refusing to prune an archived audit record/);
    assert.ok(fs.existsSync(path.join(tmp, ".archive", "specs", "spec-1-checkout")),
      "archived directory must not be deleted");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py --all-closed --prune: skips already archived specs and only prunes active specs in .scratch/", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo((dir, g) => {
    // SPEC-1 is archived in .archive/
    const srcDir1 = path.join(dir, "_bmad-output", "specs", "spec-1-checkout");
    const destDir1 = path.join(dir, ".archive", "specs", "spec-1-checkout");
    fs.mkdirSync(path.dirname(destDir1), { recursive: true });
    fs.renameSync(srcDir1, destDir1);

    // SPEC-2 is active in .scratch/
    const destDir2 = path.join(dir, ".scratch", "spec-2-orders");
    fs.mkdirSync(path.join(destDir2, "issues"), { recursive: true });
    fs.writeFileSync(path.join(destDir2, "SPEC.md"), "# Spec 2\n");
    fs.writeFileSync(path.join(destDir2, "issues", "01-order.md"), "**Status:** closed\n");

    const specsYaml = path.join(dir, ".control", "registry", "specs.yaml");
    const updatedYaml = [
      "specs:",
      "  - id: SPEC-1",
      "    release: v1",
      "    prd: [checkout-v1]",
      "    fr: [FR-1]",
      "    size: S",
      "    status: closed",
      "    spec_folder: .archive/specs/spec-1-checkout/",
      "    spec_reviewed:",
      "      date: '2026-01-20'",
      "      sha: '0000000'",
      "      by: fixture",
      "      lenses: [edge-case-hunter]",
      "    tickets:",
      "      - id: SPEC-1-01",
      "        component: checkout",
      "        satisfies: [UC-1]",
      "        tests: [\"test 1\"]",
      "  - id: SPEC-2",
      "    release: v1",
      "    prd: [checkout-v1]",
      "    fr: [FR-2]",
      "    size: S",
      "    status: closed",
      "    spec_folder: .scratch/spec-2-orders/",
      "    spec_reviewed:",
      "      date: '2026-01-20'",
      "      sha: '0000000'",
      "      by: fixture",
      "      lenses: [edge-case-hunter]",
      "    tickets:",
      "      - id: SPEC-2-01",
      "        component: checkout",
      "        satisfies: [UC-2]",
      "        tests: [\"test 2\"]",
    ].join("\n");
    fs.writeFileSync(specsYaml, updatedYaml);

    g("add", "-A");
    g("-c", "user.email=test@wdi", "-c", "user.name=test", "commit", "-qm", "setup specs");
  });

  try {
    const res = runLifecycle(tmp, ["--all-closed", "--prune"]);
    assert.equal(res.success, true, `all-closed prune failed:\n${res.output}`);
    assert.match(res.output, /advisory: spec `SPEC-1` is already archived.*skipping/);
    assert.ok(fs.existsSync(path.join(tmp, ".archive", "specs", "spec-1-checkout")),
      "SPEC-1 in .archive/ must remain intact");
    assert.ok(!fs.existsSync(path.join(tmp, ".scratch", "spec-2-orders")),
      "SPEC-2 in .scratch/ must be pruned");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py --all-closed: skips closed specs whose folders are outside .scratch/", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo((dir, g) => {
    const specsYaml = path.join(dir, ".control", "registry", "specs.yaml");
    // SPEC-1 is closed but folder is in _bmad-output/specs/ (outside .scratch/)
    fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
      .replace("status: open", "status: closed"));

    g("add", "-A");
    g("-c", "user.email=test@wdi", "-c", "user.name=test", "commit", "-qm", "closed spec outside scratch");
  });

  try {
    const res = runLifecycle(tmp, ["--all-closed", "--archive"]);
    assert.equal(res.success, true, `all-closed failed:\n${res.output}`);
    assert.match(res.output, /is outside `\.scratch\/`; skipping in bulk operation/);
    assert.ok(fs.existsSync(path.join(tmp, "_bmad-output", "specs", "spec-1-checkout")),
      "folder outside .scratch/ must be untouched by --all-closed");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py update_spec_folder_in_yaml: inserts spec_folder with correct 2-space indentation when field was missing", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo((dir, g) => {
    const specsYaml = path.join(dir, ".control", "registry", "specs.yaml");
    fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
      .replace("status: open", "status: closed")
      .replace(/^[ \t]*spec_folder:.*\r?\n/m, ""));
    const srcDir = path.join(dir, "_bmad-output", "specs", "spec-1-checkout");
    const destDir = path.join(dir, ".scratch", "SPEC-1");
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    fs.renameSync(srcDir, destDir);

    g("add", "-A");
    g("-c", "user.email=test@wdi", "-c", "user.name=test", "commit", "-qm", "prepare");
  });

  try {
    const res = runLifecycle(tmp, ["--spec", "SPEC-1", "--archive"]);
    assert.equal(res.success, true, `lifecycle --archive failed:\n${res.output}`);
    const specsText = fs.readFileSync(path.join(tmp, ".control", "registry", "specs.yaml"), "utf8");
    assert.match(specsText, /^    spec_folder: \.archive\/specs\/SPEC-1\//m,
      "spec_folder must be indented with exactly 4 spaces (2 for list item + 2 for mapping key)");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py preflight: check_worktree_collision detects linked worktrees and fails", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo((dir, g) => {
    const specsYaml = path.join(dir, ".control", "registry", "specs.yaml");
    fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
      .replace("status: open", "status: closed")
      .replace("_bmad-output/specs/spec-1-checkout/", ".scratch/spec-1-checkout/"));
    const srcDir = path.join(dir, "_bmad-output", "specs", "spec-1-checkout");
    const destDir = path.join(dir, ".scratch", "spec-1-checkout");
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    fs.renameSync(srcDir, destDir);

    // Ignore nested-wt so main working tree stays clean for git status
    fs.writeFileSync(path.join(dir, ".gitignore"), "nested-wt/\n");
    g("add", "-A");
    g("-c", "user.email=test@wdi", "-c", "user.name=test", "commit", "-qm", "prepare");

    // Create a linked worktree targeting inside the spec folder
    const wtDir = path.join(destDir, "nested-wt");
    g("worktree", "add", "-b", "wt-branch", wtDir);
  });

  try {
    const res = runLifecycle(tmp, ["--spec", "SPEC-1", "--archive"]);
    assert.equal(res.success, false);
    assert.match(res.output, /is in use by active git worktree/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py rollback: rolls back staged changes when validate.py fails", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo((dir, g) => {
    const specsYaml = path.join(dir, ".control", "registry", "specs.yaml");
    fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
      .replace("status: open", "status: closed")
      .replace("_bmad-output/specs/spec-1-checkout/", ".scratch/spec-1-checkout/"));
    const srcDir = path.join(dir, "_bmad-output", "specs", "spec-1-checkout");
    const destDir = path.join(dir, ".scratch", "spec-1-checkout");
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    fs.renameSync(srcDir, destDir);

    // Plant defect: remove enforced_by from requirements so validate.py will fail
    const nfrFile = path.join(dir, ".control", "registry", "requirements-checkout-v1.yaml");
    fs.writeFileSync(nfrFile, fs.readFileSync(nfrFile, "utf8").replace(/^[ \t]*enforced_by:.*\r?\n/m, ""));

    g("add", "-A");
    g("-c", "user.email=test@wdi", "-c", "user.name=test", "commit", "-qm", "commit with defect");
  });

  try {
    const res = runLifecycle(tmp, ["--spec", "SPEC-1", "--archive"]);
    assert.equal(res.success, false);
    assert.match(res.output, /validate\.py --check failed after lifecycle operation/);
    assert.match(res.output, /Git changes have been rolled back/);
    assert.ok(fs.existsSync(path.join(tmp, ".scratch", "spec-1-checkout")),
      "source directory must be restored after rollback");
    assert.ok(!fs.existsSync(path.join(tmp, ".archive", "specs", "spec-1-checkout")),
      "archive destination must be removed after rollback");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py --archive supports reordered keys and inline comments in specs.yaml", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo((dir, g) => {
    const specsYaml = path.join(dir, ".control", "registry", "specs.yaml");
    // Layout with inline comment and reordered keys
    const customLayout = [
      "specs:",
      "  - release: v1.0 # upcoming release",
      "    prd: checkout-v1",
      "    id: SPEC-1 # primary spec",
      "    status: closed",
      "    spec_folder: .scratch/spec-1-checkout/",
    ].join("\n");
    fs.writeFileSync(specsYaml, customLayout);

    const srcDir = path.join(dir, "_bmad-output", "specs", "spec-1-checkout");
    const destDir = path.join(dir, ".scratch", "spec-1-checkout");
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    fs.renameSync(srcDir, destDir);

    g("add", "-A");
    g("-c", "user.email=test@wdi", "-c", "user.name=test", "commit", "-qm", "closed spec with custom yaml layout");
  });

  try {
    const res = runLifecycle(tmp, ["--spec", "SPEC-1", "--archive"]);
    assert.equal(res.success, true, `lifecycle failed on reordered layout:\n${res.output}`);
    assert.ok(fs.existsSync(path.join(tmp, ".archive", "specs", "spec-1-checkout")));
    const updatedYaml = fs.readFileSync(path.join(tmp, ".control", "registry", "specs.yaml"), "utf8");
    assert.match(updatedYaml, /spec_folder:\s*\.archive\/specs\/spec-1-checkout\//);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("lifecycle.py --archive succeeds when validate.py findings match .github/validate-baseline.txt", (t) => {
  if (requireUv(t)) return;
  const tmp = makeRepo((dir, g) => {
    const specsYaml = path.join(dir, ".control", "registry", "specs.yaml");
    fs.writeFileSync(specsYaml, fs.readFileSync(specsYaml, "utf8")
      .replace("status: open", "status: closed")
      .replace("_bmad-output/specs/spec-1-checkout/", ".scratch/spec-1-checkout/"));
    const srcDir = path.join(dir, "_bmad-output", "specs", "spec-1-checkout");
    const destDir = path.join(dir, ".scratch", "spec-1-checkout");
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    fs.renameSync(srcDir, destDir);

    // Plant defect: remove enforced_by from requirements so validate.py will have a finding
    const nfrFile = path.join(dir, ".control", "registry", "requirements-checkout-v1.yaml");
    fs.writeFileSync(nfrFile, fs.readFileSync(nfrFile, "utf8").replace(/^[ \t]*enforced_by:.*\r?\n/m, ""));

    // Add baseline file matching the exact defect line
    fs.mkdirSync(path.join(dir, ".github"), { recursive: true });
    fs.writeFileSync(path.join(dir, ".github", "validate-baseline.txt"), "  nfr-has-enforcer           NFR-1: has no enforcer in `enforced_by` and states no reason in `no_enforcer`\n");

    g("add", "-A");
    g("-c", "user.email=test@wdi", "-c", "user.name=test", "commit", "-qm", "commit with baseline defect");
  });

  try {
    const res = runLifecycle(tmp, ["--spec", "SPEC-1", "--archive"]);
    assert.equal(res.success, true, `lifecycle should succeed with matching baseline:\n${res.output}`);
    assert.ok(fs.existsSync(path.join(tmp, ".archive", "specs", "spec-1-checkout")),
      "archive directory must exist when findings match baseline");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

