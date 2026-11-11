// Builds data/catalogue.ndjson from data/books.json + Wikidata SPARQL + Gutendex.
// Raw responses are cached under .cache/catalogue/, so reruns are offline and give identical output.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";

const CACHE = ".cache/catalogue";
const UA = "library-catalogue-builder/1.0";
const OUT = "data/catalogue.ndjson";
const WD_CAP: Record<string, number> = { Q193563: 1500, Q82133: 2400 }; // BnF, Bodleian; every other holder is capped at 600 so no giant collection swamps the rest
const WD_DEFAULT_CAP = 600;
const WD_PAGE = 300;
const GUTENDEX_PAGES = 70;

type Kind = "manuscript" | "incunable" | "printed-book" | "map" | "text" | "other";
type Rights = "open" | "nc" | "link-only";
type Rec = {
  id: string; title: string; author?: string; date?: string; lang?: string;
  lib: string | null; holder: string; shelfmark?: string; kind: Kind; rights: Rights;
  read?: { type: "iiif" | "text" | "link"; url: string }; thumb?: string; src: string; wd?: string;
  source: string; // which pipeline stage produced it, used for the report and dropped on write
};

mkdirSync(CACHE, { recursive: true });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lastHit = 0;

async function cached(url: string, gapMs: number, accept = "application/json"): Promise<any> {
  const file = `${CACHE}/${createHash("sha1").update(url).digest("hex")}.json`;
  if (existsSync(file)) return Bun.file(file).json();
  for (let attempt = 0; attempt < 6; attempt++) {
    const wait = lastHit + gapMs - Date.now();
    if (wait > 0) await sleep(wait);
    lastHit = Date.now();
    let res: Response;
    try { res = await fetch(url, { headers: { "User-Agent": UA, Accept: accept }, redirect: "follow" }); }
    catch { await sleep(5000 * 2 ** attempt); continue; } // connection reset etc.
    if (res.ok) {
      const text = await res.text();
      const json = JSON.parse(text);
      await Bun.write(file, text);
      return json;
    }
    if (res.status === 429 || res.status >= 500) {
      const ra = Number(res.headers.get("retry-after")) || 0;
      await sleep(Math.max(ra * 1000, 5000 * 2 ** attempt));
      continue;
    }
    throw new Error(`${res.status} ${url}`);
  }
  throw new Error(`gave up ${url}`);
}

const libs: { id: string; wd: string }[] = await Bun.file("data/libs.json").json();
const libIds = new Set(libs.map((l) => l.id));

// ---------- 1. existing hand-checked records ----------
function existingKind(b: any): Kind {
  const t = `${b.title} ${b.shelfmark ?? ""}`.toLowerCase();
  const rk = b.read?.kind;
  if (rk === "gutenberg" || rk === "standardebooks") return "text";
  if (/incunab|gutenberg bible|nuremberg chronicle|42-line/.test(t)) return "incunable";
  if (/\bmap\b|mappa|tabula|globe|atlas|plan of/.test(t)) return "map";
  if (/manuscript|codex|gospel|evangeli|psalter|\bms\b|mss|papyr|tablet|scroll|sutra|hours|apocalypse|bible|kells|durrow|sinaiticus|vaticanus/.test(t)) return "manuscript";
  if (/first folio|bay psalm|printed|edition/.test(t)) return "printed-book";
  return "other";
}
function existingRights(b: any): Rights {
  const l: string = b.read?.licence ?? "";
  if (!l) return "link-only";
  if (/non-commercial|\bNC\b/i.test(l)) return "nc";
  if (/permission|excluded|not confirmed|unverified|no open licence|no licence|no manifest/i.test(l)) return "link-only";
  if (/CC0|public domain|CC BY 4\.0|CC BY-SA/i.test(l)) return "open";
  return "link-only";
}
function fromExisting(b: any): Rec {
  const rk = b.read?.kind;
  const url = b.read?.url ?? b.catalogue_url;
  const type = rk === "iiif" ? "iiif" : ["gutenberg", "standardebooks", "epub/html", "wikisource"].includes(rk) ? "text" : "link";
  return {
    id: b.id, title: b.title, ...(b.author ? { author: b.author } : {}), ...(b.date ? { date: String(b.date) } : {}),
    lib: b.lib && libIds.has(b.lib) ? b.lib : null, holder: b.holder ?? "unknown",
    ...(b.shelfmark ? { shelfmark: b.shelfmark } : {}), kind: existingKind(b), rights: existingRights(b),
    ...(url ? { read: { type, url } } : {}), src: b.source ?? b.catalogue_url ?? url ?? "data/books.json", source: "books.json",
  };
}

// ---------- 2. Wikidata ----------
// Holder QIDs. Our libs.json QIDs first; then parent institutions whose label/description was fetched from Wikidata
// and that clearly are the same library or the body that owns it.
const extraHolders: Record<string, string> = {
  Q82133: "bodleian", Q193563: "bnf", Q131454: "loc", Q219555: "nypl", Q894583: "bpl", Q304037: "prunksaal",
  Q856559: "longroom", Q969482: "strahov", Q660082: "melk", Q667615: "admont", Q429379: "hereford", Q155699: "stgallen",
  Q51298904: "stegen", Q130758320: "bnf",
};
const holderLib = new Map<string, string>([...libs.map((l) => [l.wd, l.id] as const), ...Object.entries(extraHolders)]);
// Institutions that are not in our 52 but hold plenty of manuscripts: lib stays null.
const otherHolders = ["Q256507", "Q750403", "Q663820", "Q953058", "Q81165027"];

const KIND_BY_CLASS: Record<string, Kind> = {};
for (const c of ["Q87167", "Q48498", "Q123476271", "Q123172729", "Q213924", "Q115160288", "Q727715", "Q956165", "Q830560", "Q1641020", "Q30103158"]) KIND_BY_CLASS[c] = "manuscript";
KIND_BY_CLASS.Q216665 = "incunable";
for (const c of ["Q11396303", "Q53731850", "Q571", "Q1338914"]) KIND_BY_CLASS[c] = "printed-book";
for (const c of ["Q4006", "Q21944833", "Q1425895"]) KIND_BY_CLASS[c] = "map";
for (const c of ["Q7725634", "Q47461344", "Q3331189"]) KIND_BY_CLASS[c] = "text";
for (const c of ["Q1002697", "Q41298", "Q11032"]) KIND_BY_CLASS[c] = "other";
const KIND_ORDER: Kind[] = ["incunable", "manuscript", "map", "printed-book", "text", "other"];

function sparql(holder: string, offset: number) {
  const classes = Object.keys(KIND_BY_CLASS).map((c) => "wd:" + c).join(" ");
  return `SELECT ?i ?iLabel ?hLabel
  (GROUP_CONCAT(DISTINCT STRAFTER(STR(?cc),"entity/");separator=",") AS ?cls)
  (SAMPLE(?dt) AS ?date) (GROUP_CONCAT(DISTINCT ?al;separator="; ") AS ?auth) (SAMPLE(?lc) AS ?lang)
  (SAMPLE(?sm) AS ?shelf) (SAMPLE(?mf) AS ?man) (SAMPLE(?im) AS ?img)
WHERE {
  { SELECT DISTINCT ?i ?h WHERE {
      VALUES ?h { wd:${holder} } { ?i wdt:P195 ?h } UNION { ?i wdt:P276 ?h }
      ?i wdt:P31 ?c . VALUES ?c { ${classes} } } LIMIT ${WD_PAGE} OFFSET ${offset} }
  OPTIONAL { ?i wdt:P31 ?cc }
  OPTIONAL { ?i wdt:P571 ?dt }
  OPTIONAL { ?i wdt:P217 ?sm }
  OPTIONAL { ?i wdt:P6108 ?mf }
  OPTIONAL { ?i wdt:P18 ?im }
  OPTIONAL { ?i wdt:P407 ?lg . ?lg wdt:P218 ?lc }
  OPTIONAL { ?i wdt:P50|wdt:P170 ?a . ?a rdfs:label ?al FILTER(lang(?al)="en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,de,la,it,es,pt,nl,mul". ?i rdfs:label ?iLabel. ?h rdfs:label ?hLabel. }
} GROUP BY ?i ?iLabel ?hLabel`;
}

const val = (b: any, k: string): string | undefined => b[k]?.value;

async function wikidata(): Promise<Rec[]> {
  const out: Rec[] = [];
  for (const holder of [...holderLib.keys(), ...otherHolders]) {
    const lib = holderLib.get(holder) ?? null;
    let got = 0;
    for (let off = 0; got < (WD_CAP[holder] ?? WD_DEFAULT_CAP); off += WD_PAGE) {
      const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparql(holder, off));
      let rows: any[];
      try { rows = (await cached(url, 2500, "application/sparql-results+json")).results.bindings; }
      catch (e) { console.error("wikidata skip", holder, off, String(e).slice(0, 120)); break; }
      for (const b of rows) {
        const qid = val(b, "i")!.split("/").pop()!;
        const title = val(b, "iLabel");
        if (!title || /^Q\d+$/.test(title)) continue; // no label in any requested language
        const kinds = new Set((val(b, "cls") ?? "").split(",").map((c) => KIND_BY_CLASS[c]).filter(Boolean));
        const kind = KIND_ORDER.find((k) => kinds.has(k));
        if (!kind) continue;
        const man = val(b, "man");
        const img = val(b, "img");
        const date = val(b, "date")?.match(/^(-?\d{1,4})/)?.[1];
        const host = man ? new URL(man).hostname : "";
        out.push({
          id: `wd-${qid.toLowerCase()}`, title, ...(val(b, "auth") ? { author: val(b, "auth") } : {}),
          ...(date ? { date: String(Number(date)) } : {}), ...(val(b, "lang") ? { lang: val(b, "lang") } : {}),
          lib, holder: val(b, "hLabel") ?? holder, ...(val(b, "shelf") ? { shelfmark: val(b, "shelf") } : {}),
          kind,
          // Only e-codices is licence-checked (its manifests carry CC BY-NC 4.0, see research notes); everything else has no verified reuse licence.
          rights: host.endsWith("e-codices.unifr.ch") ? "nc" : "link-only",
          ...(man ? { read: { type: "iiif" as const, url: man } } : {}),
          ...(img ? { thumb: img.replace(/^http:/, "https:") + "?width=320" } : {}),
          src: `https://www.wikidata.org/wiki/${qid}`, wd: qid, source: "wikidata",
        });
      }
      got += rows.length;
      if (rows.length < WD_PAGE * 0.5) break; // page came back short: set exhausted
    }
  }
  return out;
}

// ---------- 3. Gutendex ----------
async function gutendex(): Promise<Rec[]> {
  const out: Rec[] = [];
  for (let p = 1; p <= GUTENDEX_PAGES; p++) {
    let j: any;
    try { j = await cached(`https://gutendex.com/books/?page=${p}&copyright=false`, 1500); }
    catch (e) { console.error("gutendex stop", p, String(e).slice(0, 120)); break; }
    for (const b of j.results) {
      const f = b.formats ?? {};
      const html = f["text/html"] ?? f["text/html; charset=utf-8"] ?? `https://www.gutenberg.org/ebooks/${b.id}`;
      out.push({
        id: `pg-${b.id}`, title: b.title, ...(b.authors?.length ? { author: b.authors.map((a: any) => a.name).join("; ") } : {}),
        ...(b.languages?.[0] ? { lang: b.languages[0] } : {}), lib: null, holder: "Project Gutenberg",
        shelfmark: `PG ${b.id}`, kind: "text", rights: b.copyright === false ? "open" : "link-only",
        read: { type: "text", url: html }, ...(f["image/jpeg"] ? { thumb: f["image/jpeg"] } : {}),
        src: `https://www.gutenberg.org/ebooks/${b.id}`, source: "gutendex",
      });
    }
    if (!j.next) break;
  }
  return out;
}

// ---------- merge, dedupe, write ----------
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
const books = (await Bun.file("data/books.json").json()).books as any[];
const all: Rec[] = [...books.map(fromExisting), ...(await wikidata()), ...(await gutendex())];

const seenId = new Set<string>(), seenWd = new Set<string>(), seenTH = new Set<string>(), seenPg = new Set<string>();
for (const b of books) { // Gutenberg ids already present in the hand-checked file
  for (const m of JSON.stringify(b).matchAll(/gutenberg\.org\/ebooks\/(\d+)/g)) seenPg.add(m[1]);
}
const kept: Rec[] = [];
for (const r of all) {
  const pg = r.id.startsWith("pg-") ? r.id.slice(3) : null;
  const th = `${norm(r.title)}|${norm(r.holder)}`;
  if (r.source !== "books.json") {
    if (seenId.has(r.id) || (r.wd && seenWd.has(r.wd)) || seenTH.has(th) || (pg && seenPg.has(pg))) continue;
  } else if (seenId.has(r.id)) throw new Error(`duplicate id in books.json: ${r.id}`);
  seenId.add(r.id); seenTH.add(th); if (r.wd) seenWd.add(r.wd);
  kept.push(r);
}

const lines = kept.map(({ source, ...rest }) => JSON.stringify(rest));
await Bun.write(OUT, lines.join("\n") + "\n");

const tally = (key: (r: Rec) => string) => {
  const m = new Map<string, number>();
  for (const r of kept) m.set(key(r), (m.get(key(r)) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}\t${n}`).join("\n");
};
console.log(`wrote ${kept.length} records to ${OUT}\n\nper source\n${tally((r) => r.source)}\n\nper library\n${tally((r) => r.lib ?? "(null)")}`);
const under = libs.filter((l) => kept.filter((r) => r.lib === l.id).length < 10).map((l) => `${l.id}:${kept.filter((r) => r.lib === l.id).length}`);
console.log(`\nlibraries under 10: ${under.join(" ")}`);
