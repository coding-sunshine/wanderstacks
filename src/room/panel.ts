import { basisLabel, type Library, type Param } from '../types'

const ISSUES = 'https://github.com/coding-sunshine/worldlibs/issues/new'

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, string> = {}, ...kids: (Node | string)[]) {
  const e = document.createElement(tag)
  for (const [k, v] of Object.entries(props)) k === 'class' ? (e.className = v) : e.setAttribute(k, v)
  e.append(...kids)
  return e
}

const link = (href: string, text: string, external = true) =>
  el('a', external ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href }, text)

function report(lib: Library, field: string, value: string, source: string | null) {
  const body = `Library: ${lib.id}\nField: ${field}\nValue shown: ${value}\nSource: ${source ?? 'none'}\n\nWhat is wrong:\n`
  const q = new URLSearchParams({ title: `Mistake: ${lib.id} / ${field}`, body })
  return link(`${ISSUES}?${q}`, 'Report a mistake')
}

const host = (u: string) => new URL(u).hostname.replace(/^www\./, '')

const PARAMS: [keyof Library['hall'], string, string][] = [
  ['length', 'Length', ' m'], ['width', 'Width', ' m'], ['height', 'Height', ' m'],
  ['vault', 'Vault', ''], ['storeys', 'Storeys', ''], ['baysPerSide', 'Bays per side', ''],
  ['alcoveDepth', 'Alcove depth', ' m'], ['galleryHeight', 'Gallery height', ' m'], ['domes', 'Domes', ''],
  ['windows', 'Windows', ''], ['shelfUnit', 'Shelf unit', ''], ['wood', 'Wood', ''],
  ['floor', 'Floor', ''], ['light', 'Light', ''],
]

function show(v: unknown, unit: string) {
  if (v && typeof v === 'object') {
    const u = v as { width: number; shelves: number }
    return `${u.width} m wide, ${u.shelves} shelves`
  }
  return `${v}${unit}`
}

export function buildPanel(lib: Library) {
  const section = (title: string, ...kids: Node[]) => el('section', {}, el('h2', {}, title), ...kids)

  const facts = el('ul', { class: 'room-facts' })
  for (const f of lib.facts) {
    facts.append(el('li', {}, el('span', { class: 'k' }, f.field), ' ', f.value, ' ',
      el('span', { class: 'src' }, link(f.source, host(f.source)), ' · ', report(lib, f.field, f.value, f.source))))
  }

  const hall = el('dl', { class: 'room-hall' })
  for (const [key, name, unit] of PARAMS) {
    const p = lib.hall[key] as Param<unknown>
    const label = basisLabel(p)
    const dd = el('dd', { 'data-param': key }, show(p.v, unit))
    if (label) dd.append(' ', el('span', { class: 'basis' }, label))
    dd.append(' ', el('span', { class: 'src' }, p.src.startsWith('http') ? link(p.src, 'source') : p.src))
    hall.append(el('dt', {}, name), dd)
  }

  const shelves = el('ul', { class: 'room-shelves' })
  for (const s of lib.shelves) {
    const by = s.author ? ` by ${s.author}` : ''
    if (s.tier === 'readable-text') {
      shelves.append(el('li', { class: 'readable', 'data-shelf': s.id }, link(`/read/${s.id}`, s.title, false), by, ' ',
        el('span', { class: 'src' }, report(lib, 'shelf', s.title, null))))
    } else {
      const card = el('li', { class: 'card', 'data-shelf': s.id }, el('strong', {}, s.title), by,
        el('div', {}, `Catalogue card${s.shelfmark ? ` · ${s.shelfmark}` : ''} · no scan here`))
      if (s.url) card.append(link(s.url, 'See it at the library'), ' · ')
      card.append(report(lib, 'shelf', s.title, s.url))
      shelves.append(card)
    }
  }

  const credits = el('ul', { class: 'room-credits' })
  for (const c of lib.credits) {
    credits.append(el('li', {}, `${c.file}, ${c.author}, ${c.licence} · `, link(c.url, host(c.url))))
  }

  const panel = el('aside', { id: 'room-panel', class: 'room-panel', 'aria-label': `About ${lib.name}` },
    el('h1', {}, lib.name), el('p', { class: 'where' }, `${lib.place} · ${lib.years}`),
    section('Facts', facts),
    section('The hall, measured and guessed', hall),
    section('Shelves', shelves),
    section('Photographs used to estimate the hall', credits),
    el('p', {}, report(lib, 'room', 'general', null), ' · ', link('/byrne', "Byrne's Euclid, a living page", false)),
  )
  return panel
}
