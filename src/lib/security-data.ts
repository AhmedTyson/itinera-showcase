export type Finding = {
  id: string
  issue: string
  mitigation: string
  status: "ok" | "mid" | "planned"
}

export const FINDINGS: Finding[] = [
  { id: "01", issue: "Password storage & reuse", mitigation: "bcrypt via Laravel hashing; registration rejects reused/breached patterns in validation layer.", status: "ok" },
  { id: "02", issue: "Token theft / stale sessions", mitigation: "JWT refresh rotation (15/min throttle); logout blacklists token server-side.", status: "ok" },
  { id: "03", issue: "Unverified accounts acting", mitigation: "verified middleware gates every sensitive group; signed email links; OAuth requires real inbox click.", status: "ok" },
  { id: "04", issue: "Forged payment callbacks", mitigation: "HMAC SHA-512 verification precedes any state transition; empty-secret prod boots fail-fast.", status: "ok" },
  { id: "05", issue: "Credential stuffing / scraping", mitigation: "Per-surface throttle matrix (login·register·refresh·ai·checkout·weather·newsletter) + abuse tests.", status: "ok" },
  { id: "06", issue: "Mass assignment", mitigation: "FormRequest validated() only; fillable audits per model; morph map enforced.", status: "ok" },
  { id: "07", issue: "IDOR / cross-tenant reads", mitigation: "Policies + spatie permissions per route; agency scoping enforced in policies, not controllers.", status: "ok" },
  { id: "08", issue: "SQL injection", mitigation: "Eloquent/bindings exclusively; no raw user input concatenation anywhere in the surface.", status: "ok" },
  { id: "09", issue: "Secret leakage", mitigation: ".env never committed; ENVIRONMENT.md documents every key; CI-safe examples only.", status: "ok" },
  { id: "10", issue: "Blind spots in production", mitigation: "Pail dev logs + Telescope opt-in (prod-gated); APM absence documented as known gap.", status: "mid" },
]

export const AGENTIC_FINDING: Finding = {
  id: "11",
  issue: "High-velocity enumeration (agentic)",
  mitigation: "Sliding window per-user + per-IP on BOLA-sensitive endpoints (GET /api/review/{id}, GET /api/v1/maps/trip/{trip}) with 429 + Retry-After headers and CI rate-limit test.",
  status: "planned",
}
