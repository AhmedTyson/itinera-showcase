import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import LifecyclePage from "./pages/LifecyclePage"
import { CommandPalette } from "./components/palette/command-palette"

/* SPA route changes reuse ONE document: the window keeps the previous page's
   scroll offset, so navigating from a scrolled section drops the next page
   mid-document. Reset to top on every path change (deep links like
   /lifecycle?stage=x re-scroll to their target after mount). */
function ScrollToTopOnRoute() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])
  return null
}

function GlobalPalette() {
  const [open, setOpen] = useState(false)
  return <CommandPalette open={open} onOpenChange={setOpen} entries={[]} />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTopOnRoute />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lifecycle" element={<LifecyclePage />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <GlobalPalette />
    </BrowserRouter>
  )
}
