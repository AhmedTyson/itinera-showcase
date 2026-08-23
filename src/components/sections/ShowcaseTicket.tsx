import { Plane } from "lucide-react"
import { generateBarcodeSvg } from "../../lib/barcode"
import { useScrollTo } from "../../hooks/useScrollTo"

/**
 * ShowcaseTicket — the hero artifact. Same boarding-pass anatomy as §05's
 * flight ticket (bp-* classes), but every field narrates the engineering
 * journey: DEV→PRD, flight ITN-213, gate :8000, terminal RAILWAY.
 * ETKT carries the real backend monorepo HEAD short-hash.
 */
export function ShowcaseTicket() {
  const scrollTo = useScrollTo()

  return (
    <div className="bp-wrap" aria-label="Boarding pass into the Itinera codebase">
      <div className="bp-head" aria-hidden="true" />

      <div className="bp-body">
        <div className="bp-main">
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.08)", paddingBottom: 10, position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(251,191,36,.12)", border: "1px solid rgba(251,191,36,.28)", display: "grid", placeItems: "center", color: "#fbbf24" }}>
                <Plane size={16} style={{ transform: "rotate(-20deg)" }} aria-hidden />
              </div>
              <div>
                <div style={{ fontWeight: 900, letterSpacing: "-.02em", fontSize: 18, lineHeight: 1, color: "#fff" }}>ITINERA ENGINEERING</div>
                <div className="bp-kicker" style={{ fontSize: 9 }}>Showcasing flight · ITN-213</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "#fbbf24", background: "rgba(251,191,36,.12)", border: "1px solid rgba(251,191,36,.22)", padding: "3px 8px", borderRadius: 999 }}>Boarding pass</span>
              <div className="bp-price" style={{ marginTop: 4, fontSize: 16 }}>v1.0</div>
            </div>
          </div>

          {/* route row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", padding: "14px 0", position: "relative", zIndex: 1 }}>
            <div>
              <div className="bp-kicker">From:</div>
              <div className="bp-code">DEV</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.9)", marginTop: 2 }}>git clone · monorepo</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginTop: 4 }}>2026-08-23 · HEAD checked out</div>
            </div>

            <div style={{ textAlign: "center", minWidth: 140 }}>
              <div className="bp-kicker">Setup time</div>
              <div style={{ fontWeight: 900, color: "#fbbf24", fontFamily: "var(--font-mono)", fontSize: 14 }}>~6 MIN</div>
              <div style={{ position: "relative", height: 22, display: "flex", alignItems: "center", justifyContent: "center", margin: "6px 0" }}>
                <div style={{ width: "100%", height: 2, background: "linear-gradient(90deg,rgba(251,191,36,.18),#fbbf24,rgba(251,191,36,.18))", borderRadius: 999 }} />
                <span className="bp-plane"><Plane size={11} aria-hidden /></span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#34d399" }}>✓ Direct Non-Stop Pipeline</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div className="bp-kicker">To:</div>
              <div className="bp-code">PRD</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.9)", marginTop: 2 }}>php artisan serve · :8000</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginTop: 4 }}>213 api routes armed</div>
            </div>
          </div>

          {/* manifest strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr .5fr .6fr .7fr", gap: 8, borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 10, fontSize: 11, position: "relative", zIndex: 1 }}>
            <div><div className="bp-kicker">Passenger</div><div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#fff" }}>TEAM 2 · ENGINEERS</div></div>
            <div><div className="bp-kicker">Flight</div><div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#fff" }}>ITN-213</div></div>
            <div><div className="bp-kicker">Seat</div><div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#fbbf24" }}>JWT</div></div>
            <div><div className="bp-kicker">Gate</div><div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#fff" }}>:8000</div></div>
            <div><div className="bp-kicker">Terminal</div><div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#fff" }}>RAILWAY</div></div>
          </div>
        </div>

        {/* perforation + notches */}
        <div className="bp-divider" aria-hidden="true">
          <span className="bp-notch top" />
          <span className="bp-notch bottom" />
        </div>

        {/* stub — interactive: barcode jumps to architecture */}
        <div className="bp-stub">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.08)", paddingBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", color: "#fbbf24" }}>Boarding pass</span>
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 800, background: "rgba(251,191,36,.12)", border: "1px solid rgba(251,191,36,.22)", color: "#fde68a", padding: "2px 6px", borderRadius: 6 }}>ITN-213</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
            <div><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Passenger</div><div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#fff" }}>DEVELOPER</div></div>
            <div><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Class</div><div style={{ fontWeight: 800, color: "#fbbf24" }}>FIRST CLASS</div></div>
            <div><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>From</div><div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#fff" }}>DEV</div></div>
            <div><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>To</div><div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#fff" }}>PRD</div></div>
            <div><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Date</div><div style={{ fontWeight: 600, color: "rgba(255,255,255,.8)" }}>2026-08-23</div></div>
            <div><div className="bp-kicker" style={{ color: "rgba(255,255,255,.4)" }}>Time</div><div style={{ fontWeight: 600, color: "rgba(255,255,255,.8)" }}>~6 MIN</div></div>
          </div>
          <button
            type="button"
            onClick={() => scrollTo("#architecture")}
            aria-label="Scan barcode — jump to system architecture"
            className="w-full border-t pt-2.5 text-center focus-visible:outline-none"
            style={{ borderTopColor: "rgba(255,255,255,.08)" }}
          >
            {/* eslint-disable-next-line react/no-danger */}
            <div dangerouslySetInnerHTML={{ __html: generateBarcodeSvg("ITINERA ITN-213 DEV→PRD") }} />
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,.35)", marginTop: 4, letterSpacing: ".08em" }}>ETKT 0C14 FA54 2814 · SCAN TO BOARD</div>
          </button>
        </div>
      </div>
    </div>
  )
}
