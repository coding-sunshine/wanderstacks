import { readdirSync, readFileSync } from 'node:fs'

const dist = process.env.DIST ?? 'dist'
const fail = (m: string): never => (console.error(m), process.exit(1))
const all = readdirSync(`${dist}/_astro`).filter((f) => f.endsWith('.js')).map((f) => readFileSync(`${dist}/_astro/${f}`, 'utf8'))
const room = all.find((s) => s.includes('createConvolver')) ?? fail('no built chunk creates a ConvolverNode')
if ((room.match(/createConvolver/g) ?? []).length !== 1) fail('more than one convolver in the room audio')
if (!room.includes('room-convolver') || !room.includes('neural-dry')) fail('tour does not route narration to the room convolver or label the dry path')
console.log(`one convolver; neural narration routed into it when Sound is on, labelled dry otherwise (${dist})`)
