#!/bin/sh
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$PROJECT_ROOT"
cp .env.acceptance .env.local
unset NODE_ENV
printf '%s\n' '[projectflow] environment=acceptance (.env.acceptance -> .env.local, NODE_ENV cleared for next dev)'
exec npm run dev
