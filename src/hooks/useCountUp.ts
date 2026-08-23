import { useEffect, useRef, useState } from "react"
import { useIsReducedMotion } from "./useIsReducedMotion"

export function useCountUp(target: number, opts: { duration?: number } = {}) {
  const duration = opts.duration ?? 900
  const ref = useRef<HTMLElement>(null)
  const [value, setValue] = useState(0)
  const [done, setDone] = useState(false)
  const isRM = useIsReducedMotion()

  useEffect(() => {
    if (isRM) {
      setValue(target)
      setDone(true)
      return
    }
    const el = ref.current
    if (!el) return
    let raf = 0
    let started = false
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true
            const t0 = performance.now()
            const tick = (now: number) => {
              const p = Math.min(1, (now - t0) / duration)
              const eased = 1 - Math.pow(1 - p, 3)
              setValue(Math.round(eased * target))
              if (p < 1) raf = requestAnimationFrame(tick)
              else setDone(true)
            }
            raf = requestAnimationFrame(tick)
            io.disconnect()
          }
        })
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [target, duration, isRM])

  return { ref: ref as React.RefObject<HTMLElement>, value, done }
}
