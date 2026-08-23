export type Meth = "GET" | "POST" | "DELETE"
export type GroupId =
  | "account"
  | "catalog"
  | "trips"
  | "ai"
  | "commerce"
  | "chat"
  | "system"
  | "admin"

export type EndpointBody =
  | { kind: "summary"; text: string }
  | { kind: "code"; lang?: "bash" | "php" | "json"; code: string }
  | {
      kind: "pair"
      labels: [string, string]
      codes: [string, string]
    }
  | { kind: "summary-plus-pair"; text: string; pair: { labels: [string, string]; codes: [string, string] } }

export type Endpoint = {
  id: string
  group: GroupId
  meth: Meth
  path: string
  chips: string[]
  search: string
  body: EndpointBody
}

export const GROUP_LABELS: Record<GroupId, string> = {
  account: "Account",
  catalog: "Catalog",
  trips: "Trips",
  ai: "AI concierge",
  commerce: "Commerce",
  chat: "Chat",
  system: "System",
  admin: "Admin",
}

/** Legacy order incl. auth-jwt login disclosure (data-cat=account). 25 rows: 10 GET / 14 POST / 1 DELETE */
export const ENDPOINTS: Endpoint[] = [
  // ── auth-jwt (grouped under account like legacy data-cat)
  {
    id: "ep-login",
    group: "account",
    meth: "POST",
    path: "/api/login",
    chips: ["throttle:login"],
    search: "login jwt token authenticate throttle brute force",
    body: {
      kind: "pair",
      labels: ["REQUEST", "RESPONSE · 200"],
      codes: [
        '{ "email": "admin@threedos.com",\n  "password": "password" }',
        '{\n  "success": true,\n  "data": {\n    "user": { … },\n    "access_token": "eyJ0eXAiOiJKV1Qi…",\n    "token_type": "bearer",\n    "expires_in": 3600\n  }\n}',
      ],
    },
  },
  // ── Account
  {
    id: "ep-register",
    group: "account",
    meth: "POST",
    path: "/api/register",
    chips: ["throttle:register"],
    search: "register create account bcrypt verification mail",
    body: {
      kind: "summary",
      text: "Creates account (bcrypt), sends verification mail, returns 201 + user resource. No token until login after verification.",
    },
  },
  {
    id: "ep-me",
    group: "account",
    meth: "GET",
    path: "/api/me",
    chips: ["auth:api"],
    search: "me profile current user roles",
    body: {
      kind: "summary",
      text: "Profile incl. roles + verification state. Alias /api/user.",
    },
  },
  {
    id: "ep-refresh",
    group: "account",
    meth: "POST",
    path: "/api/refresh",
    chips: ["auth:api", "throttle:15,1"],
    search: "refresh rotate token blacklist logout throttle rate limit",
    body: {
      kind: "summary",
      text: "New bearer token from current one. Logout blacklists instead.",
    },
  },
  // ── Catalog
  {
    id: "ep-destinations",
    group: "catalog",
    meth: "GET",
    path: "/api/destinations",
    chips: ["public"],
    search: "destinations browse regions countries continent pills lat lng",
    body: {
      kind: "summary",
      text: "Paginated hub with region/country chain + coordinates. Detail: /destinations/{id}; scoped stays: /destinations/{destination}/hotels.",
    },
  },
  {
    id: "ep-hotels",
    group: "catalog",
    meth: "GET",
    path: "/api/hotels",
    chips: ["public"],
    search: "hotels stays price per night reviews",
    body: {
      kind: "summary",
      text: "Stay inventory feeding attach flow + AI enrichment. Reviews: /hotels/{hotel}/reviews.",
    },
  },
  {
    id: "ep-flights",
    group: "catalog",
    meth: "GET",
    path: "/api/flights",
    chips: ["public"],
    search: "flights boarding pass origin destination price",
    body: {
      kind: "summary",
      text: "FlightResource fields render the boarding-pass ticket verbatim on flight-details.",
    },
  },
  {
    id: "ep-weather",
    group: "catalog",
    meth: "GET",
    path: "/api/weather",
    chips: ["throttle:weather"],
    search: "weather open-meteo temperature wind cached throttle abuse rate limit",
    body: {
      kind: "pair",
      labels: ["QUERY", "RESPONSE · 200"],
      codes: [
        "?lat=4.1755&lon=73.5093&city=Maldives",
        '{\n  "temp_c": 28.4,\n  "temp_f": 83.1,\n  "condition": "Clear Sky",\n  "wind_kph": 14.2\n}',
      ],
    },
  },
  // ── Trips
  {
    id: "ep-trips-create",
    group: "trips",
    meth: "GET",
    path: "/api/trips/create",
    chips: ["auth · verified"],
    search: "list my trips creation data form options",
    body: {
      kind: "summary",
      text: "CreationData payload (destinations, categories…) powering trip-form.html. Owner list: GET /trips; owner detail: GET /trips/{trip} (policy-scoped).",
    },
  },
  {
    id: "ep-trips-store",
    group: "trips",
    meth: "POST",
    path: "/api/trips",
    chips: ["auth · verified"],
    search: "store create trip service request resource 201",
    body: {
      kind: "code",
      lang: "php",
      code: "$trip = $this->tripService->store($req->validated() + ['user_id' => …]);\nreturn ApiResponse::success(new TripResource($trip->load([...])), 'Trip created', 201);",
    },
  },
  {
    id: "ep-trips-attach",
    group: "trips",
    meth: "POST",
    path: "/api/trips/{trip}/attach/{type}",
    chips: ["ownership policy"],
    search: "attach polymorphic hotel restaurant attraction flight items update detach day planner",
    body: {
      kind: "summary",
      text: "Morph-attach hotel|restaurant|attraction|flight into trip_items. Update planner rows via PUT /trips/{trip}/items/{id}; remove via DELETE /trips/{trip}/detach/{id}.",
    },
  },
  {
    id: "ep-trips-fork",
    group: "trips",
    meth: "POST",
    path: "/api/trips/{trip}/fork",
    chips: ["is_public gate"],
    search: "fork community clone lineage parent original public",
    body: {
      kind: "summary",
      text: "Clones any public trip preserving lineage (parent_trip_id/original_trip_id/is_fork) and fires TripForked mail.",
    },
  },
  // ── AI concierge
  {
    id: "ep-ai-plan",
    group: "ai",
    meth: "POST",
    path: "/api/ai/plan",
    chips: ["throttle:ai"],
    search: "generate plan groq llama itinerary days cache quota fallback enrichment throttle ai",
    body: {
      kind: "summary-plus-pair",
      text: "Pipeline: validate AiTripRequest → md5 cache key (60m) → quota consumed only on miss → Groq chat completion (max_tokens ≈ days×800, cap 32k) → JSON parse → catalog enrichment binds real IDs + coords → deterministic fallback if provider degrades.",
      pair: {
        labels: ["REQUEST", "RESPONSE · 200"],
        codes: [
          '{ "city": "Cairo",\n  "days": 3,\n  "travelers": 2,\n  "budget": "luxury" }',
          '{\n  "days": [{\n    "day": 1,\n    "items": [{\n      "title": "Pyramids of Giza",\n      "attraction_id": 9,\n      "lat": 29.97\n    }]\n  }]\n}',
        ],
      },
    },
  },
  {
    id: "ep-ai-review",
    group: "ai",
    meth: "POST",
    path: "/api/ai/review/{id}",
    chips: ["throttle:ai"],
    search: "review itinerary feedback llm quality score",
    body: {
      kind: "summary",
      text: "LLM feedback on trip {id}; same quota/cache economics as plan generation.",
    },
  },
  {
    id: "ep-ai-concierge",
    group: "ai",
    meth: "POST",
    path: "/api/trips/{trip}/concierge",
    chips: ["throttle:ai"],
    search: "concierge chat assistant ask trip context",
    body: {
      kind: "summary",
      text: "Trip-scoped assistant Q&A; usage metered by AiUsageService.",
    },
  },
  // ── Commerce
  {
    id: "ep-checkout-initiate",
    group: "commerce",
    meth: "POST",
    path: "/api/checkout/initiate",
    chips: ["throttle:checkout"],
    search: "checkout initiate strategy subscription fork package paymob intention client secret order throttle money",
    body: {
      kind: "summary-plus-pair",
      text: "CheckoutStrategyFactory resolves Subscription | TripFork | TripPackage → local order → Paymob intention (bounded 30s cURL) → hosted-checkout redirect payload.",
      pair: {
        labels: ["REQUEST", "RESPONSE · 201"],
        codes: [
          '{ "strategy": "trip_package",\n  "package_id": 7 }',
          '{\n  "data": {\n    "order_ref": "ORD-8820",\n    "redirect_url": "https://accept.paymob…",\n    "client_secret": "…"\n  }\n}',
        ],
      },
    },
  },
  {
    id: "ep-webhook",
    group: "commerce",
    meth: "POST",
    path: "/api/paymob/webhook",
    chips: ["signature-verified"],
    search: "webhook hmac signature fulfill idempotent merchant_order_id callback",
    body: {
      kind: "summary",
      text: "Full contract in Webhooks section below.",
    },
  },
  {
    id: "ep-subscribe",
    group: "commerce",
    meth: "POST",
    path: "/api/me/subscribe",
    chips: ["permission"],
    search: "subscribe upgrade cancel plans subscription permission",
    body: {
      kind: "summary",
      text: "Plan purchase entry settling through the webhook path. Siblings: /me/upgrade, /me/subscription/cancel, GET /me/subscription.",
    },
  },
  // ── Chat
  {
    id: "ep-conversations",
    group: "chat",
    meth: "GET",
    path: "/api/conversations",
    chips: ["auth · verified"],
    search: "conversations list messages realtime messaging travelers agencies ai",
    body: {
      kind: "summary",
      text: "Thread index (traveler ⇄ agency ⇄ AI). Messages: GET /conversations/{conversation}/messages.",
    },
  },
  {
    id: "ep-messages",
    group: "chat",
    meth: "POST",
    path: "/api/conversations/{conversation}/messages",
    chips: ["participant only"],
    search: "send message conversation read receipt",
    body: {
      kind: "summary",
      text: "Append message; mark read via PATCH /conversations/{conversation}/read.",
    },
  },
  // ── System
  {
    id: "ep-stats",
    group: "system",
    meth: "GET",
    path: "/api/stats/summary",
    chips: ["public"],
    search: "stats summary counters landing kpis public",
    body: { kind: "summary", text: "Aggregate counters behind landing KPIs." },
  },
  {
    id: "ep-up",
    group: "system",
    meth: "GET",
    path: "/up",
    chips: ["health"],
    search: "up health probe railway docker monitoring",
    body: { kind: "summary", text: "Framework probe gating Railway/Docker rollouts." },
  },
  // ── Admin
  {
    id: "ep-admin-users",
    group: "admin",
    meth: "GET",
    path: "/api/admin/users",
    chips: ["permission:manage users"],
    search: "users directory manage activate block rbac spatie",
    body: {
      kind: "summary",
      text: "Directory CRUD + PATCH /users/{user}/active and /block toggles.",
    },
  },
  {
    id: "ep-admin-reports",
    group: "admin",
    meth: "POST",
    path: "/api/admin/reports/generate",
    chips: ["role:admin|super_admin"],
    search: "reports generate queue pdf xlsx dompdf openspout telemetry all-time",
    body: {
      kind: "summary",
      text: 'Queues GenerateReportJob → branded PDF/XLSX with "All Time" default filter. Download: GET /admin/reports/{id}/download. Own history: GET /me/reports.',
    },
  },
  {
    id: "ep-admin-categories",
    group: "admin",
    meth: "DELETE",
    path: "/api/admin/categories/{category}",
    chips: ["soft deletes"],
    search: "categories crud soft delete restore destinations flights hotels pattern",
    body: {
      kind: "summary",
      text: "Pattern shared by countries/destinations/flights/hotels CRUD, each with PATCH …/restore.",
    },
  },
]

export const SIDEBAR_GROUPS: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: "Getting started",
    links: [
      { href: "#overview", label: "Overview" },
      { href: "#quickstart", label: "Quickstart" },
    ],
  },
  {
    title: "Authentication",
    links: [
      { href: "#auth-jwt", label: "JWT flow" },
      { href: "#auth-verify", label: "Email verification gate" },
      { href: "#auth-oauth", label: "OAuth (Google · Facebook)" },
      { href: "#auth-rbac", label: "Roles & permissions" },
    ],
  },
  {
    title: "Endpoints",
    links: [
      { href: "#ep-account", label: "Account" },
      { href: "#ep-catalog", label: "Catalog" },
      { href: "#ep-trips", label: "Trips" },
      { href: "#ep-ai", label: "AI concierge" },
      { href: "#ep-commerce", label: "Commerce" },
      { href: "#ep-chat", label: "Chat" },
      { href: "#ep-system", label: "System" },
      { href: "#ep-admin", label: "Admin" },
    ],
  },
  {
    title: "Reference",
    links: [
      { href: "#schemas", label: "Schemas" },
      { href: "#errors", label: "Errors envelope" },
      { href: "#webhooks-paymob", label: "Paymob webhook contract" },
    ],
  },
  {
    title: "Guides",
    links: [
      { href: "#apidog", label: "Import into Apidog" },
      { href: "../../Team2-Conference-Project/fullstack/Backend/docs/API-Reference.md", label: "Markdown guide ↗", external: true },
    ],
  },
]

export type Heading = { id: string; text: string; level: 1 | 2 | 3 }
export const ARTICLE_HEADINGS: Heading[] = [
  { id: "overview", text: "Every route, one shell.", level: 1 },
  { id: "quickstart", text: "Quickstart", level: 2 },
  { id: "authentication", text: "Authentication", level: 2 },
  { id: "auth-jwt", text: "JWT flow", level: 3 },
  { id: "auth-verify", text: "Email verification gate", level: 3 },
  { id: "auth-oauth", text: "OAuth (Google · Facebook)", level: 3 },
  { id: "auth-rbac", text: "Roles & permissions", level: 3 },
  { id: "endpoints", text: "Endpoints by domain", level: 2 },
  { id: "ep-account", text: "Account", level: 3 },
  { id: "ep-catalog", text: "Catalog", level: 3 },
  { id: "ep-trips", text: "Trips", level: 3 },
  { id: "ep-ai", text: "AI concierge", level: 3 },
  { id: "ep-commerce", text: "Commerce", level: 3 },
  { id: "ep-chat", text: "Chat", level: 3 },
  { id: "ep-system", text: "System", level: 3 },
  { id: "ep-admin", text: "Admin", level: 3 },
  { id: "schemas", text: "Schemas", level: 2 },
  { id: "schema-envelope", text: "Response envelope", level: 3 },
  { id: "schema-trip", text: "TripResource (abridged)", level: 3 },
  { id: "errors", text: "Errors envelope", level: 2 },
  { id: "webhooks-paymob", text: "Paymob webhook contract", level: 2 },
  { id: "apidog", text: "Import into Apidog", level: 2 },
]

export const QUICKSTART_SH = `# 1 — dependencies + env
composer install && cp .env.example .env
php artisan key:generate && php artisan jwt:secret --force
# 2 — schema + telemetry seeders (60+ paid orders)
php artisan migrate:fresh --seed
# 3 — serve
php artisan serve   # http://127.0.0.1:8000`

export const SCHEMAS: { id: string; title: string; json: string }[] = [
  {
    id: "schema-envelope",
    title: "Response envelope",
    json: `{
  "success": true,
  "message": "Human-readable summary",
  "data": { … },
  "meta": { "current_page": 1, "total": 84 }
}`,
  },
  {
    id: "schema-trip",
    title: "TripResource (abridged)",
    json: `{
  "id": 41,
  "title": "Cairo in 3 Days",
  "status": "planned",
  "is_public": false,
  "is_fork": false,
  "destinations": [{
    "id": 3, "name": "Cairo",
    "pivot": { "day_number": 1 }
  }],
  "items": [{
    "itemable_type": "hotel",
    "itemable_id": 12
  }],
  "itinerary_items": [{
    "day_number": 1,
    "title": "Pyramids",
    "estimated_cost": 45.00,
    "latitude": 29.97
  }]
}`,
  },
]

export const ERRORS: { code: string; meaning: string; notes: string }[] = [
  { code: "401", meaning: "Unauthenticated", notes: "Missing/expired bearer token — refresh or re-login." },
  { code: "403", meaning: "email_not_verified · trip_locked · forbidden", notes: "Verified-gate rejections carry a typed code the frontend toasts." },
  { code: "404", meaning: "Model not found", notes: "Uniform envelope, SPA-friendly fallback route." },
  { code: "422", meaning: "Validation", notes: "errors map keyed by field (FormRequests)." },
  { code: "429", meaning: "Throttled", notes: "Per-surface limiters (login·register·refresh·ai·checkout·weather…)." },
]

export const WEBHOOK_STEPS: { lead: string; detail: string }[] = [
  { lead: "Transport:", detail: "provider POSTs transaction updates to /api/paymob/webhook (plus legacy aliases) — no auth header." },
  { lead: "Verification first:", detail: "HMAC SHA-512 over the concatenated ordered fields using PAYMOB_HMAC; mismatch ⇒ 403 before any state change." },
  { lead: "Fail-fast config:", detail: "production refuses payment processing when the secret env is empty." },
  { lead: "Idempotency:", detail: "keyed on merchant_order_id — replays settle nothing twice." },
  { lead: "Fulfillment:", detail: "success → FulfillOrderListener settles orders/subscriptions/forks + queues PaymentSuccess mail; failure → HandlePaymentFailed." },
  { lead: "Browser redirect:", detail: "separate GET callback (/paymob/callback) only lands the user back on the frontend status page." },
]

export const APIDOG_STEPS: { title: string; detail: string }[] = [
  { title: "Serve the backend", detail: "php artisan serve → Scramble publishes the spec." },
  { title: "Locate the spec", detail: "Open /docs/api.json — OpenAPI 3.1 document covering all 213 routes." },
  { title: "Create Apidog project", detail: "New Project → name it Itinera API." },
  { title: "Open import dialog", detail: "Project settings → Import Data → choose URL source." },
  { title: "Paste spec URL", detail: "http://127.0.0.1:8000/docs/api.json → Continue." },
  { title: "Confirm format", detail: "Select OpenAPI/Swagger; keep auto-merge schemas checked." },
  { title: "Import & review", detail: "Domains arrive grouped (Account/Catalog/Trips/Commerce/System/Admin)." },
  { title: "Set environment", detail: "Base URL 127.0.0.1:8000/api; add Bearer token from login." },
  { title: "Send real requests", detail: "Try /flights then render its JSON into the showcase boarding pass." },
]

export const AUDIT_DATE = "2026-08-21"
