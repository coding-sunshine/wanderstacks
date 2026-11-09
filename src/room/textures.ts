import * as THREE from 'three'

function canvas(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 4
  if (repeat) t.repeat.set(...repeat)
  return t
}

// Fixed pseudo-random so the procedural look is identical on every visit.
function rng(seed: number) {
  let a = seed
  return () => ((a = (Math.imul(a, 1664525) + 1013904223) >>> 0) / 4294967296)
}

export const woodTexture = () =>
  canvas(128, 128, (g) => {
    const r = rng(7)
    g.fillStyle = '#6b4a2b'
    g.fillRect(0, 0, 128, 128)
    for (let i = 0; i < 70; i++) {
      g.fillStyle = `rgba(${r() < 0.5 ? '20,10,4' : '150,105,60'},${0.08 + r() * 0.14})`
      g.fillRect(r() * 128, 0, 1 + r() * 2, 128)
    }
  })

export const floorTexture = (repeat: [number, number]) =>
  canvas(256, 256, (g) => {
    const r = rng(11)
    for (let i = 0; i < 4; i++) {
      const v = 0.8 + r() * 0.35
      g.fillStyle = `rgb(${110 * v},${76 * v},${44 * v})`
      g.fillRect(i * 64, 0, 64, 256)
      for (let k = 0; k < 14; k++) {
        g.fillStyle = `rgba(30,16,6,${0.06 + r() * 0.12})`
        g.fillRect(i * 64 + r() * 60, 0, 1, 256)
      }
      g.fillStyle = 'rgba(10,5,2,0.8)'
      g.fillRect(i * 64, 0, 2, 256)
      g.fillRect(i * 64 + 8, r() * 256, 50, 2)
    }
  }, repeat)

// Stands in for unbuilt bays and backs the built ones: rows of spines.
export const spineTexture = (repeat: [number, number]) =>
  canvas(512, 256, (g) => {
    const r = rng(23)
    g.fillStyle = '#1b130b'
    g.fillRect(0, 0, 512, 256)
    for (let row = 0; row < 6; row++) {
      let x = 0
      const y = row * 42
      while (x < 512) {
        const w = 5 + r() * 9
        const h = 22 + r() * 16
        const l = 14 + r() * 22
        g.fillStyle = `hsl(${12 + r() * 36},${30 + r() * 25}%,${l}%)`
        g.fillRect(x, y + 40 - h, w, h)
        x += w + 1
      }
      g.fillStyle = '#2a1a0d'
      g.fillRect(0, y + 40, 512, 3)
    }
  }, repeat)

export const vaultTexture = (bays: number) =>
  canvas(128, 128, (g) => {
    const r = rng(31)
    g.fillStyle = '#8a7c63'
    g.fillRect(0, 0, 128, 128)
    for (let i = 0; i < 300; i++) {
      g.fillStyle = `rgba(60,45,25,${r() * 0.07})`
      g.fillRect(r() * 128, r() * 128, 3, 3)
    }
    g.fillStyle = '#2c1c0f'
    g.fillRect(0, 0, 128, 10)
    g.fillStyle = 'rgba(201,162,74,0.55)'
    g.fillRect(0, 10, 128, 1.5)
  }, [1, bays])

export const beamTexture = () =>
  canvas(32, 128, (g) => {
    const grad = g.createLinearGradient(0, 0, 0, 128)
    grad.addColorStop(0, 'rgba(255,230,170,0)')
    grad.addColorStop(1, 'rgba(255,230,170,0.9)')
    g.fillStyle = grad
    g.fillRect(0, 0, 32, 128)
    g.globalCompositeOperation = 'destination-in'
    const side = g.createLinearGradient(0, 0, 32, 0)
    side.addColorStop(0, 'transparent')
    side.addColorStop(0.5, '#fff')
    side.addColorStop(1, 'transparent')
    g.fillStyle = side
    g.fillRect(0, 0, 32, 128)
  })

export const dustTexture = () =>
  canvas(32, 32, (g) => {
    const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16)
    grad.addColorStop(0, 'rgba(255,235,190,1)')
    grad.addColorStop(1, 'rgba(255,235,190,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 32, 32)
  })

/**
 * Loads a photograph texture (CC0 assets served from /rooms/tex, or an external file page).
 * Calls ok(texture) on success; on error the caller swaps in a procedural fallback.
 */
export function loadPhoto(url: string, repeat: [number, number], mirror: boolean, ok: (t: THREE.Texture) => void, fail: () => void) {
  new THREE.TextureLoader().load(
    url,
    (t) => {
      t.colorSpace = THREE.SRGBColorSpace
      t.wrapS = t.wrapT = mirror ? THREE.MirroredRepeatWrapping : THREE.RepeatWrapping
      t.repeat.set(...repeat)
      t.anisotropy = 8
      ok(t)
    },
    undefined,
    fail,
  )
}
