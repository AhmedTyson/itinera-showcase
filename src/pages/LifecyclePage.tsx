import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { useIsReducedMotion } from "../hooks/useIsReducedMotion"
import { gsap, ScrollTrigger } from "../lib/gsap"
import type { LifecycleChapter } from "../lib/lifecycle-content"
import { ChapterScene } from "../components/lifecycle/ChapterScene"

type AccentKey = "amber" | "teal" | "violet"

const ACCENTS: Record<AccentKey, string> = {
  amber: "#F5A623",
  teal: "#2DD4BF",
  violet: "#A78BFA",
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
    id: "demo", accent: "violet", trace: "ScrollTrigger · scrub: true",
    tag: "Stack · Motion", title: "This page is the demo.",
    desc: [
      "Every chapter you just scrolled through is driven by ScrollTrigger —",
      "the rail, the trace log, the scenes drawing themselves in.",
      "The bars below are scrubbed directly to your scroll position:",
      "speed up, slow down, reverse — the motion follows you.",
    ],
    chips: ["ScrollTrigger.scrub", "gsap.timeline()", "stagger + ease", "matchMedia() for mobile"],
    artifact: "ScrollTrigger · scrub: 0.6 · pin: true",
    scene: "demo",
    icon: (a) => ic("M4 18 9 9l4 6 3-5 4 8", a),
  },
]

export const LIFECYCLE_STAGES_FINAL = LIFECYCLE_STAGES

const STAGES = LIFECYCLE_STAGES
const STAGE_IDS = STAGES.map((s) => `stage-${s.id}`)
const STAGE_LABELS = [
  "The Request",
  "The Router",
  "The Guard",
  "The Throttle",
  "FormRequest",
  "Controller",
  "The Service",
  "Persistence",
  "200 OK",
  "The Demo",
]
const BAR_HEIGHTS = [40, 75, 55, 90, 35, 65, 100, 50]

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
            <span className="stage-count">{String(index + 1).padStart(2, "0")} / 10</span>
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
          <span className="panel-badge mono">{String(index + 1).padStart(2, "0")}</span>
          {stage.scene === "demo" ? (
            <div>
              <div className="code-line">
                <div><span className="kw">gsap</span>.timeline({"{"} scrollTrigger: {"{"}</div>
                <div>&nbsp;&nbsp;trigger: <span className="str">"#panel"</span>,</div>
                <div>&nbsp;&nbsp;scrub: <span className="num">true</span>,</div>
                <div>&nbsp;&nbsp;start: <span className="str">"top center"</span></div>
                <div>{"})"}</div>
              </div>
              <div className="gsap-demo" id="gsapBars">
                {BAR_HEIGHTS.map((_, i) => (
                  <div key={i} className="gsap-bar" />
                ))}
              </div>
              <div className="scrub-track">
                <div className="scrub-fill" id="scrubFill" />
              </div>
            </div>
          ) : (
            <ChapterScene chapter={chapter} />
          )}
        </div>
      </div>
    </section>
  )
}

export default function LifecyclePage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useIsReducedMotion()

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // Bind ScrollTrigger to our snap container (matches prototype defaults)
    const scrollerEl = root.querySelector("#scroller")
    if (scrollerEl) ScrollTrigger.defaults({ scroller: scrollerEl })

    const counterEl = root.querySelector("#counter") as HTMLElement
    const traceText = root.querySelector("#traceText") as HTMLElement
    const progressFill = root.querySelector("#progressFill") as HTMLElement

    /* ── activation: rail + accent + trace + counter + progress + hash ── */
    const railEl = root.querySelector<HTMLElement>("#rail")!
    const rootEl = root
    function activate(sec: HTMLElement) {
      const accentHex = ACCENTS[(sec.dataset.accent ?? "amber") as AccentKey]
      document.documentElement.style.setProperty("--accent", accentHex)
      railEl.querySelectorAll<HTMLElement>(".rail-node").forEach((n) => {
        n.classList.toggle("active", n.dataset.target === `#${sec.id}`)
      })
      traceText.textContent = sec.dataset.trace ?? ""
      const pulse = rootEl.querySelector(".trace-log .pulse") as HTMLElement | null
      if (pulse) pulse.style.background = accentHex
      progressFill.style.background = accentHex

      const idx = STAGE_IDS.indexOf(sec.id)
      if (idx > -1) {
        counterEl.innerHTML = `<b>${String(idx + 1).padStart(2, "0")}</b> / 10`
        progressFill.style.width = `${((idx + 1) / STAGE_IDS.length) * 100}%`
        try {
          history.replaceState(null, "", `?stage=${sec.id.replace("stage-", "")}`)
        } catch {
          /* sandboxed contexts forbid history mutation — never fatal */
        }
      } else if (sec.id === "lc-hero") {
        counterEl.innerHTML = `<b>00</b> / 10`
        progressFill.style.width = "0%"
      } else if (sec.id === "outro") {
        counterEl.innerHTML = `<b>10</b> / 10`
        progressFill.style.width = "100%"
      }
    }

    /* ── activation triggers per section ── */
    const triggers: ScrollTrigger[] = []
    root.querySelectorAll("section").forEach((sec) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: sec,
          scroller: scrollerEl,
          start: "top center",
          end: "bottom center",
          onEnter: () => activate(sec as HTMLElement),
          onEnterBack: () => activate(sec as HTMLElement),
        }),
      )
    })

    /* ── hero entrance ── */
    const heroTl = gsap
      .timeline({ delay: 0.15 })
      .from(".lc-hero .hero-eyebrow", { opacity: 0, y: 14, duration: 0.6, ease: "power2.out" })
      .from(".lc-hero .hero-title .line span", { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.09 }, "-=.35")
      .from(".lc-hero .hero-sub", { opacity: 0, y: 16, duration: 0.7, ease: "power2.out" }, "-=.45")
      .from(".lc-hero .hero-meta > div", { opacity: 0, y: 12, duration: 0.6, stagger: 0.08, ease: "power2.out" }, "-=.4")
      .from(".lc-hero .scroll-cue", { opacity: 0, duration: 0.6 }, "-=.3")

    /* ── stage reveal rhythm — every stage pins for its own scroll distance ── */
    const stageCtxs: gsap.Context[] = []
    STAGE_IDS.filter((id) => id !== "stage-demo").forEach((id) => {
      const sec = root.querySelector<HTMLElement>(`#${id}`)!
      const ctx = gsap.context(() => {
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
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: sec,
            scroller: scrollerEl,
            start: "top top",
            end: "+=60%",
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.5,
            toggleActions: "play none none reverse",
          },
        })
        tl.from(
          sec.querySelectorAll(".icon-wrap, .stage-tag, .section-title, .section-desc p, .chip, .artifact-tag"),
          { opacity: 0, y: 18, stagger: 0.06, duration: 0.6 },
          0,
        )
          .from(sec.querySelector(".panel")!, { opacity: 0, y: 30, duration: 0.6 }, 0.15)
          .to(draws, { strokeDashoffset: 0, duration: 0.9, stagger: 0.035, ease: "power2.inOut" }, 0.4)
          .from(sec.querySelectorAll(".lc-fade"), { autoAlpha: 0, duration: 0.35, stagger: 0.03 }, 0.75)
          .to({}, { duration: 0.35 })
      }, sec)
      stageCtxs.push(ctx)
    })

    /* ── demo stage — pinned + scrubbed bars, matchMedia for mobile ── */
    const demoSec = root.querySelector<HTMLElement>("#stage-demo")!
    const demoCtx = gsap.context(() => {
      gsap.from(demoSec.querySelectorAll(".icon-wrap, .stage-tag, .section-title, .section-desc p, .chip, .artifact-tag"), {
        opacity: 0, y: 18, stagger: 0.06, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: demoSec, scroller: scrollerEl, start: "top 85%", toggleActions: "play none none reverse" },
      })
      gsap.from(demoSec.querySelectorAll(".code-line > div"), {
        opacity: 0, x: -10, duration: 0.4, stagger: 0.06, ease: "power2.out",
        scrollTrigger: { trigger: demoSec.querySelector(".panel")!, scroller: scrollerEl, start: "top 85%", toggleActions: "play none none reverse" },
      })

      const mm = gsap.matchMedia()
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.to(demoSec.querySelectorAll(".gsap-bar"), {
          height: (i) => `${BAR_HEIGHTS[i]}%`,
          ease: "power1.inOut",
          stagger: { each: 0.08 },
          scrollTrigger: {
            trigger: demoSec,
            scroller: scrollerEl,
            start: "top top",
            end: "+=125%",
            scrub: 0.6,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            snap: { snapTo: 1, duration: 0.4, ease: "power1.inOut" },
            onUpdate: (self) => {
              const fill = demoSec.querySelector<HTMLElement>(".scrub-fill")
              if (fill) fill.style.width = `${self.progress * 100}%`
            },
          },
        })
        // outro reveals only after the demo pin fully releases
        gsap.from("#outro .status-final, #outro .hero-title, #outro .hero-sub, #outro .chip", {
          opacity: 0, y: 20, stagger: 0.08, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: demoSec, scroller: scrollerEl, start: "bottom top", end: "+=40%", scrub: false, toggleActions: "play none none reverse" },
        })
      })
      mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
        gsap.fromTo(
          demoSec.querySelectorAll(".gsap-bar"),
          { height: "10%" },
          {
            height: (i) => `${BAR_HEIGHTS[i]}%`,
            duration: 0.8,
            stagger: 0.06,
            ease: "power2.out",
            scrollTrigger: { trigger: demoSec, scroller: scrollerEl, start: "top 65%", toggleActions: "play none none reverse" },
          },
        )
        gsap.from("#outro .status-final, #outro .hero-title, #outro .hero-sub, #outro .chip", {
          opacity: 0, y: 20, stagger: 0.08, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: "#outro", scroller: scrollerEl, start: "top 70%", toggleActions: "play none none reverse" },
        })
      })
    }, demoSec)

    /* ── deep link ?stage=id ── */
    const id = new URLSearchParams(window.location.search).get("stage")
    if (id) {
      const target = root.querySelector(`#stage-${id}`)
      if (target) requestAnimationFrame(() => target.scrollIntoView())
    }

    /* ── recalc ── */
    document.fonts.ready.then(() => ScrollTrigger.refresh())
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener("load", onLoad)
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 200)

    return () => {
      window.removeEventListener("load", onLoad)
      clearTimeout(refreshTimer)
      triggers.forEach((t) => t.kill())
      stageCtxs.forEach((c) => c.revert())
      demoCtx.revert()
      heroTl.kill()
      document.documentElement.style.removeProperty("--accent")
      // clear default scroller config
      ScrollTrigger.defaults({ scroller: null })
    }
  }, [reducedMotion])

  return (
    <div ref={rootRef} className="lifecycle-root">
      <div className="grain" aria-hidden />
      <div className="progress-edge">
        <div className="fill" id="progressFill" />
      </div>

      <a href="#lc-hero" className="back-link mono" id="backLink" onClick={(e) => {
        e.preventDefault()
        document.getElementById("lc-hero")?.scrollIntoView({ behavior: "smooth" })
      }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
          <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Showcase
      </a>
      <div className="counter mono" id="counter"><b>00</b> / 10</div>

      <div className="trace-log" id="traceLog">
        <span className="pulse" aria-hidden />
        <span id="traceText">SESSION · request leaving the client →</span>
      </div>

      <nav className="rail" id="rail" aria-label="Lifecycle stages">
        <div
          className="rail-node active"
          data-target="#lc-hero"
          onClick={() => document.getElementById("lc-hero")?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="rail-label mono">Hero</span>
          <span className="rail-dot" style={{ "--accent": ACCENTS.amber } as any} />
        </div>
        {STAGES.map((s, i) => (
          <div
            key={s.id}
            className="rail-node"
            data-target={`#stage-${s.id}`}
            onClick={() => document.getElementById(`stage-${s.id}`)?.scrollIntoView({ behavior: "smooth" })}
          >
            <span className="rail-label mono">{STAGE_LABELS[i]}</span>
            <span className="rail-dot" style={{ "--accent": ACCENTS[s.accent] } as any} />
          </div>
        ))}
        <div
          className="rail-node"
          data-target="#outro"
          onClick={() => document.getElementById("outro")?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="rail-label mono">Contact</span>
          <span className="rail-dot" style={{ "--accent": ACCENTS.teal } as any} />
        </div>
      </nav>

      <div className="hint mono">SCROLL TO TRACE</div>

      <div className="scroller" id="scroller">
        {/* HERO */}
        <section id="lc-hero" className="lc-hero" data-trace="SESSION · scroll to trace →">
          <div className="hero-eyebrow">Itinari · Checkout Endpoint</div>
          <h1 className="hero-title">
            <span className="line"><span>One request,</span></span>
            <span className="line"><span>ten stages,</span></span>
            <span className="line"><span>zero surprises.</span></span>
          </h1>
          <p className="hero-sub">A scroll-through trace of a real POST /api/checkout call through the Itinari backend — from the fetch() in the client to the 200 OK on the wire, with the middleware, guards, and service layer it passes through on the way.</p>
          <div className="hero-meta">
            <div>ENDPOINT<span>POST /api/checkout</span></div>
            <div>STACK<span>Laravel · JWT · GSAP</span></div>
            <div>TRACE TIME<span>38ms</span></div>
          </div>
          <div className="scroll-cue">
            <div className="bar" />SCROLL
          </div>
        </section>

        {/* STAGES */}
        {STAGES.map((s, i) => (
          <StageSection key={s.id} stage={s} index={i} />
        ))}

        {/* OUTRO */}
        <section id="outro" data-accent="teal" data-trace="STATUS 200 · trace complete">
          <div className="status-final mono">TRACE COMPLETE · 200 OK</div>
          <h2 className="hero-title" style={{ fontSize: "clamp(2rem,4.6vw,3.4rem)", maxWidth: "18ch" }}>
            The request lifecycle, start to finish.
          </h2>
          <p className="hero-sub">Ten stages, one accountable path — throttle, guard, validate, delegate, persist, respond. Nothing hidden, nothing skipped.</p>
          <div className="chip-row" style={{ marginTop: 34 }}>
            <span className="chip">POST /api/checkout</span>
            <span className="chip">Laravel 11</span>
            <span className="chip">tymon/jwt-auth</span>
          </div>
        </section>
      </div>
    </div>
  )
}
