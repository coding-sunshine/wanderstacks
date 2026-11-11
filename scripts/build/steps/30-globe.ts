const root = new URL('../../../', import.meta.url).pathname
const libs: any[] = await Bun.file(root + 'data/libs.json').json()
const hours: Record<string, unknown> = await Bun.file(root + 'data/hours.json').json().catch(() => ({}))
const books: any[] = await Bun.file(root + 'data/books.json').json().then((j: any) => j.books.filter((b: any) => b.status === 'passing'))
// Written by 25-scan: only these scans open in /scan/<id>; the rest link to the holder's own reader.
const scans = new Set<string>(await Bun.file(root + 'public/scan/index.json').json().catch(() => []))

const other: Record<string, string> = { alexandria: '/ledger/alexandria', stgallen: '/stgall' }
const href = (id: string) => other[id] ?? null
// Curated Commons photographs (outside first, then inside), keyed by library id.
const photos: Record<string, unknown> = await Bun.file(root + 'data/photos.json').json().catch(() => ({}))
// Holders of a lost library's surviving items: the globe draws an arc to each.
const dispersal: any[] = await Bun.file(root + 'data/dispersal.json').json().catch(() => [])
const dp = (id: string) => {
  const h = dispersal.filter((d) => d.lib === id).map(({ lat, lon, tier }) => ({ lat, lon, tier }))
  return h.length ? h : undefined
}
const kind = (b: any) => (b.tier === 'readable-text' ? 'book' : b.tier === 'readable-scan' ? 'scan' : 'card')
const bookHref = (b: any): string | null =>
  b.tier === 'readable-text' ? `/read/${b.id}` : b.tier === 'readable-scan' ? (scans.has(b.id) ? `/scan/${b.id}` : (b.catalogue_url ?? b.read?.url ?? null)) : (b.catalogue_url ?? null)
// Books a library holds or held, readable first: text, then scan, then catalogue card.
const ORDER = { book: 0, scan: 1, card: 2 } as const
const reads = (id: string) =>
  books
    .filter((b) => b.lib === id && bookHref(b))
    .map((b) => ({ id: b.id, t: b.title, a: b.author ?? null, d: b.date ?? null, k: kind(b) as keyof typeof ORDER, href: bookHref(b)! }))
    .sort((x, y) => ORDER[x.k] - ORDER[y.k])

const pins = libs.map(({ id, n, p, yl, y, lat, lon, lost, found, wd, st, stFrom, k, ev, evNote, dim, vol, book, read }) => ({ id, n, p, yl, y, lat, lon, lost, found, wd, st, stFrom, k, ev, evNote, dim, vol, book, read, href: href(id), hours: (hours[id] as any)?.hours ?? null, reads: reads(id), ph: photos[id], dp: dp(id) }))
await Bun.write(root + 'public/lib/pins.json', JSON.stringify(pins))

// A small global catalog for the search palette: rooms plus every readable book.
const nameOf = Object.fromEntries(libs.map((l) => [l.id, l.n]))
const catalog = [
  ...pins.map((p) => ({ kind: 'room', title: p.n, sub: p.p, href: p.href ?? `/atlas/${p.id}` })),
  ...books
    .map((b) => ({ kind: kind(b), title: b.title, sub: [b.author, b.lib ? nameOf[b.lib] : null].filter(Boolean).join(' · '), href: bookHref(b) }))
    .filter((b) => b.href),
]
await Bun.write(root + 'public/lib/catalog.json', JSON.stringify(catalog))
console.log(`globe: ${pins.length} pins, ${pins.filter((p) => p.reads.length).length} with books, ${catalog.length} catalog entries`)
