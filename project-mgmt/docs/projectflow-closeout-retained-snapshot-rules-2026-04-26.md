# Projectflow closeout / reopen retained snapshot rules — 2026-04-26

Status: active

## Purpose

This document formalizes the approved closeout / reopen semantics for the financial lifecycle.

It exists to remove ambiguity around whether closeout reads live truth or retained truth, whether reopen deletes history, and whether a multi-version closeout archive is required.

## Official rules

### 1. Closeout writes one retained snapshot per project

When a project is closed out:

- the system writes a retained snapshot into `financial_closeout_snapshots`
- the retained snapshot freezes the approved financial readback for that project at the time of closeout
- the retained snapshot is the official closeout read source

Current implementation uses **one retained snapshot row per project** keyed by `project_id`.

### 2. Closeout detail and closeout list read the retained snapshot

After closeout:

- `/closeouts` reads retained totals from `financial_closeout_snapshots`
- `/closeouts/[id]` reads retained financial truth from `financial_closeout_snapshots`
- closeout views must not drift with later live mutations while the project remains in closed state

In other words:

> closeout readback is snapshot-based, not live-truth-based.

### 3. Reopen does not delete the retained snapshot

When a project is reopened:

- project status returns to active / live mode
- the retained snapshot is **not deleted**
- reopen is a status switch back to active truth, not a historical purge

This rule is intentional because historical retained correctness must remain available.

### 4. Reopen restores active / live truth for active views

After reopen:

- active views such as quote-cost detail return to live data
- active calculations, manual costs, reconciliations, and current project truth resume from the live source
- the project leaves the closeout list because it is no longer in closed status

In other words:

> reopen restores active/live truth for active workflows, while retained closeout history remains preserved.

### 5. No multi-version closeout archive is required

The approved model does **not** require a multi-version closeout archive.

Specifically:

- do not introduce a version history table for repeated closeout snapshots as part of this rule
- do not treat closeout as a growing archive timeline
- do not expand the scope into historical version browsing unless separately approved later

The current approved model is:

- one retained snapshot per project
- overwritten on the next closeout if the same project is closed again later
- retained while reopened, but not versioned into a multi-entry archive

## Implementation note

Official schema path:

- `db/migrations/20260426_financial_closeout_snapshots.sql`

Runtime code may still keep a compatibility `create table if not exists` safeguard for not-yet-migrated environments, but the schema must now be treated as formally owned by the migration path above rather than runtime auto-create alone.
