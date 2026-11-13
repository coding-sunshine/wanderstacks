// Build-time data access for the static pages. Reads the checked-in JSON once.
import { existsSync, readFileSync, readdirSync } from 'node:fs'

const read = <T>(p: string, fallback: T): T => (existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as T) : fallback)

export interface Lib {
  id: string; n: string; p: string; lat: number; lon: number; k: string; y: number; yl: string
  tier: string; ev: string; st?: string; dim?: string; vol?: string; book?: string; read?: string; wd?: string
}
export interface Photo { f: string; w: number; h: number; cap: string; by: string; lic: string; src: string }
export interface Fact { lib: string; field: string; value: string; source: string; tier: string; status?: string }
export interface Event { lib: string; kind: string; year: number | null; label: string; source: string; status?: string }
export type Rights = 'open' | 'nc' | 'link-only'
export interface Book {
  id: string; title: string; author?: string; date?: string; lang?: string; lib: string | null
  holder: string; shelfmark?: string; kind: string; rights: Rights
  read?: { type: 'iiif' | 'text' | 'link'; url: string }; thumb?: string; src: string; wd?: string; why?: string
}
export interface SphereNode {
  id: string; f: string; w: number; h: number; kind: 'interior' | 'exterior'; real: boolean; basis?: string
  cap: string; by: string; lic: string; src: string; yaw0?: number; links?: { to: string; yaw: number }[]
}

export const libs = read<Lib[]>('data/libs.json', [])
export const libById = new Map(libs.map((l) => [l.id, l]))
export const photos = read<Record<string, { out: Photo[]; in: Photo[] }>>('data/photos.json', {})
type Spheres = Record<string, { nodes: SphereNode[] }>
/** Real panoramas (written by scripts/spheres/ingest.ts) first, then hand-kept imagined ones. */
export const spheres: Spheres = read<Spheres>('data/spheres.json', {})
for (const [id, r] of Object.entries(read<Spheres>('data/recon.json', {}))) spheres[id] = { nodes: [...(spheres[id]?.nodes ?? []), ...r.nodes] }

const f = read<{ facts: Fact[]; events: Event[] }>('data/facts.json', { facts: [], events: [] })
const ok = (x: { status?: string }) => x.status !== 'failing'
export const factsOf = (id: string) => f.facts.filter((x) => x.lib === id && ok(x))
export const eventsOf = (id: string) =>
  f.events.filter((x) => x.lib === id && ok(x)).sort((a, b) => (a.year ?? 0) - (b.year ?? 0))

type Legacy = {
  id: string; lib: string | null; title: string; author: string | null; date: string | null; holder: string
  shelfmark: string | null; catalogue_url: string | null; access: string; why?: string; source?: string
  read?: { kind: string; url: string | null; licence?: string | null }
}
const fromLegacy = (b: Legacy): Book => ({
  id: b.id, title: b.title, author: b.author ?? undefined, date: b.date ?? undefined, lib: b.lib,
  holder: b.holder, shelfmark: b.shelfmark ?? undefined, why: b.why,
  kind: b.access === 'readable-text' ? 'text' : 'manuscript',
  rights: b.access === 'readable-text' ? 'open' : 'link-only',
  read: b.read?.url ? { type: b.read.kind === 'iiif' ? 'iiif' : b.access === 'readable-text' ? 'text' : 'link', url: b.read.url } : undefined,
  src: b.catalogue_url ?? b.source ?? '',
})

const ndjson = 'data/catalogue.ndjson'
export const books: Book[] = existsSync(ndjson)
  ? readFileSync(ndjson, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l) as Book)
  : read<{ books: Legacy[] }>('data/books.json', { books: [] }).books.map(fromLegacy)
export const booksOf = (id: string) => books.filter((b) => b.lib === id)

const dirs = (p: string) => new Set(existsSync(p) ? readdirSync(p).filter((x) => !x.includes('.')) : [])
const texts = dirs('public/book')
const scans = dirs('public/scan')
/** Where this book can be read without leaving the site, if anywhere. */
export const readHere = (id: string) => (texts.has(id) ? `/read/${id}/` : scans.has(id) ? `/scan/${id}/` : null)

export const lost = (l: Lib) => l.tier === 'lost'
export const year = (y: number) => (y < 0 ? `${-y} BC` : String(y))
export const country = (l: Lib) => l.p.split(',').pop()!.trim()
/** The best single photograph for a library: inside first, then outside. */
export const lead = (id: string): Photo | undefined => photos[id]?.in[0] ?? photos[id]?.out[0]
const captured = read<{ lib: string; status: string }[]>('data/captures.json', [])
/** What a visitor can actually see for this library, most real first. */
export function seeing(id: string) {
  const n = spheres[id]?.nodes ?? []
  return {
    walk: n.filter((x) => x.real).length,
    capture: captured.some((c) => c.lib === id && c.status === 'ready') ? 1 : 0,
    recon: n.filter((x) => !x.real).length,
    photos: (photos[id]?.in.length ?? 0) + (photos[id]?.out.length ?? 0),
  }
}

type Cited = { s: number[] }
export interface BookContent {
  id: string; summary: string; context: string; sources: { title: string; url: string }[]
  people: ({ name: string; role: string; note: string } & Cited)[]
  places: ({ name: string; lat: number; lon: number; note: string } & Cited)[]
  timeline: ({ year: number; label: string } & Cited)[]
  ideas: ({ title: string; note: string } & Cited)[]
  passages?: { part: number; chapter: string; quote: string; why: string }[]
  pages?: ({ n: number; note: string } & Cited)[]
}
/** Researched notes for one book, when they exist. */
export const bookContent = (id: string) => read<BookContent | null>(`data/bookcontent/${id}.json`, null)
export interface TextMeta { title: string; author: string; edition: string; licence: string; source: string; parts: number }
export const textMeta = (id: string) => read<TextMeta | null>(`public/book/${id}/meta.json`, null)
export interface ScanMeta {
  title: string; date: string; holder: string; licence: string; deed?: string; credit: string
  pages: { s: string; w: number; h: number; l: string }[]
}
export const scanMeta = (id: string) => read<ScanMeta | null>(`public/scan/${id}/pages.json`, null)
/** Word count of every chapter of an on-site text, in reading order. */
export function shape(id: string) {
  const out: { title: string; words: number }[] = []
  for (let n = 1; n <= (textMeta(id)?.parts ?? 0); n++) {
    const part = read<{ chapters: { title: string; html: string }[] }>(`public/book/${id}/${n}.json`, { chapters: [] })
    for (const c of part.chapters) {
      const words = c.html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
      if (words > 0) out.push({ title: c.title, words })
    }
  }
  return out
}
/** Sort key for a title: leading article dropped. */
export const sortKey = (t: string) => t.replace(/^(the|a|an)\s+/i, '').replace(/^[^\p{L}\p{N}]+/u, '')
export const letter = (t: string) => { const c = sortKey(t)[0]?.normalize('NFD')[0]?.toUpperCase() ?? '#'; return /[A-Z]/.test(c) ? c : '#' }
