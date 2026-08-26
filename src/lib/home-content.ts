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
export const HARDENING: {
  icon: "gauge" | "shield" | "lock" | "key" | "users" | "mail" | "filter" | "globe" | "sparkles" | "fingerprint"
  title: string
  detail: string
  tag: string
  bento: "large" | "wide" | "tall" | "small"
  auditCode: string
}[] = [
  { 
    icon: "gauge", title: "Rate Limiting", detail: "9 sliding windows — login 5/min IP+email, register 5/min IP, api_authenticated 60/min, ai dynamic/day, maps 10/min, weather 30/min, checkout 5/min, contacts & newsletter 5/min — 429 Too Many Attempts, CI-tested.", tag: "throttle:checkout · 9 limiters",
    bento: "large", auditCode: "HTTP/1.1 429 Too Many Requests\n{\n  \"message\": \"Too Many Attempts.\",\n  \"retry_after\": 58\n}"
  },
  { 
    icon: "shield", title: "Global Exception Handlers", detail: "Single ApiExceptionHandler enforces {error:{type,status,message,timestamp}} — ValidationException 422 flat {field,message}[] bag, 401/403/404/405/409 uniform, QueryException 1062/1451 → 409.", tag: "ApiExceptionHandler · 422",
    bento: "wide", auditCode: "{\n  \"error\": { \"type\": \"ValidationException\",\n  \"validation_errors\": [{ \"field\": \"email\", \"message\": \"required\" }] }\n}"
  },
  { 
    icon: "lock", title: "HMAC Webhook Verification", detail: "Paymob POST /paymob/webhook → hash_equals HMAC SHA-512 first, prod fail-fast if PAYMOB_HMAC empty (SEC-05), Cache::lock 60s de-dupe, idempotent on merchant_order_id, 24h grace.", tag: "hash_equals · SEC-05",
    bento: "wide", auditCode: "if (!hash_equals($signature, $mac)) abort(401, 'Invalid HMAC');\nCache::lock(\"paymob_{$id}\", 60);"
  },
  { 
    icon: "key", title: "JWT Rotation & Blacklist", detail: "Stateless tymon/jwt-auth: login/register → 1h bearer, POST /auth/refresh rotates + blacklists old, logout blacklists, api_authenticated 60/min throttle — stolen token dies next refresh.", tag: "tymon/jwt-auth · 1h",
    bento: "small", auditCode: "auth('api')->refresh();\nblacklist()->add($oldToken);"
  },
  { 
    icon: "users", title: "RBAC Permission Matrix", detail: "spatie/laravel-permission 4 roles: super_admin Gate::before implicit, admin, agency, user — per-route role:agency, audited in ROUTES-PERMISSIONS-AUDIT.md.", tag: "Gate::before · spatie",
    bento: "small", auditCode: "Gate::before(fn($u)=> $u->hasRole('super_admin')?true:null);\n->middleware('role:agency');"
  },
  { 
    icon: "mail", title: "Email Verification Gate", detail: "MustVerifyEmail Signed URL 60m expiry, no auto-trust even OAuth, verified middleware, 4-state success pages + toaster resend throttled 60s.", tag: "MustVerifyEmail · 60s",
    bento: "tall", auditCode: "Signed URL 60m — no auto-trust\n403 Forbidden · throttled 60s"
  },
  { 
    icon: "filter", title: "FormRequest Validation", detail: "Every write: typed FormRequests — idempotency_key nullable|string|max:64, type in:plan/trip_fork/trip_package etc. → uniform 422, zero drift across 106 ops.", tag: "FormRequest · max:64",
    bento: "small", auditCode: "'idempotency_key' => 'nullable|string|max:64',\n422 {field,message}[]"
  },
  { 
    icon: "fingerprint", title: "Idempotency & Intent Reuse", detail: "POST /checkout idempotency_key → CheckoutService::findReusableCheckout reuses client_secret vs Order::create; merchant_order_id & paymob_transaction_id UNIQUE + provider_ref guard.", tag: "findReusableCheckout",
    bento: "small", auditCode: "$reusable = findReusableCheckout($user->id, $key);\nif($reusable) return $reusable;"
  },
  { 
    icon: "sparkles", title: "AI Quota Economics", detail: "Cache::remember md5 60m before AiUsageService atomic WHERE count<limit (Groq llama-3.3-70b); quota consumed inside closure, restoreQuota on fail, fallback deterministic.", tag: "Cache::remember · 60m",
    bento: "wide", auditCode: "Cache::remember($key, 60*60, fn()=>{\n  consumeQuota($user);\n  return Groq::chat()->create([...]);\n});"
  },
]

// ── Section 09 · Command Center (telemetry) ─────────────────────
export type Telemetry = { value: string; note: string; command: string; outputs: string[]; diagram: string }
export const TELEMETRY: Telemetry[] = [
  { value: "database", note: "queue driver · redis-ready", command: "php artisan migrate:status", outputs: ["Database: sqlite → mysql (prod)", "Migrations: 44 applied · orders, payments, trips"], diagram: "erDiagram\n    USER ||--o{ ORDER : places\n    ORDER ||--o{ PAYMENT : contains\n    TRIP ||--o{ ITINERARY_ITEM : has\n    USER ||--o{ TRIP : creates" },
  { value: "2 jobs", note: "GenerateReport · GeocodeDestination", command: "php artisan queue:work --verbose", outputs: ["[queue] Processing GenerateReport", "✓ report.pdf — All Time filter"], diagram: "flowchart LR\n    Queue --> GenerateReport --> PDF\n    Queue --> GeocodeDestination --> Trip" },
  { value: "2 listeners", note: "FulfillOrder · PaymentFailed", command: "php artisan event:list", outputs: ["PaymentSucceeded → FulfillOrderListener → Subscription + AI reset", "PaymentFailed → NotifyUser"], diagram: "sequenceDiagram\n    participant W as Paymob Webhook\n    participant L as FulfillOrderListener\n    participant DB as MySQL\n    W->>L: PaymentSucceeded\n    L->>DB: create Subscription\n    L->>DB: reset AI quota" },
  { value: "llama-3.3-70b", note: "groq · cache 60m · quota svc", command: "php artisan ai:quota --user=1", outputs: ["Quota: 12/30 · md5 hit 60m", "Cache hit → 0 quota burned"], diagram: "flowchart TD\n    Client --> Cache{md5 hit?}\n    Cache -->|hit| Return\n    Cache -->|miss| Groq[Groq llama-3.3-70b]\n    Groq --> CacheSave[(Cache 60m)]\n    CacheSave --> Return\n    Groq --> Fallback[Deterministic fallback]" },
  { value: "GET /up", note: "framework health probe", command: "curl -s localhost:8080/up | jq", outputs: ['{"status":"ok","db":"up","queue":"up"}'], diagram: "flowchart LR\n    Probe[GET /up] --> DB[(DB)]\n    DB --> Queue[Queue]\n    Queue --> OK[200 OK]" },
  { value: "stack · single", note: "log channels + pail (dev)", command: "php artisan pail --filter=payment", outputs: ["[tail] PaymentSucceeded order #80", "mail queued · webhook verified"], diagram: "flowchart TD\n    Request --> Log[Log Stack]\n    Log --> Pail[php artisan pail]" },
  { value: "opt-in", note: "telescope · TELESCOPE_ENABLED", command: "php artisan telescope:status", outputs: ["Telescope: opt-in (local only)", "Watchers: query, request, job"], diagram: "flowchart LR\n    App --> Telescope\n    Telescope --> UI[Dashboard UI]" },
  { value: "7 templates", note: "welcome · booked · paid …", command: "php artisan mail:preview welcome", outputs: ["Template: welcome · 7 total", "Preview: logo + boarding pass"], diagram: "flowchart LR\n    Mailable --> Preview\n    Preview --> Welcome\n    Preview --> Booked\n    Preview --> Paid" },
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
export type DeployStep = {
  title: string
  detail: string
  icon?: "container" | "heart-pulse" | "rocket" | "flask"
  meta?: string
  tag?: string
  accent?: "primary" | "emerald"
}
export const DEPLOY_STEPS: DeployStep[] = [
  { title: "Docker multi-stage build", detail: "Dockerfile compiles composer+vite assets, prunes dev deps; .dockerignore keeps context lean.", icon: "container", meta: "Dockerfile · multi-stage", tag: ".dockerignore lean", accent: "primary" },
  { title: "Runtime supervision", detail: "entrypoint.sh runs migrations then supervises queue:listen alongside octane/serve.", icon: "heart-pulse", meta: "entrypoint.sh · supervisor", tag: "queue:listen + octane", accent: "primary" },
  { title: "Railway delivery", detail: "railway.json one-command deploys; health probe GET /up gates rollout.", icon: "rocket", meta: "railway.json · one-command", tag: "GET /up health probe", accent: "emerald" },
  { title: "Seeded realism", detail: "migrate:fresh --seed loads 60+ paid orders/payments plus mapped catalog fixtures for demos.", icon: "flask", meta: "migrate:fresh --seed", tag: "60+ orders fixtures", accent: "emerald" },
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
export type TeamMember = { name: string; handle: string; github: string; linkedin?: string }
export const TEAM_MEMBERS: TeamMember[] = [
  { name: "Ahmed Elsayed", handle: "AhmedTyson", github: "https://github.com/AhmedTyson", linkedin: "https://www.linkedin.com/in/ahmed-elsayed-8b9bba28a" },
  { name: "Sara Zawal", handle: "Sarah-Zawal", github: "https://github.com/Sarah-Zawal", linkedin: "https://www.linkedin.com/in/sarah-zawal-" },
  { name: "Fady Osama", handle: "fady11336-cloud", github: "https://github.com/fady11336-cloud", linkedin: "https://www.linkedin.com/in/fady-osama-845b77352" },
  { name: "Hana Eid", handle: "hanaeid13606", github: "https://github.com/hanaeid13606", linkedin: "https://www.linkedin.com/in/hanaeid1362006" },
  { name: "Lojy Khaled", handle: "lojy-khaled", github: "https://github.com/lojy-khaled", linkedin: "https://www.linkedin.com/in/lojin-khaled-247439276" },
  { name: "Kenzy Moez", handle: "kenzymoez", github: "https://github.com/kenzymoez", linkedin: "https://www.linkedin.com/in/kenzymoez" },
  { name: "Sama Refaat", handle: "samarefaat959", github: "https://github.com/samarefaat959", linkedin: "https://www.linkedin.com/in/sama-refaat-78a5b92a5" },
  { name: "Rana Medhat", handle: "medhatrana635-collab", github: "https://github.com/medhatrana635-collab", linkedin: "https://www.linkedin.com/in/rana-medhat-136548215" },
  { name: "Adham Ahmed", handle: "amradhmahmd-jpg", github: "https://github.com/amradhmahmd-jpg", linkedin: "https://www.linkedin.com/in/adham-ahmed-ali-amer-835258379" },
]

export const SITE_UPDATED = "2026-08-23"
