# Projectflow frontend visual polish batch 1A global primitives implementation list v2 — 2026-04-26

Status: active
Role: implementation checklist (dark-premium direction)
Depends on:
- `projectflow-frontend-visual-polish-execution-principles-v2-2026-04-26.md`
- `projectflow-frontend-visual-polish-batch1-work-order-v2-2026-04-26.md`

Supersedes:
- `projectflow-frontend-visual-polish-batch1a-global-primitives-implementation-list-v1-2026-04-26.md`

---

## 1. Goal

Batch 1A v2 upgrades the primitive layer so the whole application can support the stronger dark-premium direction.

This is not page redesign.
This is the shared material-language upgrade needed before deeper page benchmark work continues.

---

## 2. Hard rule reminder

Batch 1A v2 remains visual-only.
Do not modify:
- functional logic
- API behavior
- DB behavior
- copy
- interaction patterns
- routing
- expand/collapse logic
- page structure

All changes must remain fully reversible.

---

## 3. Implementation scope under v2

### 3.1 Background primitives
Upgrade toward:
- stronger dark shell identity
- more intentional shell-to-surface layering
- restrained but visible ambient color/glow logic
- more atmospheric page framing

Desired outcome:
- the application feels intentionally premium before page-level detail is even considered

### 3.2 Card primitives
Upgrade toward:
- more luxurious major-card treatment
- stronger premium edge/shadow rhythm
- clearer distinction between major cards, inner cards, and muted sub-blocks
- richer white-on-dark contrast

Desired outcome:
- white operational surfaces feel intentionally placed inside the dark shell, not dropped there accidentally

### 3.3 Button primitives
Upgrade toward:
- stronger premium primary-button treatment
- more deliberate secondary/destructive visual hierarchy
- more refined hover/focus transitions
- slightly more authored button presence

Desired outcome:
- actions feel premium and deliberate, not generic utility buttons

### 3.4 Badge / status primitives
Upgrade toward:
- richer chip feel
- calmer but more premium semantic color logic
- more visually intentional active/current-state chips

Desired outcome:
- statuses feel part of a luxury business product rather than ad hoc labels

### 3.5 Form-control primitives
Upgrade toward:
- more premium field surfaces
- clearer focus states
- improved dense-form readability
- stronger visual consistency between input/select/textarea groups

Desired outcome:
- forms feel modern and trustworthy under the dark-premium shell

### 3.6 Table primitives
Upgrade toward:
- more premium table shells
- more deliberate row rhythm
- better visual ownership of header/summary states
- high readability preserved inside richer styling

Desired outcome:
- workflow and financial tables still scan quickly, but feel much more finished

### 3.7 Typography primitives
Upgrade toward:
- stronger title/value contrast
- more expressive primary information tone
- cleaner muted-text strategy
- more premium weight/size rhythm

Desired outcome:
- information hierarchy becomes visibly more authored and closer to the approved visual reference tone

### 3.8 Navigation shell primitives
Upgrade toward:
- more premium sidebar presence
- stronger active-state highlight
- more atmospheric shell feel
- more confident navigation framing

Desired outcome:
- navigation feels like a product frame, not just a menu block

---

## 4. Calibration rule

Under v2, primitives may push stronger style than v1.
But every primitive must pass this question:

> does this make Projectflow feel more premium **without reducing operational trust or readability**?

If no, reduce the primitive intensity.

---

## 5. Batch 1A v2 acceptance checklist

Batch 1A v2 is complete only if:

1. the shared primitive layer clearly reflects the dark-premium direction
2. cards/buttons/badges/forms/tables/typography feel more unified and more authored
3. the shell identity feels stronger than v1
4. no function-layer changes were introduced
5. no UI copy changed
6. no interaction behavior changed
7. the current stable baseline remains cleanly revertible
8. the primitive layer is good enough to support Project Detail as a true v2 benchmark page

---

## 6. Commit strategy

Recommended v2 split:

### 1A-v2-1
- shell/background atmospheric upgrade

### 1A-v2-2
- card/material refinement

### 1A-v2-3
- stronger button/badge language

### 1A-v2-4
- form/table surface refinement

### 1A-v2-5
- typography/nav-shell finish

Keep every batch:
- small
- legible
- revertible
- visual-only

---

## 7. Final rule

> Batch 1A v2 should make the whole system feel meaningfully closer to the approved premium-dark reference before deeper page-specific refinements continue. If a primitive cannot survive dense workflow use, it is not ready.
