# Section B — Hero + KPI Band — Phase 2 Plan (Planning)

**Date:** 2026-08-23 · **Scope:** `itinera-showcase-react` Sec B · **Depends on:** Phase 1 audit `docs/audits/hero-kpi-phase1.md` + Sec A Topbar foundation (Topbar, hooks, @theme)  
**Laws:** RM single source `useIsReducedMotion` + `?motion=force`, no-JS fallback (hero/KPI visible), tabular-nums, `dl` semantics, file-served vs Vite-served both green.

## Goals

* One `<Hero>` + one `<KpiBand>` replace the static `section.hero` + `.kpi-band` copies. Same obsidian/gold editorial, but responsive at 360, jitter-free counts, and a11y-complete (`dl`, `aria-live`, copy live region).
* Keep S1 (word-rise) + S2 (pin scrub) but hardened (`anticipatePin`, `overflow:clip`, `document.fonts.ready` already in scenes.js) — React wrappers only orchestrate, GSAP stays the motion engine.
* Lead copy tightened 32→24 words + trust pill bar (reuse KPI numbers — no duplicate source).

## Dependency graph

```
Sec A foundation (Topbar, useIsReducedMotion, useScrollTo, @theme tokens, lucide)
   │
   ├── useCountUp (rAF + IO triggerOnce, RM skip)
   │         │
   │         └── KpiBand  (dl + tabular-nums + aria-live)
   │
   ├── useAnnouncer (aria-live) + CopyButton
   │         │
   │         └── Hero  (badge + H1 em + lead + CTAs + preview code + trust pills)
   │
   └── motion hardening (pinSpacing:true + hazard clip) — Hero orchestrates
```

Bottom-up: hook → band → hero (hero composes band as sibling, not child, to keep pin math stable).

## Component APIs (ISP, DIP)

```tsx
// src/hooks/useCountUp.ts
function useCountUp(
  target: number,
  opts?: { duration?: number; triggerOnce?: boolean } // default 900ms, true
): { ref: RefObject<HTMLElement>; value: number; done: boolean }

// src/components/sections/KpiBand.tsx
type KpiItem = { value: number; label: string; hint: string }
type KpiBandProps = { items: KpiItem[] } // hint = "api/*", "app/Models" etc

export function KpiBand({ items }: KpiBandProps): JSX.Element
// renders <dl class="kpi-band"><div class="kpi"><dt>API Routes</dt><dd><b className="tabular-nums" aria-live="polite">213</b></dd><span>api/*</span></div>...

// src/components/sections/Hero.tsx
type CTA = { label: string; href: string; variant: "gold" | "ghost"; icon?: ReactNode }
type HeroProps = {
  badge: string
  title: ReactNode // e.g. <>The engineering story behind <em className="font-serif italic text-primary">Itinera</em>.</>
  lead: string // ≤25 words enforced by prop comment
  ctas: [CTA, CTA]
  codeSample: { langLabel: string; code: string } // cURL + 200 JSON sample
  trustPills?: string[] // ["Laravel 12","55 tests","44 migrations","213 routes audited"]
  kpiItems: KpiItem[] // passed through to KpiBand rendered below hero
  onCopy?: () => void // DIP — Hero never touches clipboard directly; caller injects
}
export function Hero(props: HeroProps): JSX.Element

// Hero internally uses: useAnnouncer (copy), useCountUp not needed (delegated to KpiBand),
// SplitWords effect for S1 is kept in scenes.js — React just renders static H1; scenes.js splitWords runs on mount (existing behavior, no React GSAP needed).
```

Tailwind: `tabular-nums` is a utility (`font-variant-numeric: tabular-nums`) — no custom CSS.

## Task breakdown (vertical slices)

### Task B0 — Prep: copy trust (S)

**Desc:** Extract the 8 KPI numbers to a single source `src/lib/kpi.ts` so Hero trust pills and KpiBand share one array (no drift between "213-route" in lead and band).

**Accept:** `export const KPI_ITEMS: KpiItem[] = [...]` with 8 entries matching `php artisan route:list` audit (213,37,49,28,55,44,355,10) + `TRUST_PILLS` derived from it. Single import used by both components.
**Verify:** `rg -c "213" src/lib/kpi.ts` + `npm run build` pass. **Deps:** none. **Files:** `src/lib/kpi.ts`. **Scope:** XS.

### Task B1 — `useCountUp` + `useAnnouncer` (S)

**Desc:** `useCountUp` = `rAF` loop, `IO` triggerOnce, `isRM` → instant `target`, cleanup on unmount; `useAnnouncer` = `aria-live` region helper for Copy.

**Accept:** 
- [ ] `useCountUp(213)` → `value` animates 0→213 in ~900ms when `ref` enters viewport, stays 213, `done` flips true; when `isRM` true, `value === target` on first render, no rAF
- [ ] `font-variant-numeric` not in hook (component concern) — hook only does numbers
- [ ] `useAnnouncer` renders a visually-hidden `div[aria-live="polite"]` and exposes `announce(msg)`

**Verify:** render hook in harness at top vs bottom of viewport; assert `done` timing; RM toggle test. **Deps:** B0. **Files:** `src/hooks/useCountUp.ts`, `src/hooks/useAnnouncer.ts`. **Scope:** S.

### Task B2 — `KpiBand` (S)

**Desc:** Renders `<dl>` with 8 `KpiItem`s, each `useCountUp`, `tabular-nums` on the `<b>`, `aria-live="polite"` only after `done` (so AT hears final value once, not 60 ticks). Fixes B2 + a11y.

**Accept:**
- [ ] Markup is `<dl>` (not divs); each tile `role` implicit via dl
- [ ] `<b className="tabular-nums">` has `aria-live="polite"` only when `done`
- [ ] No jitter at 120fps (tabular-nums locks width)
- [ ] `pinSpacing:true` + hero `overflow:clip` handled by Hero wrapper (see B3), but band itself has no pin logic — scenes.js S2 still owns pin (keeps file:// showcase behavior parity)

**Verify:** headless: measure `b.getBoundingClientRect().width` at 0, 100, 213 during animation — delta <1px; Axe check `dl` semantics. **Deps:** B0, B1. **Files:** `src/components/sections/KpiBand.tsx`. **Scope:** S.

### Task B3 — `Hero` + motion hardening (M)

**Desc:** Left badge+H1+lead+CTAs+meta, right `Preview` code block (shiki-light highlight via `<pre>` + `CopyButton`), and trust pill bar. Keeps existing `assets/js/features/scenes.js` S1/S2 orchestration — React only renders static H1; scenes.js `splitWords` still runs (no React GSAP rewrite). Hardens S1/S2: `anticipatePin:1`, hazard bar given `overflow:clip` container, preview `overflow-x:auto`.

**Accept:**
- [ ] `Hero` props enforce `lead` ≤25 words (dev `console.warn` if over)
- [ ] `Preview` has `max-w-full overflow-x-auto` + fluid code size `clamp(11px,1.6vw,12.5px)` — fixes B1 360px
- [ ] Copy button uses `useAnnouncer` + `navigator.clipboard` with fallback; `aria-live` announces "Copied"
- [ ] CTAs are `Button` CVA `gold`/`ghost` + `lucide-react` (`Network`, `Terminal`) + `data-magnetic`/`data-cursor` preserved for tactile hook (tactile.js still works via `querySelector`)
- [ ] Trust pills row renders `TRUST_PILLS` (4) — not duplicated KPI data
- [ ] H1 serif `Itinera` keeps solid `text-primary` + glow (no gradient-clip regression)
- [ ] Hero still works with JS disabled (H1 + lead + CTAs visible; counts show final numbers via SSG — B1 hook server-renders target when `isRM` or `typeof window==="undefined"`)

**Verify:** `npm run build`; screenshot at 360/820/1280 — no horizontal scroll; copy click → `aria-live` text; `Home.tsx` imports `Hero` + `KpiBand` with `KPI_ITEMS`. **Deps:** B0-B2. **Files:** `src/components/sections/Hero.tsx`, `src/pages/Home.tsx` (composes Hero+KpiBand), `src/components/ui/copy-button.tsx` if extracted, `src/index.css` `overflow:clip` on hero wrapper. **Scope:** M (5 files).

## Checkpoint: after B0-B3

- [ ] `npm run build` green, no `Itinari`, no `tabular-nums` missing
- [ ] KPI band `dl` semantics, jitter <1px, AT hears final value once
- [ ] Hero preview not overflowing 360, copy announces, hazard bar not overlapping topbar on Safari pin
- [ ] `Home` route renders Hero → KpiBand → rest sections; scroll pin math stable (hazard clip, anticipatePin)

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| `pinSpacing:true` changes page height vs legacy `false` | Accept height delta (1 pin spacer = ~80px); design keeps rhythm, or keep `false` and just add hazard `overflow:clip` — B3 chooses `true` for Safari safety, documented as intentional deviation |
| `useCountUp` double-triggers on fast scroll | `triggerOnce:true` + disconnect on `done` |
| Preview code highlight adds bundle | Use plain `<pre>` with existing `showcase.css` `div.code` classes for now; shiki later if needed — no new dep in Sec B |

## Out of scope for Sec B

Arch canvas, boarding pass, explorer, console, tracks, wiki — Sec C-H each gets its own 3 phases. Hero media `video` prop (R7) stays backlog.

## References

* Phase 1 audit: `docs/audits/hero-kpi-phase1.md`
* Grounded searches: luxury dark hero 2026 (obsidian/whitespace/kinetic + conversion hierarchy), React KPI 2026 (rAF + IO + `tabular-nums` + RM skip).
