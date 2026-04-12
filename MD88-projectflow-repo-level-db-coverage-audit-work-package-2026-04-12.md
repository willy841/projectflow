# MD88 — projectflow repo-level DB coverage audit work package (2026-04-12)

> Status: ACTIVE
> Follow-up: `MD87-projectflow-full-db-first-formalization-audit-spec-2026-04-12.md`
> Note: 本文件用來把 `full DB-first formalization audit` 母規格，拆成 CTO 可直接執行的 repo-level audit work package。


## 1. 文件定位

本文件承接 `MD87`，用來把 `projectflow` 下一階段的 `full DB-first formalization audit`，拆成一份可直接派給 CTO 執行的 repo-level audit work package。

本文件目的：
- 定義 audit 範圍
- 定義 audit 方法
- 定義模組分類規則的實際輸出格式
- 定義 priority 順序與風險 guardrails
- 讓後續可以直接執行 repo-level DB coverage 盤點，而不是停在抽象原則

---

## 2. 本輪 audit 目標

> **對整個 `projectflow` repo 的主要模組 / 路由 / adapter / summary layer 做 DB coverage 盤點，找出哪些已 fully DB-first、哪些仍依賴假資料或 transition fallback。**

正式原則：
- 本輪先盤點，不順手做大範圍修 code
- 目標是產出可執行的 coverage map 與下一批 formalization priority
- 不是在 audit 階段直接把整個 repo 同步重構掉

---

## 3. Audit 範圍

本輪 audit 至少必須涵蓋四層：

## 3.1 Route / page layer
盤點：
- 主要正式路由
- 每個路由目前是否以 DB 為唯一正式資料來源
- 是否仍存在 seed / mock / fallback 作為正式顯示來源

## 3.2 Selector / adapter / data-mapping layer
盤點：
- route 背後實際吃哪個 adapter / helper / selector
- adapter 是否仍混 transition fallback
- summary / list / detail 是否來自同一條正式資料鏈

## 3.3 Summary / archive / overview layer
盤點：
- 哪些頁面表面已吃 DB，但 summary / archive / overview 仍可能不同源
- 哪些 archive / panel 仍吃過渡資料或舊聚合邏輯

## 3.4 Legacy / compat layer
盤點：
- 舊入口
- 相容路由
- 歷史頁
- transition helper / adapter
- 是否仍被主線引用

---

## 4. Audit 方法

CTO 執行 audit 時，至少需依照以下三步：

## Step 1 — route map
先列出目前主要正式路由與對應主頁面。

## Step 2 — source trace
對每個主要頁面往下追：
- 主資料來源
- 是否有 DB 真值
- 是否有 fallback / seed / mock / local-only state
- summary / detail / archive 是否同源

## Step 3 — classification
對每個模組 / 路由做正式分類：
- `FULL DB-FIRST`
- `PARTIAL DB-FIRST`
- `LEGACY / TRANSITION`
- `HISTORICAL / COMPAT`

正式原則：
> 不可只看頁面表象；必須追到 adapter / selector / helper 層，才能判定是否真的已 fully DB-first。

---

## 5. 每個模組的最小輸出格式

後續 audit report 中，每個模組至少要用以下格式整理：

1. **模組 / 路由**
2. **目前主資料來源**
3. **是否仍有 fallback / seed / local-only state**
4. **summary / detail / archive 是否同源**
5. **目前分類**
6. **主要風險**
7. **建議下一步**

正式原則：
> 每個模組都要能被結構化比較，不能只寫成散文式盤點。

---

## 6. Priority 順序

本輪 audit 不建議平鋪全 repo 同時掃；建議優先順序如下：

## Priority 1 — 核心 financial / accounting 主線
1. `quote-costs`
2. `quote-cost detail`
3. `Accounting Center`
4. `Vendor Data`
5. `Closeout`

## Priority 2 — summary / archive / overview / downstream panels
1. revenue summary 類頁
2. archive panels
3. financial overview 類頁
4. downstream detail / panel 類元件

## Priority 3 — legacy / compat / transition 路徑
1. compat routes
2. 舊入口頁
3. transition helpers
4. 歷史殘留 page / adapter

正式原則：
> 先盤 active 主線與 financial 主線，再往 legacy / compat 層掃。

---

## 7. 風險 guardrails

## Guardrail 1 — 不可只看 route，不追 adapter / selector
### 風險
頁面表面上像 DB-first，但實際 summary / overview 仍在吃 fallback。

### 規避規則
- 每個主要頁面都必須往下追到資料層 helper / adapter / selector

---

## Guardrail 2 — 不可只因為有 DB table 就判定 fully DB-first
### 風險
系統已存在 DB table，但主頁顯示結果仍可能混 seed / mock / 過渡值。

### 規避規則
- 判定標準必須看「正式顯示結果是否只吃 DB 真值」
- 不能只看 schema 是否存在

---

## Guardrail 3 — audit 階段不順手大改
### 風險
一邊 audit 一邊重構，最後盤點結論失真、範圍失控。

### 規避規則
- 本輪以盤點與報告為主
- 除非遇到阻斷性問題，否則不在 audit 階段順手做大範圍 code 清理

---

## Guardrail 4 — 必須明確標記 fake-data dependency
### 風險
若只寫「partial」但不講是哪種假資料依賴，後續無法派工。

### 規避規則
- 對每個非 FULL 模組，必須明確指出是：
  - seed 依賴
  - mock 依賴
  - local-only state
  - transition fallback
  - summary / archive 不同源

---

## 8. 本輪交付物

本輪 audit 完成後，至少需交付：
1. repo-level DB coverage audit report
2. 模組分類總表
3. fake-data dependency 清單
4. 第一批 formalization priority 建議
5. 可直接進入下一輪 CTO 派工的 work package 建議

---

## 9. 一句話總結

> `MD88` 的目標，是把 `MD87` 定義的 full DB-first formalization 主線，拆成一份可直接執行的 repo-level audit work package：先盤 route / adapter / summary / legacy 四層，再依統一格式對每個模組判定 `FULL / PARTIAL / LEGACY / HISTORICAL`，明確標出 fake-data dependency 與下一步 formalization priority，為整個系統正式化提供真正可執行的 coverage map。