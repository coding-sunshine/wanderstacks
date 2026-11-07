import { expect, test } from '@playwright/test'
import { watchErrors } from './util'

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

test('390px reader has no horizontal scroll and a swipe turns the page', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/read/modest-proposal')
  const reader = page.locator('[data-view="reader"][data-ready="true"]')
  await expect(reader).toBeVisible()
  const status = reader.locator('.rd-status')
  await expect(status).toHaveText(/^Page 1 of/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

  const cdp = await page.context().newCDPSession(page)
  const pt = (x: number) => [{ x, y: 400 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(320) })
  for (const x of [280, 220, 160, 100]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x) })
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect(status).toHaveText(/^Page 2/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(errors).toEqual([])
})
