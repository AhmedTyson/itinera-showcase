import { Link } from "react-router-dom"
import { Book, FileText } from "lucide-react"
import { SITE_UPDATED } from "../../lib/home-content"

function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  )
}

/**
 * Slide 12 · Closing (D8) — the deck's end card. The semantic <footer>
 * lives INSIDE this slide; the old inline footer block is deleted.
 */
export function Closing() {
  return (
    <div className="mx-auto max-w-4xl px-4 text-center lg:px-6">
      <h2
        id="slide-12-heading"
        tabIndex={-1}
        data-reveal="kicker"
        className="text-[clamp(3rem,8vw,5.5rem)] font-extrabold leading-none tracking-tight text-text"
      >
        Itinera<span className="text-primary">.</span>
      </h2>
      <p data-reveal="title" className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-dim">
        Luxury travel, orchestrated by Laravel 13. Team 2 conference deliverable @ Threedos.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <a
          data-reveal="content"
          href="https://itinera.apidog.io"
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border border-border/70 bg-white/[0.02] p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50"
        >
          <Book className="mx-auto h-5 w-5 text-primary" aria-hidden />
          <b className="mt-2.5 block text-[14px] text-text">API Docs</b>
          <span className="mt-0.5 block font-mono text-[11px] text-dim">itinera.apidog.io</span>
        </a>
        <a
          data-reveal="content"
          href="https://github.com/AhmedTyson/Team2-Conference-Project"
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border border-border/70 bg-white/[0.02] p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50"
        >
          <GithubMark className="mx-auto h-5 w-5 text-primary" />
          <b className="mt-2.5 block text-[14px] text-text">Repository</b>
          <span className="mt-0.5 block font-mono text-[11px] text-dim">Team2-Conference-Project</span>
        </a>
        <Link
          data-reveal="content"
          to="/wiki"
          className="group rounded-xl border border-border/70 bg-white/[0.02] p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50"
        >
          <FileText className="mx-auto h-5 w-5 text-primary" aria-hidden />
          <b className="mt-2.5 block text-[14px] text-text">Repo Wiki</b>
          <span className="mt-0.5 block font-mono text-[11px] text-dim">full engineering wiki</span>
        </Link>
      </div>

      <footer data-reveal="content" className="mt-12 border-t border-border/50 pt-6 text-[12px] text-dim">
        <p>
          © 2026 Itinera — Team 2 · MIT · Laravel 13 · React 19 · Apidog
        </p>
        <p className="mt-1 tabular-nums">site updated {SITE_UPDATED}</p>
      </footer>
    </div>
  )
}
