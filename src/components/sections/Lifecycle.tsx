const STEPS = [
  { title: "Checkout initiate", desc: "POST /checkout/initiate — strategy factory resolves Subscription | TripFork | TripPackage." },
  { title: "Intention created", desc: "PaymobGateway builds intention → returns clientSecret (bounded 30s cURL)." },
  { title: "Hosted checkout", desc: "Client redirects to unifiedcheckout; no card data touches our servers." },
  { title: "HMAC webhook", desc: "SHA-512 signature verified first; prod fails fast if PAYMOB_HMAC empty." },
  { title: "Fulfillment event", desc: "FulfillOrderListener settles orders/subscriptions/forks idempotently." },
  { title: "Receipt & mail", desc: "PaymentSuccess/Failed mails queued; ledger rows immutable." },
]

type Props = {
  activeIndex?: number
}

export function Lifecycle({ activeIndex = 0 }: Props) {
  return (
    <ol role="list" aria-label="Payments lifecycle — 6 verified hops" className="grid gap-3 md:grid-cols-3">
      {STEPS.map((step, i) => (
        <li
          key={step.title}
          role="listitem"
          aria-current={i === activeIndex ? "step" : undefined}
          className={`rounded-xl border p-4 transition-all ${i === activeIndex ? "border-primary/40 bg-primary/5 shadow-md" : "border-border bg-white/[0.02] hover:border-border-strong"}`}
        >
          <div className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold ${i === activeIndex ? "bg-primary text-bg-0" : "bg-white/5 text-dim"}`}>{i + 1}</span>
            <h4 className="text-sm font-semibold text-text">{step.title}</h4>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-dim">{step.desc}</p>
        </li>
      ))}
    </ol>
  )
}

export { STEPS }
