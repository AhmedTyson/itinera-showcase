import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, cleanup } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { gsap, ScrollTrigger } from "../lib/gsap"
import LifecyclePage from "./LifecyclePage"

const STAGE_IDS = [
  "request", "router", "guard", "throttle", "validation",
  "controller", "service", "persistence", "ok", "webhook",
]

const gsapToSpy = () => (gsap as any).to.mock.calls as Array<[unknown, Record<string, any>]>

/**
 * Scrubbed-engine mocks: timelines are plain chains; every ScrollTrigger.create
 * config is recorded and gets a synthetic `start` so nav mapping is testable.
 */
const stConfigs: Array<Record<string, any>> = []
const tlVars: Array<Record<string, any>> = []
/** Synthetic start values minted for timeline-attached ScrollTriggers (pins). */
const fakePinStarts: number[] = []

vi.mock("../lib/gsap", () => {
  const makeTl = (vars?: Record<string, any>) => {
    const tl = {} as Record<string, any>
    tl.from = vi.fn().mockReturnValue(tl)
    tl.to = vi.fn().mockReturnValue(tl)
    tl.fromTo = vi.fn().mockReturnValue(tl)
    tl.restart = vi.fn()
    tl.kill = vi.fn()
    tl.progress = vi.fn()
    tl.timeScale = vi.fn(() => 1)
    tl.eventCallback = vi.fn()
    const stv = vars?.scrollTrigger
    if (stv) {
      const start = 4000 + tlVars.length * 7
      ;(tl as any).scrollTrigger = { ...stv, start, end: start + 480, kill: vi.fn() }
      if (stv.pin === true) fakePinStarts.push(start)
    }
    return tl
  }
  return {
    gsap: {
      timeline: vi.fn((vars?: Record<string, any>) => {
        tlVars.push(vars ?? {})
        return makeTl(vars)
      }),
      to: vi.fn((target: unknown, vars?: Record<string, any>) => {
        // apply scroll tweens instantly so edge-wrap assertions stay synchronous
        if (vars && "scrollTop" in vars && target && typeof (target as any) === "object") {
          try {
            ;(target as HTMLElement).scrollTop = vars.scrollTop as number
          } catch {}
        }
        return { kill: vi.fn(), scrollTrigger: null }
      }),
      set: vi.fn(),
      killTweensOf: vi.fn(),
      getTweensOf: vi.fn(() => []),
      context: vi.fn((cb: () => void) => {
        cb()
        return { revert: vi.fn() }
      }),
      matchMedia: vi.fn(() => ({ add: vi.fn() })),
    },
    ScrollTrigger: {
      defaults: vi.fn(),
      create: vi.fn((cfg: Record<string, any>) => {
        stConfigs.push(cfg)
        return { ...cfg, start: stConfigs.length * 100, end: stConfigs.length * 100 + 500, kill: vi.fn() }
      }),
      refresh: vi.fn(),
    },
    MotionPathPlugin: {},
  }
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <LifecyclePage />
    </MemoryRouter>,
  )

const scrollerEl = (): HTMLElement => {
  const el = document.querySelector("#scroller")
  if (!el) throw new Error("#scroller not mounted")
  return el as HTMLElement
}



const pinConfigs = () => stConfigs.filter((c) => c.pin === true)

describe("LifecyclePage scrubbed scroll-driven engine", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stConfigs.length = 0
    tlVars.length = 0
    fakePinStarts.length = 0
    if (!document.fonts) {
      ;(document as any).fonts = { ready: Promise.resolve() }
    }
    window.history.replaceState(null, "", "/")
  })

  afterEach(() => cleanup())

  it("renders all 12 sections", () => {
    const { container } = renderPage()
    expect(container.querySelectorAll("#scroller > section")).toHaveLength(12)
  })

  it("pins each of the 10 stages to a scrubbed timeline plus hero-exit and outro scrubs", () => {
    renderPage()
    const stOf = (v: Record<string, any>) => v.scrollTrigger ?? {}
    const pinned = tlVars.filter((v) => stOf(v).pin === true)
    const scrubbedTls = tlVars.filter((v) => stOf(v).scrub != null)
    const heroExitScrubbed = vi
      .mocked(gsapToSpy())
      .some(([, v]) => (v as any)?.scrollTrigger?.trigger === "#lc-hero" && (v as any)?.scrollTrigger?.scrub === true)
    // 10 stage pins + outro reveal as timelines; hero exit as a scrubbed tween
    expect(scrubbedTls).toHaveLength(11)
    expect(heroExitScrubbed).toBe(true)
    expect(pinned).toHaveLength(10)
    expect(pinned.every((v) => typeof stOf(v).scrub === "number")).toBe(true)
  })

  it("binds ScrollTrigger defaults to the scroller element", () => {
    const { container } = renderPage()
    expect(vi.mocked(ScrollTrigger.defaults)).toHaveBeenCalledWith({ scroller: container.querySelector("#scroller") })
  })

  it("chrome sync: pin triggers own rail activation (guard -> teal accent)", () => {
    renderPage()
    const stv = tlVars.map((v) => v.scrollTrigger).find((s: any) => s?.trigger?.id === "stage-guard")
    expect(typeof stv?.onToggle).toBe("function")

    stv.onToggle({ isActive: true })
    expect(document.querySelector(".rail-node.active")?.getAttribute("data-target")).toBe("#stage-guard")
    expect(document.documentElement.style.getPropertyValue("--accent")).toBe("#2DD4BF")
  })

  it("every section owns exactly one chrome-activation source (no mismeasured duplicates)", () => {
    renderPage()
    const ids = new Set<string>()
    const keyOf = (t: any) => (typeof t === "string" ? t : t ? `#${t.id}` : "")
    // pinned stages + outro via timeline scrollTrigger vars
    for (const v of tlVars) {
      const s = v.scrollTrigger
      if (typeof s?.onToggle === "function") ids.add(keyOf(s.trigger))
    }
    // hero exit via tween vars
    for (const [, v] of gsapToSpy()) {
      const s = (v as any)?.scrollTrigger
      if (typeof s?.onToggle === "function") ids.add(keyOf(s.trigger))
    }
    expect(ids.has("#lc-hero") || ids.has("lc-hero")).toBe(true)
    for (const id of STAGE_IDS) expect(ids.has(`#stage-${id}`)).toBe(true)
    expect(ids.has("#outro")).toBe(true)
  })

  it("keyboard ArrowDown navigates to the next section's trigger start", () => {
    renderPage()
    const spy = vi.spyOn(scrollerEl(), "scrollTo").mockImplementation(() => {})
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }))
    expect(spy).toHaveBeenCalledTimes(1)
    const arg = spy.mock.calls[0][0] as unknown as { top: number; behavior: string }
    // first pinned stage start (synthetic mapping) + smooth native scrolling
    expect(arg.top).toBeGreaterThan(0)
    expect(arg.behavior).toBe("smooth")
    spy.mockRestore()
  })

  it("rail navigation lands on the PIN start, not the later chrome-center trigger", () => {
    renderPage()
    expect(fakePinStarts.length).toBeGreaterThan(0)
    const pinStart = fakePinStarts[0] // stage-request is the first pinned timeline
    const spy = vi.spyOn(scrollerEl(), "scrollTo").mockImplementation(() => {})

    const node = document.querySelector('.rail-node[data-target="#stage-request"]') as HTMLElement
    expect(node).not.toBeNull()
    node.click()

    const arg = spy.mock.calls[0]?.[0] as unknown as { top: number }
    // must equal the PIN start, never the later chrome-center activation start
    expect(arg?.top).toBe(pinStart)
    expect(arg?.top).toBeLessThan(4000 + 7 * tlVars.length) // not any chrome value
    spy.mockRestore()
  })

  it("ignores arrow keys fired from editable targets", () => {
    renderPage()
    const editable = document.createElement("input")
    document.body.appendChild(editable)
    editable.focus()

    const spy = vi.spyOn(scrollerEl(), "scrollTo").mockImplementation(() => {})
    editable.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
    editable.remove()
  })

  it("wraps only on continued push past an edge, never from resting positions", () => {
    renderPage()
    const sc = scrollerEl()
    Object.defineProperty(sc, "scrollHeight", { configurable: true, value: 12000 })
    Object.defineProperty(sc, "clientHeight", { configurable: true, value: 1000 })

    // At the very top, an upward push (wheel up) wraps to the bottom.
    sc.scrollTop = 1
    sc.dispatchEvent(new WheelEvent("wheel", { deltaY: -140, cancelable: true }))
    expect(sc.scrollTop).toBe(11000 - 4)

    // Bottom edge + continued downward push -> wraps back to top.
    sc.scrollTop = 11999
    sc.dispatchEvent(new WheelEvent("wheel", { deltaY: 140, cancelable: true }))
    expect(sc.scrollTop).toBe(2)

    // Mid-scroll downward wheel far from edges: no interference.
    sc.scrollTop = 6000
    sc.dispatchEvent(new WheelEvent("wheel", { deltaY: 140, cancelable: true }))
    expect(sc.scrollTop).toBe(6000)

    // Sub-threshold drift resting at the bottom: deliberate-flick gate holds.
    sc.scrollTop = 11999
    sc.dispatchEvent(new WheelEvent("wheel", { deltaY: 12, cancelable: true }))
    expect(sc.scrollTop).toBe(11999)

    // Threshold is inclusive: exactly WRAP_DELTA_WHEEL wraps.
    sc.dispatchEvent(new WheelEvent("wheel", { deltaY: 40, cancelable: true }))
    expect(sc.scrollTop).toBe(2)
  })

  it("?motion=reduced builds zero pins and keeps plain activation triggers", () => {
    window.history.replaceState(null, "", "/?motion=reduced")
    renderPage()
    expect(pinConfigs()).toHaveLength(0)
    expect(stConfigs.filter((c) => typeof c.onToggle === "function")).toHaveLength(12)

    const spy = vi.spyOn(scrollerEl(), "scrollTo").mockImplementation(() => {})
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }))
    const arg = spy.mock.calls[0][0] as unknown as { behavior: string }
    expect(arg.behavior).toBe("auto")
    spy.mockRestore()
  })
})
