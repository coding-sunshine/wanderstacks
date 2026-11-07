import { test, expect } from '@playwright/test'
import { watchErrors } from './util'

test.use({ launchOptions: { args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] } })

test('walking the hall keeps p95 frame time at or under 20 ms', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/room/longroom')
  await page.waitForSelector('[data-view=room][data-ready=true]')
  await page.waitForFunction(() => performance.getEntriesByName('room:door-open').length > 0)
  await page.waitForTimeout(2500)

  await page.evaluate(() => {
    const d: number[] = []
    let last = performance.now()
    const tick = (t: number) => { d.push(t - last); last = t; requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
    ;(window as unknown as { __dt: number[] }).__dt = d
  })
  await page.mouse.move(400, 400)
  await page.keyboard.down('w')
  await page.waitForTimeout(2500)
  await page.keyboard.up('w')
  await page.keyboard.down('ArrowLeft')
  await page.keyboard.down('ArrowUp')
  await page.waitForTimeout(1500)
  await page.keyboard.up('ArrowUp')
  await page.keyboard.up('ArrowLeft')

  const { dt, gpu, calls } = await page.evaluate(() => {
    const g = document.createElement('canvas').getContext('webgl')!
    const e = g.getExtension('WEBGL_debug_renderer_info')
    return {
      dt: (window as unknown as { __dt: number[] }).__dt,
      gpu: e ? String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)) : 'unknown',
      calls: Number(document.querySelector<HTMLElement>('.room')!.dataset.calls),
    }
  })
  const s = [...dt].sort((a, b) => a - b)
  const p95 = s[Math.floor(s.length * 0.95)]
  console.log(`frame-time gpu="${gpu}" frames=${s.length} p95=${p95.toFixed(1)}ms calls=${calls}`)
  expect(s.length).toBeGreaterThan(60)
  expect(p95).toBeLessThanOrEqual(20)
  expect(calls).toBeLessThan(200)
  expect(errors).toEqual([])
})
