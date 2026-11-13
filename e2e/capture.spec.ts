import { expect, test } from '@playwright/test'
import { ready, watchErrors } from './util'

test('SLV loads its real captured interior with local Draco decoding and working movement', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/room/slv')
  const room = page.locator('[data-view="room"]')
  await ready(page, 'room')
  await expect(room).toHaveAttribute('data-capture', 'captured', { timeout: 60_000 })
  await expect(room.locator('canvas')).toBeVisible()
  await expect(room.locator('[data-badge="capture"]')).toBeVisible()
  await expect(room.locator('[data-badge="capture"]')).toContainText('CC BY-NC-SA 4.0')
  await expect(room.locator('[data-badge="capture"] a')).toHaveAttribute('href', /zenodo|sketchfab/)
  const rules = page.getByRole('button', { name: 'Respectfully noted' })
  if (await rules.isVisible()) await rules.click()
  await page.screenshot({ path: '/tmp/wanderstacks-slv-capture-start.png' })

  const before = await room.getAttribute('data-camera')
  await room.locator('canvas').focus()
  await page.keyboard.down('w')
  await page.waitForTimeout(500)
  await page.keyboard.up('w')
  await expect.poll(() => room.getAttribute('data-camera')).not.toBe(before)
  await page.screenshot({ path: '/tmp/wanderstacks-slv-capture.png' })
  expect(errors).toEqual([])
})

test('SLV library page links the captured visit and the registry labels it accurately', async ({ page }) => {
  await page.goto('/libraries/slv/')
  const link = page.getByRole('link', { name: 'Walk in captured 3D', exact: true })
  await expect(link).toHaveAttribute('href', '/room/slv/')
  await page.goto('/visit/')
  await expect(page.locator('#visit-slv .library .stamp')).toHaveText('Real captured 3D')
})
