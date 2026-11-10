import './scan.css'
import type { Mount } from '../types'
import { reducedMotion } from '../app'

interface Page { s: string; w: number; h: number; l: string }
interface Book { title: string; date?: string; holder: string; manifest: string; licence: string; deed: string | null; credit: string; pages: Page[] }

const TILE = 2048
const AHEAD = 4

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const small = (p: Page, w = 600) => `${p.s}/full/${w},/0/default.jpg`
const tile = (p: Page, x: number, y: number, w: number, h: number) => `${p.s}/${x},${y},${w},${h}/${w},/0/default.jpg`

const notFound = (el: HTMLElement) => {
  el.innerHTML = '<section class="page" data-view="scan" data-ready="true"><h1>Not on any shelf</h1><p><a href="/">Back to the atlas</a></p></section>'
}

export const mount: Mount = (el, params) => {
  el.innerHTML = `<section class="page scan" data-view="scan" data-page="0">
    <h1 data-title>Opening the scans</h1>
    <p class="scan-meta" data-meta></p>
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
      root.insertAdjacentHTML('beforeend', `<p class="scan-error" data-source-error role="alert">The scans at ${esc(book?.holder ?? 'the holding library')} could not be reached. Try again later.</p>`)
    }
    root.dataset.ready = 'true'
  }

  const go = (i: number) => {
    if (!book) return
    const n = book.pages.length
    const s = step()
    const was = at
    at = Math.max(0, Math.min(Math.floor((n - 1) / s) * s, i - (i % s)))
    show(Math.sign(at - was))
  }

  // A page turn in two halves about the spine: the old leaf folds up to edge-on, then the new one lies down.
  // Transform only, and a new turn finishes the running one at once.
  let turning: Animation[] = []
  let ghosts: HTMLElement[] = []
  const settle = () => {
    turning.forEach((a) => a.finish())
    ghosts.forEach((g) => g.remove())
    turning = []
    ghosts = []
  }
  const ghost = (leaf: Element | null) => {
    if (!(leaf instanceof HTMLElement)) return null
    const g = leaf.cloneNode(true) as HTMLElement
    g.removeAttribute('data-leaf')
    g.setAttribute('aria-hidden', 'true')
    g.inert = true
    g.className = 'scan-leaf scan-ghost'
    g.style.cssText = `left:${leaf.offsetLeft}px;top:${leaf.offsetTop}px;width:${leaf.offsetWidth}px;height:${leaf.offsetHeight}px`
    ghosts.push(g)
    return g
  }
  const OUT = { duration: 220, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'forwards' } as const
  const IN = { duration: 340, delay: 220, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' } as const
  const turn = (dir: number, old: Element[]) => {
    const fresh = [...spread.children] as HTMLElement[]
    const anims: Animation[] = []
    if (step() === 1) {
      const g = ghost(old[0])
      if (!g) return
      spread.append(g)
      g.style.transformOrigin = fresh[0].style.transformOrigin = 'left center'
      if (dir > 0) anims.push(g.animate([{ transform: 'rotateY(0)' }, { transform: 'rotateY(-90deg)' }], { ...OUT, duration: 300 }))
      else {
        g.style.zIndex = '0'
        fresh[0].style.zIndex = '2'
        anims.push(fresh[0].animate([{ transform: 'rotateY(-90deg)' }, { transform: 'rotateY(0)' }], { ...IN, delay: 0 }))
      }
    } else {
      const [l, r] = [ghost(old[0]), ghost(old[1])]
      if (!l || !r) return
      spread.append(l, r)
      const [lift, still, land] = dir > 0 ? [r, l, fresh[0]] : [l, r, fresh[1] ?? fresh[0]]
      still.style.zIndex = '0'
      lift.style.transformOrigin = dir > 0 ? 'left center' : 'right center'
      land.style.transformOrigin = dir > 0 ? 'right center' : 'left center'
      land.style.zIndex = '2'
      anims.push(
        lift.animate([{ transform: 'rotateY(0)' }, { transform: `rotateY(${dir > 0 ? -90 : 90}deg)` }], OUT),
        land.animate([{ transform: `rotateY(${dir > 0 ? 90 : -90}deg)` }, { transform: 'rotateY(0)' }], IN),
      )
    }
    turning = anims
    Promise.all(anims.map((a) => a.finished)).then(() => turning === anims && settle(), () => {})
  }

  const show = (dir = 0) => {
    const { pages } = book!
    const shown = pages.slice(at, at + step())
    settle()
    const old = dir && !reducedMotion() ? [...spread.children] : []
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
    if (old.length) turn(dir, old)
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

  // Swipe turns the page. A swipe is not a tap, so it must not open the zoom.
  let x0 = NaN
  let y0 = NaN
  let swiped = false
  spread.addEventListener('pointerdown', (e) => {
    x0 = e.clientX
    y0 = e.clientY
    swiped = false
  })
  spread.addEventListener('pointerup', (e) => {
    const dx = e.clientX - x0
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(e.clientY - y0)) return
    swiped = true
    go(at + (dx < 0 ? step() : -step()))
  })
  spread.addEventListener('click', (e) => swiped && (e.stopPropagation(), (swiped = false)), true)

  let dead = false
  // Cloudflare answers a missing path with index.html and a 200, so a book is only JSON.
  fetch(`/scan/${params.book}/pages.json`)
    .then((r) => (r.ok && r.headers.get('content-type')?.includes('json') ? r.json() : null))
    .then((b: Book | null) => {
      if (dead) return
      if (!b) return notFound(el)
      book = b
      root.querySelector('[data-title]')!.textContent = b.title
      root.querySelector('[data-meta]')!.textContent = [b.date, b.holder].filter(Boolean).join(' · ')
      document.title = `${b.title} · WorldLibs`
      const lic = b.deed ? `<a href="${esc(b.deed)}">${esc(b.licence)}</a>` : esc(b.licence)
      credit.hidden = false
      credit.innerHTML = `Images: ${esc(b.credit)}, from the holder's <a href="${esc(b.manifest)}">IIIF manifest</a>. Licence: ${lic}.`
      go(0)
      root.dataset.ready = 'true'
    })
    .catch(() => dead || fail())

  return () => {
    dead = true
    settle()
    document.removeEventListener('keydown', onKey)
    mobile.removeEventListener('change', onMedia)
  }
}
