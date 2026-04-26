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

Current recommendation:
- do **not** force snapshot-only yet in this technical-tail phase
- keep fallback for now
- treat fallback as temporary compatibility protection, not equal-status truth owner

Reason:
1. current product and governance rules are already converged
2. current residual uncertainty is operational, not conceptual
3. forcing snapshot-only too early would create migration sensitivity without immediate product-value gain

---

## 4. Required answers before snapshot-only enforcement

Before switching to snapshot-only, answer these explicitly:

### Q1 — Legacy coverage
Are there any legitimate closed projects without retained snapshot rows?

### Q2 — Migration posture
Will we backfill retained snapshot rows for legacy closeouts before pre-production enforcement?

### Q3 — Failure mode
If a closed project is missing retained snapshot, what should happen?
- explicit domain error
- migration-required signal
- empty closed-project retained state

### Q4 — Operational readiness
Who verifies that closed-project retained-row coverage is complete before switching enforcement?

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

For now:
- **keep fallback**
- **treat snapshot as the official retained truth**
- **treat fallback as transition-only compatibility fuse**
- **defer snapshot-only enforcement to a separate, explicitly approved scope**
