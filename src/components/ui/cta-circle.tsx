import type { ReactNode } from "react"
import { Link } from "react-router-dom"

type Variant = "solid" | "ghost"
type Size = "sm" | "md"

const SIZES: Record<Size, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
}

const VARIANTS: Record<Variant, string> = {
  solid:
    "bg-emerald-500 text-[#02120b] hover:shadow-[0_6px_26px_rgba(16,185,129,0.45)]",
  ghost:
    "border border-[var(--bp-border)] bg-white/[0.03] text-[var(--bp-text-white)] hover:border-primary/50 hover:bg-white/[0.06]",
}

type BaseProps = {
  icon: ReactNode
  label: string
  variant?: Variant
  size?: Size
  tooltip?: boolean
}

const HOVER =
  "group relative inline-flex items-center justify-center rounded-full transition-all duration-200 active:scale-[0.95] hover:scale-105"

/** Shared circular CTA — one source of truth for icon-button styling across the showcase. */
export function CTACircle({ href, icon, label, variant = "solid", size = "md", tooltip = false }: BaseProps & { href: string }) {
  const external = href.startsWith("http")
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={label}
      className={`${HOVER} ${SIZES[size]} ${VARIANTS[variant]}`}
    >
      <span className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">{icon}</span>
      {variant === "solid" && <span aria-hidden className="cta-sheen pointer-events-none absolute inset-0 rounded-full" />}
      {tooltip && (
        <span className="pointer-events-none absolute top-full mt-1.5 whitespace-nowrap rounded-md border border-border bg-panel px-2 py-0.5 font-mono text-[10px] text-text opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
          {label}
        </span>
      )}
    </a>
  )
}

export function CTACircleLink({ to, icon, label, variant = "solid", size = "md" }: BaseProps & { to: string }) {
  return (
    <Link to={to} aria-label={label} className={`${HOVER} ${SIZES[size]} ${VARIANTS[variant]}`}>
      <span className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">{icon}</span>
      {variant === "solid" && <span aria-hidden className="cta-sheen pointer-events-none absolute inset-0 rounded-full" />}
      <span className="pointer-events-none absolute top-full mt-1.5 whitespace-nowrap rounded-md border border-border bg-panel px-2 py-0.5 font-mono text-[10px] text-text opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
        {label}
      </span>
    </Link>
  )
}
