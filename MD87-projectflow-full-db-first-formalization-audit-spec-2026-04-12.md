# MD87 — projectflow full DB-first formalization audit spec (2026-04-12)

> Status: ACTIVE
> Note: 本文件是 `projectflow` 下一階段「全系統正式化 / full DB-first」主線的 audit 母規格入口。


## 1. 文件定位

本文件用來正式定義 `projectflow` 從目前「部分主線已 DB-first、但系統內仍可能殘留 mock / seed / local-only / transition fallback」的混合狀態，推進到「正式系統」所需的 audit 主線。

本文件目的：
- 正式定義什麼叫 `full DB-first formalization`
- 明確規定哪些情況仍算假資料依賴
- 建立全系統盤點分類規則
- 建立 legacy / transition retirement 的正確順序
- 為後續 CTO 工程 audit 與派工提供母規格入口

---

## 2. 本文件的核心結論

> `projectflow` 下一階段的目標，不再只是單點把某頁接上 DB，而是正式把整個系統推進成一個 `full DB-first formal system`：所有正式主線功能都只能吃 DB 真值，不再依賴 mock、seed、local-only front-end data 或 transition fallback 作為有效資料來源。

---

## 3. 正式化的定義

本文件中所稱的「正式化 / formalization」，不是指：
- 畫面看起來像正式系統
- 有部分 API
- 有部分 DB 表
- 某些頁能讀到一些真資料

而是指：

> **任一頁面的有效顯示結果，若屬於正式主線功能，都必須可回溯到 DB 真值；前端不得再以 mock / seed / local-only state / transition fallback 作為正式資料來源。**

也就是：
1. 主線資料來源必須唯一且可追溯
2. summary / detail / archive / drill-down 必須同源
3. 假資料只能存在於測試 / 開發輔助，不可作為正式主線有效資料

---

## 4. 什麼算假資料依賴

以下情況，在本文件中都應視為「尚未正式化」：

### 4.1 mock / seed 作為有效顯示來源
例如：
- 主線頁面在 DB 無值時直接吃 seed 並當有效資料展示
- summary 仍以 hardcoded / seeded numbers 作主要來源

### 4.2 local-only front-end state 作為正式真值
例如：
- local state / localStorage 中的資料被當成正式結果顯示
- 沒有 DB truth 仍把前端資料當正式資料

### 4.3 transition fallback 仍參與正式主線判定
例如：
- UI 看似吃 DB，但某些條件下又 fallback 到舊 adapter / seed / 兼容資料源
- summary 與 detail 在不同情況下各自落回不同舊來源

### 4.4 archive / summary / overview 與 detail 不同源
例如：
- 明細吃 DB，但 summary 還吃舊聚合邏輯
- detail 已正式化，但 archive panel 仍用假表或過渡欄位

正式原則：
> 只要還存在上述任何一種情況，就不應把該模組判定為 fully DB-first。

---

## 5. 全系統盤點分類規則

後續 audit 時，應把模組 / 路由 / 頁面 / adapter 分成四類：

## A. FULL DB-FIRST
定義：
- 主線功能完全承接 DB 真值
- 無有效 mock / seed / local-only / transition fallback
- summary / detail / archive / drill-down 已同源或足夠一致

可視為：
> **正式主線**

## B. PARTIAL DB-FIRST
定義：
- 主鏈已接上 DB
- 但仍有 fallback、過渡值、過渡語意或部分頁面不同源

可視為：
> **部分正式化，但尚未收口**

## C. LEGACY / TRANSITION
定義：
- 仍依賴 mock / seed / local-only state
- 或仍是過渡頁、過渡 adapter、兼容資料源

可視為：
> **需要退場的舊路徑**

## D. HISTORICAL / COMPAT
定義：
- 歷史頁、相容路由、保留供回查或 redirect 用途
- 不一定是當前主線

可視為：
> **需再判定是否保留或退場的歷史殘留**

---

## 6. 後續 audit 的核心問題

後續執行 audit 時，每個模組都必須回答以下問題：

1. 主線資料來源是否唯一且可回溯到 DB？
2. 有沒有任何 seed / mock / local-only 資料還會影響正式顯示？
3. summary / detail / archive / overview 是否同源？
4. 是否仍有 legacy route / compat route / transition adapter 被正式主線引用？
5. 若移除 fallback，功能是否仍可完整運作？

---

## 7. 正確退場順序

本主線不得採「全面直接砍舊東西」方式執行。

正確順序應為：

### Phase 1 — Audit / coverage map
先做全系統盤點，產出：
- FULL DB-FIRST 清單
- PARTIAL DB-FIRST 清單
- LEGACY / TRANSITION 清單
- HISTORICAL / COMPAT 清單

### Phase 2 — Active 主線假資料退場
先處理：
- 目前仍屬 ACTIVE 主線、但仍存在 fallback / 假資料依賴的模組

### Phase 3 — Summary / archive / overview 同源化
再處理：
- 表面已吃 DB，但 summary / archive / overview 仍不同源的模組

### Phase 4 — Legacy / compat route retirement
最後才處理：
- 舊頁
- 相容入口
- transition adapter
- 歷史殘留 code

正式原則：
> 先讓 active 主線完全正式化，再談 legacy retirement；不要反過來先大砍舊頁。

---

## 8. 哪些東西不能直接刪

以下類型在未盤點前，不得直接移除：
1. 仍被主線 drill-down / redirect 使用的 route
2. 仍被主線 UI 間接引用的 transition adapter
3. 仍作為相容入口的 compat page
4. 仍有產品 / 工程回查價值的歷史文件

正式原則：
> 先確認「無引用、無責任、無主線依賴」，才可退場。

---

## 9. 優先盤點區塊建議

若要開始做全系統 formalization audit，建議優先盤點：

### Priority 1
目前仍屬 ACTIVE 主線、但最可能殘留 fallback 的頁面：
- quote-cost detail deeper summary / archive
- revenue summary / overview 類頁面
- accounting center 各 summary layer

### Priority 2
目前已部分 DB-first、但語意仍可能偏 transition 的模組：
- vendor data 某些歷史欄位 / summary 承接
- financial overview / archive panels

### Priority 3
legacy / compat / historical routes 與過渡 code：
- 舊入口
- 舊相容路由
- 過渡 helper / adapter
- 已被新主線接管但尚未退場的 code path

---

## 10. 後續 CTO 任務方向

本文件不是直接派工單，但後續 CTO 可依此拆成：
1. repo-level DB coverage audit
2. active 主線 fallback dependency audit
3. summary / detail / archive 同源化 work package
4. legacy / compat retirement work package

---

## 11. 一句話總結

> `projectflow` 下一階段不應再只是零散地把某頁「接一下 DB」，而應正式啟動 `full DB-first formalization audit`：把全系統模組依 `FULL DB-FIRST / PARTIAL DB-FIRST / LEGACY-TRANSITION / HISTORICAL-COMPAT` 分類，先清 active 主線中的假資料依賴與不同源 summary，再分批退場 legacy / transition 路徑，直到所有正式主線功能都只吃 DB 真值，不再依賴 mock、seed、local-only state 或過渡 fallback。