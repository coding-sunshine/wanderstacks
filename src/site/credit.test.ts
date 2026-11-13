import { expect, test } from 'bun:test'
import { credit, licUrl } from './credit'

test('licence deeds', () => {
  expect(licUrl('CC BY 2.0')).toBe('https://creativecommons.org/licenses/by/2.0/')
  expect(licUrl('CC BY-SA 3.0 igo')).toBe('https://creativecommons.org/licenses/by-sa/3.0/igo/')
  expect(licUrl('CC BY 2.0 fr')).toBe('https://creativecommons.org/licenses/by/2.0/fr/')
  expect(licUrl('CC0')).toBe('https://creativecommons.org/publicdomain/zero/1.0/')
  expect(licUrl('Public domain')).toBeUndefined()
})

test('credit line', () => {
  expect(credit({ cap: 'Reading room', by: 'A. Person', lic: 'Public domain', src: 'https://commons.wikimedia.org/wiki/File:X.jpg' }))
    .toBe('Reading room. Photo: A. Person, Public domain, via Wikimedia Commons: https://commons.wikimedia.org/wiki/File:X.jpg')
})
