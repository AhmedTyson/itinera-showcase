# Section G — Docs Shell — Phase 2 Plan (Planning)

**Date:** 2026-08-23 · **Scope:** `itinera-showcase-react` Sec G · **Depends on:** Phase 1 audit `docs/audits/docs-shell-phase1.md` + Sec E/F primitives (Badge, ledger pattern, Topbar docs variant)  
**Laws:** RM (no motion in shell), keyboard-first (palette Ctrl K + Enter/Space trigger — fixes G1/G2), typed data over DOM scraping, copy on every code surface (G4), file:// legacy stays.

## Goals

* `<DocsPage>` = 3-pane shell (sidebar tree / article / TOC rail) with ≤lg collapse parity (sidebar→horizontal strip, TOC hidden).
* **CommandPalette** as required-pattern DX hub: Ctrl K global + Enter/Space on trigger (fixes G1/G2), fuzzy match over a **typed endpoint index** built from data lib (not DOM scan), count status live region.
* All 25 endpoints rendered via reusable `EndpointDisclosure` w/ method chips + throttle/auth chips + optional REQUEST/RESPONSE pair + **copy button on every code block**.
* Errors table reuses Sec F ledger pattern with `scope="col"`.

## Dependency graph

```
Sec E/F foundation (Topbar docs variant, Badge, ledger, @theme)
   │
   ├── lib/docs-data.ts ── single source: SIDEBAR_GROUPS, ENDPOINTS[25], SCHEMAS[2],
   │                        ERROR_ROWS[5], WEBHOOK_STEPS[6], APIDOG_STEPS[9], AUDIT_DATE
   │         │
   │         ├── CommandPalette ←─ fuzzy index built from ENDPOINTS + headings
   │         ├── DocsSidebar (tree from SIDEBAR_GROUPS)
   │         ├── TocRail (IO scrollspy from headings array)
   │         ├── CodeBlock (copy primitive — used everywhere)
   │         │      └── EndpointDisclosure (chips + optional kv2 pair via CodeBlock)
   │         └── DocsArticle (composes quickstart → auth → endpoints → schemas
   │                    → errors(ledger) → webhooks → apidog)
   │
   └── pages/Docs.tsx = Topbar(docs) + DocsShell(sidebar+article+toc) + CommandPalette
```

## Component APIs (ISP, DIP)

```tsx
// src/lib/docs-data.ts
export type Meth = "GET" | "POST" | "DELETE"
export type Endpoint = {
  id: string; meth: Meth; path: string; group: GroupId;
  chips?: string[]            // throttle:login, auth:api …
  body?: { req?: string; res?: string; label?: [string, string] } // kv2 pairs
  summary?: string            // summary-body prose when no kv2
}
export type GroupId = "account"|"catalog"|"trips"|"ai"|"commerce"|"chat"|"system"|"admin"
export const ENDPOINTS: Endpoint[]        // 25 rows, order = legacy DOM order
export const SIDEBAR_GROUPS: { title: string; links: { href: string; label: string }[] }[]
export const ARTICLE_HEADINGS: { id: string; text: string; level: 1|2|3 }[]  // TocRail + palette index
export const QUICKSTART_SH: string        // 11-line script
export const SCHEMAS: { id: string; title: string; json: string }[]
export const ERRORS: { code: string; name: string; fix: string }[]
export const WEBHOOK_STEPS: string[]      // 6 li
export const APIDOG_STEPS: { title: string; detail: string }[]  // 9 steps
export const AUDIT_DATE = "2026-08-21"

// src/components/ui/code-block.tsx
type CodeBlockProps = { code: string; lang?: string; label?: string }
export function CodeBlock({ code, lang }: CodeBlockProps): JSX.Element
// pre>code + copy btn top-right; copied state check-icon 1.2s; navigator.clipboard w/ textarea fallback

// src/components/ui/method-chip.tsx  (CVA) GET emerald / POST gold / DELETE rose

// src/components/palette/command-palette.tsx
type CommandPaletteProps = { open: boolean; onOpenChange(open: boolean): void }
export function CommandPalette(...): JSX.Element
// dialog role=modal, input autofocus, fuzzy filter (subsequence score) over index =
//   ARTICLE_HEADINGS + ENDPOINTS (label `${meth} ${path}`); ↑↓/↵/esc; count aria-live=polite
// Global: window keydown Ctrl/Cmd+K toggles; trigger button gets onClick + onKeyDown(Enter/Space)  ← G1/G2 fix

// src/components/docs/docs-sidebar.tsx   — nav tree from SIDEBAR_GROUPS; sticky; <lg horizontal strip
// src/components/docs/toc-rail.tsx       — entries from ARTICLE_HEADINGS; IO scrollspy active state; hidden <xl
// src/components/docs/endpoint-disclosure.tsx
type Props = { endpoint: Endpoint }
export function EndpointDisclosure(...): JSX.Element
// details>summary(meth chip + path mono + chips) + body(summary prose | kv2 pair of CodeBlocks)

// src/components/docs/docs-article.tsx   — hero pills → quickstart(CodeBlock) → auth sections
//                                          → 8 groups × EndpointDisclosure → schemas(CodeBlock ×2)
//                                          → errors ledger(scope=col) → webhooks ol → apidog ol
// src/pages/Docs.tsx                     — replaces placeholder; owns palette open state
```

Styling: shell grid `280px 1fr 220px` at ≥1280, `240px 1fr` md, single col <lg. Sticky sidebar/toc under topbar height (`useTopbarHeight`). RM-safe (no scroll animation).

## Task breakdown (vertical slices)

### Task G0 — Data single source (S)

**Desc:** Extract all content into `src/lib/docs-data.ts`: SIDEBAR_GROUPS (4 titles / 16 links), ENDPOINTS[25] in legacy order w/ chips+bodies, ARTICLE_HEADINGS (~20 incl h3s), QUICKSTART_SH, SCHEMAS[2], ERRORS[5], WEBHOOK_STEPS[6], APIDOG_STEPS[9], AUDIT_DATE const.

**Accept:**
- [ ] `ENDPOINTS.length === 25`; meth tally 10/14/1 (GET/POST/DELETE)
- [ ] Every endpoint has group ∈ GroupId; kv2 bodies only where legacy had them (weather, checkout-initiate, plan, register? verify vs audit L165–304)
- [ ] `ARTICLE_HEADINGS` ids match legacy anchor ids exactly (quickstart…apidog)
- [ ] No hardcoded date strings outside AUDIT_DATE (R8/G8 fix)

**Verify:** `rg -c "id:" src/lib/docs-data.ts` spot-checks; build pass. **Deps:** none. **Files:** `src/lib/docs-data.ts`. **Scope:** S.

### Task G1 — CodeBlock + MethodChip primitives (XS)

**Desc:** `ui/code-block.tsx` (pre>code, copy btn, copied ✓ 1.2s, clipboard+fallback) and `ui/method-chip.tsx` CVA (GET emerald/POST gold/DELETE rose).

**Accept:**
- [ ] Copy works file:// (textarea fallback) — fixes G4 at primitive level
- [ ] Chip colors distinct + text always visible

**Verify:** manual render test in story route; build green. **Deps:** none. **Files:** `ui/code-block.tsx`, `ui/method-chip.tsx`. **Scope:** XS.

### Task G2 — CommandPalette (M)

**Desc:** Modal dialog component per API above. Fuzzy subsequence scoring (lower = better rank; simple `score(query, candidate)` util). Keyboard: global Ctrl/Cmd K toggle, Esc close, ↑↓ move, ↵ jump (scrollIntoView smooth unless RM → auto). Index = ARTICLE_HEADINGS ∪ ENDPOINTS. Count status polite. Trigger wiring exported as hook `usePaletteTrigger(ref)` applying onClick+onKeyDown Enter/Space — kills G1+G2.

**Accept:**
- [ ] Ctrl K opens/closes from any page focus state
- [ ] Trigger button operable via Enter AND Space (G1 fix); no dead `#docSearch` binding anywhere (G2 fix)
- [ ] Fuzzy: typing `usr` ranks `GET /api/users`; empty query shows first N w/ count
- [ ] aria-modal dialog, focus trapped, returns focus to trigger on close
- [ ] `role="status" aria-live="polite"` count updates on filter

**Verify:** headless: keydown events; assert dialog visible, results reorder, Esc restores focus. **Deps:** G0. **Files:** `palette/command-palette.tsx`, `lib/fuzzy.ts`. **Scope:** M.

### Task G3 — Sidebar + TocRail (S)

**Desc:** `DocsSidebar` from SIDEBAR_GROUPS (sticky, section titles + links, active link state via hash). `TocRail` from ARTICLE_HEADINGS + IO scrollspy (rootMargin tuned to topbar offset), active heading highlighted, hidden below xl.

**Accept:**
- [ ] Sidebar renders 4 titled groups / 16 links, external Markdown link last
- [ ] Scrollspy tracks current h2/h3 while scrolling article
- [ ] <lg: sidebar collapses to horizontal scrollable strip; toc unmounted (< xl)

**Verify:** headless resize widths 1440/1024/768 — assert grid columns + toc presence. **Deps:** G0. **Files:** `docs-sidebar.tsx`, `toc-rail.tsx`. **Scope:** S.

### Task G4 — EndpointDisclosure + DocsArticle (L)

**Desc:** `EndpointDisclosure` renders details>summary (chip+path+chips) + body (summary prose OR kv2 pair of CodeBlocks w/ labels REQUEST/RESPONSE or QUERY/RESPONSE). `DocsArticle` composes full legacy flow using G0 data: hero kicker+pills+divider, Quickstart CodeBlock, auth 4 subsections (jwt uses disclosure-style pair), endpoints intro, 8 groups mapping ENDPOINTS by group, Schemas ×2 CodeBlock (now with copy — G4 closed at schema level too), Errors ledger table (`scope="col"` — G6 fixed) reusing Sec F table classes, Webhooks ordered list ×6, Apidog steps ×9 (**no vestigial wrapper** — G5 fixed), footer divider + back link + AUDIT_DATE stamp.

**Accept:**
- [ ] 25 disclosures present, grouped under correct h3 anchors
- [ ] Every code block (qs, jwt pair, trips php?, plan pair, checkout pair, schemas ×2) has working copy — G4 fully closed
- [ ] Errors table 5 rows, `th scope="col"` ×3
- [ ] Apidog section has no `.guide-search` equivalent wrapper — G5 closed
- [ ] Footer stamp reads AUDIT_DATE constant

**Verify:** headless counts (details=25, copy buttons ≥8, scope=col=3); build green. **Deps:** G0,G1. **Files:** `docs-article.tsx`, `endpoint-disclosure.tsx`. **Scope:** L.

### Task G5 — Shell + Docs page wiring (S)

**Desc:** `DocsShell` layout (grid + responsive collapse) composing sidebar/article/toc; `pages/Docs.tsx` replaces placeholder: Topbar variant="docs" + DocsShell + CommandPalette (open state here, trigger in Topbar docsearch slot wired through usePaletteTrigger).

**Accept:**
- [ ] Route `/docs` renders full shell; Ctrl K works; palette navigates & closes
- [ ] Grid collapse parity: 3-col ≥1280 / 2-col md / 1-col <lg (sidebar strip)
- [ ] Build green; no console errors

**Verify:** headless viewport sweep + palette e2e microflow. **Deps:** G2,G3,G4. **Files:** `docs-shell.tsx`, `pages/Docs.tsx`. **Scope:** S.

## Checkpoint after G0–G5

- [ ] `npm run build` green
- [ ] Palette: Ctrl K, Enter/Space trigger, fuzzy, count, focus restore — G1/G2 dead
- [ ] Copy on every code surface — G4 dead
- [ ] scope=col + no guide-search + AUDIT_DATE single source — G5/G6/G8 dead
- [ ] Legacy `showcase/docs.html` untouched

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Content extraction drift (25 endpoints, exact chip/body pairing) | G0 acceptance cross-checks against phase-1 line map before any UI work |
| Fuzzy quality feels off | Keep scorer tiny + deterministic; rank ties break by original order |
| Focus trap complexity | Reuse Radix Dialog if already installed (Sec A used it for Sheet) — else minimal trap util |
| Scrollspy jitter near section boundaries | rootMargin -40%/-55% band + threshold 0 |

## Out of scope

Live try-it console (Home Explorer covers interactive demo; R10 backlog). MDX/auto-gen sync. Theme/version switching actions inside palette (R9 backlog). Wiki reader hydration (Sec H).

## References

* Phase 1 audit: `docs/audits/docs-shell-phase1.md`
* Grounded: palette required pattern (Cmd K/fuzzy/actions), one-click copy everywhere, IO scrollspy standard, sidebar backbone + mini-toc, reduced-friction DX
