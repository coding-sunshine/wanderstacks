// Offline shelf: SW keeps saved items, and a real browser reads a saved book and opens a saved room with the network off.
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'
const dist = process.env.DIST ?? 'dist'
const shot = process.env.SHOT ?? '/private/tmp/claude-501/wl-books/offline-shelf.png'
const fail = (m: string): never => { console.error('FAIL b5-offline-shelf: ' + m); process.exit(1) }
const sw = readFileSync(`${dist}/sw.js`, 'utf8')
if (/\/assets\//.test(sw)) fail('sw.js still caches the dead /assets/ path')
if (!/wl-saved/.test(sw) || !/k !== SAVED/.test(sw)) fail('sw.js activate does not spare the saved cache')
const BOOK = 'alice', ROOM = 'admont'
for (const p of [`books/${BOOK}`, `libraries/${ROOM}`]) if (!/class="save"/.test(readFileSync(`${dist}/${p}/index.html`, 'utf8'))) fail(`/${p}/ has no Save button`)
if (!existsSync(`${dist}/sphere/${ROOM}/n01-lo.webp`)) fail('no room panorama to save')

const types: Record<string, string> = { html: 'text/html', js: 'text/javascript', css: 'text/css', json: 'application/json', webp: 'image/webp', woff2: 'font/woff2', svg: 'image/svg+xml' }
const server = Bun.serve({
  port: 0,
  fetch(req) {
    const p = decodeURIComponent(new URL(req.url).pathname)
    for (const f of [p, join(p, 'index.html')]) {
      const path = join(dist, f)
      if (existsSync(path) && !readdirSyncSafe(path)) return new Response(Bun.file(path), { headers: { 'content-type': types[path.split('.').pop()!] ?? 'application/octet-stream' } })
    }
    return new Response('nope', { status: 404 })
  },
})
function readdirSyncSafe(p: string) { try { readdirSync(p); return true } catch { return false } }
const base = `http://localhost:${server.port}`
// Any installed playwright chromium will do; set CHROME to pick one.
const cache = `${process.env.HOME}/Library/Caches/ms-playwright`
const shell = readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell-')).sort().reverse().map((d) => `${cache}/${d}/chrome-headless-shell-mac-arm64/chrome-headless-shell`).find(existsSync)
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? shell })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'allow' })
const page = await ctx.newPage()
const done = async (what: string, f: () => Promise<unknown>) => { try { await f() } catch (e) { await page.screenshot({ path: shot }); fail(`${what}: ${(e as Error).message.split('\n')[0]}`) } }
const saveIt = async (path: string) => {
  await page.goto(base + path)
  await page.waitForFunction(() => navigator.serviceWorker.controller || navigator.serviceWorker.ready.then(() => true))
  await page.click('.sv-btn')
  await page.waitForSelector('.sv-say:has-text("Saved,")', { timeout: 120000 })
  const say = await page.textContent('.sv-say')
  if (!/Saved, [\d.]+ (KB|MB)/.test(say ?? '')) throw new Error(`no size in status ${say}`)
  return say
}
let bookSay = '', roomSay = '', turned = ''
await done('save book', async () => { bookSay = await saveIt(`/books/${BOOK}/`) })
await ctx.setOffline(true)
await done('offline book', async () => {
  await page.goto(`${base}/read/${BOOK}`)
  await page.waitForSelector('.rd[data-ready="true"] .rd-page', { state: 'attached', timeout: 20000 })
  const at = () => page.textContent('.rd-status')
  const first = await at()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(1500)
  const next = await at()
  if (!first || first === next) throw new Error(`page did not turn offline (status "${first}" -> "${next}")`)
  turned = `${first} -> ${next}`
})
await page.screenshot({ path: shot.replace('.png', '-book.png') })
await ctx.setOffline(false)
await done('save room', async () => { roomSay = await saveIt(`/libraries/${ROOM}/`) })
await ctx.setOffline(true)
await done('offline room', async () => {
  await page.goto(`${base}/libraries/${ROOM}/`)
  await page.locator('.stage').first().scrollIntoViewIfNeeded()
  await page.waitForSelector('.psv-container canvas', { timeout: 30000 })
  const got = await page.evaluate(async (r) => Promise.all(['-lo', ''].map(async (x) => (await fetch(`/sphere/${r}/n01${x}.webp`)).ok)), ROOM)
  if (!got.every(Boolean)) throw new Error('panorama not served offline')
  await page.waitForFunction(() => document.querySelector('.psv-loader-container, .psv-loader') === null || !document.querySelector('.psv-loader-container .psv--visible'), null, { timeout: 15000 }).catch(() => {})
})
await page.screenshot({ path: shot })
await browser.close()
server.stop()
console.log(`ok b5-offline-shelf: book "${bookSay}", room "${roomSay}", turned page offline (${turned}), opened room offline, screenshot ${shot}`)
