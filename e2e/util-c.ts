import { expect, type Locator, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { sunLocal } from '../src/geo'
import { describe, localTime } from '../src/room/weather'
import { ready } from './util'

export const DAY = '2026-03-20'
export const BUILDINGS = ['longroom', 'admont', 'strahov', 'loc'] as const
export const ALL = [...BUILDINGS, 'celsus'] as const
export type Room = (typeof ALL)[number]
export const ZONES: Record<Room, string> = {
  longroom: 'Europe/Dublin',
  admont: 'Europe/Vienna',
  strahov: 'Europe/Prague',
  loc: 'America/New_York',
  celsus: 'Europe/Istanbul',
}
export const POLY = /(^|\.)polyhaven\.(org|com)$/

const read = <T>(p: string) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')) as T

export type LibRow = { id: string; lat: number; lon: number }
export const geo = (id: string) => read<LibRow[]>('data/libs.json').find((l) => l.id === id)!
export type Shelf = { id: string; title: string; tier: string }
export const shelves = (id: string) => read<{ shelves: Shelf[] }>(`public/lib/${id}.json`).shelves
export type Exterior = { w: number; d: number; h: number; source: string; name?: string; credit?: string; estimated: string[] }
export const exterior = () => read<Record<string, Exterior>>('data/exterior.json')
export type Texture = { slot: string; asset: string; url: string; license: string }
export const textures = () => read<Texture[]>('data/textures.json')
export type PinRow = { id: string; n: string; y: number }
export const pinOf = (id: string) => read<PinRow[]>('public/lib/pins.json').find((p) => p.id === id)!

export const root = (page: Page) => page.locator('[data-view="room"]')

// ---- sun ----
export const sunAt = (lat: number, lon: number, d: Date) => {
  const v = sunLocal(lat, lon, d)
  return { alt: (Math.asin(v.y) * 180) / Math.PI, az: ((Math.atan2(v.x, -v.z) * 180) / Math.PI + 360) % 360 }
}
export const angDiff = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180)

export function solarNoon(lat: number, lon: number, day = DAY) {
  const t0 = Date.parse(`${day}T00:00:00Z`)
  let best = -99, at = t0
  for (let m = 0; m < 1440; m++) {
    const a = sunAt(lat, lon, new Date(t0 + m * 60_000)).alt
    if (a > best) (best = a), (at = t0 + m * 60_000)
  }
  return new Date(at)
}
export const solarMidnight = (noon: Date) => new Date(noon.getTime() + 12 * 3_600_000)
export function twilightMoment(lat: number, lon: number, noon: Date) {
  for (let m = 1; m < 1440; m++) {
    const d = new Date(noon.getTime() + m * 60_000)
    if (sunAt(lat, lon, d).alt <= -3) return d
  }
  throw new Error('no sunset')
}

// ---- weather ----
export type Wx = { code?: number; temp?: number; cloud?: number; precip?: number; snow?: number; visibility?: number; wind?: number }
export type WxMode = Wx | 'fail500' | 'abort' | 'hang' | 'malformed'
export const CLEAR: Wx = { code: 0, temp: 12, cloud: 0 }
export const RAIN: Wx = { code: 63, temp: 8, cloud: 90, precip: 2 }
const CORS = { 'access-control-allow-origin': '*' }

export async function mockWeather(page: Page, mode: WxMode = CLEAR) {
  const hits: URL[] = []
  const state = { mode }
  await page.route('https://api.open-meteo.com/**', async (route) => {
    const u = new URL(route.request().url())
    hits.push(u)
    const m = state.mode
    if (m === 'fail500') return route.fulfill({ status: 500, headers: CORS, body: 'boom' })
    if (m === 'abort') return route.abort('failed')
    if (m === 'hang') return
    if (m === 'malformed') return route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: '{"current": {' })
    const lat = Number(u.searchParams.get('latitude')), lon = Number(u.searchParams.get('longitude'))
    const near = ALL.map((id) => ({ id, d: Math.hypot(geo(id).lat - lat, geo(id).lon - lon) })).sort((a, b) => a.d - b.d)[0]!.id
    const w = { ...CLEAR, ...m }
    return route.fulfill({
      status: 200,
      headers: CORS,
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: ZONES[near],
        current: {
          weather_code: w.code,
          temperature_2m: w.temp,
          cloud_cover: w.cloud,
          precipitation: w.precip ?? 0,
          snowfall: w.snow ?? 0,
          visibility: w.visibility ?? 50_000,
          wind_speed_10m: w.wind ?? 3,
        },
      }),
    })
  })
  return { hits, set: (next: WxMode) => void (state.mode = next) }
}

export const waitWeather = (page: Page, timeout = 6000) => root(page).and(page.locator('[data-weather]')).waitFor({ state: 'attached', timeout })

export const hhmm = (tz: string, d: Date) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(d)
export const lineFor = (id: Room, d: Date, code: number, temp: number) => `${hhmm(ZONES[id], d)} · ${describe(code)} · ${Math.round(temp)}°C`
export const solarLine = (id: Room, d: Date) => localTime(null, geo(id).lon, d)

// ---- navigation ----
export async function gotoRoom(page: Page, id: string) {
  await page.goto(`/room/${id}`)
  await ready(page, 'room')
}

export async function gotoOutside(page: Page, id: string) {
  await page.goto(`/room/${id}`)
  await page.evaluate(() => history.replaceState({ arrive: 'outside' }, ''))
  await page.reload()
  await ready(page, 'room')
}

// Waits out the exposure ramp so taps and keys act on a running room.
export const settleIn = async (page: Page) => {
  await page.waitForTimeout(2600)
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.())
}

export async function fromGlobe(page: Page, id: string, beforeClick?: () => void | Promise<void>) {
  const pin = pinOf(id)
  await page.goto('/atlas')
  const home = page.locator('[data-view="home"]')
  await expect(home).toHaveAttribute('data-ready', 'true', { timeout: 30_000 })
  await page.locator('#xrange').fill(String(pin.y))
  await home.locator('#xlist').getByText(pin.n, { exact: true }).click()
  await beforeClick?.()
  await home.locator(`#xcard a[href="/room/${id}"]`).click({ timeout: 5000 })
  await page.waitForURL(`**/room/${id}`, { timeout: 15_000 })
  await ready(page, 'room')
}

export async function openPanel(page: Page) {
  const toggle = page.locator('.room-toggle')
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click()
  await expect(page.locator('#room-panel')).toBeVisible()
}

// ---- state reads ----
export const attr = (page: Page, name: string) => root(page).getAttribute(`data-${name}`)
export const jattr = async <T = number[]>(page: Page, name: string) => JSON.parse((await attr(page, name)) ?? 'null') as T | null

export const hd = (a: number[], b: number[], ia = 0, ib = 0) => Math.hypot(a[ia]! - b[ib]!, a[ia + (a.length === 3 ? 2 : 1)]! - b[ib + (b.length === 3 ? 2 : 1)]!)
export const xz = (c: number[]) => [c[0]!, c[2]!]
export const inside = (p: number[], r: number[], shrink = 0) => p[0]! > r[0]! + shrink && p[0]! < r[2]! - shrink && p[2]! > r[1]! + shrink && p[2]! < r[3]! - shrink

// ---- frame sampling ----
export type Sample = { t: number; cam: number[] | null; place: string | null; goal: number[] | null; yaw: number | null; focus: string | null }

export const startSampling = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __run: boolean; __s: unknown[] }
    w.__run = true
    w.__s = []
    const tick = () => {
      if (!w.__run) return
      const r = document.querySelector('[data-view="room"]')
      const j = (n: string) => {
        const v = r?.getAttribute(`data-${n}`)
        try { return v == null ? null : JSON.parse(v) } catch { return null }
      }
      w.__s.push({ t: performance.now(), cam: j('camera'), place: r?.getAttribute('data-place') ?? null, goal: j('goal'), yaw: j('yaw'), focus: r?.getAttribute('data-book-focus') ?? null })
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })

export const stopSampling = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __run: boolean; __s: unknown[] }
    w.__run = false
    return w.__s
  }) as Promise<Sample[]>

export async function holdKey(page: Page, key: string, ms: number) {
  await page.keyboard.down(key)
  try {
    await page.waitForTimeout(ms)
  } finally {
    await page.keyboard.up(key)
  }
}

// Holds `key` until `done()` is truthy or the deadline passes. Always releases the key.
export async function holdUntil(page: Page, key: string, done: () => Promise<boolean>, deadlineMs: number) {
  const end = Date.now() + deadlineMs
  await page.keyboard.down(key)
  try {
    while (Date.now() < end) {
      if (await done()) return true
      await page.waitForTimeout(50)
    }
    return false
  } finally {
    await page.keyboard.up(key)
  }
}

// Fires one quick mouse tap near a fraction of the room canvas, at the first scanned point where the canvas (not UI) is on top.
export async function tapCanvas(page: Page, fx: number, fy: number) {
  const b = (await page.locator('[data-view="room"] canvas').first().boundingBox())!
  const dxs = [0, -0.05, 0.05, -0.1, 0.1, -0.15, 0.15, -0.2, 0.2]
  const dys = [0, -0.03, -0.06, -0.09, 0.03, 0.06]
  const pts = dys.flatMap((dy) => dxs.map((dx) => ({ x: b.x + b.width * (fx + dx), y: b.y + b.height * (fy + dy) })))
  const hit = await page.evaluate((ps) => {
    const cv = document.querySelector('[data-view="room"] canvas')
    return ps.find((p) => p.x >= 0 && p.y >= 0 && p.x < innerWidth && p.y < innerHeight && document.elementFromPoint(p.x, p.y) === cv) ?? null
  }, pts)
  if (!hit) throw new Error(`tapCanvas: no point near (${fx}, ${fy}) of the room canvas is free of UI`)
  await page.mouse.click(hit.x, hit.y)
}

export const centre = async (l: Locator) => {
  const b = (await l.boundingBox())!
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}

// ---- luminance ----
const HIDE = `[data-view="room"] :not(canvas) { visibility: hidden !important } [data-view="room"] canvas { visibility: visible !important }`

export async function luminance(page: Page) {
  const png = await page.locator('[data-view="room"] canvas').first().screenshot({ style: HIDE })
  return page.evaluate(async (b64) => {
    const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob())
    const c = new OffscreenCanvas(bmp.width, bmp.height)
    const g = c.getContext('2d')!
    g.drawImage(bmp, 0, 0)
    const d = g.getImageData(0, 0, bmp.width, bmp.height).data
    let sum = 0
    for (let i = 0; i < d.length; i += 4) sum += (0.2126 * d[i]! + 0.7152 * d[i + 1]! + 0.0722 * d[i + 2]!) / 255
    return sum / (d.length / 4)
  }, png.toString('base64'))
}
