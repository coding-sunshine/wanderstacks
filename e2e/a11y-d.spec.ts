import { expect, test } from '@playwright/test'
import { tabTo, unnamed } from './iiif'
import { openRoom } from './iiif'
import { watchErrors } from './util'
import { roomIdsD } from './util-d'

for (const room of roomIdsD()) {
  test(`d-a11y: ${room} every control is named and the room controls work by keyboard alone`, async ({ page }) => {
    const errors = watchErrors(page)
    const root = await openRoom(page, room)

    expect(await unnamed(page), 'no unnamed buttons or links').toEqual([])

    await tabTo(page, '.room-controls button[data-action="evidence"]')
    await page.keyboard.press('Enter')
    await expect(root).toHaveAttribute('data-evidence', 'on')
    await page.keyboard.press('Enter')
    await expect(root).toHaveAttribute('data-evidence', 'off')

    await tabTo(page, '.room-controls button[data-action="tour"]')
    await page.keyboard.press('Enter')
    await expect(root.locator('[data-tour]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(root.locator('[data-tour]')).toBeHidden()

    expect(errors).toEqual([])
  })
}
