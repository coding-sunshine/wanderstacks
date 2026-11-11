import type { Mount } from '../types'

// A pastiche of Borges' Library of Babel: a seeded, endless shelf wall.
// Search for any text and it shows you where it waits on the shelves.
// Labelled as the invention it is — Borges would insist.

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz, .'

function mulberry(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hash = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function pageText(seed: number, len = 320): string {
  const rnd = mulberry(seed)
  let out = ''
  for (let i = 0; i < len; i++) out += GLYPHS[Math.floor(rnd() * GLYPHS.length)]
  return out
}

export const mount: Mount = (app) => {
  const root = document.createElement('section')
  root.className = 'page babel'
  root.dataset.view = 'babel'
  const head = document.createElement('h1')
  head.className = 'shelf-title'
  head.textContent = 'The Library of Babel'
  const lede = document.createElement('p')
  lede.className = 'shelf-lede'
  lede.textContent =
    'A pastiche after Jorge Luis Borges (1941). An endless library ' +
    'generated on your device from a fixed seed. ' +
    'An invention, labelled as one. Search for any text: ' +
    'somewhere in the library it already waits.'
  const form = document.createElement('form')
  form.className = 'babel-form'
  const input = document.createElement('input')
  input.type = 'search'
  input.className = 'shelf-filter'
  input.placeholder = 'Search for anything…'
  input.setAttribute('aria-label', 'Search the library of Babel')
  input.maxLength = 42
  const go = document.createElement('button')
  go.type = 'submit'
  go.className = 'btn'
  go.textContent = 'Locate'
  form.append(input, go)
  const result = document.createElement('div')
  result.className = 'babel-result'
  result.hidden = true
  const shelf = document.createElement('pre')
  shelf.className = 'babel-shelf'
  shelf.setAttribute('aria-hidden', 'true')
  root.append(head, lede, form, result, shelf)
  app.append(root)

  // The endless wall: three shelves of seeded spines.
  const wall = mulberry(20261109)
  let spines = ''
  for (let i = 0; i < 240; i++) {
    const w = 3 + Math.floor(wall() * 9)
    spines += pageText(1000 + i, w).padEnd(11, ' ') + ' '
    if (i % 12 === 11) spines += '\n'
  }
  shelf.textContent = spines

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const q = input.value.trim().toLowerCase()
    if (!q) return
    const seed = hash(q)
    const rnd = mulberry(seed)
    const pad = Math.floor(rnd() * 280)
    const before = pageText(seed ^ 0x9e3779b9, pad)
    const after = pageText(seed ^ 0x51ab3c, 280 - pad)
    const loc = `${Math.floor(rnd() * 4)} · ${['wall', 'hexagon', 'gallery', 'alcove'][Math.floor(rnd() * 4)]} ${Math.floor(rnd() * 5000)} · shelf ${Math.floor(rnd() * 32)} · book ${Math.floor(rnd() * 4096)}`
    result.replaceChildren()
    const where = document.createElement('p')
    where.className = 'babel-loc'
    where.textContent = `Found. ${loc}`
    const page = document.createElement('p')
    page.className = 'babel-page'
    const b = document.createElement('strong')
    b.textContent = q
    page.append(before, b, after)
    const note = document.createElement('p')
    note.className = 'babel-note micro'
    note.textContent = 'Deterministic: the same search always finds the same page.'
    result.append(where, page, note)
    result.hidden = false
  })

  root.dataset.ready = 'true'
}
