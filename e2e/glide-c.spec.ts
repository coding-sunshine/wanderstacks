import { expect, test } from '@playwright/test'
import { CLEAR, gotoRoom, holdKey, mockWeather, root, settleIn, startSampling, stopSampling, tapCanvas, type Sample } from './util-c'

const hz = (a: number[], b: number[]) => Math.hypot(a[0]! - b[0]!, a[2]! - b[2]!)
test.beforeEach(async ({ page }) => {
  await mockWeather(page, CLEAR)
})

async function glideTo(page: import('@playwright/test').Page, fx: number, fy: number) {
  await gotoRoom(page, 'longroom')
  await settleIn(page)
  await startSampling(page)
  await page.waitForTimeout(200)
  await tapCanvas(page, fx, fy)
  await expect(root(page)).toHaveAttribute('data-goal', /\[/, { timeout: 1500 })
  await expect(root(page)).not.toHaveAttribute('data-goal', /.+/, { timeout: 8000 })
  await page.waitForTimeout(200)
  return stopSampling(page)
}

for (const [name, fx, fy] of [['near', 0.5, 0.8], ['far', 0.35, 0.62]] as const) {
  test(`glide-c: floor tap ${name} glides smoothly`, async ({ page }) => {
    const s = await glideTo(page, fx, fy)
    const g = s.findIndex((x) => x.goal)
    expect(g, 'goal was set').toBeGreaterThan(0)
    const goal = s[g]!.goal!
    const end = s.findIndex((x, i) => i > g && !x.goal)
    expect(end).toBeGreaterThan(g)
    const start = s[g - 1]!.cam!
    const target = [goal[0]!, 0, goal[1]!]
    const d = hz(start, target)
    expect(d, 'tap distance').toBeGreaterThan(1.5)
    const glide = s.slice(g - 1, end + 1)
    const ys = glide.map((x) => x.cam![1]!)
    expect(Math.max(...ys) - Math.min(...ys), 'constant y').toBeLessThanOrEqual(0.01)
    const dur = (s[end]!.t - s[g]!.t) / 1000
    expect(dur, 'duration').toBeGreaterThanOrEqual(0.6)
    expect(dur, 'duration').toBeLessThanOrEqual(Math.max(1.2, d / 1.4 + 0.4))
    const t0 = s[g]!.t, t1 = s[end]!.t
    const travelled = (t: number) => { const x = [...glide].reverse().find((q) => q.t <= t) ?? glide[0]!; return hz(start, x.cam!) }
    expect(travelled(t0 + 0.1 * (t1 - t0)), 'first tenth').toBeLessThan(0.1 * d)
    expect(d - travelled(t1 - 0.1 * (t1 - t0)), 'last tenth').toBeLessThan(0.1 * d)
    const rem = glide.map((x) => hz(x.cam!, target))
    for (let i = 1; i < rem.length; i++) expect(rem[i]!, `non-increasing at ${i}`).toBeLessThanOrEqual(rem[i - 1]! + 0.01)
    expect(hz(s[s.length - 1]!.cam!, target), 'ends at goal').toBeLessThanOrEqual(0.15)
  })
}

test('glide-c: keyboard walking keeps constant y', async ({ page }) => {
  await gotoRoom(page, 'longroom')
  await settleIn(page)
  await startSampling(page)
  await holdKey(page, 'w', 1500)
  const s = (await stopSampling(page)).filter((x) => x.cam)
  const ys = s.map((x) => x.cam![1]!)
  expect(hz(s[0]!.cam!, s[s.length - 1]!.cam!), 'walked').toBeGreaterThan(1)
  expect(Math.max(...ys) - Math.min(...ys), 'constant y').toBeLessThanOrEqual(0.01)
})

test('glide-c: W interrupts a glide', async ({ page }) => {
  await gotoRoom(page, 'longroom')
  await settleIn(page)
  await tapCanvas(page, 0.35, 0.62)
  await expect(root(page)).toHaveAttribute('data-goal', /\[/, { timeout: 1500 })
  await page.keyboard.down('w')
  try {
    await expect(root(page)).not.toHaveAttribute('data-goal', /.+/, { timeout: 300 })
  } finally {
    await page.keyboard.up('w')
  }
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('glide-c: reduced motion jumps to the goal', async ({ page }) => {
    await gotoRoom(page, 'longroom')
    await settleIn(page)
    await startSampling(page)
    await page.waitForTimeout(200)
    await tapCanvas(page, 0.35, 0.62)
    await page.waitForTimeout(1500)
    const s: Sample[] = (await stopSampling(page)).filter((x) => x.cam)
    const a = s[0]!.cam!, fin = s[s.length - 1]!.cam!
    expect(hz(a, fin), 'camera moved').toBeGreaterThan(1.5)
    const i = s.findIndex((x) => hz(x.cam!, a) > 0.01)
    expect(i).toBeGreaterThan(0)
    const reach = s.findIndex((x, k) => k >= i && hz(x.cam!, fin) <= 0.15)
    expect(reach - i, 'samples to reach goal').toBeLessThanOrEqual(2)
    await expect(root(page)).not.toHaveAttribute('data-goal', /.+/, { timeout: 500 })
    const goals = s.filter((x) => x.goal)
    if (goals.length) expect(hz(fin, [goals[0]!.goal![0]!, 0, goals[0]!.goal![1]!]), 'camera at the tap point').toBeLessThanOrEqual(0.15)
  })
})
