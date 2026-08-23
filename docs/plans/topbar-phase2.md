# Section A — Topbar — Phase 2 Plan (Planning)

**Date:** 2026-08-23 · **Scope:** `itinera-showcase-react` Sec A (App Shell) · **Depends on:** Phase 1 audit `docs/audits/topbar-phase1.md`  
**Constraint laws:** file://-safe legacy stays; React app is Vite-served (no file:// CORS), RM `isRM()` single source, focus-visible gold, print intact, no `tailwind.config.js` (v4 `@theme`).

## Goals (what Phase 3 must deliver)

* One `<Topbar>` replaces 3 hand-copied `<header>` blocks. Same visual (obsidian glass, gold CTA) but accessible, keyboard-complete, and reusable via props.
* Fixes A1 (dead palette triggers) + A2 (focus trap/aria) on day one.
* Establishes the React/Tailwind foundation that every later section will reuse (tokens, icon barrel, scroll hooks) — so Sec A is the **vertical foundation slice**.

## Dependency graph

```
Toolchain bootstrap
   │
   ├── @tailwindcss/vite + lucide-react + react-router (install)
   │         │
   │         ├── src/index.css @theme tokens (gold/emerald/obsidian/mono)
   │         │
   │         └── hooks: useIsReducedMotion / useMediaQuery / useTopbarHeight / useScrollTo(lenis-context)
   │                    │
   │                    └── components/layout/Topbar — MainNav + MobileNav(Sheet)
   │                              │
   │                              └── pages wiring + legacy palette.js back-port (A1 hotfix)
```

Bottom-up order: toolchain → tokens → hooks → component → integration.

## Component API (contract — ISP, DIP)

```tsx
// src/components/layout/Topbar.tsx
type NavLink = { label: string; href: string; section?: string }; // section = scroll-spy id

type TopbarProps = {
  /** drives which 6/9/10 anchors and which 2 actions to default-render; composition overrides defaults */
  variant: "home" | "docs" | "wiki";
  /** optional override — when omitted Topbar uses variant defaults (keeps call sites tiny) */
  links?: NavLink[];
  /** right-side actions slot; when omitted variant defaults render (ApiDocs/RepoWiki/Search) */
  actions?: React.ReactNode;
  /** brand subline override */
  subtitle?: string; // e.g. "API Docs · v1"
};

export function Topbar({ variant, links, actions, subtitle }: TopbarProps): JSX.Element;

// hooks it depends on (DIP — Topbar never touches window.__lenis directly)
function useScrollTo(): (el: Element | string, offset?: number) => void;
function useIsReducedMotion(): boolean; // prefers-reduced-motion live
function useTopbarHeight(ref: RefObject<HTMLElement>): number; // ResizeObserver
```

Composition over config: consumers can `<Topbar variant="home"><Topbar.Actions><MyCTA/></Topbar.Actions></Topbar>` via compound slots if they need non-default actions — no `config: MegaObject` (ISP).

Styling: Tailwind utilities + `tailwind-variants` (CVA) for `btn` variants (`gold`, `ghost`, `primary`). Icons from `lucide-react` (tree-shaken), not FA CDN.

## Task breakdown (vertical slices — each leaves the app running)

### Task A0 — Toolchain bootstrap (S, 1 session)

**Description:** Bring the new React app to vrtw-parity (what `create-vrtw` quick-setup would have installed) without re-running its interactive CLI.

**Acceptance:**
- [ ] `npm i -D tailwindcss @tailwindcss/vite` + `npx tailwindcss init` replaced by `src/index.css` `@import "tailwindcss"; @theme { ... }`
- [ ] `npm i lucide-react react-router-dom`
- [ ] `vite.config.ts` has `plugins: [react(), tailwindcss()]`
- [ ] `npm run dev` serves on 5173, `npm run build` succeeds

**Verification:** `npm run build` exit 0; `rg -c "@theme" src/index.css` ==1; no `tailwind.config.js`.
**Deps:** none. **Files:** `package.json`, `vite.config.ts`, `src/index.css`, `src/main.tsx` (wrap `<BrowserRouter>`).
**Scope:** S (3-4 files).

### Task A1 — Core hooks (S)

**Description:** Extract the three motion/a11y concerns that Topbar and every later section will share.

**Acceptance:**
- [ ] `src/hooks/useIsReducedMotion.ts` mirrors `core/env.js isRM()` live (matchMedia addEventListener) + `?motion=force` QA flag honored
- [ ] `src/hooks/useMediaQuery.ts` generic helper
- [ ] `src/hooks/useTopbarHeight.ts` returns live topbar offset (ResizeObserver on ref)
- [ ] `src/hooks/useScrollTo.ts` — if `useLenis` context present, delegates to `lenis.scrollTo(el,{offset:-h})` else `el.scrollIntoView({behavior: smooth()})`; `smooth()` reads `useIsReducedMotion`

**Verification:** unit smoke: render hook in test harness, toggle matchMedia, assert return flips; no console errors.
**Deps:** A0. **Files:** `src/hooks/*` (4), `src/context/LenisContext.tsx` (thin provider wrapping `motion.js` bridge if needed, or native `Lenis` instance).
**Scope:** S.

### Task A2 — Topbar component (M, 1 focused session)

**Description:** Build `SiteHeader = MainNav (desktop) + MobileNav (Sheet)`. Desktop uses Radix `NavigationMenu` semantics (or plain `<nav>` with roving tabindex if Radix not yet installed — keep dep minimal for Sec A). Mobile uses a `Sheet` drawer (Radix `Dialog` primitive via `src/components/ui/sheet.tsx` — minimal copy from shadcn, not the full CLI).

**Acceptance:**
- [ ] `variant="home"` renders 10 anchors; `docs` renders 6; `wiki` renders 9 — via defaults, overridable via `links` prop
- [ ] Desktop: `hidden md:flex` split; Mobile: burger `Sheet` with vertical nav
- [ ] Burger has `aria-expanded` + `aria-controls` synced; open Sheet traps focus, `Escape` closes, focus returns to burger, body scroll locked
- [ ] Active anchor has `aria-current="page"` (scroll-spy via `IntersectionObserver` on section ids) plus visual `.active`
- [ ] Palette trigger `⌘K` button works on first paint (no lazy mount) — calls `usePalette().open()` (wraps `ITN.palette` bridge or new React `Palette`)
- [ ] Brand renders `Itinera` + `subtitle` prop; logo mark is static `<img>` (same `assets/img/logo-mark.png` copied to `public/`)
- [ ] No FA CDN; icons are `lucide-react` (`Book`, `Search`, `Menu`, `X`, `Home`, `FileText`, `ArrowLeft`)
- [ ] Looks pixel-identical to legacy topbar at 360/820/1100/1440 (hazard bar rhythm intact)

**Verification:** headless: `palette click → #palette.open`, `burger click → Sheet open → Tab trap`, `arrow href click → y moves`, `aria-current` flips on scroll.
**Deps:** A0, A1. **Files:** `src/components/layout/Topbar.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/button.tsx` (CVA), `src/lib/nav.ts` (variant defaults).
**Scope:** M (5-6 files).

### Task A3 — Integration + legacy hotfix (S)

**Description:** Wire Topbar into the 3 React pages and back-port the one-line palette fix to the legacy static showcase so your reported bug is gone regardless of which app you open.

**Acceptance:**
- [ ] `src/pages/Home.tsx` / `Docs.tsx` / `Wiki.tsx` each render `<Topbar variant=...>`. Old static headers removed (React owns header now)
- [ ] Legacy `showcase/assets/js/lib/palette.js` — move `$$('[data-open-palette]')` binding out of `mount()` to immediate `DOMContentLoaded` (so file:// showcase also fixed even before React migration completes)
- [ ] `src/main.tsx` routes: `/`→Home, `/docs`→Docs, `/wiki`→Wiki (react-router), fallback `*` → 404 within Home layout
- [ ] Build + dev both green; `rg "Itinari"` on new app ==0 (except legacy external path if referenced)

**Verification:** `npm run build`; manual click matrix on both apps: index palette button, docs docsearch, wiki FAB — all open; burgers trap.
**Deps:** A2. **Files:** `src/pages/*`, `src/main.tsx`, `showcase/assets/js/lib/palette.js` (one-line move).
**Scope:** S.

## Checkpoint: after A0-A3

- [ ] `npm run build` passes, no TS errors, no `Itinari` display strings remain in new app
- [ ] `palette` opens on first click on all 3 variants; burger Sheet traps focus and restores it
- [ ] Scroll via anchor uses Lenis when present, native `smooth` otherwise, offset = live topbar height (no A3 undershoot)
- [ ] Screenshot strip at 360/820/1100/1440 matches legacy rhythm

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Tailwind v4 `@theme` vs legacy `showcase.css` drift | React app owns its own `index.css`; legacy css untouched — no shared file to drift |
| Lenis + Radix Sheet scroll lock fight | Sheet's `onOpenChange` pauses Lenis (`lenis.stop()` / `lenis.start()`) — hook does it |
| Vite dev on 5173 vs legacy file:// expectations | `VITE_API_BASE` env for `apiBase()` bridge; fallback to `http://127.0.0.1:8000/api` when not set |
| shadcn Sheet wants full radix dep | Copy minimal `sheet.tsx` (30 lines) now; `npx shadcn add sheet` later when you want full CLI updates |

## Out of scope for Sec A

KPI band, arch canvas, boarding pass, console, tracks, wiki article rendering, tokens beyond topbar — those are Sec B-H slices (each gets its own 3 phases). Tailwind config stays CSS-first; no JS theme object.

## References

* Phase 1 audit: `docs/audits/topbar-phase1.md`
* Grounded searches: shadcn navbar (Radix NavigationMenu + Sheet, asChild), React19+Vite+Tailwind v4 SOLID (CVA, Slot, RSC, CSS-first), prior dark-luxury + API-DX searches.
