import { useState } from "react"
import { Gauge, ShieldCheck, KeyRound, Users, Mail, Filter, Globe2, Sparkles, LayoutGrid, CloudSun, MailCheck, Ticket, Fingerprint } from "lucide-react"
import { Topbar } from "../components/layout/Topbar"
import { Hero } from "../components/sections/Hero"
import { KpiBand } from "../components/sections/KpiBand"
import { ArchCanvas } from "../components/canvas/ArchCanvas"
import { StackGrid } from "../components/sections/StackGrid"
import { OpsConsole } from "../components/sections/OpsConsole"
import { Closing } from "../components/sections/Closing"
import { Deck } from "../components/deck/Deck"
import { Slide } from "../components/deck/Slide"
import { SlideHead } from "../components/deck/SlideHead"
import { InspectorDialog } from "../components/canvas/InspectorDialog"
import { KPI_ITEMS, TRUST_PILLS } from "../lib/kpi"
import {
  FRONTEND_CARDS,
  HARDENING,
  DEPLOY_STEPS,
  TEST_ROWS,
  DEMO_STEPS,
  TEAM_MEMBERS,
} from "../lib/home-content"

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

const CONTAINER = "mx-auto w-full max-w-[1280px] px-4 lg:px-6"

export default function Home() {
  const [archKey, setArchKey] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleArchInspect = (key: string) => {
    setArchKey(key)
    setOpen(true)
  }

  const hardeningOne = HARDENING.slice(0, 5)
  const hardeningTwo = HARDENING.slice(5)

  return (
    <>
      <Deck
      topbar={<Topbar variant="home" />}
      slides={[
        /* 01 · hero — untouched content, no reveal grammar (D29) */
        <Slide key="hero" id="hero" label="Overview" index={0}>
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
        </Slide>,

        /* 02 · telemetry */
        <Slide key="telemetry" id="telemetry" label="Operations telemetry" index={1} labelledBy="slide-2-heading">
          <div className={CONTAINER}>
            <SlideHead index={2} total={12} tag="operations telemetry" title={<>Numbers that <em className="font-serif italic font-medium text-primary">reconcile</em>.</>} />
            <div data-reveal="content" className="mt-8">
              <KpiBand variant="slide" items={KPI_ITEMS} />
            </div>
          </div>
        </Slide>,

        /* 03 · architecture */
        <Slide key="architecture" id="architecture" label="Architecture" index={2} labelledBy="slide-3-heading">
          <div className={CONTAINER}>
            <SlideHead
              index={3}
              total={12}
              tag="request lifecycle"
              title={<>Layered Laravel core, <em className="font-serif italic font-medium text-primary">thin controllers</em>, contract-bound repositories.</>}
              lead="Client → Router → Auth guard → Controller → Service → Repository → Model. Click any node to inspect."
            />
            <div data-reveal="content" className="mt-8 h-[62vh] min-h-[420px]">
              <ArchCanvas onInspect={handleArchInspect} />
            </div>
          </div>
        </Slide>,

        /* 04 · stack */
        <Slide key="stack" id="stack" label="Stack" index={3} labelledBy="slide-4-heading">
          <div className={CONTAINER}>
            <SlideHead
              index={4}
              total={12}
              tag="six groups"
              title={<>Boring where it should be, <em className="font-serif italic text-primary">sharp where it counts</em>.</>}
            />
            <div data-reveal="content" className="mt-8">
              <StackGrid />
            </div>
          </div>
        </Slide>,

        /* 05 · frontend */
        <Slide key="frontend" id="frontend" label="Frontend" index={4} labelledBy="slide-5-heading">
          <div className={CONTAINER}>
            <SlideHead
              index={5}
              total={12}
              tag="355 files · no framework"
              title={<>A boarding-pass aesthetic, engineered <em className="font-serif italic text-primary">without a build step</em>.</>}
              lead={<>Deliberate constraint: zero SPA framework, zero bundler. Shared <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-primary">tokens.css</code> design system, module-per-concern JS, progressive enhancement.</>}
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {FRONTEND_CARDS.map((card, i) => {
                const Icon = FE_ICONS[card.meta] ?? LayoutGrid
                const big = i === 0
                return (
                  <article
                    key={card.title}
                    data-reveal="content"
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
        </Slide>,

        /* 06 · hardening I */
        <Slide key="security" id="security" label="Hardening I" index={5} labelledBy="slide-6-heading">
          <div className={CONTAINER}>
            <SlideHead
              index={6}
              total={12}
              tag="hardening delivered · 1 of 2"
              title={<>Security as <em className="font-serif italic text-primary">accomplished fact</em>.</>}
              lead="Not a status ledger — a showcase of what shipped. Every mechanism is live in the codebase and covered by the verification suites."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {hardeningOne.map((h) => {
                const Icon = HARD_ICONS[h.icon]
                return (
                  <article key={h.title} data-reveal="content" className="hard-card group relative overflow-hidden rounded-xl border border-border/70 bg-white/[0.02] p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-500/40">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="shipped-pill rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] text-emerald-400">● shipped</span>
                    </div>
                    <h3 className="text-[13.5px] font-semibold leading-tight text-text">{h.title}</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{h.detail}</p>
                    <code className="mt-2.5 inline-block rounded-md border border-border bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-dim">{h.tag}</code>
                  </article>
                )
              })}
            </div>
          </div>
        </Slide>,

        /* 07 · hardening II */
        <Slide key="hardening-ii" id="hardening-ii" label="Hardening II" index={6} labelledBy="slide-7-heading">
          <div className={CONTAINER}>
            <SlideHead index={7} total={12} tag="hardening delivered · 2 of 2" title={<>…and the <em className="font-serif italic text-primary">rest of the wall</em>.</>} />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {hardeningTwo.map((h) => {
                const Icon = HARD_ICONS[h.icon]
                return (
                  <article key={h.title} data-reveal="content" className="hard-card group relative overflow-hidden rounded-xl border border-border/70 bg-white/[0.02] p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-500/40">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="shipped-pill rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] text-emerald-400">● shipped</span>
                    </div>
                    <h3 className="text-[13.5px] font-semibold leading-tight text-text">{h.title}</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{h.detail}</p>
                    <code className="mt-2.5 inline-block rounded-md border border-border bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-dim">{h.tag}</code>
                  </article>
                )
              })}
            </div>
            <div
              data-reveal="content"
              aria-label="Verification summary"
              className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3"
              style={{ background: "var(--bp-stub-bg)", border: "1px solid var(--bp-border)" }}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">55 suites · 106 ops · 0 wildcards</span>
              <span className="shipped-pill rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-emerald-400">● shipped ×9</span>
            </div>
          </div>
        </Slide>,

        /* 08 · ops */
        <Slide key="ops" id="ops" label="Ops console" index={7} labelledBy="slide-8-heading">
          <div className={CONTAINER}>
            <SlideHead
              index={8}
              total={12}
              tag="interactive console"
              title={<>Platform telemetry, <em className="font-serif italic text-primary">alive on demand</em>.</>}
              lead="Click a telemetry chip to feature it in the shell — then replay the audit session. Values derive from the codebase, never fabricated."
            />
            <div data-reveal="content" className="mt-8">
              <OpsConsole />
            </div>
          </div>
        </Slide>,

        /* 09 · deploy */
        <Slide key="deploy" id="deploy" label="Deploy & testing" index={8} labelledBy="slide-9-heading">
          <div className={CONTAINER}>
            <SlideHead index={9} total={12} tag="ship · verify · repeat" title={<>Containerized deploys, <em className="font-serif italic text-primary">green verification suites</em>.</>} />
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <ol className="relative space-y-0">
                {DEPLOY_STEPS.map((step, i) => (
                  <li key={step.title} data-reveal="content" className="dep-step relative flex gap-4 pb-7 last:pb-0">
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
              <div data-reveal="content" className="grid content-start gap-2.5">
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
        </Slide>,

        /* 10 · demo */
        <Slide key="demo" id="demo" label="Product demo" index={9} labelledBy="slide-10-heading">
          <div className={CONTAINER}>
            <SlideHead
              index={10}
              total={12}
              tag="product showcase"
              title={<>Run the platform like <em className="font-serif italic text-primary">a traveller would</em>.</>}
              lead={<>Seed once (<code className="rounded bg-white/5 px-1 py-0.5 font-mono text-primary">migrate:fresh --seed</code>), serve backend :8000 + frontend :8080, then walk the flow — every step maps to real screens in the repo.</>}
            />
            <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {DEMO_STEPS.map((step, i) => (
                <li
                  key={step.n}
                  data-reveal="content"
                  className="demo-card group relative overflow-hidden rounded-xl border border-border/70 bg-white/[0.02] p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/[0.04]"
                >
                  <span aria-hidden className="pointer-events-none absolute -bottom-3 -right-1 font-serif text-[72px] font-bold italic leading-none text-primary/10 transition-colors group-hover:text-primary/25">
                    {i + 1}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <b className="mt-1 block text-[14px] text-text">{step.title}</b>
                  <span className="mt-0.5 block break-words font-mono text-[11.5px] text-dim">{step.detail}</span>
                </li>
              ))}
            </ol>
          </div>
        </Slide>,

        /* 11 · team — 3 row wrappers (D24) */
        <Slide key="team" id="team" label="Team 2" index={10} labelledBy="slide-11-heading">
          <div className={CONTAINER}>
            <SlideHead
              index={11}
              total={12}
              tag="conference case study · team 2"
              title={<>Built by <em className="font-serif italic text-primary">Team 2</em>.</>}
              lead="One fullstack backend team — nine engineers, every layer shipped together: API, data, integrations, infra, docs."
            />
            <div className="mt-8 space-y-3">
              {[0, 1, 2].map((row) => (
                <div key={row} data-reveal="content" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {TEAM_MEMBERS.slice(row * 3, row * 3 + 3).map((member) => (
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
                          href={member.linkedin ?? "https://www.linkedin.com/"}
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
              ))}
            </div>
          </div>
        </Slide>,

        /* 12 · closing */
        <Slide key="closing" id="closing" label="Links" index={11} labelledBy="slide-12-heading">
          <Closing />
        </Slide>,
      ]}
      />
      {open && <InspectorDialog open={open} onOpenChange={setOpen} archKey={archKey} />}
    </>
  )
}
