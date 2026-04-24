# MD156 — projectflow 專案文件承接與 dispatch 工種連動規則 — 2026-04-24

> Status: ACTIVE / CURRENT ROUND ALIGNMENT
> Role: 記錄 2026-04-24 在測試站主線上，對 `design / procurement` 文件承接出口，以及 `Project Detail` 任務發布區 `工種 × 廠商` 規則的正式校正。
> Scope: 本文件只處理兩件事：
> 1. 設計 / 備品文件承接出口統一為 **project-level document**
> 2. `Project Detail` 任務發布區中，`工種` 與 `選擇廠商` 一律以 `Vendor Data` 為唯一來源並做連動過濾

---

## 1. 本輪背景

本輪在測試站驗收過程中，使用者明確指出兩個既有行為不符合現行主線：

1. **Task-level document 已不再需要**
   - 設計 / 備品在 `全部確認` 後，不應再先進單筆任務文件頁
   - 應直接進入該專案底下的正式文件頁

2. **Project Detail 任務發布區的工種 / 廠商來源不對**
   - `工種` 不應再是硬編碼常數或局部假資料
   - `選擇廠商` 也不應顯示與當前工種無關的廠商

本文件目的，是把這兩條規則正式寫清楚，並同步校正既有 handoff / 母檔中仍容易讓 agent 誤判的地方。

---

## 2. 設計 / 備品文件承接新規則

### 2.1 正式規則

自本文件成立起：

> **設計線與備品線的 `全部確認` 後承接出口，一律直接導向 project-level document。**

也就是：

### 設計線
- 不再使用 task-level document 作為確認後出口
- 正式出口改為：
  - `/projects/[projectId]/design-document`

### 備品線
- 不再使用 task-level document 作為確認後出口
- 正式出口改為：
  - `/projects/[projectId]/procurement-document`

---

### 2.2 task-level document 地位校正

正式規則：

> **task-level document 不再是主線、不再是過渡頁、也不再是確認後預設出口。**

也就是：
- `design-tasks/[id]/document`
- `procurement-tasks/[id]/document`

這兩條路徑若仍存在，僅屬歷史殘留 / 相容查閱，不應再當作主流程出口來設計、回報或驗收。

---

### 2.3 正式語意

這條規則的正式語意是：

> **任務層負責深操作與確認；文件層負責專案底下的正式承接。**

也就是：
- task detail = 工作台
- project document = 正式文件頁 / 正式結果頁

因此之後 agent 不可再把：
- 「確認後先進 task-level document」
- 或「task-based document 是目前正式規則」

當成正確判讀。

---

## 3. Project Detail 任務發布區：工種來源與廠商連動規則

### 3.1 工種來源唯一化

正式規則：

> **`Project Detail` 任務發布區中的 `工種`，一律以 `Vendor Data / 廠商資料` 內已建立的工種為唯一正式來源。**

禁止事項：
- 不可再用硬編碼固定工種常數
- 不可再用局部 mock trade list
- 不可讓任務發布區維持與 `Vendor Data` 分裂的工種來源

---

### 3.2 工種 → 廠商連動

正式規則：

> **當使用者先選定某個工種後，`選擇廠商` 清單只能顯示該工種底下的廠商。**

補充規則：
- 切換工種時，若原本已選廠商不屬於新工種，應清空既有廠商值，避免殘留錯誤配對
- 若未選工種，廠商清單可顯示全部既有 vendor（依目前 UI 設計處理）

---

### 3.3 Vendor Data 為唯一主資料來源

正式規則：

> **任務發布區不自行管理工種；工種只在 `Vendor Data` 模組裡管理。**

因此這次調整的本質不是重開 `Vendor Data` 規格，而是：
- 讓 `Project Detail dispatch` 正確讀取既有 vendor data
- 正確承接 `vendor.tradeLabels / tradeLabel / category`
- 正確依工種過濾廠商

---

## 4. 本輪已做進 code 的項目

### 4.1 設計 / 備品確認後導流
已完成：
- 設計 `全部確認` 後導向：
  - `/projects/[projectId]/design-document`
- 備品 `全部確認` 後導向：
  - `/projects/[projectId]/procurement-document`
- 不再把 task-level document 當作主出口

---

### 4.2 Project Detail dispatch 工種 / 廠商連動
已完成：
- `Project Detail` 廠商交辦 drawer 的 `工種` 下拉已改為吃 `Vendor Data` 現有工種
- `選擇廠商` 已依當前工種過濾
- 切換工種時會清掉舊的已選廠商值，避免錯配

---

## 5. 對後續 agent 的執行要求

之後若續接 `projectflow`：

### 5.1 文件出口判斷
不可再把以下說法當成正確：
- 設計 / 備品確認後應先進 task-level document
- task-level document 是正式主出口

正確說法應為：
- **設計 / 備品確認後直接去 project-level document**

### 5.2 工種 / 廠商來源判斷
不可再把以下做法當成可接受：
- dispatch 工種使用硬編碼清單
- 工種與 Vendor Data 不同步
- 已選工種後仍顯示全部廠商

正確做法應為：
- **工種只來自 Vendor Data**
- **選定工種後，廠商清單必須被過濾**

---

## 6. 2026-04-24 晚間後續延伸（補記）

本文件之後，本輪又在同一天晚間繼續新增：
- quote-cost / reconciliation / vendor financial source formalization
- vendor detail UI reflow
- vendor detail performance investigation

以上內容不再混進本文件，而已另外記錄於：
- `MD157-projectflow-vendor-financial-source-formalization-and-vendor-detail-performance-investigation-2026-04-24.md`

重要：
> **若續接 `Vendor Data` / vendor list / vendor detail / vendor 對帳後金額承接 / vendor detail 性能問題，不可只停在 `MD156`，必須再讀 `MD157`。**

## 7. 一句話總結

> **2026-04-24 起，設計 / 備品兩條線的 `全部確認` 後文件承接正式統一為 project-level document；同時 `Project Detail` 任務發布區中的 `工種` 與 `選擇廠商` 也正式統一以 `Vendor Data` 為唯一來源，並在選定工種後只顯示該工種底下的廠商。**
