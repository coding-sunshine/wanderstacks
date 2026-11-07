import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Built, KitCtx, KitModule } from '../kit'

const params: KitModule['params'] = [
  ['length', 'Length', ' m'], ['depth', 'Depth', ' m'], ['height', 'Height', ' m'], ['nicheHeight', 'Niche height', ' m'],
  ['nicheWidth', 'Niche width', ' m'], ['niches', 'Niches', ''], ['storeys', 'Storeys', ''], ['roof', 'Roof', ''],
]

const T = 0.6 // wall thickness, inside the footprint
const TILE = 3 // metres per stone texture repeat

// Planar world-space UVs so the ashlar courses keep one scale on every piece.
function uvs(g: THREE.BufferGeometry) {
  const p = g.attributes.position!, n = g.attributes.normal!, uv = g.attributes.uv!
  for (let i = 0; i < p.count; i++) {
    const [x, y, z] = [p.getX(i), p.getY(i), p.getZ(i)]
    const [nx, ny] = [Math.abs(n.getX(i)), Math.abs(n.getY(i))]
    if (nx > 0.5) uv.setXY(i, z / TILE, y / TILE)
    else if (ny > 0.5) uv.setXY(i, x / TILE, z / TILE)
    else uv.setXY(i, x / TILE, y / TILE)
  }
  return g
}
const box = (w: number, h: number, d: number, x: number, y: number, z: number) =>
  uvs(new THREE.BoxGeometry(w, h, d).translate(x, y, z))

function build({ lib, scene, own, dirty }: KitCtx): Built {
  const h = Object.fromEntries(Object.entries(lib.hall).map(([k, p]) => [k, p.v])) as Record<string, number>
  const L = h.length!, D = h.depth!, H = h.height!, n = h.niches!, ns = h.storeys!
  const nw = h.nicheWidth!
  const attic = 1.5
  const sh = (H - attic) / ns
  const sill = 0.9
  const nh = Math.min(h.nicheHeight!, sh - sill - 0.3)
  const Lw = L - 2 * T
  const gap = Math.max(0, (Lw - n * nw) / (n + 1))

  const stone = new THREE.TextureLoader().load('/rooms/celsus/stone.svg', dirty)
  stone.colorSpace = THREE.SRGBColorSpace
  stone.wrapS = stone.wrapT = THREE.RepeatWrapping
  own(stone)
  const mat = (p: THREE.MeshLambertMaterialParameters) => own(new THREE.MeshLambertMaterial(p))
  const wall = mat({ map: stone })

  const core = new THREE.Group()
  scene.add(core)
  const parts: Built['parts'] = {}
  const add = (key: string, geos: THREE.BufferGeometry[], m: THREE.Material) => {
    const mesh = new THREE.Mesh(own(mergeGeometries(geos)!), m)
    core.add(mesh)
    parts[key] = [mesh]
  }

  const floor = uvs(new THREE.PlaneGeometry(D, L).rotateX(-Math.PI / 2))
  const roof = uvs(new THREE.PlaneGeometry(D, L).rotateX(Math.PI / 2).translate(0, H, 0))
  add('length', [floor], mat({ map: stone, color: 0xd8cdb8 }))
  add('roof', [roof], mat({ color: 0x5a4128 }))

  const ends: THREE.BufferGeometry[] = []
  const band: THREE.BufferGeometry[] = []
  const lintels: THREE.BufferGeometry[] = []
  const piers: THREE.BufferGeometry[] = []
  const backs: THREE.BufferGeometry[] = []
  const slabs: THREE.BufferGeometry[] = []
  const top = ns * sh
  for (const z of [-1, 1]) {
    ends.push(box(D, top, T, 0, top / 2, z * (L / 2 - T / 2)))
    band.push(box(D - 2 * T, attic, T, 0, top + attic / 2, z * (L / 2 - T / 2)))
  }
  for (const s of [-1, 1]) {
    const wx = s * (D / 2 - T / 2)
    band.push(box(T, attic, L, wx, top + attic / 2, 0))
    for (let i = 0; i < ns; i++) {
      const y0 = i * sh
      lintels.push(box(T, sill, Lw, wx, y0 + sill / 2, 0))
      const lh = sh - sill - nh
      lintels.push(box(T, lh, Lw, wx, y0 + sill + nh + lh / 2, 0))
      if (i > 0) slabs.push(box(1.2, 0.25, Lw, s * (D / 2 - T - 0.6), y0 - 0.125, 0))
      for (let k = 0; k <= n; k++) {
        const z0 = -Lw / 2 + k * (gap + nw)
        if (gap > 0.01) piers.push(box(T, nh, gap, wx, y0 + sill + nh / 2, z0 + gap / 2))
        if (k < n) {
          backs.push(uvs(new THREE.PlaneGeometry(nw, nh).rotateY(-s * Math.PI / 2).translate(s * (D / 2 - 0.02), y0 + sill + nh / 2, z0 + gap + nw / 2)))
        }
      }
    }
  }
  add('depth', ends, wall)
  add('height', band, wall)
  add('nicheHeight', lintels, wall)
  if (gap > 0.01) add('nicheWidth', piers, wall)
  add('niches', backs, mat({ color: 0x4a4034, side: THREE.DoubleSide }))
  if (slabs.length) add('storeys', slabs, wall)

  scene.add(new THREE.HemisphereLight(0xffe2b0, 0x2a1a0d, 1.8))
  const sun = new THREE.DirectionalLight(0xffe7b8, 0.8)
  sun.position.set(-3, 10, 2)
  scene.add(sun)

  const mx = D / 2 - T - 0.6, mz = L / 2 - T - 0.6
  return {
    core,
    parts,
    start: { pos: [0, 1.65, mz - 0.6], yaw: 0 },
    clamp: (p) => {
      p.x = THREE.MathUtils.clamp(p.x, -mx, mx)
      p.z = THREE.MathUtils.clamp(p.z, -mz, mz)
    },
    acoustics: {
      volume: L * D * H,
      surfaces: [
        { material: 'floor-stone', area: L * D },
        { material: 'wood', area: L * D },
        { material: 'stone', area: 2 * (L + D) * H },
      ],
    },
    ready: Promise.resolve(),
  }
}

const kit: KitModule = { params, build }
export default kit
