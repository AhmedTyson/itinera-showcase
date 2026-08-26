import { useEffect, useRef, useState } from "react"
import { useIsReducedMotion } from "../../hooks/useIsReducedMotion"
import { useTheme } from "../../lib/theme-store"

type MermaidAPI = {
  initialize(config: Record<string, unknown>): void
  parse(text: string): Promise<boolean>
  render(id: string, text: string): Promise<{ svg: string }>
}

let mermaidPkg: Promise<MermaidAPI> | null = null
let mermaidTheme: string | null = null

function themeConfig(theme: string): Record<string, unknown> {
  const isLight = theme === "light"
  return {
    startOnLoad: false,
    securityLevel: "strict" as const,
    theme: isLight ? "base" : "dark",
    themeVariables: isLight
      ? {
          primaryColor: "#ffffff",
          primaryTextColor: "#141826",
          primaryBorderColor: "#dde3f0",
          lineColor: "#c2cbe0",
          tertiaryColor: "#f4f6fb",
        }
      : {
          primaryColor: "#0e1428",
          primaryTextColor: "#e6eaf5",
          primaryBorderColor: "#1e2a4a",
          lineColor: "#93a0bf",
          tertiaryColor: "#05070d",
        },
  }
}

async function ensureMermaid(theme: string): Promise<MermaidAPI> {
  if (!mermaidPkg) {
    mermaidPkg = import("mermaid").then((m) => {
      const mermaid = (m.default ?? m) as unknown as MermaidAPI
      mermaid.initialize(themeConfig(theme))
      mermaidTheme = theme
      return mermaid
    })
    return mermaidPkg
  }
  const mermaid = await mermaidPkg
  if (mermaidTheme !== theme) {
    mermaid.initialize(themeConfig(theme))
    mermaidTheme = theme
  }
  return mermaid
}

let uid = 0
type Props = { chart: string; force?: boolean }

export function MermaidDiagram({ chart, force }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const [copied, setCopied] = useState(false)
  const isRM = useIsReducedMotion()
  const [theme] = useTheme()

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    ensureMermaid(theme)
      .then(async (mermaid) => {
        try {
          await mermaid.parse(chart)
          const { svg } = await mermaid.render(`mmd-${++uid}`, chart)
          if (!cancelled && ref.current) ref.current.innerHTML = svg
        } catch {
          if (!cancelled) setFailed(true)
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [chart, theme])

  if (((isRM && !force) || failed)) {
    return (
      <pre className="overflow-x-auto rounded-lg border border-border bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-muted">
        <code>{chart}</code>
      </pre>
    )
  }

  const copySvg = () => {
    const svg = ref.current?.querySelector("svg")
    if (!svg) return
    const text = new XMLSerializer().serializeToString(svg)
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    })
  }

  return (
    <div className="group relative flex w-full flex-col overflow-hidden rounded-lg border border-white/5 bg-black/20">
      <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-white/[0.03] px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-dim">diagram</span>
        <button type="button" onClick={copySvg} className="rounded bg-black/20 px-2 py-1 font-mono text-[10px] text-dim hover:text-emerald-300">
          {copied ? "Copied" : "Copy SVG"}
        </button>
      </div>
      <div className="w-full overflow-auto p-3 sm:p-4">
        <div ref={ref} role="img" aria-label="Mermaid diagram" className="w-full [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-full" />
      </div>
    </div>
  )
}
