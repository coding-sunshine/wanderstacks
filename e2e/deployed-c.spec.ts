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
