import { lazy, Suspense } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, FileCode2 } from "lucide-react"
import { Topbar } from "../components/layout/Topbar"

const MarkdownReader = lazy(() =>
  import("../components/wiki/markdown-reader").then((m) => ({ default: m.MarkdownReader }))
)
import { GUIDES, guideById } from "../lib/wiki-data"
import { useGuide } from "../lib/use-guide"

/** /wiki and /wiki/:guideId — greenfield hydration of the 9 RepoWiki guides. Palette lives globally in App. */
export default function Wiki() {
  const params = useParams<{ guideId?: string }>()
  const navigate = useNavigate()

  const requested = params.guideId
  const known = guideById(requested)
  // unknown id → not-found; missing id → first guide (no redirect needed)
  const guide = known ?? GUIDES[0]!
  const { content, error, loading } = useGuide(guide)

  const idx = GUIDES.findIndex((g) => g.id === guide.id)
  const prev = idx > 0 ? GUIDES[idx - 1] : undefined
  const next = idx < GUIDES.length - 1 ? GUIDES[idx + 1] : undefined

  return (
    <div className="min-h-screen bg-bg-0">
      <Topbar variant="wiki" />
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-4 pt-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-6 xl:grid-cols-[260px_minmax(0,1fr)_220px]">
        {/* sidebar */}
        <nav aria-label="Wiki guides" className="min-w-0">
          <div className="sticky top-24 hidden max-h-[calc(100vh-7rem)] space-y-1 overflow-y-auto pr-2 lg:block">
            <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-dim">Repo Wiki · {GUIDES.length} guides</h3>
            {GUIDES.map((g, i) => {
              const isActive = g.id === guide.id
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => navigate(`/wiki/${g.id}`)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex w-full items-baseline gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-white/5 ${
                    isActive ? "bg-primary/10 font-medium text-primary" : "text-muted"
                  }`}
                >
                  <span className="font-mono text-[10px] tabular-nums text-dim">{String(i + 1).padStart(2, "0")}</span>
                  {g.title}
                </button>
              )
            })}
          </div>
          {/* <lg strip */}
          <div className="-mx-4 flex gap-1.5 overflow-x-auto border-b border-border/60 px-4 pb-3 lg:hidden">
            {GUIDES.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => navigate(`/wiki/${g.id}`)}
                aria-current={g.id === guide.id ? "page" : undefined}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] ${
                  g.id === guide.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted"
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>
        </nav>

        {/* article */}
        <main className="mx-auto w-full min-w-0 max-w-[820px] pb-20">
          {/* hero */}
          <header className="mb-8 border-b border-border/60 pb-6">
            <p className="mb-2 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
              <span className="text-primary">REPOWIKI</span>
              <span aria-hidden className="h-px w-8 bg-border" />
              <span>
                Guide {String(idx + 1).padStart(2, "0")} / {GUIDES.length}
              </span>
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-text">{guide.title}</h1>
            <p className="mt-2 text-[14px] text-muted">{guide.blurb}</p>
          </header>

          {!known && (
            <p role="alert" className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              No guide “{requested}” — showing <b>{guide.title}</b> instead.
            </p>
          )}

          {loading && (
            <div className="space-y-4" aria-live="polite" aria-label="Loading guide">
              {[80, 100, 92, 64].map((w, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-white/5" style={{ width: `${w}%` }} />
              ))}
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              Failed to load this guide ({error}). Try another from the sidebar.
            </p>
          )}

          {content && (
            <Suspense
              fallback={
                <div className="space-y-4" aria-label="Loading reader">
                  {[90, 76, 84, 58].map((w, i) => (
                    <div key={i} className="h-4 animate-pulse rounded bg-white/5" style={{ width: `${w}%` }} />
                  ))}
                </div>
              }
            >
              <MarkdownReader content={content} />
            </Suspense>
          )}

          {/* pager + raw source */}
          {!loading && !error && (
            <>
              <div className="mt-10 border-t border-border/60 pt-5">
                <a
                  href={`/wiki/${guide.file}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] text-dim hover:border-primary/40 hover:text-text"
                >
                  <FileCode2 className="h-3.5 w-3.5" aria-hidden /> Raw markdown
                </a>
              </div>
              <nav aria-label="Guide pagination" className="mt-6 flex items-stretch justify-between gap-3">
                {prev ? (
                  <Link to={`/wiki/${prev.id}`} className="group flex-1 rounded-lg border border-border px-4 py-3 hover:border-primary/40">
                    <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-dim">
                      <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" aria-hidden /> Previous
                    </span>
                    <span className="mt-1 block text-sm font-medium text-text">{prev.title}</span>
                  </Link>
                ) : (
                  <span className="flex-1" />
                )}
                {next ? (
                  <Link to={`/wiki/${next.id}`} className="group flex-1 rounded-lg border border-border px-4 py-3 text-right hover:border-primary/40">
                    <span className="flex items-center justify-end gap-1.5 text-[11px] uppercase tracking-widest text-dim">
                      Next <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                    <span className="mt-1 block text-sm font-medium text-text">{next.title}</span>
                  </Link>
                ) : (
                  <span className="flex-1" />
                )}
              </nav>
            </>
          )}
        </main>

        {/* right rail — reading-position sentinel (per-guide headings come from rendered md) */}
        <aside aria-label="About this wiki" className="sticky top-24 hidden h-fit xl:block">
          <b className="mb-3 block px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-dim">About</b>
          <p className="px-2 text-[12px] leading-relaxed text-dim">
            Nine guides generated from the Team 2 monorepo. Raw sources live in{" "}
            <code className="font-mono text-[11px]">.repowiki/en/content</code>; this reader hydrates the same markdown.
          </p>
        </aside>
      </div>

    </div>
  )
}
