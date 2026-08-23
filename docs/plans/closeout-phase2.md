# Section I — Closeout — Phase 2 Plan (Planning)

**Date:** 2026-08-23 · **Scope:** `itinera-showcase-react` final sweep · **Depends on:** `docs/audits/tokens-parity-phase1.md` + all prior section patterns  
**Laws:** typed-data-first (no DOM scraping), copy-on-code-surfaces, RM-safe, legacy untouched, self-contained copy (no "legacy showcase" references).

## Goals

* Ship-quality closeout: fonts actually load, real head metadata, llms.txt/robots ported with per-guide wiki links.
* Zero stubs: 5 stub sections migrated + 4 absent sections built + footer — all data-driven from a single `home-content.ts`.
* Purge cross-reference copy.

## Dependency graph

```
C0 head/fonts/llms (independent, ships first)
   │
C1 lib/home-content.ts ── AUDIT_ROWS, STACK_ITEMS, FRONTEND_NOTES,
   │                        OPS_ITEMS, DEPLOY_STEPS, RISKS, ROADMAP, TEAM, DEMO_FLOW
   │        │
   │        ├── C2 stub migrations: audit(ledger), stack(grid), frontend(cards)
   │        ├── C3 absent builds: ops(timeline), deploy(steps+code), risks(table), demo(flow)
   │        └── C4 roadmap(track) + team(grid) + Footer + Home wiring + copy purge
```

## Content APIs (`lib/home-content.ts`, extracted from legacy index.html)

```ts
export const AUDIT_ROWS: { check: string; result: string; detail: string }[]
export const STACK_GROUPS: { group: string; items: { name: string; why: string }[] }[]
export const FRONTEND_NOTES: { title: string; body: string; stat?: string }[]
export const OPS_ITEMS: { label: string; value: string; note: string }[]      // telemetry counters
export const DEPLOY_STEPS: { n: string; title: string; detail: string }[]     // incl. code fences where legacy had them
export const RISKS: { risk: string; severity: "high"|"med"|"low"; mitigation: string }[]
export const DEMO_STEPS: { title: string; detail: string; href?: string }[]   // guided demo flow
export const ROADMAP: { status: "done"|"now"|"next"; item: string; note: string }[]
export const TEAM: { initials: string; name: string; role: string; focus: string }[]
```

Components: reuse existing primitives only — `Badge` (status), ledger table pattern (audit/risks), `CodeBlock` (deploy), disclosure cards (demo). New presentational bits kept inline in `Home.tsx` sections or tiny local components — no new abstractions.

Footer: brand mark + route Links (/docs, /wiki) + guide count + `AUDIT_DATE`-style stamp constant `SITE_UPDATED`.

## Task breakdown (vertical slices)

### Task C0 — Head / fonts / agent files (S)

**Desc:** React `index.html`: preconnect ×2 + Google Fonts css2 link (Inter 400..900, JetBrains Mono 400;600;800, Newsreader ital,wght@0,500;1,500), real `<title>` = "Itinera — Showcase · Luxury Travel Platform Engineering", meta description from legacy, keep `/favicon.svg`. Restore full sans fallback stack in @theme. Create `public/llms.txt` (H1 + intro, Pages → `/`, `/docs`, 9× `/wiki/{id}`, Key facts refreshed [213 api/* of 237 registrations, JWT+RBAC, PayMob HMAC, Groq, Railway/Docker], agent notes) + `public/robots.txt` (allow-all).

**Accept:**
- [ ] Fonts network-load on any page (devtools shows css2 fetch)
- [ ] Title/description match legacy wording
- [ ] `/llms.txt` lists all 11 routes; robots allow-all

**Verify:** build + read dist/index.html + dist/llms.txt. **Deps:** none. **Files:** `index.html`, `src/index.css`, `public/llms.txt`, `public/robots.txt`. **Scope:** S.

### Task C1 — Content extraction (L)

**Desc:** Extract all remaining section content from `showcase/index.html` (audit L199-217, stack L218-257, frontend L258-274, ops L539-575, deploy L576-611, risks L612-639, roadmap L640-664, demo flow L665-683, team L684-712, footer L713+) into `lib/home-content.ts` per API above. Faithful text, typed shapes.

**Accept:**
- [ ] Every legacy section has a typed counterpart; counts spot-checked vs source lines
- [ ] No HTML strings except where CodeBlock needs raw fence text

**Verify:** grep each export exists; visual diff against legacy while building C2-C4. **Deps:** none. **Files:** `lib/home-content.ts`. **Scope:** L.

### Task C2 — Stub migrations ×3 (M)

**Desc:** Replace `<Section id="audit|stack|frontend">` stubs with real sections driven by C1: audit → scroller-region ledger w/ Badge results; stack → grouped grid cards; frontend → stat cards. Self-contained copy.

**Accept:**
- [ ] Three stubs gone; sections render full legacy content
- [ ] Tables get role=region scrollers; badges distinguishable

**Verify:** build; no "Placeholder for" string remains for these ids. **Deps:** C1. **Files:** `pages/Home.tsx`. **Scope:** M.

### Task C3 — Absent builds ×4 (M)

**Desc:** Add ops (telemetry counter row + notes), deploy/testing (numbered steps w/ CodeBlock fences), risks (severity-badge ledger), demo flow (linked step cards reusing disclosure pattern) — inserted in legacy order between data and roadmap.

**Accept:**
- [ ] Four sections present in legacy order: …data → ops → deploy → risks → demo → roadmap…
- [ ] All interactive affordances keyboard-reachable

**Verify:** build + section id sweep matches legacy anchor names (ops/deploy/risks/demo). **Deps:** C1. **Files:** `pages/Home.tsx`. **Scope:** M.

### Task C4 — Roadmap / Team / Footer / purge (S)

**Desc:** Roadmap → status-track rows (done/now/next via Badge variants ok/mid/planned). Team → initials-avatar grid. Footer component (brand, route links, guides count, SITE_UPDATED stamp). Wire after team; purge legacy cross-reference copy at Home L83/L194/L206.

**Accept:**
- [ ] Zero "Placeholder for", zero "legacy showcase/docs.html" strings in src
- [ ] Footer renders on Home (Docs/Wiki already have their own chrome)
- [ ] Build green

**Verify:** grep sweeps + build. **Deps:** C1,C2,C3. **Files:** `pages/Home.tsx`, new `components/layout/Footer.tsx`. **Scope:** S.

## Checkpoint after C0–C4

- [ ] Fonts load; head real; llms.txt/robots live in dist
- [ ] Home has zero stubs; all 14 legacy sections present in order; footer ships
- [ ] No legacy-site references anywhere in UI copy
- [ ] `npm run build` green; bundle deltas only from content (no new heavy deps)

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Extraction drift across ~500 legacy lines | C1 acceptance ties exports to line ranges; verify visually during C2-C4 |
| Scope creep into redesigning old sections | Port faithfully; polish only obvious a11y/copy issues |
| Font CDN dependency offline | display=swap + system fallbacks already in place |

## Out of scope

sitemap.xml (marginal for single-origin SPA), OG/Twitter tags (parity gap both sides — backlog), redesigning legacy content, Wiki/Docs changes beyond nothing-needed.

## References

* Phase 1 audit: `docs/audits/tokens-parity-phase1.md`
* Grounded: three-file strategy (robots/sitemap/llms.txt), GEO conventions, Lighthouse agentic audit
