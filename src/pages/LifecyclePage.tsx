import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useIsReducedMotion } from "../hooks/useIsReducedMotion"
import { LIFECYCLE_CHAPTERS } from "../lib/lifecycle-content"
import { Chapter } from "../components/lifecycle/Chapter"
import { ChapterChrome } from "../components/lifecycle/ChapterChrome"

/**
 * /lifecycle — the request lifecycle, A → Z, as click-driven chapters
 * (cornrevolution grammar: full-screen scenes, progress chrome, click to advance).
 * No snap, no pin — navigation is explicit (buttons/keys/dots).
 */
export default function LifecyclePage() {
  const navigate = useNavigate()
  const reducedMotion = useIsReducedMotion()
  const count = LIFECYCLE_CHAPTERS.length

  const initial = (() => {
    const id = new URLSearchParams(window.location.search).get("stage")
    const idx = LIFECYCLE_CHAPTERS.findIndex((c) => c.id === id)
    return idx >= 0 ? idx : 0
  })()
  const [index, setIndex] = useState(initial)

  const goTo = useCallback(
    (n: number) => {
      const clamped = Math.max(0, Math.min(count - 1, n))
      setIndex((prev) => {
        if (prev === clamped) return prev
        history.replaceState(null, "", `/lifecycle?stage=${LIFECYCLE_CHAPTERS[clamped].id}`)
        return clamped
      })
    },
    [count],
  )

  const next = useCallback(() => {
    if (index === count - 1) {
      navigate("/")
      return
    }
    goTo(index + 1)
  }, [index, count, goTo, navigate])

  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  // keyboard — arrows navigate; guarded for inputs/dialogs
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector("[role='dialog']")) return
      const t = e.target as HTMLElement | null
      if (t && (t.matches("input, textarea, select") || t.isContentEditable)) return
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault()
        next()
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault()
        prev()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [next, prev])

  const chapter = LIFECYCLE_CHAPTERS[index]

  return (
    <div className="relative min-h-dvh bg-bg-0 text-text" style={{ ["--acc" as string]: chapter.accent }}>
      {/* ambient accent wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 transition-all duration-700"
        style={{ background: `radial-gradient(900px 500px at 70% 40%, ${chapter.accent}0D, transparent)` }}
      />

      <Chapter
        key={chapter.id}
        chapter={chapter}
        index={index}
        total={count}
        reducedMotion={reducedMotion}
      />

      <ChapterChrome
        count={count}
        index={index}
        labels={LIFECYCLE_CHAPTERS.map((c) => c.title)}
        onSelect={goTo}
        onPrev={prev}
        onNext={next}
      />
    </div>
  )
}
