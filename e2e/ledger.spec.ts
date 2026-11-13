import { expect, test } from '@playwright/test'
import { json } from './iiif'
import { ready, watchErrors } from './util'

type Row = { id: string; class: 'attested' | 'disputed' | 'unknown'; field: string; value: string; source: string; tier: string }
type Ledger = { rows: Row[]; myth: string; correction: string; links: string[] }

test('ledger: three class lists hold every row with its value and source', async ({ page }) => {
  const errors = watchErrors(page)
  const data = await json<Ledger>(page, '/lib/alexandria-ledger.json')
  expect(data.rows.length).toBeGreaterThan(0)
  await page.goto('/ledger/alexandria')
  await ready(page, 'ledger')
  const view = page.locator('[data-view="ledger"]')

  for (const cls of ['attested', 'disputed', 'unknown'] as const) {
    const list = view.locator(`[data-class="${cls}"]`)
    await expect(list, cls).toHaveCount(1)
    await expect(list.getByRole('heading').first(), `${cls} heading`).toBeVisible()
    const want = data.rows.filter((r) => r.class === cls)
    await expect(list.locator('li[data-row]'), cls).toHaveCount(want.length)
    for (const r of want) {
      const li = list.locator(`li[data-row][id="${r.id}"]`)
      await expect(li, r.id).toHaveCount(1)
      await expect(li, r.id).toContainText(r.value)
      await expect(li.locator('a[data-source]'), r.id).toHaveAttribute('href', r.source)
    }
  }
  await expect(view.locator('li[data-row]')).toHaveCount(data.rows.length)
  expect(errors).toEqual([])
})

test('ledger: myth block shows the myth, the correction and a link to each row', async ({ page }) => {
  const errors = watchErrors(page)
  const data = await json<Ledger>(page, '/lib/alexandria-ledger.json')
  expect(data.links.length).toBeGreaterThanOrEqual(3)
  await page.goto('/ledger/alexandria')
  await ready(page, 'ledger')
  const myth = page.locator('[data-myth]')
  await expect(myth).toBeVisible()
  await expect(myth).toContainText(data.myth)
  await expect(myth).toContainText(data.correction)
  for (const id of data.links) {
    expect(data.rows.some((r) => r.id === id), `link ${id} is a row`).toBe(true)
    const a = myth.locator(`a[href="#${id}"]`)
    await expect(a, id).toHaveCount(1)
    await a.click()
    await expect(page.locator(`li[data-row][id="${id}"]`), id).toBeInViewport()
  }
  expect(errors).toEqual([])
})

test('ledger: unknown library says Not on any shelf with no console error', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/ledger/nowhere-at-all')
  await expect(page.getByText('Not on any shelf')).toBeVisible()
  await expect(page.locator('[data-view="ledger"] li[data-row]')).toHaveCount(0)
  const unexpected = errors.filter((error) => !error.startsWith('404:') && !error.includes('404 (Not Found)'))
  expect(unexpected, 'only the expected HTTP 404 is allowed').toEqual([])
})
