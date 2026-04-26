# Projectflow financial error taxonomy and stale-write contract — 2026-04-26

Status: active

## Purpose

This document formalizes the currently accepted error-contract behavior for key financial routes, so that future maintenance does not rely on ad-hoc route reading or inferred semantics.

Scope:
- collections create
- vendor payment create
- quotation import
- closeout

This document does not yet formalize every route in the financial area. It focuses on the routes that already carry meaningful business guardrails.

---

## 1. Collections create
Route:
- `POST /api/accounting/projects/[id]/collections`

### Current accepted contract
- If the project receivable total exists and the new collection would exceed that total:
  - return `400`
  - return `ok: false`
  - return human-readable over-limit message

### Intended domain meaning
- collections are bounded by project receivable truth
- over-collection is a business validation error, not a server failure

---

## 2. Vendor payment create
Route:
- `POST /api/vendors/[id]/payments`

### Current accepted contract
- Missing required fields → `400`
- Vendor not found → `404`
- No payable `project × vendor` target → `400`
- Has unreconciled groups → `400`
- No remaining unpaid amount → `400`
- Payment amount exceeds remaining unpaid amount → `400`

### Intended domain meaning
- vendor payment create is a guarded business write
- fully-paid semantic state is not freely writable
- reconciliation completeness and remaining unpaid amount are both domain gates

---

## 3. Quotation import
Route:
- `POST /api/financial-projects/[id]/quotation-import`

### Current accepted contract
- Missing file → `400`
- Project not found → `404`
- Validation-class workbook errors → `400`
- DB uniqueness / conflict (`23505`) → `409`
- Unexpected runtime failure → `500`

### Intended domain meaning
- malformed workbook is validation failure
- duplicate / conflicting formal import is conflict
- only true unexpected failures should become 500-class errors

---

## 4. Closeout
Route:
- `POST /api/financial-projects/[id]/closeout`

### Current accepted contract
- Project not found → `404`
- `expectedOutstandingTotal` stale → `409`, `error=stale-outstanding-total`
- `expectedReconciliationStatus` stale → `409`, `error=stale-reconciliation-status`
- outstanding not zero → `400`, `error=outstanding-not-zero`
- reconciliation not complete → `400`, `error=reconciliation-not-complete`
- financial project not found → `404`
- unexpected runtime failure → `500`

### Intended domain meaning
- closeout is protected by both:
  - business gating
  - stale-write protection
- `409` is used when caller state is stale
- `400` is used when the write is currently domain-ineligible

---

## 5. Normalization notes

### 5.1 Current state
The current routes are partially normalized:
- closeout and quotation import are closer to formal taxonomy
- collections create and vendor payment create still rely more on inline business messages

### 5.2 Current approved interpretation
- human-readable business errors are acceptable when semantics are clear
- however, long-term governance should prefer stable error-class meaning, even if messages remain human-readable

## 5. Collections delete
Route:
- `DELETE /api/accounting/collections/[id]`

### Current accepted contract
- route uses **idempotent delete semantics**
- deleting an already-missing collection record still returns success
- current response shape may include metadata such as deleted id / semantics marker, but remains success-class

### Intended domain meaning
- collection delete is a safe removal operation
- missing target on delete is not treated as blocker-class failure in current governance
- this avoids unnecessary client fragility for repeated cleanup / reset flows

---

### 5.3 Next candidates for formalization
- reopen illegal transition semantics
- possible future normalization of vendor payment domain error codes
