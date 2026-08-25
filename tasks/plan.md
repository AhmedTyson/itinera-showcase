# Lifecycle Page — Full Re-Analysis (5 Phases) & Fix Plan

Scope: `src/pages/LifecyclePage.tsx`, `src/index.css` (lifecycle block), `src/pages/LifecyclePage.test.tsx`.
Target behavior: full-page scroll-jacking — one section per input gesture, section animation must
finish before the next gesture is accepted, infinite wrap in both directions.

---

## Phase 1 — Architecture & Data Audit

Structure: 12 sections (`#lc-hero` + 10 stages + `#outro`) inside `#scroller`. Chrome (topbar, rail,
progress edge, hint) lives outside the scroller and is driven imperatively by `activate()`.

| # | Finding | Severity |
|---|---------|----------|
| P1-1 | `allowPin` (matchMedia >=1024px) is dead logic from the removed ScrollTrigger-pinning era; only feeds the JSX `no-snap` toggle and effect deps. | Medium |
| P1-2 | Effect deps `[reducedMotion, allowPin]`: crossing the 1024px breakpoint rebuilds the entire engine mid-session and resets position to hero. | High |
| P1-3 | `reducedMotion` no longer changes any behavior after the rewrite — reduced-motion users get full scroll-jacking animations. A11y regression. | High |
| P1-4 | `LIFECYCLE_STAGES_FINAL` vestigial alias export; stage/RAIL_LABELS data otherwise clean. | Low |

## Phase 2 — Animation Engine Audit

One paused GSAP timeline per section; played via `restart()` after a 0.8s scrollTop tween lands.

| # | Finding | Severity |
|---|---------|----------|
| P2-1 | `.from()` tweens default `immediateRender: true` → all stage/outro content sits at `opacity:0` on mount until its timeline plays. Any JS error mid-effect or reduced-motion path leaves pages permanently blank. | High |
| P2-2 | StrictMode double-mount leaks: cleanup kills triggers/pulse dots but never the 12 timelines nor `gsap.killTweensOf(scrollerEl)`; deep-link `setTimeout(…,100)` never cleared → stale closure can fight the remount's tween on the same DOM node. | High |
| P2-3 | No safety unlock: if GSAP ticks are throttled (background tab) `onComplete` never fires and `isTransitioning` stays true → permanent input lock until reload. | High |
| P2-4 | "Keep Tests Happy" stub creates 12 real ScrollTriggers that do nothing in production — dead weight, misleading tests. | Medium |

## Phase 3 — Input Handling Audit

Inputs: wheel + touch on scroller, keydown on window, rail clicks and `?stage=` deep link.

| # | Finding | Severity |
|---|---------|----------|
| P3-1 | Wheel 60ms inertia filter only rejects events during rapid streams. Trailing momentum events arriving >60ms after unlock still double-advance sections. Standard fix: cooldown timestamp set at transition end. | High |
| P3-2 | Window-level arrow-key hijack fires even when focus is in an editable target (command palette search, inputs) — breaks keyboard UX on this page. Needs editable-target guard. | Medium |
| P3-3 | Touchmove `preventDefault` unconditionally blocks all native scrolling inside sections; fine today (no nested scrollables) but brittle — keep, but document + scope threshold logic. | Low |
| P3-4 | Resize handler re-centers even while a transition tween is running → fights the tween (jitter). Should skip when `isTransitioning`, and be debounced. | Medium |

## Phase 4 — State & Chrome Sync Audit

| # | Finding | Severity |
|---|---------|----------|
| P4-1 | `activate()` hardcodes `/ 10` strings while computing pct from `STAGE_IDS.length` — consistent today, fragile if stage count changes. Derive both from length. | Low |
| P4-2 | Non-null assertions (`railEl!`, `.panel!`, `traceText as HTMLElement`) crash silently if markup drifts. Guard once, warn once. | Medium |
| P4-3 | `history.replaceState` runs on every activation including programmatic initial paint — acceptable, but should be skipped for hero to avoid URL churn on load. | Low |
| P4-4 | Rail active-state relies on `dataset.target === '#'+sec.id`; outro rail label reads "Contact" while section trace says TRACE COMPLETE — cosmetic mismatch only. | Low |

## Phase 5 — CSS / Layout & Test Audit

| # | Finding | Severity |
|---|---------|----------|
| P5-1 | CSS now forces `overflow:hidden` + `scroll-snap-type:none !important` on `.scroller`; the JSX conditional `no-snap` class, the per-stage `scroll-snap-align:none` selector line, and scrollbar-hiding rules are all dead weight. Remove or simplify. | Medium |
| P5-2 | Tests mock timeline without `eventCallback`, and `gsap.to` mock returns undefined so `onComplete` paths are never exercised — current suite passes but verifies almost nothing about the new engine. Rewrite around real behaviors: 12 timelines built, wheel handler registered, lock/unlock lifecycle, wrap-around math. | Medium |
| P5-3 | Lint script (`oxlint`) has not been run against the rewritten file this session — unknown warnings. | Low |

---

## Fix Strategy (ordered)

Foundation first, then engine correctness, then input polish, then chrome sync, then cleanup/tests.
Each task leaves the build green. Vertical slices; every task independently verifiable via
`npm test` + `npm run build` (+ manual wheel/touch check for input tasks).

1. Stabilize engine lifecycle (deps, StrictMode leaks, safety unlock, RM support).
2. Make content never permanently hidden (immediateRender strategy).
3. Harden input layer (post-transition cooldown, editable guard, resize debounce).
4. Sync chrome + defensive guards.
5. Dead code removal (CSS + stubs) and test rewrite.
