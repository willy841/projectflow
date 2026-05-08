# MD219 — projectflow formal maturity closure — 2026-05-08

Status: ACTIVE / FINAL CLOSURE

Parent:
- `MD216-projectflow-formal-maturity-criteria-v1-2026-05-08.md`
- `MD217-projectflow-formal-maturity-assessment-v1-2026-05-08.md`
- `MD218-projectflow-full-maturity-closure-plan-v1-2026-05-08.md`
- `MD212-projectflow-b2-parity-closure-and-manual-cost-alignment-2026-05-08.md`
- `MD213-projectflow-b2-active-mainline-retirement-closure-2026-05-08.md`
- `MD214-projectflow-b2-tail-cleanup-closure-2026-05-08.md`
- `MD215-projectflow-b2-hundred-percent-tail-closure-2026-05-08.md`

---

## 0. 這份文件在做什麼

這份文件是 `projectflow` 本輪正式成熟封關文件。

它回答的是：

> **為什麼現在可以正式把 `projectflow` 視為成熟系統。**

而且這個判定明確排除：
- 是否再調整 UI
- 是否新增系統指引文字
- 是否用頁面補充說明降低誤解

本輪成熟封關只依據：
- truth source
- active mainline
- cross-page consistency
- lifecycle correctness
- repeatable verification
- maintainability / compatibility surface control

---

## 1. 成熟判定母標準

本輪所有成熟判定都依據：
- `MD216-projectflow-formal-maturity-criteria-v1-2026-05-08.md`

也就是：

> **在不修改 UI、也不依賴頁面指引文字的前提下，核心流程仍能依靠單一穩定的 truth source 正確運作，跨頁結果一致，修改影響可預期，驗證可重複，且新增需求不需要再重做真相收斂。**

---

## 2. 本輪先完成的主線收斂

本輪不是直接跳到「成熟」，而是先把最關鍵的 active mainline 收斂完成。

### 2.1 B2 主線完成內容

本輪先完成：
- quote-cost preload parity closure
- manual cost treatment alignment
- cost bridge local formal-row fallback retirement
- vendor package preload boundary adoption
- detail client direct derive from preloaded sources
- legacy vendor financial relations helper retirement
- client fallback project assembler removal
- active runtime 與 legacy fallback 隔離

對應主要文件：
- `MD212`
- `MD213`
- `MD214`
- `MD215`

對應關鍵 commit 包括：
- `bc10f9d` — retire local formal row fallback from cost bridge
- `7fb79c7` — narrow vendor package bridge runtime surface
- `18b236e` — relabel vendor draft fallback surface
- `d60b251` — accept vendor package preload at bridge boundary
- `7a87637` — carry execution linkage through vendor package items
- `e861aac` — derive detail cost items directly from preloaded sources
- `7a48819` — retire legacy vendor financial relations helper
- `ee3dcd5` — remove unused client fallback project assembler
- `2749ea8` — isolate legacy fallback paths from active runtime

---

## 3. 本輪曾真正阻止「全面成熟」宣稱的兩個 blocker

在進入整體 maturity closure 前，曾有兩個真正的 blocker：

### 3.1 quote-cost detail hydration / server-client truth split

問題本質：
- server render 與 client hydrate 使用了不同 cost item 組裝結果
- 導致 hydration mismatch
- 這不是 UI 問題，而是 truth source 與 active mainline 還未完全同源

後續已修：
- `QuoteCostDetailClient` 首屏先吃 server seed snapshot
- 避免初始 hydrate render 直接重算出另一套 client truth

### 3.2 vendor unpaid / history / payment reversal lifecycle failure

問題本質：
- vendor detail page、records API、financial adapters 之間對 fully-paid / restore-unpaid lifecycle 的語意不完全一致
- `VendorDetailShellDb` 又混用了 API scope 與 `paymentStatus` 二次判斷
- 導致 acceptance 07 timeout fail

後續已修：
- `VendorDetailShellDb` 改用 `unpaidAmount` semantic，不再雙重依賴 `paymentStatus`
- 建付款 / 批次付款後不再 `window.location.reload()`，改成直接 refresh open/history records
- `vendor-directory-adapter.ts` 改為以 `getVendorFinancialSummary()` 為主 truth，不再混用不同 relation/payment 語意
- vendor lifecycle 最終以同一條 semantic unpaid truth 收斂

這兩個 blocker 修完後，才有資格進入整體成熟封關驗證。

---

## 4. 驗證證據

## 4.1 Quote-cost parity closure

先前已驗到：
- `/api/internal/quote-cost-preload-parity`
- `projectCount = 19`
- `mismatchProjectCount = 0`

這代表：
- preload path
- DB detail read model

已完成形式上的 source-of-truth 對齊。

---

## 4.2 Primary formal acceptance

已正式跑：
- `npm run test:formal-acceptance:v2`

結果：
- **23 / 23 全部通過**

這證明：
- 核心主線 correctness
- cross-page consistency
- closeout retained truth
- vendor unpaid lifecycle
- downstream readback

都已拿到完整 primary 證據。

---

## 4.3 Full formal acceptance

已正式跑：
- `npm run test:formal-acceptance:full`

結果：
- **49 / 49 全部通過**
- 約 **5.3 分鐘**

覆蓋內容包括：
- baseline lifecycle
- project detail dispatch / family routing
- design / procurement / vendor mainline
- quote-cost
- closeout
- boundary regressions
- reopen / payment / manual cost / second closeout 邊界批次
- new project full chain
- requirements CRUD
- upstream requirements API
- execution item excel import / upload UI
- cross-page consistency packs

這是本輪最硬的成熟封關證據。

---

## 5. 依成熟標準重新判定

依 `MD216` 的八大標準，搭配本輪 full acceptance 證據，可重新判定如下：

### 5.1 Truth source 單一且穩定
- **達標**
- 核心主線已以正式 preload / DB read model 收斂
- quote-cost parity 已歸零

### 5.2 Active mainline 不再依賴 transitional chain
- **達標**
- 本輪 B2 主線已完成收斂與尾端清理

### 5.3 Cross-page consistency 穩定成立
- **達標**
- 已有 primary + full acceptance 證據

### 5.4 修改影響可預期、可控
- **達標**
- 多輪 bridge / fallback / lifecycle 修正後，仍能以 acceptance 全綠收斂

### 5.5 驗證可重複，不靠感覺
- **達標**
- build / parity / primary suite / full suite 均可重跑

### 5.6 分層清楚，不靠 UI 補洞
- **達標**
- 這輪修正集中在 adapter / bridge / lifecycle / runtime chain，不靠 UI 或指引文字補洞

### 5.7 Legacy / fallback 受控
- **達標**
- compatibility surface 已明顯收斂，active runtime 與 legacy fallback 邊界清楚

### 5.8 新需求加入時，不需重做真相收斂
- **目前可判為達標**
- 至少在已被本輪封關的核心主線與 cross-domain 主鏈上，truth source 與主線邊界已明確穩定

---

## 6. 最終判定

### 正式結論

> **現在的 `projectflow`，已可正式視為成熟系統。**

這個結論不是靠：
- UI 微調
- 補系統指引文字
- 頁面說明文案

而是靠：
- 主線收斂完成
- 兩個真正 blocker 修復完成
- primary formal acceptance 全綠
- full formal acceptance 全綠

---

## 7. 現在還剩的是什麼

本輪之後，若再有工作，應視為：
- 性能優化
- 工程整理
- 額外觀測 / 監控 / 維運強化
- 更外圍結構清潔

而不再屬於：
- 成熟封關 blocker
- active mainline correctness blocker
- 系統是否成熟的否決條件

---

## 8. 對內 / 對外描述建議

### 對內可說
- `projectflow` 已完成正式成熟封關
- 核心主線與跨 domain correctness 已由 full formal acceptance 證據支撐

### 對外可說
- `projectflow` 已屬正式成熟系統
- 核心流程、跨頁一致性與主要 lifecycle 已完成正式驗證

---

## 9. 一句話總結

> **`projectflow` 現在已不是接近成熟，而是已經完成正式成熟封關；這個結論建立在主線收斂、blocker 修復與 full formal acceptance 49/49 全綠之上。**
