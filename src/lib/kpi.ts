export type KpiItem = { value: number; label: string; hint: string }

export const KPI_ITEMS: KpiItem[] = [
  { value: 213, label: "API Routes", hint: "api/*" },
  { value: 37, label: "Eloquent Models", hint: "app/Models" },
  { value: 49, label: "Controllers", hint: "Http" },
  { value: 28, label: "Services", hint: "app/Services" },
  { value: 55, label: "Test Files", hint: "tests/**" },
  { value: 44, label: "Migrations", hint: "database/" },
  { value: 355, label: "FE Files", hint: "vanilla js" },
  { value: 10, label: "Hardening Fixes", hint: "audit" },
]

export const TRUST_PILLS: string[] = [
  "Laravel 12",
  "55 tests",
  "44 migrations",
  "213 routes audited",
]
