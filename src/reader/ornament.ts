// Gilt headpieces for chapter openings: deterministic little SVGs, chosen by the
// chapter title so every chapter keeps the same ornament across reloads.

function hash(s: string) {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return h >>> 0
}

const G = '#b3903f'

function svg(inner: string) {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="26" viewBox="0 0 150 26">${inner}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(s)}")`
}

const V = [
  // rules with a centre diamond
  () => `<g fill="none" stroke="${G}" stroke-width="1"><line x1="6" y1="13" x2="60" y2="13"/><line x1="90" y1="13" x2="144" y2="13"/><path d="M75 5 L82 13 L75 21 L68 13 Z"/></g>`,
  // fleuron: mirrored curls
  () => `<g fill="none" stroke="${G}" stroke-width="1.1"><line x1="10" y1="13" x2="52" y2="13"/><line x1="98" y1="13" x2="140" y2="13"/><path d="M75 13 C66 13 64 6 56 8 C64 10 64 17 75 17 C86 17 86 10 94 8 C86 6 84 13 75 13 Z" fill="${G}" stroke="none"/></g>`,
  // three diamonds
  () => `<g fill="${G}"><path d="M75 5 L80 13 L75 21 L70 13 Z"/><path d="M40 9 L44 13 L40 17 L36 13 Z"/><path d="M110 9 L114 13 L110 17 L106 13 Z"/><rect x="48" y="12.4" width="16" height="1.2"/><rect x="86" y="12.4" width="16" height="1.2"/></g>`,
  // vine scroll
  () => `<g fill="none" stroke="${G}" stroke-width="1"><path d="M8 13 C30 4 50 22 70 13"/><path d="M142 13 C120 4 100 22 80 13"/><circle cx="75" cy="13" r="2.4" fill="${G}" stroke="none"/></g>`,
  // asterism
  () => `<g fill="${G}"><rect x="8" y="12.4" width="56" height="1.2"/><rect x="86" y="12.4" width="56" height="1.2"/><path d="M75 6 L76.6 11.4 L82 13 L76.6 14.6 L75 20 L73.4 14.6 L68 13 L73.4 11.4 Z"/></g>`,
  // double rule with centre bar
  () => `<g fill="none" stroke="${G}"><rect x="8" y="9.5" width="134" height="7" rx="3.5" stroke-width="1"/><line x1="66" y1="13" x2="84" y2="13" stroke-width="2.4"/></g>`,
]

export const headpiece = (seed: string) => svg(V[hash(seed) % V.length]!())

// A small tailpiece for part ends: a centred triangle of three dots.
export const tailpiece = svg(
  `<g fill="${G}"><circle cx="69" cy="13" r="1.6"/><circle cx="75" cy="13" r="1.6"/><circle cx="81" cy="13" r="1.6"/></g>`,
)
