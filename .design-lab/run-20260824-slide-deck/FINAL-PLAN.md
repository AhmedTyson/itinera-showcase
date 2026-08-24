# FINAL PLAN — Itinera Variant A: Vertical Snap Deck

Run: 20260824-slide-deck · Status: APPROVED FOR IMPLEMENTATION · Supersedes: `plans/system-architect.md`, `plans/ux-engineer.md`, `plans/frontend-engineer.md`, `reviews/consolidation-review.md`
Inputs merged: three worker plans + consolidation review + QA/risk review (R1–R15, incl. 2 blocking findings).

This document is the single source of truth. Every statement is a decision. There are no alternatives, no "consider", no options. An AI implements exactly what is written here, task order included.

Stack facts (verified against repo): React 19.2 · Vite 8 · Tailwind 4.3 · `gsap ^3.15.0` (ScrollTrigger + MotionPathPlugin registered; Flip NOT registered) · StrictMode ON · `index.css:90` contains `html { scroll-behavior: smooth }` · Lenis dependency exists, never instantiated, stays unused · react-router 7 BrowserRouter, `path="*"` renders Home · Google Fonts remote.

---

## 1. Decisions

**Architecture**

- **D1.** New files (exact paths): `src/lib/deck-config.ts`, `src/lib/deck-snap-math.ts`, `src/lib/deckBus.ts`, `src/hooks/useDeckCapabilities.ts`, `src/components/deck/Deck.tsx`, `src/components/deck/Slide.tsx`, `src/components/deck/slide-context.ts`, `src/components/deck/useDeckSnap.ts`, `src/components/deck/useDeckNav.ts`, `src/components/deck/DeckChrome.tsx`, `src/components/deck/SlideHead.tsx`, `src/components/sections/Closing.tsx`. Tests: `src/lib/__tests__/deck-snap-math.test.ts`, `src/lib/__tests__/deckBus.test.ts`.
- **D2.** Modified files (complete list, nothing else): `src/lib/gsap.ts`, `src/index.css`, `src/pages/Home.tsx`, `src/App.tsx`, `src/components/layout/Topbar.tsx`, `src/components/palette/command-palette.tsx`, `src/components/canvas/ArchCanvas.tsx`, `src/components/sections/KpiBand.tsx`, `src/components/sections/OpsConsole.tsx`, `src/components/sections/StackGrid.tsx`. `Hero.tsx`, `hooks/useCountUp.ts`, `vite.config.ts` are NOT modified.
- **D3.** One canonical architecture (kills R14): `deck-config.ts` = only constants source; `deckBus.ts` = only cross-cutting channel; `data-reveal` = only marker attribute; `slide-context.ts` = only per-slide seam; `Deck.tsx` = only owner of ScrollTriggers and `activeIndex`. Window CustomEvents are NOT used. No second context provider is created.

**Slides**

- **D4.** Manifest frozen (bookmarkable public URLs — changing these later breaks deployed links): 12 slides, order and ids: `hero` → `telemetry` → `architecture` → `stack` → `frontend` → `security` → `hardening-ii` → `ops` → `deploy` → `demo` → `team` → `closing`. Legacy ids `architecture stack frontend security ops deploy demo team` preserved byte-for-byte. Topbar "Security" resolves to `#security` (slide 06).
- **D5.** Hardening split: `HARDENING.slice(0,5)` → slide 06 `#security`; `HARDENING.slice(5)` → slide 07 `#hardening-ii` + full-width proof strip: mono `55 suites · 106 ops · 0 wildcards` left, `● shipped ×9` pill right, `aria-label="Verification summary"`, colors per D34.
- **D6.** `SlideHead` replaces SectionHead on slides 02–12: mono gold slide index left (`03`), hairline, tag chip, right mono marker `NN / 12`; title `text-[clamp(1.75rem,3.4vw,2.75rem)] font-bold leading-[1.1] tracking-tight`; authored tags retained verbatim except hardening tagged `· 1 of 2` / `· 2 of 2`.
- **D7.** Heading outline: Hero keeps the page's single `h1`; slides 02–12 expose exactly one `h2` each (Telemetry gains h2 "Numbers that reconcile"; Closing gains h2); card titles stay `h3`. Each `<section>` carries `aria-labelledby={its-h2-id}`.
- **D8.** Closing slide: centered `max-w-4xl mx-auto text-center` stack — wordmark `Itinera.` (gold period, largest type after hero h1) → tagline → 3 equal `<a>` link cards (API Docs `https://itinera.apidog.io` · GitHub `https://github.com/AhmedTyson/Team2-Conference-Project` · Wiki router Link `/wiki`) → microcopy row `© 2026 Itinera — Team 2 · MIT · Laravel 13 · React 19 · Apidog` + `site updated {SITE_UPDATED}`. The semantic `<footer>` element moves INSIDE this slide; old inline footer block deleted from `Home.tsx`.

**Engine**

- **D9.** Snap topology: ONE global snapping `ScrollTrigger.create({ trigger: deckContainerEl, start:"top top", end:"bottom bottom", snap:{…} })` + 12 separate NON-snapping activation triggers. Per-slide snapping is forbidden. Snap points are real measured offsets (never uniform fractions).
- **D10.** Snap config (single source `deck-config.ts`, tuned ONCE on real hardware in T13, never re-tuned ad hoc): `snap.snapTo = (value)=>snapPointFor(value, offsetsRef.current, maxScroll, direction)`, `duration:{min:0.15,max:0.4}`, `delay:0.12`, `ease:"power2.inOut"`, `inertia:false`.
- **D11.** `snapPointFor(value, offsetsPx, maxScroll, dir)`: convert `value*maxScroll` to px; return nearest offset normalized; exact ties broken toward `dir` (GSAP `self.direction`). Pure function in `deck-snap-math.ts`, unit-tested.
- **D12.** Offset measurement ALWAYS rect-based: `Math.round(el.getBoundingClientRect().top + window.scrollY)`; last offset clamped to `scrollHeight - innerHeight`. `offsetTop` is forbidden (transform-ancestor fragility, QA §1.11). Recomputed on every `ScrollTrigger.addEventListener("refresh")`.
- **D13.** Jump + interrupt sequence (exact, in `Deck.tsx`):
  ```ts
  function goTo(i: number, immediate = false) {
    const st = snapSTRef.current
    const target = offsetsRef.current[Math.max(0, Math.min(SLIDES.length - 1, i))]
    st?.disable()                               // 1. snap stands down FIRST
    gsap.killTweensOf(window)                   // 2. kill prior jump tween (never the snap's internals — snap already disabled)
    if (immediate) { window.scrollTo({ top: target, behavior: "instant" }); st?.enable(); return }
    gsap.to(window, {
      scrollTo: { y: target, autoKill: true },  // 3. user wheel-grab wins mid-flight
      duration: Math.min(0.9, Math.max(0.4, Math.abs(target - window.scrollY) / 3000)),
      ease: "power2.inOut",
      overwrite: true,
      onComplete: reEnableSnap,
      onInterrupt: reEnableSnap,
    })
    clearTimeout(watchdogTimer); watchdogTimer = setTimeout(reEnableSnap, 1200) // 4. guaranteed heal ≤1.2s even if a callback is lost
  }
  function reEnableSnap() { if (!gsap.isTweening(window)) snapSTRef.current?.enable() }
  ```
  The watchdog makes snap-supervisor stranding (QA R3) structurally impossible: worst case snap is off for 1.2 seconds.
- **D14.** CSS smooth-scroll neutralization: `index.css` gains exactly one rule — `html[data-deck] { scroll-behavior: auto; }`. `Deck.tsx` sets `document.documentElement.dataset.deck = "on"` on deck mount, removes it on unmount/fallback. Without this, every snap tween double-animates against `index.css:90`.
- **D15.** Activation: per-slide `ScrollTrigger.create({ trigger:`#${id}`, start:"top 55%", end:"bottom 45%", onToggle:(self)=>{ if(self.isActive) setActiveIndex(i) } })`, all created inside one `gsap.context` in `Deck`. Distribution: React state `activeIndex` in `Deck`; per-slide `SlideActiveContext` provides `{ isActive: boolean } | null`; consumers call `useSlideActive()` — `null` ⇒ component runs its legacy IO/once path unchanged (this IS the fallback contract).
- **D16.** Hash lifecycle (LOCKED — do not "fix" with pushState): `history.replaceState(null, "", "#" + SLIDES[activeIndex].id)` on activation change, rAF-coalesced; `hashchange` listener handles manual address-bar edits → animated `goTo`; browser Back exits the site (no inter-hash history entries are created; scrolling MUST NOT grow history — asserted in QA-C19).
- **D17.** Initial deep link: `useLayoutEffect` reads `location.hash` → matching slide → `window.scrollTo({behavior:"instant"})` pre-paint → set initial `activeIndex`. Unknown hash ⇒ ignored, index 0. Re-anchor pass (QA R4): store `pendingHashTarget` until the earlier of (first user input) or (2.5s after mount); after EVERY refresh-triggered remeasure inside that window, re-scroll instantly to the target slide top and reset `activeIndex`. Guarantees late font/CDN shifts cannot park a cold `/#demo` visitor between slides.
- **D18.** Palette: when the deck is mounted (signal = `isDeckMounted()` from `deckBus`, NOT pathname equality — wildcard routes render Home too), `GlobalPalette` renders ONLY `DECK_PALETTE_ENTRIES` (all slides except hero; `type:"heading"`, `sub:"Slide"`) plus one pinned entry "Browse API Docs → navigates to /docs". Dead `BASE_INDEX` endpoint/heading entries are removed on Home (QA §1.9). `/docs` and `/wiki` palette behavior untouched.
- **D19.** Topbar: `handleNavClick` and `scrollToTop` call `requestJump(id)`; on `false` fall back to existing `scrollIntoView` + `replaceState`. Topbar's IntersectionObserver active-link tracking stays AS-IS v1 (ids unchanged); drift, if observed in T14, is fixed in a follow-up — not in this run.
- **D20.** Generic anchor interception (QA §1.3 — covers Hero CTA "Explore Architecture" and any future inline `#anchor`): `Deck.tsx` mounts one capture-phase `click` listener on the deck container for `a[href^="#"]`; if `requestJump(hash.slice(1))` returns true → `preventDefault()`. `Hero.tsx` itself is NOT modified. Topbar/palette keep their explicit handlers (they perform UI side effects: menu close, highlight).

**Entrances & showpieces**

- **D21.** Replay matrix (frozen, QA §1.5): slide entrances play ONCE (`playedRef`); ArchCanvas pulse restarts on EVERY activation; ArchCanvas draw-in plays once; OpsConsole typewriter starts ONCE + existing manual replay button; KPI count-up runs once via existing IO (`useCountUp.ts` NOT modified). Exit animations: none, ever. Leaving a slide does nothing.
- **D22.** Visibility contract (fixes QA R8/R9 — BLOCKING): content is visible-by-default. NOTHING is ever hidden in markup or CSS. Hidden from-states are applied ONLY at activation time, ONLY in deck mode, ONLY atomically: on the rising activation edge, ONE `gsap.context` callback performs `gsap.set(from-states)` and creates the paused-to-playing timeline in the SAME synchronous block, then `tl.play()`. There is no moment where DOM is hidden without an owning context; error in the callback ⇒ context never commits ⇒ content stays visible. Additionally `Slide.tsx` refuses to arm unless `root.closest(".deck-armed")` is truthy — `Deck` adds class `deck-armed` to the container iff `deckEnabled` is true.
- **D23.** Entrance system: semantic role attributes `data-reveal="kicker" | "title" | "content"` on wrapper-level nodes; timeline in `Slide.tsx`: kicker `y:12,autoAlpha:0→1` 0.45s → title `y:16` 0.55s at `-=0.30` → content items `y:18` 0.55s, `stagger:{each:0.08}`, at `-=0.35`; default ease `power2.out`; HARD CAP 8 content targets per slide; creation wrapped in try/catch (failure ⇒ children untouched). Cleanup `ctx.revert()` (StrictMode-safe).
- **D24.** Team slide (9 > cap): chunk `TEAM_MEMBERS` into 3 row wrappers of 3; the 3 row wrappers are the animated units (`data-reveal="content"`), cards inside inherit — no per-card stagger, no GSAP grid-stagger.
- **D25.** ArchCanvas: DELETE scrubbed pulse timeline + the 5 per-stop boxShadow scrub triggers (`ArchCanvas.tsx:98–129`). Draw-in gated on `useSlideActive()`: `null` ⇒ existing `top 75%, once:true` path; `true` ⇒ plays once. Pulse rebuilt as one paused timeline (fade-in → motionPath along `#lcPath` 3.0s `ease:none` → fade-out + sequential node glows), `restart()` on every rising `isActive` edge. Canvas wrapper capped `h-[62vh] min-h-[420px]` (set on Home wrapper div). InspectorDialog wiring untouched.
- **D26.** OpsConsole (SA's omission OVERRIDDEN per QA §1.4): start condition becomes `(sa === true || ioFired)`; IO branch runs only when `sa === null`; once-guard prevents restart on re-entry; existing replay button unchanged; RM prints all lines instantly. Chips/console markup untouched.
- **D27.** StackGrid: internal paused timeline plays on first activation when `sa !== null`; `null` ⇒ existing `top 80%, once:true` ScrollTrigger. Internal markup untouched.
- **D28.** KpiBand: `variant?: "band" | "slide"` (default `"band"` = today's output byte-for-byte). `"slide"`: `grid-cols-2 lg:grid-cols-4 gap-6`, tile padding `py-6`, numeral `text-4xl xl:text-5xl font-extrabold tabular-nums`, header strip demoted to kicker row; `dl` semantics, count-up, notch/perforation motif preserved.
- **D29.** Hero: ZERO changes (own mount intro = de facto slide-01 entrance; CTA interception handled by D20).

**Chrome & a11y**

- **D30.** Chrome composition: single `DeckChrome.tsx` (dots rail + counter + live region), rendered only when `deckEnabled`, z-index `z-30` MAXIMUM — Radix overlays (InspectorDialog, command palette, `z-50`) must sit above; verified in T14.
- **D31.** Dots: `<nav aria-label="Slides">` + `<ul>` of buttons — explicitly NOT a tablist. 44×44 hit area wrapping visible dot; idle `h-2 w-2 rounded-full`; hover scale-125 (+150ms transition); active vertical pill `h-6 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(251,191,36,.45)]` (shape ≠ color-only signal); hover tooltip chip with slide label, `@media(hover:hover)` guarded; per-button `aria-label={"Go to slide N: Label"}`, `aria-current="true"` on active. Rail `fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-2.5`.
- **D32.** Counter: `fixed bottom-4 left-5 z-30 hidden lg:block`, mono `NN / 12` `tabular-nums tracking-[0.18em] text-[11px]`; visible element `aria-hidden`; separate visually-hidden `aria-live="polite"` region announces `"Slide 3 of 12 — Architecture"` on every activation change, debounced 250ms (adopted from UX wholesale — QA R13).
- **D33.** Keyboard (document-level keydown, deck mode only; SKIPPED when any `[role="dialog"]` is open OR `event.target` matches `input, textarea, select, [contenteditable]`): ArrowDown/PageDown → next; ArrowUp/PageUp → prev; Home → 0; End → 11; `preventDefault()` on handled keys. **Space is NOT bound. Tab is NEVER intercepted.** Rapid repeats: last-input-wins via D13's kill-before-create.
- **D34.** Focus policy: keyboard-initiated navigation focuses the slide heading after the tween settles: `slideEl.querySelector("h1,h2").focus({ preventScroll: true })` (headings get `tabIndex={-1}`). Wheel/touch/scrollbar/dot-click NEVER move focus. Dot clicks keep focus on the clicked dot.
- **D35.** Light-mode contrast corrections (QA R7 — computed pairs, release-gated by axe scan):
  | Element | Dark value | Light value |
  |---|---|---|
  | Counter current number | `text-primary` `#fbbf24` (12.9:1 ✓) | body ink `text-text` `#0b1220` on `#f4f6fb` (≈13:1 ✓) — NOT `text-primary` (3.9:1 ✗) |
  | Counter `/ 12` suffix | `text-dim` | `text-dim` light token, must verify ≥4.5:1, else literal `#5b6b8c` |
  | Dot idle fill | `bg-border-strong` | literal `#475569` (≈7:1 non-text ✓) — NOT `border-strong` light (1.6:1 ✗) |
  | Dot active pill | `bg-primary` + gold glow | literal `#b45309` (≈5:1 ✓), glow shadow suppressed in light mode |
  | Proof-strip numerals | `text-emerald-300` on `emerald-500/[0.06]` (dark ✓) | literal `#047857` on `emerald-600/[0.08]` (≈5.4:1 ✓) — NOT emerald-300 (<2:1 light ✗) |
  | `.hard-card` status text (pre-existing `text-emerald-400`) | unchanged | one scoped override in `index.css`: `html.light .hard-card .shipped-pill { color:#047857 }` |
  Where a token doesn't exist, hardcode the hex inline with a `/* light-AA */` comment. Values above are final; do not re-derive.

**Fallback, resilience, print**

- **D36.** Gate: `deckEnabled = !isMobile(<768px via matchMedia, live) && !reducedMotion(useIsReducedMotion, honors ?motion=force) && !URLSearchParams.has("deck=off")` — the `?deck=off` query param is the production kill-switch, restoring the pre-deck site instantly (QA follow-up mandate). All deck-vs-fallback branches read `useDeckCapabilities()`; scattered matchMedia calls forbidden.
- **D37.** Fallback rendering (`deckEnabled === false`): normal-flow sections, NO `min-h-dvh` lock, no chrome, no triggers, no keyboard, no hash writes, no `data-deck` attribute; Home's batch-reveal effect MOVES VERBATIM into Deck's fallback branch (mobile parity with today's shipped behavior); components self-fallback via `useSlideActive()===null`. `scroll-mt-*` utilities move behind `max-md:` prefix. Runtime flip across the boundary tears down in this ORDER: (1) `gsap.killTweensOf(window)`, (2) `gsap.context.revert()`, (3) remove `data-deck` + `deck-armed`, (4) disconnect RO/listeners.
- **D38.** Print + no-JS: `index.css` appends `@media print { [data-reveal]{opacity:1!important;visibility:visible!important;transform:none!important} .deck-chrome{display:none!important} html{scroll-behavior:auto!important} }`; `Deck` registers `window.addEventListener("beforeprint", () => gsap.set("[data-reveal]", { clearProps: "opacity,visibility,transform" }))` (removed on cleanup). Combined with D22 (activation-time hiding only), unactivated slides are always printable, crawler-renderable, and screenable. Honest SPA caveat recorded: without JS the React app doesn't mount at all (unchanged from today); WITH JS, hidden-content-until-scroll cannot occur (R8/R9 closed).
- **D39.** Refresh orchestration (replaces all three plans' versions): (a) `document.fonts.ready.then(refresh)`; (b) `window.load` once-listener → `refresh()`; (c) ONE ResizeObserver on the deck CONTAINER's border-box, aggregate-height delta <2px ignored, 120ms debounced → `refresh()`; (d) `resize` debounced 150ms → if WIDTH changed >50px → full `refresh()`, else → CHEAP REMEASURE ONLY (recompute `offsetsRef`/`normRef`, no `ScrollTrigger.refresh()`) — this is the iOS URL-bar fix (QA R1 replaces SA's rejected <120px-ignore heuristic); (e) `orientationchange` → delayed 200ms full `refresh()`; (f) `visualViewport` resize → same cheap-remeasure path throttled 100ms; (g) after every remeasure inside the D17 re-anchor window → re-scroll. Theme switches trigger nothing. Dev assertion ships in dev builds only: log warning if refresh events exceed 8 in the first 3s (QA R6 convergence check).
- **D40.** Scrollbar-drag guard (QA R12, preemptive): `pointerdown` with `pointerType==="mouse"` and `clientX >= innerWidth - 20` (gutter zone) → `snapST.disable()`; `pointerup`/`pointercancel` → `reEnableSnap()`. ~10 lines, removes the classic drag-yank failure mode deterministically.
- **D41.** Quality gates: (a) the two vitest suites in D1 must pass with build; (b) main JS chunk gzip delta vs pre-deck baseline < 15KB (ScrollToPlugin ≈ 3KB gz; assert, don't assume — QA R11); (c) Lighthouse mobile+desktop before/after, LCP delta < 200ms (LCP element = hero h1 text, unchanged); (d) LAZY-LOADING THE DECK ENGINE IS FORBIDDEN (breaks offset-measurement timing).

---

## 2. Slide map (12 slides · ids · source · choreography)

Global grammar (D23): kicker @0ms (450ms) → title @120ms (550ms) → content from @240ms, stagger 80ms, 550ms, `power2.out`. Timings below list CONTENT-layer specifics on top of the grammar. All entrances play once (D21).

| # | id | Content source | Entrance choreography (content layer) |
|---|---|---|---|
| 01 | `hero` | `<Hero>` unchanged | Own mount timeline (pre-existing). Grammar NOT applied. No `data-reveal` markers. |
| 02 | `telemetry` | New SlideHead + `<KpiBand variant="slide">` (8 tiles) | Strip animates as ONE unit @240 → 8 tiles stagger 80ms from @320. Count-up fires once via existing IO. |
| 03 | `architecture` | SlideHead 01 + shortened support line ("Client → Router → Auth → Controller → Service → Repository → Model. Click any node to inspect.") + `<ArchCanvas>` capped 62vh | Draw-in starts @240 (traces 0.9s stagger 0.06 → nodes 0.5s stagger 0.045 overlapping −0.55s); pulse plays AFTER draw-in (~@1400ms), 3.0s `ease:none`; replays every activation (D21). Node click → InspectorDialog untouched. |
| 04 | `stack` | SlideHead 02 + bins strip + `<StackGrid>` (6 cards) | Strip unit @240 → grid container as ONE `data-reveal="content"` unit (StackGrid owns its internal 6-card reveal, gated per D27). |
| 05 | `frontend` | SlideHead 03 + bento (big SURFACES card `md:col-span-2 md:row-span-2` + 5 cards) | 6 cards stagger 80ms from @240, big card first (DOM index 0); zone chips pop as one unit inside big card @+200ms. |
| 06 | `security` | SlideHead 04-equivalent tag "hardening delivered · 1 of 2" + `HARDENING.slice(0,5)` compact 5-col grid | 5 cards stagger 80ms from @240, left→right. Full copy intact (no truncation). |
| 07 | `hardening-ii` | Tag "· 2 of 2" + `HARDENING.slice(5)` 4-col grid + proof strip | 4 cards stagger 80ms from @240 → strip rises LAST @+320ms as one unit. Colors per D35 row 5. |
| 08 | `ops` | SlideHead + 8 telemetry chips + `<OpsConsole>` (console body `h-[300px]`) | Chips stagger 80ms from @240 AND console frame fades @240; typewriter starts on activation (once + manual replay, D26). |
| 09 | `deploy` | SlideHead + 4-step vertical timeline + test panel (6 TEST_ROWS + 3 command chips) | 4 steps stagger 80ms from @240 → test panel as ONE column unit @480 → command chips @560. |
| 10 | `demo` | SlideHead + `<ol>` 8 ghost-serif step cards (`lg:grid-cols-4`, ghost numerals 72px) | Exactly 8 cards = cap, stagger 80ms from @240, row-major. |
| 11 | `team` | SlideHead + 9 members in 3 row wrappers (`lg:grid-cols-3`) | 3 row wrappers stagger 80ms from @240 (D24). |
| 12 | `closing` | Extracted `<Closing>` per D8 | Wordmark rise+fade @0 (600ms) → tagline @160 → 3 link cards stagger 80ms from @320 → microcopy @560. |

Shell rules (all slides 02–12): `<section id={id}>` wrapper `relative w-full md:min-h-dvh flex flex-col justify-center pt-16 pb-10` (pt clears sticky h-16 Topbar; `dvh` everywhere — `svh` is banned in deck files, QA §1.12); inner container `mx-auto max-w-[1280px] px-4 lg:px-6`; slides exceeding viewport height are legal (min-h contract; snap lands on measured tops).

---

## 3. File architecture

### New files

```ts
// src/lib/deck-config.ts
export type SlideDef = { id: string; label: string }
export const SLIDES: SlideDef[] = [
  { id:"hero", label:"Overview" }, { id:"telemetry", label:"Operations telemetry" },
  { id:"architecture", label:"Architecture" }, { id:"stack", label:"Stack" },
  { id:"frontend", label:"Frontend" }, { id:"security", label:"Hardening I" },
  { id:"hardening-ii", label:"Hardening II" }, { id:"ops", label:"Ops console" },
  { id:"deploy", label:"Deploy & testing" }, { id:"demo", label:"Product demo" },
  { id:"team", label:"Team 2" }, { id:"closing", label:"Links" },
]
export const MOBILE_BP = "(min-width: 768px)"
export const SNAP = { durationMin: 0.15, durationMax: 0.4, delay: 0.12, ease: "power2.inOut", inertia: false } as const
export const ENTER = { stagger: 0.08, durMin: 0.45, durMax: 0.55, ease: "power2.out", cap: 8 } as const
export const JUMP = { minDur: 0.4, maxDur: 0.9, pxPerSec: 3000, watchdogMs: 1200 } as const
export const REFRESH = { roDeltaPx: 2, roDebounceMs: 120, resizeDebounceMs: 150, vvThrottleMs: 100,
                          orientationDelayMs: 200, reAnchorWindowMs: 2500, widthFullRefreshPx: 50 } as const
export const DECK_PALETTE_ENTRIES /* PaletteEntry[] */ =
  SLIDES.filter(s => s.id !== "hero")
        .map(s => ({ type: "heading", id: s.id, label: s.label, sub: "Slide" }))
```

```ts
// src/lib/deck-snap-math.ts
export function snapPointFor(
  value: number,                 // normalized scroll 0..1
  offsetsPx: readonly number[],  // measured slide tops, ascending, last clamped to maxScroll
  maxScroll: number,
  direction: 1 | -1,             // travel direction for tie-break
): number                        // returns chosen offset/maxScroll
```

```ts
// src/lib/deckBus.ts
type Handlers<K extends keyof Events> = Set<(payload: Events[K]) => void>
interface Events {
  jump: { id: string }
  register: { ids: string[] }
}
export function on<K extends keyof Events>(k: K, fn: (p: Events[K]) => void): () => void
export function emit<K extends keyof Events>(k: K, payload: Events[K]): void
export function isDeckMounted(): boolean
export function requestJump(id: string): boolean   // false ⇒ no deck or unknown id ⇒ caller falls back
export function jumpOrScroll(id: string, rmBehavior: ScrollBehavior): void // convenience used by Topbar/Closing
```

```ts
// src/hooks/useDeckCapabilities.ts
export type DeckCapabilities = {
  isMobile: boolean        // !matchMedia(MOBILE_BP).matches, live
  reducedMotion: boolean   // reuse useIsReducedMotion() (?motion=force honored)
  killSwitch: boolean      // URLSearchParams(location.search).has("deck=off"), read once per navigation
  deckEnabled: boolean     // !isMobile && !reducedMotion && !killSwitch
}
export function useDeckCapabilities(): DeckCapabilities
```

```tsx
// src/components/deck/slide-context.ts
export type SlideActiveValue = { isActive: boolean } | null
export const SlideActiveContext = createContext<SlideActiveValue>(null)
export function useSlideActive(): boolean | null   // null = deck off ⇒ legacy behavior
```

```tsx
// src/components/deck/Deck.tsx
export function Deck(props: {
  slides: Array<{ def: SlideDef; node: React.ReactNode }>
}): JSX.Element
// Owns: activeIndex state; ALL ScrollTriggers (D9/D15); goTo/goToId/next/prev (D13);
// refresh orchestration (D39); scrollbar guard (D40); beforeprint handler (D38);
// data-deck attribute + .deck-armed class; delegated anchor interceptor (D20);
// fallback branch incl. relocated batch-reveal effect (D37); renders <Topbar/> + slides + <DeckChrome/>.
```

```tsx
// src/components/deck/Slide.tsx
export function Slide(props: {
  id: string; label: string; index: number; isActive: boolean; enabled: boolean
  children: React.ReactNode
}): JSX.Element
// Renders <section id aria-labelledby>; md:min-h-dvh shell; provides SlideActiveContext;
// atomic activation-time entrance (D22/D23) gated on closest(".deck-armed"); playedRef; try/catch.
```

```ts
// src/components/deck/useDeckSnap.ts
export function useDeckSnap(deckRef: RefObject<HTMLElement>, enabled: boolean): {
  offsetsRef: MutableRefObject<number[]>
  normRef: MutableRefObject<number[]>
  snapSTRef: MutableRefObject<ScrollTrigger | null>
  remeasure(): void          // cheap recompute (no ST refresh)
}
```

```ts
// src/components/deck/useDeckNav.ts
export function useDeckNav(opts: {
  enabled: boolean; activeIndex: number; count: number
  goTo(index: number, immediate?: boolean): void
}): void
// Keyboard map (D33), editable/dialog guards, focus-to-heading (D34),
// hash sync + hashchange + deep-link re-anchor bookkeeping (D16/D17).
```

```tsx
// src/components/deck/DeckChrome.tsx
export function DeckChrome(props: {
  count: number; activeIndex: number; labels: string[]
  onSelect(index: number): void
}): JSX.Element | null   // null unless parent gates it on; includes dots rail + counter + live region (D30–D32, D35)
```

```tsx
// src/components/deck/SlideHead.tsx
export function SlideHead(props: {
  index: number           // 1-based slide number
  total: number           // 12
  tag: string             // chip copy, authored verbatim
  title: React.ReactNode  // becomes the slide's sole h2
  lead?: React.ReactNode
}): JSX.Element          // D6
```

```tsx
// src/components/sections/Closing.tsx
export function Closing(): JSX.Element   // D8; footer landmark inside; links route through jumpOrScroll/normal hrefs
```

### Modified files (diff contracts)

| File | Exact change |
|---|---|
| `src/lib/gsap.ts` | Import + register + export `ScrollToPlugin`. Three lines. |
| `src/index.css` | Append: `html[data-deck]{scroll-behavior:auto}`; the `@media print` block (D38); `html.light .hard-card .shipped-pill{color:#047857}` (D35); light-mode literals for dots/counter where tokenized per D35. Nothing else — background treatments are OUT OF SCOPE. |
| `src/pages/Home.tsx` | Wrap regions in `<Slide>`; insert Telemetry slide (new SlideHead h2 + `<KpiBand variant="slide">`); split HARDENING 5/4 into two Slides; swap SectionHead → SlideHead on 02–12; add `data-reveal` markers per §2; delete batch-reveal effect (moved to Deck fallback branch); replace inline footer with `<Closing/>`; move Topbar render into `<Deck>`; ArchCanvas wrapper div gets `h-[62vh] min-h-[420px]`. Section internals otherwise untouched. |
| `src/App.tsx` | `GlobalPalette`: subscribe to `isDeckMounted()`; when mounted render `DECK_PALETTE_ENTRIES` + pinned "Browse API Docs" entry INSTEAD OF `BASE_INDEX`; otherwise today's behavior exactly. |
| `src/components/layout/Topbar.tsx` | `handleNavClick`/`scrollToTop` → `requestJump` with `scrollIntoView` fallback (D19). IO active-link tracking untouched. |
| `src/components/palette/command-palette.tsx` | `jump()`: `requestJump(entry.id)` → fallback `getElementById()?.scrollIntoView({smooth})`. ~5 lines. |
| `src/components/canvas/ArchCanvas.tsx` | Per D25 (delete scrubs; `useSlideActive()` gating; pulse rebuild + restart-on-activate). |
| `src/components/sections/KpiBand.tsx` | Per D28 (`variant` prop; `"slide"` layout). |
| `src/components/sections/OpsConsole.tsx` | Per D26 (`useSlideActive()` start condition; once-guard; IO fallback branch). |
| `src/components/sections/StackGrid.tsx` | Per D27 (gate internal reveal through `useSlideActive()`). |

NOT modified: `Hero.tsx`, `hooks/useCountUp.ts`, `InspectorDialog.tsx`, `vite.config.ts`, `package.json` (zero new dependencies), docs/wiki components, `main.tsx`.

---

## 4. Snap + activation mechanics

**Creation (inside one `gsap.context(() => {...}, deckRef.current)` in `Deck`'s mount effect — StrictMode double-mount leaves zero duplicates, verified by counting `ScrollTrigger.getAll()`):**

```ts
// 1. Global snap trigger
const snapST = ScrollTrigger.create({
  trigger: deckRef.current!,
  start: "top top",
  end: "bottom bottom",
  snap: {
    snapTo: (value) => snapPointFor(value, snap.offsetsRef.current, maxScroll(), dirRef.current),
    duration: { min: SNAP.durationMin, max: SNAP.durationMax },
    delay: SNAP.delay,
    ease: SNAP.ease,
    inertia: false,
  },
  onUpdate: (self) => { dirRef.current = self.direction },
})

// 2. Activation triggers (one per slide)
SLIDES.forEach((s, i) => ScrollTrigger.create({
  trigger: `#${s.id}`,
  start: "top 55%",
  end: "bottom 45%",
  onToggle: (self) => { if (self.isActive) setActiveIndex(i) },
}))

// 3. Keep points honest
ScrollTrigger.addEventListener("refresh", snap.remeasure)
```

**Guards inventory (all mandatory):**
| Guard | Mechanism | Decision |
|---|---|---|
| Trackpad inertia | `delay:0.12` + `inertia:false` + directional tie-break | D10/D11 |
| Programmatic jumps | disable → kill → tween(`autoKill:true`) → re-enable on complete/interrupt + 1200ms watchdog | D13 |
| CSS smooth-scroll | `html[data-deck]{scroll-behavior:auto}` + attribute lifecycle | D14 |
| Rapid keyboard | kill-before-create inside `goTo` (last input wins) | D33 |
| Anchor hard-jumps | all internal anchors intercepted (Topbar/palette explicit; everything else delegated, incl. Hero CTA) | D19/D20 |
| Scrollbar drag | gutter pointerdown disables snap, pointerup re-enables | D40 |
| iOS bar collapse | cheap remeasure (no refresh) on visualViewport/height-only resize; full refresh only on width/orientation change | D39(e/f) |
| Late font/CDN shift on deep link | `pendingHashTarget` re-anchor pass ≤2.5s window | D17 |
| Dialog open | Radix locks body scroll; snap idle; post-close position verified in T14 | QA checklist |
| Stranded supervisor | watchdog re-enable ≤1.2s unconditional heal | D13 |

**Activation → consumption chain:** activation trigger fires → `setActiveIndex(i)` → `Deck` re-renders affected `Slide` with `isActive` → `SlideActiveContext` updates → consumer components (`ArchCanvas`, `OpsConsole`, `StackGrid` via `useSlideActive()`) react; `Slide` itself plays its entrance; `useDeckNav` writes hash + announces + focuses heading (keyboard-initiated only).

---

## 5. Chrome + a11y spec

**Dots rail** (D31): structure, geometry, states, tooltips, and ARIA exactly as specified in D31. Hit area 44×44 is non-negotiable (WCAG 2.5.5). Active signal is shape (pill) + color — never color alone.

**Counter + live region** (D32): visible counter `aria-hidden`; the polite live region is the ONLY announcer; message format `"Slide {N} of 12 — {label}"`; debounce 250ms.

**Keyboard** (D33): bindings and guards exactly as listed; Space untouched; Tab untouched; edge keys clamped no-op.

**Focus** (D34): headings `tabIndex={-1}` added by `SlideHead`/Closing h2; focus moves ONLY on Arrow/Page/Home/End navigation, after tween settle, `preventScroll:true`.

**Contrast** (D35): the six-row table is normative. Light-mode literals carry `/* light-AA */`. Release gate = axe DevTools scan, BOTH themes, deck + fallback modes, zero critical violations (T14/QA-C23).

**Landmarks:** `<main>` wraps deck content (existing); `<nav aria-label="Slides">` for dots; `<footer>` inside Closing; sequential `h1 → h2×11 → h3`.

---

## 6. Fallback + kill-switch + print/no-JS

- Gate math and kill-switch: D36. `?deck=off` wins over everything.
- Fallback rendering + parity + teardown order: D37.
- Print: media query + `beforeprint` clearProps: D38. Verification is a release gate (Cmd/Ctrl+P after partial scroll → every slide readable in preview AND exported PDF).
- No-JS/crawler honesty: with JS running, no content sits hidden before activation (D22); without JS the SPA doesn't mount (pre-existing condition, unchanged, documented — not claimed as "handled").
- Reduced motion: deck fully off; existing IO reveals remain; typewriter prints instantly; count-up instant (existing hook behavior); `?motion=force` still forces deck on for QA.

---

## 7. Ordered task breakdown

Verify command everywhere: `npm run build && npm run lint` (plus stated manual checks). Baseline capture FIRST: record `ls dist/assets/*.js` gzip sizes + Lighthouse scores on current `main` before T1 (needed by D41/T13 gates).

| # | Task | Files | Verify |
|---|---|---|---|
| T0 | Capture baselines: chunk gzip sizes, Lighthouse mobile+desktop, screenshots of current Home (desktop+375px) for regression comparison | none (records only) | Numbers recorded in PR description |
| T1 | Register ScrollToPlugin; create `deck-config.ts` + `deckBus.ts` + `useDeckCapabilities.ts` | `lib/gsap.ts`, 3 new files | Build green; console roundtrip `requestJump` false when no deck; `?motion=force` + `?deck=off` unit-checked |
| T2 | `deck-snap-math.ts` + vitest suite (nearest, tie-break ±dir, clamped last point, single-offset, unsorted-input rejection) | 2 files | `vitest` green |
| T3 | `slide-context.ts` + `Slide.tsx` (fallback-safe shell: renders plain section when `enabled=false`; atomic entrance per D22/D23 behind `.deck-armed`) + `index.css` additions (D14 rule, print block, light-AA literals) | 2 new + `index.css` | Build; with deck OFF: sections render, zero hidden elements in computed styles; print preview shows all content |
| T4 | `Deck.tsx` core: activation triggers, `activeIndex`, snap trigger via `useDeckSnap`, jump sequence + watchdog (D13 verbatim), refresh orchestrator (D39), scrollbar guard (D40), `beforeprint` handler, `dataset.deck`/`deck-armed` lifecycle, delegated anchor interceptor (D20), fallback branch hosting relocated batch-reveal | `Deck.tsx`, `useDeckSnap.ts` | Dev run: wheel snaps 12 slides; StrictMode double-mount ⇒ `ScrollTrigger.getAll()` count stable across remounts; dev refresh-counter warning silent (<8/3s) |
| T5 | `useDeckNav.ts`: keyboard map + guards, focus-to-heading, hash sync + `hashchange`, deep-link instant jump + re-anchor pass | `useDeckNav.ts` | Cold load `/#demo` lands aligned; arrows/PgUp/PgDn/Home/End; manual hash edit jumps; scrolling never grows `history.length` |
| T6 | `DeckChrome.tsx` + `SlideHead.tsx` per D5/D6/D30–D35 | 2 files | Dots reflect active slide; 44px targets; tooltip on hover-capable pointers; counter `03 / 12`; live-region announcement observable; axe scan clean in dark mode |
| T7 | `deckBus.test.ts` (registry, requestJump false-unmounted, unsubscribe) | 1 file | Vitest green |
| T8 | Rewire `Home.tsx`: 12 `<Slide>` wraps, SlideHead swaps, Telemetry head + h2, hardening split + proof strip, `data-reveal` markers per §2, batch-reveal removal (→ already in Deck fallback), `<Closing/>` extraction replacing inline footer, Topbar into `<Deck>`, ArchCanvas 62vh wrapper | `Home.tsx`, `components/sections/Closing.tsx` | Build+lint; DOM order logical; landmarks tree intact (`footer` present once); visual parity vs T0 screenshots at 375px |
| T9 | `KpiBand.tsx` variant work (D28) | `KpiBand.tsx` | `"band"` output identical to T0 screenshot; `"slide"` = 2×4 grid, `text-4xl xl:text-5xl`, dl intact |
| T10 | `ArchCanvas.tsx` conversion (D25): delete scrubs lines 98–129, `useSlideActive()` gate, pulse rebuild + restart | `ArchCanvas.tsx` | Entering slide 03: draw-in once, pulse plays after draw, replays on re-entry; scrubbing gone; node click/dialog unaffected; `null` path (mobile) draws via old trigger |
| T11 | `OpsConsole.tsx` + `StackGrid.tsx` seams (D26/D27) | 2 files | Typing starts only on slide-08 activation, once, replay works, RM instant; stack reveals fire on activation in deck, old trigger in fallback |
| T12 | Integration: `Topbar.tsx` + `command-palette.tsx` requestJump paths; `App.tsx` deck-mounted palette swap | 3 files | Ctrl-K on `/` lists ONLY slide entries + docs pin; selecting "login" impossible (purged); `/docs`,`/wiki` palettes byte-identical behavior; Hero CTA click = single motion landing on slide 03 |
| T13 | Tuning + budget session on REAL hardware: snap constants validated (Windows precision touchpad Edge/Chrome/Firefox, macOS Safari Magic Mouse); chunk delta <15KB gz asserted vs T0; Lighthouse LCP delta <200ms | none | Constants finalized in `deck-config.ts` (single place); budgets green |
| T14 | Full QA checklist (§8) executed; axe both themes both modes; SR smoke; print; device matrix; kill-switch drill | none | Every checklist box checked; results logged in PR |

Critical path: T1→T3→T4→T8. T2/T6/T7 parallelizable after T1. T9–T12 parallelizable after T8. T13/T14 close.

---

## 8. QA checklist (merged, deduplicated, grouped)

Release-blocking unless marked (P2).

**A. Desktop interactions**
1. Wheel: every slide snaps; fast flick never skips >1 slide; no half-slide resting state.
2. Windows precision touchpad (Edge+Chrome+Firefox): flick inertia settles nearest, no backward yank, no boundary oscillation.
3. macOS Safari + Magic Mouse: inertial flick across 3+ slides, no multi-slide overshoot.
4. Firefox desktop: snap tween smooth, no stutter.
5. Slow scrollbar drag end-to-end, release at random points: no yanking; gutter guard engages (P2 if minor jank persists — documented, not blocking).
6. Rapid Ctrl-K select → wheel-grab mid-flight ×20: afterwards plain wheel snaps again (watchdog heal proven).
7. Mash Home/End/PageUp/PageDown ×30: ends on valid boundary, counter == dots.
8. Open InspectorDialog from slide 03 → close: scroll position intact, correct dot, snap resumes.
9. Theme switch mid-snap-tween and mid-entrance: no stuck transforms.

**B. Keyboard + screen reader**
10. Keyboard-only walkthrough, no mouse: Tab reaches dots, Enter activates, arrows navigate, focus ring visible on h2 after arrival.
11. Space on focused dot/button does NOT advance the slide and DOES activate it.
12. VoiceOver (iOS Safari) + NVDA (Firefox): slide change announced via live region; heading outline h1→11×h2 sequential; dot labels meaningful.
13. Manual hash edit `/#team` from slide 2 → animated jump; Back afterwards LEAVES SITE; `history.length` never grows while scrolling.

**C. Navigation & deep links**
14. Cold load `/#demo`: opens on demo slide, aligned, entrance plays once.
15. Cold load with slow-3G throttle: fonts/CDN arrive late → re-anchor pass still parks on demo slide.
16. Topbar Security → slide 06; Demo → slide 10; logo → slide 01; Hero CTA → slide 03 (single animation each).
17. Palette on `/`: slide entries jump; docs entries absent; `/docs`+`/wiki` palette behavior identical to production today.

**D. Responsive + devices**
18. Real iPhone Safari: all 12 slides; collapse/expand address bar mid-slide; rotate mid-snap → lands within ±0px of slide top.
19. Real Android Chrome: momentum behavior acceptable, no misalignment.
20. iPad Safari at exactly 768px on hardware: gate flips cleanly (split-view resize crosses boundary live).
21. Resize across 768px repeatedly (desktop): clean teardown/rebuild; heap snapshot stable over 10 crossings; `ScrollTrigger.getAll()` count stable.
22. Toggle OS reduced-motion LIVE at slide 7: clean teardown, all content visible, zero orphan transforms; toggle back rebuilds cleanly.
23. OS text scaling 125%/150% and browser zoom 80/110/125%: offsets recompute, no clipped heads under Topbar.

**E. Accessibility & themes**
24. axe DevTools: zero critical violations — dark deck, LIGHT deck (contrast table D35 enforced via tool, not eye), dark fallback, light fallback.
25. Print: Cmd/Ctrl+P after partial scroll → ALL 12 slides fully readable in preview and PDF export.
26. Rendered-DOM check: crawler-style render without scrolling shows slide text visible (post-deploy: Search Console URL inspection screenshot).

**F. Performance & hygiene**
27. Lighthouse mobile+desktop vs T0 baseline: LCP delta <200ms, CLS 0.
28. Main chunk gzip delta <15KB vs T0; no lazy-loading of deck engine introduced.
29. Dev-mode refresh counter: <8 refresh events in first 3s, flatline after; zero duplicate triggers post-StrictMode.
30. `npm run build && npm run lint` clean; vitest suites green.
31. Kill-switch drill: append `?deck=off` at any scroll depth → site behaves exactly like T0 baseline; remove param → deck returns.
32. (P2) Post-deploy staging: Search Console inspection (item 26) + field spot-check on one real iOS device.

---

## 9. Risk register → mitigations → owners

| Risk | Severity | Mitigation (decision refs) | Owner task |
|---|---|---|---|
| R1 iOS stale offsets on bar collapse | 🟠 | Cheap remeasure on visualViewport/height-only resize; full refresh only on width/orientation (D39e/f) | T4, T13, QA-A18/20 |
| R2 Trackpad inertia vs constants | 🟠 | Centralized constants, tuned once on real hardware (D10) | T13, QA-A2/3/4 |
| R3 Snap-supervisor stranding on mid-flight jump | 🟠 | Disable-before-kill ordering + autoKill + dual callbacks + 1200ms unconditional watchdog (D13) | T4, QA-A6 |
| R4 Deep-link drift after fonts/CDN | 🟠 | `pendingHashTarget` re-anchor pass, 2.5s window, re-scroll after every remeasure (D17) | T5, QA-C14/15 |
| R5 Back-button semantics | 🟡 | LOCKED: replaceState-only; Back exits site; no pushState permitted (D16) | T5, QA-B13 |
| R6 Refresh loop / non-convergence | 🟡 | Single container-border-box RO + delta guard + debounce + dev counter assertion (D39) | T4, QA-F29 |
| R7 Light-mode AA failures in new chrome | 🟠 | Normative contrast table with computed hexes (D35); axe both themes is release gate | T6, T14, QA-E24 |
| R8 Print blank pages via creation-time from-states | 🔴 | Activation-time atomic arming + `beforeprint` clearProps + `@media print` overrides (D22, D38) | T3, T4, QA-E25 |
| R9 Crawler-visible-hidden content | 🟡 | Same activation-time mechanism (nothing hidden pre-activation); honest SPA caveat documented (D22, D38) | T3, QA-E26 |
| R10 LCP regression | 🟢 | Hero untouched; chrome fixed-position out-of-flow; Lighthouse gate (D41c) | T0/T13, QA-F27 |
| R11 Chunk size | 🢁 🟢 | ScrollToPlugin ≈3KB gz; <15KB delta asserted; lazy-load forbidden (D41b/d) | T13, QA-F28 |
| R12 Scrollbar drag fight | 🟡 | Preemptive gutter pointerdown/up snap suspend (D40) | T4, QA-A5 |
| R13 SR silence (architect/frontend gap) | 🟠 | Live region + focus-on-keyboard-nav adopted wholesale (D32, D34) | T5/T6, QA-B12 |
| R14 Three competing architectures | 🔴 | This document IS the merge: one manifest/bus/attribute/seam/replay-matrix/refresh-owner (D1–D3, D21) | Entire plan |
| R15 Dialog scroll-lock vs snap | 🟡 | Snap idle while locked; post-close position check | QA-A8 |
| §1.3 Hero CTA unintercepted | 🔴 | Container-level delegated anchor interception (D20) | T4, T12, QA-C16 |
| §1.7 Space steal | 🔴 | Space unbound (D33) | T5, QA-B11 |
| §1.9 Palette dead entries / wildcard-route gap | 🟠 | deck-mounted gating + BASE_INDEX purge on Home (D18) | T12, QA-C17 |
| §1.11 `offsetTop` fragility | 🟡 | Rect-based measurement mandated everywhere (D12) | T4 |
| §1.12 svh/dvh divergence | 🟡 | dvh only; svh banned in deck files (§2 shell rules) | T8 |

---

## Appendix — Explicitly out of scope (binding)

Lenis mounting · Flip plugin · per-slide background treatments · ScrollHint component · normalizeScroll (any mode, including diagnostic) · custom touch/swipe gestures · section copy/token redesign · automated e2e suite · Topbar active-link rewiring (IO kept; follow-up only on observed drift) · `useCountUp` modifications.
