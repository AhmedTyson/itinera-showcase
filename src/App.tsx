import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Docs from "./pages/Docs"
import Wiki from "./pages/Wiki"

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
    </BrowserRouter>
  )
}
