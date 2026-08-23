export type Flight = {
  id: string | number
  flightNumber: string
  from: string
  to: string
  price: number
  departure?: string
  arrival?: string
  airline?: string
}

export const OFFLINE_SAMPLE: Flight = {
  id: 102,
  flightNumber: "EG-102",
  from: "ASF",
  to: "MRV",
  price: 117.48,
  departure: "2026-08-05 00:12:00",
  arrival: "2026-08-05 01:14:00",
  airline: "EGYPTAIR",
}

export function apiBase(): string {
  // Vite env first, then legacy TP_CONFIG, then localhost fallback
  const viteBase = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_BASE
  if (viteBase) return viteBase.replace(/\/$/, "")
  const tp = (window as unknown as { TP_CONFIG?: { apiBase?: string } }).TP_CONFIG?.apiBase
  if (tp) return tp.replace(/\/$/, "")
  return "http://127.0.0.1:8000/api"
}

export async function fetchFlights(): Promise<Flight[]> {
  try {
    const res = await fetch(`${apiBase()}/flights`)
    if (!res.ok) throw new Error(String(res.status))
    const json = await res.json()
    const arr = Array.isArray(json) ? json : json.data ?? []
    return arr.slice(0, 10).map((f: Record<string, unknown>, i: number) => ({
      id: (f.id as string | number) ?? i,
      flightNumber: (f.flight_number as string) ?? (f.flightNumber as string) ?? `EG-${100 + i}`,
      from: (f.departure_airport as string) ?? (f.from as string) ?? "ASF",
      to: (f.arrival_airport as string) ?? (f.to as string) ?? "MRV",
      price: Number(f.price ?? 117.48),
      departure: f.departure_date as string | undefined,
      arrival: f.arrival_date as string | undefined,
      airline: (f.airline as string) ?? "EGYPTAIR",
    }))
  } catch {
    return [OFFLINE_SAMPLE]
  }
}

export async function fetchFlight(id: string | number): Promise<Flight> {
  try {
    const res = await fetch(`${apiBase()}/flights/${id}`)
    if (!res.ok) throw new Error(String(res.status))
    const json = await res.json()
    const f = json.data ?? json
    return {
      id: (f.id as string | number) ?? id,
      flightNumber: (f.flight_number as string) ?? (f.flightNumber as string) ?? String(id),
      from: (f.departure_airport as string) ?? "ASF",
      to: (f.arrival_airport as string) ?? "MRV",
      price: Number(f.price ?? 117.48),
      departure: f.departure_date as string | undefined,
      arrival: f.arrival_date as string | undefined,
      airline: (f.airline as string) ?? "EGYPTAIR",
    }
  } catch {
    return OFFLINE_SAMPLE
  }
}
