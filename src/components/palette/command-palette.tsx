import { useEffect, useMemo, useRef, useState } from "react"
import { Search, CornerDownLeft } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { ARTICLE_HEADINGS, ENDPOINTS, type Meth } from "../../lib/docs-data"
import { MethodChip } from "../ui/method-chip"
import { rank } from "../../lib/fuzzy"
import { cn } from "../../lib/utils"

export type PaletteEntry =
  | { type: "heading"; id: string; label: string; sub: string }
  | { type: "endpoint"; id: string; label: string; sub: string; meth: Meth }
  | { type: "guide"; id: string; label: string; sub: string }

const BASE_INDEX: PaletteEntry[] = [
  ...ARTICLE_HEADINGS.map((h) => ({ type: "heading" as const, id: h.id, label: h.text, sub: "Section" })),
  ...ENDPOINTS.map((e) => ({ type: "endpoint" as const, id: e.id, label: `${e.meth} ${e.path}`, sub: "Endpoint", meth: e.meth })),
]

type Props = {
  open: boolean
  onOpenChange(open: boolean): void
  entries?: PaletteEntry[]
}

/** Ctrl/Cmd+K global + trigger keyboard fix (G1/G2). Fuzzy over typed index — no DOM scraping. */
export function CommandPalette({ open, onOpenChange, entries }: Props) {
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const index = useMemo(() => (entries?.length ? [...entries, ...BASE_INDEX] : BASE_INDEX), [entries])
  const results = useMemo(() => rank(query, index, (e) => `${e.label} ${e.sub}`), [query, index])

  useEffect(() => setActive(0), [query])
  useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  // Global shortcut — works regardless of focus target
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
        ev.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  const jump = (entry: PaletteEntry) => {
    if (entry.type === "guide") {
      onOpenChange(false)
      history.pushState(null, "", `/wiki/${entry.id}`)
      window.dispatchEvent(new PopStateEvent("popstate"))
      return
    }
    onOpenChange(false)
    requestAnimationFrame(() => {
      document.getElementById(entry.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  const onKeyDown = (ev: React.KeyboardEvent) => {
    if (ev.key === "ArrowDown") {
      ev.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (ev.key === "Enter" && results[active]) {
      ev.preventDefault()
      jump(results[active].item)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-[14vh] z-50 w-full max-w-xl -translate-x-1/2 rounded-xl border border-border bg-panel shadow-lg focus:outline-none"
          onKeyDown={onKeyDown}
          aria-label="Search endpoints and sections"
        >
          <Dialog.Title className="sr-only">Search documentation</Dialog.Title>
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="h-4 w-4 shrink-0 text-dim" aria-hidden />
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search endpoints & sections…"
              aria-label="Search endpoints and sections"
              className="w-full bg-transparent py-3.5 text-sm text-text outline-none placeholder:text-dim"
            />
          </div>
          <div ref={listRef} role="listbox" aria-label="Results" className="max-h-[46vh] overflow-y-auto p-2">
            {results.length === 0 && <p className="px-3 py-6 text-center text-sm text-dim">No matches for “{query}”.</p>}
            {results.map(({ item }, i) => (
              <button
                key={`${item.type}:${item.id}`}
                type="button"
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => jump(item)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm",
                  i === active ? "bg-primary/10 text-text" : "text-muted"
                )}
              >
                {item.type === "endpoint" ? (
                  <MethodChip meth={item.meth} />
                ) : item.type === "guide" ? (
                  <span className="inline-flex h-[18px] w-[38px] shrink-0 items-center justify-center rounded bg-primary/15 font-mono text-[9px] uppercase tracking-wider text-primary">
                    wiki
                  </span>
                ) : (
                  <span className="inline-flex h-[18px] w-[38px] shrink-0 items-center justify-center rounded bg-white/5 font-mono text-[9px] uppercase tracking-wider text-dim">
                    §
                  </span>
                )}
                <span className="truncate font-mono text-[12.5px]">{item.type === "endpoint" ? item.label : item.label}</span>
                <span className="ml-auto shrink-0 text-[11px] text-dim">{item.sub}</span>
                {i === active && <CornerDownLeft className="h-3 w-3 shrink-0 text-dim" aria-hidden />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-dim">
            <span><kbd className="rounded bg-white/5 px-1">↑↓</kbd> navigate</span>
            <span><kbd className="rounded bg-white/5 px-1">↵</kbd> jump</span>
            <span><kbd className="rounded bg-white/5 px-1">esc</kbd> close</span>
            <span role="status" aria-live="polite" className="ml-auto tabular-nums">
              {results.length} result{results.length === 1 ? "" : "s"}
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
