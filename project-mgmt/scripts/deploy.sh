#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$PROJECT_ROOT/.." && pwd)

MODE=${1:-deploy}
DEPLOY_PROJECT=${DEPLOY_PROJECT:-project-mgmt-web}
DEPLOYMENTS_DIR=${DEPLOYMENTS_DIR:-"$WORKSPACE_ROOT/deployments"}
TARGET_DIR=${TARGET_DIR:-"$DEPLOYMENTS_DIR/$DEPLOY_PROJECT"}
DEPLOYER_URL=${DEPLOYER_URL:-http://webapp-deployer:8081}
TOKEN_FILE=${TOKEN_FILE:-"$WORKSPACE_ROOT/.secrets/webapp-deploy-token"}

log() {
  printf '%s\n' "$*"
}

fail() {
  printf 'deploy.sh: %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "missing required command: $1"
}

load_token() {
  if [ "${DEPLOY_TOKEN:-}" ]; then
    printf '%s' "$DEPLOY_TOKEN"
    return 0
  fi

  if [ -f "$TOKEN_FILE" ]; then
    tr -d '\r\n' <"$TOKEN_FILE"
    return 0
  fi

  fail "missing DEPLOY_TOKEN and token file: $TOKEN_FILE"
}

sync_project() {
  mkdir -p "$DEPLOYMENTS_DIR"
  mkdir -p "$TARGET_DIR"

  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete \
      --exclude '.git' \
      --exclude 'node_modules' \
      --exclude '.next' \
      --exclude '.env*' \
      --exclude 'deployments' \
      --exclude '.openclaw' \
      --exclude '.tmp' \
      --exclude 'playwright-report' \
      --exclude 'test-results' \
      --exclude 'tests' \
      "$PROJECT_ROOT"/ "$TARGET_DIR"/
    return 0
  fi

  rm -rf "$TARGET_DIR"
  mkdir -p "$TARGET_DIR"

  (
    cd "$PROJECT_ROOT"
    tar -cf - .
  ) | (
    cd "$TARGET_DIR"
    tar -xf -
  )

  rm -rf \
    "$TARGET_DIR/.git" \
    "$TARGET_DIR/node_modules" \
    "$TARGET_DIR/.next" \
    "$TARGET_DIR/deployments" \
    "$TARGET_DIR/.openclaw" \
    "$TARGET_DIR/.tmp" \
    "$TARGET_DIR/playwright-report" \
    "$TARGET_DIR/test-results" \
    "$TARGET_DIR/tests"

  find "$TARGET_DIR" -maxdepth 1 -type f -name '.env*' -delete
}

write_docker_assets() {
  cat >"$TARGET_DIR/Dockerfile" <<'EOF'
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV PROJECTFLOW_USE_PGMEM=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build && npm prune --omit=dev

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
EOF

  cat >"$TARGET_DIR/.dockerignore" <<'EOF'
.git
node_modules
.next
.env
.env.local
.env.development
.env.production
playwright-report
test-results
tests
deployments
.openclaw
.tmp
EOF
}

prepare() {
  [ -f "$PROJECT_ROOT/package.json" ] || fail "missing package.json in $PROJECT_ROOT"
  [ -f "$PROJECT_ROOT/package-lock.json" ] || fail "missing package-lock.json in $PROJECT_ROOT"

  sync_project
  write_docker_assets

  log "Prepared deployment package:"
  log "  source: $PROJECT_ROOT"
  log "  target: $TARGET_DIR"
  log "  project: $DEPLOY_PROJECT"
}

deploy() {
  require_cmd curl
  token=$(load_token)

  prepare

  log "Calling deployer: $DEPLOYER_URL/deploy"
  curl -fsS -X POST "$DEPLOYER_URL/deploy" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d "{\"project\":\"$DEPLOY_PROJECT\"}"
  printf '\n'
}

status() {
  require_cmd curl
  token=$(load_token)

  curl -fsS \
    -H "Authorization: Bearer $token" \
    "$DEPLOYER_URL/status"
  printf '\n'
}

usage() {
  cat <<EOF
Usage:
  $(basename "$0") prepare
  $(basename "$0") deploy
  $(basename "$0") status

Environment overrides:
  DEPLOY_PROJECT   default: $DEPLOY_PROJECT
  DEPLOYMENTS_DIR  default: $DEPLOYMENTS_DIR
  TARGET_DIR       default: $TARGET_DIR
  DEPLOYER_URL     default: $DEPLOYER_URL
  TOKEN_FILE       default: $TOKEN_FILE
  DEPLOY_TOKEN     bearer token; overrides TOKEN_FILE
EOF
}

case "$MODE" in
  prepare)
    prepare
    ;;
  deploy)
    deploy
    ;;
  status)
    status
    ;;
  *)
    usage
    exit 1
    ;;
esac
