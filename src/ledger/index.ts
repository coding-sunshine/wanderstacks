import './ledger.css'
import type { Mount } from '../types'

interface Row { id: string; class: 'attested' | 'disputed' | 'unknown'; field: string; value: string; source: string; tier: string }
interface Ledger { rows: Row[]; myth: string; correction: string; links: string[] }

const LISTS = ['attested', 'disputed', 'unknown'] as const
const HEADS = { attested: 'Attested', disputed: 'Disputed', unknown: 'Unknown' }
const BACK = '<p><a href="/">Back to the globe</a></p>'

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)
const host = (u: string) => new URL(u).hostname.replace(/^www\./, '')
const label = (f: string) => f.replace(/_/g, ' ')

function render(d: Ledger) {
  const lists = LISTS.map((c) => {
    const rows = d.rows.filter((r) => r.class === c)
    const items = rows
      .map((r) => `<li data-row id="${esc(r.id)}" tabindex="-1"><span class="k">${esc(label(r.field))}</span> ${esc(r.value)}
        <a data-source href="${esc(r.source)}" target="_blank" rel="noopener noreferrer" aria-label="Source for ${esc(label(r.field))}: ${esc(host(r.source))}">${esc(host(r.source))}</a></li>`)
      .join('')
    return `<section class="col" aria-labelledby="h-${c}"><h2 id="h-${c}">${HEADS[c]} <span class="n">${rows.length}</span></h2><ul data-class="${c}">${items}</ul></section>`
  }).join('')
  const links = d.links
    .map((id) => d.rows.find((r) => r.id === id))
    .filter((r): r is Row => !!r)
    .map((r) => `<li><a href="#${esc(r.id)}">${esc(label(r.field))}: ${esc(r.value.length > 70 ? r.value.slice(0, 70) + '…' : r.value)}</a></li>`)
    .join('')
  return `<h1>Library of Alexandria, ledger</h1>
    <p class="lede">What the sources attest, what they dispute, and what nobody knows. Every row carries its source.</p>
    <section data-myth aria-labelledby="h-myth"><h2 id="h-myth">The myth</h2>
      <p class="myth">${esc(d.myth)}</p><p class="correction">Sources say: ${esc(d.correction)}.</p>
      <p>Rows that correct it:</p><ul>${links}</ul></section>
    <div class="cols">${lists}</div>${BACK}`
}

export const mount: Mount = (el, params) => {
  const root = document.createElement('section')
  root.className = 'page ledger'
  root.dataset.view = 'ledger'
  el.replaceChildren(root)
  if (params.lib !== 'alexandria') {
    root.innerHTML = `<h1>Not on any shelf</h1>${BACK}`
    root.dataset.ready = 'true'
    return
  }

  let dead = false
  fetch('/lib/alexandria-ledger.json')
    .then((r) => (r.ok ? (r.json() as Promise<Ledger>) : Promise.reject(new Error(String(r.status)))))
    .then((d) => {
      if (dead) return
      root.innerHTML = render(d)
      root.querySelector('[data-myth]')!.addEventListener('click', (e) => {
        const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
        if (!a) return
        e.preventDefault()
        const row = root.querySelector<HTMLElement>(`[id="${a.hash.slice(1)}"]`)
        row?.scrollIntoView({ block: 'center' })
        row?.focus()
        history.replaceState(history.state, '', a.hash)
      })
    })
    .catch(() => {
      if (!dead) root.innerHTML = `<h1>The ledger could not be loaded</h1>${BACK}`
    })
    .finally(() => {
      if (!dead) root.dataset.ready = 'true'
    })
  return () => { dead = true }
}
