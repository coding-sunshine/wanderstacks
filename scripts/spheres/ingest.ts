// bun scripts/spheres/ingest.ts : reads sources.json, pulls Commons / Panoramax originals into .cache/spheres,
// writes public/sphere/<lib>/<id>{,-lo}.webp and data/spheres.json. Re-running only fills what is missing.
import { existsSync, mkdirSync } from "node:fs";
import { API, FREE, ROOT, UA, isEqui, sleep, type Link, type Node } from "./common";

type Src = { id: string; kind: "interior" | "exterior"; cap?: string; yaw0?: number; links?: Link[]; commons?: string; panoramax?: string };
const sources: Record<string, Src[]> = await Bun.file(`${ROOT}scripts/spheres/sources.json`).json();
const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#0?39;/g, "'").replace(/\s+/g, " ").trim();

async function getJson(url: string): Promise<any> {
  for (let i = 0; i < 6; i++) {
    await sleep(1500);
    const p = Bun.spawn(["curl", "-fsSL", "-A", UA["User-Agent"], url], { stdout: "pipe", stderr: "ignore" });
    const t = await new Response(p.stdout).text();
    if ((await p.exited) === 0) return JSON.parse(t);
    await sleep(10000 * (i + 1));
  }
  throw new Error("fetch failed " + url);
}
// curl, not fetch: upload.wikimedia.org 429s Bun's fetch but serves curl with the same UA
async function download(url: string, to: string) {
  if (existsSync(to) && Bun.file(to).size > 0) return;
  for (let i = 0; i < 6; i++) {
    const p = Bun.spawn(["curl", "-fsSL", "-A", UA["User-Agent"], "-o", to, url.split("?")[0]], { stdout: "ignore", stderr: "ignore" });
    if ((await p.exited) === 0) { await sleep(2000); return; }
    await sleep(10000 * (i + 1));
  }
  throw new Error("download failed " + url);
}
async function run(cmd: string[]) {
  const p = Bun.spawn(cmd, { stdout: "ignore", stderr: "pipe" });
  if ((await p.exited) !== 0) throw new Error(cmd.join(" ") + "\n" + (await new Response(p.stderr).text()));
}

type Meta = { url: string; w: number; h: number; lic: string; by: string; src: string };
async function commonsMeta(title: string): Promise<Meta | null> {
  const j = await getJson(`${API}?${new URLSearchParams({ format: "json", action: "query", prop: "imageinfo", iiprop: "size|url|extmetadata", titles: title })}`);
  const p: any = Object.values(j.query.pages)[0];
  const ii = p.imageinfo?.[0];
  if (!ii) return null;
  const x = ii.extmetadata ?? {};
  return { url: ii.url, w: ii.width, h: ii.height, lic: x.LicenseShortName?.value ?? "", by: strip(x.Artist?.value ?? ""), src: ii.descriptionurl };
}
async function panoramaxMeta(id: string): Promise<Meta | null> {
  const ft = (await getJson(`https://api.panoramax.xyz/api/search?ids=${id}`)).features?.[0];
  if (!ft) return null;
  const p = ft.properties;
  const lic = p.license === "CC-BY-SA-4.0" ? "CC BY-SA 4.0" : p.license === "CC0-1.0" ? "CC0" : p.license;
  return { url: ft.assets.hd.href, w: 0, h: 0, lic, by: p["geovisio:producer"] ?? "", src: `https://api.panoramax.xyz/#focus=pic&pic=${ft.id}` };
}

const old = existsSync(`${ROOT}data/spheres.json`) ? await Bun.file(`${ROOT}data/spheres.json`).json() : {};
const out: Record<string, { nodes: Node[] }> = {};
const rejected: string[] = [];
for (const [lib, list] of Object.entries(sources)) {
  const nodes: Node[] = [];
  const dir = `${ROOT}public/sphere/${lib}`;
  const cache = `${ROOT}.cache/spheres/${lib}`;
  mkdirSync(dir, { recursive: true }); mkdirSync(cache, { recursive: true });
  for (const s of list) {
    const ref = s.commons ?? s.panoramax!;
    const m = await (s.commons ? commonsMeta(s.commons) : panoramaxMeta(s.panoramax!));
    if (!m) { rejected.push(`${lib}/${s.id} ${ref}: not found`); continue; }
    if (!FREE.test(m.lic)) { rejected.push(`${lib}/${s.id} ${ref}: licence "${m.lic}"`); continue; }
    if (!m.by) { rejected.push(`${lib}/${s.id} ${ref}: no author`); continue; }
    const orig = `${cache}/${s.id}.${(m.url.split(".").pop() ?? "jpg").toLowerCase()}`;
    const hi = `${dir}/${s.id}.webp`, lo = `${dir}/${s.id}-lo.webp`;
    await download(m.url, orig);
    const dim = (await Bun.$`magick identify -format "%w %h" ${orig}[0]`.text()).trim().split(" ").map(Number);
    const [w0, h0] = dim;
    if (!isEqui(w0, h0)) { rejected.push(`${lib}/${s.id} ${ref}: ${w0}x${h0} not 2:1`); continue; }
    const w = Math.min(w0, 8192), h = w / 2;
    const prev = old[lib]?.nodes?.find((n: Node) => n.id === s.id);
    if (!(existsSync(hi) && existsSync(lo) && prev?.w === w)) {
      await run(["cwebp", "-quiet", "-q", "78", "-m", "6", "-resize", String(w), String(h), orig, "-o", hi]);
      await run(["cwebp", "-quiet", "-q", "75", "-resize", "2048", "1024", orig, "-o", lo]);
    }
    const n: Node = { id: s.id, f: `/sphere/${lib}/${s.id}`, w, h, kind: s.kind, real: true, cap: s.cap ?? ref.replace(/^File:/, "").replace(/\.[a-z]+$/i, "").replace(/_/g, " "), by: m.by, lic: m.lic, src: m.src };
    if (s.yaw0 !== undefined) n.yaw0 = s.yaw0;
    if (s.links?.length) n.links = s.links;
    nodes.push(n);
    console.log("ok", lib, s.id, `${w}x${h}`, m.lic);
  }
  if (nodes.length) out[lib] = { nodes };
}
await Bun.write(`${ROOT}data/spheres.json`, JSON.stringify(out, null, 1) + "\n");
if (rejected.length) console.log("REJECTED\n" + rejected.join("\n"));
console.log(`libraries ${Object.keys(out).length}, nodes ${Object.values(out).reduce((a, l) => a + l.nodes.length, 0)}`);
