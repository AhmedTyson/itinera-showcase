# Interactive Console — 10-Phase Redesign Plan

> **Mandate:** No scrollbar, no quick hack, modern primitives, diagrams like `§03 FeMotifs` / `§04 SecurityMotifs` (live UIs, not summarized flowcharts), whole section rebuilt.

## Research — Components Chosen (not simple)

**Diagrams:** Evaluated `mermaid` (current, text → SVG, 60KB) vs `React Flow / xyflow` (`/websites/reactflow_dev` — 2613 snippets, draggable nodes, pan/zoom, minimap). **Decision:** Keep **custom SVG** for console (like `§03` `FeMotifs`: pure div + SVG + `fx-*` keyframes, `animation-play-state: paused → running` gate) — no extra 80KB React Flow bundle, full control over Notion palette (`--callout-*`, `html.light` flip), fits `no-scrollbar` constraint better than canvas. Research confirms `FeMotifs` pattern ( `max-w-[300px]` grid + `border-[#0c1322]` + `fx-boot 4.6s` ) is the benchmark to match.

**Dialog:** `Radix Primitives Dialog` (`/radix-ui/primitives` — 716 snippets, a11y, focus trap) + `framer-motion` (`/grx7/framer-motion` — spring, AnimatePresence) for entrance. Current `src/components/ui/dialog.tsx:1` is Radix bare — upgrade to **motion dialog**: `Dialog.Content as motion.div` with `initial {opacity:0, y:12, scale:0.98}` → `animate {opacity:1, y:0, scale:1} spring 0.42`, backdrop `backdrop-blur 12px`, `resize: both` removed — instead **maximized by default** `w-[96vw] h-[88vh]` + internal `flex` so diagram scales via `viewBox` without scroll. This fixes "scroll bar" complaint (previous `max-h-[140px] overflow-auto` forced scroll).

**Style:** `ui-ux-pro-max` design-system recommends `Dark Mode OLED` (`#0F172A` bg, `#1B2336` card, `JetBrains Mono`) + `Glassmorphism` (`backdrop-blur 15px`, `rgba(255,255,255,0.12)`) for console chrome — aligns with `§03` `bg-[#0c1322] shadow-[0_16px_40px]` and solves light/dark via `html.light` tokens (already verified).

---

## Dependency Graph

```
Phase 1 Tokens/Layout (no-scroll grid)
  ↓
Phase 2 Diagram Engine (custom SVG, no React Flow)
  ↓
Phase 3 Shell Chrome (glass + OLED)
  ↓
Phase 4 Chip Interaction → Phase 5 Dialog (Radix+motion) → Phase 6 Illustrations (8 live UIs)
  ↓
Phase 7 Animation → Phase 8 Light/Dark + a11y → Phase 9 No-Scrollbar Guarantee → Phase 10 Delivery
```

## 10 Phases — Each Has Something Special

### Phase 1 — Foundation: No-Scrollbar Layout
*Special:* `overflow: hidden` everywhere, `scrollbar-width: none` on section, grid `lg:min-h-[560px]` not `380px`, `console` `min-h-[520px]` flex column.

### Phase 2 — Diagram Engine Research
*Special:* Custom SVG decision memo (why not React Flow), `fx-*` gate `paused → running` on `group-hover` like `§03`.

### Phase 3 — Shell Chrome (Modern Terminal)
*Special:* Glass header `backdrop-blur 12px` `bg-white/[0.03]` + `OLED` `#0c1322` body, `JetBrains Mono` + traffic lights, `Copy` with `Check` feedback.

### Phase 4 — Chip Interaction
*Special:* 8 chips map to `TELEMETRY` commands, `selectChip` enqueues `toLines(active)` with typing `22ms cmd / 9ms out`, `ArrowUp/Down` cycle + `Enter` run like palette.

### Phase 5 — Dialog System (Modern, Resizable, No Scrollbar)
*Special:* Radix `DialogRoot` → `motion DialogContent` `w-[96vw] h-[90vh] max-w-[1280px]` **non-resizable by drag** but **maximized by default** — no `resize` handle, no inner `overflow-auto`; diagram scales via `viewBox` + `max-h-[62vh] w-full`. Fixes "resize to max of window" by being max on open.

### Phase 6 — 8 Engaging Illustrations (Like §03)
*Special:* Each `TelemetryDiagram` is a `320×180` live UI (not 3-box flowchart): DB 6-table grid, Queue worker ▶, Listeners 3-col, AI md5 split, etc., with `fx-boot` stagger `0.08s` + `shadow-[0_16px_40px]`.

### Phase 7 — Animation Choreography
*Special:* `framer-motion` `staggerChildren 0.08` + spring `0.42` for dialog entrance, `fx-bar grow`, `fx-pulse` on health dot — respects `prefers-reduced-motion` (`isRM → <pre>` fallback kept).

### Phase 8 — Light/Dark + A11y
*Special:* `html.light` flips `--callout-*` + mermaid `theme: base` via `ensureMermaid(theme)`, chips `44px` hit, `role=log` + `aria-live`.

### Phase 9 — No-Scrollbar Guarantee
*Special:* Audit `overflow` on `section`, `console`, `preview`, `dialog` — remove `max-h overflow-auto` on preview, use `flex items-center justify-center` + `svg h-auto w-full` scaling; verify on `375px` and `1440px`.

### Phase 10 — Polish & Delivery
*Special:* Final QA: click each chip → types correct command + `→ 106` green + diagram fits + dialog max + light toggle + `Ctrl K` still works; sync `docs/wiki/phases` to Apidog (no local preview needed).

---

## Files Touched Per Phase

- 1: `src/index.css` (remove scrollbars), `src/pages/Home.tsx:606` `py-20` kept
- 2: `src/components/sections/TelemetryDiagrams.tsx` (new engine)
- 3: `src/components/sections/OpsConsole.tsx` shell
- 4: same `OpsConsole` chip logic + `src/lib/home-content.ts:142` `Telemetry` type
- 5: `src/components/ui/dialog.tsx` motion wrapper + `OpsConsole` dialog
- 6: `TelemetryDiagrams.tsx` 8 illustrations
- 7: `src/index.css` `fx-*` keyframes
- 8: `src/lib/theme-store.ts` + `mermaid-diagram.tsx` theme flip
- 9: `OpsConsole` fit audit
- 10: `tasks/todo` + `docs/wiki/README.md` sync

## Verification (each phase)

- `npm run build` + `npm test` (18) green
- Manual: `375px`/`1440px`, `html.light` toggle, `prefers-reduced-motion` on, chip click → typing + diagram fits without scroll, dialog max → no inner scrollbar.

Await approval to execute Phase 1.
