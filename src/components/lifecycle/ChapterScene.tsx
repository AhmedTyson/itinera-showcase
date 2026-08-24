import type { LifecycleChapter } from "../../lib/lifecycle-content"

/**
 * Line-art scene per chapter — schematic language: accent strokes,
 * secondary #3a4358 structure, .lc-draw geometry animates via dashoffset,
 * .lc-fade labels fade in. All inside viewBox 0 0 900 420.
 */

const SEC = "#3a4358"
const TXT = "#e8eaed"
const DIM = "#9aa3c2"

function Request({ a }: { a: string }) {
  return (
    <>
      <rect className="lc-draw" x="60" y="140" width="230" height="150" rx="12" stroke={SEC} fill="none" strokeWidth="1.5" />
      <circle className="lc-fade" cx="82" cy="162" r="4" fill={DIM} />
      <circle className="lc-fade" cx="98" cy="162" r="4" fill={DIM} />
      <circle className="lc-fade" cx="114" cy="162" r="4" fill={DIM} />
      <line className="lc-draw" x1="60" y1="180" x2="290" y2="180" stroke={SEC} />
      <rect className="lc-fade" x="80" y="200" width="150" height="10" rx="5" fill={SEC} opacity="0.5" />
      <rect className="lc-fade" x="80" y="222" width="110" height="10" rx="5" fill={SEC} opacity="0.35" />
      <text className="lc-fade" x="80" y="262" fill={DIM} fontSize="12" fontFamily="monospace">vanilla client · fetch()</text>
      <path className="lc-draw" d="M 290 215 C 420 215, 480 210, 580 210" stroke={a} strokeWidth="2" fill="none" />
      <path className="lc-draw" d="M 580 210 l -14 -7 v 14 Z" fill={a} />
      <circle className="lc-fade" cx="435" cy="213" r="5" fill={a} opacity="0.9" />
      <text className="lc-fade" x="380" y="190" fill={a} fontSize="12" fontFamily="monospace">POST /api/checkout</text>
      <rect className="lc-draw" x="620" y="140" width="220" height="150" rx="12" stroke={a} fill="none" strokeWidth="1.5" strokeDasharray="4 5" />
      <text className="lc-fade" x="730" y="205" textAnchor="middle" fill={TXT} fontSize="14" fontFamily="monospace">itinari.up.railway.app</text>
      <text className="lc-fade" x="730" y="228" textAnchor="middle" fill={DIM} fontSize="11" fontFamily="monospace">:443 · waiting…</text>
    </>
  )
}

function Router({ a }: { a: string }) {
  const routes = [
    { y: 90, label: "/login" },
    { y: 160, label: "/flights" },
    { y: 230, label: "/checkout", hot: true },
    { y: 300, label: "/admin" },
  ]
  return (
    <>
      <rect className="lc-draw" x="60" y="180" width="150" height="60" rx="10" stroke={TXT} fill="none" strokeWidth="1.5" />
      <text className="lc-fade" x="135" y="215" textAnchor="middle" fill={TXT} fontSize="13" fontFamily="monospace">request</text>
      {routes.map((r) => (
        <g key={r.label}>
          <path
            className="lc-draw"
            d={`M 210 210 C 280 210, 300 ${r.y}, 380 ${r.y}`}
            stroke={r.hot ? a : SEC}
            strokeWidth={r.hot ? 2 : 1.5}
            fill="none"
          />
          <rect className="lc-fade" x="380" y={r.y - 18} width="170" height="36" rx="8" stroke={r.hot ? a : SEC} fill="none" />
          <text className="lc-fade" x="396" y={r.y + 5} fill={r.hot ? a : DIM} fontSize="12" fontFamily="monospace">{r.label}</text>
        </g>
      ))}
      <rect className="lc-fade" x="580" y="205" width="260" height="50" rx="10" stroke={a} fill="none" strokeDasharray="3 4" />
      <text className="lc-fade" x="710" y="227" textAnchor="middle" fill={a} fontSize="11" fontFamily="monospace">pipeline: throttle → auth → run</text>
      <text className="lc-fade" x="710" y="245" textAnchor="middle" fill={DIM} fontSize="10" fontFamily="monospace">routes/api.php · 90 routes</text>
    </>
  )
}

function Guard({ a }: { a: string }) {
  return (
    <>
      <path className="lc-draw" d="M 450 60 L 330 100 V 210 C 330 280, 450 340, 450 340 C 450 340, 570 280, 570 210 V 100 Z" stroke={a} strokeWidth="2" fill="none" />
      <circle className="lc-draw" cx="450" cy="170" r="46" stroke={TXT} fill="none" strokeWidth="1.5" />
      <text className="lc-fade" x="450" y="166" textAnchor="middle" fill={TXT} fontSize="11" fontFamily="monospace">JWT</text>
      <text className="lc-fade" x="450" y="184" textAnchor="middle" fill={DIM} fontSize="10" fontFamily="monospace">HS512</text>
      {[
        { x: 40, y: 130, t: "sub: 27" },
        { x: 700, y: 130, t: "role: super_admin" },
        { x: 40, y: 260, t: "exp: 3600s" },
        { x: 700, y: 260, t: "blacklist: clean" },
      ].map((c) => (
        <g key={c.t} className="lc-fade">
          <line className="lc-draw" x1={c.x < 450 ? 335 : 565} y1="170" x2={c.x < 450 ? c.x + 155 : c.x - 155} y2={c.y} stroke={SEC} strokeDasharray="3 4" />
          <rect x={c.x} y={c.y - 16} width="160" height="32" rx="8" stroke={SEC} fill="none" />
          <text x={c.x + 14} y={c.y + 4} fill={DIM} fontSize="11" fontFamily="monospace">{c.t}</text>
        </g>
      ))}
      <text className="lc-fade" x="450" y="390" textAnchor="middle" fill={a} fontSize="12" fontFamily="monospace">✓ signature verified · blacklist clean</text>
    </>
  )
}

function Throttle({ a }: { a: string }) {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} className="lc-fade" cx={110 + (i % 3) * 50} cy={130 + Math.floor(i / 3) * 64} r="10" stroke={TXT} fill="none" strokeWidth="1.5" />
      ))}
      <text className="lc-fade" x="160" y="280" textAnchor="middle" fill={DIM} fontSize="11" fontFamily="monospace">incoming hits</text>
      {[0, 1, 2].map((i) => (
        <path key={i} className="lc-draw" d={`M 300 ${140 + i * 50} H 425`} stroke={a} strokeWidth="1.5" fill="none" opacity={0.75 - i * 0.15} />
      ))}
      <rect className="lc-draw" x="435" y="80" width="140" height="220" rx="12" stroke={a} fill="none" strokeWidth="1.5" />
      <rect className="lc-fade" x="445" y="180" width="120" height="110" rx="6" fill={a} opacity="0.18" />
      <line className="lc-draw" x1="445" y1="180" x2="565" y2="180" stroke={a} strokeDasharray="4 4" />
      <text className="lc-fade" x="505" y="170" textAnchor="middle" fill={DIM} fontSize="10" fontFamily="monospace">ceiling</text>
      <text className="lc-fade" x="505" y="325" textAnchor="middle" fill={DIM} fontSize="11" fontFamily="monospace">sliding window · 60/min</text>
      <path className="lc-draw" d="M 585 190 H 700" stroke={SEC} strokeWidth="1.5" fill="none" />
      <rect className="lc-fade" x="700" y="160" width="120" height="60" rx="10" stroke={SEC} fill="none" />
      <text className="lc-fade" x="760" y="195" textAnchor="middle" fill={TXT} fontSize="12" fontFamily="monospace">Checkout</text>
      <text className="lc-fade" x="505" y="55" textAnchor="middle" fill={a} fontSize="13" fontFamily="monospace">6 / 60 consumed — allowed</text>
    </>
  )
}

function Validation({ a }: { a: string }) {
  const fields = [
    { t: "amount", ok: true },
    { t: "trip_id · exists", ok: true },
    { t: "strategy · in: set", ok: true },
    { t: "coupon · invalid", ok: false },
  ]
  return (
    <>
      <rect className="lc-draw" x="250" y="55" width="400" height="290" rx="14" stroke={TXT} fill="none" strokeWidth="1.5" />
      <text className="lc-fade" x="285" y="95" fill={TXT} fontSize="14" fontFamily="monospace">StoreCheckoutRequest</text>
      <line className="lc-draw" x1="250" y1="113" x2="650" y2="113" stroke={SEC} />
      {fields.map((f, i) => (
        <g key={f.t} className="lc-fade">
          <rect x="285" y={132 + i * 48} width="330" height="34" rx="8" stroke={f.ok ? SEC : "#fb7185"} fill="none" />
          <text x="300" y={154 + i * 48} fill={DIM} fontSize="12" fontFamily="monospace">{f.t}</text>
          {f.ok ? (
            <path className="lc-draw" d={`M 583 ${149 + i * 48} l 6 6 l 10 -12`} stroke={a} strokeWidth="2" fill="none" />
          ) : (
            <>
              <path className="lc-draw" d={`M 578 ${141 + i * 48} l 14 14 M 592 ${141 + i * 48} l -14 14`} stroke="#fb7185" strokeWidth="2" />
              <text x="285" y={200 + i * 48} fill="#fb7185" fontSize="10" fontFamily="monospace">422 · "coupon": ["invalid"]</text>
            </>
          )}
        </g>
      ))}
      <text className="lc-fade" x="450" y="385" textAnchor="middle" fill={DIM} fontSize="11" fontFamily="monospace">a miss never touches a service</text>
    </>
  )
}

function Controller({ a }: { a: string }) {
  return (
    <>
      {[
        { y: 110, t: "intent" },
        { y: 200, t: "user" },
        { y: 290, t: "request body" },
      ].map((inp) => (
        <g key={inp.t}>
          <text className="lc-fade" x="110" y={inp.y - 10} fill={DIM} fontSize="11" fontFamily="monospace">{inp.t}</text>
          <path className="lc-draw" d={`M 110 ${inp.y} H 330`} stroke={SEC} strokeWidth="1.5" fill="none" />
          <path className="lc-draw" d={`M 330 ${inp.y} l -12 -6 v 12 Z`} fill={SEC} />
        </g>
      ))}
      <rect className="lc-draw" x="350" y="90" width="90" height="240" rx="14" stroke={a} fill="none" strokeWidth="2" />
      <text className="lc-fade" x="395" y="205" textAnchor="middle" fill={a} fontSize="12" fontFamily="monospace" transform="rotate(-90 395 205)">CONTROLLER</text>
      <path className="lc-draw" d="M 440 210 H 690" stroke={a} strokeWidth="2.5" fill="none" />
      <path className="lc-draw" d="M 690 210 l -16 -8 v 16 Z" fill={a} />
      <text className="lc-fade" x="565" y="190" textAnchor="middle" fill={DIM} fontSize="11" fontFamily="monospace">delegates → service</text>
      <text className="lc-fade" x="450" y="385" textAnchor="middle" fill={DIM} fontSize="11" fontFamily="monospace">zero business logic in the HTTP layer</text>
    </>
  )
}

function Service({ a }: { a: string }) {
  const nodes = [
    { y: 90, t: "Paymob" },
    { y: 210, t: "Groq AI" },
    { y: 330, t: "Mail queue" },
  ]
  return (
    <>
      <circle className="lc-draw" cx="360" cy="210" r="95" stroke={a} fill="none" strokeWidth="2" strokeDasharray="6 6" />
      <text className="lc-fade" x="360" y="204" textAnchor="middle" fill={TXT} fontSize="15" fontFamily="monospace">Checkout</text>
      <text className="lc-fade" x="360" y="226" textAnchor="middle" fill={TXT} fontSize="15" fontFamily="monospace">Service</text>
      <text className="lc-fade" x="360" y="335" textAnchor="middle" fill={DIM} fontSize="10" fontFamily="monospace">transaction open</text>
      <rect className="lc-fade" x="90" y="182" width="150" height="56" rx="10" stroke={SEC} fill="none" />
      <text className="lc-fade" x="165" y="215" textAnchor="middle" fill={DIM} fontSize="12" fontFamily="monospace">strategy</text>
      <path className="lc-draw" d="M 240 210 H 262" stroke={a} strokeWidth="1.5" fill="none" />
      {nodes.map((n, i) => (
        <g key={n.t}>
          <path className="lc-draw" d={`M 455 210 C 545 210, 560 ${n.y}, 630 ${n.y}`} stroke={a} strokeWidth="1.5" fill="none" opacity={0.85 - i * 0.1} />
          <rect className="lc-fade" x="630" y={n.y - 24} width="170" height="48" rx="10" stroke={a} fill="none" />
          <text className="lc-fade" x="715" y={n.y + 5} textAnchor="middle" fill={TXT} fontSize="12" fontFamily="monospace">{n.t}</text>
        </g>
      ))}
      <text className="lc-fade" x="450" y="395" textAnchor="middle" fill={DIM} fontSize="11" fontFamily="monospace">idempotency key: merchant_order_id</text>
    </>
  )
}

function Persistence({ a }: { a: string }) {
  return (
    <>
      <rect className="lc-draw" x="70" y="150" width="190" height="120" rx="12" stroke={TXT} fill="none" strokeWidth="1.5" />
      <text className="lc-fade" x="165" y="200" textAnchor="middle" fill={TXT} fontSize="13" fontFamily="monospace">Repository</text>
      <text className="lc-fade" x="165" y="222" textAnchor="middle" fill={DIM} fontSize="10" fontFamily="monospace">interface + impl</text>
      <path className="lc-draw" d="M 260 210 H 375" stroke={a} strokeWidth="1.5" fill="none" />
      <path className="lc-draw" d="M 375 210 l -12 -6 v 12 Z" fill={a} />
      <rect className="lc-draw" x="385" y="150" width="180" height="120" rx="12" stroke={a} fill="none" strokeWidth="1.5" />
      <text className="lc-fade" x="475" y="200" textAnchor="middle" fill={TXT} fontSize="13" fontFamily="monospace">Eloquent</text>
      <text className="lc-fade" x="475" y="222" textAnchor="middle" fill={DIM} fontSize="10" fontFamily="monospace">Order::create()</text>
      <path className="lc-draw" d="M 565 210 H 650" stroke={SEC} strokeWidth="1.5" fill="none" />
      <ellipse className="lc-draw" cx="740" cy="150" rx="90" ry="22" stroke={SEC} fill="none" strokeWidth="1.5" />
      <path className="lc-draw" d="M 650 150 V 265 C 650 280, 695 290, 740 290 C 785 290, 830 280, 830 265 V 150" stroke={SEC} fill="none" strokeWidth="1.5" />
      <rect className="lc-fade" x="670" y="220" width="140" height="16" rx="4" fill={a} opacity="0.25" />
      <text className="lc-fade" x="740" y="232" textAnchor="middle" fill={a} fontSize="10" fontFamily="monospace">orders · row #60</text>
      <text className="lc-fade" x="450" y="395" textAnchor="middle" fill={DIM} fontSize="11" fontFamily="monospace">FulfillOrderListener settles · mail queued</text>
    </>
  )
}

function Ok({ a }: { a: string }) {
  return (
    <>
      <circle className="lc-draw" cx="450" cy="195" r="120" stroke={a} fill="none" strokeWidth="1.5" opacity="0.5" />
      <circle className="lc-draw" cx="450" cy="195" r="88" stroke={a} fill="none" strokeWidth="2" />
      <path className="lc-draw" d="M 410 195 l 28 30 l 56 -62" stroke={a} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect className="lc-fade" x="330" y="330" width="240" height="44" rx="10" stroke={SEC} fill="none" transform="rotate(-6 450 352)" />
      <text className="lc-fade" x="450" y="358" textAnchor="middle" fill={a} fontSize="16" fontWeight="700" fontFamily="monospace" transform="rotate(-6 450 352)">200 OK · DELIVERED</text>
      <text className="lc-fade" x="450" y="60" textAnchor="middle" fill={DIM} fontSize="12" fontFamily="monospace">{"{ success: true, message, data }"}</text>
      <text className="lc-fade" x="450" y="85" textAnchor="middle" fill={DIM} fontSize="10" fontFamily="monospace">envelope · 38ms · ticket issued</text>
    </>
  )
}

const SCENES: Record<LifecycleChapter["scene"], (p: { a: string }) => React.ReactElement> = {
  request: Request,
  router: Router,
  guard: Guard,
  throttle: Throttle,
  validation: Validation,
  controller: Controller,
  service: Service,
  persistence: Persistence,
  ok: Ok,
}

export function ChapterScene({ chapter }: { chapter: LifecycleChapter }) {
  const Art = SCENES[chapter.scene]
  return (
    <svg viewBox="0 0 900 420" className="w-full max-w-[880px]" role="img" aria-label={`${chapter.title} — lifecycle scene`}>
      <Art a={chapter.accent} />
    </svg>
  )
}
