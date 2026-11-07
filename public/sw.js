const CACHE = 'wl-v1'

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(
    (async () => {
      const c = await caches.open(CACHE)
      const r = await fetch('/', { cache: 'reload' })
      const html = await r.clone().text()
      await c.put('/index.html', r)
      const assets = [...new Set(html.match(/\/assets\/[^"')\s]+/g) ?? [])]
      await Promise.all(assets.map((u) => c.add(u).catch(() => {})))
    })().catch(() => {}),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

const store = async (req, res) => {
  if (res.ok) (await caches.open(CACHE)).put(req, res.clone())
  return res
}

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== location.origin) return
  const p = url.pathname

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => (res.headers.get('content-type')?.includes('text/html') ? store('/index.html', res) : res))
        .catch(() => caches.match('/index.html')),
    )
  } else if (p.startsWith('/assets/') || /^\/book\/[^/]+\/\d+\.json$/.test(p)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => store(req, res))))
  } else if (/^\/lib\/.+\.json$/.test(p) || /^\/book\/[^/]+\/meta\.json$/.test(p)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req).then((res) => store(req, res))
        if (hit) { net.catch(() => {}); return hit }
        return net
      }),
    )
  }
})
