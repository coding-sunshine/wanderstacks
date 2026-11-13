import { mkdir, rm } from 'node:fs/promises'
import type { BookMeta, BookPart } from '../../../src/types'

const root = new URL('../../../', import.meta.url).pathname
const UA = 'WorldLibs-build/1.0 (static reading-room site; open source, MIT)'
const PART_BYTES = 180_000
const books: any[] = (await Bun.file(root + 'data/books.json').json()).books

const SKIP_SECTIONS = /\b(titlepage|imprint|colophon|copyright-page|toc|halftitlepage|endnotes|loi|uncopyright|dedication-page)\b/
const SKIP_CLASS = /\b(footnotes|pg-boilerplate|pgheader|pgfooter|transnote)\b/
const VOID = new Set(['br', 'hr', 'img', 'meta', 'link', 'input', 'col', 'wbr'])
const ENT: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç',
  ouml: 'ö', uuml: 'ü', auml: 'ä', iuml: 'ï', ecirc: 'ê', acirc: 'â', ocirc: 'ô', icirc: 'î', ucirc: 'û', aelig: 'æ', oelig: 'œ',
  deg: '°', sect: '§', para: '¶', middot: '·', times: '×', frac12: '½', thinsp: ' ', ensp: ' ', emsp: ' ',
}
const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z0-9]+);/gi, (m, e: string) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
    return ENT[e] ?? ENT[e.toLowerCase()] ?? m
  })
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

interface Chapter { title: string; level: number; html: string }

function sanitise(src: string, fallbackTitle: string): Chapter[] {
  const chapters: Chapter[] = []
  let cur: Chapter = { title: fallbackTitle, level: 0, html: '' }
  const push = () => {
    if (cur.html && !/^contents\.?$/i.test(cur.title)) chapters.push(cur)
  }
  let skip: { tag: string; depth: number } | null = null
  let p: string | null = null
  let heading: { level: number; text: string } | null = null
  let quote = 0
  let speaker = false

  const flushP = () => {
    if (p === null) return
    const t = p.replace(/\s+/g, ' ').replace(/(<br>\s*)+$/g, '').replace(/^\s+|\s+$/g, '')
    if (t.replace(/<[^>]*>/g, '').trim()) cur.html += `<p>${t}</p>`
    p = null
  }
  const closeHeading = () => {
    if (!heading) return
    const title = heading.text.replace(/\s+/g, ' ').trim()
    const { level } = heading
    heading = null
    if (!title) return
    if (level > 3) { cur.html += `<h4>${esc(title)}</h4>`; return }
    if (!cur.html && cur.level) {
      cur.title = !/^contents/i.test(cur.title) && level >= 2 && cur.level >= 2 && level > cur.level ? `${cur.title}: ${title}` : title
      cur.level = level
      return
    }
    push()
    cur = { title, level, html: '' }
  }

  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)/g
  for (const m of src.matchAll(re)) {
    const [, close, rawTag, attrs = '', text] = m
    if (text !== undefined) {
      if (skip) continue
      const t = esc(decode(text))
      if (heading) heading.text += decode(text)
      else if (p !== null) p += t
      else if (t.trim()) p = t
      continue
    }
    if (!rawTag) continue
    const tag = rawTag.toLowerCase()
    if (skip) {
      if (tag === skip.tag && !VOID.has(tag)) {
        skip.depth += close ? -1 : 1
        if (skip.depth === 0) skip = null
      }
      continue
    }
    if (!close) {
      const type = /epub:type="([^"]*)"/.exec(attrs)?.[1] ?? ''
      const cls = /class="([^"]*)"/.exec(attrs)?.[1] ?? ''
      const internal = tag === 'a' && /href="#/.test(attrs)
      if (
        ['script', 'style', 'head', 'nav', 'figure', 'aside'].includes(tag) ||
        internal ||
        (tag === 'section' && SKIP_SECTIONS.test(type)) ||
        SKIP_CLASS.test(cls) ||
        (tag === 'header' && /pg-boilerplate/.test(attrs))
      ) {
        if (!VOID.has(tag)) skip = { tag, depth: 1 }
        continue
      }
    }
    if (/^h[1-6]$/.test(tag)) {
      flushP()
      if (close) closeHeading()
      else heading = { level: +tag[1], text: '' }
      continue
    }
    if (heading) continue
    switch (tag) {
      case 'p': case 'li': case 'div': case 'pre': case 'section': case 'tr':
        flushP()
        if (!close && (tag === 'p' || tag === 'li' || tag === 'tr')) p = ''
        break
      // Standard Ebooks sets plays and dialogues as tables: speaker cell, then speech cell
      case 'td': case 'th':
        if (p === null) p = ''
        if (!close) { speaker = /z3998:persona/.test(attrs); if (speaker) p += '<strong>' }
        else { p += speaker ? '</strong> ' : ' '; speaker = false }
        break
      case 'blockquote':
        flushP()
        if (close) { if (quote > 0) { quote--; cur.html += '</blockquote>' } }
        else { quote++; cur.html += '<blockquote>' }
        break
      case 'br':
        if (p !== null) p += '<br>'
        break
      case 'em': case 'i': case 'cite': case 'var': case 'strong': case 'b': {
        if (p === null) { if (close) break; p = '' }
        const t = tag === 'strong' || tag === 'b' ? 'strong' : 'em'
        p += close ? `</${t}>` : `<${t}>`
        break
      }
    }
  }
  flushP()
  closeHeading()
  push()
  while (quote-- > 0) chapters[chapters.length - 1].html += '</blockquote>'
  return chapters
}

function splitParts(id: string, chapters: Chapter[]) {
  const size = (c: { title: string; html: string }) => Buffer.byteLength(JSON.stringify(c))
  const groups: { title: string; html: string }[][] = [[]]
  let bytes = 0
  const add = (c: { title: string; html: string }) => {
    const n = size(c)
    if (bytes + n > PART_BYTES && groups.at(-1)!.length) { groups.push([]); bytes = 0 }
    groups.at(-1)!.push(c)
    bytes += n
  }
  for (const c of chapters) {
    if (size(c) <= PART_BYTES - 2000) { add(c); continue }
    const paras = c.html.match(/<p>[\s\S]*?<\/p>|<\/?blockquote>|<h4>[\s\S]*?<\/h4>/g) ?? []
    let acc = ''
    let k = 0
    const flush = () => {
      if (acc) add({ title: k++ ? `${c.title} (continued)` : c.title, html: acc })
      acc = ''
    }
    for (const q of paras) {
      if (Buffer.byteLength(JSON.stringify(acc + q)) > PART_BYTES - 4000) flush()
      acc += q
    }
    flush()
  }
  const of = groups.length
  return groups.map((chs, i): BookPart => ({ book: id, part: i + 1, of, chapters: chs }))
}

const cache = root + '.cache/books/'
await mkdir(cache, { recursive: true })
let lastFetch = 0
async function download(url: string, file: string) {
  const f = Bun.file(cache + file)
  if (await f.exists()) return f.text()
  const wait = lastFetch + 1000 - Date.now()
  if (wait > 0) await Bun.sleep(wait)
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })
  lastFetch = Date.now()
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`)
  const text = await r.text()
  await Bun.write(cache + file, text)
  return text
}

const SLICES: Record<string, [RegExp, RegExp]> = {
  'burke-sublime': [/<h2><a id="A_PHILOSOPHICAL_INQUIRY"/, /<h2><a id="A_SHORT_ACCOUNT_OF_A_LATE_SHORT_ADMINISTRATION"/],
}

const rows = books.filter((b) => b.tier === 'readable-text')
const failed: string[] = []
const SKIPPED = new Set(['wikisource'])

// Wrap plain full text (archive.org djvu.txt) in paragraphs for the sanitiser.
const plainToHtml = (t: string) =>
  t
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .split(/\n\s*\n+/)
    .map((p) => `<p>${p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()}</p>`)
    .join('\n')

for (const b of rows) {
  try {
    if (SKIPPED.has(b.read?.kind)) {
      console.log(`books: ${b.id} skipped (${b.read?.kind} lives outside the reader)`)
      continue
    }
    const seBase: string | undefined = [b.read?.se_url, b.read?.url].find((u) => u?.startsWith('https://standardebooks.org/'))
    const pgIds = (b.read?.id ? String(b.read.id).split(/\s*;\s*/) : ((b.read?.pg_ids ?? []) as unknown[]).map(String)).filter(Boolean)
    let html: string
    if (seBase) html = await download(seBase.replace(/\/$/, '') + '/text/single-page', `${b.id}.se.html`)
    else if (b.read?.url?.endsWith('.txt')) html = plainToHtml(await download(b.read.url, `${b.id}.txt`))
    else if (pgIds.length) {
      html = (
        await Promise.all(
          pgIds.map(async (id) => {
            const one = await download(`https://www.gutenberg.org/cache/epub/${id}/pg${id}-images.html`, `${b.id}.${id}.pg.html`)
            // Cut after the START marker's closing *** so the licence line never reaches the reader.
            const a = one.search(/\*\*\* ?START OF/)
            const z = one.search(/\*\*\* ?END OF/)
            const body = one.indexOf('***', a + 3)
            if (a < 0 || z < 0 || body < 0) throw new Error('Gutenberg start/end markers not found')
            return one.slice(body + 3, z)
          }),
        )
      ).join('\n')
    } else throw new Error('no usable source URL in data/books.json')

    if (seBase) html = html.slice(html.indexOf('<main'), html.lastIndexOf('</main>'))
    else if (!b.read?.url?.endsWith('.txt')) {
      // single-volume PG rows built above already sliced; nothing more here
    }
    const s = SLICES[b.id]
    if (s) {
      const a = html.search(s[0]), z = html.search(s[1])
      if (a < 0 || z < 0) throw new Error('slice markers not found')
      html = html.slice(a, z)
    }

    const chapters = sanitise(html, b.title)
    // Transcriber colophons (Availability, Metadata, Revision History...) close some PG texts; they are not the book.
    const colophon = chapters.findIndex((c) => /^colophon\b/i.test(c.title))
    if (colophon > 0) chapters.length = colophon
    if (!chapters.length) throw new Error('no text extracted')
    const parts = splitParts(b.id, chapters)

    const dir = root + `public/book/${b.id}/`
    await rm(dir, { recursive: true, force: true })
    const toc: BookMeta['toc'] = []
    for (const p of parts) {
      await Bun.write(dir + `${p.part}.json`, JSON.stringify(p))
      for (const c of p.chapters) toc.push({ title: c.title, part: p.part })
    }
    const meta: BookMeta = {
      id: b.id,
      title: b.title,
      author: b.author ?? null,
      edition: b.read.edition,
      licence: b.read.licence,
      source: seBase ?? b.read.url,
      parts: parts.length,
      toc,
    }
    await Bun.write(dir + 'meta.json', JSON.stringify(meta))
    console.log(`books: ${b.id} ${chapters.length} chapters, ${parts.length} parts`)
  } catch (e) {
    failed.push(`${b.id}: ${(e as Error).message}`)
  }
}
if (failed.length) throw new Error('books step failed:\n' + failed.join('\n'))
