# Projectflow frontend visual polish execution principles v2 — 2026-04-26

Status: active
Role: upgraded visual-direction execution spec
Supersedes:
- `projectflow-frontend-visual-polish-execution-principles-v1-2026-04-26.md`

---

## 1. Goal

This v2 spec upgrades the visual direction of Projectflow from a conservative polish path into a **dark-premium product direction** based on the user's preferred reference image.

This does **not** authorize a redesign of product logic.
It authorizes a **stronger visual direction** while keeping the same product behavior.

The target is no longer merely:
- cleaner
- more polished

The target is now:
- darker
- more premium
- more atmospheric
- more clearly stylized
- but still readable enough for a dense business workflow system

---

## 2. Hard constraints (unchanged and still absolute)

The following remain locked and must not change:

1. **UI copy / 文案不可更動**
2. **Expand / collapse / interaction flow 不可更動**
3. **All functional behavior 不可更動**
4. **Approved information structure should remain as-is unless explicitly approved later**
5. **For already accepted Projectflow UI, do not alter structure just to make it prettier**
6. **No function-layer change is allowed**
7. **All visual-polish changes must remain fully reversible back to the current stable version**
8. **No behavior drift is allowed after polish**

Practical meaning:
- do not rename labels
- do not reorder workflow logic
- do not introduce new buttons unless separately approved
- do not remove existing controls
- do not redesign page-level interaction models
- do not modify API behavior, DB behavior, domain logic, submission logic, routing logic, or state-transition logic
- do not mix visual polish with bug-fix or feature work in the same change batch

---

## 3. New approved visual direction

The confirmed direction is now:

> **translate the user's preferred design reference into a production-grade Projectflow version**

Meaning:
- do not copy the concept image literally
- do absorb its core visual language more directly than v1 did

### 3.1 Core style language
Projectflow v2 polish should now aim for:
- deep dark shell
- blue energy accents
- stronger layered glow and lighting than v1
- more luxurious card surfaces
- more premium depth and separation
- cleaner visual silence around key data
- stronger first-impression impact

### 3.2 Product translation rule
The reference image is concept-heavy.
Projectflow is workflow-heavy.

So the rule is:

> copy the **feeling**, not the fake simplicity.

Keep:
- dark base
- glow logic
- material quality
- premium active states
- sophisticated contrast

Do not copy blindly:
- fake empty dashboard spacing
- decorative-only shells with weak data readability
- concept-art blocks that reduce operational clarity

---

## 4. v2 aesthetic targets

### 4.1 Shell and atmosphere
The application frame should feel:
- darker
- deeper
- more immersive
- more intentionally premium

This includes:
- stronger dark shell treatment
- more refined page-container framing
- slightly more visible ambient color/light treatment
- more deliberate separation between shell and content surfaces

### 4.2 Card language
Cards should feel:
- more sculpted
- more premium
- more luminous against the dark shell
- less like plain white engineering containers

Allowed:
- stronger radius
- richer borders
- stronger but still soft shadows
- subtle tinting
- more premium layering between main card and sub-card

### 4.3 Accent language
The reference image clearly uses blue as emotional energy.
Projectflow v2 may now use:
- stronger blue active indicators
- more premium blue primary buttons
- subtle blue glow around key surfaces
- richer active chips and highlights

But:
- accent use must remain structured
- not every component should glow
- financial/workflow readability must stay clear

### 4.4 Typography and information tone
Typography should feel:
- sharper
- more high-end
- more deliberate in contrast

This means:
- stronger hierarchy between title / value / note
- clearer visual importance of decision-critical data
- more intentional muted-text strategy

---

## 5. What changes from v1

Compared with v1, v2 intentionally allows:
- stronger premium atmosphere
- more visible dark-premium styling
- more assertive accent usage
- more visual drama in shell and state treatment

But v2 still does **not** allow:
- interaction redesign
- structural rewrites
- data readability sacrifice
- style experimentation that weakens operational confidence

---

## 6. Elements to move closer to the preferred reference

### 6.1 Increase these
Increase:
- shell contrast
- card contrast against shell
- blue accent presence
- luxurious depth cues
- active-state clarity
- polished component consistency
- material richness of major panels

### 6.2 Keep controlled
Keep controlled:
- blur strength
- glow size
- gradient intensity
- visual noise
- decorative layering

### 6.3 Never overtake readability
If a visual effect competes with dense project/financial/workflow reading, it must be reduced.

---

## 7. Updated priority interpretation

The existing Batch 1 page priority still holds, but the visual goal is now stronger.

### First benchmark page remains
1. **Project Detail**

But v2 requires Project Detail to become:
- not just cleaner
- but clearly more premium and more stylized in the dark-premium direction

### Dense page check remains critical
2. **Quote-Cost Detail**
3. **Closeout Detail**

Because these pages prove whether the stronger visual direction can survive real data density.

### Landing/list surfaces remain high leverage
4. **Projects List / dashboard-like pages**

These pages can absorb more of the reference image's first-impression language.

---

## 8. Component-level v2 direction

### 8.1 Cards
- allow stronger premium shaping than v1
- allow richer border/shadow language
- allow stronger sub-surface layering
- preserve internal readability and section separation

### 8.2 Buttons
- primary buttons may feel more premium and energetic
- allow stronger gradient/sheen treatment if disciplined
- keep destructive/secondary states calmer and clearer

### 8.3 Badges / status chips
- move toward a more premium chip feel
- use calmer but richer semantic colors
- active/current-state chips may be slightly more expressive

### 8.4 Forms
- keep operational readability first
- use cleaner field surfaces and stronger focus styling
- make forms feel modern, but never decorative

### 8.5 Tables
- allow cleaner surrounding shells and slightly richer headers
- preserve density and scan speed
- do not make data feel buried inside stylistic framing

### 8.6 Navigation shell
- active state should become more visually intentional
- sidebar may carry more of the reference mood
- topbar / nav frame may use restrained premium surface treatment

---

## 9. Acceptance rule for v2

A v2 visual change is acceptable only if all are true:

1. no UI copy changed
2. no interaction behavior changed
3. no business function changed
4. approved structure remains intact
5. readability is equal or better
6. visual quality is not only improved, but clearly closer to the approved premium-dark direction
7. no regression is introduced into accepted mainline pages
8. the change is cleanly reversible back to the current stable baseline
9. the change introduces zero function-layer drift

---

## 10. Recommended execution posture under v2

### 10.1 Keep visual-only batching
Still mandatory:
- isolated visual batches
- reversible commits
- no mixing with logic work

### 10.2 Allow stronger style moves earlier
Under v2, it is acceptable to push harder on:
- shell identity
- premium card treatment
- blue accent presence
- benchmark page visual impact

### 10.3 Use benchmark pages to calibrate intensity
Do not spread the stronger style system everywhere at once.
Use:
- Project Detail
- Quote-Cost Detail
- Closeout Detail
as calibration pages before system-wide rollout.

---

## 11. Final principle

> Projectflow frontend polish v2 should intentionally move toward the user's preferred dark-premium design language, but always as a production-grade workflow system: stronger atmosphere, stronger material quality, stronger visual identity — with zero copy drift, zero interaction drift, zero function drift.
