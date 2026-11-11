// Build-time data for the "where the books are now" section: holders per lost library and a flat map projection.
import { readFileSync } from 'node:fs'
import { libById } from './data'

export interface Holder {
  lib: string; holder: string; place: string; lat: number; lon: number; what: string
  count?: number; tier: string; source: string; manifest?: string
}
const rows: Holder[] = JSON.parse(readFileSync('data/dispersal.json', 'utf8'))
export const holdersOf = (id: string) => rows.filter((r) => r.lib === id)
export const hasDispersal = (id: string) => rows.some((r) => r.lib === id)

// Equal Earth, the projection scripts/mapgen/gen.mjs used for `land`; scale and offset fitted to its map.json pins; data/land.json holds its `land` and `view` (error under 0.1 unit).
const [A1, A2, A3, A4, K, TX, TY] = [1.340264, -0.081106, 0.000893, 0.003796, 184.7635, 499.9967, 243.391]
export function project(lat: number, lon: number): [number, number] {
  const p = (lat * Math.PI) / 180, l = (lon * Math.PI) / 180, t = Math.asin((Math.sqrt(3) / 2) * Math.sin(p)), t2 = t * t, t6 = t2 ** 3
  const x = (2 * Math.sqrt(3) * l * Math.cos(t)) / (3 * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)))
  const y = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2))
  return [+(TX + K * x).toFixed(1), +(TY - K * y).toFixed(1)]
}

const map = JSON.parse(readFileSync('data/land.json', 'utf8')) as { land: string; view: number[] }
export const land = map.land

/** Map geometry for one library: pins, arcs and a view box cropped around them. */
export function mapOf(id: string) {
  const site = libById.get(id)!, home = project(site.lat, site.lon)
  const hs = holdersOf(id).map((h) => {
    const to = project(h.lat, h.lon), mx = (home[0] + to[0]) / 2, my = (home[1] + to[1]) / 2
    const c = [mx, my - 0.25 * Math.hypot(to[0] - home[0], to[1] - home[1])]
    return { ...h, to, d: `M${home[0]},${home[1]}Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${to[0]},${to[1]}` }
  })
  const xs = [home[0], ...hs.map((h) => h.to[0])], ys = [home[1], ...hs.map((h) => h.to[1])]
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const [vx, vy, vw, vh] = map.view
  const w = Math.min(vw, Math.max((x1 - x0) * 1.4, (y1 - y0) * 1.8 * 2.2, 220)), h = w / 2.2
  const cx = Math.min(vx + vw - w / 2, Math.max(vx + w / 2, (x0 + x1) / 2)), cy = Math.min(vy + vh - h / 2, Math.max(vy + h / 2, (y0 + y1) / 2))
  return { home, hs, box: [cx - w / 2, cy - h / 2, w, h].map((v) => +v.toFixed(1)).join(' '), r: +(w * 0.0065).toFixed(2) }
}
