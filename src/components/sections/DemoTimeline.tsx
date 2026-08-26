import { useEffect, useRef, useState } from "react"
import { Users, MailCheck, CloudSun, FilePlus, Sparkles, Boxes, CreditCard, Ticket } from "lucide-react"
import { gsap } from "../../lib/gsap"
import { DEMO_STEPS } from "../../lib/home-content"

const ICONS = [Users, MailCheck, CloudSun, FilePlus, Sparkles, Boxes, CreditCard, Ticket] as const

const P0 = { x: 0, y: 40 }
const PC = { x: 500, y: 40 }
const P1 = { x: 1000, y: 40 }

function bezierPoint(t: number) {
  const x = (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * PC.x + t * t * P1.x
  const y = (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * PC.y + t * t * P1.y
  return { x, y }
}
function bezierAngle(t: number) {
  const dx = 2 * (1 - t) * (PC.x - P0.x) + 2 * t * (P1.x - PC.x)
  const dy = 2 * (1 - t) * (PC.y - P0.y) + 2 * t * (P1.y - PC.y)
  return (Math.atan2(dy, dx) * 180) / Math.PI
}
function arcLength(t: number, steps = 200) {
  let len = 0
  let prevX = P0.x
  let prevY = P0.y
  for (let i = 1; i <= steps; i++) {
    const ti = (t * i) / steps
    const p = bezierPoint(ti)
    len += Math.hypot(p.x - prevX, p.y - prevY)
    prevX = p.x
    prevY = p.y
  }
  return len
}
const TOTAL_ARC = arcLength(1)
const RAIL_LEN = Math.round(TOTAL_ARC)
function tForArcFraction(frac: number) {
  if (frac <= 0) return 0
  if (frac >= 1) return 1
  const target = TOTAL_ARC * frac
  let lo = 0, hi = 1
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2
    if (arcLength(mid) < target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
const STAGE_T = Array.from({ length: 8 }, (_, i) => tForArcFraction(i / 7))
const WP_POS = STAGE_T.map((t) => bezierPoint(t))

const STAGE_COPY = DEMO_STEPS.map((s) => ({
  title: s.title,
  desc: s.detail,
  tags: [s.n.toLowerCase(), "shipped"],
}))

export function DemoTimeline() {
  const [active, setActive] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const flownRef = useRef<SVGPathElement>(null)
  const contrailRef = useRef<SVGPathElement>(null)
  const planeRef = useRef<SVGGElement>(null)
  const readoutRef = useRef<HTMLSpanElement>(null)
  const footerTitleRef = useRef<HTMLDivElement>(null)
  const footerDescRef = useRef<HTMLDivElement>(null)
  const footerTagsRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const flightProxy = useRef({ t: 0 })
  const breathTween = useRef<gsap.core.Tween | null>(null)

  const drawCardEdge = (card: Element) => {
    const path = card.querySelector(".edge-path") as SVGPathElement | null
    if (!path) return
    gsap.set(path, { attr: { "stroke-dasharray": 100, "stroke-dashoffset": 100 } } as any)
    gsap.to(path, { attr: { "stroke-dashoffset": 0 } as any, duration: 0.55, ease: "power2.out" })
    gsap.to(path, { attr: { stroke: "rgba(16,185,129,0.5)" } as any, duration: 0.3 })
  }

  const flyPlaneTo = (targetT: number) => {
    if (breathTween.current) breathTween.current.kill()
    gsap.killTweensOf(flightProxy.current)
    gsap.to(flightProxy.current, {
      t: targetT,
      duration: 1.05,
      ease: "power2.inOut",
      onUpdate() {
        const pos = bezierPoint(flightProxy.current.t)
        const angle = bezierAngle(flightProxy.current.t)
        if (planeRef.current) gsap.set(planeRef.current, { x: pos.x, y: pos.y, rotation: angle, svgOrigin: `${pos.x} ${pos.y}` } as any)
      },
      onComplete() {
        if (planeRef.current) {
          gsap.fromTo(planeRef.current, { scale: 1 } as any, { scale: 1.22, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "50% 50%" } as any)
          breathTween.current = gsap.to(planeRef.current, { y: "+=1.5", duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1 } as any)
        }
      },
    })
  }

  const goToStage = (i: number) => {
    if (i === active) return
    const isWrapRestart = active === 7 && i === 0
    setActive(i)
    if (readoutRef.current) readoutRef.current.textContent = String(i + 1).padStart(2, "0")
    if (navRef.current) navRef.current.querySelectorAll("button").forEach((b, idx) => b.classList.toggle("on", idx === i))
    if (cardsRef.current) {
      const cards = Array.from(cardsRef.current.querySelectorAll(".pipe-card"))
      cards.forEach((c, idx) => {
        const label = c.querySelector(".state-label") as HTMLElement | null
        const icon = c.querySelector(".pipe-icon-badge") as HTMLElement | null
        c.classList.remove("is-done", "is-live")
        if (idx < i) {
          c.classList.add("is-done")
          if (label) label.textContent = "done"
          drawCardEdge(c)
          if (icon) gsap.fromTo(icon, { scale: 1 } as any, { scale: 1.12, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "center" } as any)
        } else if (idx === i) {
          c.classList.add("is-live")
          if (label) label.textContent = "active"
          drawCardEdge(c)
          if (icon) gsap.fromTo(icon, { scale: 1 } as any, { scale: 1.2, duration: 0.22, ease: "back.out(2.4)", yoyo: true, repeat: 1, transformOrigin: "center" } as any)
        } else {
          if (label) label.textContent = "pending"
        }
      })
    }
    const progPct = i / 7
    const targetT = STAGE_T[i]
    if (isWrapRestart) {
      flightProxy.current.t = targetT
      const pos = bezierPoint(targetT)
      const angle = bezierAngle(targetT)
      if (planeRef.current) gsap.set(planeRef.current, { x: pos.x, y: pos.y, rotation: angle, svgOrigin: `${pos.x} ${pos.y}` } as any)
      if (flownRef.current) gsap.set(flownRef.current, { attr: { "stroke-dashoffset": RAIL_LEN - RAIL_LEN * progPct } } as any)
      if (contrailRef.current) {
        gsap.set(contrailRef.current, { opacity: 0 } as any)
        gsap.set(contrailRef.current, { attr: { "stroke-dashoffset": RAIL_LEN - RAIL_LEN * progPct + 70 } } as any)
      }
      if (planeRef.current) {
        gsap.fromTo(planeRef.current, { scale: 1 } as any, { scale: 1.22, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "50% 50%" } as any)
        if (breathTween.current) breathTween.current.kill()
        breathTween.current = gsap.to(planeRef.current, { y: "+=1.5", duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1 } as any)
      }
    } else {
      if (flownRef.current) gsap.to(flownRef.current, { attr: { "stroke-dashoffset": RAIL_LEN - RAIL_LEN * progPct } as any, duration: 1.05, ease: "power2.inOut" })
      if (contrailRef.current) {
        gsap.set(contrailRef.current, { opacity: i === 0 ? 0 : 0.55 } as any)
        gsap.to(contrailRef.current, { attr: { "stroke-dashoffset": RAIL_LEN - RAIL_LEN * progPct + 70 } as any, duration: 1.05, ease: "power2.inOut" })
      }
      flyPlaneTo(targetT)
    }
    const copy = STAGE_COPY[i]
    if (footerTitleRef.current && footerDescRef.current && footerTagsRef.current) {
      gsap.to([footerTitleRef.current, footerDescRef.current, footerTagsRef.current], {
        opacity: 0, y: -4, duration: 0.15, ease: "power1.in",
        onComplete() {
          if (footerTitleRef.current) footerTitleRef.current.textContent = copy.title
          if (footerDescRef.current) footerDescRef.current.textContent = copy.desc
          if (footerTagsRef.current) footerTagsRef.current.innerHTML = copy.tags.map((t) => `<span class="pipe-tag"><span class="sdot"></span>${t}</span>`).join("")
          gsap.fromTo([footerTitleRef.current, footerDescRef.current, footerTagsRef.current], { opacity: 0, y: 6 } as any, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.03 } as any)
        },
      })
    }
  }

  useEffect(() => {
    const startPos = bezierPoint(0)
    const startAngle = bezierAngle(0)
    if (planeRef.current) gsap.set(planeRef.current, { x: startPos.x, y: startPos.y, rotation: startAngle, svgOrigin: `${startPos.x} ${startPos.y}` } as any)
    if (cardsRef.current) {
      const cards = Array.from(cardsRef.current.querySelectorAll(".pipe-card"))
      gsap.set(cards, { opacity: 0, y: 16 } as any)
      gsap.to(cards, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.06, delay: 0.15 } as any)
    }
    let cursor = 0
    let autoplay = true
    const onNavClick = (e: Event) => {
      const btn = (e.target as HTMLElement).closest("button[data-nav]")
      if (!btn) return
      autoplay = false
      const idx = Number(btn.getAttribute("data-nav"))
      goToStage(idx)
    }
    navRef.current?.addEventListener("click", onNavClick)
    const tick = () => {
      if (!autoplay) return
      goToStage(cursor)
      cursor = (cursor + 1) % 8
      setTimeout(tick, cursor === 0 ? 3000 : 1100)
    }
    const t = setTimeout(tick, 700)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault()
        autoplay = false
        goToStage((active + 1 + 8) % 8)
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault()
        autoplay = false
        goToStage((active - 1 + 8) % 8)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      clearTimeout(t)
      navRef.current?.removeEventListener("click", onNavClick)
      window.removeEventListener("keydown", onKey)
      if (breathTween.current) breathTween.current.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={rootRef} className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg px-4 py-2.5" style={{ background: "var(--bp-stub-bg)", border: "1px solid var(--bp-border)" }}>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--bp-text-dim)" }}>
          Journey · 8 waypoints · :8000 / :8080
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--bp-text-white)" }}>
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          explore → board
        </span>
      </div>

      <div className="pipe-canvas">
        <div className="pipe-flight-zone" style={{ height: 96 }}>
          <div className="pipe-altitude-label">
            <span className="blip" />
            TRAVELLING
          </div>
          <div className="pipe-altitude-readout">
            STEP <span className="val" ref={readoutRef}>
              01
            </span>{" "}
            / 08
          </div>

          <svg className="pipe-flight-svg" viewBox="0 0 1000 80" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="demoGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="demoGlow" x="-30%" y="-300%" width="160%" height="700%">
                <feGaussianBlur stdDeviation="2.6" result="b" />
                <feComposite in="SourceGraphic" in2="b" operator="over" />
              </filter>
              <filter id="demoPlaneGlow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="4.5" result="b" />
                <feComposite in="SourceGraphic" in2="b" operator="over" />
              </filter>
            </defs>

            <g fill="none" stroke="rgba(148,160,190,0.09)" strokeWidth="1" strokeDasharray="6 10" opacity="0.9">
              <path d="M 0 62 Q 500 48 1000 62" />
              <path d="M 0 72 Q 500 58 1000 72" />
            </g>

            <g className="pipe-drop-lines" stroke="rgba(148,160,190,0.10)" strokeWidth="1" strokeDasharray="3 6">
              {WP_POS.map((p, idx) => (
                <line key={idx} x1={p.x} y1={p.y} x2={p.x} y2={80} />
              ))}
            </g>

            <path d="M 0 40 H 1000" fill="none" stroke="rgba(15,23,42,0.6)" strokeWidth="3.2" strokeLinecap="round" opacity="0.35" />
            <path d="M 0 40 H 1000" fill="none" stroke="rgba(148,160,190,0.18)" strokeWidth="2" strokeLinecap="round" />
            <path ref={flownRef} d="M 0 40 H 1000" fill="none" stroke="url(#demoGrad)" strokeWidth="2.6" strokeLinecap="round" filter="url(#demoGlow)" strokeDasharray={RAIL_LEN} strokeDashoffset={RAIL_LEN} />
            <path ref={contrailRef} d="M 0 40 H 1000" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity={0} strokeDasharray="70 990" strokeDashoffset={RAIL_LEN} />

            {WP_POS.map((p, idx) => (
              <g key={idx} id={`dwp-${idx}`}>
                <circle cx={p.x} cy={p.y} r="6" fill="none" stroke="rgba(148,160,190,0.18)" strokeWidth="1.2" />
                <circle cx={p.x} cy={p.y} r="2.8" fill="rgba(148,160,190,0.38)" />
                <circle cx={p.x} cy={p.y} r="1" fill="#fff" opacity="0.9" />
              </g>
            ))}

            <g ref={planeRef} id="demo-plane">
              <g filter="url(#demoPlaneGlow)">
                <path d="M -10 0 L 9 -4.2 L 15 0 L 9 4.2 Z" fill="#fbbf24" />
                <path d="M -3 0 L -10 -7 L -6.5 0 L -10 7 Z" fill="#fbbf24" opacity="0.85" />
              </g>
              <path d="M -10 0 L 9 -4.2 L 15 0 L 9 4.2 Z" fill="#fffbeb" />
              <circle cx="-1" cy="0" r="1.3" fill="#f59e0b" />
            </g>
          </svg>
        </div>

        <div className="pipe-cards demo-8" ref={cardsRef} style={{ paddingTop: 12 }}>
          {DEMO_STEPS.map((s, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <button key={s.n} type="button" className="pipe-card" data-i={i} onClick={() => goToStage(i)} aria-label={`${s.title} — ${s.detail}`} style={{ padding: "18px 10px 16px" }}>
                <div className="card-edge">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path className="edge-path" d="M 1,13 Q 1,1 13,1 H 87 Q 99,1 99,13 V 87 Q 99,99 87,99 H 13 Q 1,99 1,87 Z" pathLength={100} />
                  </svg>
                </div>
                <div className="scanfield" />
                <div className="pipe-waypoint-code">{s.n}</div>
                <div className="pipe-icon-badge" style={{ width: 44, height: 44 }}>
                  <Icon style={{ width: 18, height: 18 } as any} />
                </div>
                <div className="pipe-card-title" style={{ fontSize: 12 }}>
                  {s.title}
                </div>
                <div className="pipe-card-sub" style={{ fontSize: 9.5, marginBottom: 10 }}>
                  {s.detail.split("→")[0].trim().slice(0, 28)}
                </div>
                <div className="pipe-card-state" style={{ fontSize: 9, padding: "3px 8px" }}>
                  <span className="sdot" />
                  <span className="state-label">pending</span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="pipe-canvas-footer">
          <div className="pipe-footer-left">
            <div className="pipe-footer-icon">
              <Users />
            </div>
            <div>
              <div className="pipe-footer-title" ref={footerTitleRef}>
                Register
              </div>
              <div className="pipe-footer-desc" ref={footerDescRef}>
                auth/register.html → POST /register
              </div>
            </div>
          </div>
          <div className="pipe-footer-right" ref={footerTagsRef}>
            <span className="pipe-tag">
              <span className="sdot" />
              step 01
            </span>
          </div>
        </div>

        <div className="pipe-nav" ref={navRef}>
          {Array.from({ length: 8 }).map((_, i) => (
            <button key={i} data-nav={i} aria-label={`Step ${i + 1}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
