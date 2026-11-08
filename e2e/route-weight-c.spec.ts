import { expect, test, type Page } from '@playwright/test'
import { IIIF_HOST, mockIiif } from './iiif'
import { ALL, BUILDINGS, CLEAR, POLY, fromGlobe, mockWeather, root } from './util-c'
import { ready } from './util'

const LIMIT = 5 * 1024 * 1024
test.use({ serviceWorkers: 'block' })

async function meter(page: Page) {
  await mockIiif(page, 150_000)
  await mockWeather(page, CLEAR)
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  const urls = new Map<string, string>()
  const sizes = new Map<string, number>()
  const partial = new Map<string, number>()
  cdp.on('Network.requestWillBeSent', (e) => urls.set(e.requestId, e.request.url))
  cdp.on('Network.dataReceived', (e) => partial.set(e.requestId, (partial.get(e.requestId) ?? 0) + e.encodedDataLength))
  cdp.on('Network.loadingFinished', (e) => sizes.set(e.requestId, e.encodedDataLength))
  return {
    reset: () => (urls.clear(), sizes.clear(), partial.clear()),
    total() {
      let t = 0, poly = 0, inflight = 0
      for (const [id, u] of urls) {
        if (IIIF_HOST.test(u) || u.startsWith('data:')) continue
        const done = sizes.get(id)
        const n = done ?? partial.get(id) ?? 0
        if (done === undefined) inflight++
        t += n
        if (POLY.test(new URL(u).hostname)) poly += n
      }
      return { t, n: urls.size, poly, inflight }
    },
  }
}

for (const id of BUILDINGS) {
  test(`route-weight-c: ${id} arrival from the globe click`, async ({ page }) => {
    const m = await meter(page)
    await fromGlobe(page, id, 'pin', m.reset)
    await page.waitForTimeout(1500)
    const { t, n, poly, inflight } = m.total()
    expect(n, 'requests observed').toBeGreaterThan(0)
    await expect(root(page)).toHaveAttribute('data-place', 'outside')
    await expect(root(page)).toHaveAttribute('data-sun', /alt/)
    expect(poly, 'Poly Haven bytes counted').toBeGreaterThan(0)
    expect(t, `${t} bytes (${inflight} requests still in flight)`).toBeLessThanOrEqual(LIMIT)
  })
}

for (const id of ALL) {
  test(`route-weight-c: ${id} direct load`, async ({ page }) => {
    const m = await meter(page)
    await page.goto(`/room/${id}`)
    await ready(page, 'room')
    await page.waitForTimeout(1500)
    const { t, n, inflight } = m.total()
    expect(n, 'requests observed').toBeGreaterThan(0)
    await expect(root(page)).toHaveAttribute('data-sun', /alt/)
    expect(t, `${t} bytes (${inflight} requests still in flight)`).toBeLessThanOrEqual(LIMIT)
  })
}
