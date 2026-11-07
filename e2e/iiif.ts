import { expect, type Locator, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { basisLabel, type Library, type Param } from '../src/types'
import { ready } from './util'

export const IIIF_HOST = /^https:\/\/(iiif\.bodleian\.ox\.ac\.uk|([a-z0-9-]+\.)?e-codices\.(ch|unifr\.ch))\//
export const BODLEIAN = 'https://iiif.bodleian.ox.ac.uk/'
export const BY_NC = /^https:\/\/creativecommons\.org\/licenses\/by-nc\/4\.0\/?/

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

// Answers every IIIF image request with a 1x1 PNG, padded to `bytes` (PNG decoders ignore trailing data).
export async function mockIiif(page: Page, bytes = 0) {
  const urls: string[] = []
  const body = bytes > PNG.length ? Buffer.concat([PNG, Buffer.alloc(bytes - PNG.length)]) : PNG
  await page.route(IIIF_HOST, (route) => {
    urls.push(route.request().url())
    return route.fulfill({ status: 200, contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body })
  })
  return { urls, bytes: () => urls.length * body.length }
}

export async function blockIiif(page: Page) {
  await page.route(IIIF_HOST, (route) => route.abort('connectionrefused'))
}

export const json = async <T>(page: Page, path: string) => {
  const r = await page.request.get(path)
  expect(r.ok(), path).toBe(true)
  expect(r.headers()['content-type'] ?? '', `${path} is JSON, not the app shell`).toMatch(/json/)
  return (await r.json()) as T
}

export const dataFile = <T>(path: string) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')) as T

export type Lib = Library & { kit: 'hall' | 'rotunda' | 'site'; reconstruction?: boolean; tour?: { stops: { fact: number; at: number[]; look: number[] }[] } }
export type Params = Record<string, Param<unknown>>
export const params = (lib: Lib) => lib.hall as unknown as Params
export { basisLabel }

export const loadLib = (page: Page, id: string) => json<Lib>(page, `/lib/${id}.json`)

export const roomRoot = (page: Page) => page.locator('section.room[data-view="room"]')

export async function openRoom(page: Page, id: string) {
  await page.goto(`/room/${id}`)
  await ready(page, 'room')
  return roomRoot(page)
}

export const camera = async (root: Locator) => JSON.parse((await root.getAttribute('data-camera')) ?? 'null') as number[] | null

export const near = (a: number[] | null, b: number[], tol: number) => !!a && a.length === 3 && a.every((v, i) => Math.abs(v - b[i]!) <= tol)

// Waits until two screenshots 400 ms apart are byte-identical.
export async function settle(target: Page | Locator, tries = 40) {
  let prev = await target.screenshot()
  for (let i = 0; i < tries; i++) {
    await new Promise((r) => setTimeout(r, 400))
    const next = await target.screenshot()
    if (next.equals(prev)) return next
    prev = next
  }
  throw new Error('canvas never went idle')
}

// Share of pixels whose channels differ by more than `thr` between two PNG screenshots.
export async function diffShare(page: Page, a: Buffer, b: Buffer, thr = 12) {
  return page.evaluate(
    async ([x, y, t]) => {
      const load = async (s: string) => {
        const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${s}`)).blob())
        const c = new OffscreenCanvas(bmp.width, bmp.height)
        const g = c.getContext('2d')!
        g.drawImage(bmp, 0, 0)
        return g.getImageData(0, 0, bmp.width, bmp.height)
      }
      const [p, q] = [await load(x!), await load(y!)]
      if (p.width !== q.width || p.height !== q.height) return 1
      let n = 0
      for (let i = 0; i < p.data.length; i += 4)
        if (Math.abs(p.data[i]! - q.data[i]!) + Math.abs(p.data[i + 1]! - q.data[i + 1]!) + Math.abs(p.data[i + 2]! - q.data[i + 2]!) > Number(t)) n++
      return n / (p.data.length / 4)
    },
    [a.toString('base64'), b.toString('base64'), String(thr)] as const,
  )
}

// Presses Tab until the element matching `selector` has focus.
export async function tabTo(page: Page, selector: string, max = 60) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab')
    if (await page.evaluate((s) => !!document.activeElement?.matches(s), selector)) return
  }
  throw new Error(`Tab never reached ${selector}`)
}

// Lines of the accessibility tree that are a button or link with no name.
export async function unnamed(page: Page) {
  const tree = await page.locator('body').ariaSnapshot()
  const bad: string[] = []
  for (const line of tree.split('\n')) {
    const m = /^\s*- (button|link)(?: "((?:[^"\\]|\\.)*)")?/.exec(line)
    if (m && !(m[2] ?? '').trim()) bad.push(line.trim())
  }
  return bad
}

// Predict, reveal, stamp on a living page; the spec comes from data/living/<id>.json.
export async function playLiving(page: Page, view: string, spec: { id: string; answer: number; statement: string; cite: string }) {
  const root = page.locator(`[data-view="${view}"][data-ready="true"]`)
  await expect(root).toBeVisible()
  await expect(root.locator('.statement')).toHaveText(spec.statement)
  await expect(root.locator('.cite')).toHaveText(spec.cite)
  const stamp = root.locator('.stamp')
  await expect(stamp).toBeHidden()
  expect(await root.locator('svg [data-step]').count()).toBeGreaterThan(0)
  await root.locator(`[data-choice="${spec.answer}"]`).click()
  await expect(stamp).toBeVisible({ timeout: 20_000 })
  await expect(root.locator('[data-step]:not(.drawn)')).toHaveCount(0)
  expect(JSON.parse(await page.evaluate(() => localStorage['wl.stamps']))).toContain(spec.id)
  await page.reload()
  await expect(page.locator(`[data-view="${view}"][data-ready="true"] .stamp`)).toBeVisible()
}
