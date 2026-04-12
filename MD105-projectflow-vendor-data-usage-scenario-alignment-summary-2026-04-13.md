# MD105 — projectflow vendor data usage scenario alignment summary (2026-04-13)

> Status: ACTIVE
> Note: 本文件用來整理目前已核對過的 `projectflow` 廠商資料（Vendor Data）使用情境、功能責任與資料承接判斷，供後續逐區盤點與回查使用。


## 1. 文件定位

本文件用來把目前已核對過的 Vendor Data 使用情境，整理成一份結構化摘要。

本文件目的：
- 固定目前對 Vendor Data 使用情境的共識
- 明確指出 Vendor Data 是目前需要特別嚴格驗證 same-source closure 的重點區之一
- 作為後續繼續盤點付款 lifecycle、closeout 與 Accounting Center 關聯時的基準文件

---

## 2. Vendor Data List 頁：卡片式廠商清單

### 使用情境
- 進入廠商資料後，先看到 `List`
- 呈現方式是 `卡片式`

### List 頁面的功能
1. `管理廠商`
   - 可新增廠商
   - 可刪除廠商
2. `廠商資訊顯示`
   - 廠商名稱
   - 廠商工種
   - 該廠商目前的未付款總額
3. 頁面級 `未付款總額`
   - 顯示目前所有廠商的未付款總共有多少錢

### 判斷
- 功能邏輯：正確
- 與前面任務發布必須從 vendor master 選擇，以及報價成本線在對帳後成立 vendor unpaid 的主線一致
- Vendor Data list 同時扮演：
  - vendor master list
  - vendor payable summary board

### 補充風險說明
- `新增廠商`：合理且必要
- `刪除廠商`：屬敏感操作，後續需更嚴格定義是否允許刪除已有任務 / payable / 關聯紀錄的 vendor

---

## 3. Vendor Detail：廠商資訊（可編輯）

### 使用情境
進入 vendor detail 後，第一區塊是 `廠商資訊`，且要可編輯。

### 可編輯欄位
1. 聯絡人
2. 電話
3. Email
4. Line
5. 地址
6. 匯款銀行
7. 匯款戶名
8. 匯款帳號

### 判斷
- 功能邏輯：正確
- Vendor Data detail 不只是 payable summary，也同時是 vendor master / vendor profile 的維護主場

---

## 4. 勞報資訊 Tab

### 使用情境
在廠商資訊區塊中，需要有一個 Tab，可切換為 `勞報資訊`。

### 勞報資訊欄位
1. 姓名
2. 身分證字號
3. 出生年月日（民國）
4. 參加工會

### 判斷
- 功能邏輯：正確
- 代表 vendor detail 可同時承接個人 / 勞報型合作對象資料
- 與 vendor 主體並存管理是合理的

---

## 5. 未付款專案

### 使用情境
`未付款專案` 區塊只顯示未付款的專案，帶出：
1. 專案名稱
2. 專案時間
3. 未付金額

### 金額來源
- 這裡的未付金額，來自同一 vendor 在該專案下的：
  - 設計
  - 備品
  - 廠商
  三條線金額加總
- **不包含人工**

### 判斷
- 功能邏輯：正確
- 與報價成本線在 `已對帳` 後成立 vendor unpaid 的邏輯完全一致
- Vendor Data detail 在這裡承接的是 vendor-grouped / project-scoped unpaid readback

---

## 6. 已付款標示

### 使用情境
在 `未付款專案` 區塊中，需要具備可勾選、標示 `已付款` 的功能。

### 判斷
- 功能邏輯：正確
- 與 payable lifecycle 一致
- `已對帳` 與 `已付款` 是不同責任：
  - `已對帳` = 讓 vendor unpaid 正式成立
  - `已付款` = 讓 vendor unpaid 結束 / 轉入歷史

---

## 7. 往來紀錄：未結帳 / 過往紀錄

### 使用情境
`往來紀錄` 區塊採 Tab 方式切換：
1. `未結帳`
   - 所有尚未付款的項目
   - 也就是還沒被標示為 `已付款` 的項目
2. `過往紀錄`
   - 已標示為 `已結帳` / 已付款的項目
   - 由未結帳移過來

### 判斷
- 功能邏輯：正確
- Vendor Data detail 在這裡同時扮演 vendor payment relationship ledger / history viewer 的角色

### 命名提醒
- 目前語意上同時出現：
  - `已付款`
  - `已結帳`
  - `未結帳`
- 後續 UI / 資料狀態命名建議做 wording 統一，避免混亂

---

## 8. 往來紀錄欄位與 inline 展開

### 使用情境
`往來紀錄` 中每筆資料，以以下欄位列表呈現：
- 專案標題
- 專案活動時間

並且支援 `Inline 展開`，用來顯示：
- 該廠商在這個專案下，我們具體合作了哪些項目
- 包含不論在：
  - 設計
  - 備品
  - 廠商
  端所列出的任務標題與需求內容

### 補充規則
- Inline 展開出來的項目，都是 `文件層` 的項目
- 在這裡都 `不能被編輯`

### 判斷
- 功能邏輯：正確
- Vendor Data 的往來紀錄展開內容，應明確視為 read-only 文件層 readback，而不是編輯來源層

---

## 9. 往來紀錄的檢索能力

### 使用情境
`往來紀錄` 區塊除了 Tab 與 Inline 展開外，還需要：
1. `時間排序功能`
2. `搜尋框功能`

### 判斷
- 功能邏輯：正確
- 這代表往來紀錄區的核心能力應是：
  - 切換
  - 搜尋
  - 排序
  - 展開查看
- 而不是編輯

---

## 10. Vendor Data 總結

### 目前已清楚且與正式架構方向吻合的部分
1. Vendor Data list 是卡片式 vendor master / vendor payable summary 入口
2. vendor detail 可編輯 vendor profile
3. vendor detail 需有勞報資訊 Tab
4. 未付款專案承接同 vendor 在單專案下的設計 / 備品 / 廠商未付款加總（不含人工）
5. `已付款` 是 unpaid -> history 的狀態切換
6. 往來紀錄應分為 `未結帳` / `過往紀錄`
7. 往來紀錄每筆資料可 inline 展開查看具體合作項目與需求內容
8. Inline 展開內容屬於文件層 readback，且不可編輯
9. 往來紀錄需具備時間排序與搜尋框

### 目前最值得嚴格驗證 same-source closure 的部分
1. vendor profile 是否 truly same-source
2. 勞報資訊是否與 vendor 主體正確綁定
3. 未付款專案金額是否 truly 承接報價成本線對帳後成立的 vendor unpaid
4. `已付款` 是否真正改變 ledger 狀態，而不是只做 UI 勾選
5. `未結帳` / `過往紀錄` 是否 truly 由付款狀態分流
6. Inline 展開內容是否 truly 承接三條執行線的文件層項目，而不是用歷史 helper 拼湊
7. 排序與搜尋是否建於正式 read model / 查詢層，而非前端臨時拼接結果
8. 刪除廠商是否需要被限制於沒有關聯紀錄的 vendor

---

## 11. 一句話總結

> 目前已核對的 `projectflow` Vendor Data 使用情境整體是清楚且合理的：List 以卡片式呈現 vendor master 與未付款摘要，detail 則同時承接 vendor profile、勞報資訊、未付款專案、付款狀態切換，以及往來紀錄的 read-only 文件層回看；這整條邏輯與前面任務發布、報價成本對帳、vendor unpaid 成立與付款歷史切換的主線是吻合的。不過，Vendor Data 也正是目前最需要嚴格驗證 same-source closure 的區塊之一，尤其是 vendor master、vendor unpaid、付款狀態切換、往來紀錄與文件層展開內容之間是否 truly 同源。