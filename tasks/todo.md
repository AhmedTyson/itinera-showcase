# 180° Wiki Design Overhaul — Ordered Tasks (Completed)

Every task ends green (`npm run build` + `npm test`). Light + dark verified via `html.light` token flip.

## Task 1: Design Tokens — Notion Palette

**Description:** Extend `src/index.css` @theme with callout/span vars.
- [x] Vars added + light remaps
**Verification:** build green — `getComputedStyle --callout-blue_bg` non-empty
**Files:** `src/index.css` | **Scope:** S

## Task 2: Callout Primitive

- [x] `src/components/wiki/callout.tsx` with `icon`, `color` → styled div
**Files:** `src/components/wiki/callout.tsx` | **Scope:** S

## Task 3: Wire <callout> into Markdown Reader

- [x] `markdown-reader.tsx` maps `<callout>` via rehypeRaw
**Verification:** 18 tests green
**Files:** `src/components/wiki/markdown-reader.tsx` | **Scope:** S

## Task 4: Span Highlight CSS

- [x] `span[color="blue|red|..._bg"]` selectors added
**Files:** `src/index.css` | **Scope:** S

## Task 5: Wire <span color>

- [x] Raw spans pass through rehypeRaw + CSS (attribute selector, no purge risk)
**Files:** `src/index.css` | **Scope:** S

## Task 6: CodeBlock Tint

- [x] Language pill + php warm tint (`amber`) vs bash neutral
**Files:** `src/components/ui/code-block.tsx` | **Scope:** S

## Task 7: Mermaid Preview Upgrade

- [x] Theme-aware `ensureMermaid(theme)` (dark→dark, light→base), scroll cap 520px, Copy SVG header
**Verification:** DB ERD scrollable, theme flips
**Files:** `src/components/wiki/mermaid-diagram.tsx` | **Scope:** M

## Task 8: Docs Enrichment (15 files)

- [x] All 15 `docs/0*.md` now contain ≥1 `<callout>`, ≥2 `<span color>`, valid `mermaid` + ```php blocks
**Files:** `C:\Programming\conference\docs\*.md` | **Scope:** L

## Task 9: Wiki Layout Polish

- [x] `h2 mt-10→mt-8`, `p my-3→my-2.5 leading 1.7` for Notion density
**Files:** `src/components/wiki/markdown-reader.tsx` | **Scope:** M

## Task 10: Notion Push Verification

- [x] `NOTION_API_TOKEN` empty → locally verified only (build+Wiki render green). With token: `npx --yes ntn pages edit` would push.

## Checkpoints

### After T1-5 (Primitives)
- [x] build + 18 tests green, callout + span visible

### After T6-7 (Preview)
- [x] Large mermaid preview + RM fallback green

### After T8 (Content)
- [x] 15 docs enriched, rg <callout =15, build green

### Final (T9-10)
- [x] 375px + 1440px no overflow, light/dark AA verified
