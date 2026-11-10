import { expect, test, type Page } from '@playwright/test'
import { BUILDINGS, CLEAR, POLY, exterior, gotoOutside, gotoRoom, hd, holdKey, holdUntil, inside, jattr, mockWeather, root, settleIn, startSampling, stopSampling, textures, type Room } from './util-c'

const dist = (c: number[], d: number[]) => Math.hypot(c[0]! - d[0]!, c[2]! - d[1]!)
const pathLen = (cs: number[][]) => cs.slice(1).reduce((s, c, i) => s + Math.hypot(c[0]! - cs[i]![0]!, c[2]! - cs[i]![2]!), 0)
const shrunk = (fp: number[]) => [fp[0]! + 0.2, fp[1]! + 0.2, fp[2]! - 0.2, fp[3]! - 0.2]
const hist = (page: Page) => page.evaluate(() => ({ href: location.href, len: history.length }))

test.beforeEach(async ({ page }) => {
  await mockWeather(page, CLEAR)
})

for (const id of BUILDINGS) {
  test(`enter-exit: ${id}`, async ({ page }) => {
    await gotoOutside(page, id)
    const r = root(page)
    await expect(r).toHaveAttribute('data-place', 'outside')
    const before = await hist(page)
    await page.getByRole('button', { name: 'Go inside', exact: true }).click()
    await expect(r).toHaveAttribute('data-place', 'inside', { timeout: 2500 })
    expect(await hist(page)).toEqual(before)
    await page.reload()
    await expect(r).toHaveAttribute('data-ready', 'true', { timeout: 30_000 })
    await expect(r).toHaveAttribute('data-place', 'inside')
    await page.getByRole('button', { name: 'Step outside', exact: true }).click()
    await expect(r).toHaveAttribute('data-place', 'outside', { timeout: 2500 })
    expect(await hist(page)).toEqual(before)
    await page.reload()
    await expect(r).toHaveAttribute('data-ready', 'true', { timeout: 30_000 })
    await expect(r).toHaveAttribute('data-place', 'outside')
  })
}

for (const id of BUILDINGS) {
  test(`direct-inside: ${id}`, async ({ page }) => {
    await gotoRoom(page, id)
    await expect(root(page)).toHaveAttribute('data-place', 'inside')
    await expect(page.getByRole('button', { name: 'Step outside', exact: true })).toBeVisible()
  })
}
test('direct-inside: celsus is a site', async ({ page }) => {
  await gotoRoom(page, 'celsus')
  await expect(root(page)).toHaveAttribute('data-place', 'site')
})

for (const id of BUILDINGS) {
  test(`spawn-pose: ${id}`, async ({ page }) => {
    await gotoOutside(page, id)
    const r = root(page)
    await expect(r).toHaveAttribute('data-place', 'outside')
    const cam = (await jattr(page, 'camera'))!, door = (await jattr(page, 'door'))!, fp = (await jattr(page, 'footprint'))!
    expect(door, 'data-door').toHaveLength(2)
    expect(fp, 'data-footprint').toHaveLength(4)
    const d = dist(cam, door)
    expect(d, 'spawn distance').toBeGreaterThanOrEqual(8)
    expect(d, 'spawn distance').toBeLessThanOrEqual(35)
    const want = (Math.atan2(-(door[0]! - cam[0]!), -(door[1]! - cam[2]!)) * 180) / Math.PI
    const yaw = Number(await r.getAttribute('data-yaw'))
    expect(Math.abs((((yaw - want) % 360) + 540) % 360 - 180), `yaw ${yaw} want ${want}`).toBeLessThanOrEqual(5)
    expect(inside(cam, fp), 'spawn outside footprint').toBe(false)
  })
}

for (const id of BUILDINGS) {
  test(`door-walk: ${id}`, async ({ page }) => {
    test.setTimeout(90_000)
    await gotoOutside(page, id)
    await settleIn(page)
    const r = root(page)
    const cam0 = await jattr(page, 'camera'), door = await jattr(page, 'door'), fp = await jattr(page, 'footprint')
    expect(door, 'data-door present').not.toBeNull()
    expect(fp, 'data-footprint present').not.toBeNull()
    expect(cam0, 'data-camera present').not.toBeNull()
    const d0 = dist(cam0!, door!)
    await startSampling(page)
    const got = await holdUntil(page, 'w', async () => (await r.getAttribute('data-place')) === 'inside', 30_000)
    const s = await stopSampling(page)
    expect(got, 'reached inside within 30 s').toBe(true)
    const out = s.filter((x) => x.place === 'outside' && x.cam).map((x) => x.cam!)
    expect(out.length, 'outside samples').toBeGreaterThan(5)
    expect(pathLen(out), `path vs ${d0}`).toBeGreaterThanOrEqual(0.9 * d0)
    const bad = out.filter((c) => inside(c, shrunk(fp!)))
    expect(bad.length, `samples inside footprint ${JSON.stringify(bad[0])}`).toBe(0)
  })
}

for (const id of BUILDINGS) {
  test(`walls-solid: ${id}`, async ({ page }) => {
    await gotoOutside(page, id)
    await settleIn(page)
    const fp = (await jattr(page, 'footprint'))!
    const start = (await jattr(page, 'camera'))!
    await startSampling(page)
    await holdKey(page, 'd', 2000)
    await holdKey(page, 'w', 4000)
    const s = await stopSampling(page)
    const out = s.filter((x) => x.place === 'outside' && x.cam).map((x) => x.cam!)
    expect(out.length).toBeGreaterThan(5)
    expect(Math.max(...out.map((c) => dist(c, [start[0]!, start[2]!]))), 'moved').toBeGreaterThanOrEqual(3)
    const bad = out.filter((c) => inside(c, shrunk(fp)))
    expect(bad.length, `samples inside footprint ${JSON.stringify(bad[0])}`).toBe(0)
  })
}

const places = [
  ...BUILDINGS.flatMap((id) => [{ id, p: 'outside' }, { id, p: 'inside' }]),
  { id: 'celsus', p: 'site' },
] as { id: Room; p: string }[]
for (const { id, p } of places) {
  test(`controls-c: ${id} ${p}`, async ({ page }) => {
    if (p === 'outside') await gotoOutside(page, id)
    else await gotoRoom(page, id)
    await expect(root(page)).toHaveAttribute('data-place', p)
    await expect(page.locator('.room-controls button')).toHaveCount(3)
    await expect(page.locator('.room-controls button[data-action="enter"], .room-controls button[data-action="exit"]')).toHaveCount(0)
    if (p === 'outside') await expect(page.locator('button[data-action="enter"]')).toHaveCount(1)
    if (p === 'inside') await expect(page.locator('button[data-action="exit"]')).toHaveCount(1)
    if (p === 'site') await expect(page.locator('button[data-action="enter"], button[data-action="exit"]')).toHaveCount(0)
  })
}

const DIM = { w: 'width', d: 'depth', h: 'height' } as const
for (const id of BUILDINGS) {
  test(`estimated-label-c: ${id}`, async ({ page }) => {
    const ex = exterior()[id]!
    await gotoOutside(page, id)
    const r = root(page)
    await expect(r).toHaveAttribute('data-place', 'outside')
    expect(await jattr(page, 'massing')).toEqual([ex.w, ex.d, ex.h])
    const est = page.locator('[data-estimated]')
    const credits = page.locator('ul.room-credits')
    if (ex.estimated.length) {
      await expect(est).toBeVisible()
      for (const k of ex.estimated) await expect(est).toContainText(DIM[k as keyof typeof DIM])
      for (const k of Object.keys(DIM).filter((k) => !ex.estimated.includes(k))) await expect(est).not.toContainText(DIM[k as keyof typeof DIM])
    } else {
      await expect(est).toBeHidden()
    }
    await expect(credits).toBeVisible()
    await expect(root(page)).toHaveAttribute('data-spines', '0')
    if (ex.source === 'estimate') {
      await expect(credits.locator('a[href^="https://www.openstreetmap.org/"]')).toHaveCount(0)
      await expect(credits).not.toContainText('ODbL')
    } else {
      const osm = credits.locator(`a[href="https://www.openstreetmap.org/${ex.source}"]`).first()
      await expect(osm).toBeVisible()
      await expect(credits).toContainText('ODbL')
    }
    await gotoRoom(page, id)
    await expect(root(page)).toHaveAttribute('data-place', 'inside')
    await expect(est).toBeHidden()
    await expect(credits).toBeVisible()
  })
}
test('estimated-label-c: celsus site has credits and no spines', async ({ page }) => {
  await gotoRoom(page, 'celsus')
  await expect(root(page)).toHaveAttribute('data-place', 'site')
  await expect(page.locator('ul.room-credits')).toBeVisible()
  await expect(root(page)).toHaveAttribute('data-spines', '0')
})

const polyUrls = (page: Page) => {
  const seen: string[] = []
  page.on('request', (q) => POLY.test(new URL(q.url()).hostname) && seen.push(q.url()))
  return seen
}

test('textures-runtime: real Poly Haven loads outside the Long Room', async ({ page }) => {
  const seen = polyUrls(page)
  const bad: string[] = []
  page.on('pageerror', (e) => bad.push(e.message))
  const list = textures()
  await gotoOutside(page, 'longroom')
  await expect.poll(async () => Number((await root(page).getAttribute('data-textures')) ?? 0), { timeout: 10_000 }).toBeGreaterThanOrEqual(2)
  expect(seen.length, 'requested Poly Haven files').toBeGreaterThan(0)
  const known = list.map((t) => t.url)
  for (const u of seen) expect(known, u).toContain(u.split('?')[0])
  const credits = page.locator('ul.room-credits')
  const names = [...new Set(list.map((t) => t.asset))]
  for (const a of names) await expect(credits).toContainText(a)
  await expect(credits).toContainText('CC0')
  await expect(credits).toContainText('Poly Haven')
  expect(bad).toEqual([])
})

test('textures-runtime: aborted Poly Haven leaves the room ready with no textures', async ({ page }) => {
  const bad: string[] = []
  page.on('pageerror', (e) => bad.push(e.message))
  const list = textures()
  await page.route((u) => POLY.test(u.hostname), (route) => route.abort('failed'))
  await gotoOutside(page, 'longroom')
  await page.waitForTimeout(3000)
  await expect(root(page)).toHaveAttribute('data-textures', '0')
  expect(list.length, 'textures configured').toBeGreaterThanOrEqual(2)
  await expect(page.locator('ul.room-credits')).toContainText('Poly Haven')
  expect(bad).toEqual([])
})
