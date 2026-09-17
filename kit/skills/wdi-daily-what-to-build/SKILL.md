---
name: wdi-daily-what-to-build
description: Turn raw manual-test notes into a triaged, reviewed spec/ticket ready for wdi-autopilot to pick up in a separate session. Invoke as `/wdi-daily-what-to-build [reviewer] <your raw notes>`.
disable-model-invocation: true
---

# WDI Daily What-to-Build Triage

Daily entry point for "I just tested something by hand, now what." Classifies the notes (new feature,
fix, removal, or green), authors the resulting spec or ticket through this repo's own `wdi-build` flow,
dispatches an independent second opinion grounded in the *original* notes, folds that feedback back in,
then stops — this run never continues into `wdi-autopilot`, a commit, or a push.

Spec lifecycle maintenance (archiving or pruning closed specs) belongs to `/wdi-prune-or-archive`;
this skill remains 100% focused on triaging incoming test notes into actionable specs without administrative
interruption.

`/wdi-daily-what-to-build [reviewer] <notes>` — if the first word matches a known runner or a reviewer
defined in `.control/custom-dispatch.yaml`, it picks the reviewer; otherwise all input is treated as
the notes verbatim. Multi-line notes are accepted unedited; none of it gets summarized before review
dispatch.

## 0. Precondition

Confirm `.control/registry/index.yaml` exists in the repo root. If it does not, this is not a WDI
Method product repo and this skill has no corpus to write into — report that and stop.

## 1. Keep the notes verbatim

Hold the raw notes as given. They are forwarded unedited to the reviewer in step 4 — a paraphrase
here would anchor the reviewer to your interpretation instead of the author's own words.

## 2. Classify against the actual corpus, not the notes alone

Search `.what/`, `.how/`, and `.control/` for the FR, UC, ticket, or SPEC the notes actually touch
before deciding new vs. fix vs. removal vs. green. A classification made without checking what already
exists there is a guess.

- **Green** — behaviour already matches what is promised and built. Report that and stop; MUST NOT
  open a spec or ticket for a non-finding.
- **New / fix / removal** — continue to step 3.

## 3. Author through wdi-build, not by hand

This repo's Delivery Flow standing sequence (`AGENTS.md` § Delivery Flow) requires turning notes into
a spec or ticket through `wdi-build`'s engines (`to-spec` / `to-tickets`) — MUST NOT hand-write a
bespoke SPEC.md or ticket file instead.

Invoke `wdi-build` Phase 1 (open spec and author tickets via `to-spec` / `to-tickets`) directly on the
active development branch (`policy.development_branch`, default `main`), per the Delivery Flow standing
exception.

### Ticket Dependency Contract (Upfront `parallel-tickets-blocked`)
Author `touches` and `blocked_by` together; do NOT defer dependency relationships until validation.
For every pair of tickets in the same spec whose `touches` lists intersect, there MUST be a directed
`blocked_by` path in one direction between them. The path MAY be transitive: a direct edge is not required
when an already-declared dependency chain orders the pair (e.g. `02` blocked by `01`, `03` blocked by `02`).
This is the contract enforced by `parallel-tickets-blocked`.

Before leaving Step 3, run validator preflight:
```bash
uv run .constitution/method/scripts/validate.py --check --baseline
```
If `parallel-tickets-blocked` reports unsequenced tickets, add the missing `blocked_by` edge to an upstream
ticket immediately. Findings already matching `.github/validate-baseline.txt` are pre-existing debt, not new
blockers; only new RED findings must be repaired before dispatching review.

**Stop at the boundary of Phase 1.** Once the spec and ticket files exist on disk, do NOT proceed into
Phase 2 (worktree isolation and ticket implementation) or Phase 3 (closing the spec) — each of those is
a separate, explicit ask, usually from a different chat session running `wdi-autopilot`.

## 4. Package and dispatch an advisory second opinion

Write the review packet to a scratch file first — `.work/wdi-daily-what-to-build/<slug>-second-opinion.md` —
rather than inlining it into shell arguments:

1. Path to the drafted spec or ticket from step 3.
2. The original raw notes from step 1, unedited.
3. Relevant component, subsystem, and ticket `touches` / `blocked_by` declarations, plus the preflight validator output.
4. This standing mandate (strictly advisory / read-only):

   > You are the independent advisory reviewer for this daily triage pass, not the implementer or author.
   > Review the named draft against the verbatim notes and the cited corpus only. Return a structured written
   > assessment in markdown:
   > - **Verdict**: `accept` | `accept-with-changes` | `reject`
   > - **Findings**: numbered; categorized as `blocking` vs `non-blocking`
   > - **Notes vs Draft**: specific gaps, misinterpretations, or scope creep relative to raw notes
   > - **Stamp Recommendation**: lenses to use (must include `edge-case-hunter`), readiness for trace stamping,
   >   and blockers that must be resolved first
   >
   > You MUST NOT edit, create, delete, rename, or mutate any repository file. You MUST NOT invoke `wdi-review`,
   > MUST NOT write `spec_reviewed` in `specs.yaml`, and MUST NOT modify frontmatter. Stamping is the
   > coordinator's sole responsibility upon folding your feedback; this dispatch is advisory feedback only.

Reviewer resolution:
- If `review_policy.peer_review` is explicitly `false`, or if `roles.reviewer` in `.control/custom-dispatch.yaml` is set
  to `none`, or if the command is invoked with `--no-review`, skip Step 4 and state in the report that peer review was skipped.
- If `.control/custom-dispatch.yaml` exists in the repo root (or in the main repository root via `(git rev-parse --git-common-dir)/..` when running inside a linked git worktree): inspect `runners:` and `roles.reviewer`.
  A runner definition specifies `type:` (`auto`, `in-session`, or `shell-out`):
  - `auto` (recommended): Evaluates whether the runner's target model is reachable in-session from the active
    session profile (per the caller's global agent collaboration rules). Dispatches in-session via the `Agent`
    tool in read-only mode if reachable; falls back to shell-out using `command` if unreachable in-session.
  - `in-session`: Dispatches strictly via the in-session `Agent` tool using a read-only subagent type.
  - `shell-out`: Dispatches strictly via external shell `command` (single-string command, passing the review packet path).
    A shell-out reviewer MUST be invoked with its read-only flag where supported (e.g. `--trust-tools=fs_read` for
    `kiro-cli`, `--mode plan` for `cursor-agent`).
  If the runner ID is missing from `runners:` or if `type: shell-out` lacks a nonempty `command` string,
  stop and report immediately (fail-closed).
- Dispatch execution & process discipline:
  - Cap shell-out dispatch at a hard wall-clock limit (default 600s, or `timeout_s` if defined in `custom-dispatch.yaml`).
  - Run backgrounded with polling or synchronous wait. If the timeout expires, or the process exits non-zero,
    or the output file cannot be read: terminate the entire process tree by its PID (MUST NOT use process name-based
    killing). Record in the final report: `peer review: fell back to coordinator self-review after timeout/failure`.
    MUST NOT fabricate or synthesize unread reviewer output as if it were faithfully received.
- In the absence of a custom runner file: follow the caller's configured agent collaboration setup
  (e.g., in-session read-only subagent via the `Agent` tool if reachable, or the caller's configured CLI
  environment).

When the dispatched reviewer has no native Skill tool, instruct it to read and follow the target
guide directly as plain markdown instructions.

## 5. Coordinator fold-in, stamping, and validation

The coordinator is the sole writer in this flow. Read the advisory assessment, revise the draft where it is
correct, and report every material objection as `accepted`, `deferred` (with its recorded destination), or
`disagreed` (with the reason). MUST NOT silently drop a reviewer objection.

### Coordinator Stamping (`spec_reviewed`)
Stamping is an official coordinator-owned event. Because the peer review was conducted live in this session
under the coordinator's orchestration, the coordinator writes the `spec_reviewed` block directly to
`.control/registry/specs.yaml` once the draft is accepted and amended:
```yaml
    spec_reviewed:
      date: "<YYYY-MM-DD>"
      sha: <git rev-parse HEAD>
      lenses: [structure, prose, edge-case-hunter]
```
The coordinator MUST NOT delegate registry stamping to external shell-out processes.

### Validation
Run canonical validation using `uv`:
```bash
uv run .constitution/method/scripts/validate.py --generate --baseline
```
- Validation MUST be run via `uv run`, never bare `python` (which triggers Windows Python launcher shebang failures).
- `--baseline` acknowledges the repository's established baseline in `.github/validate-baseline.txt`. It exits
  zero only if current findings match that baseline exactly.
- This skill MUST NOT expand or edit the baseline file. Any new RED finding outside the baseline represents an
  unresolved issue and must be fixed before handoff.

## 6. Stop and hand off

Report what now exists (or that the notes were green) and its file path. State explicitly whether `spec_reviewed`
was stamped or if peer review fell back to coordinator self-review. MUST NOT commit, push, or start `wdi-autopilot`
in this same run — state that as the next step and wait for the maintainer to request it.
