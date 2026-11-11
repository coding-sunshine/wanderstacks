// bun scripts/spheres/check.ts : exits 1 if spheres.json is inconsistent with files on disk.
import { existsSync } from "node:fs";
import { FREE, ROOT, isEqui, type Node } from "./common";

const data: Record<string, { nodes: Node[] }> = await Bun.file(`${ROOT}data/spheres.json`).json();
const libs = new Set((await Bun.file(`${ROOT}data/libs.json`).json()).map((l: any) => l.id));
const bad: string[] = [];
let count = 0;
for (const [lib, { nodes }] of Object.entries(data)) {
  if (!libs.has(lib)) bad.push(`${lib}: unknown library`);
  const ids = new Set(nodes.map((n) => n.id));
  for (const n of nodes) {
    count++;
    const at = `${lib}/${n.id}`;
    for (const k of ["lic", "by", "src", "cap"] as const) if (!n[k]?.trim()) bad.push(`${at}: empty ${k}`);
    if (!FREE.test(n.lic)) bad.push(`${at}: licence ${n.lic}`);
    if (!isEqui(n.w, n.h)) bad.push(`${at}: ${n.w}x${n.h} not 2:1`);
    if (n.w > 8192) bad.push(`${at}: wider than 8192`);
    if (n.real !== true) bad.push(`${at}: real not true`);
    for (const [suffix, want] of [["", n.w], ["-lo", 2048]] as const) {
      const p = `${ROOT}public${n.f}${suffix}.webp`;
      if (!existsSync(p)) { bad.push(`${at}: missing ${p}`); continue; }
      const [w, h] = (await Bun.$`magick identify -format "%w %h" ${p}`.text()).split(" ").map(Number);
      if (w !== want || !isEqui(w, h)) bad.push(`${at}: ${p} is ${w}x${h}, want ${want} wide 2:1`);
    }
    for (const l of n.links ?? []) if (!ids.has(l.to) || l.to === n.id) bad.push(`${at}: link to missing node ${l.to}`);
  }
}
if (bad.length) { console.error(bad.join("\n")); process.exit(1); }
console.log(`ok: ${count} nodes in ${Object.keys(data).length} libraries`);
