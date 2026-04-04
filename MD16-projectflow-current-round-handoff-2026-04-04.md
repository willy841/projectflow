# MD16 - projectflow 本輪完成事項與續接 handoff（2026-04-04）

> 用途：整理本輪已完成項目、目前狀態、已停用背景排程、以及下一輪若要續接時的正確入口。
> 適用情境：
> - 新對話 / 新 agent 要快速接手
> - 使用者想知道這輪到底完成了什麼
> - 需要避免再次重談已拍板規格
>
> 高階 source of truth 仍以：
> - `MD-MASTER-projectflow-system-source-of-truth.md`
> - `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
> 為準。
>
> 本檔角色：
> **本輪收尾 handoff。**

---

# 1. 一句話總結

這一輪 `projectflow` 已完成多條關鍵主線補強，狀態可描述為：

> **核心主線已進正式驗收模式；本輪新增完成 vendors 工種治理、vendors 財務承接、任務發佈區報價單式 Excel 匯入，且相關自動推進 cron 已停用。**

---

# 2. 本輪完成事項（已落地）

## 2.1 vendors 工種可管理化
### 已完成
- 工種不再是寫死常數
- 已改為 `vendors` 模組內可管理的共用來源
- `/vendors` list 可：
  - 新增工種
  - 刪除未被使用的工種
  - 顯示某工種被多少 vendor 使用
- `/vendors/[id]` 與 vendor 建立流程已改吃同一份工種來源
- 非 vendors 模組的 quick create vendor 不再承擔工種管理

### 已拍板規則
- 工種只在 `廠商資料` 模組裡管理
- 新增工種要 trim
- 禁止空字串
- 禁止重複名稱
- 已被任何 vendor 使用中的工種禁止刪除
- 採輕量化管理，不開新大模組

### 相關 commit
- `fe9cb27` — `feat: make vendor trades manageable`

---

## 2.2 vendors 財務承接第一版
### 已完成
- `quote-costs / closeouts` 與 `vendors` 已接成同一條 `projectId + vendorId` 共享財務 relation 主線
- vendor list 未付款總額改吃 shared relation
- vendor detail 的未付款區 / 歷史往來區改吃 shared relation
- `標記為已付款` 已可寫回 shared relation
- `quote-costs / closeouts` 也已開始承接同一份付款狀態結果

### 已拍板規則
- 共享主鍵固定採：`projectId + vendorId`
- 成本金額主來源仍以 `quote-costs / closeouts` 為準
- `vendors` 承接未付款、付款狀態與歷史往來
- fallback 規則：shared relation 為主、seed 為 fallback、不可重複累加

### 目前邊界
- 仍是 localStorage MVP
- vendor identity 與正式主檔 id 尚未完全對齊
- 是第一版閉環，不代表財務資料層已完全封板

### 相關 commit
- `9b1683f` — `feat: bridge vendor financial data with quote costs`

---

## 2.3 任務發佈區：報價單式 Excel 解析匯入 v1
### 已完成
- 任務發佈區舊 CSV 匯入已移除
- 改為只收 `.xlsx`
- 只讀第一個 sheet
- 會自動找第一塊符合報價明細表頭的區域
- 可解析：
  - 主項目列
  - 子項目列
  - 子項目延續列
  - 忽略列
  - 失敗列
  - 停止列
- 匯入前先出預覽 / 確認，不再直接覆蓋任務樹
- 預覽可顯示：
  - 主項目數
  - 子項目數
  - 延續列數
  - 忽略列數
  - 解析失敗數
  - 預計匯入樹狀結果
  - 單價 / 數量 / 單位 / 金額（僅供核對）

### 已拍板規則
- Excel 完全取代 CSV
- 只收 `.xlsx`
- 只吃第一個 sheet
- 匯入前先預覽 / 確認
- 第一個大方案名稱也可視為主項目
- 子項目延續列併到上一筆子項目摘要
- 單價 / 數量 / 單位 / 金額只顯示在預覽，不作正式任務欄位
- 一旦進入小計 / 稅金 / 總金額 / 備註 / 付款條件 / 匯款資訊等條款 / 結算區，後續停止解析

### 產品定位
這一輪不是乾淨模板匯入，而是：

> **報價單轉任務草稿匯入器 v1**

### 目前邊界
- 目前只支援 `.xlsx`
- 只支援第一個 sheet
- 不做自由 mapping UI
- 不做多種報價單格式全兼容
- 不把這輪變成正式財務匯入器
- 子項目來源中的金額資訊目前可能短暫保留於 `note` 內作內部保留，若後續要更嚴格可再收掉

### 相關 commit
- `8b10641` — `feat: replace task import csv flow with excel preview parser`

---

# 3. 本輪文件整理與規則同步

本輪已同步更新：
- `MD-MASTER-projectflow-system-source-of-truth.md`
- `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
- `MD15-projectflow-repo-audit-summary-v1-2026-04-04.md`

本輪新增的文件 / docs commits：
- `19a1129` — `docs: record vendor trade management rules`
- `5a8a24f` — `docs: update MD14 with vendor trade management`
- `997d2a6` — `docs: record vendor financial bridge progress`
- `c0eeaa2` — `docs: add projectflow repo audit summary v1`
- `f007e45` — `docs: record excel task import parser progress`

---

# 4. 本輪已停用的 cron

使用者已明確要求：
> 這五項任務算暫時完成，cron 排程先停下來。

目前已停用的 projectflow 相關 cron：
- `projectflow-task-progress-check`
- `projectflow-hourly-progress-drive`

狀態：
- 兩者皆已 **disabled**

正式語意：
> 本輪不再讓背景排程持續自動推進 `projectflow`；後續若要重開，需人工決定再啟用。

---

# 5. 目前整體狀態判斷

依本輪完成項與 repo audit 判斷：

## 可這樣描述
- `projectflow` 核心主線已大致成形
- 已進正式驗收模式
- 已不再是 demo 或空殼
- 目前未完成的主體不是功能空白，而是：
  - 尚未封板的成熟度
  - 尚未正式化的資料層 / 身份模型 / 文件規格

## 粗略完整度判斷
- 產品架構完整度：約 **85%**
- repo 實作完整度：約 **78%～83%**
- 正式產品化程度：約 **55%～65%**

---

# 6. 若下一輪要續接，優先入口

## 第一優先：正式驗收
建議優先驗：
1. `/projects`
2. `/projects/[id]`
3. `/design-tasks`
4. `/procurement-tasks`
5. `/vendor-packages`
6. `/vendors`
7. `/vendors/[id]`
8. `/quote-costs/[id]`
9. `/closeouts`

原因：
- 目前最大的風險已不是需求不清楚
- 而是哪些真的過關、哪些只是還沒被點到

## 第二優先：尚未封板的成熟度收尾
若驗收後要再修，優先應是：
1. `design-tasks`
2. `procurement-tasks`
3. `vendors`
4. `vendor-packages`

## 第三優先：中期議題
等正式驗收後，再決定是否展開：
1. 正式資料層 / 唯一資料模型
2. vendor identity 全系統正式對齊
3. 文件正式化
4. Excel / 報價匯入更正式規格
5. 付款管理深化

---

# 7. 仍需記住的邊界

1. 目前仍是 **mock / local state / localStorage MVP**，不是正式後端產品
2. `shared store` 與 `seed / fallback` 仍並存，尚未完全收斂成唯一資料源
3. vendors 財務 relation 已能運作，但 vendor identity 仍未完全正式化
4. 任務發佈區 Excel 匯入目前是第一版 parser，不代表已兼容所有報價單格式
5. 本輪雖已完成多條主線補強，但不代表所有工作台都已完全封板

---

# 8. 若新對話要怎麼叫回來

可直接這樣叫回來：
- `請先讀 MD16，再續接 projectflow。`
- `請先讀 MD16、MD15、MD14，再幫我判斷下一步。`
- `請以 MD16 為準，直接進正式驗收模式。`
- `請先讀 MD16，再幫我整理還沒封板的模組。`

---

# 9. 一句話交接

> 這一輪已完成 vendors 工種治理、vendors 財務承接、任務發佈區報價單式 Excel 匯入，且自動推進 cron 已停用；`projectflow` 現在應優先進正式驗收，而不是再無止境開新需求。
