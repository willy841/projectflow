# Projectflow Project Detail visual reconstruction blueprint — 2026-04-26

Status: draft for approval
Scope: `Project Detail` page only
Mode: visual-only reconstruction blueprint
Depends on:
- `MD165-projectflow-frontend-polish-dark-theme-attempt-handoff-2026-04-26.md`
- `projectflow-frontend-visual-polish-execution-principles-v2-2026-04-26.md`
- `projectflow-frontend-visual-polish-batch1-work-order-v2-2026-04-26.md`
- `projectflow-frontend-visual-polish-batch1a-global-primitives-implementation-list-v2-2026-04-26.md`

---

## 1. Purpose

This document defines the **single-page visual reconstruction blueprint** for `Project Detail` after rollback to the pre-polish stable baseline.

This is **not** a patch plan.
This is **not** a dark-mode cleanup list.
This is a controlled blueprint for rebuilding the page's visual language from the shell inward.

The goal is:
- to rebuild `Project Detail` as the first true benchmark page
- to create a coherent dark-premium SaaS visual system
- to preserve all accepted product structure, copy, interaction, and logic
- to avoid repeating the failed patch-by-patch darkening route

---

## 2. Non-negotiable constraints

The following remain locked:

1. no copy changes
2. no feature changes
3. no interaction changes
4. no workflow/state changes
5. no structure rewrites of accepted information architecture
6. no hidden logic cleanup piggyback
7. all reconstruction must remain revertible

Practical rule:
- the page may look dramatically different in material/layer/light/contrast
- but the user should still find the same page, same sections, same buttons, same meanings, same actions

---

## 3. Core diagnosis of the baseline page

After rollback, the baseline `Project Detail` page currently consists of:

1. **page shell / outer canvas**
   - inherited from auth shell and app shell
   - currently light, safe, and operational
   - lacks atmosphere and premium framing

2. **hero header block**
   - project title + action buttons
   - structurally correct
   - visually too flat and too similar to ordinary cards

3. **summary KPI strip**
   - event date / location / load-in / budget / cost
   - structurally useful
   - currently reads as repeated generic cards, not a premium summary zone

4. **information split section**
   - basic info card
   - requirements panel card
   - structurally sound
   - currently lacks hierarchy between major and secondary content surfaces

5. **execution section**
   - execution tree card
   - category summary / task-view card
   - most information-dense zone
   - currently functionally important but visually under-articulated

The page is not broken.
The problem is that all blocks are using nearly the same material language.
Therefore the page has:
- weak hierarchy
- weak focus guidance
- weak shell-to-card drama
- weak premium feel
- weak section rhythm

---

## 4. Reconstruction thesis

The page should be rebuilt around this thesis:

> `Project Detail` should feel like a premium command workspace placed inside a deep dark product shell, where the main operational surfaces are intentionally lit and tiered rather than uniformly rendered.

This means the new version should not be “everything dark”.
It should be:
- dark outer world
- controlled bright/dim surface hierarchy
- clear distinction between hero / primary / secondary / muted zones
- strong section rhythm
- disciplined blue energy accents

---

## 5. Single-page visual system

### 5.1 Layer model

The page should use four explicit visual layers:

#### Layer 0 — shell atmosphere
Purpose:
- define the dark-premium world around the page

Characteristics:
- deep charcoal/navy base
- subtle ambient blue light
- slightly cinematic but restrained
- no noisy gradient art

This layer should live mainly in:
- app shell background
- content canvas backdrop

#### Layer 1 — page frame
Purpose:
- separate this page from the raw shell
- create a composed canvas feeling

Characteristics:
- dark but slightly lifted from shell
- low-contrast framed container feel
- soft inner border / subtle depth

This is not a white card.
This is the page stage.

#### Layer 2 — primary surfaces
Purpose:
- host the page’s most important information and actions

Characteristics:
- brighter than shell/page frame
- premium but restrained surface material
- strongest clarity and readability
- used for hero card and major operational blocks

#### Layer 3 — secondary / muted surfaces
Purpose:
- support nested information without flattening the page

Characteristics:
- either slightly dimmed dark sub-surface or carefully muted light-on-dark panel
- clear separation from primary surfaces
- no accidental sameness with parent card

---

## 6. Material hierarchy for Project Detail

This page must stop using one-card-fits-all styling.
It should use a clear three-tier material system.

### Tier A — hero / primary card
Use on:
- top page header block
- execution main container if needed

Feel:
- most authored
- most premium
- strongest depth and polish
- visually announces this page as a benchmark page

Allowed characteristics:
- larger radius
- stronger border definition
- controlled shadow depth
- subtle internal highlight
- slightly richer tint response than other cards

### Tier B — major operational card
Use on:
- basic info card
- requirements panel
- execution category section
- execution summary container

Feel:
- stable
- trustworthy
- highly readable
- clearly subordinate to hero, but still premium

Allowed characteristics:
- strong surface clarity
- softer border/shadow than Tier A
- consistent internal spacing grid

### Tier C — weak / nested card
Use on:
- KPI cells
- inner info tiles
- form blocks
- muted grouping blocks inside execution summary or requirements

Feel:
- supportive
- quieter
- clearly nested
- never visually fighting Tier A/B

Allowed characteristics:
- lower contrast than parent major card
- lighter border rhythm
- soft fill differentiation

---

## 7. Page-by-page zone blueprint

## 7.1 Zone A — shell and page background

Current state:
- competent but generic light workspace shell

Reconstruction goal:
- transform `Project Detail` into a page that sits inside a premium dark environment
- make the shell feel intentional before any card is examined

Required outcome:
- outer shell darker than current baseline
- page content area receives its own framed stage
- subtle ambient blue energy exists but stays controlled
- no cheap “gaming dashboard” glow

Visual intention:
- first impression should already feel more premium before the user reads any data

---

## 7.2 Zone B — hero header block

Current structure:
- project title on left
- action buttons on right

Structure remains unchanged.

Reconstruction goal:
- make this read like the page’s command header rather than just another card

Required outcome:
- title gains stronger visual authority
- action cluster feels premium but disciplined
- hero surface should carry the page’s clearest authored identity

Material direction:
- Tier A surface
- stronger contrast against page frame
- buttons should feel embedded in a premium system, not floating utility elements

Do not do:
- do not add new badges or helper copy
- do not reorder actions
- do not add decorative gimmicks that compete with title readability

---

## 7.3 Zone C — KPI summary strip

Current structure:
- five repeated metric cards

Structure remains unchanged.

Reconstruction goal:
- turn the strip into a clear, premium summary band
- avoid generic repeated white-card feeling

Required outcome:
- KPI cells feel related as one system
- hierarchy between label and value becomes sharper
- values should carry more confidence and visual focus
- strip should help bridge hero block and body sections

Material direction:
- Tier C nested surfaces, but highly polished
- treat as coordinated modules under a shared visual rhythm
- labels quieter, values stronger, spacing more deliberate

Do not do:
- do not invent icons
- do not add new metrics
- do not convert into dashboard gimmicks

---

## 7.4 Zone D — basic info + requirements split section

Current structure:
- left: project basic info
- right: requirements communication

Structure remains unchanged.

Reconstruction goal:
- preserve the split, but create clearer hierarchy between main card, inner cells, and actions

### Basic info card
Required outcome:
- card reads as a major operational surface, not a plain form-like block
- inner info cells have more elegant nesting
- section title and card body have stronger breathing rhythm

Material direction:
- Tier B outer card
- Tier C inner information cells

### Requirements panel
Required outcome:
- content list feels intentional and editorial, not just utility boxes
- create/textarea/action area should feel like one coherent subsystem
- record cards should have better rhythm and quieter repetition

Material direction:
- Tier B outer card
- Tier C create panel and item rows, with careful contrast discipline

Do not do:
- do not alter textarea behavior
- do not alter create/edit/delete logic
- do not restack the two-column relationship

---

## 7.5 Zone E — execution main section

This is the most critical benchmark zone.

Current structure:
- execution tree card
- category view / summary card

Structure remains unchanged.

Reconstruction goal:
- make this zone feel like a serious command workspace
- increase hierarchy between top-level execution editing, category toggles, and task summary reading
- remove flatness without sacrificing density handling

### Execution tree card
Required outcome:
- execution area should feel like the main work surface of the page
- better containment of dense controls and task rows
- visual grouping should reduce fatigue without changing flow

Material direction:
- Tier A or strong Tier B depending on overall intensity calibration
- nested sub-blocks should clearly step down to Tier C

### Category cards
Required outcome:
- three category blocks should feel like deliberate mode selectors
- active state should gain premium confidence
- inactive state should remain quiet but not dead

Material direction:
- B-to-C hybrid behavior
- active uses controlled accent/ring/light
- not neon, not toy-like

### Summary/task-view container
Required outcome:
- current category title, count, feedback, and task rows should feel like a cohesive panel
- easier scan rhythm
- clearer visual ownership between header and list body

Material direction:
- Tier B outer panel
- Tier C row items and feedback blocks

Do not do:
- do not redesign execution flow
- do not alter task routing semantics
- do not change the category model

---

## 8. Color and light discipline

### 8.1 Color roles

Use a disciplined dark-premium palette logic:

- **shell base**: deep navy-charcoal
- **page frame**: lifted dark slate/navy
- **primary surface**: premium readable surface with strong contrast
- **secondary surface**: muted but visible nested layer
- **accent**: blue reserved for active/selected/focus/primary intent
- **success/warning/danger**: semantic colors calmer and more mature than default utility tones

### 8.2 Light logic

Use light as hierarchy, not decoration.

Allowed:
- soft inner highlights
- restrained edge glow on active/important surfaces
- faint shell ambient lighting

Not allowed:
- random glows on every card
- heavy blur fog
- over-illustrated gradients
- neon dashboard energy

---

## 9. Typography and rhythm rules

### 9.1 Typography

Required shifts:
- stronger distinction between page title, section title, label, body value, helper text
- values and decision data should feel firmer
- muted text should be intentionally muted, not washed out

### 9.2 Spacing rhythm

Required shifts:
- major sections should feel intentionally separated
- internal spacing should create calm density, not empty luxury
- repeated cards must align to a shared rhythm system

### 9.3 Border and radius rhythm

Required shifts:
- unify card family language
- hero radius may be slightly more premium than nested blocks
- nested rows/cells should feel related without becoming visually flat

---

## 10. What must not happen again

This blueprint explicitly rejects the following failed patterns:

1. darkening random white areas one by one
2. mixing shell changes and page changes without hierarchy
3. making every card equally dark or equally bright
4. applying premium effects without clarifying information rank
5. shipping a version that is only “dark mode” and calling it premium

---

## 11. Recommended implementation sequence

### Phase 1 — shell and frame
- establish dark shell atmosphere
- establish page frame / stage separation
- do not yet over-style inner cards

### Phase 2 — hero + KPI summary
- reconstruct hero authority
- reconstruct KPI strip rhythm and material hierarchy

### Phase 3 — body split section
- basic info card
- requirements panel
- nested cell/list treatment

### Phase 4 — execution benchmark zone
- execution tree surface hierarchy
- category selector surfaces
- summary panel rhythm

### Phase 5 — intensity calibration pass
- reduce anything that feels too decorative
- correct any readability loss
- ensure the page reads as premium product, not concept art

---

## 12. Acceptance criteria for the blueprint

The `Project Detail` reconstruction is successful only if:

1. it no longer reads as baseline white enterprise UI with dark paint
2. it no longer reads as partial dark-mode patchwork
3. the page has explicit hero / major / nested surface hierarchy
4. shell, page frame, and cards feel like one coherent visual system
5. dense operational reading remains trustworthy
6. no copy, interaction, structure, or function drift is introduced
7. the page clearly feels closer to the approved high-end SaaS reference direction

---

## 13. Management conclusion

The correct next move is **not** to resume patching from the failed dark attempt.
The correct next move is:

> rebuild `Project Detail` from the stable baseline as a single benchmark canvas, using a strict shell → frame → hero → major card → nested surface hierarchy.

If approved, implementation should now proceed against this blueprint in small visual-only batches.