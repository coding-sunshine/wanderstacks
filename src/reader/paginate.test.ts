import { expect, test } from 'bun:test'
import { blocks, cut } from './paginate'

test('cut reopens inline tags across the split', () => {
  expect(cut('one <em>two three</em> four', 2)).toEqual(['one <em>two</em>', '<em>three</em> four'])
})

test('blocks keeps quote state and chapter heading', () => {
  expect(blocks({ title: 'I', html: '<p>a</p><blockquote><p>b</p></blockquote><p>c</p>' }).map((b) => [b.k, b.q])).toEqual([
    ['h2', false], ['p', false], ['p', true], ['p', false],
  ])
})
