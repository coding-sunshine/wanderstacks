import acoustics from '../../data/acoustics.json'
import { hash, type RoomApi } from './kit'
import { addParamRow } from './panel'

const alphas: Record<string, { alpha: number }> = acoustics.materials

export function attach(api: RoomApi): () => void {
  const { volume, surfaces } = api.acoustics
  const absorption = surfaces.reduce((sum, s) => {
    const m = alphas[s.material]
    if (!m) throw new Error(`No absorption coefficient for ${s.material}`)
    return sum + m.alpha * s.area
  }, 0)
  if (!(volume > 0 && absorption > 0)) return () => {}

  const rt60 = Number(((0.161 * volume) / absorption).toFixed(3)) // Sabine
  api.root.dataset.rt60 = String(rt60)
  api.root.dataset.acoustics = JSON.stringify({ volume: Number(volume.toFixed(2)), absorption: Number(absorption.toFixed(3)) })
  const row = addParamRow(api.panel, 'rt60', 'Reverberation (RT60)', `${rt60.toFixed(1)} s`, 'estimated')
  const label = row.previousElementSibling

  const button = document.createElement('button')
  button.type = 'button'
  button.dataset.action = 'sound'
  button.setAttribute('aria-pressed', 'false')
  button.textContent = 'Sound'
  api.controls.append(button)

  // One context for the visit: Off suspends it, so a second On reuses the same convolver.
  let ctx: AudioContext | null = null

  // Noise whose amplitude falls 60 dB over rt60 seconds, so the tail matches the Sabine figure.
  const impulse = (c: AudioContext) => {
    const n = Math.ceil(rt60 * c.sampleRate)
    const buf = c.createBuffer(2, n, c.sampleRate)
    let seed = hash(`${api.lib.id}-ir`)
    const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296) * 2 - 1
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch)
      for (let i = 0; i < n; i++) d[i] = rnd() * 10 ** ((-3 * i) / n)
    }
    return buf
  }

  const build = (c: AudioContext) => {
    const conv = c.createConvolver()
    conv.buffer = impulse(c)
    const out = c.createGain()
    out.gain.value = 0.25
    conv.connect(out).connect(c.destination)
    // Looping room tone: two seconds of seeded noise, low-passed, fed to the convolver.
    const n = 2 * c.sampleRate
    const tone = c.createBuffer(1, n, c.sampleRate)
    const d = tone.getChannelData(0)
    let seed = hash(`${api.lib.id}-tone`)
    for (let i = 0; i < n; i++) d[i] = ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296) * 2 - 1
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 500
    const g = c.createGain()
    g.gain.value = 0.08
    lp.connect(g).connect(conv)
    return () => {
      const src = c.createBufferSource()
      src.buffer = tone
      src.loop = true
      src.connect(lp)
      src.start()
      return src
    }
  }

  let play!: () => AudioBufferSourceNode
  let src: AudioBufferSourceNode | null = null
  const start = () => {
    if (!ctx) play = build((ctx = new AudioContext()))
    ctx.resume().catch(() => {})
    src = play()
  }

  const stop = () => {
    src?.stop()
    src = null
    ctx?.suspend().catch(() => {})
  }

  button.onclick = () => {
    const on = button.getAttribute('aria-pressed') !== 'true'
    button.setAttribute('aria-pressed', String(on))
    on ? start() : stop()
  }

  return () => {
    stop()
    ctx?.close().catch(() => {})
    ctx = null
    button.remove()
    row.remove()
    label?.remove()
    delete api.root.dataset.rt60
    delete api.root.dataset.acoustics
  }
}
