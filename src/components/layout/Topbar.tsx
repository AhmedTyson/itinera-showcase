import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Book, FileText, Home, Menu, Search } from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { ThemeSwitch } from "../ui/theme-switch"
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
  wiki: [
    { label: "Overview", href: "/wiki/overview" },
    { label: "Architecture", href: "/wiki/architecture" },
    { label: "Backend", href: "/wiki/backend" },
    { label: "API Ref", href: "/wiki/api" },
  ],
}

const SUBTITLES: Record<string, string> = {
  home: "Team 2 Conference @ Threedos",
  docs: "API Docs · Threedos",
  wiki: "RepoWiki · Threedos",
}

export type TopbarProps = {
  variant: "home" | "docs" | "wiki"
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
          aria-label={variant === "docs" ? "Docs sections" : variant === "wiki" ? "Wiki sections" : "Sections"}
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
          {/* Search pill — shadcn command trigger style */}
          <button
            type="button"
            aria-label="Search everything (Ctrl K)"
            onClick={openPalette}
            className="hidden h-9 w-56 items-center gap-2 rounded-lg border border-border bg-bg-1/40 px-3 text-sm text-dim transition-colors hover:border-border-strong hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 xl:flex"
          >
            <Search className="h-3.5 w-3.5" aria-hidden />
            <span>Search…</span>
            <kbd className="pointer-events-none ml-auto inline-flex select-none items-center gap-0.5 rounded border border-border bg-white/5 px-1.5 font-mono text-[10px] font-medium text-dim">
              Ctrl K
            </kbd>
          </button>
          {/* compact icon fallback below xl */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search everything (Ctrl K)"
            onClick={openPalette}
            className="xl:hidden"
          >
            <Search className="h-4 w-4" />
          </Button>

          <div className="hidden h-5 w-px bg-border sm:block" aria-hidden />

          {variant === "home" && (
            <>
              <a href="https://itinera.apidog.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-[#02120b] transition-colors hover:bg-emerald-400">
                <Book className="h-3.5 w-3.5" /> API Docs
              </a>
              <Link to="/wiki" className="hidden items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-dim transition-colors hover:border-border-strong hover:text-text xl:inline-flex">
                <FileText className="h-3.5 w-3.5" /> Repo Wiki
              </Link>
            </>
          )}
          {variant === "docs" && (
            <>
              <Link to="/" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-dim hover:text-text">
                <Home className="h-3.5 w-3.5" /> Showcase
              </Link>
              <a href="https://itinera.apidog.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-[#02120b]">
                <FileText className="h-3.5 w-3.5" /> Apidog Spec
              </a>
            </>
          )}
          {variant === "wiki" && (
            <>
              <a href="https://itinera.apidog.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-[#02120b]">
                <Book className="h-3.5 w-3.5" /> API Docs
              </a>
              <Link to="/" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-dim hover:text-text">
                <Home className="h-3.5 w-3.5" /> Showcase
              </Link>
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
                <Search className="h-4 w-4" /> Search… <kbd className="ml-auto font-mono text-[10px]">Ctrl K</kbd>
              </button>
              <div className="mt-3 flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm text-dim">Appearance</span>
                <ThemeSwitch />
              </div>
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <Link to="/docs" onClick={() => setOpen(false)} className="rounded-full bg-primary px-4 py-2 text-center text-sm font-bold text-bg-0">API Docs</Link>
                <Link to="/wiki" onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2 text-center text-sm text-dim">Repo Wiki</Link>
                <Link to="/" onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2 text-center text-sm text-dim">Showcase</Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
