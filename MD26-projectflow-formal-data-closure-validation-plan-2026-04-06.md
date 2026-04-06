# MD26 - projectflow 正式資料閉環驗收主線與工作排程（2026-04-06）

> 目的：把使用者最新指定的驗收情境，轉成後續每次續接 `projectflow` 時都應優先承接的正式工作主線。

---

# 1. 使用者要驗的情境（最新正式驗收目標）

使用者要驗的，不只是 DB Phase 1 schema / migration / DAL 是否存在，而是：

> **三條主線在前端可以新增正式資料，不再吃假資料，並順利接到最後的文件產出。**

正式拆解如下：
1. 三條主線前端頁面不能再只靠 mock data / local fake store 驅動
2. 使用者在前端新增 / 編輯的資料，要能進正式資料層
3. `執行處理` 區的 live plans 要有正式資料承接
4. `全部確認` 要形成正式 confirmation snapshot
5. 最後文件頁 / 文件產出要能吃正式資料結果，而不是假資料投影

補充判斷：
- 這個驗收情境是 **端到端正式資料閉環驗收**
- 不是單純 schema 完成驗收
- 不是單純 migration 可跑驗收
- 不是單純 repo method 存在驗收

---

# 2. 對應的正式任務流程

依目前工程狀態，後續主線任務流程應改理解為：

## Phase A — DB 主幹起步（已完成到一半）
1. Phase 1 migration scaffold
2. smoke check scripts
3. DAL skeleton
4. pg-backed read repositories
5. source-of-truth 第一批 write repositories

狀態：**已完成到 task 主表層 read/write。**

## Phase B — 補齊 live plans + confirmations + snapshots（下一個必要主線）
1. `design_task_plans` read/write
2. `procurement_task_plans` read/write
3. `vendor_task_plans` read/write
4. `task_confirmations.insert`
5. `task_confirmation_plan_snapshots.insert`

正式意義：
> 讓 `執行處理 -> 全部確認 -> snapshot` 這條資料主幹成立。

## Phase C — 補 service layer
1. 任務發布 -> task 建立 service
2. plan 儲存 / 更新 service
3. `全部確認` service
4. confirmation + snapshot 封裝

正式意義：
> 讓前端不用直接碰 raw repo，能以 workflow 語意呼叫正式資料流程。

## Phase D — 先完成單條主線正式資料閉環（優先：設計線）
建議優先順序：
1. 設計線
2. 備品線
3. vendor 線

原因：
- 設計線最適合作為第一條正式資料閉環驗收線
- vendor 線還牽涉 package / 最終文件承接，複雜度最高，應最後做

## Phase E — 設計線正式閉環驗收目標
1. 任務發布可建立正式 `design_tasks`
2. 設計任務詳情頁可新增 / 編輯正式 `design_task_plans`
3. `全部確認` 可正式寫入 `task_confirmations`
4. `task_confirmation_plan_snapshots` 形成正式版本
5. 設計文件頁改為讀正式 confirmation / snapshot 結果
6. 前端不再只吃 mock

### Phase E-1 — live plan 編輯層後續升級方案（B 做法，已記錄）
針對設計線 detail 頁的 live plan 編輯層，後續應升級為真正的 diff-based 同步模型，而不是長期停留在全量重建。

B 做法定義如下：
- 新增的 plan → `insert`
- 已存在且被修改的 plan → `update`
- 被刪除的 plan → `delete`
- 未變更的 plan → 保留
- confirm 時再以乾淨的 live plan 集合做 snapshot

B 做法的定位：
- 這是較正式、較長期的工程升級路線
- 有利於保留 row identity、updated_at、刪改語意與後續 audit / 歷史能力
- 但不適合作為本輪驗收的優先修法，因為會增加範圍、風險與收斂時間

本輪處理原則：
- 先採 A 做法完成驗收修正
- 設計線驗收通過後，再把 B 做法列入下一階段工程升級

## Phase F — 複製模式到備品線
設計線驗通後，將同模式推到備品線。

## Phase G — vendor 線（狀態已更新）

### G-1 已完成到哪裡
vendor 線目前已完成第一段：
- vendor task
- vendor plans
- confirmation
- snapshot
- vendor task 文件頁第一版承接

這代表 vendor task 層的第一版正式資料閉環已經打通，但**還不能視為 vendor 真正閉環完成**。

### G-2 目前仍未完成的關鍵缺口
vendor 真閉環尚未完成的原因是：
- `package / 最終文件承接層` 仍未完整正式化
- `/vendor-packages`
- `/vendor-packages/[id]`
- `vendorPackages` mock source
- `vendor-package-store`
- package 與 financial / summary 承接
仍然停留在 mock / 前端 store 模型

### G-3 驗收標準已提高（重要）
目前標準已改為：

> **vendor 線只有在 package / 最終文件承接層補齊後，才算真正閉環。**

因此目前狀態應標記為：
- 設計線：第一版正式資料閉環驗收完成
- 備品線：第一版正式資料閉環驗收完成
- vendor 線：task / plans / confirm / snapshot 已完成，但 package / 最終文件承接未完成，因此整體閉環尚未完成

### G-4 後續執行方向已改為完整功能模式
vendor 後續不再走簡化承接版，而改成：

> **vendor package / 最終文件承接完整功能模式**

目前確定的執行順序：
1. 建立 db-backed vendor package adapter
2. 讓 `/vendor-packages` 改讀正式 package source
3. 讓 `/vendor-packages/[id]` 改讀正式 package source
4. 讓 package source 由 latest confirmation snapshot + project/vendor meta 組成正式 package view
5. 再把 financial / summary 承接層改接正式 package source
6. 最後完成 vendor 真閉環驗收

---

# 3. 後續工作排程（預設優先序）

後續每次續接 `projectflow`，預設依以下優先序推進：

1. **先完成 Phase B**
   - 補 plans + confirmations + snapshots write/read path
2. **再完成 Phase C**
   - 補 service layer
3. **再完成 Phase D / E**
   - 先做設計線正式資料閉環
4. **設計線驗通後，再做備品線**
5. **最後再做 vendor 線與 package 最終承接**

---

# 4. 新對話 / 新 session 的續接規則（重要）

只要之後新對話是要續接 `projectflow`，應優先承接本主線：

> **把 `projectflow` 推進到「前端三條主線不再吃假資料，且能一路接到最後文件產出」的正式資料閉環驗收狀態。**

每次新對話若要續接，應先讀：
1. `MD-MASTER-projectflow-system-source-of-truth.md`
2. `MD21-projectflow-project-detail-responsibility-redistribution-spec-2026-04-05.md`
3. `MD22-projectflow-mock-closed-loop-frontend-execution-brief-2026-04-05.md`
4. `MD23-projectflow-db-schema-v1-draft-2026-04-05.md`
5. `MD24-projectflow-db-schema-v1-table-walkthrough-2026-04-05.md`
6. `MD25-projectflow-db-phase1-migration-plan-2026-04-05.md`
7. 本文件 `MD26-projectflow-formal-data-closure-validation-plan-2026-04-06.md`

---

# 5. 邊界與提醒

## A. 可以預設承接的事
- 把這條主線當成 `projectflow` 目前最高優先的續接任務
- 新 session 續接時優先整理到目前完成點與下一步
- 不讓使用者每次重講驗收目標

## B. 不可誤解成已獲得的權限
- 這不等於之後每次新對話都可在沒有當下批准下，自動開始新的程式修改
- 仍須遵守：**未經明確批准，不自行派工給子 agent，也不自行擴大執行範圍**
- 但可把這條主線視為預設續接任務與工作排程

---

# 6. 一句話總結

之後續接 `projectflow` 的正式主線，已不只是 DB schema，而是：

> **先補完 Phase 1 的 plans / confirmations / snapshots 與 service layer，接著優先完成設計線的正式資料閉環，讓前端不再吃假資料，並能一路接到最終文件產出；備品線其次，vendor 線最後。**
