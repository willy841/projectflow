# MD171 — projectflow whole-system acceptance framework / source-of-truth / cross-page consistency matrix — 2026-05-05

Status: ACTIVE / SYSTEM-WIDE QA FRAMEWORK  
Role: `projectflow` 全站驗收體系母檔。  
Goal: 把目前零散的 formal acceptance、頁面主流程、欄位連動、資料治理與跨頁一致性要求，收斂成一套適用於整個網站 / 專案系統的驗收框架。

---

## 0. 這份文件要解決什麼問題

目前 `projectflow` 已經不是單頁 UI 專案，真正高風險 bug 大多不是：

- 按鈕不能按
- 頁面打不開
- 某個字沒顯示

而是：

- A 頁成功寫入，但 B 頁 list 沒更新
- detail 對，reopen edit 錯
- quote-cost 對，vendor list 錯
- source of truth 已變，但 adapter / summary / 聚合值還在看舊來源
- status 改了，但 amount / downstream payable / closeout snapshot 沒同步

這類 bug 的本質不是單頁功能錯誤，而是：

> **資料閉環驗收不完整，cross-page consistency 沒被制度化驗證。**

因此之後 `projectflow` 的驗收不能只靠：

- 單頁 clickpath
- 單一 script
- 某頁綠燈就算完成

而必須升級成：

1. **source-of-truth 驗收**
2. **cross-page consistency 驗收**
3. **狀態轉換驗收**
4. **下游 readback 驗收**
5. **分層測試策略（主線 / 完整 / 高風險回歸 / 人工 spot check）**

---

## 1. 全站驗收的核心原則

### Principle A — 不再只驗頁面，要驗資料閉環

每一條重要資料都必須回答：

1. 寫入點在哪裡？
2. 唯一 source of truth 是哪裡？
3. 哪些 read model / adapter 會讀它？
4. 哪些頁面 / summary / list / detail 會顯示它？
5. 哪些狀態轉換會改變它？

### Principle B — 不把 local state / optimistic UI 當驗收完成

任何 mutation 都必須至少驗：

1. 當頁更新
2. refresh 後 readback
3. list / summary 同步
4. reopen / detail 再讀一次

### Principle C — 聚合數字一律視為高風險資料

凡是以下類型，全部列為高風險：

- quotation total
- project cost
- vendor unpaid
- collection total
- closeout retained totals
- reconciliation counts / statuses

原因：
- 聚合數字最容易出現 source 混用
- status 有變但 amount 沒同步
- detail 與 list 讀不同來源

### Principle D — 狀態轉換一定要驗下游

不能只驗按鈕變化。  
凡是下列狀態轉換：

- 全部確認
- 已對帳
- 已付款
- 已結案
- reopen

都必須驗：

- DB 寫入
- 主 read model
- 下游 list / detail / summary
- 若有 retained snapshot / archived read，則連 archived side 一起驗

---

## 2. 正式分層驗收策略

### Layer 1 — Formal Mainline Blocker

用途：快速判斷目前正式主線是否綠燈。

入口：
- `npm run test:formal-acceptance:v2`

對應文件：
- `MD167`
- `MD168`

適用：
- 判 blocker
- 主要 code 改動後先驗主線
- vendor / quote-cost / closeout / cross-flow 快速綠燈確認

### Layer 2 — Full-System Acceptance

用途：從新建專案到結案資料做完整正式驗收。

入口：
- `npm run test:formal-acceptance:full`

適用：
- 大幅修改資料流
- 接近 release / pre-production
- 需要回答「整套從頭到尾還有沒有壞」

### Layer 3 — Source-of-Truth / Cross-Page Consistency Regression

用途：驗證 mutation 之後，多個頁面與 read model 是否一致。

這一層目前是 `projectflow` 最缺的制度化層。  
之後每個高風險資料都必須在這層被覆蓋。

### Layer 4 — Manual Spot Check

用途：驗自動化不適合完全覆蓋的項目：

- 視覺一致性
- 資訊密度
- 頁面理解成本
- 真實操作流程觀感
- 暗色 theme / layout / spacing / human-readable quality

---

## 3. 系統模組級驗收矩陣（第一版）

---

## 3.1 Projects / Project Core

### 核心資料
- project base profile
  - code
  - name
  - client
  - event date
  - location
  - contact fields
  - owner

### Source of truth
- `projects` table

### 主要寫入點
- new project
- project edit

### 主要 read path
- `project-flow-adapter`
- project list read model
- home overview read model
- project detail shell

### 必驗頁面
- `/projects/new`
- `/projects/[id]` edit / detail
- `/projects`
- `/`

### 必驗閉環
1. project edit 後 detail 顯示正確
2. refresh 後仍正確
3. reopen edit 回填正確
4. `/projects` list 正確
5. `/` overview 若引用該欄位，必須同步

### 已知高風險點
- detail 與 list adapter 不一致
- homepage 與 project adapter 讀不同來源
- owner 類欄位被硬編碼 `'-'`

---

## 3.2 Execution / Dispatch / Requirement → Family Routing

### 核心資料
- project requirements
- execution items
- design assignment drafts
- procurement assignment drafts
- vendor assignment drafts

### Source of truth
- upstream：`project_requirements` / `execution_items`
- downstream 正式成立點：dispatch 轉 family task tables

### 主要寫入點
- project detail dispatch drawer
- requirements CRUD
- execution item import

### 主要 read path
- project detail shell
- execution tree
- design / procurement / vendor family pages

### 必驗頁面
- `/projects/[id]`
- `/design-tasks`
- `/procurement-tasks`
- `/vendor-assignments`
- family detail pages

### 必驗閉環
1. dispatch 送出後 family task 真正建立
2. family list 看得到
3. family detail 看得到
4. 回 project detail card / summary 同步
5. refresh 後仍存在

### 已知高風險點
- assignment payload remap / callback 改寫造成 page-level side effects
- local state / localStorage 蓋過正式 DB
- dispatch 有送出但 family adapter 沒承接新欄位

---

## 3.3 Design Line

### 核心資料
- design task
- design assignee
- design plans / confirmed snapshots
- design document generation status

### Source of truth
- task base：`design_tasks`
- 成本正式成立：`task_confirmations` + `task_confirmation_plan_snapshots`

### 主要寫入點
- dispatch to design
- design task confirm / replace plans / sync plans

### 主要 read path
- `design-flow-adapter`
- project detail downstream cards
- quote-cost financial adapter

### 必驗頁面
- `/design-tasks`
- `/design-tasks/[id]`
- `/projects/[id]`
- `/quote-costs/[id]`

### 必驗閉環
1. design assignee 建立後 list / detail / reopen 一致
2. confirm 後 snapshot 寫入成立
3. quote-cost 成本項會反映 design confirmed amount
4. downstream vendor / reconciliation 若依賴 vendor 綁定，必須同步

### 已知高風險點
- UI 欄位新增但 DB / adapter 未承接
- detail 有、list 沒有
- confirmed amount 進入 quote-cost 但 grouping / vendor reconciliation 不同步

---

## 3.4 Procurement Line

### 核心資料
- procurement task
- buyer / budget note
- procurement plans / confirmed snapshots

### Source of truth
- task base：`procurement_tasks`
- 成本正式成立：`task_confirmations` + `task_confirmation_plan_snapshots`

### 必驗頁面
- `/procurement-tasks`
- `/procurement-tasks/[id]`
- `/projects/[id]`
- `/quote-costs/[id]`

### 必驗閉環
1. dispatch → procurement task 成立
2. confirm → financial cost item 成立
3. quote-cost / reconciliation / closeout downstream 會反映

### 已知高風險點
- procurement confirmed snapshots 與 quote-cost sourceType=`備品` 聚合斷裂
- itemCount / amountTotal 對帳群組寫入缺失

---

## 3.5 Vendor Line / Packages / Vendor Assignments

### 核心資料
- vendor tasks
- vendor package
- vendor confirmed snapshots
- vendor payable lifecycle

### Source of truth
- task base：`vendor_tasks`
- package / vendor doc：vendor package flow
- 成本正式成立：latest vendor confirmations + snapshots

### 必驗頁面
- `/vendor-assignments`
- `/vendor-assignments/[id]`
- `/vendor-packages`
- `/vendor-packages/[id]`
- `/quote-costs/[id]`
- `/vendors/[id]`

### 必驗閉環
1. vendor assignment → package / detail 可見
2. confirm 後 financial cost items 成立
3. vendor detail / unpaid history 可見
4. payment 後 unpaid 下降

### 已知高風險點
- vendor name / vendor id 對不上
- package flow 與 financial readback 分裂
- vendor detail history 與 list total 不一致

---

## 3.6 Quote Cost / Financial Core

### 核心資料
- quotation import
- quotation total
- cost items
- includedInCost
- manual costs
- reconciliation groups

### Source of truth
- quotation：`financial_quotation_imports` + `financial_quotation_line_items`
- cost：formal confirmed snapshots + manual costs
- project financial aggregate：`financial-flow-adapter`

### 必驗頁面
- `/quote-costs`
- `/quote-costs/[id]`
- `/projects`
- `/`
- closeout pages

### 必驗閉環
1. quotation import 後 quotation total 正確
2. cost 成立後 detail / list / summary 一致
3. `/projects` 預算 / 成本 = 正式 DB financial source
4. manual costs toggle / inclusion 會正確影響 closeout / accounting / retained snapshot

### 已知高風險點
- list / detail 使用不同 financial source
- local workflow store 覆蓋正式 DB source
- reconciliation groups sync 漏 amountTotal / itemCount

---

## 3.7 Reconciliation

### 核心資料
- financial reconciliation groups
- group status
- amountTotal
- itemCount

### Source of truth
- `financial_reconciliation_groups`
- amount / itemCount 應來自 formal financial snapshots 聚合

### 必驗頁面
- `/quote-costs/[id]`
- `/vendors`
- `/vendors/[id]`
- closeout gate checks

### 必驗閉環
1. 按「已對帳」後，DB status / amount / itemCount 正確寫入
2. vendor list 未付款應增加（若未付款紀錄尚未建立）
3. vendor detail 未付款區同步
4. closeout gate / outstanding / reconciliationStatus 同步

### 已知高風險點
- 只寫 status，沒寫 amount
- amount_total = 0 舊資料污染 downstream unpaid
- vendor list 與 vendor detail 聚合方式不一致

---

## 3.8 Vendor Directory / Payments

### 核心資料
- vendor basic profile
- vendor outstanding total
- paid history
- unpaid records

### Source of truth
- vendor base：`vendors`
- unpaid：reconciled group totals - payment records
- payments：`project_vendor_payment_records`

### 必驗頁面
- `/vendors`
- `/vendors/[id]`

### 必驗閉環
1. reconciliation 完成後，未付款增加
2. 標示付款 / payment record 建立後，未付款下降
3. list 與 detail total 一致
4. history 與 open records 切換正確

### 已知高風險點
- unpaid total 使用錯誤 source
- list 與 detail 計算方式不同
- history / open semantic 跟 paymentStatus 不一致

---

## 3.9 Collections / Receivables

### 核心資料
- collection records
- collected total
- outstanding receivable

### Source of truth
- `project_collection_records`
- quote-cost / accounting adapters downstream aggregation

### 必驗頁面
- `/quote-costs/[id]`
- accounting / home summaries（若引用）
- closeout / archive retained snapshot（若引用）

### 必驗閉環
1. collection mutation 後 detail 正確
2. refresh 後 readback 正確
3. accounting summary / downstream aggregate 同步

---

## 3.10 Closeout / Retained Snapshot / Reopen

### 核心資料
- closeout retained snapshot
- archived financial totals
- reopen legality / freeze rules

### Source of truth
- active side：formal financial adapters
- closed side：retained snapshot / archive read model

### 必驗頁面
- `/closeouts`
- `/closeouts/[id]`
- quote-cost closeout actions

### 必驗閉環
1. closeout 前 outstanding / reconciliation gate 正確
2. closeout 後 retained snapshot readback 正確
3. reopen 後 active financial state 合法恢復
4. second closeout overwrite / manual cost freeze / fallback strategy 依既有 suite 驗證

### 已知高風險點
- archived read 與 active read 混用
- snapshot-only / fallback strategy 不一致
- reopen 後 retained / active source 交叉污染

---

## 3.11 Home / Summary / Accounting / Dashboard

### 核心資料
- overview cards
- active projects summary
- revenue / cost / collection rollups

### Source of truth
- 不應自創來源
- 應只讀正式 read models / financial adapters / accounting adapters

### 必驗頁面
- `/`
- accounting-related pages / summaries

### 必驗閉環
1. source 應與 project / quote-cost / collections 相同
2. summary 值與 detail page 反查一致
3. 不可直接看 mock / stale adapter 值

### 已知高風險點
- home overview 直接讀 DB，而 project list 走另一條 adapter
- accounting summary 與 quote-cost total 不一致

---

## 4. 驗收動作模板（全站共用）

每一條 mutation 類功能，驗收至少分四層：

### Step 1 — Mutation success
- UI 動作成功
- API / server action 成功

### Step 2 — Same-page readback
- 當頁 refresh 後仍正確

### Step 3 — Cross-page readback
- list / summary / detail / reopen edit 同步

### Step 4 — Downstream invariant
- 若影響 financial / payable / closeout / archive，必須驗 downstream invariants

---

## 5. 後續自動化策略（制度化）

### 類型 A：必自動化

1. 主檔欄位 sync
2. dispatch → family routing
3. confirm → financial readback
4. quotation import → project list budget
5. reconciliation → vendor unpaid increase
6. payment record → vendor unpaid decrease
7. closeout / retained snapshot / reopen

### 類型 B：高風險回歸包

只要碰下列模組，就一定要跑對應回歸：

- project core → list/home/detail/edit sync
- design/procurement/vendor confirm → quote-cost / vendor / closeout downstream
- quote-cost → projects list / vendor / closeout / accounting
- vendor unpaid / payment → vendor list + vendor detail + payment history
- closeout/reopen → retained snapshot + active side readback

### 類型 C：人工 spot check

1. 視覺層級 / spacing / theme consistency
2. 多列表資訊密度與 human-readable quality
3. 使用者是否能直覺理解欄位語意
4. 需要人類判讀的 UX flow

---

## 6. 現有測試覆蓋與缺口判讀

### 已有較強覆蓋
- `formal-acceptance-v2/00~24`
- vendor / quote-cost / closeout / cross-flow 主線
- fresh project lifecycle
- boundary reopen / second closeout / manual cost freeze

### 目前明顯缺口
1. **欄位級 cross-page consistency 系統化不足**
   - owner
   - assignee
   - budget/cost list sync
   - vendor unpaid after reconciliation/payment

2. **source-of-truth regression tests 不夠顯式**
   - 現有很多 test 驗 clickpath，但沒有明確 assertion「list/detail/home/summary 同步一致」

3. **adapter-level drift 風險**
   - project adapter
   - design-flow adapter
   - vendor directory adapter
   - financial read models

4. **zero-value but status-changed 類資料污染**
   - reconciliation group amount_total 寫 0 但 status 已對帳
   - 這類需要 invariants 類測試

---

## 7. 之後每次改功能的硬規則

之後只要碰 `projectflow` 任一資料流，驗收回報至少必須包含：

1. **這次改的是哪個 source of truth**
2. **這次影響哪些下游頁**
3. **已驗哪些 cross-page readback**
4. **跑了哪些 formal acceptance / 補充回歸**
5. **若宣稱完成，必須指出具體證據**
   - 改檔
   - build/test
   - 若有 DB migration / repair，也要說清楚

---

## 8. 建議下一步（後續文件 / 測試落地）

這份 MD171 是母檔。  
後續應再拆兩份執行文件：

### A. `projectflow-source-of-truth-test-gap-matrix`
- 列每條資料欄位 / 聚合值 / status transition
- 對照現有 test coverage
- 標記缺口與優先級

### B. `projectflow-cross-page-consistency-regression-pack`
- 列出應補的具體 E2E / API / DB readback tests
- 先補最常出同型 bug 的幾條

---

## 9. 一句話總結

> `projectflow` 之後的正式驗收，不能再只看單頁 clickpath 是否綠燈；必須升級成「source-of-truth + cross-page consistency + status transition + downstream readback」的全站驗收體系，而這份 MD171 就是這套體系的母檔。
