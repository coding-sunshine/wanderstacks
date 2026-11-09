export interface Flat {
  length: number
  width: number
  height: number
  storeys: number
  baysPerSide: number
  alcoveDepth: number
  galleryHeight: number
  shelfUnit: { width: number; shelves: number }
}

export interface Request {
  seed: number
  hall: Flat
  bays: number[]
}

export interface BayMsg {
  bay: number
  books: Float32Array
  bookColors: Float32Array
  parts: Float32Array
  partColors: Float32Array
}

const PALETTE = [
  [0.16, 0.09, 0.06], [0.2, 0.08, 0.06], [0.07, 0.11, 0.08], [0.08, 0.09, 0.14],
  [0.3, 0.2, 0.11], [0.12, 0.1, 0.08], [0.42, 0.34, 0.22], [0.18, 0.12, 0.09],
]

function prng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// T * Rz(a) * S, column-major, for a unit box centred on its own origin.
function put(out: number[], x: number, y: number, z: number, sx: number, sy: number, sz: number, a = 0) {
  const c = Math.cos(a), s = Math.sin(a)
  out.push(c * sx, s * sx, 0, 0, -s * sy, c * sy, 0, 0, 0, 0, sz, 0, x, y, z, 1)
}

const lin = (v: number) => v ** 2.2

function genBay(seed: number, h: Flat, bay: number): BayMsg {
  const rnd = prng(seed ^ Math.imul(bay + 1, 0x9e3779b1))
  const bayLen = h.length / h.baysPerSide
  const zc = h.length / 2 - (bay + 0.5) * bayLen
  const alcove = h.alcoveDepth
  const storeyH = h.galleryHeight
  const spacing = (storeyH - 0.3) / h.shelfUnit.shelves
  const clear = bayLen - 0.9
  const books: number[] = []
  const bookColors: number[] = []
  const parts: number[] = []
  const partColors: number[] = []
  const part = (x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
    put(parts, x, y, z, sx, sy, sz)
    // Warm multiplier only, so the real wood texture shows through.
    const t = 0.85 + rnd() * 0.3
    partColors.push(lin(0.95 * t), lin(0.9 * t), lin(0.84 * t))
  }

  for (const side of [-1, 1]) {
    const xMid = side * (h.width / 2 - alcove / 2)
    for (let k = 0; k < h.storeys; k++) {
      const base = k * storeyH
      part(xMid, base + storeyH / 2, zc, alcove, storeyH, 0.12)
      if (k > 0) {
        part(xMid, base, zc, alcove, 0.12, clear)
        part(side * (h.width / 2 - alcove), base + 0.56, zc, 0.06, 1, clear)
      }
      for (const face of [-1, 1]) {
        const plankZ = zc + face * 0.3
        for (let x = 0; x <= alcove + 1e-6; x += h.shelfUnit.width) {
          part(side * (h.width / 2 - Math.min(x, alcove)), base + storeyH / 2, plankZ, 0.05, storeyH, 0.3)
        }
        for (let j = 0; j < h.shelfUnit.shelves; j++) {
          const top = base + 0.1 + j * spacing
          part(xMid, top, plankZ, alcove, 0.04, 0.3)
          let u = 0.06
          while (u < alcove - 0.1) {
            if (rnd() < 0.015) { u += 0.1 + rnd() * 0.5; continue }
            const t = 0.025 + rnd() * 0.035
            const ht = Math.min(spacing - 0.04, 0.16 + rnd() * 0.15 * (spacing / 0.35))
            const d = 0.1 + rnd() * 0.05
            const lean = rnd() < 0.04 ? (rnd() - 0.5) * 0.5 : 0
            put(books, side * (h.width / 2 - u - t / 2), top + 0.02 + ht / 2, zc + face * (0.17 + d / 2 + rnd() * 0.02), t, ht, d, lean)
            const c = PALETTE[Math.floor(rnd() * PALETTE.length)]
            const v = 0.75 + rnd() * 0.5
            bookColors.push(lin(c[0] * v), lin(c[1] * v), lin(c[2] * v))
            u += t + 0.001
          }
        }
      }
    }
  }
  return {
    bay,
    books: new Float32Array(books),
    bookColors: new Float32Array(bookColors),
    parts: new Float32Array(parts),
    partColors: new Float32Array(partColors),
  }
}

self.onmessage = (e: MessageEvent<Request>) => {
  const { seed, hall, bays } = e.data
  for (const bay of bays) {
    const m = genBay(seed, hall, bay)
    ;(self as unknown as Worker).postMessage(m, [m.books.buffer, m.bookColors.buffer, m.parts.buffer, m.partColors.buffer])
  }
}
