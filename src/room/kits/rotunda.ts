import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Built, KitCtx, KitModule } from '../kit'
import { spineTexture, vaultTexture, woodTexture } from '../textures'

const EYE = 1.65

const params: KitModule['params'] = [
  ['span', 'Span', ' m'], ['domeHeight', 'Dome height', ' m'], ['crownHeight', 'Crown height', ' m'], ['sides', 'Sides', ''],
  ['alcoveDepth', 'Alcove depth', ' m'], ['alcoveWidth', 'Alcove width', ' m'], ['piers', 'Piers', ''],
  ['plinthHeight', 'Plinth height', ' m'], ['galleryHeight', 'Gallery height', ' m'], ['shelfUnit', 'Shelf unit', ''],
  ['materials', 'Materials', ''], ['drumHeight', 'Drum height', ' m'], ['pierWidth', 'Pier width', ' m'], ['lanternRadius', 'Lantern radius', ' m'],
  ['corniceHeight', 'Cornice height', ' m'], ['corniceDepth', 'Cornice depth', ' m'],
]

interface Dims {
  span: number; domeHeight: number; crownHeight: number; sides: number; alcoveDepth: number; alcoveWidth: number
  piers: number; plinthHeight: number; galleryHeight: number; shelfUnit: { width: number; shelves: number }
  drumHeight: number; pierWidth: number; lanternRadius: number; corniceHeight: number; corniceDepth: number
}

// Window sizes (w, h) for the glowing quads: drum, lantern, alcove tympanum.
const WIN = { drum: [3.6, 4.2], lantern: [1.8, 4.8], alcove: [4.4, 2.6] } as const

function marble() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  for (let i = 0; i < 4; i++) {
    g.fillStyle = (i % 2) ^ (i >> 1) ? '#8f857a' : '#cfc4b2'
    g.fillRect((i % 2) * 64, (i >> 1) * 64, 64, 64)
  }
  g.fillStyle = 'rgba(0,0,0,0.25)'
  for (const o of [0, 64]) { g.fillRect(0, o, 128, 1.5); g.fillRect(o, 0, 1.5, 128) }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 4
  return t
}

function build({ lib, scene, own, dirty }: KitCtx): Built {
  const h = Object.fromEntries(Object.entries(lib.hall).map(([k, p]) => [k, p.v])) as unknown as Dims
  const N = h.sides
  const step = (2 * Math.PI) / N, half = Math.PI / N
  const R = h.span / 2, D = h.alcoveDepth, W = h.alcoveWidth, Ri = R - D
  const P = h.plinthHeight, G = h.galleryHeight
  const DRUM = h.drumHeight, PIER = h.pierWidth, LANTERN_TOP = h.lanternRadius
  const S = G + 1.9 // a second shelf tier sits above the gallery walk
  const Yd = P + DRUM
  const Rc = Ri / Math.cos(half) // corner radius of the inner octagon
  const flat = 2 * Ri * Math.tan(half)
  const lanternH = h.crownHeight - h.domeHeight
  const capH = lanternH * 0.31
  const rp = Rc - 1.5 // pier centre, pushed forward of the corner into the room

  const core = new THREE.Group()
  scene.add(core)
  const parts: Built['parts'] = {}

  const buckets = new Map<string, THREE.BufferGeometry[]>()
  const put = (key: string, geo: THREE.BufferGeometry, angle: number, x: number, y: number, z: number, ry = 0, uv?: [number, number]) => {
    const g = geo.index ? geo.toNonIndexed() : geo
    for (const n of Object.keys(g.attributes)) if (n !== 'position' && n !== 'normal' && n !== 'uv') g.deleteAttribute(n)
    if (uv) {
      const a = g.getAttribute('uv')
      for (let i = 0; i < a.count; i++) a.setXY(i, a.getX(i) * uv[0], a.getY(i) * uv[1])
    }
    g.applyMatrix4(new THREE.Matrix4().makeRotationY(angle).multiply(new THREE.Matrix4().makeTranslation(x, y, z)).multiply(new THREE.Matrix4().makeRotationY(ry)))
    const list = buckets.get(key) ?? []
    list.push(g)
    buckets.set(key, list)
    if (g !== geo) geo.dispose()
  }

  const tw = 4 * h.shelfUnit.width, th = 6 * (2.45 / h.shelfUnit.shelves)
  const arch = new THREE.Shape()
  const hw = flat / 2 + 0.4
  arch.moveTo(-hw, 0).lineTo(hw, 0).lineTo(hw, P).lineTo(-hw, P)
  const hole = new THREE.Path()
  hole.moveTo(-W / 2, 0.01).lineTo(-W / 2, S).absarc(0, S, W / 2, Math.PI, 0, true)
  hole.lineTo(W / 2, 0.01)
  arch.holes.push(hole)
  const tympanum = new THREE.Shape().absarc(0, 0, W / 2, 0, Math.PI, false)

  const zc = Ri + D / 2
  for (let k = 0; k < N; k++) {
    const a = k * step
    put('span', new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2), a, 0, 0, zc, 0, [W / 2, D / 2])
    for (const s of [-1, 1]) put('alcoveDepth', new THREE.PlaneGeometry(D, S), a, s * (W / 2), S / 2, zc, (s * Math.PI) / 2, [D / tw, S / th])
    put('shelfUnit', new THREE.PlaneGeometry(W, S), a, 0, S / 2, R, Math.PI, [W / tw, S / th])
    put('alcoveWidth', new THREE.ShapeGeometry(tympanum, 12), a, 0, S, R - 0.01, Math.PI, [0.25, 0.25])
    put('alcoveWidth', new THREE.CylinderGeometry(W / 2, W / 2, D, 12, 1, true, Math.PI / 2, Math.PI).rotateX(Math.PI / 2), a, 0, S, zc, 0, [1, D / 2.5])
    put('galleryHeight', new THREE.BoxGeometry(W, 0.25, D), a, 0, G, zc)
    put('galleryHeight', new THREE.BoxGeometry(W, 1, 0.15), a, 0, G + 0.625, Ri + 0.1)
    put('sides', new THREE.ShapeGeometry(arch, 12), a, 0, 0, Ri)
    put('drumHeight', new THREE.PlaneGeometry(flat, DRUM), a, 0, P + DRUM / 2, Ri)
    put('corniceHeight', new THREE.BoxGeometry(flat + h.corniceDepth, h.corniceHeight, h.corniceDepth), a, 0, P, Ri - 0.15)

    const f = half + k * step
    put('pierWidth', new THREE.BoxGeometry(PIER, P, PIER), f, 0, P / 2, rp)
    put('pierWidth', new THREE.BoxGeometry(PIER + 0.5, 0.6, PIER + 0.5), f, 0, P - 0.3, rp)
    put('pierWidth', new THREE.BoxGeometry(PIER + 0.4, 0.5, PIER + 0.4), f, 0, 0.25, rp)
  }
  put('span', new THREE.CircleGeometry(Rc, N).rotateX(-Math.PI / 2), half, 0, 0, 0, 0, [Rc / 2, Rc / 2])

  const domeProfile = Array.from({ length: 7 }, (_, i) => {
    const t = (i / 6) * (Math.PI / 2)
    return new THREE.Vector2(LANTERN_TOP + (Rc - LANTERN_TOP) * Math.cos(t), Yd + (h.domeHeight - Yd) * Math.sin(t))
  })
  put('domeHeight', new THREE.LatheGeometry(domeProfile, N), half, 0, 0, 0, 0, [1, 5])
  const capBase = h.crownHeight - capH
  put('lanternRadius', new THREE.CylinderGeometry(LANTERN_TOP, LANTERN_TOP, capBase - h.domeHeight, N, 1, true), half, 0, (capBase + h.domeHeight) / 2, 0)
  const capProfile = Array.from({ length: 5 }, (_, i) => {
    const t = (i / 4) * (Math.PI / 2)
    return new THREE.Vector2(Math.max(0.01, LANTERN_TOP * Math.cos(t)), capBase + capH * Math.sin(t))
  })
  put('lanternRadius', new THREE.LatheGeometry(capProfile, N), half, 0, 0, 0)

  const vault = own(vaultTexture(1))
  const spine = own(spineTexture([1, 1]))
  const mat = (p: THREE.MeshLambertMaterialParameters) => own(new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, ...p }))
  const mats: Record<string, THREE.MeshLambertMaterial> = {
    span: mat({ map: own(marble()), color: 0xb0a090 }),
    alcoveDepth: mat({ map: spine }),
    shelfUnit: mat({ map: spine }),
    alcoveWidth: mat({ map: vault }),
    galleryHeight: mat({ map: own(woodTexture()) }),
    sides: mat({ color: 0xcdbb98 }),
    pierWidth: mat({ color: 0x9a5642 }),
    corniceHeight: mat({ color: 0xd8c9a8 }),
    domeHeight: mat({ map: vault, flatShading: true }),
    lanternRadius: mat({ color: 0xd9c9a0, flatShading: true }),
    drumHeight: mat({ color: 0xcdbb98 }),
  }
  for (const [key, list] of buckets) {
    const mesh = new THREE.Mesh(own(mergeGeometries(list)!), mats[key])
    list.forEach((g) => g.dispose())
    core.add(mesh)
    parts[key] = [mesh]
  }

  // Window glow: drum, lantern and alcove tympanum quads, one instanced draw.
  const quads: { a: number; y: number; z: number; w: number; h: number }[] = []
  for (let k = 0; k < N; k++) {
    const a = k * step
    quads.push(
      { a, y: P + DRUM / 2 + 0.2, z: Ri - 0.05, w: WIN.drum[0], h: WIN.drum[1] },
      { a, y: h.domeHeight + (capBase - h.domeHeight) / 2, z: LANTERN_TOP * Math.cos(half) - 0.05, w: WIN.lantern[0], h: WIN.lantern[1] },
      { a, y: S + 1.8, z: R - 0.04, w: WIN.alcove[0], h: WIN.alcove[1] },
    )
  }
  const glow = new THREE.InstancedMesh(own(new THREE.PlaneGeometry(1, 1)), own(new THREE.MeshBasicMaterial({ color: 0xfff0c8, side: THREE.DoubleSide, fog: false })), quads.length)
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0)
  quads.forEach((w, i) =>
    glow.setMatrixAt(i, m4.compose(new THREE.Vector3(Math.sin(w.a) * w.z, w.y, Math.cos(w.a) * w.z), q.setFromAxisAngle(up, w.a), new THREE.Vector3(w.w, w.h, 1))),
  )
  glow.frustumCulled = false
  scene.add(glow)

  const hemi = new THREE.HemisphereLight(0xffe9c2, 0x3a2a1a, 0.9)
  scene.add(hemi)
  const lantern = new THREE.PointLight(0xffe2b0, 300, 0, 2)
  lantern.position.set(0, 26, 0)
  scene.add(lantern)
  if (scene.fog instanceof THREE.FogExp2) scene.fog.density = 0.008

  const reach = Ri - 0.5, limit = W / 2 - 0.5, pierR = (PIER / 2) * Math.SQRT2 + 0.2
  const clamp = (p: THREE.Vector3) => {
    let k = 0, d = -Infinity
    for (let i = 0; i < N; i++) {
      const v = p.x * Math.sin(i * step) + p.z * Math.cos(i * step)
      if (v > d) { d = v; k = i }
    }
    if (d > reach) {
      const s = Math.sin(k * step), c = Math.cos(k * step)
      const u = THREE.MathUtils.clamp(p.x * c - p.z * s, -limit, limit)
      d = Math.min(d, R - 0.5)
      p.x = s * d + c * u
      p.z = c * d - s * u
    }
    for (let j = 0; j < N; j++) {
      const f = half + j * step, s = Math.sin(f), c = Math.cos(f)
      let dx = p.x - s * rp, dz = p.z - c * rp
      if (Math.hypot(dx, dz) >= pierR) continue
      const out = dx * s + dz * c
      if (out > 0) { dx -= out * s; dz -= out * c } // behind the pier: slide to its side
      const l = Math.hypot(dx, dz)
      if (l < 1e-3) { dx = c; dz = -s } else { dx /= l; dz /= l }
      p.x = s * rp + dx * pierR
      p.z = c * rp + dz * pierR
    }
  }

  const octagon = (r: number) => (N * r * r * Math.sin(step)) / 2
  const floorA = N * Ri * Ri * Math.tan(half)
  const a1 = octagon(Rc), a2 = octagon(LANTERN_TOP)
  const domeH = h.domeHeight - Yd
  const alcoveV = W * D * S + (Math.PI / 2) * (W / 2) ** 2 * D
  const holeA = W * S + (Math.PI / 2) * (W / 2) ** 2
  const slant = Math.hypot(domeH, Rc - LANTERN_TOP * Math.cos(half))
  const domeA = ((N * 2 * Math.sin(half) * (Rc + LANTERN_TOP)) / 2) * slant
  const winA = N * (WIN.drum[0] * WIN.drum[1] + WIN.lantern[0] * WIN.lantern[1] + WIN.alcove[0] * WIN.alcove[1])

  return {
    lights: { hemi, point: lantern, glow: glow.material as THREE.MeshBasicMaterial },
    core,
    parts,
    start: { pos: [0, EYE, 4], yaw: 0 },
    clamp,
    acoustics: {
      volume: floorA * Yd + (domeH / 3) * (a1 + a2 + Math.sqrt(a1 * a2)) + a2 * lanternH * 0.85 + N * alcoveV,
      surfaces: [
        { material: 'floor-stone', area: floorA + N * W * D },
        { material: 'marble', area: N * 4 * PIER * P },
        { material: 'books', area: N * (2 * D * S + W * S) },
        { material: 'wood', area: N * (W * D + W) },
        { material: 'glass', area: winA },
        { material: 'painted-plaster', area: N * (2 * hw * P - holeA + flat * DRUM) + domeA + a2 * 0.5 },
        { material: 'plaster', area: N * (Math.PI * (W / 2) * D + (Math.PI / 2) * (W / 2) ** 2) },
      ],
    },
    spineSlots: (n) =>
      Array.from({ length: n }, (_, i) => {
        const a = ((Math.floor(N / 2) + i) % N) * step
        const s = Math.sin(a), c = Math.cos(a)
        return { at: [s * (Ri - 0.45), 0, c * (Ri - 0.45)] as [number, number, number], out: [-s, -c] as [number, number] }
      }),
    ready: Promise.resolve().then(dirty),
  }
}

const kit: KitModule = { params, build }
export default kit
