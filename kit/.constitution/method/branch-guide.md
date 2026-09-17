---
status: Accepted
---

# Branch Guide

**Loaded when:** creating, switching, pushing, merging, or deleting git branches, creating task worktrees, targeting pull requests, or configuring repository branch policy

This guide governs git branching conventions, protected branches, and pull request target policies across repositories using WDI Method.

## Branch policy settings

Branch settings live in `.control/registry/index.yaml` under `policy:`. Both default to `main`:

| Setting | Governs | Default |
|---|---|---|
| `primary_branch` | Production / release trunk | `main` |
| `development_branch` | Active development branch for specs, worktrees, and PR targets | `main` |

Two workflows are supported:
- **Single-branch workflow:** `primary_branch` and `development_branch` are identical (e.g. both `main`). Suitable for small tools and straightforward repositories.
- **Two-branch workflow:** `primary_branch` is `main` (production-ready releases) and `development_branch` is `development` (ongoing feature integration).

## Absolute branch immunity

- An agent MUST NOT delete, rename, force-push, or overwrite `primary_branch` or `development_branch`, locally or on any remote.

## Primary branch protection

The `primary_branch` represents production stability:
- An agent MUST NOT commit application code directly to `primary_branch`.
- An agent MUST NOT force-push to `primary_branch`.
- In single-branch mode (where `development_branch` equals `primary_branch`), the only exception to direct commits is non-code corpus planning: spec and ticket authoring in `.scratch/` and index updates in `.control/registry/specs.yaml`. All application code changes MUST go through isolated branches/worktrees and pull requests.
- An agent MUST NOT merge into `primary_branch`, except in single-branch mode where `development_branch` equals `primary_branch`, and only when explicitly instructed by the repository maintainer.
- Merges into `primary_branch` and release tagging belong exclusively to human maintainers or designated release workflows.

## Development branch protection

- An agent MUST NOT force-push to `development_branch`.
- An agent MUST NOT commit application code directly to `development_branch`; code delivery MUST arrive via isolated task branches/worktrees and pull requests.
- Direct commits to `development_branch` are permitted strictly for Phase 1 & 2 spec/ticket authoring in `.scratch/` and `.control/registry/specs.yaml`, with no application code changes.
- Merging pull requests into `development_branch` requires explicit maintainer approval.

## Active development target

The `development_branch` is the sole base and landing target for active engineering work:
- Feature specs, ticket authoring, and `.scratch/` planning documents are based on `development_branch`.
- Task branches and implementation worktrees MUST branch from `development_branch`.
- Pull requests opened by `wdi-build` or `wdi-autopilot` MUST target `development_branch`.

## Fail-closed precheck

Before running branch or worktree operations, an agent MUST verify that the configured `development_branch` exists locally or on the remote tracking ref:

```bash
git rev-parse --verify "refs/heads/<development_branch>" >/dev/null 2>&1 || git rev-parse --verify "refs/remotes/origin/<development_branch>" >/dev/null 2>&1
```

- If `development_branch` cannot be verified locally or on remote, the agent MUST STOP immediately and report the error to the maintainer.
- An agent MUST NOT guess branch names or silently fall back to `main` when `development_branch` is missing.

## Worktree and task branch lifecycle

- Task branches and worktrees are temporary mechanisms for isolated implementation.
- Once a task or run branch is merged into `development_branch`, the local task worktree and branch SHOULD be pruned.
- Intermediate task branches MUST NOT be left lingering on the remote; only the designated run branch or PR branch reaches the remote.
- When synchronizing `development_branch`, agents SHOULD run `git fetch --prune origin` to prune stale remote-tracking references of branches already deleted on the remote.
- For method-owned run branches (e.g. `autopilot/<mandate-id>`), once the pull request is confirmed merged into `development_branch`, the remote branch SHOULD be pruned (`git push origin --delete <branch>`). If PR merge status cannot be verified, the remote branch MUST NOT be deleted and MUST be reported as a residual remote branch.
- Absolute branch immunity strictly applies to remote operations: an agent MUST NEVER delete or prune `primary_branch` or `development_branch` on any remote.

### Working tree isolation models

Isolation protects branch integrity and build state during implementation:
1. **Linked worktree (`git worktree add`):** An additional isolated checkout directory. Ideal for multi-task workflows and environments without toolchain file locks.
2. **Exclusive primary working tree:** The root repository checkout temporarily dedicated exclusively to a task branch or autopilot run branch (`autopilot/<mandate-id>`). This model is permitted where linked worktrees encounter filesystem or toolchain locks (e.g. Windows file locking on compiler output or artifact build directories), provided all three conditions hold:
   - The working tree is clean (`git status --porcelain` empty) before switching to the run branch.
   - The checkout is dedicated exclusively to the active run (no parallel builders, concurrent human edits, or competing processes sharing the root tree).
   - Only one active mandate or task run executes on the primary tree at any given time.
3. **Shared checkout (PROHIBITED for code changes):** A working tree with dirty state, unstaged edits, or concurrent uncoordinated activities.

## Red flags

- Committing directly to `primary_branch` when `development_branch` differs
- Deleting `primary_branch` or `development_branch` during worktree cleanup
- Force-pushing to any protected branch
- Falling back to `main` when `git rev-parse --verify <development_branch>` fails
- Opening a pull request targeting `primary_branch` instead of `development_branch`
