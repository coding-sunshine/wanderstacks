import * as THREE from 'three'
import { hash, type Built, type KitCtx, type KitModule } from '../kit'
import { beamTexture, floorTexture, spineTexture, vaultTexture, woodTexture } from '../textures'
import type { BayMsg, Flat, Request } from '../worker'

const EYE = 1.65

function chequer(repeat: [number, number]) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  for (let i = 0; i < 4; i++) {
    g.fillStyle = (i + (i >> 1)) % 2 ? '#8c4f3c' : '#e3d9c8'
    g.fillRect((i % 2) * 32, (i >> 1) * 32, 32, 32)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(...repeat)
  return t
}

const params: KitModule['params'] = [
  ['length', 'Length', ' m'], ['width', 'Width', ' m'], ['height', 'Height', ' m'], ['domeHeight', 'Dome height', ' m'],
  ['vault', 'Vault', ''], ['storeys', 'Storeys', ''], ['baysPerSide', 'Bays per side', ''],
  ['alcoveDepth', 'Alcove depth', ' m'], ['galleryHeight', 'Gallery height', ' m'], ['domes', 'Domes', ''], ['sideDomeHeight', 'Side dome height', ' m'],
  ['windows', 'Windows', ''], ['shelfUnit', 'Shelf unit', ''], ['wood', 'Wood', ''],
  ['floor', 'Floor', ''], ['light', 'Light', ''],
]

function build({ lib, scene, own, dirty }: KitCtx): Built {
  const h = Object.fromEntries(Object.entries(lib.hall).map(([k, p]) => [k, p.v])) as unknown as Flat & { windows: number; floor: string; domes?: number; domeHeight?: number; sideDomeHeight?: number }
  const { length: L, width: W, height: H, baysPerSide: N } = h
  const bayLen = L / N
  const springing = h.storeys * h.galleryHeight
  const aisle = W - 2 * h.alcoveDepth
  const rise = H - springing
  const stone = /stone|marble|flag/.test(h.floor)

  const core = new THREE.Group()
  scene.add(core)
  const parts: Built['parts'] = {}
  const mat = (p: THREE.MeshLambertMaterialParameters) => own(new THREE.MeshLambertMaterial(p))
  const plane = (key: string, w: number, hh: number, m: THREE.Material, x: number, y: number, z: number, ry = 0, rx = 0) => {
    const mesh = new THREE.Mesh(own(new THREE.PlaneGeometry(w, hh)), m)
    mesh.position.set(x, y, z)
    mesh.rotation.set(rx, ry, 0)
    core.add(mesh)
    ;(parts[key] ??= []).push(mesh)
  }

  const wood = own(woodTexture())
  const wallMat = mat({ map: own(spineTexture([L / 3, springing / 2.6])) })
  const floorMat = stone
    ? mat({ map: own(chequer([W / 1.6, L / 1.6])) })
    : mat({ map: own(floorTexture([W, L])), color: 0x9a8a7a })
  plane('floor', W, L, floorMat, 0, 0, 0, 0, -Math.PI / 2)
  plane('shelfUnit', L, springing, wallMat, -W / 2, springing / 2, 0, Math.PI / 2)
  plane('shelfUnit', L, springing, wallMat, W / 2, springing / 2, 0, -Math.PI / 2)
  const impostor = new THREE.TextureLoader().load(`/rooms/${lib.id}/impostor.svg`, dirty)
  impostor.colorSpace = THREE.SRGBColorSpace
  own(impostor)
  plane('length', W, H, new THREE.MeshBasicMaterial({ map: impostor, fog: true }), 0, H / 2, -L / 2, 0)
  plane('length', W, H, mat({ color: 0x2b1a0d }), 0, H / 2, L / 2, Math.PI)

  if ((h.domes ?? 0) > 0 && h.domeHeight) {
    // Domed hall: the roof is one height field per span, the barrel crown raised to a dome inside each dome's plan ellipse.
    const roof = mat({ map: own(vaultTexture(N)), side: THREE.DoubleSide })
    const crown = (x: number) => springing + rise * Math.sqrt(Math.max(0, 1 - ((2 * x) / W) ** 2))
    const central = h.domes! % 2
    const sides = Math.floor(h.domes! / 2)
    const rc = W / 2
    const rs = sides ? (L / 2 - central * rc) / (2 * sides) : 0
    const minor = h.sideDomeHeight ?? H + (h.domeHeight - H) / 2
    const domes: { z: number; r: number; peak: number }[] = []
    if (central) domes.push({ z: 0, r: rc, peak: h.domeHeight })
    for (let k = 0; k < sides; k++) {
      const z = central * rc + (k + 0.5) * 2 * rs
      domes.push({ z, r: rs, peak: minor }, { z: -z, r: rs, peak: minor })
    }
    domes.sort((a, b) => a.z - b.z)
    const spans: [number, number, (typeof domes)[number] | null][] = []
    let at = -L / 2
    for (const d of domes) {
      if (d.z - d.r > at + 1e-6) spans.push([at, d.z - d.r, null])
      spans.push([d.z - d.r, d.z + d.r, d])
      at = d.z + d.r
    }
    if (at < L / 2 - 1e-6) spans.push([at, L / 2, null])
    for (const [z0, z1, d] of spans) {
      const g = own(new THREE.PlaneGeometry(W, z1 - z0, 24, 2 * Math.ceil(z1 - z0)))
      const pos = g.attributes.position, uv = g.attributes.uv
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = (z0 + z1) / 2 + pos.getY(i)
        const r2 = d ? 1 - ((2 * x) / W) ** 2 - ((z - d.z) / d.r) ** 2 : 0
        const y = d ? Math.max(crown(x), springing + (d.peak - springing) * Math.sqrt(Math.max(0, r2))) : crown(x)
        pos.setXYZ(i, x, y, z)
        uv.setXY(i, x / W + 0.5, (z + L / 2) / L)
      }
      g.computeVertexNormals()
      const m = new THREE.Mesh(g, roof)
      core.add(m)
      ;(parts[!d ? 'vault' : d.z === 0 ? 'domeHeight' : 'sideDomeHeight'] ??= []).push(m)
    }
  } else {
    const vaultGeo = own(new THREE.CylinderGeometry(1, 1, L, 40, 1, true, Math.PI / 2, Math.PI))
    vaultGeo.rotateX(Math.PI / 2)
    const vault = new THREE.Mesh(vaultGeo, mat({ map: own(vaultTexture(N)), side: THREE.BackSide }))
    vault.scale.set(W / 2, rise, 1)
    vault.position.y = springing
    core.add(vault)
    parts.vault = [vault]
  }

  const hemi = new THREE.HemisphereLight(0xffe2b0, 0x2a1a0d, 1.0)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xffe7b8, 0.7)
  sun.position.set(-3, 10, 2)
  scene.add(sun)

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

  // Bays.
  const box = own(new THREE.BoxGeometry(1, 1, 1))
  const bookMat = mat({})
  const partMat = mat({ map: wood })
  const bays = new THREE.Group()
  scene.add(bays)
  let done = 0
  let resolve!: () => void
  let reject!: (e: unknown) => void
  const ready = new Promise<void>((res, rej) => ((resolve = res), (reject = rej)))
  const worker = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' })
  worker.onerror = reject
  worker.onmessage = (e: MessageEvent<BayMsg>) => {
    const m = e.data
    for (const [material, matrices, colors] of [[bookMat, m.books, m.bookColors], [partMat, m.parts, m.partColors]] as const) {
      const im = new THREE.InstancedMesh(box, material, matrices.length / 16)
      im.instanceMatrix = new THREE.InstancedBufferAttribute(matrices, 16)
      im.instanceColor = new THREE.InstancedBufferAttribute(colors, 3)
      im.matrixAutoUpdate = false
      bays.add(im)
    }
    done++
    dirty()
    if (m.bay === 0) resolve()
  }
  const req: Request = { seed: hash(lib.id), hall: h, bays: Array.from({ length: N }, (_, i) => i) }
  worker.postMessage(req)

  // Barrel vault is a half ellipse of semi-axes W/2 and rise; Ramanujan gives its arc length.
  const a = W / 2, b = rise
  const arc = (Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)))) / 2
  const sideWall = 2 * L * springing

  return {
    lights: { hemi, sun, glow: glowM, beam: beamM },
    core,
    parts,
    start: { pos: [0, EYE, L / 2 - 1.2], yaw: 0 },
    clamp(p) {
      p.x = THREE.MathUtils.clamp(p.x, -aisle / 2 + 0.4, aisle / 2 - 0.4)
      const zMin = done >= N ? -L / 2 + 0.6 : L / 2 - done * bayLen + 0.5
      p.z = THREE.MathUtils.clamp(p.z, zMin, L / 2 - 0.6)
    },
    acoustics: {
      volume: W * L * springing + (Math.PI / 2) * a * b * L,
      surfaces: [
        { material: stone ? 'floor-stone' : 'floor-timber', area: W * L },
        { material: 'books', area: sideWall / 2 },
        { material: 'wood', area: sideWall / 2 },
        { material: 'plaster', area: arc * L + 2 * W * H },
      ],
    },
    spineSlots: (n) =>
      Array.from({ length: n }, (_, i) => {
        const side = i % 2 ? 1 : -1
        const bay = 1 + Math.floor((i * (N - 2)) / n)
        return { at: [side * (aisle / 2 + 0.1), 0, L / 2 - (bay + 1) * bayLen] as [number, number, number], out: [-side, 0] as [number, number] }
      }),
    ready,
    status: () => (done >= N ? null : `Building the hall, ${done} of ${N} bays`),
    dispose: () => worker.terminate(),
  }
}

const kit: KitModule = { params, build }
export default kit
