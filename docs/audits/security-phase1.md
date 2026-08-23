# Section F — Security Audit Ledger — Phase 1 Audit (Analyze + Evaluate)

**Date:** 2026-08-23 · **Scope:** `showcase/index.html` L490-513 (07 Security Audit, 10-row ledger) + `fullstack/Backend/docs/ROUTES-PERMISSIONS-AUDIT.md` gaps #1-#6  
**Baseline:** Sec E Explorer done (Topbar, Hero+KPI, canvases, BoardingPass, Lifecycle)

## 1) Inventory — 10 findings as a ledger

| # | Issue | Mitigation | Status |
|---|---|---|---|
| 01 | Password storage & reuse | bcrypt via Laravel hashing; registration rejects reused/breached patterns in validation | Implemented |
| 02 | Token theft / stale sessions | JWT refresh rotation (15/min throttle); logout blacklists server-side | Implemented |
| 03 | Unverified accounts acting | `verified` middleware gates every sensitive group; signed email links; OAuth requires real inbox click | Implemented |
| 04 | Forged payment callbacks | HMAC SHA-512 verified before any state transition; empty-secret prod boots fail-fast | Implemented |
| 05 | Credential stuffing / scraping | Per-surface throttle matrix (login·register·refresh·ai·checkout·weather·newsletter) + abuse tests | Implemented |
| 06 | Mass assignment | FormRequest `validated()` only; fillable audits per model; morph map enforced | Implemented |
| 07 | IDOR / cross-tenant reads | Policies + spatie permissions per route; agency scoping in policies | Implemented |
| 08 | SQL injection | Eloquent/bindings exclusively; no raw concatenation | Implemented |
| 09 | Secret leakage | `.env` never committed; `ENVIRONMENT.md` documents every key; CI-safe examples | Implemented |
| 10 | Blind spots in production | Pail dev logs + Telescope opt-in (prod-gated); APM absence as known gap | Partial |

*Markup:* `div.table-scroller > table.ledger` (4 cols) with `thead` + `tbody` 10 rows, `span.status.ok/mid`, `span.mono` for `verified`/`validated()`. `reveal` on section + table. Ledger already has `tbody tr:hover` gold tint.

**Section sources:** `index.html` L490-513 · `ROUTES-PERMISSIONS-AUDIT.md` §3 · `app/Http/Middleware/EnsureUserIsActive.php` · `app/Policies/*`

## 2) Bugs — reproduced file:// + ?motion=force

| # | Sev | Repro | Cause | Impact |
|---|---|---|---|---|
| **F1** | 🟡 Med | Ledger `table.ledger` at 360px requires horizontal scroll, but `div.table-scroller` has no `aria-label` or visible scrollbar affordance — user may not discover overflow | `overflow-x:auto` without `role="region" aria-label` | Keyboard/AT discoverability |
| **F2** | 🟢 Low | `span.mono` (`verified`, `validated()`, `.env`) has no `tabular-nums` — not needed (not numeric) but `code` style uses `JetBrains Mono` which is fine | None | Cosmetic |
| **F3** | 🟢 Low | `span.status.mid` (Partial) uses same gold tint as `ok` — visually not distinct for color-blind users | `status.ok` + `mid` both gold/emerald mix | A11y distinguishability |
| **F4** | 🟢 Low | React `Home.tsx` placeholder for security is still static `Section` — parity gap vs legacy ledger (user sees downgrade switching apps) | Sec F not yet migrated | Migration debt |

## 3) Accessibility audit

| Check | Result |
|---|---|
| Table semantics | ✅ `table > thead > tbody > tr > th/td`, `th` scope implicit via `thead` |
| Horizontal scroll keyboard | ⚠️ `div.table-scroller` needs `tabindex="0"` + `role="region" aria-label="Security audit ledger, scrollable"` so keyboard can reach overflow |
| Focus visibility | ✅ gold ring on table cells when `tabindex` added |
| Color contrast status pills on obsidian | ✅ `status.ok` emerald on `#0e1428` ~ 4.8:1, `mid` gold ~ 7:1 |
| Reduced-motion | ✅ no motion in ledger (hover tint is instant, `transition:background .15s` respects `prefers-reduced-motion` via global kill) |
| No-JS fallback | ✅ table visible static, no JS needed |

## 4) 2026 community standards — gap vs. target

**API security audit 2026** (grounded search): OWASP API Top 10 — **BOLA/BOPLA** (Broken Object Level Authorization) is #1 — every endpoint must validate object ownership, not just session; **agentic risk** (high-velocity enumeration, chain of calls) must be throttled + monitored; **JWT** hardcode `alg` (no `alg` header trust), prefer `RS256`/`ES256` over `HS256`, short-lived access (15m) + refresh, validate `exp`/`iss`/`aud`; **throttling** layered per-IP/per-user/per-endpoint with `429` + `Retry-After` via Token Bucket/Sliding Window, CI-tested; **ledger vs app logs** separate, tamper-evident, never log secrets/PII, alert on `401/403` spikes.

| Current | 2026 target | Gap |
|---|---|---|
| 10-row ledger covers BOLA (07), JWT (02), HMAC (04), throttling (05), mass assignment (06), SQLi (08), secrets (09) | Add **agentic enumeration** row: throttling + `429` + `Retry-After` + CI test for high-velocity `GET /api/review/{id}` enumeration (GAP #1 in audit doc) | 🟡 Ledger missing agentic row |
| Throttle matrix lists 7 surfaces | Layered `per-IP + per-user + per-endpoint` with `429` + `Retry-After` header — current `throttle:login` is per-IP only, not per-user | 🟡 Depth |
| JWT `HS256` via `tymon/jwt-auth` + `JWT_SECRET` | Prefer `RS256`/`ES256` for distributed verification; hardcode `alg` | 🟢 Future |
| Ledger is static `table` | **Tamper-evident audit log** separate from app logs (centralized, immutable) — ledger is showcase, not runtime log | 🟢 Out of scope for showcase, but note as gap 10 Partial |

## 5) Recommendations — ranked

### P0 — fixes for Sec F parity + a11y

* **R1 — Promote ledger to React component** `src/components/sections/SecurityLedger.tsx` — `table.ledger` with `thead` + `tbody` 10 rows, `span.status` as `Badge` CVA `ok`/`mid`, `code` as `tabular-nums` already, `div.table-scroller` with `tabIndex={0} role="region" aria-label="Security audit ledger, scrollable horizontally"` (fixes F1). *S.*
* **R2 — Status distinguishability:** `mid` (Partial) uses `warn` amber (`#f59e0b` bg `rgba(245,158,11,0.15)`) vs `ok` emerald (`#34d399`) — not same gold. Fixes F3. *XS.*
* **R3 — Keep 10th row as `Partial` with explicit next step:** "APM: add OpenTelemetry + `GET /up` burn-rate alerts for `401/403` spikes" — closes gap 10 with actionable item. *XS.*

### P1 — ledger depth (keeps 2026 bar without adding runtime)

* **R4 — Add agentic row 11:** Issue `High-velocity enumeration (agentic)` → Mitigation `Sliding window per-user + per-IP on BOLA-sensitive `GET /api/review/{id}` + `GET /api/v1/maps/trip/{trip}` + `429` + `Retry-After` + CI rate-limit test` — status `Planned`. Fixes gap vs 2026. *S.*

### P2 — backlog

* **R5 — Separate audit log vs app log note** in ledger footer: "Runtime audit logs → centralized tamper-evident store (not shown); this ledger is the static showcase audit."

## 6) Metrics before (baseline file:// audit)

| Metric | Current |
|---|---|
| Ledger rows | 10 (9 ok, 1 partial) |
| Scrollable regions with `role` | 0/1 |
| Status distinguishability | 2/3 (ok vs mid same hue) |
| Motion triggers | 0 (static table) |

## 7) References

* Files: `index.html` L490-513; `ROUTES-PERMISSIONS-AUDIT.md` §3; `assets/css/showcase.css` ledger styles
* 2026 grounded: OWASP API Top 10 BOLA/BOPLA + agentic enumeration, JWT `alg` hardcoding + `RS256`/`ES256` + short-lived, throttling layered Token Bucket/Sliding Window + `429`/`Retry-After`, ledger tamper-evident + data minimization.
