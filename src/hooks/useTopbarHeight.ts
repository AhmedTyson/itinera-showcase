import { useEffect, useState, type RefObject } from "react"

export function useTopbarHeight(ref: RefObject<HTMLElement | null>): number {
  const [h, setH] = useState(64)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setH(el.getBoundingClientRect().height))
    ro.observe(el)
    setH(el.getBoundingClientRect().height)
    return () => ro.disconnect()
  }, [ref])
  return h
}
