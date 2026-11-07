import { test, expect } from '@playwright/test'
import { basisLabel, type Param } from '../src/types'
import { watchErrors } from './util'

test('every estimated, attested, comparandum and invented hall param shows its label', async ({ page }) => {
  const errors = watchErrors(page)
  const lib = await (await page.request.get('/lib/longroom.json')).json()
  const hall = lib.hall as Record<string, Param<unknown>>
  await page.goto('/room/longroom')
  await page.waitForSelector('[data-view=room][data-ready=true]')
  const toggle = page.locator('.room-toggle')
  if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click()

  let labelled = 0
  for (const [key, p] of Object.entries(hall)) {
    const dd = page.locator(`[data-param="${key}"]`)
    await expect(dd, key).toHaveCount(1)
    const label = basisLabel(p)
    if (label) {
      await expect(dd.locator('.basis'), key).toHaveText(label)
      labelled++
    } else await expect(dd.locator('.basis'), key).toHaveCount(0)
  }
  expect(labelled).toBeGreaterThan(0)
  expect(errors).toEqual([])
})
