import { PageFlip } from 'page-flip'
import { fade, go, reducedMotion } from '../app'
import type { BookMeta, BookPart, Mount } from '../types'
import { paginate } from './paginate'
import { getMeta, getPart, persistOnce } from './store'
import { locate, mark, terms } from './find'
import { binding } from '../room/cover'
import { headpiece } from './ornament'
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
  stage.lang = 'en'
  const orig = h('aside', 'rd-orig')
  orig.setAttribute('aria-label', 'Original text')
  const main = h('div', 'rd-main')
  main.append(stage, orig)
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
  root.append(top, main, bottom, licence)
  el.append(root)

  let meta: BookMeta
  const parts: BookPart[] = []
  let pageHtml: string[][] = []
  let pageStarts: number[][] = []
  let turner: Turner | undefined
  let size = { pw: 0, ph: 0, single: true }
  let loading: Promise<void> | undefined
  let idx = 0

  const qs = new URLSearchParams(location.search)
  const words = terms(qs.get('q'))
  const num = (k: string, d: number) => (/^\d+$/.test(qs.get(k) ?? '') ? +qs.get(k)! : d)
  const want = { part: Math.max(num('part', 1), 1), ch: num('ch', 0), to: num('to', num('ch', 0)) }
  // Global page index to open on: the first page of the chapter run, or the one holding most of the words.
  function target() {
    const pi = Math.min(want.part, parts.length) - 1
    const s = pageStarts[pi]
    const base = pageHtml.slice(0, pi).reduce((n, p) => n + p.length, 0)
    const lo = s[Math.min(want.ch, s.length - 1)] ?? 0
    const hi = s[want.to + 1] ?? pageHtml[pi].length
    return base + lo + Math.max(locate(pageHtml[pi].slice(lo, hi), words), 0)
  }

  const total = () => pageHtml.reduce((n, p) => n + p.length, 0)
  const complete = () => parts.length === meta.parts

  function measure() {
    const W = stage.clientWidth
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
    await Promise.all([document.fonts.load('19px "EB Garamond"'), document.fonts.load('italic 19px "EB Garamond"')])
    const out = paginate(p.chapters, page, text)
    host.remove()
    return out
  }
  const addPart = async (p: BookPart) => {
    const r = await paginatePart(p)
    if (signal.aborted) return false
    parts.push(p)
    pageHtml.push(r.pages)
    pageStarts.push(r.starts)
    return true
  }

  function elements(): HTMLElement[] {
    let n = 0
    return pageHtml.flat().map((html) => {
      const page = h('div', 'rd-page')
      const text = h('div')
      text.innerHTML = mark(html, words)
      page.append(text, h('div', 'rd-num', String(++n)))
      return page
    })
  }

  // The open volume: leather boards around the page block, gilt edges on the right.
  let coverUrl: string | null = null
  const volumeOf = () => {
    const v = h('div', 'rd-volume')
    if (!coverUrl && meta) {
      coverUrl = binding({ id: meta.id, title: meta.title, author: meta.author, date: meta.edition }).toDataURL()
    }
    if (coverUrl) v.style.setProperty('--rd-cover', `url(${coverUrl})`)
    return v
  }
  // Front matter: the inside of the cover, then a half-title, before page one.
  const pasteDown = () => {
    const p = h('div', 'rd-page rd-pastedown')
    const info = h('p', 'rd-paste-info', meta.edition ?? meta.title)
    p.append(info)
    return p
  }
  const halfTitle = () => {
    const p = h('div', 'rd-page rd-halftitle')
    const orn = h('div', 'rd-orn rd-orn--big')
    orn.style.backgroundImage = headpiece(meta.title)
    p.append(orn, h('h1', '', meta.title))
    if (meta.author) p.append(h('p', 'rd-half-by', meta.author))
    p.append(h('p', 'rd-half-hint', 'Turn the page to begin'))
    return p
  }

  // A soft page-turn rustle, synthesised on the fly; silent under reduced motion.
  let actx: AudioContext | null = null
  const rustle = () => {
    if (reduced) return
    try {
      actx ??= new AudioContext()
      void actx.resume()
      const dur = 0.09
      const buf = actx.createBuffer(1, Math.floor(actx.sampleRate * dur), actx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2
      const src = actx.createBufferSource()
      src.buffer = buf
      const bp = actx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 2600
      bp.Q.value = 0.7
      const g = actx.createGain()
      g.gain.value = 0.05
      src.connect(bp).connect(g).connect(actx.destination)
      src.start()
    } catch { /* sound is a garnish, never a blocker */ }
  }

  // Finishing a book earns a keepsake, like walking into a room earns a stamp.
  let stamped = false
  const stampFinish = () => {
    if (stamped) return
    stamped = true
    try {
      const reads = JSON.parse(localStorage.getItem('wl.reads') ?? '[]') as { id: string; title: string; at: number }[]
      if (!reads.some((r) => r.id === book)) {
        reads.push({ id: book, title: meta.title, at: Date.now() })
        localStorage.setItem('wl.reads', JSON.stringify(reads))
      }
      const t = h('p', 'rd-toast')
      const a = h('a', '', 'keepsakes')
      a.href = '/book'
      t.append('Read to the end — stamped in your ', a, '.')
      root.append(t)
      requestAnimationFrame(() => (t.dataset.on = 'true'))
      setTimeout(() => {
        t.dataset.on = 'false'
        setTimeout(() => t.remove(), 700)
      }, 4200)
    } catch { /* keepsakes are best-effort */ }
  }

  function makeFlip(els: HTMLElement[], start: number, onFlip: (i: number) => void): Turner {
    const host = h('div', 'rd-book')
    host.style.width = `${size.pw * 2}px` // wide enough for PageFlip to open a two-page spread
    const volume = volumeOf()
    volume.append(host)
    stage.replaceChildren(volume)
    const f = new PageFlip(host, {
      width: size.pw, height: size.ph, size: 'fixed', usePortrait: false, showCover: false,
      useMouseEvents: false, mobileScrollSupport: false, flippingTime: 700, maxShadowOpacity: 0.4, startPage: start,
      autoSize: false,
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
    const volume = volumeOf()
    volume.append(host)
    stage.replaceChildren(volume)
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

  // Parallel text: the original beside the translation on wide screens, swapped in on phones.
  interface Orig { lang: string; title: string; edition: string; source: string; licence: string }
  let om: Orig | undefined
  const op = new Map<number, Promise<BookPart | undefined>>()
  const origPart = (n: number) => {
    let p = op.get(n)
    if (!p) op.set(n, (p = fetch(`/book/${book}/orig/${n}.json`).then((r) => (r.ok ? (r.json() as Promise<BookPart>) : undefined), () => undefined)))
    return p
  }
  const chapterAt = (i: number) => {
    let g = Math.max(i - (size.single ? 1 : 2), 0)
    for (let p = 0; p < pageHtml.length; p++) {
      if (g < pageHtml[p].length || p === pageHtml.length - 1) {
        const s = pageStarts[p]
        let c = 0
        while (c + 1 < s.length && s[c + 1] <= g) c++
        return { p, c }
      }
      g -= pageHtml[p].length
    }
    return { p: 0, c: 0 }
  }
  let shown = ''
  async function showOrig() {
    if (!om || !root.dataset.orig) return
    const { p, c } = chapterAt(idx)
    const key = `${p}:${c}`
    if (key === shown) return
    shown = key
    const part = await origPart(p + 1)
    if (signal.aborted || shown !== key) return
    const ch = part?.chapters[c]
    const head = h('h2', '', parts[p]?.chapters[c]?.title ?? '')
    const body = h('div', 'rd-orig-text')
    if (ch?.html) { body.lang = om.lang; body.innerHTML = ch.html } else body.append(h('p', 'rd-orig-none', 'No original is aligned to this section.'))
    const note = h('p', 'rd-orig-note', `${om.edition}. ${om.licence}. `)
    const a = h('a', '', 'Source')
    a.href = om.source
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    note.append(a)
    orig.replaceChildren(head, body, note)
    orig.scrollTop = 0
  }
  const origMode = () => (root.clientWidth >= 1100 ? 'side' : 'only')
  function toggleOrig() {
    if (root.dataset.orig) delete root.dataset.orig
    else root.dataset.orig = origMode()
    origBtn.setAttribute('aria-pressed', String(!!root.dataset.orig))
    shown = ''
    void showOrig()
    if (root.dataset.orig !== 'only') requestAnimationFrame(() => void relayout())
  }
  const origBtn = h('button', '')
  origBtn.hidden = true
  origBtn.setAttribute('aria-pressed', 'false')
  origBtn.onclick = toggleOrig
  top.insertBefore(origBtn, end)

  function onChange(i: number) {
    idx = i
    const n = total()
    const last = complete() && i >= n - (size.single ? 1 : 2)
    status.textContent = `Page ${last ? n : i + 1} of ${n}${complete() ? '' : '+'}`
    prev.disabled = i <= 0
    next.disabled = last
    rustle()
    if (last && complete()) stampFinish()
    void showOrig()
    if (!complete() && i >= n - AHEAD) void loadNext()
  }

  function loadNext() {
    return (loading ??= (async () => {
      const p = await getPart(book, parts.length + 1)
      if (!(await addPart(p))) return
      turner?.append(elements())
      onChange(idx)
    })().finally(() => { loading = undefined }))
  }

  async function loadAll() {
    while (!complete() && !signal.aborted) await loadNext()
  }

  function build(start: number) {
    turner?.destroy()
    const els = [...(size.single ? [halfTitle()] : [pasteDown(), halfTitle()]), ...elements()]
    turner = (size.single ? makePlain : makeFlip)(els, Math.min(start, els.length - 1), onChange)
    onChange(turner.index())
  }

  async function relayout() {
    measure()
    const ratio = total() ? idx / total() : 0
    pageHtml = []
    pageStarts = []
    const old = parts.splice(0)
    for (const p of old) if (!(await addPart(p))) return
    build(Math.round(ratio * total()))
  }

  const turn = (d: 1 | -1) => (d > 0 ? turner?.next() : turner?.prev())
  const toEnd = async () => {
    await loadAll()
    turner?.go(total() - 1, false)
  }
  const closeReader = () => (history.length > 1 ? history.back() : go('/atlas'))

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
      if (meta.orig) void fetch(`/book/${book}/orig/meta.json`).then((r) => (r.ok ? (r.json() as Promise<Orig>) : undefined)).then((o) => {
        if (!o || signal.aborted) return
        om = o
        origBtn.textContent = o.lang === 'la' ? 'Latin' : o.lang === 'grc' ? 'Greek' : 'Original'
        origBtn.setAttribute('aria-label', `Show the ${origBtn.textContent} original`)
        origBtn.hidden = false
      }, () => {})
      measure()
      if (!(await addPart(await getPart(book, 1)))) return
      // A link from search names a part and chapters; read up to it and open on the page holding the words.
      while (parts.length < Math.min(want.part, meta.parts)) if (!(await addPart(await getPart(book, parts.length + 1)))) return
      build((size.single ? 1 : 2) + target())
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
