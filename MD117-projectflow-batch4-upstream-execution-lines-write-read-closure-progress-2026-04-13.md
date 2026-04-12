# MD117 — projectflow Batch 4 upstream + execution lines write/read closure progress (2026-04-13)

> Status: ACTIVE / PARTIAL-CLOSURE  
> Note: 本文件記錄 `MD116` Batch 4 目前做到的驗收停點。這不是 Batch 4 全量完結，而是本輪可交接的正式 progress / closure handoff。

## 1. 本輪目標

依 `MD116`，本輪先收：
1. upstream project detail / requirement communication closure
2. vendor line 明確產品落差（按鈕語意）對齊
3. 以 build 驗證本輪已改主線

---

## 2. 已完成項

### 2.1 Batch 4 source-map audit 已完成第一輪
已完成盤點：
- upstream / project detail
- execution dispatch 入口
- design / procurement / vendor 三條線 adapter

本輪明確鎖定兩個已可直接落地的 gap：
1. `需求溝通` 不是 DB-first
2. vendor line 主按鈕語意未對齊 `MD103`

### 2.2 upstream 需求溝通已正式 DB-first
已新增 migration：
- `project-mgmt/db/migrations/20260413_project_requirements.sql`

已新增 API：
- `POST /api/projects/[id]/requirements`
- `PATCH / DELETE /api/project-requirements/[requirementId]`

已完成效果：
- 需求溝通不再只是 client-only state
- create / edit / delete 走正式 API
- list readback 改承接 DB
- 排序依 `updated_at desc, created_at desc`
- timestamp 正式 readback

### 2.3 `project-flow-adapter` 已承接 requirements readback
已完成：
- `getDbProjectById()` 會正式 query `project_requirements`
- `project detail` 現在可讀回正式 `需求溝通` 紀錄

### 2.4 `RequirementsPanel` 已接正式 write path
已完成：
- `RequirementsPanel` 改收 `projectId`
- 建立 / 修改 / 刪除改走 API
- 不再用前端臨時 timestamp 當唯一真值

### 2.5 vendor line 主按鈕語意已對齊 `MD103`
已完成：
- `全部確認並前往最終文件頁` → `全部確認`
- loading 文案改為：`全部確認中...`
- error 文案改為：`全部確認失敗`
- vendor assignment detail 補充說明改為：
  - 此層可先儲存編輯，正式成立點為上方「全部確認」

此段已與 `MD103` 對齊。

---

## 3. 驗收結果

### 3.1 build 驗證
已完成：
- `npm run build`
- 結果：PASS

已確認新 route 存在：
- `/api/projects/[id]/requirements`
- `/api/project-requirements/[requirementId]`

### 3.2 本停點正式判讀
可正式判定：
- upstream `需求溝通` 已從假 state 升為正式 DB-first 主線
- vendor line 主按鈕語意已與產品規則對齊
- 本輪修改已通過 build 驗證

---

## 4. 尚未完成 / 明確保留項

### 4.1 design line deeper closure 尚未完成
尚未正式收完：
- `儲存 vs 全部確認` 分層驗證
- 覆蓋式重送驗證
- document table / export same-source 驗證

### 4.2 procurement line deeper closure 尚未完成
尚未正式收完：
- `儲存 vs 全部確認` 分層驗證
- 覆蓋式重送驗證
- document table / export same-source 驗證

### 4.3 vendor line document-layer deeper formalization 尚未完成
目前已修按鈕語意，但尚未完整驗：
- project × vendor grouping same-source
- document background info same-source
- document rows 欄位語意是否最終正確

---

## 5. 風險與限制

1. `ExecutionTreeSection` 是歷史高風險區，本輪未直接動它的 callback 結構
2. design / procurement / vendor 三條線雖已存在正式骨架，但 deeper same-source 驗證仍需續做
3. 本停點是 Batch 4 partial closure，不可誤判成整批完結

---

## 6. 關鍵檔案

- `MD116-projectflow-upstream-execution-lines-write-read-closure-work-package-2026-04-13.md`
- `project-mgmt/db/migrations/20260413_project_requirements.sql`
- `project-mgmt/src/app/api/projects/[id]/requirements/route.ts`
- `project-mgmt/src/app/api/project-requirements/[requirementId]/route.ts`
- `project-mgmt/src/components/requirements-panel.tsx`
- `project-mgmt/src/components/project-detail-shell.tsx`
- `project-mgmt/src/lib/db/project-flow-adapter.ts`
- `project-mgmt/src/components/vendor-group-confirm-client.tsx`
- `project-mgmt/src/app/vendor-assignments/[id]/page.tsx`

---

## 7. 下一步建議

下一輪 Batch 4 應直接接：
1. design line `儲存 vs 全部確認` / overwrite semantics validation
2. procurement line 同規格 validation
3. vendor line document-layer / grouping same-source validation
4. 補 frontend + DB truth comparison，不只停在 build

---

## 8. 一句話總結

> Batch 4 目前已完成第一個正式可驗收停點：把 upstream `需求溝通` 從純前端暫存升為正式 DB-first 主線，補齊 migration、API、adapter readback、timestamp 與排序，並同步把 vendor line 主按鈕語意對齊 `MD103` 的「全部確認」正式規則；build 已通過。這一輪是 Batch 4 的 partial closure，不是全批完結，接下來應直接續收 design / procurement 的 confirm-all / overwrite semantics，以及 vendor line 的 document-layer / grouping same-source 驗證。