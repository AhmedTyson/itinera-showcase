import { useState } from "react"
import type { Endpoint } from "../../lib/explorer-data"

export function EndpointCard({ endpoint, onTry }: { endpoint: Endpoint; onTry?: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <details
      className="group rounded-xl border border-border bg-white/[0.02] open:bg-white/[0.04]"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      data-cat={endpoint.cat}
      data-meth={endpoint.meth}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3">
        <span className={`rounded-md border px-2 py-1 font-mono text-xs font-bold uppercase ${endpoint.meth === "get" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : endpoint.meth === "post" ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : endpoint.meth === "delete" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-border bg-white/5 text-dim"}`}>
          {endpoint.meth.toUpperCase()}
        </span>
        <span className="font-mono text-sm text-text">{endpoint.path}</span>
        <span className="ml-2 hidden gap-1 md:flex">
          {endpoint.chips.slice(0, 2).map((c) => (
            <span key={c} className="rounded-full border border-border bg-white/5 px-2 py-0.5 text-xs text-dim">
              {c}
            </span>
          ))}
        </span>
        <span className="ml-auto flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault()
              onTry?.(endpoint.id)
            }}
            className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs font-bold text-accent hover:bg-accent/20"
            aria-label={`Try ${endpoint.path}`}
          >
            Try
          </button>
        </span>
      </summary>
      {open && (
        <div className="border-t border-border px-4 py-3">
          <p className="text-sm text-muted">{endpoint.desc}</p>
          {(endpoint.request || endpoint.response) && (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {endpoint.request && (
                <div>
                  <p className="mb-1 font-mono text-xs uppercase tracking-widest text-dim">Request</p>
                  <pre className="overflow-auto rounded-lg bg-[#0a0d15] p-3 font-mono text-xs text-[#cdd6e8]">{endpoint.request}</pre>
                </div>
              )}
              {endpoint.response && (
                <div>
                  <p className="mb-1 font-mono text-xs uppercase tracking-widest text-dim">Response</p>
                  <pre className="overflow-auto rounded-lg bg-[#0a0d15] p-3 font-mono text-xs text-[#cdd6e8]">{endpoint.response}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </details>
  )
}
