export type LifecycleChapter = {
  id: string
  kicker: string
  title: string
  lines: [string, string]
  artifact: string
  accent: string
  /** trace-log status line shown while this chapter is active */
  trace: string
  chips: string[]
  scene:
    | "request"
    | "router"
    | "guard"
    | "throttle"
    | "validation"
    | "controller"
    | "service"
    | "persistence"
    | "ok"
}

/** The request lifecycle, A → Z — facts from routes/api.php + the audited codebase. */
export const LIFECYCLE_CHAPTERS: LifecycleChapter[] = [
  {
    id: "request",
    kicker: "STAGE 01 · CLIENT",
    title: "The Request",
    lines: [
      "A traveler taps Book in the vanilla client.",
      "fetch() opens a bearer-authenticated call into /api.",
    ],
    artifact: "Authorization: Bearer eyJ0eXAiOiJKV1Qi...",
    accent: "#fbbf24",
    trace: "SESSION · request leaving the client →",
    chips: ["fetch()", "Bearer auth", "/api/checkout"],
    scene: "request",
  },
  {
    id: "router",
    kicker: "STAGE 02 · ROUTING",
    title: "The Router",
    lines: [
      "routes/api.php matches the path and assembles",
      "the middleware pipeline — throttle first, guard second.",
    ],
    artifact: "Route::post('/checkout') · throttle:checkout · auth:api",
    accent: "#fbbf24",
    trace: "POST /checkout · route matched",
    chips: ["routes/api.php", "90 routes", "middleware pipeline"],
    scene: "router",
  },
  {
    id: "guard",
    kicker: "STAGE 03 · AUTHENTICATION",
    title: "The Guard",
    lines: [
      "tymon/jwt-auth verifies the signature, checks the blacklist,",
      "resolves the user. A stolen token dies at its next refresh.",
    ],
    artifact: "auth:api → user #1 · super_admin",
    accent: "#34d399",
    trace: "auth:api · signature verified",
    chips: ["tymon/jwt-auth", "HS512", "blacklist"],
    scene: "guard",
  },
  {
    id: "throttle",
    kicker: "STAGE 04 · RATE LIMIT",
    title: "The Throttle",
    lines: [
      "Per-user + per-IP sliding windows count the hit.",
      "Over the ceiling, the request never reaches business logic.",
    ],
    artifact: "throttle:checkout → 6 / 60 consumed",
    accent: "#34d399",
    trace: "throttle:checkout · 6/60 consumed",
    chips: ["per-user + IP", "sliding window", "CI-tested"],
    scene: "throttle",
  },
  {
    id: "validation",
    kicker: "STAGE 05 · VALIDATION",
    title: "FormRequest",
    lines: [
      "StoreCheckoutRequest type-checks every field.",
      "A miss never touches a service — 422 with a field bag.",
    ],
    artifact: '422 { "amount": ["must be numeric"] }',
    accent: "#fbbf24",
    trace: "422 guard armed · fields checked",
    chips: ["FormRequest", "field bag", "zero drift"],
    scene: "validation",
  },
  {
    id: "controller",
    kicker: "STAGE 06 · CONTROLLER",
    title: "Thin Controller",
    lines: [
      "The controller validates intent, delegates, and returns.",
      "Zero business logic in the HTTP layer — grep-able routes only.",
    ],
    artifact: "return ApiResponse::success(new CheckoutResource(...))",
    accent: "#a78bfa",
    trace: "controller → service · delegated",
    chips: ["thin", "ApiResponse", "zero logic"],
    scene: "controller",
  },
  {
    id: "service",
    kicker: "STAGE 07 · SERVICE LAYER",
    title: "The Service",
    lines: [
      "CheckoutService resolves the strategy, opens the transaction,",
      "calls Paymob — idempotency keyed on merchant_order_id.",
    ],
    artifact: "Paymob::intention() → client_secret",
    accent: "#a78bfa",
    trace: "transaction open · paymob intention",
    chips: ["strategy", "transaction", "idempotency"],
    scene: "service",
  },
  {
    id: "persistence",
    kicker: "STAGE 08 · PERSISTENCE",
    title: "Repository → Model",
    lines: [
      "The contract-bound repository hands the row to Eloquent.",
      "The order is written; FulfillOrderListener picks it up.",
    ],
    artifact: "Order::create() → FulfillOrderListener",
    accent: "#34d399",
    trace: "Order::create() · row written",
    chips: ["Eloquent", "contract-bound", "listener"],
    scene: "persistence",
  },
  {
    id: "ok",
    kicker: "STAGE 09 · RESPONSE",
    title: "200 OK",
    lines: [
      "The envelope ships — success, message, data.",
      "The ticket is issued. Trace complete.",
    ],
    artifact: '{ "success": true, "data": { ... } } · 38ms',
    accent: "#fbbf24",
    trace: "STATUS 200 · trace complete",
    chips: ["envelope", "38ms", "ticket issued"],
    scene: "ok",
  },
]
