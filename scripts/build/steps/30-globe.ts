import { existsSync } from 'node:fs'

const root = new URL('../../../', import.meta.url).pathname
const libs: any[] = await Bun.file(root + 'data/libs.json').json()
const other: Record<string, string> = { alexandria: '/ledger/alexandria', stgallen: '/stgall', bodleian: '/scan/firstfolio' }
const href = (id: string) => (existsSync(root + `data/hall/${id}.json`) ? `/room/${id}` : (other[id] ?? null))
const pins = libs.map(({ id, n, p, yl, y, lat, lon, lost }) => ({ id, n, p, yl, y, lat, lon, lost, href: href(id) }))
await Bun.write(root + 'public/lib/pins.json', JSON.stringify(pins))
