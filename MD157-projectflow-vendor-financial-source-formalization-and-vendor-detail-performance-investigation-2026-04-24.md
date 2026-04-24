# MD157 — projectflow vendor financial source formalization 與 vendor detail 性能調查紀錄 — 2026-04-24

> Status: ACTIVE / INVESTIGATION + FORMALIZATION IN PROGRESS
> Role: 記錄 2026-04-24 晚間針對 `Vendor Data` / vendor detail 頁面所做的正式來源校正、UI 結構調整、性能排查、失敗路徑與尚未解決問題。
> Scope:
> 1. vendor 對帳後金額主線正式化
> 2. vendor list / vendor detail 與 reconciliation 主線對齊
> 3. vendor detail 性能排查與目前仍未解決的慢問題

---

## 1. 本輪正式規則校正

### 1.1 Vendor 對帳後金額不可再靠臨時計算拼接

本輪查證後已確認：

- `financial_reconciliation_groups` 原始 schema 只有：
  - `project_id`
  - `source_type`
  - `vendor_id`
  - `vendor_name`
  - `reconciliation_status`
  - `reconciled_at`
- 舊 schema **沒有**：
  - `amount_total`
  - `item_count`
- `financial_cost_items` 在目前正式 DB 中 **不存在**，不可當既定正式來源使用

因此先前企圖用：
- `financial_reconciliation_groups` 承接 status
- `financial_cost_items` 承接 amount

的做法，不是穩定正式主線。

正式校正如下：

> **vendor 對帳後金額的正式來源，必須直接 formalize 到 `financial_reconciliation_groups`。**

也就是說，之後這張表不只記錄：
- 對帳狀態
- vendor / project / source_type

還必須正式記錄：
- `amount_total`
- `item_count`

---

### 1.2 對帳同步時，正式寫入 `amount_total / item_count`

已在：
- `src/app/api/financial-projects/[id]/reconciliation-groups/sync/route.ts`

補上：
- `alter table ... add column if not exists amount_total`
- `alter table ... add column if not exists item_count`

並在 sync reconciliation groups 時，正式寫入：
- `amount_total`
- `item_count`

也就是：

> **對帳確認後，`financial_reconciliation_groups` 已成為 vendor reconciliation status + amount 的正式 source of truth。**

---

## 2. 已完成的資料主線對齊

### 2.1 Vendor Detail 金額承接已改回正式 source

已完成：
- vendor detail 的 financial summary 已改為直接讀：
  - `financial_reconciliation_groups.reconciliation_status`
  - `financial_reconciliation_groups.amount_total`
  - `financial_reconciliation_groups.item_count`
- 不再依賴不存在的 `financial_cost_items`

### 2.2 Vendor List 金額承接已與 detail 對齊

已完成：
- `listDbVendors()` 已改成直接讀：
  - `financial_reconciliation_groups.amount_total`
- 並且只累加：
  - `reconciliation_status = '已對帳'`

正式規則：

> **Vendor list 與 vendor detail 必須承接同一套 reconciliation amount source。**

不可接受：
- detail 一條來源
- list 另一條來源

---

### 2.3 舊資料已做 backfill

已完成：
- 既有 `financial_reconciliation_groups` rows 已補寫：
  - `amount_total`
  - `item_count`
- 本輪 backfill 實際補入：**15 筆 rows**

因此：
- 新資料會在 sync 當下正式寫入
- 舊資料已完成一次補寫

---

## 3. 本輪性能調查：vendor detail 為什麼還是慢

本輪使用者明確回報：
- vendor list page 速度有變快
- 但點進單一 vendor detail 頁，體感仍然很慢

經本輪排查，已確認以下路徑：

---

### 3.1 已嘗試過的優化（已做）

#### A. vendor list N+1 summary fan-out
已處理：
- `listDbVendors()` 原本是：
  - 先 list 所有 vendors
  - 再對每個 vendor individually 跑 financial summary
- 已改為批次聚合 query

結果：
- **list page 明顯變快**
- 但 detail 頁無法因此被解決

---

#### B. vendor detail per-project task fan-out
已處理：
- `listDbVendorProjectRecordsByVendorId()` 原本會對 financial records 每一個 project individually 呼叫 `listDbVendorTasksByProject(projectId)`
- 已改為先批次抓該 vendor 的全部 tasks，再按 project 分組

結果：
- 這是正確優化
- 但**不是 detail 頁最核心的慢點**

---

#### C. vendor financial summary 不再載整包 financial projects
已處理：
- 原本 `getVendorFinancialSummary()` 會先跑：
  - `getQuoteCostProjectsWithDbFinancialsAndGroups()`
  - 再從整包全專案 financial universe 中 filter 出單一 vendor
- 已改成 vendor-scoped 讀法

結果：
- 這也是正確優化
- 但使用者體感仍然認為 detail 頁明顯慢

---

#### D. vendor detail 不再同時 render 未付款專案 + 往來紀錄
已處理：
- 新增 section tab：
  - `未付款專案`
  - `往來記錄`
- 改成 on-demand render，而不是兩塊同時全量 render

結果：
- 首屏應理論上變輕
- 但**使用者回報體感仍然慢**

---

#### E. 未付款專案改成表格式
已處理：
- 原本是 card-heavy 大量區塊
- 改成 table / compact row 顯示
- 明細改成展開後才顯示

結果：
- 理論上應降低首屏 render 負擔
- 但**使用者仍回報 detail 整體還是慢**

---

#### F. Header / 廠商資訊改成收合式展開
已處理：
- Header 與 vendor profile 合併
- 廠商資訊預設收合
- 只在需要時展開

結果：
- UI 更乾淨
- 首屏負擔應下降
- 但**仍未解掉「整頁還是慢」的根因**

---

## 4. 目前已確認：不是單一 SQL 爆慢

本輪排查中，已先量測幾條基礎 query：
- vendor base
- vendor payments
- vendor tasks batch

初步量測顯示：
- 單條大約落在 **40ms 級別**
- 沒有出現某一條單獨卡住數秒的情況

因此目前判斷：

> **vendor detail 的慢，很可能不是單一 query 爆慢，而是多段資料鏈 + render 體積 + 單頁內容過重的複合結果。**

---

## 5. 本輪重要結論（必記）

### 5.1 不能再犯的錯：不要假設 schema 有欄位
本輪曾出現一次錯誤路徑：
- 誤以為 `financial_reconciliation_groups` 已有 `amount_total / item_count`
- 實際 DB schema 並沒有
- 造成 adapter query runtime fail，最後 fallback 空資料

這條已修正，但必須正式記錄為：

> **之後若再改正式 source，必須先查真實 DB schema，不可只憑推定欄位名直接接。**

---

### 5.2 不能再犯的錯：不要拿不存在的 `financial_cost_items` 當正式來源
本輪已查明：
- 目前正式 DB 中 `financial_cost_items` 不存在
- 因此不可再把它當成 vendor reconciliation amount 的穩定來源

正式規則：

> **目前 vendor 對帳後金額，正式來源就是 `financial_reconciliation_groups` 本身。**

---

### 5.3 目前尚未解決：vendor detail 仍然非常慢
即使做完本輪所有優化，使用者仍明確回報：

> **vendor detail 頁面還是非常慢。**

因此這條不能被視為已關閉；相反地，它已正式升級為：

> **當前 open performance task / 必須持續追查直到找到真正根因。**

---

## 6. 下一步正式任務（未完成）

### 任務名稱
**Vendor Detail Performance Root Cause Investigation（must continue）**

### 目標
找出 vendor detail 頁「仍然非常慢」的真正根因，不能再停在一般性優化或猜測。

### 已知排除項
以下已做過，不能再重複當成「新發現」：
1. vendor list N+1 financial summary fan-out
2. vendor detail per-project task fan-out
3. vendor financial summary 全專案 filter 路徑
4. 未付款專案 / 往來記錄同時 render
5. 未付款專案 card-heavy 結構
6. header + vendor profile 預設展開

### 目前待查方向
1. `VendorDetailShellDb` 本身整體 render 體積
2. `往來記錄` 區塊是否仍然太重
3. shared layout / auth / page chain 是否有 blocking path
4. 是否存在大量 `window.location.reload()` 帶來的主觀卡頓
5. 是否需要進一步把 detail 頁拆成：
   - 更輕的首屏 summary
   - 明細延後載入 / 再分頁 / 再 lazy render

---

## 7. 一句話總結

> **2026-04-24 晚間已正式把 vendor 對帳後金額承接主線 formalize 到 `financial_reconciliation_groups`（含 `amount_total / item_count`），並完成 list/detail 對齊與舊資料 backfill；但 vendor detail 頁的性能問題至今仍未解決，且已明確確認不能再用「單一 query 太慢」這種簡化說法帶過，後續必須持續追根到 render / page-chain / UI-structure 層級。**
