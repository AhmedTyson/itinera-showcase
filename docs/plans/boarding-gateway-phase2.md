# Section D — Boarding Pass + Gateway — Phase 2 Plan (Planning)

**Date:** 2026-08-23 · **Scope:** `itinera-showcase-react` Sec D · **Depends on:** Phase 1 audit `docs/audits/boarding-gateway-phase1.md` + Sec C Arch+ER (canvases)  
**Laws:** RM `useIsReducedMotion` + `?motion=force`, no-JS fallback (ticket visible), `aria-live` on copy, `tabular-nums` on price, file:// safe legacy stays.

## Goals

* One `<BoardingPass>` replaces the vanilla `div#bpRoot` innerHTML renderer — same hazard/perforated/barcode/serif/mono, but **props-driven**, `forwardRef` for print, `aria-label` on ticket, and `innerText` copy (fixes D3) + `min-h` placeholder (fixes D1).
* One `<Lifecycle>` replaces the 6 `div.lc-step` static strip — `role="list"` + `aria-current="step"` in sync with S4 scrub (fixes a11y), vertical on mobile via `grid`, horizontal on desktop.
* Explorer stays in legacy `showcase/` for Sec D scope — React `Home` just renders the two new components; explorer enhancements (Command, Select) are Sec G (Docs shell) — but `BoardingPass` live fetch is shared via `src/lib/flights.ts` hook.

## Dependency graph

```
Sec C foundation (Topbar, Hero+KPI, canvases, useIsReducedMotion, @theme)
   │
   ├── lib/flights.ts — Flight type + apiBase + fetchFlights / fetchFlight(id) (offline sample fallback)
   │         │
   │         ├── BoardingPass — pure presentational + live container
   │         │         │
   │         │         └── Home wiring (state: selectedFlight, liveFlights)
   │         │
   │         └── Lifecycle — 6 steps, roving aria-current, scrub sync
```

Bottom-up: lib → BoardingPass (pure) → Lifecycle (a11y) → Home composition.

## Component APIs (ISP, DIP)

```tsx
// src/lib/flights.ts
export type Flight = { id: string | number; flightNumber: string; from: string; to: string; price: number; departure?: string; arrival?: string; airline?: string }
export const OFFLINE_SAMPLE: Flight // EG-102 ASF→MRV $117.48
export function apiBase(): string // DIP — reads VITE_API_BASE or TP_CONFIG.apiBase or 127.0.0.1:8000/api
export async function fetchFlights(): Promise<Flight[]> // GET /flights → Flight[] with offline fallback
export async function fetchFlight(id: string | number): Promise<Flight>

// src/components/sections/BoardingPass.tsx
type BoardingPassProps = {
  flight: Flight | null // null → skeleton with min-h
  onCopy?: () => void // DIP — caller injects clipboard + announcer
}
export const BoardingPass = forwardRef<HTMLDivElement, BoardingPassProps>(function BoardingPass({ flight, onCopy }, ref) {
  // renders hazard bar, perforated stub, flightNumber/route/price, barcode SVG (pure, no innerHTML), mono numerals
  // aria-label={`Boarding pass for flight ${flight?.flightNumber ?? "offline sample"}`}
})

// src/components/sections/Lifecycle.tsx
type Step = { title: string; desc: string }
const STEPS: Step[] // 6 — Checkout initiate … Receipt & mail (from index.html L301-308)
type LifecycleProps = { activeIndex?: number } // controlled by scroll scrub or manual
export function Lifecycle({ activeIndex }: LifecycleProps): JSX.Element
// renders <ol role="list"> + 6 <li role="listitem" aria-current={i===active?"step":undefined}>

// Home composition:
// const [flight, setFlight] = useState<Flight | null>(OFFLINE_SAMPLE)
// const [flights, setFlights] = useState<Flight[]>([OFFLINE_SAMPLE])
// useEffect: fetchFlights().then(setFlights).catch(()=>notify)
// <BoardingPass flight={flight} ref={printRef} />
// <select value={flight?.id} onChange={e=> setFlight(flights.find(f=>String(f.id)===e.target.value) ?? null)}>
```

Styling: Tailwind `overflow:clip` on gateway wrapper if pinned later, `print:` utilities for ticket (white bg, black text, hide hazard animation).

## Task breakdown (vertical slices)

### Task D0 — Lib prep (XS)

**Desc:** Extract `Flight` type + `OFFLINE_SAMPLE` + `apiBase()` + `fetchFlights`/`fetchFlight` into `src/lib/flights.ts` (single source for both canvases if needed, and for future `showcase/` vanilla back-port).

**Accept:**
- [ ] `OFFLINE_SAMPLE.id === "102"` and `flightNumber === "EG-102"` + `price === 117.48`
- [ ] `fetchFlights()` returns `Flight[]` with offline fallback on `!r.ok` or `catch` (no throw)
- [ ] `apiBase()` reads `import.meta.env.VITE_API_BASE` first, then `window.TP_CONFIG.apiBase`, then `http://127.0.0.1:8000/api`

**Verify:** `rg -c "OFFLINE_SAMPLE" src/lib/flights.ts` ==1; `npm run build` pass. **Deps:** none. **Files:** `src/lib/flights.ts`. **Scope:** XS.

### Task D1 — BoardingPass (S)

**Desc:** Pure presentational + live container split: `BoardingPass` renders ticket from `flight` prop (hazard 135°, perforated stub `border-dashed`, barcode `160×30` via `generateBarcodeSvg(value)` pure function, JetBrains Mono numerals + Newsreader italic). `forwardRef` for `useReactToPrint` later. Parent `Home` owns `flight` state + `fetch`.

**Accept:**
- [ ] `flight={null}` renders skeleton with `min-h-[180px]` (fixes D1 CLS)
- [ ] `flight={OFFLINE_SAMPLE}` renders `EG-102` + `ASF→MRV` + `$117.48` + barcode SVG with `role="img" aria-label="Barcode for flight EG-102"`
- [ ] Copy button calls `onCopy` which does `navigator.clipboard.writeText(flightInnerText)` + `announce("Copied")` (fixes D3) — not `innerHTML`
- [ ] `aria-label` on ticket root

**Verify:** headless: `BoardingPass` with null → skeleton height >0; with sample → text `EG-102` present, barcode `svg` present, `aria-label` correct. **Deps:** D0. **Files:** `src/components/sections/BoardingPass.tsx`, `src/lib/barcode.ts` (pure `generateBarcodeSvg`). **Scope:** S.

### Task D2 — Lifecycle (S)

**Desc:** `Lifecycle` renders `STEPS[6]` as `<ol role="list">` with `li[role=listitem][aria-current]` . Active index driven by scroll scrub (S4) — for React, expose `activeIndex` prop controlled by `useScrollSpy` hook that mirrors `scenes.js` S4 `gsap.set(steps)` + scrub timeline but now updates `aria-current` in `onUpdate`. Mobile: `grid-cols-1` vertical, desktop `grid-cols-3` horizontal (fixes D4).

**Accept:**
- [ ] 6 `li` with `role="listitem"` + `aria-current="step"` on active only
- [ ] Mobile vertical, desktop horizontal (via `grid`)
- [ ] `stagger` feels right on mobile (reduce to `.10` when `matchMedia("(max-width:768px)")`)

**Verify:** headless: `$$('li[aria-current="step"]')` count 1, moves on scroll. **Deps:** none (or D0 for consistency). **Files:** `src/components/sections/Lifecycle.tsx`, `src/hooks/useScrollSpy.ts` if extracted. **Scope:** S.

### Task D3 — Home wiring + legacy P0 fallback keep (S)

**Desc:** `src/pages/Home.tsx` composes `<BoardingPass flight={flight} />` + `<select>` for flight choice + `<Lifecycle activeIndex={spyIndex}>` + single `InspectorDialog` already there. Keeps `scenes.js` S4/S5 orchestration — React only renders static nodes; `scenes.js` still does `gsap.from(pass)` on `#bpRoot` (now React's `BoardingPass` root) and `gsap.set(steps)` scrub. Add `overflow:clip` to gateway wrapper if pinned later (already planned). Add static fallback HTML inside `BoardingPass` skeleton for no-JS (offline sample ticket as server-rendered markup).

**Accept:**
- [ ] `Home` route renders `BoardingPass` + `Lifecycle` + existing `ArchCanvas`/`ErCanvas` + `KpiBand` without layout shift
- [ ] `select` has 1 offline sample initially, then 5-10 live options after fetch (fixes D2 duplicate — clear before append)
- [ ] No-JS: `BoardingPass` skeleton shows offline sample ticket (no empty `#bpRoot`)

**Verify:** `npm run build`; headless: `select option` count 1 → after `fetchFlights` mock 6, no duplicate `ASF→MRV`; `Home` renders 6 lifecycle `li`. **Deps:** D1, D2. **Files:** `src/pages/Home.tsx`, `src/index.css` `overflow:clip` if needed. **Scope:** S.

## Checkpoint: after D0-D3

- [ ] `npm run build` green, no `BoardingPass` HTML-injection, no `innerHTML` copy
- [ ] BoardingPass `aria-label` + `min-h` + barcode `role="img"` + copy `aria-live`
- [ ] Lifecycle `role="list"` + `aria-current` moves on scroll, vertical on mobile
- [ ] `Home` renders BoardingPass + Lifecycle + Arch/ER + KPI without CLS

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| `BoardingPass` barcode SVG `160×30` not matching legacy `bpGenerateBarcode` exactly | Keep `generateBarcodeSvg` pure function verbatim from `boarding.js` (34 bars) — pixel parity |
| `fetchFlights` CORS on file:// | `VITE_API_BASE` env + `OFFLINE_SAMPLE` fallback + `notify` toast already handles `!r.ok` |
| S4 scrub `aria-current` out of sync with GSAP | `onUpdate` of scrub timeline sets `activeIndex` via `ScrollTrigger` `onUpdate: self => setActive(Math.floor(self.progress * 6))` |

## Out of scope for Sec D

Explorer filter (`#apiSearch` etc.) — Sec G (Docs shell) owns `Command` + `Select` with `aria-controls`. Gateway throttle map (6 `gw-node` pills) stays static for now.

## References

* Phase 1 audit: `docs/audits/boarding-gateway-phase1.md`
* Grounded search: boarding pass functional hierarchy + 12pt sans-serif + high contrast + live updates + print 3.5"×8.5" 300DPI.
