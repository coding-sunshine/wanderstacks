import { expect, test, type Page } from '@playwright/test'
import { BUILDINGS, CLEAR, centre, gotoRoom, mockWeather, openPanel, root, shelves, type Shelf } from './util-c'

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
test.beforeEach(async ({ page }) => {
  await mockWeather(page, CLEAR)
})

for (const id of BUILDINGS) {
  test(`books-index: ${id}`, async ({ page }) => {
    const list = shelves(id)
    await gotoRoom(page, id)
    await openPanel(page)
    const items = page.locator('ul.room-shelves li')
    await expect(items).toHaveCount(list.length)
    for (const [i, s] of list.entries()) {
      await expect(items.nth(i).locator('button[data-action="find"]')).toHaveAccessibleName(new RegExp(esc(s.title)))
      await expect(items.nth(i)).toContainText(s.title)
    }
    await expect(root(page)).toHaveAttribute('data-spines', String(list.length))
  })
}

async function pull(page: Page, id: string, s: Shelf, closeWith: 'Escape' | 'Put back') {
  await gotoRoom(page, id)
  await page.waitForTimeout(2600)
  await openPanel(page)
  const find = page.locator(`ul.room-shelves li[data-shelf="${s.id}"] button[data-action="find"]`)
  await find.click()
  await expect(root(page)).toHaveAttribute('data-book-focus', s.id)
  await expect(root(page)).toHaveAttribute('data-book-focus', s.id, { timeout: 6000 })
  const c = await centre(page.locator('[data-view="room"] canvas').first())
  await page.mouse.move(c.x - 2, c.y - 2)
  await page.mouse.move(c.x, c.y)
  await expect(page.locator('[data-spine-title]')).toBeVisible()
  await expect(page.locator('[data-spine-title]')).toContainText(s.title)
  await page.mouse.click(c.x, c.y)
  const dlg = page.locator(`[role="dialog"][data-book="${s.id}"]`)
  await expect(dlg).toBeVisible()
  await expect(dlg).toHaveAttribute('aria-modal', 'true')
  const lab = await dlg.getAttribute('aria-labelledby')
  expect(lab, 'aria-labelledby').toBeTruthy()
  await expect(page.locator(`[id="${lab}"]`)).toContainText(s.title)
  await expect(root(page)).toHaveAttribute('data-book-pulled', s.id)
  await expect(dlg.locator(`a[href="/read/${s.id}"]`)).toHaveCount(s.tier === 'readable-text' ? 1 : 0)
  if (closeWith === 'Escape') await page.keyboard.press('Escape')
  else await dlg.getByRole('button', { name: 'Put back' }).click()
  await expect(dlg).toBeHidden()
  await expect(root(page)).not.toHaveAttribute('data-book-pulled', /.+/)
  await expect(find).toBeFocused()
}

const lr = shelves('longroom')
const picks: [string, Shelf, 'Escape' | 'Put back'][] = [
  ['longroom', lr.find((s) => s.tier === 'readable-text')!, 'Put back'],
  ['longroom', lr.find((s) => s.tier !== 'readable-text')!, 'Escape'],
  ...(['admont', 'strahov', 'loc'] as const).map((id) => [id, shelves(id)[0]!, 'Escape'] as [string, Shelf, 'Escape']),
]
for (const [id, s, how] of picks) test(`books-pull: ${id} ${s.id} closed by ${how}`, ({ page }) => pull(page, id, s, how))
