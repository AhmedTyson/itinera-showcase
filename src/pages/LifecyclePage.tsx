import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { Home as HomeIcon, Book } from "lucide-react"
import { useIsReducedMotion } from "../hooks/useIsReducedMotion"
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

  const reducedMotion = useIsReducedMotion()

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
    const sections = ["lc-hero", ...STAGE_IDS, "outro"]
      .map(id => root.querySelector<HTMLElement>(`#${id}`))
      .filter((el): el is HTMLElement => !!el)

    let currentIdx = 0
    let isTransitioning = false

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

    /* ── 1. Hero Timeline ── */
    const heroTl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } })
    heroTl.from(".lc-hero .hero-eyebrow", { opacity: 0, y: 14, duration: 0.6, immediateRender: false })
      .from(".lc-hero .hero-title .line span", { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.09, immediateRender: false }, "-=.35")
      .from(".lc-hero .hero-art", { opacity: 0, x: 60, duration: 1.1, immediateRender: false }, "-=.6")
      .from(".lc-hero .scroll-cue", { opacity: 0, duration: 0.6, immediateRender: false }, "-=.3")
    timelines.push(heroTl)

    /* ── 2. Stage Timelines ── */
    STAGE_IDS.forEach((id) => {
      const sec = root.querySelector<HTMLElement>(`#${id}`)!
      const draws = prepDraws(sec)
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } })
      
      tl.from(
        sec.querySelectorAll(".icon-wrap, .stage-tag, .section-title, .section-desc p, .chip, .artifact-tag"),
        { opacity: 0, y: 18, stagger: 0.06, duration: 0.6, immediateRender: false },
        0,
      )
        .from(sec.querySelector(".panel"), { opacity: 0, y: 30, duration: 0.6, immediateRender: false }, 0.15)
        .to(draws, { strokeDashoffset: 0, duration: 0.9, stagger: 0.035, ease: "power2.inOut" }, 0.4)
        .from(sec.querySelectorAll(".lc-fade"), { autoAlpha: 0, duration: 0.35, stagger: 0.03, immediateRender: false }, 0.75)

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
      timelines.push(tl)
    })

    /* ── 3. Outro Timeline ── */
    const outroTl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } })
    outroTl.fromTo(
      "#outro .status-final, #outro .hero-title, #outro .hero-sub, #outro .chip",
      { opacity: 0, y: 26 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
        immediateRender: false,
      },
    )
    timelines.push(outroTl)

    /* reduced motion: no entrance animations — land every section on its end state */
    if (reducedMotion) {
      timelines.forEach((t) => t.progress(1))
    }

    /* ── Transition Engine ── */
    let activeTl: gsap.core.Timeline | null = null
    let watchdog: number | null = null
    let unlockedAt = 0
    const releaseLock = () => {
      if (!isTransitioning) return
      isTransitioning = false
      unlockedAt = Date.now()
      if (watchdog !== null) {
        window.clearTimeout(watchdog)
        watchdog = null
      }
    }

    const goToSection = (index: number, force = false) => {
      if (isTransitioning && !force) return

      // Wrap around index infinitely
      let nextIndex = index
      if (nextIndex >= sections.length) {
        nextIndex = 0
      } else if (nextIndex < 0) {
        nextIndex = sections.length - 1
      }

      if (currentIdx === nextIndex && !force) return

      isTransitioning = true
      currentIdx = nextIndex
      if (watchdog !== null) window.clearTimeout(watchdog)
      watchdog = window.setTimeout(releaseLock, 3500)

      const targetSec = sections[nextIndex]
      if (!targetSec || !scrollerEl) {
        releaseLock()
        return
      }

      activate(targetSec)

      if (force) {
        gsap.killTweensOf(scrollerEl)
        if (activeTl) activeTl.pause()
      }

      const targetScrollTop = scrollerEl.scrollTop + (targetSec.getBoundingClientRect().top - scrollerEl.getBoundingClientRect().top)

      gsap.to(scrollerEl, {
        scrollTop: targetScrollTop,
        duration: reducedMotion ? 0 : 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          const tl = timelines[nextIndex]
          if (tl) {
            activeTl = tl
            tl.restart()
            tl.eventCallback("onComplete", releaseLock)
            if (reducedMotion) {
              tl.progress(1)
              releaseLock()
            }
          } else {
            releaseLock()
          }
        }
      })
    }

    /* ── Clicks & Deep Links ── */
    const goTo = (secId: string) => {
      const targetId = secId.startsWith("stage-") ? secId : (secId === "lc-hero" ? "lc-hero" : `stage-${secId}`)
      const idx = sections.findIndex(s => s.id === targetId || (secId === "outro" && s.id === "outro"))
      if (idx > -1) {
        goToSection(idx, true)
      }
    }
    navRef.current = goTo

    /* ── Scroll/Wheel/Touch Observers ── */
    let lastWheelTime = 0
    const INPUT_COOLDOWN_MS = 250
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const now = Date.now()

      // Trackpad inertia absorption: ignore events that arrive in rapid succession
      const isInertia = now - lastWheelTime < 60
      lastWheelTime = now

      if (isTransitioning || isInertia || now - unlockedAt < INPUT_COOLDOWN_MS) return

      const dir = e.deltaY > 0 ? 1 : -1
      goToSection(currentIdx + dir)
    }

    let touchStartY = 0
    let lastTouchTime = 0
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
      lastTouchTime = Date.now()
    }
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const now = Date.now()
      if (isTransitioning || now - unlockedAt < INPUT_COOLDOWN_MS) return

      const touchEndY = e.touches[0].clientY
      const diff = touchStartY - touchEndY
      
      if (Math.abs(diff) > 40 && (now - lastTouchTime > 300)) {
        const dir = diff > 0 ? 1 : -1
        goToSection(currentIdx + dir)
        touchStartY = touchEndY
        lastTouchTime = now
      }
    }

    if (scrollerEl) {
      scrollerEl.addEventListener("wheel", handleWheel, { passive: false })
      scrollerEl.addEventListener("touchstart", handleTouchStart, { passive: true })
      scrollerEl.addEventListener("touchmove", handleTouchMove, { passive: false })
    }

    /* ── Keyboard Observer ── */
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
      if (isTransitioning || Date.now() - unlockedAt < INPUT_COOLDOWN_MS) return
      const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1
      goToSection(currentIdx + dir)
    }
    window.addEventListener("keydown", onKey)

    /* ── Deep link ?stage=id ── */
    let deepLinkTimer: number | null = null

    /* Initial section never triggers goToSection (same-index early return),
       so the hero entrance must be played explicitly on mount. */
    const playInitialHero = () => {
      const tl = timelines[0]
      if (!tl) return
      isTransitioning = true
      if (watchdog !== null) window.clearTimeout(watchdog)
      watchdog = window.setTimeout(releaseLock, 3500)
      tl.restart()
      tl.eventCallback("onComplete", releaseLock)
      if (reducedMotion) {
        tl.progress(1)
        releaseLock()
      }
    }

    const urlStage = new URLSearchParams(window.location.search).get("stage")
    if (urlStage) {
      const targetId = urlStage === "head" || urlStage === "hero" ? "lc-hero" : `stage-${urlStage}`
      const idx = sections.findIndex(s => s.id === targetId || (urlStage === "outro" && s.id === "outro"))
      if (idx > -1 && idx !== 0) {
        deepLinkTimer = window.setTimeout(() => goToSection(idx), 100)
      } else {
        playInitialHero()
      }
    } else {
      playInitialHero()
    }

    /* ── resize handler: debounced re-center, skipped mid-transition ── */
    let resizeTimer: number | null = null
    const handleResize = () => {
      if (isTransitioning || !scrollerEl || !sections[currentIdx]) return
      if (resizeTimer !== null) window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        resizeTimer = null
        if (isTransitioning || !scrollerEl || !sections[currentIdx]) return
        scrollerEl.scrollTop += sections[currentIdx].getBoundingClientRect().top - scrollerEl.getBoundingClientRect().top
      }, 150)
    }
    window.addEventListener("resize", handleResize)

    /* ── recalc ── */
    document.fonts.ready.then(() => ScrollTrigger.refresh())
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener("load", onLoad)
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 200)

    return () => {
      if (scrollerEl) {
        scrollerEl.removeEventListener("wheel", handleWheel)
        scrollerEl.removeEventListener("touchstart", handleTouchStart)
        scrollerEl.removeEventListener("touchmove", handleTouchMove)
      }
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("load", onLoad)
      window.removeEventListener("keydown", onKey)
      if (typeTimer !== null) window.clearInterval(typeTimer)
      clearTimeout(refreshTimer)
      if (deepLinkTimer !== null) window.clearTimeout(deepLinkTimer)
      if (watchdog !== null) window.clearTimeout(watchdog)
      if (resizeTimer !== null) window.clearTimeout(resizeTimer)
      timelines.forEach((t) => t.kill())
      if (scrollerEl) gsap.killTweensOf(scrollerEl)
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
        {/* HERO */}
        <section id="lc-hero" className="lc-hero" data-trace="SESSION · scroll to trace →">
          {/* BIG animated client→server flow art — server above the title, client below it */}
          <svg className="hero-art" viewBox="0 0 1000 620" fill="none" aria-hidden>
            {/* ambient dot field */}
            {[
              [140, 140], [260, 90], [380, 200], [520, 120], [640, 250], [200, 330],
              [340, 380], [560, 350], [700, 420], [120, 260], [820, 300], [900, 420], [460, 470],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.7" fill="#232B38" />
            ))}

            {/* API SERVER — top right, above the title */}
            <rect x="756" y="56" width="204" height="120" rx="16" stroke="#F5A623" strokeWidth="1.6" strokeDasharray="5 6" />
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <line x1="776" y1={86 + i * 28} x2="936" y2={86 + i * 28} stroke="#232B38" strokeWidth="1.4" />
                <circle cx="926" cy={86 + i * 28} r="3.4" fill="#34d399">
                  <animate attributeName="opacity" values="1;.25;1" dur="1.8s" begin={`${i * 0.35}s`} repeatCount="indefinite" />
                </circle>
              </g>
            ))}
            <text x="776" y="200" fill="#F5A623" fontSize="11.5" fontFamily="monospace">itinari · api :443</text>

            {/* CLIENT — below the title */}
            <rect x="236" y="474" width="132" height="74" rx="14" stroke="#E8EAED" strokeWidth="1.5" />
            <circle cx="262" cy="498" r="4" fill="#9aa3c2" />
            <text x="276" y="502" fill="#E8EAED" fontSize="12" fontFamily="monospace">client</text>
            <text x="256" y="528" fill="#7A8699" fontSize="10" fontFamily="monospace">fetch() · bearer</text>

            {/* three grand arcs client → server */}
            <path className="flow-slow" d="M 368 496 C 520 470, 640 360, 752 130" stroke="#232B38" strokeWidth="1.4" strokeDasharray="3 9" />
            <path className="flow-mid" d="M 368 510 C 540 496, 660 400, 752 148" stroke="var(--amber)" strokeWidth="2" strokeDasharray="11 15" strokeLinecap="round" />
            <path className="trace-flow" d="M 368 524 C 550 520, 680 440, 752 166" stroke="#2DD4BF" strokeWidth="1.3" strokeDasharray="3 12" />
            {/* arrowheads aligned to each arc's end tangent */}
            <g transform="translate(752 130) rotate(-64)"><path d="M0 -5 L10 0 L0 5 Z" fill="#232B38" /></g>
            <g transform="translate(752 148) rotate(-70)"><path d="M0 -5.5 L11 0 L0 5.5 Z" fill="var(--amber)" /></g>
            <g transform="translate(752 166) rotate(-75)"><path d="M0 -5 L10 0 L0 5 Z" fill="#2DD4BF" /></g>

            {/* traveling request pulses (SMIL — infinite) */}
            <circle r="4.5" fill="#F5A623">
              <animateMotion dur="4.4s" repeatCount="indefinite" path="M 368 510 C 540 496, 660 400, 752 148" />
            </circle>
            <circle r="3" fill="#E8EAED" opacity="0.85">
              <animateMotion dur="6.8s" begin="-2.6s" repeatCount="indefinite" path="M 368 496 C 520 470, 640 360, 752 130" />
            </circle>
            <circle r="3" fill="#F5A623" opacity="0.55">
              <animateMotion dur="8s" begin="-4.8s" repeatCount="indefinite" path="M 368 524 C 550 520, 680 440, 752 166" />
            </circle>

            {/* hop labels riding the arcs */}
            <text x="430" y="452" fill="#7A8699" fontSize="11" fontFamily="monospace" transform="rotate(-9 430 452)">TLS 1.3 handshake</text>
            <text x="600" y="330" fill="#7A8699" fontSize="11" fontFamily="monospace" transform="rotate(-27 600 330)">POST /api/checkout</text>
          </svg>

          <div className="hero-eyebrow">Itinari · Checkout Endpoint</div>
          <h1 className="hero-title">
            <span className="line"><span>One request,</span></span>
            <span className="line"><span>ten stages,</span></span>
            <span className="line"><span className="grad">zero surprises.</span></span>
          </h1>
          <div className="scroll-cue">
            <div className="bar" />SCROLL
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










