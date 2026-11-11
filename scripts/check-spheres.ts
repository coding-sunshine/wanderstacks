// bun scripts/check-spheres.ts : exits 1 unless every lost library has a labelled reconstruction and no standing library has one.
import { existsSync, readFileSync } from 'node:fs'

type Node = { id: string; f: string; kind: string; real: boolean; basis?: string; by: string; lic: string; src: string; cap: string }
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const real: Record<string, { nodes: Node[] }> = read('data/spheres.json')
const recon: Record<string, { nodes: Node[] }> = read('data/recon.json')
const bad: string[] = []

for (const [lib, { nodes }] of Object.entries(recon)) for (const n of nodes) {
  const at = `${lib}/${n.id}`
  if (n.real !== false) bad.push(`${at}: reconstruction must have real: false`)
  if ((n.basis ?? '').trim().length < 40) bad.push(`${at}: needs a basis saying what is sourced and what is guessed`)
  if (!/not a photograph/i.test(n.lic)) bad.push(`${at}: lic must say "not a photograph"`)
  for (const k of ['by', 'src', 'cap'] as const) if (!n[k]?.trim()) bad.push(`${at}: empty ${k}`)
  for (const s of ['', '-lo']) if (!existsSync(`public${n.f}${s}.webp`)) bad.push(`${at}: missing public${n.f}${s}.webp`)
}

const libs = read('data/libs.json') as { id: string; lost?: unknown }[]
// No source read describes a plan, room or material for the House of Wisdom, and Gutas disputes it was a building at all, so it gets no imagined view.
const noView = new Set(['baghdad'])
const missing = libs.filter((l) => l.lost && !noView.has(l.id) && !recon[l.id]?.nodes.length).map((l) => l.id)
if (missing.length) bad.push(`${missing.length} lost libraries with no reconstruction: ${missing.join(' ')}`)
// Owner decision: a building that still stands is shown in real photographs only.
for (const l of libs) if (!l.lost && recon[l.id]) bad.push(`${l.id}: still stands, must not carry an imagined view`)

if (bad.length) { console.error(bad.join('\n')); process.exit(1) }
console.log(`ok: ${Object.keys(recon).length} reconstructions, every lost library covered`)
