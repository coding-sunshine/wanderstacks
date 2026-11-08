import { Vector3 } from 'three'

export interface Pin {
  id: string
  name: string
  place: string
  years: string
  lat: number
  lon: number
  from: number
  to: number
  href: string | null
  wd: string | null
  st: string | null
}

interface LibRow {
  id: string
  n: string
  p: string
  yl: string
  y: number
  lat: number
  lon: number
  lost?: number | boolean
  href?: string | null
  wd?: string
  st?: string
}

// ponytail: `lost: true` means destroyed with no date in libs.json; ghosted after AD 400 until a sourced year exists.
const UNDATED_END = 400

export function toPin(l: LibRow): Pin {
  return {
    id: l.id,
    name: l.n,
    place: l.p,
    years: l.yl,
    lat: (l.lat * Math.PI) / 180,
    lon: (l.lon * Math.PI) / 180,
    href: l.href ?? null,
    wd: l.wd ?? null,
    st: l.st ?? null,
    from: l.y,
    to: typeof l.lost === 'number' ? l.lost : l.lost ? UNDATED_END : Infinity,
  }
}

export const alive = (p: Pin, year: number) => year >= p.from && year <= p.to

export const YEAR_MIN = -700
export const YEAR_MAX = 2030
export const YEAR_START = 2025

export const formatYear = (y: number) => (y < 0 ? `${-y} BCE` : String(y))

const A1 = 1.340264
const A2 = -0.081106
const A3 = 0.000893
const A4 = 0.003796
export const FLAT_WIDTH = 4.4
const SCALE = FLAT_WIDTH / 2 / ((2 * Math.sqrt(3) * Math.PI) / (3 * A1))

export function equalEarth(lon: number, lat: number): [number, number] {
  const th = Math.asin((Math.sqrt(3) / 2) * Math.sin(lat))
  const t2 = th * th
  const t6 = t2 * t2 * t2
  const x = (2 * Math.sqrt(3) * lon * Math.cos(th)) / (3 * (9 * A4 * t6 * t2 + 7 * A3 * t6 + 3 * A2 * t2 + A1))
  const y = th * (A1 + A2 * t2 + t6 * (A3 + A4 * t2))
  return [x * SCALE, y * SCALE]
}

export const spherePoint = (lon: number, lat: number, r = 1) =>
  new Vector3(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)).multiplyScalar(r)

export function place(lon: number, lat: number, morph: number, lift = 0): Vector3 {
  const [fx, fy] = equalEarth(lon, lat)
  return spherePoint(lon, lat, 1 + lift).lerp(new Vector3(fx, fy, lift), morph)
}

// Low-precision solar position (Astronomical Almanac), good to about 0.01 degrees: subsolar point as a unit vector.
export function sunNow(date = new Date()): Vector3 {
  const r = Math.PI / 180
  const d = (date.getTime() - 946728000000) / 86400000
  const g = (357.529 + 0.98560028 * d) * r
  const L = (280.459 + 0.98564736 * d + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * r
  const e = (23.439 - 0.00000036 * d) * r
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L))
  const dec = Math.asin(Math.sin(e) * Math.sin(L))
  const gmst = ((18.697374558 + 24.06570982441908 * d) % 24) * 15 * r
  return spherePoint(ra - gmst, dec)
}

// Sun direction in a local scene frame at a place: x east, y up, z south. y is the sine of the sun's altitude.
export function sunLocal(latDeg: number, lonDeg: number, date = new Date()): Vector3 {
  const lat = (latDeg * Math.PI) / 180
  const lon = (lonDeg * Math.PI) / 180
  const s = sunNow(date)
  const up = spherePoint(lon, lat)
  const east = new Vector3(Math.cos(lon), 0, -Math.sin(lon))
  const north = new Vector3(-Math.sin(lat) * Math.sin(lon), Math.cos(lat), -Math.sin(lat) * Math.cos(lon))
  return new Vector3(s.dot(east), s.dot(up), -s.dot(north))
}

export function greatCircle(a: Vector3, b: Vector3, t: number): Vector3 {
  const w = Math.acos(Math.min(1, Math.max(-1, a.dot(b))))
  if (w < 1e-5) return a.clone()
  return a.clone().multiplyScalar(Math.sin((1 - t) * w)).addScaledVector(b, Math.sin(t * w)).divideScalar(Math.sin(w))
}

export const easeInOut = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t)
