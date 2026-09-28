---
status: Accepted
---

# UX Guide

**Loaded when:** running `bmad-ux`, or placing its output

`bmad-ux` produces two documents that belong to **two different layers**. That split is the whole
reason this guide exists: everything else follows from getting it right.

## Four homes: two layers, at two levels

| | Promise — `.what/` | Build — `.how/` |
|---|---|---|
| **Product** — holds for every component | `.what/experience.md` | `.how/_platform/design-system.md` |
| **One Product Component** | `.what/<pc>/04-usecases/EXPERIENCE.md` | `.how/<pc>/01-ux/DESIGN.md` |

The test is the usual one. If a sentence would still be true after a full redesign, it is experience
and belongs in `.what/`. If it names a layout, a component, or a token, it is design. The level is
the second question: does it hold for every component, or for one?

## Product level — what crosses components

A UX run does not come out split by component. `bmad-ux`'s own `EXPERIENCE.md` opens with sections
that hold for the whole product, and until the product-level experience file existed they had no
home: the landing table had nowhere to send them, so they stayed in `_bmad-output/`, which is not
corpus. One repo parked them in `design-system.md` instead — a promise filed in the build layer, where
the next redesign would read it as broken.

Each section lands by the redesign test, sentence by sentence where a section holds both kinds:

| `bmad-ux` section | Default home | What moves to the other layer |
|---|---|---|
| Foundation — who it is for, the principles | `.what/experience.md` | — |
| Information architecture — the product's surfaces and how one moves between them | `.what/experience.md` | One component's inner surfaces go to that component's `EXPERIENCE.md` |
| Voice and Tone | `.what/experience.md` | — |
| State patterns — empty, loading, error, offline, everywhere | `.how/_platform/design-system.md` | The promise a state keeps (*an empty list always names the next step*) goes to `.what/experience.md` |
| Interaction primitives | `.how/_platform/design-system.md` | — |
| Accessibility floor | the standard met → `.what/experience.md` | how it is met — contrast pairs, target sizes → `design-system.md` |
| Surfaces that are not screens — notifications, widgets, share sheets | what the user is told, and when → `.what/experience.md` | how it looks → `design-system.md` |
| Key flows — the flow map | the whole map → `.what/experience.md` | each component's zoom-in → that component's `DESIGN.md`, by the rule below |
| Edge cases shared by several components | `.what/experience.md` | One component's own → its `EXPERIENCE.md` |

**Splitting a flow across components.** The whole map lives at product level. A zoom-in lands in the
component that **owns the screens in it** — never in the component that owns a shared composite shown
inside it. A composite is drawn wherever it is used; drawing it does not move the flow. A zoom-in whose
screens belong to two components is not split to fit: it stays part of the whole map in
`.what/experience.md`. One repo nearly filed a zoom-in under the wrong component because the only
registered `LC` inside it was a shared composite.

**A shared composite has one home.** A `ui-composite` used by several components is registered once,
under the component that holds its implementation. Where nearly every component uses it, it is a base
element — its `LC` type becomes `ui-element` — and belongs in `design-system.md` instead.

Getting this backwards is expensive in a specific way: a `DESIGN.md` filed under `.what/` makes the
promise layer freeze around one visual solution, and every later redesign then reads as a broken
promise.

## The landing zone

`bmad-ux` is a **class B** skill: it writes to a neutral landing zone at `_bmad-output/ux/`, and
`wdi-ux` — which is what dispatched it — lands the output from there.

- Output MUST land in `_bmad-output/ux/` first. A UX run MUST NOT write directly into `.what/` or
  `.how/`.
- Landing MUST go through `wdi-ux`, which owns `.what/<pc>/04-usecases/` and `.how/<pc>/01-ux/`. No
  other skill MAY land these files.
- Nothing is placed until the run is finalised. Half-placed UX output is worse than unplaced output,
  because it looks distributed.
- **A run MUST NOT wait for a `<pc>`, and MUST NOT be blocked on one.** The order is PRD → UX → **G2**
  → components, and it is forced: G2 reads `EXPERIENCE.md` (below), while `wdi-init` intent `component`
  requires G2 passed. Making a run wait for components closes that into a cycle nothing can open.
- **`design-system.md` and `.what/experience.md` land at G2**, immediately. Both cross components by
  definition and neither path has a `<pc>` in it — which is also why G2 can read the product-level
  experience from the corpus rather than from the run.
- **`EXPERIENCE.md` and `DESIGN.md` wait, and only because their paths contain `<pc>`.** That is the one
  remaining deferral in the flow, and it is not the owner's to remember: `wdi-init` intent `component`
  lands them in the same act as birthing the components.
- **A container is not required to land UX.** `.how/<pc>/01-ux/` has no container in its path; only a
  screen's `LC` row needs one, and that row is registered with `container:` empty and filled at G3 by
  `wdi-blueprint` intent `platform`, in the same act that registers the containers. `container-built` stays silent on
  an empty container until the `LC`'s Product Component lists one — the answer is demanded when it
  exists, not when it is thinnest.

`doc_standards` on `bmad-ux` runs `bmad-review` over both documents **at finalize** — that is, before
`wdi-ux` lands them. Reviewing afterwards would mean reviewing two files that no longer sit together.

## Registry consequences

Placement is not finished when the files have moved.

- **Every screen in `DESIGN.md` MUST be registered as an `LC` of type `ui-screen`** in
  `.control/registry/components.yaml`, with its `container`. A screen that exists in the design and not
  in the registry is a change nothing will trace, and `lc-registered` catches it **at spec close**.
- A composite that is reused across screens is an `LC` of type `ui-composite`, not a screen.
- Tokens and base components — colour, type scale, spacing, buttons, inputs — MUST go to
  `.how/_platform/design-system.md`, not into any one component's `01-ux/`. They cross Product
  Components by definition.

Registry conversion is part of placement, not a follow-up.

## Vocabulary

Every user-facing noun in either document MUST use `.control/product-glossary.md` verbatim **where an
entry exists**. A new domain noun introduced by a UX run MUST be routed to `wdi-question` and listed in
the run's report.

**It MUST NOT be added to the glossary in the same pass, because it cannot be.** The glossary belongs to
`wdi-blueprint` intent `catalog`, which needs Product Components, which need G2 passed — and this run is
what G2 reads. The rule used to say "added in the same pass" and was unsatisfiable at the only moment it
applied; a UX run failing that check was reporting the method, not the product. `wdi-blueprint` writes
the entries at G3 and closes those questions there.

This is where vocabulary drift usually enters the corpus: UX writes the words the user actually sees,
and those words are the ones that stick. When the SRS says `Anggota` and the screen says `Pengguna`,
the screen wins in practice and the corpus starts lying.

## What UX does not decide

- **Requirements.** A UX run that discovers a needed capability has found an `FR`, and it MUST go to
  the PRD through `wdi-product` intent `update` before it is designed.
- **Behaviour.** How the system responds belongs to `SRS-<pc>.md`. `EXPERIENCE.md` says what the user
  perceives, not what the system does internally.
- **Architecture.** A UX need that forces a technology choice MUST become a `DEC-`, not a note in
  `DESIGN.md`.

## Passing G2

`DESIGN.md` is an **attachment** at G2, not the document being read. What the Product Owner actually
reads is `prd.md` and `EXPERIENCE.md` — the run's, for what still waits on components, beside
`.what/experience.md`, already landed, for what crosses them — and G2 gets 45 minutes, twice any other gate, precisely
because it decides two things: what is built, and how it feels to use.

The gate question that catches a weak `EXPERIENCE.md` is checklist item 4: *can I retell the main UX
flow in five sentences without opening the document?* An experience that cannot be retold has not
been decided, only drawn.

Every `[ASSUMPTION]` left in either document at finalize MUST be registered through `wdi-question`
before the gate opens.

## Rules

- You MUST NOT edit content while placing it. If the content needs changing to fit its new home, that
  is a UX revision, and it goes back through `bmad-ux`.
- `EXPERIENCE.md` MUST reference use cases by ID where the chain matters. A journey that maps to no
  `UC` is either a missing use case or a promise nobody made.
- Durable UX decisions — why a pattern was chosen, what was rejected — belong in a `DEC-` or in the
  run's addendum, not as prose inside `DESIGN.md`.
- The UX run folder in `_bmad-output/ux/` MUST NOT be deleted while intent *update* may still read it;
  after that it follows the retirement condition in `corpus-guide.md`. Nothing in the corpus depends on
  it staying: what landed is complete on its own.
- Once components exist, a file in `.what/` or `.how/` MUST NOT cite the run's `DESIGN.md`,
  `EXPERIENCE.md`, or `design-system.md`. The run has been distilled; the corpus cites what landed.
- Every landed UX document — `experience.md`, `design-system.md`, each `EXPERIENCE.md` and `DESIGN.md` —
  MUST name the run file(s) it came from in its frontmatter `landed_from`. That is provenance, not a
  citation: it is exempt from the rule above, and it stays true after the run is deleted. The detail —
  which sections went where — goes to `.control/memlog/ux.md`. A `DEC-` MAY still cite the run.
- `ux-landed` checks both, **per run**: once components exist, every active run document MUST be named
  in some landed document's `landed_from`, and nothing in `.what/` or `.how/` outside `landed_from` MAY
  cite the run.
