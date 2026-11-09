import { hash } from './kit'

// Procedural period bindings: every book gets a deterministic cover and spine
// label drawn the way its era would bind it — no assets, no network.

export type BookInfo = { id: string; title: string; author: string | null; date?: string | null }

type Era = 'incunable' | 'c17' | 'c18' | 'c19' | 'modern'

export function eraOf(date?: string | null): Era {
  const y = parseInt(/\d{3,4}/.exec(date ?? '')?.[0] ?? '', 10)
  if (!Number.isFinite(y)) return 'modern'
  if (y < 1500) return 'incunable'
  if (y < 1700) return 'c17'
  if (y < 1800) return 'c18'
  if (y < 1900) return 'c19'
  return 'modern'
}

const LEATHER: Record<Era, string[]> = {
  incunable: ['#33200f', '#3d2716', '#2a1a0c'],
  c17: ['#3a2415', '#452b18', '#2e1c10'],
  c18: ['#6b4a2c', '#7a5636', '#5a3c22'],
  c19: ['#5a2d26', '#2e3b2e', '#28324a', '#6b5330'],
  modern: ['#8a7a5c', '#705f45', '#5c5240'],
}
const era = (b: BookInfo): Era => eraOf(b.date)
const leatherOf = (b: BookInfo, rnd: () => number) => {
  const ramp = LEATHER[era(b)]
  return ramp[Math.floor(rnd() * ramp.length)]!
}

function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0), s / 4294967296)
}

/** Wear: faint scratches and rubbed corners so no binding looks factory-fresh. */
function wear(g: CanvasRenderingContext2D, w: number, h: number, rnd: () => number, ink: string) {
  g.strokeStyle = ink
  g.globalAlpha = 0.08
  for (let i = 0; i < 26; i++) {
    const x = rnd() * w, y = rnd() * h
    g.beginPath()
    g.moveTo(x, y)
    g.lineTo(x + (rnd() - 0.5) * 26, y + (rnd() - 0.5) * 8)
    g.stroke()
  }
  g.globalAlpha = 0.12
  for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h]] as const) {
    g.beginPath()
    g.arc(x, y, 14 + rnd() * 10, 0, Math.PI * 2)
    g.fillStyle = ink
    g.fill()
  }
  g.globalAlpha = 1
}

function ribCloth(g: CanvasRenderingContext2D, w: number, h: number, base: string) {
  g.fillStyle = base
  g.fillRect(0, 0, w, h)
  g.globalAlpha = 0.07
  g.fillStyle = '#000'
  for (let x = 0; x < w; x += 3) g.fillRect(x, 0, 1, h)
  g.globalAlpha = 1
}

function mottle(g: CanvasRenderingContext2D, w: number, h: number, rnd: () => number) {
  for (let i = 0; i < 240; i++) {
    g.globalAlpha = 0.05
    g.fillStyle = rnd() > 0.5 ? '#000' : '#c9a06a'
    const r = 2 + rnd() * 9
    g.beginPath()
    g.arc(rnd() * w, rnd() * h, r, 0, Math.PI * 2)
    g.fill()
  }
  g.globalAlpha = 1
}

const GILT = '#c9a24a'
const INK_GILT = '#e8c96a'

function frame(g: CanvasRenderingContext2D, w: number, h: number, inset: number) {
  g.strokeStyle = GILT
  g.lineWidth = 2
  g.strokeRect(inset, inset, w - inset * 2, h - inset * 2)
  g.lineWidth = 1
  g.strokeRect(inset + 4, inset + 4, w - inset * 2 - 8, h - inset * 2 - 8)
}

function titleLines(g: CanvasRenderingContext2D, title: string, max: number) {
  const words = title.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    if ((line + ' ' + word).trim().length > max && line) (lines.push(line), (line = word))
    else line = (line + ' ' + word).trim()
  }
  if (line) lines.push(line)
  return lines.slice(0, 4)
}

/** Front cover, 240x360: cloth or calf, tooled frame, gilt title. */
export function binding(b: BookInfo): HTMLCanvasElement {
  const w = 240, h = 360
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  const rnd = rng(hash(b.id))
  const base = leatherOf(b, rnd)
  const e = era(b)
  if (e === 'c19' || e === 'modern') ribCloth(g, w, h, base)
  else {
    g.fillStyle = base
    g.fillRect(0, 0, w, h)
    mottle(g, w, h, rnd)
  }
  wear(g, w, h, rnd, e === 'c19' || e === 'modern' ? '#000' : '#c9a06a')
  if (e === 'incunable') {
    // Blind tooling only: no title on a 15th-century binding.
    g.strokeStyle = '#1c1108'
    g.lineWidth = 2
    g.strokeRect(14, 14, w - 28, h - 28)
    g.strokeRect(20, 20, w - 40, h - 40)
    return c
  }
  frame(g, w, h, e === 'c18' ? 12 : 16)
  g.fillStyle = e === 'c18' ? '#7a1f1a' : base
  const panelH = 108
  g.fillRect(28, 62, w - 56, panelH)
  g.strokeStyle = GILT
  g.lineWidth = 1.5
  g.strokeRect(32, 66, w - 64, panelH - 8)
  g.fillStyle = INK_GILT
  g.textAlign = 'center'
  g.font = '600 19px Georgia, "Times New Roman", serif'
  const lines = titleLines(g, b.title, 20)
  lines.forEach((line, i) => g.fillText(line.toUpperCase(), w / 2, 96 + i * 20))
  if (b.author) {
    g.font = 'italic 15px Georgia, serif'
    g.fillStyle = GILT
    g.fillText(b.author, w / 2, 64 + panelH + 26)
  }
  const y = parseInt(/\d{3,4}/.exec(b.date ?? '')?.[0] ?? '', 10)
  if (Number.isFinite(y)) {
    g.font = '13px Georgia, serif'
    g.fillStyle = GILT
    g.fillText(b.date!, w / 2, h - 30)
  }
  return c
}

/** Spine label, 96x320: reading downward, the way a shelf presents it. */
export function spineLabel(b: BookInfo): HTMLCanvasElement {
  const w = 96, h = 320
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  const rnd = rng(hash(b.id) ^ 0x9e3779b9)
  const base = leatherOf(b, rnd)
  const e = era(b)
  if (e === 'c19' || e === 'modern') ribCloth(g, w, h, base)
  else {
    g.fillStyle = base
    g.fillRect(0, 0, w, h)
    mottle(g, w, h, rnd)
  }
  wear(g, w, h, rnd, '#000')
  // Raised bands
  g.fillStyle = 'rgba(0,0,0,0.28)'
  for (const y of [26, 46, h - 46, h - 26]) g.fillRect(0, y, w, 5)
  if (e === 'incunable') return c
  // Label panel
  g.fillStyle = e === 'c18' ? '#7a1f1a' : 'rgba(0,0,0,0.25)'
  g.fillRect(12, 66, w - 24, h - 132)
  g.strokeStyle = GILT
  g.lineWidth = 1.5
  g.strokeRect(15, 69, w - 30, h - 138)
  g.save()
  g.translate(w / 2, h / 2)
  g.rotate(-Math.PI / 2)
  g.textAlign = 'center'
  g.fillStyle = INK_GILT
  g.font = '600 13px Georgia, serif'
  const lines = titleLines(g, b.title, 26)
  const lh = 15
  lines.forEach((line, i) => g.fillText(line.toUpperCase(), 0, (i - (lines.length - 1) / 2) * lh + 4))
  if (b.author) {
    g.font = 'italic 11px Georgia, serif'
    g.fillStyle = GILT
    g.fillText(b.author.slice(0, 30), 0, (lines.length / 2) * lh + 16)
  }
  g.restore()
  return c
}
