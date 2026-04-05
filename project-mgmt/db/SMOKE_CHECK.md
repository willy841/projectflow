# DB Phase 1 smoke check

## 目標
驗證 `0001_projectflow_phase1` 是否可：
1. apply 成功
2. 看得到預期 tables
3. rollback 成功
4. rollback 後 tables 消失

## 已補好的腳本
- `db/scripts/check-phase1-sql.sh`
  - 不依賴 PostgreSQL
  - 只檢查 migration 結構是否完整
- `db/scripts/smoke-check-phase1.sh`
  - 需要 `psql`
  - 需要 `DATABASE_URL` 或 `POSTGRES_URL`
  - 會真的跑 apply / rollback

## 本地先做的最低檢查
```bash
bash db/scripts/check-phase1-sql.sh
```

## 真正 smoke check
```bash
export DATABASE_URL='postgres://...'
bash db/scripts/smoke-check-phase1.sh
```

## 預期結果
- apply 後列出 11 張 Phase 1 tables
- rollback 後該查詢結果應為空

## 若失敗，優先檢查
1. 有沒有 `psql`
2. `DATABASE_URL` 是否有效
3. 目標 DB 是否允許 `pgcrypto`
4. 目標 DB 是否已有同名 tables / triggers / function
