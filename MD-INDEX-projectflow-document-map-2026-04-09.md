# MD-INDEX - projectflow 文件整理索引（2026-04-09）

> 目的：把目前散落在 workspace 根目錄的 `MD*.md` 做結構化索引，讓後續新 session / 新對話可以更快知道：
> 1. 哪些是母檔 / 主入口
> 2. 哪些是目前仍有效的主線文件
> 3. 哪些是已驗收 UI lock 檔
> 4. 哪些屬於歷史 handoff / 回查資料
>
> 注意：本檔是**索引檔**，不是新的 source of truth。
> 真正高階母檔仍以：
> - `MD-MASTER-projectflow-system-source-of-truth.md`
> 為準。

---

## 1. 主入口（永遠先讀）

### 1.1 母檔
- `MD-MASTER-projectflow-system-source-of-truth.md`

正式規則：
- 只要要續接 `projectflow`，先讀母檔。
- 若母檔與舊 handoff 衝突，以母檔與其指向的新文件為準。

---

## 2. 目前最新下游主線（2026-04-09 之後優先）

若要續接目前最新下游工作，建議優先順序：

1. `MD54-projectflow-accounting-center-master-spec-v1-2026-04-08.md`
2. `MD55-projectflow-downstream-acceptance-and-ui-lock-handoff-2026-04-08.md`
3. `MD56-projectflow-accounting-center-progress-and-open-tasks-2026-04-09.md`
4. `MD50-projectflow-accounting-center-master-spec-and-downstream-alignment-2026-04-08.md`
5. `MD51-projectflow-downstream-progress-refresh-after-accounting-center-spec-round-2026-04-08.md`
6. `MD52-projectflow-accounting-center-closeout-vendor-data-alignment-v1-2026-04-08.md`
7. `MD53-projectflow-accounting-center-active-projects-module-v1-spec-2026-04-08.md`

### 2.1 2026-04-11 新增驗收校正 / live runtime / 本輪總整理檔
- `MD57-projectflow-dispatch-drawer-completion-state-and-db-closure-alignment-2026-04-11.md`
- `MD59-projectflow-live-db-runtime-validation-and-field-alignment-handoff-2026-04-11.md`
- `MD60-projectflow-midstream-plan-confirm-live-db-validation-handoff-2026-04-11.md`
- `MD61-projectflow-downstream-db-first-vendor-runtime-status-handoff-2026-04-11.md`
- `MD62-projectflow-current-round-completion-rules-and-open-items-alignment-2026-04-11.md`
- `MD63-projectflow-downstream-financial-progress-refresh-2026-04-11.md`
- `MD64-projectflow-vendor-data-unpaid-zone-partial-reconciliation-rule-2026-04-11.md`
- `MD65-projectflow-vendor-data-detail-action-vs-archive-semantics-2026-04-12.md`
- `MD66-projectflow-vendor-data-detail-validation-refresh-2026-04-12.md`
- `MD67-projectflow-latest-global-progress-refresh-2026-04-12.md`
- `MD134-projectflow-post-md133-project-detail-dispatch-and-ui-closure-2026-04-14.md`
- `MD135-projectflow-ui-consistency-95-percent-closure-and-guardrails-2026-04-15.md`
- `MD136-projectflow-product-guardrails-and-formalization-rules-2026-04-15.md`

用途：
- `MD57`
  - 補記 `Project Detail dispatch drawer` 在上游 → 中游 DB 收尾主線中的正式定位
  - 校正驗收標準：
    - 不再以單一欄位局部互動當主要驗收單位
    - 改以整張 dispatch 表單的完整提交與完成態為判斷基準
- `MD59`
  - 補記在 **live Supabase DB runtime** 下的 upstream 驗收結果
  - 已正式確認：
    - design `dispatch -> reload -> detail -> document` PASS
    - procurement `dispatch -> reload -> detail -> document` PASS
    - `boardPath` 單一資料源修正完成
    - procurement mapping 修正完成
    - design merged field（A 方案）已定案並開始對齊
- `MD60`
  - 補記 midstream `detail -> plan -> confirm -> snapshot(DB)` 的 live runtime 驗收結果
- `MD61`
  - 補記 downstream vendor runtime / vendor DB-first 主線的排查與驗收過程
- `MD62`
  - 補記本輪截至目前為止的**總整理**：
    - 哪些已 PASS
    - 哪些規則已拍板
    - 哪些 downstream 項目仍未完成
    - 特別校正「vendor 發包主線 PASS ≠ Vendor Data 全模組 PASS」
- `MD63`
  - 補記 downstream financial 最新進度刷新：
    - `/quote-costs` list source = all projects 已完成
    - `quote-cost detail` control state 已 group-first
    - archive panel 已改成動態 financial items
    - `Vendor Data monetary layer` 已開始與 quote-cost detail 正式對上
- `MD64`
  - 補記 `Vendor Data / 未付款專區` 的新正式規則：
    - 採方案二
    - 已對帳即累加顯示金額
    - 但若尚未全部對帳，必須顯示 warning
- `MD65`
  - 補記 `Vendor Data detail` 的語意定稿：
    - 未付款列表 = action-oriented
    - 往來記錄 / 查看明細 = archive-oriented
    - Financial 是主語意，Task / Package 是輔助語意
- `MD66`
  - 補記 `Vendor Data detail` 的最新驗收刷新：
    - partial / full reconciliation warning 前端驗證已完成
    - 未付款專區規則已落地
    - 發包內容明細維持現狀已拍板
- `MD67`
  - 補記目前整個 `projectflow` 的最新全局盤點：
    - 哪些已 DB 化且穩定
    - 哪些已部分完成但尚未完全收尾
    - 哪些主線仍未完成
    - 哪些 spec 仍可能需要後續討論
- `MD134`
  - 承接 `MD133` 之後的最新 closure / handoff
  - 正式收斂：
    - project detail upstream existence
    - requirements closure
    - execution items CRUD / DB truth / Excel import
    - design / procurement / vendor dispatch closure
    - vendor matching 完整結構版
    - project detail / projects list / homepage / new project page UI cleanup
  - 並明確標示：完成 / 衝突已修正 / 仍待處理
- 若要續接 2026-04-11 / 2026-04-14 這輪主線，`MD57`～`MD67` 與 `MD134` 應和 `MD20`～`MD26` 一起看，其中 `MD134` 是目前 project detail / dispatch / overview / list / new project cleanup 的最新 closure 主入口。

### 目前主判斷
- `Closeout list / detail`：已驗收、已 lock
- `Vendor detail`：今日（2026-04-09）已驗收到可視為封版
- `Accounting Center`：仍是剩餘主驗收線

---

## 3. 上游 / 三條線 / 資料閉環主線（仍有效，但非最新第一順位）

1. `MD20-projectflow-approved-ui-lock-rule-2026-04-05.md`
2. `MD21-projectflow-project-detail-responsibility-redistribution-spec-2026-04-05.md`
3. `MD22-projectflow-mock-closed-loop-frontend-execution-brief-2026-04-05.md`
4. `MD23-projectflow-db-schema-v1-draft-2026-04-05.md`
5. `MD24-projectflow-db-schema-v1-table-walkthrough-2026-04-05.md`
6. `MD25-projectflow-db-phase1-migration-plan-2026-04-05.md`
7. `MD26-projectflow-formal-data-closure-validation-plan-2026-04-06.md`

用途：
- 回查 `project detail` / 三條線 / DB phase 1 / 正式資料閉環 / 上游承接時使用。

---

## 4. Vendor Data / Closeout / Downstream spec 鏈（2026-04-08）

### Vendor Data
- `MD36-projectflow-vendor-detail-v1-spec-2026-04-08.md`
- `MD37-projectflow-vendor-list-v1-spec-2026-04-08.md`
- `MD38-projectflow-vendor-data-module-v1-spec-2026-04-08.md`
- `MD39-projectflow-vendor-data-upstream-midstream-alignment-v1-2026-04-08.md`

### Closeout
- `MD40-projectflow-closeout-module-v1-spec-2026-04-08.md`

### Downstream 進度 / open topics
- `MD41-projectflow-downstream-current-progress-and-open-topics-2026-04-08.md`

---

## 5. Accounting Center 子 spec 鏈（2026-04-08）

- `MD42-projectflow-accounting-center-personnel-input-area-v1-spec-2026-04-08.md`
- `MD43-projectflow-accounting-center-personnel-record-area-v1-spec-2026-04-08.md`
- `MD44-projectflow-accounting-center-operating-expense-module-v1-spec-2026-04-08.md`
- `MD45-projectflow-accounting-center-office-expense-input-area-v1-spec-2026-04-08.md`
- `MD46-projectflow-accounting-center-office-expense-record-area-v1-spec-2026-04-08.md`
- `MD47-projectflow-accounting-center-other-expense-input-area-v1-spec-2026-04-08.md`
- `MD48-projectflow-accounting-center-other-expense-record-area-v1-spec-2026-04-08.md`
- `MD49-projectflow-accounting-center-revenue-overview-v1-spec-2026-04-08.md`

用途：
- 當要針對 `Accounting Center` 的某一子模組細看規則時再讀。
- 平常不要一開始全讀，避免 context 浪費。

---

## 6. 2026-04-07 中間主線文件

- `MD28-projectflow-financial-reconciliation-closeout-spec-2026-04-07.md`
- `MD29-projectflow-project-detail-upstream-flow-spec-2026-04-07.md`
- `MD30-projectflow-md29-upstream-phase1-progress-unverified-2026-04-07.md`
- `MD31-projectflow-closeout-record-list-detail-spec-2026-04-07.md`
- `MD32-projectflow-md29-upstream-phase1-acceptance-summary-2026-04-07.md`
- `MD33-projectflow-project-delete-flow-handoff-2026-04-07.md`
- `MD34-projectflow-system-progress-audit-and-next-stage-map-2026-04-07.md`
- `MD35-projectflow-next-stage-execution-blueprint-v1-2026-04-07.md`

用途：
- 回查 2026-04-07 這輪主線轉折、closeout、delete flow、system map、下一階段藍圖。

---

## 7. 工程紅線 / UI lock / repo 整理輔助檔

- `MD17-projectflow-md-cleanup-plan-2026-04-04.md`
- `MD18-projectflow-44-commit-review-and-redo-plan-2026-04-05.md`
- `MD19-projectflow-page-by-page-ui-review-summary-2026-04-05.md`
- `MD20-projectflow-approved-ui-lock-rule-2026-04-05.md`

用途：
- 查工程紅線
- 查哪些 UI 已 lock
- 查哪些 commit 不該重放
- 查 MD 清理策略

---

## 8. 早期 handoff / 歷史脈絡（不要當主入口）

- `MD1-projectflow-handover.md`
- `MD4-conversation-context-rule-and-vendor-flow-notes-2026-03-31.md`
- `MD5-vendor-flow-context-handoff-2026-03-31.md`
- `MD6-vendor-flow-v1-cto-delivery-2026-04-01.md`
- `MD7-vendor-flow-discussion-handoff-2026-04-01.md`
- `MD8-package-page-final-outgoing-document-handoff-2026-04-02.md`
- `MD9-project-detail-vendor-information-architecture-handoff-2026-04-02.md`
- `MD10-projectflow-deployment-debug-and-integration-reset-handoff-2026-04-02.md`
- `MD11-projectflow-integration-progress-and-next-planning-handoff-2026-04-02.md`
- `MD12-projectflow-this-page-ui-followup-2026-04-03.md`
- `MD13-projectflow-ui-polish-handoff-2026-04-03.md`
- `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
- `MD15-projectflow-repo-audit-summary-v1-2026-04-04.md`
- `MD16-projectflow-current-round-handoff-2026-04-04.md`
- `MD27-projectflow-financial-handoff-2026-04-06.md`
- `MD-projectflow-left-sidebar-root-cause-2026-04-04.md`

正式規則：
- 這些檔案保留歷史價值，但**不要作為新 session 的第一入口**。
- 若要回查歷史決策、排障經過、早期 Vendor Flow 脈絡，再讀。

---

## 9. 建議後續整理動作（本輪先不暴力搬檔）

### 建議做，但需小心：
1. 保留所有現有檔名，不先 rename，避免母檔與引用斷掉。
2. 先用本索引檔統一入口，降低混亂。
3. 下一輪若要再整理，可考慮新增資料夾：
   - `md/master/`
   - `md/downstream/`
   - `md/upstream/`
   - `md/history/`
4. 但若真的要搬檔，必須先同步修正母檔與 AGENTS.md 中所有引用，否則容易把續接規則弄壞。

### 本輪判斷
目前最穩的做法不是直接大量搬移，而是：
> **保留原檔，新增索引，讓人先知道怎麼讀。**

---

## 10. 一句話總結

目前 `projectflow` 的 MD 文件已很多，最安全的整理方式不是先大量改名搬家，而是：
- 保留現有檔案
- 用本索引檔建立閱讀地圖
- 新 session 一律先從 `MD-MASTER` 與本索引開始
- 最新下游主線優先看 `MD54 / MD55 / MD56`
