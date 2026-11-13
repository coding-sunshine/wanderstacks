import * as THREE from 'three'
import captures from '../../data/captures.json'
import type { RoomApi } from './kit'

type Entry = {
  f: string; bytes: number; by: string; lic: string; src: string
  align: { position: [number, number, number]; rotation: [number, number, number]; scale: number }
}

export function attach(api: RoomApi): () => void {
  const e = (captures as Record<string, unknown>[]).find((c) => c.lib === api.lib.id && c.status === 'ready') as (Entry & { lib: string; status: string }) | undefined
  if (!e?.f) return () => {}
  let dead = false
  let model: THREE.Group | undefined
  let decoder: { dispose(): void } | undefined
  let raf = 0
  const credit = document.createElement('p')
  credit.className = 'room-badge'
  credit.dataset.badge = 'capture'
  credit.style.cssText = 'top:auto;bottom:1rem'
  credit.hidden = true
  const a = document.createElement('a')
  a.href = e.src
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  a.textContent = 'source and licence'
  credit.append(`Draft photogrammetry capture by ${e.by}, ${e.lic}; optimized derivative under the same licence. `, a)
  api.root.append(credit)
  api.root.dataset.capture = 'loading'
  api.root.dataset.captureFile = e.f

  const load = async () => {
    const [{ GLTFLoader }, { DRACOLoader }] = await Promise.all([
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/loaders/DRACOLoader.js'),
    ])
    if (dead) return
    const draco = new DRACOLoader()
    decoder = draco
    draco.setDecoderPath('/draco/gltf/')
    draco.setWorkerLimit(2)
    const loader = new GLTFLoader().setDRACOLoader(draco)
    try {
      const gltf = await loader.loadAsync(`/rooms/${api.lib.id}/${e.f}`)
      if (dead) {
        gltf.scene.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.geometry.dispose()
            for (const m of Array.isArray(o.material) ? o.material : [o.material]) m.dispose()
          }
        })
        return
      }
      model = gltf.scene
      model.position.set(...e.align.position)
      model.rotation.set(...e.align.rotation)
      model.scale.setScalar(e.align.scale)
      model.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.castShadow = false
          o.receiveShadow = false
        }
      })
      api.scene.add(model)
      credit.hidden = false
      api.root.dataset.capture = 'captured'
      api.render()
    } catch {
      if (dead) return
      api.root.dataset.capture = 'error'
      const status = api.root.querySelector<HTMLElement>('.room-status')
      if (status) {
        status.hidden = false
        status.textContent = 'The captured room could not be loaded. The record and photographs remain available.'
      }
    }
  }
  void load()

  return () => {
    dead = true
    cancelAnimationFrame(raf)
    model?.removeFromParent()
    model?.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      o.geometry.dispose()
      const materials = Array.isArray(o.material) ? o.material : [o.material]
      for (const m of materials) {
        for (const value of Object.values(m)) if (value instanceof THREE.Texture) value.dispose()
        m.dispose()
      }
    })
    decoder?.dispose()
    credit.remove()
    delete api.root.dataset.capture
    delete api.root.dataset.captureFile
  }
}
