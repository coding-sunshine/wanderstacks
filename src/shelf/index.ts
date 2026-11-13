import { clean, decode, encode, load, merge, save, type Shelf } from '../site/shelves'
import type { Mount } from '../types'

type Item = { kind: string; title: string; sub: string; href: string }

const SECTIONS: [string, string][] = [
  ['book', 'Books you can open here'],
  ['scan', 'Manuscript scans'],
  ['card', 'Catalogue cards'],
]

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = '') => {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text) e.textContent = text
  return e
}
const link = (it: { href: string; title: string; sub: string }) => {
  const a = el('a')
  a.href = it.href
  if (!it.href.startsWith('/')) a.target = '_blank'
  a.rel = 'noopener'
  a.append(el('span', 'shelf-t', it.title), el('span', 'shelf-s', it.sub))
  return a
}
const btn = (text: string, on: () => void, label = '') => {
  const b = el('button', 'btn', text)
  b.type = 'button'
  if (label) b.setAttribute('aria-label', label)
  b.onclick = on
  return b
}

// Your shelves (src/site/shelves.ts): filled from "Add to a shelf" on library and book pages, or kept from a shared #s= link.
function yours(): HTMLElement {
  const box = el('section', 'shelf-mine')
  const head = el('h2', 'eyebrow shelf-h')
  head.tabIndex = -1
  const body = el('div')
  const say = el('p', 'shelf-say')
  say.setAttribute('role', 'status')
  const file = el('input')
  file.type = 'file'
  file.accept = '.json,application/json'
  file.hidden = true
  box.append(head, body, say, file)

  const share = async (s: Shelf) => {
    const url = `${location.origin}/shelf/#s=${encode(s)}`
    try {
      await navigator.clipboard.writeText(url)
      say.textContent = `Link to “${s.name}” copied.`
    } catch {
      say.textContent = `Copy this link: ${url}`
    }
  }
  const exportAll = () => {
    const a = el('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ shelves: load() }, null, 2)], { type: 'application/json' }))
    a.download = 'wanderstacks-shelves.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  file.onchange = async () => {
    const f = file.files?.[0]
    file.value = ''
    if (!f) return
    let add: Shelf[] = []
    try {
      if (f.size < 2e6) {
        const x = JSON.parse(await f.text())
        add = clean(x?.shelves ?? x)
      }
    } catch {}
    if (add.length) save(merge(load(), add))
    say.textContent = add.length ? `Imported ${add.length === 1 ? 'one shelf' : `${add.length} shelves`}.` : 'That file holds no Wanderstacks shelves.'
    draw('')
  }

  // focus: after a change, put focus on that shelf's heading ('' = the section heading) so it is not lost with the removed button.
  const draw = (focus?: string) => {
    const all = load()
    head.textContent = `Your shelves · ${all.length}`
    const out: Node[] = []
    if (location.hash.startsWith('#s=')) {
      const shared = decode(location.hash.slice(3))
      const card = el('div', 'shelf-card shelf-shared')
      if (!shared) card.append(el('p', 'shelf-lede', 'This shared shelf link is incomplete. Ask for it again.'))
      else {
        const ul = el('ul', 'shelf-ul')
        for (const it of shared.items) ul.appendChild(el('li')).append(link(it))
        const keep = btn('Keep this shelf', () => {
          save(merge(load(), [shared]))
          history.replaceState(null, '', location.pathname + location.search)
          say.textContent = `Kept “${shared.name}” on your shelves.`
          draw(shared.name)
        })
        card.append(el('h3', 'shelf-name', `Shared with you: ${shared.name} · ${shared.items.length}`), ul, keep)
      }
      out.push(card)
    }
    for (const s of all) {
      const h = el('h3', 'shelf-name', `${s.name} · ${s.items.length}`)
      h.dataset.name = s.name
      h.tabIndex = -1
      const ul = el('ul', 'shelf-ul')
      for (const it of s.items) {
        const rm = btn('Remove', () => {
          s.items = s.items.filter((i) => i !== it)
          save(all)
          draw(s.name)
        }, `Remove ${it.title} from ${s.name}`)
        ul.appendChild(el('li')).append(link(it), rm)
      }
      const row = el('p', 'shelf-row')
      row.append(
        btn('Copy share link', () => share(s), `Copy a share link for ${s.name}`),
        btn('Delete shelf', () => {
          if (!confirm(`Delete the shelf “${s.name}”? This cannot be undone.`)) return
          save(all.filter((x) => x !== s))
          say.textContent = `Deleted “${s.name}”.`
          draw('')
        }, `Delete the shelf ${s.name}`),
      )
      const card = el('div', 'shelf-card')
      card.append(h, s.items.length ? ul : el('p', 'shelf-lede', 'Empty for now.'), row)
      out.push(card)
    }
    if (!out.length) out.push(el('p', 'shelf-lede', 'Nothing here yet. Use “Add to a shelf” on any library or book page.'))
    const tools = el('p', 'shelf-row')
    if (all.length) tools.append(btn('Export shelves', exportAll))
    tools.append(btn('Import shelves', () => file.click()))
    out.push(tools)
    body.replaceChildren(...out)
    if (focus !== undefined) ([...body.querySelectorAll<HTMLElement>('h3')].find((x) => x.dataset.name === focus) ?? head).focus()
  }
  draw()
  return box
}

export const mount: Mount = (app) => {
  const root = document.createElement('section')
  root.className = 'page shelf'
  root.dataset.view = 'shelf'
  const head = document.createElement('h1')
  head.className = 'shelf-title'
  head.textContent = 'The reading list'
  const lede = document.createElement('p')
  lede.className = 'shelf-lede'
  lede.textContent = 'Every readable book and honest catalogue card in Wanderstacks. ' + 'Scans and texts keep their holders’ licences.'
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
  root.append(head, lede, keep, yours(), filter, list)
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
        ul.appendChild(el('li')).append(link(it))
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
