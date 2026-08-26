# Cloudflare Pages — 10-Phase Deployment Plan

**Goal:** Ship `itinera-showcase-react` (Vite + React 19 + React Router + Tailwind 4) to Cloudflare Pages free, with SPA fallback, edge caching, and zero build surprises. Each phase is a vertical slice: config → verify → next.

**Current baseline:** `npm run build` → `dist/` (tssc -b && vite), `vite.config.ts` minimal (react + tailwindcss), `react-router` BrowserRouter (`/` ` /lifecycle` ` /#architecture`), large chunks `bwip-js 929k` + `mermaid 94k`. No `_redirects`, no `_headers`, no wrangler.

---

### Phase 1 — Audit & Baseline (no code)
- Record `npm run build` + `npm test` green (18/18), note `dist` size, list routes needing SPA fallback, capture `vite --version`, `node --version`.
- Verify `public/` assets (`favicon.svg`, `robots.txt`), check `index.html` base `/`, check `react-router` mode (BrowserRouter needs `_redirects`).
- **Exit:** `dist/index.html` exists, `dist/assets` hashed, route list `["/", "/lifecycle", "/#architecture", "/#stack", ...]` documented.

### Phase 2 — Vite Build Config (Cloudflare-safe)
- `vite.config.ts`: set `base: "/"`, `build.outDir: "dist"`, `build.assetsDir: "assets"`, `build.chunkSizeWarningLimit: 600`, add `build.rollupOptions.output.manualChunks` split for `bwip-js` + `mermaid` (already code-split via vite, verify).
- Ensure `index.html` has `<meta charset>` + viewport, no absolute asset paths.
- **Verify:** `npm run build` still `✓ built`, `dist/_headers` not overwritten.

### Phase 3 — SPA Fallback (`_redirects` + `404.html`)
- Create `public/_redirects`: `/*  /index.html  200` (Cloudflare Pages SPA).
- Alternative `public/_headers` handles 404, but `_redirects` is canonical for Pages.
- Add `public/404.html` copy of `index.html` fallback (optional, for direct hits).
- Test locally: `npx serve dist` → open `/lifecycle?stage=guard` → not 404, client router resolves.
- **Exit:** Deep links work after Pages deploy.

### Phase 4 — Large Chunks & Code-Split
- Verify `bwip-js` lazy `import("bwip-js")` in `Hero.tsx` stays dynamic (not bundled in `index` chunk) — prevents blocking first paint.
- Verify `mermaid` dynamic `import("mermaid")` in `mermaid-diagram.tsx` stays split.
- Add `vite` `manualChunks` if needed: `vendor`, `mermaid`, `bwip` separate.
- **Verify:** `dist/assets/bwip-js-*.js` 929k remains separate, not in `index-*.js` 813k; Lighthouse `Total Blocking Time` < 200ms.

### Phase 5 — Headers & Caching (`_headers`)
- Create `public/_headers`:
  ```
  /assets/*
    Cache-Control: public, max-age=31536000, immutable
  /*.html
    Cache-Control: no-cache
  /*
    X-Frame-Options: DENY
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```
- **Exit:** `curl -I` after deploy shows `cache-control` correct for hashed assets.

### Phase 6 — Env & Secrets (Pages Dashboard)
- No secrets in repo (per global rule). If needed, add `VITE_API_URL` etc via Cloudflare Pages → Settings → Environment Variables (Production/Preview).
- Document required envs in `README.md` + `.env.example` (no values).
- **Verify:** `import.meta.env.VITE_*` reads correctly in Preview.

### Phase 7 — Wrangler / Pages Config (optional)
- For Pages, no `wrangler.toml` required, but add `public/_routes.json` if excluding functions, or `wrangler.toml` with `pages_build_output_dir = "dist"` for `wrangler pages deploy`.
- Ensure `compatibility_date` recent if Workers needed later.
- **Exit:** `npx wrangler pages deploy dist --project-name=itinera-showcase` dry-run succeeds.

### Phase 8 — GitHub Integration & CI
- Connect GitHub repo `AhmedTyson/itinera-showcase` → Cloudflare Pages → Import → Framework: Vite → Build: `npm run build` → Output: `dist` → Node 20.
- Enable auto-deploy `main` + preview deploys for PRs.
- Add `wrangler` GitHub Action optional: `.github/workflows/pages.yml` (not required for Pages Git integration, but useful for `vitest` gate).
- **Verify:** Push `main` triggers Pages build green.

### Phase 9 — Preview QA (light/dark + responsive)
- Open `*.pages.dev` preview: test `375/768/1280/1440` dark + light (`html.light` toggle), check `#deploy` flight `M0 110 Q500 40 1000 110` not clipped, `#demo` 8 nodes equal, `#team` pill contrast, `/lifecycle` scroll scrub still works (uses `window.history.scrollRestoration` manual, no SSR).
- Test deep link `/lifecycle?stage=guard` → lands on Guard, not 404 (via `_redirects`).
- Lighthouse: Performance >90, Accessibility 100, check `bwip-js` canvas Aztec still renders.

### Phase 10 — Go Live & Monitoring
- Add custom domain (if owned) in Pages → Custom Domains → `itinera.pages.dev` → CNAME, verify HTTPS.
- Enable Web Analytics (Cloudflare Web Analytics, free, no JS heavy).
- Document rollback: Cloudflare Pages → Deployments → Rollback to `71dafbf`.
- Announce: update `README.md` with live URL + `npm run build` badge.
- **Exit:** `https://itinera-showcase.pages.dev` live, `curl -I` headers correct, 404 fallback works, light/dark QA pass on real domain.

---

### Immediate readiness checklist (execute now)
- [x] `public/_redirects` (`/*  /index.html  200`)
- [x] `public/_headers` (assets immutable + security headers)
- [x] `vite.config.ts` base `/` verified, no changes needed (already correct)
- [ ] Push to `main` → Cloudflare Pages import (Phase 8)

### Risks & mitigations
- **BrowserRouter 404 on refresh:** mitigated by `_redirects`.
- **Large `bwip-js` blocks first paint:** mitigated by dynamic `import()` already in `Hero.tsx`.
- **Mermaid SSR:** Pages is static, `import("mermaid")` dynamic already avoids SSR.
- **Light mode flash:** `html.light` class set via `theme-store` before paint (verify no FOUC).
