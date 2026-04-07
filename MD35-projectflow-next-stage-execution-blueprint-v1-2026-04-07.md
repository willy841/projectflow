# MD35 - projectflow 下階段執行藍圖 v1（2026-04-07）

> 目的：把目前 `projectflow` 的整體盤點，正式轉成下一階段可執行的主線藍圖。
>
> 本檔承接：
> - `MD28-projectflow-financial-reconciliation-closeout-spec-2026-04-07.md`
> - `MD31-projectflow-closeout-record-list-detail-spec-2026-04-07.md`
> - `MD34-projectflow-system-progress-audit-and-next-stage-map-2026-04-07.md`
>
> 本檔不是單純盤點，而是：
> **供後續 CPO / CTO / 前端設計師直接派工與排 phase 的執行藍圖。**

---

# 1. 下階段總目標

目前 `projectflow` 的上游骨架已站穩：
- Project Master 已可正式建立 / 編輯 / 刪除
- `MD29 upstream phase 1` 已驗收通過
- execution upstream 已可正式交辦三線

因此下階段主線不再是補上游骨架，而是：

> **把 Financial / Accounting / Closeout 做成正式資料閉環，讓專案可以從「執行中」自然走到「財務收斂」再到「已結案歷史庫」。**

一句話定義下階段目標：

> **完成 project → financial reconciliation → closeout archive 的正式下游閉環。**

---

# 2. 下階段主線範圍

下階段聚焦三個核心 domain：

1. **Accounting Center（帳務中心）**
2. **Financial Detail / Reconciliation（專案財務收斂）**
3. **Closeout Record / Archive（結案紀錄）**

本輪不再把主力放在：
- Project Master 小修小補
- upstream dispatch 補洞
- Vendor Flow 重構
- 大規模 UI 全局重排

這些不屬於本輪主戰場。

---

# 3. 下階段正式產品目標

## 3.1 要完成的核心能力

### A. 專案財務收斂
每個專案應能在 Financial Detail 中明確完成：
- 設計對帳
- 備品對帳
- 廠商對帳
- 定金收款紀錄
- 尾款收款紀錄
- 結案條件判斷

### B. 帳務中心
系統應有一個正式「帳務中心」承接：
- 本月已收款
- 本月未收款
- 收款狀態
- 專案級帳務摘要
- 進行中專案的帳務管理入口

### C. 結案紀錄
一旦專案滿足結案條件：
- 可正式標記結案
- 系統將資料承接到 `Closeout Record`
- 結案資料成為唯讀 archive

---

# 4. 下階段不做什麼

這輪不應主動擴張到以下範圍：

1. 不做全域大重構
2. 不重做 Project Detail 主版型
3. 不重開 Vendor Flow 主架構
4. 不先做完整 ERP / 財務系統級複雜功能
5. 不先做歷史版本管理
6. 不先做複雜權限系統
7. 不先做軟刪除 / 回收桶 / 審批流
8. 不先做所有頁面全面 DB 清洗後才開始帳務中心

正式原則：
> **先完成下游正式閉環，不做超前型系統膨脹。**

---

# 5. 模組範圍定義

## 5.1 Accounting Center

### 角色定位
> 帳務中心是進行中專案的帳務管理主入口。

### 應承接
- 本月已收款
- 本月未收款
- 專案收款狀態
- 定金 / 尾款進度
- 進入 Financial Detail 的導流

### 不應承接
- execution 任務操作
- closeout archive 歷史查閱主體
- project master 編輯本體

---

## 5.2 Financial Detail

### 角色定位
> Financial Detail 是單專案的財務收斂與結案前工作台。

### 應承接
- 三區塊對帳：設計 / 備品 / 廠商
- 定金 / 尾款資訊
- 結案條件判斷
- 結案動作

### 不應承接
- 歷史 archive 查閱主體
- execution tree 深操作
- project detail 基本資料編輯主體

---

## 5.3 Closeout Record

### 角色定位
> Closeout Record 是已結案專案的唯讀歷史紀錄庫。

### 應承接
- 年份篩選 list
- 專案為主體的 closeout list
- 唯讀 detail
- 活動資訊
- 三條線文件結果
- 最終報價 / 實際成本

### 不應承接
- 再次編輯
- 對帳操作
- 收款操作
- 任務發布與執行操作

---

# 6. 建議實作 phase 順序

下階段建議拆成四個 phase。

---

## Phase 1：Financial Detail 正式收斂

### 目標
先把單專案財務收斂工作台做完整。

### 主要工作
1. 補三區塊對帳狀態
   - 設計
   - 備品
   - 廠商
2. 補收款欄位
   - 是否已收定金
   - 定金已收金額
   - 是否已收尾款
   - 尾款剩餘金額
3. 補結案條件判斷
4. 在專案總覽區塊補結案按鈕
5. 定義結案前 disabled / 可按條件

### 完成定義
- 使用者可在單專案內完整看懂：
  - 哪三區已對帳
  - 定金 / 尾款狀態
  - 是否符合結案條件
- 未符合條件前不可結案
- 符合條件後才可結案

---

## Phase 2：Accounting Center 落地

### 目標
建立進行中專案的正式帳務中心。

### 主要工作
1. 建立帳務中心列表主體
2. 收斂首頁與帳務中心的角色關係
3. 顯示：
   - 本月已收
   - 本月未收
   - 專案級收款狀態
4. 導流到單專案 financial detail

### 完成定義
- 帳務中心不再只是 placeholder route
- 使用者可從帳務中心看見哪些案子還在收款 / 對帳 / 未結案
- 首頁只留摘要，不與帳務中心重複當主體

---

## Phase 3：Closeout Record List / Detail 落地

### 目標
建立正式唯讀歷史紀錄庫。

### 主要工作
1. 建立 closeout list
   - 以 project 為主體
   - 年份篩選
   - 顯示專案名稱 / 客戶 / 活動日期 / 報價 / 實際成本
2. 建立 closeout detail
   - 活動資訊
   - 三條線文件區列表記錄
   - 最終報價
   - 最終實際成本
3. 明確做成唯讀頁

### 完成定義
- `closeout` 不再只是頁殼
- 已結案專案有正式 archive list / detail
- detail 不可編輯

---

## Phase 4：正式交棒閉環與一致性回查

### 目標
把 project → financial → closeout 的交棒收斂成穩定規則。

### 主要工作
1. 結案動作資料承接
2. closeout 資料來源收斂
3. DB-first 一致性回查
4. 補必要 route / adapter / fallback 清理

### 完成定義
- 專案從進行中走到結案後，整條路徑一致
- 不再依賴多套平行資料解釋系統狀態

---

# 7. DB / API / UI 分工建議

## 7.1 給 CTO 的工程交辦

### A. DB / schema 層
需要先補或確認：
1. financial reconciliation 狀態欄位
2. deposit / final payment 欄位
3. closeout record 承接結構
4. project 結案狀態與 closeout 實體的關係

### B. API / repository 層
需要補：
1. financial detail 更新 API
2. reconciliation / payment update API
3. closeout create / list / detail 承接 API
4. accounting center list API

### C. adapter / read model 層
需要收斂：
1. financial detail 顯示來源
2. accounting center 顯示來源
3. closeout list/detail 顯示來源
4. 避免 mock / DB 雙路平行顯示

---

## 7.2 給前端設計師的 UI / UX 交辦

### A. Accounting Center
- 明確做成管理頁，不是摘要頁
- 首屏先讓人知道「哪些案子還沒收完 / 還沒對完 / 還沒結案」
- 首頁與帳務中心的角色必須清楚分開

### B. Financial Detail
- 三區塊對帳狀態要非常一眼可懂
- 結案按鈕要有明確 disabled / enabled 視覺
- 收款區要避免像零散表單，應像正式財務區塊

### C. Closeout Record
- list 要像 archive index
- detail 要像唯讀留存頁
- 不可有進行中工作台感
- 活動資訊沿用 `Project Detail` 已驗過的排版語言

---

# 8. 驗收標準

## 8.1 Financial Detail 驗收
- 三區塊可獨立對帳
- 定金 / 尾款欄位可明確記錄
- 未達條件不可結案
- 達條件才可結案

## 8.2 Accounting Center 驗收
- 可看本月已收 / 未收
- 可看進行中專案收款狀態
- 可導流到 financial detail
- 不與首頁摘要重複擔任主體

## 8.3 Closeout Record 驗收
- list 以 project 為主體
- 有年份篩選
- detail 唯讀
- 可回看活動資訊、三條線文件結果、報價與實際成本

## 8.4 系統閉環驗收
- 專案可由進行中走到已結案
- 已結案資料可正式承接到 closeout
- closeout 與進行中狀態清楚分離

---

# 9. 目前最佳執行策略

如果從管理與工程風險角度判斷，下階段最穩的策略是：

> **先把 Financial Detail 的單案結案條件與對帳規則做完整，再做 Accounting Center 列表，最後做 Closeout archive。**

原因：
- closeout 不該先做成空 archive
- 先把單案 closeout 條件做完整，archive 才有正確來源
- 帳務中心則是進行中專案的管理入口，應承接 financial detail 的明確狀態

也就是推薦順序：
1. Financial Detail
2. Accounting Center
3. Closeout Record
4. 最後做全域一致性清理

---

# 10. 一句話總結

> `projectflow` 的下階段主線，不再是補上游骨架，而是把 `Financial Detail`、`Accounting Center`、`Closeout Record` 做成一條正式資料閉環，讓專案能從執行中自然走到對帳完成、款項收齊、正式結案，並進入唯讀歷史紀錄庫。
