# Dialog Redesign — 5-Phase Plan

> Fix everything: no scrollbar, modern React, like §03/§04 SVGs, resize to window max.

## Audit — Current `OpsConsole Dialog` (`src/components/ui/dialog.tsx:10` + `OpsConsole.tsx:197`)

- Radix `DialogRoot/Content` with `motion.div spring 24/260` (modern) — `h-[94vh] w-[98vw] max-w-[1440px] resize overflow-hidden` — **still has inner `min-h-[640px] + scale-[1.28]` causing overflow on 13" laptop** (needs `flex` not fixed min-h).
- `TelemetryDiagram` inside `p-8` is `780px` max-w, scaled 1.28 → `998px` wide, overflows `96vw` on 375px → triggers `overflow-hidden` clip, not fit.
- No internal scroll, but outer `resize` handle is `overflow-hidden` + `[scrollbar-width:none]` — hides scrollbar but also hides overflow diagram tail (cut `DATABASE` line in screenshot).
- Style mismatch: dialog `bg-[#0c1322] border-border` vs `§03` `bg-[#0c1322] border-primary/25` glass + `backdrop-blur 12px` — not aligned.
- Tabs `Engaging SVG | Flowchart | Sequence` are plain `bg-black/20` — not pill indicator like `§03` chip row.

## Research Picks (modern, not simple)

- **Dialog:** `Radix Primitives Dialog` (a11y) + `framer-motion` `AnimatePresence` + `vaul` drawer pattern for mobile — keep Radix, upgrade to **glassmorphism overlay** (`backdrop-blur 16px` `bg-black/40`, checklist: `backdrop-filter 15px`, `border 1px rgba 0.2`).
- **Diagrams:** Keep `TelemetryDiagrams.tsx` custom SVG (no mermaid bundle) — like `FeMotifs` `fx-boot 0.07s` staggered, but add `viewBox` `preserveAspectRatio xMidYMid meet` + `max-h-[56vh]` so diagram **scales to fit** without scroll (research: `reactflow` rejected — custom SVG fits no-scrollbar better).

## 5 Phases — Each Special

### Phase 1 — Foundation: Measure & No-Scroll Guarantee
*Special:* `ResizeObserver` on dialog content → compute `scale = min(availableW / diagramW, availableH / diagramH)` and apply via `transform: scale()` — diagram **fits** both axes, never scrolls. Section height already `py-20` — keep.

### Phase 2 — Glass Shell (like §03)
*Special:* Overlay `bg-black/60 backdrop-blur-xl` + Content `bg-[#0c1322]/90 backdrop-blur-2xl border-primary/15 shadow-[0_32px_80px_rgba(0,0,0,0.6)]` + top hairline `via-primary/30` — matches `§03` `from-[#0c1322]` panels.

### Phase 3 — Motion (modern, not simple)
*Special:* `motion.div` `initial {scale:0.96, y:14, opacity:0}` → `animate {scale:1, y:0, opacity:1} spring 0.42` + `AnimatePresence exit`; tabs `layoutId="tab-indicator"` pill slides spring.

### Phase 4 — Diagram Fit & Switch
*Special:* Tabs `Engaging SVG` (custom) vs `Flowchart` vs `Sequence` (Mermaid `force` with `theme:dark/base` flip) — all share same `scale` calc, `MermaidDiagram` wrapper `h-auto w-full` with `viewBox`, no `max-h-[140px] overflow-auto`.

### Phase 5 — Polish & A11y
*Special:* `44px` close hit, `Esc` + `overlay click` close, `focus-visible:ring`, `html.light` token flip for dialog (`bg-white` + `border-light-border`), `prefers-reduced-motion` → `motion` `duration 0.01` fallback, `resize` handle visible `bottom-right` `11×11` grip, QA `375px/1440px` no outer scrollbar.

## Tasks (S/M, each build+test green)

- **T1** Measure hook `useFitScale` + `ResizeObserver` on dialog content.
- **T2** Glass shell: overlay `backdrop-blur-xl`, content `bg-[#0c1322]/90` + hairline.
- **T3** Motion: `framer-motion` `DialogContent asChild motion.div` + tab `layoutId`.
- **T4** Diagram: unify `TelemetryDiagram` + `MermaidDiagram force` to same fit container, remove `min-h-[640px]` `scale-[1.28]` fixed.
- **T5** A11y: `44px` close, `role=dialog`, light flip, reduced-motion, final QA.

Await proceed to Phase 1.
