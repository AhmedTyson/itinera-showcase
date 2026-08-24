# SPEC — Variant A Vertical Snap Deck (Itinera Showcase → Production)

Status: DRAFT for approval · Author: System Architect · Date: 2026-08-24
Stack (verified): React 19.2 · Vite 8 · Tailwind 4.3 · gsap ^3.15.0 (ScrollTrigger + MotionPath registered; **Flip not registered — stays out**) · react-router 7 BrowserRouter · StrictMode ON · Google Fonts (Inter/JetBrains Mono/Newsreader) via `index.html`.

---

## 0. Ground-truth audit (what constrains this design)

| Fact | File | Consequence |
|---|---|---|
| StrictMode double-invokes effects | `src/main.tsx` | All GSAP must live in `gsap.context()` + `ctx.revert()` cleanup (existing pattern). |
| `Home.tsx` runs its own batch reveal (`ScrollTrigger.batch` on `.fe-card/.hard-card/.demo-card/.dep-step`, autoAlpha from-states) | `Home.tsx:103-113` | **Must be removed** when Slide entrances take ownership, else double-hide/fight. |
| `ArchCanvas.tsx` uses **scrubbed** triggers: lifecycle pulse (`scrub:0.5`) + per-layer reveals (`scrub:true`) | `ArchCanvas.tsx:97-123` | Motion spec bans scrub for deck. Convert these two to paused timelines played on slide activation. Draw-in (`once:true` top 75%) already compatible. |
| `StackGrid.tsx` uses `once:true` onEnter at 80% | `StackGrid.tsx:70` | Compatible with snap (fires on first entry ≈ activation). **No change.** |
| Topbar anchors: `scrollIntoView({smooth})` + `replaceState`; active tracking via IntersectionObserver rootMargin | `Topbar.tsx:55-90` | Smooth scroll fights snap → intercept via deck event with fallback. IO tracking replaced in deck mode. |
| Command palette: global in `App.tsx`; home route passes `entries=[]` so only docs endpoints/headings appear; `jump()` does `getElementById().scrollIntoView` | `command-palette.tsx:51-62`, `App.tsx:14-17` | Home needs deck entries injected + jump intercepted. Docs/Wiki behavior untouched. |
| `useIsReducedMotion()` exists, honors `?motion=force` QA flag, live-updates | `hooks/useIsReducedMotion.ts` | Reused as RM gate. |
| Lenis is a dependency but no instance is ever created (only a `window.__lenis` DIP stub) | `package.json`, `hooks/useScrollTo.ts` | **Do not mount Lenis** — native scroll + ScrollTrigger snap is the v1 contract; Lenis+snap = double smoothing risk. |
| KpiBand renders header strip + `dl` grid-cols-2/sm:4/lg:8, values `text-2xl`, count-up hook, dl semantics | `KpiBand.tsx` | Telemetry slide extends it via `variant` prop (no rewrite of tiles/count-up/dl). |
| Hero owns its own entrance timeline on mount | `Hero.tsx` useEffect | Slide 1 activation = initial load; keep Hero timeline as-is, gate Slide entrance system off for hero. |
| Fonts are remote (`document.fonts.ready` matters) | `index.html:12-15` | Refresh hook required post-font-load. |
| Footer markup lives inline at end of `Home.tsx` with wordmark, 4 links, © row | `Home.tsx:391-418` | Extracted into new Closing slide component; `<footer>` landmark preserved inside it. |

---

## 1. Decided slide list & order (12 slides)

| # | id (hash) | Content source | Notes |
|---|---|---|---|
| 01 | `#hero` | `<Hero>` existing | Own entrance timeline; Slide wrapper adds no entrance. |
| 02 | `#telemetry` | `KpiBand variant="deck"` + new kicker/h2 head | 8 KPI items → grid-cols-2 / lg:grid-cols-4 (2×4), value `text-4xl`. Keeps `dl`/count-up/perforation motif. New h2: "Operations telemetry". |
| 03 | `#architecture` | section 01 unchanged internals | ArchCanvas scrub→play-on-activate conversion (see §6). |
| 04 | `#stack` | section 02 unchanged | StackGrid internal reveal untouched. |
| 05 | `#frontend` | section 03 unchanged internals | Cards get entrance via `[data-enter]` markers on containers. |
| 06 | `#security` | Hardening I — `HARDENING.slice(0,5)` | Keeps canonical anchor id (Topbar "Security" target). Head reused. |
| 07 | `#security-more` | Hardening II — `HARDENING.slice(5)` + summary strip | Strip: `55 suites · 106 ops · 0 wildcards` mono, emerald accents, aria-label "Verification summary". |
| 08 | `#ops` | section 05 unchanged internals | OpsConsole untouched. |
| 09 | `#deploy` | section 06 unchanged | Stays separate (approved decision 4). |
| 10 | `#demo` | section 07 unchanged | Stays separate. |
| 11 | `#team` | section 08 cards | Row-stagger beats (see §7). |
| 12 | `#closing` | extracted ClosingSlide | Wordmark `Itinera.` + tagline + **3 link cards** (API Docs https://itinera.apidog.io · GitHub repo https://github.com/AhmedTyson/Team2-Conference-Project · Wiki `/wiki` router Link) + compact © row (`© 2026 Itinera — Team 2 · MIT …` + `site updated`). Wrapped in `<footer>` element to preserve landmark semantics. |

**Fates:** KPI strip → promoted to full slide (02). Footer → closing slide; old `<footer>` block deleted from Home. All legacy anchor ids preserved verbatim except footer-only `#architecture` link (re-routed through deck nav like other anchors). Section numbering kickers stay as authored (`01`…`08` are content labels, not slide indices — counter chrome shows real slide numbers).

**Headings per slide:** Hero has h1; every other slide exposes exactly one h2 (Telemetry gets a new one via its head; Closing gets h2 "Ship it with us" style heading — final copy implementer's choice, one h2 mandatory). No h1 duplicates.

---

## 2. File architecture

### New files

```
src/lib/deck-config.ts          SLIDES, timing constants, palette entries
src/lib/deck-motion.ts          buildEntrance() shared choreography helper
src/components/deck/DeckContext.tsx   React context + provider shell
src/hooks/useDeckScroll.ts      engine: snap trigger, activation triggers,
                                keyboard, hash sync, resize/fonts refresh
src/components/deck/Slide.tsx   <section> wrapper + entrance lifecycle
src/components/deck/DeckChrome.tsx    dots rail + mono counter
src/components/sections/ClosingSlide.tsx  extracted footer content
```

### Modified files (minimal-diff inventory)

| File | Change |
|---|---|
| `src/pages/Home.tsx` | Wrap each region in `<Slide>`; split hardening into two Slides; delete batch-reveal effect; replace footer with `<ClosingSlide/>`; render `<DeckChrome/>`; wire `useDeckScroll`. Section internals untouched. |
| `src/lib/gsap.ts` | Register `ScrollToPlugin` (ships inside the gsap npm package — **not a new dependency**). Needed for programmatic goTo tweening. |
| `src/components/layout/Topbar.tsx` | Anchor clicks dispatch cancelable `deck:goto` event, fall back to current behavior if unhandled; active-link state subscribes to `deck:change` when deck mode is on (IO path kept for non-home variants). ~15 lines. |
| `src/components/palette/command-palette.tsx` | `jump()` dispatches cancelable `deck:goto` before falling back to `scrollIntoView`. ~5 lines. |
| `src/App.tsx` | `GlobalPalette` memo: when `location.pathname === "/"`, prepend `DECK_PALETTE_ENTRIES` (type `"heading"`, sub `"Slide"`). |
| `src/components/canvas/ArchCanvas.tsx` | Convert the 2 scrubbed timelines to paused timelines; play them on receiving `deck:change {id:"architecture"}` (idempotent once-flag). Draw-in path unchanged. |
| `src/components/sections/KpiBand.tsx` | Add `variant?: "strip" \| "deck"` prop: deck variant switches grid to `grid-cols-2 lg:grid-cols-4` and value class to `text-4xl`; header strip hidden in deck variant (slide head replaces it). Tiles/dl/count-up untouched. |

No other files change. No new npm dependencies. Design tokens, colors, mono kickers untouched.

### Deck config shape — `src/lib/deck-config.ts`

```ts
export type SlideDef = { id: string; label: string }   // label → dot tooltip + aria
export const SLIDES: SlideDef[] = [
  { id: "hero", label: "Overview" },
  { id: "telemetry", label: "Operations telemetry" },
  { id: "architecture", label: "Architecture" },
  { id: "stack", label: "Stack" },
  { id: "frontend", label: "Frontend" },
  { id: "security", label: "Hardening I" },
  { id: "security-more", label: "Hardening II" },
  { id: "ops", label: "Ops console" },
  { id: "deploy", label: "Deploy & testing" },
  { id: "demo", label: "Product demo" },
  { id: "team", label: "Team 2" },
  { id: "closing", label: "Links" },
]
// constants
SNAP = { durationMin: 0.15, durationMax: 0.4, delay: 0.12, ease: "power2.inOut" }
ENTER = { stagger: 0.08, durMin: 0.4, durMax: 0.6, ease: "power2.out", maxChildren: 8 }
MOBILE_BP = "(min-width: 768px)"
export const DECK_PALETTE_ENTRIES /* PaletteEntry[] */ =
  SLIDES.filter(s => s.id !== "hero").map(s => ({ type:"heading", id:s.id, label:s.label, sub:"Slide" }))
```

### Context / API shape — `DeckContext.tsx`

```ts
type DeckApi = {
  enabled: boolean            // !reducedMotion && matchMedia(MOBILE_BP)
  count: number               // SLIDES.length (12)
  activeIndex: number
  goTo(target: number | string): void  // index or "#hash"; clamps, tweens scroll
  next(): void
  prev(): void
}
const DeckContext = createContext<DeckApi | null>(null)
export const useDeck = () => useContext(DeckContext)   // null outside deck → consumers no-op
```

Provider lives in `Home.tsx`; `useDeckScroll` computes and supplies the API. Chrome + Slide consume context.

### Event bus (non-React integration)

Two window CustomEvents — chosen over a global mutable singleton because Topbar/Palette/ArchCanvas must integrate with zero prop drilling:

- `deck:goto` — `{ detail: { hash: string }, cancelable: true }`. Emitted by Topbar links, palette `jump()`, closing-slide "Architecture" link. Deck handler: `preventDefault()`, resolves hash → index, `goTo()`. If nobody handles (docs/wiki pages), emitter falls back to existing `scrollIntoView` path. This keeps docs/wiki byte-identical.
- `deck:change` — `{ detail: { index, id } }`. Emitted by engine whenever activeIndex changes. Consumers: Topbar active underline, ArchCanvas play-on-activate.

---

## 3. Snap mechanics (exact)

**One global snap trigger + N cheap activation triggers. Never per-slide snapping.**

### Global snap ScrollTrigger (in `useDeckScroll`)
```
ScrollTrigger.create({
  trigger: document.documentElement,
  start: "top top",
  end: "bottom bottom",
  snap: {
    snapTo: directionalSnap,                 // below
    duration: { min: 0.15, max: 0.4 },       // spec: 0.4 nominal
    delay: 0.12,                             // inertia debounce — GSAP restarts timer
    ease: "power2.inOut",                    // spec-mandated
  },
})
```

**Offset computation.** On `refresh` event: measure each slide element via
`Math.round(el.getBoundingClientRect().top + window.scrollY)`, clamp last offset to `maxScroll = scrollHeight - innerHeight`. Store sorted `offsetsPx[]` + their normalized form `/maxScroll`. Recompute automatically by calling the measurement routine from:
- `ScrollTrigger.addEventListener("refresh", measure)` (covers `invalidateOnRefresh` cycles),
- `window.resize` debounced 150 ms → `ScrollTrigger.refresh()`,
- `document.fonts.ready.then(() => ScrollTrigger.refresh())`,
- ResizeObserver on the deck container (content-height drift, e.g. InspectorDialog never changes layout but OpsConsole chips can reflow) → refresh.

**Directional snapTo.** Track travel direction in the same trigger's `onUpdate` (`dir = self.direction`). `snapTo(value)`:
1. `px = value * maxScroll`
2. Candidates = all offsets within ±1 viewport of `px`.
3. Pick nearest candidate to `px`; tie (< 20% into slide) broken toward `dir` (prevents stuck-on-boundary oscillation).
4. Return `chosenOffset / maxScroll`.

**Conflict mitigations (exact):**
- *Programmatic jumps* (palette/dots/keyboard): set module flag `suppressSnap = true` before `gsap.to(window, { scrollTo: { y: offsets[i], autoKill: false }, duration: 0.45, ease: "power2.inOut" })`; clear on complete/onInterrupt. `snapTo` returns current value unchanged while suppressed. `autoKill:false` prevents user wheel during flight from stranding mid-slide without snap cleanup.
- *Trackpad inertia*: handled by `delay: 0.12` (each momentum tick resets snap timer) + directional nearest (no backward yank).
- *Rapid keyboard*: `goTo` checks `gsap.isTweening(window)` → kill previous tween before starting new (last-input-wins).
- *Snap fighting browser anchor jump*: Topbar/palette never call native `scrollIntoView` in deck mode (event interception above); `history.replaceState` only — never `location.hash =` assignment (would hard-jump).

### Activation (entrance firing)
Per slide: `ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 45%", onToggle })`. With ≥100vh slides these windows tile contiguously; `onToggle(self.isActive)` → emit `deck:change`, set context `activeIndex`. Entrance playback is **not** in the trigger — `Slide.tsx` subscribes to context:

```tsx
useEffect(() => {                       // inside Slide
  if (!enabled || index !== activeIndex || playedRef.current) return
  playedRef.current = true              // play once, never replay on re-entry (exit ≤250ms rule ⇒ scroll IS the exit)
  tlRef.current?.play()
}, [activeIndex, enabled])
```

Timeline built paused inside the Slide's own `gsap.context` on mount via `buildEntrance(rootRef, opts)`; `ctx.revert()` on unmount restores DOM (StrictMode-safe, content visible pre-JS because `from` states are applied by JS only).

---

## 4. Chrome wiring (exact handlers)

### Progress dots — `DeckChrome.tsx`
- Fixed right-center vertical rail (`fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-2.5`), rendered only when `enabled`.
- Per dot: `<button type="button" aria-label={`Go to slide ${i+1}: ${label}`} aria-current={active===i ? "true":undefined} className="h-2 w-2 rounded-full border border-border cursor-pointer transition-[background-color,width] duration-200 hover:bg-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 data-[active]:w-2.5 data-[active]:bg-primary">` — hover transition 150–300ms band ✓.
- Click → `goTo(i)`. Rail wrapped in `<nav aria-label="Slides">`.
- Counter: fixed bottom-left `fixed bottom-4 left-5 z-30 hidden md:block font-mono text-[11px] text-dim tabular-nums`, text `` `${String(activeIndex+1).padStart(2,"0")} / ${String(count).padStart(2,"0")}` `` with `aria-hidden` (duplicated info is decorative; dots carry the semantic nav).

### Keyboard — window keydown listener in `useDeckScroll` (deck-enabled only; skipped entirely when palette/dialog open — check `document.querySelector('[role="dialog"]')`):
```
ArrowDown / PageDown  → next()
ArrowUp   / PageUp    → prev()
Home                  → goTo(0)
End                   → goTo(count - 1)
e.preventDefault() on all handled keys
Space NOT intercepted (native page scroll feeds snap naturally)
```

### Hash sync
- Passive tracking: on `activeIndex` change → `history.replaceState(null, "", "#" + SLIDES[activeIndex].id)` (**replaceState always — pushState would pollute back-button history with every scroll**; deep-link/back-forward correctness wins).
- Initial load: `useLayoutEffect` reads `location.hash`, finds matching slide, `window.scrollTo({ top: offset, behavior: "auto" })` synchronously before paint, sets initial `activeIndex` accordingly; unknown hash → ignored, index 0. Runs after first measure; measure runs in same layout effect.
- `popstate`/manual hash edit: `hashchange` listener → if hash maps to a slide ≠ activeIndex, `goTo(index)` (suppressSnap path).

### Integration routing summary
| Source | Path |
|---|---|
| Topbar link click | `deck:goto` (cancelable) → deck handles; else legacy fallback |
| Ctrl-K palette item | `DECK_PALETTE_ENTRIES` shown on `/`; `jump()` emits `deck:goto`; docs/wiki ids unhandled → legacy scroll |
| Deep link `/#demo` | layout-effect immediate jump + hash retained |
| Dots / keyboard / counter | direct `goTo` via context |

---

## 5. Mobile & reduced-motion fallback

Gate: `enabled = !useIsReducedMotion() && useMediaQuery("(min-width: 768px)")` (new tiny `useMediaQuery` hook or inline in `useDeckScroll`; live listeners both).

When `enabled === false`:
- `Slide` renders plain `<section id>` — no min-height lock beyond natural content flow? **No: keep `min-h-screen` off on mobile** (`md:min-h-screen` responsive class) so long content scrolls natively without dead space.
- No snap trigger, no activation triggers, no entrance timelines, no keyboard listeners, no dots/counter (also `hidden md:` guarded).
- `playedRef` irrelevant; all content statically visible.
- `deck:goto` emitters fall back to legacy smooth `scrollIntoView` (existing Topbar code path) — mobile nav still works.
- Crossing the breakpoint or toggling RM at runtime: effect deps include `enabled`; teardown `ctx.revert()` + `ScrollTrigger.getAll()` scoped cleanup + fresh init on flip. Verified manually via DevTools device toolbar.

Content-without-JS guarantee: every hidden-from-state (`autoAlpha:0`, `y:14`) is applied exclusively inside JS-run `gsap.context`. CSS contains no opacity/transform hiding for slide content. If JS never executes the React app doesn't render at all (SPA reality) — requirement satisfied at the "GSAP failure can't hide content" level: entrance builder wrapped in try/catch that leaves children untouched on error.

---

## 6. Production concerns

| Concern | Decision |
|---|---|
| Font-load reflow | `document.fonts.ready.then(() => ScrollTrigger.refresh())` + safety `setTimeout(refresh, 400)`; also `fonts.onloadingdone` implicit via ready promise. |
| Resize | Debounced (150 ms) `resize` → `refresh()` (recomputes offsets via refresh listener). |
| iOS Safari URL-bar | Slides sized with `min-h-dvh` (Tailwind 4 `min-h-screen` replaced where used by deck wrapper: `md:min-h-dvh`); snap offsets measured from real layout so bar collapse shifts are absorbed; ignore height-only resizes <120 px delta for refresh (compare stored `innerHeight`) — prevents refresh storms during bar animation; orientationchange always refreshes. |
| Scroll restoration | Keep browser default (`history.scrollRestoration = "auto"`); hash sync via replaceState preserves restoration entries; after popstate restoration lands, `hashchange`/activation triggers reconcile activeIndex; final `refresh()` after restore. |
| LCP | Hero remains LCP element, untouched timeline; deck adds only fixed-position chrome + section wrappers (`<section>` wrappers add no paint cost). `min-h-dvh` on non-hero slides does not affect LCP (below fold). Budget guard: no images added; chrome bundle delta ≈ 0 (all gsap-local). |
| No layout shift | Wrapper sections are transparent pass-throughs (`relative w-full`); no margins introduced; `scroll-mt-*` classes dropped on deck slides (snap owns alignment) but kept on mobile path via `md:` removal — i.e., move `scroll-mt` behind `max-md:` prefix. |
| A11y | Sequential headings (§1); dots = real buttons in nav landmark; counter aria-hidden; keyboard §4; `aria-current` on active dot + Topbar link (existing); `prefers-reduced-motion` honored incl. runtime toggle; focus not trapped anywhere (deck is scroll-driven, no modal chrome). |
| Test checklist (manual QA script, ships in task 10) | 1) `npm run build` green (tsc -b). 2) Wheel: snaps every slide, no double-skip on fast flick. 3) Trackpad inertia settles on nearest slide. 4) ↑/↓/PgUp/PgDn/Home/End. 5) Dots click + focus-visible ring + hover transition. 6) Ctrl-K → "Architecture" jumps to slide 3, hash `#architecture`. 7) Topbar Security → slide 6; Demo → slide 10. 8) Load `/#demo` cold → opens on demo slide. 9) Back button leaves site (no hash pollution). 10) Resize desktop↔mobile width across 768px: clean mode swap, no orphaned transforms. 11) OS reduced-motion ON: plain scroll, no chrome. 12) `?motion=force`: deck forced on under RM. 13) iOS Safari real device: rotate + bar collapse, no misaligned snap. 14) ArchCanvas draw+pulse plays once on entering slide 3, replays only on remount. 15) Docs/wiki pages: palette + nav behave exactly as before. 16) oxlint clean. |

---

## 7. Entrance choreography — `buildEntrance(root, opts)`

Shared helper (single source of motion-spec compliance):

```ts
buildEntrance(root: HTMLElement, o?: { beatGap?: number }) : gsap.core.Timeline
// selects [data-enter] descendants IN DOM ORDER (kicker/head first by construction)
// children = targets.slice(0, ENTER.maxChildren)        // cap 8
// tl.paused(true)
//   .from(children, { autoAlpha: 0, y: 14, duration: rand(0.4..0.6), ease: "power2.out", stagger: 0.08 })
// team option: rowsOf=3 → beats [0-2][3-5][6-8], intra-beat stagger .08, inter-beat gap .16 (beatGap)
```

Usage rules:
- Sections mark choreography points with `data-enter` on **wrapper-level nodes only**: SectionHead block, main grid/list container, any secondary strip. Card-level internals stay untouched (minimal diff).
- Exit: none. No leave tweens — scrolling is the exit (spec: exit ≤250ms subtle-or-none; exit tweens fight snap). Re-entry does not replay (`playedRef`).
- Hero excluded (owns richer bespoke intro).
- Flip plugin: rejected for v1 (per approved decision) — nothing here imports it.

---

## 8. Ordered implementation tasks (AI-executable, each independently verifiable)

| # | Task | Files | Verify |
|---|---|---|---|
| 1 | Register `ScrollToPlugin` export in gsap lib | `src/lib/gsap.ts` | Import compiles; `tsc -b` green |
| 2 | Create `deck-config.ts` (SLIDES, SNAP/ENTER consts, DECK_PALETTE_ENTRIES, MOBILE_BP) + `deck-motion.ts` (buildEntrance incl. team beats + try/catch no-op) | 2 new files | Unit-instantiable; types compile; entrance helper returns paused timeline in isolation test |
| 3 | Create `DeckContext.tsx` (context, provider, `useDeck`) | 1 new file | Compiles; null-safe consumer hook |
| 4 | Implement `useDeckScroll(containerRef, slideIds)` — measure offsets, global snap trigger, directional snapTo, suppressSnap goTo tween, activation triggers emitting `deck:change`, keyboard, hash sync (layout-effect deep link + replaceState + hashchange), resize/fonts/RO refresh, iOS height-delta guard, `enabled` gating | 1 new file | Dev run: wheel snaps 12 slides; keyboard works; `/#demo` deep link lands correctly; StrictMode double-mount leaves no duplicate triggers (`ScrollTrigger.getAll()` counted) |
| 5 | Create `Slide.tsx` (`id,index,label,data-enter` props; min-h wrapper `md:min-h-dvh`; paused entrance via buildEntrance; plays on activate; revert cleanup) + `DeckChrome.tsx` (dots rail + counter per §4) | 2 new files | Visual: dots reflect active slide; counter "03 / 12"; focus ring on dots; hidden <768px |
| 6 | Rewire `Home.tsx`: wrap regions in `<Slide>`, split hardening (slice 5/4 + summary strip), remove batch-reveal effect, add Telemetry head + `<KpiBand variant="deck">`, extract footer → new `ClosingSlide.tsx` (3 link cards + wordmark + © row, `<footer>` preserved), mount provider + chrome, add `data-enter` markers on section heads/grids | `Home.tsx`, `ClosingSlide.tsx`, `KpiBand.tsx` | Page renders identically minus old batch reveals; 12 sections present; `dl` intact in telemetry; hardening 5+4; no `<footer>` regression in landmarks tree |
| 7 | Convert `ArchCanvas` scrub timelines → paused + play on `deck:change{id:"architecture"}` (once flag); leave draw-in as-is | `ArchCanvas.tsx` | Entering slide 3 plays draw+pulse once; scrubbing gone; inspector dialog unaffected |
| 8 | Integrate navigation: `deck:goto` emission + fallback in Topbar & palette `jump()`; App.tsx injects DECK_PALETTE_ENTRIES on `/`; Topbar active state listens `deck:change` in deck mode | `Topbar.tsx`, `command-palette.tsx`, `App.tsx` | Ctrl-K→slide jump; Topbar anchors snap; docs/wiki unchanged (palette there still scrolls) |
| 9 | Mobile/RM polish pass: verify gate flips cleanly, `max-md:` scroll-mt preservation, chrome visibility, fallback nav | touched files | Device-toolbar sweep at 767/768px + RM toggle: no stuck transforms, nav falls back |
| 10 | QA checklist execution (§6 table) + `npm run lint` + `npm run build` | — | All 16 checks pass; artifacts green |

Tasks 2–5 sequential; 6 depends on 2–5; 7–9 parallelizable after 6.

---

## 9. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Snap fights trackpad momentum → jitter/bounce | Med | High | `delay:0.12` debounce + directional nearest + `duration.max:0.4`; tune constants centralized in deck-config |
| Programmatic jump interrupted mid-flight strands user between slides | Med | Med | `autoKill:false` + suppressSnap until complete/interrupt; interrupt clears flag so snap re-engages |
| StrictMode double-init duplicates triggers/tweens | Med | High | Everything inside `gsap.context` + `ctx.revert()`; verification step counts `ScrollTrigger.getAll()` post-mount |
| Variable slide heights > viewport overflow content clipped | Med | Med | `min-h-dvh` (not fixed height); snap offsets measured from real layout; oversized slides simply occupy multiple screens and snap lands at measured tops |
| ArchCanvas conversion regresses inspector/dialog layering | Low | Med | Only the two scrubbed timelines change; dialog is portal-based; manual check in task 7 verify |
| iOS bar collapse triggers offset drift mid-scroll | High | Med | dvh sizing + 150ms debounce + <120px height-delta ignore + orientationchange refresh |
| Hash replaceState spam during fast scroll (history API thrash) | Low | Low | Only on activeIndex change (≤12 per page view), not per frame |
| Palette/docs regression on other routes | Low | High | Event is cancelable + fallback preserved; route-gated entries; explicit cross-route QA item #15 |
| Entrance hides content if GSAP throws late | Low | High | try/catch in buildEntrance leaves DOM untouched; from-states applied only by JS (never CSS) |
| KpiBand count-up vs entrance double-animation | Low | Low | Count-up is IntersectionObserver-driven internally and idempotent; entrance animates container, not the number node — no conflict by construction |

---

## 10. Explicitly out of scope (v1)

- Flip-plugin morph transitions (rejected per approved decision).
- Lenis smooth-scroll mounting (dep exists; deliberately unused — snap contract is native scroll).
- Touch swipe gesture handling (native touch scroll + snap covers it; custom gestures deferred).
- Any redesign of section internals, copy, or design tokens.
