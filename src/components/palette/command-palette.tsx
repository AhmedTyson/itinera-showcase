import { useEffect, useMemo, useState } from "react"
import { CornerDownLeft } from "lucide-react"
import { ARTICLE_HEADINGS } from "../../lib/docs-data"
import { LIFECYCLE_STAGES } from "../../pages/LifecyclePage"
import { CommandDialog, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandInput, CommandSeparator } from "../ui/command"
import { rank } from "../../lib/fuzzy"
import paletteConfig from "../../config/palette.config.json"

export type PaletteEntry =
  | { type: "page"; id: string; label: string; sub: string }
  | { type: "stage"; id: string; label: string; sub: string; href: string }
  | { type: "heading"; id: string; label: string; sub: string }
  | { type: "guide"; id: string; label: string; sub: string }

type GroupConfig = (typeof paletteConfig.groups)[number]

/* ── dynamic sources — the only non-JSON knowledge: where live data lives ── */
const SOURCES: Record<string, () => PaletteEntry[]> = {
  lifecycle: () =>
    LIFECYCLE_STAGES.map((s, i) => {
      const g = paletteConfig.groups.find((g: GroupConfig) => g.type === "stage")
      const label = (g?.labelPattern ?? "{num} · {title}")
        .replace("{num}", String(i + 1).padStart(2, "0"))
        .replace("{title}", s.title)
      const href = (g?.hrefPattern ?? "/lifecycle?stage={id}").replace("{id}", s.id)
      return { type: "stage" as const, id: s.id, label, href, sub: g?.sub ?? "Lifecycle" }
    }),
  docHeadings: () =>
    ARTICLE_HEADINGS.map((h) => {
      const g = paletteConfig.groups.find((g: GroupConfig) => g.type === "heading")
      return { type: "heading" as const, id: h.id, label: h.text, sub: g?.sub ?? "Section" }
    }),
  wikiGuides: () => [], // wiki guides are injected per-route via props (route-aware)
}

function buildIndex(): PaletteEntry[] {
  const out: PaletteEntry[] = []
  for (const g of paletteConfig.groups as GroupConfig[]) {
    if (g.type === "page") {
      for (const it of g.items ?? []) out.push({ type: "page", id: it.id, label: it.label, sub: it.sub ?? "Page" })
    } else {
      const src = g.source ? SOURCES[g.source]?.() : []
      out.push(...src)
    }
  }
  return out
}

const STATIC_INDEX = buildIndex()

type Props = {
  open: boolean
  onOpenChange(open: boolean): void
  entries?: PaletteEntry[]
}

/** Ctrl/Cmd+K global. Config-driven: src/config/palette.config.json defines groups, pages, labels, patterns. */
export function CommandPalette({ open, onOpenChange, entries }: Props) {
  const groups = paletteConfig.groups as GroupConfig[]
  const index = useMemo(() => (entries?.length ? [...entries, ...STATIC_INDEX] : STATIC_INDEX), [entries])
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
    onOpenChange(false)
    if (entry.type === "guide") {
      history.pushState(null, "", `/wiki/${entry.id}`)
      window.dispatchEvent(new PopStateEvent("popstate"))
      return
    }
    if (entry.type === "page") {
      history.pushState(null, "", entry.id)
      window.dispatchEvent(new PopStateEvent("popstate"))
      return
    }
    if (entry.type === "stage") {
      history.pushState(null, "", entry.href)
      window.dispatchEvent(new PopStateEvent("popstate"))
      return
    }
    // docs section — only reachable while on /docs
    requestAnimationFrame(() => {
      document.getElementById(entry.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  const chipFor = (t: PaletteEntry["type"], label: string) => {
    if (t === "stage") {
      return (
        <span className="inline-flex h-[18px] w-[38px] shrink-0 items-center justify-center rounded bg-emerald-500/15 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
          {label.slice(0, 2)}
        </span>
      )
    }
    if (t === "guide") {
      return <span className="inline-flex h-[18px] w-[38px] shrink-0 items-center justify-center rounded bg-primary/15 font-mono text-[9px] uppercase tracking-wider text-primary">wiki</span>
    }
    if (t === "page") {
      return <span className="inline-flex h-[18px] w-[38px] shrink-0 items-center justify-center rounded bg-sky-400/15 font-mono text-[9px] uppercase tracking-wider text-sky-300">goto</span>
    }
    return <span className="inline-flex h-[18px] w-[38px] shrink-0 items-center justify-center rounded bg-white/5 font-mono text-[9px] uppercase tracking-wider text-dim">§</span>
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder={paletteConfig.placeholder}
        aria-label="Search pages, stages, sections and guides"
      />
      <CommandList>
        <CommandEmpty>No matches for “{query}”.</CommandEmpty>
        {groups.map(({ type, heading }, gi) => {
          const items = rank(query, index.filter((e) => e.type === type), (e) => `${e.label} ${e.sub}`)
          if (!items.length) return null
          return (
            <div key={`${type}:${heading}`}>
              {gi > 0 && <CommandSeparator className="my-1 opacity-60" />}
              <CommandGroup heading={heading}>
              {items.map(({ item }) => (
                <CommandItem key={`${item.type}:${item.id}`} value={`${item.type}:${item.id}`} onSelect={() => jump(item)} className="group">
                  {chipFor(item.type, item.label)}
                  <span className="min-w-0 flex-1 truncate font-mono text-[12.5px]">{item.label}</span>
                  <span className="ml-auto shrink-0 pl-2 text-[11px] text-dim">{item.sub}</span>
                  <CornerDownLeft className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-data-[selected=true]:opacity-60" aria-hidden />
                </CommandItem>
                ))}
              </CommandGroup>
            </div>
          )
        })}
      </CommandList>
      <div className="flex items-center gap-4 border-t border-white/[.07] bg-bg-1/30 px-4 py-2 text-[11px] text-dim">
        <span className="flex items-center gap-1.5"><kbd className="rounded border border-white/[.08] bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd> navigate</span>
        <span className="flex items-center gap-1.5"><kbd className="rounded border border-white/[.08] bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">↵</kbd> jump</span>
        <span className="flex items-center gap-1.5"><kbd className="rounded border border-white/[.08] bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">esc</kbd> close</span>
        <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-wider sm:inline">config · palette.config.json</span>
      </div>
    </CommandDialog>
  )
}
