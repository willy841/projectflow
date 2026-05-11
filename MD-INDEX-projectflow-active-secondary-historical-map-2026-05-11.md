# MD-INDEX — projectflow Active / Secondary / Historical Map — 2026-05-11

Status: ACTIVE / CLASSIFICATION MAP  
Role: `projectflow` 相關 MD 文件的正式分類地圖。  
Goal: 把目前大量 `MD*.md` 文件，依「現在仍直接治理主線」「按需回查」「歷史背景」三個層級分類，降低續接成本，避免再從不該當入口的文件起手。

---

## 0. 使用方式

這份文件不重寫每一份 MD 的全部內容，
而是回答三件事：

1. 這份文件現在是不是治理主線的一部分
2. 如果不是，它是按需回查，還是純歷史背景
3. 續接時應先讀哪一層

正式分類只有三種：
- **Active**：現在仍屬治理主線 / 續接主線
- **Secondary**：不是第一入口，但按需回查很重要
- **Historical**：歷史背景 / 產品脈絡 / 舊 handoff，不可再當主要入口

---

## 1. Active（現在仍直接治理主線）

### A. 總控 / 入口
- `MD-MASTER-projectflow-system-source-of-truth.md`
- `MD-INDEX-projectflow-governing-document-architecture-2026-05-11.md`
- `MD-INDEX-projectflow-active-secondary-historical-map-2026-05-11.md`
- `MD-SUMMARY-projectflow-current-system-one-page-2026-05-11.md`
- `MD-INDEX-projectflow-missing-legacy-reference-audit-2026-05-11.md`

### B. 現行有效規則
- `MD155-projectflow-single-track-acceptance-first-and-production-freeze-rule-2026-04-20.md`
- `MD156-projectflow-project-document-routing-and-dispatch-trade-linkage-rules-2026-04-24.md`
- `MD157-projectflow-vendor-financial-source-formalization-and-vendor-detail-performance-investigation-2026-04-24.md`

### C. 成熟度 / 管理判讀
- `MD158-projectflow-acceptance-rules-fixes-and-v2-suite-consolidation-2026-04-26.md`
- `MD163-projectflow-current-maturity-and-next-step-management-summary-2026-04-26.md`
- `MD164-projectflow-acceptance-data-governance-and-pre-production-read-order-index-2026-04-26.md`

### D. 驗收體系 / 一致性主線
- `MD167-projectflow-acceptance-entry-map-and-do-not-misuse-list-2026-04-27.md`
- `MD168-projectflow-formal-acceptance-script-structure-2026-04-27.md`
- `MD171-projectflow-whole-system-acceptance-framework-source-of-truth-and-cross-page-consistency-matrix-2026-05-05.md`
- `MD172-projectflow-source-of-truth-test-gap-matrix-2026-05-05.md`
- `MD173-projectflow-cross-page-consistency-regression-pack-spec-2026-05-05.md`

### E. 最新工程主線 / 正式 truth 收斂主線
- `MD203-projectflow-b2-a-6-section-replyoverrides-and-design-procurement-readback-replacement-spec-2026-05-08.md`
- `MD204-projectflow-b2-a-6-1-design-procurement-formal-read-model-shape-definition-2026-05-08.md`
- `MD205-projectflow-b2-a-6-2-workflow-derived-board-formal-consume-replacement-plan-2026-05-08.md`
- `MD206-projectflow-b2-a-6-3-workflow-cost-bridge-design-procurement-formal-consume-replacement-plan-2026-05-08.md`
- `MD207-projectflow-vendor-residual-assignment-fallback-replacement-shape-2026-05-08.md`
- `MD208-projectflow-vendor-package-bridge-async-db-adoption-plan-2026-05-08.md`
- `MD209-projectflow-vendor-package-preload-first-live-adoption-entrypoint-2026-05-08.md`
- `MD210-projectflow-vendor-package-live-adoption-blocker-at-detail-client-boundary-2026-05-08.md`

### Active 層正式意義

這一層合起來代表：

> **`projectflow` 已是正式成熟系統，其治理主線由總控母檔、現行規則、成熟度判讀、全站驗收體系與最新正式 truth 收斂工程線共同構成。**

續接時若不先讀這層，就很容易被舊 spec 或局部 handoff 帶偏。

---

## 2. Secondary（不是第一入口，但按需很重要）

### A. 近代 closure / guardrails / repo 狀態
- `MD134-projectflow-post-md133-project-detail-dispatch-and-ui-closure-2026-04-14.md`
- `MD136-projectflow-product-guardrails-and-formalization-rules-2026-04-15.md`
- `MD137-projectflow-guardrails-round1-implementation-closure-2026-04-15.md`
- `MD138-projectflow-md-repo-status-audit-and-classification-2026-04-16.md`

### B. 技術尾巴 / 正式站前收尾相關
- `MD166-projectflow-stale-vendor-tests-disposition-and-blocker-rule-2026-04-27.md`
- `MD165-projectflow-frontend-polish-dark-theme-attempt-handoff-2026-04-26.md`

### C. 舊索引 / 舊整理輔助檔
- `MD-CLEANUP-projectflow-status-map-2026-04-09.md`
- `MD-INDEX-projectflow-document-map-2026-04-09.md`
- `MD-INDEX-projectflow-status-board-2026-04-12.md`

### D. 特定主題仍可回查的重要中期主線
- `MD108-projectflow-db-first-implementation-batch-plan-2026-04-13.md`
- `MD119-projectflow-md108-batch1-to-batch4-completion-summary-and-next-scope-2026-04-13.md`
- `MD120-projectflow-post-md108-hardening-validation-extension-blueprint-2026-04-13.md`
- `MD125-projectflow-post-md108-phase-p1-validation-hardening-matrix-final-closure-2026-04-13.md`
- `MD129-projectflow-post-md108-phase-p2-retained-component-formalization-final-closure-2026-04-13.md`
- `MD133-projectflow-post-md108-phase-p3-home-overview-active-aggregation-final-closure-2026-04-13.md`

### Secondary 層正式意義

這層不是現在的第一入口，
但在以下情境仍很重要：
- 要查某一輪 closure 到底怎麼收
- 要補 guardrails / repo 現況 / 某條中期技術主線
- 要理解為什麼後來會升級到 Active 層那些治理文件

---

## 3. Historical（歷史背景 / 不可再當主入口）

### A. 早期責任切分 / 早期正式化起點
- `MD21-projectflow-project-detail-responsibility-redistribution-spec-2026-04-05.md`
- `MD26-projectflow-formal-data-closure-validation-plan-2026-04-06.md`
- `MD15-projectflow-repo-audit-summary-v1-2026-04-04.md`
- `MD16-projectflow-current-round-handoff-2026-04-04.md`
- `MD17-projectflow-md-cleanup-plan-2026-04-04.md`

### B. 更早期 handoff / UI follow-up / 過渡討論
- `MD1-projectflow-handover.md`
- `MD10-projectflow-deployment-debug-and-integration-reset-handoff-2026-04-02.md`
- `MD11-projectflow-integration-progress-and-next-planning-handoff-2026-04-02.md`
- `MD12-projectflow-this-page-ui-followup-2026-04-03.md`
- `MD13-projectflow-ui-polish-handoff-2026-04-03.md`
- `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`

### C. 早期專頁 spec / flow spec / 功能段落 spec
- `MD28`~`MD107` 多數屬這一類
- 包含：
  - financial reconciliation / closeout / vendor detail / vendor list / vendor data
  - accounting center 各區塊 spec
  - month close
  - quote-cost source unification
  - retained archive formalization

### D. 中早期 implementation batch 與 closure 鏈
- `MD108`~`MD133` 整串若不是為了回查特定技術演進，預設應視為歷史脈絡
- 雖然其中部分文件仍可作 Secondary 回查，但整體不應再拿來當新 session 主入口

### E. 100 系列 usage scenario alignment summary 鏈
- `MD100`~`MD107`
- 這些屬於當時對齊 usage scenario 的中繼整理，不應再當現行治理入口

### Historical 層正式意義

這層不是垃圾，也不是要否定它們。
它們的價值是：
- 保留最初產品語意
- 保留責任切分的源頭
- 保留某些功能設計初衷
- 保留系統怎麼一路長成現在成熟主線的過程

但正式規則是：

> **Historical 層只能回查，不能主導現在。**

---

## 4. 讀法規則（簡版）

### 若你是新 session，要碰 `projectflow`
只先讀：
1. `MD-MASTER`
2. `MD-INDEX-projectflow-governing-document-architecture-2026-05-11.md`
3. 本文件
4. `MD155`
5. `MD156`
6. `MD157`

### 若你要判斷「系統現在到哪裡」
再加：
7. `MD158`
8. `MD163`
9. `MD164`

### 若你要碰驗收 / 測試 / source-of-truth / cross-page consistency`
再加：
10. `MD167`
11. `MD168`
12. `MD171`
13. `MD172`
14. `MD173`

### 若你要碰最新工程收斂主線
再加：
15. `MD203`~`MD210`

### 不該做的事
- 不要只讀 `MD21` 就開始判斷現在規則
- 不要只讀 `MD26` 就開始判斷現在正式資料主線
- 不要只翻某份舊 UI handoff 就動現行成熟系統主線

---

## 5. 一句話總結

> **`projectflow` 的文件現在應分成 Active / Secondary / Historical 三層：Active 才是現在的治理與續接主線，Secondary 是按需重要回查，Historical 則保留系統演進脈絡，但不可再當主要入口。**
