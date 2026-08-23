import { useEffect, useState } from "react"

/** Live prefers-reduced-motion — honors ?motion=force QA flag */
export function useIsReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false
    if (/[?&]motion=force\b/.test(window.location.search)) return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  })

  useEffect(() => {
    if (/[?&]motion=force\b/.test(window.location.search)) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return reduced
}
