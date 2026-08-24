# UX/UI Implementation Plan — Itinera Variant A Vertical Snap Deck

Worker: ux-engineer · Run: 20260824-slide-deck · Scope: UX decisions only (no code in this doc). An AI implements this verbatim.

**Final slide count: 12.** Order: `01 Hero → 02 Telemetry → 03 Architecture → 04 Stack → 05 Frontend → 06 Hardening I → 07 Hardening II → 08 Ops → 09 Deploy → 10 Demo → 11 Team → 12 Closing`.

**Deck mode gate:** deck behaviors (snap, dots, counter, keyboard, activation choreography) are active ONLY when `window.innerWidth ≥ 768 && !prefers-reduced-motion`. Below that gate the page is the current plain-scroll document with existing on-enter reveals. All specs below assume deck mode unless marked "fallback".

---

## 0. Global slide grammar (applies to every slide)

- **Shell:** each slide = `<section id={existing-anchor} data-slide={n}>` with `min-h-[100svh]`, `flex flex-col justify-center`, inner container `mx-auto max-w-[1280px] px-4 lg:px-6` (unchanged token). Vertical rhythm inside slides: kicker block → `mt-3` title → `mt-3` lead → `mt-8` content. Content area budget ≈ `100svh − 64px topbar − 96px padding` (~740px at 900px viewport).
- **Overflow safety:** slides are `min-h`, never fixed-height. If content exceeds viewport (short laptop 1366×768), the page scrolls within the slide and snap still lands on the section top. No inner scroll containers except Ops console body.
- **SlideHead component (new, replaces per-slide SectionHead usage):** one row, `mb-2 flex items-center gap-3`:
  - left: mono gold slide number `font-mono text-[11px] font-bold text-primary tracking-[0.14em]` → `03`
  - hairline `<span aria-hidden className="h-px w-8 bg-border" />`
  - tag chip (existing style): `rounded-full border border-border px-2 py-0.5 text-[10px] normal-case text-dim`
  - right (pushed with `ml-auto`): mono dim position marker `font-mono text-[10px] tracking-[0.22em] text-dim` → `03 / 12`
  - Title below: `text-[clamp(1.75rem,3.4vw,2.75rem)] font-bold tracking-tight leading-[1.1]` — up from current `text-2xl md:text-3xl`. Serif italic gold emphasis spans preserved as-is.
  - Lead: `mt-3 max-w-2xl text-[15px] md:text-base leading-relaxed text-dim`.
- **Heading order:** Hero owns the page's single `h1` (already in Hero.tsx). Every other slide's headline is `h2`; card titles stay `h3`. Telemetry slide gets a new `h2` (it has none today — see §2).
- **Container rule:** all content constrained to `max-w-[1280px]`; full-bleed allowed for background treatments only (§6). Exceptions by design: Hero ticket keeps its own `max-w-[1500px]` bp-cover width; Closing centers content at `max-w-4xl`.
- **Content readable without JS:** no element is ever hidden in markup/CSS. Every hidden "from" state is applied at runtime inside `gsap.context()` (current pattern) so a JS-failure or animation-less render shows full content. This constraint is restated per task in §7.

---

## 1. Motion spec (global, binding)

| Rule | Value |
|---|---|
| Exit animation | **None.** Scroll IS the exit. No fade-outs on deactivate; slides reset instantly (`tl.progress(0).pause()`) when leaving. If any crossfade is ever needed (e.g., scroll-hint dismissal) it is ≤250ms `autoAlpha`. |
| Entrance stagger | Per-slide paused timeline; played on slide activation. Item duration 450–600ms, `ease: "power2.out"`, stagger **0.08s**. |
| Choreography order | Fixed grammar per slide: **kicker row @0ms → h2 title @60ms → lead @120ms → content items from @180ms**, staggered 80ms. |
| Stagger cap | ≤8 animated targets per timeline after the head. Telemetry = exactly 8 tiles (header strip animates as ONE unit). Team has 9 cards → **row-stagger**: wrap the 9 cards in 3 row groups (`grid-row` wrappers are NOT added to DOM — use GSAP `stagger: { grid: [3, 3], from: "start", axis: "y", amount: 0.24 }`) so perceived order is row-by-row and stays under the cap feel. |
| Flip plugin | Not used. Not registered. |
| Replay policy | Entrances replay on every activation (instant reset on leave). Durations ≤600ms keep re-entry non-fatiguing. Count-up KPIs also restart per activation. |
| Activation triggers, not scrub | ArchCanvas draw-in + lifecycle pulse and OpsConsole typewriter fire from a single `slide-active` event (deck emits `CustomEvent("deck:active", { detail: { index } })` + React context), NOT IntersectionObserver thresholds and NOT scrubbed timelines. |
| Architecture pulse | Convert scrubbed MotionPath pulse to time-based: on activation play draw-in (traces 0.9s stagger 0.06 → nodes 0.5s stagger 0.045 overlapping −0.55s), then pulse travels `#lcPath` once over 3.0s `ease:none`, then ambient `.trace-flow` CSS continues. Kill/reset on deactivate. |
| Reduced motion / mobile | Timelines never created; nothing hidden; count-up renders final value instantly (`useCountUp` already handles RM — verified); typewriter prints all lines instantly; pulse/draw render final state statically. |

---

## 2. Slide-by-slide UX spec

Format: Layout · Scale vs current · Cut for fit · Hierarchy · Choreography (ms).

### Slide 01 — Hero (id: none, top of page)
- **Layout:** unchanged boarding-pass ticket (`bp-wrap bp-cover`) centered; ticket remains the hero. Topbar sticky above.
- **Scale:** unchanged — ticket already sized to viewport (`min(100svh − 104px, 820px)`).
- **Cut:** inline trust-pills row inside bp-main (the marquee tear-strip already carries identical pills — remove duplication, keep marquee). Keep route line, stub, barcode, scan sweep.
- **Hierarchy:** badge → h1 word-stagger → lead → CTAs → route line → stub fields → barcode.
- **Choreography:** existing Hero timeline kept verbatim (it already matches this grammar). Add final beat: scroll-hint fades in at +1200ms.

### Slide 02 — Telemetry (id: `#telemetry`, NEW wrapper)
- **Layout:** SlideHead (kicker `02`, tag "operations telemetry", marker `02 / 12`) → KpiBand variant `"slide"`: header strip full-width, then `dl` grid `grid-cols-2 lg:grid-cols-4` = **2×4 tile grid**, `gap-4`, tiles `py-6 pl-12 pr-4` (taller than current py-3).
- **Scale:** value `text-2xl → text-4xl xl:text-5xl font-extrabold tabular-nums`; label `10px → 11px`; status chip + hint unchanged size but more breathing room. Notch/perforation motif preserved (signature).
- **Cut:** none — all 8 tiles shown. This slide exists precisely to let the numbers breathe.
- **New a11y:** add `h2` "Numbers that reconcile" (serif italic gold on "reconcile") since KpiBand currently has no heading; strip becomes part of content, not heading.
- **Choreography:** head 0/60/120 → strip unit @180 → 8 tiles stagger 80ms from @260 → count-up starts when its tile lands (~+400ms each, natural cascade).

### Slide 03 — Architecture (id: `#architecture`)
- **Layout:** SlideHead (`03`, tag "request lifecycle") → support line shortened to ONE sentence: *"Client → Router → Auth → Controller → Service → Repository → Model. Click any node to inspect."* → ArchCanvas capped `h-[62vh] min-h-[420px]`.
- **Scale:** canvas grows from auto to dominant 62vh band; node labels stay 12–13px (legibility beats scale here); SectionHead title scales via global grammar.
- **Cut:** long two-sentence paragraph reduced to the one-liner above (full flow diagram already communicates it); InspectorDialog interaction untouched.
- **Hierarchy:** head → canvas → (pulse is the payoff moment, plays after draw-in completes).
- **Choreography:** head 0/60/120 → draw-in starts @180 (traces→nodes per §1) → pulse @~1400ms → ambient trace-flow. Node click → InspectorDialog (no choreography interference; dialog manages own focus trap as today).

### Slide 04 — Stack (id: `#stack`)
- **Layout:** SlideHead (`04`, tag "six groups") → bins strip ("Component Bins · 6 groups · Laravel 13") → `grid sm:grid-cols-2 lg:grid-cols-3` of 6 stack-cards (unchanged structure).
- **Scale:** card padding `p-5 → p-6`; item name `13.5px → 15px`; note `12.5px → 13px`. Corner trace motif preserved.
- **Cut:** item list spacing `space-y-3 → space-y-2.5` (fit 3 rows of cards comfortably); nothing else.
- **Hierarchy:** head → strip (one unit) → 6 cards stagger.
- **Choreography:** head 0/60/120 → strip @180 → cards stagger 80ms from @260, icon pop `back.out(2)` 350ms overlapped −0.4s (keep existing pair-timeline shape, retriggered on activation instead of ScrollTrigger top-80%).

### Slide 05 — Frontend (id: `#frontend`)
- **Layout:** SlideHead (`05`, tag "355 files · no framework") → bento `grid gap-4 md:grid-cols-2 lg:grid-cols-3`, first card `md:col-span-2 md:row-span-2` (unchanged).
- **Scale:** big-card title `text-xl → text-2xl`; zone chips (`public/ app/* agency/* admin/*`) `text-[10.5px] → text-xs`; standard card titles `15px → 16px`.
- **Cut:** none — 6 cards + zones fit the 62vh budget at ≥1024.
- **Hierarchy:** head → big SURFACES card first in stagger → remaining five.
- **Choreography:** head 0/60/120 → 6 cards stagger 80ms from @180 (big card first = index 0), zone chips pop as one unit inside big card @+200ms.

### Slide 06 — Hardening I (id: `#security`)
- **Layout:** SlideHead (`06`, tag "hardening delivered · 1 of 2") → `grid gap-4 sm:grid-cols-2 lg:grid-cols-5` — **five cards across** (compact variant): icon chip 36px, "● shipped" pill moved beside icon row, title `15px semibold`, detail `text-[12px] leading-snug` (FULL text — production site, no truncation), code tag pinned bottom via `flex flex-col` + `mt-auto`.
- **Scale:** cards get narrower but taller rhythm; emerald identity unchanged.
- **Cut:** none (copy intact). Density handled by layout, not deletion.
- **Hierarchy:** head → 5 equal cards, stagger left→right.
- **Choreography:** head 0/60/120 → cards stagger 80ms from @180.

### Slide 07 — Hardening II (id: none new — continuation section `data-slide=7`, anchor stays `#security` region; give it `id="hardening-ii"` for dot deep-link)
- **Layout:** same SlideHead pattern (`07`, tag "hardening delivered · 2 of 2") → `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` four cards (same compact card variant as Slide 06) → **proof strip** full-width below: `rounded-lg px-5 py-3 border border-emerald-500/25 bg-emerald-500/[0.06] flex items-center justify-between` containing mono text `55 suites · 106 ops · 0 wildcards` (left, `text-sm font-bold text-emerald-300 tracking-wide`) + right side `● shipped ×9` summary pill (emerald).
- **Scale:** strip numerals `text-lg font-extrabold tabular-nums` gold/emerald accents.
- **Cut:** none.
- **Hierarchy:** head → 4 cards → strip as closing statement (last thing seen before leaving).
- **Choreography:** head 0/60/120 → cards stagger 80ms from @180 → strip rises last @+320ms (single unit).

### Slide 08 — Ops (id: `#ops`)
- **Layout:** SlideHead (`08`, tag "interactive console") → `grid gap-6 lg:grid-cols-[1fr_1.1fr]`: 8 telemetry chips left, console right. Console body height `h-[240px] → h-[300px]` (uses freed vertical budget; still fits 900px viewport).
- **Scale:** chip values `13px → 15px mono bold`; notes `11.5 → 12.5`.
- **Cut:** none. Typewriter lines unchanged.
- **Hierarchy:** head → chips+console simultaneous columns → typing begins as the showpiece.
- **Choreography:** head 0/60/120 → chips stagger 80ms from @180 AND console window frame fades @180 → typewriter starts on activation event (replaces IO threshold 0.3; keep IO as mobile/fallback path). Pause typing when slide deactivates (`running=false`), resume state = restart line cleanly on reactivate. Traffic-light header + replay button unchanged.

### Slide 09 — Deploy (id: `#deploy`)
- **Layout:** SlideHead (`09`, tag "ship · verify · repeat") → `grid gap-8 lg:grid-cols-2`: left = 4-step vertical timeline (connector line, numbered chips, step 04 emerald), right = test panel: 6 TEST_ROWS rows + 3 command chips (unchanged structures).
- **Scale:** step titles `14px → 15.5px`; suite names `13.5 → 15px`; status pills unchanged.
- **Cut:** command chips row may wrap to second line at <1280 — acceptable, not cut.
- **Hierarchy:** head → timeline steps stagger top→down while test panel rises as one column unit → chips last.
- **Choreography:** head 0/60/120 → 4 steps stagger 80ms from @180 → test panel container @420 (one unit, not 6 staggers — respects cap) → command chips @500.

### Slide 10 — Demo (id: `#demo`)
- **Layout:** SlideHead (`10`, tag "product showcase") → `ol grid gap-3 sm:grid-cols-2 lg:grid-cols-4` = 2 rows × 4 numbered ghost-serif cards (unchanged structure).
- **Scale:** ghost background numerals `56px → 72px` (more presentation-like); STEP mono label + titles `14px → 15px`; detail paths stay mono `11.5px`.
- **Cut:** none — 8 cards exactly at cap.
- **Hierarchy:** head → 8 cards row-major stagger (reads as journey order).
- **Choreography:** head 0/60/120 → cards stagger 80ms from @180 (exactly 8 = cap).

### Slide 11 — Team (id: `#team`)
- **Layout:** SlideHead (`11`, tag "conference case study · team 2") → `grid gap-3 sm:grid-cols-2 lg:grid-cols-3` 9 member rows (avatar initials, name, handle·commits, GitHub+LinkedIn icons — unchanged).
- **Scale:** avatar `h-11 w-11 → h-12 w-12`; name `14px → 15px`.
- **Cut:** none. Row-stagger handles the 9-card overrun (§1).
- **Hierarchy:** head → 9 cards in 3 visual rows.
- **Choreography:** head 0/60/120 → cards with `stagger:{grid:[3,3],axis:"y",amount:0.24}` from @180 (row-by-row read).

### Slide 12 — Closing (id: `#end`; semantic `<footer>` element promoted INTO this slide — footer markup moves inside the slide section, keeping landmark semantics)
- **Layout:** centered stack, `max-w-4xl mx-auto text-center`: huge wordmark `Itinera<span class="text-primary">.</span>` at `text-[clamp(3rem,7vw,5.5rem)] font-extrabold tracking-tighter` (gold period) → tagline `mt-4 text-base md:text-lg text-dim` ("Luxury travel, orchestrated by Laravel 13. Team 2 conference deliverable @ Threedos.") → `mt-10 grid gap-4 sm:grid-cols-3` **three link cards** (equal thirds, `p-6 rounded-xl border border-border/70 bg-white/[0.02] hover:border-primary/40 hover:-translate-y-0.5 transition-all`): API Docs → https://itinera.apidog.io · GitHub → repo URL · Wiki → `/wiki`. Card anatomy: icon 40px gold-tinted chip (Book / GithubMark / FileText), label `text-lg font-bold`, sub-line mono `10.5px` dim (`itinera.apidog.io` / `AhmedTyson/Team2-Conference-Project` / `guides · ADRs · runbooks`). Whole card is the `<a>` with visible focus ring. → `mt-10` built-with microcopy row: `© 2026 Itinera — Team 2 · MIT · Laravel 13 · React 19 · Apidog` + `site updated {SITE_UPDATED}` (mono, tabular-nums, `text-xs text-dim`).
- **Scale:** footer links graduate from text links to presentation-grade cards; wordmark is the largest type on the site after hero h1.
- **Cut:** old footer nav duplicates (Architecture anchor link) dropped — dots/palette now do that job. Old 4-link nav replaced by the 3 cards.
- **Hierarchy:** wordmark → tagline → cards → microcopy.
- **Choreography:** wordmark rise+fade @0 (600ms) → tagline @160 → 3 cards stagger 80ms from @320 → microcopy @560.

---

## 3. Deck chrome UX

### Progress dots (right rail)
- Placement: `fixed right-5 top-1/2 -translate-y-1/2 z-40`, vertical `<nav aria-label="Slides">` + plain `<ul>` (NOT a tablist — see §4).
- 12 items. Each `<li>` contains `<button className="grid h-11 w-11 place-items-center">` (**44×44 hit area**) wrapping the visible dot `<span>`.
- Dot states: idle `h-2 w-2 rounded-full bg-border-strong`; hover `scale-125 bg-dim` (+150ms transition); **active** `h-6 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(251,191,36,.45)]` (vertical gold pill — reads as "you are here" without color alone); focus-visible uses global `:focus-visible` outline (2px gold, offset 2 — already in index.css).
- Hover tooltip: label chip appears LEFT of the dot: `absolute right-12 whitespace-nowrap rounded-md border border-border bg-panel px-2 py-1 font-mono text-[10px] text-dim opacity-0 group-hover:opacity-100 transition-opacity duration-150`, content = slide title ("Architecture"). Hidden until hover/focus-within.
- Each button: `aria-label="Slide 3 — Architecture"`, `aria-current="true"` when active.
- Visibility: deck mode only (`≥768 && !RM`). At 768–1023 the rail sits closer (`right-3`) and tooltips are touch-suppressed (`@media (hover:hover)` guard).

### Counter
- Placement: `fixed left-6 bottom-5 z-40`, mono: current `text-primary font-bold` + `/ 12` dim → renders `03 / 12` (`tabular-nums`, `tracking-[0.18em]`, `text-[11px]`).
- Visible `≥1024px` in deck mode only (below that it collides with mobile content; dots suffice).
- The visible counter is `aria-hidden`; a separate visually-hidden `aria-live="polite"` region announces `Slide 3 of 12 — Architecture` on every activation change (debounced 250ms so fast scrolling doesn't machine-gun announcements).

### Keyboard model (document-level keydown, deck mode only)
Ignored when: command palette open, InspectorDialog open, Sheet open, or `event.target` matches `input, textarea, select, [contenteditable]`.

| Key | Action |
|---|---|
| `ArrowDown` / `PageDown` | next slide |
| `ArrowUp` / `PageUp` | previous slide |
| `Home` | slide 1 |
| `End` | slide 12 |
| `Tab` | **untouched** — native tab order inside current slide; no trap, no interception |
| `Space` | not bound (reserved for buttons/native scroll) |

Guard: if a key-nav would land on the current slide (edge), no-op. Rapid repeats queue to latest target (debounce 120ms — snap tween supersedes).

### Scroll hint (slide 1 only)
- Bottom-center of Hero: `absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1` — mono `10px tracking-[0.22em] text-dim` label `SCROLL` + `ChevronDown` icon animating a 1.6s ease-in-out y-bob loop (CSS keyframe, disabled under RM where the whole chrome doesn't render anyway).
- Behavior: click → `deck.next()`. Dismissal: fades out over 200ms the first time activation index ≠ 0, and never returns during the session (state flag, not re-render churn).

---

## 4. Accessibility decisions

- **Dots = `<nav>` + buttons, explicitly NOT a tablist.** Rationale: tablist semantics imply roving tabindex + arrow-key ownership of the widget, which collides with the global ↑/↓ slide model and forces Tab to jump into/out of the rail unpredictably. Buttons-in-nav with `aria-current` + `aria-label` give SR users an equivalent landmark without stealing keys.
- **Focus management rule (exact):**
  - Wheel/touch/scrollbar-driven activation → **zero focus movement** (never steal focus mid-scroll; screen readers follow via the aria-live announcement).
  - Keyboard nav (arrows/Page/Home/End) → after snap settles, `slideEl.querySelector("h1,h2").focus({ preventScroll: true })` — headings get `tabIndex={-1}`. This gives keyboard/SR users a real reading position without scrolling fights.
  - Dot click → focus STAYS on the clicked dot (standard toolbar behavior); slide announces via live region.
- **Live region:** single polite region for counter announcements (§3). KPI count-up tiles keep their existing per-tile `aria-live="polite"` ONLY on completion (already implemented — leave as-is; total concurrent politeness is bounded because announcements fire once per tile per visit).
- **Contrast (verify both themes, WCAG AA):**
  - Gold `#fbbf24` on obsidian `#05070d` ≈ 12.9:1 ✓ (also fine on `bg-1` panels).
  - Emerald `#34d399` chips/text on dark surfaces ≈ 8.6:1 ✓.
  - Dim `#93a0bf` on `#05070d` ≈ 6.8:1 ✓ (body copy floor).
  - Light mode: accent drops to `#059669` on white ≈ 4.7:1 ✓; light-primary `#d97706` on `#f4f6fb` ≈ 3.9:1 — **use for large text/decoration only, never body copy** (matches current usage; add to verification checklist).
  - New proof-strip emerald-on-emerald-tint (`emerald-300` on `emerald-500/[0.06]` over `bg-0`) ≈ >7:1 ✓.
- **Reduced motion & mobile fallback:** deck mode off ⇒ no snap, no dots, no counter, no keyboard hijack, no entrance hiding, typewriter prints instantly, count-up instant. Existing IO-based reveals may remain for plain-scroll mode (they're RM-aware already).
- **Landmarks/headings:** `<main>` wraps the deck; each slide `<section aria-labelledby={heading-id}>`; single `h1` (Hero); `h2` per slide including new Telemetry + Closing headings; `footer` landmark preserved inside Closing slide.
- **No-JS:** React app requires JS, but the binding constraint honored throughout: no markup/CSS-authored hidden states; GSAP applies from-states at runtime inside `gsap.context()` with `revert()` cleanup (StrictMode-safe). SSR/crawler HTML and any pre-hydration flash always shows full content.

---

## 5. Responsive matrix

| Breakpoint | Mode | Changes |
|---|---|---|
| **375 (<768)** | Plain scroll (deck OFF) | No snap/dots/counter/hint. Grids collapse: Telemetry 2-col, Stack 1-col, Frontend 1-col (big card un-spans), Hardening I 1-col / II 1-col + stacked strip, Demo 1-col, Team 1-col, Closing cards stacked. Ticket `min-height:auto` (existing rule). |
| **768** | Deck ON | Snap+dots active (rail `right-3`, tooltips suppressed). Counter still hidden. Telemetry/Hardening II 2-col grids; Demo 2-col; Stack 2-col; Closing cards 3-col if ≥sm else stacked. Slides grow beyond svh gracefully (min-h contract). |
| **1024** | Deck ON | Counter appears (`left-6 bottom-5`). Telemetry/Hardening reach full column counts (4 / 5 / 4). Stack 3-col, Demo 4-col. Ops goes side-by-side `[1fr_1.1fr]`. |
| **1440+** | Deck ON | Container caps at 1280 centered (whitespace grows at edges — intentional presentation air). KPI values hit `xl:text-5xl`. Closing wordmark hits clamp ceiling. Background glows scale with viewport (fixed-size radials, no stretch artifacts). |
| **Any width, height <720** | Deck ON | Slides exceed svh; snap aligns tops; no clipping (min-h contract). Dots remain usable. |

Touch: swipe = native scroll momentum; snap-to-nearest via the same GSAP snap (works with trackpad/touch inertia; see Risks).

---

## 6. Visual polish passes

### Per-slide background treatment (avoid monotony; all bleed full-bleed behind content)
Implement as `data-bg` attribute on each slide + ~30 lines of CSS appended to `index.css` using existing tokens:

| Slide | Treatment |
|---|---|
| 01 Hero | clean `bg-0` (ticket is self-decorating) |
| 02 Telemetry | radial gold wash `radial-gradient(600px 400px at 18% 8%, rgba(251,191,36,.055), transparent 70%)` |
| 03 Architecture | `.substrate` grid (exists) |
| 04 Stack | solid `bg-0` |
| 05 Frontend | radial emerald wash bottom-right `rgba(52,211,153,.045)` |
| 06 Hardening I | solid `bg-0` |
| 07 Hardening II | solid + the emerald proof strip provides the accent band |
| 08 Ops | `.substrate` grid |
| 09 Deploy | solid `bg-0` |
| 10 Demo | radial gold wash bottom-center `rgba(251,191,36,.04)` |
| 11 Team | solid `bg-0` |
| 12 Closing | centered vignette `radial-gradient(900px 520px at 50% 42%, rgba(251,191,36,.06), transparent 65%)` + faint substrate |

Rule: max 2 treatments between adjacent slides differ (solid → glow → solid rhythm). Light mode: same gradients at half alpha via `html.light [data-bg=…]` overrides.

### Slide numbering
Unified via SlideHead (§0): gold index left, `NN / 12` dim right — mono, uppercase-context, `tracking-[0.14–0.22em]`. Replaces the old bare `num` prop rendering; tags retained verbatim (updated only where split demands: hardening gets `· 1 of 2` / `· 2 of 2`).

### Container discipline
`max-w-[1280px]` everywhere except: Hero ticket (1500), Closing inner stack (max-w-4xl), background treatments (full-bleed). No slide introduces a third width.

---

## 7. Task breakdown (ordered · file-level · verification)

> All GSAP work follows existing pattern: runtime-applied from-states inside `gsap.context()` + `ctx.revert()`. Nothing hidden in JSX/CSS.

**T1 — `src/lib/deck-config.ts` (new)**
Export `SLIDES: { index, id, label, hash }[]` (12 entries mapping ids/anchors incl. legacy `#architecture #stack #security #demo #team #ops #deploy` + new `#telemetry #frontend #hardening-ii #end`).
✅ Verify: `npm run build` passes; array length 12; ids unique.

**T2 — `src/hooks/useDeck.ts` (new)**
State machine: active index, `goto(i, opts)`, `next/prev`; media gate (`matchMedia("(min-width:768px)")` + `useIsReducedMotion`); keyboard handler per §3 table; hash sync via `history.replaceState` on activation (read `location.hash` on mount → jump); debounced live-region announcer; emits `deck:active` CustomEvent + exposes React context. Snap engine lives here: one global ScrollTrigger over the sections container, `snap: 1/(N-1)` mapped to section offsets, `duration: 0.4, ease: "power2.inOut"`, `snap: { delay: 0.1 }` tolerance for inertia.
✅ Verify: build passes; manual: ↑/↓/PageUp/PageDown/Home/End move exactly one/full range; Tab unaffected; palette open blocks keys; hash `#demo` on load lands slide 10.

**T3 — `src/components/deck/` chrome (new): `Deck.tsx`, `DotsRail.tsx`, `SlideCounter.tsx`, `ScrollHint.tsx`, `SlideHead.tsx`**
Specs per §0/§3. Deck wraps children in `<main>`-internal container, provides context, mounts chrome conditionally on gate.
✅ Verify: axe DevTools — no violations on chrome; dots ≥44px hit targets; focus ring visible via keyboard only; counter announces on change; hint disappears after first advance.

**T4 — `src/pages/Home.tsx` diff (minimal, wrap don't rewrite)**
Wrap sections in `<Deck>`; insert Telemetry slide (SlideHead + `<KpiBand variant="slide" …/>`) after Hero; split HARDENING map into `HARDENING.slice(0,5)` / `.slice(5)` sections per §2; convert footer block into Closing slide (markup preserved, restructured per §2, keeps `<footer>` element); swap SectionHead usages on slides 03–11 for SlideHead (props: num, tag, marker auto from context).
✅ Verify: build+lint clean; DOM order = logical order; anchors resolve; footer landmark intact.

**T5 — `src/components/sections/KpiBand.tsx` diff**
Add `variant?: "band" | "slide"`: slide variant = `lg:grid-cols-4` (2×4), value `text-4xl xl:text-5xl`, tile `py-6`; accept optional `active: boolean` to restart count-up on activation (bypass IO when provided).
✅ Verify: count-up replays per activation; RM renders final values instantly; light-mode contrast spot-check.

**T6 — `src/components/canvas/ArchCanvas.tsx` diff**
Accept `active?: boolean`; when provided: replace scrubbed pulse with activation timeline (§1); cap wrapper `h-[62vh] min-h-[420px]` (move height control to Home wrapper div, minimal internal change); kill timelines on inactive. Keep IO fallback when `active === undefined` (non-deck mode).
✅ Verify: draw+pulse fires once per entry; no scrub-jitter; node click/dialog unaffected; RM renders static final schematic.

**T7 — `src/components/sections/OpsConsole.tsx` diff**
Accept `active?: boolean`; activation replaces IO trigger (IO kept as fallback); pause on deactivate; instant-print under RM.
✅ Verify: typing starts only when slide 08 activates; replay works; no double-start (activation + IO race guarded).

**T8 — Retrigger entrances on other sections (StackGrid.tsx, Home bento/hardening/demo/deploy batch)**
Swap ScrollTrigger/batch triggers for deck activation events when in deck mode; keep existing triggers for plain-scroll mode. Apply §2 stagger orders (Team grid-stagger included).
✅ Verify: each slide's choreography matches §2 tables; ≤8 stagger targets per slide (Team via grid-stagger); no FOUC (from-states applied pre-paint via `gsap.set` in same tick as context creation).

**T9 — `src/index.css` additions**
`[data-bg=…]` treatment classes + light-mode overrides; scroll-hint bob keyframes; nothing else (dots/counter pure Tailwind).
✅ Verify: visual pass across all 12 slides both themes; no adjacent-slide monotony; gradient alphas per §6.

**T10 — `src/components/layout/Topbar.tsx` diff (smallest possible)**
In `handleNavClick`, when deck mode: dispatch `deck:goto` with target hash instead of native `scrollIntoView` (deck resolves offset + snaps). Palette anchors: same dispatch (CommandPalette emits through shared helper).
✅ Verify: Topbar/Palette jumps land slide-aligned, no snap-vs-anchor fight; browser back doesn't spam history entries.

**T11 — Production QA pass (no new files)**
Checklist: `npm run build` + `npm run lint`; Lighthouse mobile+desktop (LCP element = hero h1 text, no full-screen image regression; CLS 0 — fonts/layout settled before `ScrollTrigger.refresh()` on `document.fonts.ready` + window load + resize debounce 200ms); iOS Safari address-bar resize (svh units already used — confirm no snap misalignment after resize → `ScrollTrigger.refresh()`); keyboard-only walkthrough of all 12 slides + dialog + palette; screen-reader smoke (VoiceOver/NVDA): heading outline h1→h2×11, live announcements, dots labeled; RM emulation full pass; 375px full-page pass (plain scroll parity with current site); no-JS graceful check (disable JS → static content visible pre-hydration patterns respected); verify lenis untouched on Home (only Docs/Wiki use it — confirmed by grep; do NOT initialize on Home).
✅ Verify: all green before merge; record results in PR description.

---

## 8. Risks & UX mitigations (decision-level)

| Risk | Mitigation decided |
|---|---|
| Trackpad inertia overshoots multiple slides | Snap `delay: 0.1` + velocity check: ignore snap triggers while `ScrollTrigger` velocity > threshold; debounce 120ms queues to latest intent. |
| Anchor jump vs snap fight | Single source of truth: ALL programmatic navigation (topbar, palette, dots, hash) routes through `deck.goto`; native smooth-scroll disabled in deck mode (`scroll-behavior: auto` scoped to `html.deck-on`). |
| Focus steal mid-scroll | Rule in §4 — only keyboard-initiated nav moves focus, `preventScroll: true` always. |
| iOS resize breaks offsets | `svh` heights + refresh on `visualViewport` resize (debounced). |
| Animation fatigue on re-entry | ≤600ms entrances, instant reset, no exit animations, cap 8. |
| Contrast regression in light mode | §4 table + QA task T11; light-primary restricted to large/decorative. |
