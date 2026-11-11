import { readFileSync, readdirSync, existsSync } from 'node:fs'
const dist = process.env.DIST || 'dist'
const fail = (m: string): never => { console.error(`f03 FAIL: ${m}`); process.exit(1) }
const f = `${dist}/libraries/weimar/index.html`
if (!existsSync(f)) fail(`${f} missing`)
const html = readFileSync(f, 'utf8')
for (const need of ['data-step="-1"', 'data-step="1"', 'class="route"', 'class="hint"', 'class="seen mark"', 'class="say"'])
  if (!html.includes(need)) fail(`weimar page lacks ${need}`)
const js = readdirSync(`${dist}/_astro`).filter((n) => n.startsWith('Walk.astro_astro_type_script') && n.endsWith('.js'))
if (!js.length) fail('no walk client bundle in _astro')
const src = readFileSync(`${dist}/_astro/${js[0]}`, 'utf8')
for (const need of ['wl:walk:', 'localStorage', 'speechSynthesis'])
  if (!src.includes(need)) fail(`walk bundle lacks ${need}`)
if (!/try\s*\{[^}]*localStorage/.test(src)) fail('localStorage access not in try/catch')
const hs = JSON.parse(readFileSync('data/hotspots.json', 'utf8'))
for (const [lib, v] of Object.entries<any>(hs)) if (v.route) {
  const page = readFileSync(`${dist}/libraries/${lib}/index.html`, 'utf8')
  for (const id of v.route) if (!page.includes(`data-go="${id}"`)) fail(`${lib} route node ${id} not a stop`)
}
console.log('f03 PASS: route, step buttons, hint, visited marks, read-aloud and guarded localStorage present in built output')
