import { useLayoutEffect, useRef } from "react"
import type { ReactNode } from "react"
import { gsap } from "../../lib/gsap"
import type { LifecycleChapter } from "../../lib/lifecycle-content"
import { ChapterScene } from "./ChapterScene"

type ChapterProps = {
  chapter: LifecycleChapter
  index: number
  total: number
  reducedMotion: boolean
  children?: ReactNode
}

/**
 * One full-screen chapter. Entrance (draw-in + text stagger) plays on mount —
 * the page remounts the component per chapter (key=id), so each activation
 * replays. Visible-by-default: hidden from-states are applied inside the same
 * context that plays the timeline (RM renders final state instantly).
 */
export function Chapter({ chapter, index, total, reducedMotion, children }: ChapterProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el || reducedMotion) return
    const ctx = gsap.context(() => {
      const draws = el.querySelectorAll<SVGGeometryElement>(".lc-draw")
      draws.forEach((p) => {
        try {
          const len = p.getTotalLength()
          p.style.strokeDasharray = `${len}`
          p.style.strokeDashoffset = `${len}`
        } catch {
          /* non-geometry — leave visible */
        }
      })
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } })
      tl.fromTo(
        '[data-ch="text"]',
        { y: 16, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.09 },
        0,
      )
        .to(draws, { strokeDashoffset: 0, duration: 0.9, stagger: 0.035, ease: "power2.inOut" }, 0.1)
        .fromTo(".lc-fade", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, stagger: 0.03 }, 0.5)
      tl.play()
    }, el)
    return () => ctx.revert()
  }, [reducedMotion, chapter.id])

  return (
    <div
      ref={rootRef}
      className="grid min-h-dvh w-full items-center gap-10 px-6 pb-28 pt-24 lg:grid-cols-[0.9fr_1.1fr] lg:px-14"
      style={{ ["--acc" as string]: chapter.accent }}
    >
      <div>
        <p data-ch="text" className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: chapter.accent }}>
          <span aria-hidden className="inline-block h-px w-6" style={{ background: chapter.accent }} />
          {chapter.kicker}
          <span className="ml-auto tabular-nums tracking-[0.18em] text-dim">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </p>
        <h1 data-ch="text" className="mt-4 text-[clamp(2.2rem,4.6vw,3.6rem)] font-bold leading-[1.05] tracking-tight text-text">
          {chapter.title}
        </h1>
        <div data-ch="text" className="mt-5 space-y-1.5 text-[15px] leading-relaxed text-muted">
          {chapter.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
        <div data-ch="text" className="mt-7">
          <span
            className="inline-block max-w-full truncate rounded-lg border px-3 py-2 font-mono text-[11.5px]"
            style={{ borderColor: `${chapter.accent}55`, color: chapter.accent, background: `${chapter.accent}12` }}
          >
            {chapter.artifact}
          </span>
        </div>
        {children}
      </div>
      <div data-ch="scene" className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
          style={{ background: `radial-gradient(closest-side, ${chapter.accent}14, transparent)` }}
        />
        <ChapterScene chapter={chapter} />
      </div>
    </div>
  )
}
