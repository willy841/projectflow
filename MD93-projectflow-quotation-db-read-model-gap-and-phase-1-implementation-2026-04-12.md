# MD93 — projectflow quotation DB read model gap and phase 1 implementation (2026-04-12)

> Status: ACTIVE
> Follow-up: `MD90`, `MD91`, `MD92`
> Note: 本文件是 `quotation DB read model` 第一輪 CTO 盤點、缺口判斷與最小可落地收斂紀錄。

## 1. 需求理解

本輪目標不是重做 `quote-cost detail` UI，而是聚焦 quotation 區的正式資料責任：
- 盤點 quotation import / quotation line items 目前真實來源
- 判斷現有 DB/schema 是否已存在可承接的正式 read model 基礎
- 若可行，做最小可落地 integration
- 若不可完整落地，至少要把缺口、過渡責任與下一輪 work package 講清楚

硬限制維持：
- 不重開 UI
- 不新增欄位
- 不擴其他模組
- 不做全系統 cleanup

---

## 2. 現況盤點

### 2.1 quotation import 真實來源
目前 repo 內 `quotation import` 的正式顯示來源仍不是 DB，而是：
- `src/components/quote-cost-data.ts`
  - `sampleQuoteImports`
  - `quoteCostProjects[*].quotationImport`

### 2.2 quotation line items 真實來源
目前 repo 內 `quotation line items` 的正式顯示來源仍不是 DB，而是：
- `src/components/quote-cost-data.ts`
  - `sampleQuoteLineItemsByProject`
  - `quoteCostProjects[*].quotationItems`

### 2.3 quotation 如何流進 quote-cost detail
目前 `quote-cost detail` / `closeout detail` 實際吃的是：
- `src/lib/db/financial-flow-adapter.ts`
  - DB 提供 financial cost items / reconciliation / collection / payable readback
  - quotation 區則仍從 seed project projection 補位

也就是：
> quotation 區目前雖然掛在 DB-first financial adapter 底下，但本質上仍是 seed projection。

---

## 3. 現有 DB 基礎判斷

### 3.1 已有的正式 DB 基礎
目前 phase1 / downstream migrations 已有：
- `projects`
- `design_tasks` / `procurement_tasks` / `vendor_tasks`
- `task_confirmations`
- `task_confirmation_plan_snapshots`
- `financial_manual_costs`
- `financial_reconciliation_groups`
- `project_collection_records`
- `project_vendor_payment_records`

這些足以支撐：
- cost read model
- reconciliation group readback
- collection readback
- payable/payment readback

### 3.2 明確不存在的 quotation read-model 基礎
目前 migration 已直接註記：
- `20260405_projectflow_phase1.sql`
  - `Intentionally excludes ... quote cost tables.`

且 repo 內未發現正式 quotation tables / schema，例如：
- quotation import table
- quotation line items table
- quotation import 與 project 的正式 readback 關聯

### 3.3 正式判定
結論很明確：
> 現有 DB/schema **不足以完整落地 quotation 正式 DB read model**。

不是 UI 問題，也不是 adapter 寫法而已；而是 DB 還沒有 quotation domain 的正式承接表與查詢契約。

---

## 4. 第一輪可落地實作

### 4.1 本輪已做的最小收斂
本輪已把 quotation 責任從 `financial-flow-adapter.ts` 內嵌 seed merge，抽成獨立 read-model 邊界：
- 新增：`project-mgmt/src/lib/db/quotation-read-model.ts`

這個邊界現在明確負責：
1. 判斷正式 quotation schema 是否存在
2. 在 schema 缺失時，明確以 `missing-schema-seed-fallback` 狀態回傳
3. 集中承接 quotation import / quotation line items 的過渡 seed projection
4. 避免 `financial-flow-adapter.ts` 繼續把 quotation seed merge 與 financial DB cost merge 混在一起

### 4.2 本輪同步調整
- `project-mgmt/src/lib/db/financial-flow-adapter.ts`
  - 改為吃 `quotation-read-model.ts`
  - note 文案改為明確區分：
    - quotation schema/read model 尚未存在
    - cost source fallback 只是 DB 未接管的過渡責任

### 4.3 這代表什麼
本輪**沒有把 quotation 做成正式 DB readback**。
但本輪已完成一個必要停點：
> quotation seed projection 不再是 financial adapter 裡模糊的一段內嵌補丁，而是被明確收斂成獨立 read-model 邊界與缺口狀態。

這讓 source 責任比修改前更清楚，也讓下一輪 schema / query 實作有正確插點。

---

## 5. 哪些 seed projection 仍不得不保留

在現有 schema 下，以下 seed projection 仍不得不保留：
- `quoteCostProjects[*].quotationImport`
- `quoteCostProjects[*].quotationItems`
- `sampleQuoteImports`
- `sampleQuoteLineItemsByProject`

原因不是偷懶，而是：
- DB 尚無 quotation import table
- DB 尚無 quotation line items table
- DB 尚無 project -> quotation import -> line items 的正式 readback contract

因此本輪只能做到：
- **把 seed 保留在明確的 quotation read-model fallback 層**
- 而不是假裝它已經是 DB-first

---

## 6. 下一輪正確 CTO work package

### WP1 — quotation schema formalization
需要正式建立至少兩層：
1. `financial_quotation_imports`（或同等正式命名）
2. `financial_quotation_line_items`（或同等正式命名）

最低責任：
- import 與 project 關聯
- line item 與 import 關聯
- 保留目前 UI 所需欄位，不額外擴充

### WP2 — quotation readback query contract
在 `quotation-read-model.ts` 補正式查詢：
- project -> latest effective quotation import
- import -> quotation line items

### WP3 — financial payload integration
把 quotation read model 正式整合進：
- `getQuoteCostProjectsWithDbFinancials()`
- `getQuoteCostProjectByIdWithDbFinancials()`

正式退掉：
- `quoteCostProjects[*].quotationImport`
- `quoteCostProjects[*].quotationItems`

### WP4 — seed projection retirement
條件是 WP1 ~ WP3 完成後，才可退：
- `sampleQuoteImports`
- `sampleQuoteLineItemsByProject`
- quotation seed projection note / fallback

---

## 7. 風險與 guardrails

### 7.1 風險
- 若直接在沒有 schema 的情況下硬說 DB-first，會造成假閉環
- 若本輪順手把 UI 改掉，會把 source unification 與 UI 調整混線
- 若把 quotation schema 一次擴太大，會偏離本輪最小責任

### 7.2 guardrails
- 先切清 read-model 邊界，再做 schema
- 不重開 UI
- 不新增頁面欄位
- 只補足 quotation import / line items / financial payload integration 所需最小責任

---

## 8. 一句話總結

> 本輪判定結果很明確：`quote-cost detail` 的 quotation 區目前**還沒有正式 DB read model 基礎**；因此無法在不新增 schema 的前提下完整 DB-first 落地。但本輪已完成第一個正確停點：把 quotation seed projection 抽成獨立 `quotation-read-model` 邊界，讓缺口、fallback 與下一輪 schema/query work package 都明確化，source 責任比原本更清楚。