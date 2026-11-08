import exteriors from '../../data/exterior.json'
import type { Library } from '../types'
import { textures, type Exterior } from './outside'

export type Place = 'outside' | 'inside' | 'site'

export const exteriorOf = (lib: Library) => (exteriors as Record<string, Exterior>)[lib.id] ?? null

/** Where a visit starts: celsus is always a site; history.state.arrive "outside" starts outside, anything else inside. */
export function firstPlace(lib: Library, ex: Exterior | null): Place {
  if (lib.kit === 'site') return 'site'
  return ex && history.state?.arrive === 'outside' ? 'outside' : 'inside'
}

/** Going in or out is recorded in place, so reload resumes it and history.length stays put. */
export const remember = (p: Place) => p !== 'site' && history.replaceState({ ...history.state, arrive: p }, '')

const DIM = { w: 'width', d: 'depth', h: 'height' } as Record<string, string>

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, string> = {}, ...kids: (Node | string)[]) {
  const e = document.createElement(tag)
  for (const [k, v] of Object.entries(props)) e.setAttribute(k, v)
  e.append(...kids)
  return e
}

const link = (href: string, text: string) => el('a', { href, target: '_blank', rel: 'noopener noreferrer' }, text)

/** Adds the building and texture credits to the panel's existing ul.room-credits. */
export function addCredits(panel: HTMLElement, ex: Exterior | null) {
  const ul = panel.querySelector('ul.room-credits')!
  if (ex && ex.source !== 'estimate') {
    ul.append(el('li', {}, `${ex.name}, building outline: `, link(`https://www.openstreetmap.org/${ex.source}`, 'OpenStreetMap'), ', ODbL'))
  }
  for (const a of new Set(textures.map((t) => t.asset))) {
    ul.append(el('li', {}, `${a}, CC0, `, link(`https://polyhaven.com/a/${a}`, 'Poly Haven')))
  }
}

export function estimatedLabel(ex: Exterior) {
  const e = el('p', { class: 'room-estimated', 'data-estimated': '' }, `Estimated: ${ex.estimated.map((k) => DIM[k]).join(', ')}`)
  e.hidden = true
  return e
}

export function placeButton(action: 'enter' | 'exit') {
  const b = el('button', { type: 'button', class: 'room-place', 'data-action': action }, action === 'enter' ? 'Go inside' : 'Step outside')
  b.hidden = true
  return b
}
