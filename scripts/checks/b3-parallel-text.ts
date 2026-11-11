// Three or more translated books carry an aligned public-domain original; the reader offers a toggle only for them.
import { readFileSync, existsSync, readdirSync } from 'node:fs'
const dist = process.env.DIST ?? 'dist'
const fail = (m: string): never => { console.error('FAIL b3-parallel-text: ' + m); process.exit(1) }
const j = (p: string) => JSON.parse(readFileSync(`${dist}/${p}`, 'utf8'))
const got: string[] = []
for (const id of readdirSync(`${dist}/book`).filter((x) => !x.includes('.'))) {
  if (!existsSync(`${dist}/book/${id}/orig/meta.json`)) continue
  const om = j(`book/${id}/orig/meta.json`), m = j(`book/${id}/meta.json`)
  for (const k of ['lang', 'title', 'edition', 'source', 'licence', 'granularity']) if (!om[k]) fail(`${id} orig meta lacks ${k}`)
  if (!/^(la|grc)$/.test(om.lang)) fail(`${id} lang ${om.lang}`)
  let real = 0
  for (let n = 1; n <= m.parts; n++) {
    const o = j(`book/${id}/orig/${n}.json`), t = j(`book/${id}/${n}.json`)
    if (o.chapters.length !== t.chapters.length) fail(`${id} part ${n}: ${o.chapters.length} original chapters vs ${t.chapters.length}`)
    real += o.chapters.filter((c: any) => c.html.length > 200).length
  }
  if (!real) fail(`${id} original is empty`)
  got.push(`${id}(${om.lang},${real} chapters)`)
}
if (got.length < 3) fail(`only ${got.length} books with originals`)
const r = readdirSync(`${dist}/_astro`).filter((f) => /^reader\..*\.js$/.test(f)).map((f) => readFileSync(`${dist}/_astro/${f}`, 'utf8')).join('')
if (!r.includes('orig/meta.json') || !r.includes('rd-orig') || !/\.lang\s*=/.test(r)) fail('reader lacks the original panel, lang attributes or meta probe')
if (!/data-orig/.test(readFileSync('src/reader/reader.css', 'utf8'))) fail('no side/only layout css')
console.log(`ok b3-parallel-text: ${got.join(', ')}`)
