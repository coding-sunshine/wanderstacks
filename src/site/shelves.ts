// Your shelves: named lists of library and book pages, kept in this browser under wl.shelves.
// A shelf travels as a /shelf/#s= link or, all shelves at once, as an exported JSON file.
export type Entry = { href: string; title: string; sub: string }
export type Shelf = { name: string; items: Entry[] }

const KEY = 'wl.shelves'
const str = (x: unknown, max: number) => (typeof x === 'string' ? x.trim().slice(0, max) : '')
// Shared links and imported files are untrusted: keep only same-site paths, so a shelf can never link off-site or run script.
const path = (x: unknown) => (typeof x === 'string' && x.length <= 300 && /^\/(?![/\\])[^\s\\]*$/.test(x) ? x : '')

export function clean(x: unknown): Shelf[] {
  if (!Array.isArray(x)) return []
  const out: Shelf[] = []
  for (const s of x.slice(0, 50)) {
    const name = str(s?.name, 80)
    if (!name || out.some((o) => o.name === name)) continue
    const items: Entry[] = []
    for (const i of Array.isArray(s.items) ? s.items.slice(0, 500) : []) {
      const href = path(i?.href), title = str(i?.title, 200)
      if (href && title && !items.some((o) => o.href === href)) items.push({ href, title, sub: str(i?.sub, 200) })
    }
    out.push({ name, items })
  }
  return out
}

export const load = (): Shelf[] => {
  try {
    return clean(JSON.parse(localStorage.getItem(KEY) ?? '[]'))
  } catch {
    return []
  }
}
export const save = (shelves: Shelf[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(shelves))
  } catch {}
}

// Same-named shelves combine; an entry already on the shelf is not added twice.
export function merge(mine: Shelf[], add: Shelf[]): Shelf[] {
  const out = mine.map((s) => ({ ...s, items: [...s.items] }))
  for (const s of add) {
    const at = out.find((o) => o.name === s.name)
    if (!at) out.push(s)
    else for (const i of s.items) if (!at.items.some((o) => o.href === i.href)) at.items.push(i)
  }
  return out
}

// base64url of compact UTF-8 JSON: {n: name, i: [[href, title, sub], ...]}.
export function encode(s: Shelf): string {
  let bin = ''
  for (const b of new TextEncoder().encode(JSON.stringify({ n: s.name, i: s.items.map((e) => [e.href, e.title, e.sub]) }))) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
export function decode(code: string): Shelf | undefined {
  try {
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
    const o = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))))
    const items = Array.isArray(o?.i) ? o.i.map((e: unknown) => (Array.isArray(e) ? { href: e[0], title: e[1], sub: e[2] } : {})) : []
    return clean([{ name: o?.n, items }])[0]
  } catch {
    return undefined
  }
}
