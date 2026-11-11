import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'

// Every readable-scan book becomes /scan/<id>: one pages.json per book, read from the holder's IIIF manifest (v2 or v3).
const root = new URL('../../../', import.meta.url).pathname
const UA = 'WorldLibs-build/1.0 (static reading-room site; open source, MIT)'
const books: any[] = await Bun.file(root + 'data/books.json').json().then((j: any) => j.books)
// iiif.archive.org timed out on half of its image requests (Nov 2026), so its books link to the holder's own reader.
const SLOW = /^https:\/\/iiif\.archive\.org\//
const scans = books.filter((b) => b.tier === 'readable-scan' && b.status === 'passing' && b.read?.kind === 'iiif' && !SLOW.test(b.read.url))

const DEEDS: Record<string, string> = {
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-NC 4.0': 'https://creativecommons.org/licenses/by-nc/4.0/',
  'Public Domain Mark 1.0': 'https://creativecommons.org/publicdomain/mark/1.0/',
}
const LICENCE = /CC BY(?:-[A-Z]+)* \d\.\d|Public Domain Mark 1\.0/
const fromUrl = (u: unknown) => {
  const m = String(u ?? '').match(/creativecommons\.org\/licenses\/([a-z-]+)\/(\d\.\d)/)
  return m ? `CC ${m[1].toUpperCase()} ${m[2]}` : undefined
}
const strip = (s: unknown) => String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const lang = (v: any): string => (typeof v === 'string' ? v : v ? String(Object.values(v).flat()[0] ?? '') : '')
const label = (raw: string, i: number) => {
  const l = raw.trim()
  return !l || l === '-' ? `Page ${i + 1}` : /^\d+$/.test(l) ? `Page ${l}` : l
}
const service = (s: any) => (Array.isArray(s) ? s[0] : s)?.['@id'] ?? (Array.isArray(s) ? s[0] : s)?.id

async function manifest(id: string, url: string) {
  const cache = root + `.cache/scan/${id}-manifest.json`
  if (!existsSync(cache)) {
    const res = await fetch(url, { headers: { 'user-agent': UA } })
    if (!res.ok) throw new Error(`${res.status}`)
    await mkdir(root + '.cache/scan', { recursive: true })
    await Bun.write(cache, await res.text())
  }
  return Bun.file(cache).json() as Promise<any>
}

const built: string[] = []
for (const b of scans) {
  const m = await manifest(b.id, b.read.url).catch((e) => (console.warn(`scan: ${b.id} manifest failed (${e.message}), linking to holder`), null))
  if (!m) continue
  const v3 = !m.sequences
  const all: any[] = v3 ? m.items : m.sequences[0].canvases
  // A scroll is one strip: the manifest says so with behavior "continuous" (v3) or viewingHint (v2).
  const scroll = [m.behavior, m.viewingHint].flat().includes('continuous')
  // IDP manifests mix the stitched scroll, section photos and detail shots; read.group picks the one image group to unroll.
  const canvases = b.read.group ? all.filter((c) => c.metadata?.some((e: any) => lang(e.value) === b.read.group)) : all
  const pages = canvases.map((c, i) => ({
    s: String(service(v3 ? c.items[0].items[0].body.service : c.images[0].resource.service)).replace(/\/info\.json$/, ''),
    w: c.width,
    h: c.height,
    l: scroll ? `Section ${i + 1}` : label(lang(c.label), i),
  }))
  if (!pages.length || pages.some((p) => !p.s || !p.w || !p.h)) throw new Error(`scan: ${b.id} has canvases without an image service`)

  const att = strip(v3 ? lang(m.requiredStatement?.value) : m.attribution)
  const stated = fromUrl(v3 ? m.rights : m.license) ?? att.match(LICENCE)?.[0]
  const ours = String(b.read.licence ?? '').match(LICENCE)?.[0]
  if (stated && ours && stated !== ours) throw new Error(`scan: ${b.id} data says ${ours}, manifest says ${stated}`)
  const licence = stated ?? ours ?? b.read.rights ?? 'Public domain by age; the holder states no licence'
  const credit = b.read.credit ?? (att.split(/\s*Terms of use/i)[0].replace(/^Photo:\s*/i, '').replace(/,(?=\S)/g, ', ').replace(/[\s.]+$/, '') || b.holder)

  await mkdir(root + `public/scan/${b.id}`, { recursive: true })
  await Bun.write(root + `public/scan/${b.id}/pages.json`, JSON.stringify({
    id: b.id, title: b.title, date: b.date, holder: b.holder, manifest: b.read.url, licence, deed: DEEDS[licence] ?? null, credit, pages,
    ...(scroll && { scroll: true, dir: m.viewingDirection ?? 'left-to-right' }),
  }))
  built.push(b.id)
}
// The globe and the palette link /scan/<id> only for books in this list.
await Bun.write(root + 'public/scan/index.json', JSON.stringify(built))
console.log(`scan: ${built.length} of ${scans.length} books`)
