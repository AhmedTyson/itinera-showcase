# 180° Wiki Design Overhaul — Plan

## Goal
Transform `docs/01→15` + `Wiki` reader from plain markdown + raw mermaid fences into a **Notion-like, color-rich, diagram-previewed** knowledge base. No new backend; all work is in `itinera-showcase-react` renderer + `docs/*.md` enrichment.

Target aesthetics (from `AGENTS.md` §7):
- `ntn` CLI tags: `<callout icon="💡" color="blue_bg">`, `<span color="red">`, `<span color="yellow_bg">`
- Colored blocks: `blue_bg/red_bg/green_bg/yellow_bg/gray_bg` + emojis
- Code blocks: ```php/```bash with copy + syntax tint
- Mermaid: rendered SVG + zoom/scroll, text highlights, callouts not just boxes
- Use `notion_API-*` or `npx ntn` fallback (token via `$env:NOTION_API_TOKEN`) when pushing to Notion

## Existing Patterns (read-only audit 2026-08-26)
- Reader: `src/components/wiki/markdown-reader.tsx:22-143` — `ReactMarkdown + remarkGfm + rehypeSlug + rehypeRaw`, memoized `components` map (h1/h2/p/a/blockquote/table/code/pre/hr). `code` fence routes `language-mermaid → <MermaidDiagram>` else inline vs `CodeBlock`.
- Mermaid: `src/components/wiki/mermaid-diagram.tsx:13-22` lazy `import("mermaid")` (~60KB gzip), `theme:"dark"`, `securityLevel:"strict"`, `isRM || failed → <pre> fallback`. Render target `ref.innerHTML = svg`.
- Wiki data: `src/lib/wiki-data.ts:8-18` 9 `GUIDES` (system-overview → api-reference) → `useGuide:23` `fetch(/wiki/${file})` + `Map` cache, `Wiki.tsx:30-159` 3-col grid + sticky sidebar.
- Docs source: `C:\Programming\conference\docs\01-ARCHITECTURE-OVERVIEW.md` etc. (15 phases + plan) — raw `#` headings + ```mermaid + ```php, no `<callout>` / `<span color>`.
- Tokens: `src/index.css:5-44` `@theme --color-*` + `html.light` flip; no callout palette yet.
- Tests: `vitest happy-dom`, 18 passing; `oxlint` clean except intentional `set-state-in-effect`.

Risks:
- `rehypeRaw` with raw HTML must be sanitized (mermaid already `securityLevel:strict`); custom `<callout>`/`<span>` must not open XSS.
- Mermaid large SVGs (DB ERD, route matrix) overflow `my-4 overflow-x-auto`; need pan/zoom without breaking `max-w-[820px]`.
- Adding `span color` inside `<p>` risks Tailwind purge if classes are generated dynamically.

## Dependency Graph
```
(tokens / CSS vars)
      │
      ├── callout primitive (needs vars)
      │         │
      │         └── rehype mapping for <callout> (needs primitive)
      │
      ├── span highlight primitive (needs vars)
      │         │
      │         └── rehype mapping for <span color>
      │
      ├── code-block tint (independent)
      │
      └── mermaid preview polish (needs theme vars)
                │
                └── docs enrichment (needs all primitives ready)
                          │
                          └── wiki reader polish (needs primitives + mermaid)
```

Bottom-up order: vars → primitives → renderer wiring → content enrichment → wrapper polish.

## Vertical Slices (NOT horizontal)
Build one complete rendering path at a time, each leaving `npm test + build` green:
- Slice 1: blue/red/green callout renders end-to-end (CSS + component + markdown -> visible in Wiki).
- Slice 2: yellow_bg highlight renders inside a real paragraph.
- Slice 3: a single large mermaid (DB ERD) is pannable + copyable.
- Each slice is deployable alone.

## Task Breakdown Summary
T1 tokens → T2 Callout component → T3 rehype mapping callout → T4 span highlight CSS → T5 rehype mapping span → T6 code-block tint polish → T7 mermaid preview upgrade → T8 docs enrichment pass (15 files) → T9 wiki layout Notion polish → T10 Notion push verification (optional, token-required).

See `tasks/todo.md` for ordered tasks with acceptance criteria.
