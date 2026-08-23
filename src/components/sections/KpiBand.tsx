import { useCountUp } from "../../hooks/useCountUp"
import type { KpiItem } from "../../lib/kpi"

function KpiTile({ item }: { item: KpiItem }) {
  const { ref, value, done } = useCountUp(item.value)
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="flex flex-col gap-1 rounded-xl border border-border bg-white/[0.02] px-4 py-3">
      <dt className="text-[11px] tracking-widest text-dim uppercase">{item.label}</dt>
      <dd className="flex items-baseline gap-1.5">
        <b
          className="tabular-nums text-2xl font-extrabold tracking-tight text-text"
          aria-live={done ? "polite" : undefined}
          aria-label={`${item.label}: ${value}`}
        >
          {value.toLocaleString()}
        </b>
        <span className="text-[11px] font-mono text-dim">{item.hint}</span>
      </dd>
    </div>
  )
}

export function KpiBand({ items }: { items: KpiItem[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8" aria-label="Key performance indicators">
      {items.map((it) => (
        <KpiTile key={it.label} item={it} />
      ))}
    </dl>
  )
}
