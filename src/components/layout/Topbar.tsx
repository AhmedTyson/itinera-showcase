import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Book, Command, FileText, Home, Menu } from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { ThemeSwitch } from "../ui/theme-switch"
import { CTACircle, CTACircleLink } from "../ui/cta-circle"
import { useIsReducedMotion } from "../../hooks/useIsReducedMotion"

type NavLink = { label: string; href: string }

const NAV_DEFAULTS: Record<string, NavLink[]> = {
  home: [
    { label: "Architecture", href: "#architecture" },
    { label: "Stack", href: "#stack" },
    { label: "Security", href: "#security" },
    { label: "Demo", href: "#demo" },
    { label: "Team", href: "#team" },
  ],
  docs: [
    { label: "Quickstart", href: "#quickstart" },
    { label: "Auth", href: "#authentication" },
    { label: "Endpoints", href: "#endpoints" },
    { label: "Errors", href: "#errors" },
    { label: "Webhooks", href: "#webhooks-paymob" },
    { label: "Apidog", href: "#apidog" },
  ],
}

const SUBTITLES: Record<string, string> = {
  home: "Team 2 Conference @ Threedos",
  docs: "API Docs · Threedos",
}

export type TopbarProps = {
  variant: "home" | "docs"
  links?: NavLink[]
  subtitle?: string
}

export function Topbar({ variant, links, subtitle }: TopbarProps) {
  const navLinks = links ?? NAV_DEFAULTS[variant]
  const sub = subtitle ?? SUBTITLES[variant]
  const [active, setActive] = useState<string>("")
  const [open, setOpen] = useState(false)
  const isRM = useIsReducedMotion()
  const navigate = useNavigate()

  useEffect(() => {
    const ids = navLinks.map((l) => l.href.replace("#", "")).filter(Boolean)
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as Element[]
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive("#" + e.target.id)
        })
      },
      { rootMargin: "-80px 0px -70% 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [navLinks])

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    if (href.startsWith("/")) {
      e.preventDefault()
      navigate(href)
      setOpen(false)
      return
    }
    if (href.startsWith("#")) {
      e.preventDefault()
      const el = document.querySelector(href)
      if (el) {
        el.scrollIntoView({ behavior: isRM ? "auto" : "smooth", block: "start" })
        history.replaceState(null, "", href)
        setActive(href)
      }
      setOpen(false)
    }
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: isRM ? "auto" : "smooth" })

  const openPalette = () =>
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[.06] bg-panel/70 backdrop-blur-xl supports-[backdrop-filter]:bg-panel/50">
      <div className="relative mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-5 lg:px-8">
        {/* Logo — bare mark, it's a logo not an icon-in-a-chip */}
        <Link
          to={variant === "home" ? "#" : "/"}
          onClick={variant === "home" ? (e) => { e.preventDefault(); scrollToTop() } : undefined}
          className="group flex shrink-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-0 rounded-md pr-1"
          aria-label="Itinera home"
        >
          <img
            src="/logo-mark.png"
            alt=""
            className="h-9 w-auto object-contain transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
          />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-extrabold tracking-tight text-text">
              Itinera<span className="text-primary">.</span>
            </span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-dim">{sub}</span>
          </span>
        </Link>

        {/* Section links — quiet text, flat underline indicator */}
        <nav
          className="ml-2 hidden min-w-0 flex-1 items-center gap-0.5 lg:flex"
          aria-label={variant === "docs" ? "Docs sections" : "Sections"}
        >
          {navLinks.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={handleNavClick(l.href)}
              aria-current={active === l.href ? "page" : undefined}
              className={`relative whitespace-nowrap px-2.5 py-1.5 text-[13px] transition-colors after:absolute after:inset-x-2.5 after:bottom-0.5 after:h-[2px] after:origin-left after:rounded-full after:bg-primary after:transition-transform after:duration-300 ${
                i >= 7 ? "hidden 2xl:block" : ""
              } ${active === l.href ? "text-text after:scale-x-100" : "text-dim hover:text-text after:scale-x-0"}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ThemeSwitch className="hidden sm:inline-flex" />
          {/* command palette — minimized circle trigger */}
          <button
            type="button"
            aria-label="Open command palette (Ctrl K)"
            aria-keyshortcuts="Control+K"
            onClick={openPalette}
            className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-dim transition-all duration-200 hover:scale-105 hover:border-primary/50 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Command className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" aria-hidden />
            <span className="pointer-events-none absolute top-full mt-1.5 flex items-center gap-1 whitespace-nowrap rounded-md border border-border bg-panel px-2 py-0.5 font-mono text-[10px] text-text opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
              Search <kbd className="text-[9px] text-dim">Ctrl K</kbd>
            </span>
          </button>

          <div className="hidden h-5 w-px bg-border sm:block" aria-hidden />

          {variant === "home" && (
            <>
              <CTACircle href="https://itinera.apidog.io" icon={<Book className="h-3.5 w-3.5" />} label="API Docs" size="sm" tooltip />
            </>
          )}
          {variant === "docs" && (
            <>
              <CTACircleLink to="/" icon={<Home className="h-3.5 w-3.5" />} label="Showcase" variant="ghost" size="sm" />
              <CTACircle href="https://itinera.apidog.io" icon={<FileText className="h-3.5 w-3.5" />} label="Apidog Spec" size="sm" tooltip />
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="xl:hidden">
            <Button variant="ghost" size="icon" aria-label="Toggle navigation" aria-expanded={open} aria-controls="mobile-nav">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-panel border-border" id="mobile-nav">
            <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={handleNavClick(l.href)}
                  aria-current={active === l.href ? "page" : undefined}
                  className={`rounded-lg px-3 py-2.5 text-sm ${active === l.href ? "bg-primary/15 text-primary" : "text-dim"}`}
                >
                  {l.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => { setOpen(false); openPalette() }}
                className="mt-2 flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-dim"
              >
                <Command className="h-4 w-4" /> Search… <kbd className="ml-auto font-mono text-[10px]">Ctrl K</kbd>
              </button>
              <div className="mt-3 flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm text-dim">Appearance</span>
                <ThemeSwitch />
              </div>
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <Link to="/docs" onClick={() => setOpen(false)} className="rounded-full bg-primary px-4 py-2 text-center text-sm font-bold text-bg-0">API Docs</Link>
                <Link to="/" onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2 text-center text-sm text-dim">Showcase</Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

