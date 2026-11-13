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

test('atlas opens neutral: globe, every library listed, none selected', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/atlas')
  await ready(page, 'home')
  await expect(page.locator('#gl')).toBeVisible()
  await expect(page.locator('#achips > *')).toHaveCount(3)
  await expect(page.locator('#xlist button')).toHaveCount(52)
  await expect(page.locator('#xlist button[aria-pressed="true"]')).toHaveCount(0)
  await expect(page.locator('#xcard')).toBeEmpty()
  await expect(page.locator('#xcount')).toHaveText('41 standing · 10 lost (7 rediscovered) · 1 fate unknown')
  expect(new URL(page.url()).pathname).toBe('/atlas')
  expect(errors).toEqual([])
})

test('site nav names no single library or book', async ({ page }) => {
  await page.goto('/shelf')
  expect(await page.locator('header.bar nav a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(['/libraries/', '/books/', '/visit/', '/atlas/', '/shelf/'])
})

test('selecting deep-links to /atlas/<id> and Escape returns to the list', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/atlas')
  await ready(page, 'home')
  await page.locator('#xlist').getByText(/^Duke Humfrey/).click()
  await expect(page.locator('#xcard h2')).toHaveText(/Bodleian/)
  expect(new URL(page.url()).pathname).toBe('/atlas/bodleian')
  await page.keyboard.press('Escape')
  await expect(page.locator('#xcard')).toBeEmpty()
  expect(new URL(page.url()).pathname).toBe('/atlas')
  expect(errors).toEqual([])
})

test('a deep link opens its card with only page-turn reads', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/atlas/bodleian')
  await ready(page, 'home')
  await expect(page.locator('#xcard h2')).toHaveText(/Bodleian/)
  const hrefs = await page.locator('#xcard .reads a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
  expect(hrefs).toEqual(['/scan/mendoza', '/scan/firstfolio'])
  await page.locator('#xback').click()
  await expect(page.locator('#xlist button')).toHaveCount(52)
  expect(new URL(page.url()).pathname).toBe('/atlas')
  expect(errors).toEqual([])
})

test('selecting a library lands outside it on real photographs, then inside', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/atlas')
  await ready(page, 'home')
  await page.locator('#xlist').getByText(/^Long Room/).click()
  const cur = page.locator('html.visiting #visit img.cur')
  await expect(cur).toBeVisible({ timeout: 5000 })
  expect(await cur.evaluate((i: HTMLImageElement) => i.currentSrc)).toMatch(/\/photo\/longroom\/o0-(960|1920)\.webp$/)
  await expect(page.locator('#visit figcaption a')).toHaveAttribute('href', /^https:\/\/commons\.wikimedia\.org\//)
  expect(new URL(page.url()).pathname).toBe('/atlas/longroom')

  await page.locator('#xcard').getByRole('button', { name: 'Step inside' }).click()
  await expect(page.locator('#xcard').getByRole('button', { name: 'Step outside' })).toBeVisible()
  await expect.poll(() => cur.evaluate((i: HTMLImageElement) => i.currentSrc)).toMatch(/\/photo\/longroom\/i0-/)
  await expect(page.locator('#xcard .vcount')).toHaveText(/^1 \/ \d+$/)
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('#xcard .vcount')).toHaveText(/^2 \/ \d+$/)
  await expect.poll(() => cur.evaluate((i: HTMLImageElement) => i.currentSrc)).toMatch(/\/photo\/longroom\/i1-/)

  await page.keyboard.press('Escape')
  await expect(page.locator('html.visiting')).toHaveCount(0)
  await expect(page.locator('#xcard')).toBeEmpty()
  expect(errors).toEqual([])
})

test('every library photo on the atlas is a licensed Commons file served locally', async ({ page }) => {
  const pins = await json<(Pin & { ph?: Record<'out' | 'in', { f: string; src: string; lic: string; by: string }[]> })[]>(page, '/lib/pins.json')
  const shots = pins.flatMap((p) => (p.ph ? [...p.ph.out, ...p.ph.in].map((s) => ({ id: p.id, ...s })) : []))
  expect(shots.length, 'photos on the atlas').toBeGreaterThan(40)
  for (const s of shots) {
    expect(s.f, `${s.id} path`).toMatch(new RegExp(`^/photo/${s.id}/[oi]\\d+$`))
    expect(s.src, `${s.id} source`).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/)
    expect(s.lic, `${s.id} licence`).not.toMatch(/\b(NC|ND)\b/i)
    expect(s.by.length, `${s.id} author`).toBeGreaterThan(0)
    for (const w of [960, 1920]) expect((await page.request.head(`${s.f}-${w}.webp`)).status(), `${s.f}-${w}`).toBe(200)
  }
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
  expect(by['bodleian']).toBeNull()
  for (const p of pins as (Pin & { reads: { href: string }[] })[])
    for (const r of p.reads) expect(/^\/(read|scan)\/|^https:\/\/.+(?<!\.json)$/.test(r.href), `${p.id} read ${r.href}`).toBe(true)
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
    await page.goto('/atlas')
    await ready(page, 'home')
    await page.waitForTimeout(800)
    const a = await page.locator('#gl').screenshot()
    await page.waitForTimeout(500)
    expect((await page.locator('#gl').screenshot()).equals(a)).toBe(true)
  })
})
