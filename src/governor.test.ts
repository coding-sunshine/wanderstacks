import { expect, test } from 'bun:test'
import { dprGovernor } from './governor'

const run = (g: ReturnType<typeof dprGovernor>, ms: number, n = 60) => {
  let t = 1000
  for (let i = 0; i <= n; i++) g.frame((t += ms))
}

test('lowers on slow frames, raises on fast, holds in between, ignores gaps', () => {
  const seen: number[] = []
  const g = dprGovernor((d) => seen.push(d), 2, 0.75)
  run(g, 25)
  expect(g.dpr).toBeCloseTo(1.7)
  run(g, 16)
  expect(g.dpr).toBeCloseTo(1.7)
  run(g, 8)
  expect(g.dpr).toBeCloseTo(1.87)
  run(g, 500)
  expect(seen.length).toBe(2)
})
