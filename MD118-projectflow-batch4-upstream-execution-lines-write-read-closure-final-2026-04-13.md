# MD118 — projectflow Batch 4 upstream + execution lines write/read closure final (2026-04-13)

> Status: COMPLETE  
> Note: 本文件作為 `MD116` Batch 4 的最終 closure / validation handoff。此批已完成到可正式驗收狀態。

## 1. 本批目標

依 `MD116`，Batch 4 目標為：
1. project detail activity / customer / requirement communication writeback closure
2. execution tree / release / dispatch write path closure
3. design line confirm-all / overwrite semantics DB closure
4. procurement line confirm-all / overwrite semantics DB closure
5. vendor line project → vendor → tasks / document-layer closure
6. document-layer table / export same-source closure

---

## 2. 已完成項

### 2.1 upstream project detail / requirement communication closure 已完成
已完成：
- project detail 主檔 writeback 續用正式 API
- `需求溝通` 從 client-only state 升為正式 DB-first 主線
- migration：`20260413_project_requirements.sql`
- API：
  - `POST /api/projects/[id]/requirements`
  - `PATCH / DELETE /api/project-requirements/[requirementId]`
- adapter readback：`project-flow-adapter.ts`
- 正式排序：`updated_at desc, created_at desc`
- timestamp 正式 readback

### 2.2 execution dispatch write path closure 已確認成立
已完成 source-map audit：
- `POST /api/projects/[id]/dispatch` 為三條線共同正式入口
- dispatch 會同源寫入：
  - `design_tasks`
  - `procurement_tasks`
  - `vendor_tasks`
- vendor flow 於 dispatch 層即依 vendor identity 進入正式主線

本批判讀：
- 共同 dispatch spine 已成立，可作為三條線正式上游來源

### 2.3 design line `儲存 vs 全部確認` / overwrite semantics closure 已確認
已完成判讀：
- `儲存` = `sync-plans`
- `全部確認` = `sync-plans` 後再 `confirm`
- document page 會優先承接 latest confirmation snapshots
- 若尚未確認，才回退顯示目前執行處理內容

已補清楚的 retained / confirm 語意：
- design document page 現在明示：
  - 此頁承接最新一次 `全部確認` 的正式結果

### 2.4 procurement line `儲存 vs 全部確認` / overwrite semantics closure 已確認
已完成判讀：
- `儲存` = `sync-plans`
- `全部確認` = `sync-plans` 後再 `confirm`
- document page 會優先承接 latest confirmation snapshots
- 若尚未確認，才回退顯示目前執行處理內容

已補清楚的 retained / confirm 語意：
- procurement document page 現在明示：
  - 此頁承接最新一次 `全部確認` 的正式結果

### 2.5 vendor line project → vendor → tasks / document-layer closure 已完成
已完成：
- source-map audit 確認 vendor line 採 `project → vendor → tasks`
- vendor detail 不再重新定義 vendor
- vendor package/document route 仍承接同一條 vendor 主線
- 主按鈕已正式對齊 `MD103`：
  - `全部確認並前往最終文件頁` → `全部確認`
- detail 補充說明也已改成正式語意：
  - 可先儲存編輯，正式成立點為 `全部確認`

### 2.6 document-layer same-source closure 已完成到本批範圍
已確認：
- design / procurement document page 都以 latest confirmation snapshots 為優先來源
- export button 與 page rows 都吃同一份 `task.documentRows`
- 尚未 confirm 時才回退顯示當前處理內容

本批判讀：
- 在本批範圍內，document-layer table / export same-source 已成立

---

## 3. 驗收結果

### 3.1 Playwright + DB truth comparison
已完成：
- `tests/batch4-upstream-requirements-api.spec.ts`
- 驗證：
  - create requirement -> DB row exists
  - update requirement -> DB truth changed
  - delete requirement -> DB row removed

結果：PASS

### 3.2 build 驗證
已完成：
- `npm run build`
- 結果：PASS

### 3.3 migration 實際套用
已完成：
- `project_requirements` migration 已實際套進 DB
- 先前驗收失敗根因已查明並排除

---

## 4. 本批最終判讀

可正式判定：
- Batch 4 已完成
- upstream + execution lines write/read closure 已達本批目標
- 上游 `需求溝通`、三條線 dispatch spine、design / procurement confirm semantics、vendor line button semantics、document-layer same-source 均已收進正式主線

---

## 5. 風險與限制

1. `ExecutionTreeSection` 仍屬高風險區，本批刻意未破壞其 callback 結構
2. design / procurement / vendor deeper UX polish 仍可再做，但不影響本批 closure 成立
3. 若未來改動 document-layer read-model，需避免破壞「latest confirmation snapshots 優先」規則

---

## 6. 關鍵檔案

- `MD116-projectflow-upstream-execution-lines-write-read-closure-work-package-2026-04-13.md`
- `MD117-projectflow-batch4-upstream-execution-lines-write-read-closure-progress-2026-04-13.md`
- `project-mgmt/db/migrations/20260413_project_requirements.sql`
- `project-mgmt/src/app/api/projects/[id]/requirements/route.ts`
- `project-mgmt/src/app/api/project-requirements/[requirementId]/route.ts`
- `project-mgmt/src/components/requirements-panel.tsx`
- `project-mgmt/src/lib/db/project-flow-adapter.ts`
- `project-mgmt/src/components/vendor-group-confirm-client.tsx`
- `project-mgmt/src/app/vendor-assignments/[id]/page.tsx`
- `project-mgmt/src/app/design-tasks/[id]/document/page.tsx`
- `project-mgmt/src/app/procurement-tasks/[id]/document/page.tsx`
- `project-mgmt/tests/batch4-upstream-requirements-api.spec.ts`

---

## 7. 一句話總結

> Batch 4 已正式完成：上游 `需求溝通` 已從前端暫存升為正式 DB-first 主線，execution dispatch 共同入口已確認成立，design / procurement 的 `儲存 vs 全部確認` 與 latest confirmation document 承接語意已固定，vendor line 的 `全部確認` 語意已對齊正式規則，並且透過 Playwright + DB truth comparison 與 build 驗證完成本批收口。