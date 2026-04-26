# Projectflow frontend visual polish batch 1 work order v2 — 2026-04-26

Status: active
Role: batch-1 execution brief (dark-premium direction)
Depends on:
- `projectflow-frontend-visual-polish-execution-principles-v2-2026-04-26.md`

Supersedes:
- `projectflow-frontend-visual-polish-batch1-work-order-v1-2026-04-26.md`

---

## 1. Goal

Batch 1 v2 upgrades Batch 1 from a conservative polish pass into a stronger dark-premium visual pass.

This batch still:
- does not redesign Projectflow
- does not alter copy
- does not alter interaction
- does not alter business logic

But it now aims for a stronger result:
- more atmospheric
- more premium
- more stylized
- more clearly aligned with the user's preferred reference direction

---

## 2. Hard execution boundary

All previous hard constraints remain active:
- no UI copy changes
- no interaction changes
- no function-layer changes
- no business logic changes
- no approved-structure changes
- fully reversible commits only
- zero behavior drift

Additional v2 rule:
- stronger style is allowed
- structural redesign is still not allowed

---

## 3. Batch 1 visual mission under v2

Batch 1 must now prove all of the following at the same time:

1. Projectflow can look significantly more premium and more visually authored
2. the app can sustain a dark-premium identity without hurting dense workflow readability
3. benchmark pages can feel much closer to the approved reference mood
4. this can all happen with zero functional drift

---

## 4. Batch 1 target pages (unchanged, but stronger target quality)

### Priority 1 — Project Detail
Now acts as:
- the primary benchmark for the v2 dark-premium style
- the first page that must visibly move closer to the user's preferred design direction

Target areas:
- stronger shell-to-card contrast
- stronger top summary sophistication
- richer visual separation between upper summary, requirements, and execution areas
- more premium control styling
- better spacing rhythm inside dense operational sections

### Priority 2 — Quote-Cost Detail
Target under v2:
- make dense financial data feel premium, not sterile
- improve hierarchy of totals, summary zones, and tables
- prove that dark-premium language can survive heavy business data

### Priority 3 — Closeout Detail
Target under v2:
- make archive/retained/financial summary surfaces feel more premium and deliberate
- improve density handling without losing trust or clarity

### Priority 4 — Projects List / landing surfaces
Target under v2:
- absorb more of the first-impression beauty from the preferred reference
- create a stronger emotional first read of the product

---

## 5. Updated Batch 1 design targets

### 5.1 Shell identity
Strengthen:
- dark background authority
- layered page framing
- subtle premium glow logic
- stronger app-shell sophistication

### 5.2 Card identity
Strengthen:
- card material quality
- border/shadow sophistication
- sub-surface layering inside major operational pages
- premium contrast against the shell

### 5.3 Accent identity
Strengthen:
- blue active state language
- premium primary buttons
- clearer selected/current states
- subtle but present brand-energy feel

### 5.4 Readability discipline
Preserve:
- dense business clarity
- table scan speed
- form usability
- section comprehension

If v2 styling hurts operational readability, reduce intensity rather than redesigning the structure.

---

## 6. Explicitly out of scope for Batch 1 v2

Still out of scope:
- copy rewrites
- interaction rewrites
- feature behavior changes
- page architecture changes
- business-logic cleanup piggyback

Also out of scope:
- pure concept-art styling with no data practicality
- decorative effects that make the page less trustworthy or less readable

---

## 7. Updated page-by-page execution checklist

### 7.1 Project Detail checklist (v2)
- increase premium shell contrast
- elevate card material richness
- improve top header authority and polish
- make summary cards feel more luxurious
- improve operational section grouping through visual layering
- increase premium quality of controls and chips
- keep every existing interaction identical

### 7.2 Quote-Cost Detail checklist (v2)
- make summary/totals blocks feel stronger and more premium
- improve dark-light contrast handling
- improve table shell sophistication
- improve financial hierarchy without adding noise
- preserve exact financial behavior

### 7.3 Closeout Detail checklist (v2)
- improve retained/archive block prestige and structure
- improve density rhythm
- improve status/value emphasis
- maintain trust and readability in financial archive reading

### 7.4 Projects List checklist (v2)
- improve shell presence
- improve list/table clarity
- increase first-impression quality
- maintain efficient operational scanning

---

## 8. Updated acceptance criteria for Batch 1 v2

Batch 1 v2 is acceptable only if:

1. all target pages visibly move closer to the approved premium-dark direction
2. all target pages preserve the exact same functional behavior
3. all target pages preserve the exact same UI copy
4. all target pages preserve the same interaction patterns
5. readability remains equal or better
6. the app feels more authored and more product-grade, not just "cleaner"
7. changes are split into reversible commit batches
8. no hidden function-layer drift appears during regression verification

---

## 9. Recommended implementation order under v2

### Order A — stronger benchmark-first strategy
1. continue global primitives toward the v2 dark-premium target
2. push **Project Detail** harder as the first true benchmark page
3. use Project Detail to calibrate intensity
4. extend that calibrated system to Quote-Cost Detail and Closeout Detail
5. then project the style onto Projects List / landing pages

### Order B — commit discipline still mandatory
Use small, legible batches such as:
- batch 1A: upgraded global dark-premium primitives
- batch 1B: Project Detail benchmark pass
- batch 1C: Quote-Cost Detail benchmark pass
- batch 1D: Closeout Detail benchmark pass
- batch 1E: Projects List polish

Do not collapse the entire effort into one large commit.

---

## 10. Final instruction

> Batch 1 v2 must prove that Projectflow can adopt the user's preferred premium-dark visual language without sacrificing trust, readability, or workflow clarity. If a change only looks impressive but weakens business usability, it is not acceptable.
