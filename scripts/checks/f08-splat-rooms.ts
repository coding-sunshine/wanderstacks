import { existsSync, readFileSync, statSync } from 'node:fs'

const fail = (m: string): never => (console.error(m), process.exit(1))
const splats = JSON.parse(readFileSync('data/splats.json', 'utf8')) as Record<string, Record<string, any>>
const libs = new Set((JSON.parse(readFileSync('data/libs.json', 'utf8')) as { id: string }[]).map((l) => l.id))
const code = readFileSync('src/room/splat.ts', 'utf8')
if (/^import .*@sparkjsdev\/spark/m.test(code) || !code.includes("import('@sparkjsdev/spark')")) fail('splat.ts must load Spark by dynamic import only')

const ids = Object.keys(splats)
if (!ids.length) fail('no splat capture found for any library')
for (const id of ids) {
  const e = splats[id]!
  if (!libs.has(id)) fail(`${id}: not a library in data/libs.json`)
  for (const k of ['f', 'by', 'lic', 'src']) if (!e[k]) fail(`${id}: missing ${k}`)
  if (!/^https?:\/\//.test(e.src)) fail(`${id}: src is not a URL`)
  const file = `public/splat/${e.f}`
  if (!existsSync(file)) fail(`${id}: ${file} missing`)
  if (statSync(file).size !== e.bytes) fail(`${id}: bytes ${e.bytes} does not match file`)
  if (!e.align?.position || !e.align?.rotation || !(e.align.scale > 0)) fail(`${id}: bad align`)
}
console.log(`ok: ${ids.length} splat capture(s): ${ids.join(', ')}`)
