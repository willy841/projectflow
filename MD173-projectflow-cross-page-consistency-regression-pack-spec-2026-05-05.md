# MD173 — projectflow cross-page consistency regression pack spec — 2026-05-05

Status: ACTIVE / REGRESSION PACK SPEC  
Role: `MD171` / `MD172` 的執行層文件之一。  
Goal: 定義之後要補進 `projectflow` 的 cross-page consistency regression packs，讓未來每次改動不是只跑主線 clickpath，而是能精準檢查 source-of-truth 與下游同步。

---

## 1. 這份文件怎麼用

這份不是母檔，這份是：

- 要補哪些 test pack
- 每個 pack 驗什麼
- 成功條件是什麼
- 應用在哪些改動類型

實作形式可依情況分成：
- Playwright E2E
- API + DB readback
- 混合式（UI mutation + DB verify）

---

## 2. Regression Pack 清單（第一波）

---

## Pack A — Project Core Cross-Page Consistency

### 目的
鎖住 project base fields 在 detail / reopen edit / list / home 之間的一致性。

### Mutation
- edit project owner
- edit client / event date / contact fields

### Assertions
1. edit 成功
2. detail 顯示新值
3. refresh 後仍正確
4. reopen edit 回填正確
5. `/projects` list 正確
6. `/` recent projects / summary 若引用則正確

### 適用改動
- `projects` table
- project edit form
- project-flow-adapter
- home overview read model
- projects list read model

### 優先級
- P0

---

## Pack B — Design Assignee Consistency Pack

### 目的
鎖住「任務發布 → 交辦設計」新增設計負責人後，所有下游頁一致。

### Mutation
- project detail dispatch to design with assignee text

### Assertions
1. dispatch 成功
2. design task 建立
3. `/design-tasks` list 顯示設計負責人
4. `/design-tasks/[id]` detail 顯示設計負責人
5. project detail downstream summary / card 可正確讀回
6. refresh / reopen 後仍在

### 適用改動
- dispatch route
- `design_tasks.assignee`
- design-flow adapter
- project-flow adapter

### 優先級
- P0

---

## Pack C — Project List Budget/Cost Source-of-Truth Pack

### 目的
確保 `/projects` 的預算 / 成本欄位永遠吃正式 DB financial source，不再被 local store / 錯 adapter 污染。

### Mutation
- import quotation
- create/confirm cost sources（design/procurement/vendor）

### Assertions
1. `/quote-costs/[id]` quotation total 正確
2. `/quote-costs/[id]` cost total 正確
3. `/projects` 預算 = quotation total
4. `/projects` 成本 = included cost total
5. refresh 後一致

### 適用改動
- quotation import
- financial-flow-adapter
- projects list read model
- project list client/server wiring

### 優先級
- P0

---

## Pack D — Reconciliation Group Integrity Pack

### 目的
鎖住已對帳不是只改 status，而是會正確寫入 amountTotal / itemCount。

### Mutation
- 在 quote-cost detail 對某 group 按「已對帳」

### Assertions
1. API 成功
2. `financial_reconciliation_groups.reconciliation_status = 已對帳`
3. `amount_total > 0`
4. `item_count > 0`
5. quote-cost detail 顯示對帳狀態正確
6. closeout gate / reconciliation summary 同步

### 實作建議
- UI mutation + DB readback

### 優先級
- P0

---

## Pack E — Vendor Unpaid Increase/Decrease Lifecycle Pack

### 目的
鎖住 vendor payable lifecycle：
- 已對帳後未付款增加
- 建立付款紀錄後未付款下降

### Mutation A
- quote-cost detail reconcile group

### Assertions A
1. vendor detail open unpaid records 增加 / 金額增加
2. `/vendors` list card total 增加
3. payment history 尚未新增付款時，paymentStatus 仍未付款

### Mutation B
- vendor detail create payment

### Assertions B
1. payment record 建立
2. vendor detail 未付款下降
3. vendor list 未付款下降
4. history tab / paid records 正確
5. fully paid 時 paymentStatus 變 `已付款`

### 優先級
- P0

---

## Pack F — Dispatch Family Routing + Downstream Readback Pack

### 目的
避免 dispatch 類欄位改動後，只在上游頁成功，family pages 沒承接。

### Mutation
- dispatch to design
- dispatch to procurement
- dispatch to vendor

### Assertions
1. family task 真正建立
2. family list 顯示
3. family detail 顯示
4. project detail downstream summary 同步
5. refresh 後仍存在

### 優先級
- P1

---

## Pack G — Collections Downstream Summary Pack

### 目的
鎖住收款 mutation 後，quote-cost / home / accounting 的讀值一致。

### Mutation
- add collection record

### Assertions
1. quote-cost detail collected / outstanding 正確
2. home summary（若有）同步
3. accounting revenue / active projects summary 同步
4. closeout side 若依賴 collection，也要正確

### 優先級
- P1

---

## Pack H — Closeout Active/Archive Consistency Pack

### 目的
鎖住 closeout / retained snapshot / reopen 前後，active 與 archived source 不互相污染。

### Mutation
- closeout
- reopen
- second closeout

### Assertions
1. active financial state closeout 前正確
2. closeout detail retained snapshot 正確
3. reopen 後 active side 回復合法
4. second closeout overwrite / freeze rules 正確

### 優先級
- P1

---

## 3. 每次改動時，應跑哪些 Pack

### 改 Project Core / Edit Form / Adapter
- Pack A
- 若影響首頁，補 home relevant spot check

### 改 Dispatch / Execution Tree / Family Routing
- Pack F
- 若新增 family 欄位，外加對應 B 或 procurement/vendor field-specific pack

### 改 Design Task / Procurement / Vendor Confirm
- Pack C
- Pack D
- Pack E
- 視情況加 Pack F

### 改 Quote Cost / Reconciliation / Vendor Financial
- Pack C
- Pack D
- Pack E
- 若碰收款再加 Pack G
- 若碰結案再加 Pack H

### 改 Closeout / Reopen / Retained Snapshot
- Pack H
- 並至少補 mainline / full acceptance 中 closeout relevant suites

---

## 4. 實作順序建議

### 第一輪（最急）
1. Pack A
2. Pack B
3. Pack C
4. Pack D
5. Pack E

### 第二輪
6. Pack F
7. Pack G
8. Pack H

---

## 5. 一句話總結

> 之後 `projectflow` 的回歸測試，不應只是再跑一次主線 clickpath，而應以這些 regression packs 為核心，專門鎖 mutation 後的 source-of-truth、cross-page consistency 與 downstream lifecycle。
