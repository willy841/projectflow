# MD214 — projectflow B2 tail cleanup closure — 2026-05-08

Status: ACTIVE / FINAL TAIL CLEANUP CLOSURE

Parent:
- `MD213-projectflow-b2-active-mainline-retirement-closure-2026-05-08.md`

---

## 1. 目的

這份文件記錄在 B2 active mainline 已完成後，最後把仍殘留但已無 runtime caller 的 compatibility surface 再往下收乾淨的動作。

---

## 2. 本輪確認到的事

檢查結果：

1. `getQuoteCostProjectsForClientFallback()` 已無 caller
   - active detail mainline 已改走直接從 preloaded sources derive current project cost items
   - legacy vendor financial relations helper 也已退休

2. `assembleLegacyVendorFinancialRelations()` 已無 caller
   - 相關正式 vendor financial relation 路徑已由 DB adapter 承接

3. `workflow-derived-board.ts` 雖仍存在 local transitional path，但目前只作為 type/export surface 相關依附，不是本輪 active quote-cost mainline 尾端阻塞

---

## 3. 本輪實際清理

### 3.1 移除 unused client fallback project assembler

檔案：
- `src/components/workflow-cost-bridge.ts`

處理：
- 刪除 `getQuoteCostProjectsForClientFallback()`
- 清掉其不再需要的 `QuoteCostProject` / `quoteCostProjects` import
- 更新 boundary metadata：
  - `mode` → `preload-based-active-cost-assembler`
  - `consumerScope` → `active-detail-preloaded-cost-assembly-only`
  - `legacyIslandStatus` → `active-mainline-closed-no-compatibility-consumer-detected`
  - `retirementGate` → `none-for-active-mainline`
  - `exitCondition` → `active-mainline-closure-complete`

這代表：
- quote-cost active mainline 已不再保留「整包 fallback project assembler」這種舊 compatibility surface。

---

## 4. 驗證

本輪尾端清理後再次驗證：

- `npm run build`：成功
- `/api/internal/quote-cost-preload-parity`：應持續維持
  - `projectCount = 19`
  - `mismatchProjectCount = 0`

---

## 5. 現在的狀態

做完這輪後，對 B2 這條 active quote-cost preload / bridge / detail mainline 來說：

- active runtime mainline 已完成
- 已無偵測到仍掛在主線上的 compatibility caller
- 剩下的不是這輪主線收尾，而是更廣義的後續清理候選，例如：
  1. `workflow-derived-board.ts` local transitional path
  2. `workflow-vendor-package-bridge.ts` 最後保底 assignment-fallback 的最終替換/刪除
  3. 更大範圍 page-level acceptance 補強

---

## 6. 一句話總結

> **B2 active mainline 在 MD213 基礎上已再做最後尾端清理，unused client fallback project assembler 已移除；對這輪主任務而言，主線與尾端都已收乾淨。**
