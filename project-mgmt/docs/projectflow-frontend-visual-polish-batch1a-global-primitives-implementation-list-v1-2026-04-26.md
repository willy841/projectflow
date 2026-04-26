# Projectflow frontend visual polish batch 1A global primitives implementation list v1 — 2026-04-26

Status: active
Role: implementation checklist
Depends on:
- `projectflow-frontend-visual-polish-execution-principles-v1-2026-04-26.md`
- `projectflow-frontend-visual-polish-batch1-work-order-v1-2026-04-26.md`

---

## 1. Goal

Batch 1A establishes the shared visual primitives required before page-specific polishing starts.

This batch must improve product feel globally while keeping all existing behavior intact.

It should create the base layer that Batch 1B/1C/1D/1E can reuse.

---

## 2. Hard rule reminder

Batch 1A is visual-only.
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

## 3. Implementation scope

### 3.1 Background primitives
Implement:
- app-level background color tokens
- content-surface contrast rules
- page-shell background rules
- optional subtle accent glow rules only if they remain extremely restrained

Desired outcome:
- the app no longer looks like plain engineering white surfaces on flat backgrounds
- there is clear but soft separation between shell, section, and card layers

Suggested deliverables:
- background utility classes or tokens
- shell wrapper class standard
- content container surface rules

### 3.2 Card primitives
Implement:
- unified radius standard
- unified border treatment
- unified shadow treatment
- unified background treatment
- unified padding scale for card sizes (small / medium / dense)
- consistent card header/body/footer spacing

Desired outcome:
- cards across the system feel like part of one product system
- cards look more premium but remain practical for dense content

Suggested deliverables:
- base card class
- dense card variant
- section card variant
- optional elevated card variant for summary blocks

### 3.3 Button primitives
Implement:
- primary button style
- secondary button style
- neutral button style
- destructive button style
- consistent radius
- consistent height / padding
- consistent hover / focus / disabled states

Desired outcome:
- button hierarchy becomes visually clear
- primary actions look stronger without becoming flashy

Suggested deliverables:
- reusable button class variants
- state mapping rules

### 3.4 Badge / status primitives
Implement:
- semantic badge system for success / warning / danger / neutral / info
- softer color palette with good contrast
- unified radius and spacing
- consistent small-caps or font treatment if applicable

Desired outcome:
- statuses look intentional, calm, and product-grade
- they remain instantly readable in dense workflow pages

Suggested deliverables:
- badge variants
- status-to-style mapping guide

### 3.5 Form-control primitives
Implement:
- unified text input styling
- unified select styling
- unified textarea styling
- unified focus ring
- unified placeholder style
- unified label-to-field spacing
- unified help/error text spacing

Desired outcome:
- forms feel part of the same interface family
- dense operational forms become easier to scan

Suggested deliverables:
- field wrapper spacing standard
- base input/select/textarea classes
- focus and disabled state rules

### 3.6 Table primitives
Implement:
- row height rules
- header style rules
- border rhythm rules
- hover state rules
- selected / active row visual rules if already supported
- numeric cell emphasis rules where appropriate

Desired outcome:
- tables remain dense but become cleaner to scan
- financial/workflow data is easier to parse

Suggested deliverables:
- base table shell class
- row style standard
- dense table variant if needed

### 3.7 Typography primitives
Implement:
- page title scale
- section title scale
- summary-value scale
- body text scale
- note / secondary text scale
- stronger weight hierarchy for primary vs secondary information

Desired outcome:
- information hierarchy becomes clearer without changing content
- totals, statuses, headings, and notes are easier to distinguish at a glance

Suggested deliverables:
- title class system
- value/label pair styling rules
- muted text standard

### 3.8 Navigation shell primitives
Implement carefully:
- sidebar active-state improvement
- topbar material refinement
- navigation spacing consistency
- icon alignment consistency

Desired outcome:
- the frame of the application feels more polished
- active location is clearer
- no navigation behavior changes occur

Suggested deliverables:
- sidebar item state styling
- active indicator rule
- topbar surface style rule

---

## 4. Suggested engineering targets

Potential implementation locations may include:
- global stylesheet / theme layer
- shared component wrappers
- shell-level layout components
- reusable UI component primitives

Do not start by patching every page ad hoc.
First create the shared visual layer that pages can inherit.

---

## 5. Batch 1A acceptance checklist

Batch 1A is complete only if:

1. a shared visual primitive layer exists
2. cards/buttons/badges/forms/tables/typography feel more unified
3. no function-layer changes were introduced
4. no UI copy changed
5. no interaction behavior changed
6. the current stable baseline remains cleanly revertible
7. the primitive layer is good enough to support Project Detail as the first benchmark page

---

## 6. Commit strategy

Recommended commit breakdown:

### 1A-1
- background + shell primitives

### 1A-2
- card primitives

### 1A-3
- button + badge primitives

### 1A-4
- form + table primitives

### 1A-5
- typography + nav-shell primitives

If the codebase layout suggests a slightly different split, keep the same principle:
- small
- legible
- revertible
- visual-only

---

## 7. Final rule

> Batch 1A should create the polished visual foundation of Projectflow without changing any product behavior. If a primitive requires behavior change to look good, reject that primitive for this batch.
