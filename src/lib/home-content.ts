// ── Section 03 · Technology Stack ────────────────────────────────
export type StackItem = { name: string; note: string }
export const STACK_GROUPS: { group: string; items: StackItem[] }[] = [
  {
    group: "Backend Core",
    items: [
      { name: "Laravel 13", note: "PHP 8.5 · REST · Apidog OpenAPI portal" },
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

// ── Section 04 · Hardening delivered (accomplishments) ──────────
export const HARDENING: { icon: "gauge" | "shield" | "lock" | "key" | "users" | "mail" | "filter" | "globe" | "sparkles"; title: string; detail: string; tag: string }[] = [
  { icon: "gauge", title: "Rate Limiting", detail: "Per-user + per-IP sliding windows across login, register, AI, checkout, weather, contacts, newsletter and refresh — with a dedicated CI rate-limit test.", tag: "throttle:*" },
  { icon: "shield", title: "Global Exception Handlers", detail: "Central exception rendering — every failure returns the uniform {success, message, data} envelope with correct status codes; validation maps to 422 field bags.", tag: "bootstrap/app.php" },
  { icon: "lock", title: "HMAC Webhook Verification", detail: "Paymob webhooks verified with HMAC SHA-512 before any state change. Production fail-fast if the secret is empty; idempotent by merchant_order_id.", tag: "webhooks" },
  { icon: "key", title: "JWT Rotation & Blacklist", detail: "1-hour bearer tokens, refresh rotation throttled 15/min, blacklist on logout — a stolen token dies at its next refresh.", tag: "tymon/jwt-auth" },
  { icon: "users", title: "RBAC Permission Matrix", detail: "Spatie roles — super_admin · admin · agency · user — declared per-route and audited in ROUTES-PERMISSIONS-AUDIT.md.", tag: "spatie" },
  { icon: "mail", title: "Email Verification Gate", detail: "MustVerifyEmail with signed links; OAuth providers never auto-trusted; 4-state success pages plus a resend toaster throttled at 60s.", tag: "verified" },
  { icon: "filter", title: "FormRequest Validation", detail: "Every write endpoint validates through typed FormRequests — zero inline validation drift across 106 operations.", tag: "422 envelope" },
  { icon: "globe", title: "CORS & Signed URLs", detail: "Allowlisted origins only; signed verification/reset URLs with expiry; framework health exposed at GET /up.", tag: "config" },
  { icon: "sparkles", title: "AI Quota Economics", detail: "md5 cache key (60m) checked before quota consumption — /ai/plan abuse cannot burn tokens; a deterministic fallback never hard-fails.", tag: "AiUsageService" },
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
  { kind: "out", text: "→ 106 unique api operations · reconciled" },
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

// ── Section 11 · Team — fullstack backend team, 9 engineers ─────
export type TeamMember = { name: string; handle: string; github: string; commits: number; linkedin?: string }
export const TEAM_MEMBERS: TeamMember[] = [
  { name: "Ahmed Elsayed", handle: "AhmedTyson", github: "https://github.com/AhmedTyson", commits: 586 },
  { name: "Lojy Khaled", handle: "lojy-khaled", github: "https://github.com/lojy-khaled", commits: 37 },
  { name: "Sarah Zawal", handle: "Sarah-Zawal", github: "https://github.com/Sarah-Zawal", commits: 20 },
  { name: "Fady", handle: "fady11336-cloud", github: "https://github.com/fady11336-cloud", commits: 17 },
  { name: "Medhat Rana", handle: "medhatrana635-collab", github: "https://github.com/medhatrana635-collab", commits: 12 },
  { name: "Samara Faat", handle: "samarefaat959", github: "https://github.com/samarefaat959", commits: 9 },
  { name: "Kenzymoez", handle: "kenzymoez", github: "https://github.com/kenzymoez", commits: 8 },
  { name: "Hana Eid", handle: "hanaeid13606", github: "https://github.com/hanaeid13606", commits: 8 },
  { name: "Adham Ahmed", handle: "amradhmahmd-jpg", github: "https://github.com/amradhmahmd-jpg", commits: 4 },
]

export const SITE_UPDATED = "2026-08-23"
