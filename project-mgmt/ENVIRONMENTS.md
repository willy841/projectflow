# projectflow environment split

## Acceptance / 驗收測試站
- env source: `.env.acceptance`
- start command: `npm run dev:acceptance`
- role: 驗收一般 projectflow 主功能
- current DB path: Supabase transaction pooler

## Production Local / 正式站
- env source: `.env.production-local`
- template: `.env.production-local.example`
- start command: `npm run dev:production-local`
- role: 正式站 / auth / RBAC / system settings 驗收
- target DB path: 本機正式 DB（需填入實際 connection string 後才能正式切換）

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
