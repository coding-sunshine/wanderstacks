import './room.css'
import * as THREE from 'three'
import { fade, reducedMotion } from '../app'
import { dprGovernor } from '../governor'
import type { Library, Mount } from '../types'
import { buildPanel } from './panel'
import { beamTexture, dustTexture, floorTexture, spineTexture, vaultTexture, woodTexture } from './textures'
import type { BayMsg, Flat, Request } from './worker'

const EYE = 1.65
const SPEED = 2
const RAMP_MS = 2400
const DUST = 1500

function hash(s: string) {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return h >>> 0
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
    .then((data) => { if (!dead) stop = start(root, data) })
    .catch(() => {
      root.innerHTML = '<div class="page"><h1>Not on any shelf</h1><p><a href="/">Back to the globe</a></p></div>'
      root.dataset.ready = 'true'
    })
  return () => { dead = true; stop() }
}

function start(root: HTMLElement, lib: Library) {
  const reduced = reducedMotion()
  const h = Object.fromEntries(Object.entries(lib.hall).map(([k, p]) => [k, p.v])) as unknown as Flat & { windows: number }
  const { length: L, width: W, height: H, baysPerSide: N } = h
  const bayLen = L / N
  const springing = h.storeys * h.galleryHeight
  const aisle = W - 2 * h.alcoveDepth

  const panel = buildPanel(lib)
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
  hint.textContent = 'Drag to look. W A S D or arrow keys to walk. Tap the floor to go there.'
  const veil = document.createElement('div')
  veil.className = 'room-veil'
  const canvas = document.createElement('canvas')
  canvas.tabIndex = 0
  canvas.setAttribute('aria-label', `${lib.name}, a walkable reconstruction`)
  root.append(canvas, veil, status, hint, toggle, panel)

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

  const mat = (p: THREE.MeshLambertMaterialParameters) => own(new THREE.MeshLambertMaterial(p))

  const wood = own(woodTexture())
  const side = own(spineTexture([L / 3, springing / 2.6]))
  const floorMat = mat({ map: own(floorTexture([W, L])), color: 0x9a8a7a })
  const plane = (w: number, hh: number, m: THREE.Material, x: number, y: number, z: number, ry = 0, rx = 0) => {
    const g = own(new THREE.PlaneGeometry(w, hh))
    const mesh = new THREE.Mesh(g, m)
    mesh.position.set(x, y, z)
    mesh.rotation.set(rx, ry, 0)
    scene.add(mesh)
    return mesh
  }
  plane(W, L, floorMat, 0, 0, 0, 0, -Math.PI / 2)
  const wallMat = mat({ map: side })
  plane(L, springing, wallMat, -W / 2, springing / 2, 0, Math.PI / 2)
  plane(L, springing, wallMat, W / 2, springing / 2, 0, -Math.PI / 2)
  const impostor = new THREE.TextureLoader().load('/rooms/longroom/impostor.svg', () => (dirty = true))
  impostor.colorSpace = THREE.SRGBColorSpace
  own(impostor)
  plane(W, H, new THREE.MeshBasicMaterial({ map: impostor, fog: true }), 0, H / 2, -L / 2, 0)
  plane(W, H, mat({ color: 0x2b1a0d }), 0, H / 2, L / 2, Math.PI)

  const rise = H - springing
  const vaultGeo = own(new THREE.CylinderGeometry(1, 1, L, 40, 1, true, Math.PI / 2, Math.PI))
  vaultGeo.rotateX(Math.PI / 2)
  const vault = new THREE.Mesh(vaultGeo, mat({ map: own(vaultTexture(N)), side: THREE.BackSide }))
  vault.scale.set(W / 2, rise, 1)
  vault.position.y = springing
  scene.add(vault)

  scene.add(new THREE.HemisphereLight(0xffe2b0, 0x2a1a0d, 1.0))
  const sun = new THREE.DirectionalLight(0xffe7b8, 0.7)
  sun.position.set(-3, 10, 2)
  scene.add(sun)
  const lamp = new THREE.PointLight(0xffc472, 38, 0, 2)
  scene.add(lamp)

  // Windows sit on the vault near the springing, alternating sides; each throws a faint beam.
  const wins = Math.max(0, Math.round(h.windows))
  const glowM = new THREE.MeshBasicMaterial({ color: 0xfff0c8, side: THREE.DoubleSide, fog: false })
  const beamM = new THREE.MeshBasicMaterial({
    map: own(beamTexture()), transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  })
  const quad = own(new THREE.PlaneGeometry(1, 1))
  const glowI = new THREE.InstancedMesh(quad, glowM, wins)
  const beamI = new THREE.InstancedMesh(quad, beamM, wins * 2)
  const m4 = new THREE.Matrix4()
  const ax = new THREE.Vector3(), ay = new THREE.Vector3(), az = new THREE.Vector3(), pos = new THREE.Vector3()
  for (let k = 0; k < wins; k++) {
    const s = k % 2 ? 1 : -1
    const z = L / 2 - (Math.floor(k / 2) + 0.5) * (L / Math.max(1, wins / 2))
    const a = 0.45
    pos.set(s * (W / 2) * Math.cos(a) * 0.98, springing + rise * Math.sin(a), z)
    const tan = new THREE.Vector3(-s * (W / 2) * Math.sin(a), rise * Math.cos(a), 0).normalize()
    glowI.setMatrixAt(k, m4.makeBasis(ax.set(0, 0, 1.5), ay.copy(tan).multiplyScalar(2.2), az.set(1, 0, 0)).setPosition(pos))
    const dir = new THREE.Vector3(-s * 0.35, -1, 0).normalize()
    const len = pos.y / -dir.y
    const mid = pos.clone().addScaledVector(dir, len / 2)
    beamI.setMatrixAt(k * 2, m4.makeBasis(ax.set(0, 0, 1.5), ay.copy(dir).multiplyScalar(len), az.set(1, 0, 0)).setPosition(mid))
    beamI.setMatrixAt(k * 2 + 1, m4.makeBasis(ax.set(-dir.y, dir.x, 0).multiplyScalar(1.5), ay.copy(dir).multiplyScalar(len), az.set(0, 0, 1)).setPosition(mid))
  }
  glowI.frustumCulled = beamI.frustumCulled = false
  scene.add(glowI, beamI)

  const dust = new THREE.Points(
    own(new THREE.BufferGeometry()),
    own(new THREE.PointsMaterial({ size: 0.06, map: own(dustTexture()), transparent: true, opacity: 0.45, depthWrite: false, color: 0xffe2a8 })),
  )
  const dp = new Float32Array(DUST * 3)
  let seed = hash(lib.id)
  const r = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296)
  for (let i = 0; i < DUST; i++) dp.set([(r() - 0.5) * aisle, 0.5 + r() * (springing + 1), (r() - 0.5) * L], i * 3)
  dust.geometry.setAttribute('position', new THREE.BufferAttribute(dp, 3))
  dust.frustumCulled = false
  dust.visible = dustOn
  scene.add(dust)

  // Bays.
  const box = own(new THREE.BoxGeometry(1, 1, 1))
  const bookMat = mat({})
  const partMat = mat({ map: wood })
  const bays = new THREE.Group()
  scene.add(bays)
  let built = 0
  let open = false
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  const addBay = (m: BayMsg) => {
    for (const [mat, matrices, colors] of [[bookMat, m.books, m.bookColors], [partMat, m.parts, m.partColors]] as const) {
      const im = new THREE.InstancedMesh(box, mat, matrices.length / 16)
      im.instanceMatrix = new THREE.InstancedBufferAttribute(matrices, 16)
      im.instanceColor = new THREE.InstancedBufferAttribute(colors, 3)
      im.matrixAutoUpdate = false
      bays.add(im)
    }
    built++
    status.textContent = `Building the hall, ${built} of ${N} bays`
    if (built === N) status.hidden = true
    dirty = true
  }
  worker.onmessage = (e: MessageEvent<BayMsg>) => {
    addBay(e.data)
    if (e.data.bay === 0) {
      performance.mark('room:bay0')
      requestAnimationFrame(() => requestAnimationFrame(openDoor))
    }
  }
  const req: Request = { seed: hash(lib.id), hall: h, bays: Array.from({ length: N }, (_, i) => i) }
  worker.postMessage(req)

  // Camera and input.
  let yaw = 0, pitch = 0
  const cam = camera.position.set(0, EYE, L / 2 - 1.2)
  const vel = new THREE.Vector2()
  let goal: THREE.Vector3 | null = null
  const keys = new Set<string>()
  const clamp = () => {
    cam.x = THREE.MathUtils.clamp(cam.x, -aisle / 2 + 0.4, aisle / 2 - 0.4)
    const zMin = built >= N ? -L / 2 + 0.6 : L / 2 - built * bayLen + 0.5
    cam.z = THREE.MathUtils.clamp(cam.z, zMin, L / 2 - 0.6)
  }

  let rampStart = 0
  function openDoor() {
    if (open) return
    open = true
    performance.mark('room:door-open')
    status.hidden = built === N
    if (status.hidden === false) status.textContent = `Building the hall, ${built} of ${N} bays`
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
  let isReady = false
  function ready() {
    if (isReady) return
    isReady = true
    root.dataset.ready = 'true'
  }
  if (reduced) veil.style.opacity = '1'
  else veil.hidden = true

  const onKey = (e: KeyboardEvent, down: boolean) => {
    if ((e.target as Element).closest?.('.room-panel, .room-toggle') || e.ctrlKey || e.metaKey || e.altKey) return
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
    if (!['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) return
    e.preventDefault()
    down ? keys.add(k) : keys.delete(k)
    if (down) goal = null
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
    dirty = true
  })
  const ray = new THREE.Raycaster()
  const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  canvas.addEventListener('pointerup', (e) => {
    if (!drag) return
    const tap = drag.moved < 8 && e.timeStamp - drag.t < 400
    drag = null
    if (!tap || !open) return
    const b = canvas.getBoundingClientRect()
    ray.setFromCamera(new THREE.Vector2(((e.clientX - b.left) / b.width) * 2 - 1, -(((e.clientY - b.top) / b.height) * 2 - 1)), camera)
    const hit = ray.ray.intersectPlane(floor, new THREE.Vector3())
    if (!hit) return
    goal = hit.setY(EYE)
    if (reduced) {
      cam.copy(goal)
      clamp()
      goal = null
      dirty = true
    }
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
  let last = 0, raf = 0
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick)
    const dt = Math.min((now - (last || now)) / 1000, 0.1)
    last = now
    let moving = false
    if (open) {
      const f = +(keys.has('w') || keys.has('ArrowUp')) - +(keys.has('s') || keys.has('ArrowDown'))
      const s = +(keys.has('d') || keys.has('ArrowRight')) - +(keys.has('a') || keys.has('ArrowLeft'))
      fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw))
      rgt.crossVectors(fwd, up)
      want.set(0, 0, 0).addScaledVector(fwd, f).addScaledVector(rgt, s)
      if (goal) {
        const to = goal.clone().sub(cam).setY(0)
        if (to.length() < 0.12) goal = null
        else want.copy(to.normalize())
      }
      if (want.lengthSq() > 1) want.normalize()
      want.multiplyScalar(SPEED)
      const k = 1 - Math.exp(-dt * 7)
      vel.x += (want.x - vel.x) * k
      vel.y += (want.z - vel.y) * k
      if (vel.lengthSq() > 1e-4) {
        cam.x += vel.x * dt
        cam.z += vel.y * dt
        clamp()
        moving = true
      } else vel.set(0, 0)
    }
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
        if (dp[i * 3 + 1] < 0.3) dp[i * 3 + 1] = springing + 1
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
    worker.terminate()
    ro.disconnect()
    removeEventListener('keydown', kd)
    removeEventListener('keyup', ku)
    removeEventListener('blur', blur)
    owned.forEach((o) => o.dispose())
    renderer.dispose()
    renderer.forceContextLoss()
  }
}
