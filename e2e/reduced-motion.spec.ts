import { expect, test, type Page } from '@playwright/test'
import { readableIds, ready, watchErrors } from './util'

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

async function settles(page: Page) {
  let prev = await page.screenshot()
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(500)
    const next = await page.screenshot()
    if (next.equals(prev)) return true
    prev = next
  }
  return false
}

const smoothScroll = /lenis|locomotive|smooth-?scroll/i

test('each view enters with fades only, then holds still', async ({ page }) => {
  const errors = watchErrors(page)
  const urls: string[] = []
  page.on('request', (r) => urls.push(r.url()))
  const [book] = await readableIds()
  for (const [path, view] of [['/atlas', 'home'], ['/room/longroom', 'room'], ['/byrne', 'byrne'], [`/read/${book}`, 'reader']]) {
    await page.goto(path)
    await ready(page, view)
    expect(await offenders(page), `${path} animations`).toEqual([])
    expect(await settles(page), `${path} canvas idle`).toBe(true)
  }
  expect(urls.filter((u) => smoothScroll.test(u))).toEqual([])
  expect(errors).toEqual([])
})

test('selecting a library cuts straight to its photograph', async ({ page }) => {
  await page.goto('/atlas')
  await ready(page, 'home')
  await clearLog(page)
  await page.locator('#xlist').getByText(/^Long Room/).click()
  await expect(page.locator('html.visiting #visit img.cur')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  expect(await offenders(page)).toEqual([])
})

test('Byrne reveal cross-fades', async ({ page }) => {
  await page.goto('/byrne')
  await ready(page, 'byrne')
  await clearLog(page)
  await page.locator('[data-view="byrne"] [data-choice]').first().click()
  await page.locator('[data-view="byrne"][data-revealed="true"]').waitFor()
  expect(await offenders(page)).toEqual([])
})
