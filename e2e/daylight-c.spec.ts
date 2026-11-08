import { expect, test } from '@playwright/test'
import { ALL, BUILDINGS, CLEAR, angDiff, geo, gotoRoom, luminance, mockWeather, root, solarMidnight, solarNoon, sunAt, twilightMoment, waitWeather } from './util-c'

const num = (v: string | null) => JSON.parse(v ?? 'null') as { alt: number; az: number }

for (const id of ALL) {
  const { lat, lon } = geo(id)
  const noon = solarNoon(lat, lon)
  const moments = [
    { name: 'noon', at: noon, sky: 'day', lamps: 'off' },
    { name: 'midnight', at: solarMidnight(noon), sky: 'night', lamps: 'on' },
    { name: 'twilight', at: twilightMoment(lat, lon, noon), sky: 'twilight', lamps: 'off' },
  ]
  for (const m of moments) {
    test(`sky-matches-sun: ${id} ${m.name}`, async ({ page }) => {
      await mockWeather(page, CLEAR)
      await page.clock.setFixedTime(m.at)
      await gotoRoom(page, id)
      const r = root(page)
      await expect(r).toHaveAttribute('data-sun', /alt/, { timeout: 3000 })
      const got = num(await r.getAttribute('data-sun'))
      const want = sunAt(lat, lon, m.at)
      expect(Math.abs(got.alt - want.alt), `alt ${got.alt} vs ${want.alt}`).toBeLessThanOrEqual(0.5)
      expect(angDiff(got.az, want.az), `az ${got.az} vs ${want.az}`).toBeLessThanOrEqual(1)
      await expect(r).toHaveAttribute('data-sky', m.sky)
      await expect(r).toHaveAttribute('data-lamps', m.lamps)
    })
  }
}

test.describe('interior', () => {
  test.use({ reducedMotion: 'reduce' })
  for (const id of BUILDINGS) {
    test(`interior-daylight: ${id} noon vs midnight`, async ({ page }) => {
      const { lat, lon } = geo(id)
      const noon = solarNoon(lat, lon)
      await mockWeather(page, CLEAR)
      await page.clock.setFixedTime(noon)
      await gotoRoom(page, id)
      const r = root(page)
      await waitWeather(page)
      await expect(r).toHaveAttribute('data-place', 'inside')
      await expect(r).toHaveAttribute('data-lamps', 'off')
      await expect(r).toHaveAttribute('data-beams', 'on')
      await page.waitForTimeout(2600)
      const day = await luminance(page)
      await page.clock.setFixedTime(solarMidnight(noon))
      await page.reload()
      await expect(r).toHaveAttribute('data-ready', 'true', { timeout: 30_000 })
      await waitWeather(page)
      await expect(r).toHaveAttribute('data-lamps', 'on')
      await expect(r).toHaveAttribute('data-beams', 'off')
      await page.waitForTimeout(2600)
      const night = await luminance(page)
      expect(night, `night ${night} day ${day}`).toBeLessThan(0.8 * day)
      expect(night, 'night not black').toBeGreaterThan(0.04)
    })
  }
  test('interior-daylight: celsus noon has beams off', async ({ page }) => {
    const { lat, lon } = geo('celsus')
    await mockWeather(page, CLEAR)
    await page.clock.setFixedTime(solarNoon(lat, lon))
    await gotoRoom(page, 'celsus')
    await waitWeather(page)
    await expect(root(page)).toHaveAttribute('data-place', 'site')
    await expect(root(page)).toHaveAttribute('data-sky', 'day')
    await expect(root(page)).toHaveAttribute('data-beams', 'off')
  })
})

for (const id of ['longroom', 'celsus'] as const) {
  test(`sky-advances: ${id} two hours`, async ({ page }) => {
    const { lat, lon } = geo(id)
    const noon = solarNoon(lat, lon)
    await mockWeather(page, CLEAR)
    await page.clock.install({ time: noon })
    await gotoRoom(page, id)
    const r = root(page)
    await expect(r).toHaveAttribute('data-sun', /alt/, { timeout: 3000 })
    const before = num(await r.getAttribute('data-sun'))
    await page.clock.fastForward('02:00:00')
    const want = sunAt(lat, lon, new Date(noon.getTime() + 2 * 3_600_000))
    await expect
      .poll(async () => angDiff(num(await r.getAttribute('data-sun')).az, before.az), { timeout: 5000, message: 'azimuth moved >= 10 deg' })
      .toBeGreaterThanOrEqual(10)
    const got = num(await r.getAttribute('data-sun'))
    expect(angDiff(got.az, want.az), `az ${got.az} vs ${want.az}`).toBeLessThanOrEqual(1)
  })
}
