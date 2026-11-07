import { expect, test, type Page } from '@playwright/test'
import { mockIiif, json } from './iiif'
import { ready, watchErrors } from './util'

type Pin = { id: string; n: string; y: number; href?: string | null }

test.use({ reducedMotion: 'reduce' })

const globe = (page: Page) => page.locator('[data-view="globe"]')
const viewOf = (href: string) => (/^\/(room|ledger|stgall|darwin|scan)\b/.exec(href)?.[1] ?? '')

async function start(page: Page) {
  await mockIiif(page)
  await page.goto('/')
  await expect(globe(page)).toHaveAttribute('data-ready', 'true')
}

test('globe pins: every pin carries href as a path or null', async ({ page }) => {
  const pins = await json<Pin[]>(page, '/lib/pins.json')
  expect(pins.length).toBeGreaterThan(0)
  for (const p of pins) {
    expect('href' in p, `${p.id} has href`).toBe(true)
    expect(p.href === null || (typeof p.href === 'string' && p.href.startsWith('/')), `${p.id} href`).toBe(true)
  }
  const by = Object.fromEntries(pins.map((p) => [p.id, p.href]))
  expect(by['alexandria']).toBe('/ledger/alexandria')
  expect(by['stgallen']).toBe('/stgall')
  expect(by['bodleian']).toBe('/scan/firstfolio')
})

for (const id of ['longroom', 'admont', 'strahov', 'loc', 'celsus', 'alexandria', 'stgallen', 'bodleian']) {
  test(`globe pin ${id}: opens its href`, async ({ page }) => {
    const errors = watchErrors(page)
    const pins = await json<Pin[]>(page, '/lib/pins.json')
    const pin = pins.find((p) => p.id === id)
    expect(pin, `${id} in pins.json`).toBeTruthy()
    expect(pin!.href, `${id} href`).toBeTruthy()
    await start(page)
    await globe(page).getByLabel('Year').fill(String(pin!.y))
    const button = globe(page).getByRole('button', { name: pin!.n, exact: true })
    await expect(button).toBeVisible()
    await button.click()
    await page.waitForURL(`**${pin!.href}`, { timeout: 15_000 })
    await ready(page, viewOf(pin!.href!))
    expect(errors).toEqual([])
  })
}

test('globe pins: a pin without href stays on the globe', async ({ page }) => {
  const errors = watchErrors(page)
  const pins = await json<Pin[]>(page, '/lib/pins.json')
  const dead = pins.filter((p) => p.href === null)
  expect(dead.length, 'pins without a page').toBeGreaterThan(0)
  await start(page)
  const pin = dead[0]!
  await globe(page).getByLabel('Year').fill(String(pin.y))
  await globe(page).getByRole('button', { name: pin.n, exact: true }).click()
  await page.waitForTimeout(1500)
  expect(new URL(page.url()).pathname).toBe('/')
  await expect(globe(page)).toHaveAttribute('data-ready', 'true')
  expect(errors).toEqual([])
})
