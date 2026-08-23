import { useEffect, useState } from "react"
import { ARTICLE_HEADINGS, type Heading } from "../../lib/docs-data"
import { useScrollTo } from "../../hooks/useScrollTo"
import { cn } from "../../lib/utils"

/** Right-rail mini-TOC from typed headings (not DOM scan). IO scrollspy; hidden < xl. */
export function TocRail() {
  const [activeId, setActiveId] = useState<string>(ARTICLE_HEADINGS[0]!.id)
  const scrollTo = useScrollTo()

  useEffect(() => {
    const targets = ARTICLE_HEADINGS.map((h) => document.getElementById(h.id)).filter(
      (el): el is HTMLElement => el !== null
    )
    if (targets.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: 0 }
    )
    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [])

  return (
    <aside aria-label="On this page" className="docs-toc-rail sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto xl:block">
      <b className="mb-3 block px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-dim">On this page</b>
      <ul className="space-y-0.5 border-l border-border/60">
        {ARTICLE_HEADINGS.filter((h: Heading) => h.level > 1).map((h) => (
          <li key={h.id}>
            <button
              type="button"
              onClick={() => scrollTo(`#${h.id}`)}
              data-toc-item={h.id}
              aria-current={activeId === h.id ? "true" : undefined}
              className={cn(
                "block w-full border-l-2 py-1 pr-2 text-left text-[12px] transition-colors",
                h.level === 2 ? "pl-3" : "pl-6",
                activeId === h.id
                  ? "-ml-px border-l-primary font-medium text-primary"
                  : "border-l-transparent text-dim hover:text-text"
              )}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
