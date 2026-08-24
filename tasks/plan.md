# Plan — Showcase Prune, Truth-Sync, Epichub Audit, Stack Redesign

Date: 2026-08-24 · Repo: itinera-showcase-react · Branch: main

## Context

Five directives from review:
1. Section 02 (subsystems audit) records *status*, but the showcase is documentation of what was accomplished → **delete it**
2. Section 03 (stack / six groups) is plain cards → **redesign with icons, drawings, GSAP animation** (proposal → approval → implement)
3. Backend is **Laravel 13** (composer.json: `laravel/framework ^13.0`, php `^8.5`) — showcase still says Laravel 12; also sync package facts (dompdf ^3.1, openspout, scramble, groq-laravel, paymob php-library, predis, spatie/permission, jwt-auth ^2.1, socialite)
4. Section 05 (live boarding-pass component) → **delete it** (hero already carries the ticket identity)
5. **Audit https://epichub.apidog.io/** — what they do better, what to adopt/reject/keep for our portal + showcase; written diagnosis before any adoption work

## Key Facts (recon)

- composer.json: laravel/framework **^13.0**, php **^8.5**, barryvdh/laravel-dompdf **^3.1**, openspout/openspout **^4.24||^5.0**, dedoc/scramble **^0.13.36**, lucianotonet/groq-laravel **^1.0**, paymob/php-library **^1.0**, predis/predis, spatie/laravel-permission, tymon/jwt-auth **^2.1**, laravel/socialite; dev: pail/pint/sail/phpunit
- Section 02 `#audit` → `AUDIT_CARDS` (home-content.ts) + Topbar nav "Audit"
- Section 05 `#design` → `BoardingPass.tsx`, `lib/flights.ts`, flight state + `fetchFlights` effect + `handleCopyHtml` + `passRef` + `AnnouncerRegion` + chip pills + Topbar nav "Design"
- Hero ticket is separate markup (Hero.tsx) — `--bp-*` CSS and hero barcode stay untouched
- Nav defaults in Topbar.tsx lines 13–16: Audit / Stack / … / Design
- Section numbering today: 01 architecture, 02 audit, 03 stack, 04 frontend, 05 design, 06 security, 07 data, 08 ops, 09 deploy, 11 voice, 12 roadmap, 14 conference
- Epichub (recon): Angular + ASP.NET Core portal — numbered feature blocks (01–06) with tech chips, Frontend Strategy section, client↔backend flow diagram. They document **frontend architecture on the portal**; ours is API-focused

## Dependency Graph

```
Deletions (T1, T2)
    └── Renumber + anchor sweep (T3)
            └── Laravel-13 truth sync (T4)
Epichub audit (T5) ──informs──> Stack redesign proposal (T6) ──approval──> implement (T7)
                                                        └── adoption backlog (T8, optional)
Final regression (T9)
```

Deletions first (shrink surface, renumber once). Truth-sync before audit so the audit compares accurate content. Audit before stack redesign because its findings may reshape the proposal. Stack redesign last — needs user approval on the proposal (same flow as KPI band).

## Task Slicing (vertical)

- T1/T2/T3 = one prune slice, checkpointed together
- T4 = independent content slice
- T5 = research slice producing a decision document
- T6/T7 = design slice with human approval gate between proposal and code
- T8 = only what user approves from the audit
- T9 = regression gate

## Risks

- Orphaned imports break build after deletions → TypeScript noUnusedLocals catches; verify with build
- Barcode/bp-* CSS shared hero↔BoardingPass → must NOT delete shared pieces; grep before deleting
- Anchor rot: palette/Topbar/footer links to `#audit`/`#design` → grep sweep in T3
- Epichub adoption scope creep → T8 is explicitly gated on user-approved adopt list only

## Verification Strategy

- `npm run build` after every code task
- Puppeteer smoke on :4199 after checkpoints (sections present/absent, nav anchors resolve, counts)
- Commit + push per checkpoint
