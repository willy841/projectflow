#!/bin/sh
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$PROJECT_ROOT"
[ -f .env.production-local ] || {
  echo 'Missing .env.production-local. Copy .env.production-local.example and fill in the local official DB connection first.' >&2
  exit 1
}
cp .env.production-local .env.local
unset NODE_ENV
printf '%s\n' '[projectflow] environment=production-local (.env.production-local -> .env.local, NODE_ENV cleared for next dev)'
exec npm run dev
