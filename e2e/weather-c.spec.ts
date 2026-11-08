import { expect, test, type Page } from '@playwright/test'
import { ALL, BUILDINGS, CLEAR, geo, gotoOutside, gotoRoom, hhmm, lineFor, luminance, mockWeather, root, solarLine, solarNoon, waitWeather, type WxMode } from './util-c'

const T = new Date('2026-03-20T10:07:00Z')
const cnt = async (page: Page, name: string) => Number((await root(page).getAttribute(`data-${name}`)) ?? 'NaN')

async function lumAt(page: Page, mock: Awaited<ReturnType<typeof mockWeather>>, mode: WxMode) {
  mock.set(mode)
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(root(page)).toHaveAttribute('data-ready', 'true', { timeout: 30_000 })
  await waitWeather(page)
  await page.waitForTimeout(2600)
  return luminance(page)
}

test.describe('applied', () => {
  test.use({ reducedMotion: 'reduce' })
  for (const [code, word] of [[63, 'rain'], [73, 'snow']] as const) {
    test(`weather-applied: code ${code} gives ${word}`, async ({ page }) => {
      await mockWeather(page, { code, temp: 5, cloud: 90 })
      await page.clock.setFixedTime(T)
      await gotoRoom(page, 'longroom')
      await waitWeather(page)
      await expect(root(page)).toHaveAttribute('data-weather', word)
      await expect(root(page)).toHaveAttribute('data-precip', word)
    })
  }
  test('weather-applied: celsus overcast is 10% darker', async ({ page }) => {
    const { lat, lon } = geo('celsus')
    const mock = await mockWeather(page, CLEAR)
    await page.clock.setFixedTime(solarNoon(lat, lon))
    await gotoRoom(page, 'celsus')
    const clear = await lumAt(page, mock, { code: 0, cloud: 0 })
    const grey = await lumAt(page, mock, { code: 3, cloud: 100 })
    expect(grey, `grey ${grey} clear ${clear}`).toBeLessThanOrEqual(0.9 * clear)
  })
  test('weather-applied: long room overcast is 3% darker, beams off', async ({ page }) => {
    const { lat, lon } = geo('longroom')
    const mock = await mockWeather(page, CLEAR)
    await page.clock.setFixedTime(solarNoon(lat, lon))
    await gotoRoom(page, 'longroom')
    const clear = await lumAt(page, mock, { code: 0, cloud: 0 })
    await expect(root(page)).toHaveAttribute('data-beams', 'on')
    const grey = await lumAt(page, mock, { code: 3, cloud: 100 })
    await expect(root(page)).toHaveAttribute('data-beams', 'off')
    expect(grey, `grey ${grey} clear ${clear}`).toBeLessThanOrEqual(0.97 * clear)
  })
})

for (const mode of ['fail500', 'abort', 'hang', 'malformed'] as const) {
  test(`weather-degrade: ${mode}`, async ({ page }) => {
    const bad: string[] = []
    page.on('pageerror', (e) => bad.push(`pageerror: ${e.message}`))
    page.on('console', (m) => m.type() === 'error' && !m.text().includes('Failed to load resource') && bad.push(`console: ${m.text()}`))
    await mockWeather(page, mode)
    await page.clock.setFixedTime(T)
    await page.goto('/room/longroom')
    await root(page).and(page.locator('[data-ready="true"]')).waitFor({ timeout: 6000 })
    const r = root(page)
    await expect(r).toHaveAttribute('data-weather', 'unknown', { timeout: 4500 })
    await expect(r).toHaveAttribute('data-cloud', '0')
    await expect(r).toHaveAttribute('data-precip', 'none')
    await expect(page.locator('[data-local-text]')).toHaveText(solarLine('longroom', T))
    await expect(page.locator('[data-local-text]')).toHaveText(/^\d\d:\d\d solar$/)
    expect(bad).toEqual([])
  })
}

test('weather-cache: 1 request cold, 0 at 10 min, 1 at 16 min', async ({ page }) => {
  const { lat, lon } = geo('longroom')
  const mock = await mockWeather(page, CLEAR)
  const t0 = new Date('2026-03-20T10:00:00Z')
  await page.clock.setFixedTime(t0)
  await gotoRoom(page, 'longroom')
  await waitWeather(page)
  await page.waitForTimeout(1000)
  expect(mock.hits.length, 'cold load').toBe(1)
  expect(Number(mock.hits[0]!.searchParams.get('latitude'))).toBeCloseTo(lat, 1)
  expect(Number(mock.hits[0]!.searchParams.get('longitude'))).toBeCloseTo(lon, 1)
  await page.clock.setFixedTime(new Date(t0.getTime() + 10 * 60_000))
  await page.reload()
  await expect(root(page)).toHaveAttribute('data-ready', 'true', { timeout: 30_000 })
  await waitWeather(page)
  await page.waitForTimeout(1000)
  expect(mock.hits.length, 'reload at 10 min').toBe(1)
  await page.clock.setFixedTime(new Date(t0.getTime() + 16 * 60_000))
  await page.reload()
  await expect(root(page)).toHaveAttribute('data-ready', 'true', { timeout: 30_000 })
  await waitWeather(page)
  await page.waitForTimeout(1000)
  expect(mock.hits.length, 'reload at 16 min').toBe(2)
})

async function lineChecks(page: Page, id: (typeof ALL)[number]) {
  await waitWeather(page)
  const strip = page.locator('[data-local]')
  await expect(strip).toBeVisible()
  await expect(page.locator('[data-local-text]')).toHaveText(lineFor(id, T, 61, 9.4))
  expect(hhmm('UTC', T)).toBe('10:07')
  await expect(strip.locator('a[href^="https://open-meteo.com"]')).toBeVisible()
  await expect(strip.getByText('CC BY 4.0').first()).toBeVisible()
  await expect(page.locator('ul.room-credits')).toBeVisible()
}

for (const id of ALL) {
  test(`local-line: ${id} default place`, async ({ page }) => {
    await mockWeather(page, { code: 61, temp: 9.4, cloud: 80, precip: 1 })
    await page.clock.setFixedTime(T)
    await gotoRoom(page, id)
    await lineChecks(page, id)
  })
}
for (const id of BUILDINGS) {
  test(`local-line: ${id} outside`, async ({ page }) => {
    await mockWeather(page, { code: 61, temp: 9.4, cloud: 80, precip: 1 })
    await page.clock.setFixedTime(T)
    await gotoOutside(page, id)
    await expect(root(page)).toHaveAttribute('data-place', 'outside')
    await lineChecks(page, id)
  })
}

async function staysZero(page: Page) {
  const end = Date.now() + 2000
  do {
    expect(await cnt(page, 'particles'), 'data-particles inside').toBe(0)
    await page.waitForTimeout(100)
  } while (Date.now() < end)
}

const RAINY = { code: 63, temp: 8, cloud: 90, precip: 2 }
for (const id of BUILDINGS) {
  test(`precip-outdoors: ${id} rain outside`, async ({ page }) => {
    await mockWeather(page, RAINY)
    await page.clock.setFixedTime(T)
    await gotoOutside(page, id)
    await waitWeather(page)
    await expect(root(page)).toHaveAttribute('data-precip', 'rain')
    await expect.poll(() => cnt(page, 'particles'), { timeout: 5000 }).toBeGreaterThan(0)
  })
  test(`precip-outdoors: ${id} rain inside`, async ({ page }) => {
    await mockWeather(page, RAINY)
    await page.clock.setFixedTime(T)
    await gotoRoom(page, id)
    await waitWeather(page)
    await expect(root(page)).toHaveAttribute('data-precip', 'rain')
    await expect(root(page)).toHaveAttribute('data-place', 'inside')
    await staysZero(page)
  })
  test(`precip-outdoors: ${id} clear inside`, async ({ page }) => {
    await mockWeather(page, CLEAR)
    await page.clock.setFixedTime(T)
    await gotoRoom(page, id)
    await waitWeather(page)
    await expect(root(page)).toHaveAttribute('data-precip', 'none')
    await expect(root(page)).toHaveAttribute('data-place', 'inside')
    await staysZero(page)
  })
  test(`precip-outdoors: ${id} clear outside`, async ({ page }) => {
    await mockWeather(page, CLEAR)
    await page.clock.setFixedTime(T)
    await gotoOutside(page, id)
    await waitWeather(page)
    await page.waitForTimeout(1000)
    await expect(root(page)).toHaveAttribute('data-precip', 'none')
    await expect(root(page)).toHaveAttribute('data-particles', '0')
  })
}
test('precip-outdoors: celsus rain', async ({ page }) => {
  await mockWeather(page, RAINY)
  await page.clock.setFixedTime(T)
  await gotoRoom(page, 'celsus')
  await waitWeather(page)
  await expect(root(page)).toHaveAttribute('data-precip', 'rain')
  await expect.poll(() => cnt(page, 'particles'), { timeout: 5000 }).toBeGreaterThan(0)
})
test('precip-outdoors: celsus clear', async ({ page }) => {
  await mockWeather(page, CLEAR)
  await page.clock.setFixedTime(T)
  await gotoRoom(page, 'celsus')
  await waitWeather(page)
  await page.waitForTimeout(1000)
  await expect(root(page)).toHaveAttribute('data-precip', 'none')
  await expect(root(page)).toHaveAttribute('data-particles', '0')
})
