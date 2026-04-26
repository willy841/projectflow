# Projectflow pre-production retained snapshot decision memo — 2026-04-26

Status: active

## Purpose

This memo is the pre-production decision support note for closeout retained snapshot fallback.

It is meant to answer one management question:

> Before moving closer to pre-production, should projectflow keep fallback in closeout retained reads, or converge to snapshot-only?

---

## 1. Current position

Current formally aligned interpretation:
- retained snapshot is the official retained truth owner
- fallback is transition-period compatibility protection

This means the system is already conceptually converged.
What is not yet converged is enforcement level.

---

## 2. Decision options

### Option A — Keep fallback for pre-production phase

Meaning:
- closeout list/detail continue snapshot-first
- if retained snapshot is missing, system still serves live rebuild / live aggregation path

When this option is appropriate:
- if legacy closed projects may still exist without retained snapshot rows
- if migration/backfill confidence is not yet high enough
- if operational resilience is more important than purity in the immediate phase

Advantages:
- lower migration shock
- safer for mixed-history environments
- less chance of surprising read failures during pre-production transition

Tradeoffs:
- retained truth governance remains slightly less strict
- missing snapshot states remain partially hidden by fallback

### Option B — Move to snapshot-only before or during pre-production

Meaning:
- closed-project retained reads must come from retained snapshot only
- missing snapshot becomes explicit, not silently rebuilt from live state

When this option is appropriate:
- if all legitimate closed projects are guaranteed to have retained snapshot rows
- if migration/backfill plan is explicit and verified
- if auditability and truth clarity are more important than compatibility protection

Advantages:
- strongest retained-truth governance
- simpler long-term read-model contract
- easier to reason about data ownership

Tradeoffs:
- stricter operational dependency on migration readiness
- legacy gaps become visible immediately
- higher short-term rollout sensitivity

---

## 3. Current recommendation

Current recommendation has now advanced to this position:

### Already validated
- snapshot-only convergence is no longer just theoretical
- closeout list no longer falls back to live retained aggregation
- closeout detail no longer rebuilds live retained summary totals when snapshot is missing
- closeout detail no longer live-fills retained arrays when snapshot row exists but arrays are empty
- formal acceptance v2 remained green after this stronger convergence step

### What this means
1. closeout retained read has already crossed the main technical validation threshold
2. for the current test-data-only environment, snapshot-owned retained read can be treated as the working validated direction
3. the remaining decision is no longer whether the read path can technically survive stronger snapshot-only convergence — it already did
4. the remaining decision is about pre-production posture, not immediate technical feasibility

---

## 4. Required answers before snapshot-only enforcement

Before switching to snapshot-only, answer these explicitly:

### Q1 — Official environment starts clean?
If the official deployment starts without carrying forward any old closed-project data, then legacy coverage is not a primary blocker for this phase.

### Q2 — Migration posture
If no old closeout data will be carried into the official environment, then backfill posture can be downgraded from a mainline concern.

### Q3 — Failure mode
For future official data, if a closed project is missing retained snapshot, what should happen?
- explicit domain error
- migration-required signal
- empty closed-project retained state

### Q4 — Operational readiness
Who verifies that official closeout writes are producing retained snapshot rows correctly from day one?

---

## 5. Practical execution rule

Until the above questions are answered:
- keep fallback
- do not market fallback as formal truth
- do not remove fallback in the same scope as runtime/env cleanup

If the above questions are answered with confidence:
- open a separate scope for snapshot-only convergence
- validate with formal acceptance
- then review pre-production rollout readiness

---

## 6. Final recommendation

For the current state:
- **treat snapshot as the official retained truth**
- **recognize that closeout retained read has already passed a stronger snapshot-only validation step**
- **if the official environment starts clean and does not carry forward old closeout data, legacy coverage / backfill is no longer a primary Phase 1 concern**
- **the next decision is mainly about future official-data discipline, not whether the current code path can handle stronger snapshot-only behavior**
