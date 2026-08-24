import {
  ENDPOINTS,
  ERRORS,
  APIDOG_STEPS,
  ARTICLE_HEADINGS,
  GROUP_LABELS,
  QUICKSTART_SH,
  SCHEMAS,
  WEBHOOK_STEPS,
  AUDIT_DATE,
  type GroupId,
} from "../../lib/docs-data"
import { EndpointDisclosure } from "./endpoint-disclosure"
import { CodeBlock } from "../ui/code-block"

const KICKER = "ITINERA"
const PILL_OK = "OpenAPI via Scramble · /docs/api.json"
const PILL_PLAIN = "Postman collection included"
const PILL_MID = `Counts audited ${AUDIT_DATE}`

function H2({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-xl font-bold tracking-tight text-text md:text-2xl">
      {children}
    </h2>
  )
}

/** Full legacy article flow, composed from typed data. Copy on every code surface (G4). */
export function DocsArticle() {
  const groups = Object.keys(GROUP_LABELS) as GroupId[]
  return (
    <article className="docs-article mx-auto w-full min-w-0 max-w-[860px] space-y-14 pb-20 pt-2">
      {/* hero */}
      <header id="overview" className="scroll-mt-24">
        <p className="mb-3 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
          <span className="text-primary">{KICKER}</span>
          <span aria-hidden className="h-px w-10 bg-border" />
          <span>REST API Reference</span>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] normal-case">base URL /api</span>
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-text md:text-[34px] md:leading-[1.15]">
          Every route,{" "}
          <em className="font-serif italic text-primary">one shell</em>.
        </h1>
        <p className="mt-4 max-w-[70ch] text-[15px] leading-relaxed text-muted">
          106 API operations across Account, Catalog, Trips, AI, Commerce, Chat, System and Admin. Uniform response envelope,
          JWT bearer auth, per-surface throttling, HMAC-verified webhooks. Full interactive reference at{" "}
          <a href="https://itinera.apidog.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">itinera.apidog.io</a>. Press{" "}
          <kbd className="rounded border border-border bg-white/5 px-1.5 py-0.5 font-mono text-[11px]">Ctrl K</kbd> anywhere to jump.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11.5px] text-emerald-300">{PILL_OK}</span>
          <span className="rounded-full border border-border px-3 py-1 text-[11.5px] text-muted">{PILL_PLAIN}</span>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11.5px] text-amber-300">{PILL_MID}</span>
        </div>
      </header>

      {/* quickstart */}
      <section className="space-y-3">
        <H2 id="quickstart">Quickstart</H2>
        <p className="max-w-[70ch] text-[13.5px] leading-relaxed text-muted">
          From a clean clone to an authenticated request in six commands (Windows: replace <code className="rounded bg-white/5 px-1 font-mono text-[12px]">cp</code> with{" "}
          <code className="rounded bg-white/5 px-1 font-mono text-[12px]">copy</code>).
        </p>
        <CodeBlock code={QUICKSTART_SH} label="setup" />
        <p className="max-w-[70ch] text-[13.5px] leading-relaxed text-muted">
          Seeded logins: <code className="rounded bg-white/5 px-1 font-mono text-[12px]">admin@threedos.com / password</code> (super_admin) and seeded
          customer users.
        </p>
      </section>

      {/* authentication */}
      <section className="space-y-6">
        <H2 id="authentication">Authentication</H2>

        <div className="space-y-3">
          <h3 id="auth-jwt" className="scroll-mt-24 text-base font-semibold text-text">JWT flow</h3>
          <p className="max-w-[70ch] text-[13.5px] leading-relaxed text-muted">
            Guard <code className="rounded bg-white/5 px-1 font-mono text-[12px]">api</code> powered by{" "}
            <code className="rounded bg-white/5 px-1 font-mono text-[12px]">tymon/jwt-auth</code>. Login returns a bearer token valid 1 hour; rotate with{" "}
            <code className="rounded bg-white/5 px-1 font-mono text-[12px]">POST /refresh</code> (throttled 15/min); logout blacklists server-side. Send it
            everywhere: <code className="rounded bg-white/5 px-1 font-mono text-[12px]">Authorization: Bearer &lt;token&gt;</code>.
          </p>
          <EndpointDisclosure endpoint={ENDPOINTS[0]!} />
        </div>

        <div className="space-y-2">
          <h3 id="auth-verify" className="scroll-mt-24 text-base font-semibold text-text">Email verification gate</h3>
          <p className="max-w-[70ch] text-[13.5px] leading-relaxed text-muted">
            <code className="rounded bg-white/5 px-1 font-mono text-[12px]">User implements MustVerifyEmail</code>. Registering fires a signed link →{" "}
            <code className="rounded bg-white/5 px-1 font-mono text-[12px]">GET /api/email/verify/&#123;id&#125;/&#123;hash&#125;</code> answers JSON for API clients
            or 302s browsers. Resend → <code className="rounded bg-white/5 px-1 font-mono text-[12px]">POST /api/email/resend</code> with a 60s throttle. Until
            verified, protected groups answer <code className="rounded bg-white/5 px-1 font-mono text-[12px]">403 email_not_verified</code>.
          </p>
        </div>

        <div className="space-y-2">
          <h3 id="auth-oauth" className="scroll-mt-24 text-base font-semibold text-text">OAuth (Google · Facebook)</h3>
          <p className="max-w-[70ch] text-[13.5px] leading-relaxed text-muted">
            Socialite redirects: <code className="rounded bg-white/5 px-1 font-mono text-[12px]">GET /api/auth/google</code> /{" "}
            <code className="rounded bg-white/5 px-1 font-mono text-[12px]">/api/auth/facebook</code>; callbacks store{" "}
            <code className="rounded bg-white/5 px-1 font-mono text-[12px]">?token&amp;needs_verify&amp;email</code> on the frontend. Incomplete profiles finish
            via <code className="rounded bg-white/5 px-1 font-mono text-[12px]">POST /api/auth/social/complete</code>. Provider emails are never auto-trusted —
            the inbox click is always required.
          </p>
        </div>

        <div className="space-y-2">
          <h3 id="auth-rbac" className="scroll-mt-24 text-base font-semibold text-text">Roles &amp; permissions</h3>
          <p className="max-w-[70ch] text-[13.5px] leading-relaxed text-muted">
            Spatie roles: <span className="font-mono text-[12px] text-text">super_admin · admin · agency · user</span>, plus named permissions per route (
            <span className="font-mono text-[12px]">permission:manage users</span>,{" "}
            <span className="font-mono text-[12px]">role:admin|super_admin</span>). Full matrix in the backend docs.
          </p>
        </div>
      </section>

      {/* endpoints */}
      <section className="space-y-6">
        <H2 id="endpoints">Endpoints by domain</H2>
        <p className="max-w-[70ch] text-[13.5px] leading-relaxed text-muted">
          Filter-free curated set of the routes you'll actually reach for; the complete machine-generated surface is at{" "}
          <span className="font-mono text-[12px] text-text">/docs/api.json</span>. Search everything with{" "}
          <kbd className="rounded border border-border bg-white/5 px-1.5 py-0.5 font-mono text-[11px]">Ctrl K</kbd>.
        </p>

        {groups.map((group) => (
          <div key={group} className="space-y-3">
            <h3 id={`ep-${group}`} className="scroll-mt-24 text-base font-semibold text-text">
              {GROUP_LABELS[group]}
              <span className="ml-2 align-middle font-mono text-[11px] tabular-nums text-dim">
                {ENDPOINTS.filter((e) => e.group === group).length}
              </span>
            </h3>
            <div className="space-y-2.5">
              {ENDPOINTS.filter((e) => e.group === group && e.id !== "ep-login").map((e) => (
                <EndpointDisclosure key={e.id} endpoint={e} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* schemas */}
      <section className="space-y-6">
        <H2 id="schemas">Schemas</H2>
        {SCHEMAS.map((schema) => (
          <div key={schema.id} className="space-y-3">
            <h3 id={schema.id} className="scroll-mt-24 text-base font-semibold text-text">{schema.title}</h3>
            <CodeBlock code={schema.json} label={schema.title} />
          </div>
        ))}
        <p className="text-[12px] italic text-dim">
          FlightResource mirrors the boarding pass exactly: airline · flight_number · price · departure/arrival airport + datetime.
        </p>
      </section>

      {/* errors */}
      <section className="space-y-3">
        <H2 id="errors">Errors envelope</H2>
        <div
          tabIndex={0}
          role="region"
          aria-label="Errors table — scrollable horizontally on small screens"
          className="overflow-x-auto rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th scope="col" className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-dim">HTTP</th>
                <th scope="col" className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-dim">Meaning</th>
                <th scope="col" className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-dim">Notes</th>
              </tr>
            </thead>
            <tbody>
              {ERRORS.map((row) => (
                <tr key={row.code} className="border-t border-border hover:bg-primary/5">
                  <td className="px-4 py-2.5 font-mono text-[12.5px] tabular-nums text-text">{row.code}</td>
                  <td className="px-4 py-2.5 font-medium text-text">{row.meaning}</td>
                  <td className="px-4 py-2.5 text-[13px] text-muted">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* webhooks */}
      <section className="space-y-3">
        <H2 id="webhooks-paymob">Paymob webhook contract</H2>
        <ol className="list-decimal space-y-2 pl-5 text-[13.5px] leading-relaxed text-muted marker:text-dim">
          {WEBHOOK_STEPS.map((step) => (
            <li key={step.lead}>
              <b className="text-text">{step.lead}</b> {step.detail}
            </li>
          ))}
        </ol>
      </section>

      {/* apidog — no vestigial wrapper (G5) */}
      <section className="space-y-4">
        <H2 id="apidog">Import into Apidog</H2>
        <p className="max-w-[70ch] text-[13.5px] leading-relaxed text-muted">
          Nine steps from running backend to a fully grouped Apidog project.
        </p>
        <ol className="grid max-w-[640px] gap-3 [counter-reset:step] list-none p-0">
          {APIDOG_STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3 [counter-increment:step]">
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[11px] tabular-nums text-dim"
              >
                {i + 1}
              </span>
              <div>
                <h4 className="text-[13.5px] font-semibold text-text">{step.title}</h4>
                <p className="mt-0.5 text-[13px] text-muted">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-6 text-[12px] text-dim">
        <a href="/#gateway" className="text-muted underline-offset-4 hover:text-text hover:underline">
          ← Back to showcase
        </a>
        <span>Itinera · Team 2 · counts audited {AUDIT_DATE} via route:list</span>
      </footer>
    </article>
  )
}

// keep heading ids referenced for palette index integrity check
export const HEADING_IDS = ARTICLE_HEADINGS.map((h) => h.id)
