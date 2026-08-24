export type ArchNode = {
  id: string
  label: string
  title: string
  sub: string
  x: number
  y: number
  tone?: "primary" | "accent" | "warn"
  archKey: string
}

export const ARCH_NODES: ArchNode[] = [
  { id: "client", label: "frontend", title: "Vanilla JS Client", sub: "48+ pages · 33 modules", x: 2, y: 5, tone: "primary", archKey: "client" },
  { id: "api", label: "gateway", title: "Laravel Router", sub: "106 api routes · throttles", x: 21, y: 5, tone: "accent", archKey: "api" },
  { id: "auth", label: "guard", title: "JWT + RBAC", sub: "tymon + spatie · verified", x: 41, y: 2, archKey: "auth" },
  { id: "controllers", label: "http", title: "Controllers ×49", sub: "FormRequests in", x: 60, y: 5, archKey: "controllers" },
  { id: "services", label: "domain", title: "Services ×28", sub: "Trip · Groq · Checkout", x: 79, y: 5, tone: "primary", archKey: "services" },
  { id: "pay", label: "payments", title: "Paymob Gateway", sub: "HMAC webhook", x: 2, y: 42, tone: "warn", archKey: "pay" },
  { id: "ai", label: "ai", title: "Groq llama-3.3-70b", sub: "cache · quota · fallback", x: 21, y: 42, tone: "accent", archKey: "ai" },
  { id: "repos", label: "contracts", title: "Repositories ×19", sub: "interface + impl pairs", x: 60, y: 42, archKey: "repos" },
  { id: "models", label: "orm", title: "Models ×37", sub: "6 domains · morph map", x: 79, y: 42, archKey: "models" },
  { id: "ext", label: "external", title: "Meteo · OSM · Mail", sub: "cached · throttled", x: 2, y: 76, archKey: "ext" },
  { id: "queue", label: "async", title: "Queue & Jobs", sub: "database driver", x: 21, y: 76, archKey: "queue" },
  { id: "db", label: "persistence", title: "MySQL · 44 migrations", sub: "SQLite in dev/test", x: 60, y: 76, archKey: "db" },
  { id: "obs", label: "platform", title: "Pail · Telescope", sub: "prod-gated opt-in", x: 79, y: 76, archKey: "obs" },
]

export type ArchEdge = { from: string; to: string }

export const ARCH_EDGES: ArchEdge[] = [
  { from: "client", to: "api" },
  { from: "api", to: "auth" },
  { from: "auth", to: "controllers" },
  { from: "controllers", to: "services" },
  { from: "repos", to: "models" },
  { from: "models", to: "db" },
  { from: "pay", to: "ai" },
  { from: "queue", to: "db" },
  // verticals are handled via y-delta in SVG, but keep as edges for completeness
  { from: "services", to: "models" },
]

export type ErNode = {
  id: string
  label: string
  title: string
  x: number
  y: number
  entityKey: string
  columns: { name: string; note?: string }[]
}

export const ER_NODES: ErNode[] = [
  { id: "user", label: "account", title: "users", x: 2, y: 4, entityKey: "user", columns: [{ name: "id", note: "PK" }, { name: "email", note: "UQ" }, { name: "email_verified_at" }, { name: "google_id · facebook_id" }] },
  { id: "trip", label: "root aggregate", title: "trips", x: 25, y: 4, entityKey: "trip", columns: [{ name: "user_id", note: "FK" }, { name: "status", note: "enum" }, { name: "parent_trip_id" }, { name: "is_public" }] },
  { id: "itinerary", label: "day planner", title: "itinerary_items", x: 51, y: 4, entityKey: "itinerary", columns: [{ name: "trip_id", note: "FK" }, { name: "itemable", note: "poly" }, { name: "day_number · item_order" }, { name: "estimated_cost" }] },
  { id: "payment", label: "ledger", title: "orders · payments", x: 77, y: 4, entityKey: "payment", columns: [{ name: "reference", note: "UQ" }, { name: "amount_cents" }, { name: "payload", note: "json" }, { name: "merchant_order_id" }] },
  { id: "dest", label: "catalog hub", title: "destinations", x: 25, y: 52, entityKey: "dest", columns: [{ name: "country_id", note: "FK" }, { name: "latitude · longitude" }] },
  { id: "hotel", label: "stay", title: "hotels", x: 2, y: 52, entityKey: "hotel", columns: [{ name: "destination_id", note: "FK" }, { name: "price_per_night" }] },
  { id: "restaurant", label: "dining", title: "restaurants", x: 2, y: 72, entityKey: "restaurant", columns: [{ name: "destination_id", note: "FK" }, { name: "average_price" }] },
  { id: "attraction", label: "poi", title: "attractions", x: 25, y: 72, entityKey: "attraction", columns: [{ name: "entry_fee" }, { name: "latitude · longitude" }] },
  { id: "flight", label: "air", title: "flights", x: 51, y: 52, entityKey: "flight", columns: [{ name: "origin · destination" }, { name: "price" }] },
  { id: "agency", label: "marketplace", title: "agency_assignments", x: 77, y: 52, entityKey: "agency", columns: [{ name: "trip_id · agency_id", note: "FK" }, { name: "status machine" }] },
  { id: "ai_gen", label: "audit trail", title: "ai_generations", x: 51, y: 72, entityKey: "ai_gen", columns: [{ name: "trip_id", note: "FK" }, { name: "model · tokens" }, { name: "prompt · response" }] },
  { id: "review", label: "moderation", title: "reviews · flags", x: 77, y: 72, entityKey: "review", columns: [{ name: "reviewable", note: "poly" }, { name: "user_id", note: "FK" }, { name: "approve/reject flow" }] },
]

export const ER_EDGES: ArchEdge[] = [
  { from: "trip", to: "user" },
  { from: "itinerary", to: "trip" },
  { from: "payment", to: "trip" },
  { from: "dest", to: "trip" },
  { from: "hotel", to: "dest" },
  { from: "restaurant", to: "dest" },
  { from: "attraction", to: "dest" },
  { from: "flight", to: "trip" },
]
