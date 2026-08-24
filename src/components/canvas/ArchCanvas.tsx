import { useState, useRef, useEffect } from "react"
import type { KeyboardEvent } from "react"
import gsap from "gsap"
import { ARCH_NODES, ARCH_EDGES } from "../../lib/arch-layout"

type Props = {
  onInspect?: (archKey: string) => void
}

const NODE_W = 160
const NODE_H = 80

type Pt = { x: number; y: number }
type Route = { d: string; vias: Pt[] }

/** PCB-style orthogonal routing: H → 45° bend → H (fallback: H→V→H). */
function route(a: { x: number; y: number }, b: { x: number; y: number }, w: number, h: number): Route {
  const acx = (w * a.x) / 100
  const acy = (h * a.y) / 100
  const bcx = (w * b.x) / 100
  const bcy = (h * b.y) / 100

  if (Math.abs(bcx - acx) >= NODE_W * 0.6) {
    // horizontal neighbors — exit/enter on facing side edges
    const ay = acy + NODE_H / 2
    const by = bcy + NODE_H / 2
    const ax = bcx > acx ? acx + NODE_W : acx
    const bx = bcx > acx ? bcx : bcx + NODE_W
    const ady = Math.abs(by - ay)
    const mid = (ax + bx) / 2
    if (ady < 6) return { d: `M ${ax} ${ay} L ${bx} ${by}`, vias: [] }
    if (ady <= (bx - ax) - 8) {
      return {
        d: `M ${ax} ${ay} L ${mid - ady / 2} ${ay} L ${mid + ady / 2} ${by} L ${bx} ${by}`,
        vias: [{ x: mid - ady / 2, y: ay }, { x: mid + ady / 2, y: by }],
      }
    }
    return { d: `M ${ax} ${ay} L ${mid} ${ay} L ${mid} ${by} L ${bx} ${by}`, vias: [{ x: mid, y: ay }, { x: mid, y: by }] }
  }

  // vertical neighbors — exit/enter on top/bottom edges
  const cx = acx + NODE_W / 2
  const cx2 = bcx + NODE_W / 2
  const ay = bcy > acy ? acy + NODE_H : acy
  const by = bcy > acy ? bcy : bcy + NODE_H
  const adx = Math.abs(cx2 - cx)
  const midY = (ay + by) / 2
  if (adx < 6) return { d: `M ${cx} ${ay} L ${cx2} ${by}`, vias: [] }
  if (adx <= Math.abs(by - ay) - 8) {
    return {
      d: `M ${cx} ${ay} L ${cx} ${midY - adx / 2} L ${cx2} ${midY + adx / 2} L ${cx2} ${by}`,
      vias: [{ x: cx, y: midY - adx / 2 }, { x: cx2, y: midY + adx / 2 }],
    }
  }
  return { d: `M ${cx} ${ay} L ${cx} ${midY} L ${cx2} ${midY} L ${cx2} ${by}`, vias: [{ x: cx, y: midY }, { x: cx2, y: midY }] }
}

export function ArchCanvas({ onInspect }: Props) {
  const [active, setActive] = useState(0)
  const [dim, setDim] = useState({ w: 0, h: 0 })
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)

  // px-accurate canvas measurement for SVG path routing — seed synchronously, RO tracks resizes
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => setDim({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // draw-in on first view — traces trace themselves, blocks fade up
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true })
      tl.fromTo(
        ".arch-trace-base",
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.9, stagger: 0.06, ease: "power2.out" },
      ).fromTo(
        ".arch-node",
        { y: 10, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.045, ease: "power2.out" },
        "-=0.55",
      )
      tl.play(0.15)
    }, el)
    return () => ctx.revert()
  }, [])

  const handleKeyDown = (e: KeyboardEvent, idx: number) => {
    let next = idx
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % ARCH_NODES.length
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + ARCH_NODES.length) % ARCH_NODES.length
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = ARCH_NODES.length - 1
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onInspect?.(ARCH_NODES[idx].archKey)
      return
    } else return
    e.preventDefault()
    setActive(next)
    refs.current[next]?.focus()
  }

  useEffect(() => {
    refs.current[active]?.setAttribute("tabindex", "0")
  }, [active])

  return (
    <div>
      {/* schematic header strip — same grammar as the telemetry band */}
      <div
        className="mb-3 flex items-center justify-between rounded-lg px-4 py-2"
        style={{ background: "var(--bp-stub-bg)", border: "1px solid var(--bp-border)" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--bp-text-dim)" }}>
          System Schematic
        </span>
        <span
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--bp-text-white)" }}
        >
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          {ARCH_NODES.length} blocks · select to trace
        </span>
      </div>

      <div
        ref={wrapRef}
        role="group"
        aria-label={`System schematic — ${ARCH_NODES.length} blocks, use arrow keys to navigate, Enter to inspect`}
        className="substrate relative h-auto rounded-xl border p-2 md:h-[440px] md:p-0"
        style={{ borderColor: "var(--bp-border)" }}
        id="archCanvas"
      >
        {/* routed interconnects */}
        {dim.w > 0 && (
          <svg className="absolute inset-0 -z-0 hidden md:block" aria-hidden="true" role="presentation">
            <defs>
              <linearGradient id="traceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(251,191,36,0.15)" />
                <stop offset="50%" stopColor="rgba(251,191,36,0.55)" />
                <stop offset="100%" stopColor="rgba(251,191,36,0.15)" />
              </linearGradient>
            </defs>
            {ARCH_EDGES.map((edge, i) => {
              const from = ARCH_NODES.find((n) => n.id === edge.from)
              const to = ARCH_NODES.find((n) => n.id === edge.to)
              if (!from || !to) return null
              const { d, vias } = route(from, to, dim.w, dim.h)
              return (
                <g key={i}>
                  {/* visible by default — GSAP applies the from-state for the draw-in */}
                  <path
                    className="arch-trace-base"
                    d={d}
                    fill="none"
                    stroke="url(#traceGrad)"
                    strokeWidth={1.5}
                    pathLength={1}
                    strokeDasharray={1}
                  />
                  <path className="trace-flow" d={d} fill="none" stroke="#fcd34d" strokeWidth={1.2} opacity={0.85} />
                  {vias.map((v, j) => (
                    <circle key={j} cx={v.x} cy={v.y} r={2.5} fill="#0a0d16" stroke="rgba(251,191,36,0.6)" strokeWidth={1} />
                  ))}
                </g>
              )
            })}
          </svg>
        )}

        {ARCH_NODES.map((node, idx) => (
          <button
            key={node.id}
            ref={(el) => { refs.current[idx] = el }}
            role="button"
            tabIndex={idx === active ? 0 : -1}
            aria-selected={idx === active}
            aria-label={`Inspect block ${node.archKey}`}
            data-arch={node.archKey}
            onClick={() => {
              setActive(idx)
              onInspect?.(node.archKey)
            }}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onFocus={() => setActive(idx)}
            className={`arch-node group relative flex flex-col gap-1 rounded-lg border bg-panel p-3 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary static w-full md:absolute md:w-[160px] ${
              node.tone === "primary" ? "border-primary/30" : node.tone === "accent" ? "border-accent/30" : node.tone === "warn" ? "border-warn/30" : "border-border"
            } ${idx === active ? "!border-[#fbbf24]/60 shadow-[0_0_18px_rgba(251,191,36,0.15)]" : ""}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            {/* status LED */}
            <span aria-hidden className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            {idx === active && (
              <span className="absolute -top-2.5 left-3 rounded-full border border-[#fbbf24]/50 bg-bg-0 px-2 py-0.5 font-mono text-[8.5px] tracking-[0.18em] text-[#fbbf24]">
                ● TRACING
              </span>
            )}
            <span className="text-[10px] tracking-widest text-dim uppercase">{node.label}</span>
            <b className="text-sm font-semibold leading-tight text-text">{node.title}</b>
            <small className="text-xs text-muted">{node.sub}</small>
          </button>
        ))}
      </div>
    </div>
  )
}
