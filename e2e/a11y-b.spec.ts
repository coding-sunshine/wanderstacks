import { expect, test } from '@playwright/test'
import { mockIiif, openRoom, tabTo, unnamed } from './iiif'
import { ready, roomIds, watchErrors } from './util'

const pages: [string, string][] = [
  ['/ledger/alexandria', 'ledger'],
  ['/stgall', 'stgall'],
  ['/darwin', 'darwin'],
  ['/scan/firstfolio', 'scan'],
]

for (const [path, view] of pages) {
  test(`${view}: every button and link has an accessible name, one h1, and Tab reaches content`, async ({ page }) => {
    const errors = watchErrors(page)
    await mockIiif(page)
    await page.goto(path)
    await ready(page, view)
    expect(await unnamed(page), 'nameless controls').toEqual([])
    await expect(page.locator('h1')).toHaveCount(1)
    await tabTo(page, `[data-view="${view}"] a, [data-view="${view}"] button, [data-view="${view}"] [tabindex="0"]`)
    expect(errors).toEqual([])
  })
}

for (const room of roomIds()) {
  test(`${room}: room controls are named, pressed state is exposed, keyboard-only works`, async ({ page }) => {
    const errors = watchErrors(page)
    const root = await openRoom(page, room)
    expect(await unnamed(page), 'nameless controls').toEqual([])
    const controls = root.locator('.room-controls')
    for (const [action, name] of [['evidence', 'Evidence'], ['tour', 'Tour'], ['sound', 'Sound']] as const)
      await expect(controls.locator(`button[data-action="${action}"]`)).toHaveAccessibleName(name)

    await tabTo(page, '.room-controls button[data-action="evidence"]')
    await page.keyboard.press('Space')
    await expect(controls.locator('button[data-action="evidence"]')).toHaveAttribute('aria-pressed', 'true')
    await expect(root).toHaveAttribute('data-evidence', 'on')
    await page.keyboard.press('Space')
    await expect(controls.locator('button[data-action="evidence"]')).toHaveAttribute('aria-pressed', 'false')

    await tabTo(page, '.room-controls button[data-action="tour"]')
    await page.keyboard.press('Enter')
    const tour = root.locator('[data-tour]')
    await expect(tour).toBeVisible()
    await expect(tour).toHaveAccessibleName(/\S/)
    expect(await unnamed(page), 'nameless controls with the tour open').toEqual([])
    await tabTo(page, '[data-tour-next]')
    await page.keyboard.press('Enter')
    await expect(root).toHaveAttribute('data-tour-stop', '1')
    await page.keyboard.press('Escape')
    await expect(tour).toBeHidden()
    await expect(controls.locator('button[data-action="tour"]')).toBeFocused()

    await tabTo(page, '.room-controls button[data-action="sound"]')
    await expect(controls.locator('button[data-action="sound"]')).toHaveAttribute('aria-pressed', 'false')
    await page.keyboard.press('Enter')
    await expect(controls.locator('button[data-action="sound"]')).toHaveAttribute('aria-pressed', 'true')
    expect(errors).toEqual([])
  })
}

test('scan: zoom is a labelled modal dialog that traps and restores focus', async ({ page }) => {
  const errors = watchErrors(page)
  await mockIiif(page)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/scan/firstfolio')
  await ready(page, 'scan')
  await tabTo(page, '[data-view="scan"] *')
  const opener = await page.evaluateHandle(() => document.activeElement)
  await page.keyboard.press('+')
  const zoom = page.locator('dialog[data-zoom]')
  await expect(zoom).toBeVisible()
  await expect(zoom).toHaveAccessibleName(/\S/)
  expect(await unnamed(page), 'nameless controls in zoom').toEqual([])
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog[data-zoom]')), `Tab ${i} stays in the dialog`).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(zoom).toBeHidden()
  expect(await page.evaluate((o) => document.activeElement === o, opener)).toBe(true)
  expect(errors).toEqual([])
})
