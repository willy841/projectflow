# projectflow environment split

## Acceptance / 驗收測試站
- env source: `.env.acceptance`
- start command: `npm run dev:acceptance`
- role: 驗收一般 projectflow 主功能
- current DB path: Supabase transaction pooler
- runtime note: start script will copy `.env.acceptance` to `.env.local` and clear inherited `NODE_ENV` before `next dev`

## Production Local / 正式站
- env source: `.env.production-local`
- template: `.env.production-local.example`
- start command: `npm run dev:production-local`
- role: 正式站 / auth / RBAC / system settings 驗收
- target DB path: 本機正式 DB（需填入實際 connection string 後才能正式切換）
- runtime note: start script will copy `.env.production-local` to `.env.local` and clear inherited `NODE_ENV` before `next dev`

## Deploy path / 正式 deploy
- entry: `./scripts/deploy.sh prepare|deploy|status`
- role: 透過 `webapp-deployer` 產生 deploy package 與送出部署
- rule: deploy path 不使用 acceptance env，也不依賴 `.env.local` bridge
- rule: deploy package 會排除 `.env*`

## Responsibility boundary
- `.env.acceptance` 是 acceptance source of truth
- `.env.production-local` 是 production-local source of truth
- `.env.local` 目前只是給 local Next.js runtime 使用的 bridge file，不是正式 owner
- 正式 deploy runtime 與 acceptance runtime 是不同路徑，不可混稱

See also:
- `docs/projectflow-acceptance-env-and-deploy-separation-rules-2026-04-26.md`

## Process hygiene
Before switching environments, always run:

```bash
npm run dev:stop
npm run dev:status
```

Then start exactly one environment:

```bash
npm run dev:acceptance
# or
npm run dev:production-local
```
