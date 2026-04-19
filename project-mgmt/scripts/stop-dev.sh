#!/bin/sh
set -eu
pkill -f "next dev" || true
pkill -f "next dev --webpack" || true
printf '%s\n' '[projectflow] stopped all next dev processes'
