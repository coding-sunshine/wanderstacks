// Second Pagefind bundle: records for book text, so a phrase can be found inside the books.
// Run after `pagefind --site dist`; writes <DIST>/pagefind-books/ and books.json (id -> title, author).
import * as pagefind from 'pagefind'
import { readdirSync } from 'node:fs'

const root = new URL('../../', import.meta.url).pathname
const out = (process.env.DIST ?? root + 'dist').replace(/\/$/, '') + '/pagefind-books'
const RUN = 60_000 // characters per record
// Same text under two ids (Standard Ebooks and Gutenberg copies): index one.
const SAME = new Set([
  'alexandre-dumas-the-count-of-monte-cristo-chapman-and-hall', 'alexandre-dumas-the-three-musketeers-william-robson',
  'plato-dialogues-benjamin-jowett', 'marcus-aurelius-meditations-george-long', 'peabody-don-quixote-ormsby',
])
const plain = (h: string) => h.replace(/<[^>]*>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

const { index } = await pagefind.createIndex({})
if (!index) throw new Error('pagefind createIndex failed')
const dir = root + 'public/book/'
const books: Record<string, { title: string; author: string | null }> = {}
let records = 0
for (const id of readdirSync(dir).filter((x) => !x.includes('.') && !SAME.has(x)).sort()) {
  const meta = await Bun.file(`${dir}${id}/meta.json`).json()
  books[id] = { title: meta.title, author: meta.author }
  for (let n = 1; n <= meta.parts; n++) {
    const part = await Bun.file(`${dir}${id}/${n}.json`).json()
    // Runs of consecutive chapters share a record to keep the bundle to about two thousand files.
    // The reader finds the exact page from the matched words, searching chapters ch..to of the part.
    let run: { ch: number; title: string; text: string }[] = []
    let size = 0
    const flush = async () => {
      if (!run.length) return
      const first = run[0], last = run.at(-1)!
      const r = await index.addCustomRecord({
        url: `/read/${id}?part=${n}&ch=${first.ch}&to=${last.ch}`,
        content: run.map((c) => c.text).join('\n'),
        language: 'en',
        meta: { title: meta.title, author: meta.author ?? '', chapter: first === last ? first.title : `${first.title} to ${last.title}`, book: id },
        filters: { book: [id], ...(meta.author ? { author: [meta.author] } : {}) },
      })
      if (r.errors.length) throw new Error(`${id}: ${r.errors.join('; ')}`)
      records++
      run = []
      size = 0
    }
    for (const [ch, c] of part.chapters.entries()) {
      const text = plain(c.html)
      if (!text) continue
      run.push({ ch, title: c.title, text })
      size += text.length
      if (size >= RUN) await flush()
    }
    await flush()
  }
}
const w = await index.writeFiles({ outputPath: out })
if (w.errors.length) throw new Error(w.errors.join('; '))
await Bun.write(out + '/books.json', JSON.stringify(books))
await pagefind.close()
console.log(`concordance: ${records} records from ${Object.keys(books).length} books -> ${out}`)
