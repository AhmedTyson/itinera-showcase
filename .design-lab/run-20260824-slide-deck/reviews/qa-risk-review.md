# QA / Production-Risk Review — 12-Slide Snap Deck Plans

Reviewer: QA Engineer (production-risk persona) · Run: 20260824-slide-deck · Date: 2026-08-24
Scope: `system-architect.md`, `ux-engineer.md`, `frontend-engineer.md` vs. real code on `main`.
Verification basis: every claim below was checked against the actual files, not the plans' self-reported "ground truth".

Code inspected: `src/pages/Home.tsx`, `src/components/canvas/ArchCanvas.tsx`, `src/components/sections/OpsConsole.tsx`, `src/components/sections/KpiBand.tsx`, `src/components/sections/StackGrid.tsx`, `src/components/sections/Hero.tsx`, `src/components/palette/command-palette.tsx`, `src/components/layout/Topbar.tsx`, `src/App.tsx`, `src/main.tsx`, `src/index.css`, `src/lib/gsap.ts`, `src/hooks/useIsReducedMotion.ts`, `src/hooks/useCountUp.ts`, `src/hooks/useScrollTo.ts`, `package.json`, `vite.config.ts`, `index.html`.

---

## 1. Plan-vs-code mismatches

### 1.1 Verified-accurate ground truth (credit where due)

| Plan claim | Code reality | Status |
|---|---|---|
| Palette `jump()` does `getElementById().scrollIntoView({smooth})` at lines 51–62 | `command-palette.tsx:51–62` — exact match | ✅ |
| ArchCanvas has scrubbed pulse (`scrub:0.5`) + 5 per-stop boxShadow scrub triggers | `ArchCanvas.tsx:98–129` — exact match (`scrub:0.5` line 104; `scrub:true` stops lines 113–126) | ✅ |
| ArchCanvas draw-in `once:true` at `top 75%` is snap-compatible | `ArchCanvas.tsx:92` — confirmed | ✅ |
| `html { scroll-behavior: smooth }` at `index.css:90` | Confirmed, line 90 | ✅ |
| Home batch reveal at `Home.tsx:103–113` | Exact match | ✅ |
| StackGrid `once:true` at `top 80%` (line 70) | Exact match | ✅ |
| Topbar anchors: `scrollIntoView` + `replaceState`, IO tracking with `rootMargin "-80px 0px -70% 0px"` | `Topbar.tsx:55–88` — confirmed | ✅ |
| Footer inline at `Home.tsx:391–418` | Exact match | ✅ |
| StrictMode ON in `main.tsx` | Confirmed | ✅ |
| App routes `/`, `/docs`, `/wiki`, `/wiki/:guideId`, `*`; palette entries only injected on `/wiki*` | `App.tsx:24–32`, `App.tsx:14–17` — confirmed | ✅ |
| Lenis in deps, never instantiated (only `window.__lenis` duck-type in `useScrollTo.ts`) | Confirmed | ✅ |
| KpiBand: 8 tiles, `grid-cols-2 sm:4 lg:8`, `text-2xl`, `dl` semantics, count-up, per-tile `aria-live` on completion | Confirmed (`KpiBand.tsx:30–36`) | ✅ |
| Hero owns its own mount timeline, single h1, section has **no id** | Confirmed (`Hero.tsx:31–46`, `Hero.tsx:51`) | ✅ |

The plans did their homework on line numbers. The mismatches are about **behavior and gaps**, not line numbers.

### 1.2 MISMATCH — CSS `scroll-behavior: smooth` is neutralized by only ONE of three plans

- **Reality:** `index.css:90` sets smooth scrolling globally. Critically, this does not only affect `scrollIntoView` — it also applies to direct `scrollTop` assignment via the CSSOM default behavior. GSAP ScrollToPlugin and ScrollTrigger's internal snap tween both drive `scrollTop` frame-by-frame; with `scroll-behavior: smooth` live, every intermediate write gets browser-eased toward it → rubber-band jank and missed snap points.
- **frontend-engineer** catches it and specifies `html[data-deck]{scroll-behavior:auto}` + a `dataset.deck` attribute toggle. Correct fix.
- **system-architect** never mentions `scroll-behavior` anywhere. Its snap/jump design will double-smooth in production.
- **ux-engineer** mentions `scroll-behavior: auto` scoped to `html.deck-on` in §8 risks, but never assigns an owner task for adding the attribute or the CSS rule — T9 (index.css additions) explicitly says "nothing else" beyond backgrounds/keyframes.

**Fix:** adopt frontend-engineer's `data-deck` attribute mechanism verbatim into the merged plan; add it to architect task 4 and UX task T2/T9.

### 1.3 MISMATCH — Hero CTA "Explore Architecture" (`href="#architecture"`) is intercepted by NOBODY

- **Reality:** `Home.tsx:123` passes `{ label: "Explore Architecture", href: "#architecture", variant: "gold" }` into `<Hero>`. `Hero.tsx:101–106` renders these as plain `<a>` elements with no click handler. A native click performs a hard fragment navigation: URL hash set, browser scrolls (smoothly, because of `index.css:90`) to the target.
- All three plans intercept exactly three jump sources: Topbar links, palette `jump()`, closing/footer link. None touches Hero CTAs.
- In deck mode this produces: native smooth scroll + deck `goTo` tween (via the new `hashchange` listener) + snap trigger, all at once. This is the highest-traffic CTA on the page ("Explore Architecture" sits above the fold).

**Fix:** route Hero internal-hash CTAs through the same `requestJump`/`deck:goto` path (one `onClick` in `Hero.tsx` or a delegated listener on `[href^="#"]` inside the deck container). Add to test checklist item: "click Hero CTA from slide 01 — must land aligned, single animation".

### 1.4 MISMATCH — OpsConsole conversion: system-architect omits what the other two require

- **system-architect** modified-files table does **not** include `OpsConsole.tsx`; slide table says "#ops … OpsConsole untouched". Its activation model therefore leaves the IO `threshold:0.3` start (`OpsConsole.tsx:14–28`) live under deck mode.
- **ux-engineer** (§2 slide 08, T7) and **frontend-engineer** (§5.5, task 9) both convert typing start to deck activation with IO kept only as fallback.

Under the architect's version, deep-linking or dot-jumping past ops can fire typing while the console is half-visible during flight, and there is no pause-on-deactivate. Cross-plan contradiction must be resolved before implementation — pick one owner decision (recommendation: convert to activation-gated like UX/frontend specify).

### 1.5 MISMATCH — Replay policy is specified three different ways

| Behavior | architect | ux-engineer | frontend-engineer |
|---|---|---|---|
| Slide entrances | Play once, never replay (`playedRef`) | **Replay every activation**, instant reset on leave | Play once (`playedRef`) |
| KPI count-up | "idempotent, no conflict" (runs once via its own IO) | **Restarts per activation** (`active` prop bypasses IO) | Unspecified |
| ArchCanvas pulse | Play once, idempotent once-flag; checklist asserts "replays only on remount" | Restarts every activation | Restarts every activation |
| OpsConsole typing | Untouched (IO once) | Pause on deactivate, restart line on reactivate | Starts once, replay button only |

These are mutually exclusive runtime behaviors. An implementer merging all three docs produces whichever they read last. Additionally: count-up restart-per-activation (UX) conflicts with `useCountUp`'s current implementation (`useCountUp.ts:21–41`) — its IO disconnects after first fire and has no external reset path, so UX's "bypass IO when `active` provided" requires modifying the hook, which none of the plans lists as a modified file.

**Fix:** one replay matrix, one owner. Cheapest safe v1: entrances play once (architect/frontend), pulse replays per activation (UX/frontend), count-up runs once, typing starts once with manual replay.

### 1.6 MISMATCH — Slide 07 and slide 12 IDs differ across plans

| Slide | architect | frontend | ux |
|---|---|---|---|
| Hardening II id | `security-more` | `hardening` | `hardening-ii` |
| Closing id | `closing` | `closing` | `end` |

Deep links, dots, palette entries, and hash sync all key off these ids. Whatever is chosen becomes bookmarkable public URLs on a deployed site — changing them later breaks links. Also note UX keeps the *anchor* `#security` on slide 06 while giving slide 07 a separate id; Topbar "Security" must keep resolving to slide 06 in all versions.

**Fix:** freeze the manifest in `deck-config.ts` as the single source before any component work starts.

### 1.7 MISMATCH — Keyboard Space handling contradicts, and frontend's binding breaks focused buttons

- architect: "Space NOT intercepted".
- ux-engineer: "Space not bound".
- frontend-engineer §3.8: `Space→next` with preventDefault, guarded only against input/textarea/contenteditable/dialog.

Concrete bug in the frontend version: after Tab-reaching a dot (or any button — theme switch, replay, arch nodes), pressing Space fires the global handler first: `preventDefault()` kills the native button activation AND advances the slide. Two actions race, one is lost.

**Fix:** drop Space from bindings (majority position), or additionally exclude `button, a, [role="button"]` targets.

### 1.8 MISMATCH — Architect keyboard guard lacks input-target check

Architect skips keys only when a `[role="dialog"]` exists. Frontend checks event targets (`input, textarea, select, [contenteditable]`). Today Home has no free-standing inputs, but this guard costs nothing and prevents future regressions (e.g., any inline field added later). Take the frontend guard.

### 1.9 MISMATCH — Palette on Home still lists dead docs entries

Verified reality: `GlobalPalette` returns `entries=[]` except on `/wiki*` (`App.tsx:14–17`), so on `/` the index is `BASE_INDEX` = all docs `ARTICLE_HEADINGS` + 22 `ENDPOINTS` (`command-palette.tsx:13–16`). Clicking any of those on Home today is a silent no-op (`getElementById` → null). Both plans prepend `DECK_PALETTE_ENTRIES` on `/` but neither filters `BASE_INDEX`, so post-change the user fuzzy-searching "login" gets `POST /api/login · Endpoint` mixed with slides — selecting it still does nothing. Worse than today because now there *are* working entries next to dead ones.

Also: `Route path="*"` renders `Home` (`App.tsx:30`). The architect's injection condition `pathname === "/"` misses wildcard-rendered Home (e.g. `/foobar`): deck chrome active, palette slide entries absent. Use "deck mounted" as the signal (frontend's registry approach handles this naturally).

**Fix:** on Home, either hide `BASE_INDEX` groups or visually mark them as docs-route entries; gate entry injection on deck-mounted state, not pathname string equality.

### 1.10 MISMATCH — Back/forward story is internally inconsistent in frontend plan

Frontend uses `replaceState` exclusively (correct — matches architect's rationale), yet §4.4 promises "Back/forward → `hashchange` → animated jump" and task 6 verifies back/forward works. With no `pushState` between hashes there are no inter-hash history entries; `hashchange` can only fire from manual address-bar edits. If an implementer "fixes" this by switching to `pushState` to make the test pass, every slide transition pollutes history — the exact failure the architect called out. Resolve the contradiction on paper: replaceState-only, `hashchange` handled for manual edits, browser Back = leave site.

### 1.11 Minor measurement fragility

Frontend measures offsets with `el.offsetTop`. Safe today (no transformed ancestors planned), but silently breaks if anyone ever puts a transform/filter on a wrapper (offsetParent re-basing). Architect's `getBoundingClientRect().top + scrollY` is robust; use that everywhere.

### 1.12 svh vs dvh divergence

UX shells use `min-h-[100svh]`; architect/frontend use `min-h-[100dvh]`/`md:min-h-dvh`. Both work with measured offsets, but pick one (dvh recommended — svh wastes up to the collapsed-bar height and creates permanent bottom gap when the bar is hidden) and stop mixing units across specs.

---

## 2. Production risk register

Severity: 🔴 blocks deploy / 🟠 ship-stopper if untested / 🟡 quality debt, fix fast.

| # | Risk | Severity | Scenario & analysis | Required mitigation |
|---|---|---|---|---|
| R1 | iOS Safari address-bar resize vs stale snap offsets | 🟠 | Bar collapse changes `innerHeight` ~60–120px. Architect ignores refreshes <120px delta → offsets stay stale by up to a bar-height → snap lands visibly off-top (head under sticky topbar or dead gap). Frontend debounces but always refreshes → repeated full `ScrollTrigger.refresh()` during bar animation = layout thrash mid-scroll. Neither plan survives contact with a real iPhone without tuning. | Re-measure offsets cheaply on `visualViewport` resize (no full refresh); full refresh only on orientation change / width change. Manual device test mandatory (see §3). |
| R2 | Trackpad inertia vs snap constants | 🟠 | Three different tunings shipped in the plans: `delay` 0.12 (architect) / 0.05 (frontend) / 0.1 (UX); duration min 0.15 vs 0.2. On Windows precision touchpads and macOS Magic Mouse, 0.05 lets snap yank mid-flick (backward pull feel); 0.12 can feel laggy on quick successive flicks. Constants must be centralized (all plans agree on this) and tuned once, not three times. | Single `deck-config.ts`; tune on real hardware Chrome+Firefox+Edge+macOS Safari. |
| R3 | Ctrl-K palette jump fired mid-snap-tween | 🟠 | User flicks, snap tween starts, opens palette, picks slide. Frontend: `killTweensOf(window)` also kills ScrollTrigger's own internal snap tween — known GSAP edge where externally killing the snap tween can strand the trigger believing a tween is pending. Architect: `suppressSnap` flag cleared on complete/onInterrupt — if the killed tween was the *snap's*, whose onComplete clears the flag? Potential stranded-suppressor → snapping permanently off until next programmatic jump. | Explicit verification test: interrupt snap with palette jump ×20 rapid, then wheel — snap must re-engage. Fallback: cycle `snapST.disable()/enable()` around any external kill instead of relying on tween callbacks. |
| R4 | Deep link cold load (`/#demo`) lands wrong after late layout shifts | 🟠 | Initial jump uses offsets measured pre-font-load; Google Fonts stylesheet is render-blocking but font swap + devicon SVGs from jsDelivr CDN arrive later and shift section tops. `fonts.ready` refresh recomputes offsets but nothing re-aligns the viewport to the intended slide → user parked between slides with wrong active index. Both plans share this hole. | Keep `pendingHashTarget` until first user input; after each refresh within first ~2s, re-scroll to the target slide top instantly. |
| R5 | Browser Back semantics with replaceState-only | 🟡 | Deliberate tradeoff (documented by architect): Back exits the site rather than returning one slide. Acceptable, but combined with R4's hash handling and frontend's contradictory hashchange promise (§1.10), an implementer may introduce pushState → history spam (one entry per slide). Lock the decision in the merged spec. | Decision record + test "Back from any slide leaves site; no history growth while scrolling". |
| R6 | ScrollTrigger.refresh loop via ResizeObserver | 🟡 | Frontend RO sums `entries[].target.scrollHeight` as drift signal — sum-of-scrollHeights is a weak proxy (inner scroll containers mask outer changes and vice versa). Guard (<2px + 120ms debounce) probably prevents runaway, but multiple refresh sources exist (RO + resize + fonts + load + ST refresh listener). Convergence is asserted nowhere. | Observe border-box of the deck container only; dev-mode counter asserting refresh count bounded (<8 in first 3s, flatline after); remove source if it fires twice for one cause. |
| R7 | Light-mode contrast failures in NEW chrome | 🟠 | Verified token math against `index.css`: (a) Counter "current" number uses `text-primary` → light-mode `#d97706` on `#f4f6fb` ≈ **3.9:1** at 11px bold — fails AA 4.5:1 for text. (b) Idle dots use `bg-border-strong` → light `#c2cbe0` ≈ **1.6:1** against white — fails non-text 3:1 minimum. (c) UX proof strip `emerald-300` text on emerald-tint over near-white bg ≈ **<2:1** in light mode; UX claimed ">7:1 ✓" computing dark values only, and §6 provides gradient overrides but no proof-strip override. (d) Pre-existing: `.hard-card` hardcoded `text-emerald-400` (~2.2:1 on white) gets promoted into two dense slides. | Light-mode tokens for counter/dots/proof-strip (`--color-light-accent` `#059669` for strip text, `border-strong`→darker idle dot, counter in `text-text`); axe scan both themes is a release gate. |
| R8 | Print stylesheet — none exists; entrance from-states blank pages | 🟠 | No `@media print` anywhere (grep verified). Both architect and frontend build paused timelines whose `from()`/`fromTo()` apply hidden from-states **at creation time** (GSAP `immediateRender` default true even when paused). Consequence on a deployed site: open page, scroll halfway, Cmd+P → every not-yet-activated slide prints invisible (opacity:0). Frontend's design hides ALL below-fold content from mount. | Either `immediateRender:false` + apply states on activation, or global `beforeprint` handler `gsap.set(targets,{clearProps:"opacity,visibility,transform"})`. Verify print preview Chrome/Firefox/PDF export. |
| R9 | No-JS / crawler visibility of slide content | 🟡 | SPA: empty `#root` without JS — unchanged by deck (plans honest about this). New risk: JS-executing crawlers (Google) render without scrolling; content in unactivated slides sits at opacity 0/translated at render time (R8 mechanics). Text remains in DOM but effectively-hidden content ranks poorly. Conference showcase lives or dies on searchability of security/deploy claims. | Prefer activation-time hiding (never creation-time); consider `@media (scripting: none)`-style safety or rendering final states for bot UAs. At minimum verify rendered-DOM screenshot in Search Console URL inspection post-deploy. |
| R10 | LCP regression | 🟢 | Hero untouched, LCP element = hero h1 text/ticket, no images added, chrome is fixed-position (out of flow). Deep-link jump runs in layout effect pre-paint → no CLS contribution. Fonts already `display=swap` (pre-existing CLS on swap, unchanged). Low risk — keep Lighthouse gate from UX T11. | Lighthouse mobile/desktop before+after; LCP delta <200ms budget. |
| R11 | Vite chunk size with ScrollToPlugin | 🟢 | `vite.config.ts` has no manualChunks and App.tsx statically imports all routes → everything already ships as one graph; Wiki's mermaid/react-markdown dominate. Adding ScrollToPlugin (+~3KB gzip) and ~8 small components is noise. Plans' "delta ≈ 0" claim is essentially right. Only flag: don't let anyone "helpfully" lazy-load the deck engine (breaks offset measurement timing). | Compare `dist/assets/*.js` sizes pre/post; assert main chunk delta <15KB gzip. |
| R12 | Scrollbar-drag fight | 🟡 | Classic snap failure mode absent from every plan: user drags the scrollbar continuously; snap fires at each release-point candidate and yanks the thumb. Desktop-only (deck gate ≥768 includes desktops with visible scrollbars). | Manual test: slow scrollbar drag across all 12 slides; if yanking observed, suspend snap while pointerdown on scrollbar region or accept + document. |
| R13 | Focus management gap in architect/frontend (SR/keyboard users) | 🟠 | UX specifies heading focus (`tabIndex={-1}`, `preventScroll`) after keyboard nav + polite live region; architect makes counter `aria-hidden` with no live region and moves no focus → arrow-key navigation is completely silent for screen reader users. This is an a11y regression vs. the care given elsewhere. | Adopt UX §3/§4 focus + live-region contract wholesale. |
| R14 | Three competing deck architectures handed to implementers | 🟠 | architect: `useDeckScroll` + `DeckContext` + window CustomEvents. frontend: `Deck.tsx` + `deckBus` singleton + `slide-context`. UX: `useDeck.ts` hook + `deck:active` CustomEvent. Different file trees, different event names, different prop seams (`variant:"deck"` vs `"slide"`, `data-enter` vs `data-reveal`). Without a merge pass this becomes three half-implementations fighting over `gsap.context` ownership. | Before task 1: pick ONE file map, ONE event bus name, ONE marker attribute (`data-reveal` recommended — more files reference it), ONE config module. Strike the other two plans' scaffolds. |
| R15 | InspectorDialog + Radix scroll-lock vs snap | 🟡 | react-remove-scroll locks body while dialog open → snap idle (no scroll events). Residual risk: dialog close restores scroll position asynchronously; activation triggers may briefly disagree with activeIndex. Low likelihood, cheap to test. | Open inspector from architecture slide, close, verify no snap jump and correct active dot. |

---

## 3. Missing test checklist items

The plans' QA sections (architect §6 16-item script, frontend §10 acceptance list, UX T11) cover basics well. Gaps that MUST be added before a production deploy:

**Devices / environments**
1. Real iPhone Safari (not simulator, not DevTools): scroll through all 12 slides, collapse/expand address bar mid-slide, rotate portrait↔landscape mid-snap → landing alignment ±0px tolerance at top of each slide.
2. Real Android Chrome (momentum characteristics differ from iOS).
3. iPad Safari at exactly 768px width — the deck gate boundary ON REAL HARDWARE (split-view resizing crosses the boundary live).
4. Windows laptop with precision touchpad (Edge + Chrome + Firefox): two-finger flick inertia settles nearest slide, no backward yank, no oscillation at boundaries.
5. macOS Safari + Magic Mouse: inertial flick across 3+ slides — no multi-slide overshoot.
6. Firefox desktop: smooth-scroll implementation differs; verify snap tween doesn't stutter and wheel normalization behaves.
7. OS text scaling 125%/150% (Windows display scaling) — remeasure offsets, no clipped slide heads under sticky topbar.
8. Browser zoom 80% / 110% / 125% — snap offsets recompute correctly (zoom ≠ resize in some engines' event paths).
9. Print: Cmd/Ctrl+P after partial scroll → ALL slide content visible in preview and PDF (guards R8).
10. Slow-3G throttled cold load: fonts/images arrive late → deep-linked slide still lands correctly after settle (guards R4).

**Interactions**
11. Hero CTA "Explore Architecture" click from slide 01 → single smooth motion, lands aligned, URL `#architecture` (guards §1.3 — currently uncovered by ALL plans).
12. Rapid Ctrl-K → select slide → immediately wheel-grab mid-flight ×20 → snap re-engages afterwards, suppressor flag not stranded (guards R3).
13. Scrollbar drag end-to-end slowly then release at random points (guards R12).
14. Open InspectorDialog from architecture slide → close → background scroll position intact, active dot correct, snap resumes (R15).
15. Command palette on Home: search "login" → observe dead endpoint entries vs live slide entries; select each type; confirm no console errors (guards §1.9).
16. Theme switch mid-snap-tween and mid-entrance → no stuck transforms; contrast of new chrome spot-checked in light mode with a contrast tool, not by eye (R7).
17. Toggle OS reduced-motion LIVE while scrolled to slide 7 → clean teardown to plain scroll, zero orphaned transforms, content all visible; toggle back → deck rebuilds, no duplicate triggers (`ScrollTrigger.getAll().length` stable).
18. Resize window across 768px repeatedly → same teardown/rebuild assertion; memory stable over 5 min (devtools heap snapshot before/after ×10 crossings).
19. Manual address-bar hash edit `/#team` while on slide 2 → animated jump; then Back → leaves site (single history entry consumed), forward returns (R5).
20. Mash Home/End/PageUp/PageDown rapidly ×30 → ends on a valid slide boundary, no tween pile-up, counter matches dots.
21. Keyboard-only full walkthrough (no mouse): Tab reaches dots, arrows navigate, focus ring visible on h2 after arrival (UX focus rule), Enter activates arch node + palette items — Space on focused dot does NOT advance slide (guards §1.7).
22. Screen reader smoke: VoiceOver (iOS Safari) + NVDA (Firefox): slide change announced via live region; heading outline h1 → 11×h2 sequential; dots labeled meaningfully (R13).
23. axe DevTools scan, both themes, deck mode AND fallback mode — zero critical violations (catches R7 systematically).
24. Dev-mode assertion run once: refresh-event counter bounded (<8 in first 3s, 0 steady-state); `ScrollTrigger.getAll().length` identical after StrictMode double-mount and after 60s of interaction (R6, leak check).
25. Post-deploy (staging URL): Search Console URL inspection rendered screenshot → below-fold slide text present and visible in rendered DOM (R9).

---

## 4. Verdict per plan

### `system-architect.md` — NEEDS FIXES
Strongest engineering doc (event routing, conflict mitigations, iOS height-delta reasoning), but:
1. Missing `scroll-behavior: smooth` neutralization entirely — snap/jump tweens will double-smooth (§1.2). Blocking.
2. Hero CTA anchor jump not intercepted — tug-of-war on the primary above-fold CTA (§1.3). Blocking.
3. Omits OpsConsole conversion the other plans require; unresolved cross-plan contradiction (§1.4).
4. Replay policy contradicts UX plan; its own pulse checklist ("replays only on remount") contradicts both other docs (§1.5).
5. Id choices (`security-more`, `closing`) conflict with other plans — freeze manifest first (§1.6).
6. No screen-reader announcement/focus management despite `aria-hidden` counter (R13).
7. iOS <120px-ignore strategy guarantees stale offsets by up to a bar height; needs the cheap-remeasure alternative (R1).
8. Palette injection keyed on `pathname === "/"` misses wildcard-rendered Home; BASE_INDEX noise unaddressed (§1.9).

### `ux-engineer.md` — NEEDS FIXES
Best accessibility thinking on the team (focus rules, live region, tablist rationale); contrast section contains a wrong claim and misses new-chrome failures:
1. Light-mode AA failures in its own new components: counter `text-primary` 3.9:1, idle dots 1.6:1, proof strip <2:1 (claimed >7:1 using dark-theme math) (R7). Blocking for launch in light mode.
2. Replay-every-activation policy conflicts with both other plans and demands `useCountUp` changes not listed in any modified-file inventory (§1.5).
3. `svh` vs others' `dvh` — unify (§1.12).
4. Id choices (`hardening-ii`, `end`) conflict (§1.6).
5. `scroll-behavior` fix mentioned in risk table but assigned to no task; T9 explicitly excludes CSS beyond backgrounds (§1.2).
6. No-JS guarantee overstated ("SSR/crawler HTML ... shows full content") — this is a client-rendered SPA; restated honestly needed (R9).
7. Space reserved (correct) — but must be reconciled with frontend's binding (§1.7).

### `frontend-engineer.md` — NEEDS FIXES
Most implementation-ready (exact diffs, real GSAP knowledge, caught the CSS smooth-scroll trap), but carries the two most dangerous runtime defects:
1. `fromTo` paused-at-creation applies hidden from-states to EVERY unactivated slide from mount → blank printed pages, effectively-hidden crawler content, stranded-hidden content if any later error interrupts playback (R8/R9). Blocking — switch to activation-time state application or add `beforeprint`/error safety.
2. Space bound to next() with only input/dialog guards → steals Space from every focused button incl. its own dots (§1.7). Blocking.
3. Back/forward promise contradicts its own replaceState decision — resolve before someone "fixes" it with pushState (§1.10).
4. `offsetTop` measurement fragile vs transform-ancestors; prefer rect-based (§1.11).
5. RO signal = sum of scrollHeights — weak drift proxy; observe container border-box (R6).
6. Id choices conflict; delay constants (0.05) differ from other plans; BASE_INDEX noise unaddressed (§1.6, R2, §1.9).
7. No SR announcement/live region of its own — defer to UX contract (R13).

### Merge prerequisite (applies to all three)
Three incompatible file maps/event buses/attribute names cannot be implemented in parallel (R14). Before task 1 of any plan: publish one canonical manifest (slide ids!), one bus, one marker attribute, one constants module, one replay matrix, one refresh orchestrator. Until that merge document exists, none of the three is "ready as written".

---

## Appendix A — severity summary

| Count | Items |
|---|---|
| 🔴 blocking-as-written | R8 (print/hidden-content via fromTo-at-creation), §1.2 (CSS smooth), §1.3 (Hero CTA), §1.7 (Space steal), R14 (triple architecture) |
| 🟠 must-test-before-deploy | R1 (iOS offsets), R2 (inertia tuning), R3 (snap-supervisor stranding), R4 (deep-link drift), R7 (light-mode contrast), R13 (SR silence), R15 (dialog lock) |
| 🟡 quality debt | R5 (back semantics), R6 (refresh convergence), R9 (crawler visibility), R10–R12, §1.9–§1.12 |
