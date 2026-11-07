import { expect, test } from '@playwright/test'
import { BY_NC, dataFile, mockIiif, playLiving } from './iiif'
import { ready, watchErrors } from './util'

type Spec = { id: string; statement: string; cite: string; answer: number; source: string; image: { service: string } }
const spec = () => dataFile<Spec>('data/living/stgall.json')

test('stgall: predict, reveal and stamp, and the stamp survives a reload', async ({ page }) => {
  const errors = watchErrors(page)
  await mockIiif(page)
  const s = spec()
  await page.goto('/stgall')
  await playLiving(page, 'stgall', s)
  expect(errors).toEqual([])
})

test('stgall: plan image comes from e-codices at 600 px or wider, with alt and credit', async ({ page }) => {
  const errors = watchErrors(page)
  const hits = await mockIiif(page)
  const s = spec()
  expect(s.image.service).toMatch(/^https:\/\/([a-z]+\.)?e-codices\.(ch|unifr\.ch)\//)
  await page.goto('/stgall')
  await ready(page, 'stgall')
  const img = page.locator('img[data-plan]')
  await expect(img).toHaveCount(1)
  const src = (await img.getAttribute('src'))!
  expect(src.startsWith(`${s.image.service}/full/`), src).toBe(true)
  const w = /\/full\/(\d+),\/0\/default\.jpg$/.exec(src)
  expect(w, `size segment in ${src}`).not.toBeNull()
  expect(Number(w![1])).toBeGreaterThanOrEqual(600)
  expect((await img.getAttribute('alt'))?.trim().length ?? 0, 'alt text').toBeGreaterThan(0)
  expect(hits.urls.some((u) => u === src)).toBe(true)

  const credit = page.locator('[data-credit]')
  await expect(credit).toBeVisible()
  await expect(credit).toContainText(/e-codices/i)
  const licence = credit.getByRole('link', { name: 'CC BY-NC 4.0' })
  await expect(licence).toHaveCount(1)
  expect(await licence.getAttribute('href')).toMatch(BY_NC)
  expect(errors).toEqual([])
})

test('stgall: an image failure shows data-source-error and the page stays ready', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.route(/e-codices/, (r) => r.abort('connectionrefused'))
  await page.goto('/stgall')
  await ready(page, 'stgall')
  await expect(page.locator('[data-source-error]')).toBeVisible()
  await expect(page.locator('.statement')).toBeVisible()
  expect(errors).toEqual([])
})
