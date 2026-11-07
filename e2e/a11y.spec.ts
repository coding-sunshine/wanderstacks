import { expect, test } from '@playwright/test'
import { watchErrors } from './util'

const open = async (page: import('@playwright/test').Page) => {
  await page.goto('/read/modest-proposal')
  const reader = page.locator('[data-view="reader"][data-ready="true"]')
  await expect(reader).toBeVisible()
  return reader.locator('.rd-status')
}

test('arrow keys turn pages', async ({ page }) => {
  const errors = watchErrors(page)
  const status = await open(page)
  await expect(status).toHaveText(/^Page 1 of/)
  await page.keyboard.press('ArrowRight')
  await expect(status).toHaveText(/^Page [2-9]/)
  await page.keyboard.press('ArrowLeft')
  await expect(status).toHaveText(/^Page 1 of/)
  expect(errors).toEqual([])
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('page turn is an opacity fade of 200 ms or less', async ({ page }) => {
    const status = await open(page)
    await page.evaluate(() => {
      const seen: { d: number; props: string[] }[] = []
      ;(window as any).__anims = seen
      const t = setInterval(() => {
        for (const a of document.getAnimations()) {
          const fx = a.effect as KeyframeEffect
          seen.push({
            d: Number(fx.getTiming().duration),
            props: [...new Set(fx.getKeyframes().flatMap((k) => Object.keys(k)))].filter(
              (k) => !['offset', 'easing', 'composite', 'computedOffset'].includes(k),
            ),
          })
        }
      }, 10)
      ;(window as any).__stop = () => clearInterval(t)
    })
    await page.keyboard.press('ArrowRight')
    await expect(status).toHaveText(/^Page 2/)
    await page.waitForTimeout(400)
    const seen = await page.evaluate(() => (window as any).__anims as { d: number; props: string[] }[])
    expect(seen.length).toBeGreaterThan(0)
    for (const a of seen) {
      expect(a.d).toBeLessThanOrEqual(200)
      expect(a.props).toEqual(['opacity'])
    }
  })
})
