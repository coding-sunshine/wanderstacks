// Every fact chunk carries a citation block with claim, library, source, tier, check date and anchored page URL.
import { readFileSync } from 'node:fs'
const dist = process.env.DIST ?? 'dist'
const fail = (m: string): never => { console.error('FAIL b6-cite-fact: ' + m); process.exit(1) }
const date = JSON.parse(readFileSync('data/facts.json', 'utf8')).generated.slice(0, 10)
let n = 0
for (const id of ['longroom', 'alexandria', 'loc']) {
  const h = readFileSync(`${dist}/libraries/${id}/index.html`, 'utf8')
  const chunks = [...h.matchAll(/<li class="fact" id="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g)]
  if (!chunks.length) fail(`${id}: no chunks`)
  for (const [, fid, body] of chunks) {
    const pre = body.match(/<details class="fcite"><summary>Cite<\/summary><pre>([\s\S]*?)<\/pre>/)?.[1]
    if (!pre) fail(`${id}#${fid}: no cite block`)
    const t = pre!.replace(/&#38;|&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"')
    if (!/Source: \S+/.test(t) || !/Evidence tier: (primary|secondary|wikipedia|unproven)/.test(t) || !t.includes(`Last checked: ${date}`) || !t.includes(`/libraries/${id}/#${fid}`)) fail(`${id}#${fid}: incomplete citation`)
    if (!/data-copy/.test(body)) fail(`${id}#${fid}: no copy button`)
    n++
  }
}
if (!/navigator\.clipboard/.test(readFileSync(`${dist}/libraries/loc/index.html`, 'utf8') + readdirAll(dist + '/_astro'))) fail('no clipboard script')
console.log(`ok b6-cite-fact: ${n} citations on 3 pages, date ${date}`)
function readdirAll(d: string) {
  const { readdirSync } = require('node:fs')
  return (readdirSync(d) as string[]).filter((f) => f.endsWith('.js')).map((f) => readFileSync(`${d}/${f}`, 'utf8')).join('\n')
}
