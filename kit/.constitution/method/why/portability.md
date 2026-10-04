---
status: Reference
---

# Portability — what is method, what is product

**Opened when:** carrying a method change into the WDI Method package, or installing
the method in a product repo.

This file **explains**. It does not bind. Installing is the act, and that act lives in
the WDI Method package README plus `wdi-method` (`install` · `update` · `promote` ·
`verify`). Where this file and that README disagree, the README wins and the
disagreement is a defect.

It exists so that "promote the method, leave the product" is not a fresh re-reading of
fifty files every time.

## The seam

Most of `.constitution/` is portable as it stands. A handful name **this product**, and in most of
them only an *example* does — not a rule.

| File | What is this product's | What to do when carrying it |
|---|---|---|
| `../../project/constitution.md` | Articles 1, 2, and 5 | **Rewrite 2 and 5.** Article 1 cites `index.yaml` `product.name`. Articles 3, 4, 6, 7 are NOT here — they are the method's, in `../constitution.md`, and `update` replaces them. `promote` never touches this file: the room is skipped, so the package's copy is a seed and nothing more |
| `../document/architecture-guide.md` | Seed examples of stack and tree shape | Re-point the examples. Every rule around them travels |
| `../document/corpus-guide.md` | Worked examples of `_platform` ownership | Re-point the examples. **Keep both kinds**: they teach the trap better than the rule alone |
| `templates/design-system.md` | The pointer to wherever this project keeps its tokens | Re-point at that project's token file |
| `templates/oq.md` | One example of a bad question title | Cosmetic |

Everything else — the five gates, the two fields, the twenty-two skills, the templates, `validate.py`,
`inventory.py`, `../method-glossary.md`, and the three files beside this one — carries without edit.

One half-exception, and it is by design: `inventory.py` is the generic engine and carries whole, but
it reads no code itself. The three readers live in `../../project/inventory-readers.py`, which ships
as a skeleton and belongs to the product. A new project runs `wdi-init` intent `readers` once and
rewrites that file, nothing else. No example ships, deliberately — an example is a guess about a
stack nobody here has seen.

## What does NOT travel

| Stays behind | Why |
|---|---|
| `.control/` | This product's state. A new project scaffolds its own through `wdi-init` intent `setup`, or receives empty stubs on first `install` |
| `.what/` · `.how/` | This product's promises and build |
| `.constitution/project/codebase-*-guide.md` | Written by the **project**, not the method. They ship as empty `Draft` stubs |
| `.constitution/project/inventory-readers.py` | How THIS product's code is read. Seeded as a SKELETON — no patterns and no stack. `wdi-init` intent `readers` writes it against the repo in front of it |
| `_bmad-output/` | Run workspace |
| The `bmad-*` skills themselves | BMad's, installed by BMad. Only `_bmad/custom/*.toml` is ours |

## What travels beside `.constitution/`

The method is not `.constitution/` alone. Three sets move together, and carrying one without the
others leaves a method that cannot run:

| Set | Note |
|---|---|
| `.constitution/` | Minus the product articles; `promote` / `install` handle the seam |
| `.<host>/skills/wdi-*/` for every host selected at install | Every wrapper. A wrapper without its guide, or a guide without its wrapper, is half a method |
| `_bmad/custom/*.toml` | The one most likely to be forgotten. `*.user.toml` stays behind |
| `AGENTS.md`, and each rule file a selected host reads beside it | The routing table is the method; from `## Code` down is the product. `install` / `update` MUST NOT overwrite an existing `AGENTS.md` |

## One method, many hosts

The method runs on every host the installer offers, and each host differs in five ways that matter.
`lib/platforms.mjs` in the package is the one record of them; `install` writes the selected hosts into
`.control/wdi-method.yaml` under `hosts:`, and the skills and `validate.py` read them from there.

| Difference | What the method does about it |
|---|---|
| **Where skills are read** (`reads:`) | The `wdi-*` skills go to each host's own folder. The six engines MUST be in a folder every selected host reads — Kiro reads only `.kiro/skills` — and `npx wdi-method engines` names the `npx skills add --agent` that puts them there |
| **How a skill is loaded** | Through the host's own mechanism: a skill tool where it has one, otherwise reading the whole `SKILL.md`. Both are invocation; a paraphrase is neither |
| **How a person types one** (`invoke:`) | `/name`, `$name`, `/skill:name`, `@name`, or asked for by name. `wdi-help` names the next skill in this host's form |
| **Manual-only** (`manual_only:`) | Three layers. The host's own lock where it has one (`disable-model-invocation`; `.claude/settings.json` deny rules; `opencode.json` `ask`). A guard line at the top of each manual-only skill. The `AGENTS.md` block, mirrored into every rule file a host reads. On a host with no lock the last two are all there is, and that is the host's limit, not a gap in the install |
| **A scheduler of its own** (`loop:`) | `wdi-daily-autopilot` and `wdi-autopilot` start it where it exists. Where it does not, they run one iteration per invocation — a shell loop or an OS scheduler is not a substitute |

A host the method dropped is named by `update` and left alone: its folders may hold the product's own
files too, so removing them is the owner's call.

## Two directions

```
a product repo with a newer working copy of the method
        --promote-->
WDI Method (this package)
        --install / update-->
product repos
```

- **Promote** copies the method *up* once it has settled in a working copy.
- **Install / update** copies that snapshot *out* to a repo that consumes it.
- Do not run `update` against a repo you are about to promote from — that would overwrite the newer copy.
- There is no SHA lock and no per-file increment. The snapshot is the unit. The package version on npm / GitHub is the name of that snapshot.

## Installing in a fresh repo

BMad first (`npx bmad-method install`), then WDI Method. There is no numbered install runbook:
the steps that a runbook used to carry are now `wdi-init` intent `setup`. The order the acts come in:

1. `npx bmad-method install` in the product repo.
2. `npx wdi-method install` (optionally `--agents …`).
3. Set `product.name` in `.control/registry/index.yaml`. Rewrite `../../project/constitution.md` Articles 2 and 5.
4. Merge the method routing into `AGENTS.md` if that file already existed.
5. Run `wdi-init` intent `setup`.
6. Sort what already existed. A file that is already the artifact one slot asks for goes into that
   slot through the skill that owns it; everything else goes to `_bmad-output/prior-knowledge/`.
   `corpus-guide.md` owns that test.
7. Then G1 — which confirms `product.name` and writes the brief under that name.

**Two things a fresh install MUST NOT do:**

- Set `mode` and `risk_accepted` before the components exist. They are per-component fields, and the
  components are born at the tail of G2.
- Fill `.control/generated/` by hand. It is script output, and a hand-written table there is the one
  lie no validator catches.
