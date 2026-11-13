import { readFileSync } from 'node:fs'

const fail = (message: string): never => (console.error(message), process.exit(1))
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8')) as Record<string, any>[]
const tours = read('data/tours.json')
for (const tour of tours) {
  if (!tour.id || !tour.lib || !/^https?:\/\//.test(tour.url)) fail(`invalid external tour: ${tour.id}`)
  if (!tour.checked || !tour.provider || !tour.note) fail(`incomplete external tour: ${tour.id}`)
}
const concordance = read('data/concordance.json')
const hotspots = JSON.parse(readFileSync('data/hotspots.json', 'utf8'))
for (const link of concordance) {
  const spot = hotspots[link.lib]?.nodes?.[link.node]?.find((h: any) => h.id === link.spot)
  if (!spot) fail(`${link.lib}/${link.node}/${link.spot}: concordance target missing`)
  if (!link.relationship || !link.href) fail(`${link.lib}/${link.spot}: relationship and honest identification note required`)
  if (link.manifest && !/^https?:\/\//.test(link.manifest)) fail(`${link.lib}/${link.spot}: invalid manifest`)
}
const phases = JSON.parse(readFileSync('data/phases.json', 'utf8'))
for (const [lib, entries] of Object.entries(phases)) {
  if (!Array.isArray(entries) || entries.length < 2) fail(`${lib}: at least two phases required`)
  for (const phase of entries as Record<string, any>[]) {
    if (!phase.id || !phase.label || !phase.source.startsWith('https://') || !phase.note) fail(`${lib}: incomplete phase`)
  }
}
const conservation = read('data/conservation.json')
for (const entry of conservation) {
  if (!(entry.start <= entry.end) || !entry.source.startsWith('https://') || !entry.captureNeeded) fail(`${entry.lib}: invalid conservation watch`)
}
console.log(`connected features: ${tours.length} tours, ${concordance.length} concordance links, ${conservation.length} conservation watches`)
