# MD124 — projectflow post-MD108 Phase P1 validation hardening completion status (2026-04-13)

> Status: ACTIVE / COMPLETION-STATUS  
> Phase: post-MD108 / Phase P1  
> Role: 記錄本輪在持續修補與重驗後，哪些主線已正式完成驗收，哪些仍存在前提缺口，避免把部分完成說成全部 closure。

---

## 1. 已正式完成驗收的主線

### 1.1 design line overwrite validation — 完成
已完成內容：
- sync old -> confirm
- sync new -> confirm
- `confirmation_no` 遞增
- latest snapshot 承接新值
- 舊 snapshot 保留
- DB truth readback 正確

對應驗收檔：
- `project-mgmt/tests/design-confirm-overwrite-e2e.spec.ts`

結論：
- **完成驗收**

---

### 1.2 procurement line overwrite validation — 完成
已完成內容：
- sync old -> confirm
- sync new -> confirm
- `confirmation_no` 遞增
- latest snapshot 承接新值
- 舊 snapshot 保留
- DB truth readback 正確

對應驗收檔：
- `project-mgmt/tests/procurement-confirm-overwrite-e2e.spec.ts`

結論：
- **完成驗收**

---

### 1.3 vendor grouping / package / document-layer validation — 完成
已完成內容：
- vendor group route 正式格式確認為 `projectId~vendorId`
- task sync old -> group confirm
- task sync new -> group confirm
- package 頁承接 latest snapshot
- 新值覆蓋舊值
- 舊 snapshot 保留
- DB truth 與 package/document-layer readback 對齊

對應驗收檔：
- `project-mgmt/tests/vendor-group-package-document-e2e.spec.ts`

結論：
- **完成驗收**

---

## 2. 已明顯推進但尚未可宣稱全部 closure 的主線

### 2.1 quote-cost collection / stale guard / DB truth — 部分完成
已完成：
- collection create API -> DB truth 驗證成立
- quote-cost detail 頁 readback 成立
- stale guard probe 成立
- selector/source-map 問題已收斂多輪

對應驗收檔：
- `project-mgmt/tests/quote-cost-full-chain-e2e.spec.ts`

目前缺口：
- 測試原本假設 `/closeout/[projectId]` 可直接讀 retained detail
- 但實際驗收 project 目前沒有可讀 closeout archive source
- 因此 `/closeout/11111111-1111-4111-8111-111111111111` 目前回 404

結論：
- **quote-cost active side（collection + stale guard + DB truth）已成立**
- 但 **full chain 到 retained closeout detail 尚未 closure**

---

### 2.2 closeout retained read-model query timing baseline — 尚未完成
已完成：
- 已修正 closeout list read-model 錯表名：
  - `financial_manual_cost_items` -> `financial_manual_costs`
- build 通過
- schema/runtime gap 已先修掉一個真正 root cause

目前缺口：
- 要做 retained detail / timing baseline，前提是驗收 project 必須先有可讀 closeout archive source
- 目前驗收 project 的 closeout detail route 404，表示 retained archive 前提資料尚未具備或未對齊

結論：
- **schema gap 已部分修補**
- **retained baseline 尚未完成驗收**

---

## 3. 本輪最準確的管理判斷

### 已可宣稱完成的
1. design overwrite validation
2. procurement overwrite validation
3. vendor grouping / package / document-layer validation

### 不可誤報為已全部完成的
4. quote-cost full chain（因 retained closeout detail 前提資料未齊）
5. closeout retained timing baseline（因 retained archive source 尚未成立）

---

## 4. 下一步建議

若要把 Phase P1 五條全部正式收完，下一步應：

1. 先補齊 / 建立驗收 project 的 closeout archive source-of-truth
2. 再重跑：
   - `quote-cost-full-chain-e2e.spec.ts`
   - closeout retained baseline 量測
3. 補最終 closure MD，明確標註 Phase P1 全數完成

---

## 5. 一句話總結

> 截至 `MD124`，post-MD108 Phase P1 五條主線中，前三條（design / procurement / vendor）已正式完成驗收；financial 相關兩條已實際推進並修掉部分 root cause，但因驗收專案尚未具備可讀的 closeout retained archive source，尚不能誤報為全部 closure。