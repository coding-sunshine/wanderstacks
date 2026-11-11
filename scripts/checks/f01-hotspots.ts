import { readFileSync, existsSync } from 'node:fs'
const dist = process.env.DIST || 'dist'
const fail = (m: string): never => { console.error(`f01 FAIL: ${m}`); process.exit(1) }
if (!existsSync('data/hotspots.json')) fail('data/hotspots.json missing')
const hs: Record<string, { nodes: Record<string, any[]> }> = JSON.parse(readFileSync('data/hotspots.json', 'utf8'))
const libs = Object.keys(hs)
if (libs.length < 3) fail(`only ${libs.length} libraries have hotspots, need 3`)
const tiers = ['primary', 'secondary', 'wikipedia', 'unproven']
let total = 0
for (const lib of libs) {
  const f = `${dist}/libraries/${lib}/index.html`
  if (!existsSync(f)) fail(`${f} missing`)
  const html = readFileSync(f, 'utf8')
  for (const [node, list] of Object.entries(hs[lib].nodes)) for (const h of list) {
    total++
    const at = `${lib}/${node}/${h.id}`
    if (!tiers.includes(h.tier)) fail(`${at} bad tier ${h.tier}`)
    if (!/^https?:\/\//.test(h.source)) fail(`${at} no source url`)
    if (Math.abs(h.pitch) > 85) fail(`${at} pitch ${h.pitch} beyond 85 degrees`)
    const m = html.match(new RegExp(`<li id="spot-${lib}-${node}-${h.id}"([^>]*)>([\\s\\S]*?)</li>`))
    if (!m) fail(`${at} not rendered as plain HTML in ${f}`)
    const [, attrs, body] = m!
    if (!attrs.includes(`data-yaw="${h.yaw}"`) || !attrs.includes(`data-pitch="${h.pitch}"`)) fail(`${at} yaw/pitch missing from markup`)
    if (!body.includes(`data-s="${h.tier}"`) || !body.includes(`href="${h.source.replace(/&/g, '&amp;')}"`)) fail(`${at} tier stamp or source link missing`)
  }
}
const js = readFileSync(`${dist}/libraries/${libs[0]}/index.html`, 'utf8')
if (!js.includes('Walk.astro_astro_type_script')) fail('walk client script not linked')
console.log(`f01 PASS: ${total} hotspots across ${libs.length} libraries (${libs.join(', ')}) rendered with tier, source, yaw, pitch`)
