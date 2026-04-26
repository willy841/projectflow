# Projectflow Phase 1 technical change risk grading — 2026-04-26

Status: active

## Purpose

This memo grades the current Phase 1 technical-tail work by operational risk, so that execution can continue without mixing low-risk hygiene work and higher-risk truth-model changes.

Scope:
- runtime / env cleanup
- acceptance / deploy separation
- retained snapshot fallback strategy
- items explicitly not in current UI scope

---

## 1. Low-risk changes

These are changes that are generally safe to continue, as long as formal acceptance stays green.

### L1 — Runtime hygiene in local dev startup
Examples:
- clearing inherited `NODE_ENV` before `next dev`
- keeping acceptance and production-local startup behavior explicit

Why low risk:
- does not change product domain rules
- does not change UI flows
- does not change closeout/payment/reconciliation logic
- only reduces local runtime pollution

Current status:
- already executed
- formal acceptance v2 remains green

### L2 — Environment responsibility documentation
Examples:
- formalizing `.env.acceptance`
- formalizing `.env.production-local`
- documenting `.env.local` as bridge-only file
- documenting deploy path as separate from acceptance runtime

Why low risk:
- documentation / operating-boundary work
- no product logic mutation

Current status:
- already executed

### L3 — Decision-support documentation for retained snapshot fallback
Examples:
- defining retained snapshot as formal truth owner
- defining fallback as transition-period compatibility fuse

Why low risk:
- does not yet alter read-model behavior
- only reduces future decision ambiguity

Current status:
- already executed

---

## 2. Medium-low risk changes

These are still manageable, but should be done as isolated scope with regression discipline.

### M1 — Replacing `*.env -> .env.local` bridge startup model
Examples:
- changing how acceptance env is injected into local Next runtime
- changing how production-local env is injected into local Next runtime

Why not low risk:
- touches actual startup path behavior
- can change how local validation runtime reads config
- can create false environment mismatch if done carelessly

Safety rule:
- isolate to runtime scope only
- no simultaneous deploy-path rewrite
- rerun formal acceptance after each retained change

### M2 — Further cleanup of auxiliary startup paths
Examples:
- ensuring no other local script bypasses accepted runtime hygiene rules
- normalizing startup conventions across dev scripts

Why not low risk:
- can affect operator expectations and local workflows
- still not domain-dangerous, but can break runtime ergonomics

---

## 3. Medium risk changes

These are not blockers right now, but they directly touch retained-truth strategy and should not be mixed with other refactors.

### R1 — Converging closeout retained reads toward snapshot-only
Examples:
- reducing or removing live rebuild fallback from closeout list/detail read paths
- changing missing-snapshot behavior for closed projects

Why medium risk:
- touches retained truth contract in live read models
- can affect closed-project readback if legacy rows or incomplete states still exist
- may surface data gaps that fallback currently hides

Safety rule:
- do not bundle with env/runtime cleanup
- define failure mode first
- verify legacy/closed-project retained-row coverage before code change
- rerun formal acceptance v2 after every retained code change

### R2 — Backfill / migration readiness decisions for retained snapshots
Examples:
- deciding whether legacy closed projects must be backfilled before snapshot-only enforcement
- deciding how pre-production should behave when snapshot row is missing

Why medium risk:
- operationally impactful
- can affect migration sequencing and data-read guarantees

---

## 4. Higher-risk changes for this phase

These should not be pulled into current Phase 1 technical-tail work unless explicitly re-scoped.

### H1 — UI changes
Reason:
- user explicitly said not to touch UI unless requested
- UI changes create noise and can hide whether technical-tail work is actually stable

### H2 — Financial domain logic rewrites
Examples:
- changing closeout gating semantics
- changing payment eligibility rules
- changing reconciliation semantics

Reason:
- current acceptance and governance rules are already stable
- mixing these with technical-tail work would create avoidable regression risk

### H3 — Compatibility semantic hard-removal work
Examples:
- trying to fully remove `部分付款` in current phase

Reason:
- known dependency surface still exists
- not current blocker
- high risk / low leverage for this phase

---

## 5. Execution recommendation

Recommended next execution order:
1. continue low-risk documentation and decision convergence
2. finish pre-production decision memo for retained snapshot fallback
3. only then decide whether to open a separate runtime-bridge cleanup scope
4. defer snapshot-only code convergence until migration readiness is explicitly reviewed

---

## 6. Current conclusion

At this phase:
- runtime hygiene work is low risk and already improving stability
- environment-boundary documentation is low risk and useful
- retained snapshot fallback strategy should be decided before code convergence
- the next truly sensitive step is not more docs, but any move toward snapshot-only enforcement
