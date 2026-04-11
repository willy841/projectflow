# MD-CLEANUP - projectflow 文件狀態整理表（2026-04-09）

> 目的：在不直接搬動或改名現有 MD 檔案的前提下，先把目前 `projectflow` 相關文件分成：
> 1. 主線必讀
> 2. 次主線 / 專題回查
> 3. 歷史脈絡保留
> 4. 封存候選
>
> 本檔是清理狀態表，不是新的母檔。
> 真正高階 source of truth 仍以：
> - `MD-MASTER-projectflow-system-source-of-truth.md`
> 為準。

---

## 1. 狀態標記說明

### A. 主線必讀
- 代表：新 session / 新對話若要續接特定主線，應優先讀。
- 用途：主入口、正式 spec、最新驗收 / 進度判斷。

### B. 次主線 / 專題回查
- 代表：不一定每次都先讀，但某一主題需要深入時要回查。
- 用途：子模組 spec、對齊規則、特定階段設計文件。

### C. 歷史脈絡保留
- 代表：保留歷史決策、handoff、早期草稿價值，但不可當主入口。
- 用途：追原因、追演變、追先前階段討論。

### D. 封存候選
- 代表：仍保留，但日後若要做實體封存，可優先考慮移出主工作區。
- 用途：避免根目錄繼續膨脹。

---

## 2. 主線必讀

### 2.1 永遠主入口
- `MD-MASTER-projectflow-system-source-of-truth.md`

### 2.2 目前最新下游主線（2026-04-09）
- `MD54-projectflow-accounting-center-master-spec-v1-2026-04-08.md`
- `MD55-projectflow-downstream-acceptance-and-ui-lock-handoff-2026-04-08.md`
- `MD56-projectflow-accounting-center-progress-and-open-tasks-2026-04-09.md`

### 2.3 上游 / 三條線 / 正式資料閉環主線
- `MD20-projectflow-approved-ui-lock-rule-2026-04-05.md`
- `MD21-projectflow-project-detail-responsibility-redistribution-spec-2026-04-05.md`
- `MD22-projectflow-mock-closed-loop-frontend-execution-brief-2026-04-05.md`
- `MD23-projectflow-db-schema-v1-draft-2026-04-05.md`
- `MD24-projectflow-db-schema-v1-table-walkthrough-2026-04-05.md`
- `MD25-projectflow-db-phase1-migration-plan-2026-04-05.md`
- `MD26-projectflow-formal-data-closure-validation-plan-2026-04-06.md`
- `MD57-projectflow-dispatch-drawer-completion-state-and-db-closure-alignment-2026-04-11.md`
- `MD59-projectflow-live-db-runtime-validation-and-field-alignment-handoff-2026-04-11.md`

補充狀態：
- `MD57` 不是新的母 spec，也不是獨立產品分支。
- 它的角色是：
  - 校正 `dispatch drawer` 的驗收切點
  - 把標準從「單一欄位局部互動」改成「整張表單的完整提交與完成態」
- `MD59` 不是新的產品 spec，而是 2026-04-11 這輪 **live DB runtime 驗收結果 handoff**。
- 它的角色是：
  - 把 staged validation 推進到 live Supabase DB runtime 的實際驗收
  - 正式記錄 design / procurement 主鏈路已跑到 document
  - 正式記錄 `boardPath` / procurement mapping / design merged-field 決策的收尾狀態
- 後續只要續接 `Project Detail dispatch -> design/procurement` 驗收，應把 `MD57` 與 `MD59` 一起視為現行有效規則與最新狀態。

### 2.4 2026-04-07 系統地圖與中間主線轉折
- `MD34-projectflow-system-progress-audit-and-next-stage-map-2026-04-07.md`
- `MD35-projectflow-next-stage-execution-blueprint-v1-2026-04-07.md`

---

## 3. 次主線 / 專題回查

### 3.1 Vendor Data / Closeout / Downstream 模組鏈
- `MD36-projectflow-vendor-detail-v1-spec-2026-04-08.md`
- `MD37-projectflow-vendor-list-v1-spec-2026-04-08.md`
- `MD38-projectflow-vendor-data-module-v1-spec-2026-04-08.md`
- `MD39-projectflow-vendor-data-upstream-midstream-alignment-v1-2026-04-08.md`
- `MD40-projectflow-closeout-module-v1-spec-2026-04-08.md`
- `MD41-projectflow-downstream-current-progress-and-open-topics-2026-04-08.md`

### 3.2 Accounting Center 子模組 spec
- `MD42-projectflow-accounting-center-personnel-input-area-v1-spec-2026-04-08.md`
- `MD43-projectflow-accounting-center-personnel-record-area-v1-spec-2026-04-08.md`
- `MD44-projectflow-accounting-center-operating-expense-module-v1-spec-2026-04-08.md`
- `MD45-projectflow-accounting-center-office-expense-input-area-v1-spec-2026-04-08.md`
- `MD46-projectflow-accounting-center-office-expense-record-area-v1-spec-2026-04-08.md`
- `MD47-projectflow-accounting-center-other-expense-input-area-v1-2026-04-08.md`
- `MD48-projectflow-accounting-center-other-expense-record-area-v1-2026-04-08.md`
- `MD49-projectflow-accounting-center-revenue-overview-v1-spec-2026-04-08.md`
- `MD50-projectflow-accounting-center-master-spec-and-downstream-alignment-2026-04-08.md`
- `MD51-projectflow-downstream-progress-refresh-after-accounting-center-spec-round-2026-04-08.md`
- `MD52-projectflow-accounting-center-closeout-vendor-data-alignment-v1-2026-04-08.md`
- `MD53-projectflow-accounting-center-active-projects-module-v1-spec-2026-04-08.md`

### 3.3 2026-04-07 中段主題檔
- `MD28-projectflow-financial-reconciliation-closeout-spec-2026-04-07.md`
- `MD29-projectflow-project-detail-upstream-flow-spec-2026-04-07.md`
- `MD30-projectflow-md29-upstream-phase1-progress-unverified-2026-04-07.md`
- `MD31-projectflow-closeout-record-list-detail-spec-2026-04-07.md`
- `MD32-projectflow-md29-upstream-phase1-acceptance-summary-2026-04-07.md`
- `MD33-projectflow-project-delete-flow-handoff-2026-04-07.md`

### 3.4 工程紅線 / UI lock / 清理輔助
- `MD17-projectflow-md-cleanup-plan-2026-04-04.md`
- `MD18-projectflow-44-commit-review-and-redo-plan-2026-04-05.md`
- `MD19-projectflow-page-by-page-ui-review-summary-2026-04-05.md`

---

## 4. 歷史脈絡保留（不可當主入口）

### 4.1 早期主線 handoff
- `MD1-projectflow-handover.md`
- `MD4-conversation-context-rule-and-vendor-flow-notes-2026-03-31.md`
- `MD5-vendor-flow-context-handoff-2026-03-31.md`
- `MD6-vendor-flow-v1-cto-delivery-2026-04-01.md`
- `MD7-vendor-flow-discussion-handoff-2026-04-01.md`
- `MD8-package-page-final-outgoing-document-handoff-2026-04-02.md`
- `MD9-project-detail-vendor-information-architecture-handoff-2026-04-02.md`
- `MD10-projectflow-deployment-debug-and-integration-reset-handoff-2026-04-02.md`
- `MD11-projectflow-integration-progress-and-next-planning-handoff-2026-04-02.md`

### 4.2 2026-04-03 ~ 2026-04-04 過渡 handoff / UI followup
- `MD12-projectflow-this-page-ui-followup-2026-04-03.md`
- `MD13-projectflow-ui-polish-handoff-2026-04-03.md`
- `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
- `MD15-projectflow-repo-audit-summary-v1-2026-04-04.md`
- `MD16-projectflow-current-round-handoff-2026-04-04.md`
- `MD27-projectflow-financial-handoff-2026-04-06.md`
- `MD-projectflow-left-sidebar-root-cause-2026-04-04.md`

正式規則：
- 這些檔案仍有價值，但只在需要追歷史時看。
- 不要在新 session 一開始就大量讀這批。

---

## 5. 封存候選（下一輪若要實體整理，可優先處理）

### 高優先封存候選
- `MD4-conversation-context-rule-and-vendor-flow-notes-2026-03-31.md`
- `MD5-vendor-flow-context-handoff-2026-03-31.md`
- `MD6-vendor-flow-v1-cto-delivery-2026-04-01.md`
- `MD7-vendor-flow-discussion-handoff-2026-04-01.md`
- `MD10-projectflow-deployment-debug-and-integration-reset-handoff-2026-04-02.md`
- `MD11-projectflow-integration-progress-and-next-planning-handoff-2026-04-02.md`
- `MD12-projectflow-this-page-ui-followup-2026-04-03.md`
- `MD13-projectflow-ui-polish-handoff-2026-04-03.md`
- `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
- `MD16-projectflow-current-round-handoff-2026-04-04.md`
- `MD27-projectflow-financial-handoff-2026-04-06.md`
- `MD-projectflow-left-sidebar-root-cause-2026-04-04.md`

### 中優先封存候選
- `MD1-projectflow-handover.md`
- `MD8-package-page-final-outgoing-document-handoff-2026-04-02.md`
- `MD9-project-detail-vendor-information-architecture-handoff-2026-04-02.md`
- `MD30-projectflow-md29-upstream-phase1-progress-unverified-2026-04-07.md`

### 不建議封存（仍留根目錄）
- `MD-MASTER-projectflow-system-source-of-truth.md`
- `MD20`～`MD26`
- `MD34`～`MD56`
- `MD-INDEX-projectflow-document-map-2026-04-09.md`
- 本檔 `MD-CLEANUP-projectflow-status-map-2026-04-09.md`

---

## 6. 下一步建議整理方案

### 方案 A（最穩，建議）
- 保留所有現有檔案位置
- 使用：
  - `MD-MASTER`
  - `MD-INDEX`
  - `MD-CLEANUP`
  作為新的閱讀三件組
- 之後只新增，不先搬動舊檔

### 方案 B（下一輪可做）
若使用者要實體清理，可考慮建立：
- `md/current/`
- `md/specs/`
- `md/history/`
- `md/archive-candidates/`

但前提是：
1. 先修正母檔與 AGENTS.md 中所有引用
2. 確保新 session 閱讀規則不會因路徑變動而失效

---

## 7. 一句話總結

目前最安全的 MD 整理法不是立刻大量搬檔，而是：
> **先用狀態表標清楚哪些是主線、哪些是歷史、哪些可封存，等規則穩了再做實體搬移。**
