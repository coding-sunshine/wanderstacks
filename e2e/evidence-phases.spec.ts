import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { ready, watchErrors } from './util'

const openRoom = async (page: import('@playwright/test').Page) => {
  await page.goto('/room/longroom')
  const room = page.locator('[data-view="room"]')
  await ready(page, 'room')
  const rules = page.getByRole('button', { name: 'Respectfully noted' })
  if (await rules.isVisible()) await rules.click()
  return room
}

test('evidence-only hides guessed geometry and correction previews export paradata', async ({ page }) => {
  const errors = watchErrors(page)
  const room = await openRoom(page)
  await page.getByRole('button', { name: 'Evidence only', exact: true }).click()
  await expect(room).toHaveAttribute('data-evidence', 'strict')
  expect(Number(await room.getAttribute('data-evidence-hidden'))).toBeGreaterThan(0)

  await page.locator('[data-element="length"]').click()
  await page.locator('.workbench summary').click()
  await page.locator('.workbench input').first().fill('65')
  await page.getByRole('button', { name: 'Preview and reset', exact: true }).click()
  await expect(room).toHaveAttribute('data-preview', 'length')
  await expect(page.locator('.workbench [role="status"]')).toContainText('63.7 → 65')

  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download paradata', exact: true }).click()
  const download = await pending
  expect(download.suggestedFilename()).toBe('longroom-length-correction.json')
  const data = JSON.parse(await readFile(await download.path()!, 'utf8'))
  expect(data.library).toBe('longroom')
  expect(data.element).toBe('length')
  expect(data.current.value).toBe(63.7)
  expect(data.proposed.value).toBe(65)
  expect(data.current.source).toContain('tcd.ie')
  expect(data.proposed.source).toContain('tcd.ie')

  await page.getByRole('button', { name: 'Evidence', exact: true }).click()
  await expect(room).toHaveAttribute('data-evidence', 'off')
  expect(errors).toEqual([])
})

test('Long Room ceiling phases change without moving the camera', async ({ page }) => {
  const errors = watchErrors(page)
  const room = await openRoom(page)
  await page.getByRole('button', { name: 'Time phases', exact: true }).click()
  const camera = await room.getAttribute('data-camera')
  const slider = page.getByRole('slider', { name: 'Architectural phase' })
  await slider.fill('0')
  await expect(room).toHaveAttribute('data-phase', 'flat-ceiling-1733')
  await expect(room).toHaveAttribute('data-camera', camera!)
  await expect(page.locator('[data-phase-note]')).toContainText('flat plaster ceiling')
  await page.screenshot({ path: '/tmp/wanderstacks-longroom-flat.png' })
  await slider.fill('1')
  await expect(room).toHaveAttribute('data-phase', 'barrel-vault-1861')
  await expect(room).toHaveAttribute('data-camera', camera!)
  expect(errors).toEqual([])
})
