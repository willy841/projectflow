> ⚠️ **歷史回查文件 / 已非主入口**
>
> 本檔已被以下主幹文件大幅吸收或覆蓋：
> - `MD-MASTER-projectflow-system-source-of-truth.md`
> - `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
> - `MD15-projectflow-repo-audit-summary-v1-2026-04-04.md`
> - `MD16-projectflow-current-round-handoff-2026-04-04.md`
>
> **新續接請不要先讀本檔。**
> 正確順序是先讀：`MD16 -> MD15 -> MD14 -> MD-MASTER`。
> 本檔僅保留作為歷史脈絡 / 細節回查用途。

---

# MD7 - Vendor Flow 討論交接摘要（2026-04-01 深夜版）

> 目的：整理本輪 Vendor Flow 討論中已拍板的新產品規則，供下一串直接續接，不重講。

---

## A. 本輪討論定位

本輪不是工程實作，而是 **CPO 討論模式**。

目標是把目前專案管理系統中，`Vendor Flow` 的產品結構從原本的：
- Assignment
- Package

進一步釐清成完整可落地的三層流程與責任邊界。

---

## B. 目前已拍板的 Vendor Flow 新結構

### Layer 1：Vendor Assignment / Reply 層
定位：
- 內部逐項管理單位
- 在這一層做單項內容管理、回覆、廠商選擇
- 這一層的主要動作名稱維持叫：**發包**

產品語意：
- 使用者在回覆層選定廠商
- 按下 `發包`
- 該 assignment 才正式進入 package 主線

注意：
- assignment 並不是只要 ready_for_packaging 就自動進 package
- 必須經過「選廠商 + 按發包」這個明確操作節點

---

### Layer 2：Vendor Package 層
定位：
- 同專案 + 同廠商的唯一發包主容器
- 不是最終文件，而是整包需求整理與確認主線
- package 層的主要動作名稱改為：**需求確認**

產品語意：
- package 不是最終終點
- package 的責任是承接 assignment、彙整需求、整理整包內容
- package 在需求確認後，往下生成最終發包文件

---

### Layer 3：Final Outgoing Document / 最終發包文件
定位：
- package 需求確認後生成的**獨立物件**
- 這份文件才是對外正式成果 / 最終終點

產品語意：
- 它不是 package 的即時畫面投影
- 而是 package 某個時間點被生成出來的正式文件快照
- 必須可：
  - 匯出
  - 複製

---

## C. 智慧歸包（Q2）已拍板規則

### 核心規則
採 **自動歸包 / 智慧歸包**。

規則如下：
1. 使用者在 assignment reply 層選定廠商
2. 按下 `發包`
3. 系統依 **同專案 + 同廠商** 規則進行智慧歸包
4. 若該 project 下該 vendor 已存在 package，assignment 自動歸入該 package
5. 若不存在，系統自動建立新的 package

### 補充規則
- **同專案 + 同廠商不應存在多個 package**
- 不論後續同仁如何補回覆、往返、補件，只要還是同專案 + 同廠商，就應持續歸在同一 package
- assignment 歸包後，系統必須明確提示它已歸入哪個 package，並提供前往 package 的入口

### 重要產品結論
此規則幾乎等同於定義：

> **Project + Vendor = 唯一 package 主體**

這表示 package 不再是任意手動自由開單的集合，而是系統依據主規則自動維持的主容器。

---

## D. 命名規則已拍板

### Assignment / Reply 層動作
- 維持叫：**發包**

語意：
- 把單項交辦送給某廠商
- 並讓該 assignment 進入 package 主線

### Package 層動作
- 改叫：**需求確認**

語意：
- 確認整包需求內容
- 不是最終發包成立點
- 而是往下生成正式文件前的確認節點

---

## E. Package 之後的三個結果層

已拍板：

Package 的 `需求確認` 之後，**不是終點**，而是會往下同時產生三個結果：

### 1. 生成最終發包文件
- 會有一張表格 / 文件出來
- 詳列被發包的資訊
- 這份文件才是最終終點
- 並且要可匯出 / 可複製

### 2. 確認金額記錄到廠商資訊
- 這塊已記住，但本輪不展開討論
- 後續要在 vendor information / vendor profile 模組再談

### 3. 發包金額同步到報價單 / 成本
- 這表示 Vendor Flow 會與報價 / 成本模組連動
- 但目前也尚未深入展開欄位與資料流細節

---

## F. Final Outgoing Document 已拍板規則

### 1. 是否獨立物件
已拍板：**是，獨立物件**。

也就是：
- package 是整理主線
- document 是確認後生成的正式成果物
- 不是 package 的單純 export view 而已

### 2. 生成方式
已拍板：
- `需求確認` 完成後
- **還要再按一次按鈕** 才生成發包文件

也就是流程分兩步：
1. 需求確認
2. 生成發包文件

### 3. 生成後若 package 內容變更怎麼辦
已拍板：
- package 仍可修改
- 但只要 package 內容變更，**必須重新生成新版本文件**

這代表：
- package 是活的主線
- document 是靜態快照 / 版本化成果
- 一個 package 未來可對應多個 document 版本

---

## G. 最終發包文件目前已拍板的必要欄位（Q7 第一版）

目前已明確列出的必要內容：
1. **專案資訊**
2. **活動日期**
3. **進場時間**
4. **地點**
5. **項目明細**
6. **備註**

### 金額欄位是否放進文件
已拍板：**B = 不要**

也就是：
- 最終發包文件本身 **不直接顯示金額**
- 金額資料會走後續同步路徑：
  - 記錄到 vendor information
  - 同步到報價單 / 成本

### 重要產品含義
這表示最終發包文件的定位更偏向：
- **需求執行 / 發包內容文件**
而不是：
- 報價單 / 金額單

---

## H. 目前整條 Vendor Flow 的最新版本（可直接引用）

### Vendor Flow v3 / v4 概念版
1. 在 assignment / reply 層中整理單項內容
2. 在 reply 層選定廠商
3. 按下 `發包`
4. 系統以 **同專案 + 同廠商** 規則做智慧歸包
5. assignment 自動進入唯一 package 主線
6. 在 package 層進行 `需求確認`
7. 需求確認完成後，再由使用者按下 `生成發包文件`
8. 系統產生獨立的 final outgoing document
9. 該文件可匯出 / 複製，作為最終對外成果
10. 同時觸發後續資料同步：
   - 金額寫入廠商資訊（後續再談）
   - 金額同步至報價單 / 成本
11. 若 package 後續內容變更，需重新生成新版本文件

---

## I. 本輪尚未拍板 / 下一串建議優先接續的討論題目

### 1. Final Outgoing Document 的完整欄位結構
目前只有第一版必要欄位，還沒完整展開：
- 專案資訊具體包含什麼
- 項目明細列到什麼程度
- 備註要承接哪些來源
- 文件抬頭 / 文件編號 / 版本資訊要不要顯示

### 2. Package 與 Document 的狀態機
目前語意已經有了，但還沒正式做成狀態機：
- package 狀態有哪些
- document 狀態有哪些
- 需求確認後、生成文件後、重生版本後如何變化

### 3. Assignment 歸包後的狀態語意
尚未重新精修：
- assignment 在按下發包後狀態要叫什麼
- 進 package 後顯示什麼 badge 最自然

### 4. Vendor Information 模組如何承接已確認金額
這題已被明確提出，但本輪刻意延後

### 5. 報價單 / 成本模組如何承接 Vendor Flow 金額同步
這題也已被提出，但尚未展開

### 6. UI/UX 連動影響
現在命名與結構變了，後面會影響：
- reply page 的按鈕與提示
- package page 的主 CTA
- final outgoing document page / view 是否成為新頁面
- project detail 中 Vendor Flow 的層級呈現方式

---

## J. 新串可直接引用的超短摘要

Vendor Flow 現已改成三層：
- `Assignment / Reply`：在 reply 層選廠商後按 `發包`
- `Package`：同專案 + 同廠商唯一主容器，負責 `需求確認`
- `Final Outgoing Document`：需求確認後再手動生成的獨立文件，才是最終終點

已拍板：
- 智慧歸包 = 同專案 + 同廠商
- 不應有多個 package
- package 不是終點
- document 是獨立物件
- document 需可匯出 / 複製
- package 變更後需重生新版本文件
- 最終發包文件目前必要欄位：專案資訊、活動日期、進場時間、地點、項目明細、備註
- 最終發包文件 **不顯示金額**

下一步建議直接討論：
**Final Outgoing Document 的完整欄位結構與 Package / Document 狀態機。**
