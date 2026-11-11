// /calendar/ lists every closure, reopening, damage, destruction and rebuilding event once, filterable, and flags closed-now.
import { readFileSync } from 'node:fs'
const dist = process.env.DIST ?? 'dist'
const fail = (m: string): never => { console.error('FAIL b8-calendar: ' + m); process.exit(1) }
const kinds = ['closed', 'sealed', 'reopened', 'damaged', 'destroyed', 'lost', 'rebuilt']
const want = JSON.parse(readFileSync('data/facts.json', 'utf8')).events.filter((e: any) => e.status !== 'failing' && kinds.includes(e.kind)).length
const h = readFileSync(`${dist}/calendar/index.html`, 'utf8')
const tl = h.match(/<ol class="time facts"[\s\S]*?<\/ol>/)?.[0] ?? fail('no timeline')
const got = (tl.match(/<li class="fact"/g) ?? []).length
if (got !== want) fail(`timeline has ${got} entries, data has ${want}`)
if ((tl.match(/href="\/libraries\/[^"#]+\/#e-/g) ?? []).length !== got) fail('entries not all linked to a library fact anchor')
if (!/Closed now and closing soon/.test(h) || !/closed now, since/.test(h)) fail('closed-now block missing')
if ((h.match(/data-g="[a-z]+"/g) ?? []).length < 5) fail('filters missing')
console.log(`ok b8-calendar: ${got} events in timeline, closed-now block present`)
