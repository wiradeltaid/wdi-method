# WDI Method

[English](README.md) | [Bahasa Indonesia](README.id.md) | [日本語](README.ja.md) | [简体中文](README.zh.md)  
[Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

**The review layer BMad leaves thin — verifiable specifications a human reads to check technical decisions before code is written, sized to what the change actually deserves.**

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) decides *what* to build and *how* to structure solutions well. WDI Method wraps it — without replacing it — providing the verifiable governance layer between high-level architectural decisions and working code: requirement registries, use case catalogues, component boundaries, automated drift validators, and unhindered autonomous daily loops.

> This repository is **public and generic**. It MUST NOT carry a client name, a commercial product name, or a link to a private repository. Product identity lives entirely in the repository that installs it.

---

## Helicopter View: AI-Driven Development (AiDD) vs. Vibe Coding

Speculative prompting ("vibe coding") inevitably fails on multi-month production systems: AI coding agents lose context, hallucinate completion states, and blur requirement boundaries. WDI Method establishes disciplined **AI-Driven Development (AiDD)** through a three-layer architectural triad:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Intent & Strategy: BMad Method                                       │
│    Discovers user problems, draft product briefs, and architecture      │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. Verifiable Review Layer: WDI Method (SSOT)                           │
│    Governs 5 human gates, links Goal → FR → UC → Ticket → Test chains, │
│    runs automated drift validators, and orchestrates daily loops        │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. Slicing & Implementation: Skills Engines (mattpocock/skills)         │
│    to-spec & to-tickets cut vertical tracer-bullets; implement runs TDD │
└─────────────────────────────────────────────────────────────────────────┘
```

### The Golden Invariant: Documents Follow Code
Documents are the record left behind by work that already happened. Where a decision record or requirement row contradicts the code, **the code wins and the document is corrected**. Code is never mutated to match obsolete documentation. A document merely behind the code is in its expected state and never blocks delivery unless it carries load-bearing staleness.

---

## 10-Minute Quickstart

Install WDI Method into your product repository in three sequential steps. All prompts offer sensible defaults; pressing <kbd>Enter</kbd> accepts them.

### Step 1: Install BMad Method
Installs the discovery engine into your product repository:
```bash
cd /path/to/your/product-repo
npx bmad-method install
```

### Step 2: Add the Six Ticket Engines
Install the execution engines directly into your repository (choose either "copy" or "symlink"):
```bash
npx skills@latest add mattpocock/skills
```
*Select all six engines driven by the method:* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, and `domain-modeling`.

> **Why the Claude Code plugin does not count:** Upstream engines ship with `disable-model-invocation: true`. WDI Method automatically strips this flag from local copies so autonomous loops can drive them unattended. A user-level plugin cannot be edited by the repository.

### Step 3: Install WDI Method
Launches the interactive installer and configures skills across your agent platforms (Claude Code, Cursor, OpenCode, Windsurf, etc.):
```bash
npx wdi-method
```
*(For automated CI environments: `npx wdi-method install --yes --agents claude --product "Your Product"`)*

### Your First Command: `/wdi-help`
Inside your AI coding agent (Claude Code, Cursor), invoke:
```text
/wdi-help
```
`wdi-help` inspects `.control/registry/` and answers with the exact gate your project is currently at, without guessing from conversational context.

---

## Three Workflow Options

WDI Method adapts its ceremony to the scale and risk of the task:

### Option A: Guided Delivery Track (New Initiatives & G1–G5)
For new products, major initiatives, and architectural changes. A human reads **one rendered page** per gate and decides: *advance or refine*.

| Gate | Question Answered | Skill Invoked | Rendered Page You Read | Owner Decision |
|---|---|---|---|---|
| **G1 — Problem** | Is this problem real, whose is it, and does it earn work? | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | Approve problem framing |
| **G2 — Product** | What do we build, and how does the interface feel? | `/wdi-product`<br>`/wdi-ux` | `.what-rendered/_prd/<slug>/prd.md` | Approve functional promises (FR) |
| **G3 — Blueprint** | Does the whole architecture hold together? *(Once per repo)* | `/wdi-blueprint` | `.how-rendered/blueprint.md` | Approve architecture spine |
| **G4 — Component** | How is this component built? *(Skipped at `mode: catalog`)* | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | Approve software design |
| **G5 — Build** | Is the ticket slice built, verified, and proven? *(Per spec)* | `/wdi-build` | Test runner output (red &rarr; green) | Accept merged code |

#### Two Knobs That Never Merge: Mode vs. Risk
- **`mode`** sets which gates exist (`catalog` skips G4; `guarded` and `deep` mandate thorough SDD).
- **`risk_accepted`** sets the depth of review proof required (`low`, `medium`, `high`). Merging them into a single dial either drowns simple components in bureaucracy or lets high-risk changes escape verification.

---

### Option B: Autonomous Daily Operations (Fase 4 Daily Tier)
Once architecture is established, everyday engineering is a continuous daily rhythm. WDI Method provides 4 purpose-built tools:

1. **`/wdi-daily-what-to-build [reviewer] <notes>`**:  
   Turns raw manual test notes, QA observations, or bug reports into structured specifications. Classifies requirements against the corpus, drafts tickets on the development branch, and dispatches an advisory second opinion.
2. **`/wdi-daily-autopilot [self-review] [peer] [interval]`**:  
   Launches the autonomous engineering routine under an owner-accepted mandate. Runs an unattended loop cadence (default: `/loop 10m /wdi-autopilot`), executing TDD cycles and updating its ledger after every decision.
3. **`/wdi-daily-what-to-test [web|mobile|desktop]`**:  
   Post-merge physical testing coordinator. Synchronizes the development branch, prunes merged worktrees and remote branches, enforces desktop process gates, and compiles an actionable physical testing checklist from the git delta (`before_sync..HEAD`).
4. **`/wdi-prune-or-archive [spec-id] [--archive|--prune]`**:  
   Maintains repository hygiene by safely moving completed specifications from `.scratch/` into `.archive/specs/` or pruning them via `git rm`, while preserving 100% RTM traceability.

---

### Option C: Fast Path (`/implement` Directly)
A small bugfix or polish touching no `FR`, `UC`, `AD-N`, or domain model skips every document gate and runs `/implement` directly. If the change expands to touch a functional requirement, it **stops immediately and becomes an explicit spec `S`** evaluated at G5.

---

## Practical Field Tweaks & Operational Knowledge

Battle-tested rules discovered across real multi-platform agent runs:

### 1. Builder Fixed to Coordinator (`builder: coordinator`)
In `wdi-daily-autopilot`, `roles.builder` in `.control/custom-dispatch.yaml` is strictly fixed to `coordinator`. Delegating code implementation to subagents leads to state hallucinations (subagents falsely claiming all unit tests passed without editing a single file). The coordinating session authors code directly via TDD red-to-green cycles.

### 2. Independent Advisory Reviewers
Peer reviewers (such as Terra / GPT-5.6-Terra via `kiro-cli`) must operate in read-only mode (`--trust-tools=fs_read` / `--mode plan`). Reviewers challenge edge cases and inspect diffs, but never mutate code or trigger build commands. Single-writer discipline is strictly preserved.

### 3. Windows File-Locking Prevention (Process Gating)
On Windows, background processes (running application binaries, Gradle Test Daemons, Java VMs) hold open file handles, causing `Access is denied (Exit code 5/32)` failures during compilation or worktree deletion. `wdi-daily-what-to-test` inspects and terminates lingering processes before compilation or launch.

### 4. Worktree Isolation Invariant
Specification and ticket authoring takes place on `main`, but autonomous coding loops (`wdi-autopilot`) **must run inside an isolated git worktree** (`autopilot/<mandate-id>`). Never run unattended loops on a shared dirty checkout.

### 5. Single Cloud CI Trigger Per PR
Autonomous loops commit per ticket locally. Running cloud CI on every iteration quickly exhausts monthly runner allowances. Local test suites provide authoritative evidence during the loop; Cloud CI is triggered **once**, when the Pull Request is marked ready for review.

### 6. Ephemeral Smoke Artifact Hygiene
Smoke test cursors (`.work/smoke/last-sync`) and runtime manifests are machine-local. Ensure `.work/smoke/` is registered in `.gitignore` so preflight clean working tree checks never halt unexpectedly.

### 7. Local Runner Configuration (`custom-dispatch.yaml`)
Machine-specific runner commands and model flags live in `.control/custom-dispatch.yaml` (automatically gitignored). Only the template `.control/custom-dispatch.yaml.example` is committed to git.

---

## 22 Official Skills Directory

WDI Method packages 22 official skills structured across functional domain and invocation authority:

| Domain | User-Invoked (Developer Commands) | Model-Invoked / Agent-Orchestrated |
|---|---|---|
| **Delivery & Architecture (G1–G5)** | `/wdi-init` (G0 setup &amp; components)<br>`/wdi-problem` (G1 problem &amp; brief)<br>`/wdi-product` (G2 PRD promises)<br>`/wdi-ux` (G2/G3 user flows &amp; contracts)<br>`/wdi-blueprint` (G3 system spine)<br>`/wdi-component` (G4 component SDD)<br>`/wdi-build` (G5 spec &amp; ticket cutting) | Driven sequentially by coordinator across gate transitions |
| **Autonomous Daily Operations** | `/wdi-daily-what-to-build` (triage notes to spec)<br>`/wdi-daily-autopilot` (autonomous routine launcher)<br>`/wdi-daily-what-to-test` (post-merge physical smoke test)<br>`/wdi-prune-or-archive` (clean or archive closed specs) | `/wdi-autopilot` (unattended loop engine driven by `/loop`) |
| **Governance & Diagnostics** | `/wdi-help` (contextual gate guidance)<br>`/wdi-explain-to-me` (architecture explainer)<br>`/wdi-decision` (ADR authoring)<br>`/wdi-question` (open question tracker)<br>`/wdi-log` (activity logging)<br>`/wdi-report` (estimate &amp; progress reporting)<br>`/wdi-reconcile` (drift audit)<br>`/wdi-review` (independent peer review)<br>`/wdi-systematic-debugging` (root-cause diagnosis)<br>`/wdi-upgrade` (corpus schema migration) | Advisory peer review &amp; second opinion dispatch |

---

## Repository Structure & Invariants

```text
.constitution/
  method/            The method engine — overwritten by every update; never edit here
  project/           Product-owned rules and custom inventory readers — preserved across updates
.control/
  registry/          Single Source of Truth: goals.yaml · specs.yaml · components.yaml
  decisions/         Accepted decisions and owner mandates (DEC-*.md)
  memlog/            Audit ledgers recording autonomous loop decisions
  test-targets/      Physical testing templates (desktop.md, web.md, mobile.md)
.scratch/            Active specification workspaces (SPEC-*.md and tickets)
.archive/            Pruned historical specifications preserving RTM audit links
.what/ & .how/       Working corpus documents (PRD, SRS, Blueprint, SDD)
.what-rendered/      Rendered human deliverables (generated by validate.py / wdi-report)
```

---

## Contributing & Architectural Foundations

Every contribution to WDI Method must answer one question: **does this make the review layer more trustworthy, or does it merely make it thicker?**

### Fixture Corpus & Local Verification
All validator and framework changes are proven against the internal fixture corpus (`tests/fixture/`). Run the complete test suite before submitting pull requests:
```bash
npm test
```
The test suite enforces 100% green baselines across Python PEP 723 scripts (`validate.py`, `timeline.py`, `lifecycle.py`), platform sync, and kit integrity.

### Public Generic Package Rule
WDI Method is published to the public npm registry. It must never leak private client names, commercial product identities, internal network credentials, or absolute filesystem paths.

---

## License & Trademark Notice

- **Code License:** Distributed under the [MIT License](LICENSE).
- **Privacy & Telemetry:** 100% offline-first. Zero telemetry, zero analytics, zero external network sockets (see [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md)).
- **Trademark Notice:** "Wira Delta Indonesia", "WDI Method", and the studio brand monogram are trademarks of PT Wira Delta Indonesia and are retained separately from the open-source code license.
