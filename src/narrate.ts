// Spoken narration. Browser speech by default; nothing leaves the device.
// The neural voice (kokoro-js) is opt-in, loaded on demand, and the only path that can be routed through Web Audio.
export const canSpeak = () => typeof speechSynthesis !== 'undefined'
export function speak(text: string, lang = 'en', onend?: () => void) {
  if (!canSpeak()) return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  if (onend) u.onend = u.onerror = onend
  speechSynthesis.speak(u)
}

export const NEURAL = {
  id: 'onnx-community/Kokoro-82M-v1.0-ONNX',
  voice: 'af_heart' as const,
  // Measured in Chrome: 95,948,880 bytes over the wire (92.4 MB model, 0.5 MB voice, 3.0 MB wasm runtime from jsDelivr).
  mb: 96,
}

const KEY = 'wl-voice'
export const neuralConsented = () => {
  try {
    return localStorage.getItem(KEY) === 'neural'
  } catch {
    return false
  }
}
export const setNeural = (on: boolean) => {
  try {
    on ? localStorage.setItem(KEY, 'neural') : localStorage.removeItem(KEY)
  } catch {}
}

type Tts = { generate(t: string, o: { voice: typeof NEURAL.voice }): Promise<{ audio: Float32Array<ArrayBuffer>; sampling_rate: number }> }
let tts: Promise<Tts> | null = null
export const neuralLoaded = () => tts !== null

/** Downloads the weights on first call (dynamic import, so nothing ships to visitors who never opt in). */
export function loadNeural(onProgress?: (pct: number) => void) {
  tts ??= import('kokoro-js')
    .then(({ KokoroTTS }) =>
      KokoroTTS.from_pretrained(NEURAL.id, {
        dtype: 'q8',
        device: 'wasm',
        progress_callback: (p: { status?: string; loaded?: number; total?: number }) => {
          if (p.status === 'progress' && p.total) onProgress?.(Math.round(((p.loaded ?? 0) / p.total) * 100))
        },
      }),
    )
    .catch((e) => {
      tts = null
      throw e
    }) as Promise<Tts>
  return tts
}

let dryCtx: AudioContext | null = null
let playing: AudioBufferSourceNode | null = null
let turn = 0

/**
 * Speak with the neural voice. With `dest` the audio enters that node (the room's convolver send); without it, it plays dry.
 * Resolves when playback ends or is hushed.
 */
export async function speakNeural(text: string, dest?: { ctx: AudioContext; input: AudioNode }) {
  hush()
  const mine = turn
  const { audio, sampling_rate } = await (await loadNeural()).generate(text, { voice: NEURAL.voice })
  if (turn !== mine) return // hushed while the voice was still synthesising
  const ctx = dest?.ctx ?? (dryCtx ??= new AudioContext())
  await ctx.resume()
  const buf = ctx.createBuffer(1, audio.length, sampling_rate)
  buf.copyToChannel(audio, 0)
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.connect(dest?.input ?? ctx.destination)
  playing = src
  await new Promise<void>((done) => {
    src.onended = () => done()
    src.start()
  })
  if (playing === src) playing = null
}

export const hush = () => {
  turn++
  if (canSpeak()) speechSynthesis.cancel()
  const p = playing
  playing = null
  p?.stop()
}
