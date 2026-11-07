export interface Governor {
  frame(now: number): void
  readonly dpr: number
}

export function dprGovernor(apply: (dpr: number) => void, max = Math.min(devicePixelRatio, 2), min = 0.75): Governor {
  const deltas: number[] = []
  let dpr = max
  let last = 0
  return {
    get dpr() { return dpr },
    frame(now) {
      const d = now - last
      last = now
      // Skip gaps from hidden tabs or on-demand rendering; they are not frame cost.
      if (d <= 0 || d > 100) return
      deltas.push(d)
      if (deltas.length < 60) return
      const p95 = deltas.sort((a, b) => a - b)[Math.floor(deltas.length * 0.95)]
      deltas.length = 0
      const next = p95 > 20 ? Math.max(min, dpr * 0.85) : p95 < 12 ? Math.min(max, dpr * 1.1) : dpr
      if (next !== dpr) apply((dpr = next))
    },
  }
}
