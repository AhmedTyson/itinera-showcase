import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"

type ChromeProps = {
  count: number
  index: number
  labels: string[]
  onSelect: (index: number) => void
  onPrev: () => void
  onNext: () => void
}

/** Chapter chrome: back-link, counter, progress, dots, prev/next (D30-analog for the lifecycle page). */
export function ChapterChrome({ count, index, labels, onSelect, onPrev, onNext }: ChromeProps) {
  const atStart = index === 0
  const atEnd = index === count - 1
  return (
    <>
      {/* back to showcase */}
      <Link
        to="/"
        className="fixed left-6 top-5 z-30 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] text-dim transition-all duration-200 hover:border-primary/50 hover:text-text"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> Showcase
      </Link>

      {/* counter */}
      <div aria-hidden className="fixed right-6 top-5 z-30 font-mono text-[11px] tabular-nums tracking-[0.18em] text-dim">
        <span className="text-text">{String(index + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
      </div>

      {/* progress + dots */}
      <div className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3">
        <div className="h-[3px] w-56 overflow-hidden rounded bg-border" aria-hidden>
          <div
            className="h-full rounded bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((index + 1) / count) * 100}%` }}
          />
        </div>
        <nav aria-label="Lifecycle chapters" className="flex items-center gap-1.5">
          {Array.from({ length: count }).map((_, i) => {
            const active = i === index
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                aria-label={`Chapter ${i + 1}: ${labels[i]}`}
                aria-current={active ? "true" : undefined}
                className={`group flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                  active ? "bg-primary/10" : "hover:bg-white/5"
                }`}
              >
                <span
                  aria-hidden
                  className={`block rounded-full transition-all duration-150 ${
                    active ? "h-2.5 w-2.5 bg-primary shadow-[0_0_10px_rgba(251,191,36,.5)]" : "h-1.5 w-1.5 bg-border-strong group-hover:scale-125"
                  }`}
                />
              </button>
            )
          })}
        </nav>
      </div>

      {/* prev / next — click-to-advance is the primary interaction */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={atStart}
          aria-label="Previous stage"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-border text-dim transition-all duration-200 hover:border-primary/50 hover:text-text active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={atEnd}
          className="group inline-flex h-11 cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl bg-emerald-500 pl-4 pr-4 text-[13px] font-bold text-[#02120b] shadow-[0_4px_18px_rgba(16,185,129,0.25)] transition-all duration-200 hover:shadow-[0_6px_26px_rgba(16,185,129,0.45)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30"
        >
          {atEnd ? "Back to start" : "Next stage"}
          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
        </button>
      </div>

      {/* keyboard hint — desktop only */}
      <div aria-hidden className="fixed bottom-6 left-6 z-30 hidden font-mono text-[10px] tracking-[0.14em] text-dim lg:block">
        ← → NAVIGATE
      </div>

      {/* SR announcer */}
      <div aria-live="polite" className="sr-only">
        {`Stage ${index + 1} of ${count} — ${labels[index]}`}
      </div>
    </>
  )
}
