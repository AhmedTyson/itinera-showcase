# EpicHub Portal Audit — epichub.apidog.io

Date: 2026-08-24 · Comparand: `itinera.apidog.io` + itinera-showcase-react

## 1. What EpicHub is

An Apidog-hosted developer portal for an **Angular + ASP.NET Core (.NET 9) event marketplace** (EpicHub — events, vendors, orders, SignalR chat, AI planning). Key insight: they treat the portal **not as API docs but as the project's front door** — a full narrative showcase living at the same URL as the API reference.

## 2. Feature inventory (their landing)

| Block | Content |
|---|---|
| 01 — Overview | 4 feature cards: Angular Architecture, Responsive UI/UX, API Integration, Real-Time — each w/ tech chips |
| 02 — Technology | 12-row stack table: ASP.NET 9, SQL Server+EF, Identity+JWT, Redis+HybridCache, SignalR+SSE, Lucene.NET, **Paymob**, AWS S3, Hangfire, Groq/Gemini/Llama, OpenTelemetry+Aspire, Polly+Docker |
| 02B — Frontend Engineering | 6 numbered cards (architecture, responsive, API integration, real-time, performance, design system) + **client ↔ security ↔ backend flow diagram** |
| Frontend Strategy | 4 numbered blocks: Modular Structure, State & Data Flow (RxJS), User Experience, Frontend Security |
| 03 — API Gateway | YARP reverse-proxy section w/ Mermaid flow (Client → YARP → Web.API) + **"JWT Decision — Option A" callout** |
| 04–08 | (Database/ERD, Real-Time, AI, Payments, Roadmap incl. "Long Term: Kubernetes, distributed eventing") |
| 09 — Product Showcase | **Suggested Demo Flow: 11 numbered steps** (Register → Browse → Order → Pay with Paymob → Chat → AI → Analytics) |
| — | **Final Verdict banner**: "Production-Ready · Enterprise Architecture" |
| 10 — Team Members | Project team list |

## 3. Diff — them vs us

| Capability | EpicHub | Itinari | Verdict |
|---|---|---|---|
| API reference completeness | unknown depth | **106/106 ops, schemas, examples** | **We win** |
| Live mock with realistic multi-item data + pagination headers | not evidenced | Cloud Mock verified (flights, destinations) | **We win** |
| Themed portal (method badges, dark code blocks) | default-ish | full custom CSS matched to showcase | **We win** |
| Tech-stack table on landing | ✔ 12 rows | ✗ (env table only) | **Adopt** |
| Frontend engineering documented on portal | ✔ 6 cards + diagram | ✗ (only in React showcase) | **Adopt** |
| Numbered narrative rhythm (01→10) | ✔ | partial (welcome MD unstructured) | **Adopt** |
| Demo flow (numbered steps) | ✔ 11 steps | ✗ on portal (data exists in showcase `DEMO_STEPS`) | **Adopt** |
| Decision callouts (e.g. "JWT — Option A") | ✔ | ✗ | **Adopt** (1–2: JWT placement, queue choice) |
| Final verdict banner | ✔ | ✗ | Adopt (small) |
| Team members on portal | ✔ | ✗ (data in showcase `TEAM`) | Optional |
| Gateway section (YARP) | ✔ | N/A — Laravel monolith, no gateway | **Reject** |
| SignalR/real-time | ✔ | N/A — polling + queued jobs | Reject |

## 4. Diagnosis

**Their play:** portal = graded narrative. Stack → frontend → gateway → demo → verdict → team. A reviewer lands on `epichub.apidog.io` and understands the *whole system* in one scroll, then drops into the API reference.

**Our gap:** `itinera.apidog.io` is reference-first. Excellent depth (106 ops, live mock) but the landing doesn't tell the system story — stack truth, frontend architecture, and demo narrative live only in the React showcase, which a grader may never open.

**Core adoption:** restructure our welcome page (`guide-welcome.md` → `info.description`) into the numbered narrative using **only verified facts** (composer.json, routes/api.php, showcase data): 01 Overview → 02 Technology (from composer.json) → 03 Frontend (React 19/Vite/Tailwind4/shadcn/GSAP + legacy 355-file client) → 04 Auth/JWT callout → 05 Data & Reports (DomPDF+OpenSpout) → 06 Demo Flow (from `DEMO_STEPS`) → Environments/Mock → Verdict line.

## 5. Proposed adopt list (needs user approval)

1. **A** — Numbered narrative restructure of portal welcome (incl. stack table from composer.json)
2. **B** — Frontend engineering section on portal (React stack + legacy client, 4–6 chips)
3. **C** — Demo flow section (11→ our 8 steps, numbered)
4. **D** — One decision callout (JWT guard placement or queue driver choice)
5. **E** — Verdict banner line ("Production-ready · Laravel 13 · 106 reconciled ops")
6. **F** — Team members block (optional)
7. **G** — Reject: gateway/real-time sections (stack mismatch)

Showcase-side adoption: none required — showcase already covers what their portal covers; the work is portal-side.
