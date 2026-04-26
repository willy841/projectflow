# MD164 — projectflow acceptance / data governance / pre-production read-order index — 2026-04-26

> Status: ACTIVE / ENTRY INDEX
> Role: 作為目前 `projectflow` 這一輪驗收、資料治理、技術穩定性尾巴與正式站前準備的入口索引與閱讀順序指引。
> Goal: 避免後續續接時只看單一文件、只看局部 handoff、或混淆「產品驗收結論」「資料治理成果」「技術尾巴」「正式站前風險」之間的層次。

---

## 1. 這份文件是做什麼的

這份文件不是新的規格內容本體，
而是目前這一輪 `projectflow` 收斂結果的：

- 入口索引
- 閱讀順序
- 文件角色說明
- 續接時的最小安全讀法

後續任何人若要續接：
- 驗收現況
- 資料治理
- 技術穩定性尾巴
- 正式站搬移前準備

都不應只讀單一 MD，
而應依本索引進入。

---

## 2. 建議閱讀順序（重要）

### 2026-04-26 最新補充（Phase 1 技術收尾 / 正式站前主線）
若續接重點是：
- 技術性收尾完成度
- closeout retained read 的 snapshot-only 收斂結果
- clean-start 正式站前提下的正式資料紀律
- 正式站前還剩哪些真正技術尾巴

則除了本索引外，請明確納入以下文件：

0. **`project-mgmt/docs/projectflow-phase1-technical-tail-closure-summary-2026-04-26.md`**
   - Phase 1 技術收尾結案摘要
   - 含 handoff-ready conclusion
   - 目前是這條主線最直接的收口文件

1. **MD163 — `projectflow-current-maturity-and-next-step-management-summary-2026-04-26.md`**
2. **MD161 — `projectflow-technical-stability-tail-audit-and-next-actions-draft-2026-04-26.md`**
3. **MD162 — `projectflow-pre-production-migration-technical-risk-list-v1-2026-04-26.md`**
4. **`project-mgmt/docs/projectflow-closeout-retained-snapshot-fallback-strategy-2026-04-26.md`**
5. **`project-mgmt/docs/projectflow-pre-production-retained-snapshot-decision-memo-2026-04-26.md`**
6. **`project-mgmt/docs/projectflow-phase1-technical-change-risk-grading-2026-04-26.md`**
7. **`project-mgmt/docs/projectflow-fresh-project-validation-coverage-matrix-2026-04-26.md`**
   - 新建立專案重驗覆蓋矩陣
   - 明確區分：已在 fresh project 重驗、仍主要由既有 suite 覆蓋、尚未在 fresh project 窮舉重跑的範圍

這七份共同構成目前 Phase 1 技術收尾 / 正式站前技術紀律主線的最新入口。

### 第一層：先看整體管理總結
1. **MD163 — `projectflow-current-maturity-and-next-step-management-summary-2026-04-26.md`**

用途：
- 先快速知道現在整體成熟度到哪裡
- 哪些已完成、哪些未完成
- 為什麼現在可以停在這裡
- 接下來最合理主線是什麼

如果只能先讀一份，先讀這份。

---

### 第二層：看產品驗收主體
2. **MD158 — `projectflow-acceptance-rules-fixes-and-v2-suite-consolidation-2026-04-26.md`**

用途：
- 了解本輪產品驗收正式規則
- 了解哪些 bug / 修正已完成
- 了解新版 formal acceptance v2 的定位與結果
- 看 batch4 ~ batch12 的 deeper crossover 驗收結論

若問題是：
- 「目前主線驗收到哪裡？」
- 「哪些規則已拍板？」
- 「這輪驗收到底通過了什麼？」

應優先回到 MD158。

---

### 第三層：看資料治理主體
3. **MD159 — `projectflow-financial-data-governance-contract-invariants-and-guardrails-draft-2026-04-26.md`**

用途：
- financial / closeout / payment / reconciliation 的資料治理母檔
- contract / invariants / guardrails 草案主體
- route / migration / read-model 對照盤點
- `部分付款` semantic matrix / dependency map
- financial error taxonomy 第一輪盤點

若問題是：
- 「現在資料治理的正式定義是什麼？」
- 「哪些 invariants 已成立？」
- 「guardrails 接下來該做什麼？」

應優先回到 MD159。

---

### 第四層：看資料治理 P1 已完成成果
4. **MD160 — `projectflow-financial-data-governance-p1-completion-summary-2026-04-26.md`**

用途：
- 看 P1 哪些已真正落地
- 哪些 code-level guardrails 已做
- 哪些曾嘗試但已撤回
- 完整 formal acceptance 回測結果

若問題是：
- 「資料治理第一階段實際做了什麼？」
- 「哪些改動已落地且安全？」

應讀 MD160。

---

### 第五層：看技術穩定性尾巴
5. **MD161 — `projectflow-technical-stability-tail-audit-and-next-actions-draft-2026-04-26.md`**

用途：
- acceptance/runtime 啟動路徑盤點
- 非標準 `NODE_ENV` warning 判讀
- closeout snapshot fallback 策略盤點
- 技術穩定性尾巴的主軸整理

若問題是：
- 「現在除了功能以外，技術尾巴還剩什麼？」
- 「接下來該先收哪條技術穩定性主線？」

應讀 MD161。

---

### 第六層：看正式站前風險清單
6. **MD162 — `projectflow-pre-production-migration-technical-risk-list-v1-2026-04-26.md`**

用途：
- 正式站搬移前的技術風險清單
- 哪些是 blocker、哪些不是
- 哪些是正式站前應做的技術收尾

若問題是：
- 「現在適不適合搬正式站？」
- 「正式站前還差什麼技術收尾？」

應讀 MD162。

---

## 3. 文件角色分工（避免混淆）

### MD158
**產品驗收母檔**

回答：
- 驗收規則是什麼
- 主線與邊界驗收通過了什麼
- 哪些修正已完成

---

### MD159
**資料治理母檔**

回答：
- financial data governance 的 contract / invariants / guardrails 是什麼
- 哪些依賴已被看清楚
- 哪些治理工作接下來還要做

---

### MD160
**資料治理 P1 完成總結**

回答：
- P1 真正做完了哪些東西
- 哪些保留改動是安全的
- 哪些改動曾失敗並已回退

---

### MD161
**技術穩定性尾巴盤點**

回答：
- 技術尾巴主軸有哪些
- 哪些是 runtime/env 問題
- 哪些是 retained snapshot strategy 問題

---

### MD162
**正式站前風險清單**

回答：
- 目前還不能直接搬正式站的原因是什麼
- 哪些風險是正式站前必清
- 哪些風險可延後

---

### MD163
**管理視角總整版**

回答：
- 現在整體成熟度到哪裡
- 為什麼可以停在目前這個穩定停點
- 接下來整體最合理的主線是什麼

---

## 4. 安全續接規則

若之後要續接 `projectflow`，至少遵守以下規則：

### Rule A
若問題是「現在整體到哪裡」：
- 先讀 **MD163**

### Rule B
若問題是「產品規則 / 驗收到底怎麼定」：
- 先讀 **MD158**

### Rule C
若問題是「資料治理 / guardrails / invariants」：
- 先讀 **MD159**
- 再看 **MD160**

### Rule D
若問題是「技術尾巴 / runtime / 正式站前準備」：
- 先讀 **MD161**
- 再看 **MD162**
- 若是要接 Phase 1 技術收尾完成度、snapshot-only 結論、fresh-project 重驗結果，或 clean-start 正式站前提：
  - 再讀 `project-mgmt/docs/projectflow-phase1-technical-tail-closure-summary-2026-04-26.md`
  - `project-mgmt/docs/projectflow-closeout-retained-snapshot-fallback-strategy-2026-04-26.md`
  - `project-mgmt/docs/projectflow-pre-production-retained-snapshot-decision-memo-2026-04-26.md`
  - `project-mgmt/docs/projectflow-fresh-project-validation-coverage-matrix-2026-04-26.md`

### Rule E
不要只看到單一文件就直接動 code。
至少要先分清楚：
- 你現在碰的是產品驗收問題
- 資料治理問題
- 技術穩定性尾巴
- 還是正式站前風險問題

---

## 5. 目前整體一句話總結

> 目前 `projectflow` 已進入：產品驗收高成熟度通過、資料治理高完成度前段、Phase 1 技術性收尾已達高完成度穩定停點、正式站前主線已收斂成少數可管理技術紀律項的階段；後續續接不應再把這幾條主線混在一起，而應依本索引分層進入。
