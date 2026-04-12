# MD84 — projectflow month close aggregation detail / readback rule (2026-04-12)

> Status: ACTIVE
> Follow-up: `MD82-projectflow-month-close-v1-spec-2026-04-12.md`, `MD83-projectflow-accounting-center-month-close-aggregation-alignment-2026-04-12.md`
> Note: 本文件用來正式定義 `month close aggregation` 的 detail / readback 規則。


## 1. 文件定位

本文件承接 `MD82` 與 `MD83`，用來把 `month close aggregation` 下一層的列表收錄、排序、金額 readback、summary 一致性與 drill-down 規則正式寫死。

本文件目的：
- 避免 month close 列表邏輯在後續工程實作時漂移
- 避免 summary 與列表各自跑出兩套不同算法
- 明確規定 month close 只是 aggregation / readback layer，不發明第二套單案財務頁

---

## 2. 本文件的核心結論

> `month close aggregation` 應以「活動日期屬於該月份的所有專案」作為列表主體，不論該專案目前是否已結案；每列只承接 `總金額 / 已收款 / 未收款`，並導向既有 `/quote-costs/[id]` financial detail；摘要區則必須與當前月份列表聚合結果完全一致。

---

## 3. 專案收錄規則

### 3.1 正式拍板

> **只要活動日期屬於該月份，就收進 `month close aggregation`，不管目前是否已結案。**

也就是：
- 活動日期在該月份的專案，一律列入
- 不因目前狀態為「執行中」或「已結案」而排除

### 3.2 正式語意

> `month close aggregation` 看的是「這個月份的專案集合」，不是「目前仍執行中的專案集合」。

---

## 4. 列表主體

`month close aggregation` 的列表主體為：

> **活動日期屬於該月份的專案集合**

正式原則：
- 不另做次分組
- 不因狀態拆成兩套表
- 先以單一專案列表呈現月份集合

---

## 5. 每列承接值與真值來源

每列專案固定只承接以下三個值：
1. 總金額
2. 已收款
3. 未收款

### 5.1 總金額
> **總金額 = quote total / 應收總額**

### 5.2 已收款
> **已收款 = `project_collection_records` 聚合結果**

### 5.3 未收款
> **未收款 = 總金額 - 已收款**

正式原則：
- `month close aggregation` 只承接已成立真值
- 不在 `Accounting Center` 重新認定金額
- 不在這裡做第二套 confirmation

---

## 6. 空值 / 缺值規則

### 6.1 quote total 缺值
若某專案沒有 quote total：
> **總金額視為 0**

### 6.2 collection records 缺值
若某專案沒有 collection records：
> **已收款視為 0**

### 6.3 未收款公式
> **未收款仍依 `總金額 - 已收款` 計算**

正式語意：
> `month close aggregation` 是 readback layer，不應因某些單案缺值而讓整體列表失效或無法聚合。

---

## 7. 列表排序規則

### 7.1 正式拍板
列表排序規則依序為：
1. **活動日期升冪**
2. 若同日，再依 **專案名稱**
3. 若仍相同，再以 **project id / 建立順序** 做穩定排序

### 7.2 正式語意

> `month close aggregation` 以活動日期作為第一排序軸，最符合月份專案集合的閱讀順序；其餘條件只作穩定排序用途。

---

## 8. drill-down 規則

### 8.1 正式拍板

> **`查看詳情` 一律導向既有 `/quote-costs/[id]` financial detail。**

### 8.2 正式原則
- 不另做 month-close-specific detail page
- 不另做 month close drawer
- 不做第二套單案財務工作台

正式語意：
> `month close aggregation` 只負責月份層的 summary / tracking / readback；單案財務主線仍回到既有 `quote-cost / financial detail`。

---

## 9. summary 與列表一致性規則

### 9.1 正式拍板

> **摘要區的 `總金額 / 已收款 / 未收款`，必須與當前月份列表所有專案列值的加總完全一致。**

### 9.2 正式語意
- summary 不得另外跑一套算法
- summary 不得與列表來源脫鉤
- summary = 當前列表聚合結果

這條是 month close aggregation 的核心一致性規則，不可漂移。

---

## 10. 與既有 active-projects UI 的關係

`month close aggregation` 與既有 active-projects UI 的關係應理解為：

> **沿用既有 active-projects 已確認的 UI 欄位與導流方式，但資料集合不再限於 active projects，而是改成活動日期屬於該月份的所有專案。**

正式原則：
- UI 欄位承接既有規則
- 資料集合依 `month close` 規則校正
- 不因這條新主線而重開既有 UI

---

## 11. 一句話總結

> `month close aggregation` 的 detail / readback 規則是：以活動日期屬於該月份的所有專案作為列表主體，不論是否已結案；每列只承接 `總金額`、`已收款`、`未收款` 三個值，分別對應 quote total、`project_collection_records` 與兩者差額；缺值時以 0 容錯，列表按活動日期升冪排序，`查看詳情` 一律導向既有 `/quote-costs/[id]`，而摘要區則必須與當前月份列表聚合結果完全一致。