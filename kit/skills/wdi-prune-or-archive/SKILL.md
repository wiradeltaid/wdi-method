---
name: wdi-prune-or-archive
description: Clean up completed closed specs by archiving to `.archive/specs/` or pruning from disk, wrapping lifecycle.py with fail-closed safety. Invoke as `/wdi-prune-or-archive [--spec <id>|--all-closed] [--archive|--prune] [--dry-run]` or bare `/wdi-prune-or-archive` for interactive selection.
disable-model-invocation: true
---

# WDI Prune or Archive

Standalone housekeeping skill for closed specifications. Moves completed spec directories to
`.archive/specs/<spec-folder>/` or prunes completed tickets from disk using `lifecycle.py`, while
strictly preserving requirement traceability and RTM metadata in `.control/registry/specs.yaml`.

- `/wdi-prune-or-archive` — interactive mode: discovers closed specs in `.scratch/`, presents options,
  and confirms before execution.
- `/wdi-prune-or-archive --spec <id> --archive` — archives `<id>` to `.archive/specs/<spec-folder>/`.
- `/wdi-prune-or-archive --spec <id> --prune` — removes completed `<id>` folder from disk and git.
- `/wdi-prune-or-archive --all-closed --archive` — archives all closed specs in `.scratch/`.
- `/wdi-prune-or-archive --all-closed --prune` — prunes all closed specs in `.scratch/`.
- Add `--dry-run` to any command to simulate without modifying files or git index.

## 0. Preconditions

1. Confirm `.control/registry/index.yaml` exists in the repo root. If it does not, this is not a WDI
   Method product repo — report that and stop.
2. Verify git working tree is clean (`git status --porcelain`). If uncommitted changes exist, stop and
   instruct the maintainer to commit or stash changes before running real archive/prune operations.
   (Exception: `--dry-run` permits an uncommitted tree with an advisory note).

## 1. Discovery & Mode Selection

### A. Interactive Mode (invoked bare: `/wdi-prune-or-archive`)

1. Read `.control/registry/specs.yaml`.
2. Find all specs with `status: closed` whose directory currently resides under `.scratch/`:
   - If no closed specs reside in `.scratch/`: report that `.scratch/` is already clean of closed specs
     and stop.
   - If closed specs are found: list each candidate with its ID, title/release, and folder path.
3. Present the three housekeeping choices to the maintainer:
   - **Archive:** Moves the directory to `.archive/specs/<spec-folder>/` via `git mv` and updates
     `spec_folder` in `specs.yaml`. Preserves full historical audit provenance.
   - **Prune:** Removes the directory via `git rm -r` while keeping the spec row and ticket index
     intact in `specs.yaml`. Recommended when git commit history is sufficient.
   - **Defer:** Leave the directories untouched and exit.
4. Ask whether to apply the action to all eligible specs (`--all-closed`) or a specific `--spec <id>`.
5. Display the exact command that will be executed and request confirmation.

### B. Direct Flag Mode

Parse arguments and map them directly to `lifecycle.py` flags:
- If a positional spec ID is supplied (e.g. `/wdi-prune-or-archive SPEC-1 --archive`), map it to `--spec SPEC-1`.
- Ensure exactly one action is specified: `--archive` OR `--prune`.
- Ensure exactly one scope is specified: `--spec <id>` OR `--all-closed`.
- Pass `--dry-run` if specified.

## 2. Execution via Lifecycle Script

All physical git and filesystem operations **MUST** be executed through `lifecycle.py` to guarantee
atomicity, validation, and rollback:

```powershell
uv run .constitution/method/scripts/lifecycle.py [arguments]
```

`lifecycle.py` enforces authoritative preflights:
- Rejects open or active specs (`status: closed` required).
- Rejects paths outside authorized spec roots.
- Rejects folders currently checked out by active git worktrees.
- Rejects folders cited by active or permanent `.control/memlog/` artifact records.
- Runs post-operation validation (`validate.py --check`) and automatically rolls back all staged and
  worktree changes if validation fails.

## 3. Report and Stop

Display the result of the lifecycle operation verbatim, report updated `spec_folder` paths or pruned
directories, and stop. MUST NOT proceed into further coding, commits, or other skill invocations.
