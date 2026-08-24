import { describe, expect, it } from "vitest"
import { buildOffsets, snapPointFor } from "../deck-snap-math"

describe("snapPointFor", () => {
  const offsets = [0, 800, 1600, 2400]
  const max = 2400

  it("returns nearest offset normalized", () => {
    expect(snapPointFor(0.1, offsets, max, 1)).toBe(0)
    expect(snapPointFor(0.3, offsets, max, 1)).toBeCloseTo(800 / 2400)
    expect(snapPointFor(0.62, offsets, max, 1)).toBeCloseTo(1600 / 2400)
    expect(snapPointFor(0.95, offsets, max, 1)).toBe(1)
  })

  it("breaks exact ties toward travel direction", () => {
    // exactly between 800 and 1600 → px 1200
    expect(snapPointFor(0.5, offsets, max, 1)).toBeCloseTo(1600 / 2400)
    expect(snapPointFor(0.5, offsets, max, -1)).toBeCloseTo(800 / 2400)
  })

  it("handles single-offset input", () => {
    expect(snapPointFor(0.42, [0], max, 1)).toBe(0)
  })

  it("survives degenerate maxScroll", () => {
    expect(snapPointFor(0.5, offsets, 0, 1)).toBe(0)
  })
})

describe("buildOffsets", () => {
  it("rounds and clamps the last point to maxScroll", () => {
    expect(buildOffsets([0, 800.4, 3000], 2400)).toEqual([0, 800, 2400])
  })

  it("passes through when all points fit", () => {
    expect(buildOffsets([0, 500, 1000], 2000)).toEqual([0, 500, 1000])
  })

  it("rejects unsorted input", () => {
    expect(() => buildOffsets([0, 900, 500], 2000)).toThrow()
  })

  it("zero maxScroll maps everything to zero", () => {
    expect(buildOffsets([0, 100, 200], 0)).toEqual([0, 0, 0])
  })
})
