# MD166 — projectflow stale vendor tests disposition and blocker rule — 2026-04-27

Status: ACTIVE
Role: 明確處理舊 vendor detail 測試資料與舊測試方法，避免後續被錯誤引用為正式 blocker 證據。

---

## 1. 背景

在 vendor UI 視覺對齊後，曾誤用一批舊 vendor detail 測試作為功能驗收依據，導致產生錯誤紅燈。

後續已回到 `MD158` 與正式 acceptance v2 主線重新驗證，確認：
- 正式主線驗收綠燈
- 先前那批 vendor detail 測試，至少有部分屬於舊 UI 契約 / 舊 wording / 舊狀態 expectation
- 因此不可再當目前正式 blocker

---

## 2. 正式判定

以下類型，不可再直接作為目前正式產品 fail 證據：

1. 舊 heading / 舊區塊名稱 expectation
2. 舊 placeholder expectation
3. 舊 vendor detail 欄位直接 `input[value=...]` 呈現契約
4. 舊 `部分付款` expected visible state
5. 舊固定 payable 數字 expectation（例如硬綁 `28000`）

這些測試若未重寫至符合現行 UI 與現行產品規則，不得再作為 blocker。

---

## 3. 已處理方式

已將以下舊測試自 `tests/` root 移出：

- `vendor-data-batch1-profile.spec.ts`
- `vendor-data-batch1-history-readback.spec.ts`
- `vendor-data-batch1-history-search-sort.spec.ts`
- `vendor-data-batch1-payment-state.spec.ts`
- `vendor-data-batch1-full-paid.spec.ts`

新位置：
- `tests/legacy/stale-vendor-ui-contract/`

並新增：
- `tests/legacy/stale-vendor-ui-contract/README.md`

明確標示：
- archived / stale
- 不可作為 formal blocker
- 若要續用，必須依現行正式 UI 契約重寫

---

## 4. 目前正式 blocker 路徑

目前 vendor 相關正式 blocker 仍以：
- `tests/formal-acceptance-v2/04-vendor-package-mainline.spec.ts`
- `tests/formal-acceptance-v2/07-vendor-unpaid-history-and-payment-reversal.spec.ts`
- `tests/formal-acceptance-v2/09-cross-flow-formal-mainline-smoke.spec.ts`
- 以及 `npm run test:formal-acceptance:v2`

為主。

---

## 5. 後續規則

1. 不可再把 `tests/legacy/stale-vendor-ui-contract/` 內的 fail 直接引用為目前正式產品 fail。
2. 若未來要補 vendor detail 驗收，必須：
   - 以現行 UI wording 為準
   - 以 `MD158` 規則為準
   - 以目前正式 read model / 主線語意為準
3. 若測試契約過時：
   - 要麼刪掉
   - 要麼像本次一樣移出主入口並清楚標示 stale / archived

---

## 6. 一句話總結

> 舊 vendor detail 測試已正式降級為 stale archived tests；後續正式 blocker 一律回到 MD158 對齊後的 acceptance v2 主線，不可再錯用舊 vendor UI 契約打新版本。 
