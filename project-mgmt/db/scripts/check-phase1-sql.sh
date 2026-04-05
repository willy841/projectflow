#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
UP_SQL="$ROOT_DIR/db/migrations/0001_projectflow_phase1/up.sql"
DOWN_SQL="$ROOT_DIR/db/migrations/0001_projectflow_phase1/down.sql"

for file in "$UP_SQL" "$DOWN_SQL"; do
  if [[ ! -f "$file" ]]; then
    echo "missing file: $file" >&2
    exit 1
  fi
  echo "==> checking $(basename "$file")"
  grep -q "begin;" "$file"
  grep -q "commit;" "$file"
done

grep -q "create table if not exists projects" "$UP_SQL"
grep -q "create table if not exists task_confirmations" "$UP_SQL"
grep -q "create table if not exists task_confirmation_plan_snapshots" "$UP_SQL"
grep -q "drop table if exists task_confirmation_plan_snapshots;" "$DOWN_SQL"
grep -q "drop table if exists projects;" "$DOWN_SQL"

echo "phase1 sql structure check passed"
