# MD172 — projectflow source-of-truth test gap matrix — 2026-05-05

Status: ACTIVE / EXECUTION GAP MATRIX  
Role: `MD171` 的執行層文件之一。  
Goal: 把 `projectflow` 全站的重要資料流，對照現有測試覆蓋、source of truth、cross-page consistency 驗證需求與缺口優先級，變成可執行補強清單。

---

## 1. 使用方式

這份文件不負責講理念，負責講：

1. 這條資料 / 狀態 / 聚合值是什麼
2. source of truth 是哪裡
3. 現有測試有沒有碰到
4. 缺的是哪種驗證
5. 優先級是什麼
6. 下一步應補什麼測試

優先級定義：
- **P0** = 已多次出現實際 bug / 會誤導營運 / 會造成跨頁數字錯
- **P1** = 高風險主線，雖未必已爆，但結構上容易壞
- **P2** = 中風險，建議補，但不是當前第一優先

---

## 2. 缺口矩陣

| Domain | Data / Transition | Source of Truth | Current Coverage | Gap Type | Priority | Next Test Need |
|---|---|---|---|---|---|---|
| Project Core | project owner | `projects.owner` | formal 主線未明確斷言 list/home/reopen edit 一致 | cross-page consistency | P0 | edit → refresh → list → home → reopen edit |
| Project Core | client / event date / contact fields | `projects.*` | lifecycle / project detail 有覆蓋，但欄位級跨頁一致性未系統化 | field-level readback | P1 | edit/readback/list/home/financial identity sync |
| Project List Financial | project list budget | quotation read model | quote-cost mainline 有，但 `/projects` 欄位級來源一致性未明確 assert | source-of-truth regression | P0 | quotation import → `/quote-costs/[id]` → `/projects` 一致 |
| Project List Financial | project list cost | financial-flow aggregate | quote-cost mainline 有，但 `/projects` 同步未明確 assert | cross-page aggregate consistency | P0 | confirmations → `/quote-costs/[id]` → `/projects` 一致 |
| Dispatch | dispatch → design/procurement/vendor family routing | dispatch + family task tables | `01`, `22`, `23`, `24` 有主線，但新欄位承接未制度化 | mutation readback | P1 | dispatch field addition regression pack |
| Design | design assignee | `design_tasks.assignee` | 本輪新修，formal suite 尚無明確斷言 | new field consistency | P0 | dispatch design assignee → design list/detail/project detail readback |
| Design | design confirm → financial cost | latest confirmations + snapshots | `02`, `05`, `09` 有主線 | vendor-binding / downstream grouping consistency 不夠顯式 | P1 | design confirm → quote-cost group/vendor unpaid downstream |
| Procurement | procurement confirm → financial cost | latest confirmations + snapshots | `03`, `05`, `09` 有主線 | itemCount / amountTotal group writeback 未獨立驗 | transition invariant | P1 | procurement confirm → reconciliation group amount/itemCount |
| Vendor | vendor confirm → package / payable source | latest confirmations + snapshots | `04`, `07`, `09` 有主線 | detail/list/history 三點一致性不夠顯式 | cross-page payable consistency | P1 | confirm → vendor detail unpaid → vendor list unpaid |
| Reconciliation | confirm group writes status + amount + itemCount | `financial_reconciliation_groups` | 有 quote-cost clickpath，但未驗 DB semantic completeness | status + amount invariant | P0 | click 已對帳 → DB row status/amount/itemCount assert |
| Reconciliation | already reconciled → vendor unpaid increases | groups + no payment records | `07` 接近，但未明確鎖 list increase semantic | downstream aggregate sync | P0 | quote-cost reconcile → `/vendors` total increase |
| Vendor Payments | payment record creation | `project_vendor_payment_records` | `07` 有部分覆蓋 | list + detail + history + remaining unpaid not explicit enough | payable lifecycle consistency | P0 | payment create → vendor detail decrease → vendor list decrease |
| Vendor Directory | vendor outstandingTotal | groups - payments | vendor list 有使用，formal explicit assertion 不足 | list aggregate source validation | P0 | vendor list card total = detail unpaid sum |
| Collections | collection records | `project_collection_records` | accounting + quote-cost 相關已有部分覆蓋 | homepage / downstream rollup not explicit enough | cross-page receivable consistency | P1 | add collection → quote-cost → home/accounting sync |
| Closeout | retained snapshot readback | retained snapshot tables | `06`, `08`, `13~18` 覆蓋強 | active/archive side consistency still fragile | archive readback invariant | P1 | closeout → closeout detail → reopen → second closeout compare |
| Home / Dashboard | recent projects / financial summary cards | project + financial read models | smoke / legacy scattered | source divergence risk high | P1 | project edit / quotation / collection mutations reflected on home |
| Accounting | revenue / active projects rollups | accounting adapters | accounting tests exist | explicit linkage with projectflow mutation packs不夠系統化 | downstream sync | P2 | collection / closeout / quotation changes reflected in accounting |
| Visual / UX | page-level readability / hierarchy | N/A | mostly manual | no formal manual checklist | manual spot-check standard missing | P2 | create manual acceptance checklist |

---

## 3. 當前最危險缺口（P0）

### P0-1 Project core readback consistency
- project owner / 基本欄位寫入後
- detail、reopen edit、list、home 未被一組明確測試一起鎖住

### P0-2 `/projects` financial source consistency
- 預算 / 成本非常容易回到錯的 adapter / local store
- 必須有明確 regression test 鎖：`quotation import / confirmations -> project list`

### P0-3 design assignee consistency
- 剛新增欄位
- 沒有正式 regression test
- 很容易再出現「當頁有 / list 沒有 / reopen 沒有」

### P0-4 reconciliation group completeness
- 不能只驗 status
- 必須鎖 `amountTotal / itemCount`
- 否則會再出現 vendor unpaid 不變的假成功

### P0-5 vendor unpaid lifecycle
- reconcile 後應增加
- payment 後應下降
- list / detail / history 必須一起驗

---

## 4. 現有 suite 能覆蓋什麼、不能覆蓋什麼

### 現有 suite 已較強覆蓋
- 主流程是否打通
- quote-cost / closeout / vendor financial 主線行為
- fresh project lifecycle
- reopen / closeout boundaries

### 現有 suite 明顯不足
- 欄位級 source-of-truth assertions
- list/detail/home/accounting 之間的跨頁同步
- mutation 後 reopen edit readback
- group status 與 group amount 完整性
- vendor list card totals 是否跟 detail 來源一致

---

## 5. 補測試順序建議

### Wave 1（立即補）
1. project owner cross-page consistency
2. design assignee cross-page consistency
3. project list budget/cost source-of-truth consistency
4. reconciliation group status+amount+itemCount invariant
5. vendor unpaid increase/decrease lifecycle

### Wave 2（接續補）
6. collections → home/accounting sync
7. procurement/vendor confirm → reconciliation group integrity
8. closeout active/archive cross-readback compare

### Wave 3（制度完善）
9. manual spot-check checklist
10. adapter drift audit automation hints
11. accounting downstream consistency packs

---

## 6. 一句話總結

> `projectflow` 當前最大的缺口，不是主線 clickpath 不通，而是 mutation 後的 source-of-truth 與 cross-page consistency 沒有被系統化鎖住；補強順序應先打 P0 的欄位同步、financial list sync、reconciliation 完整性與 vendor unpaid lifecycle。
