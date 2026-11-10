import { expect, test } from '@playwright/test'
import { readableIds, ready, watchErrors } from './util'

test('every view mounts real content with a clean console and network', async ({ page }) => {
  const errors = watchErrors(page)
  const [book] = await readableIds()
  const stops: [string, string][] = [['/', 'home'], ['/atlas', 'home'], ['/room/longroom', 'room'], [`/read/${book}`, 'reader'], ['/byrne', 'byrne']]
  for (const [path, view] of stops) {
    await page.goto(path)
    await ready(page, view)
    const root = page.locator(`[data-view="${view}"]`)
    await expect(root, `${path} mounts once`).toHaveCount(1)
    const box = await root.boundingBox()
    expect(box && box.width * box.height, `${path} root has area`).toBeGreaterThan(0)
    expect(await root.evaluate((el) => el.textContent!.trim().length + el.querySelectorAll('canvas,svg,img').length), `${path} not empty`).toBeGreaterThan(0)
  }
  expect(errors).toEqual([])
})

test('client navigation walks atlas to reader and back to the same card', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/atlas')
  await ready(page, 'home')
  await page.locator('#xlist').getByText(/^Long Room/).click()
  await page.locator('#xcard .reads a[href^="/read/"]').first().click()
  await ready(page, 'reader')
  await page.goBack()
  await ready(page, 'home')
  expect(new URL(page.url()).pathname).toBe('/atlas/longroom')
  await expect(page.locator('#xcard h2')).toHaveText(/Long Room/)
  expect(errors).toEqual([])
})
