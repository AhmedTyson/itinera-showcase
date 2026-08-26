import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

/* dev-only introspection handle; tree-shaken by the `if` guard in prod bundles */
if (import.meta.env.DEV) {
  ;(window as unknown as { __ST__: typeof ScrollTrigger }).__ST__ = ScrollTrigger
}

export { gsap, ScrollTrigger, MotionPathPlugin }
