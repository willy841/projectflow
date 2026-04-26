# MD167 — projectflow acceptance entry map and do-not-misuse list — 2026-04-27

Status: ACTIVE / SHORT ENTRY MAP
Purpose: 提供一份夠短、夠直接的 acceptance 索引，避免後續再拿錯測試方法、錯用 stale tests、或把 legacy expectation 當正式 blocker。

---

## 1. 目前正式主線 acceptance（優先使用）

### 正式主入口
- `npm run test:formal-acceptance:v2`

### 正式主體位置
- `tests/formal-acceptance-v2/`

### 目前 vendor / financial / closeout 最相關正式 blocker 檔案
- `tests/formal-acceptance-v2/04-vendor-package-mainline.spec.ts`
- `tests/formal-acceptance-v2/05-quote-cost-mainline.spec.ts`
- `tests/formal-acceptance-v2/06-closeout-retained-readback.spec.ts`
- `tests/formal-acceptance-v2/07-vendor-unpaid-history-and-payment-reversal.spec.ts`
- `tests/formal-acceptance-v2/08-closeout-list-and-manual-cost-freeze.spec.ts`
- `tests/formal-acceptance-v2/09-cross-flow-formal-mainline-smoke.spec.ts`

### 什麼時候用這條
若問題是：
- 這輪 UI / code 有沒有把正式功能改壞？
- vendor / quote-cost / closeout / cross-flow 主線還在不在？
- 要不要判定 blocker？

**先跑這條，不要先拿舊 vendor tests。**

---

## 2. 正式但非主 blocker 的補充 acceptance

### 仍可用的補充驗收
- `tests/formal-acceptance-requirements-crud.spec.ts`
- `tests/formal-acceptance-execution-item-excel-import.spec.ts`
- `tests/formal-acceptance-execution-item-excel-upload-ui.spec.ts`
- `tests/batch4-upstream-requirements-api.spec.ts`

### 對應 script
- `npm run test:formal-acceptance:legacy`

### 定位
這些不是目前 vendor / financial / closeout 主 blocker 的第一入口，
但仍屬可用補充驗收，不等於 stale。

---

## 3. 已明確標示為 stale / archived，不可當 blocker

### 位置
- `tests/legacy/stale-vendor-ui-contract/`

### 包含檔案
- `vendor-data-batch1-profile.spec.ts`
- `vendor-data-batch1-history-readback.spec.ts`
- `vendor-data-batch1-history-search-sort.spec.ts`
- `vendor-data-batch1-payment-state.spec.ts`
- `vendor-data-batch1-full-paid.spec.ts`

### 為什麼不能拿來當 blocker
因為它們綁的是 **pre-MD158 vendor detail UI contract**，包含：
- 舊 heading
- 舊 placeholder
- 舊 input 呈現方式
- 舊 `部分付款` expectation
- 舊固定 payable 金額 expectation

### 規則
- 不可再把這些 fail 直接引用為目前正式產品 fail 證據
- 若未來要恢復這類驗收，必須依現行 UI / 現行 acceptance 規則重寫

### 提示 script
- `npm run test:legacy:stale-vendor-ui-contract`

這個 script 只會提示不要誤用，不是正式驗收入口。

---

## 4. legacy 與 stale 的差別

### legacy
- 可能較舊
- 但仍可能可用
- 只是**不是目前正式 blocker 主入口**

### stale / archived
- expectation 已明顯過時
- 若直接拿來跑，容易產生錯誤紅燈
- **不可再拿來判現在正式 UI / 正式主線有沒有壞**

---

## 5. 後續硬規則

1. 要判 blocker：
   - **先跑 `formal-acceptance-v2`**
2. 要驗 vendor / quote-cost / closeout 主線：
   - 先看 `04 / 05 / 06 / 07 / 08 / 09`
3. 不可把 `tests/legacy/stale-vendor-ui-contract/` 當正式 blocker
4. 若測試綁的是舊文案 / 舊 heading / 舊 partial-payment expectation：
   - 要麼封存
   - 要麼重寫
   - 不可直接沿用

---

## 6. 一句話版本

> 正式 blocker 一律先看 `tests/formal-acceptance-v2/`；`tests/legacy/stale-vendor-ui-contract/` 只代表舊契約殘留，不代表現在正式主線壞掉。
