# MD51 - projectflow 下游階段進度刷新（Accounting Center 規格回合後）（2026-04-08）

> 目的：在 `Accounting Center` 規格回合完成後，刷新原本 `MD41` 的進度視圖，讓後續續接時能清楚看見：哪些已完成、哪些尚未完成、主入口應讀哪份、哪些不必再重談。
>
> 本檔承接：
> - `MD41-projectflow-downstream-current-progress-and-open-topics-2026-04-08.md`
> - `MD50-projectflow-accounting-center-master-spec-and-downstream-alignment-2026-04-08.md`

---

# 1. 本輪後的主入口更新

在 `Accounting Center` 規格回合完成後，後續若要續接下游階段，不應再只以 `MD41` 作為唯一入口。

目前建議主入口為：

1. `MD50-projectflow-accounting-center-master-spec-and-downstream-alignment-2026-04-08.md`
2. `MD41-projectflow-downstream-current-progress-and-open-topics-2026-04-08.md`
3. 各子 spec（MD42～MD49）

正式原則：
> `MD41` 保留為進度與 open topics 歷史整理檔；`MD50` 則已成為 Accounting Center 主線的最新整合母入口。

---

# 2. 本輪後已完成的正式規格

## 2.1 Vendor Data 主線（已完成）
- `MD38-projectflow-vendor-data-module-v1-spec-2026-04-08.md`
- `MD39-projectflow-vendor-data-upstream-midstream-alignment-v1-2026-04-08.md`

## 2.2 Closeout 主線（已完成）
- `MD40-projectflow-closeout-module-v1-spec-2026-04-08.md`

## 2.3 Accounting Center 主線（本輪大幅完成）
### 已完成母線 / 子線
- `MD42-projectflow-accounting-center-personnel-input-area-v1-spec-2026-04-08.md`
- `MD43-projectflow-accounting-center-personnel-record-area-v1-spec-2026-04-08.md`
- `MD44-projectflow-accounting-center-operating-expense-module-v1-spec-2026-04-08.md`
- `MD45-projectflow-accounting-center-office-expense-input-area-v1-spec-2026-04-08.md`
- `MD46-projectflow-accounting-center-office-expense-record-area-v1-spec-2026-04-08.md`
- `MD47-projectflow-accounting-center-other-expense-input-area-v1-spec-2026-04-08.md`
- `MD48-projectflow-accounting-center-other-expense-record-area-v1-spec-2026-04-08.md`
- `MD49-projectflow-accounting-center-revenue-overview-v1-spec-2026-04-08.md`
- `MD50-projectflow-accounting-center-master-spec-and-downstream-alignment-2026-04-08.md`

---

# 3. 目前已不需要再從零重談的題目

以下題目目前已經有正式結論，不應再回到未收斂狀態：

## 3.1 管銷成本是否要以月份為主體
已定：
- **要，採月份主體**

## 3.2 管銷成本與營運支出的關係
已定：
- **管銷成本 = 營運支出**

## 3.3 人事是否要拆輸入區 / 記錄區
已定：
- **要，而且兩者必須嚴格分開**

## 3.4 庶務與其他是否也要拆輸入區 / 記錄區
已定：
- **要，已完成主要 v1 子 spec**

## 3.5 營收概況是否需要利潤結果值
已定：
- **要，並新增利潤總計卡**

---

# 4. 目前最清楚的 Accounting Center 結構

## 4.1 三大主區塊
1. 執行中專案
2. 管銷成本
3. 營收概況

## 4.2 其中完成度最高者
目前完成度最高的是：
- **管銷成本**
- **營收概況**

## 4.3 尚待補強者
目前相對還缺正式整合母 spec / 對齊整理的是：
- **執行中專案**
- `Accounting Center × Closeout × Vendor Data` 對齊整合檔

---

# 5. 目前尚未完成的主題

## 5.1 執行中專案最終母 spec
雖然已有款項追蹤表與部分結構定義，但尚未整理為最新完整母 spec。

## 5.2 Accounting Center 全模組最終母 spec
雖然 `MD50` 已完成整合，但若後續要進 CTO / 前端設計師落地，可能仍需再整理成更正式的單一模組母 spec。

## 5.3 與 Closeout / Vendor Data 的正式對齊整合檔
目前語意已清楚，但尚未單獨整理成一份專門的 alignment spec。

## 5.4 CTO / 前端設計師派工格式
目前大多仍是 CPO formal spec；若要進實作輪，下一步需轉成工程與 UI work package。

---

# 6. 後續續接建議順序

## Priority 1
補 `執行中專案` 母 spec，讓 Accounting Center 三大主區塊全部完整成形。

## Priority 2
整理 `Accounting Center × Closeout × Vendor Data` 對齊規則整合檔。

## Priority 3
將 `MD50` 與各子 spec 轉成 CTO / 前端設計師可直接派工的格式。

---

# 7. 一句話定稿

> 在本輪 `Accounting Center` 規格回合完成後，`projectflow` 下游階段已不再只是「Vendor Data / Closeout 已完成、Accounting Center 尚未收斂」的狀態；現在更準確的描述是：`Accounting Center` 中的 `管銷成本` 與 `營收概況` 已有正式 spec 鏈條可供續接，且 `MD50` 已成為最新整合母入口；後續主線應集中在補 `執行中專案` 母 spec、整理跨模組 alignment，以及把既有 CPO spec 轉成實作派工格式。
