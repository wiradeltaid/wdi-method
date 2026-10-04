# Upstream — what WDI Method takes from BMad Method and mattpocock/skills, and how

The maintainer playbook for adopting upstream work. It applies from 0.7.0 (mattpocock/skills) and 0.8.0
(BMad Method); until then both are installed by the user, and [ROADMAP.md](ROADMAP.md) says what changes.

Keywords MUST / MUST NOT / SHOULD / MAY are normative.

## The model

1. The maintainer pins one version of each upstream **in this repository**, under `upstream/`.
2. Only the skills the method uses are adapted into `kit/skills/wdi-*` — as supporting files of the skill
   that uses them, not as skills of their own.
3. The package ships `kit/` only. `upstream/` MUST NOT be in `package.json` `files`; a test enforces it.
4. Users never install either upstream for WDI Method's sake, and MAY install either for their own. Nothing
   in the kit may depend on it being present or absent.

## Pinned versions

| Upstream | License | Pinned | Adopted in |
|---|---|---|---|
| [mattpocock/skills](https://github.com/mattpocock/skills) | MIT | — (set by 0.7.0) | 0.7.0 |
| [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD) | MIT; names are trademarks of BMad Code, LLC | — (set by 0.8.0) | 0.8.0 |

`upstream/<name>/VERSION` holds the exact version or commit; this table MUST match it.

## What is taken — the allowlist

Anything not listed here MUST NOT be adapted. Adding a row is a method change and needs its reason.

| Upstream skill | Adapted into | Why the method needs it |
|---|---|---|
| `to-spec` | `wdi-build/engines/` | G5 contract |
| `to-tickets` | `wdi-build/engines/` | G5 vertical tickets |
| `implement` | `wdi-build/engines/` | G5 build, test-first |
| `tdd` | `wdi-build/engines/` | Used by `implement` |
| `code-review` | `wdi-build/engines/` | Used by `implement` and the Step 3 panel |
| `domain-modeling` | `wdi-blueprint/engines/` | G3 catalog |
| `bmad-product-brief` | `wdi-problem/workflow/` | G1 brief |
| `bmad-prd` | `wdi-product/workflow/` | G2 PRD |
| `bmad-ux` | `wdi-ux/workflow/` | G2 UX |
| `bmad-architecture` | `wdi-blueprint/workflow/` | G3 spine |
| `bmad-correct-course` | `wdi-decision/workflow/` | A void planning assumption |
| `bmad-review` | `wdi-review/workflow/` | Document review lenses |
| `bmad-deep-recon` | `wdi-problem/workflow/` | Research before G1, optional |
| `bmad-advanced-elicitation` | the workflows that call it | Elicitation inside G1–G3 |

The thirteen BMad skills retired at G5 (`kit/.constitution/method/document/bmad-skill-register.md`) MUST
NOT be adapted.

## Rules for an adapted file

- It MUST open with a provenance line: source repository, path, pinned version or commit, and license —
  e.g. `> Adapted from mattpocock/skills skills/engineering/to-spec (commit abc1234), MIT.`
- It MUST NOT carry `name:` frontmatter or sit where a host would register it as a skill; it is read by
  the skill that owns it, by path relative to that skill's folder.
- It MUST NOT carry `disable-model-invocation`.
- It MUST NOT be named, titled, or described with an upstream trademark as its own identity ("BMad …").
  Describing its origin ("adapted from BMad Method") is fine.
- Upstream configuration MUST be resolved, not carried: `_bmad/config.yaml` variables, `customize.toml`
  layers, and tracker setup become the method's own paths (`.what/`, `.how/`, `.control/`,
  `docs/agents/`). An upstream script the workflow cannot do without goes to
  `kit/.constitution/method/scripts/` with its test, under the same provenance rule.
- It MUST keep the upstream behaviour the method relies on — above all the interactive questioning in
  the BMad workflows and `domain-modeling`. A shorter file that asks fewer questions is a regression.
- Invitations to skills outside the allowlist (party mode, `bmad-help`, sibling engines) MUST be removed
  or pointed at the `wdi-*` skill that owns the job.

## Bumping an upstream version

1. Branch. Update `upstream/<name>/` to the new version and `VERSION`.
2. Run `npm run upstream:diff <name>` — the diff of every allowlisted skill between the old and new pin.
   Nothing outside the allowlist is read.
3. For each changed skill, decide per hunk: **take** (adapt into the kit file), **skip** (say why in the
   PR), or **conflicts with the method** (the method wins; say so). A bug fix SHOULD be taken.
4. Update the provenance line of every touched kit file to the new pin.
5. Verify: `npm test` green, including the fixture corpus and the multi-host matrix; for a changed BMad
   workflow, run old and new against the same fixture and compare what each asks and writes.
6. CHANGELOG entry names the upstream versions moved and what changed for users. A pin bump with
   behaviour change is at least a patch; one that changes what a gate produces is a minor, released by the
   maintainer (`AGENTS.md` § Versioning).

## Attribution

`NOTICE` names both upstreams, their copyright lines, and their licenses, and states that parts of the
kit are adapted from them. It MUST stay true to `upstream/*/VERSION`.
