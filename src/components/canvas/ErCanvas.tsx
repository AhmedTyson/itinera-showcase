import { useState, useRef } from "react"
import type { KeyboardEvent } from "react"
import { ER_NODES, ER_EDGES } from "../../lib/arch-layout"

type Props = {
  onInspect?: (entityKey: string) => void
}

export function ErCanvas({ onInspect }: Props) {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (e: KeyboardEvent, idx: number) => {
    let next = idx
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % ER_NODES.length
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + ER_NODES.length) % ER_NODES.length
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = ER_NODES.length - 1
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onInspect?.(ER_NODES[idx].entityKey)
      return
    } else return
    e.preventDefault()
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="group"
      aria-label="Data architecture — 12 entities, use arrow keys to navigate"
      className="relative h-auto md:h-[520px] rounded-xl border border-border bg-white/[0.02] p-2 md:p-0"
      id="erCanvas"
    >
      <svg className="absolute inset-0 -z-10 hidden md:block" aria-hidden="true" role="presentation">
        {ER_EDGES.map((edge, i) => {
          const from = ER_NODES.find((n) => n.id === edge.from)
          const to = ER_NODES.find((n) => n.id === edge.to)
          if (!from || !to) return null
          return (
            <line
              key={i}
              x1={`${from.x + 6}%`}
              y1={`${from.y + 5}%`}
              x2={`${to.x + 6}%`}
              y2={`${to.y + 5}%`}
              stroke="rgba(52,211,153,0.3)"
              strokeWidth={1.2}
              strokeDasharray="4 4"
            />
          )
        })}
      </svg>

      {ER_NODES.map((node, idx) => (
        <button
          key={node.id}
          ref={(el) => { refs.current[idx] = el }}
          tabIndex={idx === active ? 0 : -1}
          aria-selected={idx === active}
          aria-label={`Inspect entity ${node.entityKey}`}
          data-entity={node.entityKey}
          onClick={() => {
            setActive(idx)
            onInspect?.(node.entityKey)
          }}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onFocus={() => setActive(idx)}
          className={`group flex flex-col gap-1 rounded-lg border border-border bg-panel p-3 text-left shadow-sm transition-all hover:border-accent/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:absolute md:w-[150px] ${idx === active ? "ring-1 ring-accent/30" : ""} static w-full`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <span className="text-[10px] tracking-widest text-dim uppercase">{node.label}</span>
          <b className="text-sm font-semibold text-text">{node.title}</b>
          <ul className="mt-1 space-y-0.5 text-xs text-muted">
            {node.columns.slice(0, 3).map((col) => (
              <li key={col.name} className="flex gap-1">
                <span>{col.name}</span>
                {col.note && <em className="text-dim/70">{col.note}</em>}
              </li>
            ))}
          </ul>
        </button>
      ))}
    </div>
  )
}
