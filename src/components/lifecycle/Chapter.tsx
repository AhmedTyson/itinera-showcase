import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { Activity, BadgeCheck, Braces, Cpu, Database, Gauge, ListChecks, Route, Send, ShieldCheck } from "lucide-react"
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
  demo: Activity,
}

const BAR_HEIGHTS = [40, 75, 55, 90, 35, 65, 100, 50]

type ChapterProps = {
  chapter: LifecycleChapter
  index: number
  total: number
  reducedMotion: boolean
  children?: ReactNode
}

/**
 * One scroll-driven chapter (prototype grammar):
 * - reveals play on enter and REVERSE when scrolled back past (toggleActions)
 * - the demo chapter pins + scrubs — scroll speed drives the bars (desktop only,
 *   gsap.matchMedia; mobile/RM get a simple reveal)
 * - visible-by-default: from-states live inside gsap.context only
 */
export function Chapter({ chapter, index, total, reducedMotion }: ChapterProps) {
  const rootRef = useRef<HTMLElement>(null)
  const Icon = ICONS[chapter.scene]
  const isDemo = chapter.scene === "demo"

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      // ── reduced motion / first paint: everything stays visible ──
      if (reducedMotion) return

      const draws = el.querySelectorAll<SVGGeometryElement>(".lc-draw")
      draws.forEach((p) => {
        try {
          const len = p.getTotalLength()
          p.style.strokeDasharray = `${len}`
          p.style.strokeDashoffset = `${len}`
        } catch {
          /* non-geometry */
        }
      })

      const text = el.querySelectorAll<HTMLElement>('[data-ch="text"]')
      const fades = el.querySelectorAll<HTMLElement>(".lc-fade")

      if (isDemo) {
        // text + code reveal on enter (reversing)
        gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 65%", toggleActions: "play none none reverse" },
        })
          .fromTo(text, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.09 })
          .fromTo(".code-line > div", { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.06 }, "-=0.3")

        // pinned + scrubbed bars — desktop only (the chip: matchMedia() for mobile)
        const mm = gsap.matchMedia()
        mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
          gsap.to(".gsap-bar", {
            height: (i) => `${BAR_HEIGHTS[i]}%`,
            ease: "power1.inOut",
            stagger: { each: 0.08 },
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "+=125%",
              scrub: 0.6,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              snap: { snapTo: 1, duration: 0.4, ease: "power1.inOut" },
              onUpdate: (self) => {
                const fill = el.querySelector<HTMLElement>(".scrub-fill")
                if (fill) fill.style.width = `${self.progress * 100}%`
              },
            },
          })
        })
        mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
          gsap.fromTo(
            ".gsap-bar",
            { height: "10%" },
            {
              height: (i) => `${BAR_HEIGHTS[i]}%`,
              duration: 0.8,
              stagger: 0.06,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 65%", toggleActions: "play none none reverse" },
            },
          )
        })
      } else {
        // standard chapters — one reversing timeline: text → draw → labels
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: el, start: "top 65%", toggleActions: "play none none reverse" },
        })
        tl.fromTo(text, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.09 }, 0)
          .to(draws, { strokeDashoffset: 0, duration: 0.9, stagger: 0.035, ease: "power2.inOut" }, 0.1)
          .fromTo(fades, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, stagger: 0.03 }, 0.5)
      }
    }, el)
    return () => ctx.revert()
  }, [reducedMotion, isDemo, chapter.id])

  return (
    <section
      ref={rootRef}
      id={chapter.id}
      aria-label={`${chapter.kicker} — ${chapter.title}`}
      className="grid min-h-dvh w-full items-center gap-10 px-6 pb-24 pt-24 lg:grid-cols-[0.9fr_1.1fr] lg:px-14"
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

        <div
          data-ch="text"
          className="mt-7 flex h-14 w-14 items-center justify-center rounded-xl"
          style={{ background: `${chapter.accent}1F`, border: `1px solid ${chapter.accent}59` }}
        >
          <Icon className="h-6 w-6" style={{ color: chapter.accent }} aria-hidden />
        </div>

        <h2
          data-ch="text"
          className="font-display mt-6 text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.01em] text-text"
        >
          {chapter.title}
        </h2>
        <div data-ch="text" className="mt-5 max-w-[44ch] space-y-1.5 text-[15px] leading-[1.7] text-muted">
          {chapter.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
        <div data-ch="text" className="mt-6 flex flex-wrap gap-2">
          {chapter.chips.map((chip) => (
            <span key={chip} className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-dim">
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
      </div>

      {/* scene panel — prototype .panel; demo chapter swaps in the scrub rig */}
      <div
        data-ch="text"
        className="relative overflow-hidden rounded-[14px] border border-border bg-panel p-5 md:p-8"
      >
        <span
          aria-hidden
          className="absolute right-5 top-5 z-10 rounded-full px-2.5 py-1 font-mono text-[10px]"
          style={{ color: chapter.accent, border: `1px solid ${chapter.accent}66`, background: `${chapter.accent}14` }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(600px 320px at 65% 45%, ${chapter.accent}0A, transparent)` }}
        />
        {isDemo ? (
          <div>
            <div className="code-line font-mono text-[12.5px] leading-[1.9] text-dim">
              <div><span className="text-[#a78bfa]">gsap</span>.timeline({"{"} scrollTrigger: {"{"}</div>
              <div>&nbsp;&nbsp;trigger: <span className="text-[#2dd4bf]">"#panel"</span>,</div>
              <div>&nbsp;&nbsp;scrub: <span className="text-[#fbbf24]">true</span>,</div>
              <div>&nbsp;&nbsp;start: <span className="text-[#2dd4bf]">"top center"</span></div>
              <div>{"})"}</div>
            </div>
            <div className="mt-6 flex h-[220px] items-end gap-2.5 px-1">
              {BAR_HEIGHTS.map((_, i) => (
                <div key={i} className="gsap-bar h-[10%] flex-1 rounded-t-md bg-gradient-to-b from-[#a78bfa] to-[#a78bfa66]" />
              ))}
            </div>
            <div className="mt-5 h-[3px] overflow-hidden rounded bg-border">
              <div className="scrub-fill h-full w-0 rounded bg-[#a78bfa]" />
            </div>
          </div>
        ) : (
          <ChapterScene chapter={chapter} />
        )}
      </div>
    </section>
  )
}
