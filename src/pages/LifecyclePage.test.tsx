import { describe, it, expect, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { ScrollTrigger } from "../lib/gsap"
import LifecyclePage from "./LifecyclePage"

vi.mock("../lib/gsap", () => {
  const localMockTimeline = {
    from: vi.fn(),
    to: vi.fn(),
    fromTo: vi.fn(),
    kill: vi.fn(),
  }
  localMockTimeline.from.mockReturnValue(localMockTimeline)
  localMockTimeline.to.mockReturnValue(localMockTimeline)
  localMockTimeline.fromTo.mockReturnValue(localMockTimeline)

  const localMockMatchMedia = {
    add: vi.fn((_q, cb: (c: any) => void) => {
      cb({ isReverted: false })
      return localMockMatchMedia
    }),
  }

  return {
    gsap: {
      timeline: vi.fn(() => localMockTimeline),
      context: vi.fn((cb: () => void) => {
        cb()
        return { revert: vi.fn() }
      }),
      from: vi.fn().mockReturnValue(localMockTimeline),
      to: vi.fn().mockReturnValue(localMockTimeline),
      fromTo: vi.fn().mockReturnValue(localMockTimeline),
      matchMedia: vi.fn(() => localMockMatchMedia),
    },
    ScrollTrigger: {
      defaults: vi.fn(),
      create: vi.fn(() => ({ kill: vi.fn() })),
      refresh: vi.fn(),
    },
    MotionPathPlugin: {},
  }
})

describe("LifecyclePage ScrollTrigger & Interaction Regression Check", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Polyfill methods not available/needed in happy-dom
    if (!document.fonts) {
      (document as any).fonts = {
        ready: Promise.resolve(),
      }
    }
  })

  it("registers ScrollTrigger defaults with the container scroller element", () => {
    const { container } = render(<LifecyclePage />)
    const scrollerEl = container.querySelector("#scroller")

    expect(scrollerEl).not.toBeNull()
    expect(ScrollTrigger.defaults).toHaveBeenCalledWith({ scroller: scrollerEl })
  })

  it("creates ScrollTrigger instances for each chapter section", () => {
    const { container } = render(<LifecyclePage />)
    const sections = container.querySelectorAll("section")
    
    // There should be a ScrollTrigger.create call for each section element found on the page
    expect(ScrollTrigger.create).toHaveBeenCalled()
    expect((ScrollTrigger.create as any).mock.calls.length).toBeGreaterThanOrEqual(sections.length)

    // Verify first ScrollTrigger call receives the first section as trigger
    const firstCallArgs = (ScrollTrigger.create as any).mock.calls[0][0]
    expect(firstCallArgs.trigger).toBe(sections[0])
    expect(firstCallArgs.start).toBe("top center")
    expect(firstCallArgs.end).toBe("bottom center")
  })

  it("calls ScrollTrigger.refresh when fonts are ready", async () => {
    render(<LifecyclePage />)
    // Wait for the Promise of document.fonts.ready to resolve
    await Promise.resolve()
    expect(ScrollTrigger.refresh).toHaveBeenCalled()
  })
})
