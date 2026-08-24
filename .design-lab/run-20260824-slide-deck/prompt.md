# Staged Design Lab prompt — slide-deck plan (re-run after OpenCode restart)

WORKFLOW: plan — fan out to the 3 configured models, save each plan under .design-lab/run-20260824-slide-deck/plans/, synthesize summary.md (consensus, disagreements, recommended plan). Then run reviews on the synthesized plan (user requested "plan, and reviews on it after").

## Task: Convert the Itinera showcase page into a Variant A "vertical snap deck" (Canva-style presentation driven by scroll)

Project: itinera-showcase-react — React 19 + Vite + Tailwind 4 + GSAP 3.12. ScrollTrigger + MotionPathPlugin registered in src/lib/gsap.ts. Page = src/pages/Home.tsx. Sections: Hero (boarding-pass ticket, GSAP entrance), KPI band (KpiBand.tsx, count-up), 01 Architecture (ArchCanvas.tsx — SVG schematic, keyboard roving-nav, draw-in on scroll-enter, scrubbed MotionPath lifecycle pulse), 02 Stack (StackGrid.tsx — 6 icon cards, on-enter stagger), 03 Frontend (bento), 04 Hardening (9 "shipped" cards), 05 Ops (OpsConsole.tsx — chips + typewriter, auto-run on enter), 06 Deploy (timeline + test pills), 07 Demo (8 numbered cards), 08 Team (9 member cards, GitHub+LinkedIn) + EpicHub-style footer. Theme: obsidian/gold/emerald, html.light overrides, mono kickers. Ctrl-K command palette with section anchors. Topbar anchors: #architecture #stack #security #demo #team.

## Approved decisions
1. DEPLOYED production site — not a demo. Production-grade: robustness, fallbacks, a11y, perf budget.
2. Hardening splits into 2 slides (5 cards / 4 cards + strip "55 suites · 106 ops · 0 wildcards").
3. Footer becomes closing slide (Itinera. wordmark, tagline, 3 link cards: API Docs https://itinera.apidog.io · GitHub · Wiki, built-with).
4. Deploy + Demo stay separate slides.

## Deck spec (Variant A)
- Candidate 12 slides: Hero, Telemetry (KPI 2×4 grid, text-4xl), Architecture (canvas ~62vh, draw-in + pulse = play-on-slide-enter, not scrub), Stack, Frontend, Hardening I, Hardening II, Ops, Deploy, Demo, Team, Closing. Plan states exact final count/order.
- Global snap: one ScrollTrigger, snapTo section offsets, duration 0.4, power2.inOut.
- Per-slide entrance choreography (kicker → title → content stagger) on activation.
- Chrome: right progress dots (click-to-slide), mono counter "03 / 12" bottom-left, keyboard ↑/↓/PageUp/PageDown/Home/End.
- Fallbacks: mobile <768px + prefers-reduced-motion → plain scroll, no snap/dots; content visible without JS (GSAP owns from-states in gsap.context, revert() — StrictMode safe).
- Integrations: palette anchors jump deck to slide, Topbar anchors, deep-links (#demo), ScrollTrigger.refresh after fonts/layout, no layout shift.

## Plan must include
1. Exact slide list + fate of KPI strip, footer, anchor ids (kept for palette/deep-links).
2. Architecture: new files (Deck.tsx, useDeckSlide hook, hash sync?), Home/Topbar/section diffs — minimal-diff, wrap don't rewrite.
3. Snap detail: global vs per-section ScrollTrigger, offset computation, activation events, pin-free interaction.
4. Keyboard + dots + counter + hash + palette mechanics.
5. Mobile/RM fallback design.
6. Production: refresh timing, resize, scroll restoration, SEO/no-JS, LCP of full-screen sections, test checklist.
7. Ordered file-level task breakdown with verification per task.
8. Risks: snap vs palette jump, trackpad inertia, iOS Safari resize, anchor-scroll vs snap fight.

Constraints: no section-internal rewrites beyond listed; keep design system; no new deps beyond gsap; preserve dl semantics + a11y.
