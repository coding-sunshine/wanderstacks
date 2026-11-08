import { test } from '@playwright/test'
import { watchErrors } from './util'
import { roomIdsD } from './util-d'

for (const room of roomIdsD()) {
  for (const rate of [1, 4]) {
    test(`d-room-gen-time: ${room} @${rate}x bay 0 is built before the door opens`, async ({ page }) => {
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
      if (m.bay0 === undefined || m.open === undefined || m.start === undefined) throw new Error(`room marks missing: ${JSON.stringify(m)}`)
      if (!(m.bay0 < m.open)) throw new Error(`bay0 ${m.bay0} not before door-open ${m.open}`)
      console.log(`room-gen-d ${room} ${rate}x bay0=${Math.round(m.bay0 - m.start)}ms door-open=${Math.round(m.open - m.start)}ms`)
      if (errors.length) throw new Error(errors.join('\n'))
    })
  }
}
