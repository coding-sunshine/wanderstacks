import { readFileSync, existsSync } from 'node:fs'
const dist = process.env.DIST || 'dist'
const fail = (m: string): never => { console.error(`f02 FAIL: ${m}`); process.exit(1) }
if (!existsSync('data/hotspots.json')) fail('data/hotspots.json missing')
const hs: Record<string, { nodes: Record<string, any[]> }> = JSON.parse(readFileSync('data/hotspots.json', 'utf8'))
const texts = Object.entries(hs).flatMap(([lib, v]) => Object.entries(v.nodes).flatMap(([node, l]) => l.filter((h) => h.kind === 'text').map((h) => ({ lib, node, h }))))
if (!texts.length) fail('no text hotspots shipped in data/hotspots.json')
for (const { lib, node, h } of texts) {
  const at = `${lib}/${node}/${h.id}`
  if (!h.text?.original || !h.text?.lang || !h.text?.translation) fail(`${at} text needs original, lang, translation`)
  const html = readFileSync(`${dist}/libraries/${lib}/index.html`, 'utf8')
  const m = html.match(new RegExp(`<li id="spot-${lib}-${node}-${h.id}"[^>]*data-kind="text"[^>]*>([\\s\\S]*?)</li>`))
  if (!m) fail(`${at} not rendered with data-kind="text"`)
  if (!m![1].includes(h.text.original) || !m![1].includes(h.text.translation)) fail(`${at} original/translation missing from markup`)
  if (!/class="ttoggle"[^>]*aria-pressed/.test(html)) fail(`${lib} page has no inscription toggle`)
}
console.log(`f02 PASS: ${texts.length} text hotspots with original, language, translation and a toggle`)
