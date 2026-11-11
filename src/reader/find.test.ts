import { expect, test } from 'bun:test'
import { locate, mark, terms } from './find'

test('mark wraps words with suffixes, never inside tags', () => {
  expect(mark('<p class="rain">The rains fell. Brain</p>', ['rain'])).toBe('<p class="rain">The <mark>rains</mark> fell. Brain</p>')
})

test('locate prefers the page with most distinct terms', () => {
  expect(locate(['wine', 'wine and bread', 'bread'], ['wine', 'bread'])).toBe(1)
  expect(locate(['nothing'], ['wine'])).toBe(-1)
})

test('terms drops quotes and one-letter words', () => {
  expect(terms('"Dark Waters" a')).toEqual(['dark', 'waters'])
})
