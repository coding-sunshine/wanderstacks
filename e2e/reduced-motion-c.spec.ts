import { expect, test, type Page } from '@playwright/test'
import { settle } from './iiif'
import { BUILDINGS, CLEAR, gotoOutside, gotoRoom, mockWeather, openPanel, root, settleIn, shelves, startSampling, stopSampling, waitWeather } from './util-c'

test.use({ reducedMotion: 'reduce' })
const RAIN = { code: 63, temp: 8, cloud: 90, precip: 2 }
const uniq = (s: { cam: number[] | null }[]) => new Set(s.filter((x) => x.cam).map((x) => JSON.stringify(x.cam)))

async function still(page: Page) {
  await waitWeather(page)
  await page.waitForTimeout(2600)
  const canvas = page.locator('[data-view="room"] canvas').first()
  const a = await settle(canvas)
  await page.waitForTimeout(500)
  expect((await canvas.screenshot()).equals(a), 'canvas changed over 500 ms').toBe(true)
}

test('reduced-motion-c: outside in rain is pixel-still', async ({ page }) => {
  await mockWeather(page, RAIN)
  await gotoOutside(page, 'longroom')
  await waitWeather(page)
  await expect(root(page)).toHaveAttribute('data-place', 'outside')
  await expect(root(page)).toHaveAttribute('data-precip', 'rain')
  await expect.poll(async () => Number((await root(page).getAttribute('data-particles')) ?? 0), { timeout: 5000 }).toBeGreaterThan(0)
  await still(page)
})
test('reduced-motion-c: celsus in rain is pixel-still', async ({ page }) => {
  await mockWeather(page, RAIN)
  await gotoRoom(page, 'celsus')
  await waitWeather(page)
  await expect(root(page)).toHaveAttribute('data-precip', 'rain')
  await expect.poll(async () => Number((await root(page).getAttribute('data-particles')) ?? 0), { timeout: 5000 }).toBeGreaterThan(0)
  await still(page)
})

for (const id of BUILDINGS) {
  test(`reduced-motion-c: ${id} going in and out jumps then holds still`, async ({ page }) => {
    await mockWeather(page, CLEAR)
    await gotoOutside(page, id)
    await settleIn(page)
    const r = root(page)
    await expect(r).toHaveAttribute('data-place', 'outside')
    for (const [btn, place] of [['Go inside', 'inside'], ['Step outside', 'outside']] as const) {
      await startSampling(page)
      await page.waitForTimeout(150)
      await page.getByRole('button', { name: btn, exact: true }).click()
      await expect(r).toHaveAttribute('data-place', place, { timeout: 2500 })
      await page.waitForTimeout(1200)
      const s = await stopSampling(page)
      expect(uniq(s).size, `${btn}: distinct camera poses (start and end only)`).toBe(2)
      const tail = s.filter((x) => x.t > s[s.length - 1]!.t - 500)
      expect(uniq(tail).size, `${btn}: still after the jump`).toBe(1)
    }
  })
}

test('reduced-motion-c: find jumps the camera', async ({ page }) => {
  await mockWeather(page, CLEAR)
  await gotoRoom(page, 'longroom')
  await settleIn(page)
  await openPanel(page)
  const s0 = shelves('longroom')[3]!
  await startSampling(page)
  await page.waitForTimeout(150)
  await page.locator(`ul.room-shelves li[data-shelf="${s0.id}"] button[data-action="find"]`).click()
  await expect(root(page)).toHaveAttribute('data-book-focus', s0.id)
  await page.waitForTimeout(1200)
  const s = await stopSampling(page)
  expect(uniq(s).size, 'distinct camera poses (start and end only)').toBe(2)
})
