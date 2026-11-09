import * as THREE from 'three'
import { hash } from './kit'

// The open book laid on the lectern when a readable book is pulled: two gently
// curved pages with the book's own first page set on them. Clicking it opens the reader.

export type OpenBook = { group: THREE.Group; mesh: THREE.Mesh; dispose(): void }

function strip(html: string) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Lay text into wrapped lines; returns the lines and whether everything fit. */
function wrap(g: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const t = line ? `${line} ${word}` : word
    if (g.measureText(t).width > maxW && line) {
      lines.push(line)
      line = word
      if (lines.length >= maxLines) return { lines, more: true }
    } else line = t
  }
  if (line && lines.length < maxLines) lines.push(line)
  return { lines, more: lines.length >= maxLines }
}

type Page = { kind: 'title' | 'text'; title?: string; by?: string | null; body?: string }

function pageTexture(pages: [Page, Page]): THREE.CanvasTexture {
  const w = 512, h = 352
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  g.fillStyle = '#efe4c8'
  g.fillRect(0, 0, w, h)
  // Faint paper mottling, deterministic.
  const rnd = (() => { let s = 97; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0), s / 4294967296) })()
  for (let i = 0; i < 120; i++) {
    g.fillStyle = `rgba(120,90,40,${0.03 + rnd() * 0.03})`
    g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 3, 1.5)
  }
  const gutter = 26
  const col = (x0: number, page: Page) => {
    g.fillStyle = '#2a1c0e'
    g.textBaseline = 'top'
    if (page.kind === 'title') {
      g.textAlign = 'center'
      g.font = 'italic 700 30px Georgia, serif'
      const { lines } = wrap(g, page.title ?? '', 200, 3)
      lines.forEach((l, i) => g.fillText(l, x0 + 108, 96 + i * 36))
      g.font = 'italic 17px Georgia, serif'
      g.fillStyle = '#5c4a2e'
      if (page.by) g.fillText(page.by, x0 + 108, 96 + lines.length * 36 + 18)
      g.strokeStyle = '#a8874e'
      g.lineWidth = 1
      g.beginPath()
      g.moveTo(x0 + 38, 66)
      g.lineTo(x0 + 178, 66)
      g.stroke()
    } else {
      g.textAlign = 'left'
      g.font = '17px Georgia, serif'
      const { lines } = wrap(g, page.body ?? '', 216, 13)
      lines.forEach((l, i) => g.fillText(l, x0 + 6, 34 + i * 23))
      if (lines.length >= 13) {
        g.textAlign = 'right'
        g.fillStyle = '#8a7452'
        g.fillText('…', x0 + 222, 34 + 12 * 23)
      }
    }
  }
  col(gutter, pages[0])
  col(w / 2 + gutter / 2, pages[1])
  // Gutter shadow.
  const grad = g.createLinearGradient(w / 2 - 22, 0, w / 2 + 22, 0)
  grad.addColorStop(0, 'rgba(60,40,15,0)')
  grad.addColorStop(0.5, 'rgba(60,40,15,0.28)')
  grad.addColorStop(1, 'rgba(60,40,15,0)')
  g.fillStyle = grad
  g.fillRect(w / 2 - 22, 0, 44, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

/** A curved open page pair: the sheet lifts toward the spine. */
function curved(w: number, h: number) {
  const g = new THREE.PlaneGeometry(w, h, 16, 1)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const k = 1 - Math.min(1, Math.abs(x) / (w / 2))
    pos.setZ(i, k * k * 0.028)
  }
  g.computeVertexNormals()
  g.rotateX(-Math.PI / 2.35)
  return g
}

export function buildOpenBook(meta: { id: string; title: string; author: string | null }, part: { chapters: { title: string; html: string }[] }): OpenBook {
  const owned: { dispose(): void }[] = []
  const own = <T extends { dispose(): void }>(x: T) => (owned.push(x), x)
  const group = new THREE.Group()

  // Cover boards beneath the pages: the book's own binding colours.
  const hue = hash(meta.id) % 3
  const board = own(new THREE.MeshLambertMaterial({ color: [0x3a2415, 0x2e3b2e, 0x5a2d26][hue]! }))
  const base = new THREE.Mesh(own(new THREE.BoxGeometry(0.54, 0.016, 0.38)), board)
  base.position.y = -0.012
  group.add(base)

  const first = part.chapters[0]
  const second = part.chapters[1]
  const pages: [Page, Page] = [
    { kind: 'title', title: meta.title, by: meta.author },
    { kind: 'text', body: first ? strip(first.html).slice(0, 1400) : '' },
  ]
  // A single sheet carries both facing pages, printed like an opening.
  const tex = own(pageTexture(pages))
  const sheet = new THREE.Mesh(
    own(curved(0.5, 0.34)),
    own(new THREE.MeshBasicMaterial({ map: tex })),
  )
  sheet.position.y = 0.004
  group.add(sheet)
  void second

  return { group, mesh: sheet, dispose: () => owned.forEach((o) => o.dispose()) }
}
