import { useState, useRef, useEffect } from "react"
import type { KeyboardEvent } from "react"
import { ARCH_NODES, ARCH_EDGES } from "../../lib/arch-layout"

type Props = {
  onInspect?: (archKey: string) => void
}

export function ArchCanvas({ onInspect }: Props) {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

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
    // ensure first node is tabbable
    refs.current[active]?.setAttribute("tabindex", "0")
  }, [active])

  return (
    <div
      role="group"
      aria-label="System design — 13 components, use arrow keys to navigate, Enter to inspect"
      className="relative h-auto md:h-[420px] rounded-xl border border-border bg-white/[0.02] p-2 md:p-0"
      id="archCanvas"
    >
      <svg className="absolute inset-0 -z-10 hidden md:block" aria-hidden="true" role="presentation">
        {ARCH_EDGES.map((edge, i) => {
          const from = ARCH_NODES.find((n) => n.id === edge.from)
          const to = ARCH_NODES.find((n) => n.id === edge.to)
          if (!from || !to) return null
          // center offset approx 6% x, 4% y for node 160x70
          return (
            <line
              key={i}
              x1={`${from.x + 6}%`}
              y1={`${from.y + 5}%`}
              x2={`${to.x + 6}%`}
              y2={`${to.y + 5}%`}
              stroke="rgba(251,191,36,0.35)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          )
        })}
      </svg>

      {ARCH_NODES.map((node, idx) => (
        <button
          key={node.id}
          ref={(el) => { refs.current[idx] = el }}
          role="button"
          tabIndex={idx === active ? 0 : -1}
          aria-selected={idx === active}
          aria-label={`Inspect component ${node.archKey}`}
          data-arch={node.archKey}
          onClick={() => {
            setActive(idx)
            onInspect?.(node.archKey)
          }}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onFocus={() => setActive(idx)}
          className={`group absolute flex flex-col gap-1 rounded-lg border bg-panel p-3 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:w-[160px] ${
            node.tone === "primary" ? "border-primary/30" : node.tone === "accent" ? "border-accent/30" : node.tone === "warn" ? "border-warn/30" : "border-border"
          } ${idx === active ? "ring-1 ring-primary/30" : ""} static md:absolute w-full md:w-[160px]`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <span className="text-[10px] tracking-widest text-dim uppercase">{node.label}</span>
          <b className="text-sm font-semibold leading-tight text-text">{node.title}</b>
          <small className="text-xs text-muted">{node.sub}</small>
        </button>
      ))}
    </div>
  )
}
