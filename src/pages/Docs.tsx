import { Topbar } from "../components/layout/Topbar"
import { DocsShell } from "../components/docs/docs-shell"

export default function Docs() {
  return (
    <div className="min-h-screen bg-bg-0">
      <Topbar variant="docs" />
      <DocsShell />
    </div>
  )
}
