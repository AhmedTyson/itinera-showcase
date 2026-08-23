export function generateBarcodeSvg(value: string = "EG-102"): string {
  // Verbatim from showcase/assets/js/features/boarding.js — 34 bars, 160×30 viewBox
  const bars: [number, number][] = [
    [0, 3], [5, 1], [8, 4], [14, 2], [18, 1], [21, 5], [28, 2], [32, 1], [35, 3], [40, 6],
    [48, 2], [52, 1], [55, 4], [61, 2], [65, 5], [72, 1], [75, 3], [80, 2], [84, 4], [90, 1],
    [93, 5], [100, 2], [104, 3], [109, 1], [112, 4], [118, 2], [122, 5], [129, 1], [132, 3], [137, 2],
    [141, 4], [147, 1], [150, 3], [155, 5],
  ]
  // Use value hash to vary bar widths slightly for visual uniqueness (keeps 34 bars, no extra libs)
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) % 997
  const varied = bars.map(([x, w], i) => {
    const delta = ((hash + i * 7) % 3) - 1 // -1,0,1
    return [x, Math.max(1, w + delta)] as [number, number]
  })
  return `<svg class="w-full h-7 text-current" viewBox="0 0 160 30" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Barcode for flight ${value}">${varied.map(([x, w]) => `<rect x="${x}" y="0" width="${w}" height="30" fill="currentColor"/>`).join("")}</svg>`
}
