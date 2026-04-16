# MD138 — projectflow MD / repo status audit and classification (2026-04-16)

> Status: ACTIVE / HANDOFF SUPPORT
> Role: 整理目前 `projectflow` 的 MD 文件狀態與 repo 現況，明確區分哪些是主線必讀、哪些是次主線回查、哪些已完成、哪些已被覆蓋、哪些屬於歷史與封存候選。
> Important: 本文件不是新的最高母檔；真正 source of truth 仍以 `MD-MASTER-projectflow-system-source-of-truth.md` 為準。

---

## 1. 文件定位

本文件的目的不是重新定義 `projectflow`，而是把目前已堆疊的大量 MD 與 repo 現況整理成可操作的狀態地圖，讓之後新 session / 新對話能快速判斷：

1. 哪些文件每次續接都必讀
2. 哪些文件仍有效，但屬於模組回查
3. 哪些文件已完成，不應再當待辦入口
4. 哪些文件已被覆蓋（superseded）
5. 哪些文件只保留歷史價值
6. repo 目前完成到哪裡、還缺什麼

---

## 2. 目前最高優先閱讀層（每次續接 projectflow 必讀）

以下文件應視為目前續接 `projectflow` 的最高優先閱讀層：

1. `MD-MASTER-projectflow-system-source-of-truth.md`
2. `MD-INDEX-projectflow-document-map-2026-04-09.md`
3. `MD-INDEX-projectflow-status-board-2026-04-12.md`
4. `MD133-projectflow-post-md108-phase-p3-home-overview-active-aggregation-final-closure-2026-04-13.md`
5. `MD134-projectflow-post-md133-project-detail-dispatch-and-ui-closure-2026-04-14.md`
6. `MD135-projectflow-ui-consistency-95-percent-closure-and-guardrails-2026-04-15.md`
7. `MD136-projectflow-product-guardrails-and-formalization-rules-2026-04-15.md`
8. `MD137-projectflow-guardrails-round1-implementation-closure-2026-04-15.md`

正式規則：
- 若這批文件與較早 handoff 衝突，以這批文件為準。
- 若後續出現比 `MD137` 更晚、且明確標示為最新 closure / guardrails / master continuation 的文件，應一併納入必讀層。

---

## 3. 文件分類總表

## 3.1 主線必讀（ACTIVE CORE）

### 核心入口
- `MD-MASTER-projectflow-system-source-of-truth.md`
- `MD-INDEX-projectflow-document-map-2026-04-09.md`
- `MD-INDEX-projectflow-status-board-2026-04-12.md`
- `MD-CLEANUP-projectflow-status-map-2026-04-09.md`（分類輔助，不是 source of truth）

### 最新 closure / guardrails / 現行產品規則
- `MD133-projectflow-post-md108-phase-p3-home-overview-active-aggregation-final-closure-2026-04-13.md`
- `MD134-projectflow-post-md133-project-detail-dispatch-and-ui-closure-2026-04-14.md`
- `MD135-projectflow-ui-consistency-95-percent-closure-and-guardrails-2026-04-15.md`
- `MD136-projectflow-product-guardrails-and-formalization-rules-2026-04-15.md`
- `MD137-projectflow-guardrails-round1-implementation-closure-2026-04-15.md`

### 仍有效的舊主線 / 驗收主線（需服從上列新文件）
- `MD20-projectflow-approved-ui-lock-rule-2026-04-05.md`
- `MD21-projectflow-project-detail-responsibility-redistribution-spec-2026-04-05.md`
- `MD22-projectflow-mock-closed-loop-frontend-execution-brief-2026-04-05.md`
- `MD23-projectflow-db-schema-v1-draft-2026-04-05.md`
- `MD24-projectflow-db-schema-v1-table-walkthrough-2026-04-05.md`
- `MD25-projectflow-db-phase1-migration-plan-2026-04-05.md`
- `MD26-projectflow-formal-data-closure-validation-plan-2026-04-06.md`
- `MD34-projectflow-system-progress-audit-and-next-stage-map-2026-04-07.md`
- `MD35-projectflow-next-stage-execution-blueprint-v1-2026-04-07.md`
- `MD57-projectflow-dispatch-drawer-completion-state-and-db-closure-alignment-2026-04-11.md`
- `MD59-projectflow-live-db-runtime-validation-and-field-alignment-handoff-2026-04-11.md`
- `MD60-projectflow-midstream-plan-confirm-live-db-validation-handoff-2026-04-11.md`
- `MD61-projectflow-downstream-db-first-vendor-runtime-status-handoff-2026-04-11.md`
- `MD62-projectflow-current-round-completion-rules-and-open-items-alignment-2026-04-11.md`
- `MD63-projectflow-downstream-financial-progress-refresh-2026-04-11.md`
- `MD64-projectflow-vendor-data-unpaid-zone-partial-reconciliation-rule-2026-04-11.md`
- `MD65-projectflow-vendor-data-detail-action-vs-archive-semantics-2026-04-12.md`
- `MD66-projectflow-vendor-data-detail-validation-refresh-2026-04-12.md`

---

## 3.2 次主線 / 模組回查（ACTIVE REFERENCE）

### usage-scenario alignment
- `MD100-projectflow-upstream-usage-scenario-alignment-summary-2026-04-12.md`
- `MD101-projectflow-design-line-usage-scenario-alignment-summary-2026-04-13.md`
- `MD102-projectflow-procurement-line-usage-scenario-alignment-summary-2026-04-13.md`
- `MD103-projectflow-vendor-line-usage-scenario-alignment-summary-2026-04-13.md`
- `MD104-projectflow-quote-cost-line-usage-scenario-alignment-summary-2026-04-13.md`
- `MD105-projectflow-vendor-data-usage-scenario-alignment-summary-2026-04-13.md`
- `MD106-projectflow-closeout-usage-scenario-alignment-summary-2026-04-13.md`
- `MD107-projectflow-home-overview-usage-scenario-alignment-summary-2026-04-13.md`

### post-MD108 結構性藍圖 / 工作包鏈
- `MD108-projectflow-db-first-implementation-batch-plan-2026-04-13.md`
- `MD109-projectflow-vendor-data-db-first-gap-closure-work-package-2026-04-13.md`
- `MD110-projectflow-vendor-data-source-map-audit-and-gap-report-2026-04-13.md`
- `MD111-projectflow-vendor-data-batch1-foundation-and-profile-validation-closure-2026-04-13.md`
- `MD112-projectflow-quote-cost-reconciliation-payable-closeout-ingress-work-package-2026-04-13.md`
- `MD113-projectflow-batch2-quote-cost-reconciliation-payable-closeout-ingress-closure-2026-04-13.md`
- `MD114-projectflow-closeout-retained-read-model-performance-work-package-2026-04-13.md`
- `MD115-projectflow-batch3-closeout-retained-read-model-performance-closure-2026-04-13.md`
- `MD116-projectflow-upstream-execution-lines-write-read-closure-work-package-2026-04-13.md`
- `MD117-projectflow-batch4-upstream-execution-lines-write-read-closure-progress-2026-04-13.md`
- `MD118-projectflow-batch4-upstream-execution-lines-write-read-closure-final-2026-04-13.md`
- `MD119-projectflow-md108-batch1-to-batch4-completion-summary-and-next-scope-2026-04-13.md`
- `MD120-projectflow-post-md108-hardening-validation-extension-blueprint-2026-04-13.md`
- `MD121-projectflow-post-md108-phase-p1-validation-hardening-matrix-work-package-2026-04-13.md`
- `MD122-projectflow-post-md108-phase-p1-validation-hardening-progress-handoff-2026-04-13.md`
- `MD123-projectflow-post-md108-phase-p1-validation-hardening-fix-progress-2026-04-13.md`
- `MD124-projectflow-post-md108-phase-p1-validation-hardening-completion-status-2026-04-13.md`
- `MD125-projectflow-post-md108-phase-p1-validation-hardening-matrix-final-closure-2026-04-13.md`
- `MD126-projectflow-post-md108-phase-p2-retained-component-formalization-work-package-2026-04-13.md`
- `MD127-projectflow-post-md108-phase-p2-retained-component-formalization-progress-2026-04-13.md`
- `MD128-projectflow-post-md108-phase-p2-retained-component-formalization-status-2026-04-13.md`
- `MD129-projectflow-post-md108-phase-p2-retained-component-formalization-final-closure-2026-04-13.md`
- `MD130-projectflow-post-md108-phase-p3-home-overview-active-aggregation-closure-work-package-2026-04-13.md`
- `MD131-projectflow-post-md108-phase-p3-home-overview-active-aggregation-progress-2026-04-13.md`
- `MD132-projectflow-post-md108-phase-p3-home-overview-active-aggregation-status-2026-04-13.md`

### Vendor Data / Closeout / Downstream module chain
- `MD36-projectflow-vendor-detail-v1-spec-2026-04-08.md`
- `MD37-projectflow-vendor-list-v1-spec-2026-04-08.md`
- `MD38-projectflow-vendor-data-module-v1-spec-2026-04-08.md`
- `MD39-projectflow-vendor-data-upstream-midstream-alignment-v1-2026-04-08.md`
- `MD40-projectflow-closeout-module-v1-spec-2026-04-08.md`
- `MD41-projectflow-downstream-current-progress-and-open-topics-2026-04-08.md`

### Accounting Center / financial / month-close active chain
- `MD42-projectflow-accounting-center-personnel-input-area-v1-spec-2026-04-08.md`
- `MD43-projectflow-accounting-center-personnel-record-area-v1-spec-2026-04-08.md`
- `MD44-projectflow-accounting-center-operating-expense-module-v1-spec-2026-04-08.md`
- `MD45-projectflow-accounting-center-office-expense-input-area-v1-spec-2026-04-08.md`
- `MD46-projectflow-accounting-center-office-expense-record-area-v1-spec-2026-04-08.md`
- `MD47-projectflow-accounting-center-other-expense-input-area-v1-spec-2026-04-08.md`
- `MD48-projectflow-accounting-center-other-expense-record-area-v1-spec-2026-04-08.md`
- `MD49-projectflow-accounting-center-revenue-overview-v1-spec-2026-04-08.md`
- `MD50-projectflow-accounting-center-master-spec-and-downstream-alignment-2026-04-08.md`
- `MD51-projectflow-downstream-progress-refresh-after-accounting-center-spec-round-2026-04-08.md`
- `MD52-projectflow-accounting-center-closeout-vendor-data-alignment-v1-2026-04-08.md`
- `MD53-projectflow-accounting-center-active-projects-module-v1-spec-2026-04-08.md`
- `MD54-projectflow-accounting-center-master-spec-v1-2026-04-08.md`
- `MD55-projectflow-downstream-acceptance-and-ui-lock-handoff-2026-04-08.md`
- `MD56-projectflow-accounting-center-progress-and-open-tasks-2026-04-09.md`
- `MD76-projectflow-client-collection-source-of-truth-and-quote-cost-detail-entry-spec-2026-04-12.md`
- `MD78-projectflow-accounting-center-phase-a-closure-and-lock-recommendation-2026-04-12.md`
- `MD80-projectflow-payable-lifecycle-v1-spec-2026-04-12.md`
- `MD81-projectflow-payable-lifecycle-v1-closure-and-lock-recommendation-2026-04-12.md`
- `MD82-projectflow-month-close-v1-spec-2026-04-12.md`
- `MD83-projectflow-accounting-center-month-close-aggregation-alignment-2026-04-12.md`
- `MD84-projectflow-month-close-aggregation-detail-readback-rule-2026-04-12.md`
- `MD85-projectflow-month-close-aggregation-cto-work-package-and-risk-guardrails-2026-04-12.md`
- `MD86-projectflow-month-close-aggregation-implementation-closure-2026-04-12.md`
- `MD87-projectflow-full-db-first-formalization-audit-spec-2026-04-12.md`
- `MD88-projectflow-repo-level-db-coverage-audit-work-package-2026-04-12.md`
- `MD89-projectflow-repo-level-db-coverage-audit-report-2026-04-12.md`
- `MD90-projectflow-quote-cost-detail-source-unification-spec-2026-04-12.md`
- `MD91-projectflow-quote-cost-detail-source-unification-phase-2-spec-2026-04-12.md`
- `MD92-projectflow-quote-cost-quotation-db-read-model-spec-2026-04-12.md`
- `MD93-projectflow-quotation-db-read-model-gap-and-phase-1-implementation-2026-04-12.md`
- `MD94-projectflow-quotation-db-schema-and-read-model-cto-spec-2026-04-12.md`
- `MD95-projectflow-quotation-db-read-model-implementation-closure-2026-04-12.md`
- `MD96-projectflow-quote-cost-ecosystem-residual-fallback-retirement-spec-2026-04-12.md`
- `MD97-projectflow-quote-cost-ecosystem-fallback-retirement-phase-2-spec-2026-04-12.md`
- `MD98-projectflow-closeout-archive-read-model-formalization-spec-2026-04-12.md`
- `MD99-projectflow-closeout-archive-semantics-extraction-spec-2026-04-12.md`

---

## 3.3 已完成 / closure 記錄（COMPLETED）

以下文件保留 closure / 驗收價值，但不應再當成待辦主入口：

- `MD74-projectflow-accounting-center-personnel-closure-and-global-next-step-recommendation-2026-04-12.md`
- `MD77-projectflow-client-collection-mainline-closure-and-accounting-center-active-projects-alignment-2026-04-12.md`
- `MD111-projectflow-vendor-data-batch1-foundation-and-profile-validation-closure-2026-04-13.md`
- `MD113-projectflow-batch2-quote-cost-reconciliation-payable-closeout-ingress-closure-2026-04-13.md`
- `MD115-projectflow-batch3-closeout-retained-read-model-performance-closure-2026-04-13.md`
- `MD118-projectflow-batch4-upstream-execution-lines-write-read-closure-final-2026-04-13.md`
- `MD119-projectflow-md108-batch1-to-batch4-completion-summary-and-next-scope-2026-04-13.md`
- `MD125-projectflow-post-md108-phase-p1-validation-hardening-matrix-final-closure-2026-04-13.md`
- `MD129-projectflow-post-md108-phase-p2-retained-component-formalization-final-closure-2026-04-13.md`
- `MD133-projectflow-post-md108-phase-p3-home-overview-active-aggregation-final-closure-2026-04-13.md`
- `MD134-projectflow-post-md133-project-detail-dispatch-and-ui-closure-2026-04-14.md`
- `MD135-projectflow-ui-consistency-95-percent-closure-and-guardrails-2026-04-15.md`
- `MD137-projectflow-guardrails-round1-implementation-closure-2026-04-15.md`

---

## 3.4 已被覆蓋 / 過期（SUPERSEDED）

這批文件有歷史價值，但目前不應再當主入口：

- `MD69-projectflow-accounting-center-db-first-phase-a-cto-execution-plan-2026-04-12.md`
  - superseded by `MD78`
- `MD73-projectflow-accounting-center-personnel-editor-redo-progress-and-remaining-ui-automation-gap-2026-04-12.md`
  - superseded by `MD74`
- `MD75-projectflow-collection-source-of-truth-and-entry-responsibility-alignment-2026-04-12.md`
  - superseded by `MD76`
- `MD79-projectflow-financial-lifecycle-phase-b-payable-lifecycle-entry-spec-2026-04-12.md`
  - superseded by `MD80`

---

## 3.5 歷史脈絡保留（HISTORICAL）

以下文件保留演變脈絡與排障價值，但不可作主入口：

- `MD1-projectflow-handover.md`
- `MD4-conversation-context-rule-and-vendor-flow-notes-2026-03-31.md`
- `MD5-vendor-flow-context-handoff-2026-03-31.md`
- `MD6-vendor-flow-v1-cto-delivery-2026-04-01.md`
- `MD7-vendor-flow-discussion-handoff-2026-04-01.md`
- `MD8-package-page-final-outgoing-document-handoff-2026-04-02.md`
- `MD9-project-detail-vendor-information-architecture-handoff-2026-04-02.md`
- `MD10-projectflow-deployment-debug-and-integration-reset-handoff-2026-04-02.md`
- `MD11-projectflow-integration-progress-and-next-planning-handoff-2026-04-02.md`
- `MD12-projectflow-this-page-ui-followup-2026-04-03.md`
- `MD13-projectflow-ui-polish-handoff-2026-04-03.md`
- `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
- `MD15-projectflow-repo-audit-summary-v1-2026-04-04.md`
- `MD16-projectflow-current-round-handoff-2026-04-04.md`
- `MD27-projectflow-financial-handoff-2026-04-06.md`
- `MD30-projectflow-md29-upstream-phase1-progress-unverified-2026-04-07.md`
- `MD67-projectflow-latest-global-progress-refresh-2026-04-12.md`
- `MD68-projectflow-downstream-financial-closure-global-signoff-2026-04-12.md`
- `MD70-projectflow-accounting-center-personnel-editor-runtime-stability-bug-and-next-step-2026-04-12.md`
- `MD71-projectflow-current-personnel-bugfix-working-set-2026-04-12.md`
- `MD72-projectflow-accounting-center-personnel-redo-handoff-2026-04-12.md`
- `MD-projectflow-left-sidebar-root-cause-2026-04-04.md`

---

## 3.6 封存候選（ARCHIVE CANDIDATES）

### 高優先封存候選
- `MD4-conversation-context-rule-and-vendor-flow-notes-2026-03-31.md`
- `MD5-vendor-flow-context-handoff-2026-03-31.md`
- `MD6-vendor-flow-v1-cto-delivery-2026-04-01.md`
- `MD7-vendor-flow-discussion-handoff-2026-04-01.md`
- `MD10-projectflow-deployment-debug-and-integration-reset-handoff-2026-04-02.md`
- `MD11-projectflow-integration-progress-and-next-planning-handoff-2026-04-02.md`
- `MD12-projectflow-this-page-ui-followup-2026-04-03.md`
- `MD13-projectflow-ui-polish-handoff-2026-04-03.md`
- `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
- `MD16-projectflow-current-round-handoff-2026-04-04.md`
- `MD27-projectflow-financial-handoff-2026-04-06.md`
- `MD-projectflow-left-sidebar-root-cause-2026-04-04.md`

### 中優先封存候選
- `MD1-projectflow-handover.md`
- `MD8-package-page-final-outgoing-document-handoff-2026-04-02.md`
- `MD9-project-detail-vendor-information-architecture-handoff-2026-04-02.md`
- `MD30-projectflow-md29-upstream-phase1-progress-unverified-2026-04-07.md`

### 不建議封存（應保留根目錄）
- `MD-MASTER-projectflow-system-source-of-truth.md`
- `MD-INDEX-projectflow-document-map-2026-04-09.md`
- `MD-INDEX-projectflow-status-board-2026-04-12.md`
- `MD-CLEANUP-projectflow-status-map-2026-04-09.md`
- `MD20`～`MD26`
- `MD34`～`MD56`
- `MD133`～`MD137`

---

## 4. Repo 現況盤點（2026-04-16）

## 4.1 Git / branch / remote
已確認：
- branch = `main`
- remote = `git@github.com:willy841/projectflow.git`

與母檔規則一致。

補充：
- 目前 workspace / repo 並非乾淨工作樹
- 有 modified 與 untracked 檔案存在
- 後續實作前需特別注意不要誤覆蓋既有內容

---

## 4.2 App routes 現況
目前 repo 已具備完整多模組路由骨架，至少包括：

### 核心主線頁
- `/`
- `/projects`
- `/projects/[id]`
- `/projects/new`

### 三條線工作臺 / 文件主線
- `/design-tasks`
- `/design-tasks/[id]`
- `/design-tasks/[id]/document`
- `/procurement-tasks`
- `/procurement-tasks/[id]`
- `/procurement-tasks/[id]/document`
- `/vendor-assignments`
- `/vendor-assignments/[id]`
- `/vendor-assignments/[id]/document`
- `/vendor-packages`
- `/vendor-packages/[id]`

### financial / closeout / vendor data
- `/quote-costs`
- `/quote-costs/[id]`
- `/closeouts`
- `/closeouts/[id]`
- `/closeout`
- `/closeout/[id]`（相容 / redirect 用途）
- `/vendors`
- `/vendors/[id]`

### Accounting Center
- `/accounting-center`

管理判斷：
- repo 已不是早期 mock-only 草稿骨架
- 已是具備多模組正式骨架的系統

---

## 4.3 API / DB adapter / read-model 現況
目前 `src/app/api` 與 `src/lib/db` 已具備大量正式承接層，包括：

### API 層
- `projects`
- `project-requirements`
- `design-tasks`
- `procurement-tasks`
- `vendor-tasks`
- `vendors`
- `vendor-payments`
- `vendor-groups`
- `financial-projects`
- `accounting/*`

### DB / read-model / adapter 層
- `home-overview-read-model.ts`
- `closeout-list-read-model.ts`
- `closeout-detail-read-model.ts`
- `quotation-read-model.ts`
- `project-flow-adapter.ts`
- `design-flow-adapter.ts`
- `procurement-flow-adapter.ts`
- `vendor-flow-adapter.ts`
- `vendor-financial-adapter.ts`
- `vendor-directory-adapter.ts`
- `vendor-package-adapter.ts`
- `financial-flow-adapter.ts`

管理判斷：
- 系統已進入 DB-first / adapter / read-model 主線
- 後續不得再把整體系統誤判為純 local mock UI

---

## 4.4 主要 components 現況
目前主要元件結構已對應到產品主線：

### project / execution / requirements
- `project-detail-shell.tsx`
- `execution-tree.tsx`
- `execution-tree-section.tsx`
- `requirements-panel.tsx`
- `excel-task-import.ts`

### 三條線 workbench
- `design-plan-editor-client.tsx`
- `procurement-plan-editor-client.tsx`
- `vendor-plan-editor-client.tsx`
- `mock-editable-plan-list.tsx`
- `vendor-group-confirm-client.tsx`

### vendor / package / financial / closeout
- `project-vendor-section.tsx`
- `vendor-assignment-detail.tsx`
- `vendor-assignment-overview.tsx`
- `vendor-package-detail.tsx`
- `vendor-package-detail-route.tsx`
- `vendor-detail-shell-db.tsx`
- `vendor-list-page-db.tsx`
- `quote-cost-detail-client.tsx`
- `quote-cost-list-client.tsx`
- `closeout-list-client.tsx`
- `accounting-center-page.tsx`

管理判斷：
- closeout reopen 與三條線 workbench formalization 已有 code 落地基礎
- repo 結構與 `MD134`～`MD137` 的敘述基本一致

---

## 5. 目前可視為已完成到可續接層級的系統項目

以下項目依目前 MD 與 repo 交叉判斷，可視為已完成到可續接層級：

1. homepage DB-backed active overview aggregation
2. `/projects` / `/projects/new` / `/projects/[id]` 主線骨架
3. project requirements CRUD
4. execution items manual CRUD + import persistence
5. design / procurement / vendor dispatch 主鏈
6. vendor matching 結構版
7. closeout reopen 第一批
8. 三條線 workbench formalization 第一批
9. vendor data 既有主體
10. quote-cost / closeout / vendor-data / accounting-center 的正式頁面骨架

---

## 6. 目前最合理的下一輪方向

依 `MD134`、`MD136`、`MD137` 與 repo 現況綜合判斷，現在最合理的下一輪方向為：

### 第一優先
1. 測試資料治理
2. closeout / 已結案主線正式收斂

### 第二優先
3. 三條線 workbench formalization 第二輪
4. 指定頁面的 UI polish / alignment

### 不應自動前推
- Accounting Center / Phase P4
- Vendor Data 功能重開
- 全站無差別大掃 / 大刪 / 大改

---

## 7. 一句話總結

> `MD138` 的目的不是重寫 `projectflow`，而是把目前散落的 MD 與 repo 現況整理成可操作狀態：目前應以 `MD-MASTER`、兩份 index、以及 `MD133`～`MD137` 作為最高優先續接入口；`MD69`、`MD73`、`MD75`、`MD79` 已屬 superseded；`MD4`～`MD16`、`MD27`、`MD30` 與左選單根因檔多屬歷史 / 封存候選；而 repo 本身已進入 DB-first / adapter / read-model 主線，不可再誤判為早期 mock-only 系統。