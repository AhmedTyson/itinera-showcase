import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { gsap } from "../../lib/gsap"
import { ENTER } from "../../lib/deck-config"
import { useSlideActive } from "./slide-context"

type SlideProps = {
  id: string
  label: string
  index: number
  /** id of the slide's h2; omit (hero) ⇒ aria-label fallback */
  labelledBy?: string
  children: ReactNode
}

/**
 * Slide shell (D22/D23). Content is visible-by-default — ALWAYS.
 * Entrance from-states apply only on the rising activation edge, only in armed
 * deck mode, atomically inside one gsap.context that also plays the timeline.
 * isActive comes from SlideActiveContext (Deck owns activeIndex, D15).
 * playedRef ⇒ entrances play once (D21). Hero slide carries no data-reveal
 * markers ⇒ grammar no-ops (D29).
 */
export function Slide({ id, label, index, labelledBy, children }: SlideProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const playedRef = useRef(false)
  const active = useSlideActive()

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (active === null || !active.isActive) return // null ⇒ deck off ⇒ legacy/fallback path
    if (playedRef.current) return
    if (!el.closest(".deck-armed")) return // D22 arming gate
    playedRef.current = true

    const ctx = gsap.context(() => {
      try {
        const kicker = el.querySelectorAll<HTMLElement>('[data-reveal="kicker"]')
        const title = el.querySelectorAll<HTMLElement>('[data-reveal="title"]')
        const content = [...el.querySelectorAll<HTMLElement>('[data-reveal="content"]')].slice(0, ENTER.cap)
        const tl = gsap.timeline({ paused: true })
        if (kicker.length) {
          tl.fromTo(kicker, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: ENTER.durMin, ease: ENTER.ease }, 0)
        }
        if (title.length) {
          tl.fromTo(title, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: ENTER.durMax, ease: ENTER.ease }, kicker.length ? "-=0.30" : 0)
        }
        if (content.length) {
          tl.fromTo(
            content,
            { y: 18, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: ENTER.durMax, ease: ENTER.ease, stagger: ENTER.stagger },
            kicker.length || title.length ? "-=0.35" : 0,
          )
        }
        tl.play()
      } catch {
        // failure ⇒ cleanup reverts ⇒ children stay visible (D22)
      }
    }, el)
    return () => ctx.revert()
  }, [active])

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-labelledby={labelledBy || undefined}
      aria-label={labelledBy ? undefined : label}
      data-slide={label}
      data-slide-index={index}
      className={index === 0
        ? "relative w-full" // hero manages its own spacing (D29 — no deck shell padding)
        : "relative w-full md:min-h-dvh flex flex-col justify-center pt-16 pb-10"}
    >
      {children}
    </section>
  )
}
