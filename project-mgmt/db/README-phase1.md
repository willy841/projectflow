# projectflow DB Phase 1

這一版先落最小起步集，對齊 `MD25-projectflow-db-phase1-migration-plan-2026-04-05.md`。

## 範圍
- `projects`
- `vendors`
- `project_execution_items`
- `design_tasks`
- `procurement_tasks`
- `vendor_tasks`
- `design_task_plans`
- `procurement_task_plans`
- `vendor_task_plans`
- `task_confirmations`
- `task_confirmation_plan_snapshots`

## 刻意不含
- 文件副本層 tables
- `vendor_packages`
- `quote_cost_*`
- 匯出 / 複製 / 歷史版本表

## 目前選擇
因 repo 內尚無既有 ORM / migration framework，先用 SQL migration 落地，並收成正式 migration 目錄結構，避免為了先選框架而打歪 DB Phase 1 主線。

## 重要規則
- `全部確認` 採 snapshot / version 模型，不採單純 flag。
- `task_confirmations` 目前採 `flow_type + task_id` polymorphic 設計，符合 `MD25` 第一版建議。
- 金額欄位直接使用 `numeric(12,2)`。
- `vendor_tasks.vendor_id` 在任務建立時即指定，符合 `MD21` / `MD24`。

## 目前檔案
- 正式 migration 目錄：`db/migrations/0001_projectflow_phase1/`
  - `up.sql`
  - `down.sql`
  - `README.md`
- 早期草稿：`db/migrations/20260405_projectflow_phase1.sql`

## 下一步建議
1. 用真 PostgreSQL 做一次 apply / rollback smoke check
2. 確認後再決定是否退休單檔草稿版
3. 再接 Phase 1 data access layer / repo types
