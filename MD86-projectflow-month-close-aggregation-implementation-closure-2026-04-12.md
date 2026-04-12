# MD86 — projectflow month-close aggregation implementation closure (2026-04-12)

> Status: ACTIVE
> Follow-up: `MD82-projectflow-month-close-v1-spec-2026-04-12.md`, `MD83-projectflow-accounting-center-month-close-aggregation-alignment-2026-04-12.md`, `MD84-projectflow-month-close-aggregation-detail-readback-rule-2026-04-12.md`, `MD85-projectflow-month-close-aggregation-cto-work-package-and-risk-guardrails-2026-04-12.md`
> Note: 本文件記錄 `month close aggregation` 第一版工程落地已完成，供後續驗收、回查與續接使用。


## 1. 文件定位

本文件用來正式記錄 `month close aggregation` 這一輪工程實作已完成的內容、驗收結果、影響檔案與正確停點。

本文件目的：
- 把 `MD82~MD85` 的規格鏈，接到已落地的工程結果
- 給後續續接者一個明確的 implementation closure 停點
- 避免之後再把 `Accounting Center` 誤讀回 active-only 或 confirmation layer

---

## 2. 本輪核心結論

> **截至 2026-04-12，`month close aggregation` 第一版工程落地已完成，並已校正成符合 `MD82~MD85` 的 aggregation / readback 規則。**

更準確地說：
- 已不再是 active-only month view
- 已不再按收款日期切收款歸屬
- 已不再容許 summary 與列表各跑一套算法
- 同時維持既有 UI 欄位、既有 detail route、既有責任邊界不變

---

## 3. 本輪實作完成內容

## 3.1 專案集合規則已校正
已完成：
- month close aggregation 改為以 **活動日期屬於該月份** 作為收錄條件
- **不論專案是否已結案**，只要活動日期屬於該月份，就會進列表

正式判定：
> 已從舊的 active-only 心智，校正成 `MD84` 定義的月份專案集合。

---

## 3.2 收款歸屬規則已校正
已完成：
- `已收款` 改承接該專案的 **全量 `project_collection_records` 聚合**
- 不再按 `collected_on` 所屬月份切收款統計

正式判定：
> 已符合 `MD82` 的正式規則：收款統計跟專案走，不跟收款日期走。

---

## 3.3 三個值的真值來源已統一
已完成：
- `總金額 = quote total / 應收總額`
- `已收款 = project_collection_records`
- `未收款 = 總金額 - 已收款`

正式判定：
> `month close aggregation` 現已不再混用其他過渡值或平行來源。

---

## 3.4 summary 與列表已同源
已完成：
- 抽出同一條 helper / adapter 鏈產出列表 rows
- summary 改由當前 rows 聚合，不再各算各的

正式判定：
> 已符合 `MD84` 的一致性規則：summary 與列表完全同源。

---

## 3.5 drill-down 與排序規則已鎖定
已完成：
- `查看詳情` 維持導向既有 `/quote-costs/[id]`
- 未新增 month-close-specific detail route
- 排序已鎖定為：
  1. 活動日期升冪
  2. 同日按專案名稱
  3. 再用 project id / 建立順序做穩定排序

正式判定：
> 已符合 `MD84` 的導流與排序規則。

---

## 4. 本輪未做的事（重要）

本輪**沒有做**以下事情：
1. 沒有改 UI
2. 沒有新增欄位
3. 沒有新增新頁
4. 沒有新增 month close 專屬 detail page
5. 沒有把 `Accounting Center` 做成 confirmation / approval / finalize layer
6. 沒有更動既有 `quote-cost / financial detail` 作為金額確認主線的責任邊界

正式判定：
> 本輪屬於純資料層 / selector / adapter / readback 校正，不屬於 UI 重開或產品責任漂移。

---

## 5. 影響檔案

### 修改
- `project-mgmt/src/lib/db/accounting-center-adapter.ts`

### 新增
- `project-mgmt/src/lib/accounting-month-close.ts`
- `project-mgmt/tests/accounting-month-close-aggregation.unit.test.ts`

---

## 6. 驗收結果

本輪已驗通：
1. 活動日期屬於該月份、但已結案的專案仍會進列表
2. 非該月份專案不混入
3. 每列 `總金額 / 已收款 / 未收款` 正確
4. summary 與列表加總一致
5. `查看詳情` 仍導向 `/quote-costs/[id]`
6. 缺值案例以 0 容錯

執行結果：
- `node --test --experimental-strip-types tests/accounting-month-close-aggregation.unit.test.ts` ✅
- `npm run build` ✅

---

## 7. 本輪 commit

- `e9fb7b8` — `fix: align accounting month close aggregation`

---

## 8. 正確停點

截至本文件，正確停點應理解為：

> **`month close aggregation` 第一版工程已落地完成，並已符合 `MD82~MD85` 的規格邊界；後續若再續接，不應回頭重開 UI 或責任邊界，而應視需要進入後續驗收、索引更新、或下一階段 aggregation / overview 延伸。**

---

## 9. 一句話總結

> `month close aggregation` 這一輪已從規格正式落地成工程結果：資料集合已從 active-only 校正為「活動日期屬於該月份的所有專案」、收款統計已改為跟專案走、summary 與列表已同源、drill-down 與排序已鎖定，且全程未重開 UI、未新增欄位、未漂移成 confirmation layer；因此可視為 `month close aggregation v1` 的第一版 implementation closure。