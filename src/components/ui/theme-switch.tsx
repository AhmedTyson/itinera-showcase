import { Moon, Sun } from "lucide-react"
import { useTheme } from "../../lib/theme-store"
import { cn } from "../../lib/utils"

/**
 * Mode switch — dark is default. Sliding-knob pill, sun/moon icons,
 * role="switch" semantics. Tokens flip via html.light in index.css.
 */
export function ThemeSwitch({ className }: { className?: string }) {
  const [theme, toggle] = useTheme()
  const isLight = theme === "light"

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      onClick={toggle}
      className={cn(
        "relative inline-flex h-8 w-[60px] shrink-0 items-center rounded-full border border-border bg-bg-2/60 p-1 transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-0",
        className
      )}
    >
      {/* knob */}
      <span
        aria-hidden
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full bg-panel shadow-[0_1px_4px_rgba(0,0,0,.35)] ring-1 ring-border transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
          isLight ? "translate-x-[28px]" : "translate-x-0"
        )}
      >
        {isLight ? (
          <Sun className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-primary" />
        )}
      </span>
      {/* track icons */}
      <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
        <Moon className={cn("h-3 w-3 transition-opacity", isLight ? "opacity-40" : "opacity-0")} />
        <Sun className={cn("h-3 w-3 transition-opacity", isLight ? "opacity-0" : "opacity-40")} />
      </span>
    </button>
  )
}
