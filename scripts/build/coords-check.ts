// Proves every libs.json coordinate against Wikidata P625. Exit 1 on any miss.
import { readFileSync } from 'node:fs'

const MAX_KM = 25
// id -> why a large gap or missing P625 is acceptable
const reasons: Record<string, string> = {
  bpl: 'Q118130179 (Bates Hall) is the right room but has no P625',
  wiblingen: 'Q28790041 is the right library but has no P625',
  timbuktu: 'Q2209578 is the manuscript collection, not a place, so no P625',
  khudabakhsh: 'Q6402791 is the right library but has no P625',
}

type Lib = { id: string; lat: number; lon: number; wd?: string; n: string }
const libs: Lib[] = JSON.parse(readFileSync(new URL('../../data/libs.json', import.meta.url), 'utf8'))
const withWd = libs.filter((l) => l.wd)

const km = (a: number, b: number, c: number, d: number) => {
  const r = Math.PI / 180
  const h = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}

const ents: Record<string, any> = {}
for (let i = 0; i < withWd.length; i += 40) {
  const ids = withWd.slice(i, i + 40).map((l) => l.wd).join('|')
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=claims|labels&languages=en&format=json`
  const res = await fetch(url, { headers: { 'User-Agent': 'worldlibs-coords-check/1.0' } })
  if (!res.ok) throw new Error(`wikidata ${res.status}`)
  Object.assign(ents, (await res.json()).entities)
}

let bad = 0
for (const l of withWd) {
  const e = ents[l.wd!]
  const label = e?.labels?.en?.value ?? '(no label)'
  const c = e?.claims?.P625?.[0]?.mainsnak?.datavalue?.value
  const d = c ? km(l.lat, l.lon, c.latitude, c.longitude) : NaN
  const why = reasons[l.id]
  const fail = !e || e.missing !== undefined || (c ? d > MAX_KM : true)
  if (fail && !why) bad++
  const wdPos = c ? `${c.latitude.toFixed(4)},${c.longitude.toFixed(4)}` : 'no P625'
  console.log(
    `${fail ? (why ? 'OK*' : 'BAD') : 'ok '} ${l.id.padEnd(13)} ${l.wd!.padEnd(10)} ours ${l.lat},${l.lon}  wd ${wdPos}  ${c ? d.toFixed(1) : '-'} km  ${label}${why ? `  [${why}]` : ''}`,
  )
}
console.log(`${withWd.length} checked, ${bad} failing`)
process.exit(bad ? 1 : 0)
