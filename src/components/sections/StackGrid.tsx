import { useEffect, useRef } from "react"
import { gsap, ScrollTrigger } from "../../lib/gsap"
import { useSlideActive } from "../deck/slide-context"
import { Server, Database, MonitorSmartphone, Plug, FlaskConical, Container, KeyRound, ShieldCheck, Zap, Droplets, Sparkles, CreditCard, CloudSun, Grid3x3, Rocket, HeartPulse, Circle } from "lucide-react"
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

/** Brand icons (devicon CDN, colored) per stack item; lucide fallback for the rest. */
const BRANDS: Record<string, string> = {
  "Laravel 13": "laravel",
  "MySQL": "mysql",
  "SQLite": "sqlite",
  "Redis-ready": "redis",
  "Vanilla Multi-page": "javascript",
  "Postman Collection": "postman",
  "Docker": "docker",
}

function ItemIcon({ name }: { name: string }) {
  const brand = BRANDS[name]
  if (brand) {
    return (
      <img
        src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${brand}/${brand}-original.svg`}
        alt=""
        aria-hidden
        loading="lazy"
        className="h-4 w-4 shrink-0 opacity-90"
      />
    )
  }
  const Fallback = FALLBACKS[name] ?? Circle
  return <Fallback className="h-4 w-4 shrink-0 text-dim" aria-hidden />
}

const FALLBACKS: Record<string, LucideIcon> = {
  "JWT Auth": KeyRound,
  "Spatie RBAC": ShieldCheck,
  "GSAP 3.12": Zap,
  "Glassmorphism": Droplets,
  "Groq AI": Sparkles,
  "Paymob": CreditCard,
  "Open-Meteo · OSM": CloudSun,
  "PHPUnit · 55 files": FlaskConical,
  "Permission Matrix": Grid3x3,
  "Railway": Rocket,
  "Health Probe": HeartPulse,
}

export function StackGrid() {
  const wrapRef = useRef<HTMLDivElement>(null)

  // stagger entrance — deck: plays once on activation; fallback: old trigger (D27)
  const seam = useSlideActive()
  const isActive = seam === null ? null : seam.isActive
  const playedRef = useRef(false)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    if (isActive === false) return
    if (isActive === true && playedRef.current) return
    playedRef.current = true
    const ctx = gsap.context(() => {
      const tl = gsap
        .timeline({ paused: true })
        .fromTo(".stack-card", { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.07, ease: "power2.out" })
        .fromTo(".stack-icon", { scale: 0.8 }, { scale: 1, duration: 0.35, stagger: 0.07, ease: "back.out(2)" }, "-=0.4")
      if (isActive === null) {
        ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => tl.play() })
      } else {
        tl.play()
      }
    }, el)
    return () => ctx.revert()
  }, [isActive])

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
                  <li key={item.name} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/70 bg-white/[0.03]">
                      <ItemIcon name={item.name} />
                    </span>
                    <span>
                      <b className="block text-[13.5px] leading-tight text-text">{item.name}</b>
                      <span className="text-[12.5px] text-muted">{item.note}</span>
                    </span>
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
