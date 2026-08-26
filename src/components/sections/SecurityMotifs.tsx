export function SecurityMotif({ index }: { index: number | null }) {
  if (index === null) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 opacity-40">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-emerald-500/20" />
          <span className="absolute inset-3 rounded-full border border-dashed border-emerald-500/20 animate-[spin-slow_10s_linear_infinite]" />
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">◆</span>
        </div>
        <span className="font-mono text-[10px] tracking-[0.18em] text-dim">PERIMETER — HOVER A RING</span>
      </div>
    )
  }

  // 0 — Rate Limiting
  if (index === 0) return (
    <div className="flex h-full w-full items-center justify-center p-1">
      <div className="flex h-[168px] w-[320px] flex-col overflow-hidden rounded-xl border border-emerald-500/20 bg-[#0c1322] shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-emerald-500/10 bg-emerald-500/5 px-3 py-1.5">
          <span className="font-mono text-[7px] tracking-[0.14em] text-emerald-400">9 LIMITERS · SLIDING WINDOW 60s</span>
          <span className="rounded-full bg-rose-500/15 px-1.5 py-0.5 font-mono text-[7px] font-bold tracking-wide text-rose-400">429</span>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-1 p-2">
          {[
            ["login", "5/min", "IP+email", true],
            ["register", "5/min", "IP", true],
            ["api", "60/min", "user", true],
            ["ai", "dynamic", "day", true],
            ["maps", "10/min", "IP", true],
            ["weather", "30/min", "IP", true],
            ["checkout", "5/min", "user", true],
            ["contacts", "5/min", "IP", true],
            ["newsletter", "5/min", "IP", false],
          ].map(([k, v, sub, on], i) => (
            <div key={k as string} className="fx-boot flex flex-col justify-center rounded-md border border-white/5 bg-white/[0.03] px-1.5 py-1" style={{ animationDelay: `${i * 0.07}s` }}>
              <span className="font-mono text-[6.5px] tracking-wide text-emerald-300/90">{k as string}</span>
              <span className="font-mono text-[6px] tracking-wide text-dim">{v as string} {sub as string}</span>
              <i className={`mt-1 block h-0.5 rounded ${on ? "bg-emerald-400/60" : "bg-white/10"}`} />
            </div>
          ))}
        </div>
        <div className="relative flex h-8 items-end gap-[2px] border-t border-emerald-500/10 bg-black/20 px-2 pb-1 pt-1">
          <div className="pointer-events-none absolute inset-x-2 top-1 h-px border-t border-dashed border-rose-500/30" />
          {[48, 72, 88, 122, 78, 98, 58, 104, 68, 118, 82, 96].map((h, i) => (
            <i key={i} className={`fx-bar flex-1 rounded-t-[2px] ${h > 100 ? "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]" : "bg-gradient-to-t from-emerald-500/20 to-emerald-400"}`} style={{ height: `${Math.min(h, 100)}%`, animationDelay: `${i * 0.08}s` } as React.CSSProperties} />
          ))}
        </div>
      </div>
    </div>
  )

  // 1 — Global Exception
  if (index === 1) return (
    <div className="flex h-full w-full items-center justify-center p-1">
      <div className="flex h-[168px] w-[320px] overflow-hidden rounded-xl border border-emerald-500/20 bg-[#0c1322] shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-1.5 border-b border-white/5 bg-white/[0.03] px-2.5 py-1.5">
            <i className="h-2 w-2 rounded-full bg-rose-400/60" />
            <i className="h-2 w-2 rounded-full bg-amber-400/60" />
            <i className="h-2 w-2 rounded-full bg-emerald-400/60" />
            <span className="ml-auto font-mono text-[6px] tracking-widest text-dim">ApiExceptionHandler.php</span>
          </div>
          <div className="p-2.5 font-mono text-[7.5px] leading-relaxed">
            <div className="rounded-md bg-black/30 p-2">
              <span className="text-dim">{"{"}</span> <span className="text-sky-300">"error"</span>
              <span className="text-dim">: {"{"}</span>
              <br />
              <span className="pl-3 text-sky-300">"type"</span>
              <span className="text-dim">: </span>
              <span className="text-amber-300">"ValidationException"</span>
              <span className="text-dim">,</span>
              <br />
              <span className="pl-3 text-sky-300">"status"</span>
              <span className="text-dim">: </span>
              <span className="text-emerald-300">422</span>
              <span className="text-dim">,</span>
              <br />
              <span className="pl-3 text-sky-300">"errors"</span>
              <span className="text-dim">: [</span>
              <span className="text-emerald-300">{"{field,message}"}</span>
              <span className="text-dim">]</span>
              <br />
              <span className="text-dim">{"}"} {"}"}</span>
            </div>
            <span className="mt-1.5 block text-center font-mono text-[6px] tracking-wide text-dim/70">timestamp · never HTML</span>
          </div>
        </div>
        <div className="flex w-20 flex-col gap-1 border-l border-white/5 bg-black/20 p-1.5">
          {[
            ["401", "Auth", "rose"],
            ["403", "RBAC", "rose"],
            ["404", "NotFound", "amber"],
            ["405", "Method", "amber"],
            ["409", "Conflict", "violet"],
            ["422", "Validation", "emerald"],
          ].map(([c, l, col]) => (
            <span key={c} className={`rounded px-1 py-0.5 text-center font-mono text-[6px] tracking-wide ${col === "emerald" ? "bg-emerald-500/15 text-emerald-300" : col === "rose" ? "bg-rose-500/10 text-rose-300" : col === "violet" ? "bg-violet-500/10 text-violet-300" : "bg-amber-500/10 text-amber-300"}`}>{c} {l}</span>
          ))}
        </div>
      </div>
    </div>
  )

  // 2 — HMAC Webhook
  if (index === 2) return (
    <div className="flex h-full w-full items-center justify-center gap-2 p-1">
      <div className="flex h-[120px] w-[96px] flex-col rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-[#0c1322] p-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        <span className="font-mono text-[6px] tracking-widest text-amber-400">PAYLOAD</span>
        <div className="mt-2 space-y-1">
          <i className="block h-1.5 w-full rounded bg-amber-500/20" />
          <i className="block h-1.5 w-3/4 rounded bg-white/10" />
          <i className="block h-1.5 w-5/6 rounded bg-white/5" />
        </div>
        <span className="mt-auto rounded bg-black/30 px-1.5 py-1 font-mono text-[6px] leading-relaxed text-amber-300/70">merchant_order_id: 80</span>
      </div>
      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-dashed border-emerald-500/25 animate-[spin-slow_8s_linear_infinite]" />
        <span className="absolute inset-2 rounded-full border border-emerald-500/10" />
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-[9px] font-bold tracking-wide text-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.18)]">HMAC</span>
        <span className="absolute -bottom-1 rounded-full bg-black/40 px-1.5 py-0.5 font-mono text-[6px] tracking-wide text-emerald-400">SHA-512</span>
      </div>
      <div className="flex h-[120px] w-[96px] flex-col items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-2 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-[11px] leading-none text-black">✓</span>
        <span className="mt-2 font-mono text-[8px] font-bold tracking-wide text-emerald-300">VERIFIED</span>
        <span className="font-mono text-[6px] tracking-wide text-emerald-500/60">lock 60s · 200 OK</span>
        <span className="mt-2 h-px w-full bg-emerald-500/20" />
        <span className="font-mono text-[6px] tracking-wide text-dim">fail-fast if empty</span>
      </div>
    </div>
  )

  // 3 — JWT
  if (index === 3) return (
    <div className="flex h-full w-full items-center justify-center gap-3 p-1">
      <div className="flex w-[170px] flex-col overflow-hidden rounded-xl border border-emerald-500/20 bg-[#0c1322] shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
        <div className="flex gap-1 border-b border-white/5 bg-white/[0.03] px-2.5 py-1.5">
          <i className="h-1.5 w-1.5 rounded-full bg-rose-400/60" />
          <i className="h-1.5 w-1.5 rounded-full bg-amber-400/60" />
          <i className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
          <span className="ml-auto font-mono text-[6px] tracking-widest text-dim">JWT ANATOMY</span>
        </div>
        <div className="flex gap-1 p-2">
          <span className="flex-1 rounded bg-sky-500/15 py-1 text-center font-mono text-[7px] text-sky-300">header</span>
          <span className="flex-1 rounded bg-violet-500/15 py-1 text-center font-mono text-[7px] text-violet-300">payload</span>
          <span className="flex-1 rounded bg-emerald-500/15 py-1 text-center font-mono text-[7px] text-emerald-300">signature</span>
        </div>
        <div className="mx-2 rounded bg-black/30 p-1.5 font-mono text-[7px] leading-relaxed">
          <span className="text-dim">sub:</span> <span className="text-emerald-300">usr_9f8a…</span>
          <br />
          <span className="text-dim">exp:</span> <span className="text-amber-300">3600s</span> <span className="text-dim">→ blacklist</span>
        </div>
        <div className="px-2 pb-2 pt-1">
          <span className="block text-center font-mono text-[6px] tracking-wide text-dim">stateless · tymon/jwt-auth</span>
        </div>
      </div>
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-emerald-500/15 bg-emerald-500/5">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(16,185,129,0.12)" strokeWidth="3" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="#34d399" strokeWidth="3" strokeDasharray="276" strokeDashoffset="46" className="opacity-80" />
        </svg>
        <div className="flex flex-col items-center">
          <span className="font-mono text-[7px] tracking-widest text-dim">1h BEARER</span>
          <span className="mt-0.5 rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wide text-emerald-300">REFRESH</span>
        </div>
      </div>
    </div>
  )

  // 4 — RBAC
  if (index === 4) return (
    <div className="flex h-full w-full items-center justify-center p-1">
      <div className="flex w-[320px] flex-col overflow-hidden rounded-xl border border-emerald-500/20 bg-[#0c1322] shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2 border-b border-white/5 bg-emerald-500/5 px-3 py-1.5">
          <span className="font-mono text-[7px] tracking-widest text-dim">ROUTES-PERMISSIONS-AUDIT.md</span>
          <span className="ml-auto rounded bg-amber-500/15 px-1 py-0.5 font-mono text-[6px] tracking-wide text-amber-300">spatie · 4 roles</span>
        </div>
        <div className="grid grid-cols-[1fr_36px_36px_36px] gap-px bg-white/5 p-px font-mono text-[7.5px]">
          <span className="bg-[#0c1322] px-2 py-1.5 tracking-wide text-dim">ROUTE</span>
          <span className="bg-[#0c1322] px-1 py-1.5 text-center tracking-wide text-dim">USR</span>
          <span className="bg-[#0c1322] px-1 py-1.5 text-center tracking-wide text-dim">AGN</span>
          <span className="bg-[#0c1322] px-1 py-1.5 text-center tracking-wide text-dim">ADM</span>
          {( [
            ["GET /profile", "●", "●", "●", false],
            ["POST /agency/trips", "○", "●", "●", true],
            ["DELETE /users", "○", "○", "●", false],
            ["GET /admin/reports", "○", "○", "●", false],
          ] as [string, string, string, string, boolean][]).map(([r, a, b, c, gold]) => (
            <>
              <span key={r + "r"} className={`px-2 py-1.5 ${gold ? "bg-amber-500/10 text-amber-300 font-bold" : "bg-[#0c1322] text-muted"}`}>{r}</span>
              <span key={r + "a"} className={`py-1.5 text-center ${a === "●" ? "bg-emerald-500/10 text-emerald-400" : "bg-[#0c1322] text-dim/30"}`}>{a}</span>
              <span key={r + "b"} className={`py-1.5 text-center ${b === "●" ? "bg-emerald-500/10 text-emerald-400" : "bg-[#0c1322] text-dim/30"}`}>{b}</span>
              <span key={r + "c"} className={`py-1.5 text-center ${c === "●" ? "bg-emerald-500/10 text-emerald-400" : "bg-[#0c1322] text-dim/30"}`}>{c}</span>
            </>
          ))}
        </div>
        <div className="border-t border-amber-500/15 bg-amber-500/10 px-3 py-1 font-mono text-[6px] tracking-wide text-amber-300">super_admin → Gate::before implicit ✓ — no per-route assignment needed</div>
      </div>
    </div>
  )

  // 5 — Email Gate
  if (index === 5) return (
    <div className="flex h-full w-full items-center justify-center p-1">
      <div className="relative flex w-[320px] items-center gap-2 rounded-xl border border-emerald-500/15 bg-[#0c1322] p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-1 flex-col gap-1 rounded-lg border border-white/5 bg-black/20 p-2.5">
          <span className="font-mono text-[7px] tracking-widest text-dim">SIGNED URL</span>
          <span className="truncate font-mono text-[7px] tracking-wide text-emerald-300">/verify?expires=60m&amp;sig=…</span>
          <span className="rounded bg-amber-500/10 px-1 py-0.5 font-mono text-[6px] tracking-wide text-amber-300/70">no auto-trust OAuth</span>
        </div>
        <div className="relative flex h-12 w-8 shrink-0 items-center justify-center">
          <span className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-white/10" />
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-rose-500/60 bg-rose-500/15 text-[10px] leading-none text-rose-400">✕</span>
          <span className="absolute -bottom-1 rounded bg-rose-500/15 px-1 py-0.5 font-mono text-[6px] tracking-wide text-rose-400">403</span>
        </div>
        <div className="h-px w-6 shrink-0 bg-white/10" />
        <div className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[11px] leading-none text-black">✓</span>
          <span className="font-mono text-[7px] tracking-widest text-emerald-300">VERIFIED</span>
          <span className="font-mono text-[6px] tracking-wide text-emerald-500/60">4-state + 60s throttle</span>
        </div>
      </div>
    </div>
  )

  // 6 — FormRequest
  if (index === 6) return (
    <div className="flex h-full w-full items-center justify-center gap-2 p-1">
      <div className="flex w-[150px] flex-col gap-1 rounded-xl border border-emerald-500/15 bg-[#0c1322] p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
        <span className="font-mono text-[7px] tracking-widest text-dim">StoreCheckoutRequest</span>
        {( [
          ["type", "in:plan…", true],
          ["idempotency_key", "max:64", true],
          ["amount", "numeric", true],
          ["coupon", "exists", false],
        ] as [string, string, boolean][]).map(([k, v, ok]) => (
          <div key={k} className={`flex items-center justify-between rounded-md border px-2 py-1 font-mono text-[7px] ${ok ? "border-emerald-500/15 bg-emerald-500/5 text-emerald-300" : "border-rose-500/20 bg-rose-500/10 text-rose-300"}`}>
            <span>{k}</span>
            <span className="tracking-wide text-dim">{v}</span>
            <span className={`ml-1 h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-rose-400"}`} />
          </div>
        ))}
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        <span className="h-6 w-px bg-emerald-500/30" />
        <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[7px] tracking-wide text-emerald-400">validate</span>
        <span className="h-6 w-px bg-emerald-500/30" />
      </div>
      <div className="flex w-[120px] flex-col gap-1 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5">
        <span className="font-mono text-[7px] tracking-widest text-amber-400">422 FIELD BAG</span>
        <div className="rounded-md bg-black/30 p-2 font-mono text-[7px] leading-relaxed text-amber-300">
          {"{"} <span className="text-sky-300">"field"</span>
          <span className="text-dim">: </span>
          {"\"email\""}
          <br />
          <span className="text-dim">message: </span>
          {"\"required\""}
          <br />
          {"}"}
        </div>
        <span className="font-mono text-[6px] tracking-wide text-dim">zero drift 106 ops</span>
      </div>
    </div>
  )

  // 7 — Idempotency
  if (index === 7) return (
    <div className="flex h-full w-full items-center justify-center gap-2 p-1">
      <div className="flex w-[110px] flex-col gap-1.5">
        <div className="rounded-lg border border-emerald-500/15 bg-[#0c1322] px-2.5 py-2">
          <span className="font-mono text-[7px] tracking-widest text-emerald-400">Req 1</span>
          <span className="mt-1 block truncate font-mono text-[7px] tracking-wide text-dim">idemp-a1b2</span>
          <span className="mt-1 inline-block rounded bg-emerald-500/15 px-1 py-0.5 font-mono text-[6px] tracking-wide text-emerald-300">NEW → Order 80</span>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-2">
          <span className="font-mono text-[7px] tracking-widest text-amber-400">Req 2 · retry</span>
          <span className="mt-1 block truncate font-mono text-[7px] tracking-wide text-dim">idemp-a1b2</span>
          <span className="mt-1 inline-block rounded bg-amber-500/15 px-1 py-0.5 font-mono text-[6px] tracking-wide text-amber-300">DUP → REUSED</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        <span className="h-5 w-px bg-emerald-500/30" />
        <span className="rounded-full border border-emerald-500/20 bg-[#0c1322] px-2 py-1 font-mono text-[7px] tracking-wide text-emerald-400">DB GUARD</span>
        <span className="h-px w-6 bg-emerald-500/40" />
        <span className="font-mono text-[6px] tracking-wide text-amber-300">UNIQUE</span>
        <span className="h-5 w-px bg-emerald-500/30" />
      </div>
      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10">
        <span className="font-mono text-[10px] font-bold tracking-wide text-emerald-300">REUSED</span>
        <span className="font-mono text-[6px] tracking-wide text-dim">client_secret</span>
      </div>
    </div>
  )

  // 8 — AI Quota
  if (index === 8) return (
    <div className="flex h-full w-full items-center justify-center gap-3 p-1">
      <div className="flex w-[140px] flex-col gap-1.5 rounded-xl border border-emerald-500/15 bg-[#0c1322] p-2.5">
        <span className="font-mono text-[7px] tracking-widest text-dim">CACHE KEY 60m</span>
        <span className="truncate font-mono text-[7px] tracking-wide text-amber-300">md5(city+days+style)</span>
        <div className="mt-1 grid grid-cols-4 gap-1">
          {[1, 0, 0, 0].map((a, i) => (
            <span key={i} className={`rounded border py-2 text-center font-mono text-[7px] ${a ? "border-amber-500/30 bg-amber-500/15 text-amber-300" : "border-white/5 bg-black/20 text-dim/40"}`}>AI</span>
          ))}
        </div>
        <span className="font-mono text-[6px] tracking-wide text-emerald-500/60">hit → 0 quota</span>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        <span className="h-5 w-px bg-white/10" />
        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[7px] tracking-wide text-amber-300">md5</span>
        <span className="h-5 w-px bg-white/10" />
      </div>
      <div className="flex w-[140px] flex-col gap-1 rounded-xl border border-emerald-500/15 bg-[#0c1322] p-2.5">
        <span className="flex items-center gap-1 font-mono text-[7px] tracking-widest text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> AiUsageService
        </span>
        <span className="font-mono text-[7px] tracking-wide text-dim">WHERE count &lt; limit</span>
        <span className="font-mono text-[7px] tracking-wide text-emerald-300">atomic + fallback</span>
        <span className="mt-1 font-mono text-[6px] tracking-wide text-dim">deterministic itinerary</span>
      </div>
    </div>
  )
  return null
}
