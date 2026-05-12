# Projectflow production runtime verification and clean-start playbook — 2026-05-12

Status: active

## Purpose

This document captures the post-deploy operating path for the local official `projectflow` runtime on Web App Platform.

It is for the phase after:
- `project-mgmt-web` has already been deployed successfully
- `webapp-app` has already been rebuilt and started
- `webapp-db` has already been aligned to the required `project-mgmt` schema
- anonymous routes no longer fail from missing-table runtime errors

This document is **not** about acceptance deploy routing.
It is about:
1. production runtime verification
2. admin account validation / recovery
3. clean-start / schema-only initialization posture
4. what to do later if the local official DB needs to be reset without importing acceptance sample data

---

## 1. Current known production state

Known accepted state for this phase:
- `project-mgmt-web` deploy path is already working
- `webapp-app` is connected to local `webapp-db`
- `webapp-db` has the required `project-mgmt` schema aligned to **29 tables**
- acceptance sample seed has **not** been imported into the official local DB
- `system_users` already contains admin user: `willy@kuya.tw`
- anonymous runtime for the following routes is already responding normally:
  - `/login`
  - `/`
  - `/projects`
  - `/vendors`
  - `/quote-costs`
  - `/accounting-center`

Meaning:
- deploy is no longer the blocker
- missing-table migration failure is no longer the blocker
- the next priority is authenticated runtime verification and operating hygiene

---

## 2. What must be verified next

### 2.1 Admin login verification

Primary goal:
- verify that the existing admin user can actually sign in
- verify whether the password is known and valid
- verify whether the account forces password reset

Relevant auth behavior from code:
- login uses `system_users`
- session uses `auth_sessions`
- if `must_change_password = true`, successful login redirects to `/reset-password`
- if `must_change_password = false`, successful login redirects to `/`

Therefore the correct verification sequence is:
1. attempt login with known admin credentials
2. confirm whether login succeeds
3. if redirected to `/reset-password`, complete password reset flow
4. verify session-protected pages after login

---

### 2.2 Authenticated page verification

After successful admin login, verify at least:
- `/`
- `/projects`
- `/vendors`
- `/quote-costs`
- `/accounting-center`
- optionally `/system-settings`

Verification goal:
- page loads without 500/runtime error
- no missing-table or missing-column error in server logs
- page-level empty states look intentional rather than broken
- auth session persists after navigation / refresh

---

## 3. Admin account handling

### 3.1 Existing admin account

Current known admin:
- `willy@kuya.tw`

### 3.2 Password recovery / reset path

Repo utility:
- `scripts/init-system-owner.js`

Behavior:
- ensures the specified email exists as admin owner
- writes a new password hash
- sets:
  - `role = 'admin'`
  - `is_owner = true`
  - `is_active = true`
- currently sets `must_change_password = false`

Current command shape:

```bash
node scripts/init-system-owner.js <email> [name] <password>
```

Example:

```bash
DATABASE_URL='postgresql://...'
node scripts/init-system-owner.js willy@kuya.tw "Willy Chen" "<NEW_PASSWORD>"
```

Operational note:
- this is appropriate when the admin password is unknown or must be re-established quickly
- because it sets `must_change_password = false`, it is a direct credential reset, not a forced first-login rotation flow

### 3.3 If stricter password-reset posture is desired later

Preferred later improvement:
- add a dedicated admin reset command that sets a temporary password or token
- then force `must_change_password = true`

That is an improvement scope, not a blocker for current production validation.

---

## 4. Clean-start policy

### 4.1 What clean-start means here

For the local official runtime, clean-start means:
- keep system capability
- keep schema
- do not import acceptance sample seed
- do not carry old project-scoped test data into official operation

### 4.2 What must NOT be used for official initialization

Do **not** import:
- `db/seeds/projectflow-formal-acceptance-sample.sql`

Reason:
- it is formal acceptance sample data
- it is not official starting data

### 4.3 Preferred official initialization posture

Preferred official starting shape:
1. schema exists
2. admin/system access exists
3. optional master-data setup is done deliberately
4. no acceptance sample project data is present

---

## 5. Schema-only initialization path

If the local official DB must be rebuilt from scratch later, the preferred path is:

### Step 1 — rebuild/reset the local official DB
- recreate empty DB instance for `webapp-db`
- ensure credentials and runtime connection match the official local stack

### Step 2 — apply schema migrations only
Apply the repo migration chain needed by `project-mgmt`, including auth tables and accounting tables.

Source directory:
- `db/migrations/`

Expected final result:
- official schema aligned to the current `project-mgmt` requirement set
- current known reference count: **29 tables**

### Step 3 — do NOT load acceptance sample seed
Do not run:

```bash
psql "$DATABASE_URL" -f db/seeds/projectflow-formal-acceptance-sample.sql
```

### Step 4 — ensure admin owner
Use:

```bash
node scripts/init-system-owner.js <email> [name] <password>
```

### Step 5 — verify anonymous + authenticated runtime
Anonymous:
- `/login`
- `/`
- `/projects`
- `/vendors`
- `/quote-costs`
- `/accounting-center`

Authenticated:
- same pages after admin login
- plus `/system-settings` if required

---

## 6. If only project data must be cleaned without rebuilding the DB

Use the scoped cleanup policy instead of full DB rebuild.

Reference:
- `db/FORMAL_TEST_DATA_GOVERNANCE.md`
- `db/scripts/projectflow-formal-test-data-cleanup.sql`

This is for:
- removing project-scoped formal/test data
- without deleting shared vendor master data or accounting master data

This is **not** the same thing as full schema-only reset.

---

## 7. Recommended validation conclusion template

Use this structure when reporting production-local runtime status:

1. Deploy status
   - deployed or not
2. Runtime DB target
   - local `webapp-db` or other
3. Schema state
   - aligned or missing items
4. Sample/test data state
   - imported or not imported
5. Anonymous route verification
   - pass/fail by route
6. Authenticated admin verification
   - pass/fail by route
7. Admin credential status
   - confirmed / reset / pending
8. Clean-start readiness
   - ready / not ready

---

## 8. Current recommended next actions

1. verify admin login with the known admin account
2. if password is unknown or invalid, reset it via `init-system-owner.js`
3. verify authenticated runtime pages
4. record final production-local runtime conclusion
5. keep this playbook as the official local runtime restart / clean-start reference

---

## 9. One-line conclusion

> After deploy success and local DB schema alignment, the mainline work is no longer deploy or missing-table repair; it is authenticated production runtime verification, admin credential confirmation, and maintaining a clean-start schema-only initialization path that does not import acceptance sample data.
