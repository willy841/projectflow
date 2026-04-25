# Legacy acceptance archive

These files were archived out of the active Playwright suite because their coverage is now superseded by `tests/formal-acceptance-v2/` or their expectations are explicitly stale under the approved 2026-04-26 acceptance rules.

## First archived batch

- `formal-acceptance-mainline.archived.ts`
- `design-task-detail-and-document.archived.ts`
- `procurement-task-detail-and-document.archived.ts`
- `design-confirm-overwrite-e2e.archived.ts`
- `procurement-confirm-overwrite-e2e.archived.ts`
- `vendor-group-package-document.archived.ts`
- `quote-cost-full-chain-e2e.archived.ts`
- `tmp-child-debug.archived.ts`

## Second archived batch

- `vendor-payable-lifecycle-e2e.archived.ts`
- `quote-cost-batch2-closeout.archived.ts`
- `quote-cost-collection-e2e.archived.ts`
- `quote-cost-vendor-payment-readback.archived.ts`
- `formal-acceptance-vendor-payments.archived.ts`

## Third archived batch — 2026-04-26 v2 primary cutover

These previously-active page/blocker-style formal acceptance specs were archived once `test:formal-acceptance` was cut over to the v2 suite:

- `formal-acceptance-home.archived.ts`
- `formal-acceptance-projects.archived.ts`
- `formal-acceptance-project-lists.archived.ts`
- `formal-acceptance-project-creation.archived.ts`
- `formal-acceptance-project-detail.archived.ts`
- `formal-acceptance-design.archived.ts`
- `formal-acceptance-procurement.archived.ts`
- `formal-acceptance-vendor-assignments.archived.ts`
- `formal-acceptance-vendor-packages.archived.ts`
- `formal-acceptance-quote-costs.archived.ts`
- `formal-acceptance-closeouts.archived.ts`
- `formal-acceptance-vendors.archived.ts`
- `formal-acceptance-db-sample.archived.ts`

These remain available for historical reference only and are no longer formal blocker entrypoints.

## Archive rule

Archived files keep implementation history for reference, but they are **not blocker tests** and are intentionally named without `.spec.ts` so Playwright does not execute them as part of the active suite.
