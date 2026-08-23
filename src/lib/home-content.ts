// ── Section 02 · Architectural Audit ─────────────────────────────
export type AuditCard = { title: string; status: "ok" | "mid"; rows: [string, string][] }
export const AUDIT_CARDS: AuditCard[] = [
  {
    title: "Authentication & Identity",
    status: "ok",
    rows: [
      ["Guard", "JWT bearer (tymon/jwt-auth) with refresh rotation, logout blacklisting."],
      ["Rbac", "Spatie roles: super_admin · admin · agency · user + per-route permissions."],
      ["Verify", "MustVerifyEmail — signed links; OAuth never auto-trusts provider flag."],
    ],
  },
  {
    title: "Payments Lifecycle",
    status: "ok",
    rows: [
      ["Flow", "Intention API → clientSecret → hosted unifiedcheckout → webhook."],
      ["Integrity", "HMAC SHA-512 verified before any state transition; prod fail-fast if secret empty."],
      ["Fulfillment", "Idempotent by merchant_order_id → FulfillOrderListener settles ledger."],
    ],
  },
  {
    title: "AI Pipeline",
    status: "ok",
    rows: [
      ["Model", "Groq llama-3.3-70b, max_tokens ≈ days×800 capped 32k."],
      ["Economy", "md5 cache key 60m · quota consumed only on cache miss · audited in ai_generations."],
      ["Resilience", "Catalog enrichment binds real IDs; deterministic fallback so generation never hard-fails."],
    ],
  },
  {
    title: "Data Integrity",
    status: "mid",
    rows: [
      ["Schema", "SoftDeletes on majors, enum casts, polymorphic trip_items + denormalized day planner."],
      ["Gap", "SQLite dev/test vs MySQL prod — parity risk documented; migrations untested cross-engine in CI."],
    ],
  },
  {
    title: "Rate Limiting",
    status: "ok",
    rows: [
      ["Matrix", "Dedicated throttles: login · register · refresh · ai · checkout · weather · contacts · newsletter."],
      ["Tests", "Abuse-tested (weather throttle suite) — 429 envelope shape asserted."],
    ],
  },
  {
    title: "Observability",
    status: "mid",
    rows: [
      ["Dev", "Laravel Pail realtime logs; Telescope opt-in via TELESCOPE_ENABLED (prod-gated)."],
      ["Gap", "No APM/tracing in production yet — flagged in recommendations."],
    ],
  },
  {
    title: "Async Workloads",
    status: "ok",
    rows: [
      ["Driver", "database queue (redis-ready), supervisor keeps queue:listen alive in Docker."],
      ["Jobs", "GenerateReportJob (DomPDF/OpenSpout) · GeocodeDestinationJob (Nominatim)."],
    ],
  },
  {
    title: "API Surface Discipline",
    status: "ok",
    rows: [
      ["Docs", "Scramble OpenAPI at /docs/api(.json) + Postman collection + branded PDF."],
      ["Envelope", "Uniform ApiResponse::success/error shapes across 49 controllers."],
    ],
  },
]

// ── Section 03 · Technology Stack ────────────────────────────────
export type StackItem = { name: string; note: string }
export const STACK_GROUPS: { group: string; items: StackItem[] }[] = [
  {
    group: "Backend Core",
    items: [
      { name: "Laravel 12", note: "PHP 8.2+ · REST · Scramble OpenAPI" },
      { name: "JWT Auth", note: "tymon/jwt-auth · refresh rotation" },
      { name: "Spatie RBAC", note: "roles + per-route permissions" },
    ],
  },
  {
    group: "Data Layer",
    items: [
      { name: "MySQL", note: "production engine · 44 migrations" },
      { name: "SQLite", note: "dev + test parity harness" },
      { name: "Redis-ready", note: "cache/queue drivers swappable" },
    ],
  },
  {
    group: "Frontend",
    items: [
      { name: "Vanilla Multi-page", note: "48+ pages · zero bundler" },
      { name: "GSAP 3.12", note: "staggered timelines · 3D tilt" },
      { name: "Glassmorphism", note: "tokens.css design system" },
    ],
  },
  {
    group: "Integrations",
    items: [
      { name: "Groq AI", note: "llama-3.3-70b concierge + reviews" },
      { name: "Paymob", note: "hosted checkout · HMAC webhooks" },
      { name: "Open-Meteo · OSM", note: "weather radar · geocoding" },
    ],
  },
  {
    group: "Quality",
    items: [
      { name: "PHPUnit · 55 files", note: "verification suites green 8/8" },
      { name: "Postman Collection", note: "+ branded PDF API guide" },
      { name: "Permission Matrix", note: "ROUTES-PERMISSIONS-AUDIT.md" },
    ],
  },
  {
    group: "Infrastructure",
    items: [
      { name: "Docker", note: "multi-stage · supervisor queues" },
      { name: "Railway", note: "railway.json one-command deploys" },
      { name: "Health Probe", note: "GET /up framework check" },
    ],
  },
]

// ── Section 04 · Frontend Engineering ───────────────────────────
export const FRONTEND_CARDS: { meta: string; title: string; body: string; chips: string[] }[] = [
  {
    meta: "SURFACES",
    title: "Four product surfaces",
    body: "Public catalog · customer app/* · agency marketplace (7 modules) · operator admin suite (11 dashboards) · 8 auth screens.",
    chips: ["48+ pages", "33 JS modules"],
  },
  {
    meta: "MOTION",
    title: "GSAP choreography",
    body: "Staggered hero entrance timelines, interactive 3D tilt micro-interactions on cards, animated KPI counter roll-ups — all reduced-motion safe.",
    chips: ["GSAP 3.12", "tilt · stagger · roll-up"],
  },
  {
    meta: "LIVE DATA",
    title: "Weather radar carousel",
    body: "Real-time °C/°F, condition badges and wind metrics for 17+ travel capitals via Open-Meteo — cached server-side, throttled against abuse.",
    chips: ["Open-Meteo", "17+ cities"],
  },
  {
    meta: "IDENTITY UX",
    title: "Email-verified by design",
    body: "Verification toaster ships in 97 pages (bottom-right toast + Resend, 60s throttle). OAuth callbacks land on success pages that explain every state.",
    chips: ["core/verification.js", "4-state pages"],
  },
  {
    meta: "COMMERCE UX",
    title: "Checkout & boarding pass",
    body: "Unified cart across strategies (subscription, trip fork, package) then a printable gold boarding-pass ticket rendered from live flight data.",
    chips: ["checkout.js", "flight-details.js"],
  },
  {
    meta: "BRAND",
    title: "Unified identity",
    body: "Official logo mark synchronized across favicon, topbar navigation, transactional email templates and DomPDF exports.",
    chips: ["tokens.css", "public.css · admin.css"],
  },
]

// ── Section 09 · Command Center (telemetry) ─────────────────────
export const TELEMETRY: { value: string; note: string }[] = [
  { value: "database", note: "queue driver · redis-ready" },
  { value: "2 jobs", note: "GenerateReport · GeocodeDestination" },
  { value: "2 listeners", note: "FulfillOrder · PaymentFailed" },
  { value: "llama-3.3-70b", note: "groq · cache 60m · quota svc" },
  { value: "GET /up", note: "framework health probe" },
  { value: "stack · single", note: "log channels + pail (dev)" },
  { value: "opt-in", note: "telescope · TELESCOPE_ENABLED" },
  { value: "7 templates", note: "welcome · booked · paid …" },
]
export const TERM_LINES: { kind: "cmd" | "out"; text: string }[] = [
  { kind: "cmd", text: "php artisan route:list --json | measure" },
  { kind: "out", text: "→ 222 total · 213 under api/*" },
  { kind: "cmd", text: "php artisan test --filter=Verification" },
  { kind: "out", text: "→ PASS EmailVerification … 8/8 green" },
  { kind: "cmd", text: "php artisan config:show queue.default" },
  { kind: "out", text: "→ database (redis-ready)" },
  { kind: "cmd", text: "grep PAYMOB_HMAC .env && echo prod-guard" },
  { kind: "out", text: "→ set — webhook controller armed ✓" },
]

// ── Section 10 · Deployment & Testing ───────────────────────────
export const DEPLOY_STEPS: { title: string; detail: string }[] = [
  { title: "Docker multi-stage build", detail: "Dockerfile compiles composer+vite assets, prunes dev deps; .dockerignore keeps context lean." },
  { title: "Runtime supervision", detail: "entrypoint.sh runs migrations then supervises queue:listen alongside octane/serve." },
  { title: "Railway delivery", detail: "railway.json one-command deploys; health probe GET /up gates rollout." },
  { title: "Seeded realism", detail: "migrate:fresh --seed loads 60+ paid orders/payments plus mapped catalog fixtures for demos." },
]
export const TEST_ROWS: { suite: string; covers: string; status: string }[] = [
  { suite: "Verification (8 files)", covers: "Email verify states · resend throttle · OAuth gating", status: "Green 8/8" },
  { suite: "ReportTest", covers: "PDF/XLSX exports · All-Time defaults", status: "Green" },
  { suite: "Checkout & Webhook", covers: "Strategies · HMAC rejection · idempotent settle", status: "Green" },
  { suite: "AiQuotaCacheHitTest", covers: "Cache-before-quota economics", status: "Green" },
  { suite: "WeatherThrottle", covers: "429 envelope under abuse", status: "Green" },
  { suite: "Total", covers: "55 files — 53 feature · 2 unit", status: "55 passing" },
]

// ── Section 11 · Risks & Recommendations ────────────────────────
export const RISK_COLS: { heading: string; tone: "ok" | "warn" | "info"; items: string[] }[] = [
  {
    heading: "Strengths",
    tone: "ok",
    items: [
      "Contract-bound repositories keep Eloquent swappable and services unit-testable.",
      "Money paths carry real test coverage — HMAC, idempotency, quota economics.",
      "AI degradation strategy means generation never hard-fails for a user.",
      "Honest documentation culture: gaps recorded, not hidden.",
    ],
  },
  {
    heading: "Risks",
    tone: "warn",
    items: [
      "SQLite dev/test vs MySQL prod — engine drift can mask lock/charset bugs.",
      "No production APM; incidents would rely on log tailing.",
      "Single 499-line route file invites merge friction as domains grow.",
      "Framework-free frontend scales fine to ~50 pages, unknown beyond.",
    ],
  },
  {
    heading: "Recommendations",
    tone: "info",
    items: [
      "Add contract tests generated from the OpenAPI document (CI diff gate).",
      "Adopt lightweight APM (Sentry/GlitchTip) before public launch.",
      "Split route registry per domain; keep api.php as composer.",
      "Run the PHPUnit matrix against MySQL in CI to kill parity drift.",
    ],
  },
]

// ── Section 12 · Roadmap ────────────────────────────────────────
export const ROADMAP_COLS: { horizon: string; items: string[] }[] = [
  {
    horizon: "Immediate",
    items: [
      "This docs shell: sidebar reference + Ctrl+K palette over all endpoints.",
      "CI workflow: pint · phpstan · mysql test matrix.",
      "Light-theme toggle (tokens already prepared).",
    ],
  },
  {
    horizon: "Medium",
    items: [
      "Redis in production for cache + queue; horizon dashboard.",
      "APM integration + error budgets.",
      "Agency payout ledger with settlement reports.",
    ],
  },
  {
    horizon: "Long",
    items: [
      "Multi-currency checkout on the Paymob adapter seam.",
      "Offline-first PWA shell reusing the same REST surface.",
      "Eval SPA/hybrid migration once page count doubles.",
    ],
  },
]

// ── Section 13 · Demo Flow ──────────────────────────────────────
export const DEMO_STEPS: { n: string; title: string; detail: string }[] = [
  { n: "STEP 01", title: "Register", detail: "auth/register.html → POST /register" },
  { n: "STEP 02", title: "Verify email", detail: "toaster Resend → signed link → success page" },
  { n: "STEP 03", title: "Explore catalog", detail: "explore.html · continent pills · live weather" },
  { n: "STEP 04", title: "Create trip", detail: "trip-form.html → POST /trips" },
  { n: "STEP 05", title: "AI generate", detail: "POST /ai/plan → enriched days[]" },
  { n: "STEP 06", title: "Attach items", detail: "hotels · flights · dining → /attach/{type}" },
  { n: "STEP 07", title: "Checkout", detail: "Paymob hosted → webhook fulfills order" },
  { n: "STEP 08", title: "Boarding pass", detail: "printable ticket · review & fork community trips" },
]

// ── Section 14 · Team ───────────────────────────────────────────
export const TEAM: { initials: string; role: string; focus: string }[] = [
  { initials: "BE", role: "Backend Engineering", focus: "laravel · domain services" },
  { initials: "FE", role: "Frontend Engineering", focus: "vanilla js · gsap motion" },
  { initials: "IN", role: "Integrations", focus: "paymob · groq · osm" },
  { initials: "QA", role: "Quality & Verification", focus: "phpunit · 55 suites" },
  { initials: "OP", role: "DevOps", focus: "docker · railway" },
  { initials: "DX", role: "Docs & Design", focus: "openapi · apidog · brand" },
]

export const SITE_UPDATED = "2026-08-23"
