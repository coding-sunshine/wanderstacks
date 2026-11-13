// Exits 0 only when a scroll book is built with its direction and a real image tile answers 200 cross-origin.
export {}
const dist = process.env.DIST ?? 'dist'
const fail = (m: string) => (console.error(`FAIL f05-scroll-viewer: ${m}`), process.exit(1))
const read = async (id: string) => {
  const f = Bun.file(`${dist}/scan/${id}/pages.json`)
  return (await f.exists()) ? f.json() : fail(`${dist}/scan/${id}/pages.json missing`)
}

const b = await read('diamond-sutra')
if (b.scroll !== true || b.dir !== 'right-to-left') fail(`scroll/dir wrong: ${b.scroll} ${b.dir}`)
if (!b.pages?.length || b.pages.some((p: any) => !/^https:\/\/.+\/iiif\/3\/\w+$/.test(p.s) || !p.w || !p.h)) fail('pages lack image services')
if ('scroll' in (await read('gigas'))) fail('codex book gigas must carry no scroll flag')

const p = b.pages[0]
const url = `${p.s}/0,0,${Math.min(512, p.w)},${Math.min(512, p.h)}/256,/0/default.jpg`
const r = await fetch(url, { headers: { origin: 'https://wanderstacks.example' } })
if (r.status !== 200) fail(`tile ${url} answered ${r.status}`)
if (!r.headers.get('access-control-allow-origin')) fail('tile has no CORS header')
console.log(`ok f05-scroll-viewer: ${b.pages.length} sections, ${b.dir}, tile 200 ${r.headers.get('content-type')}`)
