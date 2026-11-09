import type { Mount } from '../types'

type Pin = { id: string; n: string; p: string; href: string | null }
type Stamp = { id: string; at: number }
type Book = { name: string; entries: { id: string; at: number }[] }
type Read = { id: string; title: string; at: number }

const read = <T>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '') ?? fallback
  } catch {
    return fallback
  }
}

export const mount: Mount = (app) => {
  const root = document.createElement('section')
  root.className = 'page book'
  root.dataset.view = 'book'
  app.append(root)

  const head = document.createElement('h1')
  head.className = 'shelf-title'
  head.textContent = 'Your keepsakes'
  const lede = document.createElement('p')
  lede.className = 'shelf-lede'
  lede.textContent = 'A passport stamp for every library you have walked into, ' + 'and your name in each visitors’ book. Kept only in this browser.'

  const h1 = document.createElement('h2')
  h1.className = 'eyebrow shelf-h'
  const grid = document.createElement('ul')
  grid.className = 'passport'
  const h2 = document.createElement('h2')
  h2.className = 'eyebrow shelf-h'
  h2.textContent = 'The visitors’ book'
  const nameLabel = document.createElement('label')
  nameLabel.className = 'micro book-label'
  nameLabel.textContent = 'Sign as'
  const name = document.createElement('input')
  name.type = 'text'
  name.maxLength = 40
  name.className = 'book-name'
  name.placeholder = 'Your name'
  name.setAttribute('aria-label', 'Your name for the visitors’ book')
  name.value = read<{ name?: string }>('wl.bookv2', {}).name ?? ''
  name.addEventListener('change', () => {
    const book = read<Book>('wl.bookv2', { name: '', entries: [] })
    book.name = name.value.trim()
    localStorage.setItem('wl.bookv2', JSON.stringify(book))
  })
  nameLabel.append(name)
  const ledger = document.createElement('ul')
  ledger.className = 'ledger'
  const hReads = document.createElement('h2')
  hReads.className = 'eyebrow shelf-h'
  const readsUl = document.createElement('ul')
  readsUl.className = 'ledger'
  root.append(head, lede, h1, grid, hReads, readsUl, h2, nameLabel, ledger)

  fetch('/lib/pins.json')
    .then((r) => r.json())
    .then((pins: Pin[]) => {
      const stamps = read<Stamp[]>('wl.passport', [])
      const byId = new Map(stamps.map((s) => [s.id, s]))
      h1.textContent = `Library passport · ${stamps.length} of ${pins.length}`
      for (const pin of pins) {
        const li = document.createElement('li')
        li.className = 'passport-cell'
        const got = byId.get(pin.id)
        const b = document.createElement('a')
        b.href = pin.href ?? '/'
        const stamp = document.createElement('span')
        stamp.className = 'stamp passport-stamp' + (got ? ' stamp--gilt' : ' stamp--dim')
        stamp.textContent = got ? 'Visited' : 'Not yet'
        const n = document.createElement('span')
        n.className = 'passport-name'
        n.textContent = pin.n
        const d = document.createElement('span')
        d.className = 'passport-date'
        d.textContent = got ? new Date(got.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : pin.p
        b.append(stamp, n, d)
        li.append(b)
        grid.append(li)
      }
      const reads = read<Read[]>('wl.reads', [])
      hReads.textContent = `Books finished · ${reads.length}`
      for (const r of [...reads].reverse()) {
        const li = document.createElement('li')
        li.className = 'ledger-row'
        const a = document.createElement('a')
        a.href = `/read/${r.id}`
        a.textContent = r.title
        li.append(a, ` · ${new Date(r.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`)
        readsUl.append(li)
      }
      if (!reads.length) {
        const li = document.createElement('li')
        li.className = 'ledger-row'
        li.textContent = 'No books finished yet — pull one from a shelf and read to the end.'
        readsUl.append(li)
      }
      const book = read<Book>('wl.bookv2', { name: '', entries: [] })
      const names = new Map(pins.map((p) => [p.id, p.n]))
      for (const e of [...book.entries].reverse()) {
        const li = document.createElement('li')
        li.className = 'ledger-row'
        li.textContent = `${names.get(e.id) ?? e.id} · ${new Date(e.at).toLocaleString()}`
        ledger.append(li)
      }
      if (!book.entries.length) {
        const li = document.createElement('li')
        li.className = 'ledger-row'
        li.textContent = 'No entries yet — walk into a library and it signs itself.'
        ledger.append(li)
      }
      root.dataset.ready = 'true'
    })
    .catch(() => {
      root.textContent = 'The keepsakes could not be loaded.'
      root.dataset.ready = 'true'
    })
}
