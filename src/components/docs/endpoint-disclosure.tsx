import type { Endpoint } from "../../lib/docs-data"
import { MethodChip } from "../ui/method-chip"
import { CodeBlock } from "../ui/code-block"

/** details>summary disclosure — native keyboard + AT support, parity with legacy .endpoint. */
export function EndpointDisclosure({ endpoint }: { endpoint: Endpoint }) {
  const { meth, path, chips, body } = endpoint
  return (
    <details className="group rounded-lg border border-border/70 bg-white/[0.02] open:border-primary/30">
      <summary className="flex cursor-pointer flex-wrap items-center gap-2 px-3.5 py-2.5 text-sm marker:content-none hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <MethodChip meth={meth} />
        <code className="font-mono text-[12.5px] text-text">{path}</code>
        {chips.map((chip) => (
          <span key={chip} className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-dim">
            {chip}
          </span>
        ))}
      </summary>
      <div className="border-t border-border/50 px-3.5 pb-3.5 pt-3">
        {body.kind === "summary" && <p className="text-[13px] leading-relaxed text-muted">{body.text}</p>}
        {body.kind === "code" && <CodeBlock code={body.code} label={path} />}
        {body.kind === "pair" && (
          <div className="grid gap-3 md:grid-cols-2">
            {body.codes.map((c, i) => (
              <div key={body.labels[i]}>
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-dim">{body.labels[i]}</div>
                <CodeBlock code={c} label={body.labels[i]} />
              </div>
            ))}
          </div>
        )}
        {body.kind === "summary-plus-pair" && (
          <>
            <p className="mb-3 text-[13px] leading-relaxed text-muted">{body.text}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {body.pair.codes.map((c, i) => (
                <div key={body.pair.labels[i]}>
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-dim">{body.pair.labels[i]}</div>
                  <CodeBlock code={c} label={body.pair.labels[i]} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </details>
  )
}
