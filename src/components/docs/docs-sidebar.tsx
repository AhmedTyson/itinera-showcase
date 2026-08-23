import { useEffect, useState } from "react"
import { SIDEBAR_GROUPS } from "../../lib/docs-data"
import { useScrollTo } from "../../hooks/useScrollTo"
import { cn } from "../../lib/utils"

/** Sticky tree ≥lg; horizontal scrollable strip <lg (legacy collapse parity). */
export function DocsSidebar() {
  const scrollTo = useScrollTo()
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  return (
    <nav aria-label="Documentation navigation" className="docs-side-nav">
      {/* ≥lg vertical tree */}
      <div className="sticky top-24 hidden max-h-[calc(100vh-7rem)] space-y-6 overflow-y-auto pr-2 lg:block">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-dim">{group.title}</h3>
            <ul className="space-y-0.5">
              {group.links.map((link) => (
                <li key={link.href + link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-md px-2 py-1.5 text-[13px] text-muted transition-colors hover:bg-white/5 hover:text-text"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setHash(link.href)
                        scrollTo(link.href)
                      }}
                      aria-current={hash === link.href ? "true" : undefined}
                      className={cn(
                        "block w-full rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-white/5 hover:text-text",
                        hash === link.href ? "bg-primary/10 font-medium text-primary" : "text-muted"
                      )}
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* <lg horizontal strip */}
      <div className="-mx-4 flex gap-1.5 overflow-x-auto border-b border-border/60 px-4 pb-3 pt-1 lg:hidden" aria-hidden={false}>
        {SIDEBAR_GROUPS.flatMap((g) => g.links)
          .filter((l) => !l.external)
          .map((link) => (
            <button
              key={link.href + link.label}
              type="button"
              onClick={() => scrollTo(link.href)}
              className="shrink-0 rounded-full border border-border px-3 py-1.5 text-[12px] text-muted hover:border-primary/40 hover:text-text"
            >
              {link.label}
            </button>
          ))}
      </div>
    </nav>
  )
}
