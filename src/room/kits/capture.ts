import * as THREE from 'three'
import type { Built, KitCtx, KitModule } from '../kit'

const params: KitModule['params'] = []

function build({ scene, own }: KitCtx): Built {
  const core = new THREE.Group()
  scene.add(core)
  const bounds = new THREE.Mesh(
    own(new THREE.PlaneGeometry(34, 34)),
    own(new THREE.MeshBasicMaterial({ visible: false })),
  )
  bounds.position.set(0, 0, 0)
  bounds.rotation.x = -Math.PI / 2
  core.add(bounds)

  return {
    core,
    parts: {},
    start: { pos: [0, 1.65, 14], yaw: 0 },
    clamp: (p) => {
      p.x = THREE.MathUtils.clamp(p.x, -15, 15)
      p.z = THREE.MathUtils.clamp(p.z, -17, 17)
    },
    acoustics: { volume: 0, surfaces: [] },
    ready: Promise.resolve(),
  }
}

export default { params, build } satisfies KitModule
