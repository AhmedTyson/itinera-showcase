import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Server, Database, MonitorSmartphone, Plug, FlaskConical, Container } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { STACK_GROUPS } from "../../lib/home-content"

const ICONS: Record<string, LucideIcon> = {
  "Backend Core": Server,
  "Data Layer": Database,
  "Frontend": MonitorSmartphone,
  "Integrations": Plug,
  "Quality": FlaskConical,
  "Infrastructure": Container,
}

export function StackGrid() {
  const wrapRef = useRef<HTMLDivElement>(null)

  // stagger entrance — visible-by-default, GSAP owns the from-state
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ paused: true, delay: 0.15 })
        .fromTo(".stack-card", { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.07, ease: "power2.out" })
        .fromTo(".stack-icon", { scale: 0.8 }, { scale: 1, duration: 0.35, stagger: 0.07, ease: "back.out(2)" }, "-=0.4")
        .play()
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={wrapRef} aria-label="Technology stack — six groups">
      {/* bins header strip — same grammar as telemetry + schematic */}
      <div
        className="mb-3 flex items-center justify-between rounded-lg px-4 py-2"
        style={{ background: "var(--bp-stub-bg)", border: "1px solid var(--bp-border)" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--bp-text-dim)" }}>
          Component Bins
        </span>
        <span
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--bp-text-white)" }}
        >
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          {STACK_GROUPS.length} groups · Laravel 13
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STACK_GROUPS.map((group) => {
          const Icon = ICONS[group.group] ?? Server
          return (
            <div
              key={group.group}
              className="stack-card group relative overflow-hidden rounded-xl border border-border/70 bg-white/[0.02] p-5 transition-colors hover:border-primary/40"
            >
              {/* 45° trace corner motif — echoes the schematic interconnects */}
              <svg
                aria-hidden
                className="pointer-events-none absolute right-0 top-0 text-primary/25 transition-colors group-hover:text-primary/60"
                width="34"
                height="34"
                viewBox="0 0 34 34"
                fill="none"
              >
                <path d="M33 12 L12 33" stroke="currentColor" strokeWidth="1" />
                <path d="M33 22 L22 33" stroke="currentColor" strokeWidth="1" />
              </svg>

              <div className="mb-4 flex items-center gap-3">
                <span className="stack-icon flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition-colors group-hover:border-primary/60 group-hover:text-[#fbbf24]">
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">{group.group}</h3>
              </div>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <b className="block text-[13.5px] text-text">{item.name}</b>
                    <span className="text-[12.5px] text-muted">{item.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
