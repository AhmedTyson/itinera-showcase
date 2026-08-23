import * as React from "react"

export function useAnnouncer() {
  const ref = React.useRef<HTMLDivElement>(null)
  const announce = React.useCallback((msg: string) => {
    const el = ref.current
    if (!el) return
    el.textContent = ""
    requestAnimationFrame(() => {
      el.textContent = msg
    })
  }, [])
  const Region = React.useCallback(
    () => React.createElement("div", { ref, role: "status", "aria-live": "polite", "aria-atomic": "true", className: "sr-only" } as React.HTMLAttributes<HTMLDivElement>),
    []
  )
  return { announce, ref, Region }
}
