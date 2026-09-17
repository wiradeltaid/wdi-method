---
name: wdi-daily-what-to-test
description: Sync to development branch, prune merged worktrees/branches, configure target application smoke environment, and build a test checklist from closed tickets. Invoke as `/wdi-daily-what-to-test [web <target>|mobile <target>|desktop]`.
disable-model-invocation: true
---

# WDI Daily What-to-Test

The post-merge daily verification step after a `wdi-autopilot` or ticket delivery run merges: lands
back on the active development branch, safely prunes stale merged worktrees and task branches while
strictly preserving protected branches, configures the application where it needs to be for platform
verification, cleans temporary smoke logs, and presents a checklist of what changed — grounded in
closed tickets and specs, never invented from memory.

- `/wdi-daily-what-to-test` — sync + prune + checklist only, nothing deployed or launched.
- `/wdi-daily-what-to-test web <target>` — sync + configure or deploy web target, then checklist.
- `/wdi-daily-what-to-test mobile <target>` — sync + launch or install onto device or emulator, then
  checklist.
- `/wdi-daily-what-to-test desktop` — sync + launch application locally (current machine is target),
  then checklist.

## 0. Preconditions & Branch Policy Precheck

1. Confirm `.control/registry/index.yaml` exists in the repo root. If it does not, this is not a WDI
   Method product repo — report that and stop.
2. Read branch policy from `.control/registry/index.yaml`:
   - `primary_branch` (`policy.primary_branch`, default `main`).
   - `development_branch` (`policy.development_branch`, default `main`).
3. **Fail-Closed Branch Verification:** Verify that `development_branch` exists in local or remote
   tracking references (`git rev-parse --verify refs/heads/<development_branch>` or
   `git rev-parse --verify refs/remotes/origin/<development_branch>`). If neither resolves, stop
   immediately and report to the maintainer; per `.constitution/method/branch-guide.md`, MUST NOT guess
   or silently fall back to `main`.
4. Verify the primary working tree is clean (`git status --porcelain`). If uncommitted changes exist,
   stop and report without modifying git state.

## 1. Sync (Fast-Forward Only)

1. Land on `development_branch` in the primary repository worktree using standard git operations
   (`git checkout <development_branch>` or `git switch <development_branch>`).
2. Pull remote updates strictly with fast-forward: `git pull --ff-only`.
   If the branch has diverged or cannot be fast-forwarded, stop and report immediately; MUST NOT create
   an automatic merge commit on `development_branch`.

## 2. Prune Merged Task Branches & Worktrees (With Immunity Protections)

Apply strict immunity per `.constitution/method/branch-guide.md` § Absolute branch immunity:
- **Immune Branches:** `primary_branch` and `development_branch` **MUST NEVER be deleted**.
- **Immune Checkouts:** The currently checked-out branch and the primary worktree root **MUST NEVER be removed**.
- **Dirty Worktrees:** Any worktree with uncommitted changes (`git status --porcelain` non-empty) **MUST NOT be removed**.

Pruning procedure:
1. Enumerate candidates merged into `development_branch`: `git branch --merged <development_branch>`.
2. Filter the candidate list to explicitly **exclude**:
   - `primary_branch`
   - `development_branch`
   - the currently active branch (`HEAD`)
3. Enumerate active worktrees: `git worktree list --porcelain`.
4. For each remaining merged task branch:
   - If a worktree is linked to that branch: check whether the worktree has uncommitted changes. If clean,
     remove the worktree first (`git worktree remove <worktree-path>`).
   - Delete the merged local branch: `git branch -d <branch-name>`.
5. If any candidate branch or worktree is ambiguous or has unmerged/dirty state, leave it untouched
   and list it in the report.

## 3. Configure Target Testing Environment

When no platform argument is given, proceed directly to step 4 without launching any platform target.

- **`desktop`**: Current machine is the target. Inspect `.control/test-targets/desktop.md` if present
  for checklist items. Launch the application locally using the `run` skill or the commands documented
  in `.constitution/project/codebase-stack-guide.md`.
- **`web <target>`**: Inspect `.control/test-targets/web.md` if present. Follow deployment or serving
  procedures documented in project guides or the devops repository for `<target>`.
- **`mobile <target>`**: Inspect `.control/test-targets/mobile.md` if present. Use the `run` skill or
  documented project mobile commands to target the named device or emulator `<target>`.

## 4. Build Checklist from Closed Tickets

Find tickets and SPEC entries closed since the last sync cursor or in the most recent closed spec
cycle (from `specs.yaml`, `.control/`, or recently closed `SPEC.md` files). Extract acceptance criteria
and hand-testable verification steps. MUST NOT invent test cases ungrounded in closed specifications.

Group items by component or screen:

```markdown
Component & Issue / Screen
  1. Feature Title
     [ ] verification step 1
     [ ] verification step 2
```

When a target was specified (`desktop`, `web`, or `mobile`), append the relevant template checklist
items from `.control/test-targets/<target>.md`. When no target argument was supplied, present the
derived ticket verification steps alone.

## 5. Clean Ephemeral Smoke Artifacts

Clean up temporary smoke test logs and dumps under `.work/smoke/` created during the test run.
Record the current sync commit hash to `.work/smoke/last-sync` to serve as a local non-authoritative
cursor for subsequent runs. MUST NOT remove or modify permanent ledger files under `.control/memlog/`
(they are permanent audit records).

## 6. Report and Stop

Display the generated checklist, report which merged task worktrees/branches were pruned, note any
preserved immune branches, and stop. MUST NOT continue into further coding, commits, or another
autopilot run in the same turn.
