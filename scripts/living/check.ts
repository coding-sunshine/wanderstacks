import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const CACHE = '.cache/living'

const ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', mdash: '-', ndash: '-' }

export function normalise(s: string): string {
  return s
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m)
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[‐-―]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

async function page(url: string): Promise<string> {
  mkdirSync(CACHE, { recursive: true })
  const f = `${CACHE}/${createHash('sha1').update(url).digest('hex').slice(0, 16)}.html`
  if (existsSync(f)) return readFileSync(f, 'utf8')
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' } })
  if (!r.ok) throw new Error(`${url} ${r.status}`)
  const t = await r.text()
  writeFileSync(f, t)
  return t
}

if (import.meta.main) {
  let bad = false
  for (const file of process.argv.slice(2)) {
    try {
      const { statement, source } = JSON.parse(readFileSync(file, 'utf8'))
      if (!statement || !source || !normalise(await page(source)).includes(normalise(statement))) throw new Error('mismatch')
    } catch {
      console.log(`not-verbatim ${file}`)
      bad = true
    }
  }
  process.exit(bad ? 1 : 0)
}
