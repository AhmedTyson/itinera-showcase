# Consolidation Review — Itinera Variant A: Vertical Snap Deck (Run 20260824)

Reviewer: Design Lab Tech Lead · Date: 2026-08-24 · Inputs: `plans/system-architect.md`, `plans/ux-engineer.md`, `plans/frontend-engineer.md`

Verdict: **All three plans are implementable; none ships as written.** Consensus core is strong (12 slides, one global snap trigger, activation triggers + React state, replaceState hash sync, mobile/RM plain-scroll fallback, no Lenis, no Flip). Conflicts concentrate in five areas: entrance replay policy, programmatic-jump guarding, event-vs-context integration, slide ids/numbering, and fallback parity. One plan-only discovery (`html { scroll-behavior: smooth }` at `index.css:90`) was **verified against source** and is a real snap-breaking bug the other two missed.

Legend: SA = system-architect · UX = ux-engineer · FE = frontend-engineer.

---

## 0. Ground-truth spot checks performed during this review

| Claim | Verified | Result |
|---|---|---|
| `index.css:90` has `html { scroll-behavior: smooth }` | ✅ | TRUE — confirms FE's conflict finding; SA/UX missed it |
| `lib/gsap.ts` registers only ScrollTrigger + MotionPathPlugin | ✅ | TRUE — ScrollToPlugin registration required (all 3 agree) |
| Sections live at `src/components/sections/*` | ✅ | TRUE — new Closing slide belongs there |
| Mem0 knowledge store | ✅ | Empty — no prior conventions constrain this design |

---

## 1. Decision matrix

### 1.1 Slide order & count
| Plan | Decision |
|---|---|
| SA | 12 slides: Hero → Telemetry → Architecture → Stack → Frontend → Security(H I) → Security-more(H II) → Ops → Deploy → Demo → Team → Closing |
| UX | Identical order |
| FE | Identical order |

**CONSENSUS → ADOPT.** 12 slides, exact same sequence. Hardening split 5/4 (`slice(0,5)` / `slice(5)`), KPI strip promoted to Telemetry slide, footer promoted to Closing slide — unanimous.

### 1.2 Slide ids (hashes)
| Plan | New ids beyond legacy anchors |
|---|---|
| SA | `telemetry`, `security-more`, `closing`; hero gets `#hero` |
| UX | `telemetry`, `frontend`(new anchor), `hardening-ii`, `end`; hero id-less |
| FE | `telemetry`, `hardening`, `closing`; hero gets `#hero` |

**CONFLICT.** Three different names for Hardening II and Closing.
**Winner:** hybrid — legacy anchors preserved verbatim (`#architecture #stack #frontend #security #ops #deploy #demo #team`), new ids: `#hero`, `#telemetry`, `#hardening-ii`, `#closing`. Justification: production deep links and Topbar targets already reference legacy ids; renaming them is gratuitous risk, and `#closing`/`#hardening-ii` are self-describing where SA's `#security-more` reads like an afterthought.

### 1.3 Slide head & numbering system
| Plan | Decision |
|---|---|
| SA | Keep authored section kickers (`01…08`) as-is; counter chrome shows real slide numbers — two numbering systems coexist |
| UX | New `SlideHead` component replaces SectionHead everywhere: gold slide index left, tag chip, `NN / 12` marker right; titles scaled up to `clamp(1.75rem,3.4vw,2.75rem)` |
| FE | Renumber SectionHead `num` props to original section numbers (ops→06 … team→09) |

**CONFLICT.**
**Winner:** UX's SlideHead with real slide indices. Justification: a deck where slide 03 carries kicker "01" looks broken in a presentation context, and dual numbering (kicker says X, counter says Y) is worse than a mechanical one-component swap; the title scale-up is part of the deck's purpose (presentation-grade type).

### 1.4 Snap engine topology
| Plan | Decision |
|---|---|
| SA | ONE global snap trigger on document, plus N cheap non-snapping activation triggers (`top 55%` / `bottom 45%`, `onToggle`) |
| UX | Global trigger over sections container, snap points mapped to section offsets |
| FE | ONE global snap trigger on deck container + per-slide non-snapping activation triggers, identical windows |

**CONSENSUS → ADOPT.** Single global snap trigger owning measured normalized offsets; separate activation triggers feeding `activeIndex`. All three independently rejected per-slide snapping and uniform-fraction math (`1/(N-1)`) in favor of real measured `offsetTop`s — correct for variable-height slides.

### 1.5 Snap config values
| Plan | Config |
|---|---|
| SA | `duration {min:0.15, max:0.4}`, `delay:0.12`, `power2.inOut`; directional nearest with direction tie-break (<20%-into-slide) |
| UX | `duration 0.4`, `delay:0.1`; velocity-check threshold; keyboard debounce 120ms |
| FE | `duration {min:0.2, max:0.4}`, `delay:0.05`, `inertia:false`; plain nearest |

**CONFLICT** (delay 0.12 vs 0.1 vs 0.05; min duration; inertia flag; directional logic).
**Winner:** SA's timing envelope (`delay: 0.12`, `duration {min:0.15, max:0.4}`, `ease:"power2.inOut"`) + FE's explicit `inertia:false` + SA's direction tie-break simplified to global-nearest-over-all-points (drop the ±1-viewport candidate windowing — 12 points need no windowing). Justification: largest anti-jitter margin wins for production trackpad variance; velocity thresholds (UX) duplicate what delay+inertia:false already do — cut.

### 1.6 Programmatic-jump guard (the sharpest engineering conflict)
| Plan | Mechanism |
|---|---|
| SA | Module `suppressSnap` flag read inside `snapTo`; jump tween uses `autoKill:false` (user cannot interrupt; flight always completes) |
| UX | All navigation through `deck.goto`; native smooth-scroll disabled in deck mode |
| FE | `snapST.disable()` around jump tween, `autoKill:true` + re-enable on `onComplete`/`onInterrupt`; `gsap.killTweensOf(window)` before each jump |

**CONFLICT** — SA forces jumps to complete (`autoKill:false`); FE lets the user interrupt (`autoKill:true`). Opposite philosophies.
**Winner:** FE. Justification: interruptible jumps feel correct (a user grabbing the wheel mid-flight must win), and re-enabling snap on interrupt means any stranded mid-slide position self-corrects on next scroll settle; `disable()/enable()` also keeps hot-path `snapTo` free of module-flag checks. SA's "stranded without snap cleanup" fear doesn't survive its own `onInterrupt` clearing — FE's pair (kill-before + autoKill) is strictly safer.

### 1.7 CSS smooth-scroll neutralization
| Plan | Decision |
|---|---|
| SA | Not mentioned |
| UX | `scroll-behavior:auto` scoped to `html.deck-on` |
| FE | Discovered `index.css:90` smooth-scroll; mandates `html[data-deck]{scroll-behavior:auto}` + `dataset.deck="on"` lifecycle |

**VERIFIED FACT:** `index.css:90` contains `html { scroll-behavior: smooth }`. Without neutralization, every snap tween double-animates against CSS smooth scrolling.
**Winner:** FE's implementation (data-attribute + scoped CSS rule). This was a genuine miss by SA and UX — logged as evidence both plans were not fully grounded.

### 1.8 Activation distribution model (events vs context)
| Plan | Outbound (deck → components) | Inbound (Topbar/palette → deck) |
|---|---|---|
| SA | Window CustomEvents: `deck:change {index,id}`; consumers listen on window | Cancelable window CustomEvent `deck:goto`, preventDefault-based fallback |
| UX | `CustomEvent("deck:active")` + React context | Shared dispatch helper |
| FE | Per-slide `SlideActiveContext` (`useSlideActive(): boolean \| null`, null = fallback mode → legacy IO paths preserved) | Typed module emitter `deckBus`: `requestJump(id): boolean`, `isDeckMounted()`, `emit/on`, registry |

**CONFLICT.**
**Winner:** FE both directions. Justification: `useSlideActive()`'s null sentinel gives ArchCanvas/OpsConsole/StackGrid a single seam where fallback behavior is *implicit* (null → today's code path runs unchanged) instead of requiring every consumer to branch on a mode flag; typed `requestJump(): boolean` makes the fallback decision synchronous and compile-checked versus stringly-typed cancelable events. Zero-regression risk on `/docs` and `/wiki` is structurally guaranteed, not tested-in.

### 1.9 Hash sync
| Plan | Decision |
|---|---|
| SA | `replaceState` on activation change (never `location.hash=` assignment); layout-effect instant deep-link jump pre-paint; `hashchange` listener → goTo; unknown hash ignored; scrollRestoration left `auto` |
| UX | Same: replaceState on activation, mount-time hash read → jump |
| FE | Same + rAF-throttle writes; initial-hash `goTo(i, immediate)` instant; back/forward animated |

**CONSENSUS → ADOPT** (with FE's rAF throttle). All three independently chose replaceState-over-pushState and instant pre-paint deep links. No conflict worth ruling.

### 1.10 Palette / Topbar integration
| Plan | Decision |
|---|---|
| SA | Topbar links + palette `jump()` emit cancelable `deck:goto` w/ legacy fallback; App.tsx injects `DECK_PALETTE_ENTRIES` (type `"heading"`, sub `"Slide"`, hero excluded) on `/` route; Topbar active-link subscribes `deck:change` in deck mode |
| UX | T10: dispatch deck goto instead of scrollIntoView; palette anchors share helper |
| FE | `jumpOrScroll(id)` helper; palette `jump()` tries `requestJump` then falls back to `scrollIntoView`; Topbar `handleNavClick` + `scrollToTop` same pattern; Topbar IO active-link tracking kept as-is (ids unchanged), drift fix deferred |

**PARTIAL CONFLICT** (transport resolved in §1.8 → deckBus wins). Remaining sub-conflicts:
- **Palette entries**: SA injects slide entries; FE forgot this entirely; UX vague. **Adopt SA's** `DECK_PALETTE_ENTRIES` route-gated injection in `App.tsx` (2-of-3 explicit, and Ctrl-K slide navigation is a stated feature).
- **Topbar active-link sync**: SA rewires to deck events; FE keeps IO. **Adopt FE** — ids are identical so IO still tracks correctly within tolerance; zero-diff now, revisit only if QA shows drift. Add explicit QA item.

### 1.11 Entrance replay policy
| Plan | Policy |
|---|---|
| SA | Play ONCE per mount (`playedRef`), never replay on re-entry |
| UX | Replay on EVERY activation; instant reset on leave; count-up restarts too |
| FE | Hybrid: entrances once; ArchCanvas draw-in once; ArchCanvas pulse restarts every activation; OpsConsole types once + manual replay button stays |

**CONFLICT — the biggest product-behavior disagreement.**
**Winner:** FE's hybrid. Justification: dot-clicks and palette jumps constantly recross intermediate slides — UX's blanket replay turns traversal into strobing and resets count-ups users already read; SA's everything-once throws away the one moment that deserves replay (lifecycle pulse is the architecture slide's payoff and is cheap/self-clearing). Hybrid preserves showcase payoff without fatigue.

### 1.12 Entrance timeline construction
| Plan | System |
|---|---|
| SA | `data-enter` wrapper markers + shared `buildEntrance()` helper in `deck-motion.ts`; DOM-order selection; cap 8; team beat rows |
| UX | Fixed grammar beats (0/60/120/180ms) documented per slide; GSAP `stagger:{grid:[3,3]}` for team (no DOM wrappers) |
| FE | Semantic role markers `data-reveal="kicker|title|content"`; fixed overlap timeline (`-=0.30/-=0.35`) inside `Slide.tsx`; cap 8; team = animate 3 row wrappers only |

**CONFLICT.**
**Winner:** FE's `data-reveal` roles + in-Slide timeline, with SA's cap of 8 and FE's row-wrapper approach for Team. Justification: semantic roles encode the choreography grammar in markup (self-documenting, greppable), avoid a second motion-abstraction file, and chunking `TEAM_MEMBERS` into 3 row wrappers is trivially verifiable versus grid-stagger math. From-states applied at runtime inside `gsap.context()` only (all three unanimous — nothing hidden in CSS/JSX).

### 1.13 Chrome a11y
| Topic | SA | UX | FE | Ruling |
|---|---|---|---|---|
| Dots semantics | `<nav>`+buttons | `<nav>`+buttons, explicit NOT-tablist rationale | `<nav>`+buttons | **CONSENSUS**: nav+buttons, `aria-current`, no tablist |
| Dot hit area | bare `h-2 w-2` buttons | 44×44 hit target wrapping visible dot | unspecified | **UX wins** — WCAG target size; bare 8px buttons are unusable |
| Counter a11y | visible counter `aria-hidden`, dots carry semantics | visible counter `aria-hidden` + separate visually-hidden `aria-live="polite"` announcing "Slide 3 of 12 — Architecture", debounced 250ms | counter itself `aria-live` | **UX wins** — SR users get meaningful announcements since focus never moves during wheel scroll; raw "03 / 12" announces nothing |
| Keyboard: Space | not bound | not bound | **bound → next** | **SA/UX win (2-of-3)** — Space must stay native: it activates focused buttons and feeds snap naturally; hijacking breaks both |
| Keyboard guards | skip when `[role="dialog"]` present | skip when palette/dialog/sheet open or editable target | skip input/textarea/contenteditable/dialog | **Merge**: dialog-open check + editable-target check |
| Focus movement | none specified ("no focus trap") | keyboard-initiated nav moves focus to slide heading (`tabIndex={-1}`, `preventScroll:true`); wheel/touch never moves focus | none specified | **Adopt UX's rule** — gives keyboard/SR users a real reading position; cost is trivial |
| Edge keys | Home→0, End→last, preventDefault on handled | same | same | **CONSENSUS** |

### 1.14 Fallback gating (mobile + reduced motion)
| Plan | Gate | Fallback behavior |
|---|---|---|
| SA | `!useIsReducedMotion() && matchMedia("(min-width:768px)")`, live listeners, honors `?motion=force` | Plain scroll, no chrome/triggers/keyboard/hash-writes; `md:min-h-dvh` responsive sizing; **batch-reveal effect deleted outright** (mobile = static content) |
| UX | `innerWidth ≥768 && !prefers-reduced-motion` | Existing IO reveals remain in plain-scroll mode |
| FE | `useDeckCapabilities()` hook (`isMobile` + `reducedMotion` + derived `deckEnabled`), honors `?motion=force` | Batch-reveal effect **moved verbatim into Deck's fallback branch** — byte-identical mobile behavior; components fall back internally via `useSlideActive()===null` |

Gate: **CONSENSUS** (<768 || RM ⇒ plain scroll, runtime flip supported). Fallback internals: **CONFLICT**.
**Winner:** FE. Justification: production-deploy bias means the mobile experience must be a regression-free status quo, not a silent downgrade — deleting the batch reveal (SA) changes today's shipping mobile animations for no reason. Adopt FE's `useDeckCapabilities` hook as the single gate source.

### 1.15 Refresh strategy
| Trigger | SA | UX | FE | Ruling |
|---|---|---|---|---|
| Fonts | `document.fonts.ready` refresh + safety setTimeout(400) | fonts.ready before refresh | fonts.ready | Adopt fonts.ready; **cut SA's duplicate setTimeout** |
| Window load | — | window load | `{once:true}` load listener | Adopt FE's |
| Content height drift | RO on deck container | — | RO on every slide ref + <2px delta guard + 120ms debounce | **One RO on container** (SA placement) with FE's delta guard — observing 12 elements for what container-level measurement captures is waste |
| Resize/orientation | debounced 150ms; orientationchange always; **<120px height-delta ignore heuristic** | visualViewport debounced; Lighthouse CLS gate | resize 150ms debounce; orientation 200ms | Adopt 150ms debounce + orientationchange; **cut SA's 120px heuristic** (debounce coalesces URL-bar animation ticks; heuristic risks swallowing legit small shifts) |
| Images | n/a | n/a | Explicitly analyzed: devicons/logo/barcode fixed-box → zero image-driven shift, no hooks needed | Adopt FE's recorded decision |
| Theme switch | n/a | n/a | Explicitly excluded (colors ≠ geometry) | Adopt |

### 1.16 Showpiece conversions (ArchCanvas / OpsConsole / StackGrid)
| Topic | Ruling |
|---|---|
| Scrub removal | **CONSENSUS**: both scrubbed timelines die (motion spec bans scrub); converted to paused timelines played on activation. SA/UX/FE agree on diagnosis; SA missed there are boxShadow per-stop scrub triggers too (FE counted them) |
| Draw-in | Plays once per mount, stays drawn — **CONSENSUS** |
| Pulse | Restarts every activation (FE hybrid policy, §1.11); rebuilt as sequential `.to()` chain along `#lcPath`, ~3s `ease:none` |
| Canvas height | Adopt UX's wrapper cap `h-[62vh] min-h-[420px]` — guarantees slide 3 fits viewport budget |
| Typewriter | Starts on activation (replaces IO threshold 0.3 in deck mode; IO kept for fallback); fires ONCE + manual replay button (FE over UX's pause/restart-line churn) |
| StackGrid | Internal `once:true` reveal gated through `useSlideActive()` seam; internal markup untouched — **CONSENSUS** |
| Hero | Untouched; owns its bespoke mount intro = de facto slide-1 entrance — **CONSENSUS** (all three refuse to touch it) |

### 1.17 KpiBand variant API
| Plan | Naming |
|---|---|
| SA | `variant?: "strip" \| "deck"`; value `text-4xl` |
| UX | `variant?: "band" \| "slide"`; value `text-4xl xl:text-5xl`; optional `active` prop to restart count-up |
| FE | `variant?: "band" \| "slide"`; value `text-4xl md:text-5xl`; count-up untouched |

**CONFLICT (naming) / partial (count-up).** **Winner:** `"band" | "slide"` (2-of-3, clearer semantics), grid `grid-cols-2 lg:grid-cols-4` (unanimous), value `text-4xl xl:text-5xl`, tiles `py-6`-ish padding, `dl`/count-up/perforation motif untouched. Count-up: **status quo** (IO-driven, fires once) — rejecting UX's per-activation restart per §1.11; SA's analysis (entrance animates container, not number node — no conflict by construction) accepted.

### 1.18 File layout
| Plan | Files |
|---|---|
| SA | `lib/deck-config.ts`, `lib/deck-motion.ts`, `components/deck/{DeckContext,Slide,DeckChrome}.tsx`, `hooks/useDeckScroll.ts`, `components/sections/ClosingSlide.tsx` (7) |
| UX | `lib/deck-config.ts`, `hooks/useDeck.ts`, `components/deck/{Deck,DotsRail,SlideCounter,ScrollHint,SlideHead}.tsx` (7) |
| FE | `lib/deckBus.ts`, `hooks/useDeckCapabilities.ts`, `components/deck/{Deck,Slide,DeckChrome,slide-context,useDeckSnap,useDeckNav}`, `components/sections/Closing.tsx` (9) |

**CONFLICT.** **Winner:** FE's decomposition as the base (concern-per-file maps to the ruled integration model), minus one file: SA/UX's standalone `DotsRail`+`SlideCounter` split collapses into FE's single `DeckChrome.tsx` (they share one gating condition and one prop feed). Drop SA's `DeckContext.tsx` (superseded by `slide-context.ts` + direct props) and SA's `deck-motion.ts` (superseded by in-Slide timelines). Final manifest in §4, D1.

### 1.19 Ecosystem exclusions
**UNANIMOUS CONSENSUS → ADOPT:** do not mount Lenis (dependency exists, never instantiated; snap contract is native scroll); Flip plugin not used/registered; no section-internal redesign beyond specified diffs; no new npm dependencies (ScrollToPlugin ships inside existing `gsap` package).

---

## 2. Gaps — missed by ALL THREE plans

**G1. No rollback/kill-switch for production.** All three ship a site-wide interaction overhaul with no escape hatch. The repo already has the precedent (`?motion=force`). Required: `useDeckCapabilities` additionally returns `deckEnabled=false` when `location.search` contains `deck=off`. One line of gate logic, restores the pre-deck site instantly if field reports arrive.

**G2. Chrome-vs-overlay z-index contract is unstated.** Dots rail (z-30/z-40 depending on plan) will float over/near Radix overlay layers (InspectorDialog, command palette). Contract needed: all deck chrome ≤ `z-30`; verify dialog overlay/backdrop sits above (`z-50` per Radix defaults) so the rail never bleeds through a modal. Nobody wrote this down; it's the kind of thing found in production screenshots.

**G3. Zero automated tests in all three task lists.** Every plan ends in manual QA only. Production demands a minimal regression floor around the two pieces of actual logic: extract pure functions and vitest them — `snapPointFor(value, offsets, direction)` (nearest-point + tie-break math, from `useDeckSnap`) and `deckBus` registry/requestJump semantics. Two small spec files, no e2e infra required. Manual QA stays for feel; math gets tests.

**G4. Mode-flip teardown ordering.** All three describe clean enable/disable flipping across the 768px breakpoint / RM toggle, but none specifies killing an **in-flight jump tween** before reverting GSAP contexts. Orphaned `gsap.to(window, scrollTo)` tweens surviving `ctx.revert()` will fight the freshly-mounted fallback mode. Required: `gsap.killTweensOf(window)` first in the deck teardown effect, then context revert, then attribute clear.

---

## 3. Over-engineering flags — CUT for v1

| # | Item | Source | Why cut |
|---|---|---|---|
| C1 | Per-slide background treatments (12-entry `[data-bg]` map + light-mode gradient overrides + themed QA pass) | UX | Pure polish orthogonal to deck mechanics; adds a themed visual-QA surface to every future slide edit. Defer to a follow-up pass |
| C2 | `ScrollHint` component (bob chevron, dismiss-once state machine) | UX | Nice affordance, but a stateful component + keyframes for a discoverability problem the dots rail already solves. Revisit post-launch analytics |
| C3 | `?normalizeScroll` diagnostic flag | FE | Right call to exclude from default; even the diagnostic is scope — `normalizeScroll` interacts with Radix locking in ways that need their own investigation. Document as known option, don't ship |
| C4 | iOS `<120px` height-delta refresh-ignore heuristic | SA | Debounced resize already coalesces URL-bar animation; heuristics that swallow resizes can mask real ones |
| C5 | `setTimeout(refresh, 400)` duplicate after `fonts.ready` | SA | Belt-and-braces timer; `load` listener already covers late stragglers |
| C6 | Trackpad velocity-threshold check | UX | Redundant with `delay:0.12` + `inertia:false` + directional tie-break |
| C7 | Per-slide ResizeObserver array (observe all 12 refs) | FE | One container-level RO with FE's own delta guard measures the same thing |
| C8 | Directional candidate-windowing (±1 viewport filter) in `snapTo` | SA | Micro-optimization over a 12-element array |
| C9 | Standalone `DotsRail`/`SlideCounter` files | UX | One `DeckChrome.tsx`; they gate and render together |
| C10 | SA's `suppressSnap` module flag | SA | Superseded by ruled FE mechanism (§1.6) |

KEPT despite being polish (cheap, high-value): dot hover tooltips (pure Tailwind group-hover), UX's counter visibility tiering (dots ≥768px, counter ≥1024px), ArchCanvas 62vh cap.

---

## 4. Final decision list — THE SPEC

### Files

**D1. New files (exact paths/names):**
```
src/lib/deck-config.ts               SLIDES, SNAP, ENTER consts, DECK_PALETTE_ENTRIES
src/lib/deck-snap-math.ts            pure fn snapPointFor(value, offsetsPx, maxScroll, direction)
src/lib/deckBus.ts                   typed emitter: on/emit/requestJump(id):boolean/isDeckMounted/jumpOrScroll
src/hooks/useDeckCapabilities.ts     { isMobile, reducedMotion, deckEnabled }; honors ?motion=force AND ?deck=off
src/components/deck/Deck.tsx         activeIndex owner, triggers, jump tween, refresh loop, dataset.deck
src/components/deck/Slide.tsx        section wrapper, data-reveal entrance, SlideActiveContext.Provider
src/components/deck/slide-context.ts SlideActiveContext + useSlideActive(): boolean | null
src/components/deck/useDeckSnap.ts   offset measure, global snap trigger, remeasure()
src/components/deck/useDeckNav.ts    keyboard, hash lifecycle, editable/dialog guards
src/components/deck/DeckChrome.tsx   dots rail + counter + visually-hidden aria-live region
src/components/deck/SlideHead.tsx    num/tag/marker head replacing SectionHead on slides 02–12
src/components/sections/Closing.tsx  extracted footer content, keeps <footer> landmark
```
Tests: `src/lib/__tests__/deck-snap-math.test.ts`, `src/lib/__tests__/deckBus.test.ts` (vitest).

**D2. Modified files:** `src/lib/gsap.ts` (+ScrollToPlugin import/register/export), `src/index.css` (+`html[data-deck]{scroll-behavior:auto}` only), `src/pages/Home.tsx`, `src/App.tsx`, `src/components/layout/Topbar.tsx`, `src/components/palette/command-palette.tsx`, `src/components/canvas/ArchCanvas.tsx`, `src/components/sections/KpiBand.tsx`, `src/components/sections/OpsConsole.tsx`, `src/components/sections/StackGrid.tsx`. Nothing else.

### Slides

**D3.** 12 slides, order: hero → telemetry → architecture → stack → frontend → security → hardening-ii → ops → deploy → demo → team → closing. Ids: legacy `#architecture #stack #frontend #security #ops #deploy #demo #team` preserved byte-for-byte; new `#hero #telemetry #hardening-ii #closing`.

**D4.** Hardening split: `HARDENING.slice(0,5)` → `#security`, `HARDENING.slice(5)` → `#hardening-ii` + emerald proof strip (`55 suites · 106 ops · 0 wildcards`, `aria-label="Verification summary"`).

**D5.** `SlideHead` on slides 02–12: mono gold index, hairline, tag chip, right-aligned `NN / 12` marker; title `text-[clamp(1.75rem,3.4vw,2.75rem)] font-bold leading-[1.1]`; authored tags retained, hardening tagged `· 1 of 2` / `· 2 of 2`. Exactly one `h2` per slide 02–12 (Telemetry gains h2 "Numbers that reconcile"); Hero keeps sole `h1`; card titles stay `h3`. Each `<section aria-labelledby>` its heading.

**D6.** Closing slide: centered `max-w-4xl` wordmark + tagline + 3 link cards (apidog / GitHub repo / wiki `Link`) + compact © row; `<footer>` landmark moves inside the slide; old inline footer deleted from `Home.tsx`; old footer `#architecture` link routes through `jumpOrScroll("architecture")`.

### Engine

**D7.** Snap: one global `ScrollTrigger.create` (trigger = deck container, `start:"top top"`, `end:"bottom bottom"`), `snap.snapTo = (value)=>snapPointFor(...)`, `duration:{min:0.15,max:0.4}`, `delay:0.12`, `ease:"power2.inOut"`, `inertia:false`. Offsets = real `offsetTop` per slide, last clamped to `maxScroll`; recomputed on every `refresh` event.

**D8.** `snapPointFor`: nearest point over ALL offsets; ties broken toward travel direction (`self.direction` from trigger `onUpdate`).

**D9.** Programmatic jumps: `gsap.killTweensOf(window)` → `snapST.disable()` → `gsap.to(window,{scrollTo:{y:offsets[i],autoKill:true}, duration:clamp(dist/3000,0.4,0.9), ease:"power2.inOut"})` → re-enable on `onComplete` AND `onInterrupt`. Deep-link initial load uses `window.scrollTo({top,behavior:"instant"})` in `useLayoutEffect`, snap enabled immediately.

**D10.** Activation: per-slide non-snapping triggers `start:"top 55%", end:"bottom 45%"`, `onToggle(self){ if(self.isActive) setActiveIndex(i) }`, created inside one `gsap.context` in `Deck`. Consumers read `useSlideActive()`; `null` ⇒ legacy IO/once paths run unchanged (fallback mode).

**D11.** `html[data-deck="on"]` set on deck mount, removed on unmount/fallback; pairs with the `index.css` rule neutralizing `scroll-behavior:smooth` (`index.css:90`) in deck mode only.

**D12.** Hash: `history.replaceState(null,"","#" + SLIDES[activeIndex].id)` on activation change, rAF-coalesced; `hashchange` listener → animated jump; unknown hashes ignored; `scrollRestoration` untouched.

### Entrances & showpieces

**D13.** Replay policy: entrances play ONCE (`playedRef`); ArchCanvas draw-in once; **ArchCanvas pulse restarts on every activation** (rebuilt paused timeline, sequential `.to()` glows along `#lcPath`, `tl.restart()` on rising edge); OpsConsole types once + existing replay button; KPI count-up unchanged (IO, once).

**D14.** Entrance system: `data-reveal="kicker|title|content"` attributes; timeline in `Slide.tsx` — kicker 0.45s → title 0.55s @`-=0.30` → content stagger `each:0.08`, 0.55s @`-=0.35`, `power2.out`; cap 8 content targets; Team = 3 row wrappers (rows of 3) animated as units; creation wrapped in try/catch (failure leaves DOM untouched); from-states applied only inside `gsap.context()` — never CSS/JSX.

**D15.** Component seams: ArchCanvas — delete scrubbed pulse + per-stop boxShadow scrub triggers; draw-in gated on `useSlideActive()` (null → existing `top 75%, once` path); wrapper capped `h-[62vh] min-h-[420px]`. OpsConsole — start condition `(sa === true || ioFired)`, IO branch only when `sa === null`, once-guard, replay button intact. StackGrid — internal tl plays on first activation when `sa !== null`, else existing ScrollTrigger. KpiBand — `variant?: "band" | "slide"`; slide variant `grid-cols-2 lg:grid-cols-4 gap-6`, numeral `text-4xl xl:text-5xl tabular-nums`, header strip becomes kicker row; `dl`/count-up/notch motif untouched. Hero — zero changes.

### Navigation integration

**D16.** `deckBus` API: `requestJump(id): boolean` (false ⇒ no deck mounted or unknown id ⇒ caller falls back to `scrollIntoView`); `jumpOrScroll(id)` exported convenience. Used by Topbar `handleNavClick` + `scrollToTop`, palette `jump()`, Closing link.

**D17.** Palette: `App.tsx` GlobalPalette memo prepends `DECK_PALETTE_ENTRIES` when `pathname === "/"` — entries `type:"heading"`, `sub:"Slide"`, all slides except hero. Docs/wiki routes untouched.

**D18.** Topbar active-link highlighting: keep existing IntersectionObserver (ids unchanged); add QA item to compare against `activeIndex`; rewire only on observed drift.

### Chrome & a11y

**D19.** Dots: `<nav aria-label="Slides">` + `<ul>`, 44×44 button hit areas wrapping visible dots; idle `h-2 w-2 bg-border-strong`; hover scale-125 (+150ms); active vertical pill `h-6 w-2 bg-primary` + glow; hover tooltip chip (label, `@media(hover:hover)` guarded); `aria-label={"Go to slide N: label"}`, `aria-current="true"` on active. Rail `fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex`.

**D20.** Counter: `fixed bottom-4 left-5 z-30 hidden lg:block`, mono `NN / 12` `tabular-nums`; visible element `aria-hidden`; separate visually-hidden `aria-live="polite"` region announces `"Slide N of 12 — Label"`, debounced 250ms.

**D21.** Z-index contract: ALL deck chrome ≤ `z-30`; Radix overlays (InspectorDialog, palette) must sit above — verify during QA.

**D22.** Keyboard (deck mode only; skipped when dialog open OR target matches `input, textarea, select, [contenteditable]`): ArrowDown/PageDown→next, ArrowUp/PageUp→prev, Home→0, End→count−1, `preventDefault()` on handled keys. **Space NOT bound.** Tab never intercepted. Keyboard-initiated nav focuses slide heading after settle (`querySelector("h1,h2").focus({preventScroll:true})`, headings `tabIndex={-1}`); wheel/touch/dot-click never move focus.

### Fallback & resilience

**D23.** Gate: `deckEnabled = !isMobile(<768) && !reducedMotion && !searchParams.has("deck=off")` via `useDeckCapabilities` (live media listeners; `?motion=force` honored through existing RM hook). Fallback renders normal-flow sections (no `min-h-dvh` lock), NO chrome/triggers/keyboard/hash-writes/data-deck attribute, and mounts the current batch-reveal effect verbatim (moved from `Home.tsx` into Deck's fallback branch). `scroll-mt` classes: move behind `max-md:` prefix.

**D24.** Teardown ordering on mode flip/unmount: (1) `gsap.killTweensOf(window)`, (2) `gsap.context` revert, (3) remove `data-deck`, (4) disconnect RO/listeners.

**D25.** Refresh loop (deck mode): `document.fonts.ready.then(refresh)`; `window.load` once listener; single container `ResizeObserver` (aggregate delta <2px ignored, 120ms debounce); resize debounced 150ms; orientationchange delayed 200ms. Theme switches excluded. Image-driven shift explicitly nil (fixed-box SVGs).

### Quality gates

**D26.** Tests: `deck-snap-math.test.ts` (nearest selection, tie-break direction, clamped last offset, single-offset edge) and `deckBus.test.ts` (registry roundtrip, requestJump false-when-unmounted, unsubscribe). Must pass alongside build/lint.

**D27.** QA checklist = union of the three plans' lists, executed on `npm run build && npm run preview` (prod bundle, not dev server): 16 SA checks + FE acceptance items + UX Lighthouse (LCP=hero h1, CLS 0) + keyboard-only walkthrough + VoiceOver/NVDA smoke + RM emulation + 767/768 boundary sweep + docs/wiki regression pass + G1 kill-switch (`?deck=off`) + G2 z-index check.

**D28.** Out of scope v1 (binding): Lenis mounting, Flip plugin, per-slide background treatments, ScrollHint, normalizeScroll (any mode), custom touch gestures, section copy/token redesign, automated e2e suite.

---

## 5. Scorecard

| Plan | Strengths | Fatal-ish flaws corrected here |
|---|---|---|
| system-architect | Deepest ground-truth audit; best snap timing analysis; only plan with StrictMode trigger-count verification step | Missed `scroll-behavior:smooth`; autoKill:false locks users out mid-flight; deletes mobile batch reveals (regression); CustomEvent transport stringly-typed |
| ux-engineer | Only plan with coherent a11y story (live region, focus rules, 44px targets, contrast table); best responsive matrix | Blanket entrance replay would strobe on traversal; count-up resets lose read values; background-treatment scope creep |
| frontend-engineer | Only plan that caught the real CSS bug; cleanest integration seams (null-sentinel context + boolean bus); correct hybrid replay; safest fallback parity | Forgot palette entries entirely; binds Space (breaks button activation); per-slide RO waste |

Consolidated spec above supersedes all three. Implementation may begin from D1–D28 without further planning rounds.
