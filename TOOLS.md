# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Projectflow DB Access

### Supabase

- Provider: Supabase Postgres
- Project ref: `vkjabxekxnnczpulumod`
- Preferred connection path for local/runtime validation: **Transaction Pooler**
- Avoid using Direct connection first in OpenClaw runtime when DNS/host resolution is unstable.

### Connection string pattern

Preferred `DATABASE_URL` pattern:

```text
postgresql://postgres.vkjabxekxnnczpulumod:<PASSWORD>@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

### Current DB password

- Password: `9RnTuDvsNruISgaE`

### Projectflow DB env switches

Use these when running `project-mgmt` in DB mode:

```text
PROJECTFLOW_USE_DB_PROJECT=1
PROJECTFLOW_USE_DB_DESIGN=1
PROJECTFLOW_USE_DB_PROCUREMENT=1
PROJECTFLOW_USE_DB_VENDOR=0
PROJECTFLOW_USE_PGMEM=0
```

### Important note

- If DB runtime fails on `db.vkjabxekxnnczpulumod.supabase.co`, switch to the Supabase **Transaction Pooler** URI before assuming projectflow code is broken.

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
