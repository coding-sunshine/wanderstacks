import { existsSync, mkdirSync } from 'node:fs'

// One about page per library, so a globe pin never has to send the reader off-site:
// verified facts and dated events, the curated summary from libs.json, and the visit link.

const root = new URL('../../../', import.meta.url).pathname
const libs: any[] = await Bun.file(root + 'data/libs.json').json()
const factsJ: any = await Bun.file(root + 'data/facts.json').json()
const other: Record<string, string> = { alexandria: '/ledger/alexandria', stgallen: '/stgall', bodleian: '/scan/firstfolio' }
const href = (id: string) => other[id] ?? (existsSync(root + `data/hall/${id}.json`) ? `/room/${id}` : null)

mkdirSync(root + 'public/lib/about', { recursive: true })
for (const { id, n, p, yl, y, wd, st, dim, vol, book, read } of libs) {
  const facts = factsJ.facts
    .filter((f: any) => f.lib === id && f.status === 'passing')
    .map(({ field, value, tier, source }: any) => ({ field, value, tier, source }))
  const events = (factsJ.events ?? [])
    .filter((e: any) => e.lib === id && e.status === 'passing')
    .map(({ kind, year, earliest, label }: any) => ({ kind, year: year ?? earliest ?? null, label }))
    .sort((a: any, b: any) => (a.year ?? 9999) - (b.year ?? 9999))
  await Bun.write(
    root + `public/lib/about/${id}.json`,
    JSON.stringify({ id, n, p, yl, y, wd, href: href(id), st, dim, vol, book, read, facts, events }),
  )
}
console.log('about pages:', libs.length)
