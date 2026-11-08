import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import textureList from '../../data/textures.json'

export interface Exterior { w: number; d: number; h: number; source: string; name?: string; credit?: string; estimated: string[] }
export const textures = textureList as { slot: string; asset: string; url: string; license: string }[]

const TILE = 3
const SPAWN = 20
const WALL = 0.5
const GROUND = 30

export interface Outside {
  group: THREE.Group
  footprint: [number, number, number, number]
  door: [number, number]
  spawn: { pos: [number, number, number]; yaw: number; pitch: number }
  /** True once the camera is in the doorway, so the visitor goes in. */
  atDoor(p: THREE.Vector3): boolean
  clamp(p: THREE.Vector3): void
  /** Starts the Poly Haven maps once; onMap fires per map that arrives. */
  load(onMap: () => void): void
  loaded(): number
}

// Metre-based box UVs so a 1k map keeps one scale on every face of the rounded box.
function boxUv(g: THREE.BufferGeometry) {
  const p = g.attributes.position!, n = g.attributes.normal!
  const uv = g.attributes.uv!
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i))
    const [u, v] = ax >= ay && ax >= az ? [p.getZ(i), p.getY(i)] : ay >= az ? [p.getX(i), p.getZ(i)] : [p.getX(i), p.getY(i)]
    uv.setXY(i, u / TILE, v / TILE)
  }
}

export function buildOutside(ex: Exterior, own: <T extends { dispose(): void }>(x: T) => T): Outside {
  const { w, d, h } = ex
  const group = new THREE.Group()
  const std = (p: THREE.MeshStandardMaterialParameters) => own(new THREE.MeshStandardMaterial({ roughness: 0.92, ...p }))
  const ground = std({ color: 0x8a8174 })
  const facade = std({ color: 0xb4aca0 })
  const trim = std({ color: 0x4a3a2a, roughness: 0.7 })
  const glass = std({ color: 0x1b2430, roughness: 0.25, metalness: 0.2 })

  const fw = w + 2 * (GROUND + 60), fd = d + 2 * (GROUND + 60)
  const floor = new THREE.Mesh(own(new THREE.PlaneGeometry(fw, fd)), ground)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, 0, -d / 2 + 10)
  group.add(floor)

  const massGeo = own(new RoundedBoxGeometry(w, h, d, 2, 0.15))
  boxUv(massGeo)
  const mass = new THREE.Mesh(massGeo, facade)
  mass.position.set(0, h / 2, -d / 2)
  group.add(mass)

  const roof = new THREE.Mesh(own(new THREE.BoxGeometry(w + 0.8, 0.6, d + 0.8)), trim)
  roof.position.set(0, h + 0.3, -d / 2)
  group.add(roof)

  // Door: a dark leaf in a frame, two steps up.
  const frame = new THREE.Mesh(own(new THREE.BoxGeometry(2.8, 3.8, 0.3)), trim)
  frame.position.set(0, 1.9, 0.05)
  const leaf = new THREE.Mesh(own(new THREE.BoxGeometry(2.2, 3.3, 0.2)), glass)
  leaf.position.set(0, 1.65, 0.2)
  const step = (sw: number, sd: number, sy: number) => {
    const s = new THREE.Mesh(own(new THREE.BoxGeometry(sw, 0.15, sd)), ground)
    s.position.set(0, sy, sd / 2)
    return s
  }
  group.add(frame, leaf, step(4, 0.8, 0.075), step(3.4, 0.4, 0.2))

  // Front windows: one instanced draw, storeys by height, columns by width, the door column left clear.
  const rows = Math.max(1, Math.floor((h - 3) / 5)), cols = Math.max(2, Math.floor(w / 4.5))
  const cells: [number, number][] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = -w / 2 + ((c + 0.5) * w) / cols
      if (r === 0 && Math.abs(x) < 3.2) continue
      cells.push([x, 3 + r * ((h - 4.5) / rows) + 1.1])
    }
  }
  const win = new THREE.InstancedMesh(own(new THREE.PlaneGeometry(1.2, 2.2)), glass, cells.length)
  const m4 = new THREE.Matrix4()
  cells.forEach(([x, y], i) => win.setMatrixAt(i, m4.makeTranslation(x, y, 0.02)))
  group.add(win)

  group.add(new THREE.HemisphereLight(0xcfe0ff, 0x6b5d4a, 1.1))
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.2)
  sun.position.set(-30, 40, 25)
  group.add(sun)

  const maps = new Set<string>()
  let started = false
  const apply = (slot: string, t: THREE.Texture) => {
    const base = slot.replace('-normal', '')
    const m = base === 'ground' ? ground : facade
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 8
    if (base === 'ground') t.repeat.set(fw / TILE, fd / TILE)
    if (slot.endsWith('-normal')) m.normalMap = t
    else {
      t.colorSpace = THREE.SRGBColorSpace
      m.map = t
      m.color.set(0xffffff)
    }
    m.needsUpdate = true
  }
  const loader = new THREE.TextureLoader()

  return {
    group,
    footprint: [-w / 2, -d, w / 2, 0],
    door: [0, 0],
    spawn: { pos: [0, 1.65, SPAWN], yaw: 0, pitch: 0.08 },
    atDoor: (p) => Math.abs(p.x) < 1.1 && p.z < WALL + 0.4,
    clamp(p) {
      p.x = THREE.MathUtils.clamp(p.x, -w / 2 - GROUND, w / 2 + GROUND)
      p.z = THREE.MathUtils.clamp(p.z, -d - GROUND, SPAWN + 10)
      const x0 = -w / 2 - WALL, x1 = w / 2 + WALL, z0 = -d - WALL
      if (p.x <= x0 || p.x >= x1 || p.z <= z0 || p.z >= WALL) return
      const edges = [[p.x - x0, 'x', x0], [x1 - p.x, 'x', x1], [p.z - z0, 'z', z0], [WALL - p.z, 'z', WALL]] as const
      const [, axis, to] = edges.reduce((a, b) => (b[0] < a[0] ? b : a))
      p[axis] = to
    },
    load(onMap) {
      if (started) return
      started = true
      for (const t of textures) {
        loader.load(t.url, (tex) => {
          own(tex)
          apply(t.slot, tex)
          maps.add(t.slot)
          onMap()
        }, undefined, () => {})
      }
    },
    loaded: () => maps.size,
  }
}
