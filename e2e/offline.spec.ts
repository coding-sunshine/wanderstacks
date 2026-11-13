import { expect, test } from '@playwright/test'

test('an unvisited page never falls back to the homepage offline', async ({ page, context }) => {
  await page.goto('/atlas')
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => 0))
  await page.reload()
  await page.waitForFunction(() => !!navigator.serviceWorker.controller)

  await context.setOffline(true)
  const response = await page.goto('/journey/buda/')
  expect(response?.status()).toBe(503)
  await expect(page).toHaveTitle('Offline | Wanderstacks')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('You are offline')
  await expect(page.getByText('This page has not been saved for offline reading.')).toBeVisible()
})

test('a book read once opens again offline', async ({ page, context }) => {
  await page.goto('/atlas')
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => 0))
  await page.reload()
  await page.waitForFunction(() => !!navigator.serviceWorker.controller)

  await page.goto('/read/modest-proposal')
  const reader = page.locator('[data-view="reader"][data-ready="true"]')
  await expect(reader).toBeVisible()
  const start = Number(/Page (\d+) of/.exec(await reader.locator('.rd-status').textContent() ?? '')?.[1] ?? 0)
  await reader.getByRole('button', { name: 'End' }).click()
  await expect(reader.locator('.rd-status')).toHaveText(/^Page (\d+) of \1$/)

  await context.setOffline(true)
  await page.reload()
  const again = page.locator('[data-view="reader"][data-ready="true"]')
  await expect(again).toBeVisible()
  await expect(again.locator('.rd-page').first()).toContainText(/\w{3,}/)
  await expect(again.locator('.rd-status')).toHaveText(new RegExp(`^Page ${start} of`))
})
