import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Link, useNavigate } from "react-router-dom"
import { Route, ArrowUpRight, Book, Gauge, ShieldCheck, KeyRound, Users, Mail, Filter, Globe2, Sparkles, LayoutGrid, CloudSun, MailCheck, Ticket, Fingerprint } from "lucide-react"
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
import { FeBackMotif } from "../components/sections/FeMotifs"
import { OpsConsole } from "../components/sections/OpsConsole"
import { PipelineTerminal } from "../components/sections/PipelineTerminal"
import { DemoTimeline } from "../components/sections/DemoTimeline"
import { KPI_ITEMS, TRUST_PILLS } from "../lib/kpi"
import { gsap, ScrollTrigger } from "../lib/gsap"
import { FRONTEND_CARDS, HARDENING, TEAM_MEMBERS, SITE_UPDATED } from "../lib/home-content"

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
  fingerprint: Fingerprint,
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

/* fine-pointer gate: touch devices get tap-to-preview, tap-again-to-trace */
const CAN_HOVER =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches

import { SecurityMotif } from "../components/sections/SecurityMotifs"

const DEFENSE_LAYERS = [
  { ...HARDENING[0], ring: 3, angle: -90 },  // Rate Limit
  { ...HARDENING[7], ring: 3, angle: 30 },   // CORS
  { ...HARDENING[1], ring: 3, angle: 150 },  // Exceptions

  { ...HARDENING[2], ring: 2, angle: -45 },  // HMAC
  { ...HARDENING[3], ring: 2, angle: 45 },   // JWT
  { ...HARDENING[5], ring: 2, angle: 135 },  // Email
  { ...HARDENING[4], ring: 2, angle: 225 },  // RBAC

  { ...HARDENING[6], ring: 1, angle: 180 },  // FormRequest
  { ...HARDENING[8], ring: 1, angle: 0 },    // AI Quota
]

export default function Home() {
  const navigate = useNavigate()
  const [focusIdx, setFocusIdx] = useState(0)
  const [dialogIdx, setDialogIdx] = useState<number | null>(null)
  const [activeDefense, setActiveDefense] = useState<number | null>(null)
  const [pinnedDefense, setPinnedDefense] = useState<number | null>(null)
  const displayDefense = pinnedDefense ?? activeDefense
  /* mobile/touch: popover is portaled to <body> as position:fixed so the scaled
     orbit (.orb-scale transform) can never bury it under following content */
  const orbitRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [popPos, setPopPos] = useState<{ left: number; top: number } | null>(null)
  const [popFloat, setPopFloat] = useState(false)

  useLayoutEffect(() => {
    if (dialogIdx === null) { setPopFloat(false); setPopPos(null); return }
    const float = window.matchMedia("(max-width: 1023px)").matches
    if (!float) return
    const host = orbitRef.current
    const anchor = nodeRefs.current[dialogIdx]
    if (!host || !anchor) return
    const hr = host.getBoundingClientRect()
    const W = Math.min(300, window.innerWidth - 24)
    const left = Math.min(window.innerWidth - W - 8, Math.max(8, hr.left + hr.width / 2 - W / 2))
    const top = Math.min(window.innerHeight - 170, hr.bottom + 14)
    setPopFloat(true)
    setPopPos({ left, top })
    const place = () => {
      const r = orbitRef.current?.getBoundingClientRect()
      if (!r) return
      /* orbit scrolled out of view → dismiss; otherwise follow it */
      if (r.bottom < 0 || r.top > window.innerHeight) { setDialogIdx(null); return }
      setPopPos({
        left: Math.min(window.innerWidth - W - 8, Math.max(8, r.left + r.width / 2 - W / 2)),
        top: Math.min(window.innerHeight - 170, r.bottom + 14),
      })
    }
    const close = () => setDialogIdx(null)
    const onResize = () => close()
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      const pop = document.querySelector(".stage-pop")
      if (pop?.contains(t) || anchor.contains(t)) return
      close()
    }
    window.addEventListener("scroll", place, { passive: true })
    window.addEventListener("resize", onResize)
    window.addEventListener("pointerdown", onDown, true)
    return () => {
      window.removeEventListener("scroll", place)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pointerdown", onDown, true)
    }
  }, [dialogIdx])

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
      gsap.set(".fe-flip, .hard-card, .demo-card, .dep-step", { autoAlpha: 0, y: 16 })
      ScrollTrigger.batch(".fe-flip, .hard-card, .demo-card, .dep-step", {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out",
            overwrite: "auto",
            clearProps: "transform", // free the flip transform; keep visibility
          }),
      })
      /* safety nets: scroll jumps / fast anchors / a sleeping rAF ticker must
         never leave cards stuck dimmed. 2.5s tries an animated catch-up;
         4s force-completes instantly (gsap.set needs no ticker). */
      window.setTimeout(() => {
        gsap.to(".fe-flip, .hard-card, .demo-card, .dep-step", {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          overwrite: "auto",
          clearProps: "transform",
        })
      }, 2500)
      window.setTimeout(() => {
        gsap.set(".fe-flip, .hard-card, .demo-card, .dep-step", { autoAlpha: 1, y: 0 })
      }, 4000)
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
            Ten stages between a tap and a committed row.{" "}
            {CAN_HOVER ? "Hover" : "Tap"} any point on the orbit to preview it —{" "}
            {CAN_HOVER ? "click" : "tap it again"} to trace the full journey.
          </p>

          {/* The Lifecycle Orbit */}
          <div
            ref={orbitRef}
            className="orb-scale relative z-20 mt-14 h-[360px] w-[360px] select-none"
            onMouseLeave={() => { if (CAN_HOVER) { setDialogIdx(null); setFocusIdx(0) } }}
          >
            {/* decorative dashed outer orbit */}
            <svg width="360" height="360" className="absolute inset-0" aria-hidden>
              <circle cx="180" cy="180" r="158" fill="none" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 9" className="opacity-50" />
            </svg>

            <svg width="360" height="360" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="180" cy="180" r="128" fill="none" stroke="var(--color-border)" strokeWidth="2" className="opacity-40" />
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
                  ref={el => { nodeRefs.current[idx] = el }}
                  onMouseEnter={() => { if (!CAN_HOVER) return; setFocusIdx(idx); setDialogIdx(idx) }}
                  onClick={() => {
                    setFocusIdx(idx)
                    /* touch: first tap previews, second tap commits */
                    if (!CAN_HOVER && dialogIdx !== idx) { setDialogIdx(idx); return }
                    navigate(`/lifecycle?stage=${s.id}`)
                  }}
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

            {/* Compact stage popover — anchored to the hovered node. On ≤1023px it
                portals to <body> as position:fixed so the scaled orbit's stacking
                context can never paint it behind the CTA below. */}
            {dialogIdx !== null && (() => {
              const s = LIFECYCLE_STAGES[dialogIdx]
              const accentHex = PREVIEW_ACCENTS[s.accent]
              const angle = (dialogIdx / LIFECYCLE_STAGES.length) * 2 * Math.PI - Math.PI / 2
              const nodeY = 180 + 128 * Math.sin(angle)
              const top = Math.min(296, Math.max(4, nodeY - 34))
              // left-half nodes (6–10) get the popover on the LEFT so it never covers them
              const onLeft = Math.cos(angle) < -0.05 || dialogIdx === 5
              const cls = `stage-pop${onLeft && !popFloat ? " stage-pop--left" : ""}${popFloat ? " stage-pop--float" : ""}`
              const style: import("react").CSSProperties = popFloat
                ? { left: popPos?.left ?? 0, top: popPos?.top ?? 0, ["--pop-accent" as string]: accentHex }
                : { ["--pop-top" as string]: `${top}px`, ["--pop-accent" as string]: accentHex }
              const body = (
                <div
                  key={s.id}
                  role="status"
                  className={cls}
                  style={style}
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
              return popFloat ? createPortal(body, document.body) : body
            })()}
          </div>

          {/* Trace CTA — label shows in the hover tooltip only */}
          <div className="mt-12 flex items-center">
            <CTACircleLink to="/lifecycle" icon={<Route className="h-5 w-5" aria-hidden />} label="Trace full interactive lifecycle A → Z" />
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
          <div className={`fe-grid mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${/[?&]motion=reduced\b/.test(window.location.search) ? "motion-reduced" : ""}`}>
            {FRONTEND_CARDS.map((card, i) => {
              const Icon = FE_ICONS[card.meta] ?? LayoutGrid
              const big = i === 0
              return (
                <article
                  key={card.title}
                  tabIndex={0}
                  data-fe-card={i}
                  aria-label={`${card.title} — ${card.body}`}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== "mouse") return
                    e.currentTarget.classList.add("is-flipped")
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType !== "mouse") return
                    e.currentTarget.classList.remove("is-flipped")
                  }}
                  className={`fe-flip group relative rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${big ? "md:col-span-2 md:row-span-2" : ""}`}
                >
                  {/* FRONT */}
                  <div className="fe-face fe-front flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-white/[0.02] p-5 transition-colors group-hover:border-primary/40">
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
                    <div className={`flex flex-wrap gap-1.5 ${big ? "mt-auto pt-4" : "mt-auto pt-3"}`}>
                      {card.chips.map((chip) => (
                        <span key={chip} className="rounded-full border border-border px-2 py-0.5 font-mono text-[10.5px] text-dim">
                          {chip}
                        </span>
                      ))}
                    </div>
                    <span aria-hidden className="fe-hint pointer-events-none absolute bottom-3 right-4 font-mono text-[9px] uppercase tracking-[0.2em] text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      flip ⟲
                    </span>
                  </div>

                  {/* BACK — themed live animation per card source */}
                  <div className="fe-face fe-back flex h-full flex-col items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-[#101828] via-[#0b1120] to-[#0a0e14] p-6 text-center">
                    <FeBackMotif index={i} />
                    <p className="relative z-10 mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">{card.title}</p>
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
          <div className="mt-16 flex flex-col items-center justify-center lg:flex-row lg:items-center lg:gap-16">
            
            {/* The Concentric Rings Map */}
            <div className="relative flex aspect-square w-full max-w-[440px] items-center justify-center shrink-0">
              
              {/* Ring 3 (Outer) */}
              <div className={`absolute inset-0 rounded-full border border-dashed transition-colors duration-500 ${displayDefense !== null && DEFENSE_LAYERS[displayDefense].ring === 3 ? 'border-emerald-500/60 bg-emerald-500/[0.02] shadow-[0_0_40px_rgba(16,185,129,0.05)]' : 'border-border/60'}`} />
              
              {/* Ring 2 (Middle) */}
              <div className={`absolute inset-[18%] rounded-full border border-dashed transition-colors duration-500 ${displayDefense !== null && DEFENSE_LAYERS[displayDefense].ring === 2 ? 'border-emerald-500/60 bg-emerald-500/[0.02] shadow-[0_0_40px_rgba(16,185,129,0.05)]' : 'border-border/60'}`} />
              
              {/* Ring 1 (Inner) */}
              <div className={`absolute inset-[36%] rounded-full border border-dashed transition-colors duration-500 ${displayDefense !== null && DEFENSE_LAYERS[displayDefense].ring === 1 ? 'border-emerald-500/60 bg-emerald-500/[0.02] shadow-[0_0_40px_rgba(16,185,129,0.05)]' : 'border-border/60'}`} />

              {/* Center Server Node */}
              <div className="absolute z-10 flex h-[16%] w-[16%] items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="h-1/2 w-1/2 text-emerald-400" aria-hidden />
              </div>

              {/* Feature Nodes */}
              {DEFENSE_LAYERS.map((node, i) => {
                const Icon = HARD_ICONS[node.icon]
                const isActive = displayDefense === i
                
                // Map rings to percentages: R3=50%, R2=32%, R1=14% from center
                const radiusPct = node.ring === 3 ? 50 : node.ring === 2 ? 32 : 14;
                const x = 50 + radiusPct * Math.cos(node.angle * Math.PI / 180);
                const y = 50 + radiusPct * Math.sin(node.angle * Math.PI / 180);
                
                return (
                  <button
                    key={node.title}
                    onMouseEnter={() => { if (pinnedDefense === null) setActiveDefense(i) }}
                    onMouseLeave={() => setActiveDefense(null)}
                    onFocus={() => { if (pinnedDefense === null) setActiveDefense(i) }}
                    onBlur={() => setActiveDefense(null)}
                    onClick={() => setPinnedDefense((prev) => (prev === i ? null : i))}
                    aria-pressed={isActive}
                    className={`absolute z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${isActive ? 'scale-125 border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'scale-100 border-border bg-panel text-muted hover:border-emerald-500/50 hover:text-emerald-400'}`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={`View details for ${node.title}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </button>
                )
              })}
            </div>

            {/* Interactive Diagram Panel */}
            <div className="mt-12 flex w-full max-w-[500px] flex-col overflow-hidden rounded-xl border border-border/70 bg-panel/50 lg:mt-0 lg:h-[480px]">
              {/* Diagram / Graphic Area */}
              <div className="relative flex h-48 w-full items-center justify-center border-b border-border/50 bg-black/20">
                <SecurityMotif index={displayDefense} />
              </div>
              
              {/* Description Area */}
              <div className="flex flex-1 flex-col p-6">
                {displayDefense === null ? (
                  <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-dim">System Secured</p>
                    <p className="mt-2 max-w-[24ch] text-[13px] text-muted">Hover, focus, or click any perimeter node to view the interactive diagram.</p>
                  </div>
                ) : (
                  <div className="flex h-full flex-col animate-in fade-in duration-200">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                          {(() => {
                            const Icon = HARD_ICONS[DEFENSE_LAYERS[displayDefense].icon]
                            return <Icon className="h-5 w-5" aria-hidden />
                          })()}
                        </span>
                        <div>
                          <h3 className="text-[15px] font-semibold text-text">{DEFENSE_LAYERS[displayDefense].title}</h3>
                          <span className="mt-0.5 block font-mono text-[10px] text-emerald-500/80">Ring {DEFENSE_LAYERS[displayDefense].ring} Defense</span>
                        </div>
                      </div>
                      <span className="shipped-pill rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9.5px] text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]">● shipped</span>
                    </div>
                    
                    <p className="text-[13.5px] leading-relaxed text-muted">{DEFENSE_LAYERS[displayDefense].detail}</p>
                    
                    <div className="mt-auto pt-6">
                      <code className="inline-block rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 font-mono text-[10.5px] text-emerald-400/90 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        {DEFENSE_LAYERS[displayDefense].tag}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05 · ops / command center — taller so diagram fits fully */}
      <section id="ops" className="scroll-mt-20 border-b border-border/50 py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead num="05" tag="interactive console" lead="Click a telemetry chip to feature it in the shell — then replay the audit session. Values derive from the codebase, never fabricated.">
            Platform telemetry, <em className="font-serif italic text-primary">alive on demand</em>.
          </SectionHead>
          <div className="mt-8">
            <OpsConsole />
          </div>
        </div>
      </section>

      {/* 06 · deploy & testing — Pipeline Terminal (A) */}
      <section id="deploy" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead num="06" tag="ship · verify · repeat">
            Containerized deploys, <em className="font-serif italic text-primary">green verification suites</em>.
          </SectionHead>
          <div className="mt-8">
            <PipelineTerminal />
          </div>
        </div>
      </section>

      {/* 07 · demo flow — Traveller Timeline (A) */}
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
          <div className="mt-8">
            <DemoTimeline />
          </div>
        </div>
      </section>

      {/* 08 · team + footer */}
      <section id="team" className="relative overflow-hidden py-14">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />
        <div className="relative mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead
            num="08"
            tag="conference case study · team 2"
            lead="One fullstack backend team — nine engineers, every layer shipped together: API, data, integrations, infra, docs."
          >
            Built by <em className="font-serif italic text-primary">Team 2</em>.
          </SectionHead>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.07] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(251,191,36,0.5)]" aria-hidden />
            <span className="font-mono text-[11px] tracking-wide text-primary">9 engineers</span>
            <span className="h-3 w-px bg-border/60" aria-hidden />
            <span className="font-mono text-[11px] tracking-wide text-dim">one roster</span>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM_MEMBERS.map((member) => {
              const initials = member.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
              return (
                <div
                  key={member.handle}
                  className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-b from-white/[0.05] to-white/[0.015] px-4 py-3.5 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/30 hover:from-white/[0.09] hover:to-white/[0.04] hover:shadow-[0_12px_32px_rgba(0,0,0,0.38)]"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  <div className="pointer-events-none absolute left-0 top-0 h-full w-0.5 bg-primary/0 transition-colors group-hover:bg-primary/30" aria-hidden />
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-gradient-to-br from-primary/15 to-primary/5 font-mono text-[11px] font-bold tracking-wide text-primary shadow-[0_0_18px_rgba(251,191,36,0.14)] transition-all group-hover:scale-105 group-hover:shadow-[0_0_22px_rgba(251,191,36,0.24)]"
                    >
                      {initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <b className="block truncate text-[14px] font-semibold tracking-tight text-text group-hover:text-white">{member.name}</b>
                      <span className="mt-0.5 block truncate font-mono text-[11px] tracking-wide text-dim group-hover:text-muted">@{member.handle}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on GitHub`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-black/20 text-dim backdrop-blur transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                      >
                        <GithubMark className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href={member.linkedin ?? `https://www.linkedin.com/in/${member.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-black/20 text-dim backdrop-blur transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                      >
                        <LinkedinMark className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
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
