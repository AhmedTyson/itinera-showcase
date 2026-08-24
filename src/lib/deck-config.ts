export type SlideDef = { id: string; label: string }

/** Frozen manifest — bookmarkable public URLs; changing these breaks deployed links. */
export const SLIDES: SlideDef[] = [
  { id: "hero", label: "Overview" },
  { id: "telemetry", label: "Operations telemetry" },
  { id: "architecture", label: "Architecture" },
  { id: "stack", label: "Stack" },
  { id: "frontend", label: "Frontend" },
  { id: "security", label: "Hardening I" },
  { id: "hardening-ii", label: "Hardening II" },
  { id: "ops", label: "Ops console" },
  { id: "deploy", label: "Deploy & testing" },
  { id: "demo", label: "Product demo" },
  { id: "team", label: "Team 2" },
  { id: "closing", label: "Links" },
]

export const MOBILE_BP = "(min-width: 768px)"

/** Snap constants — tuned ONCE on real hardware (T13), never ad hoc. */
export const SNAP = {
  durationMin: 0.15,
  durationMax: 0.4,
  delay: 0.12,
  ease: "power2.inOut",
  inertia: false,
} as const

/** Entrance grammar constants (D23). */
export const ENTER = {
  stagger: 0.08,
  durMin: 0.45,
  durMax: 0.55,
  ease: "power2.out",
  cap: 8,
} as const

/** Programmatic jump constants (D13). */
export const JUMP = {
  minDur: 0.4,
  maxDur: 0.9,
  pxPerSec: 3000,
  watchdogMs: 1200,
} as const

/** Refresh orchestration constants (D39). */
export const REFRESH = {
  roDeltaPx: 2,
  roDebounceMs: 120,
  resizeDebounceMs: 150,
  vvThrottleMs: 100,
  orientationDelayMs: 200,
  reAnchorWindowMs: 2500,
  widthFullRefreshPx: 50,
} as const

export type PaletteEntry = { type: "heading"; id: string; label: string; sub: string }

/** Palette entries shown while the deck is mounted (D18) — all slides except hero. */
export const DECK_PALETTE_ENTRIES: PaletteEntry[] = SLIDES.filter((s) => s.id !== "hero").map((s) => ({
  type: "heading",
  id: s.id,
  label: s.label,
  sub: "Slide",
}))
