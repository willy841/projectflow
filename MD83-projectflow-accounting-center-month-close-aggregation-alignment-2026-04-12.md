# MD83 — projectflow Accounting Center month-close aggregation alignment (2026-04-12)

> Status: ACTIVE
> Note: 本文件用來正式校正 `Accounting Center` 在 `month close` 主線中的責任邊界，避免再次漂移成金額確認層。


## 1. 文件定位

本文件用來把 `Accounting Center` 與 `quote-cost / financial detail` 的責任邊界正式寫死，並對齊 `month close v1` 的正確定位。

本文件目的：
- 明確規定金額確認的唯一主線在哪裡
- 明確規定 `Accounting Center` 只承接已成立金額
- 避免後續把 `month close` 或 `Accounting Center` 寫成 confirmation / approval layer

---

## 2. 本文件的核心結論

> **`quote-cost / financial detail` 是所有專案金額確認的唯一主線；`Accounting Center` 不做任何金額確認，只承接已成立金額做月份聚合、追蹤與查閱。**

---

## 3. 正式責任邊界

### 3.1 quote-cost / financial detail
正式定位：

> **金額成立與確認主線**

承接：
- 專案總金額的成立
- 收款真值的主入口承接
- 相關 financial detail 的正式確認語意

正式原則：
- 哪些金額算有效
- 哪些金額算成立
- 哪些結果應承接到其他下游模組

都以 `quote-cost / financial detail` 為準。

### 3.2 Accounting Center
正式定位：

> **已成立金額的月份聚合、追蹤與查閱層**

承接：
- 活動日期屬於某月份的專案集合
- 已成立的總金額
- 已成立的已收款 / 未收款結果
- summary / tracking / drill-down

不承接：
- 金額確認
- 第二套 approval flow
- 第二套 financial confirmation
- 重新認定哪些數字有效

---

## 4. month close 的正式定位

依本文件校正後，`month close v1` 的正式定位應理解為：

> **Accounting Center 中的 month close，只是月份視角的 aggregation / readback layer，不是 confirmation flow。**

也就是：
- 承接活動日期屬於該月份的專案集合
- 顯示總金額 / 已收款 / 未收款
- 導回既有單案 financial detail

不代表：
- 在 `Accounting Center` 裡確認某月金額
- 在 `Accounting Center` 裡做另一套關帳確認

---

## 5. UI 承接規則

本文件沿用 `MD82` 已拍板規則：

> **直接沿用既有已確認 UI，不新增欄位、不重做 UI。**

也就是：
- 摘要區：總金額 / 已收款 / 未收款
- 列表欄位：專案名稱 / 活動日期 / 總金額 / 已收款 / 未收款 / 查看詳情
- `查看詳情` 維持導向 `/quote-costs/[id]`

正式原則：
- `Accounting Center` 只承接既有欄位語意
- 不因 `month close` 新主線而發明新的 confirmation UI

---

## 6. 對後續 spec 命名的校正

依本文件，後續若要續接這條主線，應避免把它命名成容易誤導為 confirmation 的規格。

較準確的命名方向應為：
- `month close aggregation`
- `month close readback`
- `monthly accounting overview`

而不應先把主線理解成：
- accounting close confirmation
- accounting approval flow
- month close confirmation system

---

## 7. 一句話總結

> `Accounting Center` 在 `month close` 主線中的正式責任，不是確認金額，而是承接 `quote-cost / financial detail` 已成立的金額結果，做月份視角的聚合、追蹤與查閱；因此後續不得再把 `Accounting Center` 或 `month close` 寫成另一套金額確認 / approval / close confirmation layer。