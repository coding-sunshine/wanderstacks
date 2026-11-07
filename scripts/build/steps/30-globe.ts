const root = new URL('../../../', import.meta.url).pathname
const libs: any[] = await Bun.file(root + 'data/libs.json').json()
const pins = libs.map(({ id, n, p, yl, y, lat, lon, lost }) => ({ id, n, p, yl, y, lat, lon, lost }))
await Bun.write(root + 'public/lib/pins.json', JSON.stringify(pins))
