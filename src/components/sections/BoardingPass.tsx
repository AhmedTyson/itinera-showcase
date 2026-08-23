import { forwardRef } from "react"
import { Plane, Calendar, Clock, CheckCircle2 } from "lucide-react"
import { generateBarcodeSvg } from "../../lib/barcode"
import type { Flight } from "../../lib/flights"

type Props = {
  flight: Flight | null
  onCopy?: (text: string) => void
}

/* Airport-code resolution — verbatim from legacy boarding.js */
function resolveCode(str?: string | null): string {
  if (!str) return "ASF"
  const s = String(str).toUpperCase()
  if (s.includes("CAIRO") || s.includes("EGYPT")) return "CAI"
  if (s.includes("ASF")) return "ASF"
  if (s.includes("MRV")) return "MRV"
  return s.replace(/[^A-Z]/g, "").slice(0, 3) || "ASF"
}

function parseDate(v?: string): Date {
  const src = v ? v.replace(" ", "T") : "2026-08-05T00:12:00"
  const d = new Date(src)
  return Number.isNaN(d.getTime()) ? new Date("2026-08-05T00:12:00") : d
}
const fD = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
const fT = (d: Date) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase()

/** Faithful port of legacy boarding.js bpRender() — main ticket + perforated divider + stub. */
export const BoardingPass = forwardRef<HTMLDivElement, Props>(function BoardingPass({ flight }, ref) {
  const airline = flight?.airline || "EGYPTAIR"
  const flightNo = flight?.flightNumber || "EG-102"
  const price = "$" + (flight?.price ?? 117.48).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const origin = flight?.from || "ASF"
  const dest = flight?.to || "MRV"
  const oCode = resolveCode(origin)
  const dCode = resolveCode(dest)
  const dep = parseDate(flight?.departure)
  const arr = parseDate(flight?.arrival)
  const depDate = fD(dep)
  const depTime = fT(dep)
  const arrDT = `${fD(arr)} · ${fT(arr)}`

  return (
    <div ref={ref} className="bp-wrap" aria-label={`Boarding pass for flight ${flightNo}`}>
      {/* barber-pole hazard strip */}
      <div className="bp-head" aria-hidden="true" />

      <div className="bp-body">
        {/* ── main section ── */}
        <div className="bp-main">
          {/* header row: airline identity · boarding-pill + price */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.08)", paddingBottom: 10, position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(251,191,36,.12)", border: "1px solid rgba(251,191,36,.28)", display: "grid", placeItems: "center", color: "#fbbf24" }}>
                <Plane size={16} style={{ transform: "rotate(-20deg)" }} aria-hidden />
              </div>
              <div>
                <div style={{ fontWeight: 900, letterSpacing: "-.02em", fontSize: 18, lineHeight: 1, color: "#fff" }}>{airline}</div>
                <div className="bp-kicker" style={{ fontSize: 9 }}>Direct commercial flight · {flightNo}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "#fbbf24", background: "rgba(251,191,36,.12)", border: "1px solid rgba(251,191,36,.22)", padding: "3px 8px", borderRadius: 999 }}>Boarding pass</span>
              <div className="bp-price" style={{ marginTop: 4, fontSize: 16 }}>{price}</div>
            </div>
          </div>

          {/* route row: FROM · plane-line · TO */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", padding: "14px 0", position: "relative", zIndex: 1 }}>
            <div>
              <div className="bp-kicker">From:</div>
              <div className="bp-code">{oCode}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.9)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{origin}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={11} color="#fbbf24" aria-hidden /> {depDate} · {depTime}
              </div>
            </div>

            <div style={{ textAlign: "center", minWidth: 140 }}>
              <div className="bp-kicker">Boarding time</div>
              <div style={{ fontWeight: 900, color: "#fbbf24", fontFamily: "var(--font-mono)", fontSize: 14 }}>{depTime}</div>
              <div style={{ position: "relative", height: 22, display: "flex", alignItems: "center", justifyContent: "center", margin: "6px 0" }}>
                <div style={{ width: "100%", height: 2, background: "linear-gradient(90deg,rgba(251,191,36,.18),#fbbf24,rgba(251,191,36,.18))", borderRadius: 999 }} />
                <span className="bp-plane"><Plane size={11} aria-hidden /></span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <CheckCircle2 size={11} aria-hidden /> Direct Non-Stop Flight
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div className="bp-kicker">To:</div>
              <div className="bp-code">{dCode}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.9)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dest}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                <Clock size={11} color="#fbbf24" aria-hidden /> {arrDT}
              </div>
            </div>
          </div>

          {/* passenger strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr .5fr .5fr .6fr", gap: 8, borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 10, fontSize: 11, position: "relative", zIndex: 1 }}>
            <div><div className="bp-kicker">Passenger</div><div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#fff" }}>CUSTOMER PASSENGER</div></div>
            <div><div className="bp-kicker">Flight</div><div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#fff" }}>{flightNo}</div></div>
            <div><div className="bp-kicker">Seat</div><div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#fbbf24" }}>15F</div></div>
            <div><div className="bp-kicker">Gate</div><div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#fff" }}>12</div></div>
            <div><div className="bp-kicker">Terminal</div><div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#fff" }}>2B</div></div>
          </div>
        </div>

        {/* perforation + notches */}
        <div className="bp-divider" aria-hidden="true">
          <span className="bp-notch top" />
          <span className="bp-notch bottom" />
        </div>

        {/* ── stub ── */}
        <div className="bp-stub">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.08)", paddingBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", color: "#fbbf24" }}>Boarding pass</span>
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 800, background: "rgba(251,191,36,.12)", border: "1px solid rgba(251,191,36,.22)", color: "#fde68a", padding: "2px 6px", borderRadius: 6 }}>{flightNo}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
            <div><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Passenger</div><div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#fff" }}>CUSTOMER Passe…</div></div>
            <div><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Class</div><div style={{ fontWeight: 800, color: "#fbbf24" }}>FIRST CLASS</div></div>
            <div><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>From</div><div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#fff" }}>{oCode}</div></div>
            <div><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>To</div><div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#fff" }}>{dCode}</div></div>
            <div><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Date</div><div style={{ fontWeight: 600, color: "rgba(255,255,255,.8)" }}>{depDate}</div></div>
            <div><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Time</div><div style={{ fontWeight: 600, color: "rgba(255,255,255,.8)" }}>{depTime}</div></div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 10, textAlign: "center" }}>
            <div dangerouslySetInnerHTML={{ __html: generateBarcodeSvg(`${flightNo} ${oCode}→${dCode}`) }} />
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,.35)", marginTop: 4, letterSpacing: ".08em" }}>ETKT 8820 9140 2814</div>
          </div>
        </div>
      </div>
    </div>
  )
})
BoardingPass.displayName = "BoardingPass"
