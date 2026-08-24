# Todo — Ordered Tasks

Source: tasks/plan.md · Update checkboxes as work completes.

## Task 1: Delete section 02 — subsystems audit
**Description:** Documentation records accomplishment, not status. Remove the `#audit` section entirely.
**Acceptance criteria:**
- [ ] `#audit` section removed from `Home.tsx`
- [ ] `AUDIT_CARDS` deleted from `home-content.ts`, import removed
- [ ] "Audit" entry removed from Topbar nav defaults
**Verification:** `npm run build` green · grep `#audit|AUDIT_CARDS` → 0 hits
**Dependencies:** None
**Files:** `src/pages/Home.tsx`, `src/lib/home-content.ts`, `src/components/layout/Topbar.tsx`
**Scope:** S

## Task 2: Delete section 05 — live boarding-pass component
**Description:** Hero already carries the ticket identity. Remove the duplicate live-ticket section and its exclusive code.
**Acceptance criteria:**
- [ ] `#design` section removed from `Home.tsx` (selector, buttons, BoardingPass, chips, AnnouncerRegion)
- [ ] `BoardingPass.tsx` + `lib/flights.ts` deleted (after confirming hero does not import them)
- [ ] Flight state, `fetchFlights` effect, `passRef`, `handleCopyHtml`, `useAnnouncer` usage removed from `Home.tsx`
- [ ] "Design" entry removed from Topbar nav
- [ ] `--bp-*` CSS + hero ticket untouched (shared)
**Verification:** `npm run build` green · grep `BoardingPass|fetchFlights|flights` → only unrelated hits · hero renders on :4199
**Dependencies:** None (independent of T1)
**Files:** `src/pages/Home.tsx`, `src/components/sections/BoardingPass.tsx` (del), `src/lib/flights.ts` (del), `src/components/layout/Topbar.tsx`
**Scope:** M

## Task 3: Renumber sections + anchor sweep
**Description:** After two deletions, renumber SectionHead nums sequentially and fix all cross-references.
**Acceptance criteria:**
- [ ] Sections renumbered: stack→02, frontend→03, security→04, data→05, ops→06, deploy→07, voice→08, roadmap→09, conference→10
- [ ] Grep sweep: zero references to `#audit` / `#design` anywhere in `src/`
- [ ] Topbar nav labels match surviving anchors
**Verification:** `npm run build` green · every nav href resolves to an existing id on the page
**Dependencies:** T1, T2
**Files:** `src/pages/Home.tsx`, `src/components/layout/Topbar.tsx`
**Scope:** S

## Checkpoint A (after T1–T3)
- [ ] Build green · puppeteer smoke on :4199 (hero + architecture render, audit/design absent, nav anchors resolve)
- [ ] Commit + push

## Task 4: Laravel 13 + composer truth sync
**Description:** Sync every stack/version claim with `Backend/composer.json`.
**Acceptance criteria:**
- [ ] All "Laravel 12" refs → "Laravel 13" (grep: kpi.ts TRUST_PILLS, Hero lead, arch-data, docs-data, home-content, README if present)
- [ ] Stack data reflects real packages + versions: dompdf ^3.1, openspout, scramble ^0.13, groq-laravel, paymob/php-library, predis, spatie/laravel-permission, jwt-auth ^2.1, socialite, php ^8.5
- [ ] Report stack (PDF/XLSX) claims match dompdf + openspout
**Verification:** grep `Laravel 12` → 0 hits · spot-check stack section copy against composer.json
**Dependencies:** T3 (renumbered files)
**Files:** `src/lib/kpi.ts`, `src/lib/home-content.ts`, `src/lib/arch-data.ts`, `src/lib/docs-data.ts`, `src/components/sections/Hero.tsx`
**Scope:** M

## Checkpoint B (after T4)
- [ ] Build green · commit + push

## Task 5: Epichub portal audit + diagnosis
**Description:** Crawl https://epichub.apidog.io/ fully; produce `docs/epichub-audit.md`: feature inventory, side-by-side vs our portal (itinera.apidog.io) + showcase, adopt/reject/keep table, diagnosis of what they do better.
**Acceptance criteria:**
- [ ] Audit doc exists with: inventory (landing blocks, frontend-strategy section, diagrams, chips), diff table (them vs us), adopt/reject/keep verdicts, diagnosis summary
- [ ] Explicitly covers: frontend-architecture-on-portal idea, numbered feature blocks, flow diagrams, anything we lack
- [ ] No adoption implemented yet — decisions document only
**Verification:** Human reads doc and marks approved adopt list
**Dependencies:** T4 (accurate content baseline)
**Files:** `docs/epichub-audit.md`
**Scope:** M (research)

## Checkpoint C (after T5) — human gate
- [ ] User reviews audit, picks adopt items → feeds T6/T8 scope

## Task 6: Stack section redesign — proposal
**Description:** Design proposal for section "six groups": per-group icons, decorative SVG drawing motif, GSAP entrance choreography — consistent with schematic/telemetry design system (no ticket language). One reference with link, then user approves.
**Acceptance criteria:**
- [ ] Proposal posted: reference link, element mapping table, motion spec, hierarchy-continuity notes
- [ ] User approval received
**Verification:** User says approve
**Dependencies:** T5 findings + Checkpoint C
**Files:** none (proposal only)
**Scope:** S

## Task 7: Stack section redesign — implement
**Description:** Implement approved proposal in `#stack` section.
**Acceptance criteria:**
- [ ] Icons per group (lucide, consistent with existing icon usage)
- [ ] GSAP entrance (fromTo class-selector pattern, visible-by-default markup)
- [ ] Decorative drawing motif per approved design
- [ ] 6 groups data unchanged in substance; Laravel 13 truth from T4 preserved
**Verification:** build green · puppeteer: icons render, animation plays (or degrades visible), section anchors intact · commit + push
**Dependencies:** T6 approval, T4
**Files:** `src/pages/Home.tsx`, `src/lib/home-content.ts`, `src/index.css`
**Scope:** M

## Task 8: Adopt approved epichub items (gated)
**Description:** Implement only the adopt items user approved at Checkpoint C (portal content and/or showcase additions).
**Acceptance criteria:**
- [ ] Each approved adopt item implemented or explicitly deferred with reason
**Verification:** per-item check + build green
**Dependencies:** Checkpoint C user decision
**Files:** TBD by adopt list
**Scope:** TBD

## Task 9: Final regression
**Description:** Full pass before close-out.
**Acceptance criteria:**
- [ ] `npm run build` green
- [ ] Nav + palette anchors all resolve; light-mode spot check
- [ ] Counts still 106; Laravel 13 everywhere; no audit/design remnants
- [ ] All work committed + pushed
**Verification:** puppeteer sweep + grep sweep
**Dependencies:** T7, T8
**Scope:** S
