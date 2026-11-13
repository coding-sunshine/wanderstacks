---
ontology: true
type: reference
domain: wanderstacks
summary: Research report for Wanderstacks, a three.js walkable replica of the world's greatest libraries. Prioritized library shortlist, signature books, public-domain full-read catalog, asset and legal feasibility, MVP recommendation and experience ideas, with source conflicts and unverified claims flagged.
tags: [wanderstacks, libraries, three-js, public-domain, iiif, gaussian-splats, licensing, research]
status: active
related: [europe_libraries, global_libraries, lost_libraries, pd_sources_verified, manuscripts_iiif, assets_verified, assets_tech_legal, public_domain_books]
relatedTo: [europe_libraries, global_libraries, lost_libraries, pd_sources_verified, manuscripts_iiif, assets_verified, assets_tech_legal, public_domain_books]
discovered: 2026-11-07
verified: false
workspace: wanderstacks
---

# Building Wanderstacks from verified sources

**Start with six libraries, not twenty, and build them by hand.** The strongest MVP is the Trinity College Long Room, Admont Abbey, Strahov's Theological Hall, the Library of Congress Main Reading Room as a hero, and one lost library, the Library of Celsus at Ephesus, with a clearly labelled conjectural Alexandria as the story anchor. Almost no downloadable 3D interior exists for any of them, so the realistic route is a modular hand-built shell with baked lightmaps, instanced books and a single "pull-out" hero book, with an optional desktop-only Gaussian-splat layer. Reading is the easier half: about 95 Project Gutenberg IDs were API-verified and about 55 Standard Ebooks paths confirmed, so a shelf of fully readable public-domain books is cheap, provided translator death dates are checked per country. Scans of famous manuscripts are harder, because many are licensed non-commercial or by permission only (Book of Kells, Codex Sinaiticus, e-codices), so the safe scan set is small. Legal risk concentrates in three places: interior freedom of panorama (unsettled in the US, excluded in Switzerland), modern buildings still in copyright (Binhai, Seattle, Black Diamond), and non-commercial licences on both models and manuscripts. Several facts that matter for planning are time-limited: the Trinity Old Library closes in 2027, the Stockholm library is shut until 2028, and the Library of Parliament in Ottawa is shut until roughly 2032. Many claims in the underlying notes were marked background-only; those are listed in an unverified register at the end and are not treated as findings here. Nothing in this report is legal advice.

How to read the flags. "Unverified" means the source notes tagged the claim as background knowledge ([bg]) or could not open a primary source. "Conflict" means two sources disagree and the report does not pick a side. The eight underlying notes are listed in the frontmatter; source URLs are cited inline where the notes gave one.

## The shortlist: where the architecture and the evidence are strongest

Ranking uses four scores from the notes, each out of 5: iconic status, reference availability, modelling complexity (higher means harder), and licensing ease. The scoring is the notes' own judgement, not a measured quantity.

### Tier 1: build first

| Library | Where, when | Visual signature | Status | Reference and licence picture |
|---|---|---|---|---|
| Trinity College Long Room | Dublin; Thomas Burgh, 1712-33 (Wikipedia says 1709-32, conflict); barrel vault raised 1859-61 by Deane and Woodward | About 65 m long, two storeys of oak alcoves, busts down the aisle, vault added in the 19th century ([Naomi Clifford](https://www.naomiclifford.com), [Wikipedia](https://en.wikipedia.org/wiki/The_Old_Library,_Trinity_College_Dublin)) | Old Library closes in 2027 for restoration to about 2030, around EUR 25m; Book of Kells to be housed in the restored Printing House ([University Times](https://universitytimes.ie/2026/03/printing-house-restored-to-house-book-of-kells/)) | 22 Commons files; no downloadable 3D found; official 360 tours are not reusable. Scores 5/5/3/4 |
| Admont Abbey library | Styria, Austria; Josef Hueber, 1776 | 70 x 14 x 13 m, seven domes, Altomonte ceiling frescoes, Stammel sculptures; about 200,000 books, 1,400 manuscripts, 900 incunabula ([Wikipedia](https://en.wikipedia.org/wiki/Admont_Abbey)) | Open per the 2026 programme | 79 Commons files; no 3D found; Austrian interior FoP is disputed (see legal section). Scores 5/4/3/4 |
| Strahov Monastery | Prague; Theological Hall 1679, Philosophical Hall 1779 | Philosophical Hall is 32 x 10 x 14 m with a Maulbertsch ceiling fresco of 1794; the Theological Hall is the smaller stucco-and-globe room ([Strahov](https://www.strahovskyklaster.cz/en/philosophical-hall)) | Open; photography terms not verified | 61 and 64 Commons files for the two halls; no 3D found. Scores 5/4/3/3 |
| Library of Congress Main Reading Room | Washington DC; opened 1897; Smithmeyer, Pelz, Casey | Octagonal, eight columns, a gold dome, Blashfield mural ([Wikipedia](https://en.wikipedia.org/wiki/Thomas_Jefferson_Building)) | Open to the public as a gallery view; reader access is restricted | HABS DC-351 and about 1,000 digitised drawings, the best measured source of any library ([LoC blog](https://blogs.loc.gov/picturethis/2024/01/more-jefferson-building-drawings-digitized/)); 180 Commons files, licences unsampled; US federal works are generally public domain, but the HABS pages could not be opened (loc.gov returned 403) |
| Library of Celsus | Ephesus; built around 117 CE; anastylosis 1970-78 | Best-evidenced lost interior: facade reconstructed, interior destroyed in 262 CE | Archaeological site | 264 Commons files; four Sketchfab models under CC BY, the cleanest licence found |

### Tier 2: strong, build after the MVP

Prunksaal of the Austrian National Library in Vienna (Fischer von Erlach, 1721-26; over 77 m; oval dome about 18 x 29.2 m and 29.2 m high; Daniel Gran frescoes) scores 5/5/4/4 and is the most complex room on the list. The BnF Labrouste Reading Room (1868; nine domes on 16 slender columns about 10 m high) scores 5/4/2/3 and is geometrically the simplest, a good second-wave candidate. The St. Gallen Abbey Library (Peter Thumb, 1758-67; about 160,000 volumes and 2,100 manuscripts) is allowed private photography without flash or tripod, but professional shoots need permission ([Wikipedia](https://en.wikipedia.org/wiki/Abbey_Library_of_Saint_Gall), [Stiftsbezirk](https://www.stiftsbezirk.ch)). The Mafra Palace library (83 m; about 36,000 volumes; resident bats) scores 4/3/2/3.

North America adds three strong rooms with decent measurements. The NYPL Rose Main Reading Room (Carrere and Hastings, 1900-11; 297 x 78 x 52 ft) reopened in 1998 after earlier work and lost a rosette from the ceiling in 2014. The Boston Public Library Bates Hall (1895; 218 x 42 x 50 ft; green lamps) is documented by the library itself ([BPL guide](https://guides.bpl.org/mckim/bateshall)). The Peabody Library in Baltimore (1878, Lind; 61 ft atrium, five cast-iron tiers, about 300,000 volumes) is a one-volume space and therefore cheap to build. The notes suggest the order NYPL Rose, Bates, Peabody, LoC (hero), Kanazawa, Gabinete, Parliament.

Other candidates with specific reasons to wait: the Bodleian's Duke Humfrey's Library (1450-80) and the Radcliffe Camera (Gibbs, 1737-49, not open to the public; CC BY point clouds exist); El Escorial (Herrera shelving, Tibaldi vault); the Real Gabinete Portugues de Leitura in Rio (1880-87, Neo-Manueline, about 350,000 volumes, one source dates its interior painting to 1876-77, which conflicts with the build date); the Melk library (Troger, 1731-32); and the Klementinum in Prague (1722, about 20,000 volumes). The Vatican Sistine Hall (Fontana, about 1587) reopened as a reading room in 2017. Wiblingen (72 x 27 m) and the Weimar Rokokosaal are viable, though Weimar lost roughly 50,000 volumes in the 2004 fire, reopened in 2007 and sells timed tickets only.

### Tier 3: skip, defer, or handle as special cases

The Joanina Library in Coimbra (1717-28) is spectacular but bans photography; its ticket was about EUR 13 and the architect attribution (Joao Carvalho Ferreira or Gaspar Ferreira) and volume count (70,000 to 250,000) both conflict across sources ([UC](https://visit.uc.pt/en/info)). Stockholm's Asplund library (1928) is closed since 2024 and reopens in 2028. The Library of Parliament in Ottawa (closed 2019) reopens around 2032, which makes a replica more valuable than the real room for now. The Seattle Central Library (OMA, 2004), Binhai Library (MVRDV, 2017) and Black Diamond (SHL, 1999) are modern copyrighted architecture and should be skipped. The Beinecke (SOM, 1963; home of the Voynich manuscript) is the same problem from the mid-century. El Ateneo in Buenos Aires is a bookstore, not a library. The Kanazawa library (45 x 45 x 12 m, about 6,000 glass blocks) is a lovely small room, but its copyright status was not checked and the architects are modern, so it should be treated as blocked until counsel says otherwise. Qarawiyyin in Fez (859; reopened 2016), the State Library of Victoria La Trobe Reading Room (dome 34.75 m; the "largest dome in the world" line is suspect), Palafoxiana (1646), Rampur Raza and Khuda Bakhsh are all plausible later additions; the Khuda Bakhsh total of about 5 million items looks inflated.

### Lost libraries: ranked by evidence, not fame

The notes label every reconstruction KNOWN, PROBABLE or SPECULATIVE, and the report keeps that discipline.

| Library | Evidence tier | Why it ranks where it does |
|---|---|---|
| Celsus, Ephesus | KNOWN (facade), PROBABLE (interior) | Anastylosis 1970-78; destroyed interior 262 CE; four CC BY models exist |
| Dunhuang Library Cave (Cave 17) | KNOWN | The International Dunhuang Project lists about 140,000 entries and 530,000 images; the Diamond Sutra of 868 is its star item; 50 Commons files are all public domain, though they are manuscripts, not a room model |
| Ashurbanipal, Nineveh | PROBABLE | 30,943 tablet entries in the British Museum collection are the stated scale |
| Villa of the Papyri, Herculaneum | KNOWN | About 1,800 scrolls; in 2026 PHerc. 1667 was read and identified as Philodemus, On Gods, book 8 (a low-quality aggregator describing it as Stoic conflicts with this) |
| Alexandria and the Serapeum | SPECULATIVE (evidence scored 1 of 5) | Conjecture only; the Assassin's Creed Discovery Tour modelled its Alexandria on Celsus |
| Pergamon | PROBABLE | Eumenes II's reign is given as 197-159 BCE in one source and 220-159 BCE in another |
| Timbuktu | KNOWN | Estimates differ, 377,000 vs 700,000 manuscripts; about 28,000 were returned in 2025 |
| Corviniana (Buda) | KNOWN | About 216 volumes survive |
| Nalanda | PROBABLE | The "burned for three months" story is flagged as myth |

The notes recommend Celsus, Dunhuang Cave 17 and Ashurbanipal in that order, with the Villa of the Papyri as the narrative anchor. Hadrian's, Ulpian's, Constantinople, Cordoba, the House of Wisdom, Siku and Ebla or Hattusa appear only as background and are unverified. The Maya codices belong in a myth-versus-fact panel, since four Maya books survive, which contradicts the folk claim that all were destroyed; the Codex of Maní in 1562 is the date of the Spanish burning at Maní.

## Signature books: what to put on the shelves

The notes give verified lists for a few libraries and background-only lists for the rest. The table keeps the two apart.

| Library | Signature holdings | Basis |
|---|---|---|
| Trinity Long Room | Book of Kells (680 pages digitised; permission needed, see below), Book of Durrow; the Brian Boru harp | Kells verified; Brian Boru harp unverified [bg] |
| Admont | Roughly 1,400 manuscripts and 900 incunabula as a count; no individual title confirmed | Counts from Wikipedia; titles unverified |
| St. Gallen | Plan of St Gall (Cod. Sang. 1092, e-codices, CC BY-NC 4.0) | Licence verified; the manuscript's role is otherwise unverified [bg] |
| Strahov | Strahov Gospels and the Strahov Codex | Unverified [bg] |
| El Escorial | Codex Aureus, Cantigas de Santa Maria | Unverified [bg] |
| Rylands | Gutenberg Bible, Papyrus P52 | Unverified [bg] |
| Morgan, New York | Gutenberg Bibles, East Room | Gutenberg Bible copies tracked across about 19 institutions ([Lyell 2021 tracker](https://tdungate.github.io/lyell-2021)) |
| Beinecke / Yale | Voynich Manuscript (MS 408) | [Yale catalog 2002046](https://collections.library.yale.edu/catalog/2002046); archive.org holds a scan; rights not verified |
| Vatican | Vergilius Vaticanus (Vat. lat. 3225, 76 folios) | Manifest at https://digi.vatlib.it/iiif/MSS_Vat.lat.3225/manifest.json; licence not verified |
| Bodleian | Shakespeare First Folio (Arch. G c.7) | CC BY 3.0, TEI text available at [firstfolio.bodleian.ox.ac.uk](https://firstfolio.bodleian.ox.ac.uk/downloads.html); announced in the [Bodleian digital blog](https://blogs.bodleian.ox.ac.uk/digital/2016/04/23/introducing-the-iiif-first-folio/) |
| Stockholm | Codex Gigas (kb.se, public domain; IIIF unconfirmed) | Rights stated, IIIF not confirmed |
| British Library | Codex Sinaiticus (partial) | Sinaiticus is non-commercial only ([codexsinaiticus.org](https://codexsinaiticus.org/el/copyright.aspx)); BL services were partly restored after the October 2023 cyberattack, no download, full capacity expected end of 2026 |
| Dunhuang Cave 17 | Diamond Sutra (868) | Collection scale verified (IDP); Sutra role standard but as a single title not separately sourced |
| Library of Congress | Gutenberg Bible, Giant Bible of Mainz | Unverified [bg] |
| Codex Mendoza (Bodleian) | Biblissima IIIF manifest; CC BY-NC reported | Licence reported, not confirmed |
| Dead Sea Scrolls | Five complete scrolls | Terms of use not found |

Other items appearing as table entries in the manuscripts note are tagged [BG] only: Tres Riches Heures, Dresden Codex, Codex Argenteus, Nuremberg Chronicle, Audubon, Kelmscott Chaucer, Aberdeen Bestiary, Archimedes Palimpsest. The report lists them as possible additions, not findings.

## Reading start to end: the public-domain catalog

### Rules that decide what is safe

The simplest policy is US public domain (published before 1931; works from 1931 enter on 1 January 2027) plus a translator or author who died before 1956 for EU and UK use (life plus 70), and before 1971 for Canada. The notes' tested set is mostly safe worldwide. The geo-flagged translations are Arthur Waley (died 1966), Lionel Giles for Sun Tzu (died 1958, EU/UK until 2029), Della Chiesa's Pinocchio (died 1972), Bellows' Poetic Edda (died 1957), and Wyllie's Metamorphosis (flag). The Little Prince is excluded outright.

Two source families are usable. Project Gutenberg texts need the Project Gutenberg name handled carefully: verbatim text plus license, and a 20% royalty if charging, so strip the branding or use Standard Ebooks (CC0) where it has the title. Automated crawling of Gutenberg is forbidden by its robot policy, so ingest a one-off, polite download. Gutendex lookup by `?ids=` worked; `?search=` timed out and returned 503 during the research, which is why every ID below was checked by number, not by name. Standard Ebooks feeds returned 401, so SE paths were verified by page, not by feed.

### Verified PG IDs by group

| Group | Titles (PG ID) |
|---|---|
| English novels | Pride and Prejudice 1342; Emma 158; Frankenstein 84; Jane Eyre 1260; Wuthering Heights 768; Great Expectations 1400; A Christmas Carol 46; Middlemarch 145; Moby Dick 2701; The Scarlet Letter 25344; Huckleberry Finn 76; Dracula 345; Dorian Gray 174; Heart of Darkness 219; Gulliver 829; Robinson Crusoe 521 |
| Poetry, drama, epic | Shakespeare complete 100; Hamlet 1524; Paradise Lost 26; Canterbury Tales 2383; Beowulf (Hall) 16328 and (Gummere) 981; Leaves of Grass 1322; Rubaiyat 246 |
| Children and classics | Sherlock Holmes 1661; Alice 11; Through the Looking-Glass 12; The Time Machine 35; Treasure Island 120; Oz 55; Peter Pan 16; Jungle Book 236; Wind in the Willows 289; Anne 45; Little Women 514; Aesop (Townsend) 21 |
| Continental | Les Miserables (Hapgood) 135; Notre-Dame 2610; Three Musketeers 1257; Monte Cristo 1184; Bovary (Marx-Aveling) 2413; Swann's Way (Scott-Moncrieff, d. 1930) 7178; Candide 19942; Faust (Taylor) 14591; Grimm 2591; Andersen 1597; Zarathustra (Common) 1998; Critique of Pure Reason (Meiklejohn) 4280; Metamorphosis (Wyllie, flag) 5200 |
| Russian | War and Peace (Maude) 2600; Anna Karenina 1399; Crime and Punishment 2554; Karamazov (Garnett, d. 1946) 28054; Onegin 23997; Dead Souls 1081 |
| Mediterranean | Don Quixote (Ormsby) 996; Divine Comedy (Longfellow) 1004 and (Cary) 8800; Decameron (Payne) 23700; The Prince (Marriott) 1232; Pinocchio (Della Chiesa, geo-flag) 500 |
| Classical | Aeneid (Dryden) 228; Metamorphoses (Riley, Books I-VII only) 21765; Iliad (Pope) 6130 and (Butler) 2199; Odyssey (Butler) 1727 and (Pope) 3160; Republic (Jowett) 1497; Nicomachean Ethics 8438; Meditations 2680; Herodotus vol. 1 only 2707; Euclid (Casey, first six books) 21076; Sophocles (Storr) 31 |
| Asia and the Near East | Arabian Nights (Lang) 128; Burton vol. 1 of 10: 3435; Bhagavad Gita (Arnold) 2388; Tao Te Ching (Legge) 216; Analects (Legge) 3330; Art of War (Giles, geo-flag) 132; Kalevala 5186; Volsunga 1152; Kwaidan 1210; Dhammapada 2017; Gilgamesh (Jastrow and Clay, 1920) 11000 |
| Science and scripture | Origin of Species 1228 and 2009; Principia (Latin only) 28233; Opticks 33504; King James Bible 10; Koran (Rodwell) 2800; Leviathan 3207; Walden 205 |

Standard Ebooks paths were verified for roughly 55 of these, in the form `/ebooks/jane-austen/pride-and-prejudice` and `/ebooks/lewis-carroll/alices-adventures-in-wonderland/john-tenniel`. SE does not carry Kafka, Grimm, War and Peace, the Gita, Newton, the Bible, the Koran or the Dhammapada, so those fall back to Gutenberg. SE also hosts Manzoni, Griffith's Ramayana and Waley's Genji, but the Waley text is geo-flagged. Not found at all in a usable edition: the Mahabharata, Journey to the West, Dream of the Red Chamber, Rumi, Hafez and the Shahnameh. The Poetic Edda (Bellows) is flagged. Some SE contents, such as Conrad short fiction and the Plato dialogues, were not opened.

The translator list the notes call safe everywhere: Garnett, Maude, Butler, Pope, Longfellow, Cary, Ormsby, Hapgood, Marx-Aveling, Scott-Moncrieff, Common, Meiklejohn, Jowett, Storr, Macaulay, Marriott, Payne, Hall, Gummere, Crawford, Legge, Rodwell, Muller, Arnold, Burton, FitzGerald and Taylor.

### Scans: which ones can be read page by page

Image-based reading works through IIIF, with image URLs of the form `{id}/full/!2000,2000/0/default.jpg`. Manifest patterns are in the notes for e-codices (`https://www.e-codices.ch/metadata/iiif/{id}/manifest.json`), DigiVatLib, Yale, Gallica and Biblissima. Licence status sorts into three groups.

| Group | Items | What it means for Wanderstacks |
|---|---|---|
| Usable with attribution | Bodleian First Folio (CC BY 3.0) | Safe, include attribution |
| Non-commercial only | e-codices items such as the Plan of St Gall (CC BY-NC 4.0); Codex Mendoza (CC BY-NC, reported); Codex Sinaiticus (non-commercial) | Fine if Wanderstacks stays free and non-commercial; blocks any paid tier |
| Permission needed | Book of Kells (680 pages; Trinity runs an exception to its otherwise CC BY 4.0 policy, see [TCD copyright](https://www.tcd.ie/library/dris/copyright.php)) | Ask first |
| Unverified | Voynich (Yale, archive.org), Vergilius Vaticanus, Codex Gigas, Dead Sea Scrolls and most other ranked items (rank 2 to 17) | Run a rights check per item before use |

The notes recommend a small verification script that counts canvases, reads the manifest's rights field and test-fetches one image URL, so each manuscript is checked in the same way before it ships.

## Feasibility: assets, stack, and the law

### What exists to build from

No library interior ships ready to use. In Sketchfab, only three downloadable interiors were found: the Rylands Historic Reading Room (CC BY-NC, 500,000 faces), the State Library of Victoria La Trobe room (CC BY-NC-SA) and a generic NYPL building (CC BY-NC-SA). All three bar commercial use. The four Celsus models are CC BY, the Radcliffe point clouds are CC BY, the Melk exterior is CC BY, and a Rylands statue and a Psalterium model are CC BY. The Real Gabinete model (danderson4, 99,999 faces) and the Klementinum model (Polimi) can be viewed but not downloaded. Nothing turned up for the Long Room, Admont, Strahov, Joanina, St Gallen, Peabody, Rose or the Escorial library. No Gaussian splats of any target room were found, and a Matterport page for the State Library of Victoria returned 404.

Wikimedia Commons is the practical reference source. Category counts from the notes: Long Room 22; Admont 79; Strahov halls 61 and 64; Gabinete 29; Celsus 264; Joanina 89; St Gallen 35; LoC Main Reading Room 180 (licences not sampled); NYPL Rose 52; Peabody 40; Escorial 35; Klementinum 57; Radcliffe interior 10; Rylands 86 and more (all CC BY-SA 4.0 in the sample); Melk 63; State Library of Victoria 76; Dunhuang Cave 17, 50 (all public domain, manuscripts only). CC BY-SA photographs can inform modelling, but copying them into textures carries share-alike terms, so use them as reference and take textures from your own or CC0 sources.

Free and clean sources are the Smithsonian's 2,000-plus CC0 3D models ([3d.si.edu](https://3d.si.edu)) and Poly Haven (CC0). On the Sketchfab licence ladder, CC BY-NC bars commercial use, "Editorial" means no commercial use, "Standard" allows it, and a model with no licence field is all rights reserved.

AI generation is a stopgap for props, not interiors. TRELLIS.2 is MIT, Tripo's free tier is CC BY 4.0, Meshy's free tier is personal and academic only, and Hunyuan3D excludes the EU, UK and South Korea. All of those come from single sources.

### The rendering stack

The notes recommend a hybrid. Build the architectural shell by hand as a small set of modular bays with baked lightmaps. Fill shelves with `InstancedMesh` or `BatchedMesh`, with spine textures in a KTX2 atlas and Meshopt compression. Use `three-mesh-bvh` for capsule collision. For the "wow" layer, add Gaussian splats through Spark (`@sparkjsdev/spark`, MIT, v2.4.0; it reads PLY, SPZ, SPLAT, KSPLAT and SOG). Budget about 200,000 to 500,000 splats and 15 to 30 MB for mobile, though that figure comes from a secondary source (Utsubo) and has not been benchmarked. World Labs' Marble can produce splats from prompts or photos, with commercial use on the Pro plan at $35 a month, and the export specs are at [docs.worldlabs.ai/marble/export/specs](https://docs.worldlabs.ai/marble/export/specs). WebGPU (three.js r186, support near 87%) is an option, but whether Spark works with `WebGPURenderer` is unverified, so keep a WebGL2 fallback.

For page turning, the lightest path is StPageFlip (MIT, `page-flip`) drawn to a canvas and uploaded as a `CanvasTexture`, or a custom curl shader on a subdivided plane. Avoid turn.js: version 3 is non-commercial and version 4 is sold. Pre-paginate EPUB offline with epub.js (BSD-2); foliate-js (MIT) is unverified. A scan-based reader just maps IIIF page images onto the same two-page spread.

Comparable projects confirm the approach. The Assassin's Creed Discovery Tour modelled Alexandria on Celsus. "Mouthful of Dust" (State Library of Victoria) used three.js with a splat, and the World Labs "Musee du Monde" used three.js with Spark portals. Official 360-degree tours from Trinity and the Library of Congress are not reusable.

### Legal constraints

Interior freedom of panorama (FoP) is the central unknown, and the notes found no country where the interior case is clean for an interactive 3D replica.

| Jurisdiction | Interior FoP as found | Confidence |
|---|---|---|
| United States | 17 USC 120(a) covers buildings; interiors unsettled; an interactive 3D model as a "pictorial representation" is untested | Low |
| United Kingdom | Covers premises open to the public | Unverified for this use |
| Switzerland | Excludes interiors | As stated in notes |
| Czechia | Disputed | Low |
| Portugal | Likely covers public interiors | Unverified |
| Spain | Restricts commercial extraction | Unverified |
| Austria | Wikimedia Commons Europe page says exteriors only; a search summary cites case law that covers public interiors | Conflict, unresolved |
| Ireland | Unspecified | Unverified |
| Germany | Exteriors only per Commons | Medium |

France, Italy, the Vatican, Sweden, Denmark, China and Brazil were not examined for interior scope. This matters less for old buildings: Burgh, Hueber and Thumb died centuries ago, so architect copyright is not the issue for the historic targets. The risk sits with living artists and recent architects. The notes list MVRDV Binhai (2017), OMA Seattle (2004), SHL Black Diamond (1999) and SOM Beinecke (1963), plus works by living artists such as Orozco's Ballena and the Kirkeby fresco.

The workable posture from the notes: model from your own measurements and public-domain references, use your own or CC0 or PD photographs for textures, avoid logos, add a "not affiliated" disclaimer, and have counsel review before launch. Where interiors are under restoration, a replica made from pre-closure sources is an editorial advantage as well as a legal puzzle.

### Where sources disagree

| Item | Source A | Source B | Status |
|---|---|---|---|
| LoC Main Reading Room dome | 195 ft (Wikipedia, building overall) | 160 ft above the floor (low-quality source) | Likely different measuring points, not resolved |
| El Escorial hall length | 54 m | 59 m | Unresolved |
| Vatican Sistine Hall | 70 x 15 m | 80 x 16 m | Unresolved |
| Wiblingen completion | 1744 | 1740s to 1750s | Unresolved |
| Joanina architect | Joao Carvalho Ferreira | Gaspar Ferreira | Unresolved |
| Joanina volumes | 70,000 | up to 250,000 | Unresolved |
| Trinity Old Library dates | 1712-33 | 1709-32 (Wikipedia) | Unresolved |
| Eumenes II reign | 197-159 BCE | 220-159 BCE | Unresolved |
| Khuda Bakhsh holdings | About 5 million | Looks inflated | Unverified |
| Gabinete interior | Painted 1876-77 | Built 1880-87 | Date conflict |
| Vesuvius scroll 2026 | Philodemus, On Gods 8 (Epicurean) | A Stoic description in a low-quality aggregator | Take the first |
| Timbuktu manuscripts | 377,000 | 700,000 | Unresolved |
| State Library of Victoria dome | "Largest in the world" | 34.75 m dome | Claim suspect |
| Austria interior FoP | Exteriors only | Public interiors covered | Unresolved |
| US interior FoP | Unsettled | Unsettled | Open |

For modelling, pick one figure per conflict and mark it in the build notes, or measure from drawings where they exist (the LoC dome is covered by HABS).

## MVP and ideas

### Recommended MVP

Build five rooms and one reading shelf. The Long Room goes first because it is the most recognisable, has good Commons coverage, and closes in 2027, which gives the product a real news hook. Admont and Strahov Theological Hall follow, since they are baroque, well photographed and share a modular bay vocabulary with the Long Room. Add the Library of Celsus as the lost-library pillar, and make Alexandria an explicitly conjectural second scene beside it so visitors see the difference between evidence and invention. The notes' author also favoured the Gabinete as a fourth room; the report prefers the LoC Main Reading Room because its measured drawings reduce guesswork, and offers the Gabinete as the alternative if HABS access stays blocked. Skip Binhai, Seattle and Black Diamond.

For the reading side, ship a shelf of 20 to 30 titles from the verified set, led by Pride and Prejudice, Alice, Frankenstein, Moby Dick, the Canterbury Tales and Beowulf (Gummere or Hall), plus the Bodleian First Folio as the single showpiece scan under CC BY 3.0. Keep all non-commercial and permission-only scans out of the MVP, or gate them behind a non-commercial licence statement. Use Standard Ebooks where available to avoid the Project Gutenberg name issues, and drop the five geo-flagged translations from EU/UK users.

### Experience ideas

These are brainstormed for this report and are not findings from the notes. A pull-a-book interaction in which any spine on a shelf can be taken down, opened and read with the page-flip reader. A time toggle in the Alexandria room that switches between the Celsus-based fact layer and the conjectural layer, with the evidence tier shown on screen. A "last chance before 2027" walk through the Long Room that ends at the Book of Kells display. A Vesuvius mini-game where a carbonised scroll unrolls as the player turns a virtual wheel, tied to the 2026 Philodemus reading. A Timbuktu courtyard walk that explains the 2025 manuscript return. The Library of Parliament as a replica of a room that is closed until about 2032. A Borges-style infinite shelf corridor using the same instanced books. A shelf of myths and facts (Caesar did not burn everything; four Maya books survive). Mobile controls with a joystick and gyro look. A per-country badge on translations that marks which are geo-restricted, so the licensing logic becomes part of the product's character.

## Unverified register

These items were background knowledge or unsourced in the notes and are not findings. Signature-book lists for Escorial, Joanina, Vatican, Rylands, BnF, Admont, Strahov, Prunksaal and Coimbra. The Escorial Codex Aureus and Cantigas, the Rylands Gutenberg Bible and P52. The Strahov Gospels and Codex, the St Gallen Plan's role and the Trinity Brian Boru harp. Extra library candidates: Sainte-Genevieve, Wren Library, Malatestiana, Laurentian, Schussenried. Lost libraries: Hadrian, Ulpian, Constantinople, Cordoba, House of Wisdom, Siku, Ebla and Hattusa. Most manuscript rights outside the ones listed above. Photography policies for many libraries. Interior FoP for UK, Ireland, Czechia, Portugal, Spain, Italy and the Vatican, Sweden, France and Denmark, plus China and Brazil. HABS item pages (loc.gov returned 403). Per-library Commons and Sketchfab inventories for several rooms. Spark on mobile (never benchmarked). Several tech figures resting on one secondary or low-quality source.

Failed fetches recorded in the notes: Gutendex search (timeouts and 503), loc.gov (403), Standard Ebooks feeds (401), codexsinaiticus.org, Yale and roger-pearse (refused), HathiTrust (403), Internet Archive docs (502), Commons (429, retried), and a Matterport page (404). Anything that depended on those is treated as unconfirmed.

## Conclusion

The cheap part of Wanderstacks is the text, and the expensive part is the room. A full shelf of readable classics is a few days of work against IDs that have already been tested, while a single faithful library interior still means measuring, modelling and baking by hand, because the asset sweep found no usable model for any of the top candidates. That argues for a small launch and for treating licence choice as a design decision: staying non-commercial opens up the e-codices and Sinaiticus scans, while a paid tier would close them and force a switch to the Bodleian First Folio and similar CC BY sources.

The lost libraries are better as a counterpoint than as a second product. Celsus is the only one with enough evidence to stand next to a real room, and Alexandria works best when the app admits it is guessing. Time pressure also helps the pitch: with the Long Room closing in 2027 and Ottawa and Stockholm shut for years, a careful replica serves a real gap, provided the interior-FoP question gets a lawyer's answer before anything is published.
