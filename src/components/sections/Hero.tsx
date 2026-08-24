import { useEffect, useRef, useState, type ReactNode } from "react"
import gsap from "gsap"
import { Network, Terminal, ArrowRight, Plane, ShieldCheck } from "lucide-react"
import { generateBarcodeSvg } from "../../lib/barcode"

type CTA = { label: string; href: string; variant: "gold" | "ghost"; icon?: "network" | "terminal" }

const ICONS = { network: Network, terminal: Terminal } as const

type HeroProps = {
  badge: string
  titleEm: string
  lead: string
  ctas: [CTA, CTA]
  codeSample?: string
  trustPills?: string[]
}

function W({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block overflow-hidden pb-[0.09em] -mb-[0.09em] align-bottom">
      <span className="hero-word inline-block will-change-transform">{children}</span>
    </span>
  )
}

export function Hero({ badge, titleEm, lead, ctas, trustPills }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null)
  const aztecRef = useRef<HTMLCanvasElement>(null)
  const [aztecFailed, setAztecFailed] = useState(false)

  // real scannable Aztec code — drawn after mount, guarded (bwip-js lazy-loaded)
  useEffect(() => {
    if (aztecFailed) return
    let cancelled = false
    import("bwip-js")
      .then(({ default: bwipjs }) => {
        if (cancelled) return
        const canvas = aztecRef.current
        if (!canvas) return
        bwipjs.toCanvas(canvas, {
          bcid: "azteccode",
          text: "https://github.com/AhmedTyson/Team2-Conference-Project",
          scale: 2,
          barcolor: "141826",
          backgroundcolor: "FFFFFF",
          includetext: false,
        })
      })
      .catch(() => {
        if (!cancelled) setAztecFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [aztecFailed])
  useEffect(() => {
    (window as any).gsap = gsap;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      tl.fromTo(".bp-cover", { scale: 0.98, rotate: -1, y: 40, opacity: 0 }, { scale: 1, rotate: 0, y: 0, opacity: 1, duration: 1.0 })
        .fromTo(".hero-word", { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.03, ease: "back.out(1.2)" }, "-=0.6")
        .fromTo("[data-hero='badge']", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, "-=0.4")
        .fromTo("[data-hero='lead']", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, "-=0.35")
        .fromTo("[data-hero='cta']", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.05 }, "-=0.3")
        .fromTo(".hero-route-line", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, "-=0.35")
        .fromTo(".hero-stub-field", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.03 }, "-=0.4")
        .fromTo(".hero-barcode-link", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, "-=0.3")
        .fromTo(".scan-bar", { xPercent: -150, opacity: 0.6 }, { xPercent: 400, duration: 1.2, ease: "power1.inOut" }, "-=0.5")
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const marquee = (trustPills ?? []).join("  ✦  ")

  return (
    <section ref={rootRef} className="relative bg-bg-0 pb-2 pt-2" aria-label="Overview">
      {/* THE TICKET — theme-aware cover */}
      <div className="bp-wrap bp-cover relative overflow-hidden text-[var(--bp-text-white)]">
        <div className="bp-head" aria-hidden />

        <div className="bp-body">
          {/* ── main zone ── */}
          <div className="bp-main flex flex-col justify-center">
            <span
              data-hero="badge"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[var(--bp-text-dim)] backdrop-blur dark:border-white/10 dark:bg-white/[0.03] light:border-black/10 light:bg-black/[0.02]"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34d399] opacity-60" aria-hidden />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34d399]" aria-hidden />
              </span>
              {badge}
            </span>

            <h1 className="mt-4 max-w-3xl text-balance text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.07] tracking-tighter text-[var(--bp-text-white)]">
                <W>Every</W> <W>route,</W> <W>one</W>{" "}
              <W>
                <em
                  className="bg-clip-text font-serif font-medium italic text-transparent"
                  style={{ backgroundImage: "linear-gradient(105deg,#fde68a 0%,#fbbf24 45%,#d97706 100%)", filter: "drop-shadow(0 0 20px rgba(251,191,36,.28))" }}
                >
                  ticket
                </em>
              </W>{" "}
              <W>into</W>{" "}
              <W>
                <em
                  className="bg-clip-text font-serif font-extrabold italic text-transparent transition-all duration-300 hover:brightness-110"
                  style={{
                    backgroundImage: "linear-gradient(135deg, #fbbf24 30%, #34d399 100%)",
                    filter: "drop-shadow(0 0 15px rgba(52,211,153,.25))"
                  }}
                >
                  {titleEm}
                </em>
              </W>
              .
            </h1>

            <p data-hero="lead" className="mt-3 max-w-lg text-[15px] leading-relaxed text-[var(--bp-text-dim)] md:text-base">{lead}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {ctas.map((cta) => {
                const Icon = cta.icon ? ICONS[cta.icon] : null
                const primary = cta.variant === "gold"
                return (
                  <a
                    key={cta.label}
                    data-hero="cta"
                    href={cta.href}
                    target={cta.href.startsWith("http") ? "_blank" : undefined}
                    rel={cta.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className={`group relative inline-flex h-10 items-center gap-2.5 overflow-hidden rounded-xl text-[13px] transition-all duration-200 active:scale-[0.97] ${
                      primary
                        ? "bg-emerald-500 pl-2.5 pr-4 font-bold text-[#02120b] shadow-[0_4px_18px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_26px_rgba(16,185,129,0.45)]"
                        : "border border-[var(--bp-border)] bg-white/[0.03] px-3 font-semibold text-[var(--bp-text-white)] backdrop-blur-sm hover:border-primary/50 hover:bg-white/[0.06]"
                    }`}
                  >
                    {Icon && (
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                          primary
                            ? "bg-[#02120b]/15 group-hover:rotate-[-8deg] group-hover:scale-110"
                            : "border border-[var(--bp-border)] bg-white/5 text-[var(--bp-text-dim)] group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:text-primary"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    )}
                    {cta.label}
                    {primary ? (
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
                    ) : (
                      <span aria-hidden className="h-1 w-1 rounded-full bg-current opacity-40 transition-all duration-200 group-hover:opacity-100" />
                    )}
                    {primary && <span aria-hidden className="cta-sheen pointer-events-none absolute inset-0" />}
                  </a>
                )
              })}
            </div>

            {/* route mini-line with progress plane */}
            <div className="mt-7 grid max-w-xl grid-cols-[auto_1fr_auto] items-center gap-4">
              <div>
                <div className="bp-kicker" style={{ color: "var(--bp-text-dim)" }}>From:</div>
                <div className="font-mono text-lg font-black tracking-tight text-[var(--bp-text-white)]">DEV</div>
              </div>
              <div style={{ position: "relative", height: 22, display: "flex", alignItems: "center" }}>
                {/* background track */}
                <div className="absolute inset-x-0 h-0.5 bg-[var(--bp-text-white)]/[0.08]" />
                {/* progressive line */}
                <div
                  className="hero-route-line absolute left-0 h-0.5 bg-primary"
                  style={{ width: "100%" }}
                >
                  {/* plane bobs and rides exactly at the leading edge of the line */}
                  <span className="bp-route-plane absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-primary flex items-center justify-center">
                    <Plane size={11} className="rotate-90" aria-hidden />
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="bp-kicker" style={{ color: "var(--bp-text-dim)" }}>To:</div>
                <div className="font-mono text-lg font-black tracking-tight text-[var(--bp-text-white)]">PRD</div>
              </div>
            </div>
            <p className="mt-1.5 text-[10px] font-bold text-[#34d399]">✓ Direct Non-Stop Pipeline — clone → serve in ~6 minutes</p>

            {/* proof pills */}
            {trustPills && trustPills.length > 0 && (
              <div className="mt-6 flex max-w-2xl flex-wrap items-center gap-x-4 gap-y-2" aria-label="Trust signals">
                {trustPills.map((p, i) => (
                  <span key={p} className="flex items-center gap-4">
                    {i > 0 && <span aria-hidden className="h-3 w-px bg-[var(--bp-dashed)]" />}
                    <span className="font-mono text-[11px] text-[var(--bp-text-dim)]">{p}</span>
                  </span>
                ))}
              </div>
            )}

            <p className="mt-5 flex flex-wrap items-center gap-1.5 text-xs text-[var(--bp-text-dim)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#34d399]" aria-hidden />
              Counts audited via <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-primary dark:bg-white/5 light:bg-black/5">php artisan route:list</code> — zero invented numbers.
            </p>
          </div>

          {/* perforation */}
          <div className="bp-divider" aria-hidden>
            <span className="bp-notch top" />
            <span className="bp-notch bottom" />
          </div>

          {/* ── stub zone ── */}
          <aside className="bp-stub justify-between" aria-label="Ticket manifest">
            <div className="hero-stub-field flex items-center justify-between border-b border-[var(--bp-dashed)] pb-2">
              <span className="text-[10px] font-black uppercase tracking-[.12em] text-primary">Boarding pass</span>
              <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[9px] font-extrabold text-primary">ITN-213</span>
            </div>

            {/* Compact grid with refined spacing to fill the visual gap */}
            <div className="flex flex-col gap-2.5 my-1" style={{ fontFamily: "var(--font-sans)" }}>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                <div className="hero-stub-field">
                  <div className="bp-kicker" style={{ color: "var(--bp-text-dim)" }}>Passenger</div>
                  <div className="font-extrabold text-[var(--bp-text-white)]">DEVELOPER</div>
                </div>
                <div className="hero-stub-field">
                  <div className="bp-kicker" style={{ color: "var(--bp-text-dim)" }}>Class</div>
                  <div className="font-extrabold text-primary">FIRST CLASS</div>
                </div>
                <div className="hero-stub-field">
                  <div className="bp-kicker" style={{ color: "var(--bp-text-dim)" }}>Flight</div>
                  <div className="font-mono font-extrabold text-[var(--bp-text-white)]">ITN-213</div>
                </div>
                <div className="hero-stub-field">
                  <div className="bp-kicker" style={{ color: "var(--bp-text-dim)" }}>Gate</div>
                  <div className="font-mono font-extrabold text-[var(--bp-text-white)]">:8000</div>
                </div>
                <div className="hero-stub-field">
                  <div className="bp-kicker" style={{ color: "var(--bp-text-dim)" }}>Terminal</div>
                  <div className="font-mono font-extrabold text-[var(--bp-text-white)]">RAILWAY</div>
                </div>
                <div className="hero-stub-field">
                  <div className="bp-kicker" style={{ color: "var(--bp-text-dim)" }}>Seat</div>
                  <div className="font-mono font-extrabold text-primary">JWT·15F</div>
                </div>
              </div>

              {/* Status Indicator Stamp to fill space gracefully */}
              <div className="hero-stub-field border-t border-dashed border-[var(--bp-dashed)] pt-2.5 flex items-center justify-between">
                <div>
                  <div className="bp-kicker" style={{ color: "var(--bp-text-dim)" }}>Status</div>
                  <div className="font-sans text-[10px] font-bold text-[#34d399] uppercase tracking-wider">Priority Boarding</div>
                </div>
                <div className="text-right">
                  <div className="bp-kicker" style={{ color: "var(--bp-text-dim)" }}>Sequence</div>
                  <div className="font-mono text-[10px] font-extrabold text-[var(--bp-text-white)]">002</div>
                </div>
              </div>

              <div className="hero-stub-field">
                <div className="bp-kicker" style={{ color: "var(--bp-text-dim)" }}>Route</div>
                <div className="font-semibold text-[var(--bp-text-white)]/85 text-[11px]">DEV → PRD · Non-Stop</div>
              </div>
            </div>

            {/* Real scannable Aztec code — links to the project repository on scan/click */}
            <a
              href="https://github.com/AhmedTyson/Team2-Conference-Project"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Scan barcode — visit Team 2 Conference Project GitHub repository"
              className="hero-barcode-link relative block w-full border-t border-[var(--bp-dashed)] pt-3.5 text-center focus-visible:outline-none transition-all hover:scale-[1.02] active:scale-95 text-[var(--bp-text-white)]/70 hover:text-[var(--bp-text-white)]"
            >
              <div className="flex items-center justify-center gap-3">
                {aztecFailed ? (
                  /* eslint-disable-next-line react/no-danger */
                  <div className="w-full" dangerouslySetInnerHTML={{ __html: generateBarcodeSvg("https://github.com/AhmedTyson/Team2-Conference-Project") }} />
                ) : (
                  <span className="inline-flex shrink-0 items-center rounded-lg bg-white p-1.5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
                    <canvas ref={aztecRef} className="h-11 w-11" aria-label="Aztec code linking to the project repository" />
                  </span>
                )}
                <span className="text-left" style={{ fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: ".08em" }}>
                  SCAN TO VIEW REPO
                  <span className="mt-0.5 block text-[8px] opacity-60">ETKT 0C14 FA54 2814</span>
                </span>
              </div>
            </a>
          </aside>
        </div>

        {/* scanner sweep overlays whole ticket */}
        <div className="scan-bar z-10" aria-hidden />

        {/* tear-strip footer: marquee */}
        {trustPills && trustPills.length > 0 && (
          <div className="hero-marquee relative overflow-hidden border-t border-dashed border-[var(--bp-dashed)] bg-[var(--bp-stub-bg)] py-2.5" aria-label="Trust signals ticker">
            <div className="hero-marquee-track">
              {[0, 1, 2, 3, 4, 5].map((copy) => (
                <span key={copy} aria-hidden={copy > 0} className="whitespace-nowrap pr-8 font-mono text-[11px] tracking-[0.08em] text-[var(--bp-text-dim)]">
                  {marquee}
                  {"  ✦  "}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
