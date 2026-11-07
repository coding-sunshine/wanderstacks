// Renders the live globe at the start state into public/globe/poster.webp. Needs `vite preview` running; see PORT.
import { chromium } from '@playwright/test'

const url = `http://localhost:${process.env.PORT ?? 4173}/`
const out = new URL('../../.cache/globe/poster.png', import.meta.url).pathname
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, reducedMotion: 'reduce' })
await page.goto(url)
await page.waitForSelector('[data-ready=true]')
await page.addStyleTag({ content: 'html,body{background:transparent!important}#poster,.bar,.globe-hud{display:none!important}' })
await page.waitForTimeout(500)
await page.screenshot({ path: out, omitBackground: true })
await browser.close()
const proc = Bun.spawn(['cwebp', '-q', '55', '-alpha_q', '60', '-m', '6', out, '-o', new URL('../../public/globe/poster.webp', import.meta.url).pathname])
await proc.exited
