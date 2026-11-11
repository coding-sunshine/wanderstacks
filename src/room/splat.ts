import * as THREE from 'three'
import splats from '../../data/splats.json'
import type { RoomApi } from './kit'

type Entry = { f: string; by: string; lic: string; src: string; bytes: number; align: { position: [number, number, number]; rotation: [number, number, number]; scale: number } }

// A real capture replaces the procedural shell; shelves stay so spines and tours still land on something.
export function attach(api: RoomApi): () => void {
  const e = (splats as Record<string, Entry>)[api.lib.id]
  if (!e) return () => {}
  let dead = false
  let mesh: { dispose(): void } & THREE.Object3D
  let spark: { dispose(): void } & THREE.Object3D
  let raf = 0
  let on = true
  const keep = new Set<THREE.Object3D>(api.parts.shelfUnit ?? [])
  const shell = api.core.children.filter((c) => !keep.has(c))

  const button = document.createElement('button')
  button.type = 'button'
  button.dataset.action = 'captured'
  button.setAttribute('aria-pressed', 'true')
  button.textContent = 'Captured'
  button.hidden = true
  api.controls.append(button)
  const credit = document.createElement('p')
  credit.className = 'room-badge'
  credit.dataset.badge = 'capture'
  credit.style.cssText = 'top:auto;bottom:1rem'
  credit.hidden = true
  const a = document.createElement('a')
  a.href = e.src
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  a.textContent = 'source'
  credit.append(`3D capture by ${e.by}, ${e.lic}, `, a)
  api.root.append(credit)

  const apply = () => {
    button.setAttribute('aria-pressed', String(on))
    button.textContent = on ? 'Captured' : 'Reconstructed'
    shell.forEach((c) => (c.visible = !on))
    mesh.visible = on
    api.root.dataset.splat = on ? 'captured' : 'reconstructed'
    api.shadows?.()
    api.render()
  }
  button.onclick = () => ((on = !on), apply())

  import('@sparkjsdev/spark').then(async ({ SparkRenderer, SplatMesh }) => {
    if (dead) return
    const r = api.renderer!
    spark = new SparkRenderer({ renderer: r })
    api.scene.add(spark)
    const m = new SplatMesh({ url: `/splat/${e.f}` })
    mesh = m
    m.position.set(...e.align.position)
    m.rotation.set(...e.align.rotation)
    m.scale.setScalar(e.align.scale)
    api.scene.add(m)
    try {
      await m.initialized
    } catch {
      return // load failed: leave the reconstructed room untouched
    }
    if (dead) return
    button.hidden = credit.hidden = false
    apply()
    // Spark sorts splats off-thread and the room renders on demand, so keep drawing while the capture shows.
    const loop = () => ((raf = requestAnimationFrame(loop)), on && api.render())
    loop()
  })

  return () => {
    dead = true
    cancelAnimationFrame(raf)
    shell.forEach((c) => (c.visible = true))
    mesh?.removeFromParent()
    mesh?.dispose()
    spark?.removeFromParent()
    spark?.dispose()
    button.remove()
    credit.remove()
  }
}
