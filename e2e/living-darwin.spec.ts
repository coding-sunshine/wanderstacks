import { expect, test } from '@playwright/test'
import { dataFile, playLiving } from './iiif'
import { ready, watchErrors } from './util'

type Spec = { id: string; statement: string; cite: string; answer: number; source: string }
const spec = () => dataFile<Spec>('data/living/darwin.json')

test('darwin: predict, reveal and stamp, and the stamp survives a reload', async ({ page }) => {
  const errors = watchErrors(page)
  const s = spec()
  await page.goto('/darwin')
  await playLiving(page, 'darwin', s)
  expect(errors).toEqual([])
})

test('darwin: cites chapter IV and has a stepped divergence figure', async ({ page }) => {
  const errors = watchErrors(page)
  const s = spec()
  expect(s.source).toMatch(/^https:\/\//)
  await page.goto('/darwin')
  await ready(page, 'darwin')
  await expect(page.locator('.cite')).toHaveText(/chapter IV/i)
  expect(await page.locator('svg [data-step]').count(), 'figure steps').toBeGreaterThanOrEqual(2)
  await expect(page.locator('svg[aria-label]')).toHaveCount(1)
  await expect(page.locator('[data-step].drawn')).toHaveCount(0)
  expect(errors).toEqual([])
})
