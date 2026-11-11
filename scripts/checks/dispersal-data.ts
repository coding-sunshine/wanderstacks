// Shared by the dispersal checks: loads data/dispersal.json and fails on any malformed row.
import { readFileSync } from 'node:fs'

export const fail = (m: string): never => (console.error(m), process.exit(1))
export const dist = process.env.DIST ?? 'dist'
export const rows: any[] = JSON.parse(readFileSync('data/dispersal.json', 'utf8'))
const ids = new Set<string>(JSON.parse(readFileSync('data/libs.json', 'utf8')).map((l: any) => l.id))
const tiers = new Set(['primary', 'secondary', 'wikipedia', 'unproven'])
rows.forEach((r, i) => {
  const at = `dispersal.json[${i}] (${r.lib}/${r.holder})`
  if (!ids.has(r.lib)) fail(`${at}: lib not in libs.json`)
  for (const k of ['holder', 'place', 'what']) if (typeof r[k] !== 'string' || !r[k].trim()) fail(`${at}: missing ${k}`)
  if (!tiers.has(r.tier)) fail(`${at}: bad tier ${r.tier}`)
  if (!/^https?:\/\/[^ ]+$/.test(r.source ?? '')) fail(`${at}: source is not a URL`)
  if (!(typeof r.lat === 'number' && r.lat >= -90 && r.lat <= 90)) fail(`${at}: lat out of range`)
  if (!(typeof r.lon === 'number' && r.lon >= -180 && r.lon <= 180)) fail(`${at}: lon out of range`)
  if (r.count != null && !(Number.isInteger(r.count) && r.count > 0)) fail(`${at}: count is not a positive integer`)
  if (r.manifest != null && !/^https?:\/\//.test(r.manifest)) fail(`${at}: manifest is not a URL`)
})
const dup = rows.map((r) => `${r.lib}|${r.holder}`).find((k, i, a) => a.indexOf(k) !== i)
if (dup) fail(`duplicate row ${dup}`)

/** Rendered section of a library page; every holder of that library must be in it. */
export function section(lib: string, min: number) {
  const mine = rows.filter((r) => r.lib === lib)
  if (mine.length < min) fail(`${lib}: ${mine.length} holders in dispersal.json, need at least ${min}`)
  const html = readFileSync(`${dist}/libraries/${lib}/index.html`, 'utf8')
  if (!html.includes('id="dispersal"') || !html.includes('Where the books are now')) fail(`${dist}/libraries/${lib}/index.html has no dispersal section`)
  const esc = (s: string) => s.replace(/&/g, '&amp;')
  for (const r of mine) if (!html.includes(`<b>${esc(r.holder)}</b>`) && !html.includes(r.holder)) fail(`${lib}: holder ${r.holder} missing from the page`)
  for (const r of mine) if (!html.includes(`href="${esc(r.source)}"`)) fail(`${lib}: source link for ${r.holder} missing from the page`)
  return mine.length
}
