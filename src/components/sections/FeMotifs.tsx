/* §03 flip-back motifs v2 — each card reveals a miniature LIVE DEMO of its
   subject. Pure CSS choreography; runs only while the parent .fe-flip is
   hovered / focused / flipped (play-state gated in index.css). */

export function FeBackMotif({ index }: { index: number }) {
  switch (index) {
    /* ── SURFACES · four product screens booting in sequence ── */
    case 0:
      return (
        <div className="fe-motif relative z-10 w-full max-w-[300px]" aria-hidden>
          <div className="grid grid-cols-2 gap-2.5">
            {/* catalog */}
            <span className="fx-boot relative block h-[74px] rounded-lg border border-primary/25 bg-[#0c1322] p-1.5" style={{ animationDelay: "0s" }}>
              <i className="mb-1 block h-1 w-8 rounded bg-primary/60" />
              <span className="grid grid-cols-3 gap-1">
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <i key={n} className="block h-4 rounded-sm bg-gradient-to-br from-primary/25 to-primary/5" />
                ))}
              </span>
              <em className="absolute -bottom-4 left-1 not-italic font-mono text-[7.5px] tracking-[0.14em] text-dim">PUBLIC</em>
            </span>
            {/* customer app */}
            <span className="fx-boot relative block h-[74px] rounded-lg border border-teal-300/25 bg-[#0c1322] p-1.5" style={{ animationDelay: ".35s" }}>
              <i className="mb-1 block h-1 w-6 rounded bg-teal-300/60" />
              {[0, 1, 2].map((n) => (
                <span key={n} className="mb-1 flex items-center gap-1">
                  <i className="h-2.5 w-2.5 rounded-full bg-teal-300/30" />
                  <i className="block h-1 flex-1 rounded bg-white/10" />
                </span>
              ))}
              <em className="absolute -bottom-4 left-1 not-italic font-mono text-[7.5px] tracking-[0.14em] text-dim">APP /*</em>
            </span>
            {/* agency */}
            <span className="fx-boot relative block h-[74px] rounded-lg border border-violet-300/25 bg-[#0c1322] p-1.5" style={{ animationDelay: ".7s" }}>
              <span className="mb-1 flex gap-1">
                <i className="h-3 w-3 rounded-md bg-violet-300/40" />
                <i className="block h-1 w-10 self-center rounded bg-white/10" />
              </span>
              <span className="grid grid-cols-2 gap-1">
                {[0, 1, 2, 3].map((n) => (
                  <i key={n} className="block h-3.5 rounded-sm border border-white/10 bg-white/[.04]" />
                ))}
              </span>
              <em className="absolute -bottom-4 left-1 not-italic font-mono text-[7.5px] tracking-[0.14em] text-dim">AGENCY ×7</em>
            </span>
            {/* admin */}
            <span className="fx-boot relative block h-[74px] rounded-lg border border-rose-300/25 bg-[#0c1322] p-1.5" style={{ animationDelay: "1.05s" }}>
              <i className="mb-1 block h-1 w-9 rounded bg-rose-300/60" />
              <span className="flex items-end gap-[3px] h-8">
                {[40, 70, 55, 90, 65, 80].map((h, n) => (
                  <i key={n} className="fx-bar flex-1 rounded-t-sm bg-gradient-to-t from-rose-300/20 to-rose-300/70" style={{ height: `${h}%`, animationDelay: `${1.1 + n * 0.12}s` }} />
                ))}
              </span>
              <em className="absolute -bottom-4 left-1 not-italic font-mono text-[7.5px] tracking-[0.14em] text-dim">ADMIN ×11</em>
            </span>
          </div>
          <span className="fx-chip mt-6 inline-block rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-[9px] tracking-[0.18em] text-primary">
            48+ PAGES · 1 DESIGN SYSTEM
          </span>
        </div>
      )

    /* ── MOTION · a real GSAP timeline, self-running ── */
    case 1:
      return (
        <div className="fe-motif relative z-10 w-full max-w-[300px]" aria-hidden>
          {/* rolling counter */}
          <div className="mb-3 flex items-baseline justify-center gap-1 font-mono">
            <span className="fx-digit text-3xl font-bold text-primary tabular-nums">48</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-dim">pages animated</span>
          </div>
          {/* stagger wave */}
          <div className="flex h-12 items-end justify-center gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <i key={n} className="fx-wave w-3 rounded-t-md bg-gradient-to-t from-primary/20 via-primary/70 to-primary" style={{ animationDelay: `${n * 0.09}s` }} />
            ))}
          </div>
          {/* tilt card + orbiting spark */}
          <div className="relative mx-auto mt-4 h-10 w-24 [perspective:300px]">
            <span className="fx-tilt absolute inset-0 rounded-md border border-teal-300/40 bg-teal-300/10" />
            <span className="fx-spark absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-teal-300 shadow-[0_0_12px_3px_rgba(45,212,191,.5)]" />
          </div>
          <span className="mt-3 block font-mono text-[8.5px] uppercase tracking-[0.24em] text-dim">
            timeline ▸ stagger ▸ tilt3d ▸ roll-up
          </span>
        </div>
      )

    /* ── LIVE DATA · weather radar with city blips + ticker ── */
    case 2:
      return (
        <div className="fe-motif relative z-10 w-full max-w-[300px]" aria-hidden>
          <div className="relative mx-auto h-36 w-36">
            <span className="absolute inset-0 rounded-full border border-teal-300/25" />
            <span className="absolute inset-4 rounded-full border border-teal-300/15" />
            <span className="absolute inset-9 rounded-full border border-teal-300/10" />
            {/* crosshairs */}
            <i className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-teal-300/10" />
            <i className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-teal-300/10" />
            {/* sweep with trail */}
            <span className="fx-sweep absolute inset-0 rounded-full" />
            {/* blips + labels */}
            {[
              { x: "68%", y: "26%", city: "DXB", d: "0s" },
              { x: "24%", y: "38%", city: "CAI", d: "1.05s" },
              { x: "58%", y: "70%", city: "LHR", d: "2.1s" },
              { x: "34%", y: "62%", city: "NYC", d: "3.1s" },
            ].map((b) => (
              <span key={b.city} className="absolute" style={{ left: b.x, top: b.y }}>
                <i className="fx-blip block h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_2px_rgba(52,211,153,.45)]" style={{ animationDelay: b.d }} />
                <em className="absolute left-2.5 top-[-3px] not-italic font-mono text-[7.5px] tracking-[0.12em] text-teal-200/90 fx-label" style={{ animationDelay: b.d }}>{b.city}</em>
              </span>
            ))}
            <i className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300" />
          </div>
          {/* ticker */}
          <span className="fx-ticker mt-3 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/5 px-3 py-1 font-mono text-[10px] text-teal-200">
            <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" />
            <b className="fx-temp-city tabular-nums">DXB 34°C</b>
            <span className="text-dim">· wind 12km/h</span>
          </span>
        </div>
      )

    /* ── IDENTITY UX · verification toast over a mini app window ── */
    case 3:
      return (
        <div className="fe-motif relative z-10 w-full max-w-[300px]" aria-hidden>
          {/* mini app window */}
          <span className="relative block h-28 rounded-t-lg border border-b-0 border-border/70 bg-[#0c1322]">
            <span className="flex items-center gap-1.5 border-b border-border/60 px-2.5 py-1.5">
              <i className="h-1.5 w-1.5 rounded-full bg-rose-400/70" />
              <i className="h-1.5 w-1.5 rounded-full bg-amber-400/70" />
              <i className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
              <i className="ml-2 block h-1 w-16 rounded bg-white/10" />
            </span>
            <span className="space-y-1.5 p-3">
              <i className="block h-1.5 w-3/4 rounded bg-white/10" />
              <i className="block h-1.5 w-1/2 rounded bg-white/[.07]" />
              <span className="fx-field mt-2 block h-6 w-2/3 rounded-md border border-primary/30 bg-primary/[.06]" />
            </span>
            {/* the toast */}
            <span className="fx-toast absolute -right-2 bottom-[-30px] z-10 flex items-center gap-2.5 rounded-lg border border-emerald-400/40 bg-[#0d1a16] px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,.6)]">
              <svg viewBox="0 0 16 16" className="h-5 w-5 text-emerald-400" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" opacity=".35" />
                <path className="fx-check" d="M4.6 8.4 L7 10.8 L11.6 5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-left">
                <b className="block text-[10.5px] leading-tight text-text">Email verified</b>
                <i className="not-italic font-mono text-[8px] text-dim">resend · 60s throttle</i>
              </span>
              <span className="fx-resend relative ml-1 flex h-6 w-6 items-center justify-center rounded-full border border-primary/40">
                <svg viewBox="0 0 24 24" className="h-3 w-3 text-primary" fill="none"><path d="M4 4v6h6M20 20v-6h-6M20 9A8 8 0 0 0 5.6 5.6L4 10m0 5a8 8 0 0 0 14.4 3.4L20 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                <i className="fx-count absolute inset-0 rounded-full border-2 border-transparent border-t-primary" />
              </span>
            </span>
          </span>
          <em className="mt-9 block font-mono text-[8.5px] uppercase tracking-[0.22em] text-dim">
            97 pages · 4-state success flows
          </em>
        </div>
      )

    /* ── COMMERCE · boarding pass printing with route flight ── */
    case 4:
      return (
        <div className="fe-motif relative z-10 w-full max-w-[300px]" aria-hidden>
          <div className="fx-pass relative rounded-xl border border-primary/40 bg-gradient-to-br from-[#141d33] to-[#0c1322] p-3 text-left shadow-[0_16px_40px_rgba(0,0,0,.55)]">
            <span className="flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.2em] text-primary/80">
              <b>Itinari airways</b>
              <b className="rounded-sm bg-primary px-1.5 py-px font-bold text-black">GOLD</b>
            </span>
            {/* route + traveling plane */}
            <span className="relative my-3 block h-6">
              <i className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 border-t border-dashed border-primary/40" />
              <b className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-[11px] font-bold text-text">CAI</b>
              <b className="absolute right-0 top-1/2 -translate-y-1/2 font-mono text-[11px] font-bold text-text">DXB</b>
              <svg className="fx-plane absolute top-1/2 h-4 w-4 -translate-y-1/2 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z" />
              </svg>
            </span>
            <span className="flex items-end justify-between">
              <span className="flex gap-3 font-mono text-[8px] text-dim">
                <span>SEAT <b className="block text-[10px] text-primary">1A</b></span>
                <span>GATE <b className="block text-[10px] text-primary">B7</b></span>
                <span>BOARD <b className="block text-[10px] text-primary">21:40</b></span>
              </span>
              {/* barcode */}
              <span className="flex items-end gap-[2px] h-7">
                {[3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2].map((w, n) => (
                  <i key={n} className="fx-code w-[2.5px] bg-text/80" style={{ height: "100%", width: `${w}px`, animationDelay: `${n * 0.06}s` }} />
                ))}
              </span>
            </span>
            {/* perforation */}
            <i className="absolute left-1/2 top-0 h-full w-px border-l border-dashed border-primary/25" />
          </div>
          <em className="fx-shine mt-3 block font-mono text-[8.5px] uppercase tracking-[0.22em] text-dim">
            printable · rendered from live flight data
          </em>
        </div>
      )

    /* ── BRAND · one mark, every surface ── */
    default:
      return (
        <div className="fe-motif relative z-10 w-full max-w-[300px]" aria-hidden>
          <div className="relative mx-auto h-36 w-36">
            {/* orbit ring */}
            <span className="absolute inset-0 rounded-full border border-dashed border-primary/25" />
            {/* orbiting chips */}
            {[
              { label: "favicon", d: "0s" },
              { label: "nav", d: "-1.5s" },
              { label: "mail", d: "-3s" },
              { label: "pdf", d: "-4.5s" },
            ].map((o) => (
              <span key={o.label} className="fx-orbit absolute left-1/2 top-1/2" style={{ animationDelay: o.d }}>
                <em className="not-italic rounded-md border border-primary/35 bg-[#101a2c] px-1.5 py-0.5 font-mono text-[7.5px] tracking-[0.1em] text-primary/90 shadow-md -translate-x-1/2 -translate-y-1/2">
                  {o.label}
                </em>
              </span>
            ))}
            {/* center mark — the REAL Itinera logo, with shine sweep */}
            <span className="fx-mark absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-[#0c1322] shadow-[0_0_30px_-2px_rgba(251,191,36,.7)] overflow-hidden border border-primary/40">
              <img
                src="/logo-mark.png"
                alt=""
                loading="eager"
                className="h-12 w-12 object-contain drop-shadow-[0_0_10px_rgba(251,191,36,.45)]"
              />
              <i className="fx-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </span>
          </div>
          <em className="mt-4 block font-mono text-[8.5px] uppercase tracking-[0.24em] text-dim">
            one mark → every surface, in sync
          </em>
        </div>
      )
  }
}
