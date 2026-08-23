import { useCallback } from "react"
import { useIsReducedMotion } from "./useIsReducedMotion"

type LenisLike = { scrollTo: (target: string | Element, opts?: { offset?: number; duration?: number; force?: boolean }) => void }

/** DIP: scroll abstraction — prefers Lenis when present, else native smooth */
export function useScrollTo(lenisRef?: React.RefObject<LenisLike | null>) {
  const isRM = useIsReducedMotion()

  return useCallback(
    (target: string | Element, offset = -84) => {
      const el = typeof target === "string" ? document.querySelector(target) : target
      if (!el) return
      const lenis = (lenisRef?.current ?? (window as unknown as { __lenis?: LenisLike }).__lenis) as LenisLike | undefined
      if (lenis && !isRM) {
        lenis.scrollTo(el, { offset, duration: 0.9, force: true })
        const id = (el as Element).id
        if (id) history.replaceState(null, "", "#" + id)
        return
      }
      const y = (el as Element).getBoundingClientRect().top + window.scrollY + offset
      window.scrollTo({ top: y, behavior: isRM ? "auto" : "smooth" })
      const id = (el as Element).id
      if (id) history.replaceState(null, "", "#" + id)
    },
    [isRM, lenisRef]
  )
}
