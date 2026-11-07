import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'

const root = new URL('../../../', import.meta.url).pathname
const MANIFEST = 'https://iiif.bodleian.ox.ac.uk/iiif/manifest/390fd0e8-9eae-475d-9564-ed916ab9035c.json'
const UA = 'WorldLibs-build/1.0 (static reading-room site; open source, MIT)'
const cache = root + '.cache/scan/firstfolio-manifest.json'

if (!existsSync(cache)) {
  const res = await fetch(MANIFEST, { headers: { 'user-agent': UA } })
  if (!res.ok) throw new Error(`scan: manifest ${res.status}`)
  await mkdir(root + '.cache/scan', { recursive: true })
  await Bun.write(cache, await res.text())
}
const m: any = await Bun.file(cache).json()

const text = String(m.attribution ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const licence = text.match(/\bCC BY(?:-[A-Z]+)* \d(?:\.\d)?/)?.[0]
const credit = text.split(/\s*Terms of use/i)[0].replace(/^Photo:\s*/i, '').replace(/[\s.]+$/, '')
if (licence !== 'CC BY-NC 4.0') throw new Error(`scan: expected CC BY-NC 4.0, manifest says ${licence}`)

const pages = m.sequences[0].canvases.map((c: any, i: number) => ({
  s: c.images[0].resource.service['@id'],
  w: c.width,
  h: c.height,
  l: String(c.label || '').trim() || `Page ${i + 1}`,
}))
if (pages.length < 900) throw new Error(`scan: only ${pages.length} canvases`)

await Bun.write(root + 'public/scan/firstfolio/pages.json', JSON.stringify({ manifest: MANIFEST, licence, credit, pages }))
