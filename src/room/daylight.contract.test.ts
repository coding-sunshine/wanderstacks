import { describe as suite, expect, test } from 'bun:test'
import { Vector3 } from 'three'
import { daylight, sunAngles } from './daylight'
import { describe, localLine, precipOf, type Weather } from './weather'

// Hooks leave lamps/beams as boolean or "on"/"off"; both are accepted, anything else fails.
const flag = (v: unknown) => {
  expect([true, false, 'on', 'off'] as unknown[]).toContain(v)
  return v === true || v === 'on'
}
const sky = (alt: number, cloud = 0, place: 'inside' | 'outside' | 'site' = 'outside') => daylight({ alt }, cloud, place)

suite('daylight bands', () => {
  for (const [alt, want] of [[10, 'day'], [0.1, 'day'], [0, 'twilight'], [-3, 'twilight'], [-6, 'twilight'], [-6.1, 'night'], [-20, 'night']] as const)
    test(`alt ${alt} is ${want}`, () => expect(sky(alt).sky).toBe(want))
  for (const [alt, want] of [[-3.9, false], [-4, false], [-4.1, true]] as const)
    test(`lamps at alt ${alt} are ${want ? 'on' : 'off'}`, () => expect(flag(sky(alt).lamps)).toBe(want))
})

suite('beams', () => {
  test('on only for alt>0, cloud<70, inside', () => {
    expect(flag(sky(30, 0, 'inside').beams)).toBe(true)
    expect(flag(sky(30, 69, 'inside').beams)).toBe(true)
    expect(flag(sky(30, 70, 'inside').beams)).toBe(false)
    expect(flag(sky(0, 0, 'inside').beams)).toBe(false)
    expect(flag(sky(-5, 0, 'inside').beams)).toBe(false)
    expect(flag(sky(30, 0, 'outside').beams)).toBe(false)
    expect(flag(sky(30, 0, 'site').beams)).toBe(false)
  })
})

suite('key light', () => {
  test('zero at horizon and below', () => {
    expect(Math.abs(sky(0).key)).toBe(0)
    expect(Math.abs(sky(-10).key)).toBe(0)
  })
  test('cloud 100 dims at least 10%', () => expect(sky(45, 100).key).toBeLessThanOrEqual(0.9 * sky(45, 0).key))
  for (const cloud of [0, 100])
    test(`non-decreasing with altitude at cloud ${cloud}`, () => {
      for (let a = 1; a <= 90; a++) expect(sky(a, cloud).key).toBeGreaterThanOrEqual(sky(a - 1, cloud).key)
    })
})

suite('sunAngles', () => {
  const near = (v: { alt: number; az: number }, alt: number, az: number) => {
    expect(v.alt).toBeCloseTo(alt, 4)
    if (az >= 0) expect(v.az).toBeCloseTo(az, 4)
  }
  test('up', () => near(sunAngles(new Vector3(0, 1, 0)), 90, -1))
  test('east', () => near(sunAngles(new Vector3(1, 0, 0)), 0, 90))
  test('north', () => near(sunAngles(new Vector3(0, 0, -1)), 0, 0))
  test('south', () => near(sunAngles(new Vector3(0, 0, 1)), 0, 180))
  test('west', () => near(sunAngles(new Vector3(-1, 0, 0)), 0, 270))
  test('alt is in degrees, below the horizon negative', () => near(sunAngles(new Vector3(0, -0.5, -Math.sqrt(0.75))), -30, 0))
})

suite('precipOf', () => {
  for (const c of [51, 61, 67, 80, 82, 95, 99]) test(`${c} is rain`, () => expect(precipOf(c)).toBe('rain'))
  for (const c of [71, 77, 85, 86]) test(`${c} is snow`, () => expect(precipOf(c)).toBe('snow'))
  for (const c of [0, 3, 45, 68, 70, 78, 83, 87, 94]) test(`${c} is none`, () => expect(precipOf(c)).toBe('none'))
})

suite('localLine', () => {
  const w = { code: 61, temp: 9.4, tz: 'Europe/Dublin', cloud: 80, precip: 1, snow: 0, visibility: 10000, wind: 4 } as unknown as Weather
  const d = new Date('2026-07-01T12:00Z')
  test('success', () => expect(localLine(w, -6.25, d)).toBe('13:00 · rain · 9°C'))
  test('negative temperature rounds', () => expect(localLine({ ...w, temp: -2.6 } as Weather, -6.25, d)).toBe('13:00 · rain · -3°C'))
  test('failure falls back to solar time', () => expect(localLine(null, 90, d)).toBe('18:00 solar'))
})

suite('describe', () => {
  test('words', () => {
    expect(describe(63)).toBe('rain')
    expect(describe(73)).toBe('snow')
  })
})
