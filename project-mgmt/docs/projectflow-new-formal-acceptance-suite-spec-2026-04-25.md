# Projectflow NEW Formal Acceptance Suite Spec

Date: 2026-04-25  
Status: Implemented and cut over on 2026-04-26  
Scope: acceptance suite source-of-truth and cutover record

---

## 1. Goal

Replace the current mixed/overlapping formal-acceptance and legacy e2e scripts with **one new formal acceptance suite structure** that matches the now-approved acceptance standard.

This new suite must verify the real accepted business rules, not just page presence.

The suite should become the future blocker set for `projectflow` acceptance on the test/acceptance runtime.

---

## 2. Acceptance standard this suite must enforce

The new suite is based on the approved rules already visible in current repo context and current round decisions:

1. **Project lifecycle correctness**
   - active project stays in active views
   - closeout only happens when allowed
   - reopened project returns to active views

2. **Project-level document correctness**
   - design/procurement confirmation output belongs to **project-level documents**
   - task-level document pages are no longer formal mainline acceptance targets

3. **Overwrite semantics**
   - latest confirmation snapshot becomes current truth
   - prior snapshots remain as historical records

4. **Field mapping correctness**
   - confirmed plan fields map into document/package/financial layers correctly
   - vendor linkage fields must survive into snapshots and downstream views

5. **Refresh persistence**
   - after save/confirm/reload/navigation, accepted data still exists
   - refresh must not fall back to fake/stale/local-only state

6. **Delete propagation**
   - deleting payment / deleting live plan / replacing confirmed content must correctly propagate
   - downstream current view must reflect latest accepted state, while historical snapshot remains historical

7. **Vendor unpaid/paid gating**
   - vendor detail unpaid view only shows unpaid projects
   - once paid, item leaves unpaid view
   - if payment deleted/reversed, item reappears correctly

8. **Quote-cost member-operable rule**
   - quote-cost is not passive readback only
   - member can perform the expected operational actions there, especially collection / reconciliation-adjacent acceptance actions

9. **Family tab behavior**
   - project detail family/grouped sections behave per approved source-of-truth routing
   - accepted task summaries and grouped sections must remain readable and correctly routed

10. **Closeout button gating**
   - closeout action appears/enables only when project satisfies approved closure conditions
   - non-eligible state must block closure

11. **Closeout retained document correctness**
   - after closeout, retained closeout views must still show correct document/financial/project artifacts
   - reopen must not destroy retained correctness of historical records

12. **Dispatch/vendor linkage rules**
   - project detail dispatch uses vendor data as source of truth
   - trade -> vendor filtering must be correct

13. **Vendor package latest-truth rule**
   - vendor package/document layer must read latest confirmed package payload
   - old package payload is historical, not current truth

---

## 3. Proposed new suite structure

Create a new folder:

- `tests/formal-acceptance-v2/`

And treat everything inside this folder as the **new formal blocker suite**.

Also add:

- `tests/formal-acceptance-v2/helpers.ts`
- `tests/formal-acceptance-v2/fixtures.ts` (optional if helper becomes too large)
- new npm script:
  - `test:formal-acceptance:v2`

Reason:
- keeps the old suite intact during transition
- avoids partial in-place edits across many legacy files
- makes approval/cutover explicit

---

## 4. New acceptance test files that should exist

### 4.1 `tests/formal-acceptance-v2/00-baseline-and-project-lifecycle.spec.ts`

**Covers**
- seed/baseline readiness
- active project visible in home/projects
- project lifecycle from active -> closeout eligible -> closed -> reopened active

**Rules enforced**
- project lifecycle correctness
- refresh persistence for project status
- closeout retained document correctness (high-level visibility)

**Core assertions**
- seeded acceptance project exists
- active project appears in active views
- after closeout, project moves to closeout view with retained artifacts visible
- after reopen, project returns to active views

---

### 4.2 `tests/formal-acceptance-v2/01-project-detail-dispatch-and-family-routing.spec.ts`

**Covers**
- project detail shell remains readable
- execution tree / family sections / task summary sections render correctly
- dispatch drawer behavior
- vendor trade -> vendor filtering

**Rules enforced**
- family tab behavior
- dispatch/vendor linkage rules
- project detail remains summary/dispatch/routing layer, not deep-workbench layer

**Core assertions**
- design / procurement / vendor summary sections visible
- main item and child item dispatch drawer open correctly
- trade options come from vendor data source
- after choosing trade, vendor picker only shows vendors of that trade
- changing trade clears invalid previously selected vendor

---

### 4.3 `tests/formal-acceptance-v2/02-design-project-document-mainline.spec.ts`

**Covers**
- design task live plan save
- all-confirm behavior
- redirect / downstream readback to **project-level design document**
- quote-cost readback from confirmed design plans

**Rules enforced**
- project-level docs
- overwrite semantics
- field mapping
- refresh persistence
- quote-cost member-operable downstream readback for design

**Core assertions**
- save alone does not make document truth
- all-confirm creates current truth
- accepted downstream target is `/projects/[projectId]/design-document`
- latest confirmed plan fields appear in project-level design document
- quote-cost shows confirmed design cost line only after confirm
- reload preserves latest confirmed truth

---

### 4.4 `tests/formal-acceptance-v2/03-procurement-project-document-mainline.spec.ts`

**Covers**
- procurement task live plan save
- all-confirm behavior
- redirect / downstream readback to **project-level procurement document**
- quote-cost readback from confirmed procurement plans

**Rules enforced**
- project-level docs
- overwrite semantics
- field mapping
- refresh persistence
- quote-cost member-operable downstream readback for procurement

**Core assertions**
- save alone does not make document truth
- all-confirm creates current truth
- accepted downstream target is `/projects/[projectId]/procurement-document`
- latest confirmed plan fields appear in project-level procurement document
- quote-cost shows confirmed procurement cost line only after confirm
- reload preserves latest confirmed truth

---

### 4.5 `tests/formal-acceptance-v2/04-confirmation-overwrite-and-history.spec.ts`

**Covers**
- design overwrite
- procurement overwrite
- vendor overwrite
- latest snapshot vs retained historical snapshot behavior

**Rules enforced**
- overwrite semantics
- refresh persistence
- delete/replace propagation at current-truth layer
- closeout retained historical correctness foundation

**Core assertions**
- old confirm exists historically
- new confirm becomes current truth
- current downstream doc/package/quote-cost layers show newest data only
- history tables/snapshots still contain prior version

**Note**
This file is the formal replacement for the current scattered `design-confirm-overwrite-e2e.spec.ts`, `procurement-confirm-overwrite-e2e.spec.ts`, and part of `vendor-group-package-document-e2e.spec.ts`.

---

### 4.6 `tests/formal-acceptance-v2/05-vendor-package-and-latest-payload.spec.ts`

**Covers**
- vendor group confirm
- vendor assignment workbench latest plan set
- package detail latest confirmed payload
- package/document layer correctness after reconfirm

**Rules enforced**
- vendor package latest-truth rule
- field mapping
- overwrite semantics
- refresh persistence

**Core assertions**
- vendor group workbench shows latest editable/current plan set
- package detail reads latest confirmed payload, not stale prior payload
- reconfirm replaces current package truth while keeping historical snapshot rows
- vendor linkage fields remain correct downstream

---

### 4.7 `tests/formal-acceptance-v2/06-quote-cost-operability-and-refresh.spec.ts`

**Covers**
- quote-cost operational actions by member
- collection writeback
- refresh/readback after action
- design/procurement/vendor counts and group alignment

**Rules enforced**
- quote-cost member-operable rule
- field mapping
- refresh persistence

**Core assertions**
- member can add collection from quote-cost flow
- created collection survives refresh/revisit
- financial reconciliation group counts reflect 3-source alignment
- quote-cost current state matches DB truth after write

---

### 4.8 `tests/formal-acceptance-v2/07-vendor-payment-gating-and-delete-propagation.spec.ts`

**Covers**
- vendor unpaid projects view
- mark paid
- unpaid list removal
- payment deletion / reversal
- unpaid list reappearance

**Rules enforced**
- vendor unpaid/paid gating
- delete propagation
- refresh persistence

**Core assertions**
- unpaid project is selectable before payment
- after paid action, unpaid project disappears from unpaid view
- payment record exists in DB/readback
- deleting payment restores unpaid state and project reappears correctly

---

### 4.9 `tests/formal-acceptance-v2/08-closeout-gating-and-retained-correctness.spec.ts`

**Covers**
- closeout button visible/enabled only when allowed
- blocked closeout when outstanding conditions not satisfied
- successful closeout when conditions satisfied
- retained closeout view correctness

**Rules enforced**
- closeout button gating
- closeout retained document correctness
- project lifecycle correctness

**Core assertions**
- non-eligible project cannot close out
- eligible project can close out
- closeout retained view shows correct collections / package/document/financial artifacts
- reopen returns project to active without losing historical retained records

---

### 4.10 `tests/formal-acceptance-v2/09-cross-flow-formal-mainline-smoke.spec.ts`

**Covers**
- one concise end-to-end smoke across project detail -> design/procurement/vendor -> quote-cost -> closeout -> reopen

**Rules enforced**
- cross-flow integrity of the approved mainline

**Core assertions**
- major formal mainline still traversable after suite refactor
- can be used as final smoke after the more granular blocker files above

**Important**
This should be shorter and stricter than the current `formal-acceptance-mainline.spec.ts`, not another oversized catch-all file.

---

## 5. What each file replaces or absorbs

### New file -> current script relationship

1. `00-baseline-and-project-lifecycle.spec.ts`
   - absorbs parts of:
     - `formal-acceptance-home.spec.ts`
     - `formal-acceptance-projects.spec.ts`
     - `formal-acceptance-project-lists.spec.ts`
     - `formal-acceptance-project-creation.spec.ts` (only if still part of formal blocker; otherwise keep separate)
     - `formal-acceptance-closeouts.spec.ts` lifecycle portions

2. `01-project-detail-dispatch-and-family-routing.spec.ts`
   - absorbs/adapts:
     - `formal-acceptance-project-detail.spec.ts`
     - `project-detail-dispatch-drawer.spec.ts`

3. `02-design-project-document-mainline.spec.ts`
   - absorbs/adapts:
     - `formal-acceptance-design.spec.ts`
   - explicitly replaces old task-document-mainline assumptions

4. `03-procurement-project-document-mainline.spec.ts`
   - absorbs/adapts:
     - `formal-acceptance-procurement.spec.ts`
   - explicitly replaces old task-document-mainline assumptions

5. `04-confirmation-overwrite-and-history.spec.ts`
   - absorbs/adapts:
     - `design-confirm-overwrite-e2e.spec.ts`
     - `procurement-confirm-overwrite-e2e.spec.ts`
     - overwrite/history parts of `vendor-group-package-document-e2e.spec.ts`

6. `05-vendor-package-and-latest-payload.spec.ts`
   - absorbs/adapts:
     - `formal-acceptance-vendor-assignments.spec.ts`
     - `formal-acceptance-vendor-packages.spec.ts`
     - `vendor-group-package-document-e2e.spec.ts`

7. `06-quote-cost-operability-and-refresh.spec.ts`
   - absorbs/adapts:
     - `formal-acceptance-quote-costs.spec.ts`
     - relevant parts of `quote-cost-collection-e2e.spec.ts`

8. `07-vendor-payment-gating-and-delete-propagation.spec.ts`
   - absorbs/adapts:
     - `formal-acceptance-vendor-payments.spec.ts`
     - `vendor-payable-lifecycle-e2e.spec.ts`
     - relevant parts of `vendor-data-batch1-full-paid.spec.ts`
     - relevant parts of `vendor-data-batch1-payment-state.spec.ts`

9. `08-closeout-gating-and-retained-correctness.spec.ts`
   - absorbs/adapts:
     - `formal-acceptance-closeouts.spec.ts`
     - `quote-cost-batch2-closeout.spec.ts`
     - `quote-cost-full-chain-e2e.spec.ts`

10. `09-cross-flow-formal-mainline-smoke.spec.ts`
   - replaces:
     - `formal-acceptance-mainline.spec.ts`

---

## 6. Old scripts to archive or ignore as legacy

These should be marked **legacy / archive candidate / not formal blocker** after the new suite is approved and implemented.

### 6.1 Archive immediately after v2 is green

- `tests/formal-acceptance-mainline.spec.ts`
- `tests/design-task-detail-and-document.spec.ts`
- `tests/procurement-task-detail-and-document.spec.ts`
- `tests/design-confirm-overwrite-e2e.spec.ts`
- `tests/procurement-confirm-overwrite-e2e.spec.ts`
- `tests/vendor-group-package-document-e2e.spec.ts`
- `tests/vendor-payable-lifecycle-e2e.spec.ts`
- `tests/quote-cost-full-chain-e2e.spec.ts`
- `tests/tmp-child-debug.spec.ts`

Reason:
- duplicated scope
- task-level-document assumptions in some cases are no longer mainline
- broad catch-all structure makes failures ambiguous
- several are already explicitly labeled legacy/deprecated

### 6.2 Ignore as legacy / batch-history, not part of new formal blocker suite

- `tests/vendor-data-batch1-full-paid.spec.ts`
- `tests/vendor-data-batch1-history-readback.spec.ts`
- `tests/vendor-data-batch1-history-search-sort.spec.ts`
- `tests/vendor-data-batch1-payment-state.spec.ts`
- `tests/vendor-data-batch1-profile.spec.ts`
- `tests/quote-cost-batch2-closeout.spec.ts` (unless partially migrated into v2 file 08)
- `tests/quote-cost-collection-e2e.spec.ts` (unless partially migrated into v2 file 06)
- `tests/manual-db-acceptance.spec.ts`
- `tests/manual-db-step1-design-dispatch.spec.ts`

Reason:
- either manual, batch-specific, partial-history, or too narrow to define current formal blocker standard

---

## 7. Existing scripts that can still be retained or adapted

These are worth retaining as sources or utilities during migration.

### 7.1 Retain and adapt

- `tests/formal-acceptance-helpers.ts`
  - keep as source material
  - likely move/clone into `tests/formal-acceptance-v2/helpers.ts`

- `tests/formal-acceptance-project-detail.spec.ts`
  - retain logic fragments for project detail shell assertions

- `tests/project-detail-dispatch-drawer.spec.ts`
  - retain drawer-open and child-item dispatch interaction fragments

- `tests/formal-acceptance-vendor-assignments.spec.ts`
  - retain vendor group confirmation setup logic

- `tests/formal-acceptance-vendor-packages.spec.ts`
  - retain package detail latest payload assertions

- `tests/formal-acceptance-quote-costs.spec.ts`
  - retain collection writeback and financial group count assertions

- `tests/formal-acceptance-closeouts.spec.ts`
  - retain closeout/reopen DB truth assertions

- `tests/formal-acceptance-vendors.spec.ts`
  - retain vendor detail readback assertions

### 7.2 Retain outside formal blocker suite

- `tests/formal-acceptance-execution-item-excel-import.spec.ts`
- `tests/formal-acceptance-execution-item-excel-upload-ui.spec.ts`
- `tests/formal-acceptance-requirements-crud.spec.ts`
- `tests/formal-acceptance-home.spec.ts`
- `tests/formal-acceptance-projects.spec.ts`
- `tests/formal-acceptance-project-lists.spec.ts`
- `tests/formal-acceptance-project-creation.spec.ts`

Reason:
- these may still be valid acceptance/support coverage
- but they are not the core of the newly approved formal workflow standard listed in this round
- they can remain as secondary acceptance suite or smoke/support layer

---

## 8. Explicit rule-to-test matrix

| Approved rule | New blocker file(s) |
|---|---|
| Project lifecycle | `00`, `08`, `09` |
| Project-level docs | `02`, `03`, `09` |
| Overwrite semantics | `04`, `05` |
| Field mapping | `02`, `03`, `05`, `06` |
| Refresh persistence | `00`, `02`, `03`, `04`, `05`, `06`, `07` |
| Delete propagation | `04`, `07` |
| Vendor unpaid/paid gating | `07` |
| Quote-cost member-operable | `06`, `09` |
| Family tab behavior | `01` |
| Closeout button gating | `08` |
| Closeout retained document correctness | `08`, `09` |
| Dispatch trade/vendor linkage | `01` |
| Vendor package latest payload | `05` |

---

## 9. Important corrections vs current suite

These are the most important planning corrections the new suite must enforce.

### 9.1 Do not keep task-level document as formal mainline blocker
Current tests still assert:
- `/design-tasks/[id]/document`
- `/procurement-tasks/[id]/document`

Under the approved rule, these are no longer the formal acceptance mainline.

**Spec decision:**
- v2 mainline files must assert project-level document routes
- old task-level document scripts should be archived or reduced to compatibility-only regression if still needed

### 9.2 Break the oversized mainline into rule-driven blockers
Current `formal-acceptance-mainline.spec.ts` mixes:
- setup truth checks
- design
- procurement
- vendor
- quote-cost
- closeout
- reopen
- vendor detail summary

This makes failures noisy and hard to assign.

**Spec decision:**
- replace with focused blocker files plus one final smoke

### 9.3 Separate “latest current truth” from “historical retained truth”
The new suite must explicitly assert both:
- current downstream layers show latest confirmed truth
- historical snapshots remain queryable and retained

This is central to overwrite semantics and closeout retained correctness.

---

## 10. Execution plan for implementation later

### Phase 1 — scaffold
1. create `tests/formal-acceptance-v2/`
2. create `helpers.ts`
3. add new npm script `test:formal-acceptance:v2`
4. do not delete old suite yet

### Phase 2 — migrate blocker coverage
1. implement files `00` to `09`
2. make them green against acceptance runtime
3. ensure every approved rule above has at least one direct assertion

### Phase 3 — cutover
1. switch CI / acceptance runbook to `test:formal-acceptance:v2`
2. mark old files as archived / legacy
3. remove old blocker status from `formal-acceptance-mainline.spec.ts`

### Phase 4 — cleanup
1. optionally move legacy tests to `tests/legacy/`
2. keep only useful compatibility regressions
3. remove dead/duplicate debug specs

---

## 11. Approval checkpoints

Before implementation begins, confirm these 5 decisions:

1. **Do we approve creating `tests/formal-acceptance-v2/` instead of editing old files in place?**
2. **Do we approve project-level document as the only formal mainline target for design/procurement?**
3. **Do we approve replacing the current giant mainline test with granular blocker files plus one final smoke?**
4. **Do we approve archiving the listed legacy scripts once v2 is green?**
5. **Do we approve keeping Excel / requirements / project creation acceptance outside the new core blocker suite?**

---

## 12. One-line summary

The new formal acceptance suite should move from the current mixed page-presence/catch-all structure to a **rule-driven blocker suite** centered on: project lifecycle, project-level documents, overwrite semantics, refresh persistence, delete propagation, vendor paid/unpaid gating, quote-cost operability, family/dispatch routing, closeout gating, and retained correctness.


---

## Implementation update — 2026-04-26 batch 2

Completed in repo:

- Added `07-vendor-unpaid-history-and-payment-reversal.spec.ts` to cover vendor unpaid visibility, history tab transfer after full payment, and payment deletion reappearance.
- Added `08-closeout-list-and-manual-cost-freeze.spec.ts` to cover retained manual-cost readback, closeout list totals, and reopen back-switch out of closeout views.
- Began archiving the first clearly superseded legacy batch under `tests/legacy/` with non-`.spec.ts` filenames so they no longer act as active blockers.

Cutover completion update — 2026-04-26

- final concise cross-flow smoke (`09-cross-flow-formal-mainline-smoke.spec.ts`) added
- `test:formal-acceptance` switched to the v2 suite
- old page/blocker-style formal acceptance specs archived under `tests/legacy/` as non-`.spec.ts` files
- v2 is now the primary formal acceptance blocker path

Non-blocking follow-up only:

- update any external CI or operator runbooks that still call old explicit file lists
- keep legacy/support coverage separate from blocker semantics
