# Slide-Deck Implementation — phased checklist
Source: `.design-lab/run-20260824-slide-deck/FINAL-PLAN.md` (D1–D41, T0–T14). Verify everywhere: `npm run build && npm run lint`.

## Phase 0 — Baseline (T0)
- [ ] Record `dist/assets/*.js` gzip sizes (pre-deck baseline for D41b <15KB delta)
- [ ] Record Lighthouse mobile+desktop + screenshots (MANUAL — user runs; numbers logged here)

## Phase 1 — Foundation (T1–T3)
- [ ] T1: register ScrollToPlugin in `lib/gsap.ts`; create `lib/deck-config.ts`, `lib/deckBus.ts`, `hooks/useDeckCapabilities.ts`
- [ ] T2: `lib/deck-snap-math.ts` + vitest suite (nearest, tie-break ±dir, clamped last, single-offset, unsorted rejection) — *deviation: vitest added as devDep (was assumed present)*
- [ ] T3: `deck/slide-context.ts` + `deck/Slide.tsx` (atomic entrance, `.deck-armed` gate) + `index.css` (D14 rule, print block, light-AA literals)

## Phase 2 — Engine (T4–T7)
- [ ] T4: `deck/Deck.tsx` + `deck/useDeckSnap.ts` — activation triggers, activeIndex, snap trigger, D13 jump sequence + watchdog, D39 refresh orchestrator, D40 scrollbar guard, beforeprint, `data-deck`/`deck-armed`, D20 anchor interceptor, fallback branch w/ relocated batch-reveal
- [ ] T5: `deck/useDeckNav.ts` — keyboard map + guards, focus-to-heading, hash sync, deep-link + re-anchor pass
- [ ] T6: `deck/DeckChrome.tsx` (dots/counter/live-region, D30–D35) + `deck/SlideHead.tsx` (D6)
- [ ] T7: `deckBus` vitest suite

## Phase 3 — Composition (T8–T9)
- [ ] T8: `Home.tsx` rewire — 12 `<Slide>` wraps, SlideHead swaps, Telemetry slide, hardening split + proof strip, `data-reveal` markers, batch-reveal removal, `<Closing/>` (new `sections/Closing.tsx`), Topbar into Deck, ArchCanvas 62vh wrapper
- [ ] T9: `KpiBand.tsx` `variant="slide"` (D28)

## Phase 4 — Seams (T10–T12)
- [ ] T10: `ArchCanvas.tsx` D25 conversion (delete scrubs, `useSlideActive()` gate, pulse restart)
- [ ] T11: `OpsConsole.tsx` D26 + `StackGrid.tsx` D27 seams
- [ ] T12: `Topbar.tsx` + `command-palette.tsx` requestJump; `App.tsx` deck-mounted palette swap

## Phase 5 — Tune + QA (T13–T14, mostly MANUAL on real hardware)
- [ ] T13: snap constant tuning (Windows/macOS touchpads) + chunk delta <15KB + Lighthouse LCP <200ms — USER
- [ ] T14: 32-item QA checklist (§8 of FINAL-PLAN) + axe both themes + SR smoke + print + kill-switch drill — USER
