import { expect, test } from '@playwright/test'
import { basisLabel, loadLib, openRoom, params } from './iiif'
import { roomIds, watchErrors } from './util'

for (const room of roomIds()) {
  test(`${room}: every hall param shows its basis label and rt60 is labelled estimated`, async ({ page }) => {
    const errors = watchErrors(page)
    const lib = await loadLib(page, room)
    const root = await openRoom(page, room)
    await expect(root).toHaveAttribute('data-kit', lib.kit)
    const toggle = page.locator('.room-toggle')
    if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click()

    let labelled = 0
    for (const [key, p] of Object.entries(params(lib))) {
      const dd = page.locator(`[data-param="${key}"]`)
      await expect(dd, key).toHaveCount(1)
      const label = basisLabel(p)
      if (label) {
        await expect(dd.locator('.basis'), key).toHaveText(label)
        labelled++
      } else await expect(dd.locator('.basis'), key).toHaveCount(0)
    }
    expect(labelled, 'at least one labelled param').toBeGreaterThan(0)

    await expect(page.locator('[data-param="rt60"] .basis')).toHaveText('estimated')
    expect(errors).toEqual([])
  })
}
