# Section I — Tokens / llms.txt / Cross-page QA — Phase 1 Audit (Analyze + Evaluate)

**Date:** 2026-08-23 · **Scope:** `itinera-showcase-react` vs `showcase` — token parity, AI-agent metadata, placeholder/section sweep, head parity, closeout punch list  
**Baseline:** Sec H Wiki Reader done

## 1) Inventory

### Design-token parity (`showcase.css :root` → React `index.css @theme`)

| Legacy var | Value | React token | Status |
|---|---|---|---|
| --bg-0/-1/-2 | #05070d / #0a0f1e / #10182e | --color-bg-0/1/2 | ✅ MATCH ×3 |
| --bg-3 | #162040 | — | ❌ MISSING |
| --panel | rgba(14,20,40,.8) | --color-panel-soft (same value) | ⚠️ renamed |
| --panel-solid | #0e1428 | --color-panel | ✅ MATCH (renamed) |
| --border / --border-strong | #1e2a4a / #2a3a62 | same names | ✅ MATCH ×2 |
| --text / --muted / --dim | #e6eaf5 / #9aa3c2 / #93a0bf | same | ✅ MATCH ×3 |
| --primary / -2 | #fbbf24 / #d97706 | + alias --color-gold | ✅ MATCH ×2 |
| --accent / --warn / --danger | #34d399 / #f59e0b / #ef4444 | --color-* | ✅ MATCH ×3 (--accent-2 dup dropped, fine) |
| --mono / --serif | JetBrains Mono / Newsreader | --font-mono / --font-serif | ✅ MATCH |
| --sans | Inter + Segoe UI + Roboto stack | Inter + system-ui only | ⚠️ minor truncation |

**Critical finding:** fonts declared but **never loaded** — no Google Fonts link in React index.html; legacy loads Inter/JetBrains Mono/Newsreader + Font Awesome 6.5.1. React falls back to system fonts.

### llms.txt / robots / sitemap

* Legacy `llms.txt` EXISTS (24 lines: H1 + intro blockquote, Pages ×3, Key facts ×5 [237 routes, JWT+RBAC, PayMob, Groq, Railway/Docker], agent-interaction notes ×3).
* React `public/`: MISSING.
* robots.txt / sitemap.xml: absent both sides.

### Placeholder sweep (React src)

* No TODO/Lorem/Coming-soon hits.
* **5 stub sections** in Home.tsx via reusable `<Section>` stub ("Placeholder for {title}…"): audit L121, stack L122, frontend L123, roadmap L250, team L251.
* Legacy cross-reference copy leaking into UI: Home.tsx L83 ("opens in showcase/docs.html"), L194 ("scrub in legacy"), L206 ("console drawer in the legacy showcase").

### Section parity (legacy index.html vs React Home)

Done: architecture, design/boardpass, gateway (lifecycle+explorer+throttle), security ledger, data/ER canvas, hero+KPI.
Stub only: audit, stack, frontend, roadmap, team.
**Absent entirely:** ops/telemetry (L539), deploy/testing (L576), risks (L612), demo flow (L665), footer (L713).

### Head parity

* React title = stock Vite "itinera-showcase-react" — MISMATCH; meta description MISSING; favicon svg-vs-png differs; OG/Twitter absent on both (parity).

### Routes/pages

App.tsx: `/`, `/docs`, `/wiki`, `/wiki/:guideId`, `*`→Home. Docs shell complete, Wiki complete, Home partial (as above). No other legacy pages exist (only 3 top-level .html).

## 2) Bugs / gaps ranked

| # | Sev | Finding |
|---|---|---|
| I1 | 🟡 Med | Fonts never loaded — entire typographic identity (Inter/JBMono/Newsreader) silently degrades to system fallbacks across all pages. |
| I2 | 🟡 Med | Stock Vite title + missing meta description — SEO/social first impression broken. |
| I3 | 🟡 Med | 9 content gaps: 5 stub sections + 4 absent (ops, deploy/testing, risks, demo flow) + footer missing. |
| I4 | 🟢 Low | llms.txt not ported — agent-facing map missing (2026: GEO layer; Lighthouse ≥13.3 audits it). |
| I5 | 🟢 Low | Legacy cross-references in shipped copy (Home.tsx ×3). |
| I6 | 🟢 Low | Token drift trivia: --bg-3 unused-in-React (fine), sans stack truncated, panel rename undocumented. |

## 3) Accessibility / QA notes

* Focus-visible ring + ::selection + RM kill-switch present in @theme (React-only wins over legacy).
* Palette Ctrl K verified wired on Docs + Topbar dispatch path; Wiki owns entries.
* No keyboard traps found in new components (Radix dialogs manage focus).

## 4) 2026 community standards — gap vs target

Grounded search: llms.txt = community convention (not formal standard); value is GEO for docs-heavy sites; three-file strategy: robots.txt (access control incl. GPTBot/Google-Extended consent) + sitemap.xml (discovery) + llms.txt (curated context); Lighthouse now audits agentic browsing; keep markdown structure simple, low token-tax.

| Current | 2026 bar | Gap |
|---|---|---|
| No llms.txt in React public | Curated markdown map at /llms.txt | 🟡 I4 |
| No robots/sitemap either side | Three-file strategy | 🟢 Optional (SPA showcase, single origin) |
| Fonts unloaded | Self-host or preconnected webfonts w/ display=swap | 🟡 I1 |
| Stock head | Real title/description/favicon | 🟡 I2 |

## 5) Recommendations — ranked

### P0 — closeout blockers

* **R1 — Load fonts**: Google Fonts `<link>` (preconnect ×2 + css2 families Inter 400–900, JetBrains Mono 400/600/800, Newsreader ital,wght 500) in React index.html + restore full sans fallback stack. *XS.*
* **R2 — Fix head**: real `<title>` (match legacy), meta description, favicon decision (keep `/favicon.svg`; add png alt via link if trivial). *XS.*
* **R3 — Port llms.txt** → `public/llms.txt`, updated for React routes (`/`, `/docs`, `/wiki/{guide}` per-guide links beat 3-page list) + refresh key facts (213 api/* deployed of 237 registrations). Add robots.txt allow-all while touching files. *S.*
* **R4 — Kill stubs**: migrate remaining 5 sections (audit, stack, frontend, roadmap, team) from legacy index.html into data-driven components — reuse established patterns (KPI pills, ledger tables, disclosure cards). *L.*
* **R5 — Build 4 absent sections + footer**: ops/telemetry, deploy/testing, risks, demo flow, site footer. Same patterns; footer = brand + route links + audit stamp constant. *M.*

### P1 — polish

* **R6 — Purge legacy cross-references** in Home copy ×3 (rewrite as self-contained phrasing). *XS.*
* **R7 — Document token renames** in index.css comment header (panel↔panel-solid mapping, bg-3 intentionally dropped). *XS.*

### P2 — backlog

* sitemap.xml (single-origin SPA — marginal), OG/Twitter tags (both sides lack; add when sharing matters).

## 6) Metrics before (baseline)

| Metric | Value |
|---|---|
| Token match rate | 14/17 exact (+2 renamed, 2 dropped-by-design) |
| Fonts loaded | 0 of 3 families |
| Stub sections | 5 |
| Absent sections | 4 + footer |
| llms.txt | ported ❌ |
| Head quality | stock Vite |

## 7) References

* Files: `src/index.css` (@theme), `showcase/assets/css/showcase.css` (:root), `showcase/llms.txt`, `public/*`, `src/pages/Home.tsx` stubs L121-123/L250-251, `index.html`
* Grounded: llms.txt GEO convention + three-file strategy + Lighthouse agentic audit
