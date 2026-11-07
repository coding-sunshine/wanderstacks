import { expect, test, type Page } from '@playwright/test'
import { mockIiif, openRoom, settle } from './iiif'
import { ready, roomIds, watchErrors } from './util'

test.use({ reducedMotion: 'reduce' })

// Chrome's view-transition cross-fade pairs each opacity fade with a mix-blend-mode keyframe.
const ALLOWED = new Set(['opacity', 'mixBlendMode'])
const MAX_MS = 200

type Seen = { label: string; ms: number; props: string[] }

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const seen = new WeakSet<Animation>()
    const log: Seen[] = ((window as any).__anims = [])
    const record = (a: Animation) => {
      if (seen.has(a)) return
      seen.add(a)
      const effect = a.effect as KeyframeEffect | null
      const props = new Set<string>()
      for (const k of effect?.getKeyframes() ?? [])
        for (const p of Object.keys(k)) if (!['offset', 'computedOffset', 'easing', 'composite'].includes(p)) props.add(p)
      const target = effect?.target
      const label = (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? `${target?.nodeName ?? '?'}${effect?.pseudoElement ?? ''}`
      log.push({ label, ms: Number(effect?.getComputedTiming().activeDuration), props: [...props] })
    }
    const animate = Element.prototype.animate
    Element.prototype.animate = function (...args) {
      const a = animate.apply(this, args)
      record(a)
      return a
    }
    const tick = () => {
      document.getAnimations().forEach(record)
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
})

const offenders = async (page: Page) => {
  await page.waitForTimeout(1000)
  const all: Seen[] = await page.evaluate(() => (window as any).__anims)
  return all.filter((a) => !(a.ms <= MAX_MS) || a.props.some((p) => !ALLOWED.has(p)))
}
const clearLog = (page: Page) => page.evaluate(() => ((window as any).__anims.length = 0))

const stops: [string, string][] = [
  ['/ledger/alexandria', 'ledger'],
  ['/stgall', 'stgall'],
  ['/darwin', 'darwin'],
  ['/scan/firstfolio', 'scan'],
  ...roomIds().map((id): [string, string] => [`/room/${id}`, 'room']),
]

test('each Phase B view enters with fades only, then holds still', async ({ page }) => {
  test.setTimeout(240_000)
  const errors = watchErrors(page)
  await mockIiif(page)
  for (const [path, view] of stops) {
    await page.goto(path)
    await ready(page, view)
    expect(await offenders(page), `${path} animations`).toEqual([])
    const target = page.locator(`[data-view="${view}"] canvas`)
    await settle((await target.count()) ? target.first() : page)
  }
  expect(errors).toEqual([])
})

test('living page reveal is a short fade, not a stroke draw', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/darwin')
  await ready(page, 'darwin')
  await clearLog(page)
  await page.locator('[data-view="darwin"] [data-choice]').first().click()
  await expect(page.locator('[data-view="darwin"][data-revealed="true"]')).toBeAttached({ timeout: 10_000 })
  expect(await offenders(page)).toEqual([])
  expect(errors).toEqual([])
})

test('scan page turn and zoom open are fades only', async ({ page }) => {
  const errors = watchErrors(page)
  await mockIiif(page)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/scan/firstfolio')
  await ready(page, 'scan')
  await clearLog(page)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('+')
  await expect(page.locator('dialog[data-zoom]')).toBeVisible()
  await page.keyboard.press('Escape')
  expect(await offenders(page)).toEqual([])
  expect(errors).toEqual([])
})

test('room controls cut instead of flying: evidence, tour and sound add no long motion', async ({ page }) => {
  const errors = watchErrors(page)
  const root = await openRoom(page, 'longroom')
  await clearLog(page)
  const controls = root.locator('.room-controls')
  await controls.locator('button[data-action="evidence"]').click()
  await controls.locator('button[data-action="tour"]').click()
  await root.locator('[data-tour-next]').click()
  await page.keyboard.press('Escape')
  await controls.locator('button[data-action="sound"]').click()
  expect(await offenders(page)).toEqual([])
  const a = await settle(root.locator('canvas'))
  await page.waitForTimeout(500)
  expect((await root.locator('canvas').screenshot()).equals(a), 'canvas idle after controls').toBe(true)
  expect(errors).toEqual([])
})
