# Projectflow fresh-project validation coverage matrix — 2026-04-26

Status: active

## Purpose

This matrix distinguishes three things clearly:
1. what has already been re-validated on a freshly created project
2. what is currently covered mainly by existing formal acceptance / boundary suites
3. what has not yet been re-run exhaustively on a fresh project

This exists to avoid over-claiming that "everything" was re-tested from scratch, while still making the new-project validation status explicit.

---

## A. Re-validated on a freshly created project

These items were re-run using newly created temporary projects during this phase, not only the legacy formal-acceptance sample.

### A1. Fresh project creation and upstream entry
Status: re-validated on fresh project
Evidence:
- `tests/formal-acceptance-v2/19-new-project-end-to-end-spot-check.spec.ts`

Covered:
- create a brand-new project
- project row persists in DB
- project appears in `/projects`
- project detail opens successfully
- project detail shows the three project-family entry buttons

### A2. Fresh project upstream → three-line dispatch → downstream closeout mainline
Status: re-validated on fresh project
Evidence:
- `tests/formal-acceptance-v2/20-new-project-full-chain-spot-check.spec.ts`

Covered:
- import execution-item tree into fresh project
- dispatch into design / procurement / vendor lines
- create downstream design/procurement/vendor tasks
- sync plan + confirm on all three lines
- project-level design document receives confirmed truth
- project-level procurement document receives confirmed truth
- reconciliation groups sync
- collection create
- closeout
- retained snapshot written into `financial_closeout_snapshots`
- project visible in closeout list

### A3. Fresh project overwrite / delete / reopen / re-closeout mutation coverage
Status: re-validated on fresh project
Evidence:
- `tests/formal-acceptance-v2/21-new-project-mutation-coverage.spec.ts`

Covered:
- design overwrite A → B
- procurement overwrite A → B
- vendor overwrite A → B
- latest truth appears in downstream document layer
- old truth no longer remains on the formal mainline
- dispatch delete on design line
- downstream design confirmations removed after delete
- document-layer removal after delete
- re-dispatch after delete
- re-confirm after re-dispatch
- reopen after closeout
- second closeout after reopen

### A4. Fresh project dispatch/edit sync into downstream accepted board task
Status: re-validated on fresh project
Evidence:
- `tests/formal-acceptance-v2/22-new-project-dispatch-edit-sync.spec.ts`

Covered:
- edit execution-item title in dispatch/upstream layer
- corresponding design/procurement/vendor task titles update downstream
- later confirmations carry updated titles into confirmation snapshots

### A5. Fresh project same-page detail card sync after dispatch edit
Status: re-validated on fresh project
Evidence:
- `tests/formal-acceptance-v2/23-project-detail-card-sync-after-dispatch-edit.spec.ts`

Covered:
- edit dispatched item title
- task-view card on the same project-detail page reflects the updated title
- old card title no longer remains

---

## B. Covered by existing formal acceptance / boundary suites, but not yet all re-run on a fresh project

These items do have automated coverage already, but their strongest current evidence is still from the existing formal-acceptance sample / boundary suite rather than a newly created project dedicated re-run.

### B1. Requirements CRUD
Status: covered by existing suite
Evidence:
- `tests/formal-acceptance-requirements-crud.spec.ts`
- `tests/batch4-upstream-requirements-api.spec.ts`

Covered:
- create requirement
- update requirement
- delete requirement
- DB persistence checks

Fresh-project dedicated rerun this round:
- not separately re-run as part of the new-project chain set above

### B2. Execution-item import overwrite semantics
Status: covered by existing suite
Evidence:
- `tests/formal-acceptance-execution-item-excel-import.spec.ts`
- `tests/formal-acceptance-execution-item-excel-upload-ui.spec.ts`

Covered:
- import tree into project
- second import overwrites prior tree rather than append
- front-end upload preview / confirm import flow

Fresh-project dedicated rerun this round:
- new project import was used successfully in A2/A3/A5,
- but import-overwrite-specific semantics were not separately re-run as a dedicated fresh-project overwrite case in this round

### B3. Design / procurement / vendor mainline truth overwrite depth
Status: covered by existing suite and partially re-validated on fresh project
Evidence:
- `tests/formal-acceptance-v2/02-design-project-document-mainline.spec.ts`
- `tests/formal-acceptance-v2/03-procurement-project-document-mainline.spec.ts`
- `tests/formal-acceptance-v2/04-vendor-package-mainline.spec.ts`
- also partially re-validated in A2/A3

Covered:
- save alone does not commit formal truth
- confirm overwrites latest truth
- downstream document/package layer uses latest confirmed truth

Fresh-project dedicated rerun this round:
- yes for core overwrite shape
- no for every edge-case depth originally exercised in the legacy/main formal suite

### B4. Quote-cost formal mainline readback
Status: covered by existing suite
Evidence:
- `tests/formal-acceptance-v2/05-quote-cost-mainline.spec.ts`
- `tests/formal-acceptance-v2/09-cross-flow-formal-mainline-smoke.spec.ts`

Covered:
- quote-cost detail alignment across three families
- collection writeback alignment
- cross-flow latest confirmed truth alignment

Fresh-project dedicated rerun this round:
- downstream closeout chain was re-run on fresh project
- quote-cost page-level dedicated verification was not separately re-run in this fresh-project round

### B5. Vendor unpaid / history / payment reversal
Status: covered by existing suite
Evidence:
- `tests/formal-acceptance-v2/07-vendor-unpaid-history-and-payment-reversal.spec.ts`

Covered:
- reconciled project remains in unpaid
- fully-paid project moves into history
- deleting payment restores unpaid state

Fresh-project dedicated rerun this round:
- not separately re-run on a newly created project in this round

### B6. Manual retained costs / closeout freeze / reopen back-switch
Status: covered by existing suite
Evidence:
- `tests/formal-acceptance-v2/08-closeout-list-and-manual-cost-freeze.spec.ts`
- `tests/formal-acceptance-v2/09-boundary-batch3-regressions.spec.ts`

Covered:
- manual retained cost freeze after closeout
- excluded manual cost visibility
- reopen returns project to active views
- retained truth freeze before reopen

Fresh-project dedicated rerun this round:
- reopen / re-closeout mainline was re-run in A3
- manual retained freeze-specific variation was not separately re-run on a fresh project in this round

### B7. Boundary / regression cases
Status: covered by existing suite
Evidence:
- `tests/formal-acceptance-v2/09-boundary-batch3-regressions.spec.ts`

Covered:
- quotation import rejects header/total-only workbook
- dispatch delete removes ghost downstream confirmations from quote-cost
- retained truth freeze across post-closeout mutation until reopen

Fresh-project dedicated rerun this round:
- dispatch delete was re-run in A3
- other boundary specifics were not all separately re-run on fresh project in this round

---

## C. Not yet exhaustively re-run on a fresh project

These are the main categories that should not be over-claimed as fully fresh-project re-tested.

### C1. Full requirements CRUD + downstream interaction chain on the same fresh project
Status: not fully re-run on fresh project

### C2. Fresh-project payment create → full paid → history → delete payment → unpaid restore
Status: not yet re-run on fresh project

### C3. Fresh-project manual retained-cost freeze variants
Status: not yet re-run on fresh project

### C4. Fresh-project quotation workbook boundary variants
Status: not yet re-run on fresh project

### C5. Exhaustive UI click-path permutations
Status: not exhaustively re-run

This includes:
- every page-level card/button path
- every alternate human click order
- every non-mainline interaction sequence

---

## D. Practical interpretation

### What can now be claimed with confidence
- a brand-new project was not only created, but also pushed through the core upstream → three-line → document-layer → closeout mainline
- fresh-project overwrite / delete / re-dispatch / reopen / re-closeout behaviors were re-validated on the core path
- dispatch-layer edit sync into downstream board/task truth was re-validated on a fresh project
- same-page project-detail task-view card sync after upstream edit was re-validated on a fresh project

### What should not be over-claimed
- not every pre-existing boundary case has been re-run from scratch on a fresh project
- not every CRUD permutation has been exhaustively replayed on a fresh project
- not every UI interaction path has been manually or automatically re-enumerated

---

## E. One-line conclusion

> The core projectflow mainline has now been re-validated on freshly created projects through upstream dispatch, three-line confirmation, document-layer carry-through, closeout, overwrite/delete/reopen variants, and dispatch-edit sync; however, some boundary and extended CRUD variants remain covered primarily by the existing formal-acceptance / regression suites rather than a full fresh-project re-run.
