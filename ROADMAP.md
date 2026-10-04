# Roadmap

Where WDI Method is going, and what each step means for a repo that already has it installed. The
[CHANGELOG](CHANGELOG.md) records what shipped; this file records what is planned. A plan here is not a
promise of a date.

## Principles every release keeps

- **Every host the installer offers works.** `npx wdi-method --list-agents` is the supported list. A host
  that cannot be made to work is removed, with the reason, rather than offered half-working.
- **`update` never breaks a working repo.** It never deletes a folder the product may own, never
  overwrites a value the product chose, and says in plain words what changed and what — if anything — the
  owner has to do. When content changes shape, `wdi-upgrade` moves it.
- **Upstream work is credited.** WDI Method builds on [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD)
  and [mattpocock/skills](https://github.com/mattpocock/skills), both MIT. What is adapted from them says
  so, file by file, and in [NOTICE](NOTICE). WDI Method is not affiliated with or endorsed by either.

## 0.6.x — one method on every host (current)

- One capability record per host: where it reads skills, its rule files, how a person types a skill,
  whether it can hold a skill to manual-only, whether it has a scheduler of its own.
- The six engines are checked, unlocked, and copied per host; the method block reaches every host's rule
  file; `wdi-autopilot` uses the host's scheduler or runs once per invocation.
- Prerequisites unchanged: BMad Method and the mattpocock/skills engines are installed separately.

## 0.7.0 — no separate install of mattpocock/skills

- The engines `wdi-build` and `wdi-blueprint` use (`to-spec`, `to-tickets`, `implement`, `tdd`,
  `code-review`, `domain-modeling`) ship **inside** those skills as their own supporting files, adapted
  from a pinned upstream version. Nothing else from mattpocock/skills is taken.
- They are read from the skill's own folder on every host, so the `disable-model-invocation` patching,
  the per-host engine placement, and the "install the engines first" step all go away.
- A repo may still install mattpocock/skills for its own use. WDI Method neither needs nor touches it,
  and the names cannot collide: the adapted engines are supporting files, not registered skills.
- **Upgrading from 0.6.x:** `update` stops requiring the engines and leaves the existing engine folders
  where they are. It says which ones WDI Method no longer uses, and that removing them is optional.

## 0.8.0 — no separate install of BMad Method

- The BMad workflows the gate skills use — product brief, PRD, UX, architecture, course correction,
  document review, and the research and elicitation helpers they call — are adapted into `wdi-problem`,
  `wdi-product`, `wdi-ux`, `wdi-blueprint`, `wdi-decision`, and `wdi-review`, writing to the method's own
  folders directly instead of through `_bmad/` configuration. Only the workflows the method uses are
  taken; the BMad skills it already retired stay out.
- Each adapted workflow is checked against the BMad original on the same fixture before it replaces it,
  so interactive elicitation is kept, not flattened.
- A repo may still install BMad Method alongside. WDI Method stops locking BMad's skills; the method block
  in `AGENTS.md` simply routes work through the `wdi-*` skills.
- **Upgrading from 0.7.x:** `update` stops requiring BMad, stops writing `_bmad/custom/`, and leaves
  `_bmad/`, `_bmad/custom/`, and `_bmad-output/` untouched. Documents that cite `_bmad-output/` keep
  working. Removing BMad is the owner's choice, and the release notes say exactly what is safe to delete.

## Beyond 0.8

Ideas, not plans, until they get a section above: a lighter path for repos that only want G5, and more
hosts as they gain a project skill folder.
