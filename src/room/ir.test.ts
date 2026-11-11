import { expect, test } from 'bun:test'
import { pickIr } from './ir'

const ok = { f: 'a.wav', by: 'Someone', lic: 'CC BY 4.0', src: 'https://example.org/a', measured: true as const }

test('measured entry with full provenance is used', () => expect(pickIr({ a: ok }, 'a')).toEqual(ok))
test('unknown library falls back to the estimate', () => expect(pickIr({ a: ok }, 'b')).toBeNull())
test('entry missing its author or source is refused', () => {
  expect(pickIr({ a: { ...ok, by: '' } }, 'a')).toBeNull()
  expect(pickIr({ a: { ...ok, src: undefined } }, 'a')).toBeNull()
  expect(pickIr({ a: { ...ok, measured: false as never } }, 'a')).toBeNull()
})
