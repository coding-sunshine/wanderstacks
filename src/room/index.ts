import './room.css'
import * as THREE from 'three'
import { fade, reducedMotion } from '../app'
import { dprGovernor } from '../governor'
import type { Library, Mount } from '../types'
import * as evidence from './evidence'
import { hash, type Built, type KitModule, type RoomApi } from './kit'
import { buildOutside } from './outside'
import { buildPanel } from './panel'
import { addCredits, estimatedLabel, exteriorOf, firstPlace, placeButton, remember, type Place } from './place'
import * as sound from './sound'
import * as sunlight from './sunlight'
import * as spines from './spines'
import { dustTexture } from './textures'
import * as tour from './tour'

const EYE = 1.65
const SPEED = 2
const RAMP_MS = 2400
const FLY_MS = 1400
const DUST = 1500
const HINT = 'Drag to look. W A S D or arrow keys to walk. Tap the floor to go there.'

const kits: Record<Library['kit'], () => Promise<KitModule>> = {
  hall: () => import('./kits/hall').then((m) => m.default),
  rotunda: () => import('./kits/rotunda').then((m) => m.default),
  site: () => import('./kits/site').then((m) => m.default),
}

export const mount: Mount = (el, { lib }) => {
  performance.mark('room:start')
  const root = document.createElement('section')
  root.className = 'room'
  root.dataset.view = 'room'
  el.append(root)
  let stop = () => {}
  let dead = false
  fetch(`/lib/${lib}.json`)
    .then((r) => (r.ok ? (r.json() as Promise<Library>) : Promise.reject(new Error(String(r.status)))))
    .then(async (data) => {
      const kit = await kits[data.kit]()
      if (!dead) stop = start(root, data, kit)
    })
    .catch(() => {
      root.innerHTML = '<div class="page"><h1>Not on any shelf</h1><p><a href="/">Back to the globe</a></p></div>'
      root.dataset.ready = 'true'
    })
  return () => { dead = true; stop() }
}

const round2 = (n: number) => Number(n.toFixed(2))

function start(root: HTMLElement, lib: Library, kit: KitModule) {
  const reduced = reducedMotion()
  root.dataset.kit = lib.kit
  root.dataset.evidence = 'off'

  const panel = buildPanel(lib, kit.params)
  const toggle = document.createElement('button')
  toggle.className = 'room-toggle'
  toggle.setAttribute('aria-controls', 'room-panel')
  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open))
    toggle.textContent = open ? 'Hide notes' : 'Hall notes'
    panel.hidden = !open
  }
  setOpen(matchMedia('(min-width: 900px)').matches)
  toggle.onclick = () => setOpen(panel.hidden === true)
  const status = document.createElement('p')
  status.className = 'room-status'
  status.setAttribute('role', 'status')
  status.textContent = 'Opening the door'
  const hint = document.createElement('p')
  hint.className = 'room-hint'
  hint.textContent = HINT
  const veil = document.createElement('div')
  veil.className = 'room-veil'
  const controls = document.createElement('div')
  controls.className = 'room-controls'
  controls.setAttribute('role', 'group')
  controls.setAttribute('aria-label', 'Room tools')
  const canvas = document.createElement('canvas')
  canvas.tabIndex = 0
  canvas.setAttribute('aria-label', `${lib.name}, a walkable reconstruction`)
  const ex = lib.kit === 'site' ? null : exteriorOf(lib)
  const enterBtn = placeButton('enter'), exitBtn = placeButton('exit')
  const estimated = ex ? estimatedLabel(ex) : null
  root.append(canvas, veil, status, hint, controls, toggle, panel)
  if (ex) root.append(enterBtn, exitBtn, estimated!)
  addCredits(panel, ex)
  if (lib.reconstruction) {
    const badge = document.createElement('p')
    badge.className = 'room-badge'
    badge.dataset.badge = 'reconstruction'
    badge.textContent = 'Reconstruction'
    root.append(badge)
  }

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  } catch {
    canvas.remove()
    veil.remove()
    status.textContent = 'This browser cannot draw the 3D room. The notes and shelves are still here.'
    hint.remove()
    setOpen(true)
    root.dataset.ready = 'true'
    return () => {}
  }

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0b0805)
  scene.fog = new THREE.FogExp2(0x150e08, 0.02)
  const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 120)
  const owned: { dispose(): void }[] = []
  const own = <T extends { dispose(): void }>(x: T) => (owned.push(x), x)

  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = reduced ? 1 : 0.02

  let dirty = true
  let dustOn = !reduced
  const governor = dprGovernor((dpr) => {
    renderer.setPixelRatio(dpr)
    renderer.setSize(root.clientWidth, root.clientHeight, false)
    if (dpr < max) dustOn = dust.visible = false
    dirty = true
  })
  const max = governor.dpr
  renderer.setPixelRatio(max)

  const lamp = new THREE.PointLight(0xffc472, 38, 0, 2)
  scene.add(lamp)

  const dust = new THREE.Points(
    own(new THREE.BufferGeometry()),
    own(new THREE.PointsMaterial({ size: 0.06, map: own(dustTexture()), transparent: true, opacity: 0.45, depthWrite: false, color: 0xffe2a8 })),
  )
  const dp = new Float32Array(DUST * 3)
  dust.frustumCulled = false
  dust.visible = dustOn
  scene.add(dust)

  let dustTop = 0
  let yaw = 0, pitch = 0
  const cam = camera.position.set(0, EYE, 0)
  const vel = new THREE.Vector2()
  let glide: { t: number; dur: number; from: THREE.Vector3; to: THREE.Vector3 } | null = null
  let fly: { t: number; ms: number; from: THREE.Vector3; to: THREE.Vector3; y0: number; y1: number; p0: number; p1: number; done: () => void } | null = null
  const keys = new Set<string>()
  const publishYaw = () => (root.dataset.yaw = String(Math.round(((yaw * 180) / Math.PI) * 10) / 10))
  const publishCam = () => {
    root.dataset.camera = JSON.stringify(cam.toArray().map(round2))
    publishYaw()
  }
  const stopGlide = () => {
    glide = null
    delete root.dataset.goal
  }

  let open = false
  let rampStart = 0
  let isReady = false
  function ready() {
    if (isReady) return
    isReady = true
    root.dataset.ready = 'true'
  }
  function openDoor() {
    if (open) return
    open = true
    performance.mark('room:door-open')
    // Keepsakes: a passport stamp and a visitors' book entry for walking in.
    try {
      const stamps = JSON.parse(localStorage.getItem('wl.passport') ?? '[]') as { id: string; at: number }[]
      if (!stamps.some((s) => s.id === lib.id)) {
        stamps.push({ id: lib.id, at: Date.now() })
        localStorage.setItem('wl.passport', JSON.stringify(stamps))
      }
      const book = JSON.parse(localStorage.getItem('wl.bookv2') ?? '{"entries":[]}') as { name?: string; entries: { id: string; at: number }[] }
      if (book.name && !book.entries.some((e) => e.id === lib.id)) {
        book.entries.push({ id: lib.id, at: Date.now() })
        localStorage.setItem('wl.bookv2', JSON.stringify(book))
      }
    } catch {
      // keepsakes are best-effort
    }
    if (reduced) {
      veil.style.opacity = '1'
      fade(veil, 0, 150).then(() => (veil.hidden = true))
      ready()
    } else {
      veil.hidden = true
      rampStart = performance.now()
    }
    dirty = true
  }
  if (reduced) veil.style.opacity = '1'
  else veil.hidden = true

  const fail = () => {
    status.hidden = false
    status.textContent = 'The hall could not be built. The notes and shelves are still here.'
    setOpen(true)
    ready()
  }

  const goTo: RoomApi['goTo'] = (at, look, ms = FLY_MS) =>
    new Promise((resolve) => {
      fly?.done()
      const to = new THREE.Vector3(...at)
      const d = new THREE.Vector3(...look).sub(to)
      const y1 = Math.atan2(-d.x, -d.z)
      const p1 = Math.atan2(d.y, Math.hypot(d.x, d.z))
      stopGlide()
      vel.set(0, 0)
      if (reduced) {
        cam.copy(to)
        yaw = y1
        pitch = p1
        fly = null
        dirty = true
        publishCam()
        resolve()
        return
      }
      const turn = Math.atan2(Math.sin(y1 - yaw), Math.cos(y1 - yaw))
      fly = { t: 0, ms, from: cam.clone(), to, y0: yaw, y1: yaw + turn, p0: pitch, p1, done: resolve }
    })

  const taps: RoomApi['taps'] = []
  // The kit builds into `inner`, so the whole interior hides while the visitor is outside.
  const inner = new THREE.Group()
  scene.add(inner)
  const kitScene = Object.create(scene, { add: { value: (...o: THREE.Object3D[]) => inner.add(...o) } }) as THREE.Scene
  const outside = ex ? buildOutside(ex, own) : null
  if (outside) scene.add(outside.group)
  const hallBg = scene.background, hallFog = scene.fog
  const skyBg = new THREE.Color(0xa9c4dc), skyFog = new THREE.Fog(0xa9c4dc, 40, 140)
  let place: Place = 'inside'
  let built: Built
  const clampAt = (p: THREE.Vector3) => (place === 'outside' ? outside!.clamp(p) : built.clamp(p))

  function show(p: Place) {
    place = p
    const out = p === 'outside'
    root.dataset.place = p
    inner.visible = lamp.visible = !out
    dust.visible = !out && dustOn
    if (outside) outside.group.visible = out
    scene.background = out ? skyBg : hallBg
    scene.fog = out ? skyFog : hallFog
    enterBtn.hidden = !out
    exitBtn.hidden = p !== 'inside' || !ex
    if (estimated) estimated.hidden = !(out && ex!.estimated.length)
    for (const k of ['massing', 'footprint', 'door', 'textures']) delete root.dataset[k]
    if (out) {
      root.dataset.massing = JSON.stringify([ex!.w, ex!.d, ex!.h])
      root.dataset.footprint = JSON.stringify(outside!.footprint)
      root.dataset.door = JSON.stringify(outside!.door)
      const count = () => place === 'outside' && (root.dataset.textures = String(outside!.loaded()))
      count()
      outside!.load(() => (count(), (dirty = true)))
    }
    const s = out ? outside!.spawn : { pos: built.start.pos, yaw: built.start.yaw, pitch: 0 }
    fly?.done()
    fly = null
    stopGlide()
    vel.set(0, 0)
    keys.clear()
    cam.set(...s.pos)
    yaw = s.yaw
    pitch = s.pitch
    hint.textContent = out ? 'Drag to look. W A S D or arrow keys to walk to the door.' : HINT
    publishCam()
    dirty = true
  }
  let busy = false
  function go(p: Place) {
    if (busy || p === place) return
    remember(p)
    keys.clear()
    vel.set(0, 0)
    if (reduced) return show(p), canvas.focus({ preventScroll: true })
    busy = true
    veil.hidden = false
    fade(veil, 1, 150)
      .then(() => (show(p), canvas.focus({ preventScroll: true }), fade(veil, 0, 200)))
      .then(() => ((veil.hidden = true), (busy = false)))
  }
  enterBtn.onclick = () => go('inside')
  exitBtn.onclick = () => go('outside')

  let raf = 0
  let detach: (() => void)[] = []
  try {
    const b = kit.build({ lib, scene: kitScene, own, dirty: () => (dirty = true), reduced })
    built = b
    show(firstPlace(lib, ex))

    const box = new THREE.Box3().setFromObject(b.core)
    const r = (n: 'x' | 'y' | 'z') => [round2(box.min[n]), round2(box.max[n])]
    root.dataset.bounds = JSON.stringify({ x: r('x'), y: r('y'), z: r('z') })
    publishCam()

    // Dust fills the walkable middle: inside the alcoves, below the roof.
    const inset = 2 * Number((lib.hall as unknown as Record<string, { v: number } | undefined>).alcoveDepth?.v ?? 0)
    const size = box.getSize(new THREE.Vector3())
    dustTop = 0.5 + 0.8 * box.max.y
    let seed = hash(lib.id)
    const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296)
    const mid = box.getCenter(new THREE.Vector3())
    for (let i = 0; i < DUST; i++) {
      dp.set([mid.x + (rnd() - 0.5) * Math.max(1, size.x - inset), 0.5 + rnd() * (dustTop - 0.5), mid.z + (rnd() - 0.5) * size.z], i * 3)
    }
    dust.geometry.setAttribute('position', new THREE.BufferAttribute(dp, 3))

    const api: RoomApi = {
      root, lib, controls, panel, scene, camera, canvas,
      core: b.core, parts: b.parts, lamp, lights: b.lights, acoustics: b.acoustics, params: kit.params, reduced,
      goTo, taps,
      clamp: (p) => clampAt(p),
      slots: b.spineSlots,
      render: () => (dirty = true),
    }
    detach = [evidence, tour, sound, sunlight, spines].map((m) => m.attach(api))

    b.ready
      .then(() => {
        performance.mark('room:bay0')
        requestAnimationFrame(() => requestAnimationFrame(openDoor))
      })
      .catch(fail)
  } catch {
    fail()
    owned.forEach((o) => o.dispose())
    renderer.dispose()
    return () => {}
  }

  const onKey = (e: KeyboardEvent, down: boolean) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
    if (!down) keys.delete(k)
    if ((e.target as Element).closest?.('.room-panel, .room-toggle, .room-controls, .room-place, [data-tour], [role=dialog]') || e.ctrlKey || e.metaKey || e.altKey) return
    if (!['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) return
    e.preventDefault()
    if (down) {
      keys.add(k)
      stopGlide()
    }
  }
  const kd = (e: KeyboardEvent) => onKey(e, true)
  const ku = (e: KeyboardEvent) => onKey(e, false)
  addEventListener('keydown', kd)
  addEventListener('keyup', ku)
  const blur = () => keys.clear()
  addEventListener('blur', blur)

  let drag: { x: number; y: number; t: number; moved: number } | null = null
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId)
    canvas.focus({ preventScroll: true })
    drag = { x: e.clientX, y: e.clientY, t: e.timeStamp, moved: 0 }
  })
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y
    drag.x = e.clientX
    drag.y = e.clientY
    drag.moved += Math.abs(dx) + Math.abs(dy)
    yaw -= dx * 0.004
    pitch = THREE.MathUtils.clamp(pitch - dy * 0.004, -1.1, 1.1)
    publishYaw()
    dirty = true
  })
  const ray = new THREE.Raycaster()
  const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  canvas.addEventListener('pointerup', (e) => {
    if (!drag) return
    publishCam()
    const tap = drag.moved < 8 && e.timeStamp - drag.t < 400
    drag = null
    if (!tap || !open || root.dataset.evidence === 'on') return
    const b = canvas.getBoundingClientRect()
    ray.setFromCamera(new THREE.Vector2(((e.clientX - b.left) / b.width) * 2 - 1, -(((e.clientY - b.top) / b.height) * 2 - 1)), camera)
    if (taps.some((h) => h(e))) return
    const hit = ray.ray.intersectPlane(floor, new THREE.Vector3())
    if (!hit) return
    const to = hit.clone()
    clampAt(to)
    const d = Math.hypot(to.x - cam.x, to.z - cam.z)
    if (d < 0.3) return
    to.y = cam.y
    vel.set(0, 0)
    if (reduced) {
      cam.copy(to)
      dirty = true
      publishCam()
      return
    }
    glide = { t: 0, dur: Math.min(4.5, Math.max(0.8, 0.5 + d / 3.5)), from: cam.clone(), to }
    root.dataset.goal = JSON.stringify([round2(to.x), round2(to.z)])
  })
  canvas.addEventListener('pointercancel', () => (drag = null))

  const size = () => {
    const w = root.clientWidth || 1, hh = root.clientHeight || 1
    renderer.setSize(w, hh, false)
    camera.aspect = w / hh
    camera.updateProjectionMatrix()
    dirty = true
  }
  const ro = new ResizeObserver(size)
  ro.observe(root)
  size()

  const up = new THREE.Vector3(0, 1, 0)
  const fwd = new THREE.Vector3(), rgt = new THREE.Vector3(), want = new THREE.Vector3()
  let last = 0
  let wasMoving = false
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick)
    const dt = Math.min((now - (last || now)) / 1000, 0.1)
    last = now
    let moving = false
    const line = built.status?.() ?? null
    status.hidden = open && line === null
    if (line !== null && status.textContent !== line) status.textContent = line
    if (fly) {
      fly.t = Math.min(1, fly.t + dt / (fly.ms / 1000))
      const e = fly.t * fly.t * (3 - 2 * fly.t)
      cam.lerpVectors(fly.from, fly.to, e)
      yaw = fly.y0 + (fly.y1 - fly.y0) * e
      pitch = fly.p0 + (fly.p1 - fly.p0) * e
      dirty = true
      if (fly.t === 1) {
        const f = fly
        fly = null
        publishCam()
        f.done()
      }
    } else if (glide) {
      glide.t = Math.min(1, glide.t + dt / glide.dur)
      const e = glide.t * glide.t * (3 - 2 * glide.t)
      cam.x = glide.from.x + (glide.to.x - glide.from.x) * e
      cam.z = glide.from.z + (glide.to.z - glide.from.z) * e
      publishCam()
      dirty = true
      if (glide.t === 1) stopGlide()
      if (place === 'outside' && outside!.atDoor(cam)) go('inside')
    } else if (open) {
      const f = +(keys.has('w') || keys.has('ArrowUp')) - +(keys.has('s') || keys.has('ArrowDown'))
      const s = +(keys.has('d') || keys.has('ArrowRight')) - +(keys.has('a') || keys.has('ArrowLeft'))
      fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw))
      rgt.crossVectors(fwd, up)
      want.set(0, 0, 0).addScaledVector(fwd, f).addScaledVector(rgt, s)
      if (want.lengthSq() > 1) want.normalize()
      want.multiplyScalar(SPEED)
      const k = 1 - Math.exp(-dt * 7)
      vel.x += (want.x - vel.x) * k
      vel.y += (want.z - vel.y) * k
      if (vel.lengthSq() > 1e-4) {
        cam.x += vel.x * dt
        cam.z += vel.y * dt
        clampAt(cam)
        moving = true
        publishCam()
        if (place === 'outside' && outside!.atDoor(cam)) go('inside')
      } else vel.set(0, 0)
    }
    if (wasMoving && !moving) publishCam()
    wasMoving = moving
    if (rampStart) {
      const t = Math.min(1, (now - rampStart) / RAMP_MS)
      renderer.toneMappingExposure = 0.02 + 0.98 * (1 - (1 - t) ** 3)
      dirty = true
      if (t >= 0.35) ready()
      if (t === 1) rampStart = 0
    }
    if (dustOn && open) {
      const t = now / 1000
      for (let i = 0; i < DUST; i++) {
        dp[i * 3 + 1] -= dt * (0.02 + (i % 5) * 0.01)
        if (dp[i * 3 + 1] < 0.3) dp[i * 3 + 1] = dustTop
        dp[i * 3] += Math.sin(t * 0.3 + i) * dt * 0.03
      }
      dust.geometry.attributes.position.needsUpdate = true
      dirty = true
    }
    if (!dirty && !moving) return
    dirty = false
    camera.rotation.set(pitch, yaw, 0, 'YXZ')
    lamp.position.set(cam.x, cam.y + 0.3, cam.z)
    renderer.render(scene, camera)
    governor.frame(now)
    root.dataset.calls = String(renderer.info.render.calls)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    detach.forEach((d) => d())
    built.dispose?.()
    ro.disconnect()
    removeEventListener('keydown', kd)
    removeEventListener('keyup', ku)
    removeEventListener('blur', blur)
    owned.forEach((o) => o.dispose())
    renderer.dispose()
    renderer.forceContextLoss()
  }
}
