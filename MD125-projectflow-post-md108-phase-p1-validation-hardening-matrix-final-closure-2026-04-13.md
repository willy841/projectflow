# MD125 — projectflow post-MD108 Phase P1 validation hardening matrix final closure (2026-04-13)

> Status: CLOSED / SIGNED-OFF  
> Phase: post-MD108 / Phase P1  
> Role: `MD120` / `MD121` 所定義的 Phase P1 validation hardening matrix 最終 closure 文件。  
> Important: 本文件代表 post-MD108 第一個正式 work package 已完成驗收收口。

---

## 1. 本批正式範圍

依 `MD121`，本批固定範圍為：

1. design line end-to-end confirmation overwrite validation
2. procurement line end-to-end confirmation overwrite validation
3. vendor grouping / package / document-layer end-to-end validation
4. quote-cost collection / reconciliation / closeout 完整 e2e 補齊
5. closeout retained read-model query timing baseline

固定規則：
- 本批是 post-MD108 / Phase P1
- 不回頭重開 `MD108 Batch 1–4`
- 驗收標準為 frontend / request-driven flow + backend DB truth comparison
- 每條主線至少碰 overwrite / stale-data / retained-readback 驗證點

---

## 2. 最終驗收結果

### 2.1 design overwrite validation — 通過
已完成：
- old -> confirm
- new -> confirm
- confirmation_no 遞增
- latest snapshot 承接新值
- 舊 snapshot 保留
- DB truth readback 正確

對應驗收檔：
- `project-mgmt/tests/design-confirm-overwrite-e2e.spec.ts`

結論：
- **PASS**

---

### 2.2 procurement overwrite validation — 通過
已完成：
- old -> confirm
- new -> confirm
- confirmation_no 遞增
- latest snapshot 承接新值
- 舊 snapshot 保留
- DB truth readback 正確

對應驗收檔：
- `project-mgmt/tests/procurement-confirm-overwrite-e2e.spec.ts`

結論：
- **PASS**

---

### 2.3 vendor grouping / package / document-layer validation — 通過
已完成：
- vendor group route 正式格式確認：`projectId~vendorId`
- group confirm write path 驗證
- package / document-layer 承接 latest snapshot 驗證
- 新值覆蓋舊值
- 舊 snapshot 保留
- DB truth 與 package readback 對齊

對應驗收檔：
- `project-mgmt/tests/vendor-group-package-document-e2e.spec.ts`

結論：
- **PASS**

---

### 2.4 quote-cost collection / closeout retained full chain — 通過
已完成：
- active 狀態下 collection create -> DB truth 驗證
- quote-cost detail readback 驗證
- closeout write path 驗證
- closeout 成功後 retained detail readback 驗證

對應驗收檔：
- `project-mgmt/tests/quote-cost-full-chain-e2e.spec.ts`

結論：
- **PASS**

---

### 2.5 closeout retained read-model query timing baseline — 通過
已完成：
- 修正 closeout list read-model 錯表名：
  - `financial_manual_cost_items` -> `financial_manual_costs`
- retained baseline 量測完成

baseline（5 runs）：
- closeout list read-model：約 **38.85–43.84 ms**
- closeout detail side query：約 **119.83–124.57 ms**

量測條件：
- 驗收 project：`11111111-1111-4111-8111-111111111111`
- 專案狀態已成功 closeout 為 `已結案`
- listCount = 1
- projectFound = 1
- collectionCount = 8
- vendorPaymentCount = 1

結論：
- **PASS / baseline established**

---

## 3. 本輪實際修補的關鍵點

### 3.1 驗收策略修正
execution lines 與 vendor 最終改採更穩定的：
- request-driven write path
- DB truth comparison

而非完全依賴 UI runner timing。

### 3.2 vendor route/source-map 對齊
已確認 vendor group route 正式格式為：
- `projectId~vendorId`

### 3.3 closeout retained schema 對齊
已修正：
- `src/lib/db/closeout-list-read-model.ts`
- 錯表名 `financial_manual_cost_items`
- 正式更正為 `financial_manual_costs`

### 3.4 retained UI closure
已修補 closeout retained view，使 collection table 在 retained mode 也會 render，確保 archiveCollections 可被正式 readback 驗證。

---

## 4. 最終管理結論

### Phase P1 是否完成？
是。

### 是否可正式收口？
可以。

### 是否仍有未完成主線？
就 `MD121` 定義的五條固定範圍而言：
- **沒有**

---

## 5. 與後續 phase 的邊界

Phase P1 已完成後，後續不可再把以下內容混回本批：
- retained / component formalization（Phase P2）
- Home overview aggregation closure（Phase P3）
- Accounting Center extension（Phase P4）

尤其：
- **不要把 Accounting Center extension 混回這一批**

---

## 6. 一句話總結

> `MD125` 代表 post-MD108 / Phase P1 validation hardening matrix 已正式完成：design、procurement、vendor 三條 overwrite / package 主線已通過 request + DB truth 驗收；quote-cost active -> closeout retained full chain 已通過；closeout retained read-model baseline 已建立，並同時修正 schema 與 retained UI closure 問題。