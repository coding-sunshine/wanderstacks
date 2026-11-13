// Every shipped page names itself: sitemap, robots, a real title, canonical and share image on static and client-rendered pages.
import { existsSync, readFileSync } from 'node:fs'
const dist = process.env.DIST ?? 'dist'
const fail = (m: string): never => { console.error('FAIL seo: ' + m); process.exit(1) }
const read = (f: string) => { if (!existsSync(`${dist}/${f}`)) fail(`${f} missing`); return readFileSync(`${dist}/${f}`, 'utf8') }
const map = read('sitemap.xml'), n = map.match(/<loc>/g)?.length ?? 0
if (n < 1000 || map.includes('/404')) fail(`sitemap has ${n} urls or lists the 404`)
if (!read('robots.txt').includes('Sitemap: https://worldlibs.pages.dev/sitemap.xml')) fail('robots.txt lacks sitemap')
for (const page of ['index.html', 'atlas/index.html', 'room/admont/index.html', 'read/gita/index.html', 'libraries/admont/index.html']) {
  const h = read(page)
  const title = h.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''
  if (page !== 'index.html' && !title.includes(' | WorldLibs')) fail(`${page}: generic title "${title}"`)
  for (const tag of ['rel="canonical"', 'property="og:image"', 'name="description"']) if (!h.includes(tag)) fail(`${page}: no ${tag}`)
}
if (!existsSync('public/og.jpg')) fail('public/og.jpg missing')
console.log(`ok seo: ${n} sitemap urls, titles, canonical and og:image on static and client-rendered pages`)
