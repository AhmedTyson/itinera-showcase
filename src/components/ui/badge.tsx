import { cva, type VariantProps } from "class-variance-authority"
import type { Finding } from "../../lib/security-data"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
  {
    variants: {
      status: {
        ok: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300",
        mid: "bg-amber-500/15 border border-amber-500/30 text-amber-300",
        planned: "bg-slate-500/15 border border-slate-500/30 text-slate-300",
      },
    },
    defaultVariants: { status: "ok" },
  }
)

type BadgeProps = VariantProps<typeof badgeVariants> & { children: React.ReactNode }

export function Badge({ status, children }: BadgeProps) {
  const label = status === "ok" ? "Implemented" : status === "mid" ? "Partial" : "Planned"
  return <span className={badgeVariants({ status })}>{children ?? label}</span>
}

export function StatusBadge({ status }: { status: Finding["status"] }) {
  const label = status === "ok" ? "Implemented" : status === "mid" ? "Partial" : "Planned"
  return <Badge status={status}>{label}</Badge>
}
