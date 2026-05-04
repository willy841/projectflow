# 專案基本資料欄位

## 欄位：專案負責人
- 你在哪裡改：`新增專案`、`編輯專案`
- 寫到哪裡：`projects.owner`
- 哪裡會變：
  - `Project Detail` 編輯區回填
  - 首頁 `recent projects` 的 `負責人`
- 成立條件：按儲存 / 建立成功

## 欄位：客戶名稱
- 你在哪裡改：`新增專案`、`編輯專案`
- 寫到哪裡：`projects.client_name`
- 哪裡會變：
  - `Projects list`
  - `Project Detail`
  - 首頁 `recent projects`
  - 財務 / 報價相關專案識別區
- 成立條件：按儲存 / 建立成功

## 欄位：活動日期
- 你在哪裡改：`新增專案`、`編輯專案`
- 寫到哪裡：`projects.event_date`
- 哪裡會變：
  - `Projects list`
  - `Project Detail`
  - 首頁 `recent projects`
  - Quote / Closeout / Vendor detail 裡的專案日期顯示
- 成立條件：按儲存 / 建立成功

## 欄位：聯絡資料
- 你在哪裡改：`新增專案`、`編輯專案`
- 寫到哪裡：
  - `projects.contact_name`
  - `projects.contact_phone`
  - `projects.contact_email`
  - `projects.contact_line`
- 哪裡會變：
  - `Project Detail` 編輯區回填
  - 專案相關識別區
- 成立條件：按儲存 / 建立成功

## 欄位：執行項目（Execution items）
- 你在哪裡改：`Project Detail`
- 寫到哪裡：`project_execution_items`
- 哪裡會變：
  - `Project Detail` 本頁內容
  - 後續 design / procurement / vendor 派工來源
- 成立條件：新增 / 編輯 / 匯入 .xlsx 成功
