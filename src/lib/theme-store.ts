import { useSyncExternalStore } from "react"

export type Theme = "dark" | "light"

/* module-level store — no provider needed, syncs every toggle instance */
let theme: Theme = ((): Theme => {
  if (typeof document === "undefined") return "dark"
  const saved = localStorage.getItem("theme")
  return saved === "light" ? "light" : "dark" // dark is default
})()

const listeners = new Set<() => void>()

function apply() {
  document.documentElement.classList.toggle("light", theme === "light")
  document.documentElement.style.colorScheme = theme
}

/** call once, before React render — prevents light-mode flash on reload */
export function initTheme() {
  apply()
}

export function getTheme(): Theme {
  return theme
}

export function setTheme(next: Theme) {
  theme = next
  localStorage.setItem("theme", next)
  apply()
  listeners.forEach((l) => l())
}

export function toggleTheme() {
  setTheme(theme === "dark" ? "light" : "dark")
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useTheme(): [Theme, () => void] {
  const t = useSyncExternalStore(subscribe, getTheme)
  return [t, toggleTheme]
}
