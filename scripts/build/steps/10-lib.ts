import { mkdir, readdir } from 'node:fs/promises'
import type { Fact, Hall, KitId, Library, Shelf, Credit, TourStop } from '../../../src/types'
import { checkHall } from '../../recon/check'

const root = new URL('../../../', import.meta.url).pathname
const read = (p: string) => Bun.file(root + p).json()

const libs: any[] = await read('data/libs.json')
const facts: any[] = (await read('data/facts.json')).facts
const eventsAll: any[] = (await read('data/facts.json')).events ?? []
const books: any[] = (await read('data/books.json')).books
const KITS: KitId[] = ['hall', 'rotunda', 'site']

await mkdir(root + 'public/lib', { recursive: true })

for (const file of await readdir(root + 'data/hall')) {
  const id = file.replace(/\.json$/, '')
  const lib = libs.find((l) => l.id === id)
  if (!lib) throw new Error(`data/hall/${file}: no library "${id}" in data/libs.json`)
  const src: { kit: KitId; reconstruction?: boolean; shelfClusters: string[]; hall: Hall; credits: Credit[] } = await read(`data/hall/${file}`)

  const passing: Fact[] = facts
    .filter((f) => f.lib === id && f.status === 'passing')
    .map(({ lib, field, value, tier, source }) => ({ lib, field, value, tier, source }))

  if (!KITS.includes(src.kit)) throw new Error(`data/hall/${file}: kit must be one of ${KITS.join(', ')}`)
  const errors = checkHall(id, src.hall, facts)
  if (errors.length) throw new Error(errors.join('\n'))

  const shelves: Shelf[] = books
    .filter((b) => b.lib === id && b.status === 'passing' && (b.tier === 'catalog' || src.shelfClusters.includes(b.cluster)))
    .map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author ?? null,
      tier: b.tier,
      shelfmark: b.shelfmark ?? null,
      url: b.tier === 'catalog' ? b.catalogue_url : `/read/${b.id}`,
      note: b.why ?? null,
    }))

  const tourFile = Bun.file(root + `data/tour/${id}.json`)
  const tour: { stops: TourStop[] } | undefined = (await tourFile.exists()) ? await tourFile.json() : undefined
  tour?.stops.forEach((t, i) => {
    if (!Number.isInteger(t.fact) || t.fact < 0 || t.fact >= passing.length) throw new Error(`data/tour/${id}.json: stop ${i} fact ${t.fact} out of range`)
  })

  const out = {
    id,
    wd: lib.wd,
    name: lib.n,
    place: lib.p,
    years: lib.yl,
    lat: lib.lat,
    lon: lib.lon,
    facts: passing,
    events: eventsAll.filter((e) => e.lib === id && e.status === 'passing'),
    kit: src.kit,
    ...(src.reconstruction && { reconstruction: true }),
    ...(tour && { tour }),
    hall: src.hall,
    shelves,
    credits: src.credits,
  } as Library
  await Bun.write(root + `public/lib/${id}.json`, JSON.stringify(out))
}
