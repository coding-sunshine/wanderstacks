import type { Mount } from '../types'
import './place.css'

type Fact = { field: string; value: string; tier: string; source: string }
type Ev = { kind: string; year: number | null; label: string }
type About = {
  id: string; n: string; p: string; yl: string; y: number; wd?: string; href: string | null
  st?: string; dim?: string; vol?: string; book?: string; read?: string; facts: Fact[]; events: Ev[]
}

const FIELD: Record<string, string> = {
  dims: 'Size', status_note: 'Now', remains_today: 'Remains today', recon: 'Reconstruction',
  collection: 'Treasures', volumes: 'Volumes', built: 'Built', architect: 'Architect',
}
const label = (f: string) => FIELD[f] ?? f.replace(/_/g, ' ')
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return u } }

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text = '') {
  const e = document.createElement(tag)
  e.className = cls
  if (text) e.textContent = text
  return e
}

export const mount: Mount = (app, params) => {
  const root = el('section', 'page place')
  root.dataset.view = 'place'
  app.append(root)

  const back = '<p class="place-back"><a href="/">Back to the globe</a></p>'
  const fail = (h: string) => {
    root.innerHTML = `<h1>${h}</h1>${back}`
    root.dataset.ready = 'true'
  }

  let dead = false
  fetch(`/lib/about/${params.lib}.json`)
    .then((r) => (r.ok ? (r.json() as Promise<About>) : Promise.reject(new Error(String(r.status)))))
    .then((d) => {
      if (dead) return
      const crumb = el('nav', 'place-crumb micro')
      crumb.setAttribute('aria-label', 'Breadcrumb')
      const g = el('a', '', 'Globe') as HTMLAnchorElement
      g.href = '/'
      crumb.append(g, el('span', 'place-sep', '›'), el('span', '', d.n))

      root.append(crumb, el('h1', 'place-title', d.n), el('p', 'place-where', `${d.p} · ${d.yl}`))

      if (d.href) {
        const visit = el('a', 'btn place-visit', d.href.startsWith('/room/') ? 'Visit the room' : 'Open its page') as HTMLAnchorElement
        visit.href = d.href
        root.append(visit)
      }
      if (d.st) root.append(el('p', 'place-st', d.st))

      const dl = el('dl', 'place-meta')
      for (const [k, v] of [['Measured', d.dim], ['Collection', d.vol]] as const) {
        if (!v) continue
        dl.append(el('dt', 'micro', k), el('dd', '', v))
      }
      if (dl.childElementCount) root.append(dl)

      if (d.events.length) {
        const sec = el('section', 'place-sec')
        sec.append(el('h2', 'eyebrow', `The library’s years · ${d.events.length}`))
        const ol = el('ol', 'place-years')
        for (const e of d.events) {
          const li = el('li', 'place-year')
          li.append(el('span', 'micro place-y', e.year == null ? '·' : String(e.year)), el('span', '', e.label))
          ol.append(li)
        }
        sec.append(ol)
        root.append(sec)
      }

      if (d.facts.length) {
        const sec = el('section', 'place-sec')
        sec.append(el('h2', 'eyebrow', `What the sources say · ${d.facts.length}`))
        const ul = el('ul', 'place-facts')
        for (const f of d.facts) {
          const li = el('li', 'place-fact')
          li.append(el('span', 'k', label(f.field)), ' ', f.value, ' ')
          const a = el('a', 'place-src', host(f.source)) as HTMLAnchorElement
          a.href = f.source
          a.target = '_blank'
          a.rel = 'noopener noreferrer'
          li.append(a)
          ul.append(li)
        }
        sec.append(ul)
        root.append(sec)
      }

      if (d.book || d.read) {
        const sec = el('section', 'place-sec')
        sec.append(el('h2', 'eyebrow', 'Reading'))
        if (d.book) sec.append(el('p', 'place-read', `On its shelves: ${d.book}`))
        if (d.read) sec.append(el('p', 'place-read', d.read))
        root.append(sec)
      }

      if (d.wd) {
        const a = el('a', 'place-wd', `More at Wikidata (${d.wd})`) as HTMLAnchorElement
        a.href = `https://www.wikidata.org/wiki/${d.wd}`
        a.target = '_blank'
        a.rel = 'noopener'
        root.append(a)
      }
      const b = el('p', 'place-back')
      b.innerHTML = back
      root.append(b)
      root.dataset.ready = 'true'
    })
    .catch(() => !dead && fail('Not on any shelf'))
  return () => { dead = true }
}
