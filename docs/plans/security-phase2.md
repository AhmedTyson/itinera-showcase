# Section F — Security Audit Ledger — Phase 2 Plan (Planning)

**Date:** 2026-08-23 · **Scope:** `itinera-showcase-react` Sec F · **Depends on:** Phase 1 audit `docs/audits/security-phase1.md` + Sec E Explorer (toolbar pattern)  
**Laws:** RM (no motion in ledger), file:// safe legacy stays, `role="region"` on scroller, distinguishable statuses.

## Goals

* One `<SecurityLedger>` replaces the vanilla `table.ledger` 10-row static table. Same obsidian/gold editorial, but **scrollable region is keyboard-reachable** (`tabIndex=0` + `role="region"`), **statuses are distinguishable** (`ok` emerald vs `mid` amber vs `planned` slate — fixes F3), and an **11th agentic row** closes the 2026 gap.
* Keep it a pure presentational component — data via props, no runtime audit log.

## Dependency graph

```
Sec E foundation (Topbar, Hero+KPI, canvases, Explorer, @theme)
   │
   ├── lib/security-data.ts — FINDINGS[10] + AGENTIC_ROW[1] (single source)
   │         │
   │         └── SecurityLedger — table + Badge CVA + scroller region
```

Single task slice: data → badge → ledger → wiring.

## Component APIs (ISP, DIP)

```tsx
// src/lib/security-data.ts
export type Finding = {
  id: string // "01".."10"
  issue: string
  mitigation: string
  status: "ok" | "mid" | "planned"
}
export const FINDINGS: Finding[] // rows 01-09 status ok, 10 mid
export const AGENTIC_FINDING: Finding // row 11 — High-velocity enumeration, status planned

// src/components/sections/SecurityLedger.tsx
type SecurityLedgerProps = { findings?: Finding[]; includeAgentic?: boolean } // default true
export function SecurityLedger({ findings, includeAgentic = true }: SecurityLedgerProps): JSX.Element
// renders <div tabIndex={0} role="region" aria-label="Security audit ledger, scrollable horizontally"> > <table> with thead (# / Issue Identified / Mitigation Applied / Status) + tbody rows

// src/components/ui/badge.tsx (CVA)
// variants: ok (emerald), mid (amber), planned (slate) — fixes F3
```

Styling: Tailwind `overflow-x-auto`, `focus-visible:ring-primary`, `tabular-nums` on `td:first-child`, print-safe.

## Task breakdown (vertical slices)

### Task F0 — Data single source (XS)

**Desc:** Extract 10 findings from `showcase/index.html` L499-508 into `src/lib/security-data.ts` typed `FINDINGS[10]` + add `AGENTIC_FINDING` (row 11).

**Accept:**
- [ ] `FINDINGS.length === 10`, ids `"01"`..`"10"`, statuses 9×`ok` + 1×`mid`
- [ ] `AGENTIC_FINDING.status === "planned"` with mitigation text referencing Sliding window per-user+per-IP + `429`/`Retry-After` + CI rate-limit test

**Verify:** `rg -c "status:" src/lib/security-data.ts` ==11; `npm run build` pass. **Deps:** none. **Files:** `src/lib/security-data.ts`. **Scope:** XS.

### Task F1 — Badge CVA (XS)

**Desc:** Add `src/components/ui/badge.tsx` with CVA variants `ok`/`mid`/`planned` — emerald/amber/slate borders+bg+text (distinguishable for color-blind via hue + label text).

**Accept:**
- [ ] Variants render distinct hues + always show label text (`Implemented`/`Partial`/`Planned`) so color isn't sole indicator
- [ ] `cn()` merge works

**Verify:** render 3 badges → distinct colors. **Deps:** none. **Files:** `src/components/ui/badge.tsx`. **Scope:** XS.

### Task F2 — SecurityLedger (S)

**Desc:** Renders scroller region (`div[role="region"][aria-label][tabIndex=0]`) + `table` with `thead` + `tbody` of `Finding` rows. `Badge` in Status col, `tabular-nums` on `td:first-child`. Include agentic row when `includeAgentic`.

**Accept:**
- [ ] `role="region"` + `aria-label="Security audit ledger, scrollable horizontally"` + `tabIndex={0}` on scroller
- [ ] 11 rows rendered by default (10 + agentic)
- [ ] `Badge` used for status (not raw span)
- [ ] `td:first-child` has `tabular-nums`

**Verify:** headless: `role=region count 1`, `tbody tr count 11`, badge classes distinct. **Deps:** F0, F1. **Files:** `src/components/sections/SecurityLedger.tsx`. **Scope:** S.

### Task F3 — Home wiring (XS)

**Desc:** `src/pages/Home.tsx` replaces the security `Section` placeholder with a real section containing kicker + H2 ("Ten findings, ten deliberate mitigations." updated to reflect 11 rows) + `<SecurityLedger />`.

**Accept:**
- [ ] `Home` route renders `SecurityLedger` between gateway and data sections
- [ ] H2 copy updated to "Eleven findings — ten shipped, one planned."

**Verify:** headless: `#security table` exists, 11 rows. **Deps:** F2. **Files:** `src/pages/Home.tsx`. **Scope:** XS.

## Checkpoint: after F0-F3

- [ ] `npm run build` green
- [ ] Ledger keyboard-reachable scroll region, 11 rows, badges distinguishable
- [ ] Legacy `showcase/` untouched (still vanilla table)

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Adding row 11 changes "Ten findings" headline | Update H2 copy to "Eleven findings — ten shipped, one planned" |
| Badge color-blind | Always pair color with text label |

## Out of scope for Sec F

Runtime tamper-evident audit log (backend concern — note as gap 10 Partial). JWT RS256 migration (future backend work). Throttle implementation changes (Sec E covers showcase only).

## References

* Phase 1 audit: `docs/audits/security-phase1.md`
* Grounded search: OWASP API Top 10 (BOLA/BOPLA #1, agentic enumeration), JWT alg hardcoding + RS256/ES256, throttling layered + 429/Retry-After, ledger tamper-evident + data minimization.
