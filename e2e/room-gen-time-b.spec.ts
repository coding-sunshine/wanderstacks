import { expect, test } from '@playwright/test'
import { roomIds, watchErrors } from './util'

for (const room of roomIds()) {
  for (const rate of [1, 4]) {
    test(`${room} @${rate}x: bay 0 is built before the door opens`, async ({ page }) => {
      test.setTimeout(120_000)
      const errors = watchErrors(page)
      if (rate > 1) {
        const cdp = await page.context().newCDPSession(page)
        await cdp.send('Emulation.setCPUThrottlingRate', { rate })
      }
      await page.goto(`/room/${room}`)
      await page.waitForSelector('[data-view=room][data-ready=true]', { timeout: 45_000 })
      const m = await page.evaluate(() => {
        const t = (n: string) => performance.getEntriesByName(n)[0]?.startTime
        return { start: t('room:start'), bay0: t('room:bay0'), open: t('room:door-open') }
      })
      expect(m.start).toBeDefined()
      expect(m.bay0).toBeDefined()
      expect(m.open).toBeDefined()
      expect(m.bay0!).toBeLessThan(m.open!)
      console.log(`room-gen-b ${room} ${rate}x bay0=${Math.round(m.bay0! - m.start!)}ms door-open=${Math.round(m.open! - m.start!)}ms`)
      expect(errors).toEqual([])
    })
  }
}
