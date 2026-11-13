// Lists every built page except the 404 and anything marked noindex, so the sitemap never drifts from dist.
const site = 'https://worldlibs.pages.dev'
const urls: string[] = []
for await (const f of new Bun.Glob('**/index.html').scan('dist')) {
  if (/<meta name="robots" content="[^"]*noindex/.test(await Bun.file(`dist/${f}`).text())) continue
  urls.push(`${site}/${f.replace(/index\.html$/, '')}`)
}
urls.sort()
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`
await Bun.write('dist/sitemap.xml', xml)
console.log(`sitemap: ${urls.length} urls`)
