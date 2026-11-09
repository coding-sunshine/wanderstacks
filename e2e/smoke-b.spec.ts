import { expect, test } from '@playwright/test'
import { mockIiif, roomRoot } from './iiif'
import { ready, roomIds, watchErrors } from './util'

const stops: [string, string][] = [
  ['/', 'home'],
  ['/ledger/alexandria', 'ledger'],
  ['/stgall', 'stgall'],
  ['/darwin', 'darwin'],
  ['/scan/firstfolio', 'scan'],
  ...roomIds().map((id): [string, string] => [`/room/${id}`, 'room']),
]

test('every Phase B view mounts real content with a clean console and network', async ({ page }) => {
  const errors = watchErrors(page)
  await mockIiif(page)
  for (const [path, view] of stops) {
    await page.goto(path)
    await ready(page, view)
    const root = page.locator(`[data-view="${view}"]`)
    await expect(root, `${path} mounts once`).toHaveCount(1)
    const box = await root.boundingBox()
    expect(box && box.width * box.height, `${path} root has area`).toBeGreaterThan(0)
    expect(await root.evaluate((el) => el.textContent!.trim().length + el.querySelectorAll('canvas,svg,img').length), `${path} not empty`).toBeGreaterThan(0)
  }
  expect(errors).toEqual([])
})

test('client navigation walks atlas to ledger, back, then to a room control', async ({ page }) => {
  const errors = watchErrors(page)
  await mockIiif(page)
  await page.goto('/atlas')
  await ready(page, 'home')
  await page.locator('#xrange').fill('1000')
  await page.locator('#xlist').getByText('Library of Alexandria', { exact: true }).click()
  await page.locator('#xcard a[href="/ledger/alexandria"]').click()
  await page.waitForURL('**/ledger/alexandria', { timeout: 15_000 })
  await ready(page, 'ledger')
  await page.goBack()
  await ready(page, 'home')
  await page.goto('/room/admont')
  await ready(page, 'room')
  await expect(roomRoot(page).locator('.room-controls button')).toHaveCount(3)
  expect(errors).toEqual([])
})

test('no IIIF in cache', async ({ page }) => {
  const errors = watchErrors(page)
  await mockIiif(page)
  await page.goto('/')
  await ready(page, 'home')
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => 0))
  await page.reload()
  await ready(page, 'home')
  await page.waitForFunction(() => !!navigator.serviceWorker.controller)
  for (const [path, view] of [['/scan/firstfolio', 'scan'], ['/stgall', 'stgall']] as const) {
    await page.goto(path)
    await ready(page, view)
    await page.waitForTimeout(800)
  }
  const cached = await page.evaluate(async () => {
    const urls: string[] = []
    for (const name of await caches.keys()) for (const r of await (await caches.open(name)).keys()) urls.push(r.url)
    return urls
  })
  expect(cached.length, 'the shell is cached at all').toBeGreaterThan(0)
  expect(cached.filter((u) => /iiif\.bodleian\.ox\.ac\.uk|e-codices\./.test(u))).toEqual([])
  expect(errors).toEqual([])
})
