# MD9 - Project Detail / Vendor 資訊架構交接摘要（2026-04-02 凌晨版）

> 目的：承接前一輪已完成的 Vendor Flow / Package / Final Outgoing Document 討論，進一步整理 Project Detail 中 Vendor 相關資訊的呈現方式，供後續產品、設計、工程續接。

---

## A. 本輪討論定位

本輪仍是 **CPO 討論模式**。

討論焦點不是欄位本身，而是：

> **在 Project Detail 裡，Vendor Flow 三層結構應該如何呈現，才不會讓使用者混淆。**

本輪最關鍵的發現，是補出一個前面尚未明確切開的盲點：

- 任務板 / assignment 流程裡出現的 vendor
- 與 assignment / reply 階段最後被正式選定、按下發包的 vendor

這兩者 **不是同一個語意層**。

---

## B. 本輪最重要的產品修正

### 1. 任務流中的 vendor，不等於正式發包 vendor

已明確釐清：
- 在 task / assignment 流程中，vendor 可能只是被傳遞、被關聯、被協作、被查看的對象
- 這個階段不等於正式發包決策
- 真正正式決定「要發給哪個 vendor」的節點，是在 **assignment / reply 層**
- 只有在 reply 階段正式選定 vendor 並按下 `發包` 後，才進入 package 主線

這個修正非常重要，因為它直接推翻了一種危險的資訊架構誤解：

> **不能把任務流程中曾經出現過的 vendor，直接視為正式 Vendor Flow 主線。**

---

### 2. Project Detail 中必須把「發包前」與「發包後」明確拆開

已拍板：
Project Detail 中 Vendor 相關資訊，不能混成單一區塊，而要拆成兩區：

#### A. Assignment / Reply 區
- 處理 **正式發包前** 的事情
- 包含任務、回覆、vendor 決策、發包入口

#### B. Issued Packages 區
- 處理 **正式發包後** 的事情
- 只顯示已正式發包後產生的 package 主線

一句話總結：

> **Project Detail 要同時容納「發包前決策」與「發包後執行」，但兩者必須明確分區。**

---

## C. Project Detail 的 Vendor 資訊架構（已定稿）

### 區塊順序
已拍板由上到下為：

1. **Assignment / Reply 區**
2. **Issued Packages 區**

這個順序代表：
- 上方先處理正式發包前的決策與回覆
- 下方再看正式發包後的 package 主線

也就是採用：

> **Pre-Issue → Post-Issue**

的頁面語意順序。

---

## D. Assignment / Reply 區（已定稿）

### 1. 區塊定位
Assignment / Reply 區是：

> **Project Detail 中的 pre-issue 決策區**

它處理的是：
- assignment / reply 流程
- vendor 決策前的資訊
- 最終選定 vendor 的節點
- 發包入口

這裡的 vendor 可以很多，但不等於都進入正式發包主線。

只有：
- 在 reply 階段正式選定 vendor
- 並按下 `發包`

才會產生 package 並進入下方的 Issued Packages 區。

---

### 2. 呈現形式
已拍板：
- **列表型**

不是只有摘要入口，也不是重工作台。

原因：
- 使用者需要在 project detail 內直接掌握 pre-issue 狀況
- 但深度操作仍應進 reply 詳頁進行
- 避免 project detail 本身過重

---

### 3. 欄位結構
已拍板 Assignment / Reply 區列表欄位為：
- Assignment 名稱
- Reply 狀況
- 已選定 Vendor
- 發包狀態
- 操作

#### 各欄位語意：

##### Assignment 名稱
- 顯示該筆 assignment 主標題

##### Reply 狀況
- 用來描述 reply 處理進度
- 細部命名可後續再精修，但這欄位本身已確定需要存在

##### 已選定 Vendor
- 顯示 assignment / reply 階段是否已做出正式 vendor 決策
- 若尚未選定，顯示未選定
- 若已選定，顯示 vendor 名稱
- 不用在這欄展示候選 vendor 過程

##### 發包狀態
- 顯示該筆 assignment 是否已正式按下發包並進入 package 主線
- 最小語意即：未發包 / 已發包

##### 操作
- 已拍板只放：
  - **查看 Reply**
  - **發包**

不放：
- 查看 Package

原因：
- 這區處理的是 pre-issue 決策
- 發包後的 package 承接，交由下方 Issued Packages 區處理
- 這樣可避免 pre-issue / post-issue 層級混掉

---

## E. Issued Packages 區（已定稿）

### 1. 區塊定位
Issued Packages 區是：

> **Project Detail 中的 post-issue 主線區**

它只處理：
- 已正式發包的結果
- 已成立的 package 主線
- 從這裡進 package page

這區不是候選 vendor 區，也不是任務傳遞區。

只有正式發包之後，package 才會出現在這裡。

---

### 2. 是否為獨立大區塊
已拍板：
- **是，Issued Packages 必須在 Project Detail 中成為獨立大區塊**

它不應只是 assignment 上的一個小連結。

原因：
- package 已被定義為正式發包後的唯一主線
- 應有獨立入口與總覽位置
- 才能承接後續 package page 與 final outgoing document 的主流程

---

### 3. 呈現形式
已拍板：
- **表格列表**

不採卡片，不採摘要+表格混合。

產品定位：
- 這是一個營運管理清單
- 任務是快速辨識哪些已發包主線需要處理
- 不需要做成視覺導覽型模組

---

### 4. 欄位結構
已拍板 Issued Packages 表格欄位為：
- 廠商名稱
- assignment 數
- 文件狀態
- 操作

這是刻意採用的極簡版欄位組，目標是：
- 乾淨
- 夠用
- 不把 project detail 變成 package detail

詳細內容留到 package page 再看。

---

### 5. 文件狀態名稱（已拍板）
Issued Packages 表格中的文件狀態，使用以下三個名稱：
- **未處理**
- **已處理**
- **需更新**

#### 各自語意：

##### 未處理
- package 已存在
- 但尚未生成 final outgoing document

##### 已處理
- 已有 final outgoing document
- package 內容與文件一致

##### 需更新
- 曾經已生成文件
- 但 package 後續已修改
- 目前文件已不是最新內容，需重新生成

這些名稱不是正式狀態機，而是：

> **管理用的文件現況標示**

---

### 6. 操作欄
已拍板操作欄只放：
- **查看 Package**

不放：
- 查看文件
- 生成文件
- 重新生成文件

原因：
- Project Detail / Issued Packages 區只負責導流
- 真正的編輯、文件查看、生成、重新生成，統一在 package page 內處理

---

## F. 本輪產出的核心產品結論

### 1. Vendor 相關資訊必須分成兩個層次
#### Pre-Issue
- Assignment / Reply 區
- 做正式 vendor 決策與發包

#### Post-Issue
- Issued Packages 區
- 管理已正式發包後的 package 主線

---

### 2. package 不是所有 vendor 參與的總覽，而是已正式發包後的結果

也就是：
- vendor 出現在任務流程裡，不代表進 package
- 只有正式選定並發包後，才產生 package

---

### 3. Project Detail 的頁面心智需明確反映流程先後

頁面從上到下應呈現：
1. 發包前決策
2. 發包後主線

這讓使用者清楚知道：
- 上面是在判斷「要發給誰」
- 下面是在管理「已經發出去的包」

---

## G. 目前已定稿的 Project Detail Vendor 區塊結構（短版）

### Assignment / Reply 區
- 列表型
- 欄位：
  - Assignment 名稱
  - Reply 狀況
  - 已選定 Vendor
  - 發包狀態
  - 操作（查看 Reply、發包）

### Issued Packages 區
- 獨立大區塊
- 表格型
- 欄位：
  - 廠商名稱
  - assignment 數
  - 文件狀態（未處理 / 已處理 / 需更新）
  - 操作（查看 Package）

### 順序
- Assignment / Reply 在上
- Issued Packages 在下

---

## H. 本輪尚未展開 / 可接續討論的題目

### 1. Reply 狀況欄位的精確名稱
本輪已確定需要該欄，但尚未正式拍板細部命名

### 2. 發包狀態的 badge / 視覺語意
本輪只確定最小語意，尚未精修視覺命名

### 3. Project Detail 整體頁面中，Vendor 區塊與其他模組的排列關係
例如與 task board、project basic info、其他區塊如何整合

### 4. Assignment 詳頁 / Reply 詳頁 與 Project Detail 列表的責任切分
本輪已初步定義，但尚未展開更細的 UX

---

## I. 下一步建議

本份 MD9 可作為後續討論或派工依據。

若要繼續往下收，建議優先順序：
1. Assignment / Reply 區中的 Reply 狀況命名
2. Assignment 發包狀態語意 / badge
3. Vendor Information 模組如何承接確認金額
4. 報價單 / 成本模組如何承接 Vendor Flow 金額同步
