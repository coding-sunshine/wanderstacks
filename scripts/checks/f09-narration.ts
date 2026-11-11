import { readdirSync, readFileSync } from 'node:fs'

const dist = process.env.DIST ?? 'dist'
const fail = (m: string): never => (console.error(m), process.exit(1))
const js = readdirSync(`${dist}/_astro`).filter((f) => f.endsWith('.js'))
const read = (f: string) => readFileSync(`${dist}/_astro/${f}`, 'utf8')
const room = js.find((f) => read(f).includes('data-tour-listen')) ?? fail('no built chunk has the Listen control')
const src = read(room)
const consent = src.indexOf('huggingface.co')
if (consent < 0 || !src.includes('Hugging Face CDN') || !src.includes('Nothing you type or say is sent')) fail('consent text naming the Hugging Face CDN is missing from the tour')
if (!src.includes('speak(') && !/speechSynthesis/.test(read(js.find((f) => read(f).includes('SpeechSynthesisUtterance')) ?? fail('no browser speech path built'))))
  fail('browser speech path missing')
const kokoro = js.find((f) => /KokoroTTS/.test(read(f)) && read(f).length > 1e6) ?? fail('no separate kokoro chunk')
if (src.includes('KokoroTTS')) fail('kokoro is bundled into the room entry instead of a dynamic import')
if (!js.some((f) => /import\(["'`]\.\/kokoro\./.test(read(f)))) fail('no dynamic import() of the kokoro chunk')
if (!js.some((f) => read(f).includes('wl-voice'))) fail('consent is not persisted in localStorage')
console.log(`Listen, consent text, speech fallback, lazy ${kokoro} chunk present in ${dist}`)
