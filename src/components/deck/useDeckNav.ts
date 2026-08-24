import { useEffect, useRef } from "react"
import type { MutableRefObject } from "react"
import { SLIDES } from "../../lib/deck-config"

type NavOpts = {
  enabled: boolean
  activeIndex: number
  count: number
  goTo: (index: number, immediate?: boolean) => void
  /** keyboard-initiated nav ⇒ focus the slide heading after settle (D34) */
  keyboardRef: MutableRefObject<boolean>
  /** Deck-owned; useDeckNav manages its expiry window (D17) */
  pendingHashRef: MutableRefObject<string | null>
}

/**
 * Keyboard map (D33) + hash lifecycle (D16) + deep-link/re-anchor window (D17).
 * Space is NOT bound. Tab is NEVER intercepted. Dialogs/inputs are guarded.
 */
export function useDeckNav({ enabled, activeIndex, count, goTo, keyboardRef, pendingHashRef }: NavOpts): void {
  const activeRef = useRef(activeIndex)
  activeRef.current = activeIndex
  const announcedRef = useRef(-1)

  // ── keyboard (D33) ──
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector("[role='dialog']")) return
      const t = e.target as HTMLElement | null
      if (t && (t.matches("input, textarea, select") || t.isContentEditable)) return
      let target: number | null = null
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          target = Math.min(count - 1, activeRef.current + 1)
          break
        case "ArrowUp":
        case "PageUp":
          target = Math.max(0, activeRef.current - 1)
          break
        case "Home":
          target = 0
          break
        case "End":
          target = count - 1
          break
        default:
          return
      }
      e.preventDefault()
      if (target === activeRef.current) return
      keyboardRef.current = true
      goTo(target)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [enabled, count, goTo, keyboardRef])

  // ── hash sync (D16: replaceState only — scrolling never grows history) ──
  useEffect(() => {
    if (!enabled) return
    const id = SLIDES[activeIndex]?.id
    if (!id) return
    const raf = requestAnimationFrame(() => {
      if (location.hash !== `#${id}`) history.replaceState(null, "", `#${id}`)
    })
    return () => cancelAnimationFrame(raf)
  }, [enabled, activeIndex])

  // ── manual hash edits → animated jump (D16) ──
  useEffect(() => {
    if (!enabled) return
    const onHash = () => {
      const id = location.hash.slice(1)
      const idx = SLIDES.findIndex((s) => s.id === id)
      if (idx >= 0) goTo(idx)
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [enabled, goTo])

  // ── live region announcement (D32, 250ms debounce) ──
  useEffect(() => {
    if (!enabled) return
    if (announcedRef.current === activeIndex) return
    announcedRef.current = activeIndex
    const t = setTimeout(() => {
      const region = document.getElementById("deck-live-region")
      const slide = SLIDES[activeIndex]
      if (region && slide) region.textContent = `Slide ${activeIndex + 1} of ${SLIDES.length} — ${slide.label}`
    }, 250)
    return () => clearTimeout(t)
  }, [enabled, activeIndex])

  // ── deep-link re-anchor window (D17) ──
  useEffect(() => {
    if (!enabled) return
    const hash = location.hash.slice(1)
    const known = SLIDES.some((s) => s.id === hash)
    if (!hash || !known) return
    pendingHashRef.current = hash
    const expire = setTimeout(() => {
      pendingHashRef.current = null
    }, 2500)
    return () => clearTimeout(expire)
  }, [enabled, pendingHashRef])
}
