import { expect, test, type Page } from '@playwright/test'
import { BUILDINGS, CLEAR, geo, gotoOutside, gotoRoom, mockWeather, root, settleIn, solarMidnight, solarNoon, waitWeather } from './util-c'

test.use({ launchOptions: { args: process.platform === 'darwin' ? ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] : [] } })
const RAIN = { code: 63, temp: 8, cloud: 90, precip: 2 }

async function measure(page: Page) {
  await waitWeather(page)
  await settleIn(page)
  let last = '', since = Date.now()
  await expect
    .poll(async () => {
      const v = (await root(page).getAttribute('data-textures')) ?? '0'
      if (v !== last) (last = v), (since = Date.now())
      return Date.now() - since
    }, { timeout: 15_000 })
    .toBeGreaterThanOrEqual(1000)
  await page.evaluate(() => {
    const d: number[] = []
    let last = performance.now()
    const tick = (t: number) => (d.push(t - last), (last = t), requestAnimationFrame(tick))
    requestAnimationFrame(tick)
    ;(window as unknown as { __dt: number[] }).__dt = d
  })
  await page.mouse.move(400, 400)
  await page.keyboard.down('w')
  try {
    await page.waitForTimeout(3000)
  } finally {
    await page.keyboard.up('w')
  }
  const dt = await page.evaluate(() => (window as unknown as { __dt: number[] }).__dt)
  const s = [...dt].sort((a, b) => a - b)
  const p95 = s[Math.floor(s.length * 0.95)]!
  const calls = Number(await root(page).getAttribute('data-calls'))
  console.log(`frame-time-c frames=${s.length} p95=${p95.toFixed(1)}ms calls=${calls}`)
  expect(s.length).toBeGreaterThan(60)
  expect(p95).toBeLessThanOrEqual(20)
  expect(calls).toBeGreaterThan(0)
  expect(calls).toBeLessThan(200)
}

for (const id of BUILDINGS) {
  test(`frame-time-c: ${id} outside in rain`, async ({ page }) => {
    await mockWeather(page, RAIN)
    await gotoOutside(page, id)
    await expect(root(page)).toHaveAttribute('data-place', 'outside')
    await waitWeather(page)
    await expect(root(page)).toHaveAttribute('data-precip', 'rain')
    await measure(page)
  })
}
test('frame-time-c: longroom inside at night with lamps', async ({ page }) => {
  await mockWeather(page, CLEAR)
  const { lat, lon } = geo('longroom')
  await page.clock.setFixedTime(solarMidnight(solarNoon(lat, lon)))
  await gotoRoom(page, 'longroom')
  await expect(root(page)).toHaveAttribute('data-place', 'inside')
  await expect(root(page)).toHaveAttribute('data-lamps', 'on')
  await measure(page)
})
test('frame-time-c: celsus in rain', async ({ page }) => {
  await mockWeather(page, RAIN)
  await gotoRoom(page, 'celsus')
  await waitWeather(page)
  await expect(root(page)).toHaveAttribute('data-precip', 'rain')
  await measure(page)
})
