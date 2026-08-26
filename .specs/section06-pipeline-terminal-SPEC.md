# Section 06 — Pipeline Terminal (A) SPEC

## Background & Objectives
Section 06 (`#deploy`, num 06 `ship · verify · repeat`) currently is the weakest visual in Home: two-column static list (numbered stepper + test row cards). Goal: upgrade to modern interactive **Pipeline Terminal** that merges best motifs from previous sections, elevating deploy narrative and verification proof to same premium tier as 01 Orbit / 02 Stack / 03 Flip / 04 Defense / 05 Ops.

Inspiration synthesis:
- Hero/KPI ticket: `bp-notch` perforation, `var(--bp-stub-bg)` header strip, `scan-bar` sweep, `marquee`
- 01 Orbit/04 Defense: concentric interaction, node highlight, detail panel `shipped-pill`
- 02 Stack: header strip `Component Bins`, singleton hover with `sp-sheen`
- 03 Frontend: `fe-flip` perspective, `stagger 0.06` ScrollTrigger batch
- 05 OpsConsole: console window (traffic dots, `typewriter 22/9ms`), telemetry chips `emerald-500/10`, command input, dialog pattern
- 07 Demo: `demo-card hover:-translate-y-0.5` + faded number watermark

Objective: single cohesive §06 where **left = deploy pipeline visualization**, **right = verification terminal proof**, sharing one interaction state.

## Architecture & Patterns

### File Map
- `src/pages/Home.tsx:617-665` — replace current §06 markup (`#deploy` section) with new `PipelineTerminal` composition (keep `SectionHead` wrapper). Import `PipelineTerminal` from `src/components/sections/PipelineTerminal.tsx`.
- `src/components/sections/PipelineTerminal.tsx` — NEW. Owns state `activeStep: 0..3`, typewriter for verification log, GSAP ScrollTrigger batch entrance, responsive switch (horizontal pipeline desktop / vertical stepper mobile). Exports `PipelineTerminal`.
- `src/lib/home-content.ts:165-178` — extend `DEPLOY_STEPS` type to include `icon`, `accent`, `meta` (e.g., `meta: "Dockerfile · multi-stage"`), add `display` fields for pipeline visuals. Keep `TEST_ROWS` but render via terminal, not static cards. No breaking change — add optional fields with defaults.
- `src/index.css` — add pipeline tokens: `trace-flow` already exists (reuse), `pipeline-notch` reuse `bp-notch`, `fx-spark` for moving plane, `scan-bar` variant for pipeline sweep. No new deps. Add `html.light` overrides for new classes (mirror `kpi-tile` handling).
- `public/` — no assets needed.

### Component Structure (PipelineTerminal)
```
<PipelineTerminal>
  header-strip: "Pipeline · 4 stages · Railway" like KpiBand 02 (var(--bp-stub-bg) + border var(--bp-border))
  grid lg:grid-cols-[1.35fr_0.95fr] gap-6
  LEFT — Pipeline Visualization
    - track: absolute h-0.5 bg-border/40 + prog fill bg-primary/emerarld with transition width = activeStep/(n-1)*100%
    - trace-flow dashed overlay (SVG path dashOffset anim) when active
    - plane dot: `bp-route-plane` analog riding at prog% (absolute circle with Plane icon)
    - nodes: 4 steps as KpiTile-like perforated cards (reuse KpiTile pattern: left dashed + two notches) OR rounded-xl with number pill.
      State: inactive dim, active emerald ring + scale-105, hover/focus sets activeStep.
      Each node shows icon (Container/HeartPulse/Rocket/Flask), title, detail snippet, meta tag.
    - detail drawer below pipeline: like 04 defense detail panel — icon+title+detail+tag (<code> block), plus `shipped` pill, anim fade-in.
  RIGHT — Verification Terminal
    - console shell: reuse OpsConsole chrome (traffic dots rose/amber/emerald, title "verification@railway — php artisan test", copy/replay buttons)
    - body: typewriter log of TEST_ROWS + synthesis lines (SEQ_CHARTS style 55 passing), green `PASS` rows, amber `→` rows, "all suites nominal" footer like OpsConsole.
    - replay cycles activeStep sync? Or independent.
    - footer chips: `php artisan test` etc like current.

States: `activeStep` drives both LEFT prog and RIGHT log filter (highlight relevant TEST_ROWS). `useEffect` typewriter identical to OpsConsole (22ms cmd / 9ms out). IntersectionObserver start once (threshold 0.3) like OpsConsole rootRef.

GSAP: `gsap.context` + `ScrollTrigger.batch(".pipeline-node, .terminal-row")` stagger 0.06 power2.out, safety nets 2.5s/4s like Home fe-flip batch.

A11y: keyboard arrows cycle activeStep, Escape clears, focus rings `focus-visible:ring-primary`.

### Data Schemas & Types
```ts
// extension of DEPLOY_STEPS (back-compat)
export type DeployStep = {
  title: string
  detail: string
  icon?: "container" | "heart-pulse" | "rocket" | "flask"
  meta?: string            // e.g., "Dockerfile · multi-stage"
  tag?: string             // e.g., "supervisor queue:listen"
  accent?: "primary" | "emerald"
}

export const DEPLOY_STEPS: DeployStep[] = [
  { title: "Docker multi-stage build", detail: "...", icon: "container", meta: "Dockerfile · prune dev", tag: ".dockerignore lean", accent: "primary" },
  // ...
]

export const TEST_ROWS: { suite: string; covers: string; status: string; log?: string }[] // optional log line for terminal

// internal
type TerminalLine = { kind: "cmd" | "out" | "pass"; text: string }
```

No API changes. No store changes.

### Exact Tools
- Framework: React 19, React Router, Tailwind 4, `tailwindcss-animate`
- Motion: `gsap` + `ScrollTrigger` (already in `src/lib/gsap.ts`, `Home.tsx` batch), `motion` (framer-motion) not needed here
- Icons: `lucide-react` (Container, HeartPulse, Rocket, FlaskConical, Check, Copy, RotateCcw)
- Fonts: Space Grotesk / JetBrains Mono (already configured)
- Build: `tsc -b && vite build`, tests `vitest run`, lint `oxlint` if present

Do NOT add new dependencies (bwip-js only used in Hero).

## Acceptance Criteria

**Visual & Interaction**
- [ ] Header strip renders with `var(--bp-stub-bg)` / `var(--bp-border)` matching 02/KPI, text `Pipeline · 4 stages · Railway` + pulsing emerald dot.
- [ ] Desktop: horizontal pipeline track 4 nodes spaced evenly, prog fill + `trace-flow` dashed anim, plane dot at active prog position with transition 500ms.
- [ ] Mobile (<640px): collapses to vertical stepper (left 1px track + nodes stacked, like current DEPLOY_STEPS but styled as pipeline nodes).
- [ ] Active node: `border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_16px_rgba(16,185,129,0.12)]` + scale-105, inactive `border-border/70 bg-white/[0.02] hover:border-primary/30`.
- [ ] Each node perforated tile motif: left dashed `border-l border-dashed var(--bp-dashed)` + two `bp-notch` cutouts, or rounded-xl alternative — must show notch in both light/dark.
- [ ] Detail drawer below pipeline shows active step `title/detail/tag` + `shipped` pill `● shipped`, fade-in 200ms, not overlapping pipeline.
- [ ] Right terminal: header with traffic dots (rose/amber/emerald), title mono `verification@railway`, Copy/Replay buttons functional (clipboard + reset typewriter).
- [ ] Terminal body typewrites `TEST_ROWS` logs (speed 22/9ms), shows `PASS` green, final `all suites nominal — 55 passing` emerald footer like OpsConsole "all systems nominal".
- [ ] Terminal chips footer shows 3 code chips `php artisan test` etc.

**State & A11y**
- [ ] Click/tap node sets `activeStep`, keyboard ArrowUp/Down cycles, focus visible ring, `aria-pressed` / `aria-label`.
- [ ] `prefers-reduced-motion: reduce` respected for GSAP entrance (fallback instant), but pipeline prog + plane still animates (intentional like §03).
- [ ] Light mode: all borders `var(--color-border)` / `var(--bp-border)` swap correctly, emerald accents remain accessible, `html.light` overrides verified at 375/1440 screenshots.

**Engineering**
- [ ] No new deps, no breaking change to `DEPLOY_STEPS` type (optional fields).
- [ ] GSAP context cleaned up on unmount, no leaked ScrollTriggers.
- [ ] `npm run build` succeeds, `npm test` 18/18 green, no `set-state-in-effect` beyond intentional single.
- [ ] File creates only `src/components/sections/PipelineTerminal.tsx`; modifies `src/pages/Home.tsx` (import + replace §06), optionally extends `src/lib/home-content.ts` + adds CSS to `src/index.css`.

## Out of Scope
- Wiki/docs changes, OpsConsole dialog further tweaks, §04/§03 redesign.
- New backend or API.

## Implementation Note (handoff)
After approval: clear context, start fresh session with this SPEC.md only. Implement `PipelineTerminal.tsx` first, extend `home-content.ts`, patch `Home.tsx` §06, add css to `index.css`, verify with `vite build` + manual resize 375/768/1280 light/dark.
