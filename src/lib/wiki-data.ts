export type Guide = {
  id: string
  title: string
  file: string // kebab-case filename under /wiki/
  blurb: string
}

/** Reading order mirrors legacy wiki.html doc-overview → doc-api. */
export const GUIDES: Guide[] = [
  { id: "overview", title: "System Overview", file: "system-overview.md", blurb: "Mission, scope, and the three-dos platform at a glance." },
  { id: "setup", title: "Getting Started", file: "getting-started.md", blurb: "Clone to running backend in six commands." },
  { id: "guidelines", title: "Development Guidelines", file: "development-guidelines.md", blurb: "Conventions, quality gates, and review discipline." },
  { id: "architecture", title: "Architecture", file: "architecture.md", blurb: "Layers, request lifecycle, and module boundaries." },
  { id: "stack", title: "Technology Stack", file: "technology-stack.md", blurb: "Chosen tools and the reasoning behind each." },
  { id: "backend", title: "Backend Services", file: "backend-services.md", blurb: "Domain services, policies, and the API surface." },
  { id: "frontend", title: "Frontend Application", file: "frontend-application.md", blurb: "97-page SPA structure and state strategy." },
  { id: "infra", title: "Infrastructure", file: "infrastructure.md", blurb: "Railway deployment, Docker, and environment config." },
  { id: "api", title: "API Reference", file: "api-reference.md", blurb: "Endpoint catalog with auth + throttle matrix." },
]

export function guideById(id?: string): Guide | undefined {
  return GUIDES.find((g) => g.id === id)
}
