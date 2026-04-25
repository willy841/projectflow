# Projectflow formal acceptance v2 cutover — 2026-04-26

Status: complete

## What was switched

The formal acceptance blocker primary entrypoint was cut over to v2.

### Primary scripts after cutover

- `npm run test:formal-acceptance`
- `npm run test:formal-acceptance:primary`
- `npm run test:formal-acceptance:v2`

All three now point to the v2 blocker suite, with `test:formal-acceptance` remaining the canonical primary command.

## What was downgraded

The old mixed page/blocker path was removed from the primary `test:formal-acceptance` command.

A legacy fallback label now exists only for clearly non-primary carryover coverage:

- `npm run test:formal-acceptance:legacy`

This legacy command is intentionally **not** the formal blocker suite. It only keeps a narrow support slice for:

- requirements CRUD
- execution item Excel import
- execution item Excel upload UI

## What was archived

The remaining old page-style formal acceptance specs that could still compete with v2 as the “main suite” were moved out of active Playwright blocker naming and archived under `tests/legacy/` as non-`.spec.ts` files:

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

Previously archived legacy files remain archived in the same directory.

## Resulting rule

From this cutover onward:

- **v2 is the only primary formal acceptance blocker suite**
- old formal-acceptance page/blocker specs are historical reference only
- old archived tests must not be treated as blocker failures for current formal acceptance signoff

## Validation expectation

The required post-cutover validation command is:

- `npm run test:formal-acceptance`

Because this now resolves to v2, a green result confirms the cutover entrypoint and the active blocker suite at the same time.
