# OpsConsole — Docs Coverage Audit & Diagram Fit Redesign Plan

## Audit — Docs vs Section (like we did for 04)

**Current `TELEMETRY` 8 chips → `docs/wiki/phases` 15:**
- `database` → `05-DATABASE-SCHEMA.md` ERD slice ✓
- `2 jobs` → `12-DEPLOYMENT` queue:work ✓
- `2 listeners` → `03-WEBHOOKS` FulfillOrder ✓
- `llama-3.3-70b` → `06-AI-QUOTA` md5/cache ✓
- `GET /up` → `12-DEPLOYMENT` health probe ✓ (also `14-PERFORMANCE` p95)
- `stack · single` → `14-PERFORMANCE` log/pail ✓
- `opt-in` → `12` telescope opt-in ✓
- `7 templates` → `welcome…` mail preview ✓

**Missing / thin from docs:**
- `01 ARCHITECTURE` System Context (Client→Nginx→Laravel→DB/Cache/Paymob/AI) — not previewable, only in `01` doc callout.
- `02 COMMERCE` Checkout idempotency `idemp-a1b2` — we have it as `Idempotency` in 04 hardening, but console has no `checkout initiate` chip.
- `04 SECURITY` 9-limiter matrix + `08 EXCEPTION` `{error:{type}}` + `07 API` 106 ops matrix — chips show `database` not `throttle:*` or `422`.
- `09 FRONTEND` Vite/React + `10 DESIGN` tokens + `11 GSAP` scrub — no chip.
- `13 TESTING` `sqlite :memory:` + 18 vitest scrub mocks — no chip (console shows `test --filter=Verification` only as static TERM_LINES, not chip).
- `15 ONBOARDING` `migrate:fresh --seed` — chip shows `migrate:status` not `migrate:fresh`.

**Diagram correctness (after fix):** 8 flowcharts now parse (`flowchart LR User --> Order`, `Cache -->|hit| Return`, `sequence W->>L`), but 5 are generic `A-->B-->C` placeholders — not wiki-accurate slices. `database` `User→Order→Payment + Trip→Itinerary` merges two domains in one chart (should be `USER ||--o{ ORDER` erDiagram for schema, or `migrate:status` table).

**Fit — before fix:** preview `max-h-[140px] overflow-auto` forced scroll, `erDiagram` failed → `<pre>` fallback `600px` wide, section `min-h-[380px]` cramped. After fix `min-h-[200px] flex center` + `& svg max-h-[220px] w-full` fits width, but dialog `max-h-[70vh]` still crops `erDiagram` 2-row (Trip row cut).

## Redesign Plan — Diagram Fits & Better (like §03)

**Goal:** Every chip's preview is a **wiki-accurate, width-fitted, no-scroll** diagram that explains itself — clicking enlarges to resizable dialog with full pan.

**Design (keep 2-col, make preview primary):**
- **Section higher:** `py-20 lg:py-24` + console `min-h-[560px] grid-rows [1fr_auto]` — already done, keep.
- **Preview fits:** Change `MermaidDiagram` wrapper to `w-full h-auto` + `svg {width:100%; height:auto; max-height: min(220px, 28vh)}` + `preserveAspectRatio xMidYMid meet`. Remove `max-h-[140px] overflow-auto` inner scroll; let diagram shrink to fit. Add `object-fit: contain` via `viewBox` scaling (mermaid already emits viewBox).
- **Correctness — replace 8 diagrams with wiki slices:**
  - `database` → slice `05` ERD (USER ||--o{ ORDER, ORDER ||--o{ PAYMENT, TRIP ||--o{ ITINERARY_ITEM) — use `erDiagram` with `direction LR` and 4 entities, not generic flowchart.
  - `2 jobs` → `GenerateReport | GeocodeDestination` flowchart with `database queue → redis-ready` note.
  - `2 listeners` → `sequence PaymentSucceeded → FulfillOrderListener → Subscription + AI quota reset` (from `03` + `06`).
  - `llama` → `flowchart TD Client --> Cache -- hit --> Return + miss --> Groq --> fallback` (from `06`).
  - `GET /up` → `health → DB → queue → 200 OK` (from `12`).
  - `stack` → `Request → Log → Pail` (from `14`).
  - `opt-in` → `App --> Telescope (opt-in)` (from `12`).
  - `7 templates` → `Mailable → Preview → Inbox` with `welcome·booked·paid` chips.
  - **Add 4 chips** to cover gaps: `throttle:checkout` → `9 limiters` matrix, `Exception 422` → flat bag, `GSAP scrub` → `pin + scrub 0.45`, `test` → `sqlite :memory:` (or merge into existing).
- **Interaction — enlarge:** Preview `button` → `DialogRoot` `DialogContent class="w-[min(1100px,92vw)] h-[min(720px,85vh)] resize overflow-auto"` — already done, keep. Add `Fit` toggle: `scale-90` vs `scale-100` for wide ERDs, and `Copy SVG` copies `innerHTML` (already).
- **Light/dark:** Console stays `#0c1322` even in `html.light` (terminal invariant) — diagrams use `theme: base` for light, `dark` for dark via `ensureMermaid(theme)` already.

**Tasks (S/M, build+test green each):**
- T-D1: Replace 8 `diagram` strings with wiki-accurate slices (valid mermaid, ≤5 nodes, `flowchart`/`sequence`/`erDiagram` as per doc) — `home-content.ts:143`.
- T-D2: Preview fit — remove `max-h overflow-auto`, set `min-h-[200px] flex items-center justify-center` + `svg max-h-[200px] w-full` — `OpsConsole.tsx:176` + `mermaid-diagram.tsx` wrapper.
- T-D3: Section height polish — keep `py-20` + `min-h-[560px]` + dialog `resize` handle hint `Drag corner to resize`.

Verification: click each chip → preview SVG fits width, no scroll bar; enlarge → resize drag expands without cropping; `npm run build` + light toggle flips diagram theme.
