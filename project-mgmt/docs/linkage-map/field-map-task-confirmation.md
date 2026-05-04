# 三條任務線欄位

## 核心規則
這三條線真正正式成立，不是看有沒有回覆，而是看：
- `task_confirmations`
- `task_confirmation_plan_snapshots`

也就是：**按下全部確認後才算正式承接。**

## 欄位：Design 執行處理內容
- 你在哪裡改：`Design Tasks`
- 寫到哪裡：`design_task_plans`
- 哪裡會變：
  - `Design Tasks` 本頁
  - 按 `全部確認` 之前，不算正式下游資料
- 成立條件：先存 plans，再按 `全部確認`

## 欄位：Procurement 執行處理內容
- 你在哪裡改：`Procurement Tasks`
- 寫到哪裡：`procurement_task_plans`
- 哪裡會變：
  - `Procurement Tasks` 本頁
  - 按 `全部確認` 前，不進正式下游
- 成立條件：先存 plans，再按 `全部確認`

## 欄位：Vendor 發包內容
- 你在哪裡改：`Vendor Assignments`
- 寫到哪裡：`vendor_task_plans`
- 哪裡會變：
  - `Vendor Assignments` 本頁
  - 按 `全部確認` 前，不進正式下游
- 成立條件：先存 plans，再按 `全部確認`

## 動作：全部確認（Design / Procurement / Vendor）
- 寫到哪裡：
  - `task_confirmations`
  - `task_confirmation_plan_snapshots`
- 哪裡會變：
  - `Quote Cost` 成本來源
  - 文件頁
  - 首頁待處理卡片
  - Vendor 線另外還會影響 `Vendor Detail` / `Vendor Packages`
- 成立條件：按下 `全部確認`

## Vendor 線特例：再次全部確認
- 現在規則：
  - 如果內容沒變 → 沿用既有 confirmation
  - 如果內容有變 → 刪舊 confirmed data，改寫成最新 confirmed data
- 影響：
  - `Vendor Packages`
  - `Vendor Detail`
  - `Quote Cost`
