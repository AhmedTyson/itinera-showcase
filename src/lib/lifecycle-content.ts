export type LifecycleChapter = {
  id: string
  kicker: string
  title: string
  lines: string[]
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
    | "webhook"
}
