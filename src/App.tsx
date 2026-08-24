import { useMemo, useState } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import Docs from "./pages/Docs"
import Wiki from "./pages/Wiki"
import { CommandPalette, type PaletteEntry } from "./components/palette/command-palette"
import { GUIDES } from "./lib/wiki-data"
import { DECK_PALETTE_ENTRIES } from "./lib/deck-config"
import { isDeckMounted, on } from "./lib/deckBus"
import { useEffect } from "react"

function GlobalPalette() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const [deckMounted, setDeckMounted] = useState(isDeckMounted())

  // live deck-mounted signal (D18) — wildcard routes render Home too, so pathname is not enough
  useEffect(() => {
    const sync = () => setDeckMounted(isDeckMounted())
    sync() // catch mounts that fired before this subscription (child effects run first)
    const off = on("register", sync)
    return () => {
      off()
    }
  }, [])

  // route-aware typed index: deck slides on Home, wiki guides where reachable
  const entries = useMemo<PaletteEntry[]>(() => {
    if (deckMounted && !location.pathname.startsWith("/wiki")) {
      return [
        ...DECK_PALETTE_ENTRIES,
        { type: "guide" as const, id: "__docs-pin", label: "Browse API Docs", sub: "opens /docs" },
      ]
    }
    if (!location.pathname.startsWith("/wiki")) return []
    return GUIDES.map((g) => ({ type: "guide" as const, id: g.id, label: g.title, sub: "Wiki guide" }))
  }, [location.pathname, deckMounted])

  return <CommandPalette open={open} onOpenChange={setOpen} entries={entries} exact={deckMounted && !location.pathname.startsWith("/wiki")} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/wiki" element={<Wiki />} />
        <Route path="/wiki/:guideId" element={<Wiki />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <GlobalPalette />
    </BrowserRouter>
  )
}
