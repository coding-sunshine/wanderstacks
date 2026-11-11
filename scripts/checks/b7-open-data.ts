// public/data holds the release: right counts, no internal fields, valid JSON-LD, README, and a /data/ page.
import { existsSync, readFileSync } from 'node:fs'
const dist = process.env.DIST ?? 'dist'
const fail = (m: string): never => { console.error('FAIL b7-open-data: ' + m); process.exit(1) }
const j = (f: string) => { if (!existsSync(f)) fail(`${f} missing`); return JSON.parse(readFileSync(f, 'utf8')) }
const src = j('data/facts.json'), ok = (x: any) => x.status !== 'failing'
const want = { 'facts.json': src.facts.filter(ok).length, 'events.json': src.events.filter(ok).length, 'libraries.json': j('data/libs.json').length }
for (const [f, n] of Object.entries(want)) {
  const d = j(`public/data/${f}`)
  if (d.length !== n) fail(`${f}: ${d.length} rows, want ${n}`)
  if (d.some((r: any) => 'check' in r || 'status' in r || 'phase' in r)) fail(`${f}: internal field present`)
}
const g = j('public/data/libraries.jsonld')['@graph']
if (g.length !== want['libraries.json'] || !g.every((x: any) => x.name && x.geo)) fail('libraries.jsonld incomplete')
if (!g.some((x: any) => x.sameAs?.[0]?.startsWith('https://www.wikidata.org/entity/Q'))) fail('no Wikidata sameAs')
if (!/Licence/.test(readFileSync('public/data/README.md', 'utf8'))) fail('README lacks licence')
const h = readFileSync(`${dist}/data/index.html`, 'utf8')
const ld = JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1])
if (ld['@type'] !== 'Dataset' || !ld.license || ld.distribution.length < 4) fail('Dataset JSON-LD')
if (!h.includes(`${want['facts.json']} rows`) || !h.includes(src.generated.slice(0, 10))) fail('/data/ page lacks counts or date')
if (!readFileSync(`${dist}/index.html`, 'utf8').includes('href="/data/"')) fail('footer lacks /data/ link')
console.log(`ok b7-open-data: ${want['libraries.json']} libraries, ${want['facts.json']} facts, ${want['events.json']} events, no internal fields`)
