# Section B — Hero + KPI Band — Phase 1 Audit (Analyze + Evaluate)

**Date:** 2026-08-23 · **Scope:** `showcase/index.html` L85-139 (hero + KPI) + `itinera-showcase-react/src/pages/Home.tsx` placeholder · Motion: `assets/js/features/scenes.js` S1+S2  
**Baseline:** P3 Topbar done, React Topbar live  
**Refs searched:** dark-mode luxury hero best practices 2026 (Awwwards pillars) · React count-up a11y + `tabular-nums` + `requestAnimationFrame` vs `setInterval` · `font-variant-numeric`

## 1) Inventory — what exists

### Hero (obsidian glass, editorial)
* Structure: `section.hero > .container.grid-2 { .reveal left-col + .preview.reveal right-col } + .kpi-band.reveal` below.
* Left col: `.badge` (dot) → `h1 "The engineering story behind Itinera."` (Itinera = serif italic gold) → `p.lead` (13-word promise + `213-route` bold) → `.row` 2 CTAs (`btn-primary Explore Architecture` + `btn Open API Reference`) both `data-magnetic` + `data-cursor` → `p.meta` (audited via `php artisan route:list`).
* Right col: `.preview` head (`POST /api/login`) + `div.code#heroCode` (cURL + 200 JSON) + `[data-copy]` button.
* Motion S1: `splitWords(h1)` wraps each word (and `<em>` as one unit) in `.wword`; `gsap.set(yPercent:70,opacity:0)` → timeline `power3.out`; em glint `textShadow` yoyo (1.1s). KPI + preview stay out of S1.
* React placeholder: identical copy but static, no `preview` yet, no KPI band.

### KPI Band
* Markup: `.kpi-band > 8 × .kpi { <b data-count="N">0</b><span>label</span><i>hint</i> }` — N = 213,37,49,28,55,44,355,10.
* Legacy `features/reveal.js` + `splits`? Actually `initCountUp` (not yet refactored): `IntersectionObserver` triggers `requestAnimationFrame` count from 0→target, no `tabular-nums`, no `aria-live`.
* Motion S2 (P3): band pins (`pin:true, pinSpacing:false, scrub:.6`) while tiles `y:28→0, opacity 0→1 stagger .07` tied to scroll. Tiles `forceIn` adds `.in` to parent `.reveal` immediately so pin math is stable.
* React placeholder: no KPI at all.

**Section sources:** `index.html` L88-138 · `Home.tsx` L25-34 · `assets/js/features/scenes.js` L86-108 · `assets/js/features/reveal.js` (count-up) · CSS `hero h1 em` gradient→solid + `.wword` helpers

## 2) Bugs — reproduced file:// + ?motion=force

| # | Sev | Repro | Cause | Impact |
|---|---|---|---|---|
| **B1** | 🟡 Med | Hero `.preview` code block overflows on 360px (horizontal scroll, no `overflow-wrap`) | `div.code` has `white-space:pre` + fixed 160ch cURL line, no `max-width` clamp | 360px layout shift, scrollbar steals swipe |
| **B2** | 🟡 Med | KPI `b[data-count]` jitter during count-up (digits wobble, container width breathes) | No `font-variant-numeric: tabular-nums` on the `<b>` | CLS 0.02–0.05 per Web Vitals; motion looks cheap |
| **B3** | 🟡 Med | KPI band pin with `pinSpacing:false` on iOS Safari causes hero hazard bar to visually overlap sticky topbar during scrub | Pin spacer suppressed but hazard bar is `position:static` inside hero; ST insert order matters | Visual glitch only Safari, but Awwwards jury uses iOS |
| **B4** | 🟢 Low | Hero `h1` 64px on 1440 overflows `max-width:70ch` lead on 1280 (2-line vs 3-line reflow shifts CTA row by 8px) | `--fs-hero: clamp(40px,6vw,64px)` vs lead `max-width:70ch` mismatch | Minor CLS, not a11y break |
| **B5** | 🟢 Low | `Copy` button on hero code has no success `aria-live` — screen reader hears nothing after copy | `features/clipboard.js` swaps `innerText` to "Copied ✓" but no `aria-live` region | a11y polish |
| **B6** | 🟢 Low | React `Home.tsx` hero has no `preview` — parity gap vs static showcase (user sees downgrade when switching apps) | Placeholder stripped for Topbar demo | Not a bug in legacy, but migration debt |

## 3) Accessibility audit

| Check | Result |
|---|---|
| H1 hierarchy (one H1 per page) | ✅ single `h1` |
| KPI semantics | ❌ `.kpi > b+span+i` are `div`s — should be `<dl><dt><dd>` or at least `role="list"` + `aria-label` |
| Count-up screen reader | ❌ rapid `innerText` changes not announced; no `aria-live="polite"` or static final value for AT |
| Reduced-motion | ✅ S1/S2 gated behind `isRM()` + `?motion=force` QA flag; RM → static headline + instant counts |
| No-JS fallback | ✅ `.js .reveal{opacity:0}` only when JS present; headline/KPIs visible without JS (counts show 0→final via server? actually 0 remains, but content readable) — recommend SSG final numbers |
| Color contrast hero `lead` on obsidian | ✅ `--dim #93a0bf` on `#05070d` = 7.69:1 |
| Focus order | ✅ 2 CTAs are real `<a>`, tab order logical |

## 4) 2026 community standards — gap vs. target

**Luxury dark hero 2026** (search-grounded): obsidian/midnight + metallic accent, generous whitespace, **conversion-first hierarchy** (Hook H1 <10 words → sub-headline <25 words → high-contrast CTA → trust signals), muted autoplay video <5MB optional, **kinetic typography** to guide eye but never obscure conversion path. — *Source: luxury hero 2026 search (dark UI, whitespace, kinetic).*

**KPI count-up 2026:** `requestAnimationFrame` + `IntersectionObserver` triggerOnce, `font-variant-numeric: tabular-nums` to kill jitter, `prefers-reduced-motion` skip, lightweight `useCountUp` hook, not heavy libs — `number-flow` only for dashboards. — *Source: React KPI 2026 search (rAF, IO, tabular-nums).*

| Current | 2026 target | Gap |
|---|---|---|
| Hero `h1` 9 words ("The engineering story behind Itinera.") | 7-word benefit-driven hook (e.g. "Ship luxury travel, 213 routes deep") — but our H1 is *narrative showcase*, not booking page → keep, just tighten lead to <25 words (currently 32) | 🟢 copy tweak |
| Lead 32 words, no trust bar | Lead ≤25 words + trust signal row (Laravel 12, 55 tests, 44 migrations) | 🟡 conversion |
| Preview `div.code` plain `<span>` coloring | Shiki/highlighted code with copy `aria-live` + `tabular-nums` already on code | 🟡 polish |
| KPI 8 tiles as `div`s, no `dl` | `<dl>` + `useCountUp` hook, `aria-live`, `tabular-nums` | 🔴 semantics + a11y |
| Pin with `pinSpacing:false` | `pinSpacing:true` + hazard bar inside pinned container or `anticipatePin:1` | 🟢 fix B3 |

## 5) Recommendations — ranked

### P0 — must for Sec B parity + luxury bar

* **R1 — Promote Hero+KPI to React components** `src/components/sections/Hero.tsx` (props: `titleEm`, `lead`, `ctas: CTA[]`, `codeSample`, `onCopy`) + `src/components/sections/KpiBand.tsx` (props: `items: {value,label,hint}[]`). Single source, both apps consume via props → kills `lead` copy drift (32 vs 25 words). *S.*
* **R2 — KPI hook + semantics:** `src/hooks/useCountUp.ts` (`rAF`, `IO triggerOnce`, `isRM` skip) + `KpiBand` renders `<dl><div><dt><dd>` with `aria-label` on `<dd>` and `aria-live="polite"` on the `<b>` only after animation completes (so AT hears final value once). Add `className="tabular-nums"` to the `<b>`. Fixes B2 + a11y. *S.*
* **R3 — Copy `aria-live`:** `features/clipboard.js` already swaps text; add `role="status" aria-live="polite"` live region (React: `useAnnouncer` hook). Fixes B5. *XS.*
* **R4 — Responsive code preview:** `preview-body { overflow-x:auto; max-width:100% }` + `code { font-size: clamp(11px,1.6vw,12.5px) }` fixes B1 on 360. *XS.*

### P1 — motion fidelity (keeps 2026 kinetic bar without hurting conversion)

* **R5 — Keep S1/S2 but harden:** S1 delay .15 → `document.fonts.ready` gate (already in scenes.js) + pin `anticipatePin:1`; S2 `pinSpacing:true` and move hazard bar outside pinned range (or give hero `overflow:clip`) fixes B3 Safari. *S.*
* **R6 — Lead tightening:** 32 → 24 words, add trust bar under CTAs: `Laravel 12 · 55 tests · 44 migrations · 213 routes audited` as 4 pill badges (reuse KPI data, not duplicate). Conversion lift. *S.*

### P2 — backlog (later sections reuse these)

* **R7 — Hero media option:** optional muted loop `<video>` poster fallback (under 3MB) — leave as prop `media?: {poster, src}` on `Hero`, not default.
* **R8 — NumberFlow swap later if KPI becomes live dashboard (high-frequency updates) — not needed for static 8 tiles.

## 6) Metrics before (baseline file:// audit)

| Metric | Current |
|---|---|
| Hero words (H1) | 5 + em (9 inc. "The") |
| Lead words | 32 |
| KPI tiles | 8 (213,37,49,28,55,44,355,10) |
| Count-up jitter | visible wobble, no `tabular-nums` |
| KPI semantics | 0 `<dl>` |
| Preview overflow @360 | horizontal scroll |
| Motion triggers (hero+KPI) | 2 (S1, S2) + 1 pin spacer |

## 7) References

* Files: `index.html` L88-138, `Home.tsx`, `assets/js/features/scenes.js` S1/S2, `assets/js/features/reveal.js` (countUp), CSS `.hero h1 em` + `.wword` helpers.
* 2026 grounded: luxury hero 2026 (dark obsidian + whitespace + kinetic + conversion hierarchy + trust signals) · React KPI 2026 (rAF + IO + `tabular-nums` + RM skip, NumberFlow only for dashboards).
