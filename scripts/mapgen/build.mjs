const [out] = process.argv.slice(2);
const t = await Bun.file("plan.template.html").text(), m = await Bun.file("map.json").text(), v = await Bun.file("ver.json").text();
const html = t.replace("/*__MAP__*/null", () => m).replace("/*__VER__*/null", () => v);
await Bun.write(out, html);
await Bun.write(out.replace(/[^/]+$/, "preview.html"), `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${html}</body></html>`);
