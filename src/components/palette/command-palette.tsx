import { useEffect, useMemo, useState } from "react"
import { CornerDownLeft } from "lucide-react"
import { ARTICLE_HEADINGS, ENDPOINTS, type Meth } from "../../lib/docs-data"
import { MethodChip } from "../ui/method-chip"
import { CommandDialog, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandInput } from "../ui/command"
import { rank } from "../../lib/fuzzy"

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

const GROUPS: Array<{ type: PaletteEntry["type"]; heading: string }> = [
  { type: "guide", heading: "Repo Wiki" },
  { type: "endpoint", heading: "API Endpoints" },
  { type: "heading", heading: "Sections" },
]

/** Ctrl/Cmd+K global + trigger keyboard fix (G1/G2). Fuzzy over typed index — no DOM scraping. UI: shadcn Command (cmdk). */
export function CommandPalette({ open, onOpenChange, entries }: Props) {
  const index = useMemo(() => (entries?.length ? [...entries, ...BASE_INDEX] : BASE_INDEX), [entries])
  const [query, setQuery] = useState("")

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

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search endpoints, sections & guides…"
        aria-label="Search endpoints and sections"
      />
      <CommandList role="listbox" aria-label="Results">
        <CommandEmpty>No matches for “{query}”.</CommandEmpty>
        {GROUPS.map(({ type, heading }) => {
          const items = rank(query, index.filter((e) => e.type === type), (e) => `${e.label} ${e.sub}`)
          if (!items.length) return null
          return (
            <CommandGroup key={type} heading={heading}>
              {items.map(({ item }) => (
                <CommandItem key={`${item.type}:${item.id}`} value={`${item.type}:${item.id}`} onSelect={() => jump(item)} className="group">
                  {item.type === "endpoint" ? (
                    <MethodChip meth={item.meth} />
                  ) : item.type === "guide" ? (
                    <span className="inline-flex h-[18px] w-[38px] shrink-0 items-center justify-center rounded bg-primary/15 font-mono text-[9px] uppercase tracking-wider text-primary">wiki</span>
                  ) : (
                    <span className="inline-flex h-[18px] w-[38px] shrink-0 items-center justify-center rounded bg-white/5 font-mono text-[9px] uppercase tracking-wider text-dim">§</span>
                  )}
                  <span className="truncate font-mono text-[12.5px]">{item.label}</span>
                  <span className="ml-auto shrink-0 text-[11px] text-dim">{item.sub}</span>
                  <CornerDownLeft className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-data-[selected=true]:opacity-60" aria-hidden />
                </CommandItem>
              ))}
            </CommandGroup>
          )
        })}
      </CommandList>
      <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-dim">
        <span><kbd className="rounded bg-white/5 px-1">↑↓</kbd> navigate</span>
        <span><kbd className="rounded bg-white/5 px-1">↵</kbd> jump</span>
        <span><kbd className="rounded bg-white/5 px-1">esc</kbd> close</span>
        <span className="ml-auto hidden sm:inline">fuzzy · typed index</span>
      </div>
    </CommandDialog>
  )
}
