import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ChapterScene } from "./ChapterScene"
import type { LifecycleChapter } from "../../lib/lifecycle-content"

describe("ChapterScene SVG Layout Rendering", () => {
  const baseChapter = (scene: LifecycleChapter["scene"]): LifecycleChapter => ({
    id: "test",
    kicker: "TEST",
    title: "Test Scene",
    lines: ["Test line"],
    artifact: "Test artifact",
    accent: "#fbbf24",
    trace: "Test trace",
    chips: ["test"],
    scene,
  })

  it("renders with correct viewBox and id prefix", () => {
    const chapter = baseChapter("request")
    const { container } = render(<ChapterScene chapter={chapter} />)
    const svgElement = container.querySelector("svg")

    expect(svgElement).toBeDefined()
    expect(svgElement?.getAttribute("viewBox")).toBe("0 0 900 420")
    expect(svgElement?.getAttribute("id")).toBe("scene-request")
  })

  it("contains lc-draw and lc-fade classes for animation selectors", () => {
    const chapter = baseChapter("request")
    const { container } = render(<ChapterScene chapter={chapter} />)
    
    const drawElements = container.querySelectorAll(".lc-draw")
    const fadeElements = container.querySelectorAll(".lc-fade")

    expect(drawElements.length).toBeGreaterThan(0)
    expect(fadeElements.length).toBeGreaterThan(0)
  })

  describe("Specific Scene Layout Content Checks", () => {
    it("renders client/request scene details", () => {
      render(<ChapterScene chapter={baseChapter("request")} />)
      expect(screen.getByText("itinari.up.railway.app")).toBeDefined()
      expect(screen.getByText("vanilla client · fetch()")).toBeDefined()
    })

    it("renders router scene details", () => {
      render(<ChapterScene chapter={baseChapter("router")} />)
      expect(screen.getByText("pipeline: throttle → auth → run")).toBeDefined()
      expect(screen.getByText("/checkout")).toBeDefined()
    })

    it("renders guard scene details", () => {
      render(<ChapterScene chapter={baseChapter("guard")} />)
      expect(screen.getByText("JWT")).toBeDefined()
      expect(screen.getByText("HS512")).toBeDefined()
      expect(screen.getByText("✓ signature verified · blacklist clean")).toBeDefined()
    })

    it("renders throttle scene details", () => {
      render(<ChapterScene chapter={baseChapter("throttle")} />)
      expect(screen.getByText("sliding window · 60/min")).toBeDefined()
      expect(screen.getByText("6 / 60 consumed — allowed")).toBeDefined()
    })

    it("renders validation scene details", () => {
      render(<ChapterScene chapter={baseChapter("validation")} />)
      expect(screen.getByText("StoreCheckoutRequest")).toBeDefined()
      expect(screen.getByText("a miss never touches a service")).toBeDefined()
    })

    it("renders ok/success scene details", () => {
      render(<ChapterScene chapter={baseChapter("ok")} />)
      expect(screen.getByText("200 OK · DELIVERED")).toBeDefined()
      expect(screen.getByText("envelope · 38ms · ticket issued")).toBeDefined()
    })
  })
})
