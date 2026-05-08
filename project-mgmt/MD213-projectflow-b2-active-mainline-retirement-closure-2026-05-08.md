# MD213 — projectflow B2 active mainline retirement closure — 2026-05-08

Status: ACTIVE / CLOSURE

Parent:
- `MD212-projectflow-b2-parity-closure-and-manual-cost-alignment-2026-05-08.md`

---

## 1. 這份文件的目的

這份文件記錄本輪在 `projectflow` B2 主線上，如何把 quote-cost preload / cost bridge / vendor package bridge / detail client 的 active compatibility chain 收斂到正式 preload-based mainline，並確認最後剩下的 legacy island 已退場。

---

## 2. 本輪完成的主線收斂

### 2.1 cost bridge 不再自行從 local execution persistence 重建 design/procurement formal rows

完成：
- 移除 `workflow-cost-bridge.ts` 內 `getMockFormalReadbackRowsForCost()`
- design / procurement cost item 改為只接受 `preloadedFormalRows`

Commit:
- `bc10f9d` — `refactor: retire local formal row fallback from cost bridge`

---

### 2.2 vendor package bridge 的假 DB runtime surface 已收窄

完成：
- 移除 bridge 裡假的 DB provider surface / 未使用介面
- 明確化 DB package source 應由 upstream preload 提供

Commit:
- `7fb79c7` — `refactor: narrow vendor package bridge runtime surface`

---

### 2.3 vendor draft fallback 命名誠實化

完成：
- `VendorPackageFormalFallbackRow` → `VendorPackageDraftFallbackRow`
- `getMockVendorPackageFormalRows()` → `getDraftFallbackRowsFromVendorAssignments()`
- 將這條 fallback 明確標成 draft-derived package-like fallback

Commit:
- `18b236e` — `refactor: relabel vendor draft fallback surface`

---

### 2.4 vendor package preload 正式接到 bridge boundary

完成：
- `workflow-vendor-package-bridge.ts` 新增 input boundary，接受 `{ projectId, preloadedDbPackages }`
- `workflow-cost-bridge.ts` 不再自行做 vendor DB package branch 分流，而是回到 vendor package bridge boundary 處理

Commit:
- `d60b251` — `refactor: accept vendor package preload at bridge boundary`

---

### 2.5 vendor package item contract 補上 execution linkage

完成：
- `VendorPackageItem` 新增 `sourceExecutionItemId`
- DB package source 與 draft fallback package item 皆可攜帶正式 execution linkage
- 這是後續完全淘汰 assignment-fallback 的前置條件

Commit:
- `7a87637` — `refactor: carry execution linkage through vendor package items`

---

### 2.6 detail client 不再依賴整包 fallback project overlay

完成：
- `QuoteCostDetailClient` 不再經由 `getQuoteCostProjectsForClientFallback()` 先拿整包 fallback project
- 改成直接以：
  - `projectId`
  - `seedCostItems`
  - `preloadedDbPackages`
  - `preloadedFormalRows`
  直接導出當前 project 的 cost items

Commit:
- `e861aac` — `refactor: derive detail cost items directly from preloaded sources`

---

## 3. 最後一塊 legacy island 已確認為 dead code 並退休

### 結論

檢查後確認：
- `getQuoteCostProjectsForClientFallback()` 的 runtime consumer 已不在 active detail mainline
- `assembleLegacyVendorFinancialRelations()` 沒有任何實際 consumer
- 相關 vendor financial relation 正式路徑已由 DB adapter 供應：
  - `src/lib/db/vendor-financial-relation-adapter.ts`

### 處理

- `src/components/legacy-vendor-financial-relations.ts` 已改為 retired stub
- `assembleLegacyVendorFinancialRelations()` 現在直接回空陣列
- boundary 已標成 retired/no-runtime-consumer
- `workflow-cost-bridgeBoundary.remainingCompatibilityConsumer` 更新為 `none-detected`

Commit:
- `refactor: retire legacy vendor financial relations helper` (see final commit of this closure round)

---

## 4. 驗證結果

本輪每刀後持續驗證：

- `npm run build`：成功
- `/api/internal/quote-cost-preload-parity`：持續維持
  - `projectCount = 19`
  - `mismatchProjectCount = 0`

這代表：
- active preload path
- DB detail read model
- active quote-cost mainline

在本輪收斂後仍保持對齊，沒有因 retirement 回退。

---

## 5. 本輪對主任務的完成判定

若本輪主任務定義為：

> 把 quote-cost preload / bridge / detail active mainline 從 local transitional / fake boundary / wrapper-heavy 狀態收斂到 preload-based formal chain，並清掉 active mainline 之外最後可辨識的 legacy compatibility island。

則本輪可判定：

# 已完成

理由：
1. active detail mainline 已不再依賴 local formal row fallback
2. vendor package preload 已進入正確 bridge boundary
3. detail client 已不再依賴整包 fallback project overlay
4. vendor package item contract 已帶 execution linkage
5. parity 持續為 0
6. 最後 legacy vendor financial relations helper 已確認無 consumer，並退休

---

## 6. 現在真正剩下的是什麼

這輪完成後，剩下的已不是 active mainline retirement 主任務本體，而是後續可選的清理 /優化：

1. `getQuoteCostProjectsForClientFallback()` 本身若未來確定完全無 caller，可直接刪除
2. `workflow-derived-board.ts` 仍存在 local transitional path，但不在本輪 active quote-cost mainline closure 的必要範圍內
3. `workflow-vendor-package-bridge.ts` 的 assignment-fallback 仍是最後保底 fallback，但其主線壓力已大幅下降，後續可再安排最終刪除/替換

---

## 7. 一句話總結

> **B2 本輪已把 active quote-cost preload / bridge / detail mainline 正式收斂完成，parity 持續為 0，最後 remaining legacy vendor financial relations helper 也已退休；本輪主任務可視為完成。**
