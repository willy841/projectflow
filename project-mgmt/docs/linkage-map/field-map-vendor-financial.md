# 廠商 / 對帳 / 付款欄位

## 欄位：對帳群組
- 來源：`financial_reconciliation_groups`
- 你在哪裡看：
  - `Quote Cost`
  - `Vendor Detail`
  - `Closeout`
- 會影響：
  - 對帳摘要
  - 對帳群組筆數
  - Vendor 成本承接

## 欄位：已對帳群組 / 未對帳群組
- 來源：`financial_reconciliation_groups.reconciliation_status`
- 你在哪裡看：
  - `Vendor Detail` 的 `已對帳群組 X 筆 / 未對帳群組 Y 筆`
- 注意：
  - 這是 **群組層**
  - 不是內容筆數

## 欄位：發包內容筆數
- 來源：confirmed snapshot 內容 / costItems 承接內容
- 你在哪裡看：
  - `Vendor Detail` 的 `X 筆發包內容`
- 注意：
  - 這是 **內容層**
  - 不等於對帳群組數

## 欄位：Vendor list 未付總額
- 來源：跨所有專案加總後的 **已對帳但未付款** 金額
- 你在哪裡看：`Vendor list`
- 會被什麼影響：
  - `financial_reconciliation_groups`（已對帳金額）
  - `project_vendor_payment_records`（已付款）
- 注意：
  - 不看未對帳金額
  - 不只看單一專案

## 欄位：Vendor detail 未付金額
- 來源：單一 vendor 在各專案的 `adjustedCost - paidAmount`
- 你在哪裡看：`Vendor Detail`
- 成立條件：
  - 先有已對帳金額
  - 再扣掉付款紀錄

## 欄位：付款狀態
- 規則：
  - 只剩 `未付款` / `已付款`
  - 沒有 `部分付款`
- 成立條件：
  - 已全部對帳 且 `paidAmount >= adjustedCost` → `已付款`
  - 其他 → `未付款`

## 欄位：付款紀錄
- 來源：`project_vendor_payment_records`
- 你在哪裡改：`Vendor Detail -> 標記為已付款 / 建立付款`
- 會影響：
  - `Vendor Detail` 未付金額
  - `Vendor list` 未付總額
  - 過往紀錄 / 未結帳切換
