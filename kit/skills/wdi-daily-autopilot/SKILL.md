---
name: wdi-daily-autopilot
description: Compose and launch the autonomous daily loop routine (default 10m interval) with self code-review and peer-review runners resolved from local configuration. Invoke as `/wdi-daily-autopilot [in-session] [peer] [interval] [--skip-peer-review]`.
disable-model-invocation: true
---

# WDI Daily Autopilot Launch

Composes the autonomous daily engineering routine, verifies or initiates the owner-accepted mandate
required by `wdi-autopilot`, resolves coordinator self code-review and independent peer-review dispatch
from local configuration or agent rules, and launches the execution via `/loop <interval>` (default
`10m`).

`/wdi-daily-autopilot [self-review] [peer] [interval] [--skip-peer-review|--no-review]`:
- `[self-review]` — coordinator self code-review pass model (`default` or explicit model slug; alias `[in-session]`).
  `default` indicates the current coordinating session executes self code-review directly.
- `[peer]` — independent peer reviewer runner or model identifier.
- `[interval]` — optional loop interval matching `^\d+[smhd]$` (e.g., `5m`, `10m`, `15m`). Defaults
  to `10m` when omitted.
- `--skip-peer-review` / `--no-review` — bypasses the secondary peer review pass. MUST NOT disable
  coordinator self code-review, TDD cycles, or automated test suites.

## 0. Precondition

Confirm `.control/registry/index.yaml` exists in the repo root. If it does not, this is not a WDI
Method product repo — report that and stop.

## 1. Parse Arguments and Flags

Parse inputs unambiguously using these rules:
1. Check for review bypass flags: `--skip-peer-review` or `--no-review`. If present, mark peer review
   as bypassed.
2. Check for an interval token matching `^\d+[smhd]$`. If found, assign it to `<interval>`; otherwise
   default `<interval>` to `10m`.
3. For remaining positional arguments:
   - If 1 argument remains: assign to `<peer>`, and default `<self-review>` to `default`.
   - If 2 arguments remain: assign first to `<self-review>` and second to `<peer>`.
   - If 0 arguments remain: read defaults from `.control/custom-dispatch.yaml` if present, else default
     both to `default`.

## 2. Resolve Runner Configuration

Inspect the repository for `.control/custom-dispatch.yaml` (if not found in the current working directory and running inside a linked git worktree, resolve it from the main repository root via `(git rev-parse --git-common-dir)/..`):
- **If `.control/custom-dispatch.yaml` exists**:
  Read `runners:`, `roles:`, and `review_policy:`.
  - If `review_policy.peer_review` is explicitly `false`, or if `roles.reviewer` is set to `none`, mark peer review as bypassed.
  - If `<peer>` was not explicitly specified on the command line, use `roles.reviewer`. If resolved `<peer>` is `none`,
    mark peer review as bypassed (coordinator self-review only).
  - If `roles.deep_analyst` is `none`, document review and architecture analysis are handled by the main reviewer or
    coordinator directly, without dispatching a separate deep analyst process.
  - Resolve `roles.builder` for the coding execution inside the active run worktree:
    - `coordinator` (default): coordinating session implements code directly (optimal for tight TDD and atomic refactoring).
      Guardrail: when `roles.builder` is `coordinator`, coordinator direct implementation MUST NOT eliminate
      independent peer review for components whose `risk_accepted` is not `low`; `roles.reviewer` MUST NOT be set
      to `none` in such cases.
    - `in-session`: coordinator delegates coding pass to an in-session subagent (`Agent` tool) in the active worktree.
    - `<runner-id>`: coordinator delegates coding pass to the named external runner spawned with working directory (`cwd`) set to the active worktree.
      If `<runner-id>` is not found in `runners:`, or lacks a nonempty `command` string under `type: shell-out`,
      stop immediately and report to the maintainer (fail-closed; do NOT guess or silently fall back).
      (Note: Synchronous shell-out runners are subject to a 10-minute CLI tool timeout; prefer `in-session`
      for long-running TDD passes or keep ticket slices small).
  - Resolve runner dispatch by `type:`:
    - `auto`: Evaluates whether the runner's target model is reachable in-session from the active
      session profile (per the caller's global agent collaboration rules). Dispatches in-session via `Agent`
      if reachable; falls back to shell-out using `command` if unreachable in-session.
    - `in-session`: Dispatches strictly via in-session `Agent` subagent.
    - `shell-out`: Executes the external shell-out `command` (single-string command). If `command` is absent
      or empty, stop and report immediately (fail-closed).
- **If `.control/custom-dispatch.yaml` does not exist**:
  Default `roles.builder` to `coordinator` and resolve dispatch through the caller's active CLI environment.

## 3. Mandate Verification & Preflight Requirement

Per `wdi-autopilot` § Preflight, unattended loop iterations **require an active accepted mandate** in
`.control/registry/decisions.yaml` whose expiry date has not lapsed. A loop MUST NOT self-authorize
its own mandate.

1. Check if an active accepted mandate exists:
   - An active mandate MUST have BOTH `type: mandate` and `status: accepted` with an unexpired `expires:` date
     (`today <= expires`) and no `superseded_by:` or `status: superseded`.
   - **Primary lookup ($O(1)$):** Read `.control/generated/status.yaml` and inspect `mandates:`:
     - If `mandates.resolution: one`: the active mandate is `mandates.active_mandate.id` (with its verified `expires` and `status`). Proceed directly to step 3.
     - If `mandates.resolution: ambiguous`: stop and report immediately to the maintainer naming all `mandates.active_ids` (fail-closed; MUST NOT guess or choose between them).
     - If `mandates.resolution: none`: proceed to step 2 (Preflight).
   - **Fallback lookup (when `status.yaml` does not exist or lacks `mandates:`):**
     - MUST NOT run a broad search for `type:\s*mandate` across `decisions.yaml` (which matches dozens of historical
       `applied` mandates and overflows the tool output limit with hundreds of lines).
     - Query specifically for an active mandate entry using multiline search (e.g. `Grep` with
       `pattern: "type:\s*mandate[\s\S]{1,100}?status:\s*accepted|status:\s*accepted[\s\S]{1,100}?type:\s*mandate", multiline: true`).
       Once a candidate match is found, verify its individual decision block to confirm `expires:` is present,
       valid, and unexpired.
     - **Fail-closed on multiple active mandates:** If more than 1 active accepted mandate is found, stop and
       report immediately to the maintainer (fail-closed; MUST NOT guess or choose between them).
   - MUST NOT call `Read` on the entire 1000+ line `decisions.yaml` file. When reading the latest decision ID
     to determine the next candidate `DEC-` ID, read only the tail (e.g. the last 50-80 lines) of `decisions.yaml`.
2. **If no active accepted mandate exists:**
   - Execute `wdi-autopilot` Door 1 (Preflight) in this interactive turn.
   - When checking open work to include in the mandate, query `specs.yaml` selectively (e.g. `Grep` for
     `status:\s*(open|ready-for-dev)`) instead of reading all historical closed specs into context.
     Inspect the candidate spec's folder using the `spec_folder:` path from `specs.yaml` (MUST NOT run
     broad recursive searches on all of `.scratch/`).
   - Run validator preflight via `uv run .constitution/method/scripts/validate.py --check --baseline`
     (or `--generate --baseline`). If `.github/validate-baseline.txt` exists in the repo, the `--baseline` flag
     guarantees that accepted repository baseline findings are recognized as green.
   - When verifying the preflight test suite from `codebase-stack-guide.md`, run tests with quiet output flags
     if supported (e.g. `-- --quiet` or standard concise runner flags) to avoid flooding the context window
     with hundreds of verbose pass lines.
   - **Fail-closed on test failure:** If the test suite command exits non-zero, immediately surface the failure
     summary (the failing test names and error excerpt) and abort preflight; a mandate MUST NOT be opened on a
     failing test suite.
   - Present the one-page preflight summary and wait for the owner's explicit confirmation.
   - Once confirmed, write the accepted mandate row into `decisions.yaml` and initialize its ledger.
3. **If an active accepted mandate already exists:** Proceed directly to compose and launch the loop.

## 4. Compose the Routine Mandate

Fill the standing five-point routine template:

```markdown
Execute all FR/Tickets/Specs to completion under the active mandate:
1. Coding & Delegation: <resolved coding execution: author code directly as coordinator | delegate coding pass to in-session subagent in active worktree | delegate coding pass to <resolved builder runner> in active worktree cwd>. Boundary: builder edits application and test files only. Builder MUST NOT commit, push, merge, alter git branches, or write to .control/registry/ or .control/memlog/.
2. Code review: perform code review — self code-review by coordinator, and peer review: <resolved peer command | "none due to config">.
3. Testing & Verification: coordinator alone runs the authoritative test suite (from codebase-stack-guide.md) directly on the active worktree after the coding pass and verifies red-to-green evidence before staging or committing.
4. Reviews and peer analysis: delegate document and architecture review to <resolved peer command | "coordinator self-review (peer review: none due to config)"> — follow wdi-review criteria for any touched architecture or spec documents.
5. Worktree isolation & Integration: coordinator alone isolates ticket implementation into the run worktree, writes ledger decisions in .control/memlog/, stages/commits, and merges per wdi-autopilot. Peer review: <"peer reviewer inspects worktree without interfering with active build processes" | "none due to config">.
```

If peer review was bypassed (via `roles.reviewer: none`, `review_policy.peer_review: false`, or `--skip-peer-review`),
explicitly record `peer review: none due to config` in items 2, 4, and 5, instructing the coordinator to perform direct
self-review and self-verification without external peer dispatch.

## 5. Launch

Invoke the `loop` skill with `<resolved interval> /wdi-autopilot <composed text from step 4>`. This
starts the loop execution.

## 6. Verify Immediate Execution

Before finishing, verify that `/wdi-autopilot` was invoked in this same turn for the first iteration
rather than remaining idle until the first cron interval tick. If it did not run immediately, invoke
`/wdi-autopilot` now to start the first iteration.

## 7. Report and Stop

Report the resolved configuration (in-session mechanism, peer review status, active mandate ID, and
loop interval), confirm that the loop is active, and stop. MUST NOT intervene in or micromanage
subsequent loop iterations.
