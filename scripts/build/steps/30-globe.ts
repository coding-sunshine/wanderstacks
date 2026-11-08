import { existsSync } from 'node:fs'

const root = new URL('../../../', import.meta.url).pathname
const libs: any[] = await Bun.file(root + 'data/libs.json').json()
const other: Record<string, string> = { alexandria: '/ledger/alexandria', stgallen: '/stgall', bodleian: '/scan/firstfolio' }
const href = (id: string) => other[id] ?? (existsSync(root + `data/hall/${id}.json`) ? `/room/${id}` : null)
const pins = libs.map(({ id, n, p, yl, y, lat, lon, lost, wd, st }) => ({ id, n, p, yl, y, lat, lon, lost, wd, st, href: href(id) }))
await Bun.write(root + 'public/lib/pins.json', JSON.stringify(pins))

// A small global catalog for the search palette: rooms plus every readable book.
const books: any[] = await Bun.file(root + 'data/books.json').json().then((j: any) => j.books)
const nameOf = Object.fromEntries(libs.map((l) => [l.id, l.n]))
const catalog = [
  ...pins.map((p) => ({ kind: 'room', title: p.n, sub: p.p, href: p.href ?? `/` })),
  ...books
    .filter((b) => b.status === 'passing')
    .map((b) => ({
      kind: b.tier === 'readable-text' ? 'book' : b.tier === 'readable-scan' ? 'scan' : 'card',
      title: b.title,
      sub: [b.author, b.lib ? nameOf[b.lib] : null].filter(Boolean).join(' · '),
      href: b.tier === 'readable-text' ? `/read/${b.id}` : b.tier === 'readable-scan' ? (b.id === 'firstfolio' ? '/scan/firstfolio' : (b.read?.url ?? null)) : (b.catalogue_url ?? null),
    }))
    .filter((b) => b.href),
]
await Bun.write(root + 'public/lib/catalog.json', JSON.stringify(catalog))
