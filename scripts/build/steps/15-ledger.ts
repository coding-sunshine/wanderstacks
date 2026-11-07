const root = new URL('../../../', import.meta.url).pathname
const read = (p: string) => Bun.file(root + p).json()

const facts: any[] = (await read('data/facts.json')).facts
const seen: Record<string, number> = {}
const rows = facts
  .filter((f) => f.lib === 'alexandria' && f.status === 'passing')
  .map((f) => ({
    id: `${f.field}-${(seen[f.field] = (seen[f.field] ?? 0) + 1)}`,
    class: f.field === 'volumes' ? 'disputed' : f.field === 'built' || f.field === 'remains_today' ? 'unknown' : 'attested',
    field: f.field,
    value: f.value,
    source: f.source,
    tier: f.tier,
  }))

const { myth, correction, links } = await read('data/ledger/alexandria.json')
for (const id of links) if (!rows.some((r) => r.id === id)) throw new Error(`data/ledger/alexandria.json: link "${id}" is not a ledger row`)

await Bun.write(root + 'public/lib/alexandria-ledger.json', JSON.stringify({ rows, myth, correction, links }))
