# Projectflow host-side redeploy runbook — 2026-05-12

Status: active

## Purpose

This runbook exists to prevent confusion between:
- code changes completed inside the current OpenClaw workspace session
- deployment package updated locally inside the container workspace
- actual host-side redeploy into the real `webapp-platform` runtime

The current known issue was initially suspected to be an app-version mismatch, but later live investigation clarified an additional concrete factor:

- the live official DB schema was missing `projects.owner`
- the live error was `column p.owner does not exist`

That live DB issue was the direct runtime cause for the broken `/` root route at that time.

Therefore two things must both be kept correct:
1. the real official runtime must be updated through the **host-side deploy chain**, not the container-side default-token assumption
2. the schema fix must be preserved in repo migration history so future clean-start / rebuild / redeploy flows do not regress

---

## 1. Canonical host-side deploy path

Use this exact host-side source project:

- `/Users/user/openclaw-secure/data/workspace/project-mgmt`

Use this exact host-side deployment target:

- `/Users/user/openclaw-secure/data/workspace/deployments/project-mgmt-web`

Use this exact host-side deployer URL:

- `http://127.0.0.1:8081`

Deployment project name:

- `project-mgmt-web`

Do **not** treat `/Users/user/webapp-platform` as the source checkout.
That path is runtime stack territory, not the source project working copy.

---

## 2. Why this runbook matters

During this session, the following was proven:
- local repo fixes existed
- local `prepare` updated the in-container deployment package
- but the live official runtime still reflected an older version

This means:
- local workspace changes alone are not enough
- updated deploy package inside the container is not enough
- the official runtime must be redeployed through the real host-side deploy chain

---

## 3. Required host-side deploy commands

### Redeploy latest version

```bash
cd /Users/user/openclaw-secure/data/workspace/project-mgmt
DEPLOYER_URL=http://127.0.0.1:8081 sh ./scripts/deploy.sh deploy
```

### Check deploy/runtime status

```bash
cd /Users/user/openclaw-secure/data/workspace/project-mgmt
DEPLOYER_URL=http://127.0.0.1:8081 sh ./scripts/deploy.sh status
```

---

## 4. What must be true before treating redeploy as complete

Do not say redeploy is complete unless all of the following are true:

1. host-side deploy command finished successfully
2. deployer returned success JSON / success status
3. live runtime reflects the new behavior
4. the target route is re-verified from the public hostname

---

## 5. Current root-route fix context

The current local repo includes multiple `/` hardening attempts, and the latest direction includes root-route handling intended to avoid the isolated `/` failure path.

However, until the host-side redeploy actually runs, none of those fixes should be described as live in production.

This distinction is mandatory:
- **local code fixed** is not the same as
- **official runtime updated**

---

## 6. Post-redeploy verification checklist

After host-side redeploy, verify at least:

### Public entry
- `https://pmis.kuya.tw/`
- `https://pmis.kuya.tw/login`

### Authenticated core pages
- `/projects`
- `/vendors`
- `/quote-costs`
- `/accounting-center`

### Root-route-specific verification
Because `/` has been the isolated failing route, verify it separately and do not assume it is fine just because other pages are fine.

Required result:
- `/` no longer shows the prior server-component failure state
- if the root workaround is active, behavior should reflect the newly deployed version rather than the old homepage failure path

---

## 7. Reporting template

When reporting status after host-side redeploy, use this structure:

1. Host-side deploy command: succeeded / failed
2. Host-side status command: succeeded / failed
3. Public hostname result: `/login` ok / failed
4. Public hostname root `/` result: ok / failed
5. Authenticated pages: list page-by-page results
6. Final conclusion: live runtime updated or not updated

---

## 8. One-line conclusion

> The official `projectflow` runtime must be updated through the host-side deploy chain at `/Users/user/openclaw-secure/data/workspace/project-mgmt` using `DEPLOYER_URL=http://127.0.0.1:8081`; local repo changes and container-side package updates alone do not count as a live production redeploy.
