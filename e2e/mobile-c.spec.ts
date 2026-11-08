import { expect, test, type Page } from '@playwright/test'
import { CLEAR, centre, fromGlobe, gotoRoom, mockWeather, openPanel, root, settleIn, shelves, startSampling, stopSampling } from './util-c'

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
test.beforeEach(async ({ page }) => {
  await mockWeather(page, CLEAR)
})

const big = async (page: Page, sel: string, what: string) => {
  const els = page.locator(sel)
  const n = await els.count()
  expect(n, `${what} present`).toBeGreaterThan(0)
  for (let i = 0; i < n; i++) {
    const b = (await els.nth(i).boundingBox())!
    expect(b.width, `${what} ${i} width`).toBeGreaterThanOrEqual(44)
    expect(b.height, `${what} ${i} height`).toBeGreaterThanOrEqual(44)
  }
}
const noOverflow = async (page: Page, when: string) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth), `scrollWidth ${when}`).toBeLessThanOrEqual(390)

test('mobile-c: pin, Go inside, find and spine tap', async ({ page }) => {
  const s = shelves('longroom')[0]!
  await fromGlobe(page, 'longroom', 'pin')
  const r = root(page)
  await expect(r).toHaveAttribute('data-place', 'outside')
  await noOverflow(page, 'outside')
  await big(page, 'button[data-action="enter"]', 'Go inside')
  await big(page, '.room-controls button', 'room control')
  await page.getByRole('button', { name: 'Go inside', exact: true }).tap()
  await expect(r).toHaveAttribute('data-place', 'inside', { timeout: 2500 })
  await settleIn(page)
  await noOverflow(page, 'inside')
  await big(page, 'button[data-action="exit"]', 'Step outside')
  await big(page, '.room-controls button', 'room control')
  await openPanel(page)
  await big(page, `ul.room-shelves li[data-shelf="${s.id}"] button[data-action="find"]`, 'find')
  await page.locator(`ul.room-shelves li[data-shelf="${s.id}"] button[data-action="find"]`).tap()
  await expect(r).toHaveAttribute('data-book-focus', s.id, { timeout: 6000 })
  await expect(page.locator('.room-toggle')).toHaveAttribute('aria-expanded', 'false')
  const canvas = page.locator('[data-view="room"] canvas').first()
  const c = await centre(canvas)
  const top = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, c)
  expect(top, 'canvas centre is reachable after find (not covered by the notes panel)').toBe('CANVAS')
  await startSampling(page)
  await page.touchscreen.tap(c.x, c.y)
  const dlg = page.locator(`[role="dialog"][data-book="${s.id}"]`)
  await expect(dlg).toBeVisible()
  await page.waitForTimeout(600)
  const samples = await stopSampling(page)
  expect(samples.filter((x) => x.goal).length, 'spine tap must not start a glide').toBe(0)
  const b = (await dlg.boundingBox())!
  expect(b.x).toBeGreaterThanOrEqual(0)
  expect(b.y).toBeGreaterThanOrEqual(0)
  expect(b.x + b.width).toBeLessThanOrEqual(390)
  expect(b.y + b.height).toBeLessThanOrEqual(844)
  await big(page, '[role="dialog"] button', 'dialog button')
  await noOverflow(page, 'dialog')
})

test('mobile-c: celsus controls and overflow', async ({ page }) => {
  await gotoRoom(page, 'celsus')
  await expect(root(page)).toHaveAttribute('data-place', 'site')
  await noOverflow(page, 'celsus')
  await big(page, '.room-controls button', 'room control')
})
