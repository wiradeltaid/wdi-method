---
name: wdi-daily-what-to-build
description: Turn raw manual-test notes into a triaged, reviewed spec/ticket ready for wdi-autopilot to pick up in a separate session. Invoke as `/wdi-daily-what-to-build [reviewer] <your raw notes>`.
disable-model-invocation: true
---

# WDI Daily What-to-Build Triage

Daily entry point for "I just tested something by hand, now what." Classifies the notes (new feature,
fix, removal, or green), offers interactive housekeeping for closed specs, authors the resulting spec
or ticket through this repo's own `wdi-build` flow, dispatches an independent second opinion grounded
in the *original* notes, folds that feedback back in, then stops — this run never continues into
`wdi-autopilot`, a commit, or a push.

`/wdi-daily-what-to-build [reviewer] <notes>` — if the first word matches a known runner or a reviewer
defined in `.control/custom-dispatch.yaml`, it picks the reviewer; otherwise all input is treated as
the notes verbatim. Multi-line notes are accepted unedited; none of it gets summarized before review
dispatch.

## 0. Precondition

Confirm `.control/registry/index.yaml` exists in the repo root. If it does not, this is not a WDI
Method product repo and this skill has no corpus to write into — report that and stop.

## 1. Keep the notes verbatim

Hold the raw notes as given. They are forwarded unedited to the reviewer in step 5 — a paraphrase
here would anchor the reviewer to your interpretation instead of the author's own words.

## 2. Interactive Housekeeping Hook

Inspect `.control/registry/specs.yaml` for any spec marked `status: closed` whose directory still
resides under `.scratch/`. If found, offer the maintainer the choice to clean them up via
`/wdi-prune-or-archive`:
- **Archive:** `/wdi-prune-or-archive --spec <id> --archive` (moves the spec directory to
  `.archive/specs/<spec-folder>/` and updates `specs.yaml`).
- **Prune:** `/wdi-prune-or-archive --spec <id> --prune` (removes the spec directory from git and disk
  while keeping RTM metadata in `specs.yaml`).

If the maintainer declines or prefers to defer, continue directly to step 3 without blocking.

## 3. Classify against the actual corpus, not the notes alone

Search `.what/`, `.how/`, and `.control/` for the FR, UC, ticket, or SPEC the notes actually touch
before deciding new vs. fix vs. removal vs. green. A classification made without checking what already
exists there is a guess.

- **Green** — behaviour already matches what is promised and built. Report that and stop; MUST NOT
  open a spec or ticket for a non-finding.
- **New / fix / removal** — continue to step 4.

## 4. Author through wdi-build, not by hand

This repo's Delivery Flow standing sequence (`AGENTS.md` § Delivery Flow) requires turning notes into
a spec or ticket through `wdi-build`'s engines (`to-spec` / `to-tickets`) — MUST NOT hand-write a
bespoke SPEC.md or ticket file instead.

Invoke `wdi-build` Phase 1 (open spec and author tickets via `to-spec` / `to-tickets`) directly on the
active development branch (`policy.development_branch`, default `main`), per the Delivery Flow standing
exception.

**Stop at the boundary of Phase 1.** Once the spec and ticket files exist on disk, do NOT proceed into
Phase 2 (worktree isolation and ticket implementation) or Phase 3 (closing the spec) — each of those is
a separate, explicit ask, usually from a different chat session running `wdi-autopilot`.

## 5. Package and dispatch the second opinion

Write the review packet to a scratch file first — `.work/wdi-daily-what-to-build/<slug>-second-opinion.md` —
rather than inlining it into shell arguments:

1. Path to the drafted spec or ticket from step 4.
2. The original raw notes from step 1, unedited.
3. This standing mandate: *"If this draft touches the architecture spine, an SRS, an SDD, or a SPEC,
   you are authorized to run `wdi-review` on it yourself and edit the document directly to apply its
   stamp — no need to ask first, that permission is already given for this dispatch."*

Reviewer resolution:
- If `review_policy.peer_review` is explicitly `false`, or if `roles.reviewer` in `.control/custom-dispatch.yaml` is set
  to `none`, or if the command is invoked with `--no-review`, skip Step 5 (second opinion review) and proceed directly to Step 6/7.
- If `.control/custom-dispatch.yaml` exists in the repo root (or in the main repository root via `(git rev-parse --git-common-dir)/..` when running inside a linked git worktree): inspect `runners:` and `roles.reviewer`.
  A runner definition specifies `type:` (`auto`, `in-session`, or `shell-out`):
  - `auto` (recommended): Evaluates whether the runner's target model is reachable in-session from the active
    session profile (per the caller's global agent collaboration rules). Dispatches in-session via the `Agent`
    tool if reachable; falls back to shell-out using `command` if unreachable in-session.
  - `in-session`: Dispatches strictly via the in-session `Agent` tool.
  - `shell-out`: Dispatches strictly via external shell `command` (single-string command, passing the
    review packet path).
  If the runner ID is missing from `runners:` or if `type: shell-out` lacks a nonempty `command` string,
  stop and report immediately (fail-closed).
- In the absence of a custom runner file: follow the caller's configured agent collaboration setup
  (e.g., in-session subagent via the `Agent` tool if reachable, or the caller's configured CLI
  environment).

When the dispatched reviewer has no native Skill tool, instruct it to read and follow the target
guide directly as plain markdown instructions.

## 6. Fold the feedback back in

Revise the spec or ticket in place based on what the reviewer returns, then present the final version.
MUST NOT silently drop a reviewer objection — if you disagree with one, state the disagreement
explicitly in the report.

## 7. Stop and hand off

Report what now exists (or that the notes were green) and its file path. MUST NOT commit, push, or
start `wdi-autopilot` in this same run — state that as the next step and wait for the maintainer to
request it.
