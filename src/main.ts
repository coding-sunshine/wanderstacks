import './style.css'
import { go } from './app'
import type { Mount } from './types'
import { attachPalette } from './palette'

// Procedural film grain: one 128px noise tile, stamped across a viewport-sized canvas.
// Drawn once (stillness is a feature); no assets, no data: URIs, no committed rasters.
const grainTile = (() => {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(128, 128)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + Math.random() * 90
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return c
})()

const paintGrain = () => {
  const g = document.getElementById('grain') as HTMLCanvasElement | null
  if (!g) return
  const w = Math.min(Math.ceil(innerWidth / 2), 960)
  const h = Math.min(Math.ceil(innerHeight / 2), 960)
  g.width = w
  g.height = h
  const ctx = g.getContext('2d')!
  ctx.clearRect(0, 0, w, h)
  for (let y = 0; y < h; y += 128) for (let x = 0; x < w; x += 128) ctx.drawImage(grainTile, x, y)
}
paintGrain()
attachPalette()
addEventListener('resize', paintGrain)

type Route = [RegExp, () => Promise<{ mount: Mount }>]

const routes: Route[] = [
  [/^\/(?<mode>atlas)?$/, () => import('./globe')],
  [/^\/room\/(?<lib>[\w-]+)$/, () => import('./room')],
  [/^\/read\/(?<book>[\w-]+)$/, () => import('./reader')],
  [/^\/byrne$/, () => import('./byrne')],
  [/^\/shelf$/, () => import('./shelf')],
  [/^\/book$/, () => import('./book')],
  [/^\/babel$/, () => import('./babel')],
  [/^\/ledger\/(?<lib>[\w-]+)$/, () => import('./ledger')],
  [/^\/stgall$/, () => import('./stgall')],
  [/^\/darwin$/, () => import('./darwin')],
  [/^\/scan\/(?<book>[\w-]+)$/, () => import('./scan')],
]

const app = document.getElementById('app')!
const poster = document.getElementById('poster')!
let cleanup: ReturnType<Mount>
let token = 0

const notFound: Mount = (el) => {
  el.innerHTML = '<section class="page"><h1>Not on any shelf</h1><p><a href="/">Back to the globe</a></p></section>'
}

const broken: Mount = (el) => {
  el.innerHTML = '<section class="page"><h1>This page could not load</h1><p>Check your connection and reload.</p></section>'
}

async function render() {
  const t = ++token
  const path = location.pathname.replace(/\/+$/, '') || '/'
  let mount = notFound
  let params: Record<string, string> = {}
  for (const [re, load] of routes) {
    const m = path.match(re)
    if (!m) continue
    mount = await load().then((mod) => mod.mount, () => broken)
    params = Object.fromEntries(Object.entries(m.groups ?? {}).filter(([, v]) => v !== undefined))
    break
  }
  if (t !== token) return
  const swap = () => {
    cleanup?.()
    app.replaceChildren()
    poster.hidden = path !== '/'
    cleanup = mount(app, params)
  }
  // A newer navigation skips the running transition, which rejects ready. That is expected, not an error.
  if (document.startViewTransition && app.childElementCount) document.startViewTransition(swap).ready.catch(() => {})
  else swap()
}

document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest('a')
  if (!a || a.target || a.hasAttribute('download') || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const url = new URL(a.href)
  if (url.origin !== location.origin || url.pathname === '/plan') return
  e.preventDefault()
  if (url.pathname + url.search !== location.pathname + location.search) go(url.pathname + url.search + url.hash)
})

// Chromium keeps history.state when a same-URL load replaces the entry. Only reload and back/forward resume a place.
if ((performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type === 'navigate' && history.state) history.replaceState(null, '')
addEventListener('popstate', render)
render()
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')
