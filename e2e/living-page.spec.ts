import { expect, test } from '@playwright/test'
import { watchErrors } from './util'

test('byrne: predict, reveal, stamp, reload', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/byrne')
  const view = page.locator('[data-view="byrne"][data-ready="true"]')
  await expect(view).toBeVisible()
  const stamp = view.locator('.stamp')
  await expect(stamp).toBeHidden()

  await view.getByRole('button', { name: 'Equilateral' }).click()
  await expect(stamp).toBeVisible({ timeout: 15_000 })
  await expect(view.locator('[data-step]:not(.drawn)')).toHaveCount(0)

  const saved = await page.evaluate(() => JSON.parse(localStorage['wl.stamps']))
  expect(saved).toContain('byrne-i-1')

  await page.reload()
  await expect(page.locator('[data-view="byrne"][data-ready="true"] .stamp')).toBeVisible()
  expect(errors).toEqual([])
})

test('byrne: a wrong guess still reveals, and works without storage', async ({ page }) => {
  const errors = watchErrors(page)
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied') } })
  })
  await page.goto('/byrne')
  const view = page.locator('[data-view="byrne"][data-ready="true"]')
  await view.getByRole('button', { name: 'Scalene' }).click()
  await expect(view.locator('.result')).toContainText('Not quite', { timeout: 15_000 })
  await expect(view.locator('.stamp')).toBeVisible()
  expect(errors).toEqual([])
})
