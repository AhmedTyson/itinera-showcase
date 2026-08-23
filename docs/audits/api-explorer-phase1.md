# Section E — API Explorer + Throttle Map — Phase 1 Audit (Analyze + Evaluate)

**Date:** 2026-08-23 · **Scope:** `showcase/index.html` L310-470 (throttle map + explorer toolbar + 28 endpoint cards + apidog guide) + `assets/js/features/explorer.js` (`filterEndpoints`, `apiBase`)  
**Baseline:** Sec D Boarding Pass + Lifecycle done (Topbar, Hero+KPI, canvases live)

## 1) Inventory — filterable explorer over curated catalog

### Throttle Map — `gateway-map` — 6 pills
* 6 `.gw-node` (`login` throttle·brute-force, `register` throttle, `refresh` 15/min, `ai` quota-guarded, `checkout` money-path, `weather` abuse-tested) — static, no canvas, `flex` row. Pure presentational, no filter.

### Explorer Toolbar
* `input#apiSearch[type=search]` placeholder `Search endpoints… try “fork”, “webhook”, “weather”` + `aria-label="Search endpoints"`
* `select#apiFilter` (All/account/catalog/trips/commerce/system/admin) + `select#apiMeth` (All/GET/POST/PUT/PATCH/DELETE) + `span#apiCount[role=status][aria-live=polite]` (e.g. `12 endpoints`) + `div#apiEmpty` (no-match card, `display:none` until 0)
* Filter via `filterEndpoints()` — reads `search.value.toLowerCase()` + `filterCat.value` + `filterMeth.value`, hides/shows `details.endpoint` via `style.display`, updates `apiCount` + `apiEmpty` toggle, called on `input`/`change` + initial dispatch.

### Endpoint Cards — 28 curated `<details>`
* Each `details.endpoint[data-cat][data-meth][data-search]` → `summary` with `<span class="meth {get|post|put|patch|delete}">` + `<span class="path">/api/...` + 1-2 `<span class="chip">` (public/auth, throttle, permission) + `div.ep-body` with `<p class="muted">` + optional `div.kv2` (REQUEST/RESPONSE `.code` blocks with `&nbsp;` indentation). Example: `POST /api/register` (`throttle:register`), `POST /api/login` (`throttle:login`), `GET /api/me` (`auth:api`), `GET /api/destinations/{destination}/hotels` (public).
* Native `<details>` gives `Space`/`Enter` toggle + `aria-expanded` auto.
* `Try` affordance injected by `lib/console.js` (Sec D) as `button.con-try` inside `summary` (absolute right) — not in static HTML, so explorer alone has no try button until console loads.

### Apidog Guide Card
* `card guide-search` 4-step `ol.guide-step` (Expose spec → Import by URL → Confirm OpenAPI → Explore) + `a.btn[href="docs.html#apidog"]`.

**Section sources:** `index.html` L310-470 · `assets/js/features/explorer.js` · `assets/js/lib/console.js` (Try injection)

## 2) Bugs — reproduced file:// + ?motion=force

| # | Sev | Repro | Cause | Impact |
|---|---|---|---|---|
| **E1** | 🟡 Med | Explorer `input#apiSearch` has no `aria-controls="apiCount apiEmpty"` — screen reader hears count change via `aria-live` but not that it controls the list | `aria-controls` missing on combobox | AT verbosity, not failure |
| **E2** | 🟡 Med | `select#apiFilter` + `select#apiMeth` have no visible `<label>` — only `aria-label` — at 200% zoom the purpose is not visually obvious | No `<label for>` | WCAG 3.3.2, but `aria-label` passes automated checks |
| **E3** | 🟢 Low | `details.endpoint` at 360px: `summary` with `.meth` + `.path` + 2 chips wraps into 2 lines, chip row overlaps `con-try` button (absolute right) | `con-try` `position:absolute;right:14px` not responsive | Visual overlap on small screens |
| **E4** | 🟢 Low | `gateway-map` 6 pills at 360px wrap into 3×2 grid but have no `role="list"` semantics | `div.gw-node` are `div`s | Minor a11y |
| **E5** | 🟢 Low | `div#apiEmpty` has `role`? No — just `div.card` with `<b>No endpoints match.</b>` — not announced as `alert` | Should be `role="status"` or `aria-live` | AT may miss empty state |
| **E6** | 🟢 Low | React `Home.tsx` placeholder for gateway is still static `Section` — parity gap vs legacy explorer (user sees downgrade switching apps) | Sec E not yet migrated | Migration debt |

## 3) Accessibility audit

| Check | Result |
|---|---|
| Search `input` keyboard | ✅ native `search`, tab order logical |
| `details/summary` keyboard | ✅ native `Space`/`Enter`, `aria-expanded` auto |
| `aria-live` on count | ✅ `span#apiCount[aria-live=polite]` updates via `filterEndpoints` |
| `aria-controls` on search | ❌ missing (E1) |
| Focus visibility | ✅ gold ring |
| Reduced-motion | ✅ no motion in explorer (filter is instant `display:none`) |
| No-JS fallback | ✅ 28 `details` visible, filter no-op (all shown), count shows `— endpoints` (would be better to show `28 endpoints` server-rendered) |
| Color contrast chips on obsidian | ✅ `chip` border `rgba(251,191,36,.3)` on `#0e1428` ~ 4.5:1 |

## 4) 2026 community standards — gap vs. target

**API explorer 2026** (grounded search): try-it console is primary adoption engine — **context-aware auth** (pre-fill token), **example variations** (Create Standard vs Admin User), **integrated error handling** with human-readable suggestions + links, **SDK generation** via OpenAPI, **semantic/AI search** (understand "how do I authenticate" as well as "API Key"), **filterable catalog** by resource/method/domain, **AI-native discoverability** (`/openapi.json` + `llms.txt` + structured metadata), **living docs** via CI/CD sync, analytics on search/try-it success.

| Current | 2026 target | Gap |
|---|---|---|
| `input` + 2 `select` filters (keyword + cat + method) | **Semantic search** (intent-based) + **AI Q&A** over OpenAPI + `llms.txt` already exists at `showcase/llms.txt` | 🟡 Search is keyword-only |
| Static `details` with `data-search` | **Filterable catalog** already done, but add **resource/method chips as toggle pills** (not just selects) for faster scanning | 🟢 polish |
| `Try` button via `console.js` (Sec D) | **Context-aware auth** — pre-fill `Authorization: Bearer` from `localStorage itinera_token` + example variations per endpoint | 🔴 Adoption (Sec D console already has token field, but explorer doesn't pre-fill) |
| No `aria-controls` | Add + `aria-describedby` for count | 🟢 Easy |
| 28 curated cards | **Living docs** — generate cards from `route:list --json` via CI, lint style — curated 28 stays as "featured" but full 213 is in `ROUTES-APPENDIX.md` + `showcase/docs.html` | 🟡 Drift risk |

## 5) Recommendations — ranked

### P0 — fixes for Sec E parity + a11y

* **R1 — Promote explorer to React components** `src/components/explorer/Explorer.tsx` (toolbar + `EndpointCard` + `EmptyState`) — `EndpointCard` renders `details` via Radix `Collapsible` or native `details` (keep native for no-JS, but wrap with `role="group"`). Fixes E3 (responsive `con-try` → flex row, not absolute). *S.*
* **R2 — A11y:** `aria-controls="apiCount apiEmpty"` on `input` + `aria-describedby` on selects → count; `role="status"` on empty card; `role="list"` on `gateway-map` + `gw-node` as `listitem`. Fixes E1/E4/E5. *XS.*
* **R3 — Pre-fill auth in try-it:** `Explorer` passes `token` from `sessionStorage` to `console.js` `try-it` (already has token field) — context-aware auth. *S.* (shared with Sec D console)

### P1 — search fidelity

* **R4 — Semantic search (light):** keep keyword `data-search` but add **fuzzy** + **intent synonyms** map (`{ "auth": ["login","token","jwt"], "pay": ["checkout","paymob","webhook"] }`) so "how do I authenticate" matches `login` + `register`. Full AI Q&A via `llms.txt` already exists — link it in explorer header. *S.*

### P2 — backlog

* **R5 — Generate 28 from `route:list` via CI** — curated stays as `featured` flag, but add `data-featured` for filtering.
* **R6 — SDK generation** — `OpenAPI → SDK` button in explorer header (future).

## 6) Metrics before (baseline file:// audit)

| Metric | Current |
|---|---|
| Explorer cards | 28 `details` |
| Filter controls | 1 search + 2 selects |
| `aria-live` regions | 1 (`#apiCount`) |
| `aria-controls` | 0 |
| Motion triggers | 0 (instant filter) |

## 7) References

* Files: `index.html` L310-470; `assets/js/features/explorer.js` (filterEndpoints, apiBase); `assets/js/lib/console.js` (Try injection)
* 2026 grounded: API explorer — try-it console (context-aware auth, example variations, error handling, SDK), semantic/AI search, `llms.txt` + `/openapi.json`, living docs via CI/CD, analytics.
