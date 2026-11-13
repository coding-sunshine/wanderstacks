import { mkdirSync } from 'node:fs'
import { events, facts, generated, LICENCE, libLd, SITE, eventsFor } from '../../../src/site/record'

// The public release: the same sourced rows the pages show (nothing failing), minus internal fields.
const root = new URL('../../../', import.meta.url).pathname
const out = root + 'public/data/'
const raw: any[] = await Bun.file(root + 'data/libs.json').json()
const keep = ['id', 'n', 'p', 'lat', 'lon', 'k', 'y', 'yl', 'tier', 'ev', 'st', 'dim', 'vol', 'wd']
const libs = raw.map((l) => Object.fromEntries(keep.filter((k) => l[k] != null).map((k) => [k, l[k]])))
const write = (f: string, v: unknown) => Bun.write(out + f, JSON.stringify(v, null, 1) + '\n')

mkdirSync(out, { recursive: true })
await write('libraries.json', libs)
await write('facts.json', facts)
await write('events.json', events)
await write('libraries.jsonld', { '@context': 'https://schema.org', '@graph': raw.map((l) => libLd(l, eventsFor(l.id))) })
for (const name of ['dispersal', 'tours', 'captures', 'concordance', 'conservation', 'phases']) {
  await write(`${name}.json`, await Bun.file(root + `data/${name}.json`).json())
}
await Bun.write(out + 'README.md', `# WorldLibs open data

Generated ${generated}. Page: ${SITE}/data/

- libraries.json: one row per library. id, n (name), p (place), lat, lon, k (kind), y/yl (year, label), tier (mvp or lost), wd (Wikidata id).
- facts.json: one row per sourced claim. id (anchors the claim on its library page), lib, field, value, source (URL), tier, quote (the source's words, when held).
- events.json: dated events. id, lib, kind, year, label, source, tier, quote.
- libraries.jsonld: schema.org Library (LandmarksOrHistoricalBuildings for lost ones) with Wikidata sameAs.
- dispersal.json: current holders of surviving collections, with coordinates, source tier and any verified IIIF manifest.
- tours.json: external official and third-party tours, provider, scope, checked date and view-only notes.
- captures.json: real 3D candidates and ready captures, with author, licence, source, alignment and any version discrepancy.
- concordance.json: links between spatial hotspots and related manuscripts, including the limits of identification.
- conservation.json: restoration schedules and the real repeat captures still needed.
- phases.json: sourced architectural phases used by the same-camera comparison.

Tiers: primary (the institution or an original document), secondary (scholarship or press), wikipedia (Wikipedia, cited as such), unproven (stated but not yet sourced). Claims whose check failed are left out. A claim's page is ${SITE}/libraries/<lib>/#<id>.

Licence: the compilation is released under CC BY 4.0 (${LICENCE}). Quoted source text stays under its own licence; Wikipedia-tier wording follows CC BY-SA. Corrections: open an issue at https://github.com/coding-sunshine/worldlibs/issues.
`)
console.log(`open data: ${libs.length} libraries, ${facts.length} facts, ${events.length} events`)
