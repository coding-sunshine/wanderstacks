import { describe, expect, it } from 'bun:test'
import { clean, decode, encode, merge } from './shelves'

const atlas = { href: '/libraries/admont/', title: 'Admont Abbey Library', sub: 'Admont, Austria' }

describe('shelves', () => {
  it('round-trips a shelf through a share code, unicode included', () => {
    const s = { name: 'Bibliothèques · 図書館', items: [atlas, { href: '/books/gita/', title: 'भगवद्गीता', sub: '' }] }
    const code = encode(s)
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decode(code)).toEqual(s)
  })

  it('drops entries that would leave the site or run script', () => {
    const bad = ['//evil.example/x', 'javascript:alert(1)', 'https://evil.example/', '/\\evil.example', '/a b', 42]
    const [s] = clean([{ name: 'x', items: [atlas, ...bad.map((href) => ({ href, title: 't' }))] }])
    expect(s.items).toEqual([atlas])
  })

  it('rejects garbage and caps lengths', () => {
    expect(decode('%%%')).toBeUndefined()
    expect(decode(encode({ name: '', items: [] }))).toBeUndefined()
    expect(clean('nope')).toEqual([])
    expect(clean([{ name: 'n'.repeat(500), items: [] }])[0].name).toHaveLength(80)
  })

  it('merges same-named shelves without duplicates', () => {
    const book = { href: '/books/gita/', title: 'Gita', sub: '' }
    const out = merge([{ name: 'A', items: [atlas] }], [{ name: 'A', items: [atlas, book] }, { name: 'B', items: [] }])
    expect(out).toEqual([{ name: 'A', items: [atlas, book] }, { name: 'B', items: [] }])
  })
})
