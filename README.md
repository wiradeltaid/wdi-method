# WDI Method

> A review layer on top of BMad: documents a human reads to check technical decisions before code is written, sized to what the change actually deserves.

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.id/wdi-method/docs/) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) writes documents for AI agents. WDI Method adds documents that many roles already read: use cases, C4 diagrams, API and database lists, and design documents. It wraps BMad without replacing it: each WDI skill hands the writing to a BMad skill, then checks the result against the method's guides.

> This repository is **public and generic**. It MUST NOT carry a client name, a commercial product name, or a link to a private repository. Product identity lives entirely in the repository that installs it.

---

## AI-Driven Development (AiDD) vs. Vibe Coding

Vibe coding also uses specifications, but not consistently: each prompt session can differ, the documents are unstructured, and the process is not kept systematic. The result is much lower efficiency and effectiveness, and a real risk of accumulating technical debt. That is why a framework is needed.

In WDI Method, AI-Driven Development (AiDD) runs in one order: promises registered as FR and use cases, then the gates, then the spec cut into tickets with `to-spec` and `to-tickets`, then each ticket built test-first, then one PR the owner reviews and merges.

Three layers do the work:

| Layer | Who | What it does |
|---|---|---|
| 1. Documents for agents | [BMad](https://github.com/bmad-code-org/BMAD-METHOD) | Writes the product brief, the PRD, UX, and the architecture spine, each through a BMad skill |
| 2. Review layer | WDI Method | Wraps those skills, adds the documents other roles read, runs five human gates, links Goal → FR → UC → Ticket → Test, and checks the corpus for drift |
| 3. Tickets and code | Engines ([mattpocock/skills](https://github.com/mattpocock/skills)) | `to-spec` and `to-tickets` cut the spec into vertical tickets; `implement` builds each one test-first |

### Documents Follow Code

A document behind the code is in its expected state, not a defect. Where the owner chose the code over a document, the document is the one corrected. A document ahead of the code, such as a spec not built yet, is also normal.

---

## Install in 3 Steps

### Prerequisites

- Node.js 20 or later.
- Git.
- [uv](https://docs.astral.sh/uv/), which runs the method's Python 3.11+ validators.
- An agent platform: Claude Code, Cursor, Codex, and other agent platforms.

Run the three steps in order. The installer stops if step 1 or step 2 has not been done. All prompts offer defaults; pressing <kbd>Enter</kbd> accepts them.

### Step 1: Install BMad Method
```bash
cd /path/to/your/product-repo
npx bmad-method install
```

### Step 2: Add the Six Engines
Install the engines into your repository (choose either "copy" or "symlink"):
```bash
npx skills@latest add mattpocock/skills
```
*Select all six engines the method drives:* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, and `domain-modeling`.

> **Why the Claude Code Plugin Is Not Enough:** Three of the six engines (`to-spec`, `to-tickets`, `implement`) ship with `disable-model-invocation: true`. On every install and update, WDI Method removes that line from the copies in your repo, so `wdi-build` and `wdi-autopilot` can run them. It cannot edit a user-level plugin, so the installer stops until the engines are in the repo. `--skip-engines-check` skips this check.

### Step 3: Install WDI Method
Launches the interactive installer and places the skills where each of your agent platforms reads them:
```bash
npx wdi-method
```
*(Non-interactive: `npx wdi-method install --yes --agents claude-code --product "Your Product"`)*

> **What the installer changes in BMad:** The installer also turns off model invocation for 13 BMad build and sprint skills that the engines replace, and adds matching deny rules to `.claude/settings.json`. You can still run them by typing the command.

### Your First Command: `/wdi-help`
Inside your coding agent, run:
```text
/wdi-help
```
`wdi-help` reads `.control/registry/` and tells you the gate your project is at, the open specs, and the next skill, without guessing from the conversation.

---

## Three Workflow Options

WDI Method sizes its ceremony to the scale and risk of the task.

### Option A: Guided Delivery Track (G1 to G5)
For new products, major initiatives, and architectural changes. You start each gate skill; the agent names the next one and waits.

**One Decision Per Gate.** Each gate decides one thing. At G1 to G4 you read one rendered page; at G5 you read the spec's RTM rows. You answer a short checklist, and one "no" on a starred question holds the gate.

| Gate | Decides | Skill | What You Read | Owner Decision |
|---|---|---|---|---|
| **G1 Problem** | What the problem is, whose it is, and why it earns work | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | Approve the problem framing |
| **G2 Product** | What is built, and how it feels to use | `/wdi-product`<br>`/wdi-ux` (optional) | `.what-rendered/_prd/<slug>/prd.md` | Approve the functional promises (FR) |
| **G3 Blueprint** | The whole picture of the product, once per product | `/wdi-blueprint` | `.how-rendered/blueprint.md` | Approve the architecture spine |
| **G4 Component** | How one component is built (skipped at `mode: catalog`) | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | Approve the software design |
| **G5 Release** | Whether it is done and proven | `/wdi-build` | The spec's RTM rows in `.control/generated/` and each ticket's test evidence | Accept the spec as done, or send it back |

**Refine, Do Not Advance.** One "no" on a starred (★) checklist question holds the gate. Refine the document and run the gate again; do not approve it with the plan to fix it later.

#### Two Fields That Never Merge
- **`mode`** sets how deep each component's documents go. `catalog` (default): nothing beyond the blueprint, and G4 is skipped. `outline`: full flows for up to 3 use cases, local business rules, a decision summary. `guarded`: adds a `Failure Behaviour` section for every boundary and third-party integration documents. `deep`: adds robustness analysis, a contract per endpoint, a data dictionary, flow diagrams, and state machines.
- **`risk_accepted`** sets how hard the review is. `high` (you accept a lot of risk): the baseline structure and prose lenses. `medium`: adds the edge-case lens. `low`: adds the edge-case lens, and the code needs two reviewers who are not the builder.

If one field set both, the only way to get a thin document would be to write more risk into the risk record than you actually accept.

---

### Option B: Autonomous Daily Operations (Daily Tier)
Once the architecture is in place, everyday work runs as a daily rhythm through four skills you type inside your agent:

1. **`/wdi-daily-what-to-build [reviewer] <notes>`**  
   Turns hand-testing notes, QA observations, or bug reports into a reviewed spec or ticket on the development branch, for a later autopilot run. It stops there: it never commits, pushes, or starts the autopilot.
2. **`/wdi-daily-autopilot [self-review] [peer] [interval] [--skip-peer-review]`**  
   Checks for an accepted mandate and runs the preflight if there is none, resolves reviewers from local config, and starts the loop (default `/loop 10m /wdi-autopilot`). The loop works on branch `autopilot/<mandate-id>`, writes the code test-first, records every decision in its ledger, and ends with one PR ready for review. The owner merges.
3. **`/wdi-daily-what-to-test [web <target> | mobile <target> | desktop]`**  
   After a merge: syncs the development branch, prunes merged branches and worktrees, prepares the app for hand-testing, and builds a checklist from the tickets closed since the last sync (`before_sync..HEAD`). With no argument it only syncs, prunes, and builds the checklist.
4. **`/wdi-prune-or-archive [--spec <id> | --all-closed] [--archive | --prune] [--dry-run]`**  
   Moves closed specs from `.scratch/` into `.archive/specs/`, or removes them with `git rm`, through `lifecycle.py`, which checks first and rolls back on failure. The spec row stays in `specs.yaml`. With no argument it asks.

---

### Option C: Fast Path (`/implement` Directly)
A fix may skip every gate when it changes no FR, UC, AD-N, or domain model, is at most one ticket, and touches no money, personal data, or third-party integration. You run `/implement` directly, with no wrapper skill. If the fix turns out to touch an FR, work stops and becomes a spec of size S (at most 3 tickets), which runs through `wdi-build`.

---

## Field Rules

Operational rules learned from running autonomous coding loops on real product repositories:

### 1. Builder Fixed to Coordinator (`builder: coordinator`)
In `wdi-daily-autopilot`, `roles.builder` in `.control/custom-dispatch.yaml` is fixed to `coordinator`. Delegating code to subagents led to false completion reports (a subagent claiming the tests passed without editing a file). The coordinating session writes the code itself, test-first.

### 2. Read-Only Reviewers
Peer reviewers run read-only. They challenge edge cases and read diffs, but never change code or run builds; only the coordinating session writes. At `risk_accepted: low` a peer-review bypass is refused, because the code there needs two reviewers who are not the builder.

### 3. Windows File Locks (Desktop Process Gate)
On Windows, a running app binary or a background build daemon holds file handles open, and a rebuild or worktree deletion then fails with `Access is denied`. With the `desktop` target, `wdi-daily-what-to-test` checks whether the app binary is still running before it rebuilds. It closes the app only if its own previous smoke run started it; otherwise it reports the PID and stops, so you can close it yourself. It never force-kills a process.

### 4. The Loop Runs on Its Own Branch
Spec and ticket authoring happens on the development branch. The loop runs on its own branch, `autopilot/<mandate-id>`, in an isolated worktree or in a clean checkout used only by that run. It never runs on a shared or dirty checkout.

### 5. One Cloud CI Run Per Autopilot Run
The loop commits per ticket, and the local test suite is the evidence during the run. Cloud CI runs once per autopilot run, at the end: when the one PR is marked ready for review, or when the workflow is dispatched once. Pushes during the run start no cloud run.

### 6. Machine-Local Smoke Files
Smoke cursors (`.work/smoke/last-sync`) and runtime manifests belong to one machine. The installer adds `.work/smoke/` to `.gitignore`, so machine-local smoke files never leave the working tree dirty.

---

## Configuration (`custom-dispatch.yaml`)

Machine-specific runner commands and model flags live in `.control/custom-dispatch.yaml`. The installer creates it from `.control/custom-dispatch.yaml.example` when it is missing, and adds it to `.gitignore`; only the example is committed.

A runner named as a reviewer MUST be read-only. The read-only flag per CLI: `claude --permission-mode plan`, `kiro-cli --trust-tools=fs_read`, `cursor-agent --mode plan`. The example runners in the template all use it.

---

## Skills Directory (22)

WDI Method installs 22 skills: 7 gate skills, 5 for the daily tier (including `wdi-autopilot`), and 10 you run any time.

How a skill starts:
- **You type it**: the four daily tier skills, `wdi-build`, and `wdi-explain-to-me` (they carry `disable-model-invocation: true`).
- **You type it, or the agent names it and waits for your go-ahead**: the other skills.
- **The agent may run it on its own (read-only)**: `wdi-help`.
- **Fired by `/loop` under an accepted mandate**: `wdi-autopilot`. Under a mandate, `wdi-autopilot` also runs the other skills.

| Skill | What It Does | How It Starts |
|---|---|---|
| **Gate skills** | | |
| `/wdi-init` | Before G1 and at the end of G2: sets up registries, components, `mode` and `risk_accepted`, the two structure maps, the engines check, and inventory readers. | You type it, or the agent names it |
| `/wdi-problem` | G1. Runs BMad's product brief skill, then checks the brief against the method's guide. Never writes the brief itself. | You type it, or the agent names it |
| `/wdi-product` | G2. Runs BMad's PRD skill for a new PRD or a changed promise, then checks it against the PRD guide. Never writes the PRD itself. | You type it, or the agent names it |
| `/wdi-ux` | Optional, with G2. Runs BMad's UX skill and files the design results where they belong. Never writes UX content itself. | You type it, or the agent names it |
| `/wdi-blueprint` | G3, once per product. The whole-product picture: use cases, actors, domain model, business rules, glossary, the architecture spine, C4, and the API, table, and screen inventories. | You type it, or the agent names it |
| `/wdi-component` | G4. The depth of one component, as deep as its `mode` and no deeper. Skipped at `mode: catalog`. | You type it, or the agent names it |
| `/wdi-build` | G5. One spec from open to closed: you run `to-spec` and `to-tickets`, each ticket goes to a green PR, then the spec closes. It never merges. | You type it |
| **Daily tier** | | |
| `/wdi-daily-what-to-build` | Turns hand-testing notes into a reviewed spec or ticket for a later autopilot run. Stops before code, commit, or push. | You type it |
| `/wdi-daily-autopilot` | Checks for an accepted mandate (runs the preflight if there is none), resolves reviewers from local config, and starts the loop, every 10 minutes by default. | You type it |
| `/wdi-autopilot` | The loop itself: works through every FR under one accepted mandate, on one branch with one PR, and writes every decision to one ledger. | Fired by `/loop` under an accepted mandate |
| `/wdi-daily-what-to-test` | After a merge: syncs the development branch, prunes merged branches and worktrees, prepares the app for hand-testing, and builds a checklist from the closed tickets. | You type it |
| `/wdi-prune-or-archive` | Moves closed specs to `.archive/specs/` or removes them with `git rm`, through `lifecycle.py`, which checks first and rolls back on failure. The spec row stays in `specs.yaml`. | You type it |
| **Any time** | | |
| `/wdi-help` | Reads the status registry and tells you the current gate, the open specs, and the next skill. | The agent may run it on its own (read-only) |
| `/wdi-explain-to-me` | Does the reading before you decide: investigates, then briefs you in six fixed sections. Writes no file. | You type it |
| `/wdi-decision` | Opens, accepts, and applies a numbered decision (`DEC-`), and carries it into the documents it governs. | You type it, or the agent names it |
| `/wdi-question` | Files something that cannot be decided now into one of four lists in `.control/questions/`, and closes it when the answer arrives. | You type it, or the agent names it |
| `/wdi-log` | Records a finished meeting or a non-technical fact that limits what may be built. | You type it, or the agent names it |
| `/wdi-report` | Numbers about the project: progress, estimates, task rows for a tracker, or a standalone brief or PRD. Never invents a number. | You type it, or the agent names it |
| `/wdi-reconcile` | Before a gate or after a batch of changes: reports drift between `.what`, `.how`, `.control`, and the method's rules. Read-only. | You type it, or the agent names it |
| `/wdi-review` | Reviews any corpus document, and must run before a gate for the spine, SRS, SDD, and SPEC. Its lenses follow `risk_accepted`. Not for code review. | You type it, or the agent names it |
| `/wdi-systematic-debugging` | For any bug, failing test, or failed build, before a fix is proposed: find the root cause and test one hypothesis at a time. | You type it, or the agent names it |
| `/wdi-upgrade` | Right after `wdi-method update`: moves documents and registry files still in the old shape into the new one, then checks that validation is green. | You type it, or the agent names it |

---

## Repository Structure

```text
.constitution/
  method/                  The method itself: overwritten by every update; never edit here
  project/                 Product-owned rules and inventory readers: kept across updates
.control/
  registry/                The registries: index.yaml · goals.yaml · specs.yaml · components.yaml
  generated/               Status and RTM projections written by validate.py (never by hand)
  decisions/               Decisions and owner mandates (DEC-*.md)
  memlog/                  Ledgers recording autonomous loop decisions
  test-targets/            Hand-testing templates (desktop.md, web.md, mobile.md)
.scratch/<spec-id>-<slug>/ Active spec workspaces (SPEC.md and tickets)
.archive/                  Archived closed specs
.what/ & .how/             Working corpus documents (brief, PRD, SRS, blueprint, SDD)
.what-rendered/            Rendered pages for G1 and G2 (generated)
.how-rendered/             Rendered pages for G3 and G4 (generated)
.work/                     Scratch that empties when a task closes
```

---

## Contributing

Every contribution to WDI Method answers one question: **does this make the review layer more trustworthy, or does it only make it thicker?** See [CONTRIBUTING.md](CONTRIBUTING.md).

### Fixture Corpus and Local Verification
Validator and method changes are proven against the fixture corpus (`tests/fixture/`). Run the suite before opening a pull request:
```bash
npm test
```
The suite runs the four Python PEP 723 scripts (`validate.py`, `timeline.py`, `inventory.py`, `lifecycle.py`) against the fixture, and checks the platform registry and the files each platform receives, and the integrity of the kit.

### Public Generic Package Rule
WDI Method is published to the public npm registry. It must never carry private client names, commercial product identities, credentials, or absolute filesystem paths.

---

## License and Privacy

- **Code license:** [MIT License](LICENSE).
- **Privacy:** WDI Method itself makes no network calls; your coding agent still talks to its model provider. See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md).

## The name and the icon

The MIT License grants broad rights over the code. It says nothing about names or logos,
and it does not oblige the studio to hand over either — so the licence above covers this
repository's code, not the name **WDI Method**, not **Wira Delta Indonesia**, and not any
associated visual marks or logos.

You may use those names to refer to this project: "based on WDI Method", "a fork of WDI Method",
or "compatible with WDI Method". You may not use them as the name of your own product or
methodology, or in a way that suggests you are this project or endorsed by it.

If you publish a modified distribution or fork, please give it your own name, so the
engineers using it know whom to ask when something behaves unexpectedly. The code is yours
to take; the name is not.

---

We use the same method on client projects. [Contact Wira Delta Indonesia](https://wiradelta.id/#contact).
