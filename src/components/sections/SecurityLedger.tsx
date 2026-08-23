import { FINDINGS, AGENTIC_FINDING, type Finding } from "../../lib/security-data"
import { StatusBadge } from "../ui/badge"

type Props = {
  findings?: Finding[]
  includeAgentic?: boolean
}

export function SecurityLedger({ findings, includeAgentic = true }: Props) {
  const rows = findings ?? [...FINDINGS, ...(includeAgentic ? [AGENTIC_FINDING] : [])]

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Security audit ledger — 11 rows, scrollable horizontally on small screens"
      className="overflow-x-auto rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="bg-white/5 text-left">
            <th scope="col" className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-dim tabular-nums">#</th>
            <th scope="col" className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-dim">Issue Identified</th>
            <th scope="col" className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-dim">Mitigation Applied</th>
            <th scope="col" className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-dim">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-border hover:bg-primary/5">
              <td className="tabular-nums px-4 py-3 align-top font-mono text-xs text-dim">{row.id}</td>
              <td className="px-4 py-3 align-top font-semibold text-text">{row.issue}</td>
              <td className="px-4 py-3 align-top leading-relaxed text-muted">{row.mitigation}</td>
              <td className="px-4 py-3 align-top">
                <StatusBadge status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
