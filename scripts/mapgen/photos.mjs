// Write data/verify/photos.json: one Wikimedia Commons photo-set row per room, passing when >= 5 freely licensed files.
const UA = { "User-Agent": "Wanderstacks-planning/0.1 (https://github.com/; research script)" };
const API = "https://commons.wikimedia.org/w/api.php";
const CAT = { prunksaal: "State Hall of the Austrian National Library", bnf: "Salle Labrouste", stgallen: "Stiftsbibliothek St. Gallen",
  mafra: "Library of the Mafra National Palace", nypl: "Rose Main Reading Room", bpl: "BPL McKim Building Bates Hall",
  peabody: "George Peabody Library", bodleian: "Duke Humfrey's Library", escorial: "Library of the Monastery of El Escorial",
  gabinete: "Real Gabinete Português de Leitura", melk: "Library of Melk Abbey", vatican: "Salone Sistino",
  wiblingen: "Klosterbibliothek Wiblingen", weimar: "Duchess Anna Amalia Library", ottawa: "Library of Parliament (Canada)",
  stockholm: "Stockholm Public Library" };
const FREE = /^(CC BY(-SA)? [0-9.]+|CC0|Public domain|PD)/i;
const get = async q => { await Bun.sleep(1000); return (await fetch(`${API}?${new URLSearchParams({ format: "json", ...q })}`, { headers: UA })).json(); };
const plans = [];
for (const [lib, cat] of Object.entries(CAT)) {
  const title = `Category:${cat}`;
  const info = await get({ action: "query", prop: "categoryinfo", titles: title });
  const files = Object.values(info.query.pages)[0].categoryinfo?.files ?? 0;
  const m = await get({ action: "query", generator: "categorymembers", gcmtitle: title, gcmtype: "file", gcmlimit: "50", prop: "imageinfo", iiprop: "extmetadata", iiextmetadatafilter: "LicenseShortName" });
  const lic = Object.values(m.query?.pages ?? {}).map(p => p.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value ?? "unknown");
  const free = lic.filter(l => FREE.test(l) && !/NC|ND/.test(l));
  const tally = Object.entries(Object.groupBy(free, l => l)).map(([k, v]) => `${v.length}x ${k}`).join(", ");
  const url = `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;
  plans.push({ lib, kind: "photo-set", title: `Wikimedia Commons: ${title}`, url,
    licence: `Per file. ${free.length} of ${lic.length} sampled files free (${tally || "none"}); ${files} files in category. Credit each file used.`,
    status: free.length >= 5 ? "passing" : "failing",
    check: `curl -sG --max-time 20 -A 'Wanderstacks-planning/0.1' '${API}' --data-urlencode 'titles=${title.replaceAll("'", "'\\''")}' -d 'action=query&prop=categoryinfo&format=json' | jq -e '.query.pages[].categoryinfo.files >= 5'` });
  console.log(lib, files, `${free.length}/${lic.length}`, plans.at(-1).status);
}
await Bun.write(`${import.meta.dir}/../../data/verify/photos.json`, JSON.stringify({ cluster: "photos", plans }, null, 1) + "\n");
