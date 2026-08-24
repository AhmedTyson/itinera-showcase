import { useState } from "react"
import { Link } from "react-router-dom"
import { Book, FileText } from "lucide-react"
import { Topbar } from "../components/layout/Topbar"
import { Hero } from "../components/sections/Hero"
import { KpiBand } from "../components/sections/KpiBand"
import { ArchCanvas } from "../components/canvas/ArchCanvas"
import { ErCanvas } from "../components/canvas/ErCanvas"
import { InspectorDialog } from "../components/canvas/InspectorDialog"
import { SecurityLedger } from "../components/sections/SecurityLedger"
import { KPI_ITEMS, TRUST_PILLS } from "../lib/kpi"
import {
  STACK_GROUPS,
  FRONTEND_CARDS,
  TELEMETRY,
  TERM_LINES,
  DEPLOY_STEPS,
  TEST_ROWS,
  RISK_COLS,
  ROADMAP_COLS,
  DEMO_STEPS,
  TEAM,
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
  const [archKey, setArchKey] = useState<string | null>(null)
  const [entityKey, setEntityKey] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleArchInspect = (key: string) => {
    setArchKey(key)
    setEntityKey(null)
    setOpen(true)
  }
  const handleErInspect = (key: string) => {
    setEntityKey(key)
    setArchKey(null)
    setOpen(true)
  }

  return (
    <div className="min-h-screen bg-bg-0">
      <Topbar variant="home" />
      <Hero
        badge="Conference Case Study 1 · Fullstack Monorepo"
        titleEm="Itinera"
        lead="Luxury travel orchestration built on a production-hardened monorepo. Explore interactive architecture mappings, audited route ledgers, and live API endpoints—powered by Laravel 12 and React."
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

      {/* 01 · architecture */}
      <section id="architecture" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead num="01" tag="request lifecycle">
            Layered Laravel core, <em className="font-serif italic font-medium text-primary">thin controllers</em>, contract-bound repositories.
          </SectionHead>
          <p className="mt-3 max-w-2xl text-sm text-dim">Every request flows Client → Router → Auth guard → Controller → Service → Repository → Model. Click any node to inspect — counts are repo-derived.</p>
          <div className="mt-8">
            <ArchCanvas onInspect={handleArchInspect} />
          </div>
        </div>
      </section>

      {/* 02 · stack */}
      <section id="stack" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead num="02" tag="six groups">
            Boring where it should be, <em className="font-serif italic text-primary">sharp where it counts</em>.
          </SectionHead>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STACK_GROUPS.map((group) => (
              <div key={group.group} className="rounded-xl border border-border/70 bg-white/[0.02] p-5">
                <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-dim">{group.group}</h3>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <b className="block text-[13.5px] text-text">{item.name}</b>
                      <span className="text-[12.5px] text-muted">{item.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
            {FRONTEND_CARDS.map((card) => (
              <article key={card.title} className="rounded-xl border border-border/70 bg-white/[0.02] p-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">{card.meta}</span>
                <h3 className="mb-1.5 mt-2 text-[15px] font-semibold text-text">{card.title}</h3>
                <p className="text-[13px] leading-relaxed text-muted">{card.body}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {card.chips.map((chip) => (
                    <span key={chip} className="rounded-full border border-border px-2 py-0.5 font-mono text-[10.5px] text-dim">
                      {chip}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 04 · security */}
      <section id="security" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead num="04" tag="issue → mitigation ledger" lead="Every issue maps to a deliberate mitigation. Row 11 closes the 2026 agentic-enumeration gap with per-user + per-IP sliding windows and a CI rate-limit test.">
            Eleven findings — ten shipped, one <em className="font-serif italic text-primary">planned</em>.
          </SectionHead>
          <div className="mt-8">
            <SecurityLedger />
          </div>
        </div>
      </section>

      {/* 05 · data */}
      <section id="data" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead num="05" tag="44 migrations · 12 entities" lead="Click an entity for columns and relations. Polymorphic trip_items attach hotels/restaurants/attractions/flights.">
            Trips are the aggregate — <em className="font-serif italic text-primary">everything hangs off them</em>.
          </SectionHead>
          <div className="mt-8">
            <ErCanvas onInspect={handleErInspect} />
          </div>
        </div>
      </section>

      {/* 06 · ops / command center */}
      <section id="ops" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead num="06" tag="derived from config · not live">
            Platform telemetry, <em className="font-serif italic text-primary">sourced from the codebase</em>.
          </SectionHead>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-3">
              {TELEMETRY.map((cell) => (
                <div key={cell.value} className="rounded-lg border border-border/70 bg-white/[0.02] p-3.5">
                  <b className="block truncate font-mono text-[13px] text-text">{cell.value}</b>
                  <span className="text-[11.5px] text-dim">{cell.note}</span>
                </div>
              ))}
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-black/40">
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
                <span aria-hidden className="flex gap-1.5">
                  <i className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <i className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <i className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </span>
                <span className="font-mono text-[11px] text-dim">itinera@railway — audit shell</span>
              </div>
              <div className="space-y-1 p-4 font-mono text-[12px] leading-relaxed">
                {TERM_LINES.map((line, i) =>
                  line.kind === "cmd" ? (
                    <div key={i}>
                      <span className="mr-2 text-dim">$</span>
                      <span className="text-text">{line.text}</span>
                    </div>
                  ) : (
                    <div key={i} className="pl-4 text-primary">{line.text}</div>
                  )
                )}
              </div>
            </div>
          </div>
          <p className="mt-4 text-[12px] italic text-dim">Values derived from codebase audit 2026-08-21 — intentionally static, no fabricated uptime/latency.</p>
        </div>
      </section>

      {/* 07 · deploy & testing */}
      <section id="deploy" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead num="07" tag="ship · verify · repeat">
            Containerized deploys, <em className="font-serif italic text-primary">green verification suites</em>.
          </SectionHead>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <ol className="relative space-y-6 border-l border-border/60 pl-6">
              {DEPLOY_STEPS.map((step) => (
                <li key={step.title} className="relative">
                  <span aria-hidden className="absolute -left-[27px] top-1 h-2 w-2 rounded-full bg-primary" />
                  <h3 className="text-[14px] font-semibold text-text">{step.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{step.detail}</p>
                </li>
              ))}
            </ol>
            <div>
              <div
                tabIndex={0}
                role="region"
                aria-label="Test suites table — scrollable horizontally on small screens"
                className="overflow-x-auto rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <table className="w-full min-w-[520px] border-collapse text-[13.5px]">
                  <thead>
                    <tr className="bg-white/5 text-left">
                      <th scope="col" className="border-b border-border px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-dim">Suite</th>
                      <th scope="col" className="border-b border-border px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-dim">Covers</th>
                      <th scope="col" className="border-b border-border px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-dim">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEST_ROWS.map((row) => (
                      <tr key={row.suite} className="hover:bg-white/[0.02]">
                        <td className="border-b border-border/60 px-3 py-2 align-top font-medium text-text">{row.suite}</td>
                        <td className="border-b border-border/60 px-3 py-2 align-top text-muted">{row.covers}</td>
                        <td className="border-b border-border/60 px-3 py-2 align-top">
                          <span className="whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-300">{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
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

      {/* 08 · risks */}
      <section id="risks" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead num="08" tag="peer-review voice">
            What we'd praise — and what we'd <em className="font-serif italic text-primary">push on next</em>.
          </SectionHead>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {RISK_COLS.map((col) => (
              <div key={col.heading} className="rounded-xl border border-border/70 bg-white/[0.02] p-5">
                <h3 className={`mb-3 text-[14px] font-semibold ${col.tone === "ok" ? "text-emerald-300" : col.tone === "warn" ? "text-amber-300" : "text-primary"}`}>
                  {col.heading}
                </h3>
                <ul className="list-disc space-y-2 pl-4 text-[13px] leading-relaxed text-muted marker:text-dim">
                  {col.items.map((item) => (
                    <li key={item.slice(0, 32)}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 09 · roadmap */}
      <section id="roadmap" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead num="09" tag="three horizons">
            From case study to <em className="font-serif italic text-primary">product candidate</em>.
          </SectionHead>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {ROADMAP_COLS.map((col, i) => (
              <div key={col.horizon} className="rounded-xl border border-border/70 bg-white/[0.02] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                      i === 0 ? "bg-emerald-500/15 text-emerald-300" : i === 1 ? "bg-amber-500/15 text-amber-300" : "bg-slate-500/15 text-slate-300"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <h3 className="text-[14px] font-semibold text-text">{col.horizon}</h3>
                </div>
                <ul className="list-disc space-y-2 pl-4 text-[13px] leading-relaxed text-muted marker:text-dim">
                  {col.items.map((item) => (
                    <li key={item.slice(0, 32)}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 · demo flow */}
      <section id="demo" className="scroll-mt-20 border-b border-border/50 py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead
            num="10"
            tag="eight steps · one narrative"
            lead={
              <>
                Seed once (<code className="rounded bg-white/5 px-1 py-0.5 font-mono text-primary">migrate:fresh --seed</code>), serve backend :8000 + frontend :8080, then walk the stepper — each step maps to real screens in the repo.
              </>
            }
          >
            Run the platform like <em className="font-serif italic text-primary">a traveller would</em>.
          </SectionHead>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DEMO_STEPS.map((step) => (
              <div key={step.n} className="rounded-lg border border-border/70 bg-white/[0.02] p-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{step.n}</span>
                <b className="mt-1 block text-[14px] text-text">{step.title}</b>
                <span className="mt-0.5 block break-words font-mono text-[11.5px] text-dim">{step.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 · team */}
      <section id="team" className="py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
          <SectionHead num="11" tag="conference case study · team 2">
            Built by <em className="font-serif italic text-primary">Team 2</em>.
          </SectionHead>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member) => (
              <div key={member.initials} className="flex items-center gap-3 rounded-xl border border-border/70 bg-white/[0.02] p-4">
                <span aria-hidden className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-mono text-[13px] font-bold text-primary">
                  {member.initials}
                </span>
                <div>
                  <b className="block text-[14px] text-text">{member.role}</b>
                  <span className="text-[12.5px] text-dim">{member.focus}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-border/70 bg-white/[0.02] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <b className="text-[14px] text-text">Run it locally</b>
                <p className="mt-1 text-[13px] text-muted">
                  Backend <code className="rounded bg-white/5 px-1 font-mono text-primary">php artisan serve</code> (:8000) · Frontend{" "}
                  <code className="rounded bg-white/5 px-1 font-mono text-primary">python -m http.server 8080</code> · Admin creds{" "}
                  <code className="rounded bg-white/5 px-1 font-mono text-primary">admin@threedos.com / password</code>
                </p>
              </div>
              <div className="flex gap-2">
                <Link to="/docs" className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-dim hover:border-primary/40 hover:text-text">
                  <Book className="h-3.5 w-3.5" aria-hidden /> API Docs
                </Link>
                <Link to="/wiki" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-bg-0 hover:bg-primary/90">
                  <FileText className="h-3.5 w-3.5" aria-hidden /> Repo Wiki
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 text-[12px] text-dim lg:px-6">
          <span>© 2026 Itinera — Team 2 conference deliverable · MIT</span>
          <span className="tabular-nums">site updated {SITE_UPDATED}</span>
        </div>
      </footer>

      <InspectorDialog open={open} onOpenChange={setOpen} archKey={archKey} entityKey={entityKey} />
    </div>
  )
}
