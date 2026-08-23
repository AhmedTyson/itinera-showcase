export function EmptyState({ query }: { query: string }) {
  return (
    <div id="apiEmpty" role="status" aria-live="polite" className="rounded-xl border border-border bg-white/[0.02] p-6 text-center">
      <p className="font-semibold text-text">No endpoints match{query ? ` “${query}”` : ""}.</p>
      <p className="mt-1 text-sm text-dim">Clear the search or reset domain / method filters.</p>
    </div>
  )
}
