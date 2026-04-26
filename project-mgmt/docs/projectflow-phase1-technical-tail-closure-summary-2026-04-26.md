# Projectflow Phase 1 technical-tail closure summary — 2026-04-26

Status: active

## Purpose

This document is the closure-summary memo for Projectflow Phase 1 technical-tail work.

It exists to answer three practical questions:
1. What has already been completed?
2. What is still not fully done?
3. Why can this phase now be treated as a high-completion stable stop point?

---

## 1. Completed

### 1.1 Runtime / env hygiene
Completed:
- traced non-standard `NODE_ENV` warning to inherited shell pollution (`NODE_ENV=production` into `next dev`)
- updated acceptance / production-local start scripts to clear inherited `NODE_ENV`
- validated that formal acceptance remained green after the change

Meaning:
- the main unknown around the warning is no longer unknown
- the primary runtime pollution source has already been removed

### 1.2 Acceptance env / `.env.local` responsibility boundary
Completed:
- formalized `.env.acceptance` as acceptance source of truth
- formalized `.env.production-local` as production-local source of truth
- explicitly downgraded `.env.local` to bridge-file role for local Next runtime
- documented the responsibility boundary

Meaning:
- environment ownership is now clear even though bridge mode still exists

### 1.3 Acceptance / deploy separation
Completed:
- formalized acceptance runtime path
- formalized production-local runtime path
- formalized deploy path via `webapp-deployer`
- documented that acceptance and deploy are not the same operational path

Meaning:
- structure and operating model are now much clearer
- future pre-production work is less likely to mix runtime validation and deploy packaging concerns

### 1.4 Closeout retained read snapshot-only convergence
Completed:
- removed live fallback from closeout list retained read
- removed missing-snapshot live summary rebuild from closeout detail retained read
- removed retained-array empty compatibility fill from closeout detail retained read
- reran `tests/formal-acceptance-v2` after each retained code change
- formal acceptance remained green through stronger snapshot-only convergence

Meaning:
- closeout retained read is no longer just conceptually aligned to snapshot-owned truth
- it has already passed code-level validation in a stronger snapshot-only shape

### 1.5 Decision-support / management closure docs
Completed:
- closeout retained snapshot fallback strategy doc
- pre-production retained snapshot decision memo
- Phase 1 technical change risk grading
- MD161 / MD162 / MD163 sync

Meaning:
- this phase is no longer only implemented
- it is also documented, reviewable, and safe to resume later

---

## 2. Still not fully done

### 2.1 `*.env -> .env.local` bridge still exists
Not fully done:
- acceptance / production-local startup still uses bridge-copy mode into `.env.local`

Interpretation:
- this is now a cleanliness / discipline issue
- not the main blocker-class technical risk for the phase

### 2.2 Pre-production posture for retained snapshot governance
Not fully done:
- if the future official environment starts clean and does not carry forward old closeout data, then legacy coverage / backfill is no longer a mainline concern
- the remaining question is narrower:
  - for future official data, what should happen if a closed project is somehow missing retained snapshot?
  - who verifies snapshot-write discipline from day one?

Interpretation:
- this is no longer primarily a code feasibility issue
- and it is no longer mainly a legacy-data issue under the current deployment assumption
- it is now mostly a forward-looking official-data discipline question

### 2.3 Compatibility semantic cleanup outside this phase
Not fully done:
- `部分付款` compatibility semantic still exists outside the current blocker mainline

Interpretation:
- known but intentionally deferred
- not a reason to block Phase 1 closure

---

## 3. Why this phase can now be treated as a stable stop point

### 3.1 Main technical unknowns have been reduced to known, bounded items
What used to be open questions are now mostly resolved into:
- validated runtime hygiene correction
- validated acceptance/deploy boundary
- validated stronger snapshot-only retained read convergence

### 3.2 The heaviest strategy question has already crossed into implementation validation
The most important technical-tail strategy question was:
- can closeout retained read converge toward a purer snapshot-owned path without breaking the accepted mainline?

That question is no longer theoretical.
It has already been implemented and validated.

### 3.3 Remaining issues are no longer mainline product-stability blockers
Remaining issues are mostly about:
- runtime cleanliness refinement
- pre-production posture
- migration discipline

They are not the same as:
- product mainline breakage
- unstable closeout lifecycle behavior
- unresolved acceptance blockers

### 3.4 Formal acceptance discipline remained intact
During this phase:
- retained code changes were followed by full `tests/formal-acceptance-v2` regression runs
- the suite remained green

Meaning:
- this phase did not trade cleanliness for hidden product regression

---

## 4. Final assessment

Current assessment:
- Phase 1 technical-tail work has reached very high completion
- a reasonable practical estimate is now roughly **90% to 95% complete**
- the phase can now be treated as a **high-completion stable stop point**

More precise management interpretation:
- the biggest technical-tail strategy line has already been validated in code
- because the official environment is expected to start clean, legacy/backfill posture has dropped in importance
- remaining work is now even narrower, lower-risk, and more about forward official-data discipline than about technical uncertainty

---

## 5. Next-step recommendation

Recommended next-step choices after this stop point:

### Option A — runtime bridge cleanup scope
If desired, open a narrow follow-up scope only for:
- reducing or replacing `*.env -> .env.local` bridge behavior

### Option B — pre-production migration / posture memo refinement
If desired, open a narrow follow-up scope only for:
- legacy coverage expectations
- missing-snapshot posture
- migration/backfill expectations before official deployment

### Not recommended as immediate next step
- UI changes
- financial domain rewrites
- compatibility semantic hard-removal cleanup

---

## 6. One-line conclusion

> Projectflow Phase 1 technical-tail work can now be treated as a high-completion stable stop point: the major runtime/env clarification work is done, the closeout retained read snapshot-only convergence has already been validated in code, and the remaining work is mostly pre-production posture rather than unresolved technical instability.
