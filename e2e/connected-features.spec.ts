import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { ready, watchErrors } from './util'

test('Buda spatial concordance opens the exact Vatican holder at the desk', async ({ page }) => {
  await page.goto('/libraries/buda/#spot-buda-r01-bindings')
  const related = page.locator('[data-concordance]')
  await expect(related).toContainText('not a book identified in this imagined view')
  await related.getByRole('link', { name: 'Andreas Pannonius, a surviving Corvina' }).click()
  const desk = page.locator('[data-view="desk"][data-ready="true"]')
  await expect(desk).toBeVisible({ timeout: 30_000 })
  await expect(desk.locator('[data-copy="left"] h2')).toHaveText('Vatican Library')
  await expect(desk.locator('[data-copy="right"] h2')).toHaveText('Österreichische Nationalbibliothek')
  await expect(desk.locator('[data-count]')).toHaveText('Image 1 of 360')
})

test('book pages link back to their related spatial viewpoint', async ({ page }) => {
  await page.goto('/books/diamond-sutra/')
  const link = page.getByRole('link', { name: 'See the related place in 3D', exact: true })
  await expect(link).toHaveAttribute('href', '/libraries/dunhuang/#spot-dunhuang-r01-heap')
  await expect(link.locator('..')).toContainText('not an identification')
})

test('research trail exports CSL with sources and capture-aware viewpoints', async ({ page }) => {
  await page.goto('/libraries/longroom/')
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download CSL JSON', exact: true }).click()
  const download = await pending
  expect(download.suggestedFilename()).toBe('longroom-research-trail.json')
  const data = JSON.parse(await readFile(await download.path()!, 'utf8'))[0]
  expect(data.type).toBe('webpage')
  expect(data.URL).toContain('/libraries/longroom/')
  expect(data.note).toContain('tcd.ie')
  expect(data.note).toContain('facts')
})

test('Mafra switches between measured position 4 and the Sabine estimate', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/room/mafra')
  const room = page.locator('[data-view="room"]')
  await ready(page, 'room')
  await expect(room).toHaveAttribute('data-ir-mode', 'measured')
  await page.getByRole('button', { name: 'Sound', exact: true }).click()
  await expect(room).toHaveAttribute('data-ir-loaded', 'mafra-library-s1-pos4.wav', { timeout: 20_000 })
  await page.getByRole('button', { name: 'Position 4, measured', exact: true }).click()
  await expect(room).toHaveAttribute('data-ir-mode', 'estimated')
  await page.getByRole('button', { name: 'Sabine estimate', exact: true }).click()
  await expect(room).toHaveAttribute('data-ir-mode', 'measured')
  expect(errors).toEqual([])
})

test('Weimar exposes synchronized nonvisual spatial directions', async ({ page }) => {
  await page.goto('/libraries/weimar/')
  const spatial = page.locator('.spatial')
  await expect(spatial).toContainText('Stop 1 of 4', { timeout: 30_000 })
  await expect(spatial).toContainText('Real photograph')
  await page.locator('.route [data-step="1"]').click()
  await expect(spatial).toContainText('Stop 2 of 4')
  await expect(spatial).toContainText('Next stop')
  await expect(page.getByRole('button', { name: 'Spatial directions', exact: true })).toBeVisible()
})

test('conservation watch names real schedules and rejects synthetic before-after imagery', async ({ page }) => {
  for (const lib of ['longroom', 'melk']) {
    await page.goto(`/libraries/${lib}/#conservation-watch`)
    const watch = page.locator('#conservation-watch')
    await expect(watch).toBeVisible()
    await expect(watch).toContainText('Real captures only')
    await expect(watch).toContainText('Do not')
  }
})
