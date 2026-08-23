import { useState } from "react"
import { Search } from "lucide-react"
import { DocsSidebar } from "./docs-sidebar"
import { DocsArticle } from "./docs-article"
import { TocRail } from "./toc-rail"
import { CommandPalette } from "../palette/command-palette"

/** 3-pane shell: sidebar / article / toc. ≥1280 3-col, md 2-col, <lg single col w/ strip. */
export function DocsShell() {
  const [paletteOpen, setPaletteOpen] = useState(false)

  return (
    <>
      {/* keyboard-operable trigger — Enter + Space (G1 fix); no dead #docSearch binding (G2) */}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setPaletteOpen(true)
          }
        }}
        aria-label="Search documentation (Ctrl K)"
        className="fixed right-4 top-[4.5rem] z-30 inline-flex items-center gap-2 rounded-full border border-border bg-panel/90 px-3 py-1.5 text-[12px] text-dim shadow-sm transition-colors hover:border-primary/40 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary xl:hidden"
      >
        <Search className="h-3.5 w-3.5" aria-hidden />
        Search
        <kbd className="rounded bg-white/5 px-1 font-mono text-[10px]">Ctrl K</kbd>
      </button>

      <div
        id="docs-shell"
        className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-4 pt-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-6 xl:grid-cols-[260px_minmax(0,1fr)_230px]"
      >
        <div className="min-w-0 lg:border-b-0">
          <DocsSidebar />
        </div>
        <main className="min-w-0">
          <DocsArticle />
        </main>
        <TocRail />
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  )
}
