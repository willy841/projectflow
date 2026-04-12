# MD89 — projectflow repo-level DB coverage audit report (2026-04-12)

> Status: ACTIVE
> Basis: `MD87`, `MD88`
> Scope: repo-level static audit only; this round does **not** perform broad cleanup / refactor.

---

## 1. Audit method

本輪依 `MD88` 要求，對以下四層做靜態盤點：
1. route / page layer
2. adapter / selector / data-mapping layer
3. summary / archive / overview layer
4. legacy / compat / transition layer

重點檢查：
- 是否以 DB 為唯一正式資料來源
- 是否仍保留 seed / mock / local-only / transition fallback
- summary / detail / archive / overview 是否同源
- 是否仍被 legacy / compat 路徑或舊資料模型牽制

---

## 2. Per-module audit

## A. quote-costs list

### 1. 模組 / 路由
- `/quote-costs`
- 主要檔案：
  - `src/app/quote-costs/page.tsx`
  - `src/lib/db/financial-flow-adapter.ts`
  - `src/components/quote-cost-list-client.tsx`

### 2. 目前主資料來源
- route server 端主入口已走 `getQuoteCostProjectsWithDbFinancials()`
- DB project identity 來自 `projects` + confirmation / plan / manual cost tables
- 但 financial payload 仍會 merge `quoteCostProjects` seed fields

### 3. 是否仍有 fallback / seed / local-only state
- **有**
- seed 依賴：
  - `financial-flow-adapter.ts` 以 `quoteCostProjects` 作 `seedById / seedByName`
  - quotation / note / reconciliationStatus 等欄位仍可從 seed 帶入
  - DB items 只覆蓋已接手的 sourceType，未接手 sourceType 仍保留 seed cost items
- transition fallback：
  - `getQuoteCostProjectsWithDbFinancials()` 若無 DB connection / DB query fail / dbProjects empty，直接整包退回 `quoteCostProjects`
- local-only state：
  - `QuoteCostListClient` 雖吃 `initialProjects` 時以 server props 為主，但若沒 props 會退回 `getQuoteCostProjectsWithWorkflow()`

### 4. summary / detail / archive 是否同源
- **不同源**
- list 主入口偏 DB-first
- 但 quotation / note / 部分 status 語意仍來自 seed
- 與 detail 共享同一 financial adapter 主鏈，但不是純 DB 單源

### 5. 目前分類
- **PARTIAL DB-FIRST**

### 6. 主要風險
- financial list 看似 DB-first，但仍把 seed quotation / note / statuses 當有效顯示資料
- 若 DB 異常會整頁回退 seed，正式主線仍受 transition fallback 影響

### 7. 建議下一步
- 把 quote-cost project schema 補齊到 DB 可完整提供 quotation / note / status truth
- 將 `financial-flow-adapter` 的 seed merge 改為明確 audit-only fallback，而非正式顯示來源
- 定義「no DB truth」時的正式 empty/error state，避免直接回 seed

---

## B. quote-cost detail

### 1. 模組 / 路由
- `/quote-costs/[id]`
- 主要檔案：
  - `src/app/quote-costs/[id]/page.tsx`
  - `src/lib/db/financial-flow-adapter.ts`
  - `src/components/quote-cost-detail-client.tsx`

### 2. 目前主資料來源
- project detail 主資料：`getQuoteCostProjectByIdWithDbFinancials(id)`
- collection records：直接查 `project_collection_records`
- vendor payment summary：直接查 `project_vendor_payment_records`
- reconciliation groups：`financial_reconciliation_groups`

### 3. 是否仍有 fallback / seed / local-only state
- **有，且種類較多**
- seed 依賴：
  - page.tsx 一開始仍讀 `getQuoteCostProjectById(id)` 作 `seedProject`
  - adapter 仍會以 seed 補 quotationItems / quotationImport / note / 部分 cost items / statuses
  - client 內 `sampleQuoteImports` / `sampleQuoteLineItemsByProject` 仍是 detail 畫面正式顯示與匯入切換來源
- local-only state：
  - `QuoteCostDetailClient` 內大量編輯 state 仍在 client local state
  - quotation import 切換、close project、部分 summary 切換未全數寫回 DB
- transition fallback：
  - 若 `initialProject` 缺失，client 會回退 `getQuoteCostProjectsWithWorkflow()`
- summary / archive 不同源：
  - 上方 summary 與 reconciliation / collections 吃 DB readback
  - quotation import / archive source 切換仍倚賴 seed sample arrays

### 4. summary / detail / archive 是否同源
- **不同源，未完全同源**
- cost / reconciliation / collection 偏 DB
- quotation / archive options / import history 偏 seed
- detail shell 本身是混合源

### 5. 目前分類
- **PARTIAL DB-FIRST**

### 6. 主要風險
- 使用者在 detail 頁看到的是「DB financial + seed quotation/archive」混合結果
- summary 與 deeper archive panel 不是單一正式資料鏈
- formal audit 若只看 collections / reconciliation API 會高估完成度

### 7. 建議下一步
- 第一批 formalization 應優先處理本模組
- 把 quotation / import history / archive options 正式 DB 化
- 將 `sampleQuoteImports` / `sampleQuoteLineItemsByProject` 從正式主畫面移除
- 明確拆出 archive panel 的正式資料契約，避免 UI 直接吃 seed arrays

---

## C. Accounting Center

### 1. 模組 / 路由
- `/accounting-center`
- 主要檔案：
  - `src/app/accounting-center/page.tsx`
  - `src/lib/db/accounting-center-adapter.ts`
  - `src/components/accounting-center-page-db.tsx`
  - `src/components/accounting-center-page.tsx`

### 2. 目前主資料來源
- route 已用 DB adapter server-side preload：
  - active projects
  - office categories
  - office expenses
  - other expenses
  - revenue summary
  - personnel summary / employee / records

### 3. 是否仍有 fallback / seed / local-only state
- **有，但集中在 page shell / non-DB mode 結構殘留**
- seed / mock 依賴：
  - `accounting-center-page.tsx` 仍內建大段 `accountingDataByMonth` mock month dataset
  - 仍保留 `initialDbMode = false` 的非 DB 路徑心智
- local-only state：
  - page client 仍持有大量本地 state / UI drafts
  - DB preload 是初始值，但不是所有互動都已 formalized 成 server truth
- summary 不同源：
  - route 現在餵 DB summary
  - 但頁面元件本身仍同時具備 mock month summary path，代表 transition code 尚未退場

### 4. summary / detail / archive 是否同源
- **部分同源**
- 目前 active route `/accounting-center` 已由 DB preload 驅動
- 但 underlying page component 仍保有 mock month dataset 與 non-DB branch，尚未完全 retirement

### 5. 目前分類
- **PARTIAL DB-FIRST**

### 6. 主要風險
- 主 route 已 DB-first，容易讓人誤判整模組 fully formalized
- 實際上 UI shell 還保留完整 mock month closure path，之後維護時很容易回滲
- revenue summary 亦依賴 `getQuoteCostProjectsWithDbFinancials()`，而該 adapter 本身仍混 seed

### 7. 建議下一步
- 將 `AccountingCenterPage` 拆成 pure DB mode 主元件與 historical mock sandbox，避免同檔雙責任
- 清掉 `accountingDataByMonth` 在正式 route 的可達性
- 標記 revenue summary 對 quote-cost formalization 的上游依賴

---

## D. Vendor Data

### 1. 模組 / 路由
- `/vendors`
- `/vendors/[id]`
- 主要檔案：
  - `src/app/vendors/page.tsx`
  - `src/app/vendors/[id]/page.tsx`
  - `src/lib/db/vendor-directory-adapter.ts`
  - `src/components/vendor-list-page-db.tsx`
  - `src/components/vendor-detail-shell-db.tsx`

### 2. 目前主資料來源
- vendor list / detail route 已由 DB adapter 載入 vendor / records / payment records
- financial records 來自 `getVendorFinancialSummary()`，而它又承接 `getQuoteCostProjectsWithDbFinancialsAndGroups()`

### 3. 是否仍有 fallback / seed / local-only state
- **有，而且 list/detail 不一致**
- seed 依賴：
  - `vendor-directory-adapter.ts` 仍使用 `VendorBasicProfile` 型別並回傳大量 placeholder fields（`待補充`、空字串），代表 vendor master 還未 fully formalized
  - `VendorListPageDb` 的 outstandingTotal 不是吃 DB summary，而是直接呼叫 `vendor-data.ts` 的 `getVendorOutstandingTotal()` —— 這是舊 seed/local financial helper
- mock 依賴：
  - `vendor-data.ts` 仍存在完整 `vendorProfiles / vendorAssignments / vendorPackages` 歷史 seed 集
- local-only state：
  - `VendorDetailShellDb` 建付款後先更新 local state 再 `window.location.reload()`，互動層仍偏 transition
- transition fallback：
  - DB detail 雖讀 DB records，但 vendor master profile 其實仍是半 placeholder mapping，不是完整 DB canonical profile
- summary / archive 不同源：
  - list 的 outstandingTotal 與 detail 的 payment records / project records 不是同一來源

### 4. summary / detail / archive 是否同源
- **不同源，這是 Vendor Data 目前最大問題**
- list card 未付款總額：舊 `vendor-data.ts` helper
- detail records / payment truth：DB adapter
- vendor profile fields：placeholder / transition mapping

### 5. 目前分類
- **PARTIAL DB-FIRST**

### 6. 主要風險
- 表面路由已 DB 化，但 list summary 仍可能顯示假資料或 local summary
- detail 與 list 不同源，會導致同一 vendor 未付款總額不一致
- vendor 主檔欄位仍大量空白 placeholder，還不能算 fully formal master data

### 7. 建議下一步
- 先把 vendor list outstanding total 改接 DB summary
- 定義 vendor master 正式 DB 欄位與 mapping，移除 `待補充` placeholder 依賴
- 把 `vendor-data.ts` 降級到 historical / compat，不再被 DB pages 引用

---

## E. Closeout

### 1. 模組 / 路由
- `/closeout`
- `/closeout/[id]`
- `/closeouts`
- `/closeouts/[id]`

### 2. 目前主資料來源
- 真正有內容的 page 是：
  - `src/app/closeout/page.tsx`
  - `src/app/closeout/[id]/page.tsx`
- 它們使用：
  - `getQuoteCostProjectsWithDbFinancials()`
  - `getQuoteCostProjectByIdWithDbFinancials()`
  - `QuoteCostDetailClient mode="closed"`
- `/closeouts*` 反而是 redirect alias 到 `/closeout*`

### 3. 是否仍有 fallback / seed / local-only state
- **有**
- seed 依賴：
  - list：若 DB projects 中沒有 closed project，fallback 到 `quoteCostProjects`
  - detail：讀 `seedProject`，若 DB project 不是已結案則退回 seedProject
  - `QuoteCostDetailClient` closed view 本身仍吃 quote-cost detail 裡那些 seed quotation / sample archive 邏輯
- transition fallback：
  - route 命名存在雙軌：`closeout` vs `closeouts`
  - master / earlier MD 把 `/closeouts` 當主心智，但目前 repo 真正內容 route 是單數 `/closeout`
- local-only state：
  - closeout detail 共用 client state-heavy quote-cost detail shell

### 4. summary / detail / archive 是否同源
- **不同源**
- closeout 本質上是 quote-cost detail closed view 包裝層
- 其 archive 語氣雖成立，但資料層仍承接 quote-cost 混合源
- route alias 也未收斂

### 5. 目前分類
- **PARTIAL DB-FIRST**（active archive layer）
- 另：`/closeouts*` 這組 route 以實作來看屬 **HISTORICAL / COMPAT** alias

### 6. 主要風險
- closeout 看似 archive 正式頁，但實際仍大量吃 quote-cost 的 partial DB source
- singular / plural 路由主次顛倒，容易造成 compat 殘留長期存在
- closed list / detail 仍保留 seed fallback，不能算正式 archive truth

### 7. 建議下一步
- 先決定 canonical route：`/closeout` 或 `/closeouts` 只能留一組為主
- closeout 在 quote-cost formalization 完成前，不應宣告 fully DB-first
- 後續應把 closed archive read model 獨立 formalize，避免永遠只是 mode switch

---

## F. summary / archive / overview / downstream panels

### 1. 模組 / 路由
- `quote-cost-detail-client.tsx` 內 overview / quick panels / archive source switching
- `closeout-list-client.tsx` archive cards
- `accounting-center-adapter.ts` revenue summary / active-project summary
- `vendor-financial-adapter.ts` vendor payable summary
- `vendor-list-page-db.tsx` list summary card

### 2. 目前主資料來源
- mixed:
  - quote-cost financial summary：DB + seed merge
  - accounting revenue：吃 `getQuoteCostProjectsWithDbFinancials()` 的結果再聚合
  - vendor financial detail：吃 DB financial groups
  - vendor list summary：舊 vendor-data helper

### 3. 是否仍有 fallback / seed / local-only state
- **有，且跨模組傳染**
- seed 依賴：
  - quote-cost quotation / archive seed arrays
  - vendor list summary helper
  - closeout fallback projects
- transition fallback：
  - accounting revenue summary 依賴 partial DB quote-cost adapter
- summary / archive 不同源：
  - 這一層是目前最明顯未 formalized 的地方

### 4. summary / detail / archive 是否同源
- **多數不同源**

### 5. 目前分類
- **PARTIAL DB-FIRST**（整層）

### 6. 主要風險
- 這層最容易造成「頁面看起來正式，但 summary 其實不是真值」
- 若不先補 summary formalization，後續各頁 detail 再怎麼 DB 化都仍會有假正式感

### 7. 建議下一步
- 先做 summary/read-model formalization 專項，不要只盯 route page
- 針對 quote-cost / vendor / accounting 三者定義 shared financial read model

---

## G. compat / legacy / transition routes and modules

### 1. 模組 / 路由
- `/quote-cost`、`/quote-cost/[id]`
- `/closeouts`、`/closeouts/[id]`
- `src/components/vendor-list-page.tsx`
- `src/components/vendor-detail-shell.tsx`
- `src/components/vendor-store.tsx`
- `src/components/project-workflow-store.ts`
- `src/components/mock-*`
- `src/components/vendor-data.ts`
- `src/components/quote-cost-data.ts`
- `src/components/design-task-board-data.ts`
- `src/components/procurement-task-board-data.ts`

### 2. 目前主資料來源
- 舊 seed / localStorage / mock-driven paths

### 3. 是否仍有 fallback / seed / local-only state
- **是，明確存在**
- `project-workflow-store.ts`：localStorage + seed merge + workflow local cost construction
- `vendor-store.tsx` / `vendor-list-page.tsx` / `vendor-detail-shell.tsx`：front-end local vendor master path
- `mock-design-document-view.tsx` / `mock-procurement-document-view.tsx` / `mock-workflow-document-store.ts`：完整 mock document 路徑
- design / procurement / vendor plan editor client 裡仍有「舊 mock 路由資料」提示
- `/quote-cost`：compat redirect
- `/closeouts`：目前實作上更像 compat redirect

### 4. summary / detail / archive 是否同源
- 不適用；本質上就是 legacy / compat / transition sources

### 5. 目前分類
- `/quote-cost*`：**HISTORICAL / COMPAT**
- `/closeouts*`：**HISTORICAL / COMPAT**（但命名與文件心智仍衝突，需特別標記）
- `project-workflow-store.ts`：**LEGACY / TRANSITION**
- `vendor-store.tsx` + `vendor-list-page.tsx` + `vendor-detail-shell.tsx`：**LEGACY / TRANSITION**
- `vendor-data.ts` / `quote-cost-data.ts` / board seed files：**LEGACY / TRANSITION**
- `mock-*` document / store files：**HISTORICAL / COMPAT** for old mock flows

### 6. 主要風險
- 這些 code path 仍與 active DB pages 交錯引用
- 尤其 `vendor-data.ts`、`quote-cost-data.ts`、`project-workflow-store.ts` 不是純歷史檔，仍被 active page 間接使用

### 7. 建議下一步
- 先標記「仍被 active route 引用」與「已可獨立退場」兩群
- 不要直接刪；先把 active pages 對這些 transition helpers 的引用清乾淨

---

## 3. Overall classification summary

### FULL DB-FIRST
- 本輪 priority 範圍內：**無法保守判定有任何主要 financial / accounting / vendor / closeout 模組已 fully DB-first**

### PARTIAL DB-FIRST
- `/quote-costs`
- `/quote-costs/[id]`
- `/accounting-center`
- `/vendors`
- `/vendors/[id]`
- `/closeout`
- `/closeout/[id]`
- summary / archive / overview / downstream panel layer（整體）
- `/vendor-assignments`
- `/vendor-assignments/[id]`
- `/vendor-packages`
- `/vendor-packages/[id]`

### LEGACY / TRANSITION
- `project-workflow-store.ts`
- `vendor-store.tsx`
- `vendor-list-page.tsx`
- `vendor-detail-shell.tsx`
- `quote-cost-data.ts`
- `vendor-data.ts`
- `design-task-board-data.ts`
- `procurement-task-board-data.ts`
- `accounting-center-page.tsx` 內的 mock month dataset / non-DB path

### HISTORICAL / COMPAT
- `/quote-cost`
- `/quote-cost/[id]`
- `/closeouts`
- `/closeouts/[id]`（依 repo 現況更像 compat alias）
- `mock-design-document-view.tsx`
- `mock-procurement-document-view.tsx`
- `mock-workflow-document-store.ts`
- `mock-editable-plan-list.tsx`

---

## 4. Fake-data dependency list

### seed 依賴
- `financial-flow-adapter.ts` merge `quoteCostProjects`
- `quote-cost-detail-client.tsx` 使用 `sampleQuoteImports` / `sampleQuoteLineItemsByProject`
- `closeout/page.tsx` fallback `quoteCostProjects`
- `closeout/[id]/page.tsx` fallback `seedProject`
- `vendor-list-page-db.tsx` 用 `vendor-data.ts` summary helper
- `vendor-directory-adapter.ts` 將 DB vendor 映射到 placeholder `VendorBasicProfile`

### mock 依賴
- `accounting-center-page.tsx` 內建 `accountingDataByMonth`
- `vendor-data.ts` 完整 vendorAssignments / vendorPackages / vendorProfiles seed universe
- `mock-*` document views / stores
- design / procurement board seed files

### local-only state
- `project-workflow-store.ts`
- `vendor-store.tsx`
- `vendor-package-store.ts`
- `project-vendor-financial-store.ts`
- `QuoteCostDetailClient` 大量 client local editing state
- `VendorDetailShellDb` 付款後 local setState + reload

### transition fallback
- `getQuoteCostProjectsWithDbFinancials()` on no DB / error / empty DB -> seed fallback
- `QuoteCostListClient` / `QuoteCostDetailClient` 還保留 workflow/local fallback path
- `AccountingCenterPage` 同時保留 DB mode 與 non-DB mode
- vendor route 仍有 DB pages 與 local store pages 並存
- closeout singular/plural dual route structure

### summary / archive 不同源
- quote-cost detail：financial groups / collections 走 DB，但 quotation/archive options 仍 seed
- vendor list vs vendor detail：summary 與 detail 不同源
- accounting revenue summary：吃 partial DB quote-cost aggregation
- closeout archive：承接 partial DB quote-cost closed view

---

## 5. First-batch formalization priority recommendation

### Priority 1 — quote-cost detail formalization
原因：
- financial mainline 中樞
- 同時影響 Accounting Center revenue summary、Vendor Data payable summary、Closeout archive
- 目前混 source 最明顯：DB financial + seed quotation/archive

### Priority 2 — Vendor Data summary/detail same-source closure
原因：
- list 與 detail 已明確不同源
- vendor list outstanding total 仍走舊 helper，是很典型的假正式風險

### Priority 3 — Accounting Center shell retirement of mock month path
原因：
- route 已 DB-first，但底層元件仍保留整套 mock 月資料
- 容易造成回滲與後續誤判

### Priority 4 — Closeout canonical route + archive read-model cleanup
原因：
- 現在 closeout / closeouts 主從關係混亂
- archive 仍只是 quote-cost partial DB closed mode 包裝層

### Priority 5 — transition helper isolation
範圍：
- `project-workflow-store.ts`
- `vendor-data.ts`
- `quote-cost-data.ts`
- `vendor-store.tsx`

原因：
- 這些仍被 active pages 間接引用
- 若不先隔離，永遠無法準確判定 FULL DB-FIRST

---

## 6. Recommendation: cleanup/formalization now, or more audit first?

### 建議結論
- **可以直接進入第一批 cleanup / formalization 派工**
- **不需要再先補更多 audit 文件才開始動手**

### 但需加一條限制
- 下一輪派工應採「以 read-model / source unification 為主」的小批 formalization
- **不要** 一次大砍所有 legacy code
- 正確順序：
  1. quote-cost detail source unification
  2. vendor list/detail same-source unification
  3. accounting center mock shell retirement
  4. closeout canonical route cleanup
  5. 最後才退場 transition / compat helpers

---

## 7. One-line conclusion

> 目前 `projectflow` 在 priority financial / accounting / vendor / closeout 主線上，尚無主要模組可保守判定為 fully DB-first；現況較準確的描述是：**active routes 多已進入 partial DB-first，但仍廣泛殘留 seed merge、mock shell、local-only state、transition fallback，以及 summary/detail/archive 不同源**。下一步不該再停留在抽象 audit，而應直接派出第一批 formalization work packages，優先清 `quote-cost detail -> Vendor Data -> Accounting Center -> Closeout` 這條讀模型同源化主線。
