import { useEffect, useRef, type ReactNode } from "react"
import gsap from "gsap"
import { Network, Terminal, ArrowRight, ShieldCheck } from "lucide-react"
import { buttonVariants } from "../ui/button"
import { ShowcaseTicket } from "./ShowcaseTicket"
import { useIsReducedMotion } from "../../hooks/useIsReducedMotion"

type CTA = { label: string; href: string; variant: "gold" | "ghost"; icon?: "network" | "terminal" }

const ICONS = { network: Network, terminal: Terminal } as const

type HeroProps = {
  badge: string
  titleEm: string
  lead: string
  ctas: [CTA, CTA]
  /** kept for API compat — ticket hero no longer renders a terminal */
  codeSample?: string
  trustPills?: string[]
}

/** word-unit with clip-mask wrapper for the GSAP rise reveal */
function W({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block overflow-hidden pb-[0.09em] -mb-[0.09em] align-bottom">
      <span className="hero-word inline-block will-change-transform">{children}</span>
    </span>
  )
}

export function Hero({ badge, titleEm, lead, ctas, trustPills }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const fgRiseRef = useRef<HTMLDivElement>(null)
  const scanRef = useRef<HTMLDivElement>(null)
  const isRM = useIsReducedMotion()

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (isRM) {
        // land every element in final pose — no motion
        gsap.set(".hero-word", { yPercent: 0 })
        return
      }

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } })
      tl.from(bgRef.current, { x: 150, y: 100, rotate: -2, opacity: 0, duration: 1.5, ease: "power3.out" })
        .from(".hero-word", { yPercent: 115, duration: 0.9, stagger: 0.055, ease: "back.out(1.4)" }, "-=1.05")
        .from(["[data-hero='badge']", "[data-hero='lead']"], { y: 18, opacity: 0, duration: 0.65, stagger: 0.09 }, "-=0.75")
        .from("[data-hero='cta']", { y: 16, opacity: 0, duration: 0.5, stagger: 0.09 }, "-=0.5")
        .from(fgRiseRef.current, { y: 80, rotate: 2.4, opacity: 0, duration: 1.15 }, "-=0.45")
        .fromTo(
          scanRef.current,
          { xPercent: -140, opacity: 0.9 },
          { xPercent: 320, duration: 1.05, ease: "power2.inOut" },
          "-=0.55"
        )

      // mouse parallax — backdrop drifts opposite, foreground leans in
      const bgX = gsap.quickTo(bgRef.current, "x", { duration: 0.9, ease: "power3" })
      const bgY = gsap.quickTo(bgRef.current, "y", { duration: 0.9, ease: "power3" })
      const fgX = gsap.quickTo(fgRiseRef.current, "x", { duration: 0.7, ease: "power3" })
      const onMove = (e: MouseEvent) => {
        const r = rootRef.current?.getBoundingClientRect()
        if (!r) return
        const nx = (e.clientX - r.left) / r.width - 0.5
        const ny = (e.clientY - r.top) / r.height - 0.5
        bgX(nx * -26)
        bgY(ny * -18)
        fgX(nx * 10)
      }
      const el = rootRef.current
      el?.addEventListener("mousemove", onMove)
      return () => el?.removeEventListener("mousemove", onMove)
    }, rootRef)
    return () => ctx.revert()
  }, [isRM])

  const marquee = (trustPills ?? []).join("  ✦  ")

  return (
    <section ref={rootRef} className="relative overflow-clip border-b border-border/50" aria-label="Overview">
      {/* ambient depth */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-44 left-1/2 h-[460px] w-[820px] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 85% 65% at 50% 0%, black 25%, transparent 72%)",
            WebkitMaskImage: "radial-gradient(ellipse 85% 65% at 50% 0%, black 25%, transparent 72%)",
          }}
        />
      </div>

      {/* mega-ticket backdrop — bleeds off canvas */}
      <div
        ref={bgRef}
        aria-hidden
        className="pointer-events-none absolute -right-[14%] top-[16%] hidden w-[900px] scale-[1.45] opacity-[0.13] blur-[2px] lg:block"
        style={{ transform: "rotate(-7deg)" }}
      >
        <ShowcaseTicket />
      </div>

      <div className="relative mx-auto flex max-w-[1280px] flex-col items-center px-4 pb-0 pt-16 text-center lg:px-6 lg:pt-24">
        <span data-hero="badge" className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1 text-xs text-dim backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" aria-hidden />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" aria-hidden />
          </span>
          {badge}
        </span>

        <h1 className="mt-5 max-w-4xl text-balance text-[clamp(2.5rem,6vw,4.3rem)] font-extrabold leading-[1.04] tracking-tighter text-text">
          <W>Every</W> <W>route,</W> <W>one</W>{" "}
          <W>
            <em
              className="bg-clip-text font-serif font-medium italic text-transparent"
              style={{ backgroundImage: "linear-gradient(105deg,#fde68a 0%,#fbbf24 45%,#d97706 100%)", filter: "drop-shadow(0 0 22px rgba(251,191,36,.28))" }}
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

        <p data-hero="lead" className="mt-5 max-w-xl text-[15px] leading-relaxed text-dim md:text-base">{lead}</p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {ctas.map((cta) => {
            const Icon = cta.icon ? ICONS[cta.icon] : null
            return (
              <a key={cta.label} data-hero="cta" href={cta.href} className={buttonVariants({ variant: cta.variant === "gold" ? "gold" : "ghost", size: "lg" })}>
                {Icon && <Icon className="h-4 w-4" aria-hidden />}
                {cta.label}
                {cta.variant === "gold" && <ArrowRight className="h-4 w-4" aria-hidden />}
              </a>
            )
          })}
        </div>

        {/* the artifact — rises + scanner sweep + tilt/hover */}
        <div ref={fgRiseRef} className="relative mt-12 w-full max-w-[900px] px-1 sm:px-4">
          <div className="fg-tilt relative">
            <ShowcaseTicket />
            <div ref={scanRef} className="scan-bar" aria-hidden />
          </div>
        </div>
        <p className="mt-3 text-[11px] font-mono tracking-wide text-dim/70">↑ scan the barcode to board · ticket fields map to real repo facts</p>

        {/* audited note */}
        <p className="mt-6 flex flex-wrap items-center justify-center gap-1.5 text-xs text-dim">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden />
          Counts audited via <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-primary">php artisan route:list</code> — zero invented numbers.
        </p>
      </div>

      {/* marquee ticker — bottom band */}
      {trustPills && trustPills.length > 0 && (
        <div className="hero-marquee relative mt-14 overflow-hidden border-y border-border/60 bg-white/[0.02] py-3" aria-label="Trust signals">
          <div className="hero-marquee-track">
            {[0, 1].map((copy) => (
              <span key={copy} aria-hidden={copy === 1} className="whitespace-nowrap pr-8 font-mono text-[12px] tracking-[0.08em] text-dim">
                {marquee}
                {"  ✦  "}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
