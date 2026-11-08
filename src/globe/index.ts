import { PerspectiveCamera, PlaneGeometry, Mesh, RepeatWrapping, Scene, ShaderMaterial, TextureLoader, Vector3, WebGLRenderer } from 'three'
import { FADE_MS, fade, go, reducedMotion } from '../app'
import { dprGovernor } from '../governor'
import type { Mount } from '../types'
import { alive, easeInOut, formatYear, greatCircle, place, spherePoint, sunNow, toPin, YEAR_MAX, YEAR_MIN, YEAR_START, type Pin } from './geo'
import { fragment, vertex } from './shader'
import './globe.css'

const FOV = 30
const MORPH_MS = 1100
const FLIGHT_MS = 2800
const tex = ['day', 'night', 'mask', 'relief', 'clouds'] as const

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text?: string) => {
  const e = document.createElement(tag)
  e.className = cls
  if (text) e.textContent = text
  return e
}

export const mount: Mount = (app, params) => {
  const atlas = params.mode === 'atlas'
  const root = el('div', '')
  root.dataset.view = atlas ? 'atlas' : 'globe'
  const canvas = el('canvas', 'globe-canvas')
  const pinLayer = el('div', 'globe-pins')
  const hud = el('div', 'globe-hud')
  const caption = el('p', 'globe-caption')
  caption.setAttribute('aria-live', 'polite')
  const time = el('div', 'globe-time')
  const slider = el('input', '')
  slider.type = 'range'
  slider.min = String(YEAR_MIN)
  slider.max = String(YEAR_MAX)
  slider.value = String(YEAR_START)
  slider.setAttribute('aria-label', 'Year')
  const yearOut = el('output', 'globe-year')
  const unroll = el('button', 'globe-unroll')
  unroll.type = 'button'
  const index = el('ul', 'globe-index')
  index.setAttribute('aria-label', 'Libraries on the globe')
  const card = el('section', 'globe-card')
  card.hidden = true
  card.setAttribute('aria-live', 'polite')
  const credit = el('p', 'globe-credit')
  credit.append(
    'Earth imagery: NASA ',
    Object.assign(el('a', '', 'Visible Earth'), { href: 'https://visibleearth.nasa.gov/', target: '_blank', rel: 'noopener' }),
    ' and Earth Observatory (Blue Marble, Black Marble), public domain under the ',
    Object.assign(el('a', '', 'NASA media guidelines'), { href: 'https://www.nasa.gov/nasa-brand-center/images-and-media/', target: '_blank', rel: 'noopener' }),
    '. Resized copies from the three.js r187 example set.',
  )
  time.append(slider, yearOut, unroll)
  hud.append(caption, time, index, credit)
  root.append(canvas, pinLayer, card, hud)
  app.append(root)

  let disposed = false
  let raf = 0
  let last = 0
  let year = YEAR_START
  let clock = 0
  let morphP = atlas ? 1 : 0
  let morphTo = morphP
  // Start with the visitor's own longitude facing the camera, so their local day or night shows first.
  let lon = (-new Date().getTimezoneOffset() / 4) * (Math.PI / 180)
  let lat = 0.5
  let lastTouch = 0
  let down = false
  let hovering = false
  let flight: { t: number; from: Vector3; to: Vector3; d0: number; d1: number; href: string } | null = null
  let renderer: WebGLRenderer | undefined
  let firstFrame = false
  const cleanups: (() => void)[] = []
  const on = <T extends EventTarget>(t: T, type: string, fn: (e: any) => void, o?: AddEventListenerOptions) => {
    t.addEventListener(type, fn, o)
    cleanups.push(() => t.removeEventListener(type, fn))
  }

  const camera = new PerspectiveCamera(FOV)
  const scene = new Scene()
  const uniforms = { uMorph: { value: morphP }, uTime: { value: 0 }, uSun: { value: sunNow() } } as Record<string, { value: unknown }>
  let w = 1
  let h = 1
  const tanHalf = Math.tan((FOV * Math.PI) / 360)
  const sphereDist = () => 1 / Math.sin(Math.atan(0.86 * tanHalf * Math.min(w, h) / h))
  const flatDist = () => Math.max(2.4 / (tanHalf * (w / h)), 1.25 / tanHalf)
  const morph = () => easeInOut(morphP)

  const pins: { pin: Pin; dot: HTMLElement; li: HTMLLIElement; shown: string }[] = []

  // Hit areas are 44px but dots can sit closer than that (Patna and Nalanda), so a tap goes to the nearest drawn dot.
  function nearest(e: MouseEvent) {
    const r = pinLayer.getBoundingClientRect()
    let best = '', bd = Infinity
    for (const p of pins) {
      if (!p.shown) continue
      const [x, y] = p.shown.split(',').map(Number) as [number, number]
      const d = (x + r.left - e.clientX) ** 2 + (y + r.top - e.clientY) ** 2
      if (d < bd) (bd = d), (best = p.pin.id)
    }
    return best
  }

  function select(id: string) {
    for (const p of pins) {
      p.dot.dataset.on = String(p.pin.id === id)
      p.li.firstElementChild!.setAttribute('data-on', String(p.pin.id === id))
      if (p.pin.id === id) {
        caption.replaceChildren(`${p.pin.name} `, Object.assign(el('i', ''), { textContent: `${p.pin.place}, ${p.pin.years}` }))
      }
    }
    request()
  }

  function showCard(p: Pin) {
    const up = (Math.asin(Math.max(-1, Math.min(1, spherePoint(p.lon, p.lat).dot(sunNow())))) * 180) / Math.PI
    const sky = up > 6 ? 'Daylight there now' : up > -6 ? 'Twilight there now' : 'Night there now'
    const links = el('p', 'globe-card-links')
    if (p.wd) links.append(Object.assign(el('a', '', 'Read about it'), { href: `https://www.wikidata.org/wiki/Special:GoToLinkedPage/enwiki/${p.wd}`, target: '_blank', rel: 'noopener' }))
    links.append(el('span', 'globe-card-note', 'No walkable room yet'))
    const close = el('button', 'globe-card-close', '\u00d7')
    close.type = 'button'
    close.setAttribute('aria-label', 'Close')
    close.addEventListener('click', hideCard)
    card.replaceChildren(
      close,
      el('h2', '', p.name),
      el('p', 'globe-card-meta', `${p.place}. ${p.years}.`),
      ...(p.st ? [el('p', 'globe-card-st', p.st)] : []),
      el('p', 'globe-card-sky', `${sky}, sun ${Math.round(up)}\u00b0 ${up >= 0 ? 'above' : 'below'} the horizon.`),
      links,
    )
    card.hidden = false
  }

  function hideCard() {
    card.hidden = true
  }

  function enter(id: string) {
    select(id)
    const p = pins.find((q) => q.pin.id === id)!.pin
    if (!p.href) return showCard(p)
    hideCard()
    if (flight) return
    const href = p.href
    const room = href.startsWith('/room/')
    if (room) fetch(`/lib/${id}.json`).catch(() => {})
    if (!room || reducedMotion() || morph() > 0.5) {
      fade(root, 0).then(() => !disposed && go(href))
      return
    }
    flight = {
      href,
      t: 0,
      from: spherePoint(lon, lat),
      to: spherePoint(p.lon, p.lat),
      d0: sphereDist(),
      d1: sphereDist() * 0.5,
    }
    request()
  }

  function setYear(y: number) {
    year = y
    yearOut.textContent = formatYear(y)
    slider.setAttribute('aria-valuetext', formatYear(y))
    for (const p of pins) {
      const a = alive(p.pin, y)
      p.dot.dataset.ghost = String(!a)
      p.li.hidden = y < p.pin.from
      p.li.dataset.ghost = String(!a)
    }
    request()
  }

  function setMorph(to: 0 | 1) {
    morphTo = to
    unroll.setAttribute('aria-pressed', String(to === 1))
    unroll.textContent = to === 1 ? 'Roll up' : 'Unroll'
    if (reducedMotion()) morphP = to
    request()
  }

  function project(p: { lon: number; lat: number }, m: number, cam: Vector3) {
    const v = place(p.lon, p.lat, m, 0.01)
    const front = m > 0.3 || spherePoint(p.lon, p.lat).dot(cam) > 0.15
    v.project(camera)
    return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, front }
  }

  function render(now: number) {
    if (!renderer) return
    const m = morph()
    uniforms.uMorph!.value = m
    uniforms.uTime!.value = clock
    const e = flight ? easeInOut(flight.t) : 0
    const dist = flight
      ? flight.d0 + (flight.d1 - flight.d0) * e + Math.sin(Math.PI * e) * 1.6
      : sphereDist() + (flatDist() - sphereDist()) * m
    const c = spherePoint(lon * (1 - m), lat * (1 - m))
    camera.position.copy(c).multiplyScalar(dist)
    camera.up.set(0, 1, 0)
    camera.lookAt(0, 0, 0)
    camera.updateMatrixWorld()
    renderer.render(scene, camera)
    const placed: [number, number][] = []
    const crowded = (x: number, y: number) => placed.some(([a, b]) => (a - x) ** 2 + (b - y) ** 2 < 144)
    for (const p of pins) {
      const s = project(p.pin, m, c)
      let { x, y } = s
      // Libraries in one city land on one pixel, so later ones step 12px aside to stay pointable.
      for (let k = 1; s.front && crowded(x, y) && k < 8; k++) (x = s.x + 12 * Math.cos(k * 2.4)), (y = s.y + 12 * Math.sin(k * 2.4))
      if (s.front) placed.push([x, y])
      const key = s.front ? `${x.toFixed(1)},${y.toFixed(1)}` : ''
      if (key === p.shown) continue
      p.shown = key
      p.dot.style.visibility = s.front ? 'visible' : 'hidden'
      if (s.front) p.dot.style.transform = `translate(${x}px, ${y}px)`
    }
    gov.frame(now)
    if (!firstFrame) {
      firstFrame = true
      const rm = reducedMotion()
      const poster = document.getElementById('poster')
      fade(canvas, 1, rm ? FADE_MS : 800)
      if (poster && !poster.hidden) fade(poster, 0, rm ? FADE_MS : 800)
      root.dataset.ready = 'true'
    }
  }

  function tick(now: number) {
    raf = 0
    const dt = last ? Math.min(now - last, 100) : 16
    last = now
    const rm = reducedMotion()
    let moving = false
    if (morphP !== morphTo) {
      morphP = rm ? morphTo : Math.min(1, Math.max(0, morphP + Math.sign(morphTo - morphP) * (dt / MORPH_MS)))
      moving = morphP !== morphTo
    }
    if (flight) {
      flight.t = Math.min(1, flight.t + dt / FLIGHT_MS)
      const c = greatCircle(flight.from, flight.to, easeInOut(flight.t))
      lon = Math.atan2(c.x, c.z)
      lat = Math.asin(c.y)
      if (flight.t >= 1) {
        const { href } = flight
        flight = null
        render(now)
        go(href)
        return
      }
      moving = true
    } else if (!rm && morphP === 0 && !down && !hovering && now - lastTouch > 3000) {
      lon += dt * 0.00004
      moving = true
    }
    if (!rm) {
      clock += dt / 1000
      moving = true
    }
    render(now)
    if (moving) request()
  }

  function request() {
    if (!raf && !disposed) raf = requestAnimationFrame(tick)
  }

  function resize() {
    w = root.clientWidth || innerWidth
    h = root.clientHeight || innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer?.setPixelRatio(gov.dpr)
    renderer?.setSize(w, h, false)
    for (const p of pins) p.shown = ''
    request()
  }

  const gov = dprGovernor((dpr) => {
    renderer?.setPixelRatio(dpr)
    renderer?.setSize(w, h, false)
  })

  // Start heavy work after the poster has painted so it stays the LCP element.
  const boot = setTimeout(
    () =>
      fetch('/lib/pins.json')
        .then((r) => r.json())
        .then((rows: Parameters<typeof toPin>[0][]) => init(rows.map(toPin)))
        .catch((e) => {
          console.error('globe', e)
          if (disposed) return
          const note = el('p', 'globe-credit', 'The globe could not be drawn in this browser. The Long Room is in the menu above.')
          note.setAttribute('role', 'status')
          root.append(note)
          root.dataset.ready = 'true'
        }),
    700,
  )

  async function init(list: Pin[]) {
    for (const pin of list) {
      const dot = el('span', 'globe-pin')
      dot.setAttribute('aria-hidden', 'true')
      dot.style.visibility = 'hidden'
      const li = el('li', '')
      const b = el('button', '', pin.name)
      b.type = 'button'
      li.append(b)
      const rec = { pin, dot, li, shown: '' }
      pins.push(rec)
      pinLayer.append(dot)
      index.append(li)
      b.addEventListener('click', () => enter(pin.id))
      dot.addEventListener('click', (e) => enter(nearest(e)))
      dot.addEventListener('pointermove', (e) => {
        hovering = true
        const id = nearest(e)
        if (pins.find((p) => p.pin.id === id)?.dot.dataset.on !== 'true') select(id)
      })
      dot.addEventListener('pointerleave', () => (hovering = false))
    }
    setYear(year)

    const loader = new TextureLoader()
    const maps = await Promise.all(tex.map((n) => loader.loadAsync(`/globe/${n}.webp`)))
    if (disposed) return maps.forEach((t) => t.dispose())
    tex.forEach((n, i) => {
      maps[i]!.anisotropy = 4
      uniforms['t' + n[0]!.toUpperCase() + n.slice(1)] = { value: maps[i] }
    })
    maps[4]!.wrapS = RepeatWrapping

    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    const geo = new PlaneGeometry(1, 1, 192, 96)
    const mat = new ShaderMaterial({ uniforms: uniforms as never, vertexShader: vertex, fragmentShader: fragment })
    const mesh = new Mesh(geo, mat)
    mesh.frustumCulled = false
    scene.add(mesh)
    cleanups.push(() => {
      geo.dispose()
      mat.dispose()
      maps.forEach((t) => t.dispose())
      renderer?.dispose()
    })
    resize()
  }

  slider.addEventListener('input', () => setYear(+slider.value))
  unroll.addEventListener('click', () => setMorph(morphTo ? 0 : 1))
  const ro = new ResizeObserver(resize)
  ro.observe(root)
  cleanups.push(() => ro.disconnect())

  let px = 0
  let py = 0
  on(canvas, 'pointerdown', (e: PointerEvent) => {
    if (flight) return
    down = true
    px = e.clientX
    py = e.clientY
    canvas.setPointerCapture(e.pointerId)
  })
  on(canvas, 'pointermove', (e: PointerEvent) => {
    if (!down || morphP > 0.5) return
    const k = 1 / (0.43 * Math.min(w, h))
    lon -= (e.clientX - px) * k
    lat = Math.max(-1.2, Math.min(1.2, lat + (e.clientY - py) * k))
    px = e.clientX
    py = e.clientY
    lastTouch = performance.now()
    request()
  })
  on(canvas, 'pointerup', () => ((down = false), (lastTouch = performance.now())))
  on(canvas, 'pointercancel', () => (down = false))

  on(document, 'keydown', (e: KeyboardEvent) => e.key === 'Escape' && hideCard())
  const sunTimer = setInterval(() => {
    uniforms.uSun!.value = sunNow()
    request()
  }, 60000)
  cleanups.push(() => clearInterval(sunTimer))

  setMorph(morphTo as 0 | 1)

  return () => {
    disposed = true
    clearTimeout(boot)
    cancelAnimationFrame(raf)
    cleanups.forEach((f) => f())
  }
}
