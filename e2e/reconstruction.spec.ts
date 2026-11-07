import { expect, test } from '@playwright/test'
import { loadLib, openRoom } from './iiif'
import { roomIds, ready, watchErrors } from './util'

for (const room of roomIds()) {
  test(`${room}: Reconstruction badge ${room === 'celsus' ? 'is permanent' : 'is absent'}`, async ({ page }) => {
    const errors = watchErrors(page)
    const lib = await loadLib(page, room)
    expect(!!lib.reconstruction, 'reconstruction flag in data').toBe(room === 'celsus')
    const root = await openRoom(page, room)
    const badge = root.locator('> [data-badge="reconstruction"]')

    if (!lib.reconstruction) {
      await expect(page.locator('[data-badge]')).toHaveCount(0)
      expect(errors).toEqual([])
      return
    }

    const shown = async () => {
      await expect(badge).toHaveCount(1)
      await expect(badge).toBeVisible()
      await expect(badge).toHaveText('Reconstruction')
      expect(await badge.evaluate((el) => el.tagName.toLowerCase()), 'not a button').not.toBe('button')
      expect(await badge.evaluate((el) => !!el.closest('button,[role=button],[aria-hidden=true]')), 'not interactive or hidden').toBe(false)
      await expect(badge).not.toHaveAttribute('aria-hidden', /.*/)
    }
    await shown()

    await badge.click()
    await shown()
    await page.keyboard.press('Escape')
    await shown()
    const box = (await root.locator('canvas').boundingBox())!
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await shown()

    await root.locator('.room-controls button[data-action="tour"]').click()
    await expect(root.locator('[data-tour]')).toBeVisible()
    await shown()
    await page.keyboard.press('Escape')
    await shown()

    await page.reload()
    await ready(page, 'room')
    await shown()
    expect(errors).toEqual([])
  })
}
