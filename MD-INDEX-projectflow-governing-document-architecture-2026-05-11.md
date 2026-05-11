# MD-INDEX — projectflow Governing Document Architecture — 2026-05-11

Status: ACTIVE / PRIMARY INDEX  
Role: `projectflow` 全文件架構總索引與續接入口。  
Goal: 把目前散落的 `projectflow` 母檔、現行規則、成熟度判讀、驗收體系、最新工程主線與歷史文件，整理成單一可續接結構，避免新 session 再從舊 handoff 或單一局部 spec 誤起手。

---

## 0. 先講結論

`projectflow` 現在不再是早期規格探索期，也不再是只靠 mock / 單頁 clickpath 驗證的系統。

目前正式判讀應是：

> **`projectflow` 已進入正式成熟系統階段。**
> **主線已從早期 UI / flow 討論，升級為：正式來源治理、cross-page consistency 驗收、正式資料閉環、與 local/fallback 殘留鏈退休。**

因此後續任何續接，都不應再把：
- `MD21`
- `MD22`
- `MD26`
- 或更早期 handoff / UI 討論檔

當成主要入口。

---

## 1. 唯一總入口

每次續接 `projectflow`，先從：

1. `MD-MASTER-projectflow-system-source-of-truth.md`
2. 本文件：`MD-INDEX-projectflow-governing-document-architecture-2026-05-11.md`
3. `MD-INDEX-projectflow-active-secondary-historical-map-2026-05-11.md`
4. `MD-SUMMARY-projectflow-current-system-one-page-2026-05-11.md`

開始。

兩者分工：
- `MD-MASTER`：總控母檔，記錄主線升級與高階導流規則
- 本文件：把整包文件結構整理成可操作架構，並明確標記哪些是現行治理文件、哪些是歷史回查材料

---

## 2. 文件分層（正式）

---

### Layer A — 母檔 / 總控層

用途：決定「從哪裡進」、「哪些層級現在有效」。

必讀：
1. `MD-MASTER-projectflow-system-source-of-truth.md`
2. `MD-INDEX-projectflow-governing-document-architecture-2026-05-11.md`

這層不負責單頁規格細節，而是負責：
- 定義正式入口
- 區分現行有效線與歷史線
- 防止新 session 走錯入口

---

### Layer B — 現行有效規則層

用途：記錄現在仍直接生效、續接一定會碰到的產品 / 執行規則。

必讀：
1. `MD155-projectflow-single-track-acceptance-first-and-production-freeze-rule-2026-04-20.md`
2. `MD156-projectflow-project-document-routing-and-dispatch-trade-linkage-rules-2026-04-24.md`
3. `MD157-projectflow-vendor-financial-source-formalization-and-vendor-detail-performance-investigation-2026-04-24.md`

這層回答：
- 測試站與正式站現在怎麼分工
- 設計 / 備品正式文件出口在哪裡
- dispatch 工種 / 廠商來源怎麼定
- vendor reconciliation amount 正式來源在哪裡
- vendor detail 性能問題是否已關閉

---

### Layer C — 成熟度 / 管理判讀層

用途：回答「系統現在做到哪裡」以及「為什麼現在可以被視為正式成熟系統」。

核心文件：
1. `MD158-projectflow-acceptance-rules-fixes-and-v2-suite-consolidation-2026-04-26.md`
2. `MD163-projectflow-current-maturity-and-next-step-management-summary-2026-04-26.md`
3. `MD164-projectflow-acceptance-data-governance-and-pre-production-read-order-index-2026-04-26.md`

這層正式結論：
- `projectflow` 產品主線驗收已達高成熟度
- 資料治理已進入高完成度前段
- 技術穩定性尾巴已收斂成可管理清單
- 後續主線不再是回頭重談早期 UI，而是 runtime/env、資料治理、驗收體系與殘留 compatibility / fallback 鏈收尾

---

### Layer D — 全站驗收 / Source-of-Truth / Cross-Page Consistency 層

用途：回答「成熟系統現在應怎麼驗」。

核心文件：
1. `MD171-projectflow-whole-system-acceptance-framework-source-of-truth-and-cross-page-consistency-matrix-2026-05-05.md`
2. `MD172-projectflow-source-of-truth-test-gap-matrix-2026-05-05.md`
3. `MD173-projectflow-cross-page-consistency-regression-pack-spec-2026-05-05.md`

這層正式意義：
- 驗收不再只是單頁 clickpath
- 必須驗 source-of-truth
- 必須驗 cross-page consistency
- 必須驗 status transition 後的 downstream readback
- 第一輪 A~H packs 已落地成 `tests/formal-acceptance-v2/25~32`

這代表 `projectflow` 已經不是「先把頁面按通就算完成」的系統，而是有正式 QA 架構的系統。

---

### Layer E — 現行工程主線 / Local-Fallback Retirement 層

用途：回答「目前最新工程續接線正在拆什麼」。

核心文件：
1. `MD203-projectflow-b2-a-6-section-replyoverrides-and-design-procurement-readback-replacement-spec-2026-05-08.md`
2. `MD204-projectflow-b2-a-6-1-design-procurement-formal-read-model-shape-definition-2026-05-08.md`
3. `MD205-projectflow-b2-a-6-2-workflow-derived-board-formal-consume-replacement-plan-2026-05-08.md`
4. `MD206-projectflow-b2-a-6-3-workflow-cost-bridge-design-procurement-formal-consume-replacement-plan-2026-05-08.md`
5. `MD207-projectflow-vendor-residual-assignment-fallback-replacement-shape-2026-05-08.md`
6. `MD208-projectflow-vendor-package-bridge-async-db-adoption-plan-2026-05-08.md`
7. `MD209-projectflow-vendor-package-preload-first-live-adoption-entrypoint-2026-05-08.md`
8. `MD210-projectflow-vendor-package-live-adoption-blocker-at-detail-client-boundary-2026-05-08.md`

這層正式意義：

> **目前 `projectflow` 的最新工程主線，不是再補早期頁面 spec，而是退休 local / fallback / bridge 假扮正式 truth 的殘留鏈。**

更具體地說：
- design / procurement 要把 `replyOverrides`、`savedDesignAssignments`、`savedProcurementAssignments` 退出正式 readback 主線
- board readback 與 cost readback 要改吃正式 DB / confirmation / snapshot read model
- vendor residual chain 要把 assignment fallback 與 package bridge，逐步改成正式 DB source
- 這些工作存在的前提，就是系統已進入「正式 truth 收斂期」，而不是探索期

---

### Layer F — 近代主線閉環 / 重要回查層

用途：當需要補最近幾輪收斂脈絡、guardrails、接受度封裝、UI closure 或 repo 現況時回查。

重要文件：
- `MD134-projectflow-post-md133-project-detail-dispatch-and-ui-closure-2026-04-14.md`
- `MD136-projectflow-product-guardrails-and-formalization-rules-2026-04-15.md`
- `MD137-projectflow-guardrails-round1-implementation-closure-2026-04-15.md`
- `MD138-projectflow-md-repo-status-audit-and-classification-2026-04-16.md`
- `MD167-projectflow-acceptance-entry-map-and-do-not-misuse-list-2026-04-27.md`
- `MD168-projectflow-formal-acceptance-script-structure-2026-04-27.md`

注意：
- 這層可重要，但不是第一入口
- 若只是判讀現在規則，不應先從這層起手

---

### Layer G — 歷史回查層（降級）

用途：回查早期產品語意、最初責任切分、DB Phase 1 起手背景、早期 handoff。

典型文件：
- `MD21-projectflow-project-detail-responsibility-redistribution-spec-2026-04-05.md`
- `MD22-projectflow-mock-closed-loop-frontend-execution-brief-2026-04-05.md`（若實際檔名存在於其他位置，仍屬歷史層）
- `MD26-projectflow-formal-data-closure-validation-plan-2026-04-06.md`
- `MD1`~`MD120` 中大量早期 handoff / spec / 分階段 closure 檔

正式規則：

> **這層只能當回查層，不可再當新 session 的主要入口。**

原因不是它們沒價值，而是：
- 它們很多是在系統尚未成熟、尚未建立正式治理與驗收體系時寫成
- 若直接從這裡起手，會把現在已正式化的規則、成熟度判讀與工程主線覆蓋掉

---

## 3. 關於「正式成熟系統」的正式判讀

若要用一句話寫進治理文件，現在最準確的說法是：

> **`projectflow` 已從早期規格探索與頁面閉環階段，進入正式成熟系統階段；其核心特徵是：已有高成熟度產品驗收、正式資料治理主線、全站 source-of-truth / cross-page consistency 驗收體系，以及持續退休 local/fallback/bridge 假扮正式 truth 的工程主線。**

這句話不是空泛宣傳，而是有文件支撐：
- 成熟度判讀：`MD163`
- 驗收 consolidation：`MD158`
- 全站 QA 框架：`MD171~173`
- 最新正式 truth 收斂工程線：`MD203~210`

---

## 4. 實際續接時的最小安全讀法

### 若要判讀「現在到底怎麼做」
先讀：
1. `MD-MASTER`
2. 本文件
3. `MD155`
4. `MD156`
5. `MD157`

### 若要判讀「系統現在做到哪裡」
加讀：
6. `MD158`
7. `MD163`
8. `MD164`

### 若要判讀「現在怎麼驗」
加讀：
9. `MD171`
10. `MD172`
11. `MD173`

### 若要續接「最新工程主線」
加讀：
12. `MD203`
13. `MD204`
14. `MD205`
15. `MD206`
16. `MD207`
17. `MD208`
18. `MD209`
19. `MD210`

---

## 5. 對未來整理的正式建議

後續若再進一步整理文件庫，建議方向：

1. 保留 `MD-MASTER` 與本索引作為雙入口
2. 將 Layer B~E 視為 Governing / Active 主線
3. 將 Layer F 標為 Secondary / On-demand 回查層
4. 將 Layer G 明確視為 Historical / Archive-like 回查層
5. 不再讓新 handoff 用「直接引用早期 MD21 / MD26」作為續接主入口

---

## 6. 一句話總結

> **現在 `projectflow` 的文件架構，應以 `MD-MASTER + 本索引` 作為唯一治理入口；`MD155~157` 管現行規則，`MD158/163/164` 管成熟度判讀，`MD171~173` 管全站驗收體系，`MD203~210` 管最新正式 truth 收斂工程主線，而 `MD21/MD26` 等早期文件已降級為歷史回查層。**
