import { expect, test } from '@playwright/test'
import { mockIiif } from './iiif'
import { ready, watchErrors } from './util'
import { roomIdsD } from './util-d'

const LIMIT = 5 * 1024 * 1024

const routes: [string, string][] = roomIdsD().map((id): [string, string] => [`/room/${id}`, 'room'])

for (const [path, view] of routes) {
  test(`d-route-weight: ${path} cold load transfers 5 MB or less of our own bytes`, async ({ page }) => {
    const errors = watchErrors(page)
    await mockIiif(page, 150_000)
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Network.enable')
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
    const urls = new Map<string, string>()
    const sizes = new Map<string, number>()
    cdp.on('Network.requestWillBeSent', (e) => urls.set(e.requestId, e.request.url))
    cdp.on('Network.loadingFinished', (e) => sizes.set(e.requestId, e.encodedDataLength))

    await page.goto(path)
    await ready(page, view)
    await page.waitForTimeout(1500)

    let total = 0
    const rows: [string, number][] = []
    for (const [id, n] of sizes) {
      const u = urls.get(id) ?? ''
      if (/^https:\/\/(iiif\.bodleian\.ox\.ac\.uk|([a-z0-9-]+\.)?e-codices\.(ch|unifr\.ch))\//.test(u) || u.startsWith('data:')) continue
      total += n
      rows.push([u, n])
    }
    rows.sort((a, b) => b[1] - a[1])
    console.log(`route-weight-d ${path} ${(total / 1048576).toFixed(2)} MB over ${rows.length} requests; largest ${rows[0]?.[0]} ${rows[0]?.[1]}`)
    expect(rows.length, 'requests were observed').toBeGreaterThan(0)
    expect(total).toBeLessThanOrEqual(LIMIT)
    expect(errors).toEqual([])
  })
}
