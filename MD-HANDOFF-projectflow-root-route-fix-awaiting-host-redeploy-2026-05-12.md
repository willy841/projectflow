# MD-HANDOFF — projectflow root route fix awaiting host-side redeploy — 2026-05-12

## 1. Task goal

The immediate task is no longer to guess why `/` still looks unchanged from the public hostname.
The current task is:

> **Push the latest root-route fixes into the real official runtime through the host-side deploy chain, then re-verify `pmis.kuya.tw/`.**

---

## 2. Critical corrected understanding

The public official hostname `pmis.kuya.tw` was still serving an older deployed version even after several local code fixes were committed.

This means:
- local repo changes were real
- local build success was real
- local deployment package updates were real
- but the live official runtime had **not yet been proven updated**

Do not claim the root-route fix is live until the host-side redeploy has run successfully.

---

## 3. Canonical redeploy chain

Use:
- source project: `/Users/user/openclaw-secure/data/workspace/project-mgmt`
- deployment target: `/Users/user/openclaw-secure/data/workspace/deployments/project-mgmt-web`
- deployer URL: `http://127.0.0.1:8081`

Canonical commands:

```bash
cd /Users/user/openclaw-secure/data/workspace/project-mgmt
DEPLOYER_URL=http://127.0.0.1:8081 sh ./scripts/deploy.sh deploy
```

```bash
cd /Users/user/openclaw-secure/data/workspace/project-mgmt
DEPLOYER_URL=http://127.0.0.1:8081 sh ./scripts/deploy.sh status
```

---

## 4. Local fix history already committed

These local commits were produced during the `/` root-route troubleshooting phase:

- `26ddc5c` — degrade homepage overview failures to empty state
- `c6d206c` — harden homepage runtime fallback under cloudflare
- `085ebbf` — remove homepage shell logo dependency
- `ceaf317` — replace homepage with stable entry page
- `a7ff146` — isolate root route from shell chain
- `66a8236` — rewrite authenticated root route to projects

Important:
- these commits exist locally
- they should not be described as live in the official runtime until host-side redeploy is completed

---

## 5. What must be verified after redeploy

Required verification:
- `https://pmis.kuya.tw/login`
- `https://pmis.kuya.tw/`
- authenticated `/projects`
- authenticated `/vendors`
- authenticated `/quote-costs`
- authenticated `/accounting-center`

Special attention:
- `/` has been the isolated failing route
- other pages already proved the broader runtime stack was mostly healthy
- therefore `/` must be checked separately after host-side redeploy

---

## 6. Current truth state

### True
- `pmis.kuya.tw` DNS and Cloudflare Tunnel path are up
- other authenticated core pages were already reported normal
- local fixes were committed
- local build succeeded repeatedly
- host-side deploy path is now clearly identified

### Not yet proven
- that the official runtime has been redeployed with the latest local fixes
- that `/` is fixed in the live public runtime

---

## 7. One-line conclusion

> The root-route troubleshooting phase has already produced multiple local fixes, but the remaining blocker is to push those fixes through the real host-side deploy chain and then re-verify `pmis.kuya.tw/` against the updated official runtime.
