import * as THREE from 'three'
import type { RoomApi } from './kit'
import { hush, loadNeural, neuralConsented, neuralLoaded, NEURAL, setNeural, speak, speakNeural } from '../narrate'
import { roomBus } from './sound'
import { storyBeats } from './story'

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

  // The same beats the scroll story tells: the era line anchors each stop in the years.
  const beats = storyBeats(api.lib as Parameters<typeof storyBeats>[0])

  let box: HTMLElement | null = null
  let at = 0

  const root = () => box!
  const say = (sel: string, text: string) => (root().querySelector(sel)!.textContent = text)
  const listenBtn = () => root().querySelector<HTMLElement>('[data-tour-listen]')!
  const betterBtn = () => root().querySelector<HTMLElement>('[data-tour-voice]')!
  const consentBox = () => root().querySelector<HTMLElement>('[data-voice-consent]')!
  const stopListening = () => {
    hush()
    if (!box) return
    listenBtn().setAttribute('aria-pressed', 'false')
  }
  const syncVoice = () => {
    betterBtn().setAttribute('aria-pressed', String(neuralConsented()))
    say('[data-voice-status]', neuralConsented() ? 'Voice: better voice on' : 'Voice: browser speech')
  }

  // Browser speech cannot enter Web Audio, so only the neural voice is heard in the room's reverb. The status line says which.
  const listen = async () => {
    const btn = listenBtn()
    if (btn.getAttribute('aria-pressed') === 'true') return stopListening()
    btn.setAttribute('aria-pressed', 'true')
    const text = root().querySelector('[data-caption]')!.textContent!
    const done = () => btn.setAttribute('aria-pressed', 'false')
    const browser = (note: string) => {
      api.root.dataset.narrationRoute = 'speech'
      say('[data-voice-status]', note)
      speak(text, 'en', done)
    }
    if (!neuralConsented()) return browser('Browser speech, heard dry')
    try {
      if (!neuralLoaded()) say('[data-voice-status]', 'Loading the better voice...')
      await loadNeural((p) => say('[data-voice-status]', `Downloading the better voice, ${p}%`))
      const bus = roomBus()
      api.root.dataset.narrationRoute = bus ? 'room-convolver' : 'neural-dry'
      say('[data-voice-status]', bus ? "Better voice, heard in the room's reverb" : 'Better voice, heard dry (turn Sound on for the room reverb)')
      await speakNeural(text, bus ?? undefined)
      done()
    } catch {
      browser('Better voice failed, using browser speech, heard dry')
    }
  }

  const betterVoice = () => {
    if (neuralConsented()) {
      setNeural(false)
      stopListening()
      return syncVoice()
    }
    consentBox().hidden = false
    consentBox().querySelector<HTMLElement>('button')!.focus()
  }

  const accept = async () => {
    consentBox().hidden = true
    setNeural(true)
    syncVoice()
    try {
      await loadNeural((p) => say('[data-voice-status]', `Downloading the better voice, ${p}%`))
      say('[data-voice-status]', 'Better voice ready')
    } catch {
      setNeural(false)
      syncVoice()
      say('[data-voice-status]', 'Better voice failed to load, using browser speech')
    }
  }

  const show = (i: number) => {
    at = i
    const stop = stops[i]
    const fact = api.lib.facts[stop.fact]
    api.root.dataset.tourStop = String(i)
    stopListening()
    const beat = beats[i]
    const era = box!.querySelector('[data-era]')! as HTMLElement
    if (beat) {
      era.hidden = false
      era.textContent = beat.year === '·' ? (i ? 'Undated' : `${api.lib.name}: the story`) : beat.year === 'Now' ? 'Now' : `${beat.year}, in the years`
    } else era.hidden = true
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
    hush()
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
    const era = el('p', { 'data-era': '', style: 'margin:0 0 0.35rem;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--gilt)' })
    const listenB = el('button', { type: 'button', 'data-tour-listen': '', 'aria-pressed': 'false', style: BTN }, 'Listen')
    const betterB = el('button', { type: 'button', 'data-tour-voice': '', 'aria-pressed': 'false', style: BTN }, 'Better voice')
    const status = el('span', { 'data-voice-status': '', 'aria-live': 'polite', style: 'font-size:12px;opacity:0.8' })
    const yes = el('button', { type: 'button', 'data-voice-yes': '', style: BTN }, `Download ${NEURAL.mb} MB`)
    const no = el('button', { type: 'button', 'data-voice-no': '', style: BTN }, 'Not now')
    const consent = el('p', { 'data-voice-consent': '', hidden: '', style: 'margin:0.5rem 0 0;font-size:13px;display:flex;flex-wrap:wrap;gap:0.4rem;align-items:center' },
      `The better voice runs in your browser. It downloads about ${NEURAL.mb} MB: 93 MB of model weights from the Hugging Face CDN (huggingface.co) and a 3 MB speech runtime from jsDelivr. Nothing you type or say is sent. Browser speech downloads nothing.`)
    consent.append(yes, no)
    row.append(listenB, betterB)
    box = el('section', { id: 'room-tour', 'data-tour': '', 'aria-label': 'Guided tour', style: BOX })
    box.append(era, el('p', { 'data-caption': '', 'aria-live': 'polite', style: 'margin:0' }), row, status, consent)
    api.controls.after(box)
    button.setAttribute('aria-expanded', 'true')
    button.setAttribute('aria-controls', 'room-tour')
    prev.onclick = () => at > 0 && show(at - 1)
    next.onclick = () => at < stops.length - 1 && show(at + 1)
    x.onclick = close
    listenB.onclick = listen
    betterB.onclick = betterVoice
    yes.onclick = accept
    no.onclick = () => {
      consent.hidden = true
      betterB.focus()
    }
    syncVoice()
    show(0)
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && box) close()
  }
  button.onclick = () => (box ? close() : open())
  addEventListener('keydown', onKey)

  return () => {
    removeEventListener('keydown', onKey)
    hush()
    box?.remove()
    box = null
    delete api.root.dataset.tourStop
    button.remove()
  }
}
