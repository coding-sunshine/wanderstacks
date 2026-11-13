// Cloudflare Pages refuses a deployment over 20,000 files or with any file over 25 MiB. Fail the build first, with headroom.
import { statSync } from 'node:fs'
const dist = process.env.DIST ?? 'dist'
const MAX_FILES = 19_000, MAX_BYTES = 24 * 1024 * 1024
let n = 0, big = { f: '', size: 0 }
for await (const f of new Bun.Glob('**/*').scan({ cwd: dist, dot: true })) {
  n++
  const size = statSync(`${dist}/${f}`).size
  if (size > big.size) big = { f, size }
}
const mib = (b: number) => (b / 1024 / 1024).toFixed(1)
if (n > MAX_FILES) { console.error(`FAIL deploy-limits: ${n} files, budget ${MAX_FILES} (hard cap 20000)`); process.exit(1) }
if (big.size > MAX_BYTES) { console.error(`FAIL deploy-limits: ${big.f} is ${mib(big.size)} MiB, budget 24 (hard cap 25)`); process.exit(1) }
console.log(`ok deploy-limits: ${n} files, largest ${big.f} at ${mib(big.size)} MiB`)
