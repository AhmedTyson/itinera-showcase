# Section D — Boarding Pass + Gateway — Phase 1 Audit (Analyze + Evaluate)

**Date:** 2026-08-23 · **Scope:** `showcase/index.html` L276-310 (Boarding Pass live) + L294-370 (Gateway lifecycle + explorer) + `assets/js/features/boarding.js` (bpGenerateBarcode, bpResolveCode, bpInit)  
**Baseline:** Sec C Arch+ER done (Topbar, Hero+KPI, canvases live)

## 1) Inventory — two linked showcases

### Boarding Pass — live component (design language proof)
* **Markup:** `section#design` → `select#bpSelect` (280px, 1 offline sample `EG-102 ASF→MRV $117.48`) + `button#bpLoadBtn` (fetch) + `button#bpCopyBtn` + `div#bpRoot.reveal` (render target) + chip row (gold, hazard, perforation, barcode, mono, serif).
* **Renderer:** `boarding.js` `bpRender(flight)` → barber-pole hazard strip (135°), perforated stub (dashed 1px), gold boarding-pass ticket with flight number/route/price, barcode SVG `160×30` (34 bars, `bpGenerateBarcode()`), JetBrains Mono numerals + Newsreader italic display, world-map watermark. Same code as `fullstack/Frontend/assets/js/flight-details.js` — parity by design.
* **Live path:** `bpLoadBtn` → `fetch(apiBase()+'/flights')` → populate `bpSelect` with live options → `fetch(apiBase()+'/flights/'+id)` → `bpRender` with live `FlightResource` fields; offline fallback to sample on `!r.ok` or `catch` → `notify("Backend offline — showing offline sample ticket")` (toast).
* **Copy:** `bpCopyBtn` → `navigator.clipboard.writeText(bpRoot.innerHTML)` → `notify` on deny.
* **Motion S5:** `initScenes` observes `#bpRoot` → `gsap.from(pass,{y:64,rotate:-2.4,scale:.94,opacity:0})` on first view.

### Gateway — lifecycle + explorer
* **Lifecycle:** `.lifecycle` (6 `.lc-step`: Checkout initiate → Intention → Hosted checkout → HMAC webhook → Fulfillment → Receipt & mail) — S4 scrub `y:24→0` stagger + `boxShadow` highlight per step.
* **Throttle map:** `.gateway-map` 6 `.gw-node` (login/register/refresh/ai/checkout/weather) — static pills, no canvas.
* **API Explorer:** `.toolbar` with `input#apiSearch` + `select#apiFilter` (All/account/catalog/trips/commerce/system/admin) + `select#apiMeth` + `span#apiCount[aria-live=polite]` + `div#apiEmpty` (no-match card) + 28 `<details class="endpoint" data-cat data-meth data-search>` (each `summary` with `.meth` + `.path` + chips, `ep-body` with `REQUEST`/`RESPONSE` `.code` blocks) + guide-search card (Apidog 4 steps). Filter via `filterEndpoints()` (hide/show + `aria-live` count + empty toggle). S2 pin? No — explorer is not pinned.
* ** apidog guide:** `card guide-search` 4-step `ol.guide-step`.

**Section sources:** `index.html` L276-310 + L294-370 · `assets/js/features/boarding.js` · `assets/js/features/scenes.js` S4+S5

## 2) Bugs — reproduced file:// + ?motion=force

| # | Sev | Repro | Cause | Impact |
|---|---|---|---|---|
| **D1** | 🟡 Med | Boarding pass `#bpRoot` empty on first paint for 1.2s until `bpInit` renders sample — CLS as hazard bar + ticket pop in | `bpInit` runs on `DOMContentLoaded` + `fetch` for flight list (async) before first render | Layout shift, not a11y break but Awwwards polish fail |
| **D2** | 🟡 Med | `select#bpSelect` has 1 static option, but after live fetch it appends 5-10 more without clearing the offline sample → duplicate `ASF→MRV` appears twice | `bpLoadBtn` fetch appends without `innerHTML=""` clear, only adds | Duplicate option, minor confusion |
| **D3** | 🟢 Low | `button#bpCopyBtn` copies `innerHTML` (includes `<svg>` barcode) — pasting into email shows raw HTML, not a shareable image | `writeText(bpRoot.innerHTML)` vs `writeText(bpRoot.innerText)` + optional `toDataURL` for barcode | UX debt |
| **D4** | 🟢 Low | Lifecycle `.lc-step` at 360px stacks vertically but `S4` scrub still expects horizontal `stagger .16` — feels slow on mobile | `gsap.set(steps)` + scrub `stagger .16` tuned for desktop 6-across | Motion feels off on mobile, not broken |
| **D5** | 🟢 Low | Explorer `input#apiSearch` has no `aria-controls="apiCount"` association, and `select` filters have no `aria-label` visible text beyond `aria-label` attribute (ok) but no `aria-describedby` for count | Minor AT verbosity | Add `aria-controls` |
| **D6** | 🟢 Low | React `Home.tsx` placeholder for gateway is still static `Section` — parity gap vs legacy (user sees downgrade switching apps) | Sec D not yet migrated | Migration debt |

## 3) Accessibility audit

| Check | Result |
|---|---|
| Boarding pass `select` + `button` keyboard | ✅ native `select` + `button`, tab order logical |
| Boarding pass `aria-live` on offline fallback | ✅ `notify()` toast is `role="status"` polite (via `ITN.toast`) |
| Lifecycle `lc-step` semantics | ⚠️ `div.lc-step` with `h4+p` — no `role="list"`/`listitem`, no `aria-current` on active step during scrub |
| Explorer `details/summary` keyboard | ✅ native `details` handles `Space`/`Enter`, `aria-expanded` auto |
| Explorer `aria-live` on count | ✅ `span#apiCount[aria-live=polite]` updates via `filterEndpoints` |
| Reduced-motion | ✅ S4/S5 gated `isRM()` + `?motion=force`; RM → static ticket + static lifecycle |
| No-JS fallback | ✅ `#bpRoot` shows sample ticket via server-rendered HTML? Actually `bpInit` renders sample via JS only — without JS, `#bpRoot` is empty (no ticket). Should have static fallback HTML inside `#bpRoot` |

## 4) 2026 community standards — gap vs. target

**Boarding pass 2026** (grounded search): functional hierarchy — Gate/Seat/Boarding Time most prominent, logical grouping, high contrast (70%+), 12pt+ sans-serif, generous whitespace, live updates for gate/time, QR/barcode with human-readable fallback, print at 3.5"×8.5" 300DPI CMYK with 3mm bleed.

**Gateway lifecycle 2026:** stepper with `aria-current="step"` + `role="list"`, vertical on mobile, horizontal on desktop, scrub-linked highlight is 2026 kinetic bar but must keep `aria-current` in sync.

| Current | 2026 target | Gap |
|---|---|---|
| Boarding pass `div#bpRoot` innerHTML string | **`<BoardingPass flight={flight} />` React component** with props (`flightNumber`, `route`, `price`, `barcodeData`), `forwardRef` for print, `useReactToPrint` pattern | 🔴 Reusability + print |
| No-JS empty `#bpRoot` | **Static fallback HTML** inside `#bpRoot` (offline sample ticket as server-rendered markup, JS enhances to live) | 🟡 a11y |
| Copy `innerHTML` | **Copy `innerText` + optional `canvas.toDataURL` for barcode** + `aria-live` "Copied" | 🟢 UX |
| Lifecycle `div.lc-step` | **`role="list"` + `role="listitem"` + `aria-current="step"`** on active, vertical on mobile via `grid` not absolute | 🟡 a11y |
| Explorer `input` + `select` filters | **shadcn `Command` + `Select`** with `aria-controls` + `aria-describedby` for count | 🟢 polish |

## 5) Recommendations — ranked

### P0 — fixes for Sec D parity + a11y

* **R1 — Promote boarding pass to React component** `src/components/sections/BoardingPass.tsx` — props `flight: Flight | null` (`flightNumber`, `from`, `to`, `price`, `barcodeValue`), renders hazard strip + perforated stub + barcode SVG (pure, no `innerHTML`), `forwardRef` for print, `aria-label="Boarding pass for flight {number}"`. Fixes D3 (copy `innerText`) + D1 (CLS via `min-h` placeholder). *S.*
* **R2 — Static fallback HTML** inside `#bpRoot` / `BoardingPass` skeleton: offline sample ticket as server-rendered markup (no JS needed), JS `fetch` replaces it when live. Fixes no-JS empty. *XS.*
* **R3 — Lifecycle a11y:** `role="list"` on `.lifecycle` + `role="listitem"` + `aria-current="step"` on active `lc-step` (scrub timeline updates `aria-current` in `onUpdate`). Mobile vertical via `grid` already, but ensure `stagger` feels right (reduce to `.10` on `<768px` via `matchMedia`). Fixes D4 + a11y. *S.*
* **R4 — Explorer a11y:** `aria-controls="apiCount"` on `input#apiSearch` + `aria-describedby` on selects → count. *XS.*

### P1 — motion fidelity

* **R5 — Keep S4/S5 but harden:** S4 `anticipatePin:1` already, S5 `gsap.from(pass)` on `IntersectionObserver` already — keep. Add `overflow:clip` to gateway wrapper if pinned later. *XS.*

### P2 — backlog

* **R6 — Print stylesheet for boarding pass** — `@media print` hides hazard bar animation, ensures `background: white` + `color: black` for ticket, 300DPI via `width: 3.5in`.
* **R7 — Live gate/time updates** — if backend pushes via websocket, `BoardingPass` subscribes to `flight:{id}:update` (future).

## 6) Metrics before (baseline file:// audit)

| Metric | Current |
|---|---|
| Boarding pass nodes | 1 `#bpRoot` + 1 `select` + 2 buttons |
| Lifecycle steps | 6 `.lc-step` |
| Explorer endpoints | 28 `<details>` |
| Tab stops to pass gateway | ~8 (toolbar + 28 summaries) |
| Motion triggers (S4+S5) | 2 (lifecycle scrub + pass flourish) |

## 7) References

* Files: `index.html` L276-310 + L294-370; `assets/js/features/boarding.js` (barcode, `bpInit`); `assets/js/features/scenes.js` S4/S5
* 2026 grounded: boarding pass functional hierarchy + 12pt sans-serif + high contrast + live updates + print 3.5"×8.5" 300DPI.
