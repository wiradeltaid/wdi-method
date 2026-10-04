/**
 * Agent / IDE targets for install and update — one record per host, and the ONE home of what the
 * method knows about each.
 *
 * IDs and `skillDir` align with BMad Method `platform-codes.yaml`, so a repo's
 * `_bmad/_config/manifest.yaml` `ides:` list maps directly. Everything else is read from the host's
 * own documentation and decides behaviour: where the engines must be visible (`reads`), which
 * `npx skills --agent` id puts them there (`skillsCli`), which project rule files carry the method
 * block (`rules`), how a person types a skill (`invoke`), whether the host can hold a skill to
 * manual-only (`manualOnly`), and whether it has a scheduler of its own (`loop`).
 *
 * The installer writes the selected records into `.control/wdi-method.yaml`, and `validate.py` and
 * the skills read them from there — no second list anywhere.
 */

import path from "node:path";

/** @typedef {"opencode-commands"} PlatformHook */

/**
 * @typedef {object} Loop
 * @property {"command" | "scheduler"} kind  `command`: typed in-session; `scheduler`: the host's own
 *   scheduler, started the way `how` says
 * @property {string} how  `{interval}` and `{prompt}` are filled in by the skill
 */

/**
 * @typedef {object} Platform
 * @property {string} id
 * @property {string} name
 * @property {boolean} preferred
 * @property {string} skillDir   where the `wdi-*` skills are written (BMad's target_dir)
 * @property {string[]} reads    every project skill directory the host reads, `skillDir` first
 * @property {string} skillsCli  `npx skills add … --agent <id>` that lands inside `reads`
 * @property {string[]} rules    project rule files beyond `AGENTS.md` that carry the method block
 * @property {string} invoke     how a person types a skill; `{skill}` is the name, `natural` = ask by name
 * @property {"frontmatter" | "claude" | "opencode" | null} manualOnly
 *   `frontmatter`: the host honours `disable-model-invocation: true`; `claude`: that plus
 *   `.claude/settings.json` deny rules; `opencode`: `opencode.json` `permission.skill: ask`;
 *   null: no mechanism — the body guard and the rule file are all there is
 * @property {Loop | null} loop
 * @property {PlatformHook[]} [hooks]
 */

/** Legacy WDI flags. `antigravity` is NOT one: it is BMad's id for the IDE (`.agent/skills`), and
 * aliasing it to the CLI made the IDE option in the picker install for the wrong host. */
/** @type {Record<string, string>} */
export const LEGACY_ALIASES = {
  claude: "claude-code",
};

/** Hosts the method no longer supports, and why. `update` names them; it never deletes their folders. */
export const RETIRED_PLATFORMS = {
  iflow: "iFlow CLI shut down on 2026-04-17, and its skills are marketplace `skill.toml` packages, not SKILL.md",
  firebender: "Firebender's service ends on 2026-10-31",
  roo: "Roo Code's repository was archived on 2026-05-15",
  hermes: "Hermes Agent reads skills from ~/.hermes/skills only — a repo's own skills are not loaded",
  neovate: "Neovate Code documents no project skill directory",
  mux: "Mux runs other agents and reads no skills of its own — select the agent it runs instead",
};

const cmd = (how) => ({ kind: "command", how });
const sched = (how) => ({ kind: "scheduler", how });

/** @type {Platform[]} */
export const PLATFORMS = [
  { id: "adal", name: "AdaL", preferred: false, skillDir: ".adal/skills",
    reads: [".adal/skills"], skillsCli: "adal", rules: [], invoke: "natural", manualOnly: null,
    loop: sched("AdaL Scheduled Prompts (cron) re-running `{prompt}` every {interval}") },
  { id: "amp", name: "Sourcegraph Amp", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".claude/skills"], skillsCli: "amp", rules: [], invoke: "natural",
    manualOnly: null, loop: null },
  { id: "antigravity", name: "Google Antigravity", preferred: false, skillDir: ".agent/skills",
    reads: [".agent/skills", ".agents/skills"], skillsCli: "antigravity", rules: [".agents/AGENTS.md"],
    invoke: "natural", manualOnly: null, loop: null },
  { id: "antigravity-cli", name: "Antigravity CLI (AGY)", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills"], skillsCli: "antigravity-cli", rules: [".agents/AGENTS.md"],
    invoke: "natural", manualOnly: null, loop: null },
  { id: "auggie", name: "Auggie", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".augment/skills", ".claude/skills"], skillsCli: "augment", rules: [],
    invoke: "/{skill}", manualOnly: null, loop: null },
  { id: "bob", name: "IBM Bob", preferred: false, skillDir: ".bob/skills",
    reads: [".bob/skills"], skillsCli: "bob", rules: [], invoke: "/{skill}", manualOnly: null, loop: null },
  { id: "claude-code", name: "Claude Code", preferred: true, skillDir: ".claude/skills",
    reads: [".claude/skills"], skillsCli: "claude-code", rules: ["CLAUDE.md"], invoke: "/{skill}",
    manualOnly: "claude", loop: cmd("/loop {interval} {prompt}") },
  { id: "cline", name: "Cline", preferred: false, skillDir: ".cline/skills",
    reads: [".cline/skills", ".clinerules/skills", ".claude/skills"], skillsCli: "claude-code", rules: [],
    invoke: "/{skill}", manualOnly: null,
    loop: sched("`cline schedule` — a Cline schedule running `{prompt}` every {interval}") },
  { id: "codex", name: "Codex", preferred: true, skillDir: ".agents/skills",
    reads: [".agents/skills"], skillsCli: "codex", rules: [], invoke: "${skill}", manualOnly: null,
    loop: null },
  { id: "codewhale", name: "CodeWhale", preferred: false, skillDir: ".codewhale/skills",
    reads: [".codewhale/skills", ".agents/skills", ".claude/skills", ".opencode/skills", ".cursor/skills"],
    skillsCli: "universal", rules: [], invoke: "/skill {skill}", manualOnly: "frontmatter", loop: null },
  { id: "codebuddy", name: "CodeBuddy", preferred: false, skillDir: ".codebuddy/skills",
    reads: [".codebuddy/skills"], skillsCli: "codebuddy", rules: ["CODEBUDDY.md"], invoke: "/{skill}",
    manualOnly: "frontmatter", loop: sched("the CronCreate tool — a session task running `{prompt}` every {interval}") },
  { id: "command-code", name: "Command Code", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".commandcode/skills", ".claude/skills"], skillsCli: "command-code", rules: [],
    invoke: "/{skill}", manualOnly: null, loop: cmd("/loop {interval} {prompt}") },
  { id: "cortex", name: "Snowflake Cortex Code", preferred: false, skillDir: ".cortex/skills",
    reads: [".cortex/skills", ".claude/skills"], skillsCli: "cortex", rules: ["CLAUDE.md"],
    invoke: "${skill}", manualOnly: null, loop: null },
  { id: "crush", name: "Crush", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".crush/skills", ".claude/skills", ".cursor/skills"], skillsCli: "crush",
    rules: ["CRUSH.md"], invoke: "natural", manualOnly: null, loop: null },
  { id: "cursor", name: "Cursor", preferred: true, skillDir: ".agents/skills",
    reads: [".agents/skills", ".cursor/skills"], skillsCli: "cursor", rules: [".cursorrules"],
    invoke: "/{skill}", manualOnly: null, loop: null },
  { id: "droid", name: "Factory Droid", preferred: false, skillDir: ".factory/skills",
    reads: [".factory/skills", ".agents/skills", ".agent/skills"], skillsCli: "droid", rules: [],
    invoke: "/{skill}", manualOnly: "frontmatter", loop: null },
  { id: "gemini", name: "Gemini CLI", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".gemini/skills"], skillsCli: "gemini-cli", rules: ["GEMINI.md"],
    invoke: "natural", manualOnly: null, loop: null },
  { id: "github-copilot", name: "GitHub Copilot", preferred: true, skillDir: ".agents/skills",
    reads: [".agents/skills", ".github/skills", ".claude/skills"], skillsCli: "github-copilot", rules: [],
    invoke: "/{skill}", manualOnly: null,
    loop: sched("Copilot CLI scheduled prompts — `{prompt}` every {interval}") },
  { id: "goose", name: "Block Goose", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".goose/skills", ".claude/skills"], skillsCli: "goose", rules: [".goosehints"],
    invoke: "natural", manualOnly: null,
    loop: sched("a Goose schedule (`goose schedule`) running `{prompt}` every {interval}") },
  { id: "junie", name: "Junie", preferred: false, skillDir: ".junie/skills",
    reads: [".junie/skills", ".agents/skills"], skillsCli: "junie", rules: [".junie/guidelines.md"],
    invoke: "/{skill}", manualOnly: null, loop: null },
  { id: "kilo", name: "Kilo Code", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".kilo/skills", ".claude/skills"], skillsCli: "kilo", rules: [],
    invoke: "/{skill}", manualOnly: null, loop: null },
  { id: "kimi-code", name: "Kimi Code", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".kimi-code/skills"], skillsCli: "kimi-code-cli", rules: [],
    invoke: "/skill:{skill}", manualOnly: "frontmatter", loop: null },
  { id: "kiro", name: "Kiro", preferred: false, skillDir: ".kiro/skills",
    reads: [".kiro/skills"], skillsCli: "kiro-cli", rules: [], invoke: "/{skill}", manualOnly: null,
    loop: null },
  { id: "kode", name: "Kode", preferred: false, skillDir: ".kode/skills",
    reads: [".kode/skills", ".claude/skills"], skillsCli: "kode", rules: [], invoke: "/{skill}",
    manualOnly: null, loop: null },
  { id: "mistral-vibe", name: "Mistral Vibe", preferred: false, skillDir: ".vibe/skills",
    reads: [".vibe/skills", ".agents/skills"], skillsCli: "mistral-vibe", rules: [], invoke: "/{skill}",
    manualOnly: null, loop: null },
  { id: "ona", name: "Ona", preferred: false, skillDir: ".ona/skills",
    reads: [".ona/skills", ".agents/skills", ".claude/skills"], skillsCli: "ona", rules: [],
    invoke: "natural", manualOnly: null, loop: null },
  { id: "openclaw", name: "OpenClaw", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", "skills"], skillsCli: "openclaw", rules: [], invoke: "/{skill}",
    manualOnly: "frontmatter", loop: null },
  { id: "opencode", name: "OpenCode", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".opencode/skills", ".claude/skills"], skillsCli: "opencode", rules: [],
    invoke: "/{skill}", manualOnly: "opencode", loop: null, hooks: ["opencode-commands"] },
  { id: "openhands", name: "OpenHands", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".openhands/skills"], skillsCli: "openhands", rules: [], invoke: "natural",
    manualOnly: null, loop: null },
  { id: "pi", name: "Pi", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".pi/skills"], skillsCli: "pi", rules: [], invoke: "/skill:{skill}",
    manualOnly: "frontmatter", loop: null },
  { id: "pochi", name: "Pochi", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".pochi/skills"], skillsCli: "pochi", rules: [], invoke: "/{skill}",
    manualOnly: "frontmatter", loop: null },
  { id: "qoder", name: "Qoder", preferred: false, skillDir: ".qoder/skills",
    reads: [".qoder/skills"], skillsCli: "qoder", rules: [], invoke: "/{skill}", manualOnly: null,
    loop: cmd("/loop {interval} {prompt}") },
  { id: "qwen", name: "QwenCoder", preferred: false, skillDir: ".qwen/skills",
    reads: [".qwen/skills"], skillsCli: "qwen-code", rules: ["QWEN.md"], invoke: "/{skill}",
    manualOnly: "frontmatter", loop: null },
  { id: "replit", name: "Replit Agent", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills"], skillsCli: "replit", rules: ["replit.md"], invoke: "natural",
    manualOnly: null, loop: null },
  { id: "rovo-dev", name: "Rovo Dev", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".rovodev/skills"], skillsCli: "rovodev", rules: [], invoke: "natural",
    manualOnly: null, loop: null },
  { id: "trae", name: "Trae", preferred: false, skillDir: ".trae/skills",
    reads: [".trae/skills"], skillsCli: "trae", rules: [".trae/rules/wdi-method.md"], invoke: "natural",
    manualOnly: null, loop: null },
  { id: "warp", name: "Warp", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".warp/skills", ".claude/skills"], skillsCli: "warp", rules: [],
    invoke: "/{skill}", manualOnly: null,
    loop: sched("a Warp Scheduled Agent running `{prompt}` every {interval}") },
  { id: "windsurf", name: "Windsurf (Devin Desktop)", preferred: false, skillDir: ".agents/skills",
    reads: [".agents/skills", ".windsurf/skills", ".devin/skills"], skillsCli: "windsurf", rules: [],
    invoke: "@{skill}", manualOnly: null, loop: null },
  { id: "zencoder", name: "Zencoder", preferred: false, skillDir: ".zencoder/skills",
    reads: [".zencoder/skills", ".agents/skills", ".claude/skills"], skillsCli: "zencoder",
    rules: [".zencoder/rules/wdi-method.md"], invoke: "/{skill}", manualOnly: "frontmatter", loop: null },
];

const BY_ID = new Map(PLATFORMS.map((p) => [p.id, p]));

export const ALL_PLATFORM_IDS = PLATFORMS.map((p) => p.id);

export const PREFERRED_PLATFORM_IDS = PLATFORMS.filter((p) => p.preferred).map((p) => p.id);

/** @param {string} raw */
export function normalizePlatformId(raw) {
  const id = raw.trim();
  return LEGACY_ALIASES[id] || id;
}

/** @param {string} id */
export function isRetiredPlatform(id) {
  return Object.hasOwn(RETIRED_PLATFORMS, normalizePlatformId(id));
}

/** @param {string[]} rawIds */
export function normalizePlatformIds(rawIds) {
  const out = [];
  const seen = new Set();
  for (const raw of rawIds) {
    const id = normalizePlatformId(raw);
    if (!BY_ID.has(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/** @param {string} id */
export function getPlatform(id) {
  return BY_ID.get(normalizePlatformId(id));
}

/** @param {string} id */
export function isKnownPlatform(id) {
  return BY_ID.has(normalizePlatformId(id));
}

/** Preferred first, then declaration order — mirrors BMad install ordering. */
export function sortedPlatforms() {
  const preferred = PLATFORMS.filter((p) => p.preferred);
  const other = PLATFORMS.filter((p) => !p.preferred);
  return [...preferred, ...other];
}

/** Every rule file a set of hosts reads, `AGENTS.md` first. */
export function ruleFiles(platformIds) {
  const out = ["AGENTS.md"];
  for (const id of normalizePlatformIds(platformIds)) {
    for (const file of getPlatform(id).rules) if (!out.includes(file)) out.push(file);
  }
  return out;
}

/** @param {Platform} platform */
function hookNote(platform) {
  const bits = [platform.skillDir, ["AGENTS.md", ...platform.rules].join(" + ")];
  if (platform.hooks?.includes("opencode-commands")) bits.push(".opencode/commands");
  if (platform.loop) bits.push("loop");
  return bits.join(" · ");
}

/** @param {string[]} selectedIds */
export function platformSelectOptions(selectedIds = []) {
  const configured = new Set(normalizePlatformIds(selectedIds));
  const sorted = sortedPlatforms();
  const head = sorted.filter((p) => configured.has(p.id));
  const tail = sorted.filter((p) => !configured.has(p.id));
  return [...head, ...tail].map((p) => {
    const tags = [];
    if (p.preferred) tags.push("⭐");
    if (configured.has(p.id)) tags.push("✅");
    const prefix = tags.length ? `${tags.join(" ")} ` : "";
    return {
      value: p.id,
      label: `${prefix}${p.name}  →  ${hookNote(p)}`,
    };
  });
}

/**
 * Minimal YAML list reader for a top-level `<key>:` block — no dependency on a YAML parser.
 * @param {import("node:fs")} fs
 * @param {string} filePath
 * @param {string} [key]
 */
export function readYamlIdesList(fs, filePath, key = "ides") {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, "utf8");
  const out = [];
  let inList = false;
  const head = new RegExp(`^${key}:\\s*$`);
  for (const line of text.split(/\r?\n/)) {
    if (head.test(line)) {
      inList = true;
      continue;
    }
    if (inList) {
      const item = line.match(/^\s+-\s+(?:id:\s*)?([A-Za-z0-9_.-]+)\s*$/);
      if (item) {
        out.push(item[1]);
        continue;
      }
      if (line.trim() && !/^\s/.test(line)) inList = false;
    }
  }
  return out;
}

/**
 * @param {string} target
 * @param {import("node:fs")} fs
 */
export function readBmadManifestIdes(target, fs) {
  const file = path.join(target, "_bmad", "_config", "manifest.yaml");
  return readYamlIdesList(fs, file);
}

/** The hosts the last install or update was run for — the stamp's own record. */
export function readStampPlatforms(target, fs) {
  return readYamlIdesList(fs, path.join(target, ".control", "wdi-method.yaml"), "platforms");
}

/** Ids a repo still names that the method no longer supports — from the stamp and BMad's manifest. */
export function retiredPlatformsIn(target, fs) {
  const raw = [...readStampPlatforms(target, fs), ...readBmadManifestIdes(target, fs)];
  return [...new Set(raw.map(normalizePlatformId).filter((id) => isRetiredPlatform(id)))];
}

/**
 * The hosts a repo DECLARES — the stamp, then BMad's manifest — with no guessing from files. Empty
 * means nobody has said, and a check that needs hosts falls back to "anywhere in the repo".
 * @param {string} target
 * @param {import("node:fs")} fs
 */
export function declaredPlatforms(target, fs) {
  const fromStamp = normalizePlatformIds(readStampPlatforms(target, fs));
  if (fromStamp.length) return fromStamp;
  return normalizePlatformIds(readBmadManifestIdes(target, fs));
}

/**
 * Which hosts this repo is for. The stamp first — it is what the owner picked last time — then
 * BMad's manifest, then the files on disk.
 * @param {string} target
 * @param {import("node:fs")} fs
 */
export function detectPlatforms(target, fs) {
  const declared = declaredPlatforms(target, fs);
  if (declared.length) return declared;

  const found = [];
  const has = (dir) => fs.existsSync(path.join(target, dir, "wdi-init", "SKILL.md"))
    || fs.existsSync(path.join(target, dir, "bmad-help", "SKILL.md"));
  // A skill directory only one host writes names that host. `.agents/skills` is shared by many,
  // so it alone stays ambiguous and is read as Cursor, the long-standing default.
  for (const p of PLATFORMS) {
    if (p.skillDir === ".agents/skills") continue;
    if (PLATFORMS.filter((q) => q.skillDir === p.skillDir).length > 1) continue;
    if (has(p.skillDir)) found.push(p.id);
  }
  if (fs.existsSync(path.join(target, ".cursorrules")) || has(".agents/skills")) found.push("cursor");
  if (fs.existsSync(path.join(target, "AGENTS.md"))) found.push("codex");
  if (fs.existsSync(path.join(target, ".agents", "AGENTS.md"))) found.push("antigravity-cli");
  const unique = normalizePlatformIds(found);
  return unique.length ? unique : PREFERRED_PLATFORM_IDS.slice();
}

/**
 * @param {string} target
 * @param {string[]} platformIds
 */
export function skillDestinations(target, platformIds) {
  const dests = new Set();
  for (const id of normalizePlatformIds(platformIds)) {
    const platform = getPlatform(id);
    if (platform?.skillDir) dests.add(path.join(target, platform.skillDir));
  }
  return [...dests];
}

/** @param {string[]} platformIds */
export function platformUsesHook(platformIds, hook) {
  return normalizePlatformIds(platformIds).some((id) => getPlatform(id)?.hooks?.includes(hook));
}

/** @param {string[]} platformIds */
export function platformsWithManualOnly(platformIds, kind) {
  return normalizePlatformIds(platformIds).filter((id) => getPlatform(id).manualOnly === kind);
}

/** The `hosts:` block the installer writes into `.control/wdi-method.yaml`. */
export function hostsYaml(platformIds) {
  const q = (s) => JSON.stringify(s);
  const lines = ["hosts:"];
  for (const id of normalizePlatformIds(platformIds)) {
    const p = getPlatform(id);
    lines.push(`  - id: ${p.id}`);
    lines.push(`    name: ${q(p.name)}`);
    lines.push(`    reads: [${p.reads.map(q).join(", ")}]`);
    lines.push(`    rules: [${["AGENTS.md", ...p.rules].map(q).join(", ")}]`);
    lines.push(`    invoke: ${q(p.invoke)}`);
    lines.push(`    manual_only: ${p.manualOnly ?? "none"}`);
    lines.push(p.loop
      ? `    loop: {kind: ${p.loop.kind}, how: ${q(p.loop.how)}}`
      : "    loop: none");
  }
  return lines.join("\n");
}

export function formatPlatformList() {
  const idWidth = Math.max(...PLATFORMS.map((p) => p.id.length), 2);
  const nameWidth = Math.max(...PLATFORMS.map((p) => p.name.length), 4);
  const pad = (s, w) => s + " ".repeat(Math.max(0, w - s.length));
  const lines = [
    "Supported platform IDs (pass via --agents <id>[,<id>...]):",
    "",
    `  ${pad("ID", idWidth)}  ${pad("Name", nameWidth)}  Skill directory · rule files · loop`,
    `  ${pad("-".repeat(idWidth), idWidth)}  ${pad("-".repeat(nameWidth), nameWidth)}  ${"-".repeat(36)}`,
  ];
  for (const p of sortedPlatforms()) {
    const star = p.preferred ? "⭐" : "  ";
    lines.push(`${star} ${pad(p.id, idWidth)}  ${pad(p.name, nameWidth)}  ${hookNote(p)}`);
  }
  lines.push("", "⭐ = recommended (same as BMad Method)",
    "loop = the host has its own scheduler, so wdi-daily-autopilot repeats; elsewhere it runs once",
    "", "Example: npx wdi-method install --yes --agents claude-code,kiro");
  return lines.join("\n");
}
