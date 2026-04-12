# MD95 — projectflow quotation DB read-model implementation closure (2026-04-12)

> Status: ACTIVE
> Follow-up: `MD92-projectflow-quote-cost-quotation-db-read-model-spec-2026-04-12.md`, `MD93-projectflow-quotation-db-read-model-gap-and-phase-1-implementation-2026-04-12.md`, `MD94-projectflow-quotation-db-schema-and-read-model-cto-spec-2026-04-12.md`
> Note: 本文件記錄 quotation DB read-model 這一輪工程落地已完成，供後續驗收、回查與續接使用。


## 1. 文件定位

本文件用來正式記錄 `quotation DB read-model` 這一輪工程實作已完成的內容、驗收結果、影響檔案與正確停點。

本文件目的：
- 把 `MD92~MD94` 的規格鏈接到已落地的工程結果
- 給後續續接者明確的 implementation closure 停點
- 避免之後又把 quotation 區誤判為仍 purely seed-driven

---

## 2. 本輪核心結論

> **截至 2026-04-12，quotation 區已建立正式 DB schema 與正式 read-model，`quote-cost detail` 的 quotation 主來源已從 seed projection 推進到 DB-backed read model。**

更準確地說：
- quotation 已不再 purely 依賴 seed projection
- `quotation-read-model.ts` 已從 gap wrapper 轉成正式 DB query 入口
- seed arrays 仍殘留，但已降級為 fallback-only

---

## 3. 本輪實作完成內容

## 3.1 quotation 正式 schema 已建立
已完成 migration：
- `20260412_financial_quotation_read_model.sql`

已建立正式主體：
- `financial_quotation_imports`
- `financial_quotation_line_items`

並補上：
- index
- active import constraint
- `updated_at` trigger

正式判定：
> quotation 區已不再缺正式 schema 基礎。

---

## 3.2 quotation-read-model 已轉型為正式 DB query 入口
已完成：
- `project -> latest effective quotation import`
- `import -> quotation line items`

正式判定：
> `quotation-read-model.ts` 已從過去的 gap wrapper，轉為正式 DB read-model entry point。

---

## 3.3 financial-flow-adapter 已承接正式 quotation read-model
已完成：
- `financial-flow-adapter.ts` 改由正式 quotation read-model 注入 quotation 資料
- note 文案改為明確反映：
  - schema 缺失 fallback
  - query failure fallback

正式判定：
> quotation 區的正式主來源已切換到 DB-backed read model，而不再是隱性 seed merge。

---

## 3.4 現有 DB 已補最小 bootstrap 資料
本輪已完成最小 bootstrap：
- 3 筆 `financial_quotation_imports`
- 9 筆 `financial_quotation_line_items`

正式判定：
> 現有 DB 專案已具備最小 quotation 正式 readback 基礎，不再 purely 落回 seed projection。

---

## 4. 本輪未做的事（重要）

本輪**沒有做**以下事情：
1. 沒有改 UI
2. 沒有新增欄位
3. 沒有擴到其他模組
4. 沒有全面清掉所有 `quote-cost-data.ts` sample arrays
5. 沒有順手清完 reconciliation / close status 的 seed 時代殘留語意

正式判定：
> 本輪是 quotation DB-first 主線落地，不是全 quote-cost ecosystem 一次全面清理。

---

## 5. 影響檔案

### Migration
- `project-mgmt/db/migrations/20260412_financial_quotation_read_model.sql`

### Code
- `project-mgmt/src/lib/db/quotation-read-model.ts`
- `project-mgmt/src/lib/db/financial-flow-adapter.ts`

---

## 6. 驗收結果

本輪已驗通：
1. 不改 UI
2. 不新增欄位
3. build 通過
4. quotation 區不再 purely 依賴 seed projection
5. quotation 區正式主來源已改承接 DB-backed read model

執行結果：
- `npm run build` ✅

---

## 7. 本輪 commit

- `5253e84` — `feat: add db-backed quotation read model`

---

## 8. 正確停點

截至本文件，正確停點應理解為：

> **quotation DB read-model 這一輪已落地完成，`quote-cost detail` 的 quotation 主來源已正式切到 DB-backed read model；後續若再續接，不應回頭重開 quotation schema / read-model 是否存在，而應直接視為已成立，接著處理 fallback retirement 與剩餘 quote-cost ecosystem cleanup。**

---

## 9. 一句話總結

> quotation 區這一輪已從「缺 schema、缺 read-model、只能靠 seed projection 補位」的狀態，推進成「已有正式 quotation schema、已有 DB-backed read-model、且 `quote-cost detail` quotation 主來源已切到 DB」的實作完成態；後續若再續接，正確主線不再是補 quotation DB 基礎，而是退場 residual fallback 與清理剩餘 partial DB-first 殘留。