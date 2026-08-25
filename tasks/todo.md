# Lifecycle Page Fix — Task List

Source analysis: `tasks/plan.md` (5-phase audit). Work top-down; every task ends green
(`npm.cmd test` + `npm.cmd run build`).

## Task 1: Stabilize engine lifecycle and effect deps

**Description:** Remove the `allowPin` breakpoint dependency so the transition engine builds once
per mount (plus reduced-motion flip). Kill all timelines and scroller tweens on cleanup, clear the
deep-link timeout, add a safety watchdog so a dropped GSAP tick can never leave the page locked.

**Acceptance criteria:**
- [x] Effect deps are `[reducedMotion]` only; no `matchMedia` call remains.
- [x] Cleanup kills every timeline, kills scroller tweens, clears deep-link timeout.
- [x] Watchdog (~3s) force-releases `isTransitioning`; cleared on real completion.
- [x] Crossing 1024px at runtime does not reset active section.

**Verification:** `npm.cmd test`, `npm.cmd run build`, manual resize check.

**Dependencies:** None
**Files:** `src/pages/LifecyclePage.tsx`
**Estimated scope:** Small (1 file)

## Task 2: Reduced motion and never-hidden content

**Description:** Make `reducedMotion` real again: instant jumps, no tweened movement, end-states via
`progress(1)`. Neutralize `.from()` immediateRender hiding so stage/outro content is visible by
default and only hidden when its entrance timeline arms.

**Acceptance criteria:**
- [x] Reduce-motion ON: instant section jumps, zero animated movement, all content always visible.
- [x] Reduce-motion OFF: no blank unvisited stage frame after fix.
- [x] Hero entrance plays once on load (or shows instantly under RM).

**Verification:** tests, build, devtools reduced-motion emulation.

**Dependencies:** Task 1
**Files:** `src/pages/LifecyclePage.tsx`
**Estimated scope:** Small (1 file)

## Task 3: Input hardening — cooldown, editable guard, resize debounce

**Description:** Add post-transition wheel/touch cooldown timestamp so trackpad momentum cannot
double-advance. Guard arrow keys when target is editable or inside command palette. Debounce resize
re-center (>=150ms) and skip it while transitioning.

**Acceptance criteria:**
- [x] Fast flick advances exactly one section per gesture.
- [x] Arrows inside palette search / inputs do not change section.
- [x] Resize during transition causes no jitter; debounced re-center lands exactly.
- [x] Infinite wrap works both directions across all 12 sections.

**Verification:** tests, build, manual trackpad/keyboard/resize checks.

**Dependencies:** Task 1
**Files:** `src/pages/LifecyclePage.tsx`
**Estimated scope:** Small (1 file)

## Task 4: Chrome sync defensiveness

**Description:** Null-guard chrome lookups (`railEl`, `traceText`, `progressFill`, stage `.panel`)
instead of non-null assertions; derive counter denominator from `STAGE_IDS.length`; skip URL rewrite
for initial hero activation.

**Acceptance criteria:**
- [x] No non-null assertions on chrome queries; missing nodes degrade silently.
- [x] Counter format derived from stage count.
- [x] Initial load does not rewrite URL to `?stage=hero`.

**Verification:** tests, build.

**Dependencies:** Task 1
**Files:** `src/pages/LifecyclePage.tsx`
**Estimated scope:** Small (1 file)

## Task 5: Dead code removal — CSS and ScrollTrigger stubs

**Description:** Delete scrub/pin-era vestiges: JSX `no-snap` conditional class and its
`.scroller.no-snap` rule, the per-stage `scroll-snap-align:none` selector line, scrollbar-hiding
rules if unused elsewhere, `LIFECYCLE_STAGES_FINAL` alias, and the "Keep Tests Happy"
ScrollTrigger.create stub block.

**Acceptance criteria:**
- [x] No `no-snap`, stage snap-align list, or stub trigger block remains.
- [x] No references to removed symbols anywhere (`rg LIFECYCLE_STAGES_FINAL` empty).
- [x] Bundle builds; lifecycle page renders identically.

**Verification:** tests, build, visual smoke check.

**Dependencies:** Tasks 1-4 (stubs removed only after replacements exist)
**Files:** `src/pages/LifecyclePage.tsx`, `src/index.css`
**Estimated scope:** Small-Medium (2 files)

## Task 6: Rewrite regression suite for the new engine

**Description:** Replace mock-shape tests with behavior tests against the real engine: 12 sections
and 12 timelines built, wheel handler registered non-passive, lock/unlock lifecycle around a
transition, wrap-around index math, editable-target keyboard guard. Extend gsap mock with
`eventCallback`, `restart`, `progress`, `killTweensOf`.

**Acceptance criteria:**
- [x] Suite covers: section/timeline counts, wheel registration, lock during transition, unlock after completion, wrap 11 to 0 and 0 to 11, keydown guard.
- [x] All tests green without relying on incidental mock gaps.
- [x] oxlint clean on touched files.

**Verification:** `npm.cmd test`, `npm.cmd run build`, `npm.cmd run lint`.

**Dependencies:** Task 5
**Files:** `src/pages/LifecyclePage.test.tsx`
**Estimated scope:** Medium (1 file, substantial rewrite)

---

## Checkpoint: after Tasks 1-3
- [x] Tests + build green.
- [ ] Manual pass: wheel flick, touch swipe, arrows, rail clicks, deep link, resize, reduced motion. *(user)*
- [x] Review gate — user issued blanket "execute"; proceeded.

## Checkpoint: after Tasks 4-6
- [x] Full suite + build + lint green (14/14 tests; lint: pre-existing warnings only).
- [x] No dead code from scrub/pin era remains.
- [x] Final manual end-to-end passed by user ("it now works").

---

# Migration: scroll-jack engine -> scrubbed scroll-driven animation

User decision after UX review of velocity edge case: adopt GSAP scrubbing (native scroll owns the
playhead). Completed:

## Task S1: Native scroll restored, hijack layer deleted
- [x] `.scroller` back to `overflow-y:auto`; content-visibility rule dropped (pin-spacer conflict).
- [x] Wheel/touch interceptors, energy accumulator, intent gate, cooldowns, watchdog, lock state — all removed.

## Task S2: Scrubbed pins + reveals
- [x] 10 stages: `pin:true, start:'top top', end:'+=80%', scrub:0.6`, reveal timeline attached.
- [x] Hero: mount entrance once + exit scrub (`top top -> bottom top`). Outro: entrance scrub.
- [x] Motion-path pulse dots ride inside the scrubbed timelines.

## Task S3: Chrome sync + nav on trigger starts
- [x] One activation trigger per section (`onToggle isActive`) drives rail/accent/trace/counter/progress.
- [x] Rail clicks / arrows / deep links land on each section's recorded ScrollTrigger `start`.
- [x] Edge wrap kept via passive scroll listener (bottom->top, top->bottom).
- [x] `?motion=reduced`: zero pins, static sections, instant jumps.

## Verification
- [x] 16/16 vitest (pin counts, scrub presence, rail toggle, keyboard nav to ST start, editable guard, edge wrap, reduced mode).
- [x] `npm run build` clean; oxlint: no errors.
