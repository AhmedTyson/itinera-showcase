import { useLayoutEffect, useRef } from "react"
import type { ReactNode } from "react"
import { BadgeCheck, Braces, Cpu, Database, Gauge, ListChecks, Route, Send, ShieldCheck } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { gsap } from "../../lib/gsap"
import type { LifecycleChapter } from "../../lib/lifecycle-content"
import { ChapterScene } from "./ChapterScene"

const ICONS: Record<LifecycleChapter["scene"], LucideIcon> = {
  request: Send,
  router: Route,
  guard: ShieldCheck,
  throttle: Gauge,
  validation: ListChecks,
  controller: Braces,
  service: Cpu,
  persistence: Database,
  ok: BadgeCheck,
}

type ChapterProps = {
  chapter: LifecycleChapter
  index: number
  total: number
  reducedMotion: boolean
  children?: ReactNode
}

/**
 * One full-screen chapter — Trace grammar: accent eyebrow with rule,
 * Space Grotesk display title, chips, and the scene living inside a panel
 * with the artifact as a floating key-tag. Entrance plays per mount
 * (page remounts by chapter id). RM renders final state instantly.
 */
export function Chapter({ chapter, index, total, reducedMotion, children }: ChapterProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const Icon = ICONS[chapter.scene]

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
      {/* copy column */}
      <div>
        <div data-ch="text" className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: chapter.accent }}>
          <span aria-hidden className="inline-block h-px w-6" style={{ background: chapter.accent }} />
          {chapter.kicker}
          <span className="ml-auto tabular-nums tracking-[0.18em] text-dim">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* accent icon wrap — prototype .icon-wrap */}
        <div
          data-ch="text"
          className="mt-7 flex h-14 w-14 items-center justify-center rounded-xl"
          style={{ background: `${chapter.accent}1F`, border: `1px solid ${chapter.accent}59` }}
        >
          <Icon className="h-6 w-6" style={{ color: chapter.accent }} aria-hidden />
        </div>

        <h1
          data-ch="text"
          className="font-display mt-6 text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.01em] text-text"
        >
          {chapter.title}
        </h1>
        <div data-ch="text" className="mt-5 max-w-[44ch] space-y-1.5 text-[15px] leading-[1.7] text-muted">
          {chapter.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
        <div data-ch="text" className="mt-6 flex flex-wrap gap-2">
          {chapter.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-dim"
            >
              {chip}
            </span>
          ))}
        </div>
        <div data-ch="text" className="mt-6">
          <span
            className="inline-block max-w-full truncate rounded-lg border px-3 py-2 font-mono text-[11.5px]"
            style={{ borderColor: `${chapter.accent}55`, color: chapter.accent, background: `${chapter.accent}12` }}
          >
            {chapter.artifact}
          </span>
        </div>
        {children}
      </div>

      {/* scene panel — prototype .panel + artifact key-tag */}
      <div
        data-ch="text"
        className="relative overflow-hidden rounded-[14px] border border-border bg-panel p-5 md:p-8"
      >
        <span
          aria-hidden
          className="absolute right-5 top-5 z-10 rounded-full px-2.5 py-1 font-mono text-[10px]"
          style={{ color: chapter.accent, border: `1px solid ${chapter.accent}66`, background: `${chapter.accent}14` }}
        >
          stage {String(index + 1).padStart(2, "0")}
        </span>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(600px 320px at 65% 45%, ${chapter.accent}0A, transparent)` }}
        />
        <ChapterScene chapter={chapter} />
      </div>
    </div>
  )
}
