import { reducedMotion } from '../app'

interface Page { s: string; w: number; h: number; l: string }
interface Hooks { pages: Page[]; dir: string; src: (p: Page, w: number) => string; fail: () => void; count: HTMLElement; bar: (n: string) => HTMLButtonElement }

const FRICTION = 0.95
const REACH = 0.8

// One strip the visitor unrolls sideways. The browser does the scrolling (touch momentum, scrollbar, focus);
// direction:rtl makes scrollLeft 0 the right end, so a right-to-left scroll opens at its beginning with no maths.
export const unroll = (host: HTMLElement, { pages, dir, src, fail, count, bar }: Hooks) => {
  const rtl = dir === 'right-to-left'
  const fwd = rtl ? -1 : 1
  host.dir = rtl ? 'rtl' : 'ltr'
  host.classList.add('scan-unrolled')
  host.innerHTML = `<div class="scan-strip" tabindex="0" role="group" aria-label="Scroll, drag, or use the arrow keys to unroll it"></div>
    <i class="scan-roll" data-roll="start"></i><i class="scan-roll" data-roll="end"></i>
    <div class="scan-prog" aria-hidden="true"><b data-prog></b></div>`
  const strip = host.querySelector<HTMLElement>('.scan-strip')!
  const prog = host.querySelector<HTMLElement>('[data-prog]')!
  count.removeAttribute('role')

  const secs = pages.map((p, i) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'scan-sec'
    b.dataset.leaf = String(i)
    b.style.aspectRatio = `${p.w}/${p.h}`
    b.setAttribute('aria-label', `Zoom into ${p.l}`)
    return b
  })
  strip.append(...secs)

  // Tiles come in as they near the viewport, sized to what is on screen.
  const io = new IntersectionObserver((hits) => {
    for (const h of hits) {
      if (!h.isIntersecting) continue
      const b = h.target as HTMLElement
      io.unobserve(b)
      const p = pages[Number(b.dataset.leaf)]
      const img = new Image()
      img.alt = p.l
      img.decoding = 'async'
      img.onerror = fail
      img.src = src(p, Math.min(p.w, Math.ceil(b.offsetWidth * Math.min(devicePixelRatio, 2))))
      b.append(img)
    }
  }, { root: strip, rootMargin: '0px 120% 0px 120%' })
  secs.forEach((b) => io.observe(b))

  const max = () => strip.scrollWidth - strip.clientWidth
  const pos = () => Math.abs(strip.scrollLeft)
  const to = (p: number, smooth = false) => strip.scrollTo({ left: fwd * Math.max(0, Math.min(max(), p)), behavior: smooth && !reducedMotion() ? 'smooth' : 'auto' })
  const current = () => {
    const mid = strip.getBoundingClientRect()
    const c = mid.left + mid.width / 2
    let best = 0
    let d = Infinity
    secs.forEach((b, i) => {
      const r = b.getBoundingClientRect()
      const k = Math.abs(r.left + r.width / 2 - c)
      if (k < d) { d = k; best = i }
    })
    return best
  }

  let tick = 0
  const paint = () => {
    tick = 0
    const m = max()
    const p = pos()
    const f = m > 0 ? p / m : 0
    prog.style.transform = `scaleX(${Math.max(0.02, f)})`
    host.style.setProperty('--roll-start', String(1 - Math.min(1, p / 240)))
    host.style.setProperty('--roll-end', String(1 - Math.min(1, (m - p) / 240)))
    const i = current()
    count.textContent = `${pages[i].l} of ${pages.length} (${Math.round(f * 100)}% unrolled)`
    bar('first').disabled = bar('prev').disabled = p < 2
    bar('next').disabled = bar('last').disabled = p > m - 2
  }
  const queue = () => { tick ||= requestAnimationFrame(paint) }
  strip.addEventListener('scroll', queue, { passive: true })
  addEventListener('resize', queue)

  // A wheel turns the scroll, whichever way the strip runs.
  strip.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
    e.preventDefault()
    strip.scrollLeft += fwd * e.deltaY * (e.deltaMode === 1 ? 16 : 1)
  }, { passive: false })

  // Mouse drag with a little glide on release. Touch scrolls natively; reduced motion gets no glide.
  let x0 = 0
  let lx = 0
  let s0 = 0
  let down = false
  let moved = false
  let v = 0
  let last = 0
  let glide = 0
  const glideStep = (t: number) => {
    const dt = Math.min(t - last, 32)
    last = t
    const before = strip.scrollLeft
    strip.scrollLeft -= v * dt
    v *= FRICTION ** (dt / 16)
    glide = Math.abs(v) > 0.02 && strip.scrollLeft !== before ? requestAnimationFrame(glideStep) : 0
  }
  strip.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button) return
    cancelAnimationFrame(glide)
    glide = 0
    down = true
    moved = false
    x0 = lx = e.clientX
    s0 = strip.scrollLeft
    v = 0
    last = e.timeStamp
  })
  strip.addEventListener('pointermove', (e) => {
    if (!down) return
    const dx = e.clientX - x0
    if (!moved && Math.abs(dx) < 5) return
    if (!moved) { moved = true; strip.setPointerCapture(e.pointerId); strip.classList.add('is-drag') }
    const dt = e.timeStamp - last
    if (dt > 0) v = 0.8 * v + 0.2 * ((e.clientX - lx) / dt)
    last = e.timeStamp
    lx = e.clientX
    strip.scrollLeft = s0 - dx
  })
  const release = () => {
    if (!down) return
    down = false
    strip.classList.remove('is-drag')
    if (moved && !reducedMotion() && Math.abs(v) > 0.05) { last = performance.now(); glide = requestAnimationFrame(glideStep) }
  }
  strip.addEventListener('pointerup', release)
  strip.addEventListener('pointercancel', release)
  strip.addEventListener('click', (e) => moved && (e.stopPropagation(), e.preventDefault(), (moved = false)), true)

  const nav = (n: string) => {
    if (n === 'first') to(0, true)
    else if (n === 'last') to(max(), true)
    else to(pos() + (n === 'next' ? 1 : -1) * REACH * strip.clientWidth, true)
  }
  // Arrows move the strip the way they point, so the right arrow always shows more of what lies to the right.
  const key = (e: KeyboardEvent) => {
    const step = 0.4 * strip.clientWidth
    if (e.key === 'ArrowRight') to(pos() + fwd * step, true)
    else if (e.key === 'ArrowLeft') to(pos() - fwd * step, true)
    else if (e.key === 'Home') nav('first')
    else if (e.key === 'End') nav('last')
    else return false
    return true
  }
  queue()
  return { nav, key, current, dispose: () => { io.disconnect(); cancelAnimationFrame(glide); cancelAnimationFrame(tick); removeEventListener('resize', queue) } }
}
