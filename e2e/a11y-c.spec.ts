import { expect, test, type Page } from '@playwright/test'
import { tabTo, unnamed } from './iiif'
import { CLEAR, centre, gotoOutside, gotoRoom, mockWeather, openPanel, root, settleIn, shelves, waitWeather } from './util-c'

test.beforeEach(async ({ page }) => {
  await mockWeather(page, CLEAR)
})

const outline = (page: Page) =>
  page.evaluate(() => {
    const s = getComputedStyle(document.activeElement!)
    return { w: parseFloat(s.outlineWidth), style: s.outlineStyle, name: document.activeElement!.getAttribute('aria-label') ?? document.activeElement!.textContent }
  })

async function reachable(page: Page, selector: string) {
  await tabTo(page, selector, 120)
  const o = await outline(page)
  expect((o.name ?? '').trim(), 'accessible name').not.toBe('')
  expect(o.style, 'outline style').not.toBe('none')
  expect(o.w, 'outline width px').toBeGreaterThanOrEqual(2)
  expect(await unnamed(page)).toEqual([])
}

test('a11y-c: Tab reaches Go inside with a visible outline', async ({ page }) => {
  await gotoOutside(page, 'longroom')
  await reachable(page, 'button[data-action="enter"]')
  await expect(page.getByRole('button', { name: 'Go inside', exact: true })).toBeFocused()
})
test('a11y-c: Tab reaches Step outside with a visible outline', async ({ page }) => {
  await gotoRoom(page, 'longroom')
  await reachable(page, 'button[data-action="exit"]')
  await expect(page.getByRole('button', { name: 'Step outside', exact: true })).toBeFocused()
})
test('a11y-c: Tab reaches find buttons with a visible outline', async ({ page }) => {
  await gotoRoom(page, 'longroom')
  await openPanel(page)
  await reachable(page, 'button[data-action="find"]')
})

test('a11y-c: book dialog is modal, labelled, traps Tab and returns focus', async ({ page }) => {
  const s = shelves('longroom')[0]!
  await gotoRoom(page, 'longroom')
  await settleIn(page)
  await openPanel(page)
  const find = page.locator(`ul.room-shelves li[data-shelf="${s.id}"] button[data-action="find"]`)
  await find.click()
  await expect(root(page)).toHaveAttribute('data-book-focus', s.id, { timeout: 6000 })
  const c = await centre(page.locator('[data-view="room"] canvas').first())
  await page.mouse.click(c.x, c.y)
  const dlg = page.locator(`[role="dialog"][data-book="${s.id}"]`)
  await expect(dlg).toBeVisible()
  await expect(dlg).toHaveAttribute('aria-modal', 'true')
  const lab = await dlg.getAttribute('aria-labelledby')
  await expect(page.locator(`[id="${lab}"]`)).toContainText(s.title)
  const within = () => page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')
    expect(await within(), `Tab ${i} stays in dialog`).toBe(true)
  }
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Shift+Tab')
    expect(await within(), `Shift+Tab ${i} stays in dialog`).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(dlg).toBeHidden()
  await expect(find).toBeFocused()
})

const contrast = (page: Page) =>
  page.evaluate(() => {
    const cx = new OffscreenCanvas(1, 1).getContext('2d', { willReadFrequently: true })!
    const rgba = (c: string) => {
      cx.clearRect(0, 0, 1, 1)
      cx.fillStyle = '#000'
      cx.fillStyle = c
      cx.fillRect(0, 0, 1, 1)
      const d = cx.getImageData(0, 0, 1, 1).data
      return [d[0]!, d[1]!, d[2]!, d[3]! / 255]
    }
    const lum = (c: number[]) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
      return 0.2126 * f(c[0]!) + 0.7152 * f(c[1]!) + 0.0722 * f(c[2]!)
    }
    const strip = document.querySelector('[data-local]') as HTMLElement | null
    if (!strip) return { bg: null as number | null, ratios: [] as number[] }
    const bg = rgba(getComputedStyle(strip).backgroundColor)
    const ratios = [...strip.querySelectorAll('[data-local-text], a')].map((el) => {
      const fg = rgba(getComputedStyle(el).color)
      const a = fg[3]!
      const mix = [0, 1, 2].map((i) => fg[i]! * a + bg[i]! * (1 - a))
      const [hi, lo] = [lum(mix), lum(bg)].sort((x, y) => y - x)
      return (hi! + 0.05) / (lo! + 0.05)
    })
    return { bg: bg[3]!, ratios }
  })

for (const [name, go, id] of [['inside', gotoRoom, 'longroom'], ['outside', gotoOutside, 'longroom'], ['site', gotoRoom, 'celsus']] as const) {
  test(`a11y-c: local strip contrast ${name}`, async ({ page }) => {
    await go(page, id)
    await waitWeather(page)
    await expect(page.locator('[data-local]')).toBeVisible()
    const { bg, ratios } = await contrast(page)
    expect(bg, 'opaque background').toBe(1)
    expect(ratios.length).toBeGreaterThanOrEqual(2)
    for (const r of ratios) expect(r).toBeGreaterThanOrEqual(4.5)
  })
}
