import { Link } from "react-router-dom"

type ChromeProps = {
  count: number
  index: number
  labels: string[]
  accents: string[]
  ids: string[]
}

/**
 * Chapter chrome (prototype-faithful): back-link, trace rail with per-chapter
 * accents (click = smooth-scroll to the chapter), counter. NO prev/next
 * buttons — the page is scroll-driven.
 */
export function ChapterChrome({ count, index, labels, accents, ids }: ChromeProps) {
  return (
    <>
      {/* back to showcase */}
      <Link
        to="/"
        className="fixed left-6 top-5 z-30 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] text-dim transition-all duration-200 hover:border-primary/50 hover:text-text"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
          <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Showcase
      </Link>

      {/* counter */}
      <div aria-hidden className="fixed right-6 top-5 z-30 font-mono text-[11px] tabular-nums tracking-[0.18em] text-dim">
        <span className="text-text">{String(index + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
      </div>

      {/* trace rail — active tracks scroll; click smooth-scrolls (prototype .rail) */}
      <nav aria-label="Lifecycle chapters" className="fixed right-8 top-1/2 z-30 hidden -translate-y-1/2 md:block">
        <ul className="relative flex flex-col gap-[26px]">
          <span aria-hidden className="absolute left-[5px] top-[5px] bottom-[5px] w-px bg-border" />
          {Array.from({ length: count }).map((_, i) => {
            const active = i === index
            const accent = accents[i] ?? "#fbbf24"
            return (
              <li key={i}>
                <a
                  href={`#${ids[i]}`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(ids[i])?.scrollIntoView({ behavior: "smooth" })
                  }}
                  aria-label={`Chapter ${i + 1}: ${labels[i]}`}
                  aria-current={active ? "true" : undefined}
                  className="group relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-full mr-3 -translate-x-1.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.12em] text-dim opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
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
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* keyboard hint */}
      <div aria-hidden className="fixed bottom-6 left-6 z-30 hidden font-mono text-[10px] tracking-[0.14em] text-dim lg:block">
        SCROLL TO TRACE
      </div>

      {/* SR announcer */}
      <div aria-live="polite" className="sr-only">
        {`Stage ${index + 1} of ${count} — ${labels[index]}`}
      </div>
    </>
  )
}
