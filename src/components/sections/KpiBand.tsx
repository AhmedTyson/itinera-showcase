import { useCountUp } from "../../hooks/useCountUp"
import type { KpiItem } from "../../lib/kpi"

function KpiTile({ item, big }: { item: KpiItem; big: boolean }) {
  const { ref, value, done } = useCountUp(item.value)
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="kpi-tile relative overflow-hidden rounded-lg"
      style={{ background: "var(--bp-bg)", border: "1px solid var(--bp-border)" }}
    >
      {/* perforation edge — stub divider motif from the boarding pass */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-[34px] border-l border-dashed"
        style={{ borderColor: "var(--bp-dashed)" }}
      />
      <span aria-hidden className="bp-notch" style={{ left: "27px", top: "-9px" }} />
      <span aria-hidden className="bp-notch" style={{ left: "27px", bottom: "-9px" }} />

      <div className={`flex h-full flex-col justify-between gap-1.5 py-3 pl-12 pr-3.5 ${big ? "py-5" : ""}`}>
        <dt
          className="text-[10px] font-medium uppercase leading-tight tracking-[0.14em]"
          style={{ color: "var(--bp-text-dim)" }}
        >
          {item.label}
        </dt>
        <dd>
          <b
            className={`block font-extrabold tabular-nums tracking-tight ${big ? "text-4xl xl:text-5xl" : "text-2xl"}`}
            style={{ color: item.gold ? "#fbbf24" : "var(--bp-text-white)" }}
            aria-live={done ? "polite" : undefined}
            aria-label={`${item.label}: ${value}`}
          >
            {value.toLocaleString()}
          </b>
          <span className="mt-1 flex flex-col items-start gap-y-1 sm:flex-row sm:items-center sm:justify-between sm:gap-y-0 lg:flex-col lg:items-start lg:gap-y-1">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-emerald-500">
              <span aria-hidden className="h-1 w-1 rounded-full bg-emerald-400" />
              {item.status}
            </span>
            <span className="truncate font-mono text-[9px]" style={{ color: "var(--bp-text-dim)" }}>
              {item.hint}
            </span>
          </span>
        </dd>
      </div>
    </div>
  )
}

/**
 * KPI band (D28): "band" = today's 8-across strip; "slide" = deck variant,
 * 2×4 grid with text-4xl/5xl numerals and a demoted kicker row.
 */
export function KpiBand({ items, variant = "band" }: { items: KpiItem[]; variant?: "band" | "slide" }) {
  if (variant === "slide") {
    return (
      <div aria-label="Key performance indicators">
        <div className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-dim">
          <span aria-hidden className="h-px w-8 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--bp-text-dim)" }}>
            live from the reconciled codebase
          </span>
          <span
            className="ml-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "var(--bp-text-white)" }}
          >
            <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            reconciled
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((it) => (
            <KpiTile key={it.label} item={it} big />
          ))}
        </dl>
      </div>
    )
  }

  return (
    <div aria-label="Key performance indicators">
      {/* telemetry strip header */}
      <div
        className="mb-3 flex items-center justify-between rounded-lg px-4 py-2"
        style={{ background: "var(--bp-stub-bg)", border: "1px solid var(--bp-border)" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--bp-text-dim)" }}>
          Operations Telemetry
        </span>
        <span
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--bp-text-white)" }}
        >
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Reconciled 106 / 106 · live
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {items.map((it) => (
          <KpiTile key={it.label} item={it} big={false} />
        ))}
      </dl>
    </div>
  )
}
