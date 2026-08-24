import { afterEach, describe, expect, it } from "vitest"
import { deckSlideIds, isDeckMounted, on, requestJump, setDeckMounted } from "../deckBus"

afterEach(() => {
  setDeckMounted(null)
})

describe("deckBus", () => {
  it("register/unmount lifecycle", () => {
    expect(isDeckMounted()).toBe(false)
    setDeckMounted(["hero", "demo"])
    expect(isDeckMounted()).toBe(true)
    expect(deckSlideIds()).toEqual(["hero", "demo"])
    setDeckMounted(null)
    expect(isDeckMounted()).toBe(false)
  })

  it("requestJump false when unmounted or unknown id", () => {
    expect(requestJump("demo")).toBe(false)
    setDeckMounted(["demo"])
    expect(requestJump("nope")).toBe(false)
  })

  it("requestJump emits to subscribers when mounted + known", () => {
    setDeckMounted(["demo"])
    const seen: string[] = []
    const off = on("jump", (p) => seen.push(p.id))
    expect(requestJump("demo")).toBe(true)
    expect(seen).toEqual(["demo"])
    off()
    expect(requestJump("demo")).toBe(true)
    expect(seen).toEqual(["demo"]) // unsubscribed — no double delivery
  })

  it("register event fires on mount", () => {
    const seen: string[][] = []
    const off = on("register", (p) => seen.push(p.ids))
    setDeckMounted(["a", "b"])
    expect(seen).toEqual([["a", "b"]])
    off()
  })
})
