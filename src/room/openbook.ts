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

/** Lay text into wrapped lines, capped at maxLines; reports whether it overflowed. */
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

type Page = { kind: 'title' | 'text'; title?: string; by?: string | null; ch?: string; body?: string }

const INK = '#241708'
const FAINT = '#6b573a'
const GILT = '#a8874e'

function pageTexture(pages: [Page, Page]): THREE.CanvasTexture {
  const w = 1024, h = 704
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  g.fillStyle = '#f0e5cb'
  g.fillRect(0, 0, w, h)
  // Paper tooth, deterministic.
  const rnd = (() => { let s = 97; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0), s / 4294967296) })()
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(120,90,40,${0.02 + rnd() * 0.03})`
    g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 3, 1.5)
  }
  const mx = 64 // page margin
  const colW = w / 2 - mx * 1.5
  const col = (x0: number, page: Page) => {
    g.fillStyle = INK
    g.textBaseline = 'top'
    if (page.kind === 'title') {
      g.textAlign = 'center'
      g.strokeStyle = GILT
      g.lineWidth = 1.4
      g.beginPath()
      g.moveTo(x0 + colW / 2 - 90, 132)
      g.lineTo(x0 + colW / 2 + 90, 132)
      g.stroke()
      g.font = 'italic 700 52px Georgia, "Times New Roman", serif'
      g.fillStyle = INK
      const t = wrap(g, page.title ?? '', colW - 40, 3)
      t.lines.forEach((l, i) => g.fillText(l, x0 + colW / 2, 190 + i * 60))
      if (page.by) {
        g.font = 'italic 30px Georgia, serif'
        g.fillStyle = FAINT
        g.fillText(page.by, x0 + colW / 2, 210 + t.lines.length * 60)
      }
      g.font = '24px Georgia, serif'
      g.fillStyle = FAINT
      g.fillText('—', x0 + colW / 2, h - 140)
    } else {
      g.textAlign = 'left'
      if (page.ch) {
        g.textAlign = 'center'
        g.font = '26px Georgia, serif'
        g.fillStyle = INK
        g.fillText(page.ch.toUpperCase().slice(0, 44), x0 + colW / 2, 92)
        g.strokeStyle = GILT
        g.lineWidth = 1
        g.beginPath()
        g.moveTo(x0 + colW / 2 - 70, 132)
        g.lineTo(x0 + colW / 2 + 70, 132)
        g.stroke()
        g.textAlign = 'left'
      }
      g.font = '27px Georgia, serif'
      g.fillStyle = INK
      const body = page.body ?? ''
      const firstSpace = body.indexOf(' ')
      const first = firstSpace > 0 && firstSpace < 40 ? body.slice(0, firstSpace) : body.slice(0, 12)
      const rest = body.slice(first.length)
      const fw = g.measureText(first).width
      // Drop cap.
      g.font = 'italic 700 66px Georgia, serif'
      g.fillStyle = '#8a6420'
      g.fillText(first.replace(/^["'“‘]+/, '').charAt(0), x0, 96 + (page.ch ? 56 : 0))
      g.font = '27px Georgia, serif'
      g.fillStyle = INK
      const x = x0 + fw + 6
      const y0 = 96 + (page.ch ? 56 : 0)
      const { lines, more } = wrap(g, rest.trim(), colW - fw - 6, 15)
      lines.forEach((l, i) => g.fillText(l, x, y0 + i * 39))
      if (lines.length > 1) g.fillText('', 0, 0)
      const used = lines.length
      if (more || used >= 15) {
        g.textAlign = 'right'
        g.fillStyle = FAINT
        g.fillText('· · ·', x0 + colW, y0 + 14 * 39)
      }
      // Folio.
      g.textAlign = 'center'
      g.font = '22px Georgia, serif'
      g.fillStyle = FAINT
      g.fillText('1', x0 + colW / 2, h - 76)
    }
  }
  col(mx, pages[0])
  col(w / 2 + mx / 2, pages[1])
  // Gutter shadow.
  const grad = g.createLinearGradient(w / 2 - 30, 0, w / 2 + 30, 0)
  grad.addColorStop(0, 'rgba(60,40,15,0)')
  grad.addColorStop(0.5, 'rgba(60,40,15,0.30)')
  grad.addColorStop(1, 'rgba(60,40,15,0)')
  g.fillStyle = grad
  g.fillRect(w / 2 - 30, 0, 60, h)
  // Edge darkening.
  const edge = g.createRadialGradient(w / 2, h / 2, h / 3, w / 2, h / 2, h)
  edge.addColorStop(0, 'rgba(60,40,15,0)')
  edge.addColorStop(1, 'rgba(60,40,15,0.16)')
  g.fillStyle = edge
  g.fillRect(0, 0, w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** A curved open page pair: the sheet lifts toward the spine. */
function curved(w: number, h: number) {
  const g = new THREE.PlaneGeometry(w, h, 20, 2)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const k = 1 - Math.min(1, Math.abs(x) / (w / 2))
    pos.setZ(i, k * k * 0.026)
  }
  g.computeVertexNormals()
  g.rotateX(-Math.PI / 2.5)
  return g
}

export function buildOpenBook(meta: { id: string; title: string; author: string | null }, part: { chapters: { title: string; html: string }[] }): OpenBook {
  const owned: { dispose(): void }[] = []
  const own = <T extends { dispose(): void }>(x: T) => (owned.push(x), x)
  const group = new THREE.Group()

  // Cover boards beneath the pages: the book's own binding colours.
  const hue = hash(meta.id) % 3
  const board = own(new THREE.MeshLambertMaterial({ color: [0x3a2415, 0x2e3b2e, 0x5a2d26][hue]! }))
  const base = new THREE.Mesh(own(new THREE.BoxGeometry(0.56, 0.018, 0.4)), board)
  base.position.y = -0.014
  base.castShadow = true
  group.add(base)

  const first = part.chapters[0]
  const pages: [Page, Page] = [
    { kind: 'title', title: meta.title, by: meta.author },
    { kind: 'text', ch: first?.title, body: first ? strip(first.html).slice(0, 1600) : '' },
  ]
  const tex = own(pageTexture(pages))
  const sheet = new THREE.Mesh(
    own(curved(0.52, 0.37)),
    own(new THREE.MeshLambertMaterial({ map: tex, emissive: 0x33291a })),
  )
  sheet.position.y = 0.006
  group.add(sheet)

  return { group, mesh: sheet, dispose: () => owned.forEach((o) => o.dispose()) }
}
