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

## Archive rule

Archived files keep implementation history for reference, but they are **not blocker tests** and are intentionally named without `.spec.ts` so Playwright does not execute them as part of the active suite.
