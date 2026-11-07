import { expect, test } from '@playwright/test'
import { watchErrors } from './util'

const TRINITY = ['gulliver-se', 'vicar-se', 'dracula-se', 'dorian-se', 'playboy-se']

for (const id of TRINITY) {
  test(`read ${id} to the last page and close`, async ({ page }) => {
    test.setTimeout(120_000)
    const errors = watchErrors(page)
    await page.goto(`/read/${id}`)
    const reader = page.locator('[data-view="reader"][data-ready="true"]')
    await expect(reader).toBeVisible()
    const status = reader.locator('.rd-status')
    await expect(status).toHaveText(/^Page 1 of \d+/)
    await expect(reader.locator('.rd-licence')).toContainText(/\S/)

    await reader.getByRole('button', { name: 'End' }).click()
    await expect(status).toHaveText(/^Page (\d+) of \1$/, { timeout: 90_000 })
    const m = /Page (\d+) of/.exec((await status.textContent()) ?? '')
    expect(Number(m![1])).toBeGreaterThan(1)

    await reader.getByRole('button', { name: 'Close' }).click()
    await expect(page.locator('[data-view="reader"]')).toHaveCount(0)
    expect(errors).toEqual([])
  })
}
