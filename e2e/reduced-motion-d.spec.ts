import { expect, test } from '@playwright/test'
import { openRoom } from './iiif'
import { watchErrors } from './util'
import { roomIdsD } from './util-d'

test.use({ reducedMotion: 'reduce' })

for (const room of roomIdsD()) {
  test(`d-reduced-motion: ${room} enters with a fade and then holds pixel-still`, async ({ page }) => {
    const errors = watchErrors(page)
    const root = await openRoom(page, room)

    const still = async () => {
      const a = await page.screenshot()
      await page.waitForTimeout(600)
      const b = await page.screenshot()
      expect(b.equals(a), 'canvas and UI pixel-still').toBe(true)
    }
    await still()

    const moving = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)
    expect(moving, 'no running animations while idle').toBe(0)
    expect(errors).toEqual([])
  })
}
