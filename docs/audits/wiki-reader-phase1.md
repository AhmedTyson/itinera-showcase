# Section H — Wiki Reader — Phase 1 Audit (Analyze + Evaluate)

**Date:** 2026-08-23 · **Scope:** `showcase/wiki.html` (903 ln) + `assets/js/data/guides.js` + `lib/palette.js` wiki paths + `assets/css/wiki.css` + `assets/wiki/*.md` (9 guides)  
**Baseline:** Sec G Docs Shell done

## 1) Inventory

### Headline finding — premise corrected
**No hydration exists. No markdown renderer exists.** `wiki.html` is fully pre-rendered static HTML. The 9 `.md` files are raw-source mirrors linked via `.wk-raw` pills. No fetch/parse/inject, no markdown lib anywhere in showcase JS. React migration = **greenfield hydration**, not a port.

### Page structure
| Element | Lines |
|---|---|
| CSS: showcase.css + wiki.css | 12–13 |
| Topnav variant | 46–69 (burger inert — no JS on page) |
| `.wiki-shell` main | 71 |
| Hero + metric chips | 74–86 |
| Grid `.wiki-layout` (250px side / fluid main) | 88 |
| Sidebar: 9 numbered anchors + cross-links + palette trigger | 90–107 |
| 9 articles `.wk-doc id=doc-{overview,setup,guidelines,architecture,stack,backend,frontend,infra,api}` | 110–879 |
| Per-article pattern | kicker → h2 → sub → cite block → TOC → h3 w/ manual ids → src notes → raw-md links |
| Pager/breadcrumbs | none (inline reading-order links only) |
| Footer + FAB + inline style | 884–896 |

### Guide index (`guides.js`, 31 ln)
* Entries `{label, href, where}`; href = `wiki.html#doc-*`; order implicit by array position.
* 9 guides + PAGES[3]. Sole consumer: palette.js ("single source of truth" L19) — but sidebar HTML hand-duplicated → two sources already drifting.

### Markdown sources (`assets/wiki/*.md`)
* No YAML frontmatter; H1 line 1, subtitle blockquote.
* Custom `<cite>` HTML block w/ `file://path#Lx-Ly` links.
* Manual GitHub-slug TOCs; heading ids lowercase-hyphen slugs.
* Fences across 9 files: mermaid ×10, bash ×3, json ×1, text ×1. Mermaid in 7 of 9 files. Current HTML replaces mermaid with hand-built `.flow/.flow-col` span diagrams.
* GFM pipe tables in 8 of 9 files.

### JS behaviors on page
* Only `data-open-palette` ×2 (sidebar + FAB). Palette: Ctrl K toggle, Esc, Tab "trap" (prevents tabbing, no cycle), focus save/restore, recents via localStorage `wk_recent` (try/catch), goTo uses native scrollIntoView (no Lenis loaded here).
* Zero copy buttons on code blocks. Zero scrollspy. No `<noscript>` — page 100% readable JS-off.

### CSS
* All `wk-*` in `wiki.css`: shell/hero/chips/layout/side/doc/kicker/sub/cite/toc/src/check/raw/print (99–106 hides nav, single col).
* Dead weight: cursor widget classes in showcase.css not used here.

## 2) Bugs / quirks — reproduced

| # | Sev | Finding |
|---|---|---|
| H1 | 🟡 Med | Burger button rendered with aria-expanded but no handler on this page — permanently inert focusable control. |
| H2 | 🟡 Med | Palette Tab "trap" prevents tabbing while open without cycling focus inside dialog — keyboard users stuck at input only; partial a11y regression vs proper trap. |
| H3 | 🟢 Low | Two guide-name sources drift (guides.js labels vs sidebar HTML text) — e.g. "API Reference guide" vs "API Reference". |
| H4 | 🟢 Low | Mermaid fences in md sources have no rendered counterpart flow between HTML diagrams and md — divergence risk when md edited. |
| H5 | 🟢 Low | Hardcoded escape-hatch paths break outside original checkout layout: `../Team2-Conference-Project/.repowiki/en/content/System Overview.md` (L204), Conference-API-Documentation.md link (L876). |
| H6 | 🟢 Low | Unencoded spaces in md hrefs (`assets/wiki/System Overview.md`) — works file:// today, bites naive fetch(). |
| H7 | 🟢 Low | No copy buttons on any code block (docs page has them now — inconsistency). |
| H8 | 🟢 Low | No scrollspy / aria-current on sidebar or topnav anchor states. |

## 3) Accessibility

| Check | Result |
|---|---|
| Articles labelled | ✅ aria-labelledby → h2 ids |
| Flow diagrams | ✅ role="img" + aria-label; decorative SVGs aria-hidden |
| Burger | ⚠️ inert control (H1) |
| Palette dialog | ⚠️ role=dialog+aria-modal set, but Tab prevents default without cycling (H2); input sole tab stop |
| JS-off readability | ✅ strongest legacy baseline — must preserve spirit in React (content is data, not runtime-dependent) |
| scroll-margin-top 90px | ✅ compensates sticky nav |

## 4) 2026 community standards — gap vs target

Grounded search: react-markdown pipeline standard (remark-gfm + rehype-slug [+ rehype-raw trusted-only]) rendering into design-system components; mermaid intercepted via components prop into dedicated lazy component; memoize parsing, lazy-load heavy deps; sanitize untrusted md (ours is first-party → rehype-raw OK); content in /public fetched dynamically; rehype-autolink-headings for deep-linking.

| Current (legacy) | 2026 bar | Gap |
|---|---|---|
| Static pre-rendered HTML, md mirrors unused for render | md as source → react-markdown pipeline | 🟡 Greenfield — build it properly |
| Mermaid replaced by hand-built span flows | Dedicated Mermaid component, lazy-loaded | 🟡 Decide: render real mermaid vs port span flows |
| No heading autolinks, manual TOC per article | rehype-slug + autolink-headings, generated TOC | 🟢 Add |
| No copy buttons on code blocks | One-click copy everywhere (matches our own G4 law) | 🟡 H7 |
| Hash anchors only, no router state | SPA route per guide OR single-scroll + hash — either fine; needs active-state tracking | 🟡 H8 |

## 5) Recommendations — ranked

### P0 — Sec H core

* **R1 — Wiki data module**: typed GUIDES[9] {id,title,file,group,order} single source driving sidebar + reader + palette index (kills H3). Copy the 9 .md files into `public/wiki/*.md` with URL-encoded names (kills H6 at source). *S.*
* **R2 — MarkdownReader component**: react-markdown + remark-gfm + rehype-slug (+rehype-raw for `<cite>` blocks, first-party trusted). Component map: h1-h4 styled, table→styled ledger-like table, code→CodeBlock (copy — kills H7), blockquote→cite style, a internal→scrollTo. Memoized. Lazy-load react-markdown chunk. *M.*
* **R3 — Mermaid decision**: render real mermaid via lazy `MermaidDiagram` (dynamic import mermaid pkg) — replaces hand-built spans and keeps md parity (kills H4 divergence risk going forward). RM fallback = static <pre>. *M.*
* **R4 — WikiShell page**: hero chips + sidebar from GUIDES + article area; route `/wiki/:guideId?` via react-router (already installed); hash-section scroll preserved w/ scroll-mt. Sidebar/topnav active tracking via IO scrollspy (kills H8). Prev/next pager added (parity upgrade). *S.*
* **R5 — Fix inert burger** in Topbar docs/wiki variants (render burger only when Sheet functional — kills H1 globally).

### P1 — polish

* **R6 — Palette integration**: extend CommandPalette index with GUIDES entries on /wiki route; fix Tab-cycle inside palette dialog while there (kills H2 for both docs+wiki). *S.*
* **R7 — Raw-source pill**: keep `.wk-raw` equivalent linking to `/wiki/<file>` (public dir) — preserves "view source" affordance. Drop broken `../Team2-Conference-Project/...` escapes (H5) — replace w/ repo-relative note. *XS.*

## 6) Metrics before (baseline)

| Metric | Value |
|---|---|
| Guides | 9 static articles, 903-line HTML |
| Hydration/render pipeline | none |
| Code-block copy buttons | 0 |
| Mermaid rendered | 0 (hand-built spans) |
| Active-state tracking | none |
| Dead/inert controls | 1 (burger) |
| Guide-name sources | 2 (drifting) |

## 7) References

* Files: `showcase/wiki.html`; `assets/css/wiki.css`; `assets/js/data/guides.js`; `assets/js/lib/palette.js` (L40–64, L108–120, L136–145, L172–184); `assets/wiki/*.md`
* Grounded: react-markdown + remark-gfm + rehype-slug pipeline, mermaid via components map lazy-loaded, rehype-raw trusted-only, memoized parsing, content-in-public fetched dynamically
