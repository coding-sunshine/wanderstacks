import { expect, test } from '@playwright/test'
import { mockIiif } from './iiif'
import { ready, roomIds, watchErrors } from './util'

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

const stops: [string, string][] = [
  ['/', 'globe'],
  ['/ledger/alexandria', 'ledger'],
  ['/stgall', 'stgall'],
  ['/darwin', 'darwin'],
  ['/scan/firstfolio', 'scan'],
  ...roomIds().map((id): [string, string] => [`/room/${id}`, 'room']),
]

const fits = (page: import('@playwright/test').Page) =>
  page.evaluate(() => ({
    html: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    body: document.body.scrollWidth <= document.documentElement.clientWidth,
    w: document.documentElement.scrollWidth,
  }))

for (const [path, view] of stops) {
  test(`mobile ${path}: no horizontal scroll at 390 px`, async ({ page }) => {
    const errors = watchErrors(page)
    await mockIiif(page)
    await page.goto(path)
    await ready(page, view)
    await page.waitForTimeout(500)
    const f = await fits(page)
    expect(f.html, `scrollWidth ${f.w} > 390`).toBe(true)
    expect(f.body).toBe(true)
    expect(errors).toEqual([])
  })
}

test('mobile room: the three controls are visible and inside the viewport', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/room/longroom')
  await ready(page, 'room')
  for (const action of ['evidence', 'tour', 'sound']) {
    const b = page.locator(`.room-controls button[data-action="${action}"]`)
    await expect(b).toBeVisible()
    const box = (await b.boundingBox())!
    expect(box.x, action).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, action).toBeLessThanOrEqual(390)
  }
  await page.locator('.room-controls button[data-action="evidence"]').tap()
  await expect(page.locator('[data-view="room"]')).toHaveAttribute('data-evidence', 'on')
  expect((await fits(page)).html, 'evidence legend fits').toBe(true)
  await page.locator('.room-controls button[data-action="tour"]').tap()
  await expect(page.locator('[data-tour]')).toBeVisible()
  expect((await fits(page)).html, 'tour panel fits').toBe(true)
  const t = (await page.locator('[data-tour]').boundingBox())!
  expect(t.x).toBeGreaterThanOrEqual(0)
  expect(t.x + t.width).toBeLessThanOrEqual(390)
  expect(errors).toEqual([])
})

test('mobile scan: one page is shown and arrows step by one', async ({ page }) => {
  const errors = watchErrors(page)
  await mockIiif(page)
  await page.goto('/scan/firstfolio')
  await ready(page, 'scan')
  await expect(page.locator('[data-view="scan"] img[data-page="1"]:visible')).toHaveCount(0)
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('[data-view="scan"]')).toHaveAttribute('data-page', '1')
  expect(errors).toEqual([])
})
