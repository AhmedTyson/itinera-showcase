import type { ReactNode } from "react"

type SlideHeadProps = {
  /** 1-based slide number */
  index: number
  total: number
  /** chip copy, authored verbatim */
  tag: string
  /** the slide's sole h2 */
  title: ReactNode
  lead?: ReactNode
}

/** D6 — slide header: mono gold index, hairline, tag chip, right NN / 12 marker. */
export function SlideHead({ index, total, tag, title, lead }: SlideHeadProps) {
  return (
    <div className="mb-2">
      <div data-reveal="kicker" className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-dim">
        <span className="font-mono text-primary">{String(index).padStart(2, "0")}</span>
        <span aria-hidden className="h-px w-8 bg-border" />
        {tag && <span className="rounded-full border border-border px-2 py-0.5 text-[10px] normal-case">{tag}</span>}
        <span className="ml-auto font-mono text-[10px] tabular-nums tracking-[0.18em] text-dim" aria-hidden>
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <h2
        id={`slide-${index}-heading`}
        tabIndex={-1}
        data-reveal="title"
        className="mt-2 text-[clamp(1.75rem,3.4vw,2.75rem)] font-bold leading-[1.1] tracking-tight text-text"
      >
        {title}
      </h2>
      {lead && (
        <p data-reveal="content" className="mt-3 max-w-2xl text-sm leading-relaxed text-dim">
          {lead}
        </p>
      )}
    </div>
  )
}
