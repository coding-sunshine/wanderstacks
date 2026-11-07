import { expect, test, type Page } from '@playwright/test'
import { blockIiif } from './iiif'
import { ready } from './util'

// The scan and the plan come from other people's servers. With both hosts down, each page must still stand.
async function offline(page: Page, path: string, view: string) {
  const thrown: string[] = []
  page.on('pageerror', (e) => thrown.push(e.message))
  await blockIiif(page)
  await page.goto(path)
  await ready(page, view)
  await expect(page.locator('[data-source-error]').first()).toBeVisible({ timeout: 15_000 })
  await expect(page.locator(`[data-view="${view}"][data-ready="true"]`)).toBeVisible()
  return thrown
}

test('scan with the Bodleian host down shows data-source-error and stays ready', async ({ page }) => {
  const thrown = await offline(page, '/scan/firstfolio', 'scan')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('+')
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-view="scan"][data-ready="true"]')).toBeVisible()
  expect(thrown).toEqual([])
})

test('stgall with the e-codices host down shows data-source-error and keeps the prediction', async ({ page }) => {
  const thrown = await offline(page, '/stgall', 'stgall')
  await expect(page.locator('.statement')).toBeVisible()
  await expect(page.locator('[data-choice]').first()).toBeEnabled()
  expect(thrown).toEqual([])
})

test('darwin has no remote image, so it needs no source error', async ({ page }) => {
  const thrown: string[] = []
  page.on('pageerror', (e) => thrown.push(e.message))
  await blockIiif(page)
  await page.goto('/darwin')
  await ready(page, 'darwin')
  await expect(page.locator('[data-source-error]')).toHaveCount(0)
  expect(thrown).toEqual([])
})
