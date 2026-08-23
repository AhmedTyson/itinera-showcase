import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Book, FileText, Home, Menu, Search } from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { useIsReducedMotion } from "../../hooks/useIsReducedMotion"

type NavLink = { label: string; href: string }

const NAV_DEFAULTS: Record<string, NavLink[]> = {
  home: [
    { label: "Architecture", href: "#architecture" },
    { label: "Audit", href: "#audit" },
    { label: "Stack", href: "#stack" },
    { label: "Frontend", href: "#frontend" },
    { label: "Design", href: "#design" },
    { label: "API", href: "#gateway" },
    { label: "Security", href: "#security" },
    { label: "Data", href: "#data" },
    { label: "Roadmap", href: "#roadmap" },
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
  home: "Showcase · Team 2",
  docs: "API Docs · v1",
  wiki: "RepoWiki · Team 2",
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-panel/80 backdrop-blur supports-[backdrop-filter]:bg-panel/60">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-2 px-4 sm:gap-3 lg:px-6">
        <Link to={variant === "home" ? "#" : "/"} onClick={variant === "home" ? (e) => { e.preventDefault(); scrollToTop() } : undefined} className="flex items-center gap-2.5" aria-label="Itinera home">
          <span className="h-8 w-8 overflow-hidden rounded-lg bg-border flex items-center justify-center">
            <img src="/logo-mark.png" alt="" className="h-full w-full object-cover" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-text">Itinera</span>
            <span className="text-[10px] tracking-widest text-dim uppercase">{sub}</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-6" aria-label={variant === "docs" ? "Docs sections" : variant === "wiki" ? "Wiki sections" : "Sections"}>
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={handleNavClick(l.href)}
              aria-current={active === l.href ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active === l.href ? "bg-primary/15 text-primary" : "text-dim hover:text-text hover:bg-white/[0.04]"}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden md:flex items-center gap-2">
          {variant === "home" && (
            <>
              <Link to="/docs" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-bg-0 hover:bg-primary/90">
                <Book className="h-3.5 w-3.5" /> API Docs
              </Link>
              <Link to="/wiki" className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-dim hover:text-text hover:border-border-strong">
                <FileText className="h-3.5 w-3.5" /> Repo Wiki
              </Link>
            </>
          )}
          {variant === "docs" && (
            <>
              <Link to="/" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-dim hover:text-text">
                <Home className="h-3.5 w-3.5" /> Showcase
              </Link>
              <a href="../Team2-Conference-Project/fullstack/Backend/docs/API-Reference.md" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-bg-0">
                <FileText className="h-3.5 w-3.5" /> Markdown
              </a>
            </>
          )}
          {variant === "wiki" && (
            <>
              <Link to="/docs" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-bg-0">
                <Book className="h-3.5 w-3.5" /> API Docs
              </Link>
              <Link to="/" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-dim hover:text-text">
                <Home className="h-3.5 w-3.5" /> Showcase
              </Link>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            aria-label="Search everything (Ctrl K)"
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
            className="gap-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden lg:inline text-[10px] tracking-widest">⌘K</span>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
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
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <Link to="/docs" onClick={() => setOpen(false)} className="rounded-full bg-primary px-4 py-2 text-center text-sm font-bold text-bg-0">API Docs</Link>
                <Link to="/wiki" onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2 text-center text-sm text-dim">Repo Wiki</Link>
                <Link to="/" onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2 text-center text-sm text-dim">Showcase</Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-60" aria-hidden="true" />
    </header>
  )
}
