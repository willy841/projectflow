# MD121 — projectflow post-MD108 Phase P1 validation hardening matrix work package (2026-04-13)

> Status: ACTIVE  
> Phase: post-MD108 / Phase P1  
> Role: 本文件作為 `MD120` 中 **Phase P1 — Validation hardening matrix** 的第一張正式施工單。  
> Important: 本文件**不是**回頭重開 `MD108 Batch 1–4`；而是針對已完成主線補上更完整的 frontend + DB truth validation matrix。

---

## 1. 本文件定位

依 `MD119`、`MD120`：
- `MD108 Batch 1–4` 已完成
- 後續正式主線改為 post-MD108
- 第一個正式 work package 即為：
  > **Phase P1 — Validation hardening matrix**

本文件目的：
1. 先做 source-map audit
2. 明確盤點目前 repo / route / DB / test 現況
3. 把本批固定範圍收成正式施工單
4. 固定驗收標準與非本批範圍，避免 scope 漂移

---

## 2. 本批固定範圍（不可擴張）

本批只做以下 5 條主線：

1. design line end-to-end confirmation overwrite validation
2. procurement line end-to-end confirmation overwrite validation
3. vendor grouping / package / document-layer end-to-end validation
4. quote-cost collection / reconciliation / closeout 完整 e2e 補齊
5. closeout retained read-model query timing baseline

正式規則：
- 這一批是 **post-MD108 Phase P1**
- **不是**回頭重開 `MD108 Batch 1–4`
- **先做 source-map audit，再開工**
- 驗收標準固定為：
  - **實際 frontend 操作 + backend DB truth comparison**
  - **每條主線至少補一個 overwrite / stale-data / retained-readback 驗證點**

---

## 3. Source-map audit：repo / route / DB / test 現況盤點

### 3.1 design line overwrite validation 現況

#### Route / page 現況
已存在：
- `/design-tasks`
- `/design-tasks/[id]`
- `/design-tasks/[id]/document`

可見正式語意：
- detail / document 頁已明確寫出「最終文件頁承接最新一次全部確認結果；若尚未確認，才回退顯示目前執行處理內容」

#### API / DB 現況
已存在：
- `src/app/api/design-tasks/[id]/plans/route.ts`
- `src/app/api/design-tasks/[id]/replace-plans/route.ts`
- `src/app/api/design-tasks/[id]/sync-plans/route.ts`

代表：
- design line 已有 plan write path / replace path / sync path
- overwrite 語意已具備工程落點，不是純 UI mock

#### Test 現況
已存在：
- `tests/design-task-detail-and-document.spec.ts`

目前缺口：
- 只有 basic navigation / visibility 驗證
- 尚未驗：
  - 先儲存舊值
  - 再覆蓋為新值
  - 全部確認
  - document readback 承接最新確認結果
  - DB truth comparison
  - stale / overwrite 行為是否正確

#### 判斷
- design line 已有 route / write path / document 承接骨架
- **缺的是正式 overwrite e2e + DB truth validation**

---

### 3.2 procurement line overwrite validation 現況

#### Route / page 現況
已存在：
- `/procurement-tasks`
- `/procurement-tasks/[id]`
- `/procurement-tasks/[id]/document`

可見正式語意：
- document 頁與 design line 同樣承接「最新一次全部確認結果」

#### API / DB 現況
已存在：
- `src/app/api/procurement-tasks/[id]/replace-plans/route.ts`
- `src/app/api/procurement-tasks/[id]/sync-plans/route.ts`

代表：
- procurement line 同樣已有 overwrite / replace 類 write path

#### Test 現況
已存在：
- `tests/procurement-task-detail-and-document.spec.ts`

目前缺口：
- 目前只有 basic detail -> document navigation 驗證
- 尚未驗：
  - overwrite 後最新值是否取代舊值
  - 全部確認後 document-layer 是否承接最新 confirmation snapshot
  - DB truth comparison
  - stale-data / overwrite 成功覆蓋點

#### 判斷
- procurement line 與 design line相同，主線已存在
- **缺的是 overwrite-focused e2e + DB truth validation**

---

### 3.3 vendor grouping / package / document-layer 現況

#### Route / page 現況
已存在：
- `/vendor-assignments`
- `/vendor-assignments/[id]`
- `/vendor-assignments/[id]/document`（redirect 到 package）
- `/vendor-packages`
- `/vendor-packages/[id]`

目前語意已成立：
- vendor group detail 為單 `project × vendor` 執行處理層
- `全部確認` 後導向 package / 文件層
- package list / detail 已存在正式 route

#### API / DB 現況
已存在：
- `src/app/api/vendor-groups/[projectId]/[vendorId]/confirm/route.ts`
- `src/app/api/vendor-tasks/[id]/replace-plans/route.ts`
- `src/app/api/vendor-tasks/[id]/sync-plans/route.ts`
- `src/app/api/vendor-tasks/[id]/confirm/route.ts`

代表：
- vendor group confirm 已有正式 DB route
- package 主線已不是純 local mock 心智

#### Test 現況
目前已存在的相關 coverage：
- `tests/vendor-payable-lifecycle-e2e.spec.ts`
- `tests/vendor-data-batch1-*.spec.ts`
- `tests/quote-cost-vendor-payment-readback.spec.ts`

但目前缺口仍明確：
- 缺少針對 `vendor grouping -> 全部確認 -> package -> document-layer` 的完整單一路徑 e2e
- 缺少至少一個 overwrite / stale-data 驗證點
- 缺少 package/document-layer 與 DB truth 對照的完整驗收鏈

#### 判斷
- vendor 主線已有 route / group confirm / package route / DB-adapter 基礎
- **Phase P1 要補的是完整 end-to-end hardening matrix，而不是重做 vendor flow**

---

### 3.4 quote-cost collection / reconciliation / closeout 現況

#### Route / page 現況
已存在：
- `/quote-costs`
- `/quote-costs/[id]`
- `/closeout/[id]`
- `/closeouts`（redirect）
- `/closeouts/[id]`（redirect）

#### API / DB 現況
已存在：
- `src/app/api/accounting/projects/[id]/collections/route.ts`
- `src/app/api/accounting/collections/[id]/route.ts`
- `src/app/api/financial-projects/[id]/reconciliation-groups/sync/route.ts`
- `src/app/api/financial-projects/[id]/closeout/route.ts`

對應 DB table / read path 已存在：
- `project_collection_records`
- `financial_reconciliation_groups`
- closeout write path / read-model chain

closeout route 已有 stale guard：
- `stale-outstanding-total`
- `stale-reconciliation-status`
- `outstanding-not-zero`
- `reconciliation-not-complete`

#### Test 現況
已存在：
- `tests/quote-cost-collection-e2e.spec.ts`
- `tests/quote-cost-batch2-closeout.spec.ts`

目前缺口：
- collection 已有 create/delete + DB truth 驗證，但 still partial
- closeout 已有 gating / stale guard 驗證，但未形成完整大鏈路
- reconciliation group sync 與 closeout 的完整 browser-driven e2e 仍不足
- 尚未把：
  - collection
  - reconciliation
  - closeout write
  - closeout retained readback
  串成單一正式 hardening matrix

#### 判斷
- quote-cost 主線不是從零開始
- **Phase P1 要補的是完整 e2e 補齊與 stale/overwrite 類型驗證點**

---

### 3.5 closeout retained read-model query timing baseline 現況

#### Route / read-model 現況
已存在：
- `src/app/closeout/[id]/page.tsx`
- `src/lib/db/closeout-detail-read-model.ts`
- `src/lib/db/closeout-list-read-model.ts`

目前 detail read-model 已明確承接：
- closeout archive project
- collection retained rows
- vendor payment retained rows

#### DB query 現況
`closeout-detail-read-model.ts` 目前至少會：
1. 取 archive project
2. query `project_collection_records`
3. query `project_vendor_payment_records`
4. 再組裝 payable rows

代表：
- retained read-model 已成立
- 但尚未建立 query timing baseline

#### Test 現況
目前未見正式 query timing baseline 測試檔

#### 判斷
- closeout retained 主線已有實作
- **缺的是性能 / query timing 的 baseline 與 retained-readback 驗證記錄**

---

## 4. 本批正式工程目標

### P1-W1 — design overwrite validation
補一條正式 e2e：
- detail 頁修改舊值
- 再覆蓋成新值
- 全部確認
- document 頁 readback 最新值
- DB truth comparison
- 驗證舊值未殘留

### P1-W2 — procurement overwrite validation
補一條正式 e2e：
- detail 頁修改舊值
- 再覆蓋成新值
- 全部確認
- document 頁 readback 最新值
- DB truth comparison
- 驗證 stale snapshot 未殘留

### P1-W3 — vendor grouping / package / document-layer validation
補一條正式 e2e：
- 由 vendor group detail 進入
- 覆寫至少一筆 task plan 內容
- 執行 group-level `全部確認`
- 驗 package 承接結果
- 驗 document-layer 承接最新結果
- 做 DB truth comparison
- 至少補一個 stale-data / overwrite 驗證點

### P1-W4 — quote-cost full e2e hardening
補一條正式大鏈路：
- collection create / delete 或 overwrite-like stale guard 驗證
- reconciliation group sync / confirm
- closeout gating
- closeout write
- closeout retained readback
- 全程 browser-driven + DB truth comparison

### P1-W5 — closeout query timing baseline
補一條 retained baseline：
- 記錄 closeout list / detail read-model query timing
- 至少建立 current baseline 與量測方法
- 不把它包裝成 optimization 完成
- 只做 baseline / risk visibility / follow-up reference

---

## 5. 明確不做（本批排除）

### 不做 1：Accounting Center extension
這一批**不要把 Accounting Center extension 混進來**。

理由：
- `MD120` 已明確把它切到 `Phase P4`
- 本批只做 `Phase P1`

### 不做 2：重開 MD108 Batch 1–4 scope
本批不做：
- foundation 重做
- 舊批次 spec 回頭改寫成未完成
- 再把新工作塞回 `MD108`

### 不做 3：component formalization
例如：
- closeout retained-only component 重構
- vendor document-layer 再命名 / adapter 化

這些屬 `Phase P2`。

### 不做 4：Home overview active aggregation
這些屬 `Phase P3`。

---

## 6. 驗收標準（固定）

### 6.1 共通驗收標準
每條主線必須符合：
1. **實際 frontend 操作**
2. **backend DB truth comparison**
3. **至少一個 overwrite / stale-data / retained-readback 驗證點**

### 6.2 不算完成的情況
以下都不算完成：
- 只有 code review
- 只有 route 可打開
- 只有 UI 可見
- 只有 API unit test
- 只有 happy path，沒有 overwrite / stale / retained 類驗證點

---

## 7. 交付物要求

本批完成時至少要交付：
1. Phase P1 對應 test / baseline 代碼
2. closure MD
3. 若 context 接近 80–90%，主動收口並補 handoff MD
4. commit

---

## 8. 推進順序建議

建議順序：
1. design overwrite validation
2. procurement overwrite validation
3. vendor grouping / package / document-layer validation
4. quote-cost collection / reconciliation / closeout full e2e
5. closeout retained query timing baseline
6. 最後寫 closure / handoff

原因：
- 先補 execution lines overwrite 類驗證
- 再補 vendor package 主線
- 最後把 financial / retained 兩段一起收口

---

## 9. 一句話總結

> `MD121` 是 post-MD108 Phase P1 的第一張正式施工單：先基於 source-map audit 確認目前 repo 已有 design / procurement / vendor / quote-cost / closeout 的 route、DB path 與 partial tests，再補成一套更完整的 validation hardening matrix；本批只做 frontend 實操 + DB truth comparison + overwrite/stale/retained 驗證，不把 Accounting Center extension 混進來。