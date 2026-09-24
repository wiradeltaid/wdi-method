import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { syncOpencodeCommands, readSkillDescription } from "../lib/opencode-commands.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const KIT_SKILLS = path.join(ROOT, "kit", "skills");
const SCAFFOLD_CONTROL = path.join(ROOT, "scaffold", ".control");

const DAILY_SKILLS = [
  "wdi-prune-or-archive",
  "wdi-daily-what-to-build",
  "wdi-daily-autopilot",
  "wdi-daily-what-to-test",
];

describe("autonomous daily tier skills", () => {
  it("kit/skills/ carries all daily and lifecycle skills with valid SKILL.md", () => {
    for (const name of DAILY_SKILLS) {
      const skillDir = path.join(KIT_SKILLS, name);
      assert.ok(fs.existsSync(skillDir), `kit/skills/${name} is missing`);
      const skillFile = path.join(skillDir, "SKILL.md");
      assert.ok(fs.existsSync(skillFile), `kit/skills/${name}/SKILL.md is missing`);

      const content = fs.readFileSync(skillFile, "utf8");
      const desc = readSkillDescription(skillDir);
      assert.ok(desc.length > 10, `description for ${name} is too short or missing`);
      assert.match(content, new RegExp(`^name:\\s*${name}`, "m"), `frontmatter name does not match ${name}`);
    }
  });

  it("scaffold/.control/ carries custom-dispatch example and test targets", () => {
    const exampleFile = path.join(SCAFFOLD_CONTROL, "custom-dispatch.yaml.example");
    assert.ok(fs.existsSync(exampleFile), "custom-dispatch.yaml.example is missing from scaffold");
    const exampleContent = fs.readFileSync(exampleFile, "utf8");
    assert.match(exampleContent, /schema:\s*1/);
    assert.match(exampleContent, /runners:\s*\{\}/);
    assert.match(exampleContent, /type:\s*auto/);
    assert.match(exampleContent, /type:\s*shell-out/);
    assert.match(exampleContent, /roles:/);
    assert.match(exampleContent, /review_policy:/);

    const targets = ["desktop.md", "web.md", "mobile.md"];
    for (const target of targets) {
      const targetPath = path.join(SCAFFOLD_CONTROL, "test-targets", target);
      assert.ok(fs.existsSync(targetPath), `test-targets/${target} is missing from scaffold`);
      const content = fs.readFileSync(targetPath, "utf8");
      assert.match(content, /- \[ \]/, `test-targets/${target} should contain markdown checklist items`);
    }
  });

  it("syncOpencodeCommands creates command pointers for daily skills", () => {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-daily-oc-"));
    try {
      const result = syncOpencodeCommands(target, DAILY_SKILLS, KIT_SKILLS);
      assert.equal(result.written, DAILY_SKILLS.length);
      for (const name of DAILY_SKILLS) {
        const cmdFile = path.join(target, ".opencode", "commands", `${name}.md`);
        assert.ok(fs.existsSync(cmdFile), `command pointer ${name}.md was not generated`);
        const content = fs.readFileSync(cmdFile, "utf8");
        assert.match(content, new RegExp(`@skills/${name}`));
      }
    } finally {
      fs.rmSync(target, { recursive: true, force: true });
    }
  });

  it("bin/wdi-method.js registers daily skills in WDI_SKILLS", () => {
    const binContent = fs.readFileSync(path.join(ROOT, "bin", "wdi-method.js"), "utf8");
    for (const name of DAILY_SKILLS) {
      assert.match(binContent, new RegExp(`"${name}"`), `WDI_SKILLS in bin/wdi-method.js is missing ${name}`);
    }
  });

  it("kit/skills/wdi-help/SKILL.md routes to the daily tier skills", () => {
    const helpContent = fs.readFileSync(path.join(KIT_SKILLS, "wdi-help", "SKILL.md"), "utf8");
    for (const name of DAILY_SKILLS) {
      assert.match(helpContent, new RegExp(`\`${name}\``), `wdi-help routing table is missing ${name}`);
    }
    assert.match(helpContent, /\.control\/generated\/status\.yaml/, "wdi-help must reference status.yaml");
    assert.match(helpContent, /MUST NOT call Read on the entire/, "wdi-help must forbid full reads of specs.yaml");
    assert.match(helpContent, /MUST NOT run broad or recursive searches across \`?\.scratch/, "wdi-help must forbid broad scratch sweeps");
  });

  it("kit/skills/wdi-explain-to-me/SKILL.md references valid status projection", () => {
    const explainContent = fs.readFileSync(path.join(KIT_SKILLS, "wdi-explain-to-me", "SKILL.md"), "utf8");
    assert.match(explainContent, /\.control\/generated\/status\.(md|yaml)/, "wdi-explain-to-me must reference valid status extension");
  });

  it("README.md and README.id.md document the daily tier skills", () => {
    const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
    const readmeId = fs.readFileSync(path.join(ROOT, "README.id.md"), "utf8");
    for (const name of DAILY_SKILLS) {
      assert.match(readme, new RegExp(name), `README.md is missing documentation for ${name}`);
      assert.match(readmeId, new RegExp(name), `README.id.md is missing documentation for ${name}`);
    }
  });

  it("update seeds custom-dispatch.yaml.example and test-targets/ into existing repo", () => {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-update-daily-"));
    try {
      fs.mkdirSync(path.join(target, ".control", "registry"), { recursive: true });
      fs.writeFileSync(path.join(target, ".control", "registry", "index.yaml"), "product: {}\npolicy: {}\n");
      fs.mkdirSync(path.join(target, ".constitution", "method"), { recursive: true });

      execFileSync(
        process.execPath,
        [path.join(ROOT, "bin", "wdi-method.js"), "update", target, "--yes", "--skip-bmad-check", "--skip-engines-check",
         "--agents", "claude"],
        { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );

      assert.ok(fs.existsSync(path.join(target, ".control", "custom-dispatch.yaml.example")),
        "custom-dispatch.yaml.example was not seeded on update");
      assert.ok(fs.existsSync(path.join(target, ".control", "custom-dispatch.yaml")),
        "custom-dispatch.yaml was not automatically seeded on update");
      assert.ok(fs.existsSync(path.join(target, ".control", "test-targets", "desktop.md")),
        "test-targets/desktop.md was not seeded on update");
      assert.ok(fs.existsSync(path.join(target, ".control", "test-targets", "web.md")),
        "test-targets/web.md was not seeded on update");
      assert.ok(fs.existsSync(path.join(target, ".control", "test-targets", "mobile.md")),
        "test-targets/mobile.md was not seeded on update");
      assert.ok(fs.existsSync(path.join(target, ".gitignore")),
        ".gitignore was not created on update");
      assert.match(fs.readFileSync(path.join(target, ".gitignore"), "utf8"),
        /\.control\/custom-dispatch\.yaml/,
        ".gitignore missing custom-dispatch.yaml rule");
      assert.match(fs.readFileSync(path.join(target, ".gitignore"), "utf8"),
        /\.work\/smoke\//,
        ".gitignore missing .work/smoke/ rule");
      assert.match(fs.readFileSync(path.join(target, ".gitignore"), "utf8"),
        /\.work\/\*\.txt/,
        ".gitignore missing .work/*.txt rule");
      assert.match(fs.readFileSync(path.join(target, ".gitignore"), "utf8"),
        /\.scratch\/\*\.txt/,
        ".gitignore missing .scratch/*.txt rule");
      assert.match(fs.readFileSync(path.join(target, ".gitignore"), "utf8"),
        /\.scratch\/\*-review-output\.md/,
        ".gitignore missing .scratch/*-review-output.md rule");
    } finally {
      fs.rmSync(target, { recursive: true, force: true });
    }
  });

  it("update preserves existing customized custom-dispatch.yaml", () => {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-preserve-dispatch-"));
    try {
      fs.mkdirSync(path.join(target, ".control", "registry"), { recursive: true });
      fs.writeFileSync(path.join(target, ".control", "registry", "index.yaml"), "product: {}\npolicy: {}\n");
      fs.writeFileSync(path.join(target, ".control", "custom-dispatch.yaml"), "# Custom Dispatch Configuration\nroles:\n  reviewer: custom\n");
      fs.mkdirSync(path.join(target, ".constitution", "method"), { recursive: true });

      execFileSync(
        process.execPath,
        [path.join(ROOT, "bin", "wdi-method.js"), "update", target, "--yes", "--skip-bmad-check", "--skip-engines-check",
         "--agents", "claude"],
        { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );

      const content = fs.readFileSync(path.join(target, ".control", "custom-dispatch.yaml"), "utf8");
      assert.match(content, /# Custom Dispatch Configuration/, "custom-dispatch.yaml was overwritten by update");
      assert.match(content, /reviewer: custom/);
    } finally {
      fs.rmSync(target, { recursive: true, force: true });
    }
  });

  it("update preserves customized test targets and seeds missing ones", () => {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-partial-targets-"));
    try {
      fs.mkdirSync(path.join(target, ".control", "test-targets"), { recursive: true });
      fs.writeFileSync(path.join(target, ".control", "test-targets", "desktop.md"), "# Custom Desktop Target\n- [ ] custom check\n");
      fs.mkdirSync(path.join(target, ".control", "registry"), { recursive: true });
      fs.writeFileSync(path.join(target, ".control", "registry", "index.yaml"), "product: {}\npolicy: {}\n");
      fs.mkdirSync(path.join(target, ".constitution", "method"), { recursive: true });

      execFileSync(
        process.execPath,
        [path.join(ROOT, "bin", "wdi-method.js"), "update", target, "--yes", "--skip-bmad-check", "--skip-engines-check",
         "--agents", "claude"],
        { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );

      const desktopContent = fs.readFileSync(path.join(target, ".control", "test-targets", "desktop.md"), "utf8");
      assert.match(desktopContent, /# Custom Desktop Target/, "existing desktop.md was overwritten");
      assert.ok(fs.existsSync(path.join(target, ".control", "test-targets", "web.md")), "missing web.md was not seeded");
      assert.ok(fs.existsSync(path.join(target, ".control", "test-targets", "mobile.md")), "missing mobile.md was not seeded");
    } finally {
      fs.rmSync(target, { recursive: true, force: true });
    }
  });

  it("wdi-daily-what-to-test enforces branch immunity, process gate, and delta retrieval", () => {
    const content = fs.readFileSync(path.join(KIT_SKILLS, "wdi-daily-what-to-test", "SKILL.md"), "utf8");
    assert.match(content, /primary_branch/, "missing primary_branch resolution");
    assert.match(content, /development_branch/, "missing development_branch resolution");
    assert.match(content, /MUST NEVER be deleted/i, "missing branch immunity clause");
    assert.match(content, /git pull --ff-only/, "missing fast-forward pull mandate");
    assert.match(content, /Fail-Closed Branch Verification/i, "missing fail-closed branch precheck");
    assert.match(content, /before_sync/, "missing before_sync cursor saving");
    assert.match(content, /git fetch --prune origin/, "missing fetch with prune");
    assert.match(content, /Desktop Process Gate/i, "missing desktop process gate");
    assert.match(content, /runtime-desktop\.yaml/, "missing runtime manifest artifact");
    assert.match(content, /Delta-Scoped Retrieval/i, "missing delta-scoped checklist retrieval");
    assert.match(content, /abandoned scratch from a previous run/i, "missing enriched remediation for .work/ scratch");
  });

  it("wdi-daily-autopilot enforces mandate verification before loop", () => {
    const content = fs.readFileSync(path.join(KIT_SKILLS, "wdi-daily-autopilot", "SKILL.md"), "utf8");
    assert.match(content, /Mandate Verification & Preflight Requirement/i, "missing mandate preflight clause");
    assert.match(content, /decisions\.yaml/, "missing decisions.yaml mandate check");
    assert.match(content, /Door 1 \(Preflight\)/, "missing preflight invocation step");
    assert.match(content, /fail-closed/i, "missing fail-closed runner resolution");
    assert.match(content, /coordinator alone runs the authoritative test suite/i, "missing coordinator test suite authority");
    assert.match(content, /builder MUST NOT commit/i, "missing builder commit prohibition");
    assert.match(content, /roles\.builder.*fixed to.*coordinator/i, "missing roles.builder fixed to coordinator clause");
    assert.match(content, /No coding delegation/i, "missing prohibition of coding delegation");
  });

  it("wdi-daily-what-to-build enforces fail-closed reviewer resolution, read-only advisory review, and upfront dependencies", () => {
    const content = fs.readFileSync(path.join(KIT_SKILLS, "wdi-daily-what-to-build", "SKILL.md"), "utf8");
    assert.match(content, /fail-closed/i, "missing fail-closed reviewer resolution");
    assert.match(content, /single-string command/i, "missing single-string command specification");
    assert.doesNotMatch(content, /Interactive Housekeeping Hook/, "interactive housekeeping hook must be removed from what-to-build");
    assert.match(content, /parallel-tickets-blocked/i, "missing parallel-tickets-blocked upfront contract");
    assert.match(content, /strictly advisory \/ read-only/i, "missing advisory/read-only mandate");
    assert.match(content, /Coordinator Stamping/i, "missing coordinator stamping clause");
    assert.match(content, /Clean Ephemeral Review Artifacts/i, "missing clean ephemeral review artifacts clause");
    assert.match(content, /MUST NOT be archived or moved into `?\.scratch\/`? or `?\.archive\/`?/i, "missing prohibition against archiving scratch review files");
    assert.match(content, /uv run \.constitution\/method\/scripts\/validate\.py --generate --baseline/, "missing canonical uv validation command");

    const reviewContent = fs.readFileSync(path.join(KIT_SKILLS, "wdi-review", "SKILL.md"), "utf8");
    assert.match(reviewContent, /live peer or second-opinion review dispatched and evaluated/i, "missing live peer review stamping clause in wdi-review");

    const exampleContent = fs.readFileSync(path.join(SCAFFOLD_CONTROL, "custom-dispatch.yaml.example"), "utf8");
    assert.match(exampleContent, /timeout_s:\s*600/, "custom-dispatch.yaml.example missing timeout_s example");
    assert.match(exampleContent, /--trust-tools=fs_read/, "custom-dispatch.yaml.example missing read-only flag example");
  });

  it("wdi-autopilot and wdi-build enforce selective staging and distillation of triage scratch", () => {
    const autopilotContent = fs.readFileSync(path.join(KIT_SKILLS, "wdi-autopilot", "SKILL.md"), "utf8");
    assert.match(autopilotContent, /Selective Staging Discipline/i, "missing selective staging discipline in wdi-autopilot");
    assert.match(autopilotContent, /MUST NOT use broad wildcard staging/i, "missing wildcard staging prohibition in wdi-autopilot");
    assert.match(autopilotContent, /Clean ephemeral execution scratch/i, "missing clean execution scratch in autopilot finish");

    const buildContent = fs.readFileSync(path.join(KIT_SKILLS, "wdi-build", "SKILL.md"), "utf8");
    assert.match(buildContent, /Distillation also encompasses deleting any lingering ephemeral triage scratch/i, "missing distillation requirement for triage scratch in wdi-build");
  });

  // PI-07. delivery-flow-guide.md makes `risk_accepted: low` the HARDEST review — a two-reviewer panel
  // on the code, reviewers who are not the builder — so a peer-review bypass is what `low` forbids, not
  // what it permits. The template and the launcher once said the opposite. Both texts are checked for
  // the direction of the sentence, because a guardrail that names the right field backwards reads fine.
  it("reviewer: none is forbidden at risk_accepted: low and allowed only at medium or high", () => {
    const guide = fs.readFileSync(
      path.join(ROOT, "kit", ".constitution", "method", "document", "delivery-flow-guide.md"), "utf8");
    assert.match(guide, /\| `low` \|[^\n]*two-reviewer panel is \*\*required\*\*/,
      "delivery-flow-guide.md no longer requires the two-reviewer panel at low — this test encodes that rule");

    const example = fs.readFileSync(path.join(SCAFFOLD_CONTROL, "custom-dispatch.yaml.example"), "utf8");
    const launcher = fs.readFileSync(path.join(KIT_SKILLS, "wdi-daily-autopilot", "SKILL.md"), "utf8");
    for (const [name, text] of [["custom-dispatch.yaml.example", example], ["wdi-daily-autopilot", launcher]]) {
      // One line per sentence: comment markers and wraps gone, and a dot inside `code` (roles.reviewer)
      // no longer reads as the end of a sentence.
      const flat = text.replace(/#\s*/g, " ").replace(/\s+/g, " ").replace(/`[^`]*`/g, (m) => m.replace(/\./g, "_"));
      assert.doesNotMatch(flat, /unless all touched components have risk_accepted: `?low`?/i,
        `${name} still permits reviewer: none when every touched component is low (the reversed guardrail)`);
      assert.doesNotMatch(flat, /whose `?risk_accepted`? is not `?low`?/i,
        `${name} still scopes the peer-review guardrail to components that are NOT low (the reversed guardrail)`);
      assert.match(flat, /MUST NOT [^.]*none[^.]*risk_accepted: `?low`?/i,
        `${name} must forbid reviewer: none when any touched component is risk_accepted: low`);
      assert.match(flat, /`?medium`? or `?high`?[^.]*recorded/i,
        `${name} must allow the bypass only at medium or high, and require the choice to be recorded`);
    }
  });

  // PI-08. An example runner the owner may copy into roles.reviewer MUST be read-only. For `claude` that
  // is `--permission-mode plan`; `--dangerously-skip-permissions` is the edit flag.
  it("every example runner in custom-dispatch.yaml.example is read-only", () => {
    const example = fs.readFileSync(path.join(SCAFFOLD_CONTROL, "custom-dispatch.yaml.example"), "utf8");
    const commands = [...example.matchAll(/command:\s*'([^']+)'/g)].map((m) => m[1]);
    assert.ok(commands.length >= 5, `expected the five example runners, found ${commands.length}`);
    for (const command of commands) {
      assert.doesNotMatch(command, /--dangerously-skip-permissions|--force\b|--trust-all-tools|(^|\s)-a(\s|$)/,
        `example runner is not read-only: ${command}`);
      const cli = command.split(/\s+/)[0];
      const readOnly = { claude: /--permission-mode plan/, "kiro-cli": /--trust-tools=fs_read/, "cursor-agent": /--mode plan/ }[cli];
      assert.ok(readOnly, `example runner uses a CLI with no known read-only flag: ${cli}`);
      assert.match(command, readOnly, `example ${cli} runner lacks its read-only flag: ${command}`);
    }
    const flat = example.replace(/#\s*/g, " ").replace(/\s+/g, " ");
    assert.match(flat, /--permission-mode plan`? for `?claude/, "the read-only note must name the claude flag");
  });

  it("validate.py fails when .control/custom-dispatch.yaml is tracked in git", () => {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), "wdi-custom-dispatch-git-"));
    try {
      execFileSync("git", ["init", target], { stdio: "ignore" });
      execFileSync("git", ["-C", target, "config", "user.name", "Test"], { stdio: "ignore" });
      execFileSync("git", ["-C", target, "config", "user.email", "test@test.com"], { stdio: "ignore" });

      // Install minimal fixture into target
      execFileSync(
        process.execPath,
        [path.join(ROOT, "bin", "wdi-method.js"), "install", target, "--yes", "--skip-bmad-check", "--skip-engines-check",
         "--agents", "claude", "--product", "TestApp"],
        { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );

      // Create tracked custom-dispatch.yaml
      const dispatchPath = path.join(target, ".control", "custom-dispatch.yaml");
      fs.writeFileSync(dispatchPath, "schema: 1\n");
      execFileSync("git", ["-C", target, "add", "-f", ".control/custom-dispatch.yaml"], { stdio: "ignore" });

      const validatorPath = path.join(target, ".constitution", "method", "scripts", "validate.py");
      try {
        execFileSync("uv", ["run", validatorPath, "--root", target, "--check"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
        assert.fail("validate.py should have failed on tracked custom-dispatch.yaml");
      } catch (e) {
        const out = `${e.stdout || ""}${e.stderr || ""}`;
        assert.match(out, /custom-dispatch-untracked/, `validator output did not report custom-dispatch-untracked:\n${out}`);
      }
    } finally {
      fs.rmSync(target, { recursive: true, force: true });
    }
  });
});
