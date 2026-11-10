import { expect, test } from '@playwright/test'
import { fromGlobe, root } from './util-c'
import { ready } from './util'

const LIVE = 'https://worldlibs.pages.dev'
test.use({ baseURL: LIVE })

test('deployed-c: direct Long Room load is inside with a sky and a local line', async ({ page }) => {
  await page.goto(`${LIVE}/room/longroom`)
  await ready(page, 'room')
  expect(page.url().startsWith(LIVE)).toBe(true)
  await expect(root(page)).toHaveAttribute('data-place', 'inside')
  await expect(root(page)).toHaveAttribute('data-sky', /^(day|twilight|night)$/)
  await expect(page.locator('[data-local-text]')).toHaveText(/^\d{2}:\d{2}( solar)?( · [^·]+ · -?\d+°C)?$/)
})

test('deployed-c: an atlas card arrives outside', async ({ page }) => {
  await fromGlobe(page, 'longroom')
  expect(page.url().startsWith(LIVE)).toBe(true)
  await expect(root(page)).toHaveAttribute('data-place', 'outside')
})

test('deployed-c: home is neutral and a deep link opens page-turn reads', async ({ page }) => {
  await page.goto(`${LIVE}/`)
  await ready(page, 'home')
  await expect(page.locator('#xlist button')).toHaveCount(52)
  await expect(page.locator('#xlist button[aria-pressed="true"]')).toHaveCount(0)
  await expect(page.locator('#xcard')).toBeEmpty()
  await page.goto(`${LIVE}/atlas/bodleian`)
  await ready(page, 'home')
  const reads = page.locator('#xcard .reads a')
  expect(await reads.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(['/scan/mendoza', '/scan/firstfolio'])
  await reads.first().click()
  await page.waitForURL('**/scan/mendoza', { timeout: 15_000 })
  await ready(page, 'scan')
})
