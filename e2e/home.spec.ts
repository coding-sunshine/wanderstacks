import { expect, test, type Page } from '@playwright/test'
import { mockIiif, json } from './iiif'
import { ready, watchErrors } from './util'

type Pin = { id: string; n: string; y: number; href: string | null }

const home = (page: Page) => page.locator('[data-view="home"]')
const viewOf = (href: string) => (/^\/(room|ledger|stgall|darwin|scan|place)\b/.exec(href)?.[1] ?? '')

async function explore(page: Page, year: number) {
  await page.goto('/atlas')
  await ready(page, 'home')
  await page.locator('#xrange').fill(String(year))
}

test('film paints with a clean console and network', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/')
  await ready(page, 'home')
  await expect(page.locator('#gl')).toBeVisible()
  await expect(page.locator('#achips > *')).toHaveCount(3)
  expect(errors).toEqual([])
})

test('/atlas opens Explore at 2026 with every library and the standing count', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/atlas')
  await ready(page, 'home')
  await expect(page.locator('html')).toHaveClass(/\bexp\b/)
  await expect(page.locator('#xlist button')).toHaveCount(52)
  await expect(page.locator('#xcount')).toHaveText('41 standing · 10 lost (7 rediscovered) · 1 fate unknown')
  await page.keyboard.press('Escape')
  await expect(page.locator('html')).not.toHaveClass(/\bexp\b/)
  expect(new URL(page.url()).pathname).toBe('/')
  expect(errors).toEqual([])
})

test('the year scrubber lists only libraries founded by then', async ({ page }) => {
  const pins = await json<Pin[]>(page, '/lib/pins.json')
  await explore(page, 1500)
  await expect(page.locator('#xlist button')).toHaveCount(pins.filter((p) => p.y <= 1500).length)
  await expect(page.locator('#xlist').getByText(/^Long Room/)).toBeHidden()
})

test('pins carry href as a path or null', async ({ page }) => {
  const pins = await json<Pin[]>(page, '/lib/pins.json')
  expect(pins).toHaveLength(52)
  for (const p of pins) expect(p.href === null || p.href.startsWith('/'), `${p.id} href`).toBe(true)
  const by = Object.fromEntries(pins.map((p) => [p.id, p.href]))
  expect(by['alexandria']).toBe('/ledger/alexandria')
  expect(by['stgallen']).toBe('/stgall')
  expect(by['bodleian']).toBe('/scan/firstfolio')
})

test.describe('cards', () => {
  test.use({ reducedMotion: 'reduce' })
  for (const id of ['longroom', 'celsus', 'alexandria', 'stgallen', 'bodleian', 'nineveh']) {
    test(`card ${id} opens its page`, async ({ page }) => {
      const errors = watchErrors(page)
      await mockIiif(page)
      const pin = (await json<Pin[]>(page, '/lib/pins.json')).find((p) => p.id === id)!
      const href = pin.href ?? `/place/${id}`
      await explore(page, pin.y)
      await page.locator('#xlist').getByText(pin.n, { exact: true }).click()
      const link = page.locator('#xcard a.replay')
      await expect(link).toHaveAttribute('href', href)
      if (!pin.href) await expect(link).toHaveText('Read the record')
      await link.click()
      await page.waitForURL(`**${href}`, { timeout: 15_000 })
      await ready(page, viewOf(href))
      expect(errors).toEqual([])
    })
  }
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('idle canvas is pixel-stable', async ({ page }) => {
    await page.goto('/')
    await ready(page, 'home')
    await page.waitForTimeout(800)
    const a = await page.locator('#gl').screenshot()
    await page.waitForTimeout(500)
    expect((await page.locator('#gl').screenshot()).equals(a)).toBe(true)
  })
})
