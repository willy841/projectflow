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
| Project Core | project owner | `projects.owner` | **Pack A / `25` 已覆蓋** | field-level expansion still needed for non-owner core fields | P1 | extend from owner to client/date/contact families |
| Project Core | client / event date / contact fields | `projects.*` | lifecycle / project detail 有覆蓋，但欄位級跨頁一致性未系統化 | field-level readback | P1 | edit/readback/list/home/financial identity sync |
| Project List Financial | project list budget | quotation read model | **Pack C / `27` 已覆蓋** | home/accounting downstream still not fully explicit | P1 | extend from project list to home/accounting rollups |
| Project List Financial | project list cost | financial-flow aggregate | **Pack C / `27` 已覆蓋** | home/accounting downstream still not fully explicit | P1 | extend from project list to home/accounting rollups |
| Dispatch | dispatch → design/procurement/vendor family routing | dispatch + family task tables | `01`, `22`, `23`, `24` + **Pack F / `30` 已覆蓋** | field-specific additions still need follow-up when new downstream fields appear | P1 | use Pack F baseline for future field additions |
| Design | design assignee | `design_tasks.assignee` | **Pack B / `26` 已覆蓋** | edit/reopen mutation path still可再補 | P1 | add reopen-edit mutation coverage |
| Design | design confirm → financial cost | latest confirmations + snapshots | `02`, `05`, `09` 有主線 | vendor-binding / downstream grouping consistency 不夠顯式 | P1 | design confirm → quote-cost group/vendor unpaid downstream |
| Procurement | procurement confirm → financial cost | latest confirmations + snapshots | `03`, `05`, `09` 有主線 | procurement-specific group integrity still not isolated | P1 | procurement confirm → reconciliation group amount/itemCount |
| Vendor | vendor confirm → package / payable source | latest confirmations + snapshots | `04`, `07`, `09` 有主線 | detail/list/history deeper consistency仍可加強 | P1 | confirm → vendor detail unpaid → vendor list unpaid |
| Reconciliation | confirm group writes status + amount + itemCount | `financial_reconciliation_groups` | **Pack D / `28` 已覆蓋** | source-type variants（procurement/vendor） still可再補 | P1 | add procurement/vendor reconciliation variants |
| Reconciliation | already reconciled → vendor unpaid increases | groups + no payment records | **Pack E / `29` 已覆蓋** | aggregate total delta on vendor list card 可再更精細 | P1 | explicit vendor list total delta assertions |
| Vendor Payments | payment record creation | `project_vendor_payment_records` | `07` + **Pack E / `29` 已覆蓋** | history / partial payment / multi-payment branches 可再擴充 | P1 | payment create → history / partial / multi-payment variants |
| Vendor Directory | vendor outstandingTotal | groups - payments | vendor list 有使用，`07` / `29` 已觸達 | detail/list aggregation audit仍值得獨立化 | P1 | vendor list card total = detail unpaid sum |
| Collections | collection records | `project_collection_records` | **Pack G / `31` 已覆蓋 quote-cost + accounting read-model baseline** | home summary / full UI accounting layer still不足 | P1 | add home + accounting UI-level sync pack |
| Closeout | retained snapshot readback | retained snapshot tables | `06`, `08`, `13~18` + **Pack H / `32` 已覆蓋** | second-closeout / archive variants已有強覆蓋，但可再整理套件層級說明 | P1 | maintain existing coverage map |
| Home / Dashboard | recent projects / financial summary cards | project + financial read models | owner 由 `25` 已觸達部分，financial summary仍不足 | source divergence risk high | P1 | quotation / collection / cost mutations reflected on home |
| Accounting | revenue / active projects rollups | accounting adapters | accounting tests exist，Pack G 僅補 active-project read-model baseline | deeper UI linkage still不足 | P2 | collection / closeout / quotation changes reflected in accounting UI |
| Visual / UX | page-level readability / hierarchy | N/A | mostly manual | no formal manual checklist | P2 | create manual spot-check standard |

---

## 3. 當前最危險缺口（P0）

### 已落地的原 P0 缺口（2026-05-05）
以下原 P0 缺口已完成第一輪落地：
- Project core owner consistency → Pack A / `25`
- design assignee consistency → Pack B / `26`
- `/projects` budget/cost source-of-truth consistency → Pack C / `27`
- reconciliation group completeness → Pack D / `28`
- vendor unpaid lifecycle → Pack E / `29`

### 目前剩餘高優先缺口（更新後）
1. 把 Project Core 一致性從 owner 擴到 client / date / contact 全欄位
2. 把 `/projects` financial source consistency 從 list 擴到 home / accounting summary
3. 補 procurement / vendor-specific reconciliation variants
4. 把 vendor list total delta / history / partial payment variants 做得更精細
5. 補 home dashboard / accounting UI 層的正式同步驗證

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

### Wave 1（已完成）
1. project owner cross-page consistency → `25`
2. design assignee cross-page consistency → `26`
3. project list budget/cost source-of-truth consistency → `27`
4. reconciliation group status+amount+itemCount invariant → `28`
5. vendor unpaid increase/decrease lifecycle → `29`

### Wave 2（已完成第一輪）
6. dispatch family routing downstream readback → `30`
7. collections downstream summary baseline → `31`
8. closeout active/archive cross-readback compare → `32`

### Wave 3（下一輪建議）
9. home financial summary packs
10. accounting deeper UI packs
11. adapter drift audit automation hints
12. manual spot-check checklist

---

## 6. 一句話總結

> `projectflow` 最危險的缺口原本是 mutation 後的 source-of-truth 與 cross-page consistency 沒有被系統化鎖住；截至 2026-05-05，第一輪 A~H packs 已正式落地並進入口，後續主線應從「補第一輪 P0」切換成「擴第二輪 deeper coverage 與維護 gap matrix 同步」。
