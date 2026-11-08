import * as THREE from 'three'
import type { RoomApi } from './kit'

const COUNT = { rain: 3000, snow: 2000 }
const LOOK = {
  rain: { color: 0xc4d0dc, size: 0.07, opacity: 0.5, fall: 11, sway: 0 },
  snow: { color: 0xffffff, size: 0.12, opacity: 0.85, fall: 1.2, sway: 0.5 },
}
const R = 16, H = 14

// Rain or snow as Points in a box that follows the camera. Frozen (but drawn) under reduced motion.
export function precip(api: RoomApi, onCount: (n: number) => void) {
  const pos = new Float32Array(COUNT.rain * 3)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.PointsMaterial({ transparent: true, depthWrite: false })
  const pts = new THREE.Points(geo, mat)
  pts.frustumCulled = false
  pts.visible = false
  api.scene.add(pts)

  let kind: keyof typeof COUNT | null = null
  let n = 0
  let raf = 0
  let last = 0
  const seen = new THREE.Vector3()
  const cam = api.camera.position
  const wrap = (v: number, c: number, r: number) => c + ((((v - c + r) % (2 * r)) + 2 * r) % (2 * r)) - r

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - (last || now)) / 1000, 0.1)
    last = now
    const moved = !seen.equals(cam)
    if (api.reduced && !moved) return
    seen.copy(cam)
    const look = LOOK[kind!]
    for (let i = 0; i < n; i++) {
      const j = i * 3
      if (!api.reduced) {
        pos[j + 1]! -= dt * look.fall * (0.8 + (i % 5) * 0.1)
        pos[j]! += Math.sin(now / 900 + i) * dt * look.sway
      }
      pos[j] = wrap(pos[j]!, cam.x, R)
      pos[j + 1] = wrap(pos[j + 1]!, cam.y, H / 2)
      pos[j + 2] = wrap(pos[j + 2]!, cam.z, R)
    }
    geo.attributes.position!.needsUpdate = true
    api.render()
  }

  return {
    set(next: 'rain' | 'snow' | 'none') {
      if (next === (kind ?? 'none')) return
      cancelAnimationFrame(raf)
      pts.visible = false
      kind = next === 'none' ? null : next
      n = kind ? COUNT[kind] : 0
      if (kind) {
        const look = LOOK[kind]
        mat.color.set(look.color)
        mat.size = look.size
        mat.opacity = look.opacity
        let s = 12345
        const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296)
        for (let i = 0; i < n; i++) pos.set([cam.x + (rnd() - 0.5) * 2 * R, cam.y + (rnd() - 0.5) * H, cam.z + (rnd() - 0.5) * 2 * R], i * 3)
        geo.setDrawRange(0, n)
        geo.attributes.position!.needsUpdate = true
        seen.copy(cam)
        last = 0
        pts.visible = true
        raf = requestAnimationFrame(frame)
      }
      onCount(n)
      api.render()
    },
    dispose() {
      cancelAnimationFrame(raf)
      api.scene.remove(pts)
      geo.dispose()
      mat.dispose()
    },
  }
}
