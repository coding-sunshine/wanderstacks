// Print each uncovered library's Wikidata Commons category (P373) for review.
const UA = { "User-Agent": "Wanderstacks-planning/0.1 (https://github.com/; research script)" };
const libs = await Bun.file(`${import.meta.dir}/../../data/libs.json`).json();
const want = process.argv.slice(2);
const ids = libs.filter(l => want.includes(l.id)).map(l => l.wd).join("|");
const j = await (await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=claims|labels&languages=en&format=json`, { headers: UA })).json();
for (const l of libs.filter(l => want.includes(l.id))) {
  const e = j.entities[l.wd], c = e?.claims?.P373?.[0]?.mainsnak?.datavalue?.value;
  const part = e?.claims?.P361?.[0]?.mainsnak?.datavalue?.value?.id;
  console.log(`${l.id}\t${l.wd}\t${e?.labels?.en?.value}\tP373=${c ?? "-"}\tP361=${part ?? "-"}`);
}
