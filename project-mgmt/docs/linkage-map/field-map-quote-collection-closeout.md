# 報價 / 收款 / 結案欄位

## 欄位：報價匯入
- 來源：
  - `financial_quotation_imports`
  - `financial_quotation_line_items`
- 你在哪裡改：`Quote Cost / 匯入報價`
- 會影響：
  - `Quote Cost`
  - 首頁 `未收款`
  - `Closeout`

## 欄位：收款紀錄
- 來源：`project_collection_records`
- 你在哪裡改：`Quote Cost detail / 新增收款`
- 會影響：
  - 首頁 `已收款 / 未收款`
  - `Closeout`
  - 專案收款狀態相關摘要

## 欄位：成本來源
- 來源：
  - `design confirmations`
  - `procurement confirmations`
  - `vendor confirmations`
  - `financial_manual_costs`（若有）
- 你在哪裡看：
  - `Quote Cost`
  - `Closeout`
  - `Vendor Detail`

## 欄位：結案保留快照
- 來源：retained snapshot / closeout retained data
- 你在哪裡看：`Closeout detail`
- 會承接：
  - 報價
  - 成本
  - 對帳群組
  - 收款結果

## 首頁三張待處理卡
- `待處理設計交辦`
- `待採購備品`
- `待廠商處理`

現在規則都不是只看 task status，
而是看：
- **有沒有 confirmed confirmation**
- 沒有 confirmed → 還在待處理
- 有 confirmed → 不算待處理
