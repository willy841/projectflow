# Vendor Flow Spec v1

_Date: 2026-03-31_
_Mode: Product Architect / CPO Partner_
_Status: Draft v1_

## 1. 目標

建立 Vendor Flow 的正式產品骨架，明確區分：

- 內部逐項管理單位
- 對外正式發包單位
- 回覆資訊應掛在哪一層
- 正式發包成立發生在哪一層
- 各頁面之間的責任切分
- 後續 UI、資料模型與工程實作應遵守的邏輯

本 spec 的目的是先把 vendor 模組的**核心語意與流程定義清楚**，避免後續 UI、命名、狀態與資料結構彼此打架。

---

## 2. 使用情境

### 情境 A：同一專案有多個執行項目，且都會交給同一廠商

例如同一個 project 底下有：
- 主視覺設計
- 社群 KV 延伸
- 輸出物尺寸調整

這三項都可能掛在不同 execution item，但最後實際對外會整包交給同一個 vendor。

=> 系統不能把「單筆 assignment」誤當成「正式對外發包單」。

### 情境 B：內部需要逐項管理，但對外需要整包溝通

內部管理需要知道：
- 每一項的需求是什麼
- 每一項的預算是什麼
- 每一項是否有補充說明
- 每一項是否被 vendor 回應或修正

但對外對 vendor 的溝通主體常常是：
- 同專案 + 同廠商的一整包內容

=> 內外單位不能混為一談。

### 情境 C：廠商回覆既可能是整包層級，也可能是單項補充

例如 vendor 可能回：
- 「這整包可以接，總時程 7 天」→ package-level
- 「其中 banner 動畫版本需要另外加價」→ assignment-level

=> 回覆需要允許兩層，但主體必須清楚。

---

## 3. 名詞定義

### 3.1 Project
專案最上層單位。

用途：
- 承載整個案件的範圍
- 作為 execution items、vendor assignments、vendor packages 的共同上層

### 3.2 Execution Item
專案底下的執行項目。

用途：
- 代表內部執行切分的工作節點
- 作為 vendor assignment 的來源掛點
- 幫助團隊理解某項外包需求源自哪個工作項目

注意：
- Execution Item 不是對外發包單
- Execution Item 也不是 vendor 溝通主體

### 3.3 Vendor Assignment
Vendor Assignment 是**內部逐項管理單位**。

用途：
- 掛在某個 execution item 底下
- 管理單一項外包需求
- 記錄單項規格、需求說明、預算、備註、附件、狀態
- 作為 package 中某個 line item 的來源

核心定義：
- 一筆 vendor assignment 對應**一個項目 + 一個主廠商**
- 不做一筆 assignment 對多廠商

不應承擔的責任：
- 不作為正式對外發包成立的主體
- 不作為整包對外溝通的唯一主體

### 3.4 Vendor Package
Vendor Package 是**同專案 + 同廠商的對外發包彙整單位**。

用途：
- 將多筆 vendor assignment 彙整成對外正式溝通包
- 作為複製 / 匯出 / 發送給 vendor 的主要內容容器
- 作為正式發包確認的主體
- 作為 package-level reply 的主體
- 作為 package 狀態管理主體

核心定義：
- 一個 vendor package 只能包含：**同 project + 同 vendor** 的 assignments
- 不同 project 不可混包
- 不同 vendor 不可混包

### 3.5 Reply
Reply 是 vendor flow 中的回覆紀錄。

分兩種：
- Package Reply：整包層級回覆
- Assignment Reply：單項層級回覆

規則：
- reply 一律採**單層平面列表**
- 不做樹狀回覆
- 不做 reply-to-reply 的討論串結構
- 新回覆一律 append 新記錄

### 3.6 Formal Vendor Confirmation / 正式發包確認
代表此 package 已從「內部整理 / 議價 / 待確認」進入「正式成立的對外發包」狀態。

正式語意：
- 不是單純的金額確認按鈕
- 而是正式發包成立的產品事件

掛點：
- 發生在 **Vendor Package 層**
- 不掛在單筆 assignment 層

---

## 4. 單位關係

## 4.1 關係圖（概念）

Project
- has many Execution Items
- has many Vendor Packages

Execution Item
- has many Vendor Assignments

Vendor Assignment
- belongs to one Project
- belongs to one Execution Item
- belongs to one Vendor
- belongs to zero or one active Vendor Package（視建立時機而定）

Vendor Package
- belongs to one Project
- belongs to one Vendor
- has many Vendor Assignments
- has many Package Replies

Vendor Assignment
- has many Assignment Replies

## 4.2 歸組規則

Vendor Package 的歸組單位固定為：

- **同一 Project**
- **同一 Vendor**

也就是：
- 不同 project 的 assignment，不可進入同一 package
- 不同 vendor 的 assignment，不可進入同一 package

## 4.3 Assignment 與 Package 的父子關係語意

- Assignment 是 line item / item-level 工作單位
- Package 是外部溝通與正式成立單位
- Package 包含多筆 assignment，但 assignment 仍保有自己的內部狀態與細節欄位

---

## 5. 頁面關係

## 5.1 Project Detail Page

用途：
- 看 project 全貌
- 看 execution item 列表
- 看 vendor 工作分布
- 從 item 發起新的 vendor assignment
- 看到不同 vendor package 的概況

此頁應承擔：
- 專案層級 overview
- assignment 與 package 的入口

此頁不應承擔：
- 單項細節深度編輯
- 整包正式發包操作細節

## 5.2 Vendor Assignment Detail Page

用途：
- 編輯單筆 assignment
- 管理單項需求與規格
- 看單項備註、附件、預算與狀態
- 查看 / 新增 assignment-level replies
- 看這筆 assignment 屬於哪個 vendor package

此頁是：
- 內部逐項管理頁

此頁不是：
- 正式發包主頁
- 對外整包溝通主頁

## 5.3 Vendor Package Detail Page

用途：
- 顯示同專案 + 同廠商的整包內容
- 顯示 package 底下所有 assignments
- 顯示 package-level replies
- 提供複製 / 匯出 / 對外發送內容
- 執行正式發包確認
- 顯示 package 狀態機

此頁是：
- 對外發包主頁
- 正式發包成立主頁
- package-level 回覆主頁

---

## 6. Assignment 與 Package 的資料責任

## 6.1 Vendor Assignment 負責的資料

Vendor Assignment 應負責：
- source execution item
- 單項名稱
- 單項需求說明
- 單項規格 / deliverables
- 單項預算或預估成本
- 單項備註
- 單項附件
- 單項狀態
- 單項輔助回覆
- 所屬 vendor
- 所屬 package 參照

Vendor Assignment 的核心角色是：
**把一個 execution item 的外包需求，整理成可被彙整的單位。**

## 6.2 Vendor Package 負責的資料

Vendor Package 應負責：
- project
- vendor
- package title / code
- package 內包含哪些 assignments
- 對外發包用彙整內容
- 對外總預算 / 報價彙整視圖
- package-level notes
- package-level replies
- 正式發包確認資訊
- package 狀態
- package 發送 / 匯出 / 複製紀錄（若未來需要）

Vendor Package 的核心角色是：
**把多筆 assignment 轉成正式對外協作單位。**

---

## 7. Reply 掛點規則

## 7.1 基本原則

回覆機制採：
- **package-level 為主**
- **assignment-level 為輔**

理由：
- 真實對外溝通常以整包為主
- 但單項仍可能需要局部補充、加價、修規格、補附件

## 7.2 Package Reply 的適用情境

適合掛 package reply 的內容：
- 整包是否可接
- 整包總時程
- 整包整體報價
- 整包整體回覆
- 對整包的統一提問或說明
- 正式發包後的重要往返紀錄

## 7.3 Assignment Reply 的適用情境

適合掛 assignment reply 的內容：
- 某單項規格補充
- 某單項加價 / 減項說明
- 某單項附件補件
- 某單項技術限制或交付條件
- 某單項個別確認

## 7.4 Reply 結構規則

所有 replies 都遵守：
- 單層平面列表
- 依時間排序（建議 newest last，保持對話流）
- 不做 nested replies
- 不做 thread UI
- 不做 parent_reply_id 的討論模型（至少 v1 不做）

## 7.5 顯示優先順序

產品上應讓使用者感知：
- package reply 是主線
- assignment reply 是補充支線

因此 UI 上不應讓 assignment reply 看起來比 package reply 更像真正主對話。

---

## 8. 狀態機設計

以下先定義 v1 的產品狀態語意，供 UI 與工程共用。

## 8.1 Vendor Assignment 狀態機（建議 v1）

建議狀態：
1. `draft`
   - 內部草稿，內容未整理完成
2. `ready_for_packaging`
   - 單項內容已可納入 package
3. `packaged`
   - 已被納入某個 vendor package
4. `in_vendor_discussion`
   - 單項有補充往返，但整體主體仍在 package
5. `confirmed_under_package`
   - 已隨 package 正式發包成立
6. `done`
   - 該單項已完成交付
7. `cancelled`
   - 該單項取消

狀態語意重點：
- assignment 不獨立承擔正式發包
- assignment 的 confirmed 應明確表達：它是**隨 package 被確認**

## 8.2 Vendor Package 狀態機（建議 v1）

建議狀態：
1. `draft`
   - package 尚在組合中，內容可能調整
2. `ready_to_send`
   - package 內容已整理完，可對外送出 / 匯出
3. `sent`
   - 已送出給 vendor，等待回覆或確認
4. `in_discussion`
   - 已有來回溝通、議價、修正
5. `formally_confirmed`
   - 已正式發包成立
6. `in_progress`
   - vendor 已開始執行
7. `completed`
   - package 全部完成
8. `cancelled`
   - package 取消

## 8.3 關鍵狀態轉移

### Package
- `draft` → `ready_to_send`
- `ready_to_send` → `sent`
- `sent` → `in_discussion`
- `in_discussion` → `formally_confirmed`
- `formally_confirmed` → `in_progress`
- `in_progress` → `completed`
- 任一前中期狀態 → `cancelled`

### Assignment
- `draft` → `ready_for_packaging`
- `ready_for_packaging` → `packaged`
- `packaged` ↔ `in_vendor_discussion`
- `packaged` / `in_vendor_discussion` → `confirmed_under_package`
- `confirmed_under_package` → `done`
- 任一非 done 狀態 → `cancelled`

## 8.4 產品語意限制

- package 若未正式確認，assignment 不應顯示為正式發包完成
- package 一旦進入 `formally_confirmed`，其底下 assignment 應批次進入 `confirmed_under_package`
- assignment 若被移出 package，需重新校正狀態

---

## 9. 正式發包流程

## 9.1 原則

正式發包確認發生在 **Vendor Package**。

原因：
- 真實世界對外成立通常是整包成立
- 同一廠商會同時接多個項目
- 若把正式確認掛在 assignment 層，會讓整包與單項語意衝突

## 9.2 標準流程

### Step 1：建立 Assignment
由使用者在 execution item 底下建立一筆或多筆 vendor assignment。

### Step 2：指定 Vendor
每筆 assignment 指定單一主 vendor。

### Step 3：系統依同專案 + 同廠商歸組
系統將可被歸組的 assignments 集合為 package，或提示使用者加入既有 package / 建立新 package。

### Step 4：整理 Package
在 package 頁面整理：
- 整包內容
- 項目清單
- 對外說明
- 總價 / 報價呈現
- 附件 / 補充資訊

### Step 5：送出與往返
package 可進入：
- ready_to_send
- sent
- in_discussion

此階段 package reply 為主，assignment reply 為輔。

### Step 6：正式發包確認
當雙方確認價格 / 範圍 / 時程後，由 package 執行正式確認動作。

此動作應代表：
- package 狀態進入 `formally_confirmed`
- 底下 assignments 同步進入 `confirmed_under_package`
- 產品事件上應視為「正式發包成立」

### Step 7：執行與完工
後續再進入：
- in_progress
- completed

---

## 10. 不做什麼

v1 明確不做：

### 10.1 不做樹狀 reply
- 不做 nested comments
- 不做 thread 展開
- 不做討論串式 UI

### 10.2 不讓 assignment 成為正式發包主體
- assignment 可被確認為 package 底下已成立
- 但不是獨立正式發包主單

### 10.3 不允許跨 project 混包
- package 的 project 必須單一

### 10.4 不允許單筆 assignment 同時掛多 vendor
- v1 只允許單一主 vendor

### 10.5 不把「金額確認」當成中性表單操作
- 它是正式發包事件
- UI 命名應反映此語意

---

## 11. 給 CTO 的工程交辦

### 11.1 資料模型
請依此 spec 建立或修正以下核心模型：
- Project
- ExecutionItem
- VendorAssignment
- VendorPackage
- Reply（需區分 package-level / assignment-level 掛點）

### 11.2 關聯約束
必須保證：
- VendorPackage = one project + one vendor
- VendorAssignment = one execution item + one vendor
- package 只能收納同 project + 同 vendor assignments

### 11.3 狀態同步規則
需實作：
- package 正式確認時，底下 assignments 批次同步為 confirmed_under_package
- assignment 被加入 / 移出 package 時的狀態校正
- package 與 assignment 狀態不可互相矛盾

### 11.4 回覆模型
reply v1 請維持：
- flat list only
- package-level 與 assignment-level 分流
- 不做 nested reply schema

### 11.5 頁面責任
請避免頁面混責：
- Assignment detail = 內部單項管理
- Package detail = 對外整包與正式確認

---

## 12. 給前端設計師的 UI / UX 交辦

### 12.1 層級感要非常清楚
UI 必須讓使用者一眼理解：
- Assignment 是 item-level
- Package 是 vendor-facing bundle-level

### 12.2 主次回覆要分清楚
- Package reply 要視覺上是主線
- Assignment reply 要視覺上是補充
- 不要讓兩者混成同一條對話流而失去語意

### 12.3 正式確認 CTA 命名
避免只叫：
- 金額確認

建議改成更接近：
- 正式發包
- 確認並正式發包
- Confirm Vendor Package

命名要讓使用者知道，這不是只是填表，而是狀態成立事件。

### 12.4 頁面導航
在 assignment 頁面應看得到：
- 所屬 package
- 快速跳轉 package

在 package 頁面應看得到：
- 所有 assignments 的摘要
- 能快速回到各 assignment

---

## 13. 驗收標準

以下條件成立，才算 Vendor Flow Spec v1 被正確落地：

### 13.1 名詞不混亂
- 團隊內外都清楚知道 assignment 與 package 的差異

### 13.2 單位關係不打架
- 不會出現跨專案混包
- 不會出現多廠商混包
- 不會出現 assignment 直接取代 package 成為正式發包主體

### 13.3 回覆邏輯一致
- package reply 為主
- assignment reply 為輔
- 全部為平面列表

### 13.4 狀態語意一致
- 正式發包成立只發生在 package 層
- assignment 的 confirmed 狀態必須是隨 package 繼承

### 13.5 UI 不誤導
- 使用者不會在 assignment 頁誤以為自己已完成正式發包
- 使用者能清楚理解 package 才是對外正式單位

---

## 14. 後續文件引用方式

後續所有 UI spec、工程 ticket、資料模型設計、頁面調整，若提到 vendor flow，應優先引用本文件中的以下定義：

1. Vendor Assignment = 內部逐項管理單位
2. Vendor Package = 同專案 + 同廠商的對外發包彙整單位
3. Reply = package-level 為主、assignment-level 為輔
4. 正式發包確認 = package-level 事件
5. Replies = flat list only

若未來有 v2，應以本文件為母規格增修，而不是重新發明名詞。