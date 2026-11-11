// Writes public/book/<id>/orig/: the Greek or Latin original, aligned to the on-site translation by book.
// Source XML (Perseus Project TEI) is fetched once into SRC. Runs as build step 22, after 20-books rewrites public/book/.
import { mkdirSync } from 'node:fs'

const root = new URL('../../', import.meta.url).pathname
const SRC = process.env.SRC ?? root + '.cache/parallel'
const P = 'https://github.com/PerseusDL'
const LICENCE = 'CC BY-SA 4.0 (Perseus Project, Tufts University; repository licence of canonical-greekLit and canonical-latinLit)'
const WORKS: Record<string, { file: string; lang: 'la' | 'grc'; title: string; author: string; edition: string; source: string }> = {
  aeneid: { file: 'aeneid.xml', lang: 'la', title: 'Aeneid', author: 'Virgil', edition: 'J. B. Greenough, The Bucolics, Aeneid, and Georgics of Virgil (Boston: Ginn and Company, 1900), Perseus phi0690.phi003.perseus-lat2', source: `${P}/canonical-latinLit/blob/master/data/phi0690/phi003/phi0690.phi003.perseus-lat2.xml` },
  iliad: { file: 'iliad.xml', lang: 'grc', title: 'Ἰλιάς', author: 'Homer', edition: 'D. B. Monro and T. W. Allen, Homeri Opera, Editio Tertia (Oxford: Clarendon Press, 1908-1920), Perseus tlg0012.tlg001.perseus-grc2', source: `${P}/canonical-greekLit/blob/master/data/tlg0012/tlg001/tlg0012.tlg001.perseus-grc2.xml` },
  odyssey: { file: 'odyssey.xml', lang: 'grc', title: 'Ὀδύσσεια', author: 'Homer', edition: 'D. B. Monro and T. W. Allen, Homeri Opera, Editio Tertia (Oxford: Clarendon Press, 1908-1920), Perseus tlg0012.tlg002.perseus-grc2', source: `${P}/canonical-greekLit/blob/master/data/tlg0012/tlg002/tlg0012.tlg002.perseus-grc2.xml` },
}

const ROMAN: Record<string, number> = { I: 1, V: 5, X: 10, L: 50 }
export const roman = (s: string) => {
  const m = s.match(/^\s*(?:book\s+)?([IVXL]+)\.?\s*$/i)
  if (!m) return 0
  const v = [...m[1].toUpperCase()].map((c) => ROMAN[c])
  return v.reduce((n, x, i) => n + (x < (v[i + 1] ?? 0) ? -x : x), 0)
}
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const unesc = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
export const line = (l: string) => esc(unesc(l.replace(/<note[\s\S]*?<\/note>/g, '').replace(/<choice>[\s\S]*?<reg[^>]*>([\s\S]*?)<\/reg>[\s\S]*?<\/choice>/g, '$1').replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim())

// Book n of the XML -> html of its lines.
export const books = (xml: string) => {
  const out = new Map<number, string>()
  const starts = [...xml.matchAll(/<div\b[^>]*>/g)].filter((m) => /type="textpart"/.test(m[0]) && /subtype="[Bb]ook"/.test(m[0]))
  starts.forEach((m, i) => {
    const n = +(m[0].match(/\bn="(\d+)"/)?.[1] ?? 0)
    const body = xml.slice(m.index!, starts[i + 1]?.index ?? xml.length)
    const ls = [...body.matchAll(/<l\b[^>]*>([\s\S]*?)<\/l>/g)].map((x) => line(x[1])).filter(Boolean)
    out.set(n, `<p class="verse">${ls.join('<br>')}</p>`)
  })
  return out
}

export const build = async () => {
  for (const [id, w] of Object.entries(WORKS)) {
    const src = Bun.file(`${SRC}/${w.file}`)
    let xml = (await src.exists()) ? await src.text() : ''
    if (!xml) {
      const r = await fetch(w.source.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/'))
      if (!r.ok) throw new Error(`${id}: ${r.status} fetching original`)
      await Bun.write(src, (xml = await r.text()))
    }
    const bk = books(xml)
    const meta = await Bun.file(`${root}public/book/${id}/meta.json`).json()
    const dir = `${root}public/book/${id}/orig`
    mkdirSync(dir, { recursive: true })
    let aligned = 0
    for (let n = 1; n <= meta.parts; n++) {
      const part = await Bun.file(`${root}public/book/${id}/${n}.json`).json()
      const chapters = part.chapters.map((c: { title: string }) => {
        const html = bk.get(roman(c.title))
        if (html) aligned++
        return { title: c.title, html: html ?? '' }
      })
      await Bun.write(`${dir}/${n}.json`, JSON.stringify({ chapters }))
    }
    await Bun.write(`${dir}/meta.json`, JSON.stringify({ lang: w.lang, title: w.title, author: w.author, edition: w.edition, source: w.source, licence: LICENCE, granularity: 'book', translationLang: 'en', aligned, parts: meta.parts }))
    await Bun.write(`${root}public/book/${id}/meta.json`, JSON.stringify({ ...meta, orig: true }))
    console.log(`${id}: ${aligned}/${bk.size} books aligned`)
  }
}
if (import.meta.main) await build()
