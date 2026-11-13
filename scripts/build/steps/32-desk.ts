import { mkdir } from 'node:fs/promises'
import { manifestPages, manifestTitle } from '../../../src/iiif'

const root = new URL('../../../', import.meta.url).pathname
const rows = await Bun.file(root + 'data/dispersal.json').json() as { lib: string; holder: string; source: string; manifest?: string }[]
const manifests = rows.filter((row) => row.manifest)
const byLib = new Map<string, typeof manifests>()
for (const row of manifests) {
  const list = byLib.get(row.lib) ?? []
  list.push(row)
  byLib.set(row.lib, list)
}

const download = async (url: string) => {
  let failure: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'WorldLibs/1.0 (IIIF collection reader)' }, signal: AbortSignal.timeout(30_000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      failure = error
      if (attempt < 2) await Bun.sleep(500 * (attempt + 1))
    }
  }
  throw failure
}

for (const [lib, holders] of byLib) {
  const dir = root + `public/desk/${lib}`
  await mkdir(dir, { recursive: true })
  const index = []
  for (const [i, holder] of holders.entries()) {
    const id = String(i)
    const base = { id, holder: holder.holder, source: holder.source, manifest: holder.manifest! }
    try {
      const doc = await download(holder.manifest!)
      const pages = manifestPages(doc)
      if (!pages.length) throw new Error('No readable IIIF canvases')
      const entry = { ...base, title: manifestTitle(doc, holder.holder), pages, error: null }
      await Bun.write(`${dir}/${id}.json`, JSON.stringify(entry))
      index.push({ id, holder: holder.holder, count: pages.length, error: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const previous = await Bun.file(`${dir}/${id}.json`).json().catch(() => null)
      const cached = previous?.manifest === holder.manifest && Array.isArray(previous.pages) && previous.pages.length > 0
      const entry = cached ? { ...previous, ...base } : { ...base, title: holder.holder, pages: [], error: message }
      await Bun.write(`${dir}/${id}.json`, JSON.stringify(entry))
      index.push({ id, holder: holder.holder, count: entry.pages.length, error: cached ? null : message })
      if (cached) console.warn(`desk: ${lib}/${id} download failed; kept ${entry.pages.length} cached images`)
    }
  }
  await Bun.write(`${dir}/index.json`, JSON.stringify({ lib, holders: index }))
  console.log(`desk: ${lib}, ${index.filter((h) => h.count > 0).length}/${index.length} holders readable`)
}
