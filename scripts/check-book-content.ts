// Decides p6-book-content: every book readable on this site has researched content that holds up.
// Usage: bun scripts/check-book-content.ts [id ...]   (no ids = every book in public/book and public/scan)
import { existsSync, readFileSync, readdirSync } from 'node:fs'

const strip = (h: string) => h.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
const text = (id: string, part: number) => {
  const p = `public/book/${id}/${part}.json`
  if (!existsSync(p)) return null
  const j = JSON.parse(readFileSync(p, 'utf8')) as { chapters: { title: string; html: string }[] }
  return strip(j.chapters.map((c) => `${c.title} ${c.html}`).join(' '))
}
const url = (u: unknown) => typeof u === 'string' && /^https:\/\/\S+$/.test(u)
const str = (s: unknown, min: number) => typeof s === 'string' && s.trim().length >= min

const texts = readdirSync('public/book').filter((x) => !x.includes('.'))
const scans = existsSync('public/scan') ? readdirSync('public/scan').filter((x) => !x.includes('.')) : []
const want = process.argv.slice(2)
const ids = want.length ? want : [...texts, ...scans]
const bad: string[] = []

for (const id of ids) {
  const fail = (m: string) => bad.push(`${id}: ${m}`)
  const p = `data/bookcontent/${id}.json`
  if (!existsSync(p)) { fail('no content file'); continue }
  let c: any
  try { c = JSON.parse(readFileSync(p, 'utf8')) } catch { fail('not JSON'); continue }
  if (c.id !== id) fail('id mismatch')
  if (!str(c.summary, 240)) fail('summary under 240 characters')
  if (!str(c.context, 240)) fail('context under 240 characters')
  if (!Array.isArray(c.sources) || c.sources.length < 2 || !c.sources.every((s: any) => url(s.url) && str(s.title, 3))) fail('needs 2+ sources with https url and title')
  const n = (c.sources ?? []).length
  const cited = (x: any) => Array.isArray(x.s) && x.s.length > 0 && x.s.every((i: number) => Number.isInteger(i) && i >= 0 && i < n)
  for (const k of ['people', 'places', 'timeline', 'ideas'] as const) {
    if (!Array.isArray(c[k])) { fail(`${k} missing`); continue }
    if (!c[k].every(cited)) fail(`${k}: every entry cites sources by index in "s"`)
  }
  if ((c.people?.length ?? 0) < 3) fail('fewer than 3 people')
  if ((c.timeline?.length ?? 0) < 3) fail('fewer than 3 timeline entries')
  if ((c.ideas?.length ?? 0) < 3) fail('fewer than 3 ideas')
  if (!(c.timeline ?? []).every((t: any) => Number.isInteger(t.year) && str(t.label, 8))) fail('timeline entries need integer year and label')
  if (!(c.places ?? []).every((x: any) => str(x.name, 2) && Math.abs(x.lat) <= 90 && Math.abs(x.lon) <= 180 && str(x.note, 8))) fail('places need name, lat, lon, note')
  if (texts.includes(id)) {
    if (!Array.isArray(c.passages) || c.passages.length < 4) { fail('fewer than 4 passages'); continue }
    for (const q of c.passages) {
      const t = text(id, q.part)
      if (t === null) fail(`passage part ${q.part} does not exist`)
      else if (!str(q.quote, 40) || !t.includes(q.quote.replace(/\s+/g, ' ').trim())) fail(`passage not verbatim in part ${q.part}: "${String(q.quote).slice(0, 50)}"`)
      if (!str(q.why, 20)) fail('passage needs "why"')
    }
  } else {
    const pages = JSON.parse(readFileSync(`public/scan/${id}/pages.json`, 'utf8'))
    const count = Array.isArray(pages) ? pages.length : (pages.pages?.length ?? 0)
    if (!Array.isArray(c.pages) || c.pages.length < Math.min(3, count)) { fail('fewer than 3 pages to look at'); continue } // a single-sheet scan has only 2 sides
    for (const g of c.pages) if (!Number.isInteger(g.n) || g.n < 0 || g.n >= count || !cited(g) || !str(g.note, 20)) fail(`page entry invalid: ${JSON.stringify(g).slice(0, 80)}`)
  }
}
console.log(bad.join('\n') || 'ok')
console.log(`${ids.length - new Set(bad.map((b) => b.split(':')[0])).size}/${ids.length} books pass`)
process.exit(bad.length ? 1 : 0)
