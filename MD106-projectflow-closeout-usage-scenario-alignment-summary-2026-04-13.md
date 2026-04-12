# MD106 — projectflow closeout usage scenario alignment summary (2026-04-13)

> Status: ACTIVE
> Note: 本文件用來整理目前已核對過的 `projectflow` 結案紀錄（closeout）使用情境、功能責任與資料承接判斷，供後續逐區盤點與回查使用。


## 1. 文件定位

本文件用來把目前已核對過的 closeout / 結案紀錄使用情境，整理成一份結構化摘要。

本文件目的：
- 固定目前對 closeout archive / retained view 的產品共識
- 區分哪些屬於 retained summary / retained document layer，哪些 active operation 區塊應從 closeout 拔掉
- 作為後續繼續盤點 Accounting Center 與 closeout source/read-model 優化時的基準文件

---

## 2. Closeout List：檢索能力

### 使用情境
進入 `結案紀錄` 的 list 頁後，需要具備：
1. `選擇年份`
2. `搜尋框`
3. `用日期做排序`

### 判斷
- 功能邏輯：正確
- Closeout list 本質上是 archive / retained record viewer，因此檢索能力（篩年、搜尋、排序）是必要能力

---

## 3. Closeout List：欄位定義

### 基本資訊欄位
1. 活動標題
2. 活動日期
3. 客戶名稱

### 財務數據欄位
1. 對外報價總額
2. 專案成本
   - 包含：
     - 設計
     - 備品
     - 廠商
     - 人工
   - 四項加總即為專案成本
3. 毛利
   - 由對外報價總額減掉專案成本計算得出

### 明確不用顯示的欄位
- `留存備註` 不需要顯示
- `已完成` / `已結案` 標記都不需要顯示

### 判斷
- 功能邏輯：正確
- 能進入結案紀錄的資料，本身就已是在報價成本中完成：
  - 對帳
  - 收款
  - 結案
- 因此 `已完成` / `已結案` 不是此頁要再次傳達的狀態，而是冗餘資訊

---

## 4. Closeout List：目前風險

### 使用者反映的現況問題
- 結案紀錄 list 在進入讀取時很慢
- 有時候甚至會 timeout

### 判斷
- 這不是單純 UI 小問題
- 應視為 closeout list read-model / query / source aggregation 的正式風險
- 可能意味著 closeout list 目前仍存在：
  - 過多即時計算 / merge
  - query source 過散
  - 抓取過多不必要 detail 級資料
  - adapter / fallback 重組成本過高

---

## 5. Closeout Detail：頁面角色

### 使用情境
進入結案紀錄 detail 後，這頁的角色應是：
> `檔案留存 / retained record`

### 判斷
- 功能邏輯：正確
- Closeout detail 不應再承擔 active financial operation page 的責任，而應是 archive readback / retained presenter view

---

## 6. Closeout Detail：保留的基本資訊

### 使用情境
以下資訊都需要保留：
1. 活動標題
2. 活動資訊
3. 地點
4. 日期
5. 進場時間
6. 客戶資訊

### 判斷
- 功能邏輯：正確
- Closeout detail 不只是 financial archive，同時也是 project context archive

---

## 7. Closeout Detail：可拿掉的流程 / 狀態資訊

### 使用情境
以下內容都可拿掉：
- 結案流程相關狀態
- 最終結果確認的狀態

### 判斷
- 功能邏輯：正確
- 能進入 closeout detail，本身就代表流程已完成，因此 retained view 不需要重複顯示這些流程狀態

---

## 8. Closeout Detail：保留的 financial summary

### 使用情境
Closeout detail 應保留：
1. 對外報價總額
2. 專案成本
3. 毛利

### 明確不用顯示的內容
- 不需要顯示 `收款管理`
- 不需要顯示 `對外報價單` 的整體明細

### 判斷
- 功能邏輯：正確
- Closeout detail 應保留收斂後的 financial summary，而不應保留 active management / import 明細層

---

## 9. Closeout Detail：成本管理（retained tabs）

### 使用情境
成本管理仍應保留四個 Tab：
1. `設計`
2. `備品`
3. `廠商`
4. `人工`

這些 Tab 底下應顯示：
- 最終文件層所產生的項目
- 且 `不可被編輯`

### 判斷
- 功能邏輯：正確
- Closeout detail 的成本管理不是再次編輯或確認流程，而是 retained document-layer readback

---

## 10. Closeout 總結

### 目前已清楚且與正式架構方向吻合的部分
1. Closeout list 是 archive / retained record viewer
2. Closeout list 需具備：年份篩選、搜尋框、日期排序
3. Closeout list 欄位應聚焦：活動標題 / 活動日期 / 客戶名稱 / 對外報價總額 / 專案成本 / 毛利
4. `留存備註`、`已完成`、`已結案` 這些冗餘欄位 / 標記不需要顯示
5. Closeout detail 應是 retained archive 頁
6. Closeout detail 應保留完整 project context
7. Closeout detail 應保留 final financial summary
8. Closeout detail 不應保留收款管理、報價單明細、流程狀態等 active operation 區塊
9. Closeout detail 成本管理應以四個 read-only retained tabs 承接最終文件層項目

### 目前最值得處理 / 驗證的部分
1. closeout list 載入過慢 / timeout 的 read-model / query 風險
2. closeout list 是否仍抓過多 detail 級資料或做過多即時計算
3. closeout detail 是否已完全從 active quote-cost detail skeleton 脫鉤
4. 四個成本 tab 是否 truly 讀 retained final document-layer items
5. 是否仍有收款管理 / quotation detail / status badges 等 active-operation UI 殘留

---

## 11. 一句話總結

> 目前已核對的 `projectflow` closeout / 結案紀錄使用情境整體是清楚且與正式架構方向吻合的：Closeout list 應作為 archive / retained record viewer，具備篩年、搜尋與排序能力，並只顯示專案識別與最終 financial summary；Closeout detail 則應作為 retained archive 頁，保留完整 project context、對外報價總額 / 專案成本 / 毛利，以及四個 read-only 的成本 retained tabs，而不再保留收款管理、報價明細、流程狀態或冗餘標記。當前最需要處理的風險是 closeout list 載入過慢 / timeout，以及整個 closeout retained read-model 是否已完全脫離 active quote-cost 操作語意。