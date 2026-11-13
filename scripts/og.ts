// Renders the share image public/og.jpg: the hall engraving printed on paper, the name, the line, and the library stamp.
// Run by hand after a brand change: bun scripts/og.ts [out.jpg]
import { chromium } from '@playwright/test'
import { hall, seal } from '../src/brand/marks'

const out = process.argv[2] ?? 'public/og.jpg'
const font = async (family: string, file: string, style = 'normal') =>
  `@font-face{font-family:'${family}';font-style:${style};src:url(data:font/woff2;base64,${Buffer.from(await Bun.file(`node_modules/@fontsource/${file}`).arrayBuffer()).toString('base64')})}`
const paper = '#ece5d3', ink = '#1f1810'

const html = `<!doctype html><meta charset="utf-8"><style>
${await font('Libre Caslon Display', 'libre-caslon-display/files/libre-caslon-display-latin-400-normal.woff2')}
${await font('EB Garamond', 'eb-garamond/files/eb-garamond-latin-400-italic.woff2', 'italic')}
html,body{margin:0}
.c{position:relative;width:1200px;height:630px;overflow:hidden;background:${paper}}
.plate{position:absolute;right:56px;top:28px;width:590px;height:590px}
.plate svg,.seal svg{display:block;width:100%;height:100%}
h1{position:absolute;left:84px;top:196px;margin:0;font:400 92px/1 'Libre Caslon Display';color:${ink};letter-spacing:-.01em}
p{position:absolute;left:88px;top:318px;margin:0;font:italic 400 36px/1.25 'EB Garamond';color:#9a7430}
.seal{position:absolute;left:400px;top:368px;width:250px;height:250px}
.grain{position:absolute;inset:0;mix-blend-mode:multiply;opacity:.35}
</style><div class="c">
<div class="plate">${hall('og', { ink, ground: paper, accent: '#9a7430' })}</div>
<h1>Wanderstacks</h1><p>Walk the world's great libraries,<br>standing and lost.</p>
<div class="seal">${seal('st', '#7b2d24')}</div>
<svg class="grain" width="1200" height="630"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .55 0 0 0 0 .5 0 0 0 0 .42 0 0 0 -1.4 1.1"/></filter><rect width="1200" height="630" filter="url(#g)"/></svg>
</div>`

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html)
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: out, type: 'jpeg', quality: 88 })
await browser.close()
console.log(`wrote ${out}`)
