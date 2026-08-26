import { useEffect, useRef, useState } from "react"
import { Copy, RotateCcw, Check, Maximize2 } from "lucide-react"
import { TELEMETRY, TERM_LINES } from "../../lib/home-content"
import { TelemetryDiagram } from "./TelemetryDiagrams"
import { MermaidDiagram } from "../wiki/mermaid-diagram"
import { DialogRoot, DialogContent, DialogTitle } from "../ui/dialog"

type Line = { kind: "cmd" | "out"; text: string }

function toLines(active: number): Line[] {
  const t = TELEMETRY[active]
  if (!t) return TERM_LINES
  return [{ kind: "cmd" as const, text: t.command }, ...t.outputs.map((o) => ({ kind: "out" as const, text: `→ ${o}` }))]
}

const SEQ_CHARTS: string[] = [
  "sequenceDiagram\n    participant U as User\n    participant O as Order\n    U->>O: POST /checkout idemp-a1b2\n    O->>DB: findReusableCheckout\n    DB-->>O: REUSED (idempotent)",
  "sequenceDiagram\n    participant Q as Queue\n    participant W as Worker\n    participant P as PDF\n    Q->>W: pop GenerateReport\n    W->>P: render All Time",
  "sequenceDiagram\n    participant W as Webhook\n    participant E as EventBus\n    participant L as FulfillOrder\n    W->>E: PaymentSucceeded\n    E->>L: handle()\n    L->>DB: create Subscription",
  "sequenceDiagram\n    participant C as Client\n    participant K as Cache(md5)\n    participant G as Groq\n    C->>K: check md5 60m\n    alt hit\n        K-->>C: return (0 quota)\n    else miss\n        K->>G: llama-3.3-70b\n        G-->>K: save\n    end",
  "sequenceDiagram\n    participant P as Probe GET /up\n    participant D as DB\n    participant Q as Queue\n    P->>D: ping\n    D->>Q: check\n    Q-->>P: 200 OK",
  "sequenceDiagram\n    participant R as Request\n    participant L as Log\n    participant P as Pail\n    R->>L: PaymentSucceeded\n    L->>P: tail -f",
  "sequenceDiagram\n    participant A as App\n    participant T as Telescope\n    participant U as UI\n    A->>T: TELESCOPE_ENABLED=true\n    T->>U: query/request/job",
  "sequenceDiagram\n    participant M as Mailable\n    participant V as Preview\n    participant I as Inbox\n    M->>V: welcome (7)\n    V->>I: deliver + logo",
]

export function OpsConsole() {
  const [active, setActive] = useState(0)
  const [queue, setQueue] = useState<Line[]>(() => TERM_LINES)
  const [progress, setProgress] = useState(0)
  const [chars, setChars] = useState(0)
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [input, setInput] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [diagMode, setDiagMode] = useState<"engaging" | "flow" | "sequence">("engaging")
  const bodyRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // start on scroll into view once
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRunning(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // when chip changes, enqueue its command
  const selectChip = (i: number) => {
    setActive(i)
    const lines = toLines(i)
    setQueue(lines)
    setProgress(0)
    setChars(0)
    setRunning(true)
  }

  const line = queue[progress]
  const done = progress >= queue.length

  useEffect(() => {
    if (!running || done || !line) return
    const speed = line.kind === "cmd" ? 22 : 9
    const t = setTimeout(() => {
      if (chars < line.text.length) setChars((c) => c + 1)
      else {
        setProgress((p) => p + 1)
        setChars(0)
      }
    }, speed)
    return () => clearTimeout(t)
  }, [running, chars, progress, line, done])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" })
  }, [progress, chars])

  const replay = () => {
    setProgress(0)
    setChars(0)
    setRunning(true)
  }

  const copy = () => {
    const text = queue.map((l) => (l.kind === "cmd" ? `$ ${l.text}` : l.text)).join("\n")
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    })
  }

  const visible = queue.slice(0, progress + (done ? 0 : 1))

  return (
    <div ref={rootRef} className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:min-h-[560px]">
      {/* telemetry chips */}
      <div className="grid grid-cols-2 content-start gap-2.5">
        {TELEMETRY.map((cell, i) => (
          <button
            key={cell.value}
            onClick={() => selectChip(i)}
            aria-pressed={active === i}
            className={`group relative overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 ${
              active === i
                ? "border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_16px_rgba(16,185,129,0.12)]"
                : "border-border/60 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04]"
            }`}
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100" aria-hidden />
            <b className={`block truncate font-mono text-[12px] ${active === i ? "text-emerald-300" : "text-text"}`}>{cell.value}</b>
            <span className="block truncate text-[11px] leading-tight text-dim">{cell.note}</span>
            <span className="mt-1 block truncate font-mono text-[10px] tracking-wide text-dim/70 group-hover:text-dim">{cell.command}</span>
          </button>
        ))}
      </div>

      {/* console — taller, diagram fits without scrolling */}
      <div className="flex min-h-[520px] flex-col overflow-hidden rounded-xl border border-border/60 bg-[#0c1322] shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-3 py-2">
          <span className="flex items-center gap-2">
            <span aria-hidden className="flex gap-1">
              <i className="h-2 w-2 rounded-full bg-rose-500/70" />
              <i className="h-2 w-2 rounded-full bg-amber-500/70" />
              <i className="h-2 w-2 rounded-full bg-emerald-500/70" />
            </span>
            <span className="font-mono text-[11px] tracking-wide text-dim">itinera@railway — {TELEMETRY[active]?.value ?? "audit"} shell</span>
            <span className="hidden rounded bg-black/20 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-emerald-400/70 sm:inline">{active + 1}/8</span>
          </span>
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={copy}
              aria-label="Copy console"
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/20 px-2 py-1 font-mono text-[10px] text-dim hover:border-emerald-500/30 hover:text-emerald-300"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />} {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={replay}
              aria-label="Replay console"
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/20 px-2 py-1 font-mono text-[10px] text-dim hover:border-primary/30 hover:text-text"
            >
              <RotateCcw className="h-3 w-3" /> replay
            </button>
          </span>
        </div>

        <div ref={bodyRef} className="flex-1 space-y-1 overflow-y-auto p-3 font-mono text-[12px] leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="log" aria-live="polite">
          {visible.map((l, i) =>
            i < progress ? (
              l.kind === "cmd" ? (
                <div key={i}>
                  <span className="mr-2 text-dim">$</span>
                  <span className="text-sky-300">{l.text}</span>
                </div>
              ) : (
                <div key={i} className="pl-4">
                  <span className={l.text.includes("PASS") || l.text.includes("→") ? "text-emerald-300" : l.text.includes("429") ? "text-amber-300" : "text-primary"}>{l.text}</span>
                </div>
              )
            ) : (
              <div key={i}>
                {l.kind === "cmd" && <span className="mr-2 text-dim">$</span>}
                <span className={l.kind === "cmd" ? "text-sky-300" : "text-emerald-300"}>
                  {l.text.slice(0, chars)}
                  <span aria-hidden className="animate-pulse text-dim">▌</span>
                </span>
              </div>
            ),
          )}
          {done && (
            <div className="mt-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-emerald-300">
              <span className="mr-2 text-emerald-400">●</span>
              <span className="font-mono text-[11px] tracking-wide">all systems nominal — derived from codebase, not fabricated</span>
            </div>
          )}
        </div>

        {/* diagram preview — compact button triggers engaging SVG dialog */}
        <div className="border-t border-white/5 bg-black/20 p-2">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="font-mono text-[10px] tracking-widest text-dim">PREVIEW</span>
            <span className="font-mono text-[10px] tracking-wide text-dim/70">{TELEMETRY[active]?.value}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setDiagMode("engaging")
              setDialogOpen(true)
            }}
            aria-label="Preview diagram"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/5 bg-white/[0.02] px-3 py-2.5 text-center transition-colors hover:border-emerald-500/20 hover:bg-emerald-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-emerald-300">Preview</span>
            <span className="font-mono text-[11px] tracking-wide text-dim">{TELEMETRY[active]?.value} diagram</span>
            <Maximize2 className="ml-auto h-3.5 w-3.5 text-dim group-hover:text-emerald-400" />
          </button>
        </div>

        <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="flex max-h-[90vh] w-[96vw] max-w-[880px] flex-col overflow-hidden border border-white/[0.08] bg-[#0c1322] p-0 shadow-2xl sm:w-[92vw]">
            <div className="shrink-0 border-b border-white/5 px-5 pb-4 pt-5 sm:px-6">
              <DialogTitle className="font-mono text-[11px] tracking-[0.14em] text-emerald-400">DIAGRAM — {TELEMETRY[active]?.value}</DialogTitle>
              <p className="mt-1.5 font-mono text-[11px] leading-relaxed tracking-wide text-dim">{TELEMETRY[active]?.command}</p>
              <div className="mt-4 flex gap-1 rounded-full border border-white/5 bg-black/30 p-1">
                {[
                  ["engaging", "Engaging SVG"],
                  ["flow", "Flowchart"],
                  ["sequence", "Sequence"],
                ].map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setDiagMode(k as typeof diagMode)}
                    className={`flex-1 rounded-full px-3 py-1.5 font-mono text-[11px] tracking-wide transition-all ${diagMode === k ? "bg-emerald-500 text-black shadow-sm" : "text-dim hover:bg-white/5 hover:text-text"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#070c18] px-4 py-4 sm:px-6 sm:py-5 [scrollbar-width:thin]">
              <div className="w-full">
                {diagMode === "engaging" ? (
                  <TelemetryDiagram index={active} />
                ) : (
                  <div className="w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c1322] p-3 sm:p-4 [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-full">
                    <MermaidDiagram chart={diagMode === "flow" ? TELEMETRY[active].diagram : SEQ_CHARTS[active]} force />
                  </div>
                )}
              </div>
              <p className="mt-4 shrink-0 font-mono text-[10px] tracking-wide text-dim/50">
                {diagMode === "engaging" ? "Engaging SVG — full-width interactive system view, no scaling." : diagMode === "flow" ? "Flowchart — system flow, full-width rendering." : "Sequence — time-ordered interactions, full-width."}
              </p>
            </div>
          </DialogContent>
        </DialogRoot>

        {/* command input */}
        <div className="flex items-center gap-2 border-t border-white/5 bg-black/20 px-3 py-2">
          <span className="font-mono text-[11px] text-dim">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = input.trim().toLowerCase()
                const idx = TELEMETRY.findIndex((t) => t.value.toLowerCase().includes(q) || t.command.toLowerCase().includes(q))
                if (q === "help") {
                  setQueue([{ kind: "cmd", text: "help" }, ...TELEMETRY.map((t) => ({ kind: "out" as const, text: `· ${t.value} — ${t.command}` }))])
                  setProgress(0)
                  setChars(0)
                  setRunning(true)
                } else if (idx >= 0) selectChip(idx)
                else if (q) {
                  setQueue([{ kind: "cmd", text: q }, { kind: "out", text: "→ no match — try: database, queue, ai, up" }])
                  setProgress(0)
                  setChars(0)
                  setRunning(true)
                }
                setInput("")
              }
              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault()
                const dir = e.key === "ArrowUp" ? -1 : 1
                const next = (active + dir + TELEMETRY.length) % TELEMETRY.length
                selectChip(next)
                inputRef.current?.focus()
              }
            }}
            placeholder="help · database · queue · ai · up — Enter to run"
            className="flex-1 bg-transparent font-mono text-[11px] tracking-wide text-text placeholder:text-dim/60 focus:outline-none"
            aria-label="Console command"
          />
          <span className="hidden font-mono text-[10px] tracking-wide text-dim/50 sm:inline">↵ run · ↑↓ cycle</span>
        </div>
      </div>
    </div>
  )
}
