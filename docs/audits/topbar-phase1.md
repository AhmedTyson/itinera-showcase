# Section A — App Shell / Topbar — Phase 1 Audit (Analyze + Evaluate)

**Date:** 2026-08-23 · **Scope:** `showcase/` topbars across `index.html` · `docs.html` · `wiki.html`  
**Commit baseline:** `showcase @ P3 refactor` (ITN namespace, frozen-slot fix, visible hero em)  
**Auditor:** Phase-1 protocol — 2026 fullstack community standards  
**Refs searched:** shadcn/ui navbar best practices (Radix NavigationMenu + Sheet) · React 19 + Vite + Tailwind v4 SOLID architecture (CVA, Slot, Server Components)

> Cite blocks are at section ends. Every finding points at exact files/lines audited.

## 1) Inventory — 3 topbars, 0 reuse

| Surface | Markup | Nav | Actions | Unique behavior |
|---|---|---|---|---|
| `index.html` L58-83 | `.topnav > .topnav-inner > .brand + .nav-burger + nav.nav-anchor (10 anchors) + .nav-actions (API Docs gold, Repo Wiki ghost, ⌘K button)` | 10 in-page anchors (`#architecture`…`#team`) | 3 buttons | burger toggles mobile sheet (initShell), anchors route via Lenis `scrollToTarget`; palette button `data-open-palette` |
| `docs.html` L69-91 | `.topnav > .brand(Back to showcase) + .docsearch[data-open-palette] + nav.nav-anchor(6 docs refs) + .nav-actions(Showcase, Markdown)` | 6 docs anchors (`#quickstart`…`#apidog`) | docsearch doubles as palette trigger | docsearch `focus → blur+openPalette` hack; burger **absent** despite same `.topnav` |
| `wiki.html` L46-69 | `.topnav > .brand(RepoWiki) + .nav-burger + nav.nav-anchor(9 wiki refs) + .nav-actions(API Docs, Showcase)` | 9 wiki anchors | no palette trigger in actions (relies on sidebar FAB + link) | burger present, palette trigger only via sidebar "Search everything" + floating FAB |

All three are static copies — no component, no shared CSS variant, no props. Triplicated SVG sprite: 3 full `<defs>` blocks (29→22→22 symbols) with overlapping IDs, one dangling `#i-plug` until addendum. Topbar height/brand markup repeated character-for-character.

**Section sources:** `index.html` L58-83 · `docs.html` L69-91 · `wiki.html` L46-69 · sprites L16-43 docs/wiki

## 2) Bugs — reproduced file:// 2026-08-23

| # | Severity | Repro | Root cause | Impact |
|---|---|---|---|---|
| **A1** | 🔴 High | Palette button on `index.html` click → `#palette null` (console) | `lib/palette.js` binds `[data-open-palette]` **inside** `mount()`; nothing called `mount()` at load → dead trigger (masked in prior tests that called `open()` programmatically) | Every palette button on `index` + wiki FAB broken for real users; docs `docsearch` survives only via old `focus→open` hack |
| **A2** | 🔴 High | Resize to <1100px: `index` burger opens sheet but **no focus trap**, no `aria-expanded` sync, no scroll lock, sheet lacks `role=dialog` | `features/modal.js` trap exists for archival modals, but topnav sheet reuses none of it; `initShell` toggles a class | Keyboard users trapped behind overlay; WCAG 2.4.3 failure |
| **A3** | 🟡 Med | Click `index` nav anchor `#security` while Docs Wiki palette `__lenis` active → Lenis `scrollTo` computes offset against stale `topnav` height after Sheet open/close (spacer not refreshed) | `ScrollTrigger.refresh()` only on fonts.ready, not on sheet toggle | Occasional 20-40px undershoot; content hidden under sticky topnav |
| **A4** | 🟡 Med | `docs.html` has **no burger** — on 820px the 6 anchors overflow and wrap into 2 lines, breaking hazard bar rhythm | `showcase.css` `max-width:760px` ghost-hide rule never targets docs nav | Layout debt, not accessibility break but Awwwards-grade polish fail |
| **A5** | 🟢 Low | `wiki.html` `RepoWiki · Team 2` brand-sub truncates before gold CTA on 360px | fixed `gap:10px` + `min-width` on `.topnav-inner` | Cosmetic |
| **A6** | 🟢 Low | `docs.html` Markdown button points to `../Team2-Conference-Project/fullstack/Backend/docs/...` — 404 when showcase is served standalone (Railway nginx root = showcase/) | Relative path assumes monorepo checkout | Dead on deploy unless monorepo co-deployed |

**Section sources:** `assets/js/lib/palette.js` L184-mount block · `assets/js/features/modal.js` trap vs `apps/home.js` shell · `assets/js/features/tactile.js` L25-35 anchor delegation · `assets/css/showcase.css` L469-476 media queries

## 3) Accessibility audit (WCAG 2.2 AA, 2026 lens)

| Check | Result | Notes |
|---|---|---|
| Keyboard reachability of topnav | ⚠️ Partial | Brand, anchors, actions reachable; palette trigger missing from tab order when dead (A1); burger has correct `aria-label` but not `aria-controls` |
| Focus visibility | ⚠️ | Gold focus ring exists globally (`:focus-visible {outline:2px solid var(--primary)}` L236) — contrast 3.1:1 vs obsidian, borderline per 2026 3:1 non-text rule, but ok |
| Focus trap on open sheet | ❌ | None (A2) |
| `aria-current="page"` on active nav | ❌ | Scroll-spy toggles `active` class only; no `aria-current` for screen readers |
| `aria-expanded` sync on burger | ❌ | Attribute exists set to false, never flipped to true |
| Color contrast (brand-word / topnav bg) | ✅ | `#e6eaf5` on `#0e1428cc` ≈ 13:1 |
| Reduced-motion | ✅ | All topnav interactions behind `isRM()` / `ITN.env.isRM`; no-JS fallback visible (anchors remain real `<a>`) |

## 4) 2026 community standards — gap vs. target

**What 2026 expects for a showpiece navbar** (search-grounded):

* **Shadcn/ui pattern:** `SiteHeader` composes `MainNav` (desktop, Radix `NavigationMenu`) + `MobileNav` (`Sheet` drawer). Uses `asChild` to keep semantics when wrapping custom links. — *Source: shadcn navbar best-practices search (Radix primitives, Sheet vs NavigationMenu split).*
* **Tailwind v4 pattern:** No `tailwind.config.js`; theme in CSS `@theme { --color-primary: #fbbf24; --color-accent: #34d399 }` via `@tailwindcss/vite`. Tokens live in CSS custom props, not JS objects — instant theme switch. — *Source: React19+Tailwind v4 architecture search (CSS-first config).*
* **SOLID 2026:** SRP = hook per concern; OCP = compound components; DIP = `Topbar` depends on `useLenis()` hook, not global `window.__lenis`; ISP = `TopbarProps { links: Link[] }` not `config: MegaObject`. — *Source: SOLID-in-React 2026 search.*

| Current | 2026 target | Gap |
|---|---|---|
| 3 hand-copied `<header>` blocks | 1 `<Topbar>` component, 3 prop presets (`home`/`docs`/`wiki`) | 🔴 Duplication + drift risk |
| FA CDN + 3 sprite copies | `lucide-react` tree-shaken icons, single `Icons` barrel | 🟡 Bundle + file:// fragility |
| Raw `<nav><a>` | `NavigationMenu` (Radix) gives arrow-key roving, `aria-expanded` free | 🟡 Keyboard polish |
| JS string template overlay in `palette.js` | `Palette` as Radix `Dialog` + `cmdk` (already used `palette.js` logic → port) | 🟡 Maintainability |
| Global `window.__lenis` for scroll | `useLenis()` context + `useScrollTo(target)` hook (DIP) | 🟡 Testability |
| No `aria-current` | Active link `aria-current="page"` | 🟢 Easy win |
| Scroll progress ad-hoc | `useScrollProgress()` hook | 🟢 Encapsulation |

## 5) Recommendations — ranked (P0 = ship with Sec A, P1 = next slice, P2 = backlog)

### P0 — fixes the reported bug and unblocks React migration

* **R1 — Promote Topbar to one React component** `src/components/layout/Topbar.tsx` with props `{ variant: 'home'|'docs'|'wiki', links: NavLink[], actions: ReactNode }`. Variant decides which 6/9/10 anchors and which 2 gold/ghost actions to render. Replaces 3 HTML copies. *Effort S.*
* **R2 — Fix A1 at the root:** `palette` mounts triggers in `useEffect` on mount (not lazy inside `open()`). In React: `useEffect(() => bindPaletteTriggers, [])` → every `data-open-palette` alive on first paint. Back-port one-line fix to legacy `palette.js` too (so old showcase stays usable while React lands): move `$$('[data-open-palette]').forEach(...)` outside `mount()` to `DOMContentLoaded`. *Effort XS.*
* **R3 — Accessible mobile sheet:** docs variant gains a burger; both sheets use shadcn `Sheet` (Radix Dialog under the hood) → focus trap + scroll lock + `aria-expanded` + `aria-controls` for free. *Effort S.* References: shadcn navbar pattern (MainNav/MobileNav/SiteHeader split).
* **R4 — Single scroll abstraction:** `useScrollTo` hook calls `lenisRef.current?.scrollTo(target, {offset: -topbarHeight})` else fallback `scrollIntoView`. Topbar measures its own height via `ResizeObserver` and feeds the hook. Fixes A3. *Effort S.*

### P1 — design-system alignment

* **R5 — Tailwind v4 `@theme` tokens:** migrate `showcase.css :root` `--primary/--accent/--border/--text` into `src/index.css` `@theme` block. Showcase legacy stays file://-readable; React build uses `@tailwindcss/vite` plugin. No `tailwind.config.js`. *Effort S.*
* **R6 — Icons:** replace FA CDN + triplicated sprite with `lucide-react` imports (`Lucide: Book, Home, Search, Menu, X, Compass ...`). Keep brand `logo-mark.png` as static asset. *Effort S.*
* **R7 — Active state:** scroll-spy hook sets `aria-current="page"` + visual `.active` together (fix A-level a11y). *Effort XS.*

### P2 — polish / later sections

* **R8 — Scroll progress as hook** `useScrollProgress()` replaces ad-hoc `.scroll-progress` width calc (future Sec hero).
* **R9 — Docs brand-sub "API Docs · v1" becomes a `Badge` component** (CVA variant) rather than inline string.
* **R10 — Preload critical Topbar chunk** (`<link rel="preload" as="script">` once Vite builds) — defer rest.

## 6) Metrics before (baseline file:// audit 2026-08-23)

| Metric | Current | After P0 |
|---|---|---|
| Topbar markup copies | 3 | 1 |
| Palette trigger listeners | 0 live (dead) / 3 expected | 3 live |
| Mobile sheet a11y | 0/3 (trap, expanded, current) | 3/3 |
| Topbar JS LOC touching header | ~90 across 4 files | ~45 inside one component + 1 hook |
| Icon delivery | FA CDN 6.5.1 (75 KB) + 3 sprites | `lucide-react` tree-shaken (~18 KB used) |

## 7) References

* Showcase files audited: `index.html` L58-83, `docs.html` L69-91, `wiki.html` L46-69; CSS L452-486; `assets/js/lib/palette.js`, `assets/js/apps/home.js` shell, `assets/js/features/tactile.js` anchor delegation.
* Community 2026 sources (grounded searches this phase):
  * shadcn/ui navbar best practices 2026 — Radix NavigationMenu/Sheet, `asChild`, responsive split, focus-contrast 3:1 checklist.
  * React 19 + Vite + Tailwind v4 architecture 2026 — CSS-first `@theme`, RSC, CVA/tailwind-variants, Radix, Compound Components, SOLID mapping.
  * Prior grounded searches: dark-luxury Awwwards pillars, API docs DX 2026 (Stripe/Mintlify/Scalar) — deferred to Sec G audit, not repeated here.
