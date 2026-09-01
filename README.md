<div align="center">
  <br />
  <img src="public/favicon.png" width="160" alt="Itinera logo" />
  <br />

  # Itinera — Showcase · Luxury Travel Platform Engineering
  **Conference Case Study — Team 2 · Dual Showcase Site (Static + React/Vite)**

  <br />

  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
  [![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
  [![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
  [![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://itinera-showcase.vercel.app)
  ![Status](https://img.shields.io/badge/status-live-10b981?style=flat-square)
  ![Team](https://img.shields.io/badge/team-Team_2-8A2BE2?style=flat-square)

</div>

<br />

---

<br />

Dual showcase for **Itinera** — the Conference Case Study 1 (Team 2) luxury travel orchestration platform. This repo is the **public portfolio site** (React/Vite/TS, GSAP, Radix) that demos the underlying Laravel monorepo without exposing it. Monorepo lives at **[Team2-Conference-Project](https://github.com/AhmedTyson/Team2-Conference-Project)**.

- **Live Showcase:** `https://itinera-showcase.vercel.app/` (Vercel, SPA)
- **Monorepo:** `https://github.com/AhmedTyson/Team2-Conference-Project` · **Wiki:** `Team2-Conference-Project/wiki/Home.md`
- **Apidog Audit:** `docs/apidog-portal-audit.md` — **213/213 endpoints documented (28 gold +185 standard), 100% coverage**

---

## <img src="https://api.iconify.design/lucide:folder-tree.svg?color=%238A2BE2" width="24" align="top" /> Structure

```text
itinera-showcase/
├── src/
│   ├── pages/{Home.tsx, LifecyclePage.tsx}  # Home (8 sections) + Lifecycle (9 stages)
│   ├── components/{layout,sections,lifecycle,ui,palette}
│   └── lib/{kpi, home-content, lifecycle-content}
├── docs/
│   ├── apidog-portal-audit.md   # 213/213 endpoints, 28 gold, 185 standard
│   └── audits/plans/            # phase audits
├── public/                      # favicon, assets
├── pipeline-track.svg/.html
└── vercel.json                  # SPA rewrite  /(.*) -> /index.html
```

---

## <img src="https://api.iconify.design/lucide:sparkles.svg?color=%238A2BE2" width="24" align="top" /> Key Features

| Area | Stack | Highlights |
|------|-------|------------|
| **Home** — 8-section luxury showcase | React 19, GSAP 3.15, Framer Motion 13, Lenis, Radix Dialog | `Hero`, `KpiBand`, `StackGrid`, `FeMotifs`, `OpsConsole`, `PipelineTerminal` (curl `POST /api/login` → `200 OK` with `super_admin` token), `DemoTimeline`, `SecurityMotifs` — GSAP `ScrollTrigger` timelines |
| **Lifecycle** — 9-stage API trace | React Router, Lucide | `request → router → guard → throttle → validation → controller → service → persistence → webhook` — `Client fetch() Bearer /api/checkout` → `200 OK` pipeline visual |
| **Docs** — Apidog portal | Apidog | 213/213 endpoints documented, 28 gold (auth, booking, PayMob, AI), 185 standard, `bearerAuth`, `throttle:login/weather`, synthetic credentials, Cloud Mock sandbox |

---

## <img src="https://api.iconify.design/lucide:rocket.svg?color=%238A2BE2" width="24" align="top" /> Quick Start

```bash
# 1. Install
npm install

# 2. Dev (http://127.0.0.1:5173)
npm run dev

# 3. Build
npm run build

# 4. Preview
npm run preview

# 5. Lint & Test
npm run lint
npm run test
```

---

## <img src="https://api.iconify.design/lucide:book-open.svg?color=%238A2BE2" width="24" align="top" /> Documentation

All showcase docs live in [`docs/`](docs/apidog-portal-audit.md):

| Section | Guides |
|---|---|
| **Audit** | [Apidog Portal Audit](docs/apidog-portal-audit.md) — 213/213 endpoints, info arch, security, mocks |
| **Monorepo** | [Team2-Conference-Project](https://github.com/AhmedTyson/Team2-Conference-Project) · [Wiki Home](https://github.com/AhmedTyson/Team2-Conference-Project/blob/main/wiki/Home.md) · [Itinari Plan](Itinari%20—%20Production-Grade%20Apidog%20Developer%20Portal%20&%20Mock%20API%20Implementation%20Plan.md) |

---

## <img src="https://api.iconify.design/lucide:building-2.svg?color=%238A2BE2" width="24" align="top" /> About Conference

Conference Case Study 1 — Team 2 dual deliverable: monorepo (Laravel 12, 213 `api/*` routes, 17 wiki docs) + showcase (React 19, 213/213 Apidog docs). Deployed as Vercel SPA + Railway monorepo. Timeline **Aug 01 – Aug 21, 2026**.

---

## <img src="https://api.iconify.design/lucide:users.svg?color=%238A2BE2" width="24" align="top" /> Team

**Ahmed Elsayed** — Project Lead @ Conference Team 2 — [github.com/AhmedTyson](https://github.com/AhmedTyson)

Conference Team 2 — Showcase + Monorepo

---

## <img src="https://api.iconify.design/lucide:scale.svg?color=%238A2BE2" width="24" align="top" /> License

MIT — Internal Case Study Deliverable, Team 2.
