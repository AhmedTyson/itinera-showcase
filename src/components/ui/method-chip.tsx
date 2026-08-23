import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const methodVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider",
  {
    variants: {
      meth: {
        GET: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
        POST: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
        DELETE: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
      },
    },
    defaultVariants: { meth: "GET" },
  }
)

type Props = VariantProps<typeof methodVariants> & { className?: string }

export function MethodChip({ meth, className }: Props) {
  return <span className={cn(methodVariants({ meth }), className)}>{meth}</span>
}
