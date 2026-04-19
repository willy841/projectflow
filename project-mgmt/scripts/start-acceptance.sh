#!/bin/sh
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$PROJECT_ROOT"
cp .env.acceptance .env.local
printf '%s\n' '[projectflow] environment=acceptance (.env.acceptance -> .env.local)'
exec npm run dev
