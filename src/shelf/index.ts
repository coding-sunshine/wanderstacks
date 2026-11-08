import type { Mount } from '../types'

type Item = { kind: string; title: string; sub: string; href: string }

const SECTIONS: [string, string][] = [
  ['book', 'Books you can open here'],
  ['scan', 'Manuscript scans'],
  ['card', 'Catalogue cards'],
]

export const mount: Mount = (app) => {
  const root = document.createElement('section')
  root.className = 'page shelf'
  root.dataset.view = 'shelf'
  const head = document.createElement('h1')
  head.className = 'shelf-title'
  head.textContent = 'The reading list'
  const lede = document.createElement('p')
  lede.className = 'shelf-lede'
  lede.textContent = 'Every readable book and honest catalogue card in WorldLibs. ' + 'Scans and texts keep their holders’ licences.'
  const keep = document.createElement('a')
  keep.href = '/book'
  keep.className = 'shelf-keep'
  keep.textContent = 'Your keepsakes: passport stamps and the visitors’ book →'
  const filter = document.createElement('input')
  filter.type = 'search'
  filter.className = 'shelf-filter'
  filter.placeholder = 'Filter the shelves…'
  filter.setAttribute('aria-label', 'Filter the reading list')
  const list = document.createElement('div')
  list.className = 'shelf-list'
  root.append(head, lede, keep, filter, list)
  app.append(root)

  let items: Item[] = []
  const draw = () => {
    const q = filter.value.trim().toLowerCase()
    list.replaceChildren()
    for (const [kind, title] of SECTIONS) {
      const rows = items.filter((i) => i.kind === kind && (!q || `${i.title} ${i.sub}`.toLowerCase().includes(q)))
      if (!rows.length) continue
      const h = document.createElement('h2')
      h.className = 'eyebrow shelf-h'
      h.textContent = `${title} · ${rows.length}`
      const ul = document.createElement('ul')
      ul.className = 'shelf-ul'
      for (const it of rows) {
        const li = document.createElement('li')
        const a = document.createElement('a')
        a.href = it.href
        if (!it.href.startsWith('/')) a.target = '_blank'
        a.rel = 'noopener'
        const t = document.createElement('span')
        t.className = 'shelf-t'
        t.textContent = it.title
        const s = document.createElement('span')
        s.className = 'shelf-s'
        s.textContent = it.sub
        a.append(t, s)
        li.append(a)
        ul.append(li)
      }
      list.append(h, ul)
    }
    if (q && !list.childElementCount) {
      const p = document.createElement('p')
      p.className = 'shelf-lede'
      p.textContent = 'Not on any shelf.'
      list.append(p)
    }
  }
  filter.addEventListener('input', draw)
  fetch('/lib/catalog.json')
    .then((r) => r.json())
    .then((all: Item[]) => {
      items = all.filter((i) => i.kind !== 'room')
      draw()
      root.dataset.ready = 'true'
    })
    .catch(() => {
      root.textContent = 'The shelves could not be loaded.'
      root.dataset.ready = 'true'
    })
}
