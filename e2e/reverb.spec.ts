import { expect, test } from '@playwright/test'
import { openRoom } from './iiif'
import { roomIds, watchErrors } from './util'

type Spy = { contexts: number; convolvers: number; buffers: { duration: number; head: number; tail: number }[] }

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const spy: Spy = ((window as any).__audio = { contexts: 0, convolvers: 0, buffers: [] })
    const note = (node: ConvolverNode) => {
      spy.convolvers++
      ;(window as any).__convolver = node
    }
    for (const name of ['AudioContext', 'webkitAudioContext'] as const) {
      const Orig = (window as any)[name]
      if (!Orig) continue
      ;(window as any)[name] = new Proxy(Orig, {
        construct(t, args, nt) {
          spy.contexts++
          return Reflect.construct(t, args, nt)
        },
      })
    }
    const make = BaseAudioContext.prototype.createConvolver
    BaseAudioContext.prototype.createConvolver = function () {
      const n = make.call(this)
      note(n)
      return n
    }
    const Conv = window.ConvolverNode
    ;(window as any).ConvolverNode = new Proxy(Conv, {
      construct(t, args, nt) {
        const n = Reflect.construct(t, args, nt)
        note(n)
        return n
      },
    })
  })
})

const spy = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const s = (window as any).__audio as Spy
    const c = (window as any).__convolver as ConvolverNode | undefined
    const b = c?.buffer
    let head = 0
    let tail = 0
    if (b) {
      const d = b.getChannelData(0)
      const n = Math.max(1, Math.floor(d.length * 0.05))
      const rms = (from: number) => Math.sqrt(d.slice(from, from + n).reduce((a, x) => a + x * x, 0) / n)
      head = rms(0)
      tail = rms(d.length - n)
    }
    return { contexts: s.contexts, convolvers: s.convolvers, duration: b?.duration ?? 0, head, tail }
  })

for (const room of roomIds()) {
  test(`${room}: Sound is off until asked, then one convolver from a Sabine RT60`, async ({ page }) => {
    const errors = watchErrors(page)
    const media: string[] = []
    page.on('request', (r) => /\.(mp3|wav|ogg|m4a|flac|aac|opus)(\?|$)/i.test(r.url()) && media.push(r.url()))
    const root = await openRoom(page, room)
    const sound = root.locator('.room-controls button[data-action="sound"]')

    await expect(sound).toHaveAccessibleName('Sound')
    await expect(sound).toHaveAttribute('aria-pressed', 'false')
    expect((await spy(page)).contexts, 'no AudioContext before the first click').toBe(0)

    const rt60 = Number(await root.getAttribute('data-rt60'))
    const { volume, absorption } = JSON.parse((await root.getAttribute('data-acoustics')) ?? 'null') as { volume: number; absorption: number }
    expect(volume).toBeGreaterThan(0)
    expect(absorption).toBeGreaterThan(0)
    expect(rt60).toBeGreaterThan(0)
    const sabine = (0.161 * volume) / absorption
    expect(Math.abs(rt60 - sabine) / rt60, `rt60 ${rt60} vs Sabine ${sabine}`).toBeLessThanOrEqual(0.01)

    const row = page.locator('[data-param="rt60"]')
    await expect(row).toHaveCount(1)
    await expect(row.locator('.basis')).toHaveText('estimated')
    await expect(row).toContainText(rt60.toFixed(1).replace(/\.0$/, ''))

    await sound.click()
    await expect(sound).toHaveAttribute('aria-pressed', 'true')
    const on = await spy(page)
    expect(on.contexts, 'one AudioContext').toBe(1)
    expect(on.convolvers, 'one ConvolverNode').toBe(1)
    expect(on.duration, 'impulse response lasts about rt60').toBeGreaterThanOrEqual(rt60 * 0.9)
    expect(on.duration).toBeLessThanOrEqual(rt60 * 3)
    expect(on.head / on.tail, 'impulse response decays by 34 dB or more').toBeGreaterThan(50)

    await sound.click()
    await expect(sound).toHaveAttribute('aria-pressed', 'false')
    await sound.click()
    await expect(sound).toHaveAttribute('aria-pressed', 'true')
    const again = await spy(page)
    expect(again.contexts).toBe(1)
    expect(again.convolvers).toBe(1)
    expect(media, 'no audio files requested').toEqual([])
    expect(errors).toEqual([])
  })
}
