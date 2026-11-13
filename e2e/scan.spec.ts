import { expect, test, type Page } from '@playwright/test'
import { BODLEIAN, BY_NC, json, mockIiif, tabTo } from './iiif'
import { origin } from '../playwright.config'
import { ready, watchErrors } from './util'

type Pages = { manifest: string; licence: string; credit: string; pages: { s: string; w: number; h: number; l: string }[] }
const data = (page: Page) => json<Pages>(page, '/scan/firstfolio/pages.json')
const view = (page: Page) => page.locator('[data-view="scan"][data-ready="true"]')
const index = async (page: Page) => Number(await view(page).getAttribute('data-page'))

async function open(page: Page) {
  await page.goto('/scan/firstfolio')
  await ready(page, 'scan')
}

test('scan images: spread shows two pages with 600 px IIIF urls and alt, and prefetches 4 either side', async ({ page }) => {
  const errors = watchErrors(page)
  const hits = await mockIiif(page)
  const { pages } = await data(page)
  expect(pages.length).toBeGreaterThanOrEqual(900)
  await page.setViewportSize({ width: 1280, height: 800 })
  await open(page)
  expect(await index(page)).toBe(0)
  for (const i of [0, 1]) {
    const img = view(page).locator(`img[data-page="${i}"]`)
    await expect(img, `page ${i}`).toHaveCount(1)
    await expect(img).toHaveAttribute('src', `${pages[i]!.s}/full/600,/0/default.jpg`)
    await expect(img).toHaveAttribute('alt', pages[i]!.l)
  }
  await expect(view(page).locator('img[data-page="2"]:visible')).toHaveCount(0)

  await page.keyboard.press('ArrowRight')
  await expect.poll(() => index(page)).toBe(2)
  const want = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `${pages[i]!.s}/full/600,/0/default.jpg`)
  await expect.poll(() => want.filter((u) => !hits.urls.includes(u)), { message: 'prefetched pages 0..7', timeout: 10_000 }).toEqual([])
  expect(errors).toEqual([])
})

test('scan images: below 700 px wide one page is shown', async ({ page }) => {
  const errors = watchErrors(page)
  await mockIiif(page)
  const { pages } = await data(page)
  await page.setViewportSize({ width: 600, height: 900 })
  await open(page)
  await expect(view(page).locator('img[data-page="0"]')).toHaveAttribute('src', `${pages[0]!.s}/full/600,/0/default.jpg`)
  await expect(view(page).locator('img[data-page="1"]:visible')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('scan images: unknown book says Not on any shelf', async ({ page }) => {
  const errors = watchErrors(page)
  await mockIiif(page)
  await page.goto('/scan/no-such-book')
  await expect(page.getByText('Not on any shelf')).toBeVisible()
  const unexpected = errors.filter((error) => !error.startsWith('404:') && !error.includes('404 (Not Found)'))
  expect(unexpected).toEqual([])
})

test('scan keyboard: arrows move by 2 on desktop, Home and End jump to the ends', async ({ page }) => {
  const errors = watchErrors(page)
  await mockIiif(page)
  const { pages } = await data(page)
  await page.setViewportSize({ width: 1280, height: 800 })
  await open(page)
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => index(page)).toBe(2)
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => index(page)).toBe(4)
  await page.keyboard.press('ArrowLeft')
  await expect.poll(() => index(page)).toBe(2)
  await page.keyboard.press('End')
  await expect.poll(() => index(page)).toBeGreaterThanOrEqual(pages.length - 2)
  await expect(view(page).locator(`img[data-page="${pages.length - 1}"]`)).toHaveCount(1)
  await page.keyboard.press('Home')
  await expect.poll(() => index(page)).toBe(0)
  expect(errors).toEqual([])
})

test('scan keyboard: arrows move by 1 below 700 px wide', async ({ page }) => {
  const errors = watchErrors(page)
  await mockIiif(page)
  await page.setViewportSize({ width: 600, height: 900 })
  await open(page)
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => index(page)).toBe(1)
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => index(page)).toBe(2)
  await page.keyboard.press('ArrowLeft')
  await expect.poll(() => index(page)).toBe(1)
  expect(errors).toEqual([])
})

test('scan keyboard: + opens a modal zoom and Escape returns focus to the opener', async ({ page }) => {
  const errors = watchErrors(page)
  await mockIiif(page)
  await page.setViewportSize({ width: 1280, height: 800 })
  await open(page)
  await tabTo(page, '[data-view="scan"] *')
  const opener = await page.evaluateHandle(() => document.activeElement)
  await page.keyboard.press('+')
  const zoom = page.locator('dialog[data-zoom]')
  await expect(zoom).toBeVisible()
  expect(await zoom.evaluate((d: HTMLDialogElement) => d.open && d.matches(':modal'))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(zoom).toBeHidden()
  expect(await page.evaluate((o) => document.activeElement === o, opener), 'focus back on the opener').toBe(true)
  expect(errors).toEqual([])
})

test('scan zoom: deep-zoom tiles are IIIF regions of one page on the Bodleian host', async ({ page }) => {
  const errors = watchErrors(page)
  const hits = await mockIiif(page)
  const { pages } = await data(page)
  await page.setViewportSize({ width: 1280, height: 800 })
  await open(page)
  const at = await index(page)
  await page.keyboard.press('+')
  await expect(page.locator('dialog[data-zoom]')).toBeVisible()
  // 600 px page images are the spread and its prefetch; everything else is a deep-zoom tile.
  const tiles = () => hits.urls.filter((u) => !u.includes('/full/600,/'))
  await expect.poll(() => tiles().length, { timeout: 10_000 }).toBeGreaterThan(0)

  let pageIdx = -1
  for (const src of tiles()) {
    expect(src.startsWith(BODLEIAN), src).toBe(true)
    const m = /^(.*)\/(full|(\d+),(\d+),(\d+),(\d+))\/(full|(\d+),)\/0\/default\.jpg$/.exec(src)
    expect(m, `IIIF url ${src}`).not.toBeNull()
    const [, base, , x, y, w, h, , outW] = m!
    const i = pages.findIndex((p) => p.s === base)
    expect(i, `page for ${base}`).toBeGreaterThanOrEqual(0)
    if (pageIdx < 0) pageIdx = i
    expect(i, 'all tiles belong to one page').toBe(pageIdx)
    const p = pages[i]!
    if (x != null) {
      expect(Number(x) + Number(w), `${src} inside width`).toBeLessThanOrEqual(p.w)
      expect(Number(y) + Number(h), `${src} inside height`).toBeLessThanOrEqual(p.h)
    }
    if (outW != null) expect(Number(outW), `${src} tile size`).toBeLessThanOrEqual(1024)
  }
  expect([at, at + 1], 'zoomed page is one of the visible pair').toContain(pageIdx)
  expect(errors).toEqual([])
})

test('scan credit: shows Bodleian credit, manifest link and CC BY-NC 4.0 deed link', async ({ page }) => {
  const errors = watchErrors(page)
  await mockIiif(page)
  const d = await data(page)
  expect(d.licence).toMatch(/CC BY-NC 4\.0/)
  await open(page)
  const credit = page.locator('[data-credit]')
  await expect(credit).toBeVisible()
  await expect(credit).toContainText(/Bodleian/)
  await expect(credit.locator(`a[href="${d.manifest}"]`)).toHaveCount(1)
  const lic = credit.getByRole('link', { name: 'CC BY-NC 4.0' })
  await expect(lic).toHaveCount(1)
  expect(await lic.getAttribute('href')).toMatch(BY_NC)
  expect(errors).toEqual([])
})

test('scan host: every request to another origin goes to iiif.bodleian.ox.ac.uk', async ({ page }) => {
  const errors = watchErrors(page)
  const foreign: string[] = []
  page.on('request', (r) => {
    const u = r.url()
    if (!u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:')) foreign.push(u)
  })
  await mockIiif(page)
  await page.setViewportSize({ width: 1280, height: 800 })
  await open(page)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('+')
  await expect(page.locator('dialog[data-zoom]')).toBeVisible()
  await expect.poll(() => foreign.length).toBeGreaterThan(0)
  expect(foreign.filter((u) => !u.startsWith(BODLEIAN)), 'only the Bodleian host').toEqual([])
  expect(errors).toEqual([])
})
