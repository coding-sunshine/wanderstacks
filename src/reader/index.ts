import { PageFlip } from 'page-flip'
import { fade, go, reducedMotion } from '../app'
import type { BookMeta, BookPart, Mount } from '../types'
import { paginate } from './paginate'
import { getMeta, getPart, persistOnce } from './store'
import './reader.css'

const AHEAD = 6

interface Turner {
  go(i: number, animate: boolean): void
  next(): void
  prev(): void
  index(): number
  append(els: HTMLElement[]): void
  destroy(): void
}

const h = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = '') => {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text) e.textContent = text
  return e
}

export const mount: Mount = (el, { book }) => {
  persistOnce()
  const ac = new AbortController()
  const { signal } = ac
  const reduced = reducedMotion()

  const root = h('div', 'rd')
  root.dataset.view = 'reader'
  const close = h('button', '', 'Close')
  const title = h('h1')
  const end = h('button', '', 'End')
  const top = h('div', 'rd-top')
  top.append(close, title, end)
  const stage = h('div', 'rd-stage')
  const msg = h('p', 'rd-msg', 'Opening the book')
  stage.append(msg)
  const prev = h('button', '', 'Previous')
  prev.setAttribute('aria-label', 'Previous page')
  const next = h('button', '', 'Next')
  next.setAttribute('aria-label', 'Next page')
  const status = h('span', 'rd-status')
  status.setAttribute('role', 'status')
  const bottom = h('div', 'rd-bottom')
  bottom.append(prev, status, next)
  const licence = h('p', 'rd-licence')
  root.append(top, stage, bottom, licence)
  el.append(root)

  let meta: BookMeta
  const parts: BookPart[] = []
  let pageHtml: string[][] = []
  let turner: Turner | undefined
  let size = { pw: 0, ph: 0, single: true }
  let loading: Promise<void> | undefined
  let idx = 0

  const total = () => pageHtml.reduce((n, p) => n + p.length, 0)
  const complete = () => parts.length === meta.parts

  function measure() {
    const W = root.clientWidth
    const single = reduced || W < 760
    const pw = single ? Math.min(W - 16, 520) : Math.min(Math.floor((W - 48) / 2), 460)
    const avail = stage.clientHeight - 16
    size = { pw, ph: Math.max(280, Math.min(avail, Math.round(pw * 1.5))), single }
  }

  async function paginatePart(p: BookPart) {
    const host = h('div', 'rd-measure')
    const page = h('div', 'rd-page')
    const text = h('div')
    page.style.cssText = `width:${size.pw}px;height:${size.ph}px`
    page.append(text)
    host.append(page)
    root.append(host)
    await Promise.all([document.fonts.load('17px "EB Garamond"'), document.fonts.load('italic 17px "EB Garamond"')])
    const out = paginate(p.chapters, page, text)
    host.remove()
    return out
  }

  function elements(): HTMLElement[] {
    let n = 0
    return pageHtml.flat().map((html) => {
      const page = h('div', 'rd-page')
      const text = h('div')
      text.innerHTML = html
      page.append(text, h('div', 'rd-num', String(++n)))
      return page
    })
  }

  function makeFlip(els: HTMLElement[], start: number, onFlip: (i: number) => void): Turner {
    const host = h('div', 'rd-book')
    stage.replaceChildren(host)
    const f = new PageFlip(host, {
      width: size.pw, height: size.ph, size: 'fixed', usePortrait: true, showCover: false,
      useMouseEvents: false, mobileScrollSupport: false, flippingTime: 700, maxShadowOpacity: 0.4, startPage: start,
    })
    f.loadFromHTML(els)
    f.on('flip', (e) => onFlip(e.data as number))
    return {
      go: (i, animate) => { f.turnToPage(i); if (!animate) onFlip(f.getCurrentPageIndex()) },
      next: () => f.flipNext(),
      prev: () => f.flipPrev(),
      index: () => f.getCurrentPageIndex(),
      append: (all) => f.updateFromHtml(all),
      destroy: () => f.destroy(),
    }
  }

  function makePlain(els: HTMLElement[], start: number, onFlip: (i: number) => void): Turner {
    const host = h('div', 'rd-book rd-plain')
    host.style.cssText = `width:${size.pw}px;height:${size.ph}px`
    stage.replaceChildren(host)
    let pages = els
    let i = start
    const show = (n: number, animate: boolean) => {
      const old = host.firstElementChild
      i = n
      const cur = pages[i]
      host.append(cur)
      cur.style.cssText = `width:${size.pw}px;height:${size.ph}px`
      if (old && old !== cur) {
        if (animate) {
          cur.style.zIndex = '1'
          void fade(cur, 1).then(() => { old.remove(); cur.style.zIndex = '' })
        } else old.remove()
      }
      onFlip(i)
    }
    show(start, false)
    return {
      go: (n, animate) => show(n, animate),
      next: () => i < pages.length - 1 && show(i + 1, true),
      prev: () => i > 0 && show(i - 1, true),
      index: () => i,
      append: (all) => { pages = all.map((p, n) => (n === i ? pages[i] : p)) },
      destroy: () => {},
    }
  }

  function onChange(i: number) {
    idx = i
    const n = total()
    const last = complete() && i >= n - (size.single ? 1 : 2)
    status.textContent = `Page ${last ? n : i + 1} of ${n}${complete() ? '' : '+'}`
    prev.disabled = i <= 0
    next.disabled = last
    if (!complete() && i >= n - AHEAD) void loadNext()
  }

  function loadNext() {
    return (loading ??= (async () => {
      const p = await getPart(book, parts.length + 1)
      const pages = await paginatePart(p)
      if (signal.aborted) return
      parts.push(p)
      pageHtml.push(pages)
      turner?.append(elements())
      onChange(idx)
    })().finally(() => { loading = undefined }))
  }

  async function loadAll() {
    while (!complete() && !signal.aborted) await loadNext()
  }

  function build(start: number) {
    turner?.destroy()
    const els = elements()
    turner = (size.single ? makePlain : makeFlip)(els, Math.min(start, els.length - 1), onChange)
    onChange(turner.index())
  }

  async function relayout() {
    measure()
    const ratio = total() ? idx / total() : 0
    pageHtml = []
    for (const p of parts) pageHtml.push(await paginatePart(p))
    if (signal.aborted) return
    build(Math.round(ratio * total()))
  }

  const turn = (d: 1 | -1) => (d > 0 ? turner?.next() : turner?.prev())
  const toEnd = async () => {
    await loadAll()
    turner?.go(total() - 1, false)
  }
  const closeReader = () => (history.length > 1 ? history.back() : go('/room/longroom'))

  close.onclick = closeReader
  end.onclick = () => void toEnd()
  prev.onclick = () => turn(-1)
  next.onclick = () => turn(1)

  window.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return
    if (e.key === 'ArrowRight') turn(1)
    else if (e.key === 'ArrowLeft') turn(-1)
    else if (e.key === 'End') { e.preventDefault(); void toEnd() }
    else if (e.key === 'Escape') closeReader()
    else return
  }, { signal })

  let down: { x: number; y: number } | null = null
  let swiped = false
  stage.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; swiped = false }, { signal })
  stage.addEventListener('pointerup', (e) => {
    if (!down) return
    const dx = e.clientX - down.x
    const dy = e.clientY - down.y
    down = null
    if (Math.abs(dx) > 40 && Math.abs(dx) > 1.5 * Math.abs(dy)) {
      swiped = true
      turn(dx < 0 ? 1 : -1)
    }
  }, { signal })
  stage.addEventListener('pointercancel', () => { down = null }, { signal })
  stage.addEventListener('click', (e) => {
    if (swiped || !turner || (e.target as Element).closest('a')) return
    const r = stage.getBoundingClientRect()
    const edge = size.single ? 0.3 : 0.5
    turn(e.clientX - r.left < r.width * edge ? -1 : 1)
  }, { signal })

  let t: number
  const onResize = () => {
    clearTimeout(t)
    t = window.setTimeout(() => void relayout(), 250)
  }
  window.addEventListener('resize', onResize, { signal })

  void (async () => {
    try {
      meta = await getMeta(book)
      title.textContent = meta.author ? `${meta.title}, ${meta.author}` : meta.title
      licence.append(`${meta.licence} · `)
      const a = h('a', '', 'Source')
      a.href = meta.source
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.title = meta.edition
      licence.append(a)
      measure()
      const first = await getPart(book, 1)
      const pages = await paginatePart(first)
      if (signal.aborted) return
      parts.push(first)
      pageHtml.push(pages)
      build(0)
      root.dataset.ready = 'true'
    } catch {
      msg.textContent = 'This book could not be opened.'
      root.dataset.ready = 'true'
    }
  })()

  return () => {
    ac.abort()
    clearTimeout(t)
    turner?.destroy()
    root.remove()
  }
}
