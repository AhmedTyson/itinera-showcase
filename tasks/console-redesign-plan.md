# Interactive Console Redesign — Plan

## Audit — Current `OpsConsole.tsx:1`

**What exists:** 2-col grid `1fr 1.1fr` → left 2×4 telemetry chips `TELEMETRY[8]` (`database … 7 templates`) with `active` toggle changing only header text `itinera@railway — {value} shell`; right `black/40` panel `h-[240px]` traffic-light header + typewriter of 8 `TERM_LINES` (`route:list --json → 106 ops`, `test --filter=Verification → PASS`, `config:show queue → database`, `grep PAYMOB_HMAC → set`) driven by `IntersectionObserver threshold 0.3` → `setRunning` once, `setTimeout 24/10ms` per char, auto-scroll. Replay resets `progress/chars`.

**Gaps vs 180° Notion goal:**
- Chips don't drive console — click changes header but lines stay static → feels disconnected, not interactive.
- Lines are hardcoded, not derived from `wiki/phases/` we just enriched — no colored `<span>` or `<callout>`.
- Visual is generic `bg-black/40 border-border` — not Notion palette (`--callout-*`, `span color`), no mermaid/hint, no light/dark tint.
- No keyboard, no copy, no command input — user is spectator, not operator.
- `h-[240px]` fixed clips on mobile after `docs` fixes; no `max-h-[520px] overflow-auto` like `MermaidDiagram`.
- Accessibility: `aria-live=polite` only on body, no `role=log`, no focus ring on chips.

**Inspiration — Notion/Apidog handoff:** phases `01-15` already have `<callout icon="💡">` + `<span color="blue">` + `mermaid` + `php` fences. Console should feel like the live shell that *produced* those docs — typing `php artisan route:list` should preview the route matrix diagram, etc.

## Goal

Make the console a **true interactive lab** where telemetry chips are commands: clicking a chip types its command, streams its output (with colored fonts + callout-style status), and previews its diagram — all explorable via keyboard, copyable, light/dark aware.

## Dependency Graph

```
tokens/callout/span (done T1)
      ↓
telemetry → command mapping (new TELEMETRY.command + output)
      ↓
Mermaid preview polish (done T7) reused for diagram pane
      ↓
Console shell (typing engine + command input + output renderer)
      ↓
Chip interaction (click → type + diagram)
      ↓
Polish (a11y, light/dark, mobile, tests)
```

## Redesign — 3-Pane Lab (keeps 2-col grid, upgrades right pane)

**Layout:** Keep `lg:grid-cols-[1fr_1.1fr]` but right pane splits `header / body (flex-1) / footer`. Left chips remain 2×4 but each chip now shows `icon + value + note` with `color` reflecting group (DB blue, queue green, AI amber). Right pane:
- **Body** is `role=log` scrollable `max-h-[380px] sm:h-[340px]` with syntax-tinted lines: `cmd` dim + `$` muted, `out` with `<span color="green">` for `PASS`, `<span color="yellow_bg">` for `→ 106 ops`, `callout` for `● all systems nominal`.
- **Diagram peephole** (collapsible, `h-28`) under body shows the mermaid for active chip (e.g., `TELEMETRY[database]` → `05-DATABASE-SCHEMA` ERD slice) using `MermaidDiagram` — fulfilling "preview the diagrams".
- **Footer** is a real `input` (read-only prompt + blinking cursor) where typing `help` lists chips, `Enter` replays, `Ctrl K` focuses — ties to `CommandPalette` telemetry scope.

**Interaction model:**
- Click chip → `setActive(i)` → enqueues its `command` (`php artisan route:list --json`) into typewriter queue (pause current, type new command at `24ms`, stream output at `10ms` with colored spans).
- Keyboard: `ArrowUp/Down` cycles chips, `Enter` runs, `r` replays.
- Copy: header `Copy` copies visible `visible.map(l=>l.text).join("\n")` (reuse `CodeBlock` copy logic).

**Visual — Notion 180°:**
- Chip active uses `callout-blue_bg` tokens (`border: var(--callout-blue-border) bg: var(--callout-blue-bg)`) not `primary/10`; hover `callout-blue` text.
- Output uses `span[color="green"]` for `PASS`, `span[color="yellow_bg"]` for `106`, `callout color="green_bg"` for final nominal line.
- Header traffic lights stay but `bg-black/20` → `bg-panel/80` with `backdrop-blur`, light remaps via `html.light` vars (done).
- Console bg `bg-black/40` → `bg-[#0c1322] border border-emerald-500/10` like `§03` panels, light `bg-white` + `shadow`.

## Tasks (ordered, S/M, each leaves build+test green)

### T-C1: Telemetry → Command Map
Extend `TELEMETRY` type with `command:string, output:string[], diagram: MermaidSlice` (ERD, quota, webhook, etc. slices from `docs/wiki/phases/*.md`). Update `home-content.ts:141`.

### T-C2: Output Renderer with Colored Fonts
Replace `visible.map` plain `<div className="text-primary">` with rich renderer that parses `**bold**`, `<span color>`, and `callout` for out lines; reuse `markdown-reader` span CSS (no new dep).

### T-C3: Chip-Driven Queue
Replace static `TERM_LINES` autoplay with queue that accepts `active` chip enqueue; pause/resume logic, `setProgress` now driven by queue not fixed array.

### T-C4: Diagram Peephole
Embed `MermaidDiagram chart={active.diagram}` under body, `max-h-[140px] overflow-auto`, theme-aware (light `base`).

### T-C5: Command Input + Keyboard + Copy
Add footer `input` + `ArrowUp/Down`, `Enter`, `r`, `Copy` button; wire to `CommandPalette` telemetry scope.

### T-C6: Light/Dark + Mobile + A11y
Audit `h-[240px] → max-h-[380px]`, `role=log`, `focus-visible:ring`, chips `44px` min hit, light `html.light` vars for all new colors.

## Verification per task
- `npm run build` + `npm test` (18)
- Manual: click `database` chip → types `php artisan …` + green `→ 106…` + ERD peephole scrolls; light toggle flips callout/mermaid theme; `Ctrl K → telemetry` still works.

## Rollout
- Keep old `TERM_LINES` as fallback until T-C3 lands; no flag needed. Docs `wiki/phases/` remain Apidog source — console just previews slices, not full files.
