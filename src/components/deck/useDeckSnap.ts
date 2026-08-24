import { useCallback, useEffect, useRef } from "react"
import type { RefObject, MutableRefObject } from "react"
import { ScrollTrigger } from "../../lib/gsap"
import { REFRESH } from "../../lib/deck-config"
import { buildOffsets, snapPointFor } from "../../lib/deck-snap-math"

export type DeckSnap = {
  offsetsRef: MutableRefObject<number[]>
  normRef: MutableRefObject<number[]>
  snapSTRef: MutableRefObject<ScrollTrigger | null>
  remeasure: () => void
}

/** Height-only resize heuristic for the cheap-remeasure path (D39d). */
export function heightOnlyChanged(prev: number, next: number): boolean {
  return Math.abs(next - prev) < REFRESH.widthFullRefreshPx
}

/**
 * Owns snap-point measurement (D12 rect-based, last clamped) and the ONE global
 * snapping ScrollTrigger (D9/D10). Recomputes on every ScrollTrigger refresh.
 */
export function useDeckSnap(deckRef: RefObject<HTMLElement | null>, enabled: boolean, slideCount: number): DeckSnap {
  const offsetsRef = useRef<number[]>([])
  const normRef = useRef<number[]>([])
  const snapSTRef = useRef<ScrollTrigger | null>(null)
  const dirRef = useRef<1 | -1>(1)

  const remeasure = useCallback(() => {
    const root = deckRef.current
    if (!root) return
    const sections = root.querySelectorAll<HTMLElement>("section[data-slide]")
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    const tops: number[] = []
    sections.forEach((s) => tops.push(s.getBoundingClientRect().top + window.scrollY))
    try {
      offsetsRef.current = buildOffsets(tops, maxScroll)
    } catch {
      offsetsRef.current = tops.map((t) => Math.round(t))
    }
    normRef.current = offsetsRef.current.map((o) => o / maxScroll)
  }, [deckRef])

  useEffect(() => {
    if (!enabled) return
    const root = deckRef.current
    if (!root || slideCount === 0) return

    remeasure()

    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight)

    snapSTRef.current = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      snap: {
        snapTo: (value) => {
          const offs = offsetsRef.current
          if (!offs.length) return value
          return snapPointFor(value, offs, maxScroll(), dirRef.current)
        },
        duration: { min: 0.15, max: 0.4 },
        delay: 0.12,
        ease: "power2.inOut",
        inertia: false,
      },
      onUpdate: (self) => {
        dirRef.current = self.direction === -1 ? -1 : 1
      },
    })

    const onRefresh = () => remeasure()
    ScrollTrigger.addEventListener("refresh", onRefresh)

    return () => {
      ScrollTrigger.removeEventListener("refresh", onRefresh)
      snapSTRef.current?.kill()
      snapSTRef.current = null
    }
  }, [enabled, slideCount, deckRef, remeasure])

  return { offsetsRef, normRef, snapSTRef, remeasure }
}
