import { test, expect } from '@playwright/test'
import { watchErrors } from './util'

for (const rate of [1, 4]) {
  test(`room builds bay 0 before the door opens (${rate}x cpu)`, async ({ page }) => {
    const errors = watchErrors(page)
    if (rate > 1) {
      const cdp = await page.context().newCDPSession(page)
      await cdp.send('Emulation.setCPUThrottlingRate', { rate })
    }
    await page.goto('/room/longroom')
    await page.waitForSelector('[data-view=room][data-ready=true]', { timeout: 45_000 })
    const m = await page.evaluate(() => {
      const t = (n: string) => performance.getEntriesByName(n)[0]?.startTime
      return { start: t('room:start'), bay0: t('room:bay0'), open: t('room:door-open') }
    })
    expect(m.bay0).toBeDefined()
    expect(m.open).toBeDefined()
    expect(m.bay0).toBeLessThan(m.open)
    console.log(`room-gen ${rate}x bay0=${Math.round(m.bay0 - m.start)}ms door-open=${Math.round(m.open - m.start)}ms`)
    expect(errors).toEqual([])
  })
}
