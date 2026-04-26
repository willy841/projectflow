# Stale vendor UI-contract tests

Status: archived / do not use as formal blocker

These tests were moved out of `tests/` root because they encode **pre-MD158 vendor-detail UI expectations** that no longer match the current formal acceptance contract.

## Why they are stale

Per `MD158-projectflow-acceptance-rules-fixes-and-v2-suite-consolidation-2026-04-26.md`:

- acceptance wording / page names / headings must follow **current UI**
- old headings / old wording / old placeholder expectations must not be treated as product fail evidence
- old tests expecting `部分付款` must not be treated as current formal product contract
- old hard-coded payable totals must not be treated as blocker-class acceptance evidence

## What these tests still assume

Examples of stale assumptions in this folder include:

- heading `付款紀錄`
- legacy placeholder `搜尋專案名稱、摘要或發包內容`
- direct `input[value=...]` readback expectations for vendor detail UI fields
- `部分付款` as a formal expected visible status
- hard-coded amount assumptions such as `28000`

## Rule

- Do **not** run these as part of formal acceptance.
- Do **not** cite failures from these tests as evidence that current UI/feature work broke formal product behavior.
- If vendor-detail acceptance needs to be extended, rewrite new tests against the **current formal UI contract** and place them under `tests/formal-acceptance-v2/` or another clearly active suite.

## Current formal blocker path

Use:
- `npm run test:formal-acceptance:v2`

Relevant current vendor-related formal specs include:
- `tests/formal-acceptance-v2/04-vendor-package-mainline.spec.ts`
- `tests/formal-acceptance-v2/07-vendor-unpaid-history-and-payment-reversal.spec.ts`
- `tests/formal-acceptance-v2/09-cross-flow-formal-mainline-smoke.spec.ts`
