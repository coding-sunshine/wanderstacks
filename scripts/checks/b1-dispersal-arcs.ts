// Static half of b1: the globe data carries arcs for lost libraries with records and none elsewhere.
// The browser half (arcs visible on /atlas/dunhuang) is a screenshot, see the work-package report.
import { readFileSync, readdirSync } from 'node:fs'
import { dist, fail, rows } from './dispersal-data'

const pins: any[] = JSON.parse(readFileSync('public/lib/pins.json', 'utf8'))
const libs = new Set(rows.map((r) => r.lib))
for (const p of pins) {
  const want = rows.filter((r) => r.lib === p.id).length
  if ((p.dp?.length ?? 0) !== want) fail(`pins.json: ${p.id} has ${p.dp?.length ?? 0} arcs, dispersal.json has ${want}`)
}
const built = readdirSync(`${dist}/_astro`).filter((f) => f.endsWith('.js')).map((f) => readFileSync(`${dist}/_astro/${f}`, 'utf8')).find((s) => s.includes('setDrawRange') && s.includes('#58a583'))
if (!built) fail(`no built chunk in ${dist} draws dispersal arcs`)
console.log(`arcs for ${[...libs].join(', ')}; globe chunk draws them (${dist})`)

