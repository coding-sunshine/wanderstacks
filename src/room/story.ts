import type { RoomApi } from './kit'

// "The library's years": a scroll-driven story inside the About panel.
// Scrolling the panel walks the camera through the tour stops while dated
// evidence rows pass by. Every beat is a passing row; nothing is invented.

type Ev = { kind?: string; year?: number; label?: string; value?: string; quote?: string; source?: string }

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text = '') {
  const e = document.createElement(tag)
  e.className = cls
  if (text) e.textContent = text
  return e
}

export function attach(api: RoomApi): () => void {
  const lib = api.lib as unknown as { name?: string; place?: string; years?: string; facts?: Ev[]; events?: Ev[]; tour?: { stops: { at: number[]; look: number[] }[] } }
  const panel = api.panel
  if (!panel) return () => {}
  const events = [...(lib.events ?? [])].sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999))
  const now = (lib.facts ?? []).find((f) => f.value && f.source)
  if (!events.length && !now) return () => {}

  const section = el('section', 'story')
  section.append(el('h2', '', 'The library’s years'))
  const list = el('div', 'story-list')

  const beats: { year: string; text: string; quote?: string; source?: string }[] = []
  beats.push({ year: '·', text: `${lib.name ?? ''}. ${lib.place ?? ''} ${lib.years ?? ''}.`.trim() })
  for (const e of events) {
    if (!e.label && !e.value) continue
    beats.push({ year: e.year ? String(e.year) : '·', text: (e.label ?? e.value)!, quote: e.quote ?? undefined, source: e.source })
  }
  if (now) beats.push({ year: 'Now', text: now.value!, quote: now.quote ?? undefined, source: now.source })

  beats.forEach((b, i) => {
    const card = el('article', 'story-beat')
    card.dataset.beat = String(i)
    card.append(el('p', 'story-year micro', b.year))
    card.append(el('p', 'story-text', b.text))
    if (b.quote) card.append(el('p', 'story-quote', `“${b.quote}”`))
    if (b.source?.startsWith('http')) {
      const a = el('a', 'story-src', new URL(b.source).hostname.replace(/^www\./, '')) as HTMLAnchorElement
      a.href = b.source
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      card.append(a)
    }
    list.append(card)
  })
  section.append(list)

  // Insert after the room name/where block so the facts stay first.
  const where = panel.querySelector('.where')
  where ? where.after(section) : panel.prepend(section)

  const stops = lib.tour?.stops ?? []
  let current = -1
  let timer = 0
  const onScroll = () => {
    if (!stops.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      const r = panel.getBoundingClientRect()
      const target = r.top + r.height * 0.35
      let best = 0
      let bd = Infinity
      list.querySelectorAll<HTMLElement>('.story-beat').forEach((beat, i) => {
        const b = beat.getBoundingClientRect()
        const d = Math.abs(b.top + b.height / 2 - target)
        if (d < bd) (bd = d), (best = i)
        beat.dataset.on = 'false'
      })
      const active = list.querySelector<HTMLElement>(`.story-beat[data-beat="${best}"]`)
      if (active) active.dataset.on = 'true'
      if (best !== current && best < stops.length) {
        current = best
        const s = stops[best]!
        api.goTo(s.at as [number, number, number], s.look as [number, number, number], 1400)
      }
    }, 90)
  }
  panel.addEventListener('scroll', onScroll, { passive: true })

  return () => {
    window.clearTimeout(timer)
    panel.removeEventListener('scroll', onScroll)
    section.remove()
  }
}
