import acoustics from '../../data/acoustics.json'
import irTable from '../../data/ir.json'
import { hash, type RoomApi } from './kit'
import { pickIr } from './ir'
import { addParamRow } from './panel'

const alphas: Record<string, { alpha: number }> = acoustics.materials

/** Where narration can be fed into the room: the same context and convolver the room tone uses. Null while Sound is off. */
export type RoomBus = { ctx: AudioContext; input: AudioNode }
let bus: RoomBus | null = null
export const roomBus = () => bus

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
  const measured = pickIr(irTable as never, api.lib.id)
  const irRow = measured && addParamRow(api.panel, 'ir', 'Impulse response', 'measured', `${measured.by}, ${measured.lic}, ${measured.src}`)
  const irLabel = irRow?.previousElementSibling
  api.root.dataset.irMode = measured ? 'measured' : 'estimated'
  let convolver: ConvolverNode | null = null
  let measuredBuffer: AudioBuffer | null = null
  let estimatedBuffer: AudioBuffer | null = null
  let irButton: HTMLButtonElement | null = null

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

  const loadMeasured = async (c: AudioContext) => {
    if (!measured) return null
    if (measuredBuffer) return measuredBuffer
    const response = await fetch(`/ir/${measured.f}`)
    if (!response.ok) throw new Error(String(response.status))
    measuredBuffer = await c.decodeAudioData(await response.arrayBuffer())
    api.root.dataset.irLoaded = measured.f
    return measuredBuffer
  }

  const build = (c: AudioContext) => {
    const conv = c.createConvolver()
    convolver = conv
    estimatedBuffer = impulse(c)
    conv.buffer = estimatedBuffer
    // The real recording replaces the estimate once decoded, unless the visitor chose the estimate.
    if (measured)
      void loadMeasured(c)
        .then((buffer) => {
          if (buffer && api.root.dataset.irMode !== 'estimated') conv.buffer = buffer
        })
        .catch(() => {})
    const out = c.createGain()
    out.gain.value = 0.25
    conv.connect(out).connect(c.destination)
    // Narration entry: a dry path to the speakers plus a send into the convolver (its output is wet only).
    const input = c.createGain()
    const dry = c.createGain()
    const send = c.createGain()
    send.gain.value = 3
    input.connect(dry).connect(c.destination)
    input.connect(send).connect(conv)
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
    return { input, play: () => {
      const src = c.createBufferSource()
      src.buffer = tone
      src.loop = true
      src.connect(lp)
      src.start()
      return src
    } }
  }

  let play!: () => AudioBufferSourceNode
  let input!: AudioNode
  let src: AudioBufferSourceNode | null = null
  const start = () => {
    if (!ctx) ({ play, input } = build((ctx = new AudioContext())))
    ctx.resume().catch(() => {})
    src = play()
    bus = { ctx, input }
  }

  const stop = () => {
    src?.stop()
    src = null
    bus = null
    ctx?.suspend().catch(() => {})
  }

  if (measured) {
    irButton = document.createElement('button')
    irButton.type = 'button'
    irButton.dataset.action = 'listening-point'
    irButton.setAttribute('aria-pressed', 'true')
    irButton.textContent = 'Position 4, measured'
    api.controls.append(irButton)
    irButton.onclick = async () => {
      const estimate = api.root.dataset.irMode !== 'estimated'
      api.root.dataset.irMode = estimate ? 'estimated' : 'measured'
      irButton!.setAttribute('aria-pressed', String(!estimate))
      irButton!.textContent = estimate ? 'Sabine estimate' : 'Position 4, measured'
      if (ctx && !estimate) await loadMeasured(ctx).catch(() => null)
      if (convolver) convolver.buffer = estimate ? estimatedBuffer : measuredBuffer ?? estimatedBuffer
    }
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
    irButton?.remove()
    row.remove()
    label?.remove()
    irRow?.remove()
    irLabel?.remove()
    delete api.root.dataset.rt60
    delete api.root.dataset.irLoaded
    delete api.root.dataset.irMode
    delete api.root.dataset.acoustics
  }
}
