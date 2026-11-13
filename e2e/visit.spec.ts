import { expect, test } from '@playwright/test'

const open = async (page: import('@playwright/test').Page) => {
  await page.goto('/visit/')
  await expect(page.locator('.coverage > li')).toHaveCount(52)
}

test('coverage distinguishes real captures, linked tours, and missing interiors', async ({ page }) => {
  await open(page)
  await expect(page.locator('.summary dd').nth(0)).toHaveText('52')
  await expect(page.locator('.summary dd').nth(1)).toHaveText('3')
  await expect(page.locator('.summary dd').nth(2)).toHaveText('3')
  await expect(page.locator('#visit-weimar .library .stamp')).toHaveText('Real interior 360')
  await expect(page.locator('#visit-peabody .assets')).toContainText('Peabody 360')
  await expect(page.locator('#visit-peabody .assets')).toContainText('external, view only')
  await expect(page.locator('#visit-slv .assets')).toContainText('CC BY-NC-SA 4.0')
})

test('capture filters and rights-aware contribution links work', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Interior 360', exact: true }).click()
  await expect(page.locator('.coverage > li:visible')).toHaveCount(3)
  await expect(page.locator('#visit-weimar')).toBeVisible()
  await expect(page.locator('#visit-longroom')).toBeHidden()

  await page.getByRole('button', { name: 'Needs interior capture', exact: true }).click()
  await expect(page.locator('.coverage > li:visible')).toHaveCount(49)
  const mission = page.locator('#visit-peabody .mission a')
  await expect(mission).toHaveAttribute('href', /github\.com\/coding-sunshine\/worldlibs\/issues\/new/)
  await expect(mission).toHaveAttribute('href', /Capture%20contribution/)
  await expect(mission).toHaveAttribute('target', '_blank')

  await page.getByRole('button', { name: 'Needs catalogue links', exact: true }).click()
  await expect(page.locator('.coverage > li:visible')).toHaveCount(15)
  await expect(page.locator('#visit-binhai .mission a[href="/libraries/binhai/#record"]')).toHaveCount(1)
})

test('Peabody page exposes its official interior tour without implying reuse rights', async ({ page }) => {
  await page.goto('/libraries/peabody/#official-tours')
  const section = page.locator('#official-tours')
  await expect(section).toContainText('Peabody 360: high-resolution interior tour')
  await expect(section).toContainText('Johns Hopkins Sheridan Libraries')
  await expect(section).toContainText('no reuse licence')
  await expect(section.getByRole('link', { name: /Peabody 360/ })).toHaveAttribute('href', 'https://www.library.jhu.edu/library-hours/george-peabody-library/')
})
