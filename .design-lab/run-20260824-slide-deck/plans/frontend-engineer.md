# Frontend Implementation Plan — Itinera Variant A: Vertical Snap Deck

**Scope:** convert `itinera-showcase-react` Home route into a 12-slide full-screen scroll-snapped deck (Canva-style). Production deploy. No new deps. TypeScript strict. Minimal diff to section internals.

**Ground truth read:** `Home.tsx`, `lib/gsap.ts`, `sections/{Hero,KpiBand,StackGrid,OpsConsole}.tsx`, `canvas/ArchCanvas.tsx`, `layout/Topbar.tsx`, `palette/command-palette.tsx`, `App.tsx`, `package.json`, `hooks/*`, `main.tsx` (StrictMode ON), `index.css`.

**Environment facts discovered (drive decisions below):**
- `main.tsx` wraps app in `<StrictMode>` → all GSAP work must live in `gsap.context()` + `revert()`.
- `index.css:90` — `html { scroll-behavior: smooth }`. **This fights ScrollTrigger snap and programmatic jumps (double-animation). Must be neutralized in deck mode.**
- `lenis` is in deps but **never instantiated** (only a duck-typed `window.__lenis?` read in `hooks/useScrollTo.ts`). No Lenis runtime on Home → no scrollerProxy needed, no Lenis snap to reconcile.
- Existing scroll helpers: Topbar `handleNavClick` (`scrollIntoView({behavior:smooth})` + `replaceState`), palette `jump()` (`getElementById().scrollIntoView smooth`), `useScrollTo` hook (unused by Home).
- ArchCanvas has **two** scroll-driven effects: once-draw-in (`top 75%`) + **scrubbed** lifecycle pulse (`scrub:0.5`) with per-stop boxShadow scrub triggers. Scrub must die per motion spec.
- OpsConsole starts typing via IntersectionObserver `threshold:0.3`.
- KpiBand renders 8 tiles at `grid-cols-2 sm:4 lg:8`, tiny tiles (`text-2xl` numerals).
- `HARDENING` = 9 items → split 5/4 across two slides.
- `TEAM_MEMBERS` = 9 cards → exceeds stagger cap ~8 → row-stagger required.
- Footer is inline JSX at bottom of `Home.tsx` (lines 391–418).
- Topbar is `sticky top-0 h-16 z-40` — overlays slide tops; deck slides need internal top padding, not `scroll-mt`.
- Devicon images are fixed-size (`h-4 w-4`) lazy SVGs; logo fixed `h-9` → **no image-driven layout shift**, no refresh hooks needed for images.

---

## 0. Slide manifest (fixed)

| # | id | content source | notes |
|---|----|----------------|-------|
| 01 | `hero` | `<Hero>` existing | keep id-less section inside Slide wrapper `id="hero"` |
| 02 | `telemetry` | `<KpiBand variant="slide">` | promoted 2×4, text-4xl/5xl numerals |
| 03 | `architecture` | SectionHead 01 + `<ArchCanvas>` | activation-driven draw-in + pulse |
| 04 | `stack` | SectionHead 02 + `<StackGrid>` | entrance via Slide reveal |
| 05 | `frontend` | SectionHead 03 + FE cards | remove `.fe-card` from batch reveal; add `data-slide-reveal` |
| 06 | `security` | Hardening I (items 0–4) | num "04", tag "hardening · part 1 of 2" |
| 07 | `hardening` | Hardening II (items 5–8) | num "05", tag "hardening · part 2 of 2" |
| 08 | `ops` | SectionHead 06 + `<OpsConsole>` | typing starts on activate |
| 09 | `deploy` | SectionHead 07 + steps/tests | unchanged internals + reveal attrs |
| 10 | `demo` | SectionHead 08 + DEMO_STEPS | unchanged internals + reveal attrs |
| 11 | `team` | SectionHead 09 + TEAM_MEMBERS | row-stagger (9 > cap 8) |
| 12 | `closing` | extracted `<Closing>` (footer) | footer semantics kept, centered slide layout |

Existing ids `security`, `ops`, `deploy`, `demo`, `team` are preserved so Topbar `NAV_DEFAULTS.home` and footer links stay untouched except where noted. New ids: `telemetry`, `hardening`, `closing`.

---

## 1. Snap implementation — decision + exact config

**Decision: ONE global ScrollTrigger carrying the `snap` config, created on the deck container. Not one trigger per section.**

Reasons:
- Snap points must be computed from real section offsets (slides can exceed viewport height on short viewports → offsets are NOT uniform). A single trigger owns the normalized offset array; per-section triggers would each need their own snap fragment and they fight each other.
- One trigger = one place to disable during programmatic jumps (palette/Topbar/dots) — the main snap-fight risk.
- Per-section triggers remain (separate, non-snapping) purely for **activation** detection.

### Config

```ts
// src/components/deck/useDeckSnap.ts
const offsetsRef = useRef<number[]>([0])        // px offsets, index-aligned with slides
const normRef = useRef<number[]>([0])           // offsets / maxScroll

function measure(deckEl: HTMLElement) {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  offsetsRef.current = SLIDE_IDS.map(id => document.getElementById(id)!.offsetTop)
    // clamp last point to maxScroll if closing slide shorter than viewport
  normRef.current = offsetsRef.current.map(o => Math.min(o / maxScroll, 1))
}

useEffect(() => {
  const st = ScrollTrigger.create({
    trigger: deckRef.current,
    start: "top top",
    end: "bottom bottom",
    snap: {
      snapTo: (value: number) => {                 // nearest normalized point
        const pts = normRef.current
        let best = pts[0], bestD = Infinity
        for (const p of pts) { const d = Math.abs(p - value); if (d < bestD) { bestD = d; best = p } }
        return best
      },
      duration: { min: 0.2, max: 0.4 },
      delay: 0.05,
      ease: "power2.inOut",
      inertia: false,          // kill momentum carry — Canva decks land, don't coast
    },
  })
  return () => st.kill()
}, [])
```

Recompute `offsets/norm` inside a `ScrollTrigger.addEventListener("refresh", () => measure(...))` handler so every refresh keeps points honest.

**Trackpad/inertia mitigation:** ScrollTrigger's own snap already absorbs residual trackpad velocity — after the wheel gesture ends, `delay:0.05` lets momentum settle, then tweens to nearest point over 0.2–0.4s. `inertia:false` prevents ScrollTrigger from extrapolating throw distance. Extra guard for programmatic jumps only (see §4): disable snap while a jump tween runs, re-enable on complete. No additional wheel listeners.

**`normalizeScroll()` — DECISION: DO NOT enable by default.**
- Pros it would give: unified touch/wheel pipeline, fixes iOS Safari address-bar resize jitter, blocks overscroll chaining, more deterministic snap on iOS.
- Cons that outweigh: hijacks native momentum feel (deck should feel native-first), breaks pinch-zoom accessibility (WCAG 1.4.4 zoom concern), known conflicts with Radix Dialog scroll-locking (InspectorDialog lives on this page) and iOS keyboard/position:fixed (Topbar is sticky/fixed-ish). 
- Mitigation without it: `100dvh` slide heights + debounced refresh (§7) + orientation listener.
- Ship behind QA flag only: `if (new URLSearchParams(location.search).has("normalizeScroll")) ScrollTrigger.normalizeScroll(true)` in Deck mount. Documented as diagnostic.

**CSS interplay:** add scoped override in `index.css`:
```css
html[data-deck] { scroll-behavior: auto; }
```
Deck sets `document.documentElement.dataset.deck = "on"` on mount (deck mode), removes on unmount/fallback. This kills the `scroll-behavior:smooth` double-animation conflict; all smoothness comes from GSAP snap/jump tweens. Fallback mode never sets the attribute.

---

## 2. Slide activation — state architecture

**Current-slide index: React state owned by `Deck.tsx`. No context library, no zustand.**

```ts
// Deck.tsx
const [activeIndex, setActiveIndex] = useState(0)
```

Derived via one **non-snapping** ScrollTrigger per slide:

```ts
SLIDE_IDS.forEach((id, i) => {
  ScrollTrigger.create({
    trigger: `#${id}`,
    start: "top 55%",
    end: "bottom 45%",
    onToggle: (self) => { if (self.isActive) setActiveIndex(i) },
  })
})
```

Created inside a single `gsap.context(() => {...}, deckRef)` in `Deck`'s mount effect → StrictMode-safe (context revert kills all).

**Distribution to consumers:** React context, not prop drilling through 12 sections:

```ts
// src/components/deck/slide-context.ts
export type SlideActiveValue = { isActive: boolean } | null
export const SlideActiveContext = createContext<SlideActiveValue>(null)
export function useSlideActive(): boolean | null {
  return useContext(SlideActiveContext)?.isActive ?? null   // null = no deck (fallback mode)
}
```

`Slide.tsx` wraps children in `<SlideActiveContext.Provider value={{ isActive }}>`. Components check `useSlideActive()`; `null` → run legacy behavior (IO / ScrollTrigger-once). This is the minimal-diff seam for ArchCanvas/OpsConsole and makes them standalone-safe.

**Entrance timelines — policy: play ONCE (first activation), never replay.**

Rationale: palette jumps and dot clicks re-cross slides constantly; replaying kicker→title→content on every pass reads broken, and re-entering upward would flash from-states. Showpieces get separate replay rules below.

Mechanic inside `Slide.tsx` (avoids paint-flash because paused `fromTo` applies from-states at creation):

```tsx
function Slide({ id, index, label, children }: SlideProps) {
  const rootRef = useRef<HTMLElement>(null)
  const [isActive, setIsActive] = useState(false)
  const playedRef = useRef(false)

  useEffect(() => {
    if (!isActive || playedRef.current) return
    playedRef.current = true
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power2.out" } })
        .fromTo("[data-reveal='kicker']",  { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.45 })
        .fromTo("[data-reveal='title']",   { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55 }, "-=0.30")
        .fromTo("[data-reveal='content']",
               { autoAlpha: 0, y: 18 },
               { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, "-=0.35")
    }, rootRef)
    return () => ctx.revert()
  }, [isActive])
  ...
}
```

- Kicker→title→content, stagger `0.08`, durations 400–600ms, `power2.out`, scoped via `gsap.context(sel, rootRef)` ✓ spec.
- Exit = none beyond scroll (spec: exit ≤250ms subtle or none → choose **none**; scroll IS the exit). No leave animations anywhere.
- Stagger cap: `[data-reveal='content']` sets capped in Slide via `stagger: { each: 0.08 }`; components with >8 children opt out of blanket content reveal and self-manage:
  - Team (9): row-stagger — see §5.6.
  - Frontend (6 cards incl. 1 big), Deploy (4+5 rows), Demo (4): ≤8 → plain content stagger fine.
  - StackGrid already animates its own 6 `.stack-card`s — its internal timeline converts to activation-gated (§5.4); Slide marks grid container as single `data-reveal='content'` item instead.
  - KpiBand slide: 8 tiles → within cap.

**Showpiece activation policies:**

| Component | on activate | on re-enter |
|---|---|---|
| ArchCanvas draw-in (traces + nodes) | plays once (own played-flag) | stays drawn |
| ArchCanvas lifecycle pulse | restarts **every** activation | replays (hero moment, cheap, self-clearing) |
| OpsConsole typewriter | starts once | does NOT restart; manual `replay` button remains |

Pulse conversion detail (§5.3): scrub timeline becomes a **paused, non-scrub** timeline; boxShadow stops become sequential `.to()` calls inside the same timeline; `tl.restart()` on each rising edge of `isActive`.

---

## 3. New files — full responsibility lists + TS interfaces

```
src/lib/deckBus.ts
src/hooks/useDeckCapabilities.ts
src/components/deck/Deck.tsx
src/components/deck/Slide.tsx
src/components/deck/DeckChrome.tsx
src/components/deck/slide-context.ts
src/components/deck/useDeckSnap.ts
src/components/deck/useDeckNav.ts
src/components/sections/Closing.tsx
```

### 3.1 `src/lib/deckBus.ts`
Tiny typed emitter bridging outside-chrome callers (Topbar, command-palette) → Deck. Module singleton; zero deps (~25 lines).

```ts
type JumpRequest = { id: string }
type Events = {
  jump: JumpRequest            // chrome or external code asks deck to navigate
  register: string[]           // deck announces slide ids (registry sync)
}
type Handler<T> = (payload: T) => void

const handlers: { [K in keyof Events]?: Set<Handler<Events[K]>> } = {}

export function on<K extends keyof Events>(k: K, fn: Handler<Events[K]>): () => void
export function emit<K extends keyof Events>(k: K, payload: Events[K]): void

/** Returns false when no deck is mounted or id unknown → caller falls back to scrollIntoView. */
export function requestJump(id: string): boolean
export function isDeckMounted(): boolean
```
Deck subscribes to `jump` and emits `register` with its id list on mount. `requestJump` checks registry membership + subscriber presence synchronously.

### 3.2 `src/hooks/useDeckCapabilities.ts`
Single source of fallback gating.

```ts
export type DeckCapabilities = {
  isMobile: boolean        // matchMedia("(max-width: 767px)")
  reducedMotion: boolean   // reuse useIsReducedMotion() (keeps ?motion=force QA flag)
  deckEnabled: boolean     // !isMobile && !reducedMotion
}
export function useDeckCapabilities(): DeckCapabilities
```
Live-updates on media-query change (mirrors `useIsReducedMotion` pattern). All deck-vs-fallback branches read this — no scattered matchMedia calls.

### 3.3 `src/components/deck/Deck.tsx`
Owns everything deck-wide:
- Renders `<Topbar variant="home"/>` (moved from Home) + slide list + `<DeckChrome/>`.
- `activeIndex` state; creates activation triggers (§2) + snap trigger (§1) in one `gsap.context`.
- Sets/clears `document.documentElement.dataset.deck` (CSS hook from §1).
- Subscribes `deckBus.on("jump")` → `scrollToIndex(i, {immediate})`; emits `register(SLIDE_IDS)`.
- Programmatic scroll: `gsap.to(window, { scrollTo: offsetsRef.current[i], duration: clamp(dist/3000, 0.4, 0.9), ease: "power2.inOut", overwrite: "auto" })` with snapST.disable() around tween (§4). Requires **ScrollToPlugin registered in `lib/gsap.ts`** (same gsap package — not a new dep):
  ```ts
  import { ScrollToPlugin } from "gsap/ScrollToPlugin"
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, ScrollToPlugin)
  ```
- Refresh orchestration (§7).
- Fallback branch: when `!deckEnabled` renders children in normal flow, no chrome, no STs, and mounts the legacy batch-reveal effect (moved verbatim from `Home.tsx` lines 103–113, gated here).

```ts
export type DeckProps = { slides: SlideDef[] }
export type SlideDef = { id: string; label: string; node: React.ReactNode }
```

### 3.4 `src/components/deck/Slide.tsx`
Per-slide wrapper.
- `<section id={id} aria-label={label} className="relative flex min-h-[100dvh] flex-col justify-center pt-16 pb-10">` — `pt-16` clears sticky Topbar; `100dvh` for iOS URL bar; content vertically centered (Canva feel).
- Owns `isActive` (from parent's activeIndex comparison — simpler than per-slide trigger: Deck passes `isActive={i === activeIndex}`), provides `SlideActiveContext`, runs entrance timeline (§2).
- Props:
```ts
export type SlideProps = {
  id: string
  label: string            // aria-label + dot tooltip + counter text
  isActive: boolean
  children: React.ReactNode
}
```

### 3.5 `src/components/deck/DeckChrome.tsx`
Fixed right-edge rail: dots + counter.
```ts
export type DeckChromeProps = {
  count: number
  activeIndex: number
  labels: string[]
  onSelect(index: number): void
}
```
A11y contract:
- `<nav aria-label="Slides">` of `<button>`s — keyboard reachable (Tab order natural, Enter/Space native button).
- Active dot: `aria-current="true"`, `aria-label={`Go to slide ${i+1}: ${labels[i]}`}`, visible `focus-visible:ring-2 ring-primary`.
- Counter: `<p aria-live="polite" class="font-mono tabular-nums">03 / 12</p>`.
- Hidden entirely on mobile/reduced (parent gating).

### 3.6 `src/components/deck/slide-context.ts`
As specified in §2 (`SlideActiveContext`, `useSlideActive(): boolean | null`).

### 3.7 `src/components/deck/useDeckSnap.ts`
Encapsulates offset measurement + global snap trigger (config in §1). Exposes `{ offsetsRef, snapSTRef, remeasure() }` for Deck's jump logic and refresh loop.

### 3.8 `src/components/deck/useDeckNav.ts`
Keyboard + hash + initial-load behavior.
```ts
export function useDeckNav(opts: {
  enabled: boolean
  activeIndex: number
  count: number
  goTo(index: number, immediate?: boolean): void
}): void
```
- Keyboard (only when `enabled`, and event target is not input/textarea/contenteditable/dialog):
  `ArrowDown/PageDown/Space→next · ArrowUp/PageUp→prev · Home→0 · End→count-1`. preventDefault on handled keys.
- Hash sync: on `activeIndex` change → `history.replaceState(null, "", "#" + SLIDE_IDS[activeIndex])` inside rAF (no history spam).
- Initial load: parse `location.hash` once on mount → if matches slide id, `goTo(i, /* immediate */ true)` in `useLayoutEffect` before first snap settle (instant jump, no smooth; entrance animation still allowed to play).
- `hashchange` listener (back/forward nav between hashes) → jump accordingly.

### 3.9 `src/components/sections/Closing.tsx`
Footer content extracted from `Home.tsx:391–418` into a slide-shaped component. Keeps `<footer>` element + all links (incl. `#architecture` link which now routes through deck jump via Topbar-style interception — see §4.3 note: footer anchor gets same `onClick` treatment). Layout adjusted: vertical centering, larger brand mark, credits line retained verbatim.

---

## 4. Hash / palette / Topbar integration

### 4.1 Palette (`command-palette.tsx`)
Diff confined to `jump()`:

```ts
import { requestJump } from "../../lib/deckBus"

const jump = (entry: PaletteEntry) => {
  if (entry.type === "guide") { /* unchanged */ }
  onOpenChange(false)
  requestAnimationFrame(() => {
    if (!requestJump(entry.id)) {                       // deck path (returns false off-route)
      document.getElementById(entry.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  })
}
```
Docs headings/endpoints don't exist on Home → `requestJump` returns false → legacy fallback unchanged. Zero regression on `/docs`, `/wiki`.

**Snap-fight guard (inside Deck's jump handler, not palette):**
```ts
const jumpTo = (i: number, immediate = false) => {
  snapST?.disable()                     // snap must not wrestle the tween
  if (immediate) { window.scrollTo({ top: offsets[i], behavior: "instant" }); snapST?.enable(); return }
  gsap.killTweensOf(window)
  gsap.to(window, {
    scrollTo: { y: offsets[i], autoKill: true },
    duration: THREE_CLAMP, ease: "power2.inOut",
    onComplete: () => snapST?.enable(),
    onInterrupt:  () => snapST?.enable(),   // user grabbed the wheel mid-jump
  })
}
```
`autoKill:true` means user scrolling cancels the jump — no tug-of-war. The `gsap.isTweening(window)` question from the brief is answered by this pair (kill-before + autoKill), which is strictly safer than an isTweening bouncer (it can't strand the snap trigger disabled).

### 4.2 Topbar (`Topbar.tsx`)
Minimal diff in `handleNavClick` + `scrollToTop`:

```ts
import { requestJump, isDeckMounted } from "../../lib/deckBus"

if (href.startsWith("#")) {
  e.preventDefault()
  if (!requestJump(href.slice(1))) {                    // deck-aware; docs/wiki unaffected
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: isRM ? "auto" : "smooth", block: "start" })
  }
  history.replaceState(null, "", href)
  setActive(href)
  setOpen(false)
}

const scrollToTop = () => {
  if (isDeckMounted()) requestJump("hero")
  else window.scrollTo({ top: 0, behavior: isRM ? "auto" : "smooth" })
}
```
Topbar's own IO-based link highlighting keeps working (slides have the same ids) but Deck also pushes `aria-current` via bus later if drift appears — out of scope unless verification shows mismatch.

### 4.3 Footer `#architecture` link
Gets the same one-line `onClick` intercept as Topbar (shared helper `jumpOrScroll(id)` exported from `deckBus` consumer side — put it in `useDeckNav.ts` exports to avoid a second module).

### 4.4 Hash lifecycle summary
- Load `/#stack` → instant position (no smooth), slide 04 activates, entrance plays, replaceState keeps URL clean.
- Manual scroll → replaceState on each activation (throttled by rAF).
- Back/forward → `hashchange` → animated jump.

---

## 5. Existing component diffs (file-by-file, minimal)

### 5.1 `src/lib/gsap.ts`
Add `ScrollToPlugin` import + registration + export. Three-line diff.

### 5.2 `src/pages/Home.tsx`
- Delete batch-reveal `useEffect` (moves to Deck fallback branch).
- Wrap each region in `<Slide>`; move Topbar render into `<Deck>`; delete inline footer (→ `Closing`).
- Split hardening map into two slides using `HARDENING.slice(0,5)` / `slice(5)`; renumber `SectionHead num`: ops→"06", deploy→"07", demo→"08", team→"09"; hardening II tag updated.
- Add `data-reveal="content"` attributes to card grids/lists (fe-cards, dep-step li, demo-card li, team rows container, arch/stack/ops/kpi containers).
- Keep `InspectorDialog` wiring untouched.

### 5.3 `canvas/ArchCanvas.tsx`
- Import `useSlideActive` from deck context.
- **Remove**: scrubbed pulse timeline + the 5 per-stop boxShadow scrub ScrollTriggers (lines ~98–129).
- Draw-in effect: gate on `const sa = useSlideActive()`; when `sa === null` → keep existing `ScrollTrigger.create(start:"top 75%", once:true)` path; when boolean → `if (sa && !drawn.current) tl.play()`.
- Pulse: rebuilt as one paused timeline (pulse fade-in → motionPath along `#lcPath` 3s ease:none → fade-out → 5 sequential node glows), stored in ref, `restart()` on each `sa === true` edge; killed via its own `gsap.context` revert.
- `MotionPathPlugin` already registered — nothing to add.

### 5.4 `sections/StackGrid.tsx`
Same seam: `useSlideActive()` null → legacy `ScrollTrigger top 80% once`; else play internal paused tl on first activation. Internal markup untouched.

### 5.5 `sections/OpsConsole.tsx`
- `const sa = useSlideActive()`; start condition becomes `(sa === true || ioFired)` where IO branch runs only when `sa === null` (fallback mode preserves current IO code).
- Once-guard ref so re-entering slide doesn't restart typing; `replay` button unchanged.
- Everything else (chips, aria-live body) untouched.

### 5.6 `sections/KpiBand.tsx`
Add `variant?: "band" | "slide"`:
- `"band"` (default): byte-for-byte today's output.
- `"slide"`: `grid-cols-2 lg:grid-cols-4 gap-6`, tile padding `p-5`, numeral `text-4xl md:text-5xl`, keep boarding-pass motif + count-up + telemetry strip as the slide's kicker row. Telemetry slide passes 8 items → within stagger cap.

### 5.7 Team slide row-stagger (in Home markup)
9 members in `lg:grid-cols-3` → chunk `TEAM_MEMBERS` into rows of 3; mark each row `data-reveal-row`; Slide's content stagger animates rows (3 × stagger 0.08) while a nested inner tween staggers cards within each row at `each:0.04` — total perceived stagger stays snappy and respects the ~8 cap. Implementation: give team grid its own small timeline in Home-level component `TeamGrid` OR simplest: rows are three `data-reveal='content'` wrappers whose children inherit opacity from row tween (single tween per row, no per-card stagger needed visually). Choose the simple version: animate 3 row wrappers only.

### 5.8 `sections/Hero.tsx`
No structural change. Its self-playing mount timeline already equals "entrance on activation" for slide 01 (visible on load). Optionally gate behind `useSlideActive() !== false` — skip; hero is always the initial active slide.

### 5.9 `index.css`
Add `html[data-deck]{scroll-behavior:auto}` (§1). Nothing else.

---

## 6. Fallback gating (mobile <768px + prefers-reduced-motion)

Single switch: `useDeckCapabilities().deckEnabled`.

When **false**, `Deck` renders:
- Normal-flow sections (Slide renders without `min-h-[100dvh]`/centering — conditional className).
- No DeckChrome, no snap trigger, no activation triggers, no keyboard nav, no hash writes, no `data-deck` attribute.
- Legacy behavior restored: Home's batch `ScrollTrigger.batch(".fe-card, .hard-card, .demo-card, .dep-step")` effect mounted in fallback branch (verbatim from current code); ArchCanvas/OpsConsole/StackGrid fall back internally via `useSlideActive() === null`.
- Hero mount timeline: acceptable under reduced-motion? Current site already plays it regardless — preserve status quo (out of scope to regress or expand).

Live switching (rotate/resizing across 768px, toggling OS reduce-motion) tears down deck cleanly: all effects keyed on `deckEnabled`, contexts revert, attribute removed.

---

## 7. ScrollTrigger.refresh strategy

In `Deck` mount effect (deck mode only):

```ts
// 1. fonts shift metrics → re-measure after webfonts settle
document.fonts.ready.then(() => ScrollTrigger.refresh())
// 2. full load (images/fonts late)
window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true })
// 3. slide height changes (dialog? no—overlay; content wrap? yes)
const ro = new ResizeObserver(entries => {
  const total = entries.reduce((a, e) => a + e.target.scrollHeight, 0)
  if (Math.abs(total - lastTotal) < 2) return        // loop guard
  lastTotal = total
  clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 120)
})
slideRefs.forEach(el => ro.observe(el))
// 4. iOS Safari address-bar / rotation churn
let rz: number
window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => ScrollTrigger.refresh(), 150) })
window.addEventListener("orientationchange", () => setTimeout(() => ScrollTrigger.refresh(), 200))
```
- **Images:** devicon SVGs are fixed-box (`h-4 w-4`, `loading="lazy"`), logo fixed `h-9`, barcode inline SVG fixed → zero layout shift → no per-image refresh hooks needed. Decision recorded deliberately.
- **Loop guard:** RO compares aggregate height delta (<2px ignored) + debounce; refresh itself doesn't mutate observed content heights → no feedback loop.
- Cleanup: disconnect RO, remove listeners in effect cleanup.

---

## 8. Ordered task breakdown (single-session sized, each ends in build-verify)

Verify command everywhere: `npm run build` (tsc -b + vite) + `npm run lint`; manual spot-check via `npm run dev`.

| # | Task | Files | Verify |
|---|------|-------|--------|
| 1 | Register ScrollToPlugin; create `deckBus.ts` (+`jumpOrScroll` helper); create `useDeckCapabilities.ts` | `lib/gsap.ts`, `lib/deckBus.ts`, `hooks/useDeckCapabilities.ts` | build green; console smoke: `emit/on/requestJump` roundtrip via temporary call |
| 2 | Scaffold deck primitives: `slide-context.ts`, `Slide.tsx`, `Deck.tsx` (fallback-only rendering initially — deck mode stubbed off), wire Home sections into Deck with `deckEnabled=false` default | deck dir + `Home.tsx` + `index.css` (`html[data-deck]` rule) | build; visual parity with prod at mobile width + reduced-motion |
| 3 | Flip deck mode ON: activation triggers, `activeIndex`, Slide entrance timelines, `data-reveal` attrs across sections; remove Home batch effect (kept in fallback branch) | `Deck.tsx`, `Slide.tsx`, `Home.tsx` | build; desktop: entrances fire once per slide, StrictMode double-mount leaves no stuck-hidden elements |
| 4 | Snap: `useDeckSnap.ts` global snap trigger + offset measurement + refresh listener; verify trackpad settle, wheel flick, resize re-measure | `useDeckSnap.ts`, `Deck.tsx` | build; manual flick tests Chrome/Safari |
| 5 | `DeckChrome.tsx` dots+counter with full a11y contract; wire to `activeIndex` | `DeckChrome.tsx`, `Deck.tsx` | build; Tab reaches dots, `aria-current` flips, counter announces |
| 6 | `useDeckNav.ts`: keyboard, hash sync, initial-hash instant jump, hashchange; set/clear `dataset.deck` | `useDeckNav.ts`, `Deck.tsx` | build; load `/#team` lands instantly; arrows navigate; back/forward works |
| 7 | Palette + Topbar + footer-link integration via `requestJump` (with fallback paths intact) | `command-palette.tsx`, `Topbar.tsx`, `Closing.tsx`(link), `Home.tsx` | build; Ctrl-K jump snaps cleanly (no snap/tween fight); `/docs` palette jump unchanged |
| 8 | Content diffs: KpiBand `variant="slide"`; hardening split + renumber; extract `Closing.tsx`; Team row-stagger | `KpiBand.tsx`, `home-content.ts`, `Home.tsx`, `Closing.tsx` | build; 12 dots present; copy correct |
| 9 | Activation conversions: ArchCanvas (drop scrub, pulse restart-on-activate), OpsConsole (activate-start), StackGrid gate | `ArchCanvas.tsx`, `OpsConsole.tsx`, `StackGrid.tsx` | build; pulse replays per entry; typing once + manual replay; fallback IO still fires |
| 10 | Refresh strategy (fonts/load/RO/resize/orientation) + optional normalizeScroll QA flag + final hardening sweep (a11y pass, reduced-motion pass, mobile pass, `npm run lint`) | `Deck.tsx` | full build + lint clean; manual matrix: desktop×theme-switch, iPad width, forced reduced-motion, `?motion=force` |

Tasks 1–3 are the critical path; 4–6 depend on 3; 7–9 parallelizable after 3; 10 closes.

---

## 9. Risks table

| Risk | Trigger scenario | Impact | Mitigation (baked into plan) |
|---|---|---|---|
| Snap vs palette/Topbar `scrollIntoView` fight | User picks palette item mid-momentum; CSS smooth-scroll + ST snap tween both animate | Jittery double-scroll, wrong landing | Single jump path (`requestJump`), snap disabled around jump tween, `autoKill:true` on interrupt, `html[data-deck]` kills CSS smooth |
| iOS Safari URL-bar resize churn | Address bar collapse fires resize mid-snap | Snap points stale → lands off-slide | `100dvh` slides, debounced refresh (150ms), orientation handler, offsets recomputed on every ST refresh; normalizeScroll available behind `?normalizeScroll` if field reports persist |
| StrictMode double-mount | Dev/prod-parity builds with React 19 StrictMode | Duplicate ScrollTriggers, hidden-from-states stranded | Everything inside `gsap.context`+`revert`; once-flags in refs (reset on remount is desired); paused-fromTo pattern guarantees from-states only exist while context alive |
| RO ↔ refresh loop | Height measurement feeds refresh which reflows | Infinite refresh, jank | Delta guard (<2px ignore) + 120ms debounce; refresh never mutates slide content height |
| Slides taller than viewport (short landscape windows) | 1366×640 laptop, Architecture slide | Even-spacing snap assumption breaks | Offsets measured from real `offsetTop` (not `i/(n-1)` math); last point clamped to maxScroll |
| Topbar overlay eats slide headers | Sticky h-16 covers first 64px | Title clipped | `pt-16` inside every Slide; snap target = section top (topbar floats over padding zone) |
| Palette endpoints/headings on Home route | BASE_INDEX includes docs-only ids | Null deref / dead jump | `requestJump` returns false for unregistered ids → legacy `getElementById` fallback (already null-safe) |
| InspectorDialog scroll-lock vs snap | Dialog open while snap pending | Background fights modal lock | Radix locks body scroll; snap ST idle while locked (no scroll events); low risk, verified in task 10 |
| Theme switch mid-session | Colors swap, no metric change | Unneeded refresh loops | Explicitly excluded from refresh triggers (colors don't affect geometry) |
| Reduced-motion users get deck removed but hero still animates | OS setting on | Inconsistency (pre-existing) | Status quo preserved; noted, not regressed; `?motion=force` QA flag still honored |

---

## 10. Acceptance checklist (final gate)

- [ ] 12 slides, dots reflect order, counter `NN / 12`, both keyboard-operable, `aria-current`/`aria-live` correct
- [ ] Wheel/trackpad: settles on slide edges within ~450ms, no half-slide states
- [ ] Ctrl-K jump, Topbar links, footer link, dot click, hash deep-link, back/forward: all land exactly on slide boundaries, no snap fight
- [ ] ArchCanvas draws + pulses on activation only; OpsConsole types on activation, manual replay works
- [ ] Entrance stagger spec respected (0.08 / power2.out / 400–600ms), plays once, Team respects cap via row animation
- [ ] <768px or reduced-motion: plain scroll, zero deck chrome, zero JS-owned from-states, legacy reveals intact
- [ ] `npm run build` + `npm run lint` clean; no console errors on load, theme switch, dialog open
