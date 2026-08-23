import { useCallback, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "../../lib/utils"

type Props = {
  code: string
  label?: string
  className?: string
}

/** Copy-on-every-code-surface primitive (G4 fix). Clipboard API + textarea fallback for file:// */
export function CodeBlock({ code, label, className }: Props) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>(0)

  const copy = useCallback(() => {
    const done = () => {
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1200)
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(done).catch(() => fallback())
    } else {
      fallback()
    }
    function fallback() {
      const ta = document.createElement("textarea")
      ta.value = code
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand("copy")
        done()
      } finally {
        document.body.removeChild(ta)
      }
    }
  }, [code])

  return (
    <div className={cn("group relative overflow-hidden rounded-lg border border-border bg-black/30", className)}>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-muted">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : `Copy ${label ?? "code"}`}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-border bg-panel/90 px-2 py-1 text-[11px] text-dim opacity-0 transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-hover:opacity-100"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        <span aria-live="polite" className={cn(copied && "text-emerald-400")}>
          {copied ? "Copied" : "Copy"}
        </span>
      </button>
    </div>
  )
}
