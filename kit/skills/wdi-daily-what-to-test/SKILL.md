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

1. Save the pre-sync HEAD commit as `before_sync` (`git rev-parse HEAD`), or read the last sync cursor from `.work/smoke/last-sync` if present.
2. Fetch remote updates and prune deleted tracking refs: `git fetch --prune origin`.
3. Land on `development_branch` in the primary repository worktree using standard git operations
   (`git checkout <development_branch>` or `git switch <development_branch>`).
4. Pull remote updates strictly with fast-forward: `git pull --ff-only`.
   If the branch has diverged or cannot be fast-forwarded, stop and report immediately; MUST NOT create
   an automatic merge commit on `development_branch`.

## 2. Prune Merged Task Branches & Worktrees (With Immunity Protections)

Apply strict immunity per `.constitution/method/branch-guide.md` § Absolute branch immunity:
- **Immune Branches:** `primary_branch` and `development_branch` **MUST NEVER be deleted**, locally or on any remote.
- **Immune Checkouts:** The currently checked-out branch and the primary worktree root **MUST NEVER be removed**.
- **Dirty Worktrees:** Any worktree with uncommitted changes (`git status --porcelain` non-empty) **MUST NOT be removed**.

Pruning procedure:
1. Enumerate candidates merged into `development_branch`: `git branch --merged <development_branch>`.
2. Filter the candidate list to explicitly **exclude**:
   - `primary_branch`
   - `development_branch`
   - the currently active branch (`HEAD`)
3. Enumerate active worktrees: `git worktree list --porcelain`.
4. For each remaining merged local task branch:
   - If a worktree is linked to that branch: check whether the worktree has uncommitted changes. If clean,
     remove the worktree first (`git worktree remove <worktree-path>`).
   - Delete the merged local branch: `git branch -d <branch-name>`.
5. Remote branch hygiene (fail-closed):
   - For method-owned task branches (e.g. `autopilot/<mandate-id>`) merged into `development_branch`:
     verify PR merge status (e.g. confirming its tip is an ancestor of `origin/<development_branch>`, or via `gh pr view <branch> --json state,mergedAt`).
   - If confirmed merged and non-immune, delete the remote branch: `git push origin --delete <branch>`.
   - If status cannot be verified, or if the toolchain is unavailable: do NOT delete; report as residual remote branch.
6. If any candidate branch or worktree is ambiguous or has unmerged/dirty state, leave it untouched
   and list it in the report.

## 3. Configure Target Testing Environment

When no platform argument is given, proceed directly to step 4 without launching any platform target.

- **`desktop`**: Current machine is the target.
  1. Inspect `.control/test-targets/desktop.md` (or `.constitution/project/codebase-stack-guide.md`) for build command, profile (default: `release` if verifying visual layout/performance, or `debug` for fast logic loops), target binary artifact path, and process executable name.
  2. **Desktop Process Gate (File-Locking Prevention):** Before compiling or launching:
     - Check whether an existing process is executing the target artifact binary (inspecting processes matching the binary path or application executable name).
     - If an active process is found: check whether it was launched by a previous smoke run (recorded in `.work/smoke/runtime-desktop.yaml`). If recorded, attempt graceful shutdown and wait for exit.
     - If the process is not from WDI smoke or cannot exit gracefully: **MUST NOT** force-kill blindly (`Stop-Process -Force` is prohibited without confirmation); report the PID, binary path, and file-lock hazard to the maintainer, and stop before rebuilding.
  3. **Build Target:** Rebuild the binary if it is missing or older than the current `HEAD` commit, adhering to the project's build command and profile. If the binary already matches `HEAD`, skip rebuilding.
  4. **Launch Application:** Launch the application locally using the documented launch command.
  5. **Runtime Manifest:** Record `{ pid, started_at, artifact_path, profile, head }` to `.work/smoke/runtime-desktop.yaml` (ephemeral artifact under `.work/`, never committed).
- **`web <target>`**: Inspect `.control/test-targets/web.md` if present. Follow deployment or serving
  procedures documented in project guides or the devops repository for `<target>`.
- **`mobile <target>`**: Inspect `.control/test-targets/mobile.md` if present. Use the `run` skill or
  documented project mobile commands to target the named device or emulator `<target>`.

## 4. Build Checklist from Closed Tickets (Delta-Scoped Retrieval)

MUST NOT perform a full-file read or broad regex scan of the historical `specs.yaml`.
Derive the verification checklist directly from the delivery delta:
1. Define the delivery commit range: `before_sync..HEAD` (or fallback to `last-sync..HEAD`, or the recent merge commit on first-parent history if cursor is absent).
2. Inspect paths touched within the delta:
   - Identify closed specifications by matching `.scratch/*/SPEC.md` or `.control/memlog/autopilot-*.md` modified in the delta.
   - Read the changed autopilot ledger (`.control/memlog/autopilot-<id>.md`) as an index of closed tickets and scope.
3. For each candidate closed spec:
   - Read candidate's `SPEC.md` and issues under `.scratch/<spec-folder>/` to extract acceptance criteria and hand-testable verification steps.
   - Verify spec's `status: closed` selectively against `.control/registry/specs.yaml` (matching only that specific spec's block, never loading the entire file).
4. Group hand-testable verification items by component or screen:

```markdown
Component & Issue / Screen
  1. Feature Title
     [ ] verification step 1
     [ ] verification step 2
```

When a target was specified (`desktop`, `web`, or `mobile`), append the relevant template checklist
items from `.control/test-targets/<target>.md`. If no closed spec is detected in the delta, report that
no new closed tickets were merged in this sync.

## 5. Clean Ephemeral Smoke Artifacts

Clean up temporary smoke test logs and dumps under `.work/smoke/` created during the test run.
Record the current sync commit hash to `.work/smoke/last-sync` to serve as a local non-authoritative
cursor for subsequent runs. MUST NOT remove or modify permanent ledger files under `.control/memlog/`
(they are permanent audit records).

## 6. Report and Stop

1. Display the generated checklist, target runtime info (artifact path, build profile, PID, SHA), report which merged task worktrees/branches were pruned, and note any preserved immune branches.
2. **Post-Verification Housekeeping Notice:** Provide a non-blocking informational note:
   *"Closed specification directories in `.scratch/` can be archived or pruned via `/wdi-prune-or-archive --spec <id> --archive` once hand-testing is complete."*
3. Stop. MUST NOT continue into further coding, commits, or another autopilot run in the same turn.
