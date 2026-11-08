import * as THREE from 'three'
import type { RoomApi } from './kit'

const BOX = [
  'position:absolute;left:1.1rem;bottom:6.9rem;z-index:4;width:min(34rem,calc(100% - 2rem))',
  'box-sizing:border-box;padding:0.7rem 1rem;background:var(--glass);backdrop-filter:blur(10px)',
  'border:1px solid var(--hairline);border-radius:4px;color:var(--paper)',
  'font-size:0.95rem;line-height:1.4',
].join(';')
const BTN = [
  'padding:0.25rem 0.9rem;cursor:pointer;background:none',
  'border:1px solid var(--hairline);border-radius:999px;color:var(--gilt)',
  'font-size:10px;letter-spacing:0.16em;text-transform:uppercase',
].join(';')

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, text = '') {
  const e = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
  e.textContent = text
  return e
}

export function attach(api: RoomApi): () => void {
  const stops = api.lib.tour?.stops
  if (!stops?.length) return () => {}

  const button = el('button', { type: 'button', 'data-action': 'tour', 'aria-expanded': 'false' }, 'Tour')
  api.controls.append(button)

  let box: HTMLElement | null = null
  let at = 0

  const show = (i: number) => {
    at = i
    const stop = stops[i]
    const fact = api.lib.facts[stop.fact]
    api.root.dataset.tourStop = String(i)
    box!.querySelector('[data-caption]')!.textContent = fact.value
    const src = box!.querySelector('a')!
    src.href = fact.source
    src.textContent = URL.canParse(fact.source) ? new URL(fact.source).hostname.replace(/^www\./, '') : fact.source
    box!.querySelector('[data-step]')!.textContent = `${i + 1} of ${stops.length}`
    box!.querySelector('[data-tour-prev]')!.setAttribute('aria-disabled', String(i === 0))
    box!.querySelector('[data-tour-next]')!.setAttribute('aria-disabled', String(i === stops.length - 1))
    // Keep the pitch inside the drag clamp (+-1.1) so the first drag after arrival does not snap.
    const look = new THREE.Vector3(...stop.look)
    const flat = Math.hypot(look.x - stop.at[0], look.z - stop.at[2])
    look.y = stop.at[1] + THREE.MathUtils.clamp(look.y - stop.at[1], -Math.tan(1.1) * flat, Math.tan(1.1) * flat)
    api.goTo(stop.at, look.toArray())
  }

  const close = () => {
    if (!box) return
    box.remove()
    box = null
    delete api.root.dataset.tourStop
    button.setAttribute('aria-expanded', 'false')
    button.removeAttribute('aria-controls')
    // A zero-length goTo from where the camera is now ends any flight still in progress.
    const here = api.camera.position
    api.goTo(here.toArray(), here.clone().add(api.camera.getWorldDirection(new THREE.Vector3())).toArray())
    button.focus()
  }

  const open = () => {
    const prev = el('button', { type: 'button', 'data-tour-prev': '', style: BTN }, 'Previous')
    const next = el('button', { type: 'button', 'data-tour-next': '', style: BTN }, 'Next')
    const x = el('button', { type: 'button', 'data-tour-close': '', style: BTN }, 'Close')
    const src = el('a', { 'data-source': '', target: '_blank', rel: 'noopener noreferrer' })
    const row = el('p', { style: 'display:flex;flex-wrap:wrap;gap:0.4rem;align-items:center;margin:0.5rem 0 0' })
    row.append(prev, next, x, el('span', { 'data-step': '' }), src)
    box = el('section', { id: 'room-tour', 'data-tour': '', 'aria-label': 'Guided tour', style: BOX })
    box.append(el('p', { 'data-caption': '', 'aria-live': 'polite', style: 'margin:0' }), row)
    api.controls.after(box)
    button.setAttribute('aria-expanded', 'true')
    button.setAttribute('aria-controls', 'room-tour')
    prev.onclick = () => at > 0 && show(at - 1)
    next.onclick = () => at < stops.length - 1 && show(at + 1)
    x.onclick = close
    show(0)
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && box) close()
  }
  button.onclick = () => (box ? close() : open())
  addEventListener('keydown', onKey)

  return () => {
    removeEventListener('keydown', onKey)
    box?.remove()
    box = null
    delete api.root.dataset.tourStop
    button.remove()
  }
}
