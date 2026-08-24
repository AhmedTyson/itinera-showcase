import { useCallback, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { gsap, ScrollTrigger } from "../../lib/gsap"
import { JUMP, SLIDES } from "../../lib/deck-config"
import { on, setDeckMounted } from "../../lib/deckBus"
import { useDeckCapabilities } from "../../hooks/useDeckCapabilities"
import { heightOnlyChanged, useDeckSnap } from "./useDeckSnap"
import { useDeckNav } from "./useDeckNav"
import { DeckChrome } from "./DeckChrome"

type DeckProps = {
  /** Topbar is rendered by Deck so chrome + nav share one owner */
  topbar: ReactNode
  /** one node per SLIDES entry, in manifest order */
  slides: ReactNode[]
}

/**
 * Deck engine (D3): the ONLY owner of ScrollTriggers and activeIndex.
 * Snap topology D9 · jump sequence D13 · refresh D39 · scrollbar guard D40 ·
 * anchor interception D20 · fallback D37.
 */
export function Deck({ topbar, slides }: DeckProps) {
  const caps = useDeckCapabilities()
  const enabled = caps.deckEnabled
  const deckRef = useRef<HTMLDivElement>(null)
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keyboardRef = useRef(false)
  const pendingHashRef = useRef<string | null>(null)
  const lastROH = useRef<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const { offsetsRef, snapSTRef, remeasure } = useDeckSnap(deckRef, enabled, slides.length)

  const reEnableSnap = useCallback(() => {
    if (!gsap.isTweening(window)) snapSTRef.current?.enable()
  }, [])

  // ── D13 jump + interrupt sequence ──
  const goTo = useCallback(
    (i: number, immediate = false) => {
      const clamped = Math.max(0, Math.min(SLIDES.length - 1, i))
      const target = offsetsRef.current[clamped] ?? 0
      const st = snapSTRef.current
      st?.disable() // 1. snap stands down FIRST
      gsap.killTweensOf(window) // 2. kill prior jump tween
      if (immediate) {
        window.scrollTo({ top: target })
        setActiveIndex(clamped)
        st?.enable()
        return
      }
      const dist = Math.abs(target - window.scrollY)
      gsap.to(window, {
        scrollTo: { y: target, autoKill: true }, // 3. user wheel-grab wins mid-flight
        duration: Math.min(JUMP.maxDur, Math.max(JUMP.minDur, dist / JUMP.pxPerSec)),
        ease: "power2.inOut",
        overwrite: true,
        onComplete: () => {
          setActiveIndex(clamped)
          reEnableSnap()
        },
        onInterrupt: reEnableSnap,
      })
      // 4. guaranteed heal ≤1.2s even if a callback is lost (QA R3)
      if (watchdogRef.current) clearTimeout(watchdogRef.current)
      watchdogRef.current = setTimeout(reEnableSnap, JUMP.watchdogMs)
    },
    [offsetsRef, reEnableSnap],
  )

  const goToId = useCallback(
    (id: string) => {
      const idx = SLIDES.findIndex((s) => s.id === id)
      if (idx >= 0) goTo(idx)
    },
    [goTo],
  )

  // ── deckBus registration + jump subscription ──
  useEffect(() => {
    if (!enabled) return
    setDeckMounted(SLIDES.map((s) => s.id))
    const off = on("jump", (p) => goToId(p.id))
    return () => {
      off()
      setDeckMounted(null)
    }
  }, [enabled, goToId])

  // ── activation triggers (D15) — StrictMode-safe via context ──
  useEffect(() => {
    if (!enabled) return
    const root = deckRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      SLIDES.forEach((s, i) => {
        ScrollTrigger.create({
          trigger: `#${s.id}`,
          start: "top 55%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) setActiveIndex(i)
          },
        })
      })
    }, root)

    // dev refresh-convergence assertion (QA F29)
    let devHandler: (() => void) | null = null
    let refreshCount = 0
    let refreshTimer: ReturnType<typeof setTimeout> | null = null
    if (import.meta.env.DEV) {
      devHandler = () => {
        refreshCount++
        if (refreshTimer) clearTimeout(refreshTimer)
        refreshTimer = setTimeout(() => {
          if (refreshCount > 8) console.warn(`[deck] ${refreshCount} refreshes in 3s — check refresh orchestration`)
          refreshCount = 0
        }, 3000)
      }
      ScrollTrigger.addEventListener("refresh", devHandler)
    }

    return () => {
      if (devHandler) ScrollTrigger.removeEventListener("refresh", devHandler)
      if (refreshTimer) clearTimeout(refreshTimer)
      ctx.revert()
    }
  }, [enabled])

  // ── D39 refresh orchestration ──
  useEffect(() => {
    if (!enabled) return
    let lastW = window.innerWidth
    let lastH = window.innerHeight
    let lastVV = window.visualViewport?.height ?? 0
    let roTimer: ReturnType<typeof setTimeout> | null = null
    let rzTimer: ReturnType<typeof setTimeout> | null = null
    let vvTimer: ReturnType<typeof setTimeout> | null = null

    const reAnchorIfNeeded = () => {
      const id = pendingHashRef.current
      if (!id) return
      const idx = SLIDES.findIndex((s) => s.id === id)
      if (idx >= 0) {
        const target = offsetsRef.current[idx] ?? 0
        window.scrollTo({ top: target })
        setActiveIndex(idx)
      }
    }

    const onResize = () => {
      if (rzTimer) clearTimeout(rzTimer)
      rzTimer = setTimeout(() => {
        const w = window.innerWidth
        const h = window.innerHeight
        const bigW = Math.abs(w - lastW) > 50
        const bigH = Math.abs(h - lastH) > 50
        if (bigW || bigH) {
          lastW = w
          lastH = h
          ScrollTrigger.refresh()
          reAnchorIfNeeded()
        } else if (!heightOnlyChanged(lastH, h)) {
          lastH = h
          remeasure()
          reAnchorIfNeeded()
        }
      }, 150)
    }

    const onVV = () => {
      if (vvTimer) clearTimeout(vvTimer)
      vvTimer = setTimeout(() => {
        const h = window.visualViewport?.height ?? 0
        if (lastVV && Math.abs(h - lastVV) >= 1) {
          remeasure()
          reAnchorIfNeeded()
        }
        lastVV = h
      }, 100)
    }

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height
      if (roTimer) clearTimeout(roTimer)
      roTimer = setTimeout(() => {
        if (lastROH.current !== null && Math.abs(h - lastROH.current) >= 2) {
          lastROH.current = h
          ScrollTrigger.refresh()
          reAnchorIfNeeded()
        } else if (lastROH.current === null) {
          lastROH.current = h
        }
      }, 120)
    })
    if (deckRef.current) ro.observe(deckRef.current)

    const onOrientation = () => {
      setTimeout(() => ScrollTrigger.refresh(), 200)
    }

    document.fonts.ready.then(() => {
      ScrollTrigger.refresh()
      reAnchorIfNeeded()
    })
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true })
    window.addEventListener("resize", onResize)
    window.visualViewport?.addEventListener("resize", onVV)
    window.addEventListener("orientationchange", onOrientation)

    return () => {
      ro.disconnect()
      if (roTimer) clearTimeout(roTimer)
      if (rzTimer) clearTimeout(rzTimer)
      if (vvTimer) clearTimeout(vvTimer)
      window.removeEventListener("resize", onResize)
      window.visualViewport?.removeEventListener("resize", onVV)
      window.removeEventListener("orientationchange", onOrientation)
    }
  }, [enabled, offsetsRef, pendingHashRef, remeasure])

  // ── D40 scrollbar-drag guard ──
  useEffect(() => {
    if (!enabled) return
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.clientX >= window.innerWidth - 20) snapSTRef.current?.disable()
    }
    const up = () => reEnableSnap()
    window.addEventListener("pointerdown", down, true)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
    return () => {
      window.removeEventListener("pointerdown", down, true)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
    }
  }, [enabled, reEnableSnap])

  // ── D38 beforeprint ──
  useEffect(() => {
    if (!enabled) return
    const onPrint = () => gsap.set("[data-reveal]", { clearProps: "opacity,visibility,transform" })
    window.addEventListener("beforeprint", onPrint)
    return () => window.removeEventListener("beforeprint", onPrint)
  }, [enabled])

  // ── D20 delegated anchor interception (covers Hero CTA + any inline anchor) ──
  useEffect(() => {
    if (!enabled) return
    const root = deckRef.current
    if (!root) return
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement).closest("a[href^='#']")
      if (!a) return
      const id = a.getAttribute("href")!.slice(1)
      if (!id) return
      if (SLIDES.some((s) => s.id === id)) {
        e.preventDefault()
        goToId(id)
      }
    }
    root.addEventListener("click", onClick, true)
    return () => root.removeEventListener("click", onClick, true)
  }, [enabled, goToId])

  // ── data-deck + deck-armed lifecycle (D14/D22) ──
  useEffect(() => {
    if (enabled) {
      document.documentElement.dataset.deck = "on"
      deckRef.current?.classList.add("deck-armed")
    }
    return () => {
      delete document.documentElement.dataset.deck
      deckRef.current?.classList.remove("deck-armed")
    }
  }, [enabled])

  // ── D37 teardown on fallback flip ──
  useEffect(() => {
    if (enabled) return
    gsap.killTweensOf(window)
    setActiveIndex(0)
  }, [enabled])

  // ── keyboard + hash (T5) ──
  useDeckNav({ enabled, activeIndex, count: SLIDES.length, goTo, keyboardRef, pendingHashRef })

  // ── fallback branch: relocated batch-reveal (D37) — mobile parity with today ──
  useEffect(() => {
    if (enabled) return
    const ctx = gsap.context(() => {
      gsap.set(".fe-card, .hard-card, .demo-card, .dep-step", { autoAlpha: 0, y: 16 })
      ScrollTrigger.batch(".fe-card, .hard-card, .demo-card, .dep-step", {
        start: "top 88%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }),
      })
    })
    return () => ctx.revert()
  }, [enabled])

  return (
    <div ref={deckRef}>
      {topbar}
      {slides}
      <DeckChrome
        count={SLIDES.length}
        activeIndex={enabled ? activeIndex : -1}
        labels={SLIDES.map((s) => s.label)}
        onSelect={(i) => goTo(i)}
      />
    </div>
  )
}
