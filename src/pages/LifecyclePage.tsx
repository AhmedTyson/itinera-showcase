import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useIsReducedMotion } from "../hooks/useIsReducedMotion"
import { LIFECYCLE_CHAPTERS } from "../lib/lifecycle-content"
import { Chapter } from "../components/lifecycle/Chapter"
import { ChapterChrome } from "../components/lifecycle/ChapterChrome"

/**
 * /lifecycle — the request lifecycle, A → Z, as click-driven chapters
 * (Trace grammar: right rail with per-chapter accents, trace log, grain,
 * thin progress edge). No snap, no pin — navigation is explicit.
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

  const chapter = LIFECYCLE_CHAPTERS[index]

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

  return (
    <div className="lifecycle-root relative min-h-dvh bg-bg-0 text-text" style={{ ["--acc" as string]: chapter.accent }}>
      {/* grain */}
      <div aria-hidden className="grain" />

      {/* ambient accent wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 transition-all duration-700"
        style={{ background: `radial-gradient(900px 520px at 68% 38%, ${chapter.accent}0D, transparent)` }}
      />

      {/* trace log — the page narrates itself (prototype's best idea); stacked under the back link */}
      <div className="pointer-events-none fixed left-6 top-[4.25rem] z-30 hidden items-center gap-2 font-mono text-[11px] tracking-[0.06em] text-dim md:flex">
        <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: chapter.accent }} />
        <span key={chapter.id}>{chapter.trace}</span>
      </div>

      <Chapter key={chapter.id} chapter={chapter} index={index} total={count} reducedMotion={reducedMotion} />

      {/* thin progress edge — full width, accent fill */}
      <div aria-hidden className="fixed inset-x-0 top-0 z-40 h-[2px] bg-border/40">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${((index + 1) / count) * 100}%`, background: chapter.accent }}
        />
      </div>

      <ChapterChrome
        count={count}
        index={index}
        labels={LIFECYCLE_CHAPTERS.map((c) => c.title)}
        accents={LIFECYCLE_CHAPTERS.map((c) => c.accent)}
        onSelect={goTo}
        onPrev={prev}
        onNext={next}
      />
    </div>
  )
}
