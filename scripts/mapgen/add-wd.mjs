// Add globe rows for libraries not yet in data/libs.json, read from Wikidata in Chrome.
// Dry run prints the rows; `--write` appends them. Run from the repo root: node scripts/mapgen/add-wd.mjs [--write]
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

// QIDs picked by hand from wd-find search output. k is the room kit; ruins are sites.
const ADD = {
  vikramashila: ['Q1634624', 'site'], odantapuri: ['Q7077269', 'site'], thanjavur: ['Q3135924', 'hall'],
  khudabakhsh: ['Q6402791', 'hall'], nli: ['Q619913', 'hall'], asiatic: ['Q4058307', 'hall'],
  connemara: ['Q5161767', 'hall'], sassoon: ['Q4120540', 'hall'],
  alexandrina: ['Q501851', 'hall'], baghdad: ['Q33018', 'site'], palafoxiana: ['Q4903485', 'hall'],
  vasconcelos: ['Q6294156', 'hall'], slv: ['Q1200052', 'hall'], tianyige: ['Q2066117', 'hall'],
  binhai: ['Q47088811', 'hall'], haeinsa: ['Q490798', 'hall'], ashikaga: ['Q1053852', 'hall'],
  suleymaniye: ['Q4086354', 'hall'], mcmillan: ['Q60768249', 'hall'],
}
// Gaps Wikidata leaves open, each copied from the English Wikipedia lead on 2026-11-08.
const OVR = {
  vikramashila: { lost: 1193, yl: 'About 800 to about 1193', ev: 'probable' }, // "destroyed ... around 1193"
  thanjavur: { y: 1535, yl: 'Nayak era, 1535–1676', p: 'Thanjavur, India', ev: 'probable' }, // "started by Nayak Kings ... from 1535 CE till 1676 CE"
  sassoon: { y: 1870, yl: '1867–70', p: 'Mumbai, India' }, // "built ... during the period from 1867 to 1870"; "heritage structure in Mumbai, India"
  nli: { p: 'Kolkata, India' }, // Wikidata P131 is a municipal ward
  asiatic: { p: 'Mumbai, India' }, // "based in Mumbai, India"; Wikidata P131 is the district
  connemara: { p: 'Egmore, Chennai, India' }, // "at Egmore in Chennai, Tamil Nadu, India"
}
const P = new URL('../../data/libs.json', import.meta.url)
const libs = JSON.parse(readFileSync(P, 'utf8'))
const todo = Object.entries(ADD).filter(([id]) => !libs.some((l) => l.id === id))

const b = await chromium.launch({ channel: 'chrome' })
const page = await b.newPage()
await page.goto('https://www.wikidata.org/wiki/Wikidata:Main_Page')
const get = (ids) => page.evaluate(async (ids) => {
  const u = `/w/api.php?action=wbgetentities&ids=${ids.join('|')}&props=labels|claims&languages=en|es&format=json`
  return (await (await fetch(u)).json()).entities
}, ids)
const first = (e, p) => e.claims?.[p]?.find((c) => c.rank !== 'deprecated')?.mainsnak.datavalue?.value

const ents = await get(todo.map(([, [q]]) => q))
const refs = new Set()
for (const e of Object.values(ents)) for (const p of ['P131', 'P17', 'P276']) { const v = first(e, p); if (v) refs.add(v.id) }
const ref = {}
const ids = [...refs]
for (let i = 0; i < ids.length; i += 50) Object.assign(ref, await get(ids.slice(i, i + 50)))
await b.close()

const label = (id) => ref[id]?.labels?.en?.value
const year = (t) => t && parseInt(t.time.slice(0, t.time.indexOf('-', 1)), 10)
const when = (t) => {
  const y = year(t)
  if (t.precision >= 9) return y < 0 ? `${-y} BCE` : String(y)
  if (t.precision === 8) return `${y}s`
  const c = Math.ceil(Math.abs(y) / 100)
  const th = c % 10 === 1 && c !== 11 ? 'st' : c % 10 === 2 && c !== 12 ? 'nd' : c % 10 === 3 && c !== 13 ? 'rd' : 'th'
  return `${c}${th} century${y < 0 ? ' BCE' : ''}`
}

const rows = []
for (const [id, [q, k]] of todo) {
  const e = ents[q]
  const o = OVR[id] ?? {}
  const name = e?.labels?.en?.value ?? e?.labels?.es?.value
  let at = first(e, 'P625')
  if (!at) for (const p of ['P276', 'P131']) { const v = first(e, p); const r = v && ref[v.id]; if (r && first(r, 'P625')) { at = first(r, 'P625'); break } }
  const born = first(e, 'P571') ?? first(e, 'P1619')
  const gone = first(e, 'P576') ?? first(e, 'P582')
  const place = o.p ?? [label((first(e, 'P131') ?? first(e, 'P276'))?.id), label(first(e, 'P17')?.id)].filter(Boolean).join(', ')
  const why = [!name && 'label', !at && 'coordinates', !born && !o.y && 'inception (P571)', !place && 'place'].filter(Boolean)
  if (why.length) { console.log('SKIP', id, q, name ?? '', 'missing', why.join(', ')); continue }
  const lost = o.lost ?? (gone ? year(gone) : undefined)
  rows.push({
    id, n: name, p: place, lat: +at.latitude.toFixed(4), lon: +at.longitude.toFixed(4), k,
    y: o.y ?? year(born), yl: o.yl ?? (lost ? `${when(born)} to ${when(gone)}` : when(born)),
    ...(lost && { lost }), tier: lost ? 'lost' : 'later', ev: o.ev ?? (first(e, 'P625') ? 'known' : 'probable'), phase: 'later', wd: q,
  })
}

for (const r of rows) console.log(JSON.stringify(r))
console.log(rows.length, 'rows ready,', todo.length - rows.length, 'skipped')
if (process.argv.includes('--write') && rows.length) {
  writeFileSync(P, JSON.stringify([...libs, ...rows], null, 1) + '\n')
  console.log('wrote', rows.length, 'rows. Add these to WD in fix-libs.mjs:', rows.map((r) => `${r.id}: "${r.wd}"`).join(', '))
}
