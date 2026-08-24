import { useEffect, useRef } from "react"
import { gsap } from "../../lib/gsap"

/**
 * Scrollytelling — three pinned, scroll-scrubbed guarantee scenes:
 * A) payment fulfillment pipeline  B) idempotency under replay  C) rate limiter under fire.
 * Visible-by-default markup; ScrollTrigger owns from-states. Desktop: pin + scrub. Mobile/RM: simple reveals.
 */

function SceneFrame({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scene flex min-h-screen flex-col items-center justify-center gap-8 py-12">
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.22em] text-dim">{label}</p>
      {children}
    </div>
  )
}

export function Scrollytelling() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // desktop — pinned + scrubbed
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        /* ── Scene A · payment pipeline ── */
        const tlA = gsap.timeline({
          scrollTrigger: { trigger: "#scene-pay", start: "top top", end: "+=140%", scrub: 0.5, pin: true, anticipatePin: 1 },
        })
        tlA
          .fromTo("#scene-pay .pipe-base", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: "none" }, 0)
          .fromTo("#scene-pay .pipe-pulse", { attr: { cx: 100 }, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.1)
          .to("#scene-pay .pipe-pulse", { attr: { cx: 900 }, duration: 3, ease: "none" }, 0.15)
        const beatsA = [0.55, 1.15, 1.75, 2.35, 2.9]
        beatsA.forEach((at, i) => {
          tlA.fromTo(
            `#scene-pay .pnode-${i}`,
            { scale: 0.5, autoAlpha: 0, transformOrigin: "center" },
            { scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(2)" },
            at,
          )
        })
        tlA.fromTo(
          "#scene-pay .stamp-a",
          { scale: 0.6, autoAlpha: 0, transformOrigin: "center" },
          { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(2)" },
          3.25,
        )

        /* ── Scene B · idempotency ── */
        const tlB = gsap.timeline({
          scrollTrigger: { trigger: "#scene-idem", start: "top top", end: "+=150%", scrub: 0.5, pin: true, anticipatePin: 1 },
        })
        tlB
          .fromTo("#scene-idem .idem-path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: "none" }, 0)
          .fromTo("#scene-idem .idem-path2", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.3)
          // delivery #1 — settles
          .fromTo("#scene-idem .dot-1", { attr: { cx: 60 }, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.4)
          .to("#scene-idem .dot-1", { attr: { cx: 412 }, duration: 1, ease: "none" }, 0.45)
          .fromTo("#scene-idem .box", { stroke: "#2a3040" }, { stroke: "#34d399", duration: 0.2 }, 1.45)
          .fromTo("#scene-idem .stamp-ok", { scale: 0.6, autoAlpha: 0, transformOrigin: "center" }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(2)" }, 1.6)
          // replay — blocked
          .fromTo("#scene-idem .dot-2", { attr: { cx: 60 }, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 2.2)
          .to("#scene-idem .dot-2", { attr: { cx: 412 }, duration: 1, ease: "none" }, 2.25)
          .fromTo("#scene-idem .compare", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 3.2)
          .to("#scene-idem .dot-2", { attr: { cx: 200 }, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 3.6)
          .fromTo("#scene-idem .stamp-block", { scale: 0.6, autoAlpha: 0, transformOrigin: "center" }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(2)" }, 4.1)

        /* ── Scene C · rate limiter ── */
        const tlC = gsap.timeline({
          scrollTrigger: { trigger: "#scene-rate", start: "top top", end: "+=160%", scrub: 0.5, pin: true, anticipatePin: 1 },
        })
        for (let i = 0; i < 7; i++) {
          const at = 0.2 + i * 0.55
          tlC.fromTo(`#scene-rate .req-${i}`, { attr: { cx: 80 }, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, at)
          if (i < 6) {
            tlC
              .to(`#scene-rate .req-${i}`, { attr: { cx: 432 }, duration: 0.45, ease: "none" }, at + 0.05)
              .to(`#scene-rate .req-${i}`, { autoAlpha: 0, duration: 0.15 }, at + 0.5)
              .to("#scene-rate .bucket-fill", { attr: { height: 184 - (i + 1) * 27, y: 252 - (184 - (i + 1) * 27) }, duration: 0.2 }, at + 0.55)
          } else {
            // seventh request — rejected
            tlC
              .to(`#scene-rate .req-${i}`, { attr: { cx: 432 }, duration: 0.45, ease: "none" }, at + 0.05)
              .to(`#scene-rate .req-${i}`, { attr: { cx: 180 }, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, at + 0.6)
              .fromTo("#scene-rate .stamp-429", { scale: 0.6, autoAlpha: 0, transformOrigin: "center" }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(2)" }, at + 0.9)
              .fromTo("#scene-rate .rate-caption", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, at + 1.2)
          }
        }
      })

      // mobile / reduced-motion — simple reveals, no pin
      mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
        gsap.utils.toArray<HTMLElement>(".scene").forEach((scene) => {
          const targets = scene.querySelectorAll(".pnode, .stamp-a, .stamp-ok, .stamp-block, .stamp-429, .compare, .rate-caption, .idem-label, .pipe-label")
          gsap.fromTo(targets, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, scrollTrigger: { trigger: scene, start: "top 75%", once: true } })
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="guarantees" ref={rootRef} className="scroll-mt-20 border-b border-border/50">
      <div className="mx-auto max-w-[1280px] px-4 pt-16 lg:px-6">
        <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-dim">
          <span className="font-mono text-primary">04</span>
          <span aria-hidden className="h-px w-8 bg-border" />
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] normal-case">guarantees in motion</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-text md:text-3xl">
          Don't read the guarantees. <em className="font-serif italic font-medium text-primary">Watch them run.</em>
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dim">
          Scroll to execute: a payment fulfilling end-to-end, a replayed webhook being rejected by idempotency, and the rate limiter absorbing abuse — every frame is derived from the real code paths.
        </p>
      </div>

      {/* ── Scene A · payment pipeline ── */}
      <SceneFrame id="scene-pay" label="scene a · anatomy of a payment">
        <svg viewBox="0 0 1000 260" className="w-full max-w-5xl" role="img" aria-label="Payment pipeline: checkout, order, Paymob intention, HMAC webhook, settled">
          <line className="pipe-base" x1="100" y1="130" x2="900" y2="130" stroke="rgba(251,191,36,0.4)" strokeWidth="2" pathLength={1} strokeDasharray={1} />
          <circle className="pipe-pulse" cx="100" cy="130" r="7" fill="#fcd34d" style={{ filter: "drop-shadow(0 0 6px rgba(252,211,77,0.9))" }} />
          {[
            { x: 100, name: "Checkout", sub: "strategy resolved" },
            { x: 300, name: "Order", sub: "ORD-8820" },
            { x: 500, name: "Paymob", sub: "intention + clientSecret" },
            { x: 700, name: "Webhook", sub: "HMAC SHA-512" },
            { x: 900, name: "Settled", sub: "fulfilled ✓" },
          ].map((n, i) => (
            <g key={n.name} className={`pnode pnode-${i}`}>
              <rect x={n.x - 62} y="100" width="124" height="60" rx="12" fill="#12141c" stroke="rgba(251,191,36,0.4)" strokeWidth="1.5" />
              <text x={n.x} y="126" textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="600">{n.name}</text>
              <text x={n.x} y="146" textAnchor="middle" fill="#9aa3c2" fontSize="11" fontFamily="monospace">{n.sub}</text>
            </g>
          ))}
          <text className="stamp-a" x="500" y="215" textAnchor="middle" fill="#34d399" fontSize="15" fontFamily="monospace">✓ order settled — FulfillOrderListener</text>
        </svg>
      </SceneFrame>

      {/* ── Scene B · idempotency ── */}
      <SceneFrame id="scene-idem" label="scene b · idempotency, proven">
        <svg viewBox="0 0 1000 340" className="w-full max-w-5xl" role="img" aria-label="Replayed webhook blocked by merchant_order_id idempotency key">
          <path className="idem-path" d="M 60 140 H 412" stroke="rgba(52,211,153,0.45)" strokeWidth="2" fill="none" pathLength={1} strokeDasharray={1} />
          <path className="idem-path2" d="M 60 200 H 412" stroke="rgba(251,191,36,0.45)" strokeWidth="2" strokeDasharray="6 6" fill="none" opacity="0" />
          <text className="idem-label" x="62" y="126" fill="#9aa3c2" fontSize="12" fontFamily="monospace">webhook · delivery #1 · ORD-8820</text>
          <text className="idem-label" x="62" y="186" fill="#9aa3c2" fontSize="12" fontFamily="monospace">webhook · replay · same merchant_order_id</text>

          <circle className="dot-1" cx="60" cy="140" r="7" fill="#34d399" style={{ filter: "drop-shadow(0 0 6px rgba(52,211,153,0.8))" }} />
          <circle className="dot-2" cx="60" cy="200" r="7" fill="#fbbf24" style={{ filter: "drop-shadow(0 0 6px rgba(251,191,36,0.8))" }} />

          <rect className="box" x="420" y="120" width="180" height="100" rx="12" fill="#12141c" stroke="#2a3040" strokeWidth="2" />
          <text x="510" y="163" textAnchor="middle" fill="#f8fafc" fontSize="16" fontWeight="600">Order</text>
          <text x="510" y="188" textAnchor="middle" fill="#9aa3c2" fontSize="13" fontFamily="monospace">ORD-8820</text>

          <text className="stamp-ok" x="510" y="100" textAnchor="middle" fill="#34d399" fontSize="15" fontFamily="monospace">✓ settled — first delivery wins</text>
          <text className="compare" x="510" y="255" textAnchor="middle" fill="#9aa3c2" fontSize="12" fontFamily="monospace">key match found: merchant_order_id → replay ignored</text>
          <text className="stamp-block" x="510" y="290" textAnchor="middle" fill="#fbbf24" fontSize="15" fontFamily="monospace">✕ blocked — nothing settles twice</text>
        </svg>
      </SceneFrame>

      {/* ── Scene C · rate limiter ── */}
      <SceneFrame id="scene-rate" label="scene c · rate limiter under fire">
        <svg viewBox="0 0 1000 300" className="w-full max-w-5xl" role="img" aria-label="Seven requests hit a depleting token bucket; the seventh is rejected with 429">
          <rect x="440" y="60" width="120" height="200" rx="10" fill="none" stroke="rgba(251,191,36,0.5)" strokeWidth="2" />
          <rect className="bucket-fill" x="448" y="68" width="104" height="184" rx="6" fill="rgba(52,211,153,0.25)" />
          <text x="500" y="45" textAnchor="middle" fill="#9aa3c2" fontSize="12" fontFamily="monospace">token bucket · 60/min · per-user + per-IP</text>

          <rect x="790" y="110" width="150" height="100" rx="12" fill="#12141c" stroke="rgba(251,191,36,0.4)" strokeWidth="1.5" />
          <text x="865" y="155" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="600">API</text>
          <text x="865" y="178" textAnchor="middle" fill="#9aa3c2" fontSize="11" fontFamily="monospace">/api/*</text>
          <line x1="560" y1="160" x2="782" y2="160" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeDasharray="4 6" />

          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle key={i} className={`req-${i}`} cx="80" cy={64 + i * 29} r="7" fill="#e2e8f0" />
          ))}

          <text className="stamp-429" x="500" y="30" textAnchor="middle" fill="#fb7185" fontSize="16" fontWeight="700" fontFamily="monospace">429 — too many requests</text>
          <text className="rate-caption" x="500" y="290" textAnchor="middle" fill="#9aa3c2" fontSize="13" fontFamily="monospace">sliding windows on login · ai · checkout · weather · refresh — CI-tested</text>
        </svg>
      </SceneFrame>
    </section>
  )
}
