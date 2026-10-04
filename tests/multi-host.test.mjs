// WDI Method is installed for whichever hosts the owner picks, and it used to work properly on one.
// Three lists disagreed: the installer offered forty-five hosts, while the engine check, the unlock,
// the BMad lock, and `validate.py` looked in five folders. A repo installed for Kiro — which reads
// `.kiro/skills` and nothing else — was told it had no engines, and the engines it did have were
// never unlocked. These tests run every host the installer offers through the same install.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import {
  getPlatform,
  isKnownPlatform,
  PLATFORMS,
  RETIRED_PLATFORMS,
  ruleFiles,
} from "../lib/platforms.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const BIN = path.join(ROOT, "bin", "wdi-method.js");
const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, "");
const ENGINES = ["to-spec", "to-tickets", "implement", "tdd", "code-review", "domain-modeling"];
const FLAGGED = ["to-spec", "to-tickets", "implement"];
const MANUAL = ["wdi-daily-what-to-build", "wdi-daily-autopilot", "wdi-daily-what-to-test",
  "wdi-prune-or-archive", "wdi-explain-to-me"];
const HAVE_UV = spawnSync("uv", ["--version"], { stdio: "ignore" }).status === 0;

const tmp = (n) => fs.mkdtempSync(path.join(os.tmpdir(), `wdi-${n}-`));
const fm = (t) => (t.match(/^---\r?\n([\s\S]*?)\r?\n---/) || ["", ""])[1];
const locked = (t) => /^disable-model-invocation\s*:\s*true/m.test(fm(t));

function seedEngines(target, dir) {
  for (const name of ENGINES) {
    const d = path.join(target, dir, name);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, "SKILL.md"),
      `---\nname: ${name}\ndescription: "${name}"\n${FLAGGED.includes(name) ? "disable-model-invocation: true\n" : ""}---\n\n# ${name}\n`);
  }
}

function run(target, args) {
  const cfg = tmp("cfg");
  try {
    const r = spawnSync(process.execPath, [BIN, ...args], {
      cwd: ROOT, encoding: "utf8", env: { ...process.env, CLAUDE_CONFIG_DIR: cfg },
    });
    return { ok: r.status === 0, out: strip(`${r.stdout}${r.stderr}`) };
  } finally {
    fs.rmSync(cfg, { recursive: true, force: true });
  }
}

const install = (target, id, extra = []) => run(target,
  ["install", target, "--yes", "--skip-bmad-check", "--agents", id, "--product", "Shopfront", ...extra]);

test("every host record is complete, and its own skill folder is one it reads", () => {
  for (const p of PLATFORMS) {
    assert.ok(p.reads.includes(p.skillDir), `${p.id}: writes ${p.skillDir} but does not read it`);
    assert.ok(p.skillsCli, `${p.id}: no \`npx skills --agent\` id — the engines message would name none`);
    assert.ok(typeof p.invoke === "string" && p.invoke.length, `${p.id}: no invocation syntax`);
    assert.ok([null, "frontmatter", "claude", "opencode"].includes(p.manualOnly), `${p.id}: manualOnly`);
    assert.ok(p.loop === null || ["command", "scheduler"].includes(p.loop.kind), `${p.id}: loop`);
  }
});

test("a retired host is gone from the list, and naming it says why instead of 'unknown'", () => {
  for (const id of Object.keys(RETIRED_PLATFORMS)) {
    assert.equal(isKnownPlatform(id), false, `${id} is retired yet still offered`);
    const { ok, out } = run(tmp("ret"), ["install", tmp("ret2"), "--yes", "--agents", id]);
    assert.equal(ok, false);
    assert.match(out, /no longer supported/, `${id}: the refusal must say it was dropped, and why`);
  }
});

test("on every host: engines where THAT host reads them install cleanly, are unlocked, and the stamp records the host", () => {
  for (const p of PLATFORMS) {
    const target = tmp(`host-${p.id}`);
    try {
      seedEngines(target, p.skillDir);
      const { ok, out } = install(target, p.id);
      assert.ok(ok, `${p.id}: install refused engines in ${p.skillDir}, which it reads:\n${out}`);
      for (const name of FLAGGED) {
        assert.ok(!locked(fs.readFileSync(path.join(target, p.skillDir, name, "SKILL.md"), "utf8")),
          `${p.id}: ${name} in ${p.skillDir} is still flagged — wdi-build cannot drive it there`);
      }
      for (const name of MANUAL) {
        const text = fs.readFileSync(path.join(target, p.skillDir, name, "SKILL.md"), "utf8");
        assert.match(text, /Typed by the owner, or not at all/,
          `${p.id}: ${name} lost its body guard — on a host with no manual-only lock that line is the lock`);
      }
      const stamp = fs.readFileSync(path.join(target, ".control", "wdi-method.yaml"), "utf8");
      assert.match(stamp, new RegExp(`^platforms:\\n  - ${p.id}$`, "m"), `${p.id}: stamp names no platform`);
      assert.match(stamp, new RegExp(`- id: ${p.id}\\n`), `${p.id}: stamp has no hosts: entry`);
      assert.match(stamp, p.loop ? /loop: \{kind:/ : /loop: none/, `${p.id}: loop not recorded`);
      for (const rel of ruleFiles([p.id])) {
        const text = fs.readFileSync(path.join(target, ...rel.split("/")), "utf8");
        assert.match(text, /BEGIN:wdi-method/, `${p.id}: ${rel} carries no method block`);
      }
    } finally {
      fs.rmSync(target, { recursive: true, force: true });
    }
  }
});

test("engines in a folder a host does NOT read are refused, and the fix names that host's --agent", () => {
  const target = tmp("kiro-blind");
  try {
    seedEngines(target, ".agents/skills");
    const { ok, out } = install(target, "kiro");
    assert.equal(ok, false, `Kiro reads only .kiro/skills and the install went through anyway:\n${out}`);
    assert.match(out, /Kiro reads \.kiro\/skills/);
    assert.match(out, /--agent kiro-cli/, "the fix must be the command that lands them where Kiro reads");
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("two hosts with different folders need the engines in both", () => {
  const target = tmp("two-hosts");
  try {
    seedEngines(target, ".claude/skills");
    const first = install(target, "claude-code,kiro");
    assert.equal(first.ok, false, "kiro cannot see engines in .claude/skills");
    seedEngines(target, ".kiro/skills");
    const second = install(target, "claude-code,kiro");
    assert.ok(second.ok, second.out);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("the BMad G5 lock reaches every host's folder, not five of them", () => {
  const target = tmp("bmad-kiro");
  try {
    seedEngines(target, ".kiro/skills");
    const d = path.join(target, ".kiro", "skills", "bmad-build");
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, "SKILL.md"), "---\nname: bmad-build\ndescription: x\n---\n\nbody\n");
    const { ok, out } = install(target, "kiro");
    assert.ok(ok, out);
    assert.ok(locked(fs.readFileSync(path.join(d, "SKILL.md"), "utf8")),
      "bmad-build in .kiro/skills is still model-invocable");
    assert.equal(fs.existsSync(path.join(target, ".claude")), false,
      "a Kiro-only install created .claude/ — nothing in this repo reads it");
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("OpenCode gets its own lock — `ask`, merged, never overwriting what the product set", () => {
  const target = tmp("opencode");
  try {
    seedEngines(target, ".agents/skills");
    fs.writeFileSync(path.join(target, "opencode.json"),
      JSON.stringify({ model: "x/y", permission: { skill: { "wdi-explain-to-me": "allow" } } }, null, 2));
    const { ok, out } = install(target, "opencode");
    assert.ok(ok, out);
    const cfg = JSON.parse(fs.readFileSync(path.join(target, "opencode.json"), "utf8"));
    assert.equal(cfg.model, "x/y", "the product's own setting was lost");
    assert.equal(cfg.permission.skill["wdi-explain-to-me"], "allow", "a value the product chose was overwritten");
    assert.equal(cfg.permission.skill["wdi-daily-autopilot"], "ask");
    assert.equal(cfg.permission.skill["bmad-build"], "ask");
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("update reuses the hosts the stamp recorded, and names a retired one without deleting its folder", () => {
  const target = tmp("upd");
  try {
    seedEngines(target, ".kiro/skills");
    assert.ok(install(target, "kiro").ok);
    const stamp = path.join(target, ".control", "wdi-method.yaml");
    fs.writeFileSync(stamp, fs.readFileSync(stamp, "utf8").replace("platforms:\n  - kiro", "platforms:\n  - kiro\n  - roo"));
    fs.mkdirSync(path.join(target, ".roo", "skills", "wdi-help"), { recursive: true });
    fs.writeFileSync(path.join(target, ".roo", "skills", "wdi-help", "SKILL.md"), "---\nname: wdi-help\n---\n");
    const { ok, out } = run(target, ["update", target, "--yes", "--skip-bmad-check"]);
    assert.ok(ok, out);
    assert.match(out, /platforms\s+kiro\b/, `update did not reuse the stamped host:\n${out}`);
    assert.match(out, /roo is no longer supported/);
    assert.ok(fs.existsSync(path.join(target, ".roo", "skills", "wdi-help", "SKILL.md")),
      "update deleted a retired host's folder — absence is the owner's decision");
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("validate.py: engines flagged in .kiro/skills are RED, not 'no engines in this repo'", { skip: !HAVE_UV }, () => {
  const target = tmp("val-kiro");
  try {
    fs.cpSync(path.join(ROOT, "tests", "fixture"), target, { recursive: true });
    fs.cpSync(path.join(ROOT, "kit", ".constitution", "method", "scripts"),
      path.join(target, ".constitution", "method", "scripts"), { recursive: true });
    seedEngines(target, ".kiro/skills");
    const r = spawnSync("uv", ["run", ".constitution/method/scripts/validate.py"], {
      cwd: target, encoding: "utf8", env: { ...process.env, NO_COLOR: "1", PYTHONDONTWRITEBYTECODE: "1" },
    });
    const out = strip(`${r.stdout}${r.stderr}`).replace(/\s+/g, " ");
    assert.doesNotMatch(out, /no engines in this repo/, "the validator still cannot see .kiro/skills");
    assert.match(out, /\.kiro\/skills\/to-spec\/SKILL\.md carries `disable-model-invocation`/);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("validate.py: a stamped host that cannot read an engine is RED", { skip: !HAVE_UV }, () => {
  const target = tmp("val-host");
  try {
    fs.cpSync(path.join(ROOT, "tests", "fixture"), target, { recursive: true });
    fs.cpSync(path.join(ROOT, "kit", ".constitution", "method", "scripts"),
      path.join(target, ".constitution", "method", "scripts"), { recursive: true });
    seedEngines(target, ".agents/skills");
    fs.mkdirSync(path.join(target, ".control"), { recursive: true });
    fs.writeFileSync(path.join(target, ".control", "wdi-method.yaml"),
      "platforms:\n  - kiro\nhosts:\n  - id: kiro\n    reads: [\".kiro/skills\"]\n");
    const r = spawnSync("uv", ["run", ".constitution/method/scripts/validate.py"], {
      cwd: target, encoding: "utf8", env: { ...process.env, NO_COLOR: "1", PYTHONDONTWRITEBYTECODE: "1" },
    });
    const out = strip(`${r.stdout}${r.stderr}`).replace(/\s+/g, " ");
    assert.match(out, /is not in any folder kiro reads/);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("the kit names no host-specific tool as the only way: no bare `Skill tool`, `Agent` tool, or `/loop` contract", () => {
  const skills = path.join(ROOT, "kit", "skills");
  for (const name of fs.readdirSync(skills)) {
    const text = fs.readFileSync(path.join(skills, name, "SKILL.md"), "utf8");
    assert.doesNotMatch(text, /through the Skill tool/, `${name} still binds engine invocation to one host's tool`);
    assert.doesNotMatch(text, /via (the )?(in-session )?`Agent`/, `${name} still dispatches through Claude Code's Agent tool only`);
    assert.doesNotMatch(text, /Invoke the `loop` skill/, `${name} still starts the loop through Claude Code's /loop only`);
    assert.doesNotMatch(text, /the owner runs them|The owner runs `\/implement`/,
      `${name} still says the owner must run the engines — the contradiction that stalled non-Claude hosts`);
  }
  assert.ok(getPlatform("kiro").loop === null, "Kiro has no scheduler of its own — the once path must apply");
});

test("the refusal offers the offline fix and the leave-it-out fix, not only npx skills add", () => {
  const target = tmp("kiro-msg");
  try {
    seedEngines(target, ".claude/skills");
    const { ok, out } = install(target, "claude-code,kiro");
    assert.equal(ok, false);
    assert.match(out, /npx wdi-method engines --copy/, "the copy fix is not named");
    assert.match(out, /--copy-engines/);
    assert.match(out, /leave those hosts out/i, "deselecting an unused host is not offered");
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("--copy-engines copies the repo's own engines where a blind host reads, unlocks them, never overwrites", () => {
  const target = tmp("copy-eng");
  try {
    seedEngines(target, ".claude/skills");
    const keep = path.join(target, ".kiro", "skills", "tdd");
    fs.mkdirSync(keep, { recursive: true });
    fs.writeFileSync(path.join(keep, "SKILL.md"), "---\nname: tdd\ndescription: the product's own\n---\n\nmine\n");
    const { ok, out } = install(target, "claude-code,kiro", ["--copy-engines"]);
    assert.ok(ok, out);
    for (const name of ENGINES) {
      assert.ok(fs.existsSync(path.join(target, ".kiro", "skills", name, "SKILL.md")), `${name} not copied for Kiro`);
    }
    for (const name of FLAGGED) {
      assert.ok(!locked(fs.readFileSync(path.join(target, ".kiro", "skills", name, "SKILL.md"), "utf8")),
        `${name} was copied but left flagged`);
    }
    assert.match(fs.readFileSync(path.join(keep, "SKILL.md"), "utf8"), /mine/,
      "an engine folder that already existed was overwritten");
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("`engines --copy` does the same for an installed repo, from its stamp", () => {
  const target = tmp("copy-cmd");
  try {
    seedEngines(target, ".kiro/skills");
    assert.ok(install(target, "kiro").ok);
    const stamp = path.join(target, ".control", "wdi-method.yaml");
    fs.writeFileSync(stamp, fs.readFileSync(stamp, "utf8")
      .replace("platforms:\n  - kiro", "platforms:\n  - kiro\n  - codebuddy")
      .replace("hosts:\n", "hosts:\n  - id: codebuddy\n    reads: [\".codebuddy/skills\"]\n"));
    const { ok, out } = run(target, ["engines", target, "--copy"]);
    assert.ok(ok, out);
    assert.ok(fs.existsSync(path.join(target, ".codebuddy", "skills", "to-spec", "SKILL.md")), out);
    assert.match(out, /engines\s+all present/);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("upstream/ is never shipped, and ROADMAP.md and UPSTREAM.md exist and are linked", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  assert.ok(!pkg.files.some((f) => /^upstream/.test(f)), "package.json files ships upstream/");
  const r = spawnSync("npm pack --dry-run --json", { cwd: ROOT, encoding: "utf8", shell: true });
  const listed = JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].files.map((f) => f.path);
  assert.ok(!listed.some((p) => p.startsWith("upstream/")), "the tarball carries upstream/");
  for (const f of ["ROADMAP.md", "UPSTREAM.md"]) assert.ok(fs.existsSync(path.join(ROOT, f)), `${f} missing`);
  assert.match(fs.readFileSync(path.join(ROOT, "README.md"), "utf8"), /\(ROADMAP\.md\)/);
  assert.match(fs.readFileSync(path.join(ROOT, "NOTICE"), "utf8"), /BMad Code, LLC/);
});
