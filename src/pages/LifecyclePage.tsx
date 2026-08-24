import { useEffect, useState } from "react"
import { useIsReducedMotion } from "../hooks/useIsReducedMotion"
import { gsap, ScrollTrigger } from "../lib/gsap"
import { LIFECYCLE_CHAPTERS } from "../lib/lifecycle-content"
import { Chapter } from "../components/lifecycle/Chapter"
import { ChapterChrome } from "../components/lifecycle/ChapterChrome"

/**
 * /lifecycle — scroll-driven, prototype-faithful: 10 stacked full-screen
 * chapters, reveals reverse on scroll-back, the motion chapter pins + scrubs,
 * rail/trace-log track the active chapter. No buttons, no snap.
 */
export default function LifecyclePage() {
  const reducedMotion = useIsReducedMotion()
  const count = LIFECYCLE_CHAPTERS.length
  const [index, setIndex] = useState(0)

  // active chapter drives rail + trace log + counter + hash (replaceState only)
  useEffect(() => {
    const root = document.getElementById("lifecycle-root")
    if (!root) return
    if (reducedMotion) {
      // no triggers — default to the first chapter, content fully visible
      return
    }
    const ctx = gsap.context(() => {
      LIFECYCLE_CHAPTERS.forEach((c, i) => {
        ScrollTrigger.create({
          trigger: `#${c.id}`,
          start: "top center",
          end: "bottom center",
          onEnter: () => activate(i),
          onEnterBack: () => activate(i),
        })
      })

      // deep link: ?stage=id → jump before first paint of scroll position
      const id = new URLSearchParams(window.location.search).get("stage")
      const idx = LIFECYCLE_CHAPTERS.findIndex((ch) => ch.id === id)
      if (idx > 0) {
        document.getElementById(LIFECYCLE_CHAPTERS[idx].id)?.scrollIntoView()
        activate(idx)
      }
    }, root)
    return () => ctx.revert()
  }, [reducedMotion])

  function activate(i: number) {
    setIndex((prev) => {
      if (prev === i) return prev
      history.replaceState(null, "", `/lifecycle?stage=${LIFECYCLE_CHAPTERS[i].id}`)
      return i
    })
  }

  // keep document height honest after fonts/layout settle
  useEffect(() => {
    document.fonts.ready.then(() => ScrollTrigger.refresh())
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true })
  }, [])

  const chapter = LIFECYCLE_CHAPTERS[index]

  return (
    <div id="lifecycle-root" className="lifecycle-root relative bg-bg-0 text-text" style={{ ["--acc" as string]: chapter.accent }}>
      {/* grain */}
      <div aria-hidden className="grain" />

      {/* ambient accent wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 transition-all duration-700"
        style={{ background: `radial-gradient(900px 520px at 68% 38%, ${chapter.accent}0D, transparent)` }}
      />

      {/* trace log — the page narrates itself; stacked under the back link */}
      <div className="pointer-events-none fixed left-6 top-[4.25rem] z-30 hidden items-center gap-2 font-mono text-[11px] tracking-[0.06em] text-dim md:flex">
        <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: chapter.accent }} />
        <span key={chapter.id}>{chapter.trace}</span>
      </div>

      {LIFECYCLE_CHAPTERS.map((c, i) => (
        <Chapter key={c.id} chapter={c} index={i} total={count} reducedMotion={reducedMotion} />
      ))}

      {/* thin progress edge — full width, accent fill */}
      <div aria-hidden className="fixed inset-x-0 top-0 z-40 h-[2px] bg-border/40">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{ width: `${((index + 1) / count) * 100}%`, background: chapter.accent }}
        />
      </div>

      <ChapterChrome
        count={count}
        index={index}
        labels={LIFECYCLE_CHAPTERS.map((c) => c.title)}
        accents={LIFECYCLE_CHAPTERS.map((c) => c.accent)}
        ids={LIFECYCLE_CHAPTERS.map((c) => c.id)}
      />
    </div>
  )
}
