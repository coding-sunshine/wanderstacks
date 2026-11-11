// Exits non-zero if data/catalogue.ndjson has an unparseable line, a repeated id,
// an unknown lib, or a rights value outside open | nc | link-only.
const libs = new Set((await Bun.file("data/libs.json").json()).map((l: { id: string }) => l.id));
const lines = (await Bun.file("data/catalogue.ndjson").text()).split("\n").filter(Boolean);
const ids = new Set<string>();
const errors: string[] = [];

lines.forEach((line, i) => {
  const at = `line ${i + 1}`;
  let r: any;
  try { r = JSON.parse(line); } catch { errors.push(`${at}: not JSON`); return; }
  if (typeof r.id !== "string" || !/^[A-Za-z0-9._~-]+$/.test(r.id)) errors.push(`${at}: bad id ${JSON.stringify(r.id)}`);
  else if (ids.has(r.id)) errors.push(`${at}: repeated id ${r.id}`);
  else ids.add(r.id);
  if (r.lib !== null && !libs.has(r.lib)) errors.push(`${at}: unknown lib ${JSON.stringify(r.lib)}`);
  if (!["open", "nc", "link-only"].includes(r.rights)) errors.push(`${at}: bad rights ${JSON.stringify(r.rights)}`);
});

if (errors.length) {
  console.error(errors.slice(0, 50).join("\n") + (errors.length > 50 ? `\n...and ${errors.length - 50} more` : ""));
  process.exit(1);
}
console.log(`ok: ${lines.length} records`);
