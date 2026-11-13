import { expect, test } from 'bun:test'
import { authorsOf, century, centuryName, topics, topicsOf } from './topics'
import { books, type Book } from './data'

test('century reads years, ranges, ordinals and eras', () => {
  const cases: [string, number | null][] = [
    ['1187', 12], ['1200', 12], ['1201', 13], ['-100', -1], ['19 BCE', -1], ['8 CE', 1], ['c. 1550 BCE', -16],
    ['c. 479-221 BCE', -5], ['c. 400 BCE-400 CE', -4], ['c. 800-200 BCE', -8], ['1802-1806', 19], ['1605/1615', 17],
    ['13th c.', 13], ['4th century', 4], ['1st century BCE', -1], ['c. 3rd c. BCE', -3], ['late 11th century', 11],
    ['5th-early 11th c.', 5], ['[ca. 1401-1599?]', 15], ['~180', 2], ['1912?', 20], ['c. 860 + late 10th c.', 9],
    ['Hellenistic', null], ['sec. IV', null], ['', null],
  ]
  for (const [d, want] of cases) expect([d, century(d)]).toEqual([d, want])
  expect(centuryName(-3)).toBe('3rd century BC')
  expect(centuryName(21)).toBe('21st century')
  expect(centuryName(11)).toBe('11th century')
})

test('authors are split on semicolons, flipped to First Last, and anonymous names dropped', () => {
  const b = (author: string) => ({ author }) as Book
  expect(authorsOf(b('Dickens, Charles'))).toEqual(['Charles Dickens'])
  expect(authorsOf(b('Grimm, Jacob; Grimm, Wilhelm'))).toEqual(['Jacob Grimm', 'Wilhelm Grimm'])
  expect(authorsOf(b('Augustine, of Hippo, Saint; Byron, George Gordon Byron, Baron'))).toEqual(['Augustine of Hippo', 'George Gordon Byron'])
  expect(authorsOf(b('Marcus Aurelius, Emperor of Rome; Pliny, the Elder'))).toEqual(['Marcus Aurelius', 'Pliny the Elder'])
  expect(authorsOf(b('Baum, L. Frank (Lyman Frank); Burton, Richard F., tr.'))).toEqual(['L. Frank Baum', 'Richard F. Burton'])
  expect(authorsOf(b('Richard F. Burton, tr.; Balzac, Honoré de'))).toEqual(['Richard F. Burton', 'Honoré de Balzac'])
  expect(authorsOf(b('Anonymous'))).toEqual([])
})

test('one author spelled two ways gets one shelf', () => {
  const b = (author: string) => ({ author }) as Book
  expect(authorsOf(b('Dostoyevsky, Fyodor'))).toEqual(['Fyodor Dostoevsky'])
  expect(authorsOf(b('Fyodor Dostoevsky'))).toEqual(['Fyodor Dostoevsky'])
  expect(authorsOf(b('Sunzi, active 6th century B.C.'))).toEqual(['Sun Tzu'])
  expect(authorsOf(b('Jacob and Wilhelm Grimm'))).toEqual(['Jacob Grimm', 'Wilhelm Grimm'])
  const shelf = (k: string) => topics.find((t) => t.facet === 'author' && t.key === k)
  expect(shelf('fyodor-dostoyevsky')).toBeUndefined()
  expect(shelf('fyodor-dostoevsky')?.books.length).toBe(8)
  expect(shelf('charlotte-bronte')?.name).toBe('Charlotte Brontë')
  for (const t of topics) expect([t.key, new Set(t.books).size]).toEqual([t.key, t.books.length])
})

test('every topic has two or more books and every book link points at a topic', () => {
  expect(topics.every((t) => t.books.length >= 2)).toBe(true)
  const hrefs = new Set(topics.map((t) => `/books/${t.facet}/${t.key}/`))
  expect(new Set(topics.map((t) => `${t.facet}/${t.key}`)).size).toBe(topics.length)
  for (const b of books) for (const t of topicsOf(b)) expect(hrefs.has(t.href)).toBe(true)
})
