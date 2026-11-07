import { mkdir, readdir } from 'node:fs/promises'
import type { Fact, Hall, Library, Param, Shelf, Credit } from '../../../src/types'

const root = new URL('../../../', import.meta.url).pathname
const read = (p: string) => Bun.file(root + p).json()

const libs: any[] = await read('data/libs.json')
const facts: any[] = (await read('data/facts.json')).facts
const books: any[] = (await read('data/books.json')).books
const BASES = new Set(['measured', 'photo-estimate', 'excavated', 'attested', 'comparandum', 'invented'])

await mkdir(root + 'public/lib', { recursive: true })

for (const file of await readdir(root + 'data/hall')) {
  const id = file.replace(/\.json$/, '')
  const lib = libs.find((l) => l.id === id)
  if (!lib) throw new Error(`data/hall/${file}: no library "${id}" in data/libs.json`)
  const kit: { shelfClusters: string[]; hall: Hall; credits: Credit[] } = await read(`data/hall/${file}`)

  const passing: Fact[] = facts
    .filter((f) => f.lib === id && f.status === 'passing')
    .map(({ lib, field, value, tier, source }) => ({ lib, field, value, tier, source }))

  for (const [k, p] of Object.entries(kit.hall) as [string, Param<unknown>][]) {
    if (!BASES.has(p.basis)) throw new Error(`${id}.hall.${k}: bad basis "${p.basis}"`)
    if (p.basis === 'measured' && !passing.some((f) => f.source === p.src && f.value.toLowerCase().includes(String(p.v).toLowerCase())))
      throw new Error(`${id}.hall.${k}: measured ${p.v} has no passing fact from ${p.src}`)
  }

  const shelves: Shelf[] = books
    .filter((b) => b.lib === id && b.status === 'passing' && (b.tier === 'catalog' || kit.shelfClusters.includes(b.cluster)))
    .map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author ?? null,
      tier: b.tier,
      shelfmark: b.shelfmark ?? null,
      url: b.tier === 'catalog' ? b.catalogue_url : `/read/${b.id}`,
      note: b.why ?? null,
    }))

  const out: Library = {
    id,
    wd: lib.wd,
    name: lib.n,
    place: lib.p,
    years: lib.yl,
    facts: passing,
    hall: kit.hall,
    shelves,
    credits: kit.credits,
  }
  await Bun.write(root + `public/lib/${id}.json`, JSON.stringify(out))
}
