# Phase 1 DAL skeleton

這一層先只做 **types + client contract + repository interface skeleton**。

## 目的
- 讓 DB Phase 1 不停在 migration 檔案
- 先把 app 端會依賴的資料介面站穩
- 暫時不引入 ORM，避免現在又打開工具選型討論

## 檔案
- `phase1-types.ts`
- `phase1-inputs.ts`
- `phase1-client.ts`
- `phase1-sql.ts`
- `phase1-repositories.ts`

## 目前狀態
- 已對齊 migration tables 與主要欄位
- 已定義 insert / update input types
- 已定義 Phase1DbClient contract
- 已定義 repo methods skeleton
- 尚未接實際 PostgreSQL runtime client
- 尚未填入 SQL query implementation

## 下一步
1. 決定 runtime client（例如 `pg`）
2. 補 `Phase1DbClient` adapter
3. 先實作最小讀取路徑：
   - projects
   - project_execution_items
   - design/procurement/vendor tasks
4. 再補 plans / confirmations write path
