import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { Home as HomeIcon, Book } from "lucide-react"
import { gsap, ScrollTrigger } from "../lib/gsap"
import type { LifecycleChapter } from "../lib/lifecycle-content"
import { ChapterScene } from "../components/lifecycle/ChapterScene"
import { CTACircle } from "../components/ui/cta-circle"

type AccentKey = "amber" | "teal" | "violet" | "rose"

const ACCENTS: Record<AccentKey, string> = {
  amber: "#F5A623",
  teal: "#2DD4BF",
  violet: "#A78BFA",
  rose: "#fb7185",
}

const RAIL_LABELS: Record<string, string> = {
  request: "The Request",
  router: "Router",
  guard: "Guard",
  throttle: "Throttle",
  validation: "FormRequest",
  controller: "Controller",
  service: "Service",
  persistence: "Data",
  ok: "200 OK",
  webhook: "Webhook",
}

type Stage = {
  id: string
  accent: AccentKey
  trace: string
  tag: string
  title: string
  desc: [string] | [string, string] | [string, string, string, string]
  chips: string[]
  artifact: string
  scene: LifecycleChapter["scene"]
}

const ic = (d: string, a: string) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
    {d.split("|").map((p, i) => (
      <path key={i} d={p} stroke={a} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </svg>
)

export const LIFECYCLE_STAGES: Array<Stage & { icon: (a: string) => ReactNode }> = [
  {
    id: "request", accent: "amber", trace: "SESSION · request leaving the client →",
    tag: "Stage 01 · Client", title: "The Request",
    desc: ["A traveler taps Book in the vanilla client.", "fetch() opens a bearer-authenticated call into /api."],
    chips: ["fetch()", "Bearer auth", "/api/checkout"],
    artifact: "Authorization: Bearer eyJ0eXAiOiJKV1Qi...",
    scene: "request",
    icon: (a) => ic("M22 2 11 13|M22 2 15 22l-4-9-9-4Z", a),
  },
  {
    id: "router", accent: "amber", trace: "POST /checkout · route matched",
    tag: "Stage 02 · Routing", title: "The Router",
    desc: ["routes/api.php matches the path and assembles", "the middleware pipeline — throttle first, guard second."],
    chips: ["routes/api.php", "90 routes", "middleware pipeline"],
    artifact: "Route::post('/checkout') · throttle:checkout · auth:api",
    scene: "router",
    icon: (a) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="6" cy="6" r="3" stroke={a} strokeWidth="1.6" />
        <circle cx="18" cy="18" r="3" stroke={a} strokeWidth="1.6" />
        <path d="M6 9v6a3 3 0 0 0 3 3h6" stroke={a} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "guard", accent: "teal", trace: "auth:api · signature verified",
    tag: "Stage 03 · Authentication", title: "The Guard",
    desc: ["tymon/jwt-auth verifies the signature, checks the blacklist,", "resolves the user. A stolen token dies at its next refresh."],
    chips: ["tymon/jwt-auth", "HS512", "blacklist"],
    artifact: "auth:api → user #1 · super_admin",
    scene: "guard",
    icon: (a) => ic("M12 2 4 5.5v6c0 5 3.4 8.7 8 9.5 4.6-.8 8-4.5 8-9.5v-6L12 2Z|M9 12l2 2 4-4", a),
  },
  {
    id: "throttle", accent: "teal", trace: "throttle:checkout · 6/60 consumed",
    tag: "Stage 04 · Rate Limit", title: "The Throttle",
    desc: ["Per-user + per-IP sliding windows count the hit.", "Over the ceiling, the request never reaches business logic."],
    chips: ["per-user + IP", "sliding window", "CI-tested"],
    artifact: "throttle:checkout → 6 / 60 consumed",
    scene: "throttle",
    icon: (a) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke={a} strokeWidth="1.6" />
        <path d="M12 7v5l3.5 2" stroke={a} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "validation", accent: "amber", trace: "422 guard armed · fields checked",
    tag: "Stage 05 · Validation", title: "FormRequest",
    desc: ["StoreCheckoutRequest type-checks every field.", "A miss never touches a service — 422 with a field bag."],
    chips: ["FormRequest", "field bag", "zero drift"],
    artifact: '422 { "amount": ["must be numeric"] }',
    scene: "validation",
    icon: (a) => ic("M9 11l3 3L22 4|M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11", a),
  },
  {
    id: "controller", accent: "violet", trace: "controller → service · delegated",
    tag: "Stage 06 · Controller", title: "Thin Controller",
    desc: ["The controller validates intent, delegates, and returns.", "Zero business logic in the HTTP layer — grep-able routes only."],
    chips: ["thin", "ApiResponse", "zero logic"],
    artifact: "return ApiResponse::success(new CheckoutResource(...))",
    scene: "controller",
    icon: (a) => ic("M4 6h16M4 12h10M4 18h16", a),
  },
  {
    id: "service", accent: "violet", trace: "transaction open · paymob intention",
    tag: "Stage 07 · Service Layer", title: "The Service",
    desc: ["CheckoutService resolves the strategy, opens the transaction,", "calls Paymob — idempotency keyed on merchant_order_id."],
    chips: ["strategy", "transaction", "idempotency"],
    artifact: "Paymob::intention() → client_secret",
    scene: "service",
    icon: (a) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="3" stroke={a} strokeWidth="1.6" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke={a} strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    id: "persistence", accent: "teal", trace: "Order::create() · row written",
    tag: "Stage 08 · Persistence", title: "Repository → Model",
    desc: ["The contract-bound repository hands the row to Eloquent.", "The order is written; FulfillOrderListener picks it up."],
    chips: ["Eloquent", "contract-bound", "listener"],
    artifact: "Order::create() → FulfillOrderListener",
    scene: "persistence",
    icon: (a) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <ellipse cx="12" cy="6" rx="8" ry="3" stroke={a} strokeWidth="1.6" />
        <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" stroke={a} strokeWidth="1.6" />
        <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" stroke={a} strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: "ok", accent: "amber", trace: "STATUS 200 · trace complete",
    tag: "Stage 09 · Response", title: "200 OK",
    desc: ["The envelope ships — success, message, data.", "The ticket is issued. Trace complete."],
    chips: ["envelope", "38ms", "ticket issued"],
    artifact: '{ "success": true, "data": { ... } } · 38ms',
    scene: "ok",
    icon: (a) => ic("M22 11.08V12a10 10 0 1 1-5.93-9.14|M22 4 12 14.01l-3-3", a),
  },
  {
    id: "webhook", accent: "rose", trace: "paymob webhook · HMAC verified · settled",
    tag: "Stage 10 · Async", title: "The Webhook",
    desc: [
      "After the response, Paymob calls back — the transaction webhook.",
      "HMAC is verified, FulfillOrderListener settles the order, mail queues.",
    ],
    chips: ["HMAC verify", "FulfillOrderListener", "queue"],
    artifact: "webhook → HMAC ✓ → order settled · mail queued",
    scene: "webhook",
    icon: (a) => ic("M12 22V8|M12 8c-1.5 0-2.5-1-2.5-2.5v-3h5v3C14.5 7 13.5 8 12 8Z|M5 11h14v6a6 6 0 0 1-14 0Z", a),
  },
]

const STAGES = LIFECYCLE_STAGES
const STAGE_IDS = STAGES.map((s) => `stage-${s.id}`)

function StageSection({ stage, index }: { stage: Stage & { icon: (a: string) => ReactNode }; index: number }) {
  const a = ACCENTS[stage.accent]
  const chapter = { scene: stage.scene, accent: a } as LifecycleChapter
  return (
    <section id={`stage-${stage.id}`} data-accent={stage.accent} data-trace={stage.trace}>
      <div className="section-grid">
        <div>
          <div className="icon-wrap">{stage.icon(a)}</div>
          <div className="stage-tag">
            {stage.tag}
          </div>
          <h2 className="section-title">{stage.title}</h2>
          <div className="section-desc">
            {stage.desc.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="chip-row">
            {stage.chips.map((c) => (
              <span key={c} className="chip">{c}</span>
            ))}
          </div>
          <span className="artifact-tag">{stage.artifact}</span>
        </div>
        <div className="panel">
          <div className="panel-glow" aria-hidden />
          <div className="panel-cap">
            <span>Scene {String(index + 1).padStart(2, "0")}</span>
            <span className="cap-rule" aria-hidden />
            <span className="cap-id mono">{stage.id}</span>
          </div>
          <ChapterScene chapter={chapter} />
        </div>
      </div>
    </section>
  )
}

export default function LifecyclePage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<((secId: string) => void) | null>(null)

  /* Showcase page: animations always play. OS reduce-motion is intentionally
     ignored here; QA can still force the static path via ?motion=reduced. */
  const reducedMotion =
    typeof window !== "undefined" && /[?&]motion=reduced\b/.test(window.location.search)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // Manage scroll restoration to avoid scroll-jumps on reload
    let originalScrollRestoration: ScrollRestoration | undefined
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      originalScrollRestoration = window.history.scrollRestoration
      window.history.scrollRestoration = "manual"
    }

    // Bind ScrollTrigger to our snap container (matches prototype defaults)
    const scrollerEl = root.querySelector<HTMLDivElement>("#scroller")
    if (scrollerEl) ScrollTrigger.defaults({ scroller: scrollerEl })

    const traceText = root.querySelector<HTMLElement>("#traceText")
    const progressFill = root.querySelector<HTMLElement>("#progressFill")
    const counterRing = root.querySelector<SVGCircleElement>("#counterRing")

    /* ── activation: rail + accent + trace (typewriter) + counter/ring + progress ── */
    const railEl = root.querySelector<HTMLElement>("#rail")
    const rootEl = root
    const TOTAL_LABEL = String(STAGE_IDS.length).padStart(2, "0")
    let typeTimer: number | null = null
    function typeTrace(msg: string) {
      if (!traceText) return
      if (typeTimer !== null) window.clearInterval(typeTimer)
      traceText.textContent = ""
      let i = 0
      typeTimer = window.setInterval(() => {
        i += 1
        traceText.textContent = msg.slice(0, i)
        if (i >= msg.length && typeTimer !== null) {
          window.clearInterval(typeTimer)
          typeTimer = null
        }
      }, 14)
    }
    function setCounter(html: string, pct: number, accentHex: string) {
      const text = rootEl.querySelector("#counterText") as HTMLElement | null
      if (text) text.innerHTML = html
      if (counterRing) {
        counterRing.style.strokeDashoffset = `${100 - pct}`
        const svg = counterRing.parentElement
        if (svg) svg.style.color = accentHex
      }
      railEl?.style.setProperty("--rail-pct", String(pct / 100))
    }
    const heroSecEl = rootEl.querySelector<HTMLElement>("#lc-hero")
    const heroSvgEl = rootEl.querySelector<SVGSVGElement>("#lc-hero .hero-art")

    function activate(sec: HTMLElement) {
      const accentHex = ACCENTS[(sec.dataset.accent ?? "amber") as AccentKey]
      document.documentElement.style.setProperty("--accent", accentHex)

      /* perf: freeze hero's always-on SMIL/CSS loops while another stage shows */
      const isHero = sec.id === "lc-hero"
      heroSecEl?.classList.toggle("is-idle", !isHero)
      if (!heroSvgEl) {
        /* noop */
      } else if (isHero) {
        heroSvgEl.unpauseAnimations?.()
      } else {
        heroSvgEl.pauseAnimations?.()
      }
      railEl?.querySelectorAll<HTMLElement>(".rail-node").forEach((n) => {
        n.classList.toggle("active", n.dataset.target === `#${sec.id}`)
      })
      typeTrace(sec.dataset.trace ?? "")
      const pulse = rootEl.querySelector(".trace-log .pulse") as HTMLElement | null
      if (pulse) pulse.style.background = accentHex
      if (!progressFill) return

      progressFill.style.background = accentHex

      const idx = STAGE_IDS.indexOf(sec.id)
      if (idx > -1) {
        setCounter(`<b>${String(idx + 1).padStart(2, "0")}</b> / ${TOTAL_LABEL}`, ((idx + 1) / STAGE_IDS.length) * 100, accentHex)
        progressFill.style.width = `${((idx + 1) / STAGE_IDS.length) * 100}%`
        try {
          history.replaceState(null, "", `?stage=${sec.id.replace("stage-", "")}`)
        } catch {
          /* sandboxed contexts forbid history mutation — never fatal */
        }
      } else if (sec.id === "lc-hero") {
        setCounter(`<b>00</b> / ${TOTAL_LABEL}`, 0, accentHex)
        progressFill.style.width = "0%"
        try {
          history.replaceState(null, "", `?stage=hero`)
        } catch {
          /* never fatal */
        }
      } else if (sec.id === "outro") {
        setCounter(`<b>${TOTAL_LABEL}</b> / ${TOTAL_LABEL}`, 100, accentHex)
        progressFill.style.width = "100%"
      }
    }

        const timelines: gsap.core.Timeline[] = []
    const stInstances: ScrollTrigger[] = []
    /** Section start offsets (pinned stages report their trigger start). */
    const startOffset = new Map<string, number>()
    const sections = ["lc-hero", ...STAGE_IDS, "outro"]
      .map(id => root.querySelector<HTMLElement>(`#${id}`))
      .filter((el): el is HTMLElement => !!el)

    let currentIdx = 0

    const prepDraws = (sec: HTMLElement) => {
      const draws = sec.querySelectorAll<SVGGeometryElement>(".lc-draw")
      draws.forEach((p) => {
        try {
          const len = p.getTotalLength()
          p.style.strokeDasharray = `${len}`
          p.style.strokeDashoffset = `${len}`
        } catch {
          /* non-geometry */
        }
      })
      return draws
    }

    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches

    /* ── scrubbed scroll-driven model ──
       Native scrolling owns the playhead: each stage pins and its reveal is
       scrubbed across its own scroll distance. On mobile, we bypass pinning and
       scrubbing entirely, using simple top-triggered animations for fluid reading.
       Everything is built inside gsap.context so StrictMode's double-mount
       reverts cleanly. */
    const animCtx = gsap.context(() => {
    const buildStageTimeline = (
      sec: HTMLElement,
      draws: NodeListOf<SVGGeometryElement>,
      stVars: ScrollTrigger.Vars,
    ) => {
      if (isMobile) {
        // Mobile Animation: Simple play-once fade-in on enter, no scroll scrub
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec,
            scroller: scrollerEl,
            start: "top 78%",
            once: true,
            onToggle: (self) => {
              if (self.isActive) activate(sec)
            }
          }
        })
        tl.fromTo(
          sec.querySelectorAll(".icon-wrap, .stage-tag, .section-title, .section-desc p, .chip, .artifact-tag"),
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: "power1.out" }
        )
          .fromTo(sec.querySelector(".panel"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
          .to(draws, { strokeDashoffset: 0, duration: 0.8, stagger: 0.03, ease: "power1.inOut" }, "-=0.2")
          .fromTo(sec.querySelectorAll(".lc-fade"), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.03 }, "-=0.15")
        return tl
      }

      /* canonical wiring: scrollTrigger lives IN the timeline config */
      const tl = gsap.timeline({ defaults: { ease: "power2.out" }, scrollTrigger: stVars })
      /* immediateRender (default true): sections sit pre-hidden so the pin
         scrub reveals them — no finished-state flash before the pin engages */
      tl.from(
        sec.querySelectorAll(".icon-wrap, .stage-tag, .section-title, .section-desc p, .chip, .artifact-tag"),
        { opacity: 0, y: 18, stagger: 0.06, duration: 0.6 },
        0,
      )
        .from(sec.querySelector(".panel"), { opacity: 0, y: 30, duration: 0.6 }, 0.15)
        .to(draws, { strokeDashoffset: 0, duration: 0.9, stagger: 0.035, ease: "power2.inOut" }, 0.4)
        .from(sec.querySelectorAll(".lc-fade"), { autoAlpha: 0, duration: 0.35, stagger: 0.03 }, 0.75)

      const flows = sec.querySelectorAll<SVGPathElement>('.lc-flow, [data-flow="1"]')
      flows.forEach((path, fi) => {
        try {
          const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle")
          dot.setAttribute("r", "4.5")
          dot.setAttribute("fill", ACCENTS[(sec.dataset.accent ?? "amber") as AccentKey])
          dot.setAttribute("opacity", "0")
          dot.classList.add("lc-pulse-dot")
          path.parentNode?.appendChild(dot)
          const at = 1.05 + fi * 0.25
          tl.fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.15 }, at)
            .to(dot, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: 1.15, ease: "power1.inOut" } as never, at)
            .to(dot, { opacity: 0, duration: 0.15 })
        } catch {}
      })
      return tl
    }

    if (!reducedMotion) {
      STAGE_IDS.forEach((id) => {
        const sec = root.querySelector<HTMLElement>(`#${id}`)!
        const draws = prepDraws(sec)
        const tl = buildStageTimeline(sec, draws, {
          trigger: sec,
          scroller: scrollerEl,
          start: "top top",
          end: "+=80%",
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.45,
          /* the pin trigger owns chrome activation — a separate trigger on a
             pinned element mismeasures and makes the rail regress mid-scroll */
          onToggle: (self) => {
            if (!self.isActive) return
            activate(sec)
            currentIdx = STAGE_IDS.indexOf(id) + 1
          },
        })
        timelines.push(tl)
        if (tl.scrollTrigger) stInstances.push(tl.scrollTrigger as ScrollTrigger)
      })

      /* hero: entrance plays once on mount; exit scrubs out as you leave */
      gsap
        .timeline({ delay: 0.1, defaults: { ease: "power2.out" } })
        .from(".lc-hero .hero-title .line span", { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.09 })
        .from(".lc-hero .scroll-cue", { opacity: 0, duration: 0.6 }, "-=.3")

      const heroExit = gsap.to(".lc-hero .hero-title, .lc-hero .scroll-cue", {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: isMobile ? undefined : {
          trigger: "#lc-hero",
          scroller: scrollerEl,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onToggle: (self) => {
            if (!self.isActive) return
            activate(root.querySelector<HTMLElement>("#lc-hero")!)
            currentIdx = 0
          },
        } as ScrollTrigger.Vars,
      })
      if (heroExit.scrollTrigger) stInstances.push(heroExit.scrollTrigger as ScrollTrigger)

      // Mobile active trigger for hero
      if (isMobile && scrollerEl) {
        const mHeroTrig = ScrollTrigger.create({
          trigger: "#lc-hero",
          scroller: scrollerEl,
          start: "top top",
          end: "bottom top",
          onToggle: (self) => {
            if (self.isActive) activate(root.querySelector<HTMLElement>("#lc-hero")!)
          }
        })
        stInstances.push(mHeroTrig)
      }

      /* outro: reveal scrubs in while entering */
      const outroTl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: "#outro",
          scroller: scrollerEl,
          /* own the FULL tail through maxScroll: the old 'top 30%' end left the
             final stretch deactivated, so wrapping up from the hero landed on
             a dead rail. Reveal now completes exactly at the settled bottom. */
          start: isMobile ? "top 80%" : "top 85%",
          end: isMobile ? "top 30%" : "bottom bottom",
          scrub: isMobile ? false : true,
          once: isMobile ? true : false,
          onToggle: (self) => {
            if (!self.isActive) return
            activate(root.querySelector<HTMLElement>("#outro")!)
            currentIdx = sections.length - 1
          },
        } as ScrollTrigger.Vars,
      })
      outroTl.fromTo(
        "#outro .status-final, #outro .hero-title, #outro .hero-sub, #outro .chip",
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.6 },
      )
      if (outroTl.scrollTrigger) stInstances.push(outroTl.scrollTrigger as ScrollTrigger)
    }
    }, root) /* <- end gsap.context */

    /* ── chrome sync fallback (reduced-motion only): with no pins built, plain
          per-section triggers measure fine and keep the rail alive ── */
    if (reducedMotion) {
      sections.forEach((sec) => {
        stInstances.push(
          ScrollTrigger.create({
            trigger: sec,
            scroller: scrollerEl,
            start: "top center",
            end: "bottom center",
            onToggle: (self) => {
              if (!self.isActive) return
              activate(sec)
              currentIdx = sections.indexOf(sec)
            },
          }),
        )
      })
    }

    /* ── nav (rail / keyboard / deep link): land on each section's trigger start ──
       Priority: pin/scrub triggers define a section's true start. Plain chrome
       activation triggers ('top center') must never overwrite them — landing at
       the center line means arriving 300px early, while the section is still
       unpinned and mostly hidden (the "bugged rail"). */
    const refreshStarts = () => {
      startOffset.clear()
      const ordered = [...stInstances].sort(
        (a, b) => Number(b.animation != null) - Number(a.animation != null),
      )
      ordered.forEach((st) => {
        const trig = st.trigger as HTMLElement | null
        if (!trig?.id || typeof st.start !== "number") return
        if (!startOffset.has(trig.id)) startOffset.set(trig.id, st.start)
      })
    }
    refreshStarts()

    const goTo = (secId: string) => {
      const id = secId.startsWith("stage-") || secId === "lc-hero" || secId === "outro"
        ? secId
        : `stage-${secId}`
      const sec = sections.find(s => s.id === id)
      if (!sec || !scrollerEl) return
      const mapped = startOffset.get(id)
      const y = mapped ?? scrollerEl.scrollTop + (sec.getBoundingClientRect().top - scrollerEl.getBoundingClientRect().top)
      scrollerEl.scrollTo({ top: Math.max(0, y), behavior: reducedMotion ? "auto" : "smooth" })
    }
    navRef.current = goTo

    /* ── keyboard nav ── */
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowDown" && e.key !== "ArrowLeft" && e.key !== "ArrowUp") return
      const target = e.target as HTMLElement | null
      if (
        target &&
        typeof target.closest === "function" &&
        (target.isContentEditable || target.closest("input, textarea, select, [contenteditable], [cmdk-root]"))
      ) {
        return
      }
      e.preventDefault()
      const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1
      const next = Math.min(sections.length - 1, Math.max(0, currentIdx + dir))
      goTo(sections[next].id)
    }
    window.addEventListener("keydown", onKey)

    /* ── infinite wrap: only on continued push PAST an edge (intent-gated),
          never from resting positions — resting at top must stay at top ── */
    const atBottom = (el: HTMLElement) => el.scrollTop >= el.scrollHeight - el.clientHeight - 2
    const atTop = (el: HTMLElement) => el.scrollTop <= 1

    /* deliberate-flick threshold: edge wraps require real input, so trackpad
       drift / decaying inertia tails resting at an edge never teleport you */
    const WRAP_DELTA_WHEEL = 40
    const WRAP_DELTA_TOUCH = 8

    let lastEdgeWrapAt = 0

    /** Animated seam: fly the full loop distance instead of teleporting. */
    const wrapAnimate = (top: number) => {
      lastEdgeWrapAt = Date.now()
      gsap.to(scrollerEl, {
        scrollTop: top,
        duration: reducedMotion ? 0 : 1.05,
        ease: "power2.inOut",
        overwrite: "auto",
      })
    }

    const handleEdgeWheel = (e: WheelEvent) => {
      if (!scrollerEl) return
      const maxScroll = scrollerEl.scrollHeight - scrollerEl.clientHeight
      if (maxScroll <= 0) return
      if (e.deltaY >= WRAP_DELTA_WHEEL && atBottom(scrollerEl)) {
        e.preventDefault()
        wrapAnimate(2)
      } else if (e.deltaY <= -WRAP_DELTA_WHEEL && atTop(scrollerEl)) {
        e.preventDefault()
        wrapAnimate(maxScroll - 4)
      }
    }

    const handleEdgeTouch = () => {
      if (!scrollerEl || Date.now() - lastEdgeWrapAt < 400) return
      if (Math.abs(touchDirY) < WRAP_DELTA_TOUCH) return
      const goingDown = touchDirY < 0 // finger moving up => content scrolls down
      const maxScroll = scrollerEl.scrollHeight - scrollerEl.clientHeight
      if (maxScroll <= 0) return
      if (goingDown && atBottom(scrollerEl)) {
        wrapAnimate(2)
      } else if (!goingDown && atTop(scrollerEl)) {
        wrapAnimate(maxScroll - 4)
      }
    }

    /* track vertical swipe direction across move events */
    let touchPrevY = 0
    let touchDirY = 0
    const handleDirStart = (e: TouchEvent) => {
      touchPrevY = e.touches[0].clientY
      touchDirY = 0
    }
    const handleDirMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY
      if (Math.abs(y - touchPrevY) > 6) {
        touchDirY = y - touchPrevY
        touchPrevY = y
      }
    }

    scrollerEl?.addEventListener("wheel", handleEdgeWheel, { passive: false })
    scrollerEl?.addEventListener("touchstart", handleDirStart, { passive: true })
    scrollerEl?.addEventListener("touchmove", handleDirMove, { passive: true })
    scrollerEl?.addEventListener("touchmove", handleEdgeTouch, { passive: true })

    /* ── deep link ?stage=id ── */
    let deepLinkTimer: number | null = null
    const urlStage = new URLSearchParams(window.location.search).get("stage")
    if (urlStage) {
      const targetId = urlStage === "head" || urlStage === "hero" ? "lc-hero" : `stage-${urlStage}`
      deepLinkTimer = window.setTimeout(() => goTo(targetId), 80)
    }

    document.fonts.ready.then(() => {
      ScrollTrigger.refresh()
      refreshStarts()
    })

    /* ── recalc ── */
    const onLoad = () => {
      ScrollTrigger.refresh()
      refreshStarts()
    }
    window.addEventListener("load", onLoad)
    const resizeTimer = window.setTimeout(onLoad, 220)

    return () => {
      if (deepLinkTimer !== null) window.clearTimeout(deepLinkTimer)
      window.clearTimeout(resizeTimer)
      window.removeEventListener("load", onLoad)
      window.removeEventListener("keydown", onKey)
      scrollerEl?.removeEventListener("wheel", handleEdgeWheel)
      scrollerEl?.removeEventListener("touchstart", handleDirStart)
      scrollerEl?.removeEventListener("touchmove", handleDirMove)
      scrollerEl?.removeEventListener("touchmove", handleEdgeTouch)
      if (typeTimer !== null) window.clearInterval(typeTimer)
      animCtx.revert() /* kills STs+timelines AND restores inline styles */
      stInstances.length = 0
      timelines.length = 0
      rootEl.querySelectorAll(".lc-pulse-dot").forEach((d) => d.remove())
      document.documentElement.style.removeProperty("--accent")
      ScrollTrigger.defaults({ scroller: null })
      if (originalScrollRestoration) {
        window.history.scrollRestoration = originalScrollRestoration
      }
    }
  }, [reducedMotion])

  return (
    <div ref={rootRef} className="lifecycle-root">
      <div className="grain" aria-hidden />
      <div className="progress-edge">
        <div className="fill" id="progressFill" />
      </div>

      {/* fixed top chrome — one clean row */}
      <header className="lc-topbar">
        <CTACircle href="/#architecture" icon={<HomeIcon className="h-4 w-4" aria-hidden />} label="Showcase §01" variant="ghost" size="md" tooltip />
        <span aria-hidden className="h-4 w-px bg-[var(--line)]" />
        <div className="trace-log" id="traceLog">
          <span className="pulse" aria-hidden />
          <span id="traceText">SESSION · request leaving the client →</span>
        </div>
        <div className="counter mono" id="counter">
          <svg className="counter-ring" width="20" height="20" viewBox="0 0 36 36" aria-hidden style={{ color: "var(--amber)" }}>
            <circle className="ring-bg" cx="18" cy="18" r="15" />
            <circle
              id="counterRing"
              className="ring-fg"
              cx="18"
              cy="18"
              r="15"
              pathLength={100}
              strokeDasharray="100"
              strokeDashoffset="100"
            />
          </svg>
          <span id="counterText"><b>00</b> / 10</span>
        </div>
      </header>

      <nav className="rail" id="rail" aria-label="Lifecycle stages">
        <div
          className="rail-node active"
          data-target="#lc-hero"
          onClick={() => navRef.current?.("lc-hero")}
        >
          <span className="rail-label mono">Hero</span>
          <span className="rail-dot" style={{ "--accent": ACCENTS.amber } as any} />
        </div>
        {STAGES.map((s, i) => (
          <div
            key={s.id}
            className="rail-node"
            data-target={`#stage-${s.id}`}
            onClick={() => navRef.current?.(`stage-${s.id}`)}
          >
            <span className="rail-label mono">{RAIL_LABELS[s.id] ?? s.title}</span>
            <span className="rail-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="rail-dot" style={{ "--accent": ACCENTS[s.accent] } as any} />
          </div>
        ))}
        <div
          className="rail-node"
          data-target="#outro"
          onClick={() => navRef.current?.("outro")}
        >
          <span className="rail-label mono">Contact</span>
          <span className="rail-dot" style={{ "--accent": ACCENTS.teal } as any} />
        </div>
      </nav>

      <div className="hint mono">SCROLL TO TRACE</div>

      <div className="scroller" id="scroller">
        {/* HERO — clean, no SVG */}
        <section id="lc-hero" className="lc-hero" data-trace="SESSION · scroll to trace →">
          <div className="hero-composition">
            <div className="hero-text-block">
              <h1 className="hero-title">
                <span className="line"><span>One request,</span></span>
                <span className="line"><span>ten stages,</span></span>
                <span className="line"><span className="grad">zero surprises.</span></span>
              </h1>
            </div>
          </div>
          <div className="scroll-cue" aria-hidden>
            <div className="bar" />
            SCROLL TO TRACE
          </div>
        </section>

        {/* STAGES */}
        {STAGES.map((s, i) => (
          <StageSection key={s.id} stage={s} index={i} />
        ))}

        {/* OUTRO — the end slide */}
        <section id="outro" data-accent="teal" data-trace="STATUS 200 · trace complete">
          <div className="status-final mono">TRACE COMPLETE · 200 OK</div>
          <h2 className="hero-title" style={{ fontSize: "clamp(2.2rem,5vw,4rem)", maxWidth: "16ch", textAlign: "center" }}>
            The request lifecycle, <span className="grad">start to finish.</span>
          </h2>
          <p className="hero-sub" style={{ textAlign: "center", maxWidth: "52ch" }}>
            Ten stages, one accountable path — throttle, guard, validate, delegate, persist, respond. Nothing hidden, nothing skipped.
          </p>
          <div className="end-rule" aria-hidden />
          <div className="chip-row" style={{ marginTop: 0 }}>
            <span className="chip">POST /api/checkout</span>
            <span className="chip">Laravel 13</span>
            <span className="chip">tymon/jwt-auth</span>
            <span className="chip">38ms p95</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5" style={{ marginTop: 44 }}>
            <CTACircle href="/#architecture" icon={<HomeIcon className="h-4.5 w-4.5" aria-hidden />} label="Back to Showcase §01" variant="ghost" size="md" />
            <CTACircle href="https://itinera.apidog.io" icon={<Book className="h-4.5 w-4.5" aria-hidden />} label="Open API Reference" variant="ghost" size="md" />
          </div>
          <div className="end-foot mono">END OF TRACE · 10 / 10 STAGES · ITINARI CHECKOUT</div>
        </section>
      </div>
    </div>
  )
}










