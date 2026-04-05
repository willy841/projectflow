#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
MIGRATION_DIR="$ROOT_DIR/db/migrations/0001_projectflow_phase1"
UP_SQL="$MIGRATION_DIR/up.sql"
DOWN_SQL="$MIGRATION_DIR/down.sql"

if ! command -v psql >/dev/null 2>&1; then
  echo "[phase1-smoke] missing dependency: psql" >&2
  exit 2
fi

DB_URL="${DATABASE_URL:-${POSTGRES_URL:-}}"
if [[ -z "$DB_URL" ]]; then
  echo "[phase1-smoke] missing DATABASE_URL or POSTGRES_URL" >&2
  exit 3
fi

echo "[phase1-smoke] applying migration..."
psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$UP_SQL"

echo "[phase1-smoke] verifying expected tables..."
psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'projects',
    'vendors',
    'project_execution_items',
    'design_tasks',
    'procurement_tasks',
    'vendor_tasks',
    'design_task_plans',
    'procurement_task_plans',
    'vendor_task_plans',
    'task_confirmations',
    'task_confirmation_plan_snapshots'
  )
order by tablename;
SQL

echo "[phase1-smoke] rolling back migration..."
psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$DOWN_SQL"

echo "[phase1-smoke] verifying rollback..."
psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'projects',
    'vendors',
    'project_execution_items',
    'design_tasks',
    'procurement_tasks',
    'vendor_tasks',
    'design_task_plans',
    'procurement_task_plans',
    'vendor_task_plans',
    'task_confirmations',
    'task_confirmation_plan_snapshots'
  )
order by tablename;
SQL

echo "[phase1-smoke] done"
