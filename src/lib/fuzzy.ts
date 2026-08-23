/** Deterministic subsequence fuzzy score. Lower = better; -1 = no match. */
export function fuzzyScore(query: string, candidate: string): number {
  const q = query.toLowerCase()
  const c = candidate.toLowerCase()
  if (!q) return 0
  let qi = 0
  let score = 0
  let lastHit = -2
  for (let ci = 0; ci < c.length && qi < q.length; ci++) {
    if (c[ci] === q[qi]) {
      score += ci - lastHit === 1 ? 0 : 1 // consecutive hits cheaper
      if (ci === 0 || /[\s/._-]/.test(c[ci - 1]!)) score -= 1 // word-boundary bonus
      lastHit = ci
      qi++
    }
  }
  return qi < q.length ? -1 : score
}

export type Ranked<T> = { item: T; score: number; index: number }

export function rank<T>(query: string, items: T[], text: (t: T) => string, limit = 12): Ranked<T>[] {
  const out: Ranked<T>[] = []
  for (let i = 0; i < items.length; i++) {
    const s = fuzzyScore(query, text(items[i]!))
    if (s >= 0) out.push({ item: items[i]!, score: s, index: i })
  }
  out.sort((a, b) => a.score - b.score || a.index - b.index)
  return out.slice(0, limit)
}
