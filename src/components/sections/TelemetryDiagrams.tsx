export function TelemetryDiagram({ index }: { index: number }) {
  const wrap = "relative flex w-full flex-col gap-3"
  const card = "w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c1322] shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
  const header = "flex items-center gap-2 border-b border-white/5 bg-white/[0.03] px-3 py-2"
  const dot = "h-2 w-2 rounded-full"

  if (index === 0)
    return (
      <div className={wrap}>
        <div className={card}>
          <div className={header}>
            <span className="flex gap-1">
              <i className={`${dot} bg-rose-400/60`} />
              <i className={`${dot} bg-amber-400/60`} />
              <i className={`${dot} bg-emerald-400/60`} />
            </span>
            <span className="font-mono text-[11px] tracking-widest text-dim">migrations — 44 applied</span>
            <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-emerald-400">sqlite → mysql</span>
          </div>
          <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: "users", cols: "id · email · verified", idx: "email UNIQUE", icon: "◉" },
              { t: "orders", cols: "idempotency_key", idx: "UNIQUE 64", icon: "◎" },
              { t: "payments", cols: "paymob_tx_id", idx: "UNIQUE", icon: "⬢" },
              { t: "trips", cols: "user_id · 44 FK", idx: "confirmation_code", icon: "✈" },
              { t: "subscriptions", cols: "active_user", idx: "partial UNIQUE", icon: "◆" },
              { t: "jobs", cols: "queue · payload", idx: "index", icon: "▶" },
            ].map((b, i) => (
              <div
                key={b.t}
                className="fx-boot relative overflow-hidden rounded-lg border border-white/5 bg-black/20 p-3"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-emerald-400">
                  <span className="text-[13px]">{b.icon}</span> {b.t}
                </span>
                <span className="mt-1.5 block truncate font-mono text-[10px] tracking-wide text-dim">{b.cols}</span>
                <span className="mt-2 inline-block rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-emerald-300/70">
                  {b.idx}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-9 border-t border-white/5 bg-emerald-500/[0.04] px-3">
            <svg viewBox="0 0 600 32" className="absolute inset-0 h-full w-full opacity-60" preserveAspectRatio="none">
              <path
                d="M 40 16 C 120 6, 180 26, 260 16 S 380 6, 460 16 S 540 26, 560 16"
                fill="none"
                stroke="rgba(16,185,129,0.35)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <circle r="3" fill="#34d399" opacity="0.9">
                <animateMotion
                  path="M 40 16 C 120 6, 180 26, 260 16 S 380 6, 460 16 S 540 26, 560 16"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            <span className="relative flex h-full items-center justify-center gap-2 font-mono text-[10px] tracking-widest text-dim">
              <span className="h-px flex-1 bg-emerald-500/20" />
              DATABASE · FK cascades · pail tail
              <span className="h-px flex-1 bg-emerald-500/20" />
            </span>
          </div>
        </div>
      </div>
    )
  if (index === 1)
    return (
      <div className={wrap}>
        <div className="grid w-full grid-cols-1 items-stretch gap-3 lg:grid-cols-[1.25fr_auto_1fr]">
          <div className={`${card} p-4`}>
            <span className="font-mono text-[10px] tracking-widest text-dim">QUEUE: database → redis-ready</span>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { j: "GenerateReport", sub: "All Time · 60 orders", col: "amber" },
                { j: "GeocodeDestination", sub: "OSM · 17 cities", col: "sky" },
              ].map((j, i) => (
                <div
                  key={j.j}
                  className="fx-boot flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-3"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <span className={`h-2 w-2 animate-pulse rounded-full ${j.col === "amber" ? "bg-amber-400" : "bg-sky-400"}`} />
                  <span className="font-mono text-[11px] tracking-wide text-text">{j.j}</span>
                  <span className="ml-auto font-mono text-[10px] tracking-wide text-dim">{j.sub}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-1.5">
              <span className="flex-1 rounded bg-black/30 py-1.5 text-center font-mono text-[10px] tracking-wide text-dim">--tries=3</span>
              <span className="flex-1 rounded bg-black/30 py-1.5 text-center font-mono text-[10px] tracking-wide text-dim">--sleep=3</span>
              <span className="flex-1 rounded bg-emerald-500/10 py-1.5 text-center font-mono text-[10px] tracking-wide text-emerald-400">
                --max-time 3600
              </span>
            </div>
          </div>
          <div className="hidden flex-col items-center justify-center gap-1 lg:flex">
            <span className="h-10 w-px bg-gradient-to-b from-amber-500/0 via-amber-500/40 to-emerald-500/40" />
            <span className="rounded-full bg-emerald-500 px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-wide text-black">▶</span>
            <span className="font-mono text-[10px] tracking-wide text-dim">queue:work</span>
            <span className="h-10 w-px bg-gradient-to-b from-emerald-500/40 via-emerald-500/20 to-transparent" />
          </div>
          <div className="flex lg:hidden items-center justify-center gap-2 py-1">
            <span className="h-px flex-1 bg-gradient-to-r from-amber-500/0 via-amber-500/40 to-emerald-500/40" />
            <span className="rounded-full bg-emerald-500 px-2 py-1 font-mono text-[10px] font-bold tracking-wide text-black">▶ queue:work</span>
            <span className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 via-emerald-500/20 to-transparent" />
          </div>
          <div className={`${card} flex flex-col items-center justify-center gap-2 p-4`}>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-[18px]">📄</span>
            <span className="font-mono text-[11px] tracking-widest text-emerald-400">report.pdf</span>
            <span className="rounded bg-black/30 px-2 py-1 font-mono text-[10px] tracking-wide text-dim">All Time · DomPDF</span>
            <span className="mt-1 h-1.5 w-full rounded-full bg-white/5">
              <i className="block h-1.5 w-3/4 rounded-full bg-emerald-500/60" />
            </span>
          </div>
        </div>
      </div>
    )
  if (index === 2)
    return (
      <div className={wrap}>
        <div className="grid w-full grid-cols-1 items-stretch gap-3 sm:grid-cols-3">
          <div className={`${card} p-3 text-center`}>
            <span className="font-mono text-[10px] tracking-widest text-amber-400">Paymob Webhook</span>
            <div className="mx-auto mt-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-amber-500/30">
              <span className="text-[16px]">◈</span>
            </div>
            <span className="mt-2 block rounded bg-black/20 px-2 py-1 font-mono text-[10px] tracking-wide text-dim">HMAC SHA-512</span>
            <span className="mt-1 block font-mono text-[10px] tracking-wide text-amber-300/60">merchant_order_id: 80</span>
          </div>
          <div className={`${card} p-3`}>
            <span className="font-mono text-[10px] tracking-widest text-emerald-400">Event Bus</span>
            <div className="mt-3 space-y-1.5">
              <span className="block rounded bg-emerald-500/15 px-3 py-2 text-center font-mono text-[11px] tracking-wide text-emerald-300">
                PaymentSucceeded
              </span>
              <span className="block rounded bg-white/5 px-3 py-2 text-center font-mono text-[11px] tracking-wide text-dim">PaymentFailed</span>
            </div>
            <span className="mt-2 block text-center font-mono text-[10px] tracking-wide text-dim">ShouldQueue → sync in test</span>
          </div>
          <div className={`${card} bg-emerald-500/5 p-3`}>
            <span className="font-mono text-[10px] tracking-widest text-emerald-400">Listeners</span>
            <div className="mt-3 space-y-1.5">
              <span className="block rounded bg-emerald-500/10 px-2 py-2 font-mono text-[11px] tracking-wide text-emerald-300">
                FulfillOrder → Subscription
              </span>
              <span className="block rounded bg-emerald-500/10 px-2 py-2 font-mono text-[11px] tracking-wide text-emerald-300">+ AI quota reset</span>
              <span className="block rounded bg-black/20 px-2 py-2 font-mono text-[11px] tracking-wide text-dim">NotifyUser → mail</span>
            </div>
          </div>
        </div>
        <span className="text-center font-mono text-[10px] tracking-wide text-dim">idempotent via provider_ref UNIQUE · Cache::lock 60s</span>
      </div>
    )
  if (index === 3)
    return (
      <div className={wrap}>
        <div className="grid w-full grid-cols-1 items-stretch gap-3 lg:grid-cols-[1.1fr_auto_1fr]">
          <div className={`${card} p-4`}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500 text-[13px] leading-none text-white">AI</span>
              <div>
                <span className="block font-mono text-[11px] tracking-widest text-violet-300">llama-3.3-70b</span>
                <span className="block font-mono text-[10px] tracking-wide text-dim">Groq · max 32k</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <span className="rounded bg-black/20 px-2 py-2 text-center font-mono text-[10px] tracking-wide text-dim">md5(city+days)</span>
              <span className="rounded bg-amber-500/10 px-2 py-2 text-center font-mono text-[10px] tracking-wide text-amber-300">60m remember</span>
            </div>
          </div>
          <div className="hidden flex-col items-center justify-center gap-2 lg:flex">
            <span className="rounded-full bg-amber-500/15 px-2 py-1 font-mono text-[10px] tracking-wide text-amber-300">md5</span>
            <span className="h-8 w-px bg-gradient-to-b from-amber-500/30 via-violet-500/30 to-emerald-500/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          </div>
          <div className={`${card} p-4`}>
            <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Cache hit
            </span>
            <span className="mt-1.5 block rounded bg-emerald-500/10 px-3 py-2 text-center font-mono text-[11px] tracking-wide text-emerald-300">
              → 0 quota burned
            </span>
            <span className="mt-3 flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Cache miss
            </span>
            <span className="mt-1.5 block rounded bg-amber-500/10 px-3 py-2 text-center font-mono text-[11px] tracking-wide text-amber-300">
              consumeQuota → Groq → fallback
            </span>
            <span className="mt-2 block text-center font-mono text-[10px] tracking-wide text-dim">WHERE count &lt; limit atomic</span>
          </div>
        </div>
      </div>
    )
  if (index === 4)
    return (
      <div className={`${card} flex w-full flex-col gap-4 p-4 sm:flex-row sm:items-center`}>
        <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-full border-2 border-emerald-500/30 bg-emerald-500/10 mx-auto sm:mx-0">
          <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
          <span className="font-mono text-[10px] font-bold tracking-widest text-emerald-400">GET /up</span>
          <span className="font-mono text-[10px] tracking-wide text-dim">probe</span>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-2">
          <div className="rounded-lg border border-emerald-500/15 bg-black/20 p-3 text-center">
            <span className="block font-mono text-[10px] tracking-widest text-dim">DB</span>
            <span className="mt-1.5 block h-1 rounded-full bg-emerald-500/40" />
            <span className="mt-1.5 block font-mono text-[11px] tracking-wide text-emerald-300">up</span>
          </div>
          <div className="rounded-lg border border-emerald-500/15 bg-black/20 p-3 text-center">
            <span className="block font-mono text-[10px] tracking-widest text-dim">Queue</span>
            <span className="mt-1.5 block h-1 rounded-full bg-emerald-500/40" />
            <span className="mt-1.5 block font-mono text-[11px] tracking-wide text-emerald-300">up</span>
          </div>
          <div className="rounded-lg border border-emerald-500/15 bg-black/20 p-3 text-center">
            <span className="block font-mono text-[10px] tracking-widest text-dim">Cache</span>
            <span className="mt-1.5 block h-1 rounded-full bg-emerald-500/40" />
            <span className="mt-1.5 block font-mono text-[11px] tracking-wide text-emerald-300">up</span>
          </div>
        </div>
        <span className="mx-auto shrink-0 rounded-full bg-emerald-500 px-4 py-2 font-mono text-[11px] font-bold tracking-wide text-black sm:mx-0">200 OK</span>
      </div>
    )
  if (index === 5)
    return (
      <div className={`${card} flex w-full flex-col gap-3 p-3 sm:flex-row sm:items-stretch`}>
        <div className="flex flex-1 flex-col rounded-lg border border-white/5 bg-black/20 p-3">
          <span className="font-mono text-[10px] tracking-widest text-dim">storage/logs/laravel.log — tail -f</span>
          <div className="mt-3 space-y-1.5 font-mono text-[11px] leading-relaxed">
            <span className="block rounded bg-sky-500/10 px-2 py-1.5 text-sky-300">[2026-08-26] PaymentSucceeded order #80</span>
            <span className="block rounded bg-emerald-500/10 px-2 py-1.5 text-emerald-300">→ mail queued · webhook verified · HMAC ✓</span>
            <span className="block rounded bg-white/5 px-2 py-1.5 text-dim">$ pail --filter=payment --follow</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-row items-center justify-center gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/10 p-3 sm:w-[120px] sm:flex-col">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/20 bg-black/20 font-mono text-[12px] text-emerald-400">◐</span>
          <span className="font-mono text-[10px] tracking-widest text-emerald-400">pail</span>
          <span className="hidden h-px w-full bg-emerald-500/20 sm:block" />
          <span className="h-full w-px bg-emerald-500/20 sm:hidden" />
          <span className="font-mono text-[10px] tracking-wide text-dim">real-time</span>
          <span className="rounded bg-black/20 px-2 py-1 font-mono text-[10px] tracking-wide text-dim">array cache</span>
        </div>
      </div>
    )
  if (index === 6)
    return (
      <div className={`${card} flex w-full flex-col gap-4 p-4 sm:flex-row sm:items-center`}>
        <div className="flex flex-1 flex-col gap-2">
          <span className="font-mono text-[10px] tracking-widest text-dim">TELESCOPE_ENABLED=true — opt-in</span>
          <div className="flex flex-wrap gap-1.5">
            {["query", "request", "job", "mail", "model", "cache"].map((w) => (
              <span
                key={w}
                className="rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] tracking-wide text-emerald-300"
              >
                {w}
              </span>
            ))}
          </div>
          <span className="rounded bg-black/20 px-3 py-2 font-mono text-[10px] tracking-wide text-dim">local only · NEVER prod unless restricted</span>
        </div>
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center mx-auto sm:mx-0">
          <span className="absolute inset-0 rounded-full border border-emerald-500/20" />
          <span className="absolute inset-3 rounded-full border border-dashed border-emerald-500/20 animate-[spin-slow_10s_linear_infinite]" />
          <span className="h-12 w-12 rounded-full bg-emerald-500/10 shadow-[inset_0_0_12px_rgba(16,185,129,0.15)]" />
          <span className="absolute font-mono text-[11px] tracking-widest text-emerald-400">◉</span>
        </div>
      </div>
    )
  if (index === 7)
    return (
      <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { t: "welcome", d: "logo + boarding pass", c: "amber" },
          { t: "booked", d: "trip #42", c: "emerald" },
          { t: "paid", d: "Order 80 · HMAC ✓", c: "emerald" },
          { t: "failed", d: "PaymentFailed", c: "rose" },
          { t: "review", d: "AI quota 12/30", c: "violet" },
          { t: "fork", d: "TripForked", c: "sky" },
          { t: "verify", d: "signed 60m", c: "amber" },
          { t: "welcome", d: "preview", c: "dim" },
        ].map((b, i) => (
          <div
            key={b.t + i}
            className="fx-boot flex flex-col rounded-xl border border-white/5 bg-[#0c1322] p-3 shadow-sm"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <span
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-[12px] ${b.c === "amber" ? "bg-amber-500/15 text-amber-300" : b.c === "emerald" ? "bg-emerald-500/15 text-emerald-300" : b.c === "rose" ? "bg-rose-500/15 text-rose-300" : b.c === "violet" ? "bg-violet-500/15 text-violet-300" : "bg-sky-500/15 text-sky-300"}`}
            >
              ✉
            </span>
            <span className="mt-2 text-center font-mono text-[11px] tracking-wide text-text">{b.t}</span>
            <span className="truncate text-center font-mono text-[10px] tracking-wide text-dim">{b.d}</span>
          </div>
        ))}
      </div>
    )
  return null
}
