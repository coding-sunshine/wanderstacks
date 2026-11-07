import * as THREE from 'three'
import type { Built, KitCtx, KitModule } from '../kit'

const params: KitModule['params'] = [
  ['length', 'Length', ' m'], ['depth', 'Depth', ' m'], ['height', 'Height', ' m'], ['nicheHeight', 'Niche height', ' m'],
  ['nicheWidth', 'Niche width', ' m'], ['niches', 'Niches', ''], ['storeys', 'Storeys', ''], ['roof', 'Roof', ''],
]

// Stub: a roofless box of the measured footprint. The lost-library track replaces it.
function build({ lib, scene, own }: KitCtx): Built {
  const h = Object.fromEntries(Object.entries(lib.hall).map(([k, p]) => [k, p.v])) as Record<string, number>
  const L = h.length!, D = h.depth!, H = h.height!
  const core = new THREE.Group()
  scene.add(core)
  const shell = new THREE.Mesh(
    own(new THREE.BoxGeometry(L, H, D)),
    own(new THREE.MeshLambertMaterial({ color: 0x8a7a64, side: THREE.BackSide })),
  )
  shell.position.y = H / 2
  core.add(shell)
  scene.add(new THREE.HemisphereLight(0xffe2b0, 0x2a1a0d, 1.6))
  return {
    core,
    parts: { length: [shell] },
    start: { pos: [0, 1.65, D / 2 - 1.2], yaw: 0 },
    clamp: (p) => {
      p.x = THREE.MathUtils.clamp(p.x, -L / 2 + 0.6, L / 2 - 0.6)
      p.z = THREE.MathUtils.clamp(p.z, -D / 2 + 0.6, D / 2 - 0.6)
    },
    acoustics: {
      volume: L * D * H,
      surfaces: [{ material: 'floor-stone', area: L * D }, { material: 'stone', area: 2 * (L + D) * H }],
    },
    ready: Promise.resolve(),
  }
}

const kit: KitModule = { params, build }
export default kit
