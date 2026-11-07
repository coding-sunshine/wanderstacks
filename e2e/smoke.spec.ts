import { expect, test } from '@playwright/test'
import { readableIds, ready, watchErrors } from './util'

test('every view mounts real content with a clean console and network', async ({ page }) => {
  const errors = watchErrors(page)
  const [book] = await readableIds()
  const stops: [string, string][] = [['/', 'globe'], ['/atlas', 'atlas'], ['/room/longroom', 'room'], [`/read/${book}`, 'reader'], ['/byrne', 'byrne']]
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

test('client navigation walks globe to room to reader and back', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/')
  await ready(page, 'globe')
  await page.locator('header').getByRole('link', { name: 'Long Room' }).click()
  await ready(page, 'room')
  await page.locator('[data-view="room"] a[href^="/read/"]').first().click()
  await ready(page, 'reader')
  await page.goBack()
  await ready(page, 'room')
  await page.goBack()
  await ready(page, 'globe')
  expect(errors).toEqual([])
})
