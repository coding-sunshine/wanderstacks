import { PerspectiveCamera, PlaneGeometry, Mesh, RepeatWrapping, Scene, ShaderMaterial, TextureLoader, Vector3, WebGLRenderer } from 'three'
import { FADE_MS, fade, go, reducedMotion } from '../app'
import { dprGovernor } from '../governor'
import type { Mount } from '../types'
import { alive, easeInOut, formatYear, greatCircle, place, spherePoint, sunDir, toPin, YEAR_MAX, YEAR_MIN, YEAR_START, type Pin } from './geo'
import { fragment, vertex } from './shader'
import './globe.css'

const FOV = 30
const MORPH_MS = 1100
const FLIGHT_MS = 2800
const ROOM_PIN = 'longroom'
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
  root.append(canvas, pinLayer, hud)
  app.append(root)

  let disposed = false
  let raf = 0
  let last = 0
  let dirty = true
  let year = YEAR_START
  let clock = 0
  let morphP = atlas ? 1 : 0
  let morphTo = morphP
  let lon = 0.15
  let lat = 0.5
  let lastTouch = 0
  let down = false
  let hovering = false
  let flight: { t: number; from: Vector3; to: Vector3; d0: number; d1: number } | null = null
  let renderer: WebGLRenderer | undefined
  let firstFrame = false
  const cleanups: (() => void)[] = []
  const on = <T extends EventTarget>(t: T, type: string, fn: (e: any) => void, o?: AddEventListenerOptions) => {
    t.addEventListener(type, fn, o)
    cleanups.push(() => t.removeEventListener(type, fn))
  }

  const camera = new PerspectiveCamera(FOV)
  const scene = new Scene()
  const uniforms = { uMorph: { value: morphP }, uTime: { value: 0 }, uSun: { value: sunDir(year) } } as Record<string, { value: unknown }>
  let w = 1
  let h = 1
  const tanHalf = Math.tan((FOV * Math.PI) / 360)
  const sphereDist = () => 1 / Math.sin(Math.atan(0.86 * tanHalf * Math.min(w, h) / h))
  const flatDist = () => Math.max(2.4 / (tanHalf * (w / h)), 1.25 / tanHalf)
  const morph = () => easeInOut(morphP)

  const pins: { pin: Pin; dot: HTMLElement; li: HTMLLIElement; shown: string }[] = []

  function select(id: string) {
    for (const p of pins) {
      p.dot.dataset.on = String(p.pin.id === id)
      p.li.firstElementChild!.setAttribute('data-on', String(p.pin.id === id))
      if (p.pin.id === id) {
        caption.replaceChildren(`${p.pin.name} `, Object.assign(el('i', ''), { textContent: `${p.pin.place}, ${p.pin.years}` }))
      }
    }
    dirty = true
    request()
  }

  function enter(id: string) {
    select(id)
    if (id !== ROOM_PIN || flight) return
    fetch('/lib/longroom.json').catch(() => {})
    if (reducedMotion() || morph() > 0.5) {
      fade(root, 0).then(() => !disposed && go('/room/longroom'))
      return
    }
    const p = pins.find((q) => q.pin.id === id)!.pin
    flight = {
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
    uniforms.uSun!.value = sunDir(y)
    for (const p of pins) {
      const a = alive(p.pin, y)
      p.dot.dataset.ghost = String(!a)
      p.li.hidden = !a
    }
    dirty = true
    request()
  }

  function setMorph(to: 0 | 1) {
    morphTo = to
    unroll.setAttribute('aria-pressed', String(to === 1))
    unroll.textContent = to === 1 ? 'Roll up' : 'Unroll'
    if (reducedMotion()) morphP = to
    dirty = true
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
    for (const p of pins) {
      const s = project(p.pin, m, c)
      const key = s.front ? `${s.x.toFixed(1)},${s.y.toFixed(1)}` : ''
      if (key === p.shown) continue
      p.shown = key
      p.dot.style.visibility = s.front ? 'visible' : 'hidden'
      if (s.front) p.dot.style.transform = `translate(${s.x}px, ${s.y}px)`
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
      dirty = true
    }
    if (flight) {
      flight.t = Math.min(1, flight.t + dt / FLIGHT_MS)
      const c = greatCircle(flight.from, flight.to, easeInOut(flight.t))
      lon = Math.atan2(c.x, c.z)
      lat = Math.asin(c.y)
      if (flight.t >= 1) {
        flight = null
        render(now)
        go('/room/longroom')
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
    dirty = false
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
    dirty = true
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
        .catch((e) => console.error('globe pins', e)),
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
      dot.addEventListener('click', () => enter(pin.id))
      dot.addEventListener('pointerenter', () => {
        hovering = true
        select(pin.id)
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
    dirty = true
    request()
  })
  on(canvas, 'pointerup', () => ((down = false), (lastTouch = performance.now())))
  on(canvas, 'pointercancel', () => (down = false))

  setMorph(morphTo as 0 | 1)

  return () => {
    disposed = true
    clearTimeout(boot)
    cancelAnimationFrame(raf)
    cleanups.forEach((f) => f())
  }
}
