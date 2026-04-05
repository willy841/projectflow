# 0001_projectflow_phase1

這是 `projectflow` DB Phase 1 的正式 migration 目錄版本。

## 檔案
- `up.sql`: 建立 Phase 1 最小起步集
- `down.sql`: 回滾 Phase 1 最小起步集

## 套用方式（暫定）
因 repo 目前尚未導入既有 migration runner，先以原生 PostgreSQL 方式執行：

```bash
psql "$DATABASE_URL" -f db/migrations/0001_projectflow_phase1/up.sql
```

回滾：

```bash
psql "$DATABASE_URL" -f db/migrations/0001_projectflow_phase1/down.sql
```

## 備註
- 舊檔 `db/migrations/20260405_projectflow_phase1.sql` 可視為同內容草稿版，後續可退休。
- 本階段刻意不含 document copy / vendor_packages / quote_cost tables。
