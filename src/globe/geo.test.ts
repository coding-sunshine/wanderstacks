import { expect, test } from 'bun:test'
import { alive, equalEarth, FLAT_WIDTH, greatCircle, place, spherePoint, sunNow, toPin } from './geo'

const row = { id: 'x', n: 'X', p: 'P', yl: '1', y: 100, lat: 0, lon: 0 }

test('pin lifetime: built, lost year, undated loss, still standing', () => {
  expect(alive(toPin(row), 99)).toBe(false)
  expect(alive(toPin(row), 2025)).toBe(true)
  expect(alive(toPin({ ...row, lost: 200 }), 201)).toBe(false)
  expect(alive(toPin({ ...row, lost: true }), 300)).toBe(true)
  expect(alive(toPin({ ...row, lost: true }), 500)).toBe(false)
})

test('equal earth spans the flat width and keeps the equator flat', () => {
  expect(equalEarth(Math.PI, 0)[0]).toBeCloseTo(FLAT_WIDTH / 2, 5)
  expect(equalEarth(1, 0)[1]).toBe(0)
  expect(equalEarth(0, 0)[0]).toBe(0)
})

test('morph endpoints', () => {
  expect(place(0.3, 0.4, 0).distanceTo(spherePoint(0.3, 0.4))).toBeLessThan(1e-9)
  expect(place(0.3, 0.4, 1).z).toBe(0)
})

test('great circle endpoints and unit length', () => {
  const a = spherePoint(0, 0)
  const b = spherePoint(1, 0.5)
  expect(greatCircle(a, b, 0).distanceTo(a)).toBeLessThan(1e-9)
  expect(greatCircle(a, b, 1).distanceTo(b)).toBeLessThan(1e-9)
  expect(greatCircle(a, b, 0.5).length()).toBeCloseTo(1, 9)
})

test('sun: solstices, equinox and equation of time', () => {
  const deg = (d: string) => {
    const v = sunNow(new Date(d))
    return { dec: (Math.asin(v.y) * 180) / Math.PI, lon: (Math.atan2(v.x, v.z) * 180) / Math.PI }
  }
  expect(deg('2024-06-20T20:51Z').dec).toBeCloseTo(23.44, 1)
  expect(Math.abs(deg('2024-03-20T03:06Z').dec)).toBeLessThan(0.05)
  expect(deg('2025-12-21T15:03Z').dec).toBeCloseTo(-23.44, 1)
  expect(deg('2026-11-03T12:00Z').lon).toBeCloseTo(-4.1, 0)
})
