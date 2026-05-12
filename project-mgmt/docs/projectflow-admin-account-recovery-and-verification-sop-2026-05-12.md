# Projectflow admin account recovery and verification SOP — 2026-05-12

Status: active

## Purpose

This SOP defines the operational path for:
- confirming the official local admin account
- recovering or resetting admin credentials when needed
- verifying that authentication is working after deploy and DB alignment

This document applies to the local official `projectflow` runtime on Web App Platform.
It is not for acceptance sample seeding or deploy routing.

---

## 1. Current known admin account

Current known official admin account:
- email: `willy@kuya.tw`

If the currently known password is available, use it first for verification.
If the password is unknown, invalid, or intentionally rotated, use the recovery path below.

---

## 2. Verification goal

Admin verification means confirming all of the following:
1. the admin account exists in `system_users`
2. the password is accepted by the login flow
3. session creation succeeds in `auth_sessions`
4. authenticated page access works
5. the user is not trapped in an invalid auth loop

---

## 3. Primary recovery tool

Repo utility:
- `project-mgmt/scripts/init-system-owner.js`

Command shape:

```bash
DATABASE_URL='postgresql://...'
node scripts/init-system-owner.js <email> [name] <password>
```

Example:

```bash
DATABASE_URL='postgresql://...'
node scripts/init-system-owner.js willy@kuya.tw "Willy Chen" "<NEW_PASSWORD>"
```

What it does:
- ensures the specified email exists
- ensures role = `admin`
- ensures `is_owner = true`
- ensures `is_active = true`
- writes a new password hash

Important current behavior:
- this script currently resets the password directly
- it does **not** force `must_change_password = true`
- therefore it behaves as a direct credential recovery tool, not as a temporary-password workflow

---

## 4. Recommended recovery sequence

### Case A — password is known
1. sign in with the known admin credentials
2. confirm redirect succeeds
3. verify authenticated pages

### Case B — password is unknown or invalid
1. run `init-system-owner.js`
2. set a new known admin password
3. sign in with the new password
4. verify authenticated pages

### Case C — account exists but should be rotated after verification
Current repo behavior does not yet provide a dedicated force-change-password reset command.
For now:
1. reset to a known strong password
2. verify login
3. optionally add a future improvement task for forced first-login rotation

---

## 5. Minimum authenticated verification checklist

After login, verify at least:
- `/`
- `/projects`
- `/vendors`
- `/quote-costs`
- `/accounting-center`

Optional but recommended:
- `/system-settings`

What to confirm:
- page loads without 500
- no auth redirect loop
- session survives navigation and refresh
- no missing-table / missing-column error appears in logs

---

## 6. Database-level confirmation points

If DB inspection is needed, confirm:
- `system_users` contains `willy@kuya.tw`
- `auth_sessions` receives a new live session after successful login
- `must_change_password` is in the intended state
- `is_active = true`

Typical inspection intent:
- account exists but login fails
- password may have been rotated unexpectedly
- session cookie seems present but page still redirects to `/login`

---

## 7. Clean-start relation

Admin recovery is separate from clean-start policy.

Even in a schema-only clean-start rebuild, the recommended order remains:
1. rebuild/apply schema
2. do not import acceptance sample data
3. ensure admin owner via `init-system-owner.js`
4. verify anonymous routes
5. verify authenticated routes

---

## 8. Recommended reporting template

When reporting admin recovery / verification status, use:

1. admin account presence
2. password status
   - known / reset / unknown
3. login result
4. authenticated route result
5. session result
6. follow-up action if any

---

## 9. One-line conclusion

> For the local official `projectflow` runtime, admin recovery should use `init-system-owner.js` as the primary direct-reset tool, then immediately verify authenticated page access and session creation before treating runtime auth as production-ready.
