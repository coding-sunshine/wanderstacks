import { expect, test } from '@playwright/test'
import { openRoom } from './iiif'
import { watchErrors } from './util'
import { roomIdsD } from './util-d'

for (const room of roomIdsD()) {
  test(`d-mobile: ${room} at 390 px there is no horizontal scroll and the controls reach 44 px`, async ({ page }) => {
    const errors = watchErrors(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`/room/${room}`)
    await page.waitForSelector('[data-view=room][data-ready=true]', { timeout: 30_000 })

    expect(await page.evaluate(() => document.documentElement.scrollWidth), 'no horizontal scroll').toBeLessThanOrEqual(390)

    for (const sel of ['.room-controls button', 'button[data-action="enter"]', 'button[data-action="exit"]']) {
      const n = await page.locator(sel).count()
      for (let i = 0; i < n; i++) {
        const box = await page.locator(sel).nth(i).boundingBox()
        if (box && box.width > 0) {
          expect(box.height, `${sel} #${i} height`).toBeGreaterThanOrEqual(44)
          expect(box.width, `${sel} #${i} width`).toBeGreaterThanOrEqual(44)
        }
      }
    }
    expect(errors).toEqual([])
  })
}
