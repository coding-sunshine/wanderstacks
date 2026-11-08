// One-time fetch of opening hours from OpenStreetMap (ODbL) for every library in libs.json.
// Writes data/hours.json: { id: { hours, source } }. Run by hand; the build stays offline.
const root = new URL('../', import.meta.url).pathname
const libs: any[] = await Bun.file(root + 'data/libs.json').json()
const q = `[out:json][timeout:60];(
${libs.map((l) => `nwr[wikidata="${l.wd}"];`).join('\n')}
);out tags;`
let json: any = null
for (const endpoint of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.nchc.org.tw/api/interpreter']) {
  try {
    const res = await fetch(endpoint, { method: 'POST', body: 'data=' + encodeURIComponent(q) })
    if (res.ok) {
      json = await res.json()
      break
    }
  } catch {
    // try the next mirror
  }
}
if (!json) {
  // Fallback: ask Nominatim once per library, gently.
  const found = new Map<string, string>()
  for (const l of libs) {
    try {
      const u = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(l.wd)}&format=jsonv2&extratags=1&limit=1`
      const r = await fetch(u, { headers: { 'User-Agent': 'worldlibs-research/1.0 (https://worldlibs.pages.dev)' } })
      const rows: any[] = await r.json()
      const h = rows[0]?.extratags?.opening_hours
      if (h) found.set(l.wd, h)
    } catch {
      // skip
    }
    await new Promise((r) => setTimeout(r, 1100))
  }
  json = { elements: [...found].map(([wd, hours]) => ({ tags: { wikidata: wd, opening_hours: hours } })) }
}
const byWd = new Map<string, string>()
for (const el of json.elements ?? []) {
  const wd = el.tags?.wikidata
  const h = el.tags?.opening_hours
  if (wd && h && !byWd.has(wd)) byWd.set(wd, h)
}
const out: Record<string, { hours: string; source: string }> = {}
for (const l of libs) {
  const h = byWd.get(l.wd)
  if (h) out[l.id] = { hours: h, source: 'OpenStreetMap contributors, ODbL' }
}
await Bun.write(root + 'data/hours.json', JSON.stringify(out, null, 1))
console.log('hours for', Object.keys(out).length, 'of', libs.length, 'libraries')
