import * as THREE from 'three'
import type { Built, KitCtx, KitModule } from '../kit'

const params: KitModule['params'] = [
  ['span', 'Span', ' m'], ['domeHeight', 'Dome height', ' m'], ['crownHeight', 'Crown height', ' m'], ['sides', 'Sides', ''],
  ['alcoveDepth', 'Alcove depth', ' m'], ['alcoveWidth', 'Alcove width', ' m'], ['piers', 'Piers', ''],
  ['plinthHeight', 'Plinth height', ' m'], ['galleryHeight', 'Gallery height', ' m'], ['shelfUnit', 'Shelf unit', ''],
  ['materials', 'Materials', ''],
]

// Stub: an open octagonal drum whose flats face the axes. The rotunda track replaces it.
function build({ lib, scene, own }: KitCtx): Built {
  const h = Object.fromEntries(Object.entries(lib.hall).map(([k, p]) => [k, p.v])) as Record<string, number>
  const span = h.span!, height = h.domeHeight!
  const radius = span / 2 / Math.cos(Math.PI / 8)
  const core = new THREE.Group()
  scene.add(core)
  const drum = new THREE.Mesh(
    own(new THREE.CylinderGeometry(radius, radius, height, 8, 1, true).rotateY(Math.PI / 8)),
    own(new THREE.MeshLambertMaterial({ color: 0x8a7a64, side: THREE.BackSide })),
  )
  drum.position.y = height / 2
  const floor = new THREE.Mesh(own(new THREE.CircleGeometry(radius, 8).rotateX(-Math.PI / 2).rotateY(Math.PI / 8)), own(new THREE.MeshLambertMaterial({ color: 0x6a5a48 })))
  core.add(drum, floor)
  scene.add(new THREE.HemisphereLight(0xffe2b0, 0x2a1a0d, 1.6))
  const area = 2 * (Math.SQRT2 - 1) * span * span
  return {
    core,
    parts: { span: [drum, floor] },
    start: { pos: [0, 1.65, span / 2 - 1.2], yaw: 0 },
    clamp: (p) => {
      p.x = THREE.MathUtils.clamp(p.x, -span / 2 + 0.6, span / 2 - 0.6)
      p.z = THREE.MathUtils.clamp(p.z, -span / 2 + 0.6, span / 2 - 0.6)
    },
    acoustics: {
      volume: area * height,
      surfaces: [{ material: 'floor-stone', area }, { material: 'plaster', area: 8 * (span * Math.tan(Math.PI / 8)) * height }],
    },
    ready: Promise.resolve(),
  }
}

const kit: KitModule = { params, build }
export default kit
