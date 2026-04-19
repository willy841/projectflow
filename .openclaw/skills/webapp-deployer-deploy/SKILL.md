---
name: webapp-deployer-deploy
description: Use when deploying a workspace-built web application from OpenClaw into the local webapp-platform deployer. This skill packages a project into /home/node/.openclaw/workspace/deployments/<project-name>, ensures a Dockerfile exists, and calls http://webapp-deployer:8081/deploy with the deployment token.
---

# Webapp Deployer Deploy

Use this skill when the user wants OpenClaw to deploy a website or internal webapp into the local Docker runtime, not to GitHub Pages or Vercel.

## Deployment Contract

- Workspace root: `/home/node/.openclaw/workspace`
- Shared deployments directory: `/home/node/.openclaw/workspace/deployments`
- Deployer URL inside Docker network: `http://webapp-deployer:8081`
- Token file: `/home/node/.openclaw/workspace/.secrets/webapp-deploy-token`
- The deploy target directory must contain a `Dockerfile`
- The deployed container must listen on port `3000`

## Default Project

For the project management system, use:

- source project: `/home/node/.openclaw/workspace/project-mgmt`
- deployment project name: `project-mgmt-web`
- deploy script: `/home/node/.openclaw/workspace/project-mgmt/scripts/deploy.sh`

## Workflow

1. Confirm the source project is the intended one.
2. Check whether the deploy token exists at `/home/node/.openclaw/workspace/.secrets/webapp-deploy-token`.
3. If the token is missing and no `DEPLOY_TOKEN` env var was provided, stop and ask the user for it. Do not invent or hardcode secrets.
4. Run:

```bash
cd /home/node/.openclaw/workspace/project-mgmt
./scripts/deploy.sh deploy
```

5. Inspect the JSON response from `/deploy`.
6. Run:

```bash
cd /home/node/.openclaw/workspace/project-mgmt
./scripts/deploy.sh status
```

7. Report:
   - deployment package path
   - deployed project name
   - deploy API result
   - runtime status result
   - final user-facing URL

## Prepare-Only Mode

If the user wants packaging without publishing, run:

```bash
cd /home/node/.openclaw/workspace/project-mgmt
./scripts/deploy.sh prepare
```

This syncs the source project into `/home/node/.openclaw/workspace/deployments/project-mgmt-web` and writes deployment Docker assets there.

## Failure Checklist

- `401 Unauthorized`: token missing or wrong
- `404 Project not found`: deployment directory name does not match `project` in the POST body
- `400 Missing Dockerfile`: packaging step did not complete
- build failure: inspect the deploy API stderr/stdout and fix the app build first

## Runtime DB Connection (Projectflow)

When the deployed `project-mgmt` app needs DB mode or runtime validation against the project database, prefer the Supabase Transaction Pooler instead of the direct host.

- Provider: Supabase Postgres
- Project ref: `vkjabxekxnnczpulumod`
- Preferred connection path: **Transaction Pooler**
- Recommended `DATABASE_URL` pattern:

```text
postgresql://postgres.vkjabxekxnnczpulumod:<PASSWORD>@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

Current workspace-known password:

```text
9RnTuDvsNruISgaE
```

Projectflow DB env switches for DB mode:

```text
PROJECTFLOW_USE_DB_PROJECT=1
PROJECTFLOW_USE_DB_DESIGN=1
PROJECTFLOW_USE_DB_PROCUREMENT=1
PROJECTFLOW_USE_DB_VENDOR=0
PROJECTFLOW_USE_PGMEM=0
```

If runtime DB access fails on `db.vkjabxekxnnczpulumod.supabase.co`, switch to the Transaction Pooler URI before assuming the app code is broken.

## Notes

- This deployer replaces the currently served app in the shared `webapp-platform`
- It is a single-runtime deployment target, not a multi-site hosting platform
- Prefer using the deploy script instead of manually copying files or crafting curl commands
