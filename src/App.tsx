import { useMemo, useState } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import Docs from "./pages/Docs"
import Wiki from "./pages/Wiki"
import LifecyclePage from "./pages/LifecyclePage"
import { CommandPalette, type PaletteEntry } from "./components/palette/command-palette"
import { GUIDES } from "./lib/wiki-data"

function GlobalPalette() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // route-aware typed index: wiki guides only where they're reachable
  const entries = useMemo<PaletteEntry[]>(() => {
    if (!location.pathname.startsWith("/wiki")) return []
    return GUIDES.map((g) => ({ type: "guide" as const, id: g.id, label: g.title, sub: "Wiki guide" }))
  }, [location.pathname])

  return <CommandPalette open={open} onOpenChange={setOpen} entries={entries} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/lifecycle" element={<LifecyclePage />} />
        <Route path="/wiki" element={<Wiki />} />
        <Route path="/wiki/:guideId" element={<Wiki />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <GlobalPalette />
    </BrowserRouter>
  )
}
