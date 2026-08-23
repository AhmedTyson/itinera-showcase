# Section H — Wiki Reader — Phase 2 Plan (Planning)

**Date:** 2026-08-23 · **Scope:** `itinera-showcase-react` Sec H · **Depends on:** Phase 1 audit `docs/audits/wiki-reader-phase1.md` + Sec G primitives (CodeBlock, palette, Topbar)  
**Laws:** RM-safe (mermaid static fallback), keyboard-first, typed data single source (kills H3), copy on every code surface (H7), first-party md only (rehype-raw OK), legacy wiki.html untouched.

## Goals

* `/wiki/:guideId?` route renders one of 9 guides from real markdown via react-markdown pipeline — greenfield hydration replacing the 903-line static HTML.
* Single typed GUIDES source drives sidebar + reader + pager + palette index.
* Mermaid fences render as diagrams (lazy mermaid pkg); code blocks get copy; headings auto-slug w/ deep links; scrollspy active states; prev/next pager.

## Dependency graph

```
Sec G foundation (Topbar, CodeBlock, CommandPalette, useScrollTo)
   │
   ├── public/wiki/*.md ── 9 files copied from showcase/assets/wiki/ (URL-encoded names)
   │         │
   │         └── lib/wiki-data.ts ── GUIDES[9] {id,title,file,group,order}
   │                   │
   │                   ├── WikiShell (route /wiki/:guideId?) ── sidebar + article + pager
   │                   │        ├── MarkdownReader (react-markdown pipeline, memoized, lazy chunk)
   │                   │        │        ├── CodeBlock (reuse G1)
   │                   │        │        └── MermaidDiagram (dynamic import, lazy)
   │                   │        └── TocRail-style scrollspy (reuse pattern from G3)
   │                   └── CommandPalette index += GUIDES (on /wiki route)
   │
   └── Topbar fix: burger rendered only when functional (R5/H1)
```

## Component APIs (ISP, DIP)

```tsx
// src/lib/wiki-data.ts
export type Guide = { id: string; title: string; file: string; blurb: string }
// file = URL-encoded filename under /wiki/ e.g. "System%20Overview.md"
export const GUIDES: Guide[]   // 9 entries, order = reading order (overview → api)

// src/components/wiki/markdown-reader.tsx
type Props = { content: string }   // raw md string
export const MarkdownReader = React.memo(function MarkdownReader(...): JSX.Element)
// ReactMarkdown(remarkPlugins:[remarkGfm], rehypePlugins:[rehypeSlug, rehypeRaw])
// components map: h1..h4 styled+autolink, table→styled table wrapper (role=region scroller),
//   code(fence)→CodeBlock | MermaidDiagram when lang==mermaid, blockquote→cite style,
//   a→internal scrollTo vs external new-tab

// src/components/wiki/mermaid-diagram.tsx
type Props = { chart: string }
export function MermaidDiagram(...): JSX.Element
// dynamic import("mermaid") once; render into div ref via mermaid.render(id, chart)
// RM or load-fail fallback: <pre> with raw chart text. aria role="img" aria-label="Mermaid diagram"

// src/lib/use-guide.ts
export function useGuide(guideId?: string): { guide: Guide; content: string|null; error: string|null; loading: boolean }
// fetch(`/wiki/${guide.file}`) → text; caches in module-level Map; encodes name; error state for missing file

// src/pages/Wiki.tsx (replaces placeholder)
// useParams guideId (default GUIDES[0].id); WikiShell layout:
//   sidebar (GUIDES numbered list, aria-current active, <lg horizontal strip)
//   + article (MarkdownReader + prev/next pager + raw-source pill)
//   + right-rail heading scrollspy (reuse IO pattern)
```

Routing: react-router already installed. Route `/wiki` and `/wiki/:guideId`. Section anchors inside rendered md work via native hash + scroll-mt.

## Task breakdown (vertical slices)

### Task W0 — Content + data (S)

**Desc:** Copy 9 `.md` files from `showcase/assets/wiki/` to `public/wiki/` (URL-encoded filenames). Create `lib/wiki-data.ts` GUIDES[9] with id/title/file/blurb matching legacy reading order.

**Accept:**
- [ ] 9 files present in `public/wiki/`, names encoded (no raw spaces)
- [ ] GUIDES ids stable kebab-case (`overview`, `setup`, … `api`)
- [ ] fetch of each file returns 200 via vite dev server

**Verify:** `Get-ChildItem public/wiki` count 9; spot fetch one file. **Deps:** none. **Files:** `public/wiki/*`, `src/lib/wiki-data.ts`. **Scope:** S.

### Task W1 — MermaidDiagram (M)

**Desc:** Lazy component per API above. Singleton loader: `let mermaidPkg: Promise<typeof import("mermaid")>` initialized with `{ startOnLoad:false, theme:"dark" }`. Render cycle: import → `mermaid.parse(chart)` guard → `mermaid.render(uid, chart)` → set innerHTML of ref'd div. Errors/RM → `<pre>` fallback. Unmount cleanup.

**Accept:**
- [ ] Renders valid charts; invalid syntax falls back to `<pre>` without crashing page
- [ ] Only loads mermaid chunk when a diagram exists on page
- [ ] `role="img"` + label; RM skips animation concerns (static SVG anyway)

**Verify:** build includes separate mermaid chunk; headless render one diagram. **Deps:** none. **Files:** `wiki/mermaid-diagram.tsx`. **Scope:** M. **Install:** `npm i mermaid`.

### Task W2 — MarkdownReader (L)

**Desc:** Pipeline per API. Install `react-markdown remark-gfm rehype-slug rehype-raw`. Component map implemented; internal anchor clicks intercepted → scrollTo w/ offset; tables wrapped in scroller region (`role=region aria-label` like Sec F/G). Memoized on content.

**Accept:**
- [ ] GFM tables render styled; fenced code → CodeBlock (copy ✓) except mermaid → MermaidDiagram
- [ ] `<cite>` HTML blocks render (rehype-raw); heading slugs match GitHub convention (deep links from legacy TOCs still land)
- [ ] Lazy-loaded chunk (React.lazy at page level)

**Verify:** render System Overview.md — assert table count, ≥1 mermaid svg, copy buttons >0. **Deps:** W1. **Files:** `wiki/markdown-reader.tsx`. **Scope:** L. **Install:** `npm i react-markdown remark-gfm rehype-slug rehype-raw`.

### Task W3 — useGuide + Wiki page shell (S)

**Desc:** Fetch hook w/ module cache + loading/error states. `pages/Wiki.tsx` replaces placeholder: hero strip (title + count chip) + grid sidebar/article (+right-rail spy ≥xl). Sidebar = numbered GUIDES buttons (aria-current by route param, hash-tracked section state optional). Prev/next pager bottom. Raw-source pill linking `/wiki/<file>`. Palette integration: extend CommandPalette INDEX prop — accept extra entries; Wiki passes GUIDES entries.

**Accept:**
- [ ] `/wiki` redirects to first guide; unknown id → friendly not-found block
- [ ] Sidebar click swaps route + fetches; loading skeleton; error message on fetch fail
- [ ] Prev/next respects GUIDES order; raw pill works
- [ ] Ctrl K on /wiki lists guide entries

**Verify:** route sweep /wiki/{each-id}; palette shows guides on wiki route. **Deps:** W0,W2. **Files:** `lib/use-guide.ts`, `pages/Wiki.tsx`, small CommandPalette props extension. **Scope:** S.

### Task W4 — Topbar burger fix (XS)

**Desc:** In Topbar variants where mobile menu has no Sheet backing (docs/wiki if applicable), don't render burger button at all (kills H1). If Home variant already wires Sheet, keep it there.

**Accept:**
- [ ] No inert focusable burger remains on any page

**Verify:** grep Topbar usage ×3 pages; manual focus check. **Deps:** none. **Files:** `layout/Topbar.tsx`. **Scope:** XS.

## Checkpoint after W0–W4

- [ ] `npm run build` green; mermaid/react-markdown in lazy chunks
- [ ] All 9 guides readable via routes w/ working deep links, tables, diagrams, copy
- [ ] H1 dead (burger), H3 dead (single source), H6 dead (encoded names), H7 dead (copy everywhere), H8 dead (active tracking)
- [ ] H2 (palette Tab cycle) fixed during W3 palette touch — full cycle within dialog then release
- [ ] Legacy `showcase/wiki.html` untouched

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| rehype-raw + custom `<cite>` markup quirks | Scope raw to trusted first-party only; test each of 9 files in verify |
| mermaid bundle weight (~60KB gzip) | Dynamic import — only wiki route pays |
| Slug mismatch vs legacy manual TOC anchors | rehype-slug follows same GitHub convention legacy used — verify one file's anchors land |
| Fetch fails on some hosts without SPA fallback | Vite dev + preview both serve public/ fine; note limitation for exotic hosts |

## Out of scope

Editing .md sources (content parity frozen). Full-text search across guides (palette covers jump-to-guide; backlog). Print stylesheet port (legacy wiki.css print rules — backlog).

## References

* Phase 1 audit: `docs/audits/wiki-reader-phase1.md`
* Grounded: react-markdown + remark-gfm + rehype-slug/rehype-raw pipeline, lazy mermaid via components map, memoized parsing, content-in-public
