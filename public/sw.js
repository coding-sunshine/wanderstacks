// Runtime cache (wl-v*) is replaced on deploy. Saved books and rooms live in SAVED, which activate never touches:
// only an explicit 'remove' message deletes from it.
const CACHE = 'wl-v4'
const SAVED = 'wl-saved'
const MANIFEST = '/__saved.json'
const PAGES = 50

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(
    (async () => {
      const c = await caches.open(CACHE)
      const r = await fetch('/', { cache: 'reload' })
      const html = await r.clone().text()
      await c.put('/', r)
      await Promise.all(assetsOf(html).map((u) => c.add(u).catch(() => {})))
    })().catch(() => {}),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== SAVED).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

const assetsOf = (text) => [...new Set(text.match(/\/_astro\/[^"')\s\\]+/g) ?? [])]

const put = async (name, req, res) => {
  if (res.ok) await (await caches.open(name)).put(req, res.clone())
  return res
}

// A visited page, keyed without its query so /read/<id>?part=3 and /read/<id> are one entry.
const pageKey = (url) => url.origin + url.pathname
const find = async (url) => {
  const p = url.pathname
  const alt = p.endsWith('/') ? p.slice(0, -1) : p + '/'
  for (const path of [p, alt]) {
    const hit = await caches.match(url.origin + path)
    if (hit) return hit
  }
}

async function remember(url, res) {
  const body = res.clone()
  const c = await caches.open(CACHE)
  await c.put(pageKey(url), body)
  const pages = (await c.keys()).filter((k) => !new URL(k.url).pathname.startsWith('/_astro/'))
  for (const k of pages.slice(0, Math.max(0, pages.length - PAGES))) await c.delete(k)
}

const offline = () => new Response(
  '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline | Wanderstacks</title><body style="margin:0;background:#111813;color:#eee9dc;font:18px/1.6 Georgia,serif"><main style="max-width:38rem;margin:20vh auto;padding:2rem"><h1>You are offline</h1><p>This page has not been saved for offline reading.</p><p>Reconnect and try again.</p></main></body></html>',
  { status: 503, headers: { 'content-type': 'text/html; charset=utf-8' } },
)

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== location.origin) return
  const p = url.pathname

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && res.headers.get('content-type')?.includes('text/html')) e.waitUntil(remember(url, res))
          return res
        })
        .catch(async () => (await find(url)) ?? offline()),
    )
  } else if (p.startsWith('/_astro/') || /^\/book\/[^/]+\/(?:orig\/)?\d+\.json$/.test(p)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => put(CACHE, req, res))))
  } else if (p.startsWith('/sphere/')) {
    // Panoramas are cached only by a room save, as -lo.webp. Offline, a full-size request gets that copy.
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).catch(async () => (await caches.match(p.replace(/\.webp$/, '-lo.webp'))) ?? Response.error())))
  } else if (/^\/lib\/.+\.json$/.test(p) || /^\/book\/[^/]+\/(?:orig\/)?meta\.json$/.test(p)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req).then((res) => put(CACHE, req, res))
        if (hit) { net.catch(() => {}); return hit }
        return net
      }),
    )
  }
})

// Saving: collect every file one item needs, fetch them into SAVED, record the item in the manifest.
const readManifest = async () => {
  const hit = await (await caches.open(SAVED)).match(MANIFEST)
  return hit ? await hit.json() : []
}
const writeManifest = async (items) =>
  (await caches.open(SAVED)).put(MANIFEST, new Response(JSON.stringify(items), { headers: { 'content-type': 'application/json' } }))
const ok = (r) => (r.ok ? r : Promise.reject(new Error(`${r.status} ${r.url}`)))

// Every chunk a page needs. `only` set means the first files are the shell, which names every view's chunk:
// from it follow just the dynamic import that matches `only`.
async function crawl(first, only) {
  const seen = new Set()
  const queue = first.map((u) => [u, !!only])
  while (queue.length) {
    const [u, shell] = queue.shift()
    if (seen.has(u)) continue
    seen.add(u)
    if (!/\.(?:js|css)$/.test(u)) continue
    const text = await fetch(u).then(ok).then((r) => r.text()).catch(() => '')
    const dir = u.slice(0, u.lastIndexOf('/') + 1)
    for (const m of text.matchAll(/["'`]\.\/([\w.~-]+\.(?:js|css))["'`]|\burl\(\s*["']?([^"')\s]+\.woff2?)["']?\s*\)/g)) {
      const f = m[1] ?? m[2]
      const dyn = text.slice(Math.max(0, m.index - 7), m.index) === 'import('
      if (shell && dyn && !only.test(f)) continue
      queue.push([m[2] ? new URL(f, location.origin + u).pathname : dir + f, shell && !dyn])
    }
  }
  return [...seen]
}

async function plan(kind, id, extra) {
  const page = kind === 'book' ? `/read/${id}/` : `/libraries/${id}/`
  const html = await fetch(page).then(ok).then((r) => r.text())
  const files = await crawl(assetsOf(html), kind === 'book' ? /^reader\./ : null)
  const urls = [page, ...files]
  let title = id
  if (kind === 'book') {
    const meta = await fetch(`/book/${id}/meta.json`).then(ok).then((r) => r.json())
    title = meta.author ? `${meta.title}, ${meta.author}` : meta.title
    urls.push(`/book/${id}/meta.json`)
    for (let n = 1; n <= meta.parts; n++) urls.push(`/book/${id}/${n}.json`)
    const om = await fetch(`/book/${id}/orig/meta.json`).then((r) => (r.ok ? r.json() : null), () => null)
    if (om) for (let n = 0; n <= meta.parts; n++) urls.push(n ? `/book/${id}/orig/${n}.json` : `/book/${id}/orig/meta.json`)
  } else title = extra?.title || id
  if (kind === 'room') urls.push(...(extra?.urls ?? []))
  return { urls: [...new Set(urls)], title }
}

async function save(kind, id, extra, say) {
  const key = `${kind}:${id}`
  const { urls, title } = await plan(kind, id, extra)
  const cache = await caches.open(SAVED)
  let done = 0
  let bytes = 0
  const todo = [...urls]
  say({ progress: { done, total: urls.length, bytes } })
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let u; (u = todo.shift()); ) {
        const res = await fetch(u, { cache: 'reload' }).then(ok)
        const n = (await res.clone().blob()).size // read bytes after the await: workers run interleaved
        bytes += n
        await cache.put(u, res)
        say({ progress: { done: ++done, total: urls.length, bytes } })
      }
    }),
  )
  const item = { key, kind, id, title, bytes, files: urls.length, at: Date.now(), urls }
  await writeManifest([...(await readManifest()).filter((i) => i.key !== key), item])
  return item
}

async function remove(key) {
  const items = await readManifest()
  const gone = items.find((i) => i.key === key)
  const rest = items.filter((i) => i.key !== key)
  if (gone) {
    const keep = new Set(rest.flatMap((i) => i.urls))
    const cache = await caches.open(SAVED)
    await Promise.all(gone.urls.filter((u) => !keep.has(u)).map((u) => cache.delete(u)))
  }
  await writeManifest(rest)
  return rest
}

self.addEventListener('message', (e) => {
  const m = e.data
  const port = e.ports[0]
  if (!m || !port) return
  const say = (x) => port.postMessage(x)
  e.waitUntil(
    (async () => {
      if (m.type === 'list') say({ items: await readManifest() })
      else if (m.type === 'remove') say({ items: await remove(m.key) })
      else if (m.type === 'save') say({ done: await save(m.kind, m.id, m, say), items: await readManifest() })
    })().catch((err) => say({ error: String(err.message ?? err) })),
  )
})
