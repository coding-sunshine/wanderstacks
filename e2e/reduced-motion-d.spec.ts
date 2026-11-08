import { expect, test } from '@playwright/test'
import { openRoom } from './iiif'
import { watchErrors } from './util'
import { roomIdsD } from './util-d'

test.use({ reducedMotion: 'reduce' })

for (const room of roomIdsD()) {
  test(`d-reduced-motion: ${room} enters with a fade and then holds pixel-still`, async ({ page }) => {
    const errors = watchErrors(page)
    const root = await openRoom(page, room)

    // Bays keep building after the door opens; wait for the hall to finish filling in.
    await expect(root.locator('.room-status')).toBeHidden({ timeout: 60_000 })

    // Idle scenes hold pixel-still: accept the first pair of identical screenshots.
    let prev = await page.screenshot()
    let still = false
    for (let i = 0; i < 20 && !still; i++) {
      await page.waitForTimeout(500)
      const next = await page.screenshot()
      if (next.equals(prev)) still = true
      prev = next
    }
    expect(still, 'canvas and UI pixel-still').toBe(true)

    const moving = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)
    expect(moving, 'no running animations while idle').toBe(0)
    expect(errors).toEqual([])
  })
}
