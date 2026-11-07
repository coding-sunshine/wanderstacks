import { basename } from 'node:path'

const BASES = new Set(['measured', 'photo-estimate', 'excavated', 'attested', 'comparandum', 'invented'])
export type Facts = { lib: string; source: string; status: string; value: string; quote?: string }[]

export function checkHall(lib: string, hall: Record<string, any>, facts: Facts): string[] {
  const errors: string[] = []
  const passing = facts.filter((f) => f.lib === lib && f.status === 'passing')
  for (const [k, p] of Object.entries(hall)) {
    const bad = (rule: string, why: string) => errors.push(`${rule}: ${lib}.hall.${k} ${why}`)
    if (!BASES.has(p.basis)) {
      bad('unknown-basis', `basis "${p.basis}"`)
      continue
    }
    if (p.basis === 'comparandum' && !(typeof p.building === 'string' && p.building.trim())) bad('comparandum-no-building', 'needs a building')
    if (p.basis !== 'measured' && p.basis !== 'excavated' && p.basis !== 'attested') continue
    const same = passing.filter((f) => f.source === p.src)
    if (p.basis !== 'attested' && !(typeof p.src === 'string' && p.src.startsWith('https://')))
      bad('measured-no-src', `${p.basis} needs an https src`)
    if (!same.length) bad('src-no-fact', `${p.basis} src has no passing fact: ${p.src}`)
    if (p.basis === 'attested') continue
    const needle = String(p.v).toLowerCase()
    if (same.length && !same.some((f) => `${f.value}\n${f.quote ?? ''}`.toLowerCase().includes(needle)))
      bad('number-not-in-quote', `${p.v} not found in any passing fact quote from ${p.src}`)
  }
  return errors
}

if (import.meta.main) {
  const facts: Facts = (await Bun.file(new URL('../../data/facts.json', import.meta.url).pathname).json()).facts
  let failed = false
  for (const file of Bun.argv.slice(2)) {
    const json = await Bun.file(file).json()
    for (const e of checkHall(json.lib ?? basename(file, '.json'), json.hall, facts)) {
      console.error(`${file}: ${e}`)
      failed = true
    }
  }
  process.exit(failed ? 1 : 0)
}
