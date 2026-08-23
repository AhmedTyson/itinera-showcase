import { useEffect, useRef, useState } from "react"
import { useIsReducedMotion } from "../../hooks/useIsReducedMotion"

type MermaidAPI = {
  initialize(config: Record<string, unknown>): void
  parse(text: string): Promise<boolean>
  render(id: string, text: string): Promise<{ svg: string }>
}

let mermaidPkg: Promise<MermaidAPI> | null = null

/** Singleton lazy loader — only wiki route pays the ~60KB gzip chunk. */
function loadMermaid(): Promise<MermaidAPI> {
  if (!mermaidPkg) {
    mermaidPkg = import("mermaid").then((m) => {
      const mermaid = (m.default ?? m) as unknown as MermaidAPI
      mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "strict" })
      return mermaid
    })
  }
  return mermaidPkg
}

let uid = 0

type Props = { chart: string }

/** Renders ```mermaid fences. Invalid syntax / load failure / RM → static <pre> fallback. */
export function MermaidDiagram({ chart }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const isRM = useIsReducedMotion()

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    loadMermaid()
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
  }, [chart])

  // static fallback — no motion involved, but keeps RM contract simple and honest
  if (isRM || failed) {
    return (
      <pre className="overflow-x-auto rounded-lg border border-border bg-black/30 p-4 font-mono text-[12px] leading-relaxed text-muted">
        <code>{chart}</code>
      </pre>
    )
  }

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Mermaid diagram"
      data-mermaid=""
      className="my-4 overflow-x-auto rounded-lg border border-border/70 bg-black/20 p-4 [&_svg]:mx-auto [&_svg]:max-w-full"
    />
  )
}
