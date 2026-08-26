import { useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Docs from "./pages/Docs"
import LifecyclePage from "./pages/LifecyclePage"
import { CommandPalette } from "./components/palette/command-palette"

function GlobalPalette() {
  const [open, setOpen] = useState(false)
  return <CommandPalette open={open} onOpenChange={setOpen} entries={[]} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/lifecycle" element={<LifecyclePage />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <GlobalPalette />
    </BrowserRouter>
  )
}
