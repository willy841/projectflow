# Projectflow frontend visual polish batch 1 work order v1 — 2026-04-26

Status: active
Role: batch-1 execution brief
Depends on:
- `projectflow-frontend-visual-polish-execution-principles-v1-2026-04-26.md`

---

## 1. Goal

This document turns the visual-polish principles into a concrete first work order.

Batch 1 does **not** redesign Projectflow.
Batch 1 does **not** alter copy, interaction, or business logic.
Batch 1 focuses on the highest-value visual surfaces and the core visual system needed to make the application feel more product-grade.

---

## 2. Hard execution boundary

Batch 1 must follow all existing hard constraints, especially:
- no UI copy changes
- no interaction changes
- no function-layer changes
- no business logic changes
- no approved-structure changes
- fully reversible commits only
- zero behavior drift

Additional batch rule:
- if a proposed change needs product discussion, it is **out of scope** for Batch 1
- Batch 1 is execution, not redesign

---

## 3. Batch 1 target pages

### Priority 1 — Project Detail
Reason:
- this is the most important benchmark page
- it carries the strongest current engineer-like feel
- it includes dense workflow content and therefore tests whether the visual system remains usable

Target areas:
- overall page background / section contrast
- task summary block hierarchy
- execution tree section card quality
- requirements panel visual grouping
- task-view area spacing and readability
- button hierarchy and badge consistency
- visual separation between upper summary and lower operational areas

### Priority 2 — Quote-Cost Detail
Reason:
- validates readability under dense financial information
- tests table / card / totals hierarchy quality

Target areas:
- page background / section contrast
- summary cards / totals emphasis
- table density and row rhythm
- form-control consistency
- badge / status treatment
- primary vs secondary info emphasis

### Priority 3 — Closeout Detail
Reason:
- similar density challenge to quote-cost
- strong candidate for polishing snapshot / financial / archive reading comfort

Target areas:
- section grouping
- retained summary readability
- table / archive block readability
- status hierarchy
- spacing and card rhythm

### Priority 4 — Projects List / main landing surfaces
Reason:
- high visual leverage
- easiest place to establish stronger first impression

Target areas:
- list card / table visual polish
- filter / search control consistency
- empty/loading/normal state consistency
- more polished page shell

---

## 4. Batch 1 global component scope

These should be treated as the shared design system layer for Batch 1.

### 4.1 Background system
Implement:
- a unified page background system
- subtle distinction between app shell background and white content surfaces
- premium but restrained dark/neutral layering if applied

Deliverable:
- pages no longer look like raw white engineering surfaces with inconsistent container contrast

### 4.2 Card system
Implement:
- unified radius rule
- unified shadow rule
- unified border treatment if needed
- unified padding tiers
- consistent header/body/footer spacing

Deliverable:
- major cards across Batch 1 pages feel like one product system

### 4.3 Button system
Implement:
- clearer primary / secondary / destructive hierarchy
- more premium surface styling
- consistent sizes and radius
- stronger hover / focus clarity

Deliverable:
- button hierarchy looks intentional and consistent

### 4.4 Badge / status system
Implement:
- unified badge radius / size / spacing
- softer but clearer semantic colors
- consistent contrast

Deliverable:
- status chips feel product-grade, not ad hoc

### 4.5 Form-control system
Implement:
- consistent input/select/textarea styling
- consistent border and focus ring
- consistent spacing between label / field / help text

Deliverable:
- dense forms look organized and deliberate

### 4.6 Table system
Implement:
- consistent row spacing
- border rhythm
- hover state clarity
- clearer header/body distinction

Deliverable:
- tables remain dense but become easier to scan

### 4.7 Typography hierarchy
Implement:
- clearer scale for page titles / section titles / values / notes
- stronger distinction between primary and secondary information
- better number emphasis where totals matter

Deliverable:
- the app feels more structured and easier to read

---

## 5. Explicitly out of scope for Batch 1

Do not do any of the following in Batch 1:

### 5.1 Product/structure changes
- no information architecture redesign
- no moving page blocks around
- no merging or splitting workflow sections
- no new navigation patterns

### 5.2 Interaction changes
- no different expand/collapse behavior
- no drawer/modal workflow changes
- no changes to confirmation/dispatch/closeout flows

### 5.3 Functional changes
- no API logic changes
- no DB logic changes
- no state transition changes
- no route behavior changes
- no bug-fix piggyback unless separately approved and isolated

### 5.4 Over-stylization
- no heavy dribbble-style glow overload
- no strong glassmorphism everywhere
- no readability-sacrificing visual effects

---

## 6. Page-by-page execution checklist

### 6.1 Project Detail checklist
- improve shell background layering
- unify section card styles
- improve top summary visual hierarchy
- improve task summary readability
- improve spacing between execution area and lower operational area
- improve button and badge consistency
- preserve every existing interaction and copy string

### 6.2 Quote-Cost Detail checklist
- improve totals hierarchy
- improve section grouping
- improve table scan rhythm
- improve status readability
- unify inputs and action controls
- preserve all financial read/write behaviors

### 6.3 Closeout Detail checklist
- improve closeout summary grouping
- improve retained/archive readability
- improve dense data block spacing
- unify badges and value emphasis
- preserve archive and retained behaviors

### 6.4 Projects List checklist
- improve listing shell
- improve table/list readability
- unify filter controls
- improve card/list spacing and hover clarity
- preserve routing and filtering behavior

---

## 7. Acceptance criteria for Batch 1

Batch 1 is acceptable only if:

1. all target pages show clearly improved visual quality
2. all target pages preserve the exact same functional behavior
3. all target pages preserve the exact same UI copy
4. all target pages preserve the same interaction patterns
5. readability is improved or at minimum not reduced
6. global component consistency is visibly stronger
7. changes are split into reversible commit batches
8. no hidden function-layer drift appears during regression verification

---

## 8. Recommended implementation order

### Order A — system first
1. establish background / card / button / badge / form / table / typography tokens and shared classes
2. apply them first to Project Detail
3. tune until Project Detail becomes benchmark-quality
4. extend to Quote-Cost Detail and Closeout Detail
5. finally extend to Projects List

### Order B — commit discipline
Use small, legible batches such as:
- batch 1A: global card/background/button primitives
- batch 1B: Project Detail visual polish
- batch 1C: Quote-Cost Detail visual polish
- batch 1D: Closeout Detail visual polish
- batch 1E: Projects List polish

Do not collapse the entire effort into one large commit.

---

## 9. Final instruction

> Batch 1 must prove that Projectflow can look significantly more premium **without touching copy, interaction, structure, or business behavior**. If a change cannot satisfy that rule, it does not belong in Batch 1.
