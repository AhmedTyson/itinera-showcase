import { Copy, Network, Terminal, ArrowRight, ShieldCheck } from "lucide-react"
import type { ReactNode } from "react"
import { buttonVariants } from "../ui/button"
import { useAnnouncer } from "../../hooks/useAnnouncer"

type CTA = { label: string; href: string; variant: "gold" | "ghost"; icon?: "network" | "terminal" }

const ICONS = { network: Network, terminal: Terminal } as const

type HeroProps = {
  badge: string
  titleEm: string
  lead: string
  ctas: [CTA, CTA]
  codeSample: string
  trustPills?: string[]
}

/** Tiny deterministic highlighter for the static cURL+JSON sample. */
function highlight(line: string, key: number): ReactNode {
  if (line.trimStart().startsWith("#")) return <span key={key} className="text-dim/70">{line}</span>
  const parts: ReactNode[] = []
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(\b\d+(?:\.\d+)?\b)|(-{1,2}[a-zA-Z-]+)|('(?:[^'\\]|\\.)*')/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push(<span key={`${key}-${last}`} className="text-[#cdd6e8]">{line.slice(last, m.index)}</span>)
    if (m[1] && m[2]) {
      parts.push(<span key={`${key}-k${m.index}`} className="text-primary/90">{m[1]}</span>)
      parts.push(<span key={`${key}-c${m.index}`} className="text-dim">{m[2]}</span>)
    } else if (m[1]) {
      parts.push(<span key={`${key}-s${m.index}`} className="text-emerald-300/90">{m[1]}</span>)
    } else if (m[3]) {
      parts.push(<span key={`${key}-n${m.index}`} className="text-sky-300/90">{m[3]}</span>)
    } else if (m[4]) {
      parts.push(<span key={`${key}-f${m.index}`} className="text-primary">{m[4]}</span>)
    } else if (m[5]) {
      parts.push(<span key={`${key}-q${m.index}`} className="text-emerald-300/90">{m[5]}</span>)
    }
    last = m.index + m[0].length
  }
  if (last < line.length) parts.push(<span key={`${key}-${last}`} className="text-[#cdd6e8]">{line.slice(last)}</span>)
  return <div key={key}>{parts}</div>
}

export function Hero({ badge, titleEm, lead, ctas, codeSample, trustPills }: HeroProps) {
  const { announce, Region } = useAnnouncer()
  if (lead.split(/\s+/).length > 25 && import.meta.env.DEV) {
    console.warn(`[Hero] lead is ${lead.split(/\s+/).length} words (recommended ≤25)`)
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeSample)
      announce("Copied")
    } catch {
      announce("Copy blocked")
    }
  }

  return (
    <section className="relative overflow-clip border-b border-border/50" aria-label="Overview">
      {/* ambient depth: gold glow + faint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 px-4 pb-14 pt-16 lg:grid-cols-[1.05fr_1fr] lg:px-6 lg:pb-20 lg:pt-24">
        {/* ── left: message ── */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1 text-xs text-dim backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" aria-hidden />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" aria-hidden />
            </span>
            {badge}
          </span>

          <h1 className="mt-5 text-balance text-[clamp(2.4rem,6vw,4.2rem)] font-extrabold leading-[1.04] tracking-tighter text-text">
            The engineering story behind{" "}
            <em
              className="font-serif italic font-medium text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(105deg,#fde68a 0%,#fbbf24 45%,#d97706 100%)", filter: "drop-shadow(0 0 22px rgba(251,191,36,.25))" }}
            >
              {titleEm}
            </em>
            .
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-dim md:text-base">{lead}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {ctas.map((cta) => {
              const Icon = cta.icon ? ICONS[cta.icon] : null
              return (
                <a
                  key={cta.label}
                  href={cta.href}
                  className={buttonVariants({
                    variant: cta.variant === "gold" ? "gold" : "ghost",
                    size: "lg",
                  })}
                >
                  {Icon && <Icon className="h-4 w-4" aria-hidden />}
                  {cta.label}
                  {cta.variant === "gold" && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />}
                </a>
              )
            })}
          </div>

          {/* proof strip */}
          {trustPills && trustPills.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border/70 bg-white/[0.02] px-4 py-3" aria-label="Trust signals">
              {trustPills.map((p, i) => (
                <span key={p} className="flex items-center gap-4">
                  {i > 0 && <span aria-hidden className="h-3 w-px bg-border" />}
                  <span className="font-mono text-[11px] text-dim">{p}</span>
                </span>
              ))}
            </div>
          )}

          <p className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-dim">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden />
            Counts audited via <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-primary">php artisan route:list</code> — zero invented numbers.
          </p>
        </div>

        {/* ── right: product-first terminal artifact ── */}
        <div className="relative">
          <div aria-hidden className="pointer-events-none absolute -inset-6 rounded-[28px] bg-primary/[0.08] blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-border bg-[#0a0d15]/90 shadow-[0_18px_50px_rgba(0,0,0,.45)] backdrop-blur">
            {/* window chrome */}
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="flex gap-1.5" aria-hidden>
                  <i className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <i className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <i className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </span>
                <span className="font-mono text-[11px] text-dim">itinera — first request</span>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300 tabular-nums">201 OK</span>
            </div>

            {/* code */}
            <pre
              className="max-h-[340px] overflow-x-auto p-4 pt-3 font-mono text-[11px] leading-relaxed md:text-xs"
              style={{ fontVariantLigatures: "none", scrollbarWidth: "thin" }}
            >
              <code>{codeSample.split("\n").map((line, i) => highlight(line, i))}</code>
            </pre>

            {/* panel footer: copy + palette hint */}
            <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5">
              <button
                onClick={onCopy}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] text-dim transition-colors hover:border-primary/40 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Copy className="h-3 w-3" aria-hidden /> Copy request
              </button>
              <kbd className="flex items-center gap-1 rounded border border-border bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-dim">
                Ctrl K · jump anywhere
              </kbd>
            </div>
          </div>
          <Region />
        </div>
      </div>
    </section>
  )
}
