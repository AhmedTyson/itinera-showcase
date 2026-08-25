import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, cleanup } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { gsap, ScrollTrigger } from "../lib/gsap"
import LifecyclePage from "./LifecyclePage"

/**
 * Mocks the pieces of GSAP the lifecycle engine touches. Timeline instances are
 * recovered from gsap.timeline().mock.results and the scroll tween's onComplete
 * is captured so tests can drive transition completion manually.
 */
vi.mock("../lib/gsap", () => {
  type MockTl = Record<string, ReturnType<typeof vi.fn>> & { _onComplete?: () => void }
  const makeTl = (): MockTl => {
    const tl = {} as MockTl
    tl.from = vi.fn().mockReturnValue(tl)
    tl.to = vi.fn().mockReturnValue(tl)
    tl.fromTo = vi.fn().mockReturnValue(tl)
    tl.restart = vi.fn()
    tl.pause = vi.fn()
    tl.kill = vi.fn()
    tl.progress = vi.fn()
    tl.eventCallback = vi.fn((name: string, cb?: () => void) => {
      if (name === "onComplete" && cb) tl._onComplete = cb
    })
    return tl
  }
  return {
    gsap: {
      timeline: vi.fn(() => makeTl()),
      to: vi.fn((_target: unknown, vars: { onComplete?: () => void }) => {
        if (typeof vars?.onComplete === "function") capturedOnComplete = vars.onComplete
        return { kill: vi.fn() }
      }),
      set: vi.fn(),
      killTweensOf: vi.fn(),
      context: vi.fn((cb: () => void) => {
        cb()
        return { revert: vi.fn() }
      }),
      matchMedia: vi.fn(() => ({ add: vi.fn() })),
    },
    ScrollTrigger: {
      defaults: vi.fn(),
      create: vi.fn(() => ({ kill: vi.fn() })),
      refresh: vi.fn(),
    },
    MotionPathPlugin: {},
  }
})

let capturedOnComplete: (() => void) | null = null

const renderPage = () =>
  render(
    <MemoryRouter>
      <LifecyclePage />
    </MemoryRouter>,
  )

type MockTlRef = {
  _onComplete?: () => void
  restart: ReturnType<typeof vi.fn>
  eventCallback: ReturnType<typeof vi.fn>
}

const builtTimelines = () =>
  vi.mocked(gsap.timeline).mock.results.map((r) => r.value as unknown as MockTlRef)

const completeActiveTransition = (stageIndex: number) => {
  capturedOnComplete?.()
  capturedOnComplete = null
  builtTimelines()[stageIndex]?._onComplete?.()
}

/** The hero entrance auto-plays on mount and holds the input lock until done. */
const finishHeroEntrance = () => {
  vi.advanceTimersByTime?.(0)
  completeActiveTransition(0)
}

/** While the engine is locked, a keydown must NOT start a new scroll tween. */
const isLocked = (): boolean => {
  const callsBefore = vi.mocked(gsap.to).mock.calls.length
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }))
  return vi.mocked(gsap.to).mock.calls.length === callsBefore
}

/** Cross the post-transition input cooldown so the next gesture is accepted. */
const pastCooldown = () => vi.advanceTimersByTime?.(300)

const driveToLastSection = () => {
  for (let i = 0; i < 11; i++) {
    pastCooldown()
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }))
    completeActiveTransition(i + 1)
  }
}

const activeRailTarget = (): string | null =>
  document.querySelector(".rail-node.active")?.getAttribute("data-target")?.replace("#", "") ?? null

describe("LifecyclePage transition engine", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    capturedOnComplete = null
    if (!document.fonts) {
      ;(document as any).fonts = { ready: Promise.resolve() }
    }
    window.history.replaceState(null, "", "/")
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it("renders all 12 sections and builds one timeline per section", () => {
    const { container } = renderPage()
    expect(container.querySelectorAll("#scroller > section")).toHaveLength(12)
    // hero + 10 stages + outro
    expect(vi.mocked(gsap.timeline)).toHaveBeenCalledTimes(12)
    expect(builtTimelines()).toHaveLength(12)
  })

  it("binds ScrollTrigger defaults to the scroller element", () => {
    const { container } = renderPage()
    const scrollerEl = container.querySelector("#scroller")
    expect(scrollerEl).not.toBeNull()
    expect(vi.mocked(ScrollTrigger.defaults)).toHaveBeenCalledWith({ scroller: scrollerEl })
  })

  it("locks input during a transition and releases after the timeline completes", () => {
    renderPage()
    finishHeroEntrance()
    pastCooldown()

    // Advance once (hero -> stage 1): scroll tween runs, engine locks.
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }))
    expect(isLocked()).toBe(true)

    // Scroll tween lands -> section timeline takes ownership of the lock.
    capturedOnComplete?.()
    expect(builtTimelines()[1].restart).toHaveBeenCalled()
    expect(builtTimelines()[1].eventCallback).toHaveBeenCalledWith("onComplete", expect.any(Function))
    expect(isLocked()).toBe(true)

    // Timeline finishes -> lock released; after the cooldown the gesture lands.
    builtTimelines()[1]._onComplete?.()
    pastCooldown()
    expect(isLocked()).toBe(false)
  })

  it("wraps forward past the outro back to the hero", () => {
    renderPage()
    finishHeroEntrance()

    driveToLastSection()
    expect(activeRailTarget()).toBe("outro")

    pastCooldown()
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }))
    completeActiveTransition(0)

    expect(activeRailTarget()).toBe("lc-hero")
  })

  it("wraps backward before the hero around to the outro", () => {
    renderPage()
    finishHeroEntrance()
    pastCooldown()

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }))
    completeActiveTransition(11)

    expect(activeRailTarget()).toBe("outro")
  })

  it("ignores arrow keys fired from editable targets", () => {
    renderPage()
    finishHeroEntrance()
    pastCooldown()

    const editable = document.createElement("input")
    document.body.appendChild(editable)
    editable.focus()

    const tweensBefore = vi.mocked(gsap.to).mock.calls.length
    editable.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))

    expect(vi.mocked(gsap.to).mock.calls.length).toBe(tweensBefore)
    expect(activeRailTarget()).toBe("lc-hero")

    editable.remove()
  })
})
