import { GW_NODES } from "../../lib/explorer-data"

export function ThrottleMap() {
  return (
    <div role="list" aria-label="Throttle map — 6 guarded surfaces" className="flex flex-wrap gap-2 rounded-xl border border-border bg-white/[0.02] p-3">
      {GW_NODES.map((n) => (
        <div key={n.label} role="listitem" className="flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1.5">
          <b className="font-mono text-xs font-bold text-text">{n.label}</b>
          <span className="text-xs text-dim">{n.note}</span>
        </div>
      ))}
    </div>
  )
}
