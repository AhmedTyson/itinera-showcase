import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { gsap } from "../../lib/gsap"
import { ENTER } from "../../lib/deck-config"
import { SlideActiveContext } from "./slide-context"

type SlideProps = {
  id: string
  label: string
  index: number
  isActive: boolean
  enabled: boolean
  labelledBy: string
  children: ReactNode
}

/**
 * Slide shell (D22/D23). Content is visible-by-default — ALWAYS.
 * The entrance from-states are applied only on the rising activation edge,
 * only in armed deck mode, atomically inside one gsap.context that also
 * creates + plays the timeline. No window exists where DOM is hidden
 * without an owning context. playedRef ⇒ entrances play once (D21).
 */
export function Slide({ id, label, index, isActive, enabled, labelledBy, children }: SlideProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (!isActive || !enabled) return
    if (playedRef.current) return
    // refuse to arm outside an armed deck (D22) — covers portals/dialogs edge cases
    if (!el.closest(".deck-armed")) return
    playedRef.current = true

    const ctx = gsap.context(() => {
      try {
        const targets = {
          kicker: el.querySelectorAll<HTMLElement>('[data-reveal="kicker"]'),
          title: el.querySelectorAll<HTMLElement>('[data-reveal="title"]'),
          content: el.querySelectorAll<HTMLElement>('[data-reveal="content"]'),
        }
        const tl = gsap.timeline({ paused: true })
        if (targets.kicker.length) {
          tl.fromTo(targets.kicker, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: ENTER.durMin, ease: ENTER.ease }, 0)
        }
        if (targets.title.length) {
          tl.fromTo(targets.title, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: ENTER.durMax, ease: ENTER.ease }, targets.kicker.length ? "-=0.30" : 0)
        }
        const capped = [...targets.content].slice(0, ENTER.cap)
        if (capped.length) {
          tl.fromTo(
            capped,
            { y: 18, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: ENTER.durMax, ease: ENTER.ease, stagger: ENTER.stagger },
            targets.kicker.length || targets.title.length ? "-=0.35" : 0,
          )
        }
        tl.play()
      } catch {
        // any failure ⇒ context reverts on cleanup ⇒ children remain visible (D22)
      }
    }, el)
    return () => ctx.revert()
  }, [isActive, enabled])

  return (
    <SlideActiveContext.Provider value={enabled ? { isActive } : null}>
      <section
        ref={sectionRef}
        id={id}
        aria-labelledby={labelledBy}
        data-slide={label}
        data-slide-index={index}
        className="relative w-full md:min-h-dvh flex flex-col justify-center pt-16 pb-10"
      >
        {children}
      </section>
    </SlideActiveContext.Provider>
  )
}
