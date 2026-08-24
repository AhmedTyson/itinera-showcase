import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, ScrollToPlugin)

export { gsap, ScrollTrigger, MotionPathPlugin, ScrollToPlugin }
