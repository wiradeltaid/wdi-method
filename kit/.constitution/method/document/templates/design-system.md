---
type: design-system
scope: _platform
landed_from: []          # the run file(s) in _bmad-output/ux/ this landed from — provenance, kept after the run is gone
status: draft            # draft · reviewed · locked · superseded
created: '{YYYY-MM-DD}'
---

# Design System — {product}

<!-- TEMPLATE GUIDE — act on these comments, then delete them.

     Home: .how/_platform/design-system.md. Written by wdi-ux, and it is the ONE file in _platform/
     that wdi-blueprint does not own. Optional, like the rest of UX: it exists when the interface is
     a substantial part of what the PRD promises.

     WHY IT IS NOT IN A COMPONENT: tokens and base elements cross Product Components by definition. A
     colour scale living in one component's 01-ux/ is a colour scale the other six will each redefine.

     WHY ux.md DOES NOT SERVE IT: ux.md is the shape of DESIGN.md and EXPERIENCE.md, which are per
     component. This is the product-level DESIGN — tokens, base elements, and every build pattern
     that holds for all components.

     WHAT DOES NOT BELONG HERE: a promise. Information architecture, voice and tone, the flow map,
     journeys that cross components, and shared edge cases are still true after a redesign, so they
     are experience and live in .what/experience.md (templates/experience.md). A section that holds
     both is split at the sentence — ux-guide.md § Product level.

     THE CODE IS THE SSOT FOR VALUES. Where this repo's web side states a token in tokens.css, this
     file MUST reference it rather than repeat the value. Two homes for one hex code is two hex codes
     within a month. Read web/README.md before writing anything here — it is the authority for the
     web side, and it MUST NOT be contradicted from this file.

     Token and element NAMES are English: they are machine-facing keys, per language-guide.md. -->

## Where the values actually live

<!-- One line per source of truth — the stylesheet, the config, the generated file — with its path.
     This section is what stops the rest of the document becoming a stale copy. -->

## Tokens

<!-- One table per scale. Name, what it is for, and where it resolves. NOT the raw value, unless this
     file is genuinely the only place it exists. -->

| Token | For | Resolves in |
| --- | --- | --- |

## Base elements

<!-- The LC type `ui-element`, registered in components.yaml. One row each: what it is, its states,
     and where its implementation lives. A composite reused across screens is `ui-composite` and
     belongs in .how/<pc>/01-ux/ of the component that holds its implementation, not here — unless
     nearly every component uses it, and then it is a base element. -->

| Element | States it MUST support | Implementation |
| --- | --- | --- |

<!-- Every element MUST state its empty, loading, error, and disabled states where they apply. The
     populated state is the one that always gets designed; the others are the ones that ship broken. -->

## State patterns

<!-- How empty, loading, error, offline, and disabled are BUILT everywhere. The promise a state keeps
     is in .what/experience.md; this section is how it is met. -->

| State | Built as | Used by |
| --- | --- | --- |

## Interaction primitives

<!-- Gestures, feedback, confirmation, undo — the few moves every screen shares. -->

## Accessibility — how it is met

<!-- The standard met is a promise and lives in .what/experience.md. Here: contrast pairs, target
     sizes, focus order, motion — each resolving to a token or an element above. -->

## Surfaces that are not screens

<!-- Notifications, widgets, share sheets: how each looks and is built. What the user is told, and
     when, is in .what/experience.md. -->

## Rules that bind every screen

<!-- Only what a screen cannot legitimately override. Each MUST state what it prevents — a rule with
     no failure behind it is a preference, and preferences go to ../../../project/codebase-conventions-guide.md.

     A rule here that also holds for non-UI code is an AD-N and belongs in the spine instead. -->

| Rule | Prevents |
| --- | --- |

## What this system deliberately does not cover

<!-- Where a component is free to choose for itself. Absent, every local choice reads as a violation. -->
