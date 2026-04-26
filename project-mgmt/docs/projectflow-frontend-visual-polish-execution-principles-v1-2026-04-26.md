# Projectflow frontend visual polish execution principles v1 — 2026-04-26

Status: active
Role: visual-polish execution spec
Scope: frontend visual refinement only

---

## 1. Goal

This spec defines how to upgrade Projectflow's frontend from an engineer-looking interface into a more polished product-looking interface **without breaking approved product structure**.

This is not a feature-redesign spec.
This is not a UX-flow rewrite spec.
This is not a content rewrite spec.

It is a **visual polish execution spec**.

---

## 2. Hard constraints (must not change)

The following are locked and must not be changed during this visual-polish phase:

1. **UI copy / 文案不可更動**
2. **Expand / collapse / interaction flow 不可更動**
3. **All functional behavior 不可更動**
4. **Approved information structure should remain as-is unless explicitly approved later**
5. **For already accepted Projectflow UI, do not alter structure just to make it prettier**
6. **No function-layer change is allowed**
7. **All visual-polish changes must remain fully reversible back to the current stable version**
8. **No behavior drift is allowed after polish**

Practical meaning:
- do not rename labels
- do not reorder workflow logic
- do not introduce new buttons unless separately approved
- do not remove existing controls
- do not redesign page-level interaction models
- do not modify API behavior, DB behavior, domain logic, submission logic, routing logic, or state-transition logic
- do not mix visual polish with bug-fix or feature work in the same change batch

---

## 3. Design direction confirmed from current references

The preferred direction is:
- more modern
- more premium
- more layered
- less raw-engineer dashboard feeling
- but still suitable for a dense business workflow system

The approved inspiration direction is:
- dark / deep neutral base
- subtle blue accent energy
- stronger card material quality
- cleaner spacing
- clearer information hierarchy
- more refined component consistency

Important translation rule:
- use the reference as a **mood / texture / material direction**
- do **not** copy it 1:1 as a dribbble-style concept UI

Projectflow is a high-information-density workflow system.
So the target is:

> **product-grade visual refinement, not decorative concept-art styling**

---

## 4. What can change

### 4.1 Global visual system
Allowed:
- background color system
- card background / border / shadow system
- corner radius system
- spacing / padding system
- typography scale / weight hierarchy
- icon style consistency
- button / badge / form-control visual styling
- table visual styling
- hover / focus / selected / active visual states

### 4.2 Page-level visual polishing
Allowed:
- improving separation between sections
- improving visual grouping
- improving alignment and whitespace
- improving readability of dense information blocks
- improving emphasis of primary vs secondary information

### 4.3 Material / atmosphere
Allowed in restrained form:
- subtle dark-theme foundation
- very light blur on fixed topbar if readability remains strong
- soft blue accent glow in limited contexts
- premium shadow / depth cues
- elevated active state in sidebar / navigation

---

## 5. What should not change in this phase

### 5.1 Structural changes
Do not:
- redesign page architecture
- move workflow sections around
- change card order
- change layout logic of approved pages
- replace complex information blocks with simplified fake-dashboard cards

### 5.2 Interaction changes
Do not:
- change how drawers open
- change how details expand
- change how forms are submitted
- change dispatch / confirm / closeout / reopen interaction patterns
- hide existing controls for visual simplification

### 5.3 Decorative excess
Do not:
- overuse heavy glassmorphism
- overuse bright neon glows
- overuse strong gradients
- reduce contrast for aesthetic effect
- sacrifice data readability for visual drama

---

## 6. Translation rules from the approved visual reference

### 6.1 Elements we should absorb
Absorb:
- deeper background layering
- stronger card quality
- more refined rounded surfaces
- cleaner spacing
- more modern icon treatment
- clearer state highlights
- premium but restrained accent color usage

### 6.2 Elements we should reduce
Reduce:
- glow intensity
- blur intensity
- floating-panel exaggeration
- oversized decorative emptiness
- concept-art style lighting that hurts readability

### 6.3 Product translation principle
For any inspired style element, apply this rule:

> if it improves quality **without harming readability or workflow clarity**, it can stay.
> if it makes the page prettier but harder to use, reject it.

---

## 7. Priority pages for visual polish

The first batch should focus on the highest-value, highest-visibility pages.

### Batch 1 — core visual anchor pages
1. **Project Detail**
   - highest importance
   - most representative of current engineer-like feel
   - should become the main visual benchmark page

2. **Quote-Cost Detail / Closeout Detail**
   - high information density
   - critical test for whether the new style still supports readability

3. **Projects List / dashboard-like landing surfaces**
   - easiest place to absorb some of the premium reference language
   - useful for giving the system a stronger first impression

### Batch 2 — workflow document and assignment pages
4. Design document / procurement document / vendor-related detail surfaces
5. Vendor detail pages
6. Supporting list pages

---

## 8. Component-level execution rules

### 8.1 Cards
- move toward larger radius (`rounded-xl` to `rounded-2xl` depending on density)
- use restrained premium shadow
- preserve clear edge definition
- increase internal padding where current density feels cramped
- ensure consistent title/body/footer spacing

### 8.2 Buttons
- keep current hierarchy and behavior
- improve visual distinction between primary / secondary / destructive / neutral
- allow restrained gradient or richer surface only for primary actions
- do not introduce decorative button styles that make state meaning ambiguous

### 8.3 Badges / statuses
- preserve current semantics
- move to softer but clearer product-grade status colors
- ensure text contrast remains strong
- use consistent size, padding, and radius rules

### 8.4 Inputs / form controls
- unify border, fill, focus-ring, radius, and spacing behavior
- improve readability of dense forms
- do not alter field grouping logic unless explicitly approved

### 8.5 Tables
- improve row spacing and border rhythm
- improve hover and selected state clarity
- preserve dense-read utility
- do not over-soften to the point that tabular scanning becomes harder

### 8.6 Sidebar / topbar
- improve active-state clarity
- allow subtle premium material treatment
- do not change navigation behavior
- do not collapse or restructure information hierarchy in this phase

---

## 9. Readability-first rule for dense business pages

Projectflow is not a marketing page.
Many pages are workflow-heavy and data-dense.

Therefore:
- readability outranks visual novelty
- information grouping outranks decorative styling
- state clarity outranks artistic lighting
- operational confidence outranks aesthetic experimentation

If a proposed visual change creates uncertainty in business workflow reading, reject it.

---

## 10. Acceptance rule for this visual-polish phase

A visual-polish change is acceptable only if all are true:

1. no UI copy changed
2. no interaction behavior changed
3. no business function changed
4. approved structure remains intact
5. readability is equal or better
6. visual quality is clearly improved
7. no regression is introduced into accepted mainline pages
8. the change is cleanly reversible back to the current stable baseline
9. the change introduces zero function-layer drift

---

## 11. Recommended execution workflow

### Step 0 — preserve stable rollback baseline
Before any polish batch starts:
- treat the current version as the stable rollback baseline
- ensure all subsequent polish work is layered on top of this baseline
- keep each polish batch independently revertible
- never bury many unrelated visual changes inside one opaque commit

### Step 1 — define the visual foundation
First implement:
- page background system
- card system
- button system
- badge system
- form-control system
- table styling system
- typography hierarchy system

### Step 2 — build one benchmark page
First target:
- **Project Detail**

This page should become the visual benchmark for the whole system.

### Step 3 — extend to dense pages
Apply the same system to:
- quote-cost detail
- closeout detail

### Step 4 — extend to supporting pages
Only after the benchmark pages are stable:
- list pages
- vendor pages
- document views

### Step 5 — enforce visual-only batching
For every batch:
- isolate visual polish from feature work
- isolate visual polish from bug-fix work where possible
- verify no interaction drift
- verify rollback remains clean

---

## 12. Final principle

> Projectflow frontend polish should be executed as **structure-preserving visual refinement**: elevate depth, spacing, hierarchy, and component quality while keeping all approved copy, interaction behavior, and business functionality intact.
