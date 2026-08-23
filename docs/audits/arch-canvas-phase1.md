# Section C — Architecture Canvas + ER Map — Phase 1 Audit (Analyze + Evaluate)

**Date:** 2026-08-23 · **Scope:** `showcase/index.html` L142-196 (System Design) + L515-580 (Data Architecture) + `assets/js/features/{modal,scenes}.js` S3 · Legacy vanilla + new React `itinera-showcase-react` placeholder  
**Baseline:** Sec B Hero+KPI done (Topbar, Hero, KpiBand live)

## 1) Inventory — two canvases, one pattern

### Architecture Canvas — `01 System Design` — 12 nodes + 8 svc-lines + 6 layer cards
* **Canvas:** `#archCanvas` (relative, `height: 420px` desktop → stacks `auto` <760px via `@media`). 12 `.node` absolutely positioned via `left/top %` + `data-x/y` JS fallback + inline `left/top` duplicate for no-JS (P0 fix).
* **Nodes:** 12 `div.node[role=button][tabindex=0][aria-label][data-arch]` — 3 rows (top: Client→API→Auth→Controllers→Services, mid: Pay/AI→Repos→Models, bottom: External→Queue→DB→Obs) + 8 `.svc-line` divs (absolute `left/top/width/height` gold rules, `aria-hidden`).
* **Layer cards below:** 6 `.layer-card` (Domain, Actions, Repos, HTTP, Integrations, Testing) — static, no canvas.
* **Inspector:** click/Enter on any `.node` → `openModal(title, html)` from `ARCH` const (12 entries, ~40 lines each, `html:` strings with `<code>`/`<ul>`). Modal has focus trap + restore (P0), backdrop blur.
* **Motion S3:** when `motionLibs()` + `!isRM()`, `initMotion` fallback skipped, `initScenes` takes over: `gsap.set(nodes,{opacity:0,y:18,scale:.92})` → scrub timeline `stagger .055` tied to `scrollTrigger: #archCanvas` (pin? no, just draw-on). `forceIn` adds `.in` to parent `.reveal` immediately so pin math stable.

### ER Canvas — `08 Data Architecture` — 12 entities + ledger table
* **Canvas:** `#erCanvas` — 12 `.ent[role=button][tabindex=0][data-entity]` — 3 rows (top: users/trips/itinerary_items/orders+payments, mid: destinations/hotels, bottom: restaurants/attractions + maybe regions?) with `left/top %` + `data-x/y` + inline fallback. Same modal pattern via `ENT` const (12 entries, columns + relations, e.g. `users: email UQ, google_id`).
* **Ledger table below:** `table.ledger` (10-row security findings + ER relations) — already has `tbody tr:hover` gold tint.

**Section sources:** `index.html` L157-184 + L521-580 · `assets/js/data/arch.js` (ARCH/ENT) · `assets/js/features/modal.js` · `assets/js/features/scenes.js` S3

## 2) Bugs — reproduced file:// + ?motion=force

| # | Sev | Repro | Cause | Impact |
|---|---|---|---|---|
| **C1** | 🟡 Med | Arch lines are `div.svc-line` with fixed `left/top/width` px — on 820px they misalign because nodes reflow via `left%` but lines keep desktop px | Lines positioned via absolute px, not SVG `line` or `%`-relative; no resize observer | Visual break at 820–1100, not a11y break but Awwwards polish fail |
| **C2** | 🟡 Med | ER `ent` at `left:2%;top:72%` overlaps `left:2%;top:52%` on 360px (both `2%` x) — stacking via media query sets `position:static` so they become a vertical list, but `svc-line` divs remain `absolute` and float over text | Lines not hidden in mobile `position:static` fallback (P0 added `position:static` for nodes/ents but not for `.svc-line`) | Mobile visual noise |
| **C3** | 🟢 Low | 12 nodes + 12 ents = 24 `role=button` in tab order — keyboard user tabs 24 times to pass the section | No roving tabindex or skip-link for canvas | A11y fatigue, not failure (all reachable, but noisy) |
| **C4** | 🟢 Low | Modal `ENT` html strings contain `<code>` without `tabular-nums` and long `<ul>` without list semantics for screen readers (just visual) | `ENT` html is string-templated, not component | Minor AT verbosity |
| **C5** | 🟢 Low | React `Home.tsx` placeholder has no canvases — parity gap vs legacy (user sees downgrade switching apps) | Sec C not yet migrated | Migration debt, not legacy bug |
| **C6** | 🟢 Low | `svc-line` divs are `aria-hidden` ✓ but have no `role="presentation"` — some ATs still announce empty divs in some browsers | Minor | Add `role="presentation"` |

## 3) Accessibility audit

| Check | Result |
|---|---|
| Nodes/ents keyboard | ✅ `tabindex=0` + `Enter`/`Space` activation + `aria-label="Inspect component X"` |
| Focus trap on inspector | ✅ modal trap + restore (reuse of `openModal` pattern) |
| Focus visibility | ✅ gold ring `2px solid var(--primary)` |
| `aria-current` on active node | ❌ no — selection is modal, not nav, so not needed; but `aria-selected` could help |
| Screen reader for lines | ✅ `aria-hidden` on `.svc-line` (should add `role="presentation"` for C6) |
| Reduced-motion | ✅ S3 gated `isRM()` + `?motion=force`; RM → nodes visible static, no scrub |
| No-JS fallback | ✅ inline `left/top` duplicate + `html.js` gating for `.reveal` + nodes `position:static` at <760px (but lines not hidden — C2) |
| Color contrast node `small` on obsidian | ✅ `--dim #93a0bf` 7.69:1 |
| Roving tabindex | ❌ 24 tab stops — recommend `roving` or `aria-label="Architecture diagram, 12 nodes"` + skip link |

## 4) 2026 community standards — gap vs. target

**Interactive architecture diagrams 2026** (grounded search this phase): **XyFlow (React Flow)** is the standard for interactive graphs — every node is a React component, `React.memo` for perf, `Dagre`/`ELKjs` for stable top-to-bottom layout, `Zustand` for state, fully keyboard operable (`Tab`/`Enter`/arrows) with `aria-label`/`aria-roledescription`/`role="group"` and `aria-live` for dynamic updates. For **simple static diagrams** (<20 nodes, no pan/zoom), **SVG** with `<line>` edges is lighter and sufficient.

| Current | 2026 target | Gap |
|---|---|---|
| 12 `div` nodes + 8 `div` lines, absolute `%` | **SVG `<line>` edges** (or XyFlow if pan/zoom needed) — lines scale with nodes, no px misalignment (fixes C1/C2) | 🔴 Visual fidelity |
| No roving tabindex (24 stops) | `role="group" aria-label="System design — 12 components"` + roving `tabIndex={isActive?0:-1}` + arrow-key roving | 🟡 A11y polish |
| Modal HTML strings in `ARCH`/`ENT` consts | **Inspector as React component** `<ArchInspector arch={key}>` with `dl` semantics, `tabular-nums` on columns | 🟡 Maintainability |
| `data-x/y` + inline `left/top` duplicate for no-JS | Keep P0 fallback, but generate positions from a **layout config** (array of `{id,x,y}`) — single source, no duplicate inline | 🟢 DRY |
| No `role="presentation"` on lines | Add + hide lines on mobile via `hidden md:block` | 🟢 Easy |

**Decision for Itinera:** 12+12 nodes is **below XyFlow's sweet spot** (needs pan/zoom for 50+ nodes). **SVG edges + Tailwind grid fallback** is lighter, keeps file:// safe, and fixes C1/C2 without adding 45KB XyFlow bundle. Reserve XyFlow for a future "interactive infra map" if you add 30+ services.

## 5) Recommendations — ranked

### P0 — fixes for Sec C parity + a11y

* **R1 — Promote canvases to React components** `src/components/canvas/ArchCanvas.tsx` + `src/components/canvas/ErCanvas.tsx` — each renders nodes from a typed `ARCH_NODES: {id,label,sub, x,y, tone, archKey}[]` array (12) and `ER_NODES` (12). Edges are `<svg class="absolute inset-0 -z-10 hidden md:block" aria-hidden>` with `<line>` (percent `x1/y1/x2/y2` derived from node centers). Mobile: `md:hidden` lines + nodes `position:static` grid. *S.*
* **R2 — Inspector as component** `src/components/canvas/InspectorDialog.tsx` (Radix `Dialog` — reuse Sheet's focus trap) — takes `archKey`/`entityKey`, renders `dl` with `ARCH`/`ENT` data via props, not `html:` strings. Fixes C4. *S.*
* **R3 — Roving tabindex + group label:** canvas `role="group" aria-label="System design — 12 components, use arrow keys"`; nodes `tabIndex={active?0:-1}` + `onKeyDown` ArrowLeft/Right + Home/End roving; `aria-selected` on active. Fixes C3. *S.*
* **R4 — Line a11y + mobile:** `role="presentation"` + `hidden md:block` on SVG; P0 `position:static` fallback already covers nodes, now also covers lines. Fixes C1/C2/C6. *XS.*

### P1 — motion fidelity (keeps S3 bar)

* **R5 — Keep S3 scrub but via SVG:** `gsap.set(lines,{scaleX:0})` + `scaleX:1` scrub on `scrollTrigger: #archCanvas` for edges; nodes `y:18→0` stagger as before. `anticipatePin:1` + `pinSpacing:true` if you later pin the canvas (currently draw-on without pin, so no change needed). *S.*

### P2 — backlog

* **R6 — Layout config as JSON:** `src/lib/arch-layout.ts` exports `ARCH_LAYOUT` — single source for `x/y`, no `data-x/y` duplication.
* **R7 — XyFlow spike later** if you add 30+ infra nodes or want pan/zoom — not for Sec C's 12.

## 6) Metrics before (baseline file:// audit)

| Metric | Current |
|---|---|
| Arch nodes | 12 + 8 lines → 12 div nodes, 8 div lines |
| ER entities | 12 |
| Inspector entries | 12 ARCH + 12 ENT (24) |
| Tab stops to pass canvases | 24 |
| Mobile lines hidden | 0/8 (bug C2) |
| Motion triggers (S3) | 2 canvases × 1 scrub each |

## 7) References

* Files: `index.html` L157-196 + L521-580; `assets/js/data/arch.js` (ARCH/ENT); `assets/js/features/scenes.js` S3; `assets/js/features/modal.js`.
* 2026 grounded: XyFlow (React Flow) for interactive graphs — `React.memo`, Dagre/ELK, Zustand, keyboard `Tab`/`Enter`/arrows + `aria-label`/`aria-roledescription`/`role="group"`, axe-tested; vs SVG for simple static (<20 nodes) — decision matrix.
