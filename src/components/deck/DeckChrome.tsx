type ChromeProps = {
  count: number
  activeIndex: number
  labels: string[]
  onSelect: (index: number) => void
}

/**
 * Deck chrome (D30–D32, D35): dots rail + counter + polite live region.
 * z-30 max — Radix overlays (z-50) stay above. Hidden in fallback (activeIndex −1).
 * Light-mode AA handled by scoped overrides in index.css (dot-idle/dot-active/counter-current).
 */
export function DeckChrome({ count, activeIndex, labels, onSelect }: ChromeProps) {
  if (activeIndex < 0 || count === 0) return null
  const label = labels[Math.min(activeIndex, count - 1)] ?? ""

  return (
    <>
      {/* dots rail — nav + buttons, NOT a tablist (D31) */}
      <nav aria-label="Slides" className="deck-chrome fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col">
        <ul className="flex flex-col gap-2.5">
          {Array.from({ length: count }).map((_, i) => {
            const active = i === activeIndex
            const slideLabel = labels[i] ?? `Slide ${i + 1}`
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  aria-label={`Go to slide ${i + 1}: ${slideLabel}`}
                  aria-current={active ? "true" : undefined}
                  className="group relative flex h-11 w-11 items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-full"
                >
                  {/* tooltip — hover-capable pointers only */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-full mr-2 hidden whitespace-nowrap rounded-md border border-border bg-panel px-2 py-1 font-mono text-[10px] text-dim opacity-0 transition-opacity duration-150 group-hover:opacity-100 [@media(hover:hover)]:block"
                  >
                    {String(i + 1).padStart(2, "0")} · {slideLabel}
                  </span>
                  {/* visible dot — shape+color active signal (D31) */}
                  <span
                    aria-hidden
                    className={`dot block rounded-full transition-all duration-150 ${
                      active ? "dot-active h-6 w-2 bg-primary shadow-[0_0_12px_rgba(251,191,36,.45)]" : "dot-idle h-2 w-2 bg-border-strong group-hover:scale-125"
                    }`}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* counter — visible element aria-hidden (D32) */}
      <div aria-hidden className="deck-chrome fixed bottom-4 left-5 z-30 hidden lg:block font-mono text-[11px] tabular-nums tracking-[0.18em] text-dim">
        <span className="counter-current text-text">{String(activeIndex + 1).padStart(2, "0")}</span>
        <span> / {String(count).padStart(2, "0")}</span>
      </div>

      {/* the ONLY SR announcer — text written by useDeckNav (D32) */}
      <div id="deck-live-region" aria-live="polite" className="sr-only" />
      <span aria-hidden className="sr-only">
        {label}
      </span>
    </>
  )
}
