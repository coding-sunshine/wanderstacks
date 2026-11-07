import { expect, test } from '@playwright/test'
import { camera, loadLib, near, openRoom } from './iiif'
import { roomIds, watchErrors } from './util'

// Reduced motion makes the camera cut, so each stop is reached at once.
test.use({ reducedMotion: 'reduce' })

for (const room of roomIds()) {
  test(`${room}: tour visits every stop with its fact and source, and Escape ends it`, async ({ page }) => {
    const errors = watchErrors(page)
    const lib = await loadLib(page, room)
    const stops = lib.tour?.stops ?? []
    expect(stops.length, 'tour stops').toBeGreaterThanOrEqual(3)
    const root = await openRoom(page, room)
    const button = root.locator('.room-controls button[data-action="tour"]')
    const tour = root.locator('[data-tour]')

    await expect(button).toHaveAccessibleName('Tour')
    await expect(tour).toBeHidden()
    await expect(root).not.toHaveAttribute('data-tour-stop', /.*/)

    await button.click()
    await expect(tour).toBeVisible()
    expect(await tour.getAttribute('aria-label') ?? await tour.getAttribute('aria-labelledby'), 'tour region is labelled').toBeTruthy()
    await expect(tour).not.toHaveAttribute('aria-modal', 'true')

    const at = async (i: number) => {
      const s = stops[i]!
      const fact = lib.facts[s.fact]!
      await expect(root).toHaveAttribute('data-tour-stop', String(i))
      await expect(tour.locator('[data-caption]'), `stop ${i} caption`).toHaveText(fact.value)
      await expect(tour.locator('a[data-source]'), `stop ${i} source`).toHaveAttribute('href', fact.source)
      await expect.poll(async () => near(await camera(root), s.at, 0.05), { message: `stop ${i} camera at ${s.at}`, timeout: 8000 }).toBe(true)
    }

    await at(0)
    for (let i = 1; i < stops.length; i++) {
      await tour.locator('[data-tour-next]').click()
      await at(i)
    }
    await tour.locator('[data-tour-prev]').click()
    await at(stops.length - 2)

    const parked = await camera(root)
    await page.keyboard.down('w')
    await page.waitForTimeout(700)
    await page.keyboard.up('w')
    expect(near(await camera(root), parked!, 0.01), 'walking keys are ignored inside the tour panel').toBe(true)

    await page.keyboard.press('Escape')
    await expect(tour).toBeHidden()
    await expect(root).not.toHaveAttribute('data-tour-stop', /.*/)
    await expect(button).toBeFocused()

    await button.click()
    await expect(tour).toBeVisible()
    await tour.getByRole('button', { name: /close|end|done/i }).click()
    await expect(tour).toBeHidden()
    await expect(root).not.toHaveAttribute('data-tour-stop', /.*/)
    await expect(button).toBeFocused()
    expect(errors).toEqual([])
  })
}
