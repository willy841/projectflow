# MD21 - projectflow Project Detail 責任重切定稿（2026-04-05）

> 目的：記錄 2026-04-05 與使用者討論後，對 `project detail`、左選單三條主控版面、以及 `vendor-packages` 邊界的正式收斂結果。
>
> 本文件不是一般 UI 微調筆記，而是：
> - `project detail` 頁面責任重切 spec
> - 三條工作流主控責任分配 spec
> - `vendor-packages` 進行中 / 已結案邊界 spec
>
> 後續若要續接相關實作，應先讀：
> 1. `MD-MASTER-projectflow-system-source-of-truth.md`
> 2. `MD18-projectflow-44-commit-review-and-redo-plan-2026-04-05.md`
> 3. `MD19-projectflow-page-by-page-ui-review-summary-2026-04-05.md`
> 4. `MD20-projectflow-approved-ui-lock-rule-2026-04-05.md`
> 5. 本文件 `MD21-projectflow-project-detail-responsibility-redistribution-spec-2026-04-05.md`

---

# 1. 本次討論結論總覽

本次正式收斂的核心方向是：

> **`project detail` 不再承擔三條線的完整深操作工作台責任，而是回到「專案總覽 + 任務發布 + 導流中心」定位。**

對應重切結果：

- `project detail`
  - 保留：專案背景總覽、execution tree / 任務發布、三條線任務摘要與導流
  - 移除主控責任：深度回覆、確認、整理、文件生成、package 深操作
- `design-tasks`
  - 承接設計線深操作主控責任
- `procurement-tasks`
  - 承接備品線深操作主控責任
- `廠商發包版`
  - 承接 vendor 線處理層主控責任
- `vendor-packages` / package 主線
  - 承接 vendor 線的整理層 / 文件層主責任

---

# 2. 高階定位重切

## 2.1 `project detail` 的新正式定位

`project detail` 正式定位為：

> **單專案主控台 / 專案總覽頁 / 任務發布入口 / 各工作流導流中心**

不再定位為：
- 三條線共用的完整工作台
- 回覆處理主場
- 文件整理主場
- 文件生成主場
- package post-issue 主場

## 2.2 左選單三條主線頁的正式定位

### A. `/design-tasks`
定位：
> **設計線主控工作台**

承接：
- 設計任務深度查看
- 設計回覆管理
- 回覆確認
- 設計文件整理
- 設計文件生成 / 重新生成

### B. `/procurement-tasks`
定位：
> **備品線主控工作台**

承接：
- 備品任務深度查看
- 備品回覆管理
- 回覆確認
- 備品整理
- 備品文件生成 / 重新生成

### C. `廠商發包版`
定位：
> **vendor 線主控工作台 / 發包處理主場**

承接：
- vendor 任務總表
- 單筆 vendor 任務處理
- 發包確認
- 從任務層導入 package 主線

### D. `/vendor-packages` 與 package 主線
定位：
> **vendor 線的整理層 / 文件層主場**

承接：
- 已發包內容的 package 整理主線
- package 內容整理
- 文件生成 / 重新生成
- package detail 深操作

---

# 3. `project detail` 保留責任

## 3.1 專案背景總覽層
保留：
- 專案標題 / 專案狀態
- 活動資訊
- 客戶資訊
- 成本 / 預算摘要
- 需求溝通

這些屬於單專案主控台必要背景資訊，不屬於任何單一工作流主控頁。

## 3.2 任務發布層
保留：
- execution tree
- 主項目 / 子項目樹
- 新增主項目
- Excel 匯入
- 從 execution item 發起三條線任務：
  - 設計
  - 備品
  - 廠商

正式語意：
> 任務發布責任仍屬於 `project detail` 核心，不外移。

## 3.3 三條線摘要與導流層
保留：
- 專案設計摘要與導流
- 專案備品摘要與導流
- 專案廠商任務摘要與導流

正式語意：
> `project detail` 要看得到專案內目前各條線發生了什麼，但不再在同頁承擔完整深操作。

---

# 4. 設計 / 備品在 `project detail` 的正式邊界

## 4.1 設計 / 備品區的正式定位

`project detail` 內的設計 / 備品區，正式定位為：

> **單專案內的任務摘要清單 + 每筆任務導流入口**

不是：
- 工作台
- 回覆主場
- 文件整理主場
- 文件生成主場

## 4.2 每筆任務保留欄位（已拍板）

每筆設計任務 / 備品任務，在 `project detail` 只保留：
- 數量
- 任務名稱
- 狀態
- 導流入口（每筆任務）

## 4.3 明確不保留的內容（已拍板）

`project detail` 的設計 / 備品區不再保留：
- 回覆列表
- 回覆確認
- 整理區
- 文件生成操作
- 深度展開工作區

## 4.4 深操作責任承接頁

### 設計
正式由：
- `/design-tasks`
承接深操作主責任。

### 備品
正式由：
- `/procurement-tasks`
承接深操作主責任。

---

# 5. Vendor 在 `project detail` 的正式邊界

## 5.1 Vendor 區的正式定位

`project detail` 內的 vendor 區，正式定位為：

> **單專案內的 vendor 任務摘要清單 + 每筆任務導流入口**

此定位需與設計 / 備品兩條線保持一致。

因此它不是：
- vendor 工作區
- package 主線
- 文件整理主場
- 文件生成主場

## 5.2 每筆 vendor 任務保留欄位（暫定）

每筆 vendor 任務，在 `project detail` 應比照設計 / 備品，僅保留摘要資訊與導流欄位。

目前已明確保留方向：
- 任務名稱
- 狀態
- 導流入口

正式導流規則：
- 導向左選單 `廠商發包版`
- 並應比照設計 / 備品，採：頁面 + project filter + task 定位

補充欄位（如已選 vendor、發包狀態）後續可在不破壞一致性的前提下，再確認是否保留為摘要資訊。

## 5.3 明確不保留的內容（已拍板）

`project detail` 的 vendor 區不再保留：
- 實際處理工作區
- 大量補充欄位編輯
- package 內容整理
- 文件生成 / 重新生成
- post-issue 主工作區

## 5.4 正式語意

一句話定義：

> `project detail` 的 vendor 區與設計 / 備品一致，只保留任務摘要與導流；vendor 真正的處理主線在發包確認後，轉入 package 整理 / 文件主線。

---

# 6. `vendor-packages` 的正式邊界（vendor 線新版）

## 6.1 `vendor-packages` 的正式定位

`vendor-packages` 不再理解為 vendor 任務主工作台，而是：

> **vendor 線的整理層 / 文件層主場**

也就是承接：
- 發包確認後的內容整理
- package 內容整理
- 文件生成 / 重新生成
- 文件查看

## 6.2 `vendor-packages` list 頁的正式語意

`/vendor-packages` 列表頁顯示的，不是「仍在處理中的 vendor 任務」，而是：

> **仍有整理、生成、查看需求的 package 容器**

因此這頁的狀態主軸應理解為：
- 文件未生成
- 文件已生成
- 文件需更新

而不是把 package 當另一套 issue 工作區狀態機。

## 6.3 已結案 / 歷史邊界

本輪目前只先定：
- `vendor-packages` 不是 vendor issue 工作區
- package 的歷史 / 留存邊界，需與 `closeout` / 專案結案邏輯一起討論

換句話說：
- issue 層完成點
- project 層 closeout
- package 層文件留存

這三者不能混成單一「已結案」語意。

## 6.4 package detail 的相容查閱能力

正式規則：
- package detail 可保留相容查閱能力
- 若從歷史 / 結案脈絡打開某個 package detail，仍可查看其留存內容

## 6.5 一句話總結

> `vendor-packages` 是 vendor 線的整理層 / 文件層，不是 vendor 任務工作區；後續需再與 closeout 邏輯一起收斂其歷史邊界。

---

# 7. 本次責任重切後的整體結構

## 7.1 `project detail`
負責：
- 專案總覽
- 任務發布
- 單專案內三條線摘要
- 每筆任務導流

## 7.2 `design-tasks`
負責：
- 設計線深操作
- 回覆管理
- 回覆確認
- 文件整理
- 文件生成

## 7.3 `procurement-tasks`
負責：
- 備品線深操作
- 回覆管理
- 回覆確認
- 整理
- 文件生成

## 7.4 `廠商發包版`
負責：
- vendor 線處理層主線
- vendor 任務總表
- 單筆任務處理
- 發包確認
- 導入 package 主線

## 7.5 `vendor-packages`
負責：
- vendor 線整理層主線
- package 內容整理
- 文件生成 / 更新
- 文件查看與留存承接

## 7.6 `closeouts` / 歷史留存
負責：
- 已結案 package / 財務 / 歷史留存承接

---

# 8. 這次重切預期解決的問題

## 8.1 解掉 `project detail` 過重問題
`project detail` 不再同時扮演：
- 總覽頁
- 回覆頁
- 文件頁
- package 頁
- 三條線完整工作台

## 8.2 解掉頁面責任混亂
重新切清：
- `project detail` 看專案
- 左選單各工作台做深操作
- package / closeout / 歷史頁承接結果與留存

## 8.3 降低對已鎖定 layout 骨架的壓力
因為不再把大量深操作硬留在 `project detail`，後續更容易遵守：
- layout 骨架不亂動
- 已驗收 UI 不被順手破壞

## 8.4 讓 vendor 線的處理層、整理層、留存邊界更清楚
特別是 vendor / package 線：
- 任務摘要與導流 → `project detail`
- 處理層主線 → `廠商發包版`
- 整理 / 文件主線 → `vendor-packages`
- 歷史留存邊界 → 後續再與 `closeouts` 一起收斂

---

# 9. 實作紅線（必守）

## 9.1 Layout 紅線
本次責任重切**不等於可重做 `project detail` layout**。

仍必須遵守：
- 不動已鎖定的整體 layout 骨架
- 不重排首屏 header / 資訊卡 / 專案基本資訊 / 需求溝通主結構
- 不重排下半部 execution / 分類檢視 / 主節奏骨架

## 9.2 工程紅線
後續任何修改都仍必須遵守：
- 不可再在 `ExecutionTreeSection` 攔截 assignment payload 後 `.map(...)` 重組
- 不可把 `replyOverrides` 再注回 assignment `data.replies`
- 不可重引入雙來源 merge 資料流

安全基線仍以：
- `d42dac3`
的資料流原則為準

---

# 10. 後續建議實作順序

若後續要進實作，建議順序：

1. 先收 `project detail` 的設計 / 備品 / vendor 顯示層級
   - 改成摘要列 + 導流
   - 移除深操作 UI
2. 再補 `design-tasks` / `procurement-tasks` 是否已足夠承接深操作責任
3. 新增左選單 `廠商發包版`，承接 vendor 線處理層主責任
4. 再收 `vendor-packages` 作為整理層 / 文件層的責任與邊界
5. 最後再討論 closeout / 歷史留存如何承接已結案 package

---

# 11. 一句話總結

本次正式拍板結果是：

> **`project detail` 回到專案總覽 + 任務發布 + 導流中心；設計 / 備品 / vendor 三條線的深操作主控責任正式外移，其中 vendor 線新增左選單 `廠商發包版` 承接處理層，`vendor-packages` 則作為整理層 / 文件層主線。**
