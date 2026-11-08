import { go } from './app'

type Item = { kind: string; title: string; sub: string; href: string }

let items: Item[] | null = null
let box: HTMLElement | null = null
let input: HTMLInputElement | null = null
let list: HTMLElement | null = null
let on = -1
let shown: Item[] = []

const load = async () => {
  if (!items) items = await fetch('/lib/catalog.json').then((r) => r.json())
  return items
}

const rank = (q: string, it: Item) => {
  const t = it.title.toLowerCase()
  const s = it.sub.toLowerCase()
  if (t.startsWith(q)) return 0
  if (t.includes(q)) return 1
  if (s.includes(q)) return 2
  return 3
}

const render = () => {
  if (!list || !input) return
  const q = input.value.trim().toLowerCase()
  const all = items ?? []
  shown = q
    ? all.map((it) => ({ it, r: rank(q, it) })).filter((x) => x.r < 3).sort((a, b) => a.r - b.r || a.it.title.localeCompare(b.it.title)).map((x) => x.it)
    : all.filter((it) => it.kind === 'room')
  on = shown.length ? 0 : -1
  draw()
}

const draw = () => {
  if (!list) return
  const q = input!.value.trim().toLowerCase()
  list.replaceChildren()
  let lastKind = ''
  shown.slice(0, 12).forEach((it, i) => {
    if (it.kind !== lastKind) {
      lastKind = it.kind
      const h = document.createElement('li')
      h.className = 'palette-head micro'
      h.textContent = it.kind === 'room' ? 'Libraries' : it.kind === 'book' ? 'Books' : it.kind === 'scan' ? 'Manuscript scans' : 'Catalogue cards'
      list!.append(h)
    }
    const li = document.createElement('li')
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'palette-item'
    b.dataset.on = String(i === on)
    const t = document.createElement('span')
    t.className = 'palette-title'
    t.textContent = it.title
    const s = document.createElement('span')
    s.className = 'palette-sub'
    s.textContent = it.sub
    b.append(t, s)
    b.addEventListener('click', () => pick(it))
    li.append(b)
    list!.append(li)
  })
  if (q && !shown.length) {
    const li = document.createElement('li')
    li.className = 'palette-empty'
    li.textContent = 'Not on any shelf'
    list.append(li)
  }
}

const pick = (it: Item) => {
  close()
  if (it.href.startsWith('/')) go(it.href)
  else window.open(it.href, '_blank', 'noopener')
}

const open = async () => {
  await load()
  if (!box) {
    box = document.createElement('div')
    box.className = 'palette'
    box.setAttribute('role', 'dialog')
    box.setAttribute('aria-label', 'Search WorldLibs')
    const card = document.createElement('div')
    card.className = 'palette-card'
    input = document.createElement('input')
    input.type = 'search'
    input.placeholder = 'Search libraries and books…'
    input.setAttribute('aria-label', 'Search libraries and books')
    list = document.createElement('ul')
    list.className = 'palette-list'
    card.append(input, list)
    box.append(card)
    box.addEventListener('click', (e) => {
      if (e.target === box) close()
    })
    input.addEventListener('input', render)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') (on = Math.min(on + 1, shown.length - 1)), draw()
      else if (e.key === 'ArrowUp') (on = Math.max(on - 1, 0)), draw()
      else if (e.key === 'Enter' && on >= 0) pick(shown[on]!)
      else if (e.key === 'Escape') close()
      else return
      e.preventDefault()
    })
    document.body.append(box)
  }
  box.hidden = false
  input!.value = ''
  render()
  input!.focus()
}

const close = () => {
  if (box) box.hidden = true
  ;(document.activeElement as HTMLElement | null)?.blur?.()
}

export const attachPalette = () => {
  document.getElementById('navsearch')?.addEventListener('click', open)
  addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      open()
    }
  })
}
