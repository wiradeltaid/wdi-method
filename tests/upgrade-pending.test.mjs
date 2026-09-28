// Whether a repo still owes `wdi-upgrade` is a fact about its CONTENT, not its version number: a repo
// on an old version may have moved half its documents by hand, and one on the newest may still carry
// a leftover. So the answer is probed, never looked up in a table — and until this file it lived in
// exactly one place, `update`'s terminal summary. Nobody who missed that screen could find it again,
// and `wdi-help` could only act on it if `update` had "just run".
//
// Three things are pinned here: the probe result is written into `.control/wdi-method.yaml` where it
// is committed and readable later; `upgrade-check` re-probes and rewrites it, which is how
// `wdi-upgrade` clears it; and the probe list in `update` cannot drift from the checklist in the skill.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const BIN = path.join(ROOT, "bin", "wdi-method.js");
const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, "");

function tmp(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `wdi-${name}-`));
}

function run(args) {
  const cfg = tmp("cfg");
  try {
    const res = spawnSync(process.execPath, [BIN, ...args],
      { cwd: ROOT, encoding: "utf8", env: { ...process.env, CLAUDE_CONFIG_DIR: cfg } });
    return { code: res.status, out: strip(`${res.stdout || ""}${res.stderr || ""}`) };
  } finally {
    fs.rmSync(cfg, { recursive: true, force: true });
  }
}

function installed() {
  const target = tmp("up");
  // The engines are not what this file tests; `--skip-engines-check` keeps them out of the way.
  const res = run(["install", target, "--yes", "--skip-bmad-check", "--skip-engines-check",
                   "--agents", "claude", "--product", "Shopfront"]);
  assert.equal(res.code, 0, res.out);
  return target;
}

const update = (target) =>
  run(["update", target, "--yes", "--skip-bmad-check", "--skip-engines-check", "--agents", "claude"]);
const stamp = (target) => fs.readFileSync(path.join(target, ".control", "wdi-method.yaml"), "utf8");
const write = (target, rel, text) => {
  fs.mkdirSync(path.dirname(path.join(target, rel)), { recursive: true });
  fs.writeFileSync(path.join(target, rel), text);
};

test("update WRITES what is pending into .control/wdi-method.yaml — the terminal is not the only record", () => {
  const target = installed();
  try {
    write(target, ".control/registry/requirements.yaml", "goals: []\n");
    const res = update(target);
    assert.match(res.out, /wdi-upgrade/, res.out);
    assert.match(stamp(target), /^upgrade_pending:\s*\n\s+- "#1 /m,
      `the pending list vanished with the terminal:\n${stamp(target)}`);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("a clean update writes NO upgrade_pending — an empty field would read as a question", () => {
  const target = installed();
  try {
    update(target);
    assert.doesNotMatch(stamp(target), /upgrade_pending/, stamp(target));
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("upgrade-check re-probes and CLEARS the field once the content has moved", () => {
  const target = installed();
  try {
    write(target, ".control/registry/requirements.yaml", "goals: []\n");
    update(target);
    const pending = run(["upgrade-check", target]);
    assert.equal(pending.code, 1, `a pending repo MUST exit non-zero:\n${pending.out}`);
    assert.match(pending.out, /#1 /, pending.out);

    fs.rmSync(path.join(target, ".control", "registry", "requirements.yaml"));
    const clean = run(["upgrade-check", target]);
    assert.equal(clean.code, 0, clean.out);
    assert.doesNotMatch(stamp(target), /upgrade_pending/,
      `upgrade-check left a stale pending list behind:\n${stamp(target)}`);
    assert.match(stamp(target), /^wdi_method: /m, "upgrade-check damaged the rest of the stamp");
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("an installed skill copy under ANY host is not old-shape content — `.kiro/skills/wdi-upgrade` quotes old paths on purpose", () => {
  const target = installed();
  try {
    write(target, ".kiro/skills/wdi-upgrade/SKILL.md", "Probe: `.control/generated/brief.md` exists.\n");
    write(target, ".work/some-tool/a-session/paper.md", "Pasted: cites `.control/generated/brief.md`\n");
    const res = run(["upgrade-check", target]);
    assert.doesNotMatch(res.out, /#10 /,
      `the method's own skill text or a scratch paper was reported as a stale product cite:\n${res.out}`);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("…while the same cite in the product's own corpus IS pending — the skip did not swallow the probe", () => {
  const target = installed();
  try {
    write(target, ".what/_product-brief/notes.md", "See `.control/generated/brief.md`.\n");
    const res = run(["upgrade-check", target]);
    assert.match(res.out, /#10 /, res.out);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("cross-component experience sitting in design-system.md is pending — it moves to .what/experience.md", () => {
  const target = installed();
  try {
    write(target, ".how/_platform/design-system.md",
      "# Design System\n\n## Tokens\n\n## Information architecture\n\nFour destinations.\n");
    const res = run(["upgrade-check", target]);
    assert.match(res.out, /#15 /, res.out);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("the corpus citing a UX run is pending — it repoints at what landed", () => {
  const target = installed();
  try {
    write(target, ".control/registry/components.yaml", COMPONENTS(ONE_PC));
    write(target, ".what/pc-a/SRS-pc-a.md", "Behaviour: `_bmad-output/ux/run/DESIGN.md` § Home.\n");
    const res = run(["upgrade-check", target]);
    assert.match(res.out, /#16 /, res.out);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("every row of wdi-upgrade's checklist has a probe in `update`, or says the validator is its probe", () => {
  // The drift guard. The checklist and the probes were two hand-kept lists, and items 13 and 14 had
  // reached the skill without ever reaching `update` — so a repo holding them heard nothing.
  const skill = fs.readFileSync(path.join(ROOT, "kit", "skills", "wdi-upgrade", "SKILL.md"), "utf8");
  const step1 = skill.slice(skill.indexOf("## Step 1"), skill.indexOf("## Step 2"));
  const rows = [...step1.matchAll(/^\|\s*(\d+)\s*\|([^|]*)\|/gm)].map((m) => ({ n: m[1], probe: m[2] }));
  assert.ok(rows.length >= 16, `could not read the checklist rows (${rows.length})`);
  const bin = fs.readFileSync(BIN, "utf8");
  for (const { n, probe } of rows) {
    if (/^\s*\*\*validator\*\*/.test(probe)) continue;
    assert.match(bin, new RegExp(`["\\x60]#${n} `),
      `wdi-upgrade item ${n} has no probe in bin/wdi-method.js pendingUpgrades() — a repo holding it hears nothing`);
  }
  // …and the other direction: a probe numbered for a row the skill does not have sends the owner to a
  // checklist that cannot tell them what to do.
  const numbered = new Set(rows.map((r) => r.n));
  for (const m of bin.matchAll(/["\x60]#(\d+) /g)) {
    assert.ok(numbered.has(m[1]), `pendingUpgrades() reports #${m[1]}, which wdi-upgrade's checklist has no row for`);
  }
});

test("every CHANGELOG entry from this rule on says whether wdi-upgrade is needed", () => {
  // The line is for the reader; the repo does not depend on it (upgrade_pending is probed). Entries
  // older than the rule are history and are not rewritten, so only those above 0.6.30 are held to it.
  const log = fs.readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8").replace(/\r\n/g, "\n");
  const cut = log.indexOf("\n## [0.6.30]");
  assert.ok(cut > 0, "CHANGELOG.md no longer has the 0.6.30 entry the rule is anchored to");
  const entries = log.slice(0, cut).split(/\n(?=## \[)/).filter((e) => e.startsWith("## ["));
  assert.ok(entries.length > 0, "no entry above 0.6.30");
  for (const e of entries) {
    assert.match(e, /^\*\*`wdi-upgrade`:\*\* /m,
      `${e.split("\n")[0]} does not say whether wdi-upgrade is needed`);
  }
});

// ---------------------------------------------------------------------------------------------
// The probes follow the validator, and cover what the checklist promises. Each case below was missed
// or misfired in the first version the peer review read.
const COMPONENTS = (pcs, containers = "[]") =>
  `product_components:${pcs}\nplatform_owns: []\ncontainers: ${containers}\nlogical_components: []\n`;
const ONE_PC = "\n  - id: pc-a\n    name: \"A\"\n    mode: catalog\n    risk_accepted: low\n";

for (const heading of ["Cross-component journeys", "Shared edge cases", "Onboarding", "Cross-component behavior",
                       "Promises every surface keeps", "Voice and tone"]) {
  test(`#15 recognises "## ${heading}" in design-system.md`, () => {
    const target = installed();
    try {
      write(target, ".how/_platform/design-system.md", `# Design System\n\n## Tokens\n\n## ${heading}\n\nText.\n`);
      assert.match(run(["upgrade-check", target]).out, /#15 /);
    } finally {
      fs.rmSync(target, { recursive: true, force: true });
    }
  });
}

test("#15 stays quiet on a design system holding only build sections", () => {
  const target = installed();
  try {
    write(target, ".how/_platform/design-system.md",
      "# Design System\n\n## Tokens\n\n## State patterns\n\n## Interaction primitives\n");
    assert.doesNotMatch(run(["upgrade-check", target]).out, /#15 /);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("#16 is NOT pending before any component exists — a G2 repo may still cite its run", () => {
  const target = installed();
  try {
    write(target, ".what/_prd/p/prd.md", "UX: `_bmad-output/ux/run/EXPERIENCE.md`.\n");
    assert.doesNotMatch(run(["upgrade-check", target]).out, /#16 /);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("#17 is probed: a heading for a container whose code is elsewhere, or `repo:` on built: false", () => {
  const target = installed();
  try {
    write(target, ".control/registry/components.yaml", COMPONENTS(ONE_PC,
      "\n  - id: api\n    built: true\n    repo: \"other/api\"\n    what: \"x\"\n"));
    write(target, ".control/structure-codebase.md", "# Codebase\n\n## Containers\n\n### api\n\nElsewhere.\n");
    assert.match(run(["upgrade-check", target]).out, /#17 /);
    write(target, ".control/registry/components.yaml", COMPONENTS(ONE_PC,
      "\n  - id: db\n    built: false\n    repo: \"a sentence of prose\"\n    what: \"x\"\n"));
    write(target, ".control/structure-codebase.md", "# Codebase\n\n## Containers\n");
    assert.match(run(["upgrade-check", target]).out, /#17 /);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("#18 is pending: a landed UX document with no `landed_from` while components exist", () => {
  const target = installed();
  try {
    write(target, ".control/registry/components.yaml", COMPONENTS(ONE_PC));
    write(target, "_bmad-output/ux/run/DESIGN.md", "---\ntype: ux\ndocument: design\n---\n");
    write(target, ".how/pc-a/01-ux/DESIGN.md", "---\ntype: ux\ncomponent: pc-a\n---\n\n# Design\n");
    assert.match(run(["upgrade-check", target]).out, /#18 /);
    write(target, ".how/pc-a/01-ux/DESIGN.md",
      "---\ntype: ux\ncomponent: pc-a\nlanded_from:\n  - _bmad-output/ux/run/DESIGN.md\n---\n\n# Design\n");
    assert.doesNotMatch(run(["upgrade-check", target]).out, /#18 /);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});
