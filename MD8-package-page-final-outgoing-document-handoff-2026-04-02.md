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

# MD8 - Package Page / Final Outgoing Document 交接摘要（2026-04-02 凌晨版）

> 目的：承接 MD7 的 Vendor Flow 討論結果，整理目前已拍板的 Package Page 與 Final Outgoing Document 產品定義，供 CTO 直接開始執行。

---

## A. 本輪討論定位

本輪仍是 **CPO 討論模式**，但已從概念釐清推進到可直接交辦工程與前端設計的程度。

本輪核心產出有兩塊：
1. **Final Outgoing Document 欄位與生成規則定稿**
2. **Package Page 作為文件編輯前台的頁面結構與操作規則定稿**

---

## B. Final Outgoing Document 的最終定位

Final Outgoing Document 已明確定義為：

- **對外給廠商執行用的最終文件**
- 不是內部管理文件
- 不是報價單 / 金額文件
- **不顯示金額**
- 同時間系統只保留 **一份有效文件**

重要補充：
- 不做舊版本歷史保存
- 重新生成時，以新文件覆蓋舊文件
- 若 package 修改後文件已不是最新內容，系統需明確提醒

也就是說，這不是版本管理型 document，而是：

> **single current truth document**

---

## C. Final Outgoing Document 欄位結構（已定稿）

### 1. 專案資訊區
欄位：
- 專案名稱
- 客戶名稱
- 活動日期
- 進場時間
- 地點

規則：
- 這些資料 **預設自動帶入 project 已存在資料**
- 不應要求使用者在文件階段重填
- 但 package / document 階段允許 **局部覆寫**
- 覆寫值 **屬於 package**，不是屬於每一版 document

也就是：
- project 提供預設值
- package 持有目前對外文件要用的值
- document 生成時再凍結為當下快照

---

### 2. 發包項目明細區
每列欄位：
- 項次
- 項目名稱
- 工作內容 / 規格說明
- 數量
- 單位
- 備註

規則：
- 這些不是直接照 assignment 原始內容輸出
- 而是由 package 層 **人工整理成最終對外列**
- package 可新增、編輯、刪除、排序這些列
- 最終文件中的明細，是 package 當前整理結果的輸出

重要產品結論：
- package 不只是容器
- package 是 Final Outgoing Document 的 **整理 / 編輯前台**

---

### 3. 文件整體備註區
欄位：
- 整體備註

規則：
- 由 package 維護
- 作為整份文件共用補充說明
- 文件生成時一併輸出

---

## D. Final Outgoing Document 生成與覆蓋規則（已定稿）

### 1. 生成方式
- 使用者在 package 中完成內容整理後
- 手動按下 **生成發包文件**
- 系統生成目前有效的 final outgoing document

### 2. package 修改後的處理
- 若 package 在文件生成後被修改
- 系統需明確提示：
  - **目前發包文件不是最新內容，請重新生成**

### 3. 重新生成規則
- 使用者按下 **重新生成發包文件**
- 系統必須先跳確認提示
- 使用者確認後，才用新內容覆蓋現有文件

### 4. 舊文件保留規則
- **不保留舊版本歷史**
- 同一 package 同時間只有一份有效 final outgoing document

---

## E. Package Page 的最終定位

Package Page 已明確定義為：

> **同專案 + 同廠商的需求整理頁，也是 Final Outgoing Document 的編輯前台。**

這頁不是單純展示 package 收了哪些 assignment，
而是要讓使用者完成：
1. 查看來源 assignment
2. 整理對外文件內容
3. 生成 / 重新生成 final outgoing document

---

## F. Package Page 頁面區塊結構（已定稿）

### 1. 基本資訊區
顯示：
- 專案名稱
- 客戶名稱
- 廠商名稱
- 活動日期
- 進場時間
- 地點

用途：
- 快速辨識目前 package 對應的專案與廠商

---

### 2. 已歸包 Assignment 區
顯示：
- 已納入此 package 的 assignment 清單
- 每筆 assignment 的摘要資訊
- 查看原始內容入口

規則：
- 此區是 **來源參考資料區**
- 不直接等於 final outgoing document 內容
- 建議可折疊或弱化呈現，不搶主工作區焦點

---

### 3. 專案資訊（對外文件用）區
欄位：
- 專案名稱
- 客戶名稱
- 活動日期
- 進場時間
- 地點

規則：
- 預設帶入 project 既有資料
- package 可局部覆寫
- 這裡編輯的是 package 持有的對外顯示值
- 不回寫 project 主資料

---

### 4. 最終發包項目明細區
每列欄位：
- 項次
- 項目名稱
- 工作內容 / 規格說明
- 數量
- 單位
- 備註

規則：
- 這區是 final outgoing document 的主要內容來源
- 由 package 層人工整理
- 不直接等於 assignment 原始資料
- 必須支援：
  - 新增
  - 編輯
  - 刪除
  - 排序

---

### 5. 文件整體備註區
欄位：
- 整體備註

規則：
- 作為整份文件共用說明
- 由 package 維護

---

### 6. Final Outgoing Document 區
需提供：
- 查看文件
- 複製
- 匯出
- 生成發包文件
- 重新生成發包文件

規則：
- 若已有文件但 package 後續已修改，需顯示文件已非最新內容的提醒
- 同時間只保留一份有效文件

---

## G. Package Page 互動規則（已定稿）

### 1. 直接可編輯
已拍板：
- Package Page **不區分檢視模式 / 編輯模式**
- 打開頁面即可直接編輯
- 頁面本身就是工作台

### 2. 保留明確儲存操作
已拍板：
- 雖然頁面直接可編輯
- 但仍要保留明確的 **儲存** 按鈕 / 操作
- 不採全自動即時儲存作為主模式

產品理由：
- 較符合一般營運同仁的操作習慣
- 使用者對內容是否正式更新會更安心
- 這頁較接近表單式工作台，而非即時同步編輯器

---

## H. UI/UX 方向（已拍板）

### 核心原則
Package Page 的 UI/UX 應該長得像：

> **對外發包文件編輯台**

而不是：
- assignment 檔案櫃
- 純資料展示頁
- 流程狀態管理頁

### 視覺層級優先順序
1. 文件生成 / 更新提醒
2. 對外文件編輯內容
3. 來源 assignment 參考資料

### CTA 原則
主 CTA：
- 生成發包文件
- 或重新生成發包文件

次 CTA：
- 查看文件
- 複製
- 匯出
- 儲存

不建議加入的主流程按鈕：
- 需求確認
- 儲存為版本
- 發布文件
- 送審

原因：
- 前面流程語意已由「能產出文件」自然成立
- 不需要再加一層形式化狀態

---

## I. 明確不做的事（本輪已排除）

本階段不處理：
- Document 版本歷史保存
- Package 狀態機
- Document 狀態機
- Final Outgoing Document 金額欄位
- 文件簽核 / 審批流程
- package 回寫 project 主資料
- assignment 與最終明細列的複雜自動映射規則

---

## J. CTO 直接執行重點

CTO 下一步應直接開始落地以下內容：

### 1. Package 可編輯資料結構
至少需支援：
- 專案資訊覆寫值
- 最終發包項目明細列
- 文件整體備註
- 是否已有 final outgoing document
- 文件是否已落後於 package 當前內容

### 2. Project / Package / Document 的資料責任邊界
- project 提供預設專案資訊
- package 保存覆寫值與文件編輯內容
- document 保存目前有效輸出內容
- package 不回寫 project 主資料

### 3. 單一有效文件機制
- 同一 package 同時間只有一份有效 final outgoing document
- 重新生成時覆蓋舊文件
- 不保留歷史版本

### 4. 重新生成前確認機制
- 使用者按重新生成時，需有覆蓋確認提示

### 5. 文件過期提醒機制
- 若已有文件且 package 被儲存更新，需標示目前文件已不是最新內容

---

## K. 前端設計師直接執行重點

### 1. Package Page 的主畫面要明確呈現為編輯台
重點不是展示 assignment，而是整理最終對外文件

### 2. 最終發包項目明細區要優先支援高效率編輯
需讓使用者容易：
- 新增
- 編輯
- 刪除
- 排序

### 3. Assignment 區要弱化為來源參考
可折疊或置後，不應搶走主畫面主角地位

### 4. 重新生成提醒要醒目但不過度干擾
真正重要的提醒只有：
- 文件已不是最新內容

### 5. 儲存操作要明確
因本頁不採全自動儲存，需提供清楚的儲存入口與回饋

---

## L. 可直接引用的短版結論

目前 Vendor Flow 已延伸出明確的 Package Page / Final Outgoing Document 設計：

- package 是同專案 + 同廠商的唯一主容器
- package 不只是容器，而是 final outgoing document 的編輯前台
- final outgoing document 是對外給廠商執行用的最終文件
- 文件欄位只包含：
  - 專案資訊（可由 project 自動帶入，package 可局部覆寫）
  - 發包項目明細（由 package 整理）
  - 文件整體備註
- 文件不顯示金額
- package page 直接可編輯，但保留儲存動作
- 若 package 修改後文件過期，系統需提示重新生成
- 重新生成前需確認
- 舊文件不保留，系統始終只保留一份有效文件

---

## M. CTO 第一版實作進度更新（已完成）

CTO 已依本份 MD8 落地第一版可驗收骨架，重點如下：

### 1. 已完成的實作內容
- Package Page 已從展示頁重構為 **對外發包文件編輯台**
- 已支援 **專案資訊（對外文件用）編輯 / 覆寫**
- 已支援 **最終發包項目明細列**：
  - 新增
  - 編輯
  - 刪除
  - 排序
- 已支援 **文件整體備註** 編輯
- 已加入明確的 **儲存 Package** 操作
- 已建立 **Final Outgoing Document 區**
- 已支援：
  - 生成發包文件
  - 重新生成前確認覆蓋
  - 文件預覽
  - 複製文件內容
  - 匯出 txt
- 若已有文件，儲存 package 後會標示文件已不是最新內容，需重新生成
- Assignment 區已被弱化為 **來源參考區**

### 2. 本次實作影響檔案
- `project-mgmt/src/components/vendor-data.ts`
  - 補 package 可編輯欄位與 document snapshot 結構
- `project-mgmt/src/components/project-data.ts`
  - 補 package 文件所需的 project 預設資料
- `project-mgmt/src/components/vendor-package-detail.tsx`
  - 重寫為 Package 編輯前台主體

### 3. 已知限制（目前仍屬第一版骨架）
- 目前仍是 **前端 mock data**，重新整理不會真正持久化
- 文件生成時間 / 生成人仍是 demo 值
- 匯出目前僅為 txt，不是正式 PDF / DOC
- 查看文件目前以頁內預覽為主，尚未拆獨立 document route
- 文件是否過期目前以儲存後標記 outdated 模擬，尚未接正式版本比對機制

### 4. 驗收建議路徑
1. 開 `vendor-packages/vp-spring-xingcheng-001`
2. 修改專案資訊或明細列
3. 按 **儲存 Package**
4. 確認出現文件過期提醒
5. 按 **重新生成發包文件**
6. 確認有覆蓋提示
7. 確認文件預覽更新
8. 測試複製 / 匯出

### 5. 目前判斷
本份 MD8 對應的 **第一版可驗收實作已完成**，但仍屬 mock-based prototype，後續仍需：
- 正式資料持久化
- 更完整匯出格式
- document route / 真實後端行為

---

## N. 下一步

本份 MD8 已不只是 CTO 開始執行的依據，也已完成第一版骨架落地。
若後續要接續討論，最合理的下一題是：

1. 實際資料模型 / schema 設計
2. package page 更細的 UI 排版與元件層級
3. assignment 歸包後在 project detail / vendor flow 中的呈現方式
4. 針對第一版實作做驗收 review 與修正清單
