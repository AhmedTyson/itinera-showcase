import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Route, ArrowUpRight, Book, FileText, Gauge, ShieldCheck, KeyRound, Users, Mail, Filter, Globe2, Sparkles, LayoutGrid, CloudSun, MailCheck, Ticket, Fingerprint } from "lucide-react"
import { LIFECYCLE_STAGES } from "./LifecyclePage"
import { CTACircleLink } from "../components/ui/cta-circle"

/** Brand marks (lucide dropped brand icons) — inline paths. */
function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  )
}

function LinkedinMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z" />
    </svg>
  )
}
import { Topbar } from "../components/layout/Topbar"
import { Hero } from "../components/sections/Hero"
import { KpiBand } from "../components/sections/KpiBand"
import { StackGrid } from "../components/sections/StackGrid"
import { OpsConsole } from "../components/sections/OpsConsole"
import { KPI_ITEMS, TRUST_PILLS } from "../lib/kpi"
import { gsap, ScrollTrigger } from "../lib/gsap"
import {
  FRONTEND_CARDS,
  HARDENING,
  DEPLOY_STEPS,
  TEST_ROWS,
  DEMO_STEPS,
  TEAM_MEMBERS,
  SITE_UPDATED,
} from "../lib/home-content"

/** Shared section chrome — kicker row + headline + lead. */
function SectionHead({ num, tag, children, lead }: { num: string; tag?: string; children: React.ReactNode; lead?: React.ReactNode }) {
  return (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] tracking-[0.14em] text-dim uppercase">
        <span className="font-mono text-primary">{num}</span>
        <span aria-hidden className="h-px w-8 bg-border" />
        {tag && <span className="rounded-full border border-border px-2 py-0.5 text-[10px] normal-case">{tag}</span>}
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-text md:text-3xl">{children}</h2>
      {lead && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dim">{lead}</p>}
    </>
  )
}

const HARD_ICONS = {
  gauge: Gauge,
  shield: ShieldCheck,
  lock: KeyRound,
  key: KeyRound,
  users: Users,
  mail: Mail,
  filter: Filter,
  globe: Globe2,
  sparkles: Sparkles,
}

const FE_ICONS: Record<string, typeof LayoutGrid> = {
  SURFACES: LayoutGrid,
  MOTION: Sparkles,
  "LIVE DATA": CloudSun,
  "IDENTITY UX": MailCheck,
  "COMMERCE UX": Ticket,
  BRAND: Fingerprint,
}

const CODE_SAMPLE = `# authenticate — throttled 60/min
curl -X POST http://127.0.0.1:8000/api/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@threedos.com","password":"password"}'

# 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "role": "super_admin" },
    "access_token": "eyJ0eXAiOiJKV1Qi...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}`

export default function Home() {
  const navigate = useNavigate()
  const [focusIdx, setFocusIdx] = useState(0)
  const [dialogIdx, setDialogIdx] = useState<number | null>(null)

  const PREVIEW_ACCENTS = {
    amber: "#F5A623",
    teal: "#2DD4BF",
    violet: "#A78BFA",
    rose: "#fb7185",
  }

  // below-the-fold cards reveal on scroll — GSAP owns from-states
  useEffect(() => {
    // arriving from the lifecycle outro → land on §01, not the hero
    if (window.location.hash === "#architecture") {
      requestAnimationFrame(() =>
        document.getElementById("architecture")?.scrollIntoView({ behavior: "smooth" }),
      )
    }
    const ctx = gsap.context(() => {
      gsap.set(".fe-card, .hard-card, .demo-card, .dep-step", { autoAlpha: 0, y: 16 })
      ScrollTrigger.batch(".fe-card, .hard-card, .demo-card, .dep-step", {
        start: "top 88%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }),
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen bg-bg-0">
      <Topbar variant="home" />
      <Hero
        badge="Conference Case Study 1 · Fullstack Monorepo"
        titleEm="Itinera"
        lead="Luxury travel, orchestrated by Laravel 13."
        ctas={[
          { label: "Explore Architecture", href: "#architecture", variant: "gold", icon: "network" },
          { label: "Open API Reference", href: "https://itinera.apidog.io", variant: "ghost", icon: "terminal" },
        ]}
        codeSample={CODE_SAMPLE}
        trustPills={TRUST_PILLS}
      />
      <div className="mx-auto max-w-[1280px] px-4 py-8 lg:px-6">
        <KpiBand items={KPI_ITEMS} />
      </div>

      {/* 01 · architecture — portal into /lifecycle */}
      <section id="architecture" className="scroll-mt-20 border-b border-border/50 py-20">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center px-4 text-center lg:px-6">
          <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-dim">
            <span className="font-mono text-primary">01</span>
            <span aria-hidden className="h-px w-8 bg-border" />
            <span>request lifecycle</span>
          </div>
          <h2 className="mt-2 max-w-xl text-2xl font-bold tracking-tight text-text md:text-3xl">
            Every request tells <em className="font-serif italic font-medium text-primary">a story</em>.
          </h2>
          <p className="mt-3 max-w-md text-sm text-dim">
            Ten stages between a tap and a committed row. Hover any point on the orbit to preview it — click to trace the full journey.
          </p>

          {/* The Lifecycle Orbit */}
          <div
            className="relative mt-14 h-[360px] w-[360px] select-none"
            onMouseLeave={() => { setDialogIdx(null); setFocusIdx(0) }}
          >
            {/* decorative dashed outer orbit */}
            <svg width="360" height="360" className="absolute inset-0" aria-hidden>
              <circle cx="180" cy="180" r="158" fill="none" stroke="#1e2a4a" strokeWidth="1" strokeDasharray="3 9" className="opacity-50" />
            </svg>

            <svg width="360" height="360" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="180" cy="180" r="128" fill="none" stroke="#1e2a4a" strokeWidth="2" className="opacity-40" />
              <circle
                cx="180"
                cy="180"
                r="128"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="3.5"
                strokeDasharray="804.2"
                strokeDashoffset={804.2 - 804.2 * (focusIdx / (LIFECYCLE_STAGES.length - 1))}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Center status */}
            <button
              onClick={() => navigate(`/lifecycle?stage=${LIFECYCLE_STAGES[focusIdx].id}`)}
              aria-label={`Open stage ${focusIdx + 1}: ${LIFECYCLE_STAGES[focusIdx].title} in the full trace`}
              className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center justify-center rounded-full border border-border/70 bg-panel shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105"
            >
              <span className="font-mono text-3xl font-extrabold leading-none tracking-tight text-text">
                {String(focusIdx + 1).padStart(2, "0")}
              </span>
              <span className="mt-1.5 font-mono text-[8.5px] uppercase tracking-widest text-dim">stage</span>
              <span
                className="mt-1 rounded border px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider"
                style={{
                  color: PREVIEW_ACCENTS[LIFECYCLE_STAGES[focusIdx].accent],
                  borderColor: `${PREVIEW_ACCENTS[LIFECYCLE_STAGES[focusIdx].accent]}33`,
                  background: `${PREVIEW_ACCENTS[LIFECYCLE_STAGES[focusIdx].accent]}0D`,
                }}
              >
                {LIFECYCLE_STAGES[focusIdx].id}
              </span>
            </button>

            {/* Orbit nodes */}
            {LIFECYCLE_STAGES.map((s, idx) => {
              const angle = (idx / LIFECYCLE_STAGES.length) * 2 * Math.PI - Math.PI / 2
              const x = 180 + 128 * Math.cos(angle)
              const y = 180 + 128 * Math.sin(angle)
              const isLit = idx <= focusIdx
              const accentHex = PREVIEW_ACCENTS[s.accent]

              return (
                <button
                  key={s.id}
                  onMouseEnter={() => { setFocusIdx(idx); setDialogIdx(idx) }}
                  onClick={() => { setFocusIdx(idx); navigate(`/lifecycle?stage=${s.id}`) }}
                  onFocus={() => { setFocusIdx(idx); setDialogIdx(idx) }}
                  className="group absolute z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border bg-bg-0 transition-all duration-300 hover:scale-125 focus:outline-none"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: "translate(-50%, -50%)",
                    borderColor: isLit ? "var(--color-primary)" : "#1e2a4a",
                    boxShadow: isLit ? `0 0 12px ${accentHex}44` : "none",
                  }}
                  aria-label={`Preview stage ${idx + 1}: ${s.title}`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: isLit ? accentHex : undefined,
                      opacity: isLit ? 1 : undefined,
                      transform: isLit ? undefined : "scale(0.5)",
                    }}
                  />
                  <span className="absolute -bottom-5 whitespace-nowrap font-mono text-[9px] tracking-wider text-dim/70 transition-colors group-hover:text-text">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </button>
              )
            })}

            {/* Compact stage popover — anchored to the hovered node, lives inside the orbit */}
            {dialogIdx !== null && (() => {
              const s = LIFECYCLE_STAGES[dialogIdx]
              const accentHex = PREVIEW_ACCENTS[s.accent]
              const angle = (dialogIdx / LIFECYCLE_STAGES.length) * 2 * Math.PI - Math.PI / 2
              const nodeY = 180 + 128 * Math.sin(angle)
              const top = Math.min(296, Math.max(4, nodeY - 34))
              // left-half nodes (6–10) get the popover on the LEFT so it never covers them
              const onLeft = Math.cos(angle) < -0.05 || dialogIdx === 5
              return (
                <div
                  key={s.id}
                  role="status"
                  className={`stage-pop${onLeft ? " stage-pop--left" : ""}`}
                  style={{ ["--pop-top" as string]: `${top}px`, ["--pop-accent" as string]: accentHex }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full border px-2 py-0.5 font-mono text-[9.5px] tracking-wide"
                      style={{ color: accentHex, borderColor: `${accentHex}55`, background: `${accentHex}0F` }}
                    >
                      {String(dialogIdx + 1).padStart(2, "0")} · {s.tag.split("·").slice(1).join("·").trim() || s.tag}
                    </span>
                    <span className="ml-auto font-mono text-[9px] uppercase tracking-widest text-dim/70">{s.id}</span>
                  </div>

                  <h4 className="mt-2.5 text-[15px] font-bold leading-tight tracking-tight text-text">{s.title}</h4>
                  <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-muted">{s.desc.join(" ")}</p>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-2.5">
                    <code className="truncate font-mono text-[10.5px]" style={{ color: accentHex }}>{s.artifact}</code>
                    <Link
                      to={`/lifecycle?stage=${s.id}`}
                      aria-label={`Open ${s.title} in the full trace`}
                      className="group inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold"
                      style={{ color: accentHex }}
                    >
                      trace
                      <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Trace CTA */}
          <div className="mt-12 flex items-center gap-4">
            <CTACircleLink to="/lifecycle" icon={<Route className="h-5 w-5" aria-hidden />} label="Trace full interactive lifecycle A → Z" />
            <div className="flex flex-col items-start">
              <span className="text-[13.5px] font-bold text-text">Trace full interactive lifecycle A → Z</span>
              <span className="font-mono text-xs text-dim">10 scroll-pinned stages · real artifacts at every step</span>
            </div>
          </div>
        </div>
      </section>

      {/* 02 · stack */}
      <section id="stack" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead num="02" tag="six groups">
            Boring where it should be, <em className="font-serif italic text-primary">sharp where it counts</em>.
          </SectionHead>
          <div className="mt-8">
            <StackGrid />
          </div>
        </div>
      </section>

      {/* 03 · frontend */}
      <section id="frontend" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead
            num="03"
            tag="355 files · no framework"
            lead={
              <>
                Deliberate constraint: zero SPA framework, zero bundler. Shared{" "}
                <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-primary">tokens.css</code> design system, module-per-concern JS, progressive enhancement.
              </>
            }
          >
            A boarding-pass aesthetic, engineered <em className="font-serif italic text-primary">without a build step</em>.
          </SectionHead>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FRONTEND_CARDS.map((card, i) => {
              const Icon = FE_ICONS[card.meta] ?? LayoutGrid
              const big = i === 0
              return (
                <article
                  key={card.title}
                  className={`fe-card group relative overflow-hidden rounded-xl border border-border/70 bg-white/[0.02] p-5 transition-colors hover:border-primary/40 ${
                    big ? "md:col-span-2 md:row-span-2 flex flex-col justify-between" : ""
                  }`}
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition-colors group-hover:text-[#fbbf24]">
                        <Icon className="h-[18px] w-[18px]" aria-hidden />
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">{card.meta}</span>
                    </div>
                    <h3 className={`mb-1.5 font-semibold text-text ${big ? "text-xl" : "text-[15px]"}`}>{card.title}</h3>
                    <p className="text-[13px] leading-relaxed text-muted">{card.body}</p>
                  </div>
                  {big && (
                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {["public /", "app /*", "agency /", "admin /"].map((zone) => (
                        <span key={zone} className="rounded-md border border-border/70 bg-black/20 px-2 py-1.5 text-center font-mono text-[10.5px] text-dim">
                          {zone}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={`flex flex-wrap gap-1.5 ${big ? "mt-4" : "mt-3"}`}>
                    {card.chips.map((chip) => (
                      <span key={chip} className="rounded-full border border-border px-2 py-0.5 font-mono text-[10.5px] text-dim">
                        {chip}
                      </span>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* 04 · hardening */}
      <section id="security" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead
            num="04"
            tag="hardening delivered"
            lead="Not a status ledger — a showcase of what shipped. Every mechanism below is live in the codebase and covered by the verification suites."
          >
            Security as <em className="font-serif italic text-primary">accomplished fact</em>.
          </SectionHead>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HARDENING.map((h) => {
              const Icon = HARD_ICONS[h.icon]
              return (
                <article key={h.title} className="hard-card group relative overflow-hidden rounded-xl border border-border/70 bg-white/[0.02] p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-500/40">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9.5px] text-emerald-400">● shipped</span>
                  </div>
                  <h3 className="text-[14.5px] font-semibold text-text">{h.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{h.detail}</p>
                  <code className="mt-3 inline-block rounded-md border border-border bg-black/30 px-2 py-1 font-mono text-[10.5px] text-dim">{h.tag}</code>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* 05 · ops / command center */}
      <section id="ops" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead num="05" tag="interactive console" lead="Click a telemetry chip to feature it in the shell — then replay the audit session. Values derive from the codebase, never fabricated.">
            Platform telemetry, <em className="font-serif italic text-primary">alive on demand</em>.
          </SectionHead>
          <div className="mt-8">
            <OpsConsole />
          </div>
        </div>
      </section>

      {/* 06 · deploy & testing */}
      <section id="deploy" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead num="06" tag="ship · verify · repeat">
            Containerized deploys, <em className="font-serif italic text-primary">green verification suites</em>.
          </SectionHead>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <ol className="relative space-y-0">
              {DEPLOY_STEPS.map((step, i) => (
                <li key={step.title} className="dep-step relative flex gap-4 pb-7 last:pb-0">
                  {i < DEPLOY_STEPS.length - 1 && <span aria-hidden className="absolute left-[17px] top-10 h-full w-px bg-border/60" />}
                  <span
                    aria-hidden
                    className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-[12px] font-bold ${
                      i === DEPLOY_STEPS.length - 1
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-primary/40 bg-primary/10 text-primary"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-1">
                    <h3 className="text-[14px] font-semibold text-text">{step.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="grid content-start gap-2.5">
              {TEST_ROWS.map((row) => (
                <div key={row.suite} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-white/[0.02] px-4 py-3">
                  <div>
                    <b className="block text-[13.5px] text-text">{row.suite}</b>
                    <span className="text-[12px] text-muted">{row.covers}</span>
                  </div>
                  <span className="shrink-0 whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">{row.status}</span>
                </div>
              ))}
              <div className="mt-2 flex flex-wrap gap-2">
                {["php artisan test", "--filter=ReportTest", "--filter=Verification"].map((chip) => (
                  <code key={chip} className="rounded-md border border-border bg-black/30 px-2 py-1 font-mono text-[11px] text-dim">
                    {chip}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 07 · demo flow */}
      <section id="demo" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead
            num="07"
            tag="product showcase"
            lead={
              <>
                Seed once (<code className="rounded bg-white/5 px-1 py-0.5 font-mono text-primary">migrate:fresh --seed</code>), serve backend :8000 + frontend :8080, then walk the flow — every step maps to real screens in the repo.
              </>
            }
          >
            Run the platform like <em className="font-serif italic text-primary">a traveller would</em>.
          </SectionHead>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DEMO_STEPS.map((step, i) => (
              <li
                key={step.n}
                className="demo-card group relative overflow-hidden rounded-xl border border-border/70 bg-white/[0.02] p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/[0.04]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-3 -right-1 font-serif text-[56px] font-bold italic leading-none text-primary/10 transition-colors group-hover:text-primary/25"
                >
                  {i + 1}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{String(i + 1).padStart(2, "0")}</span>
                <b className="mt-1 block text-[14px] text-text">{step.title}</b>
                <span className="mt-0.5 block break-words font-mono text-[11.5px] text-dim">{step.detail}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 08 · team + footer */}
      <section id="team" className="py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead
            num="08"
            tag="conference case study · team 2"
            lead="One fullstack backend team — nine engineers, every layer shipped together: API, data, integrations, infra, docs."
          >
            Built by <em className="font-serif italic text-primary">Team 2</em>.
          </SectionHead>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.handle} className="group flex items-center gap-3 rounded-xl border border-border/70 bg-white/[0.02] p-4 transition-colors hover:border-primary/40">
                <span aria-hidden className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-mono text-[13px] font-bold text-primary">
                  {member.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-[14px] text-text">{member.name}</b>
                  <span className="block truncate font-mono text-[11.5px] text-dim">@{member.handle} · {member.commits} commits</span>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on GitHub`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-dim transition-colors hover:border-primary/50 hover:text-text"
                  >
                    <GithubMark className="h-4 w-4" />
                  </a>
                  <a
                    href={member.linkedin ?? `https://www.linkedin.com/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on LinkedIn`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-dim transition-colors hover:border-primary/50 hover:text-text"
                  >
                    <LinkedinMark className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-10">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-xs">
              <b className="text-[15px] text-text">Itinera<span className="text-primary">.</span></b>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">Luxury travel, orchestrated by Laravel 13. Team 2 conference deliverable @ Threedos.</p>
            </div>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2 text-[12.5px]">
              <a href="https://itinera.apidog.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-dim transition-colors hover:text-text">
                <Book className="h-3.5 w-3.5" aria-hidden /> API Docs
              </a>
              <a href="https://github.com/AhmedTyson/Team2-Conference-Project" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-dim transition-colors hover:text-text">
                <GithubMark className="h-3.5 w-3.5" /> Repository
              </a>
              <Link to="/wiki" className="inline-flex items-center gap-1.5 text-dim transition-colors hover:text-text">
                <FileText className="h-3.5 w-3.5" aria-hidden /> Repo Wiki
              </Link>
              <a href="#architecture" className="inline-flex items-center gap-1.5 text-dim transition-colors hover:text-text">
                Architecture
              </a>
            </nav>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-5 text-[12px] text-dim">
            <span>© 2026 Itinera — Team 2 · MIT · Built with <span className="text-text">Laravel 13</span> · <span className="text-text">React 19</span> · <span className="text-text">Apidog</span></span>
            <span className="tabular-nums">site updated {SITE_UPDATED}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
