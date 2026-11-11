import { existsSync, statSync } from 'node:fs'
import { pickIr } from '../../src/room/ir'
import ir from '../../data/ir.json'
import libs from '../../data/libs.json'

const fail = (m: string): never => (console.error(m), process.exit(1))
const ids = Object.keys(ir).filter((id) => pickIr(ir as never, id))
if (!ids.length) fail('no measured impulse response found for any library')
for (const id of ids) {
  const e = (ir as Record<string, { f: string }>)[id]!
  if (!libs.some((l) => l.id === id)) fail(`ir.json names unknown library ${id}`)
  if (!existsSync(`public/ir/${e.f}`) || statSync(`public/ir/${e.f}`).size < 1000) fail(`public/ir/${e.f} missing or empty for ${id}`)
}
console.log(`measured impulse responses: ${ids.join(', ')}`)
