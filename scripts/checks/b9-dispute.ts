// Every fact chunk links to a pre-filled new GitHub issue with the claim, source, tier and anchor URL.
import { readFileSync } from 'node:fs'
const dist = process.env.DIST ?? 'dist'
const fail = (m: string): never => { console.error('FAIL b9-dispute: ' + m); process.exit(1) }
let n = 0
for (const id of ['longroom', 'alexandria', 'loc']) {
  const h = readFileSync(`${dist}/libraries/${id}/index.html`, 'utf8')
  for (const [, fid, body] of h.matchAll(/<li class="fact" id="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g)) {
    const m = body.match(/<a href="(https:\/\/github\.com\/coding-sunshine\/worldlibs\/issues\/new\?[^"]+)" rel="noopener"/)
    if (!m) fail(`${id}#${fid}: no dispute link`)
    const u = new URL(m![1].replace(/&#38;|&amp;/g, '&'))
    const b = u.searchParams.get('body') ?? ''
    if (!u.searchParams.get('title') || !b.includes('Claim:') || !b.includes('Current source:') || !b.includes('Evidence tier:') || !b.includes(`/libraries/${id}/#${fid}`)) fail(`${id}#${fid}: issue body incomplete`)
    if (/[ \n]/.test(m![1])) fail(`${id}#${fid}: URL not encoded`)
    n++
  }
}
console.log(`ok b9-dispute: ${n} dispute links on 3 pages`)
