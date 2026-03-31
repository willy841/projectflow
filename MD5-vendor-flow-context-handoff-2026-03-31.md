# MD5 - Vendor Flow 討論交接摘要（2026-03-31）

> 目的：在 context 接近飽和前，將本輪 Vendor Flow 討論重點打包，供新串直接續接。

## A. 本輪已拍板的核心規則

### 1. 彙整單歸組單位
- **同專案 + 同廠商**
- 不同專案不可混成同一張發包彙整單

### 2. 單筆 vendor assignment 的廠商規則
- **單筆 vendor assignment = 單一廠商**
- 不做一筆 assignment 對多廠商

### 3. 回覆機制
- **回覆以整包為主、單項為輔**
- package-level reply 是主體
- assignment-level reply 是輔助
- 回覆維持單層平面列表，不做樹狀

### 4. 正式發包確認
- **正式發包發生在整包彙整單（Vendor Package）**
- 不掛在單筆 vendor assignment 層

---

## B. 目前已形成的產品架構方向

### 1. Project
專案最上層。

### 2. Execution Item
專案底下的執行項目。
用途：
- 內部工作節點
- 作為 assignment 的來源掛點

### 3. Vendor Assignment
內部逐項管理單位。
用途：
- 針對 execution item 的單項廠商交辦
- 管理項目、規格、需求說明、發包預算、備註、狀態等
- 每筆 assignment 只對應一個廠商

### 4. Vendor Package
對外正式發包單位。
用途：
- 將「同專案 + 同廠商」的多筆 vendor assignment 彙整起來
- 作為對外可複製 / 可匯出的發包內容主體
- 作為正式發包確認的主體
- 作為 package-level 回覆主體

---

## C. 已明確排除的錯誤方向

### 1. 不把單筆 vendor assignment 直接當作對外正式發包單
原因：
- 真實情境是同一廠商常會承接同專案下多個項目
- 對外應整包發，而不是逐項一筆一筆發

### 2. 不做樹狀 reply
原因：
- 目前邏輯不是討論串，而是紀錄型回覆
- 應維持單層平面列表

### 3. 不把「金額確認」只當成中性按鈕
原因：
- 其實代表正式發包成立
- 未來命名與狀態需反映這個語意

---

## D. 建議的頁面層級

### Page 1：專案詳細頁
- 查看 project 全貌
- 查看 execution items
- 從 item 發起 vendor assignment

### Page 2：單筆 Vendor Assignment 頁
- 內部逐項管理頁
- 編輯某一筆 vendor assignment
- 看單項補充資訊 / 輔助回覆
- 不承擔正式發包主責

### Page 3：Vendor Package 頁
- 同專案 + 同廠商的整包發包頁
- 顯示整包所有項目
- 顯示 package-level replies
- 提供複製 / 匯出對外內容
- 執行正式發包確認

---

## E. 建議的責任邊界

### Vendor Assignment 負責
- 單項內容
- 單項規格
- 單項預算
- 單項備註
- 單項輔助回覆

### Vendor Package 負責
- 對外發包彙整
- 同廠商多項整併
- package 主回覆
- 正式發包確認
- package 狀態管理

---

## F. 下一步文件

新串應直接往下做：

# Vendor Flow Spec v1

建議內容：
1. 名詞定義
2. 單位關係
3. 頁面關係
4. Assignment 與 Package 的資料責任
5. Reply 掛點規則
6. 狀態機設計
7. 正式發包流程
8. 未來 UI / 工程交辦應如何引用

---

## G. 新串可直接引用的超短摘要

Vendor 模組目前已定：
- `Vendor Assignment` = 內部逐項單位
- `Vendor Package` = 同專案 + 同廠商的對外發包彙整單
- 回覆以 package 為主、assignment 為輔
- 正式發包確認發生在 package 層
- 不做樹狀回覆

下一步直接寫 **Vendor Flow Spec v1**。
