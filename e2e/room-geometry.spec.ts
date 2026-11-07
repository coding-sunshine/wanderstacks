import { expect, test } from '@playwright/test'
import { loadLib, openRoom, params } from './iiif'
import { roomIds, watchErrors } from './util'

type Bounds = { x: number[]; y: number[]; z: number[] }

const within = (got: number, want: number, label: string) =>
  expect(Math.abs(got - want) / want, `${label}: got ${got}, want ${want} within 5%`).toBeLessThanOrEqual(0.05)

for (const room of roomIds()) {
  test(`${room}: built shell matches its measured footprint and height within 5%`, async ({ page }) => {
    const errors = watchErrors(page)
    const lib = await loadLib(page, room)
    const p = params(lib)
    const v = (k: string) => {
      const n = p[k]?.v
      expect(typeof n, `hall.${k} is a number`).toBe('number')
      return n as number
    }
    const root = await openRoom(page, room)
    const b = JSON.parse((await root.getAttribute('data-bounds')) ?? 'null') as Bounds
    expect(b, 'data-bounds present').not.toBeNull()
    for (const axis of [b.x, b.y, b.z]) {
      expect(axis).toHaveLength(2)
      expect(axis[0]).toBeLessThan(axis[1]!)
      for (const n of axis) expect(Number.isFinite(n)).toBe(true)
    }
    const ex = b.x[1]! - b.x[0]!
    const ez = b.z[1]! - b.z[0]!

    if (lib.kit === 'hall') {
      const got = [ex, ez].sort((a, c) => a - c)
      const want = [v('width'), v('length')].sort((a, c) => a - c)
      within(got[0]!, want[0]!, 'short side')
      within(got[1]!, want[1]!, 'long side')
      within(b.y[1]!, p.domeHeight ? v('domeHeight') : v('height'), 'top')
      expect(Math.abs(b.y[0]!)).toBeLessThan(0.1)
    } else if (lib.kit === 'rotunda') {
      within(ex, v('span'), 'x extent vs span')
      within(ez, v('span'), 'z extent vs span')
      expect(b.y[1]!).toBeGreaterThanOrEqual(0.95 * v('domeHeight'))
      expect(b.y[1]!).toBeLessThanOrEqual(1.05 * v('crownHeight'))
    } else {
      const got = [ex, ez].sort((a, c) => a - c)
      const want = [v('depth'), v('length')].sort((a, c) => a - c)
      within(got[0]!, want[0]!, 'short side')
      within(got[1]!, want[1]!, 'long side')
      within(b.y[1]!, v('height'), 'top')
    }
    expect(errors).toEqual([])
  })
}
