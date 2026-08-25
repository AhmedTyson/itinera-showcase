import { useEffect, useRef } from "react"
import { gsap, ScrollTrigger } from "../../lib/gsap"
import { Server, Database, MonitorSmartphone, Plug, FlaskConical, Container, KeyRound, ShieldCheck, Zap, Droplets, Sparkles, CreditCard, CloudSun, Grid3x3, Rocket, HeartPulse, Circle } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { STACK_GROUPS } from "../../lib/home-content"

const ICONS: Record<string, LucideIcon> = {
  "Backend Core": Server,
  "Data Layer": Database,
  Frontend: MonitorSmartphone,
  Integrations: Plug,
  Quality: FlaskConical,
  Infrastructure: Container,
}

const BRANDS: Record<string, string> = {
  "Laravel 13": "laravel",
  MySQL: "mysql",
  SQLite: "sqlite",
  "Redis-ready": "redis",
  "Vanilla Multi-page": "javascript",
  "Postman Collection": "postman",
  Docker: "docker",
}

function ItemIcon({ name }: { name: string }) {
  const brand = BRANDS[name]
  if (brand) {
    return (
      <img
        src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${brand}/${brand}-original.svg`}
        alt=""
        aria-hidden
        loading="lazy"
        className="h-4 w-4 shrink-0 opacity-90"
      />
    )
  }
  const Fallback = FALLBACKS[name] ?? Circle
  return <Fallback className="h-4 w-4 shrink-0 text-dim" aria-hidden />
}

const FALLBACKS: Record<string, LucideIcon> = {
  "JWT Auth": KeyRound,
  "Spatie RBAC": ShieldCheck,
  "GSAP 3.12": Zap,
  Glassmorphism: Droplets,
  "Groq AI": Sparkles,
  Paymob: CreditCard,
  "Open-Meteo · OSM": CloudSun,
  "PHPUnit · 55 files": FlaskConical,
  "Permission Matrix": Grid3x3,
  Railway: Rocket,
  "Health Probe": HeartPulse,
}

/* ── flat item registry: index ↔ data ── */
type FlatItem = { name: string; note: string; group: string; index: number }
const FLAT_ITEMS: FlatItem[] = STACK_GROUPS.flatMap((g) =>
  g.items.map((it, i) => ({ ...it, group: g.group, index: STACK_GROUPS.slice(0, STACK_GROUPS.indexOf(g)).reduce((n, x) => n + x.items.length, 0) + i })),
)
const TOTAL_ITEMS = FLAT_ITEMS.length

/* capability gates */
const CAN_HOVER =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches
const REDUCED = typeof window !== "undefined" && /[?&]motion=reduced\b/.test(window.location.search)

export function StackGrid() {
  const wrapRef = useRef<HTMLDivElement>(null)

  /* ══════════ IMPERATIVE POPUP CONTROLLER ══════════
     One singleton on <body>, built once, driven imperatively.
     No React state in the hot path → nothing can unmount/race the content.
     Content is filled SYNCHRONOUSLY before any animation frame. */
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    /* ── build singleton ── */
    let pop = document.getElementById("stack-pop") as HTMLDivElement | null
    if (!pop) {
      pop = document.createElement("div")
      pop.id = "stack-pop"
      pop.className = "stack-pop"
      pop.setAttribute("role", "tooltip")
      pop.innerHTML = `
        <div class="sp-body">
          <div class="sp-child sp-head">
            <span class="sp-icon" data-node="icon"></span>
            <div class="sp-title"><b data-node="name"></b><span class="sp-group" data-node="group"></span></div>
            <span class="sp-count" data-node="count"></span>
          </div>
          <p class="sp-child sp-note" data-node="note"></p>
        </div>
        <span class="stack-pop-caret" aria-hidden="true"></span>`
      document.body.appendChild(pop)
    }
    const q = <T extends HTMLElement>(sel: string) => pop!.querySelector<T>(sel)!
    const nodes = {
      icon: q("[data-node='icon']"),
      name: q("[data-node='name']"),
      group: q("[data-node='group']"),
      count: q("[data-node='count']"),
      note: q("[data-node='note']"),
    }

    let current: { item: FlatItem; anchor: HTMLElement } | null = null
    let lastWrapAt = 0
    let anim: Animation | null = null

    /** Fill content SYNCHRONOUSLY — complete before any frame renders it. */
    const fill = (t: { item: FlatItem; anchor: HTMLElement }) => {
      const iconSrc = t.anchor.querySelector(".item-ic")
      if (iconSrc && !nodes.icon.contains(iconSrc.firstChild)) {
        nodes.icon.replaceChildren(...Array.from(iconSrc.cloneNode(true).childNodes))
        // copy the visual too (img/svg element itself)
        const el = iconSrc.firstElementChild
        if (el) nodes.icon.replaceChildren(el.cloneNode(true))
      }
      nodes.name.textContent = t.item.name
      nodes.group.textContent = t.item.group
      nodes.note.textContent = t.item.note
      nodes.count.textContent = `${String(t.item.index + 1).padStart(2, "0")}/${String(TOTAL_ITEMS).padStart(2, "0")}`
    }

    const place = () => {
      if (!current || !pop) return
      const r = current.anchor.getBoundingClientRect()
      const pw = pop.offsetWidth || 264
      const ph = pop.offsetHeight || 128
      const flip = r.top < ph + 26
      const x = Math.min(Math.max(12, r.left + r.width / 2 - pw / 2), Math.max(12, window.innerWidth - pw - 12))
      const y = flip ? r.bottom + 14 : Math.max(8, r.top - ph - 14)
      const caret = Math.min(Math.max(r.left + r.width / 2 - x - 5, 10), pw - 20)
      pop.dataset.flip = flip ? "1" : "0"
      pop.style.left = `${Math.round(x)}px`
      pop.style.top = `${Math.round(y)}px`
      pop.style.setProperty("--sp-caret", `${Math.round(caret)}px`)
      return flip ? "below" : "above"
    }

    const open = (t: { item: FlatItem; anchor: HTMLElement }) => {
      if (!pop) return
      const prev = current
      current = t
      t.anchor.setAttribute("aria-describedby", "stack-pop")
      fill(t)

      if (prev && prev.anchor !== t.anchor) prev.anchor.removeAttribute("aria-describedby")

      const origin = place() === "below" ? "50% 0%" : "50% 100%"
      pop.style.transformOrigin = origin
      pop.style.visibility = "visible"
      pop.classList.add("is-open")

      anim?.cancel()
      if (!REDUCED) {
        anim = pop.animate(
          [
            { opacity: 0, transform: `translateY(${origin === "50% 0%" ? "8px" : "-8px"}) scale(0.94)` },
            { opacity: 1, transform: "translateY(0px) scale(1)" },
          ],
          { duration: 340, easing: "cubic-bezier(.34,1.45,.64,1)", fill: "both" },
        )
      } else {
        pop.style.opacity = "1"
      }
    }

    const close = () => {
      if (!current || !pop) return
      current.anchor.removeAttribute("aria-describedby")
      current = null
      anim?.cancel()
      if (REDUCED) {
        pop.classList.remove("is-open")
        pop.style.visibility = "hidden"
        return
      }
      anim = pop.animate(
        [{ opacity: 1 }, { opacity: 0, transform: "translateY(-4px) scale(0.97)" }],
        { duration: 130, easing: "ease-in", fill: "forwards" },
      )
      anim.finished
        .then(() => {
          if (!current) {
            pop.classList.remove("is-open")
            pop.style.visibility = "hidden"
          }
        })
        .catch(() => {})
    }

    /* ── trigger wiring (event delegation on the grid) ── */
    const onPointerOver = (e: Event) => {
      if (!CAN_HOVER) return
      const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-stack-item]")
      if (!btn || !wrap.contains(btn)) return
      const idx = Number(btn.dataset.stackItem)
      const t = { item: FLAT_ITEMS[idx], anchor: btn }
      if (current?.anchor === btn) return // same row — don't replay
      open(t)
    }
    const onPointerOut = (e: Event) => {
      if (!CAN_HOVER) return
      const pe = e as PointerEvent
      const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-stack-item]")
      if (!btn) return
      const rel = pe.relatedTarget as Node | null
      // only close when the pointer truly left the row (not child-to-child)
      if (rel && btn.contains(rel)) return
      close()
    }
    const onClickCoarse = (e: Event) => {
      if (CAN_HOVER) return
      const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-stack-item]")
      if (!btn || !wrap.contains(btn)) return
      const idx = Number(btn.dataset.stackItem)
      if (current?.anchor === btn) {
        close()
        return
      }
      open({ item: FLAT_ITEMS[idx], anchor: btn })
    }
    wrap.addEventListener("pointerover", onPointerOver)
    wrap.addEventListener("pointerout", onPointerOut)
    wrap.addEventListener("click", onClickCoarse)

    /* ── global dismissal / lifecycle (document-level singleton) ── */
    const stickOrClose = () => {
      if (!current) return
      let hovered = false
      try {
        hovered = current.anchor.matches(":hover")
      } catch {}
      if (hovered) {
        place() // smooth-scroll tail: follow the anchor, stay open
        return
      }
      close()
    }
    const onScroll = () => {
      if (Date.now() - lastWrapAt < 1200) return // mid-wrap flight
      stickOrClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && current) {
        current.anchor.focus?.()
        close()
      }
    }
    const onPointerDownDoc = (e: PointerEvent) => {
      if (!current) return
      const target = e.target as Node
      if (pop.contains(target) || current.anchor.contains(target)) return
      close()
    }
    const onResize = () => {
      if (current) place()
    }
    const iv = window.setInterval(() => {
      if (current && !current.anchor.isConnected) close()
    }, 700)

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("keydown", onKey)
    window.addEventListener("resize", onResize)
    document.addEventListener("pointerdown", onPointerDownDoc, true)

    /* ── recalc on layout shifts ── */
    const ro = new ResizeObserver(() => {
      if (current) place()
    })
    if (pop) ro.observe(document.body)

    return () => {
      wrap.removeEventListener("pointerover", onPointerOver)
      wrap.removeEventListener("pointerout", onPointerOut)
      wrap.removeEventListener("click", onClickCoarse)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("pointerdown", onPointerDownDoc, true)
      window.clearInterval(iv)
      ro.disconnect()
      anim?.cancel()
      pop.remove() // singleton dies with the page section
    }
  }, [])

  /* stagger entrance when scrolled into view — not on mount */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      const tl = gsap
        .timeline({ paused: true })
        .fromTo(".stack-card", { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.07, ease: "power2.out" })
        .fromTo(".stack-icon", { scale: 0.8 }, { scale: 1, duration: 0.35, stagger: 0.07, ease: "back.out(2)" }, "-=0.4")
      ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => tl.play() })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={wrapRef} aria-label="Technology stack — six groups">
      {/* bins header strip */}
      <div
        className="mb-3 flex items-center justify-between rounded-lg px-4 py-2"
        style={{ background: "var(--bp-stub-bg)", border: "1px solid var(--bp-border)" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--bp-text-dim)" }}>
          Component Bins
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--bp-text-white)" }}>
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          {STACK_GROUPS.length} groups · Laravel 13
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STACK_GROUPS.map((group) => {
          const Icon = ICONS[group.group] ?? Server
          return (
            <div
              key={group.group}
              className="stack-card group relative overflow-hidden rounded-xl border border-border/70 bg-white/[0.02] p-5 transition-colors hover:border-primary/40"
            >
              <svg aria-hidden className="pointer-events-none absolute right-0 top-0 text-primary/25 transition-colors group-hover:text-primary/60" width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path d="M33 12 L12 33" stroke="currentColor" strokeWidth="1" />
                <path d="M33 22 L22 33" stroke="currentColor" strokeWidth="1" />
              </svg>

              <div className="mb-4 flex items-center gap-3">
                <span className="stack-icon flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition-colors group-hover:border-primary/60 group-hover:text-[#fbbf24]">
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">{group.group}</h3>
              </div>

              <ul className="space-y-1">
                {group.items.map((item) => {
                  const flatIdx = FLAT_ITEMS.findIndex((f) => f.name === item.name)
                  return (
                    <li key={item.name}>
                      <button
                        type="button"
                        data-stack-item={flatIdx}
                        aria-label={`${item.name} — ${item.note}`}
                        className="stack-item group/item flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-primary/[0.06]"
                      >
                        <span className="item-ic mt-0 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/70 bg-white/[0.03] transition-transform duration-200 group-hover/item:scale-110 group-hover/item:border-primary/50">
                          <ItemIcon name={item.name} />
                        </span>
                        <span className="min-w-0">
                          <b className="block truncate text-[13.5px] leading-tight text-text transition-colors group-hover/item:text-primary">
                            {item.name}
                          </b>
                        </span>
                        <svg aria-hidden className="ml-auto h-3 w-3 shrink-0 text-primary opacity-0 transition-opacity duration-200 group-hover/item:opacity-100" viewBox="0 0 12 12" fill="none">
                          <path d="M2 10 L10 2 M4 2 H10 V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
