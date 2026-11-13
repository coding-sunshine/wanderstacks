// Names the service worker's runtime cache after the commit, so every deploy changes sw.js,
// the browser installs it, and activate drops cached book parts and chunks from the old build.
const sha = process.env.CF_PAGES_COMMIT_SHA ?? Bun.spawnSync(['git', 'rev-parse', 'HEAD']).stdout.toString().trim()
const f = Bun.file('dist/sw.js')
const src = await f.text()
if (!src.includes("'wl-v4'")) throw new Error("dist/sw.js no longer names its cache 'wl-v4'; update scripts/stamp-sw.ts")
await Bun.write(f, src.replace("'wl-v4'", `'wl-${sha.slice(0, 12)}'`))
console.log(`sw: cache wl-${sha.slice(0, 12)}`)
