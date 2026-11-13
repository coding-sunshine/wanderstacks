import { books, sortKey, type Book } from './data'

// Topic pages group the catalogue by author, century and language. A topic needs at least two books.
export type Facet = 'author' | 'century' | 'language'
export interface Topic { facet: Facet; key: string; name: string; order: number | string; books: Book[] }

const ord = (n: number) => `${n}${[11, 12, 13].includes(n % 100) ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`

/** Century of a catalogue date: positive AD, negative BC, null when the date names no year or century. */
export function century(date?: string): number | null {
  if (!date) return null
  // The first number decides: an ordinal ("13th c.") is the century, anything else a year.
  const y = /(-)?(\d{1,4})(st|nd|rd|th)?/i.exec(date)
  if (!y) return null
  // It is BC when negative or the first era written after it is BC or BCE.
  const bc = !!y[1] || /\b(BCE?|CE|AD)\b/.exec(date.slice(y.index + y[0].length))?.[1]?.startsWith('B') === true
  const n = y[3] ? Number(y[2]) : Math.max(1, Math.ceil(Number(y[2]) / 100))
  return bc ? -n : n
}
export const centuryName = (c: number) => `${ord(Math.abs(c))} century${c < 0 ? ' BC' : ''}`
const centuryKey = (c: number) => `${ord(Math.abs(c))}${c < 0 ? '-bc' : ''}`

const langs = new Intl.DisplayNames(['en'], { type: 'language' })
export const languageName = (code: string) => { try { return langs.of(code) ?? code } catch { return code } }

/** "Last, First[, Title]" read as "First Last"; titles ("Emperor of Rome", "Sir", "tr.") dropped, epithets ("the Elder") kept. */
const person = (a: string) => {
  const [last, first, , ...rest] = a.replace(/\s*\([^)]*\)/g, '').split(/,\s*/)
  if (!first || rest.length) return a
  if (/^(active|tr\.|trans\.)/.test(first) || /^[A-Z]\S* of /.test(first)) return last!
  if (/^[a-z]/.test(first)) return `${last} ${first}`
  return first.endsWith(` ${last}`) ? first : `${first} ${last}`
}
/** Catalogue spellings of one author, read as the name their shelf goes by. */
const alias: Record<string, string | string[]> = {
  'Fyodor Dostoyevsky': 'Fyodor Dostoevsky',
  'Friedrich Wilhelm Nietzsche': 'Friedrich Nietzsche',
  'Miguel de Cervantes Saavedra': 'Miguel de Cervantes',
  'Marcus Tullius Cicero': 'Cicero',
  'Pedanius Dioscorides': 'Dioscorides',
  'J. Sheridan Le Fanu': 'Joseph Sheridan Le Fanu',
  'H. C. Andersen': 'Hans Christian Andersen',
  'Nikolai Vasilevich Gogol': 'Nikolai Gogol',
  'Mary Wollstonecraft Shelley': 'Mary Shelley',
  'Sunzi': 'Sun Tzu',
  'Charlotte Bronte': 'Charlotte Brontë',
  'Niccolo Machiavelli': 'Niccolò Machiavelli',
  'Jacob and Wilhelm Grimm': ['Jacob Grimm', 'Wilhelm Grimm'],
}
/** Each named author of a book; anonymous and collective names are left out. */
export const authorsOf = (b: Book) =>
  (b.author ?? '').split(';').map((a) => a.trim()).filter((a) => a && !/^(various|anon|unknown)/i.test(a)).map(person).flatMap((a) => alias[a] ?? a)
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const keysOf = (b: Book): [Facet, string, string, number | string][] => {
  const c = century(b.date)
  return [
    ...authorsOf(b).map((a): [Facet, string, string, string] => ['author', slug(a), a, sortKey(a.split(' ').pop()!)]),
    ...(c == null ? [] : [['century', centuryKey(c), centuryName(c), c] as [Facet, string, string, number]]),
    ...(b.lang ? [['language', b.lang, languageName(b.lang), languageName(b.lang)] as [Facet, string, string, string]] : []),
  ]
}

const all = new Map<string, Topic>()
for (const b of books) for (const [facet, key, name, order] of keysOf(b)) {
  const id = `${facet}/${key}`
  if (!all.has(id)) all.set(id, { facet, key, name, order, books: [] })
  all.get(id)!.books.push(b)
}
const byOrder = (a: Topic, b: Topic) =>
  a.facet.localeCompare(b.facet) || (typeof a.order === 'number' ? a.order - (b.order as number) : a.order.localeCompare(String(b.order)))
export const topics = [...all.values()].filter((t) => t.books.length >= 2).sort(byOrder)
const live = new Set(topics.map((t) => `${t.facet}/${t.key}`))
export const facetName: Record<Facet, string> = { author: 'Authors', century: 'Centuries', language: 'Languages' }

/** Links from a book to the topic pages it belongs to. */
export const topicsOf = (b: Book) => keysOf(b).filter(([f, k]) => live.has(`${f}/${k}`)).map(([f, k, name]) => ({ href: `/books/${f}/${k}/`, name: f === 'author' ? `More by ${name}` : name }))
