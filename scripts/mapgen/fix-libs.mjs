// Apply verifier corrections (data/verify/*.json) to libs.json. Values ending in * are still unproven.
const P = `${import.meta.dir}/../../data/libs.json`;
const FIX = {
  longroom: { yl: "1712–32", st: "Closes for restoration; Kells moves out late 2027, works to about 2030", dim: "63.7 × 12.2 × 14.2 m; 40 alcoves on two storeys; barrel vault of 1859–61", book: "Book of Kells (in the Treasury; scan needs Trinity's permission)", read: "Five Trinity-linked texts: Swift, Goldsmith, Stoker, Wilde, Synge" },
  admont: { vol: "About 200,000 works, 1,400 manuscripts, 530 incunabula", dim: "70 × 14 × 11 m (12.7 m under the central dome); seven domes, 48 windows" },
  strahov: { n: "Strahov Library, Philosophical Hall", yl: "1671–79", dim: "Philosophical Hall 32 × 10 × 14 m; Theological Hall size unpublished", book: "Strahov Gospels (catalog only)" },
  loc: { yl: "1890–97", dim: "Octagon 30.5 m across; dome top 38.1 m, lantern crown 48.8 m; eight alcoves (1897 Handbook)", book: "Gutenberg Bible (catalog only)", read: "Hero room, built from HABS DC-351 photos and data pages (no measured drawings)" },
  celsus: { yl: "About 110–135 CE", dim: "Hall 16.7 × 10.9 m; facade 21 m wide, over 16 m high; interior lost 262 CE", st: "Excavated 1903–04; facade rebuilt by anastylosis, 1970–78" },
  alexandria: { yl: "Possibly under Ptolemy II, 285–246 BCE", lost: true, book: "Myth panel: damaged in 48 BCE, end date unknown" },
  prunksaal: { y: 1723, yl: "1723–26", dim: "Almost 80 m long, 20 m high" },
  bnf: { yl: "1861–68" },
  stgallen: { yl: "1758–67", st: "Closed 9–23 Nov 2026", stFrom: 2026, vol: "More than 2,100 manuscripts; about 160,000 volumes" },
  mafra: { y: 1771, yl: "Shelves 1771; books moved in 1794", vol: "About 30,000 volumes (and resident bats)", dim: "88 × 9.5 × 13 m (sources give 83–88 m)", st: "Closed Aug 2025 for conservation; reopening unconfirmed", stFrom: 2025 },
  nypl: { dim: "297 × 78 ft (90.5 × 23.8 m); 52 ft height unproven" },
  bodleian: { y: 1488, yl: "1478–88", book: "Shakespeare First Folio (CC BY-NC 4.0 scan)" },
  escorial: { y: 1565, yl: "First books arrive 1565", dim: "54 × 9 × 10 m", book: "Codex Aureus, Vitr. 17 (catalog only)" },
  melk: { y: 1735, yl: "Furnished 1735" },
  klementinum: { y: 1726, yl: "1709–26", vol: "About 27,000 historical volumes" },
  vatican: { yl: "1585–88, frescoes to 1590", dim: "70 × 11 m (Vatican News); height not published", book: "Vergilius Vaticanus (permission only)" },
  wiblingen: { yl: "1740–50", dim: "23 × 11.5 m, two storeys" },
  weimar: { yl: "1766", st: "Fire on 2 Sep 2004 took about 50,000 volumes; reopened 24 Oct 2007" },
  ottawa: { yl: "1876", st: "Closed 2019 with Centre Block; reopens about 2031–32", stFrom: 2019 },
  stockholm: { st: "Closed June 2024 to early 2028" },
  nineveh: { yl: "Ashurbanipal reigned from 669/668 BCE", vol: "About 32,000 tablets and fragments (British Museum)", book: "Gilgamesh tablets (PG 11000 is the Old Babylonian Yale tablet, not Nineveh's)" },
  pergamon: { y: -220, yl: "About 220–159 BCE", lost: 262 },
  herculaneum: { yl: "Buried by Vesuvius in 79 CE", found: 1750, st: "Ink letters seen in PHerc. 1667, Dec 2025", stFrom: 2025 },
  nalanda: { yl: "About 427 CE", lost: 1200, dim: "Excavated site of 23 ha (UNESCO); building counts unproven", book: "Myth panel: the three-month fire story (no source found)" },
  dunhuang: { yl: "Sealed early 11th century", vol: "Up to 50,000 manuscripts; IDP lists 154,919 entries" },
  buda: { yl: "About 1460" },
  haeinsa: { lat: 35.8016, lon: 128.0987 }, // P625 of Q490798, the Janggyeong Panjeon depositories; the temple item Q489795 is only 0.1° precise
  timbuktu: { yl: "Manuscripts from the late 1200s on", vol: "Total unknown; about 350,000 evacuated in 2012–13", st: "4,203 burned or stolen in 2012–13; returns began Aug 2025", stFrom: 2012 },
};
// Wikidata QIDs, picked by hand from wd-search*.mjs output (room-level item where one exists).
const WD = { longroom: "Q1319605", admont: "Q304668", alexandria: "Q435", celsus: "Q744406", loc: "Q2615945", strahov: "Q12056498", bnf: "Q114361821", bodleian: "Q5312796", bpl: "Q118130179", escorial: "Q3848863", gabinete: "Q5411113", klementinum: "Q139474114", mafra: "Q20919348", melk: "Q1589808", nypl: "Q7013887", peabody: "Q5543273", prunksaal: "Q12207289", stgallen: "Q689896", vatican: "Q213678", weimar: "Q50711", wiblingen: "Q28790041", buda: "Q688736", dunhuang: "Q28097247", herculaneum: "Q1347586", nalanda: "Q216243", nineveh: "Q856544", ottawa: "Q1125633", pergamon: "Q856590", stockholm: "Q1246991", timbuktu: "Q2209578", vikramashila: "Q1634624", thanjavur: "Q3135924", khudabakhsh: "Q6402791", nli: "Q619913", asiatic: "Q4058307", connemara: "Q5161767", sassoon: "Q4120540", alexandrina: "Q501851", baghdad: "Q33018", palafoxiana: "Q4903485", vasconcelos: "Q6294156", slv: "Q1200052", tianyige: "Q2066117", binhai: "Q47088811", haeinsa: "Q490798", ashikaga: "Q1053852", mcmillan: "Q60768249" };
const libs = await Bun.file(P).json();
const miss = Object.keys(FIX).filter(id => !libs.some(l => l.id === id));
if (miss.length) throw new Error(`unknown ids: ${miss}`);
const noWd = libs.filter(l => !WD[l.id]).map(l => l.id);
if (noWd.length) throw new Error(`no QID: ${noWd}`);
for (const l of libs) Object.assign(l, FIX[l.id] || {}, { wd: WD[l.id] });
await Bun.write(P, JSON.stringify(libs, null, 1) + "\n");
await Bun.write("libs.json", Bun.file(P));
console.log("patched", Object.keys(FIX).length, "of", libs.length);
