// Book text is searchable: a Pagefind bundle with one record per run of chapters, URLs the reader opens, grouped results UI.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
const dist = process.env.DIST ?? 'dist'
const fail = (m: string): never => { console.error('FAIL b2-concordance: ' + m); process.exit(1) }
const dir = `${dist}/pagefind-books`
if (!existsSync(`${dir}/pagefind.js`)) fail(`${dir}/pagefind.js missing (run scripts/concordance/build.ts after pagefind)`)
const books = JSON.parse(readFileSync(`${dir}/books.json`, 'utf8'))
if (Object.keys(books).length < 100) fail(`books.json lists only ${Object.keys(books).length} books`)
const frags = readdirSync(`${dir}/fragment`)
if (frags.length < 1000) fail(`only ${frags.length} fragments`)
const seen = new Set<string>()
for (const f of frags) {
  const d = JSON.parse(gunzipSync(readFileSync(`${dir}/fragment/${f}`)).subarray(12).toString())
  const m = d.url.match(/^\/read\/([\w-]+)\?part=(\d+)&ch=(\d+)&to=(\d+)$/)
  if (!m) fail(`fragment url not a reader url: ${d.url}`)
  if (d.meta.book !== m![1] || !books[m![1]] || !d.meta.title || !d.meta.chapter) fail(`bad meta on ${d.url}`)
  seen.add(m![1])
}
if (seen.size < 100) fail(`fragments cover only ${seen.size} books`)
if (!frags.some((f) => /^en_/.test(f))) fail('no english fragments')
const s = readFileSync(`${dist}/search/index.html`, 'utf8')
const js = [...s.matchAll(/src="(\/_astro\/[^"]+\.js)"/g)].map((m) => readFileSync(dist + m[1], 'utf8')).join('') + s
for (const k of ['pagefind-books', 'books.json']) if (!js.includes(k)) fail(`search page does not load ${k}`)
if (!/data-w="conc"/.test(s) || !/data-w="books"/.test(s)) fail('search page has no books/concordance views')
const r = readdirSync(`${dist}/_astro`).filter((f) => /^reader\..*\.js$/.test(f)).map((f) => readFileSync(`${dist}/_astro/${f}`, 'utf8')).join('')
if (!/URLSearchParams/.test(r) || !/<mark>/.test(r)) fail('reader does not read the URL or mark matches')
console.log(`ok b2-concordance: ${frags.length} fragments, ${seen.size} books, reader urls valid, grouped and concordance views present`)
