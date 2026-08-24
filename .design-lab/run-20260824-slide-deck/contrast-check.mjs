function lum(hex) {
  const c = hex.match(/\w\w/g).map(x => parseInt(x, 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
function ratio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}
function blend(fg, alpha, bg) {
  const f = fg.match(/\w\w/g).map(x => parseInt(x, 16))
  const b = bg.match(/\w\w/g).map(x => parseInt(x, 16))
  return f.map((v, i) => Math.round(v * alpha + b[i] * (1 - alpha))).map(v => v.toString(16).padStart(2, "0")).join("")
}
const light = "F4F6FB", dark = "05070D"
const rows = [
  ["counter light #0b1220/" + light, ratio("0B1220", light)],
  ["dot idle light #475569/" + light, ratio("475569", light)],
  ["dot active light #b45309/" + light, ratio("B45309", light)],
  ["proof strip light #047857/" + blend("059669", 0.08, light), ratio("047857", blend("059669", 0.08, light))],
  ["counter dark #fbbf24/" + dark, ratio("FBBF24", dark)],
  ["dot idle dark #64748b/" + dark, ratio("64748B", dark)],
]
for (const [name, r] of rows) console.log(`${name} → ${r.toFixed(2)}:1 ${r >= 4.5 ? "AA✓" : r >= 3 ? "non-text✓" : "FAIL"}`)
