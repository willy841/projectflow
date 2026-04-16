# Projectflow 正式 DB 測試資料治理與清除方案

## 目標
把正式驗收前的 DB 測試資料治理收斂成可執行方案，避免 fixture / seed / 手動驗收資料殘留在正式流程中。

## 範圍
只處理 **project-scoped 正式資料**：
- `projects`
- `project_execution_items`
- `project_requirements`
- `design_tasks` / `design_task_plans`
- `procurement_tasks` / `procurement_task_plans`
- `vendor_tasks` / `vendor_task_plans`
- `task_confirmations` / `task_confirmation_plan_snapshots`
- `financial_manual_costs`
- `financial_reconciliation_groups`
- `project_collection_records`
- `project_vendor_payment_records`

不主動清：
- `vendors`
- `vendor_trade_catalog`
- accounting 員工 / 分類 master data

原因：這些表不是純 project-scoped，直接刪容易誤傷其他正式資料。

## 治理規則
1. **正式驗收一律用 DB UUID project route 進入**，不要從舊 mock route 驗收。
2. **測試資料以 project 為最小清除單位**，不要零散手刪 task / plan，避免留下 orphan-like 業務殘影。
3. 清除前先用 dry-run 核對目標專案，再執行 delete。
4. 若測試資料需要長留，專案 code 必須明確標記，例如 `TEST-`, `UAT-`, `SANDBOX-`。
5. 若 vendor 是跨專案共用，不跟著 project cleanup 一起硬刪；由營運人工判斷是否保留。

## 執行方式
### 1) 先 dry-run
```bash
psql "$DATABASE_URL" \
  -v project_code='PF-TEST-001' \
  -f db/scripts/projectflow-formal-test-data-cleanup.sql
```

或：
```bash
psql "$DATABASE_URL" \
  -v project_id='00000000-0000-0000-0000-000000000000' \
  -f db/scripts/projectflow-formal-test-data-cleanup.sql
```

### 2) 確認 target 後再正式刪除
```bash
psql "$DATABASE_URL" \
  -v execute_delete=on \
  -v project_code='PF-TEST-001' \
  -f db/scripts/projectflow-formal-test-data-cleanup.sql
```

## 驗收前檢查清單
- 正式 route 不再依賴 mock document component
- 正式任務頁 message 不再把 mock 當 fallback 引導
- DB 測試資料可用單一 project cleanup script 回收
- empty state / error state 在無資料時不再顯示像「壞掉」或「還在 mock」的訊號

## 備註
本方案目前已完整覆蓋工作包 A 要求的「正式 DB 測試資料治理與清除方案」。若未來 vendor / accounting 也要做成可安全刪除，應另補 scoped cleanup policy，不要直接擴寫到這份腳本。 
