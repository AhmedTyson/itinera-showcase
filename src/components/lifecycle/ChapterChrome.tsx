import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"

type ChromeProps = {
  count: number
  index: number
  labels: string[]
  accents: string[]
  onSelect: (index: number) => void
  onPrev: () => void
  onNext: () => void
}

/**
 * Chapter chrome (Trace grammar): back-link, right rail with per-chapter
 * accent dots + hover labels + connecting line, counter, prev/next.
 * Progress edge lives in the page (full-width accent line).
 */
export function ChapterChrome({ count, index, labels, accents, onSelect, onPrev, onNext }: ChromeProps) {
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

      {/* trace rail — right side, connecting line, accent per chapter (prototype .rail) */}
      <nav aria-label="Lifecycle chapters" className="fixed right-8 top-1/2 z-30 hidden -translate-y-1/2 md:block">
        <ul className="relative flex flex-col gap-[26px]">
          <span aria-hidden className="absolute left-[5px] top-[5px] bottom-[5px] w-px bg-border" />
          {Array.from({ length: count }).map((_, i) => {
            const active = i === index
            const accent = accents[i] ?? "#fbbf24"
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  aria-label={`Chapter ${i + 1}: ${labels[i]}`}
                  aria-current={active ? "true" : undefined}
                  className="group relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  {/* hover label — slides in from the left of the dot */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-full mr-3 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.12em] text-dim opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1.5"
                  >
                    {labels[i]}
                  </span>
                  <span
                    aria-hidden
                    className="block h-[11px] w-[11px] rounded-full border transition-all duration-300"
                    style={
                      active
                        ? { background: accent, borderColor: accent, boxShadow: `0 0 0 4px ${accent}33` }
                        : { background: "#161C26", borderColor: "#232B38" }
                    }
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

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

      {/* keyboard hint */}
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
