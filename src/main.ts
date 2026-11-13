import './style.css'
import { go } from './app'
import type { Mount } from './types'
import { attachPalette } from './palette'

attachPalette()

type Route = [RegExp, () => Promise<{ mount: Mount }>]

const routes: Route[] = [
  [/^\/(?<mode>atlas)(?:\/(?<lib>[\w-]+))?$/, () => import('./cinematic')],
  [/^\/room\/(?<lib>[\w-]+)$/, () => import('./room')],
  [/^\/read\/(?<book>[\w-]+)$/, () => import('./reader')],
  [/^\/byrne$/, () => import('./byrne')],
  [/^\/shelf$/, () => import('./shelf')],
  [/^\/book$/, () => import('./book')],
  [/^\/babel$/, () => import('./babel')],
  [/^\/ledger\/(?<lib>[\w-]+)$/, () => import('./ledger')],
  [/^\/place\/(?<lib>[\w-]+)$/, () => import('./place')],
  [/^\/stgall$/, () => import('./stgall')],
  [/^\/darwin$/, () => import('./darwin')],
  [/^\/scan\/(?<book>[\w-]+)$/, () => import('./scan')],
  [/^\/desk\/(?<lib>[\w-]+)$/, () => import('./desk')],
]

const app = document.getElementById('app')!
let cleanup: ReturnType<Mount>
let token = 0

const notFound: Mount = (el) => {
  el.innerHTML = '<section class="page"><h1>Not on any shelf</h1><p><a href="/">Back to the atlas</a></p></section>'
}

const broken: Mount = (el) => {
  el.innerHTML = '<section class="page"><h1>This page could not load</h1><p>Check your connection and reload.</p></section>'
}

async function render() {
  const t = ++token
  const path = location.pathname.replace(/\/+$/, '') || '/'
  // Everything outside these routes is a static page: hand it to the browser.
  if (!routes.some(([re]) => re.test(path)) && document.readyState === 'complete') return location.assign(location.href)
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
    cleanup = mount(app, params)
  }
  // A newer navigation skips the running transition, which rejects ready. That is expected, not an error.
  if (document.startViewTransition && app.childElementCount) { const v = document.startViewTransition(swap); for (const p of [v.ready, v.finished, v.updateCallbackDone]) p.catch(() => {}) }
  else swap()
}

document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest('a')
  if (!a || a.target || a.hasAttribute('download') || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const url = new URL(a.href)
  if (url.origin !== location.origin || !routes.some(([re]) => re.test(url.pathname.replace(/\/+$/, '')))) return
  e.preventDefault()
  if (url.pathname + url.search !== location.pathname + location.search) go(url.pathname + url.search + url.hash)
})

// Chromium keeps history.state when a same-URL load replaces the entry. Only reload and back/forward resume a place.
if ((performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type === 'navigate' && history.state) history.replaceState(null, '')
addEventListener('popstate', render)
render()
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')
