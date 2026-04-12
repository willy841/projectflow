# MD85 — projectflow month-close aggregation CTO work package and risk guardrails (2026-04-12)

> Status: ACTIVE
> Follow-up: `MD82-projectflow-month-close-v1-spec-2026-04-12.md`, `MD83-projectflow-accounting-center-month-close-aggregation-alignment-2026-04-12.md`, `MD84-projectflow-month-close-aggregation-detail-readback-rule-2026-04-12.md`
> Note: 本文件用來把 `month close aggregation` 整理成 CTO 可直接接手的 work package，並寫死風險規避 guardrails。


## 1. 文件定位

本文件承接 `MD82` / `MD83` / `MD84`，用來把 `month close aggregation` 轉成 CTO 可直接執行的工程 work package，並明確規定本輪不可漂移的風險規避原則。

本文件目的：
- 讓 CTO 有可直接落地的工程拆法
- 避免實作時回到舊的 active-only 心智
- 避免 summary / 列表 / 真值來源分裂
- 避免以資料調整為名義重開已鎖定 UI

---

## 2. 本輪工程目標

> **把既有 `Accounting Center` 的 active-projects / month-based view，校正成符合 `MD82` / `MD83` / `MD84` 的 `month close aggregation / readback` 規則。**

正式原則：
- 不重開 UI
- 不新增欄位
- 不新增新頁
- 不新增第二套單案財務頁
- 只校正資料集合、真值 readback、summary 同源與 drill-down 規則

---

## 3. CTO work package

## WP1 — 月份專案集合 selector 校正
### 目標
把 `month close aggregation` 的專案集合正式改成：
- 活動日期屬於指定月份
- 不論是否已結案都收錄

### 工程內容
1. 找出目前 Accounting Center active-projects / month view 的資料來源
2. 檢查目前是否仍有 active-only / status-based gating
3. 改成以「活動日期所在月份」為主過濾條件
4. 移除不該存在的 active-only 收錄條件

### 完成定義
- 活動日期屬於該月份的已結案專案，仍會出現在 month close aggregation
- 非該月份專案不會混入
- UI 欄位不變

---

## WP2 — 金額 readback 統一化
### 目標
把每列專案的三個值統一承接同一套已拍板真值來源。

### 工程內容
1. `總金額 = quote total / 應收總額`
2. `已收款 = project_collection_records`
3. `未收款 = 總金額 - 已收款`
4. 補上空值容錯：
   - quote total 缺值 = 0
   - collection records 缺值 = 0

### 完成定義
- 每列 `總金額 / 已收款 / 未收款` 均符合 `MD82` / `MD84`
- 缺值時不出現 NaN / 異常聚合

---

## WP3 — summary 與列表同源化
### 目標
確保 summary 不是另一套算法，而是當前月份列表結果的聚合。

### 工程內容
1. 找出目前 summary 的計算來源
2. 若目前 summary 與列表分開算，改成同一個 selector / adapter 鏈
3. 確保：
   - summary 總金額 = 列表總金額加總
   - summary 已收款 = 列表已收款加總
   - summary 未收款 = 列表未收款加總

### 完成定義
- summary 與列表完全一致
- 不存在上面一套、下面一套的分裂

---

## WP4 — drill-down 與排序規則鎖定
### 目標
把 month close aggregation 的導流與排序規則固定成已拍板版本。

### 工程內容
1. `查看詳情` 全部維持導向 `/quote-costs/[id]`
2. 不新增 month-close-specific detail route
3. 列表排序固定：
   - 活動日期升冪
   - 同日按專案名稱
   - 再用 project id / 建立順序做穩定排序

### 完成定義
- 列表順序穩定
- 導流不漂移
- 無第二套 detail 頁

---

## 4. 建議執行順序

必須依序執行：
1. `WP1` 月份專案集合 selector 校正
2. `WP2` 金額 readback 統一化
3. `WP3` summary 與列表同源化
4. `WP4` drill-down 與排序規則鎖定

正式原則：
- 集合沒定，不做後續 summary 判讀
- 真值來源沒定，不做總覽一致性驗收
- 排序與導流最後鎖即可

---

## 5. 風險與 guardrails

## Guardrail 1 — 先驗集合，再驗金額
### 風險
容易表面看起來像 month close，實際資料集合仍是 active-only。

### 規避規則
- 先驗「活動日期屬於該月份、但已結案」的專案是否被收錄
- 若沒進列表，直接判定 WP1 失敗

---

## Guardrail 2 — summary 必須由列表聚合
### 風險
summary 與列表看起來都合理，但其實各自跑不同算法。

### 規避規則
- summary 與列表必須共用同一條 selector / adapter 鏈
- 驗收時需手動比對列表加總與 summary 是否完全一致

---

## Guardrail 3 — 三個值的真值來源先寫死
### 風險
回到舊 seed / fallback / 過渡值混用，導致數字來源不乾淨。

### 規避規則
正式寫死：
- `總金額 = quote total / 應收總額`
- `已收款 = project_collection_records`
- `未收款 = 總金額 - 已收款`

任何地方不得再發明第四種來源。

---

## Guardrail 4 — 本輪只允許資料層變更，不得偷改 UI
### 風險
以資料調整為名義，順手新增 badge / 欄位 / 卡片，重開已鎖定 UI。

### 規避規則
本輪禁止：
- 新增欄位
- 新增摘要卡
- 重排區塊
- 新增專屬 detail route
- 以「順便優化」名義調 UI

若要改 UI，必須另開主線，不得包在本輪。

---

## Guardrail 5 — 禁止把 month close 寫成 confirmation layer
### 風險
後續實作與文件命名，容易把 `Accounting Center` 又寫回金額確認層。

### 規避規則
- `Accounting Center` 一律使用 aggregation / readback / tracking 語言
- 禁止使用 confirm / approve / finalize / amount confirmation 語言
- 所有金額確認一律回到 `quote-cost / financial detail`

---

## Guardrail 6 — 缺值案例必須納入驗收
### 風險
只驗完整資料，最後缺值案例才暴露出 NaN / 空白 / 聚合異常。

### 規避規則
至少驗證三種案例：
1. 有 quote total、有收款
2. 有 quote total、沒收款
3. 活動日期屬於該月份，但 quote total 或 collection 缺值

正式原則：
- 缺值時頁面仍需可正常顯示
- 金額以 0 容錯
- summary 不崩

---

## Guardrail 7 — 嚴格分 WP、小步驗證
### 風險
一次把集合、金額、summary、排序、導流全改，出錯時無法定位。

### 規避規則
- 嚴格依 WP1 → WP2 → WP3 → WP4 執行
- 每一包做完就做最小驗證
- 不得一口氣全改完再一起驗

---

## 6. 驗收建議

本輪驗收至少包含：
1. 活動日期屬於該月份、但已結案的專案能進列表
2. 非該月份專案不會混入
3. 每列總金額 / 已收款 / 未收款正確
4. 缺值案例以 0 容錯
5. summary 與列表加總完全一致
6. `查看詳情` 仍回 `/quote-costs/[id]`
7. UI 欄位與區塊骨架完全不變

---

## 7. 一句話總結

> `month close aggregation` 的 CTO work package，應只聚焦在資料集合校正、金額 readback 統一、summary 與列表同源、以及 drill-down / 排序規則鎖定；同時必須嚴格遵守 7 條風險 guardrails：先驗集合、summary 由列表聚合、真值來源寫死、禁止偷改 UI、禁止 confirmation 漂移、缺值案例納入驗收、以及嚴格分 WP 小步驗證。