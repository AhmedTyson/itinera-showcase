import { useEffect, useRef, useState } from "react"
import { Container, HeartPulse, Rocket, FlaskConical, Copy, RotateCcw, Check } from "lucide-react"
import { gsap } from "../../lib/gsap"
import { DEPLOY_STEPS, TEST_ROWS } from "../../lib/home-content"

const ICONS = {
  container: Container,
  "heart-pulse": HeartPulse,
  rocket: Rocket,
  flask: FlaskConical,
} as const

type Line = { kind: "cmd" | "out"; text: string }
const TERMINAL_LINES: Line[] = [
  { kind: "cmd", text: "php artisan test --compact" },
  { kind: "out", text: "→ Verification (8 files) · Green 8/8" },
  { kind: "out", text: "→ ReportTest · Green — PDF/XLSX defaults" },
  { kind: "out", text: "→ Checkout & Webhook · Green — HMAC + idempotent" },
  { kind: "out", text: "→ AiQuotaCacheHitTest · Green — cache-before-quota" },
  { kind: "out", text: "→ WeatherThrottle · Green — 429 envelope" },
  { kind: "out", text: "→ Total · 55 passing (53 feature · 2 unit) ✓" },
]

const P0 = { x: 0, y: 110 }
const PC = { x: 500, y: 40 }
const P1 = { x: 1000, y: 110 }

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

// arc-length equal spacing: t for 0%, 33.3%, 66.6%, 100% of curve length (not parametric t)
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
const STAGE_T = [0, 1 / 3, 2 / 3, 1].map(tForArcFraction)
const WP_POS = STAGE_T.map((t) => bezierPoint(t))

const STAGE_COPY = [
  { title: "Docker multi-stage build", desc: 'A lean multi-stage <code>Dockerfile</code> separates build tooling from the runtime image, keeping the shipped container small and reproducible across environments.', tags: ["multi-stage", "shipped"] },
  { title: "Runtime supervision", desc: '<code>entrypoint.sh</code> hands control to a supervisor process that restarts workers on crash and keeps the container self-healing under load.', tags: ["supervisor", "shipped"] },
  { title: "Railway delivery", desc: 'A single <code>railway.json</code> config drives one-command delivery — build, push, and release without hand-written deploy scripts.', tags: ["one-command", "shipped"] },
  { title: "Seeded realism", desc: '<code>migrate:fresh --seed</code> loads 60+ paid orders/payments plus mapped catalog fixtures for demos.', tags: ["60+ orders fixtures", "shipped"] },
]

const TEST_ICONS = [Check, Container, HeartPulse, Rocket, FlaskConical, Check] as const

export function PipelineTerminal() {
  const [active, setActive] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [chars, setChars] = useState(0)
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

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

  // typewriter for verification terminal
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRunning(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const line = TERMINAL_LINES[progress]
  const done = progress >= TERMINAL_LINES.length
  useEffect(() => {
    if (!running || done || !line) return
    const speed = line.kind === "cmd" ? 22 : 9
    const t = setTimeout(() => {
      if (chars < line.text.length) setChars((c) => c + 1)
      else {
        setProgress((p) => p + 1)
        setChars(0)
      }
    }, speed)
    return () => clearTimeout(t)
  }, [running, chars, progress, line, done])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" })
  }, [progress, chars])

  const replay = () => {
    setProgress(0)
    setChars(0)
    setRunning(true)
  }
  const copy = () => {
    const text = TERMINAL_LINES.map((l) => (l.kind === "cmd" ? `$ ${l.text}` : l.text)).join("\n")
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    })
  }
  const visible = TERMINAL_LINES.slice(0, progress + (done ? 0 : 1))

  // flight path helpers
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
    const isWrapRestart = active === 3 && i === 0
    setActive(i)
    if (readoutRef.current) readoutRef.current.textContent = "0" + (i + 1)
    // nav dots
    if (navRef.current) {
      navRef.current.querySelectorAll("button").forEach((b, idx) => b.classList.toggle("on", idx === i))
    }
    // cards state
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
    const progPct = i / 3
    const targetT = STAGE_T[i]
    if (isWrapRestart) {
      // infinite loop: teleport to start without backwards fly
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
    // footer
    const copy = STAGE_COPY[i]
    if (footerTitleRef.current && footerDescRef.current && footerTagsRef.current) {
      gsap.to([footerTitleRef.current, footerDescRef.current, footerTagsRef.current], {
        opacity: 0, y: -4, duration: 0.15, ease: "power1.in",
        onComplete() {
          if (footerTitleRef.current) footerTitleRef.current.textContent = copy.title
          if (footerDescRef.current) footerDescRef.current.innerHTML = copy.desc
          if (footerTagsRef.current) footerTagsRef.current.innerHTML = copy.tags.map((t) => `<span class="pipe-tag"><span class="sdot"></span>${t}</span>`).join("")
          gsap.fromTo([footerTitleRef.current, footerDescRef.current, footerTagsRef.current], { opacity: 0, y: 6 } as any, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.03 } as any)
        },
      })
    }
  }

  // init
  useEffect(() => {
    // initial plane placement
    const startPos = bezierPoint(0)
    const startAngle = bezierAngle(0)
    if (planeRef.current) gsap.set(planeRef.current, { x: startPos.x, y: startPos.y, rotation: startAngle, svgOrigin: `${startPos.x} ${startPos.y}` } as any)
    // stagger cards entrance
    if (cardsRef.current) {
      const cards = Array.from(cardsRef.current.querySelectorAll(".pipe-card"))
      gsap.set(cards, { opacity: 0, y: 16 } as any)
      gsap.to(cards, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08, delay: 0.15 } as any)
    }
    // autoplay tick
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
      cursor = (cursor + 1) % 4
      setTimeout(tick, cursor === 0 ? 3000 : 1900)
    }
    const t = setTimeout(tick, 700)
    return () => {
      clearTimeout(t)
      navRef.current?.removeEventListener("click", onNavClick)
      if (breathTween.current) breathTween.current.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={rootRef} className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-lg px-4 py-2.5" style={{ background: "var(--bp-stub-bg)", border: "1px solid var(--bp-border)" }}>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--bp-text-dim)" }}>
          Pipeline · 4 stages · Railway
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--bp-text-white)" }}>
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          ship · verify · repeat
        </span>
      </div>

      <div className="pipe-canvas">
        <div className="pipe-flight-zone">
          <div className="pipe-altitude-label">
            <span className="blip" />
            IN FLIGHT
          </div>
          <div className="pipe-altitude-readout">
            STAGE <span className="val" ref={readoutRef}>
              01
            </span>{" "}
            / 04
          </div>

          <svg className="pipe-flight-svg" viewBox="0 0 1000 168" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="routeGlow" x="-30%" y="-300%" width="160%" height="700%">
                <feGaussianBlur stdDeviation="2.6" result="b" />
                <feComposite in="SourceGraphic" in2="b" operator="over" />
              </filter>
              <filter id="planeGlow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="4.5" result="b" />
                <feComposite in="SourceGraphic" in2="b" operator="over" />
              </filter>
            </defs>

            {/* graticule — subtle map latitude arcs */}
            <g fill="none" stroke="rgba(148,160,190,0.09)" strokeWidth="1" strokeDasharray="6 10" opacity="0.9">
              <path d="M 0 150 Q 500 90 1000 150" />
              <path d="M 0 165 Q 500 120 1000 165" />
              <path d="M 0 135 Q 500 82 1000 135" opacity="0.45" />
            </g>

            {/* waypoint drop lines — hidden <900px via CSS, x aligned to arc-length equal points */}
            <g className="pipe-drop-lines" stroke="rgba(148,160,190,0.10)" strokeWidth="1" strokeDasharray="3 6">
              {WP_POS.map((p, idx) => (
                <line key={idx} x1={p.x} y1={idx === 0 || idx === 3 ? 38 : 18} x2={p.x} y2={168} />
              ))}
            </g>

            {/* base rail — refined with inner highlight */}
            <path d="M 0 110 Q 500 40 1000 110" fill="none" stroke="rgba(15,23,42,0.6)" strokeWidth="3.2" strokeLinecap="round" opacity="0.35" />
            <path d="M 0 110 Q 500 40 1000 110" fill="none" stroke="rgba(148,160,190,0.18)" strokeWidth="2" strokeLinecap="round" />
            <path
              ref={flownRef}
              d="M 0 110 Q 500 40 1000 110"
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="2.6"
              strokeLinecap="round"
              filter="url(#routeGlow)"
              strokeDasharray={RAIL_LEN}
              strokeDashoffset={RAIL_LEN}
            />
            <path
              ref={contrailRef}
              d="M 0 110 Q 500 40 1000 110"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={0}
              strokeDasharray="70 990"
              strokeDashoffset={RAIL_LEN}
            />

            {/* waypoints — double-ring modern, arc-length equal */}
            {WP_POS.map((p, idx) => (
              <g key={idx} id={`wp-${idx}`}>
                <circle cx={p.x} cy={p.y} r="7" fill="none" stroke="rgba(148,160,190,0.18)" strokeWidth="1.2" />
                <circle cx={p.x} cy={p.y} r="3.2" fill="rgba(148,160,190,0.38)" />
                <circle cx={p.x} cy={p.y} r="1.1" fill="#fff" opacity="0.9" />
              </g>
            ))}

            <g ref={planeRef} id="plane">
              <g className="plane-glow-wrap" filter="url(#planeGlow)">
                <path d="M -10 0 L 9 -4.2 L 15 0 L 9 4.2 Z" fill="#fbbf24" />
                <path d="M -3 0 L -10 -7 L -6.5 0 L -10 7 Z" fill="#fbbf24" opacity="0.85" />
              </g>
              <path d="M -10 0 L 9 -4.2 L 15 0 L 9 4.2 Z" fill="#fffbeb" />
              <circle cx="-1" cy="0" r="1.3" fill="#f59e0b" />
            </g>
          </svg>
        </div>

        <div className="pipe-cards" ref={cardsRef}>
          {DEPLOY_STEPS.map((s, i) => {
            const Icon = ICONS[s.icon ?? "container"]
            return (
              <button key={s.title} type="button" className="pipe-card" data-i={i} onClick={() => goToStage(i)} aria-label={`${s.title} — ${s.detail}`}>
                <div className="card-edge">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path className="edge-path" d="M 1,13 Q 1,1 13,1 H 87 Q 99,1 99,13 V 87 Q 99,99 87,99 H 13 Q 1,99 1,87 Z" pathLength={100} />
                  </svg>
                </div>
                <div className="scanfield" />
                <div className="pipe-waypoint-code">WP-0{i + 1}</div>
                <div className="pipe-icon-badge">
                  <Icon />
                </div>
                <div className="pipe-card-title">{s.title}</div>
                <div className="pipe-card-sub">{s.meta}</div>
                <div className="pipe-card-state">
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
              <FlaskConical />
            </div>
            <div>
              <div className="pipe-footer-title" ref={footerTitleRef}>
                Docker multi-stage build
              </div>
              <div className="pipe-footer-desc" ref={footerDescRef} dangerouslySetInnerHTML={{ __html: STAGE_COPY[0].desc }} />
            </div>
          </div>
          <div className="pipe-footer-right" ref={footerTagsRef}>
            <span className="pipe-tag">
              <span className="sdot" />
              pending
            </span>
          </div>
        </div>

        <div className="pipe-nav" ref={navRef}>
          <button data-nav="0" aria-label="Stage 1" />
          <button data-nav="1" aria-label="Stage 2" />
          <button data-nav="2" aria-label="Stage 3" />
          <button data-nav="3" aria-label="Stage 4" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-[#0c1322] shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 bg-white/[0.03] px-3 py-2.5">
          <span className="flex items-center gap-2">
            <span aria-hidden className="flex gap-1">
              <i className="h-2 w-2 rounded-full bg-rose-500/70" />
              <i className="h-2 w-2 rounded-full bg-amber-500/70" />
              <i className="h-2 w-2 rounded-full bg-emerald-500/70" />
            </span>
            <span className="font-mono text-[11px] tracking-wide text-dim">verification@railway — php artisan test</span>
            <span className="hidden rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-emerald-400 sm:inline">6 suites · 55 passing</span>
          </span>
          <span className="flex items-center gap-1">
            <button type="button" onClick={copy} aria-label="Copy log" className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/20 px-2 py-1 font-mono text-[10px] text-dim hover:border-emerald-500/30 hover:text-emerald-300">
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />} {copied ? "Copied" : "Copy"}
            </button>
            <button type="button" onClick={replay} aria-label="Replay" className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/20 px-2 py-1 font-mono text-[10px] text-dim hover:border-primary/30 hover:text-text">
              <RotateCcw className="h-3 w-3" /> replay
            </button>
          </span>
        </div>

        <div ref={bodyRef} className="border-b border-white/5 bg-black/15 px-3 py-2 font-mono text-[11px] leading-relaxed" role="log" aria-live="polite">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {visible.map((l, i) =>
              i < progress ? (
                <span key={i} className={l.kind === "cmd" ? "text-sky-300" : "text-emerald-300"}>
                  {l.kind === "cmd" ? `$ ${l.text}` : l.text}
                </span>
              ) : (
                <span key={i} className={l.kind === "cmd" ? "text-sky-300" : "text-emerald-300"}>
                  {l.kind === "cmd" ? `$ ${l.text.slice(0, chars)}` : l.text.slice(0, chars)}
                  <span aria-hidden className="animate-pulse text-dim">
                    ▌
                  </span>
                </span>
              ),
            )}
          </div>
          {done && <span className="mt-1 inline-flex rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">● all suites nominal</span>}
        </div>

        <div className="bg-[#070c18] p-3 sm:p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TEST_ROWS.map((row, idx) => {
              const Icon = TEST_ICONS[idx % TEST_ICONS.length]
              const isVerification = row.suite.includes("Verification")
              const isTotal = row.suite === "Total"
              const span = isVerification ? "sm:col-span-2 lg:col-span-2" : isTotal ? "sm:col-span-2 lg:col-span-3" : ""
              return (
                <div
                  key={row.suite}
                  className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white/[0.02] p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 ${isTotal ? "border-emerald-500/30 bg-emerald-500/[0.06] sm:col-span-2 lg:col-span-3" : isVerification ? "border-primary/20 bg-primary/[0.04] sm:col-span-2 lg:col-span-2" : "border-border/60 hover:bg-white/[0.04]"} ${span}`}
                >
                  <span aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 ${isTotal ? "via-emerald-500/40" : isVerification ? "via-primary/30" : "via-primary/20"}`} />
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${isTotal ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400" : isVerification ? "border-primary/30 bg-primary/10 text-primary" : "border-white/5 bg-black/20 text-dim group-hover:border-primary/20 group-hover:text-primary"}`}>
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold tabular-nums ${isTotal ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"}`}>{row.status}</span>
                  </div>
                  <b className={`mt-3 block text-[12.5px] leading-tight ${isTotal ? "text-emerald-300" : "text-text"}`}>{row.suite}</b>
                  <span className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted">{row.covers}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/5 pt-3">
            {["php artisan test", "--filter=ReportTest", "--filter=Verification"].map((chip) => (
              <code key={chip} className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 font-mono text-[10.5px] text-dim">
                {chip}
              </code>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
