import { existsSync, readFileSync, statSync } from 'node:fs'

const fail = (message: string): never => (console.error(message), process.exit(1))
const captures = JSON.parse(readFileSync('data/captures.json', 'utf8')) as Record<string, any>[]
const libs = new Set((JSON.parse(readFileSync('data/libs.json', 'utf8')) as { id: string }[]).map((l) => l.id))
const ready = captures.filter((c) => c.status === 'ready')
if (!ready.length) fail('no optimized captured mesh is ready')
for (const c of ready) {
  if (!libs.has(c.lib)) fail(`${c.id}: unknown library ${c.lib}`)
  for (const key of ['f', 'by', 'lic', 'src']) if (!c[key]) fail(`${c.id}: missing ${key}`)
  if (!/^https?:\/\//.test(c.src)) fail(`${c.id}: invalid source`)
  if (c.kind !== 'mesh' || c.scope !== 'interior') fail(`${c.id}: not an interior mesh`)
  const file = `public/rooms/${c.lib}/${c.f}`
  if (!existsSync(file)) fail(`${c.id}: ${file} missing`)
  if (statSync(file).size !== c.bytes) fail(`${c.id}: byte count differs from ${file}`)
  if (statSync(file).size > 25 * 1024 * 1024) fail(`${c.id}: exceeds Cloudflare Pages file limit`)
  if (!c.align || c.align.position.length !== 3 || c.align.rotation.length !== 3 || !(c.align.scale > 0)) fail(`${c.id}: invalid alignment`)
}
for (const file of ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js']) {
  if (!existsSync(`public/draco/gltf/${file}`)) fail(`Draco decoder missing: ${file}`)
}
console.log(`captured meshes: ${ready.map((c) => `${c.lib} (${c.bytes} bytes)`).join(', ')}`)
