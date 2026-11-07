import { expect, test } from '@playwright/test'
import { watchErrors } from './util'

const view = (p: import('@playwright/test').Page) => p.locator('[data-view="globe"]')

test('globe paints, slider ghosts pins, no errors', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/')
  await expect(view(page)).toHaveAttribute('data-ready', 'true')
  const longRoom = view(page).getByRole('button', { name: /Long Room/ })
  await expect(longRoom).toBeVisible()
  await view(page).getByLabel('Year').fill('1500')
  await expect(longRoom).toBeHidden()
  await expect(view(page).getByRole('button', { name: /Bodleian/ })).toBeVisible()
  expect(errors).toEqual([])
})

test('unroll toggles and /atlas starts unrolled', async ({ page }) => {
  await page.goto('/')
  await expect(view(page)).toHaveAttribute('data-ready', 'true')
  const toggle = view(page).getByRole('button', { name: 'Unroll' })
  await toggle.click()
  await expect(view(page).getByRole('button', { name: 'Roll up' })).toHaveAttribute('aria-pressed', 'true')
  await page.goto('/atlas')
  await expect(page.locator('[data-view="atlas"]')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('[data-view="atlas"]').getByRole('button', { name: 'Roll up' })).toBeVisible()
})

test('Long Room flies, then enters the room', async ({ page }) => {
  await page.goto('/')
  await expect(view(page)).toHaveAttribute('data-ready', 'true')
  await view(page).getByRole('button', { name: /Long Room/ }).click()
  await page.waitForURL('**/room/longroom', { timeout: 8000 })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('idle canvas is pixel-stable', async ({ page }) => {
    await page.goto('/')
    await expect(view(page)).toHaveAttribute('data-ready', 'true')
    await page.waitForTimeout(600)
    const canvas = page.locator('.globe-canvas')
    const a = await canvas.screenshot()
    await page.waitForTimeout(500)
    expect((await canvas.screenshot()).equals(a)).toBe(true)
  })

  test('Long Room cuts without flying', async ({ page }) => {
    await page.goto('/')
    await expect(view(page)).toHaveAttribute('data-ready', 'true')
    const t0 = Date.now()
    await view(page).getByRole('button', { name: /Long Room/ }).click()
    await page.waitForURL('**/room/longroom')
    expect(Date.now() - t0).toBeLessThan(1500)
  })
})
