import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { ENDPOINTS } from "../../lib/explorer-data"
import { EndpointCard } from "./EndpointCard"
import { EmptyState } from "./EmptyState"

type Props = {
  onTry?: (id: string) => void
}

export function Explorer({ onTry }: Props) {
  const [query, setQuery] = useState("")
  const [cat, setCat] = useState("all")
  const [meth, setMeth] = useState("all")

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return ENDPOINTS.filter((ep) => {
      const hay = (ep.search + " " + ep.path + " " + ep.meth).toLowerCase()
      const okQ = !q || hay.includes(q)
      const okCat = cat === "all" || ep.cat === cat
      const okMeth = meth === "all" || ep.meth === meth
      return okQ && okCat && okMeth
    })
  }, [query, cat, meth])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white/[0.02] p-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search endpoints… try “fork”, “webhook”, “weather”'
            aria-label="Search endpoints"
            aria-controls="apiCount apiEmpty"
            className="h-9 w-full rounded-lg border border-border bg-panel pl-9 pr-3 text-sm text-text placeholder:text-dim focus:border-primary/40 focus:outline-none"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          aria-label="Filter category"
          className="h-9 rounded-lg border border-border bg-panel px-3 text-sm text-text"
        >
          <option value="all">All domains</option>
          <option value="account">Account</option>
          <option value="catalog">Catalog</option>
          <option value="trips">Trips</option>
          <option value="commerce">Commerce</option>
          <option value="system">System</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={meth}
          onChange={(e) => setMeth(e.target.value)}
          aria-label="Filter method"
          aria-describedby="apiCount"
          className="h-9 rounded-lg border border-border bg-panel px-3 text-sm text-text"
        >
          <option value="all">All methods</option>
          <option value="get">GET</option>
          <option value="post">POST</option>
          <option value="put">PUT</option>
          <option value="patch">PATCH</option>
          <option value="delete">DELETE</option>
        </select>
        <span id="apiCount" role="status" aria-live="polite" className="rounded-full border border-border bg-white/5 px-2.5 py-1 font-mono text-xs text-dim">
          {filtered.length} endpoints
        </span>
      </div>

      <div role="list" className="grid gap-2">
        {filtered.map((ep) => (
          <EndpointCard key={ep.id} endpoint={ep} onTry={onTry} />
        ))}
      </div>

      {filtered.length === 0 && <EmptyState query={query} />}
    </div>
  )
}
