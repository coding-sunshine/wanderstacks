// Library pages: one h1, ordered headings, a self-contained chunk per fact, parsing JSON-LD for living and lost libraries.
import { readFileSync, readdirSync } from 'node:fs'
const dist = process.env.DIST ?? 'dist'
const fail = (m: string): never => { console.error('FAIL f10-page-structure: ' + m); process.exit(1) }
const libs: any[] = JSON.parse(readFileSync('data/libs.json', 'utf8'))
const terms = new Set(['Library', 'LandmarksOrHistoricalBuildings', 'BreadcrumbList', 'GeoCoordinates', 'ListItem'])
let ld = 0, lostLd = 0, chunks = 0
for (const l of libs) {
  const h = readFileSync(`${dist}/libraries/${l.id}/index.html`, 'utf8')
  const n = (h.match(/<h1[\s>]/g) ?? []).length
  if (n !== 1) fail(`${l.id}: ${n} h1`)
  let last = 1
  for (const m of h.matchAll(/<h([1-6])[\s>]/g)) { const d = +m[1]; if (d > last + 1) fail(`${l.id}: heading jumps h${last} to h${d}`); last = d }
  if (!/<main[\s>]/.test(h) || !/<nav[\s>]/.test(h) || !/<footer[\s>]/.test(h)) fail(`${l.id}: missing landmark`)
  if (!/<link rel="canonical" href="https:\/\/[^"]+\/libraries\/[^"]+\/"/.test(h) || !/property="og:title"/.test(h)) fail(`${l.id}: canonical or og missing`)
  for (const m of h.matchAll(/<li class="fact" id="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g)) {
    chunks++
    if (!m[2].replace(/<[^>]+>/g, '').replace(/&#38;|&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").includes(l.n)) fail(`${l.id}#${m[1]}: chunk does not name the library`)
    if (!/data-s="(primary|secondary|wikipedia|unproven)"/.test(m[2])) fail(`${l.id}#${m[1]}: no tier stamp`)
    if (!/<a href="https?:\/\/[^"]+">/.test(m[2]) && !m[2].includes('no source')) fail(`${l.id}#${m[1]}: no source`)
  }
  const ids = [...h.matchAll(/ id="([fe]-[^"]+)"/g)].map((m) => m[1])
  if (new Set(ids).size !== ids.length) fail(`${l.id}: duplicate fact ids`)
  const j = h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  if (!j) fail(`${l.id}: no JSON-LD`)
  const g = JSON.parse(j![1])['@graph']
  const e = g.find((x: any) => x['@type'] !== 'BreadcrumbList')
  if (!terms.has(e['@type']) || !e.name || e.geo?.['@type'] !== 'GeoCoordinates' || typeof e.geo.latitude !== 'number') fail(`${l.id}: JSON-LD missing keys`)
  if (l.wd && !e.sameAs?.includes(`https://www.wikidata.org/entity/${l.wd}`)) fail(`${l.id}: sameAs missing`)
  if (g.find((x: any) => x['@type'] === 'BreadcrumbList')?.itemListElement?.length !== 3) fail(`${l.id}: breadcrumb`)
  ld++; if (l.tier === 'lost') { if (e['@type'] !== 'LandmarksOrHistoricalBuildings') fail(`${l.id}: lost type`); lostLd++ }
}
if (ld < 3 || lostLd < 1 || chunks < 100) fail(`too few: ${ld} libraries, ${lostLd} lost, ${chunks} chunks`)
console.log(`ok f10-page-structure: ${ld} pages (${lostLd} lost), ${chunks} fact chunks`)
