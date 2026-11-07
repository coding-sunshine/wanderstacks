// Merge verifier JSON into data/facts.json + data/books.json and a compact VER object for the page.
const D = `${import.meta.dir}/../../data`;
const LABEL = { "ancient-west": "Ancient west", "ancient-east": "Ancient east", "central-europe-1": "Prague and Vienna", "central-europe-2": "Admont, St Gall, Weimar", "west-europe": "Western Europe", "americas": "Americas and Stockholm", "texts": "Public-domain texts", "scans": "Manuscript scans", "texts-trinity": "Trinity-linked texts", "rooms-longroom": "Long Room survey", "rooms-loc": "LoC Reading Room survey", "rooms-admont-strahov": "Admont and Strahov survey", "books-gap-1": "Books: Celsus to BPL", "books-gap-2": "Books: Peabody to Ottawa", "plans": "Floor plans", "promote": "Primary-source upgrades", "recon-ancient": "Ancient reconstruction sources", "photos": "Commons photo sets", "labels": "Year labels", "books-ottawa": "Books: Ottawa", "rb-west": "Real browser: Long Room and west", "rb-ancient": "Real browser: ancient sites", "rb-central": "Real browser: central Europe", "rb-scans": "Real browser: scans and Americas", "rb-texts": "Texts, second pass" };
const files = [...new Bun.Glob("*.json").scanSync(`${D}/verify`)].sort();
const all = { facts: [], events: [], plans: [], books: [], corrections: [] };
for (const f of files) {
  const key = f.replace(/\.json$/, ""), j = await Bun.file(`${D}/verify/${f}`).json();
  for (const k in all) for (const r of j[k] || []) all[k].push({ cluster: key, ...r });
}
// a failing fact or plan drops out once any cluster proves the same library + field (+ dims label) or library + plan kind.
const ONE = new Set(["built", "architect", "dims", "volumes", "status_note", "remains_today"]);
const fk = x => !x.lib ? null : x.kind ? `${x.lib}|plan|${x.kind}` : ONE.has(x.field) ? `${x.lib}|${x.field}|${x.field === "dims" ? (x.value || "").split(":")[0].toLowerCase() : ""}` : null;
for (const k of ["facts", "plans"]) {
  const proven = new Set(all[k].filter(x => x.status === "passing").map(fk));
  all[k] = all[k].filter(x => x.status === "passing" || !proven.has(fk(x)));
}
// one record per book: same id, same reader URL (host ignored) or same library + title.
// scans/texts clusters own access; then prefer passing, then a reader.
const norm = s => (s || "").toLowerCase().replace(/\(.*?\)/g, "").replace(/\bst\.? /g, "saint ").replace(/[^a-z0-9]/g, "");
const keys = b => [b.id, b.read?.url?.replace(/^https?:\/\/[^/]+/, ""), b.lib && `${b.lib}|${norm(b.title)}`].filter(Boolean);
const score = b => (["scans", "texts", "texts-trinity", "rb-scans", "rb-texts"].includes(b.cluster) ? 4 : 0) + (b.status === "passing" ? 2 : 0) + (b.read?.url ? 1 : 0);
const idx = new Map(), recs = [];
for (const b of all.books) {
  const ks = keys(b);
  let i = ks.map(k => idx.get(k)).find(x => x != null);
  if (i == null) i = recs.push(b) - 1;
  else if (score(b) > score(recs[i])) recs[i] = { ...recs[i], ...b };
  for (const k of ks) idx.set(k, i);
}
// a book only sits on a shelf of a library we model; others go to the global reading list (lib null, holder kept).
const libIds = new Set((await Bun.file(`${D}/libs.json`).json()).map(l => l.id));
for (const b of recs) if (b.lib && !libIds.has(b.lib)) b.lib = null;
const books = Object.fromEntries(recs.map(b => [b.id, b]));
// licence gate: a permission-only scan stays a catalogue card even when its manifest loads.
const tierOf = b => b.access === "ghost" ? "ghost" : b.access?.startsWith("readable") && b.status === "passing" && !/^permission/i.test(b.read?.licence || "") ? b.access : "catalog";
const tiers = { "readable-text": 0, "readable-scan": 0, catalog: 0, ghost: 0 }, samples = {};
for (const b of Object.values(books)) {
  const t = tierOf(b); tiers[t]++;
  if (!samples[t] && (t === "catalog" ? b.status === "passing" : true)) samples[t] = `${b.title}${b.holder ? `, ${b.holder}` : b.read?.edition ? `, ${b.read.edition}` : ""}`;
}
const events = {};
for (const e of all.events) (events[e.lib] ||= []).push({ k: e.kind, y: e.year ?? e.earliest, e: e.earliest, l: e.latest, t: e.label, r: e.tier, s: e.status });
const span = {};
for (const x of all.facts) if (x.field === "built" && x.status === "passing" && x.earliest != null && x.latest > x.earliest) span[x.lib] ??= [x.earliest, x.latest];
// counts are live rows: superseded facts and losing book duplicates are not counted.
const live = [...all.facts, ...all.events, ...all.plans, ...Object.values(books)].filter(r => r.status);
const clusters = files.map(f => f.replace(/\.json$/, "")).map(k => {
  const rs = live.filter(r => r.cluster === k), p = rs.filter(r => r.status === "passing").length;
  return { c: LABEL[k] || k, p, f: rs.length - p };
}).filter(c => c.p + c.f);
const rows = clusters.reduce((a, c) => a + c.p + c.f, 0), pass = clusters.reduce((a, c) => a + c.p, 0);
const libsSeen = new Set(Object.values(books).map(b => b.lib).filter(Boolean));
const VER = { counts: { rows, pass, books: Object.keys(books).length, libs: libsSeen.size }, clusters, tiers, samples, events, span,
  corrections: all.corrections.map(({ lib, field, old, new: nw }) => ({ lib, field, old, new: nw })) };
await Bun.write(`${D}/facts.json`, JSON.stringify({ generated: new Date().toISOString(), facts: all.facts, events: all.events, plans: all.plans, corrections: all.corrections }, null, 1));
await Bun.write(`${D}/books.json`, JSON.stringify({ generated: new Date().toISOString(), books: Object.values(books).map(b => ({ ...b, tier: tierOf(b) })) }, null, 1));
await Bun.write("ver.json", JSON.stringify(VER));
console.log(files.length, "files;", VER.counts, tiers, "events libs:", Object.keys(events).length, "corrections:", VER.corrections.length);
