# MD-INDEX — projectflow status board (2026-04-12)

## 1. 文件定位

本文件作為目前 `projectflow` 近期 MD 檔的狀態索引板。

目的：
- 避免已完成文件看起來像待辦
- 避免舊 spec / 舊 handoff 與新結論混在一起
- 讓續接時能快速分辨：
  - 哪些是 active source of truth
  - 哪些是 completed closure
  - 哪些已被後續文件覆蓋
  - 哪些只是歷史脈絡

---

## 2. 狀態分類規則

### ACTIVE
- 目前仍是主線判斷依據
- 可直接當續接入口

### COMPLETED
- 已完成 / 已封口
- 可作為驗收與歷史記錄，但不應再當待辦主入口

### SUPERSEDED
- 有歷史價值
- 但內容已被更新文件覆蓋
- 續接時不應優先從這裡開始

### HISTORICAL
- 僅作歷史脈絡參考
- 不應作主入口

---

## 3. Accounting Center / financial 近期 MD 狀態

### ACTIVE
- `MD119-projectflow-md108-batch1-to-batch4-completion-summary-and-next-scope-2026-04-13.md`
  - 狀態：ACTIVE
  - 用途：正式切分 `MD108` 已完成範圍與下一輪工作邊界

- `MD120-projectflow-post-md108-hardening-validation-extension-blueprint-2026-04-13.md`
  - 狀態：ACTIVE
  - 用途：作為 `MD108` 完成後的下一輪總控藍圖母檔

- `MD100-projectflow-upstream-usage-scenario-alignment-summary-2026-04-12.md`
  - 狀態：ACTIVE
  - 用途：上游 / Project Detail / 任務發布 / 任務檢視使用情境對齊摘要

- `MD101-projectflow-design-line-usage-scenario-alignment-summary-2026-04-13.md`
  - 狀態：ACTIVE
  - 用途：設計線使用情境對齊摘要

- `MD102-projectflow-procurement-line-usage-scenario-alignment-summary-2026-04-13.md`
  - 狀態：ACTIVE
  - 用途：備品線使用情境對齊摘要

- `MD103-projectflow-vendor-line-usage-scenario-alignment-summary-2026-04-13.md`
  - 狀態：ACTIVE
  - 用途：廠商線使用情境對齊摘要

- `MD104-projectflow-quote-cost-line-usage-scenario-alignment-summary-2026-04-13.md`
  - 狀態：ACTIVE
  - 用途：報價成本線使用情境對齊摘要

- `MD105-projectflow-vendor-data-usage-scenario-alignment-summary-2026-04-13.md`
  - 狀態：ACTIVE
  - 用途：Vendor Data 使用情境對齊摘要

- `MD106-projectflow-closeout-usage-scenario-alignment-summary-2026-04-13.md`
  - 狀態：ACTIVE
  - 用途：closeout / 結案紀錄使用情境對齊摘要

- `MD107-projectflow-home-overview-usage-scenario-alignment-summary-2026-04-13.md`
  - 狀態：ACTIVE
  - 用途：首頁總覽使用情境對齊摘要

- `MD76-projectflow-client-collection-source-of-truth-and-quote-cost-detail-entry-spec-2026-04-12.md`
  - 狀態：ACTIVE
  - 用途：client collection 主線責任拍板

- `MD78-projectflow-accounting-center-phase-a-closure-and-lock-recommendation-2026-04-12.md`
  - 狀態：ACTIVE
  - 用途：Accounting Center Phase A closure / lock 判斷

- `MD80-projectflow-payable-lifecycle-v1-spec-2026-04-12.md`
  - 狀態：ACTIVE
  - 用途：payable lifecycle v1 正式 spec

- `MD81-projectflow-payable-lifecycle-v1-closure-and-lock-recommendation-2026-04-12.md`
  - 狀態：ACTIVE
  - 用途：payable lifecycle v1 closure / lock 判斷

- `MD82-projectflow-month-close-v1-spec-2026-04-12.md`
  - 狀態：ACTIVE
  - 用途：month close v1 正式 spec

- `MD83-projectflow-accounting-center-month-close-aggregation-alignment-2026-04-12.md`
  - 狀態：ACTIVE
  - 用途：Accounting Center month close aggregation / readback 邊界校正

- `MD84-projectflow-month-close-aggregation-detail-readback-rule-2026-04-12.md`
  - 狀態：ACTIVE
  - 用途：month close aggregation detail / readback 規則

- `MD85-projectflow-month-close-aggregation-cto-work-package-and-risk-guardrails-2026-04-12.md`
  - 狀態：ACTIVE
  - 用途：month close aggregation CTO work package 與風險 guardrails

- `MD86-projectflow-month-close-aggregation-implementation-closure-2026-04-12.md`
  - 狀態：ACTIVE
  - 用途：month close aggregation implementation closure 停點

### COMPLETED
- `MD74-projectflow-accounting-center-personnel-closure-and-global-next-step-recommendation-2026-04-12.md`
  - 狀態：COMPLETED
  - 用途：personnel closure 記錄

- `MD77-projectflow-client-collection-mainline-closure-and-accounting-center-active-projects-alignment-2026-04-12.md`
  - 狀態：COMPLETED
  - 用途：client collection 主線 closure 記錄

### SUPERSEDED
- `MD69-projectflow-accounting-center-db-first-phase-a-cto-execution-plan-2026-04-12.md`
  - 狀態：SUPERSEDED
  - 已被：`MD78`
  - 原因：Phase A 當時是施工入口；目前 Phase A 已 closure / lock recommendation，不宜再當待辦入口

- `MD73-projectflow-accounting-center-personnel-editor-redo-progress-and-remaining-ui-automation-gap-2026-04-12.md`
  - 狀態：SUPERSEDED
  - 已被：`MD74`
  - 原因：當時記錄尚未收尾的 automation gap；後續已綠燈 closure

- `MD75-projectflow-collection-source-of-truth-and-entry-responsibility-alignment-2026-04-12.md`
  - 狀態：SUPERSEDED
  - 已被：`MD76`
  - 原因：`MD75` 是收款責任對齊過程文件；`MD76` 才是正式拍板 spec

- `MD79-projectflow-financial-lifecycle-phase-b-payable-lifecycle-entry-spec-2026-04-12.md`
  - 狀態：SUPERSEDED
  - 已被：`MD80`
  - 原因：`MD79` 是 payable lifecycle 入口文件；`MD80` 才是正式 v1 spec

### HISTORICAL
- `MD70-projectflow-accounting-center-personnel-editor-runtime-stability-bug-and-next-step-2026-04-12.md`
- `MD71-projectflow-current-personnel-bugfix-working-set-2026-04-12.md`
- `MD72-projectflow-accounting-center-personnel-redo-handoff-2026-04-12.md`
- `MD67-projectflow-latest-global-progress-refresh-2026-04-12.md`
- `MD68-projectflow-downstream-financial-closure-global-signoff-2026-04-12.md`

這些檔案仍有歷史價值，但不應作為當前主入口。

---

## 4. 續接建議

### 若要續接 post-MD108 新階段
優先讀：
1. `MD119`
2. `MD120`
3. 再視模組回查：`MD100`～`MD107`
4. 若任務涉及既有 DB-first / payable / month-close / Accounting Center 判斷，再同步回查：`MD76`、`MD78`、`MD80`～`MD86`

### 若要續接使用情境對齊後的主線
優先讀：
1. `MD100`
2. 視模組回查：`MD101`～`MD107`
3. 若任務涉及既有 DB-first / payable / month-close 判斷，再同步回查：`MD76`、`MD78`、`MD80`～`MD86`

### 若要續接 Accounting Center
優先讀：
1. `MD78`
2. `MD83`
3. `MD82`
4. `MD76`
5. `MD77`

### 若要續接 payable lifecycle
優先讀：
1. `MD80`
2. `MD81`
3. `MD64`
4. `MD65`
5. `MD66`

### 若要續接 month close
優先讀：
1. `MD83`
2. `MD82`
3. `MD84`
4. `MD85`
5. `MD86`
6. `MD78`
7. `MD76`
8. `MD77`

---

## 5. 一句話總結

> 目前 `projectflow` 近期 MD 檔中，`MD76`、`MD78`、`MD80`、`MD81`、`MD82`、`MD83`、`MD84`、`MD85`、`MD86` 可視為 active source-of-truth；`MD74`、`MD77` 為 completed closure 記錄；`MD69`、`MD73`、`MD75`、`MD79` 屬於已被後續文件覆蓋的 superseded 文件，續接時不應再把它們當成主入口。