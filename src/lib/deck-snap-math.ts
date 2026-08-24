/**
 * Snap-point math (D11). Pure functions — unit-tested in deck-snap-math.test.ts.
 * All inputs/outputs in px except the normalized value/return of the GSAP snap callback.
 */

/**
 * Pick the nearest snap offset for a normalized scroll position.
 * Exact distance ties break toward travel direction (GSAP self.direction).
 * The last offset must already be clamped to maxScroll by the caller (D12).
 */
export function snapPointFor(
  value: number,
  offsetsPx: readonly number[],
  maxScroll: number,
  direction: 1 | -1,
): number {
  if (offsetsPx.length === 0 || maxScroll <= 0) return 0
  const px = value * maxScroll
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < offsetsPx.length; i++) {
    const d = Math.abs(offsetsPx[i] - px)
    if (d < bestDist) {
      bestDist = d
      best = i
    } else if (d === bestDist) {
      // tie — direction decides: scrolling down (1) prefers the LATER point, up (-1) the EARLIER
      if (direction === 1 && i > best) best = i
      if (direction === -1 && i < best) best = i
    }
  }
  return offsetsPx[best] / maxScroll
}

/**
 * Rect-based slide-top measurement (D12) — never offsetTop.
 * Returns ascending offsets with the LAST point clamped to maxScroll.
 * Throws on unsorted input (defensive — callers measure in DOM order).
 */
export function buildOffsets(tops: readonly number[], maxScroll: number): number[] {
  if (maxScroll <= 0) return tops.map(() => 0)
  for (let i = 1; i < tops.length; i++) {
    if (tops[i] < tops[i - 1]) throw new Error("buildOffsets: unsorted input")
  }
  const out = tops.map((t) => Math.round(t))
  if (out.length > 0) {
    out[out.length - 1] = Math.min(out[out.length - 1], Math.round(maxScroll))
  }
  return out
}
