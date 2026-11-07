const Q = { longroom: ["Long Room", "Old Library, Trinity College Dublin", "Trinity College Library Dublin"], escorial: ["Royal Library of El Escorial", "Real Biblioteca del Monasterio de El Escorial", "Biblioteca de El Escorial"], klementinum: ["Clementinum", "Baroque Library Hall"], mafra: ["Library of the Palace of Mafra", "Biblioteca do Palácio Nacional de Mafra"], nypl: ["Stephen A. Schwarzman Building", "Rose Main Reading Room"], vatican: ["Vatican Library", "Salone Sistino"], dunhuang: ["Library Cave", "Mogao Cave 17"], gabinete: ["Royal Portuguese Reading Room", "Real Gabinete Português de Leitura"] };
for (const [id, qs] of Object.entries(Q)) for (const q of qs) for (const lang of ["en", q.match(/[ãçéíó]|Biblioteca|Real/) ? "pt" : null].filter(Boolean)) {
  const r = await fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=${lang}&limit=6&format=json`, { headers: { "User-Agent": "WorldLibs-planning/0.1 (https://github.com/; research script)" } }).then(r => r.json());
  const hits = (r.search || []).filter(s => !/photograph|scholarly|article|painting|print/i.test(s.description || ""));
  console.log(id.padEnd(12), `"${q}"`, "→", hits.slice(0, 3).map(s => `${s.id} ${s.label} — ${(s.description || "").slice(0, 45)}`).join(" | "));
  await Bun.sleep(1000);
}
