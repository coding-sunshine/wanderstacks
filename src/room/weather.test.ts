import { expect, test } from 'bun:test'
import { describe, localTime, parse } from './weather'

test('parse keeps the fields the room needs and rejects junk', () => {
  const w = parse({ timezone: 'Europe/Dublin', current: { weather_code: 61, temperature_2m: 9.4, cloud_cover: 100, precipitation: 0.6, snowfall: 0, visibility: 12000, wind_speed_10m: 18 } })
  expect(w).toEqual({ code: 61, temp: 9.4, cloud: 100, precip: 0.6, snow: 0, visibility: 12000, wind: 18, tz: 'Europe/Dublin' })
  expect(parse({ error: true, reason: 'x' })).toBeNull()
  expect(parse(null)).toBeNull()
})

test('WMO codes map to words', () => {
  expect(describe(0)).toBe('clear')
  expect(describe(45)).toBe('fog')
  expect(describe(63)).toBe('rain')
  expect(describe(75)).toBe('snow')
  expect(describe(96)).toBe('thunderstorm')
})

test('local time uses the zone, else solar time from longitude', () => {
  const d = new Date('2026-07-01T12:00Z')
  expect(localTime('Europe/Dublin', -6.25, d)).toBe('13:00')
  expect(localTime(null, 90, d)).toBe('18:00 solar')
  expect(localTime('Not/AZone', 0, d)).toBe('12:00 solar')
})
