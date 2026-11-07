import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

const dir = join(import.meta.dir, 'steps')
for (const f of (await readdir(dir)).filter((f) => f.endsWith('.ts')).sort()) {
  const t = performance.now()
  await import(join(dir, f))
  console.log(`build: ${f} ${Math.round(performance.now() - t)} ms`)
}
