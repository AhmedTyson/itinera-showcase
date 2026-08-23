import { useEffect, useRef, type ReactNode } from "react"
import gsap from "gsap"
import { Network, Terminal, ArrowRight, Plane, ShieldCheck } from "lucide-react"
import { buttonVariants } from "../ui/button"
import { generateBarcodeSvg } from "../../lib/barcode"
import { cn } from "../../lib/utils"
import { useScrollTo } from "../../hooks/useScrollTo"

type CTA = { label: string; href: string; variant: "gold" | "ghost"; icon?: "network" | "terminal" }

const ICONS = { network: Network, terminal: Terminal } as const

type HeroProps = {
  badge: string
  titleEm: string
  lead: string
  ctas: [CTA, CTA]
  /** kept for API compat */
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

/**
 * Hero v4 — the boarding pass IS the hero. Full-bleed .bp-wrap cover:
 * barber-pole head, main zone (headline/CTAs/route), perforation,
 * stub (manifest + barcode), marquee as the tear-strip footer.
 */
export function Hero({ badge, titleEm, lead, ctas, trustPills }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const scanRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const scrollTo = useScrollTo()

  useEffect(() => {
    const ctx = gsap.context(() => {
      {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
        tl.from(wrapRef.current, { scale: 0.97, rotate: -1.2, y: 64, opacity: 0, duration: 1.1 })
          .from(".hero-word", { yPercent: 115, duration: 0.8, stagger: 0.045, ease: "back.out(1.3)" }, "-=0.7")
          .from(["[data-hero='badge']", "[data-hero='lead']"], { y: 14, opacity: 0, duration: 0.55, stagger: 0.08 }, "-=0.65")
          .from("[data-hero='cta']", { y: 12, opacity: 0, duration: 0.4, stagger: 0.08 }, "-=0.45")
          .from(lineRef.current, { scaleX: 0, duration: 1, ease: "power2.inOut" }, "-=0.45")
          .from(".hero-stub-field", { y: 10, opacity: 0, duration: 0.38, stagger: 0.045 }, "-=0.7")
          .fromTo(
            scanRef.current,
            { xPercent: -150, opacity: 0.7 },
            { xPercent: 420, duration: 1.4, ease: "power1.inOut" },
            "-=0.6"
          )
      }
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const marquee = (trustPills ?? []).join("  ✦  ")

  return (
    <section ref={rootRef} className="relative bg-bg-0 pb-2 pt-2" aria-label="Overview">
      {/* THE TICKET — full-bleed cover */}
      <div ref={wrapRef} className="bp-wrap bp-cover relative overflow-hidden">
        <div className="bp-head" aria-hidden />

        <div className="bp-body">
          {/* ── main zone ── */}
          <div className="bp-main flex flex-col justify-center">
            <span data-hero="badge" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#9aa3c2] backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34d399] opacity-60" aria-hidden />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34d399]" aria-hidden />
              </span>
              {badge}
            </span>

            <h1 className="mt-4 max-w-3xl text-balance text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.07] tracking-tighter text-[#eef1f8]">
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
                <em className="font-serif italic font-medium">{titleEm}</em>
              </W>
              .
            </h1>

            <p data-hero="lead" className="mt-3 max-w-lg text-[15px] leading-relaxed text-[#9aa3c2] md:text-base">{lead}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {ctas.map((cta) => {
                const Icon = cta.icon ? ICONS[cta.icon] : null
                return (
                  <a
                    key={cta.label}
                    data-hero="cta"
                    href={cta.href}
                    className={cn(
                      buttonVariants({ variant: cta.variant === "gold" ? "gold" : "ghost", size: "lg" }),
                      "transition-transform hover:-translate-y-0.5",
                      // ticket interior is always dark — pin colors, ignore theme flip
                      cta.variant === "gold"
                        ? "bg-[#fbbf24] text-[#1c1403] hover:bg-[#fcd34d]"
                        : "border-white/15 bg-transparent !text-[#eef1f8] hover:!text-white hover:bg-white/[.06]"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" aria-hidden />}
                    {cta.label}
                    {cta.variant === "gold" && <ArrowRight className="h-4 w-4 text-[#1c1403]" aria-hidden />}
                  </a>
                )
              })}
            </div>

            {/* route mini-line */}
            <div className="mt-7 grid max-w-xl grid-cols-[auto_1fr_auto] items-center gap-4">
              <div>
                <div className="bp-kicker">From:</div>
                <div className="font-mono text-lg font-black tracking-tight text-white">DEV</div>
              </div>
              <div style={{ position: "relative", height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div ref={lineRef} className="hero-route-line" style={{ width: "100%", height: 2, background: "linear-gradient(90deg,rgba(251,191,36,.18),#fbbf24,rgba(251,191,36,.18))", borderRadius: 999 }} />
                <span className="bp-plane"><Plane size={11} aria-hidden /></span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="bp-kicker">To:</div>
                <div className="font-mono text-lg font-black tracking-tight text-white">PRD</div>
              </div>
            </div>
            <p className="mt-1.5 text-[10px] font-bold text-emerald-300">✓ Direct Non-Stop Pipeline — clone → serve in ~6 minutes</p>

            {/* proof pills */}
            {trustPills && trustPills.length > 0 && (
              <div className="mt-6 flex max-w-2xl flex-wrap items-center gap-x-4 gap-y-2" aria-label="Trust signals">
                {trustPills.map((p, i) => (
                  <span key={p} className="flex items-center gap-4">
                    {i > 0 && <span aria-hidden className="h-3 w-px bg-border" />}
                    <span className="font-mono text-[11px] text-[#9aa3c2]">{p}</span>
                  </span>
                ))}
              </div>
            )}

            <p className="mt-5 flex flex-wrap items-center gap-1.5 text-xs text-[#9aa3c2]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#34d399]" aria-hidden />
              Counts audited via <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[#fbbf24]">php artisan route:list</code> — zero invented numbers.
            </p>
          </div>

          {/* perforation */}
          <div className="bp-divider" aria-hidden>
            <span className="bp-notch top" />
            <span className="bp-notch bottom" />
          </div>

          {/* ── stub zone ── */}
          <aside className="bp-stub justify-between" aria-label="Ticket manifest">
            <div className="hero-stub-field flex items-center justify-between border-b border-white/[.08] pb-2">
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", color: "#fbbf24" }}>Boarding pass</span>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 800, background: "rgba(251,191,36,.12)", border: "1px solid rgba(251,191,36,.22)", color: "#fde68a", padding: "2px 6px", borderRadius: 6 }}>ITN-213</span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-[11px]" style={{ fontFamily: "var(--font-sans)" }}>
              <div className="hero-stub-field"><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Passenger</div><div className="font-extrabold text-white">DEVELOPER</div></div>
              <div className="hero-stub-field"><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Class</div><div className="font-extrabold text-[#fbbf24]">FIRST CLASS</div></div>
              <div className="hero-stub-field"><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Flight</div><div className="font-mono font-extrabold text-white">ITN-213</div></div>
              <div className="hero-stub-field"><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Gate</div><div className="font-mono font-extrabold text-white">:8000</div></div>
              <div className="hero-stub-field"><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Terminal</div><div className="font-mono font-extrabold text-white">RAILWAY</div></div>
              <div className="hero-stub-field"><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Seat</div><div className="font-mono font-extrabold text-[#fbbf24]">JWT·15F</div></div>
              <div className="hero-stub-field col-span-2"><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Route</div><div className="font-semibold text-white/85">DEV → PRD · non-stop</div></div>
            </div>

            <button
              type="button"
              onClick={() => scrollTo("#architecture")}
              aria-label="Scan barcode — jump to system architecture"
              className="hero-stub-field relative w-full border-t pt-3 text-center focus-visible:outline-none"
              style={{ borderTopColor: "rgba(255,255,255,.08)" }}
            >
              {/* eslint-disable-next-line react/no-danger */}
              <div dangerouslySetInnerHTML={{ __html: generateBarcodeSvg("ITINERA ITN-213 DEV→PRD") }} />
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,.35)", marginTop: 4, letterSpacing: ".08em" }}>ETKT 0C14 FA54 2814 · SCAN TO BOARD</div>
            </button>
          </aside>
        </div>

        {/* scanner sweep overlays whole ticket */}
        <div ref={scanRef} className="scan-bar z-10" aria-hidden />

        {/* tear-strip footer: marquee */}
        {trustPills && trustPills.length > 0 && (
          <div className="hero-marquee relative overflow-hidden border-t border-dashed border-white/[.18] bg-[#181b26] py-2.5" aria-label="Trust signals ticker">
            <div className="hero-marquee-track">
              {[0, 1].map((copy) => (
                <span key={copy} aria-hidden={copy === 1} className="whitespace-nowrap pr-8 font-mono text-[11px] tracking-[0.08em] text-[#9aa3c2]">
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
