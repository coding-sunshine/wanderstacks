import { expect, test, type Locator } from '@playwright/test'
import { basisLabel, diffShare, loadLib, openRoom, params, settle } from './iiif'
import { roomIds, watchErrors } from './util'

test.use({ reducedMotion: 'reduce' })

const info = (root: Locator) => root.locator('[data-element-info]')

for (const room of roomIds()) {
  test(`${room}: Evidence tints by basis, lists elements, shows basis and source, and restores`, async ({ page }) => {
    const errors = watchErrors(page)
    const lib = await loadLib(page, room)
    const hall = params(lib)
    const root = await openRoom(page, room)
    const canvas = root.locator('canvas')
    const btn = root.locator('.room-controls button[data-action="evidence"]')

    await expect(btn).toHaveAccessibleName('Evidence')
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
    await expect(root).toHaveAttribute('data-evidence', 'off')
    await expect(root.locator('[data-legend]:visible')).toHaveCount(0)
    await expect(root.locator('[data-element-info]:visible')).toHaveCount(0)

    await page.mouse.move(0, 0)
    const before = await settle(canvas)

    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    await expect(root).toHaveAttribute('data-evidence', 'on')
    await page.mouse.move(0, 0)
    const tinted = await settle(canvas)
    expect(await diffShare(page, before, tinted), 'canvas changes when tinted').toBeGreaterThan(0.05)

    const bases = [...new Set(Object.values(hall).map((p) => p.basis))].sort()
    const legend = root.locator('[data-legend]')
    await expect(legend).toBeVisible()
    const shown = await legend.locator('li[data-basis]').evaluateAll((els) => els.map((e) => e.getAttribute('data-basis')!).sort())
    expect(shown, 'legend lists exactly the bases in lib.hall').toEqual(bases)

    const keys = await root.locator('button[data-element]').evaluateAll((els) => els.map((e) => e.getAttribute('data-element')!))
    expect(keys.length, 'element buttons').toBeGreaterThan(0)
    for (const k of keys) expect(Object.keys(hall), `element ${k} is a hall param`).toContain(k)

    const box = (await canvas.boundingBox())!
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await expect(info(root)).toBeVisible()
    expect(bases).toContain(await info(root).getAttribute('data-basis'))

    for (const k of keys) {
      const p = hall[k]!
      await root.locator(`button[data-element="${k}"]`).click()
      const i = info(root)
      await expect(i, k).toBeVisible()
      await expect(i, k).toHaveAttribute('data-basis', p.basis)
      const label = basisLabel(p)
      if (label) await expect(i, k).toContainText(label)
      if (typeof p.v === 'number' || typeof p.v === 'string') await expect(i, k).toContainText(String(p.v))
      const link = i.locator('a[href]')
      if (p.src.startsWith('http')) await expect(link.first(), k).toHaveAttribute('href', p.src)
    }

    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
    await expect(root).toHaveAttribute('data-evidence', 'off')
    await expect(root.locator('[data-legend]:visible')).toHaveCount(0)
    await expect(root.locator('[data-element-info]:visible')).toHaveCount(0)
    await page.mouse.move(0, 0)
    const after = await settle(canvas)
    expect(await diffShare(page, before, after), 'canvas restored within noise').toBeLessThan(0.02)

    expect(errors).toEqual([])
  })
}
