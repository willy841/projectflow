# Projectflow production runtime verification conclusion — 2026-05-12

Status: active

## Scope

This conclusion covers the local official `projectflow` runtime after:
- deploy path success
- local `webapp-db` schema alignment
- admin login verification
- external HTTPS access via ngrok tunnel

This is a runtime-verification conclusion, not a deploy-path design memo.

---

## 1. Verified completed state

### Deploy and runtime base
Verified:
- `project-mgmt-web` deploy completed successfully
- `webapp-app` is connected to local `webapp-db`
- local `webapp-db` schema is aligned to the required `project-mgmt` schema
- current known schema reference count: **29 tables**
- acceptance sample seed was **not** imported into the official local DB

### Anonymous route verification
Verified normal:
- `/login`
- `/`
- `/projects`
- `/vendors`
- `/quote-costs`
- `/accounting-center`

Conclusion:
- the runtime is no longer in missing-table failure state
- anonymous route access no longer fails from basic schema/runtime breakage

### External HTTPS verification
Verified:
- ngrok tunnel established successfully
- official local runtime became externally reachable through HTTPS
- external login page opened successfully

Meaning:
- the local official runtime is now externally reachable without relying on router port forwarding as the first step

### Admin authentication verification
Verified:
- admin account used for verification: `willy@kuya.tw`
- admin login succeeded
- authenticated navigation to major pages succeeded

### Authenticated page verification
Verified normal after admin login:
- `/`
- `/projects`
- `/vendors`
- `/quote-costs`
- `/accounting-center`

Conclusion:
- the main authenticated runtime path is functioning
- current blocker is no longer deploy, schema alignment, login failure, or major-page runtime failure

---

## 2. Root-route incident clarification

A server-component render error was repeatedly observed on the public root route `/`.
Later live investigation identified the concrete production cause:

- live official DB schema was missing `projects.owner`
- the live error was:
  - `column p.owner does not exist`

Meaning:
- the fault was not primarily caused by DNS
- not primarily caused by tunnel wiring
- not primarily caused by public hostname exposure itself
- and not primarily caused by a generic deploy-path failure

The immediate live runtime issue was resolved by fixing the live DB schema.

Follow-up requirement:
- this schema fix must also exist in repo migration history so future clean-start / rebuild / redeploy flows do not regress and omit `projects.owner` again

---

## 3. Current blocker status

No longer treated as blockers:
- deploy path
- local official DB missing-table alignment
- external HTTPS entry
- admin login
- authenticated access to main core pages

Still separate future scopes:
- whether to replace temporary ngrok hostname with official subdomain `pmis.kuya.tw`
- whether to harden long-term official external exposure architecture
- whether to add deeper authenticated regression coverage beyond current core pages

---

## 4. Current recommended next stage

The correct next stage after this conclusion is:

### Stage A — close current verification scope
- keep this verification result as the official runtime checkpoint
- keep clean-start / schema-only initialization guidance as operating reference

### Stage B — upgrade external hostname
- move from temporary ngrok external hostname toward official subdomain strategy
- evaluate stable long-term exposure path for `pmis.kuya.tw`

This sequencing is intentional:
- first prove the local official runtime works
- then upgrade the public entrypoint

---

## 5. Final conclusion

> As of 2026-05-12, the local official `projectflow` runtime has successfully crossed the critical deployment and runtime gates: deploy completed, local `webapp-db` schema alignment is in place, external HTTPS access via ngrok is working, admin login is working, and the authenticated core pages (`/`, `/projects`, `/vendors`, `/quote-costs`, `/accounting-center`) have verified normal access. The current mainline is no longer base repair; it is operational closure and the later upgrade from temporary tunnel hostname to official subdomain exposure.
