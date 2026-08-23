import { useEffect, useState } from "react"
import type { Guide } from "./wiki-data"

type State = { content: string | null; error: string | null; loading: boolean }

const cache = new Map<string, string>()

/** Fetches /wiki/<file> with module-level cache. Encodes defensively even though names are kebab-case now. */
export function useGuide(guide: Guide): State {
  const [state, setState] = useState<State>(() => {
    const hit = cache.get(guide.file)
    return { content: hit ?? null, error: null, loading: !hit }
  })

  useEffect(() => {
    let cancelled = false
    const hit = cache.get(guide.file)
    if (hit) {
      setState({ content: hit, error: null, loading: false })
      return
    }
    setState({ content: null, error: null, loading: true })
    fetch(`/wiki/${guide.file}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((text) => {
        cache.set(guide.file, text)
        if (!cancelled) setState({ content: text, error: null, loading: false })
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ content: null, error: err instanceof Error ? err.message : "Failed to load guide", loading: false })
      })
    return () => {
      cancelled = true
    }
  }, [guide.file])

  return state
}
