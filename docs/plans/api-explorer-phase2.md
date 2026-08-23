# Section E — API Explorer + Throttle Map — Phase 2 Plan (Planning)

**Date:** 2026-08-23 · **Scope:** `itinera-showcase-react` Sec E · **Depends on:** Phase 1 audit `docs/audits/api-explorer-phase1.md` + Sec D BoardingPass (live fetch) + Sec C canvases  
**Laws:** `aria-live` on count, `aria-controls` on search, `details` native fallback, RM `useIsReducedMotion` (no motion in filter), file:// safe legacy stays.

## Goals

* One `<Explorer>` replaces the vanilla `div.toolbar` + 28 `details` + `div#apiEmpty` + `gateway-map` static pills. Same obsidian/gold editorial, but **filter is React state** (no `style.display` toggling), **responsive `con-try` flex** (fixes E3), and **context-aware auth** (pre-fill token into console).
* Keep `data-search` contract for `filterEndpoints` parity — React `Explorer` reads the same `data-search` + `.path` + `data-meth` but via props, not DOM query.
* Throttle map becomes `<ThrottleMap>` with `role="list"` (fixes E4).

## Dependency graph

```
Sec D foundation (Topbar, Hero+KPI, canvases, useIsReducedMotion, @theme, Button)
   │
   ├── lib/explorer-data.ts — ENDPOINTS[28] (curated) + GW_NODES[6] (single source, replaces HTML)
   │         │
   │         ├── Explorer — toolbar (search + 2 selects + count) + 28 EndpointCard + EmptyState
   │         │         │
   │         │         └── Home wiring (state: query, cat, meth → filtered)
   │         │
   │         └── ThrottleMap — 6 pills, role="list"
```

Bottom-up: data single source → Explorer (filter + cards) → Home composition.

## Component APIs (ISP, DIP)

```tsx
// src/lib/explorer-data.ts
export type Endpoint = { id: string; cat: string; meth: "get"|"post"|"put"|"patch"|"delete"; path: string; search: string; summary: string; chips?: string[]; request?: string; response?: string }
export const ENDPOINTS: Endpoint[] // 28 — curated, from index.html L345-470 (register, login, me, refresh, verify, destinations, hotels, flights, ... admin categories)
export const GW_NODES: { label: string; note: string }[] // 6 — login, register, refresh, ai, checkout, weather

// src/components/explorer/Explorer.tsx
type ExplorerProps = {
  endpoints?: Endpoint[] // default ENDPOINTS
  onTry?: (endpoint: Endpoint) => void // DIP — Explorer never touches console directly; Home injects
}
export function Explorer({ endpoints, onTry }: ExplorerProps): JSX.Element
// renders toolbar + <div role="list"> of EndpointCard + EmptyState; filter is useState query/cat/meth → useMemo filtered

// src/components/explorer/EndpointCard.tsx
type EndpointCardProps = { endpoint: Endpoint; onTry?: (e: Endpoint) => void }
export function EndpointCard({ endpoint, onTry }: EndpointCardProps): JSX.Element
// renders <details> (native) with summary .meth + .path + chips + button.con-try (flex, not absolute) + ep-body

// src/components/explorer/ThrottleMap.tsx
export function ThrottleMap(): JSX.Element
// renders <div role="list"> + 6 <div role="listitem" className="gw-node">

// Home composition:
// const [query, setQuery] = useState("")
// const [cat, setCat] = useState("all")
// const [meth, setMeth] = useState("all")
// <Explorer endpoints={ENDPOINTS} onTry={(ep) => { /* find matching Try button or open console directly */ }} />
```

Styling: Tailwind `grid` for cards, `flex` for toolbar, `tabular-nums` on count, `aria-live` on `span#apiCount` equivalent.

## Task breakdown (vertical slices)

### Task E0 — Data single source (XS)

**Desc:** Extract 28 curated endpoints from `showcase/index.html` L345-470 into `src/lib/explorer-data.ts` (typed `ENDPOINTS[28]` + `GW_NODES[6]`). One array drives both React `Explorer` and (future) legacy `explorer.js` if you back-port. Keep `data-search` strings verbatim for filter parity.

**Accept:**
- [ ] `ENDPOINTS.length === 28` + `GW_NODES.length === 6`, each `path` matches legacy `span.path` text
- [ ] `ENDPOINTS[0].search` includes `register create account throttle` (verbatim)

**Verify:** `rg -c "ENDPOINTS" src/lib/explorer-data.ts` ==1; `npm run build` pass. **Deps:** none. **Files:** `src/lib/explorer-data.ts`. **Scope:** XS.

### Task E1 — Explorer + EndpointCard (S)

**Desc:** `Explorer` renders toolbar (`input[type=search]` + 2 `select` + `span[aria-live]`) + `div[role="list"]` of `EndpointCard` (native `details` with `summary` + `.meth` + `.path` + chips + `button.con-try` flex row, not absolute). Filter via `useMemo` (`query.toLowerCase()` + `cat` + `meth`).

**Accept:**
- [ ] 28 `details` render, `con-try` is `flex` not `absolute` (fixes E3)
- [ ] Filter `query="fork"` shows 1-2 cards, count updates, `EmptyState` shows when 0
- [ ] `aria-controls="apiCount apiEmpty"` on `input` (fixes E1), `aria-describedby` on selects

**Verify:** headless: `input` type `fork` → `details[open]` count 1, `apiCount` text `1 endpoints`. **Deps:** E0. **Files:** `src/components/explorer/Explorer.tsx`, `src/components/explorer/EndpointCard.tsx`, `src/components/explorer/EmptyState.tsx`. **Scope:** S.

### Task E2 — ThrottleMap + a11y (XS)

**Desc:** `ThrottleMap` renders 6 `gw-node` pills with `role="list"` + `role="listitem"` (fixes E4), `EmptyState` has `role="status"` + `aria-live` (fixes E5).

**Accept:**
- [ ] `role="list"` on map + `listitem` on 6 pills
- [ ] `EmptyState` has `role="status"` + `aria-live="polite"`

**Verify:** Axe check `role` present. **Deps:** E0. **Files:** `src/components/explorer/ThrottleMap.tsx`. **Scope:** XS.

### Task E3 — Home wiring + legacy P0 keep (S)

**Desc:** `src/pages/Home.tsx` composes `<ThrottleMap />` + `<Explorer onTry={openConsole}>` where `openConsole` finds the matching `details` and triggers its `con-try` button (or directly calls `ITN.console` bridge). Keeps `explorer.js` `filterEndpoints` for legacy `showcase/` (file:// safe) — React only owns new app, legacy stays vanilla.

**Accept:**
- [ ] `Home` route renders `ThrottleMap` + `Explorer` + existing `ArchCanvas`/`ErCanvas`/`Hero`/`KpiBand` without layout shift
- [ ] `onTry` opens console drawer (if `lib/console.js` present) or logs to console in React dev
- [ ] No-JS: 28 `details` visible, filter no-op (all shown)

**Verify:** `npm run build`; headless: `Explorer` renders 28, filter `weather` → 1, `Try` click → console open. **Deps:** E1, E2. **Files:** `src/pages/Home.tsx`, `src/index.css` if needed. **Scope:** S.

## Checkpoint: after E0-E3

- [ ] `npm run build` green, no `details` absolute `con-try`, no `aria-controls` missing
- [ ] Explorer filter `fork` → 1, `apiCount` live, `EmptyState` status, `ThrottleMap` list roles
- [ ] `Home` renders Explorer + ThrottleMap + existing sections; legacy `showcase/` still file:// safe

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| 28 `details` native vs Radix `Collapsible` | Keep native `details` for no-JS fallback; Radix later if you need animated height |
| Filter `data-search` drift from `ENDPOINTS` | Single source `explorer-data.ts` — legacy `explorer.js` can later import it (or stay duplicate until full migration) |
| `con-try` absolute → flex change breaks legacy `showcase/` | Only React `Explorer` uses flex; legacy `showcase/` keeps absolute until you back-port (not in Sec E scope) |

## Out of scope for Sec E

Docs shell (`showcase/docs.html` 3-column) — Sec G (Docs + Tracks) owns `Command` + `Select` with `aria-controls`. Gateway `throttle` map as interactive canvas — stays static pills for Sec E.

## References

* Phase 1 audit: `docs/audits/api-explorer-phase1.md`
* Grounded search: API explorer — try-it (context-aware auth, example variations), semantic/AI search, `llms.txt` + `/openapi.json`, living docs via CI.
