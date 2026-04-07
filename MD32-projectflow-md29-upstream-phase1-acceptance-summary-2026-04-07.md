# MD32 - projectflow MD29 upstream phase 1 驗收摘要（2026-04-07）

> 目的：整理 `MD29` upstream phase 1 在本輪驗收中的實際通過項目、重要修正與目前結論，作為後續續接 `projectflow` 時的正式驗收摘要。

---

# 1. 主題

本輪主題為：

> **MD29 — Project Detail upstream 主幹 phase 1**

目標是打通並驗收：
1. 首頁建立專案
2. 建立即正式啟動
3. 進入 `Project Detail`
4. 在原本已驗過的任務發布區正式交辦三板
5. 三線承接到中游任務板
6. 三線承接到文件層
7. vendor 線在 `同 project + 同 vendor` 規則下完整打通 list / detail / package

---

# 2. 本輪已驗收通過項目

## 2.1 建立專案 upstream root entry

### 已通過
- 可從首頁建立專案
- 建立即正式啟動
- `POST /api/projects` 會正式寫入 `projects` 表
- 新建 project 可在 `/projects` 專案列表中看見
- 新建 project 的狀態目前已能對齊產品語意（`執行中`）

### 驗收證據
- 使用者已在 SQL Editor 查 `projects`，確認新建立專案有正式寫入 DB
- 代表：
  > **建立專案 → API → 寫入正式 `projects` 表** 這條 upstream root entry 已有正式資料層證據

---

## 2.2 `Project Detail` 任務發布區 UI 骨架

### 已通過
- 先前錯誤新增的平行 `DbExecutionTreeSection` 已退役
- `Project Detail` 的任務發布區已回到原本 `ExecutionTreeSection / ExecutionTree` 骨架
- 原本已修好的：
  - `新增主項目`
  - `匯入 .xlsx`
  - 主項目卡片節奏
  - `專案分類檢視`
  均已回到原版骨架上

### 驗收意義
- 符合既有規則：
  > **Project Detail UI 不可動**
- upstream 資料流改為接回原骨架，而不是另做 DB 專用簡化版任務發布區

---

## 2.3 三線正式交辦主幹

### 已通過
- 可從 `Project Detail` 任務發布區正式交辦：
  - 設計
  - 備品
  - 廠商
- 三線可進入各自任務板 detail

---

## 2.4 設計線任務標題承接

### 已通過
- upstream 在任務發布區輸入的 task title
- 已能正確承接到設計任務板的「任務標題」欄位
- 不再錯顯 internal id / code / key

### 已修 root cause
- 先前是 `ExecutionTreeSection` dispatch handler 在找不到 execution title 時，fallback 成 `targetId`，導致 internal id 被寫進 `design_tasks.title`
- 已改成優先使用 upstream callback 傳入的真正 title

---

## 2.5 vendor list grouping

### 已通過
- 廠商發包版列表主體已修為：
  > **同一個 `project + vendor` 為一組**
- 同組下多筆 vendor task 已不再拆成平鋪多列 task row

---

## 2.6 vendor detail grouping

### 已通過
- 從 vendor board 點進 detail 後
- 已不再只承接單筆代表 task
- 已改為承接同一個 `project + vendor` group 底下的全部 vendor tasks

---

## 2.7 vendor 文件層 / package 層承接

### 已通過
- vendor 文件層 / package layer 已改為承接：
  > **同一個 `project + vendor` group 底下所有 task 的 latest confirmed content**
- 不再只吃 representative task / 第一筆 confirmation

---

## 2.8 vendor 回流不重複增生

### 已通過
- 從文件層回到任務看板 / project detail vendor 摘要後
- 已不再出現原本 2 筆變 4 筆的重複增生
- summary 層已補雙來源去重與 vendor confirm idempotent 修正

---

# 3. 本輪重要修正鏈（按驗收順序摘要）

以下是與本輪 `MD29` 驗收直接相關的重要修正：

- `94203e5` — `feat: wire project detail upstream db flow`
- `6db2439` — `Add local pg-mem verification fallback for MD29 upstream flow`
- `ce30c12` — `Reconnect DB flow to execution tree shell`
- `c884696` — `fix: include vendor task id in upstream dispatch sync`
- `6ee6bea` — `fix: group vendor board by project vendor`
- `8f861c8` — `fix: route vendor detail by project vendor group`
- `2443ad0` — `fix: aggregate vendor packages by project and vendor group`
- `412a559` — `fix: stabilize vendor group package handoff`
- `86c1e66` — `fix: preserve upstream task titles on dispatch`
- `3e239f8` — `fix: formalize project upstream db write path`

---

# 4. 目前正式結論

截至本檔整理時，可正式收斂為：

> **MD29 upstream phase 1 的核心主線已驗收通過。**

已具體成立的主線包括：
- 建立專案
- 正式寫入 `projects`
- 進 `Project Detail`
- 在原骨架任務發布區交辦三線
- 設計線標題正確承接
- vendor 線在 `同 project + 同 vendor` 規則下，從 list → detail → 文件層 / package 層完整打通
- 回流後不重複增生

---

# 5. 補充觀察

## 5.1 `projects.status` 現況
使用者於 SQL Editor 查詢時，`projects.status` 目前可見值包括：
- `active`
- `執行中`

這表示：
- 目前狀態模型方向沒有落到 `draft / pending / unpublished`
- 但狀態值仍未完全標準化（英文 / 中文並存）

目前判斷：
- **不阻塞本輪 MD29 upstream phase 1 驗收通過**
- 但屬於後續可整理的 schema / enum / mapping polish 項目

---

# 6. 建議後續優先序

在 `MD29` 核心主線已通後，後續可考慮的優先序為：

1. 若要繼續上游：
   - 做 status 正規化 / schema polish
   - 補更多正式 DB 驗收紀錄整理
2. 若要往下游：
   - 回到 `MD28` / `MD31`
   - 繼續帳務中心、結案紀錄與 Closeout domain

## 6.1 2026-04-07 後續補充：上游相依項目已再前進

在本檔驗收後，與 `MD29` upstream phase 1 直接相依的 `Project Master` 已再完成以下正式化補強：

1. `/projects` 已改為 DB mode 下只顯示 DB project，不再 merge mock seed
2. `/projects/[id]` 已改為 DB mode 下只讀 DB，不再 fallback 到 `project-data.ts`
3. `/projects` 與 `/projects/[id]` 已改為 `force-dynamic`，避免 route cache 造成舊資料殘影
4. 已補正式 project delete flow：
   - 列表刪除按鍵
   - 輸入專案名稱確認
   - `DELETE /api/projects/[id]`
5. 已補 project detail 正式可編輯欄位：
   - 客戶資料
   - 活動資訊
   - 聯絡資訊
6. `projects` schema 已補：
   - `event_type`
   - `contact_name`
   - `contact_phone`
   - `contact_email`
   - `contact_line`

這代表：
> **`MD29` 驗收通過後，上游不是停在可建立 / 可交辦，而是連 project master 本身也已進一步往正式 DB-first 主檔層收斂。**

---

# 7. 一句話總結

> `MD29` upstream phase 1 目前已驗收通過：建立專案會正式寫入 `projects`，`Project Detail` 已回到原任務發布區骨架，三線可正式交辦，其中設計線標題承接已對齊，vendor 線也已在 `同 project + 同 vendor` 規則下完整打通 list、detail、文件層與回流去重。
