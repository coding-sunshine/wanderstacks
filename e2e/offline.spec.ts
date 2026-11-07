import { expect, test } from '@playwright/test'

test('a book read once opens again offline', async ({ page, context }) => {
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => 0))
  await page.reload()
  await page.waitForFunction(() => !!navigator.serviceWorker.controller)

  await page.goto('/read/modest-proposal')
  const reader = page.locator('[data-view="reader"][data-ready="true"]')
  await expect(reader).toBeVisible()
  await reader.getByRole('button', { name: 'End' }).click()
  await expect(reader.locator('.rd-status')).toHaveText(/^Page (\d+) of \1$/)

  await context.setOffline(true)
  await page.reload()
  const again = page.locator('[data-view="reader"][data-ready="true"]')
  await expect(again).toBeVisible()
  await expect(again.locator('.rd-page').first()).toContainText(/\w{3,}/)
  await expect(again.locator('.rd-status')).toHaveText(/^Page 1 of/)
})
