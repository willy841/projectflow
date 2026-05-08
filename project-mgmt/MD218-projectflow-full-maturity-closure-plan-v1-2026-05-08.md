# MD218 — projectflow full maturity closure plan v1 — 2026-05-08

Status: ACTIVE / CLOSURE PLAN

Parent:
- `MD216-projectflow-formal-maturity-criteria-v1-2026-05-08.md`
- `MD217-projectflow-formal-maturity-assessment-v1-2026-05-08.md`

---

## 0. 目的

這份文件的目的不是再討論 UI，也不是補系統指引文字。

本文件要處理的是：

> **如何把目前「核心主線已正式收斂、整體系統接近成熟」的狀態，推進到「整體可正式宣稱為成熟系統」。**

成熟判定仍嚴格依 `MD216`，不把 UI 調整或頁面文字納入評估依據。

---

## 1. 目前狀態（來自 MD217）

### 已經成立的部分

1. active quote-cost preload / bridge / detail mainline 已正式收斂
2. active runtime 與主要 legacy fallback 已隔離
3. build / parity 驗證可重複
4. compatibility surface 已大量收斂
5. 核心主線已可視為正式主線水準

### 尚未讓整體可直接對外宣稱「全面成熟」的原因

1. 整體 cross-domain / cross-page consistency 尚缺完整實際執行證據
2. 系統整體的 truth source 單一化仍有更廣範圍 toggle / local persistence 生態待納入判讀
3. 尚未用完整 formal acceptance run 將多個 domain 一次性驗滿
4. 尚未形成一份「整體 closure 已成立」的完整封關證據包

---

## 2. 要從「接近成熟」推到「可宣稱成熟」，最後缺什麼

不缺 UI，不缺文案，不缺提示文字。

真正缺的是以下三種證據：

### 2.1 全域驗證證據

需要補齊一輪足夠有說服力的 formal acceptance 證據，至少涵蓋：
- project lifecycle
- project detail dispatch / family routing
- design 主線
- procurement 主線
- vendor package 主線
- quote-cost 主線
- closeout retained readback
- vendor unpaid lifecycle
- cross-flow formal mainline smoke
- project / owner / assignee / reconciliation / collections / closeout consistency packs

現成對應腳本已存在：
- `npm run test:formal-acceptance:v2`
- 必要時再擴至：`npm run test:formal-acceptance:full`

### 2.2 整體 domain maturity closure 判讀

即便 acceptance 跑過，也仍需要一份明確結論：
- 哪些 domain 已正式成熟
- 哪些 domain 只是受 coverage 保護，但結構仍有保留歷史包袱
- 哪些 local/toggle 面仍只是受控存在，而不影響整體成熟宣稱

### 2.3 對外可宣稱成熟的封關標準

最後還需要明確定義：
- 在哪些證據到位後，可以正式說「projectflow 已屬正式成熟系統」
- 哪些殘留項目可接受視為非阻塞歷史包袱
- 哪些項目若還存在，就不能宣稱成熟

---

## 3. 最後封關工作流

## Phase A — 驗證封關

### A1. 先跑 primary formal acceptance

命令：
- `npm run test:formal-acceptance:v2`

目的：
- 取得核心主線與 cross-page consistency 的第一輪完整證據

完成條件：
- suite 全過
- 無結構性 blocker
- 若失敗，逐項記錄失敗 domain 與原因，不可模糊帶過

### A2. 視 primary 結果決定是否跑 full suite

命令：
- `npm run test:formal-acceptance:full`

適用時機：
- 當 primary suite 已通過，且需要更高強度證據支撐「整體成熟」宣稱時

完成條件：
- full suite 全過；或
- 僅保留已明確認定為非阻塞、非 active-mainline 的已知歷史項目，且能書面說明

---

## Phase B — 整體成熟判讀

在 acceptance 證據取得後，需再做一份：

### `projectflow formal maturity assessment v2`

內容必須包含：
1. 八大成熟度標準逐條重評
2. 對本次 acceptance 證據的引用
3. 哪些標準已正式達標
4. 哪些標準仍只算接近達標
5. 是否可以從「核心主線成熟」升級為「整體系統成熟」

---

## Phase C — 最終成熟封關

若 v2 assessment 已能證明：
- truth source 單一化足夠
- active mainline 不再依賴 transitional chain
- cross-page consistency 有完整實證
- build / parity / acceptance 已形成可重複證據
- legacy / fallback 僅受控存在且不影響主線 correctness
- 新需求不再需要大規模真相收斂

則可再產出一份：

### `projectflow formal maturity closure`

這份 closure 是最終對外/對內可引用的成熟宣告文件。

---

## 4. 哪些殘留項目不應阻止成熟宣稱

只要以下條件成立，則它們不必自動阻止整體成熟判定：

1. legacy string mode 仍存在，但不進 active runtime
2. local persistence 生態仍存在，但不再作為核心主線 truth source
3. 某些更外圍 domain 尚有歷史包袱，但已有清楚隔離且不影響核心 correctness

也就是說：
- **成熟不等於零歷史包袱**
- **成熟等於歷史包袱已受控，且不再主導核心主線正確性**

---

## 5. 哪些情況仍不能宣稱成熟

若出現以下任一情況，則不可宣稱整體系統成熟：

1. formal acceptance primary suite 無法穩定通過
2. cross-page consistency 出現系統性矛盾
3. active runtime 仍會掉回 local truth chain
4. 某個核心 domain 雖可運行，但仍靠 transitional bridge 拼 truth
5. 新需求一來仍必須先做大規模真相收斂考古

---

## 6. 下一步建議執行順序

1. 先跑：`npm run test:formal-acceptance:v2`
2. 彙整通過/失敗結果
3. 若 primary suite 穩定通過，再跑：`npm run test:formal-acceptance:full`
4. 產出 `formal maturity assessment v2`
5. 若達標，再產出 `formal maturity closure`

---

## 7. 一句話總結

> **要把現在的 projectflow 從「核心主線已成熟、整體接近成熟」推到「可正式宣稱整體成熟」，最後缺的不是 UI 或指引文字，而是一輪完整、可引用、跨 domain 的 formal acceptance 證據與封關判讀。**
