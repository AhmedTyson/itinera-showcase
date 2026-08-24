export type KpiItem = { value: number; label: string; hint: string; status: string; gold?: boolean }

export const KPI_ITEMS: KpiItem[] = [
  { value: 106, label: "API Routes", hint: "api/*", status: "reconciled", gold: true },
  { value: 37, label: "Eloquent Models", hint: "app/Models", status: "typed" },
  { value: 49, label: "Controllers", hint: "Http", status: "thin" },
  { value: 28, label: "Services", hint: "app/Services", status: "core" },
  { value: 55, label: "Test Files", hint: "tests/**", status: "green" },
  { value: 44, label: "Migrations", hint: "database/", status: "applied" },
  { value: 355, label: "FE Files", hint: "vanilla js", status: "legacy" },
  { value: 10, label: "Hardening Fixes", hint: "audit", status: "shipped" },
]

export const TRUST_PILLS: string[] = [
  "Laravel 13",
  "55 tests",
  "44 migrations",
  "106 routes audited",
]
