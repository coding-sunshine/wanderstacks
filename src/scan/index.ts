import './scan.css'
import type { Mount } from '../types'

interface Page { s: string; w: number; h: number; l: string }
interface Book { manifest: string; licence: string; credit: string; pages: Page[] }

const TILE = 2048
const AHEAD = 4
const DEED = 'https://creativecommons.org/licenses/by-nc/4.0/'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const small = (p: Page, w = 600) => `${p.s}/full/${w},/0/default.jpg`
const tile = (p: Page, x: number, y: number, w: number, h: number) => `${p.s}/${x},${y},${w},${h}/${w},/0/default.jpg`

const notFound = (el: HTMLElement) => {
  el.innerHTML = '<section class="page" data-view="scan" data-ready="true"><h1>Not on any shelf</h1><p><a href="/">Back to the atlas</a></p></section>'
}

export const mount: Mount = (el, params) => {
  if (params.book !== 'firstfolio') return notFound(el)

  el.innerHTML = `<section class="page scan" data-view="scan" data-page="0">
    <h1>The First Folio</h1>
    <div class="scan-spread" data-spread></div>
    <div class="scan-bar">
      <button type="button" data-nav="first" aria-label="First page">&#171;</button>
      <button type="button" data-nav="prev" aria-label="Previous pages">&#8249;</button>
      <span class="scan-count" role="status" data-count></span>
      <button type="button" data-nav="next" aria-label="Next pages">&#8250;</button>
      <button type="button" data-nav="last" aria-label="Last page">&#187;</button>
      <button type="button" data-zoom-open aria-label="Zoom into the page">+</button>
    </div>
    <p class="scan-credit" data-credit hidden></p>
  </section>`
  const root = el.firstElementChild as HTMLElement
  const spread = root.querySelector<HTMLElement>('[data-spread]')!
  const count = root.querySelector<HTMLElement>('[data-count]')!
  const credit = root.querySelector<HTMLElement>('[data-credit]')!
  const q = (n: string) => root.querySelector<HTMLButtonElement>(`[data-nav=${n}]`)!
  const mobile = matchMedia('(max-width: 699px)')

  let book: Book | null = null
  let at = 0
  let dialog: HTMLDialogElement | null = null
  const warmed = new Set<number>()
  const step = () => (mobile.matches ? 1 : 2)

  const fail = () => {
    if (!root.querySelector('[data-source-error]')) {
      root.insertAdjacentHTML('beforeend', '<p class="scan-error" data-source-error role="alert">The Bodleian scans could not be reached. Try again later.</p>')
    }
    root.dataset.ready = 'true'
  }

  const go = (i: number) => {
    if (!book) return
    const n = book.pages.length
    const s = step()
    at = Math.max(0, Math.min(Math.floor((n - 1) / s) * s, i - (i % s)))
    show()
  }

  const show = () => {
    const { pages } = book!
    const shown = pages.slice(at, at + step())
    root.dataset.page = String(at)
    spread.replaceChildren(
      ...shown.map((p, k) => {
        const b = document.createElement('button')
        b.type = 'button'
        b.className = 'scan-leaf'
        b.dataset.leaf = String(at + k)
        b.setAttribute('aria-label', `Zoom into ${p.l}`)
        const img = new Image()
        img.dataset.page = String(at + k)
        img.alt = p.l
        img.width = p.w
        img.height = p.h
        img.decoding = 'async'
        img.onerror = fail
        img.src = small(p)
        b.append(img)
        return b
      }),
    )
    count.textContent = `${shown.map((p) => p.l).join(' and ')} (${at + 1} of ${pages.length})`
    q('first').disabled = q('prev').disabled = at === 0
    q('next').disabled = q('last').disabled = at + step() >= pages.length
    for (let i = Math.max(0, at - AHEAD); i < Math.min(pages.length, at + step() + AHEAD); i++) {
      if (i >= at && i < at + step()) continue
      if (warmed.has(i)) continue
      warmed.add(i)
      new Image().src = small(pages[i])
    }
  }

  const openZoom = (idx: number) => {
    if (!book || dialog) return
    const p = book.pages[idx]
    const opener = root.contains(document.activeElement) && document.activeElement !== root
      ? (document.activeElement as HTMLElement)
      : root.querySelector<HTMLElement>(`[data-leaf="${idx}"]`)
    const d = document.createElement('dialog')
    d.dataset.zoom = ''
    d.className = 'scan-zoom'
    d.setAttribute('aria-label', `Zoomed ${p.l}`)
    let tiles = ''
    for (let y = 0; y < p.h; y += TILE) {
      for (let x = 0; x < p.w; x += TILE) {
        const w = Math.min(TILE, p.w - x)
        const h = Math.min(TILE, p.h - y)
        const pc = (a: number, b: number) => `${(a / b) * 100}%`
        const pos = `left:${pc(x, p.w)};top:${pc(y, p.h)};width:${pc(w, p.w)};height:${pc(h, p.h)}`
        tiles += `<img alt="${esc(p.l)}, tile ${x},${y}" src="${tile(p, x, y, w, h)}" style="${pos}" data-tile>`
      }
    }
    d.innerHTML = `<button type="button" class="scan-close" aria-label="Close zoom">&#215;</button>
      <div class="scan-pan" tabindex="0" role="group" aria-label="Zoomed page, scroll to pan">
        <div class="scan-stage" style="width:${p.w / 2}px;aspect-ratio:${p.w}/${p.h}">${tiles}</div>
      </div>`
    d.querySelector('.scan-close')!.addEventListener('click', () => d.close())
    d.addEventListener('error', fail, true)
    d.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return
      const f = [...d.querySelectorAll<HTMLElement>('button, [tabindex="0"]')]
      const i = f.indexOf(document.activeElement as HTMLElement)
      e.preventDefault()
      f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length]?.focus()
    })
    d.addEventListener('close', () => {
      d.remove()
      dialog = null
      opener?.focus()
    })
    root.append(d)
    dialog = d
    d.showModal()
  }

  const zoomTarget = () => {
    const f = document.activeElement?.closest<HTMLElement>('[data-leaf]')
    return f ? Number(f.dataset.leaf) : at
  }

  const onKey = (e: KeyboardEvent) => {
    if (dialog || e.altKey || e.ctrlKey || e.metaKey || !book) return
    const t = e.target as HTMLElement
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
    const n = book.pages.length
    if (e.key === 'ArrowRight') go(at + step())
    else if (e.key === 'ArrowLeft') go(at - step())
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(n - 1)
    else if (e.key === '+' || e.key === '=' || (e.key === 'Enter' && !t.closest('button, a'))) openZoom(zoomTarget())
    else return
    e.preventDefault()
  }

  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement
    const nav = t.closest<HTMLElement>('[data-nav]')?.dataset.nav
    if (nav === 'first') go(0)
    else if (nav === 'prev') go(at - step())
    else if (nav === 'next') go(at + step())
    else if (nav === 'last') go(book!.pages.length - 1)
    else if (t.closest('[data-zoom-open]')) openZoom(zoomTarget())
    else if (t.closest('[data-leaf]')) openZoom(Number(t.closest<HTMLElement>('[data-leaf]')!.dataset.leaf))
  })
  document.addEventListener('keydown', onKey)
  const onMedia = () => book && go(at)
  mobile.addEventListener('change', onMedia)

  let dead = false
  fetch('/scan/firstfolio/pages.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((b: Book) => {
      if (dead) return
      book = b
      credit.hidden = false
      credit.innerHTML = `Images: ${esc(b.credit)}, via the <a href="${esc(b.manifest)}">Bodleian IIIF manifest</a>. Licence: <a href="${DEED}">${esc(b.licence)}</a>.`
      go(0)
      root.dataset.ready = 'true'
    })
    .catch(() => dead || fail())

  return () => {
    dead = true
    document.removeEventListener('keydown', onKey)
    mobile.removeEventListener('change', onMedia)
  }
}
