import type { RoomApi } from './kit'

const BOX = [
  'position:absolute;left:1rem;bottom:5rem;z-index:4;width:min(34rem,calc(100% - 2rem))',
  'box-sizing:border-box;padding:0.6rem 0.9rem;background:rgba(14,11,8,0.92)',
  'border:1px solid var(--gilt);color:var(--paper);font-size:0.95rem;line-height:1.4',
].join(';')
const BTN = ['padding:0.25rem 0.8rem;cursor:pointer', 'background:rgba(14,11,8,0.85);border:1px solid var(--gilt);color:var(--paper)'].join(';')

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, text = '') {
  const e = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
  e.textContent = text
  return e
}

export function attach(api: RoomApi): () => void {
  const stops = api.lib.tour?.stops
  if (!stops?.length) return () => {}

  const button = el('button', { type: 'button', 'data-action': 'tour', 'aria-expanded': 'false', 'aria-controls': 'room-tour' }, 'Tour')
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
    src.textContent = new URL(fact.source).hostname.replace(/^www\./, '')
    box!.querySelector('[data-step]')!.textContent = `${i + 1} of ${stops.length}`
    box!.querySelector('[data-tour-prev]')!.setAttribute('aria-disabled', String(i === 0))
    box!.querySelector('[data-tour-next]')!.setAttribute('aria-disabled', String(i === stops.length - 1))
    api.goTo(stop.at, stop.look)
  }

  const close = () => {
    if (!box) return
    box.remove()
    box = null
    delete api.root.dataset.tourStop
    button.setAttribute('aria-expanded', 'false')
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
