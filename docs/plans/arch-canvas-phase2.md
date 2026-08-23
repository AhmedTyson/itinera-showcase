# Section C — Architecture Canvas + ER Map — Phase 2 Plan (Planning)

**Date:** 2026-08-23 · **Scope:** `itinera-showcase-react` Sec C · **Depends on:** Phase 1 audit `docs/audits/arch-canvas-phase1.md` + Sec B Hero+KPI (Topbar, hooks, @theme)  
**Laws:** RM `useIsReducedMotion` + `?motion=force`, no-JS fallback (nodes visible static), `tabular-nums` on columns, file:// safe legacy stays, `aria-label`/`role="group"` on canvases.

## Goals

* One `<ArchCanvas>` + one `<ErCanvas>` replace the two vanilla `#archCanvas`/`#erCanvas` absolute-div canvases. Same obsidian/gold editorial, but **SVG `<line>` edges** (no px misalignment, fixes C1/C2), **roving tabindex** (fixes C3), and **React `<InspectorDialog>`** with `dl` semantics (fixes C4).
* Keep S3 scrub (nodes `y:18→0` stagger + edges `scaleX:0→1`) but via SVG — React only renders static nodes; `scenes.js` S3 stays the motion engine (no React GSAP rewrite).
* Single layout source `src/lib/arch-layout.ts` — no `data-x/y` duplicate inline `left/top` (fixes DRY).

## Dependency graph

```
Sec B foundation (Topbar, useIsReducedMotion, @theme, lucide, Button)
   │
   ├── arch-layout.ts — ARCH_NODES[12] + ER_NODES[12] + EDGES[8] + ER_EDGES[?] (single source)
   │         │
   │         ├── ArchCanvas — nodes + SVG edges + roving tabindex
   │         │         │
   │         │         └── InspectorDialog (Radix Dialog, dl semantics)
   │         │
   │         └── ErCanvas — same pattern, 12 entities
   │
   └── motion hardening (anticipatePin, overflow:clip) — canvases orchestrate
```

Bottom-up: layout config → canvases (edges + roving) → inspector (shared) → Home wiring + legacy P0 fallback keep.

## Component APIs (ISP, DIP)

```tsx
// src/lib/arch-layout.ts
export type ArchNode = { id: string; label: string; sub: string; x: number; y: number; tone?: "primary" | "accent" | "warn"; archKey: string }
export const ARCH_NODES: ArchNode[] // 12 — x/y as 0-100 % (replaces data-x/y + inline left/top)
export type ArchEdge = { from: string; to: string } // resolved to line x1/y1/x2/y2 via node centers
export const ARCH_EDGES: ArchEdge[] // 8 — replaces 8 div.svc-line

export type ErNode = { id: string; label: string; span: string; x: number; y: number; entityKey: string; columns: {name:string;note?:string}[] }
export const ER_NODES: ErNode[] // 12
export const ER_EDGES: ArchEdge[] // TBD — ledger relations, if any

// src/components/canvas/ArchCanvas.tsx
type ArchCanvasProps = {
  nodes?: ArchNode[] // default ARCH_NODES
  edges?: ArchEdge[] // default ARCH_EDGES
  onInspect?: (archKey: string) => void // DIP — canvas never touches modal directly
}
export function ArchCanvas({ nodes, edges, onInspect }: ArchCanvasProps): JSX.Element
// renders <div role="group" aria-label="System design — 12 components, use arrow keys to navigate"> + SVG edges + 12 <button> nodes (roving)

// src/components/canvas/ErCanvas.tsx — same shape, ErNode

// src/components/canvas/InspectorDialog.tsx
type InspectorProps = { open: boolean; onOpenChange: (v:boolean)=>void; archKey?: string; entityKey?: string }
export function InspectorDialog({ open, onOpenChange, archKey, entityKey }: InspectorProps): JSX.Element
// renders Radix Dialog with dl semantics: <dl><dt>Guard</dt><dd>JWT bearer...</dd> + <code className="tabular-nums">
```

Styling: Tailwind `hidden md:block` for SVG, `md:absolute` for nodes vs `static` grid on mobile (no JS layout calc). Icons from `lucide-react` if node needs icon (optional).

## Task breakdown (vertical slices)

### Task C0 — Layout config single source (XS)

**Desc:** Extract 12+12 positions from `showcase/index.html` `data-x/y` + inline `left/top` into `src/lib/arch-layout.ts` (percent `x/y` 0-100). One array drives both React canvases and (future) legacy `data/arch.js` if you back-port.

**Accept:**
- [ ] `ARCH_NODES.length === 12` + `ER_NODES.length === 12`, each `x/y` matches legacy `data-x/y` (±0.5%)
- [ ] `ARCH_EDGES.length === 8` (the 8 svc-lines) + `ER_EDGES` if any
- [ ] No `data-x/y` duplication needed in React — legacy file:// fallback kept in `showcase/` untouched

**Verify:** `rg -c "archKey" src/lib/arch-layout.ts` ==12; `npm run build` pass. **Deps:** none. **Files:** `src/lib/arch-layout.ts`. **Scope:** XS.

### Task C1 — ArchCanvas (S)

**Desc:** `div.relative` canvas (`h-[420px] md:h-[420px] h-auto` on mobile via `md:absolute` nodes). Nodes are `<button>` with `tabIndex={isActive?0:-1}` + `aria-selected`, `role="group"` on canvas, arrow-key roving (ArrowLeft/Right/Up/Down + Home/End). Edges are `<svg class="absolute inset-0 -z-10 hidden md:block" aria-hidden>` with `<line>` per edge (`x1`/`y1`/`x2`/`y2` as `%` via `x+width/2` calc, or simpler: line between node centers using percent). `onInspect` called on click/Enter.

**Accept:**
- [ ] 12 buttons, 8 lines, lines hidden on mobile (`hidden md:block`), nodes stack as grid on mobile (`static` fallback, no absolute)
- [ ] Roving: `Tab` lands on active node, arrows move focus, `aria-selected` syncs
- [ ] `onInspect` fires with correct `archKey` (verified via story: click `JWT + RBAC` → `auth`)
- [ ] No `div.svc-line` — SVG only (fixes C1)

**Verify:** headless: `$$('button[aria-selected]')` count 1, arrow-key moves focus, lines `getComputedStyle(svg).display === 'none'` at 360, `block` at 1280. **Deps:** C0. **Files:** `src/components/canvas/ArchCanvas.tsx`. **Scope:** S.

### Task C2 — ErCanvas (S)

**Desc:** Same pattern for ER: 12 `ErNode` buttons + optional edges. Reuses roving logic (could extract `useRoving` hook, but keep duplicate for Sec C scope — DRY later).

**Accept:** Same as C1 for 12 entities. **Deps:** C0. **Files:** `src/components/canvas/ErCanvas.tsx`. **Scope:** S.

### Task C3 — InspectorDialog (S)

**Desc:** Radix `Dialog` (reuse `src/components/ui/sheet.tsx` pattern but as centered dialog, not sheet). Takes `archKey` or `entityKey`, looks up `ARCH`/`ENT` data via `src/lib/arch-data.ts` (migrated from `assets/js/data/arch.js` HTML strings → typed `{title, dl: {dt, dd}[]}`), renders `<dl><dt>Guard</dt><dd>JWT bearer <code className="tabular-nums">tymon/jwt-auth</code>…</dd></dl>` with `tabular-nums` on columns.

**Accept:**
- [ ] `archKey="auth"` renders `Guard`/`Rbac`/`Verify` dl; `entityKey="trip"` renders `trips` aggregate dl
- [ ] Focus trap + restore, `Escape` closes, backdrop click closes
- [ ] No `html:` strings — `dl` semantics (fixes C4)

**Verify:** open via `ArchCanvas` click → dialog `role="dialog"` present, `dl` has 3+ `dt`, `code.tabular-nums` present. **Deps:** C1/C2. **Files:** `src/components/canvas/InspectorDialog.tsx`, `src/lib/arch-data.ts` (migrated). **Scope:** S.

### Task C4 — Home wiring + motion hardening (S)

**Desc:** `src/pages/Home.tsx` composes `<ArchCanvas onInspect={openArch}>` + `<ErCanvas>` + single `<InspectorDialog>` (controlled `open` state). Keeps `scenes.js` S3 scrub — React only renders static nodes; `scenes.js` still does `gsap.set(nodes)` + scrub timeline (now targeting `button` nodes and `svg line` edges). Add `overflow:clip` to hero-adjacent wrapper and `anticipatePin:1` if you later pin (currently draw-on without pin, so no change needed, but add `hidden md:block` already fixes C2).

**Accept:**
- [ ] `Home` route renders both canvases + dialog; legacy `showcase/index.html` untouched (P0 fallback `position:static` already covers no-JS, now also covers lines via `hidden`)
- [ ] `C2` lines hidden on mobile, visible on desktop
- [ ] `C6` added: `role="presentation"` on SVG (already `aria-hidden`, but explicit)

**Verify:** `npm run build`; headless: `$$('#archCanvas button').length` 12, `$$('#erCanvas button').length` 12, `$$('svg line').length` 8, dialog opens/closes, `aria-selected` flips. **Deps:** C1-C3. **Files:** `src/pages/Home.tsx`, `src/index.css` `overflow:clip` if needed. **Scope:** S.

## Checkpoint: after C0-C4

- [ ] `npm run build` green, no `archKey` drift (12+12)
- [ ] Arch/ER canvases: 12 buttons + 8 lines (arch) each, roving works, lines hidden mobile, inspector `dl` semantics
- [ ] `Home` renders both canvases + single dialog; legacy `showcase/` still file:// safe
- [ ] Screenshot strip at 360/820/1280 — no line misalignment (fixes C1/C2)

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| SVG line calc off by node width/2 | Use node center `%` + `width: 120px` estimate; or simpler: draw lines between fixed `%` midpoints (like legacy `left:15%;width:6%` → `x1:15% x2:21%`) — keep legacy percentages verbatim for parity |
| Roving tabindex complexity | Keep 12, not 24 — two separate canvases, each roves independently; no cross-canvas roving |
| Dialog content drift from `ARCH` const | `arch-data.ts` is single source; legacy `assets/js/data/arch.js` can later import it (or stay duplicate until full migration) |

## Out of scope for Sec C

KPI band, boarding pass, explorer, console, tracks, wiki — Sec D-H each gets its own 3 phases. XyFlow spike deferred (12 nodes < XyFlow sweet spot).

## References

* Phase 1 audit: `docs/audits/arch-canvas-phase1.md`
* Grounded search: XyFlow (React Flow) for interactive graphs — `React.memo`, Dagre/ELK, Zustand, keyboard `Tab`/`Enter`/arrows + `aria-label`/`role="group"`; vs SVG for simple static (<20 nodes).
