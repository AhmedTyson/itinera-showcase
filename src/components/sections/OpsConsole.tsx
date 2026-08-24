import { useState, useEffect, useRef } from "react"
import { RotateCcw } from "lucide-react"
import { TERM_LINES, TELEMETRY } from "../../lib/home-content"
import { useSlideActive } from "../deck/slide-context"
import { useIsReducedMotion } from "../../hooks/useIsReducedMotion"

/** Typewriter ops console with replay + clickable telemetry chips. */
export function OpsConsole() {
  const [progress, setProgress] = useState(0) // lines fully shown
  const [chars, setChars] = useState(0) // chars of current line
  const [running, setRunning] = useState(false) // D26: activation OR IO, once
  const [active, setActive] = useState(0)
  const startedRef = useRef(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const seam = useSlideActive()
  const isActive = seam === null ? null : seam.isActive

  // deck path — start once on slide activation (D26)
  useEffect(() => {
    if (isActive !== true || startedRef.current) return
    startedRef.current = true
    setRunning(true)
  }, [isActive])

  // fallback path — legacy IO (only when deck is off)
  useEffect(() => {
    if (isActive !== null || startedRef.current) return
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !startedRef.current) {
          startedRef.current = true
          setRunning(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [isActive])

  const line = TERM_LINES[progress]
  const done = progress >= TERM_LINES.length
  const rm = useIsReducedMotion()

  // reduced motion — print everything instantly (D26)
  useEffect(() => {
    if (!running || !rm) return
    setProgress(TERM_LINES.length)
    setChars(0)
  }, [running, rm])

  useEffect(() => {
    if (!running || done || rm) return
    if (!line) return
    const speed = line.kind === "cmd" ? 24 : 10
    const t = setTimeout(() => {
      if (chars < line.text.length) {
        setChars((c) => c + 1)
      } else {
        setProgress((p) => p + 1)
        setChars(0)
      }
    }, speed)
    return () => clearTimeout(t)
  }, [running, chars, progress, line, done])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [progress, chars])

  const replay = () => {
    setProgress(0)
    setChars(0)
    setRunning(true)
  }

  const visible = TERM_LINES.slice(0, progress + (done ? 0 : 1))

  return (
    <div ref={rootRef} className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      {/* telemetry chips — click to feature in console */}
      <div className="grid grid-cols-2 content-start gap-3">
        {TELEMETRY.map((cell, i) => (
          <button
            key={cell.value}
            onClick={() => setActive(i)}
            aria-pressed={active === i}
            className={`rounded-lg border p-3.5 text-left transition-all hover:-translate-y-0.5 ${
              active === i ? "border-primary/60 bg-primary/10 shadow-[0_0_16px_rgba(251,191,36,0.12)]" : "border-border/70 bg-white/[0.02] hover:border-primary/40"
            }`}
          >
            <b className="block truncate font-mono text-[13px] text-text">{cell.value}</b>
            <span className="text-[11.5px] text-dim">{cell.note}</span>
          </button>
        ))}
      </div>

      {/* live-typing console */}
      <div className="overflow-hidden rounded-xl border border-border bg-black/40">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
          <span className="flex items-center gap-2">
            <span aria-hidden className="flex gap-1.5">
              <i className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <i className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <i className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </span>
            <span className="font-mono text-[11px] text-dim">itinera@railway — {TELEMETRY[active]?.value ?? "audit"} shell</span>
          </span>
          <button
            onClick={replay}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 font-mono text-[10px] text-dim transition-colors hover:border-primary/40 hover:text-text"
            aria-label="Replay console"
          >
            <RotateCcw className="h-3 w-3" aria-hidden /> replay
          </button>
        </div>
        <div ref={bodyRef} className="h-[240px] space-y-1 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed" aria-live="polite">
          {visible.map((l, i) =>
            i < progress ? (
              l.kind === "cmd" ? (
                <div key={i}>
                  <span className="mr-2 text-dim">$</span>
                  <span className="text-text">{l.text}</span>
                </div>
              ) : (
                <div key={i} className="pl-4 text-primary">{l.text}</div>
              )
            ) : (
              <div key={i}>
                {l.kind === "cmd" && <span className="mr-2 text-dim">$</span>}
                <span className={l.kind === "cmd" ? "text-text" : "text-primary"}>
                  {l.text.slice(0, chars)}
                  <span aria-hidden className="animate-pulse text-dim">▌</span>
                </span>
              </div>
            ),
          )}
          {done && (
            <div className="pt-2 text-dim">
              <span className="mr-2 text-dim">$</span>
              <span className="text-emerald-400">● all systems nominal — derived from codebase, not fabricated</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
