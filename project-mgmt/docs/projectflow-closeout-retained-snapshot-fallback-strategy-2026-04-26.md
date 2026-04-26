# Projectflow closeout retained snapshot fallback strategy — 2026-04-26

Status: active

## Purpose

This document formalizes the current strategy question around closeout retained snapshot fallback behavior.

It does not change product rules.
It clarifies how to interpret the current implementation and what decision should be made before pre-production migration.

---

## 1. Current implementation

### Closeout list read model
File:
- `src/lib/db/closeout-list-read-model.ts`

Behavior:
- if `financial_closeout_snapshots` has rows for closed projects, read snapshot totals directly
- otherwise return empty list result for closed-project retained readback

Meaning:
- list-level live fallback has been removed
- retained snapshot is now required for closeout-list retained visibility

### Closeout detail read model
File:
- `src/lib/db/closeout-detail-read-model.ts`

Behavior:
- if retained snapshot exists for the project, read retained snapshot totals as primary truth
- if retained snapshot is missing, do not rebuild live retained summary totals
- if snapshot row exists but retained arrays are empty, do not live-fill `costItems` / `reconciliationGroups`

Meaning:
- missing-snapshot live summary fallback has been removed
- detail-level empty-array compatibility fill has also been removed
- retained detail read is now aligned more purely to snapshot-owned retained content

---

## 2. What the fallback actually is

The current fallback is best interpreted as:
- a compatibility bridge
- a migration-transition safeguard
- not the preferred final governance shape

It is not the main business rule.
The business rule already says:
- closeout writes retained snapshot
- closeout list/detail should read retained snapshot truth
- reopen does not delete retained snapshot
- second closeout overwrites the single retained snapshot row

So the fallback is not the formal product truth owner.
It is a resilience path for incomplete or older runtime/data states.

---

## 3. Strategic options

### Option A — Keep fallback as long-term compatibility safety net

Meaning:
- retained snapshot remains primary truth
- fallback remains permanently available when snapshot row is missing

Pros:
- higher operational resilience in partially migrated environments
- safer when data backfill or schema rollout is uneven
- lower immediate migration pressure

Cons:
- retained snapshot is not fully enforced as the only authoritative source
- long-term governance story stays less pure
- read-model complexity remains higher

### Option B — Treat fallback as transition-only fuse and remove later

Meaning:
- current fallback stays for now
- before or during pre-production migration, system moves toward snapshot-only retained read path

Pros:
- strongest data-governance clarity
- closeout retained truth becomes easier to reason about and audit
- lower long-term read-model ambiguity

Cons:
- requires stronger migration/backfill confidence
- requires explicit readiness check before removal
- higher risk if environments still contain legacy rows without retained snapshots

---

## 4. Current recommended interpretation

For the current phase, the most accurate interpretation is:

> fallback should be treated as a transition-period compatibility fuse, not as the long-term primary model.

Why:
1. product rule and docs have already converged on retained snapshot as formal retained truth
2. reopen / second closeout semantics are already defined around a single retained snapshot row
3. the remaining question is operational readiness, not product-rule uncertainty

This means:
- do not remove fallback immediately in the current technical-tail phase
- do not describe fallback as equal-status truth owner
- document it as temporary compatibility protection until pre-production readiness is reviewed

---

## 5. Decision gate before pre-production migration

Before official pre-production migration, answer these questions:

1. Are all closed projects expected to have retained snapshot rows?
2. Is there any known environment that still depends on live rebuild path for legitimate closed-project readback?
3. Do we want to backfill retained rows for legacy closeouts before production migration?
4. If fallback is removed, what is the desired failure mode when retained snapshot is missing?
   - explicit error
   - empty state
   - migration-required signal

If these questions are not yet answered, fallback should remain.
If they are answered with strong migration confidence, snapshot-only can become the next-stage target.

---

## 6. Current phase conclusion

Current conclusion:
- retained snapshot is already the formal retained truth model
- closeout retained read has now completed a stronger snapshot-only code-level validation step
- closeout list no longer uses live fallback
- closeout detail no longer rebuilds live summary totals when snapshot is missing
- closeout detail no longer live-fills retained arrays when snapshot row exists but arrays are empty
- formal acceptance v2 remained green after this stronger convergence step
- closeout retained read can now be treated as a validated snapshot-first / snapshot-owned retained path for the current phase
