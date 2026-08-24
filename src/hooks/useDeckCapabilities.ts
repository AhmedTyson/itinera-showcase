import { useEffect, useState } from "react"
import { MOBILE_BP } from "../lib/deck-config"
import { useIsReducedMotion } from "./useIsReducedMotion"

export type DeckCapabilities = {
  /** true when viewport is BELOW the deck breakpoint (<768px) */
  isMobile: boolean
  reducedMotion: boolean
  killSwitch: boolean
  deckEnabled: boolean
}

function readKillSwitch(): boolean {
  try {
    return new URLSearchParams(window.location.search).has("deck=off")
  } catch {
    return false
  }
}

/** Live gate for every deck-vs-fallback branch (D36). Scattered matchMedia calls forbidden. */
export function useDeckCapabilities(): DeckCapabilities {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && !window.matchMedia(MOBILE_BP).matches)
  const reducedMotion = useIsReducedMotion()
  const [killSwitch] = useState(readKillSwitch)

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BP)
    const onMq = () => setIsMobile(!mq.matches)
    mq.addEventListener("change", onMq)
    return () => mq.removeEventListener("change", onMq)
  }, [])

  return { isMobile, reducedMotion, killSwitch, deckEnabled: !isMobile && !reducedMotion && !killSwitch }
}
