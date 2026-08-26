# Section 07 — Traveller Timeline (A) SPEC

## Background & Objectives
Section 07 (`#demo`, num 07 `product showcase`) currently flat `demo-card grid sm:2 lg:4` with `56px` watermark. 8 steps `Register → Boarding pass` read as isolated pills, narrative broken by row wrap. Goal: restore linear traveller story as full-width interactive timeline tying to 06 flight language, Hero route, KPI notch.

Inspiration: 06 flight `M0 110 Q500 40 1000 110` `RAIL_LEN` + `WP_POS arc-length equal` + `plane banking` + `pipe-canvas` container; Hero `bp-route-plane`; KPI `bp-notch` perforation; 04 drop-lines; 05 vertical stepper mobile.

## Architecture & Patterns
### File Map
- `src/components/sections/DemoTimeline.tsx` — NEW. Owns `active 0..7`, `STAGE_T` arc-length equal for 8 points on straight rail `M0 40 H1000`, `WP_POS`, `RAIL_LEN`, `P0 {0,40} PC {500,40} P1 {1000,40}` straight (or slight arc if needed), plane `✈` GSAP `x/y/rotation`. GSAP `ScrollTrigger.batch .demo-node` stagger 0.06. `isWrapRestart` teleport `7→0`.
- `src/pages/Home.tsx:667-` — replace `#demo` grid with `<DemoTimeline />`, keep `SectionHead` wrapper. Remove `DEMO_STEPS` inline map, import `DemoTimeline`.
- `src/lib/home-content.ts:242-252` — extend `DEMO_STEPS` type to include `icon?: string` `accent?` for timeline nodes (optional, default). Keep 8 entries.
- `src/index.css` — add `.demo-canvas`, `.demo-rail`, `.demo-node` etc or reuse `.pipe-canvas` variants: `.demo-canvas` border 18 radial wash, `.demo-flight-zone h-96` etc. Reuse `pipe-card` styles as `demo-card` but 8-up. Add `html.light` overrides mirroring pipe.
- No new deps.

### Component Structure (DemoTimeline)
```
<DemoTimeline>
  header-strip: "Journey · 8 waypoints · :8000 / :8080" var(--bp-stub-bg) border var(--bp-border) + pulsing dot
  .demo-canvas (pipe-canvas clone) full-width
    .demo-flight-zone h-88 (168→128→96 responsive) with SVG 1000x80 viewBox
      SVG: graticule faint arcs, drop-lines vertical to each WP (hidden <900), base rail 2px slate, flown rail 2.6px gradient amber→emerald + glow + dash, contrail, 8 waypoints double-ring, plane
      altitude labels: IN FLIGHT left, STAGE 01/08 right
    .demo-cards grid lg:8 sm:2 1col
      8 buttons .demo-node pipe-card style WP-01..08, icon (Mail, Shield, Grid, etc), title, detail mono 11.5px, state pill pending/done/active
    .demo-footer full-width border-top 0 0 18 18 bg black/15: left icon + title/desc (STAGE_COPY for demo) + right tags, nav dots 8
  // mobile: rail hidden? Keep rail visible but cards stack 2→1, drop-lines hidden <900
```

States: `active` drives `readout 01/08`, `flown strokeDashoffset = RAIL_LEN - RAIL_LEN*active/7`, `contrail`, `plane t=STAGE_T[active]`, cards `is-done/is-live`, footer, nav.

Data: `DEMO_STEPS` 8 as source for cards + `STAGE_COPY` descriptions for footer (like 06). Icons map: Register→Users, Verify→Mail, Explore→CloudSun, Create→FilePlus, AI→Sparkles, Attach→Boxes, Checkout→CreditCard, Boarding→Ticket.

GSAP: context `ScrollTrigger.batch .demo-node` + safety 2.5s, `flyPlaneTo` 1.05s power2.inOut + scale kick + breath yoyo.

A11y: `aria-pressed`, `aria-label`, keyboard ArrowLeft/Right cycles, focus ring.

### Data Schemas
```ts
export type DemoStep = { n: string; title: string; detail: string; icon?: "users"|"mail"|"cloud"|"file"|"sparkles"|"boxes"|"credit"|"ticket" }
```

### Exact Tools
React 19, Tailwind 4, gsap + ScrollTrigger, lucide-react, no new deps. Build `tsc -b && vite build`, test `vitest run`.

## Acceptance Criteria
- [ ] Header strip `Journey · 8 waypoints · :8000 / :8080` + dot `ship·verify·repeat` style pulsing
- [ ] Desktop rail full-width `M0 40 H1000` straight (or `Q500 30` slight arc) `1000x80` viewBox `xMidYMid meet`, base `2px slate 0.18` + highlight `3.2px #0f172a 0.35`, progress `2.6px gradient + glow` dash, graticule faint arcs, plane `✈` banking at active WP, 8 double-ring waypoints at `WP_POS` arc-equal `~142` spacing (1000/7)
- [ ] Drop lines vertical `x=WP_POS.x y 18/38→80` hidden <900px
- [ ] 8 nodes `grid lg:8 sm:2 1col gap 2-3`, each `WP-01` code, icon badge 50→42, title 14.5→13, sub mono 10.5, state pill `pending/done/active` with `is-done amber 0.025 / is-live emerald 0.04` + `scanfield` + `edge-path` draw, active `scale 1.02` + `border-emerald 0.4`
- [ ] Footer `border-top` `icon 44 + title/desc + tags` + nav 8 dots bottom right `on` scale 1.3 emerald, mobile `left 18 bottom 16`
- [ ] Interaction: click node / nav dot → active + readout `01/08` + flown/contrail + plane fly `1.05s` + card edge draw + icon pop + footer crossfade `0.15+0.3 stagger`, keyboard arrows cycle, `isWrapRestart 7→0` teleport not backwards
- [ ] Light mode: `html.light` canvas `white + light-border` wash `amber 0.06 emerald 0.07`, cards `white`, titles `light-text`, waypoints `70,80,105` tints
- [ ] Container: `pipe-canvas` clone `overflow:visible isolation:isolate` `border-radius 18→14` `shadow 16px 40px`, flight-zone `h 88? 168→128→96` with `padding 0 28→18`, no clipping of `planeGlow` filter
- [ ] No new deps, `npm run build` + `npm test 18/18` green

## Out of Scope
- Wiki, OpsConsole, 06 flight changes, new preview images (use icons only)
