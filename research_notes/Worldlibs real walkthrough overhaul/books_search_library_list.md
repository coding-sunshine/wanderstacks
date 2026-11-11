# WorldLibs data layer: free book sources, schema, static search, library list gaps (state: 10 Nov 2026)

Method and honesty note. About 30 tool calls. Live-verified this session: HTTP status, content type and CORS header of the endpoints in table 1 (curl), and the contents of 5 IIIF manifests. Rate limits and licences come from fetched docs or search summaries, labelled. Items tagged [BG] are background knowledge, not checked live. Wikimedia APIs rate-limited me mid-session, so most spot-checks use WebFetch of Wikipedia, which is a secondary source. Existing repo notes in `research_notes/WorldLibs libraries and books/` were read first (manuscripts_iiif.md in full); their [BG] items are re-marked where still unverified.

Current data shape (read from repo, 10 Nov 2026):
- `data/libs.json`: 52 libraries. Fields: id, n, p, lat, lon, k (hall/rotunda/dome/atrium/site), y, yl, tier (mvp/w2/later/lost), ev (known/probable/speculative), st, dim, book, read, phase, wd (Wikidata QID). By region: heavily Europe and North America; Asia 11 (India 6, China 3, Korea, Japan); Africa 5 (Alexandria x2, Timbuktu, Nairobi, Celsus is Türkiye); Latin America 3 (Rio, Puebla, Mexico City).
- `data/books.json`: 202 records, only 82 tied to a library (`lib` null on 120, mostly global-shelf Gutenberg/Standard Ebooks texts). 19 libraries have 0 or 1 book; 7 records failing. Access split: 135 readable-text, 48 catalog-only, 13 readable-scan, 6 ghost. Per-record fields already good: shelfmark, catalogue_url, read{kind,url,licence,canvases,cors}, source, quote, status, check command.
- `data/facts.json`: 269 facts, 28 failing (all unresolved dimensions or opening status), plus 68 corrections. Tiers: 138 primary, 84 wikipedia, 47 secondary.
- Gap: `libs.json` `book` field empty for ~20 libraries (e.g. BnF, NYPL, BPL, Peabody, Mafra, Melk, Weimar, Stockholm, Pergamon, Admont, Malatestiana, Joanina, Sainte-Geneviève show "No single title confirmed yet" or blank).

---

## 1. Free book and manuscript APIs, dumps and IIIF: coverage, limits, licence, key, viewer suitability

### Takeaway
Use a two-tier pipeline: (a) build-time harvest from Wikidata (CC0, 307k items carry an IIIF manifest URL), Open Library dumps, Gutenberg catalogue CSV and Europeana (CC0 metadata) into a static JSON catalogue; (b) runtime IIIF manifests fetched directly by the browser for the reader, only from hosts that send `Access-Control-Allow-Origin` (Bodleian, e-codices, Yale, Internet Archive confirmed; Vatican, Wellcome, BSB did not show the header in my HEAD test, so proxy or pre-cache their manifests). Loc.gov, Gallica and DPLA block unauthenticated bot traffic (HTTP 403 from my curl), so harvest them with a key or from a normal browser session, never at runtime.

### Cited Findings
Live-tested endpoints (curl, 10 Nov 2026, generic research user-agent):

| Service | Endpoint tested | Result | CORS header seen |
|---|---|---|---|
| Open Library search | `https://openlibrary.org/search.json?q=book+of+kells&limit=1` | 200 JSON | none |
| Open Library dumps page | `https://openlibrary.org/developers/dumps` | 200 | n/a |
| Internet Archive advanced search | `https://archive.org/advancedsearch.php?q=voynich&fl[]=identifier&rows=1&output=json` | 200 JSON | `*` |
| Gutendex | `https://gutendex.com/books/?search=dante` | 200 JSON | none |
| Gutenberg catalogue CSV | `https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv` | 200, 5.8 MB | n/a |
| Wikidata SPARQL | `https://query.wikidata.org/sparql?query=...&format=json` | 200 | `*` |
| HathiTrust Bib API | `https://catalog.hathitrust.org/api/volumes/brief/oclc/424023.json` | 200 JSON | `*` |
| Europeana Search | `https://api.europeana.eu/record/v2/search.json?wskey=api2demo&query=gutenberg&rows=1` | 200 JSON (demo key) | none |
| DPLA | `https://api.dp.la/v2/items?q=gutenberg` | 403 (needs key) | n/a |
| LoC JSON API | `https://www.loc.gov/books/?q=gutenberg&fo=json&c=1` | 403 HTML (bot block) | n/a |
| LoC manifest | `https://www.loc.gov/item/52002339/manifest.json` | 403 (same as repo note; still unproven) | n/a |
| Gallica manifest | `https://gallica.bnf.fr/iiif/ark:/12148/btv1b8600309f/manifest.json` | 403 HTML (bot block; ark may also be arbitrary) | n/a |
| Gallica SRU | `https://gallica.bnf.fr/services/engine/search/sru?...` | 403 | n/a |
| WDL | `https://www.wdl.org/en/` | 403 | n/a |
| Crossref (reference only) | `https://api.crossref.org/works?rows=0` | 200 | `*` |

Limits, licences, keys:
- Open Library: 1 req/s unidentified, 3 req/s with a User-Agent carrying app name and contact email; docs say not to bulk download via API, use monthly dumps — [Open Library API guidelines](https://openlibrary.org/developers/api). Data licence page referenced at `/developers/licensing`, not read; Open Library dump data is generally described as public domain/CC0-style [BG, check page].
- Wikidata Query Service: 60 s hard timeout; about 60 s processing per 60 s window; 30 error queries/min; 5 parallel queries per IP; 429 then bans; User-Agent policy enforced; results CC0 — [WDQS user manual](https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual). Live query this session: property P6108 is labelled "IIIF manifest URL" and `SELECT COUNT(*) WHERE { ?x wdt:P6108 ?m }` returned 307,086 items — [WDQS](https://query.wikidata.org/sparql).
- Gutendex: params `search`, `languages`, `topic`, `author_year_start/end`, `ids`, `copyright`, `mime_type`, `sort`; 32 results per page; no rate limit documented; the author says self-host for sustained use — [Gutendex](https://gutendex.com/). For a static build, the CSV catalogue above (5.8 MB) is simpler than Gutendex. PG licence: public domain in the US, with trademark rules on the "Project Gutenberg" name [BG].
- Library of Congress JSON/YAML API: 20 requests per minute, one-hour block if exceeded, may tighten under load (429 or CAPTCHA); max 1,000 items per page; stay under 100,000 results per query by faceting — [LoC working within limits](https://www.loc.gov/apis/json-and-yaml/working-within-limits/). Other LoC services (text, image, media) 150/min, streaming 60/min per a search summary — [LoC image services](https://www.loc.gov/apis/micro-services/image-services/). No key needed. LoC content is mostly "no known restrictions" per item rights statement.
- Europeana: free API key; metadata is CC0; external rate limit about 120 requests per 10 s; no throttle on reads otherwise (search summary of Europeana docs) — [Europeana API docs index](https://pro.europeana.eu/page/apis) (my WebFetch got 403; figures from search summaries at [terms of use](https://europeana.eu/en/rights/terms-of-use)). The public key `api2demo` worked in curl but is for testing only. Per-item rights vary (RightsStatements and CC); show the `edmRights` value.
- DPLA: free key by email, passed as `api_key`; partner metadata is CC0 — [DPLA API basics](https://pro.dp.la/developers/api-basics), [terms](https://dp.la/about/terms-conditions). Mostly US material; low value for the 52-library list beyond LoC, NYPL, Boston Public Library and Harvard items.
- Gallica (BnF): IIIF Presentation 2.1 manifests at `https://gallica.bnf.fr/iiif/ark:/12148/{ark}/manifest.json`; no explicit rate limit published, but one community note says more than one request per 3 s is treated as abuse; reuse: free for non-commercial use with credit "Source gallica.bnf.fr / Bibliothèque nationale de France" — [BnF IIIF API page](https://api.bnf.fr/fr/api-iiif-de-recuperation-des-images-de-gallica), [data.gouv listing](https://www.data.gouv.fr/dataservices/api-gallica-iiif). The 1-per-3-seconds figure is from a third-party package note, not BnF.
- HathiTrust: Bib API works without a key (tested); Data API needs OAuth keys; full text only for public-domain volumes; page images via `babel.hathitrust.org` are not IIIF [BG]. Terms page returned 403 to WebFetch, so licence of metadata is unverified (Hathifiles are described as CC0-ish [BG]).
- Internet Archive: search and metadata endpoints open; `access-control-allow-origin: *` on advancedsearch; no published fixed quota, fair-use throttling (search summary). IA serves IIIF through `iiif.archivelab.org`; my test `https://iiif.archivelab.org/iiif/voynich_MS_408/manifest.json` returned no response (000), so treat IA IIIF as unverified; use `https://archive.org/download/{id}/` page images and the `{id}_jp2.zip` instead.
- Bodleian: IIIF 2.x manifests at `https://iiif.bodleian.ox.ac.uk/iiif/manifest/{uuid}.json`; tested a manifest (84 canvases), CORS `*`. Rights text is per item (the one I fetched said access restricted). Digital Bodleian site terms usually CC BY-NC 4.0 for items [BG]; the repo note records CC BY 3.0 for the First Folio — [Bodleian blog](https://blogs.bodleian.ox.ac.uk/digital/2016/04/23/introducing-the-iiif-first-folio/).
- e-codices (Fribourg): manifests at `https://www.e-codices.unifr.ch/metadata/iiif/{id}/manifest.json`; tested `csg-1092` (Plan of St Gall) = 2 canvases, licence field `https://creativecommons.org/licenses/by-nc/4.0/`, CORS `*`; `csg-0002` = 575 canvases, same licence. Non-commercial only.
- Vatican DigiVatLib: `https://digi.vatlib.it/iiif/MSS_Vat.lat.3225/manifest.json` returned 200, IIIF 2.x, 162 canvases for Vergilius Vaticanus, attribution "Images Copyright Biblioteca Apostolica Vaticana", no `license` field, no CORS header seen. Treat as permission-needed for republishing page images.
- Yale (Beinecke): `https://collections.library.yale.edu/manifests/2002046` returned 200, IIIF 3, 213 canvases, label "Cipher manuscript" (Voynich MS 408), CORS `*`; no explicit licence in the manifest (record page states rights; not read).
- Trinity College Dublin Digital Collections: `https://digitalcollections.tcd.ie/concern/works/pz50gw142` returns 200 HTML, but both `/iiif/pz50gw142/manifest` and `/concern/works/pz50gw142/manifest` returned HTML, not JSON, so my guessed IDs/paths do not yield a manifest. Book of Kells is the explicit exception to TCD's CC BY policy and needs written permission — [TCD rights](https://www.tcd.ie/library/dris/copyright.php) (via repo note).
- Bayerische Staatsbibliothek: `https://api.digitale-sammlungen.de/iiif/presentation/v2/bsb00035319/manifest` returned 200 JSON (item content not inspected). BSB data in general is CC BY-NC-SA / public-domain-mark by item [BG].
- Wellcome: `https://iiif.wellcomecollection.org/presentation/v2/b18035723` returned 200 `application/ld+json` IIIF 2 (not a WorldLibs library, but a good IIIF-viewer test fixture).
- British Library: `api.bl.uk` did not connect; the BL manuscripts viewer page still responds (200) but the repo note records post-cyberattack limits with no downloads, and no IIIF found; treat all BL items as "link out" — [Medievalists.net](https://www.medievalists.net/2024/10/medieval-manuscripts-return-british-library/).
- Heidelberg (`digital.ub.uni-heidelberg.de`) did not connect from my network; unverified.
- Biblissima (`https://iiif.biblissima.fr/`) 200: aggregator index of IIIF manifests across institutions; useful for finding manifest URLs for treasures — [Biblissima](https://iiif.biblissima.fr/).
- Wikimedia Commons and Wikisource: free licences (CC0/CC BY-SA/PD by file); Commons serves IIIF manifests per file and category [BG]; Wikisource gives proofread text for public-domain works [BG]. API limits are tighter than documented: my modest burst of ~15 `api.php` calls triggered "too many requests" — [Wikimedia API rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits).
- World Digital Library: site returned 403 to curl. WDL is an archive since 2021 hosted at LoC [BG]; do not depend on it.
- IIIF spec status: Presentation API 3.0 live at `https://iiif.io/api/presentation/3.0/` (200). Mixed 2.x and 3.x manifests are in the wild, as seen above (Bodleian, Vatican, e-codices = 2.x; Yale = 3.x).

Viewers (can page images be shown?): all three viewers consume IIIF manifests; (a) OpenSeadragon for a single deep-zoom image (Plan of St Gall, mappa mundi), (b) Mirador or Universal Viewer for full page-turn codices, (c) a custom page-flip over Image API URLs `{service}/full/!1200,1200/0/default.jpg` when the product wants its own look. Rights gate the display, not technology: Kells (permission), Sinaiticus (non-commercial), e-codices (NC), Vatican (restricted) can be linked or embedded only after checking terms. This matches the repo's existing note on page-turn suitability; I did not re-verify Mirador/UV licences (both open source, MIT/Apache [BG]).

### Inferences
- Build the catalogue from open metadata (Wikidata CC0 + Europeana CC0 + Open Library + Gutenberg CSV) and store only the manifest URL and a rights string per treasure. Do not store images.
- A nightly or manual script (not runtime) should fetch each manifest, record canvas count, `license`/`rights`, label, and a thumbnail URL, and write `read.canvases`, `read.licence`, `cors`. This closes the 19 repo records whose `read.canvases` is null.
- Rights field must be three-state: `open` (CC0/PDM/CC BY), `nc` (NC licence; show only on a non-commercial site and with attribution), `link-only` (Kells, Vatican, BL).

### Gaps
- Licence wording for Open Library data, HathiTrust metadata, Bodleian per-item terms: pages not fetched or blocked.
- Whether TCD publishes a public IIIF manifest for MS 58 and its exact URL: not found; guessed paths failed.
- LoC and Gallica manifests could not be proven from this network (403).
- Europeana daily quota claim of 10,000 requests/day: not confirmed, only 120 per 10 s.

---

## 2. Digitised-collection endpoints for each library's signature treasures

### Takeaway
I could verify live manifests for only five treasures (St Gall Plan, Cod. Sang. 2, Vergilius Vaticanus, Voynich, a Bodleian sample). The rest below are portal URLs from the repo notes and background knowledge, flagged. The larger win is structural: store a `portal` and `manifest` per library and let the nightly script confirm them.

### Cited Findings
Verified live (200, parsed):
- St Gall, Plan of St Gall Cod. Sang. 1092: `https://www.e-codices.unifr.ch/metadata/iiif/csg-1092/manifest.json`, IIIF 2, 2 canvases, CC BY-NC 4.0, CORS `*`.
- St Gall, Cod. Sang. 2 (Gospel codex, 575 canvases): `https://www.e-codices.unifr.ch/metadata/iiif/csg-0002/manifest.json`, CC BY-NC 4.0, CORS `*`. All Cod. Sang. use the same scheme `csg-{4-digit shelfmark}`.
- Vatican: Vergilius Vaticanus `https://digi.vatlib.it/iiif/MSS_Vat.lat.3225/manifest.json`, 162 canvases, rights "Images Copyright Biblioteca Apostolica Vaticana".
- Vatican pattern for other codices: `https://digi.vatlib.it/iiif/MSS_{shelfmark with dots}/manifest.json` (Pal. lat. 1632 style from repo note) [BG, not tested].
- Beinecke: Voynich = Yale object 2002046, `https://collections.library.yale.edu/manifests/2002046`, IIIF 3, 213 canvases, CORS `*`.
- Bodleian manifest pattern `https://iiif.bodleian.ox.ac.uk/iiif/manifest/{uuid}.json` and viewer `https://digital.bodleian.ox.ac.uk/objects/{uuid}/` (both 200 with a sample). The UUIDs for Duke Humfrey's treasures (First Folio, Codex Mendoza) must be copied from their Digital Bodleian pages; the First Folio site is `https://firstfolio.bodleian.ox.ac.uk/` — [Bodleian blog](https://blogs.bodleian.ox.ac.uk/digital/2016/04/23/introducing-the-iiif-first-folio/).
- Trinity College Dublin Long Room: portal `https://digitalcollections.tcd.ie/` (200); Kells work page `https://digitalcollections.tcd.ie/concern/works/pz50gw142` (200, Hyrax/Samvera-style; the Hyrax manifest path was not found by guess).

Per-library endpoint table. "Verified" = I fetched it; otherwise [BG] with the portal domain to open.

| Library | Treasure | Endpoint / portal | IIIF | Status |
|---|---|---|---|---|
| Long Room, Trinity | Book of Kells TCD MS 58; Book of Durrow MS 57 | digitalcollections.tcd.ie | probably (Samvera) [BG] | page verified, manifest not; Kells permission-only |
| Bodleian | First Folio Arch. G c.7; Codex Mendoza MS. Arch. Selden A.1; Gutenberg Bibles | digital.bodleian.ox.ac.uk; firstfolio.bodleian.ox.ac.uk | yes, 2.x | manifest host verified |
| St Gall | Plan of St Gall; Cod. Sang. | e-codices.unifr.ch | yes | verified |
| Vatican | Vergilius Vaticanus; Codex Vaticanus | digi.vatlib.it | yes, 2.x | verified for Vat. lat. 3225 |
| LoC | Gutenberg Bible; Waldseemüller map; Lincoln papers | loc.gov/item/{id}/ and tile.loc.gov | yes [BG] | 403 to curl; repo notes CORS `*` on tile.loc.gov |
| BnF | Gutenberg Bible, Jikji, Très Riches Heures (copy), Labrouste hall | gallica.bnf.fr | yes, 2.1 | 403 to curl; browser works [BG] |
| Austrian National Library | Tabula Peutingeriana, Prunksaal globes | digital.onb.ac.at; onb.digital | yes [BG] | unverified |
| Strahov | Strahov Gospels, Strahov Evangeliary | Czech Manuscriptorium (manuscriptorium.com) | partly [BG] | unverified |
| El Escorial | Codex Aureus Escurialensis Vitr. 17 | rbme.patrimonionacional.es [BG] | unknown | unverified |
| Anna Amalia (Weimar) | Faust copies, Luther-Bible collection | haab-digital.klassik-stiftung.de [BG] | yes [BG] | unverified |
| Stockholm / KB (Codex Gigas) | Codex Gigas A 148 | kb.se (Codex Gigas page) | unconfirmed | repo note |
| Morgan | Gutenberg Bible x3, Hours of Catherine of Cleves | corsair.themorgan.org; themorgan.org digital | yes [BG] | unverified |
| NYPL | Gutenberg (Lenox copy), Eliot Indian Bible, Bay Psalm Book | digitalcollections.nypl.org; API token required [BG] | yes [BG] | unverified |
| BPL | Bay Psalm Book, Medieval MSS | archive.org/details/bostonpubliclibrary, ark.digitalcommonwealth.org [BG] | via IA | unverified |
| Hereford | Mappa Mundi | herefordcathedral.org (zoomable) | no [BG] | repo note |
| Malatestiana | Cesena codices | Manus Online / Biblioteca Malatestiana portal [BG] | unknown | unverified |
| Joanina (Coimbra) | Coimbra Univ. MSS | digitalis-dsp.uc.pt [BG] | yes [BG] | unverified |
| Palafoxiana | Nuremberg Chronicle copy | none confirmed | no | gap |
| Saraswathi Mahal, Khuda Bakhsh, Asiatic Soc., Haeinsa, Tianyige | | no IIIF source found | | gap; use Wikimedia Commons and e.g. Haeinsa Tripitaka via Korean cultural heritage sites [BG] |
| Dunhuang | Diamond Sutra BL Or.8210/P.2 | idp.bl.uk (International Dunhuang Project) | partial [BG] | repo note: unverified |
| Timbuktu | Sankore manuscripts | Tombouctou Manuscripts Project (Cape Town) [BG]; Hill Museum & Manuscript Library | partial | unverified |
| Nineveh | Ashurbanipal tablets | British Museum collection online; Cuneiform Digital Library Initiative (cdli.mpiwg-berlin.mpg.de) [BG] | CDLI open data | CDLI is CC0-style open data [BG] |
| Herculaneum | Villa of the Papyri | Biblioteca Nazionale Napoli; Digital Philodemus Project [BG] | no | unverified |

Wikidata can fill gaps: P6108 (IIIF manifest URL) is attached to 307,086 items (live count). A SPARQL query by `P195` (collection) or `P276` (location) for each library QID in `libs.json` will list manifest-bearing items per library, which is the fastest way to discover manifest URLs without scraping portals.

### Inferences
- Libraries whose treasures are actually elsewhere (Alexandria, Pergamon, Nalanda, Vikramashila, Baghdad) need "survivals" or "reconstruction" records pointing to the holder (British Museum, CDLI, Berlin Pergamon, etc.), already the repo's `relation: survived/known-lost` pattern.
- India, China, Korea, Japan, Africa have almost no open IIIF endpoints; expect the book list there to lean on Wikimedia Commons, Wikisource, and holder pages, so mark "digitised: no" honestly rather than inventing links.

### Gaps
- I did not locate the actual manifest URLs for Kells, Gutenberg copies at LoC/BnF, Strahov Gospels, Escorial codices, Admont Riesenbibel, Palafoxiana: portals blocked, offline, or not searched.
- Most "yes [BG]" IIIF claims above need a live check by the nightly script.

---

## 3. What a per-library book list should contain; sites that do this well

### Takeaway
Treat each book as a catalogue record with the exact shelfmark, date, language, provenance chain, physical description, digitised link plus rights, and a citation, then show it as a treasure card. The repo's `books.json` already carries most of this; what is missing is date normalisation, provenance, subject/language, and a reading-room "why it matters" line that is not generated.

### Cited Findings
Examples of this model working (from my background knowledge; I did not re-fetch pages this session unless noted):
- Digital Bodleian (digital.bodleian.ox.ac.uk): shelfmark in title, IIIF viewer, per-item rights, download — URL verified live as 200 above.
- e-codices: description records with shelfmark, date, origin, physical description, bibliography, one-click IIIF manifest — manifest verified live.
- Yale Beinecke / LUX: shelfmark, rights statement, manifest link, 213 canvases for the Voynich — verified live.
- Polona, Gallica, Europeana: faceted record pages with rights statement badges [BG].
- Manuscriptorium and Schoenberg Database of Manuscripts (sdbm.library.upenn.edu) give provenance chains [BG].
- Wikidata infobox style: P195 collection, P217 inventory number, P6108 manifest, P571 inception — properties verified by use (P6108 queried live).

### Inferences
Proposed treasure-card contents (beyond the current schema):
1. `title`, `uniform_title`, `language[]` (ISO 639), `script`
2. `date_display` plus `date_earliest`/`date_latest` integers (facets by century)
3. `holder_lib` (libs id), `holder_name`, `shelfmark`, `former_shelfmarks[]`
4. `provenance[]`: ordered owners with years and one source each
5. `extent` (leaves/canvases), `material`, `dimensions`
6. `digitised`: `{kind: iiif|image|pdf|text|none, manifest_url, portal_url, rights: open|nc|link-only, rights_text, attribution}`
7. `why`: 1-2 sentences, human-written (the existing `why` field)
8. `citations[]`: at least one primary (catalogue) and one secondary; keep existing `quote` + `check` pattern
9. `wikidata`, `viaf`/`cerl_thesaurus` IDs for dedupe
10. `subjects[]` (controlled: 15 or so top-level categories) and `tags`
11. `verified_on` date and `status` (keep binary passing/failing per the user's rule)

### Gaps
- I did not fetch and compare a rich-card UI (e.g. Europeana, DPLA) this session; the design above is derived, not benchmarked.

---

## 4. Search for a static site: options, sizes, facets

### Takeaway
For 5,000 to 50,000 records, use Pagefind (build-time, chunked index, filters and sorts, no server) for the free-text plus facets experience, or MiniSearch/Orama if you need fully custom ranking on a single JSON. Skip hosted Typesense/Meilisearch unless you outgrow static hosting. For 5,000 records, a single MiniSearch index is fine; at 50,000 use Pagefind or SQLite-over-HTTP.

### Cited Findings
- Pagefind runs after the static generator, emits a static bundle, no server; goal is tens of thousands of pages searchable with little bandwidth — [Pagefind docs](https://pagefind.app/docs/), [search summary](https://pagefind.app/docs/api). Filters are key to arrays of strings and sorts are key to string — [Pagefind filtering](https://pagefind.app/docs/js-api-filtering/). `addCustomRecord` lets you index non-HTML records (url, content, language required; optional meta, filters, sort) via the Node API — [Pagefind Node API](https://pagefind.app/docs/node-api/). Pagefind 1.5.0 adds a Component UI.
- FlexSearch about 6 KB bundle; Orama about 22 KB bundle — [pkgpulse comparison summary](https://www.pkgpulse.com/guides/fusejs-vs-flexsearch-vs-orama-client-side-search-2026). MiniSearch: small library with fuzzy and prefix search and in-memory index (MiniSearch GitHub, [issue 76](https://github.com/lucaong/minisearch/issues/76)). I could not get usable, comparable index-size benchmarks at 50,000 documents; search summary numbers were garbled and are not reported here.
- SQLite in the browser: `sql.js-httpvfs` queries a SQLite file hosted statically through HTTP Range requests; read-only; experimental; needs an `sql-wasm.wasm` and a worker; FTS5 requires a custom build flag `-DSQLITE_ENABLE_FTS5` — [sql.js-httpvfs](https://github.com/PotatoSpud/sql.js-httpvfs) and [write-up](https://dev.to/recca0120/query-sqlite-on-github-pages-with-sqljs-httpvfs-11do).
- Hosted servers (Typesense Cloud, Meilisearch Cloud, Algolia): not researched this session; free tiers change often [BG].

### Inferences
Back-of-envelope sizing, my estimate (not measured): a record with title, author, short description, shelfmark, tags is about 400 to 700 bytes of searchable text. 5,000 records is about 3 MB raw JSON and under 1 MB gzipped; 50,000 is about 30 MB raw, so it must be chunked.

| Option | 5k records | 50k records | Facets (library, century, language, subject) | Verdict |
|---|---|---|---|---|
| MiniSearch (JSON in memory) | fine | loads 10-30 MB, slow on mobile | filter by predicate yourself | use for 5k |
| Orama / FlexSearch | fine | same memory issue | Orama has facets built in [BG] | use for 5k if you want built-in facets |
| Pagefind | good | good (chunked) | native filters, counts via `filters()` | recommended at both sizes |
| SQLite WASM + httpvfs (FTS5) | overkill | good, tens of MB served by Range | SQL GROUP BY gives exact counts | use if you want structured queries or per-library joins |
| Typesense/Meilisearch | needs a server | fine | best facets and typo tolerance | only if moving off pure static |

Recommended build: `catalogue.ndjson` (source of truth, committed) -> script emits `catalogue.sqlite` for analysis, and `pagefind` index via `addCustomRecord` where each record has `filters: {library, century, language, subject, access}` and `sort: {year}`. Each book also gets a static page `/books/{id}` so Pagefind sees real content and the books are linkable and SEO-indexable. Century as a filter value computed from `date_earliest`.

### Gaps
- No measured index sizes at 5k/50k for Pagefind, MiniSearch, Orama; run a 20-minute spike on a synthetic 50k file before committing.
- Free-tier terms for hosted search not collected.

---

## 5. Library list: what is missing from the 52

### Takeaway
The 52 skew to Central European Baroque halls and Anglophone reading rooms. Biggest holes: the Islamic world (only Baghdad and Alexandria), the Italian humanist libraries (Laurenziana, Ambrosiana, Marciana), East Asia beyond three sites, Africa beyond Timbuktu/Alexandria/Nairobi, Latin America beyond Rio/Puebla/Mexico City, and modern architecture (almost nothing after 2006 except Binhai). Proposed 30 additions below, each with a reason; Wikipedia page existence was checked with HTTP 200 only (pages not read), so every justification is background knowledge and the date/figure claims need confirming when adding the record.

### Cited Findings
Authoritative reference lists checked:
- UNESCO Memory of the World International Register totals 570 inscriptions after the 17 April 2025 additions of 74 items — [Devdiscourse summary](https://www.devdiscourse.com/article/headlines/3352535-unesco-adds-74-new-entries-to-memory-of-the-world-register-now-totals-570); my search found no 2026 update. Malatestiana and Palafoxiana (both already in the list) were inscribed in 2005 per Wikipedia pages fetched this session: [Malatestiana](https://en.wikipedia.org/wiki/Biblioteca_Malatestiana), [Palafoxiana](https://en.wikipedia.org/wiki/Palafoxiana_Library).
- Wikipedia lists of oldest/largest libraries and the Wikidata `P1435` heritage-status query are the usual cross-checks; I did not fetch those lists this session.

Proposed additions. Page links return HTTP 200 unless noted; read them before adding.

Islamic world and Middle East:
1. Al-Qarawiyyin Library, Fez, Morocco (859 CE university; library restored and reopened in 2016) — oldest still-operating associated library claim; Wikipedia title tried was 404, so cite the official/other source: gap.
2. Süleymaniye Library, Istanbul (manuscripts of the Süleymaniye complex, 16th c. mosque) — [Süleymaniye Mosque](https://en.wikipedia.org/wiki/S%C3%BCleymaniye_Mosque); one of the largest Islamic manuscript collections [BG].
3. Astan Quds Razavi Library, Mashhad, Iran (Wikipedia page title 404; find another source) — [BG] one of the oldest and largest Persian-Islamic libraries.
4. Dar al-Kutub, Cairo, Egypt (1870) — national library with Mamluk Qur'ans [BG]; Wikipedia title tried was 404.
5. National Library of Israel, Jerusalem — Ardon reading room history; new campus building opens in the 2020s [BG: opening date unverified] — [National Library of Israel](https://en.wikipedia.org/wiki/National_Library_of_Israel).
6. St Catherine's Monastery library, Sinai, Egypt — one of the oldest continuously operating libraries, Codex Sinaiticus origin — [St Catherine's](https://en.wikipedia.org/wiki/Saint_Catherine%27s_Monastery).
7. Matenadaran, Yerevan, Armenia — ancient manuscripts institute, 1957 building, UNESCO MoW listed [BG] — [Matenadaran](https://en.wikipedia.org/wiki/Matenadaran); official site https://www.matenadaran.am/ returned 200.

Africa:
8. Chinguetti libraries, Mauritania (desert manuscript libraries) [BG]; no page tested.
9. Ahmed Baba Institute, Timbuktu (new building and conservation of the manuscripts in the existing Timbuktu entry) — fold into existing `timbuktu` rather than adding.
10. Ethiopian monastery libraries (e.g. Garima Gospels at Abba Garima) [BG]; no page tested.
11. Grey Collection / National Library of South Africa, Cape Town [BG]; untested.

South and Central Asia:
12. Raza Library, Rampur, India (1774) — Indo-Islamic manuscripts — [Raza Library](https://en.wikipedia.org/wiki/Raza_Library).
13. Kaiser Library, Kathmandu, Nepal — Wikipedia title tried was 404; verify elsewhere.
14. Tibetan monastic libraries: Sakya Monastery library [BG], Potala Palace; no page tested.
15. Al-Biruni Institute of Oriental Studies, Tashkent, Uzbekistan [BG].

East Asia:
16. Kyujanggak (Gyujanggak) Royal Library, Seoul (1776) — Joseon royal library, UNESCO MoW listed [BG] — [Kyujanggak](https://en.wikipedia.org/wiki/Kyujanggak).
17. Shōsōin, Nara, Japan (8th c. repository of Tōdai-ji, treasure house) — [Shōsōin](https://en.wikipedia.org/wiki/Sh%C5%8Ds%C5%8Din); more a treasury than a library, so tier "later".
18. Wenyuange, Forbidden City, Beijing (1776, housed the Siku Quanshu) — [Wenyuange](https://en.wikipedia.org/wiki/Wenyuange); pairs with Tian Yi Ge as a Qing imperial library, but is a design source for the Chinese pavilion type.
19. National Diet Library, Tokyo (1948) [BG]; low architectural value, high data value (NDL digital collections and IIIF are well-known [BG]).

Europe (gaps):
20. Biblioteca Medicea Laurenziana, Florence (Michelangelo's vestibule and reading room, 16th c.) — [Laurentian Library](https://en.wikipedia.org/wiki/Laurentian_Library).
21. Biblioteca Ambrosiana, Milan (1609; Codex Atlanticus) — [Biblioteca Ambrosiana](https://en.wikipedia.org/wiki/Biblioteca_Ambrosiana); official site https://www.ambrosiana.it/ returned 200.
22. Biblioteca Marciana, Venice (Sansovino) — [Biblioteca Marciana](https://en.wikipedia.org/wiki/Biblioteca_Marciana).
23. Wren Library, Trinity College Cambridge (1695) — [Wren Library](https://en.wikipedia.org/wiki/Wren_Library).
24. John Rylands Library, Manchester (1900) — [John Rylands](https://en.wikipedia.org/wiki/John_Rylands_Research_Institute_and_Library); holds Papyrus P52 (repo note).
25. Chetham's Library, Manchester (1653), England's oldest public library [BG] — [Chetham's](https://en.wikipedia.org/wiki/Chetham%27s_Library).
26. Herzog August Library, Wolfenbüttel (Lessing was librarian; one of the great early-modern libraries) — [Herzog August Library](https://en.wikipedia.org/wiki/Herzog_August_Library).
27. Codrington Library, All Souls, Oxford — [Codrington Library](https://en.wikipedia.org/wiki/Codrington_Library); marginal against Bodleian already listed.
28. Kungliga biblioteket, Stockholm (Codex Gigas; the repo note covers the codex but there is no library record) — https://www.kb.se returned 200.

Latin America and Americas:
29. National Library of Brazil, Rio (1810; largest in Latin America [BG]) — [National Library of Brazil](https://en.wikipedia.org/wiki/National_Library_of_Brazil).
30. Biblioteca Nacional Mariano Moreno, Buenos Aires (Brutalist building, Clorindo Testa [BG]) — [BN Mariano Moreno](https://en.wikipedia.org/wiki/Biblioteca_Nacional_Mariano_Moreno).
31. Beinecke Rare Book & Manuscript Library, Yale (1963; Gordon Bunshaft/SOM translucent marble) — [Beinecke](https://en.wikipedia.org/wiki/Beinecke_Rare_Book_%26_Manuscript_Library); Voynich lives here (manifest verified above).
32. Phillips Exeter Academy Library (Louis Kahn, 1972) — [Phillips Exeter Library](https://en.wikipedia.org/wiki/Phillips_Exeter_Academy_Library).
33. Seattle Central Library (OMA, 2004) — [Seattle Central Library](https://en.wikipedia.org/wiki/Seattle_Central_Library).
34. Vyborg Library (Alvar Aalto, 1935) — [Vyborg Library](https://en.wikipedia.org/wiki/Vyborg_Library).
35. Modern architecture to consider (no pages tested): Biblioteca Virgilio Barco, Bogotá (Salmona), Black Diamond Copenhagen, Oodi Helsinki (Wikipedia title tried 404), Deichman Bjørvika Oslo, Sendai Mediatheque, Tama Art University Library.

### Inferences
- Priority 10 (my ranking, by "story + data + imagery"): Laurenziana, Ambrosiana, St Catherine's, Süleymaniye, Matenadaran, Kyujanggak, Beinecke, Wren, National Library of Brazil, Al-Qarawiyyin (once sourced). They cover missing regions and have rich digital collections or strong imagery.
- "Lost libraries" are well covered; "great modern libraries" are the weakest category.
- Two existing entries would sit better folded: `alexandria` (lost) and `alexandrina` (modern) are both in Alexandria, fine; `nli` is National Library of India, so a National Library of Israel record needs a distinct id.

### Gaps
- I did not read UNESCO MoW list entries to cross-check which of the 570 are libraries rather than documents. Most MoW items are documents, not libraries; use it for books, not for the library list.
- Africa and Latin America candidates (8, 10, 11, 14, 15) have no verified source; do 1 targeted search each before adding.
- Did not compare against lists of largest libraries (LoC, BL, Russian State Library, National Library of China) — [BG] these are all missing except LoC.

---

## 6. Spot check of ten libraries against sources

### Takeaway
The existing data is cautious and mostly consistent with what I could check. No outright wrong value found; four items are worth rewording and 28 `facts.json` entries are honestly marked failing (dimensions not found). The weakest areas are dimensions and status fields, not dates.

### Cited Findings
- Palafoxiana (`palafoxiana`, y 1646): founding 1646, building completed 1773, MoW 2005, over 45,000 volumes — [Wikipedia](https://en.wikipedia.org/wiki/Palafoxiana_Library). Data uses 1646 and a "Nuremberg Chronicle" book; fine. Suggest `yl: "Founded 1646; hall completed 1773"`.
- Malatestiana (`malatestiana`, y 1452): built 1447-1452, opened 15 Aug 1454; "first civic library in Europe" — [Wikipedia](https://en.wikipedia.org/wiki/Biblioteca_Malatestiana). Suggest `yl: "1447-52; opened 1454"`. The first-civic-library claim is a Wikipedia assertion, not a primary one; soften to "an early civic library" unless sourced to the library.
- Joanina (`joanina`, 1717-28): 1717-1728, architect João Carvalho Ferreira, about 70,000 volumes (some sources up to 250,000 across floors), Domenico Duprà portrait of John V 1725 — [Wikipedia](https://en.wikipedia.org/wiki/Biblioteca_Joanina). Dates match. The volume count has a source conflict; pick a figure from the university's own page.
- Klementinum (`klementinum`, 1709-26): Wikipedia says main building phase 1709-1726, ceiling by Jan Hiebl, complex 20,000 m² — [Wikipedia](https://en.wikipedia.org/wiki/Klementinum). Matches the data; the failing 41 x 12 m dimension is correctly marked LEAD ONLY.
- Mafra (`mafra`, dim 88 x 9.5 x 13 m, shelves 1771): Wikipedia gives 88 m x 9.5 m x 13 m and over 36,000 volumes — [Wikipedia](https://en.wikipedia.org/wiki/Mafra_National_Palace). Consistent. The data lists both ~30,000 (primary) and 36,000 (Wikipedia); keep the primary one and note the Wikipedia figure.
- Tian Yi Ge (`tianyige`, 1561-66): built 1561 by Fan Qin, who died 1585; holds about 300,000 volumes today (post-1949); under 20,000 volumes by 1940; National Heritage Site 1982 — [Wikipedia](https://en.wikipedia.org/wiki/Tianyi_Pavilion). The end year 1566 is not in this page; the data should show a source for "1566".
- Hereford (`hereford`, "1611-"): cathedral page says the Mappa Mundi dates from the later 13th century or around 1300 and the library centre opened 3 May 1996; the date the books were chained was not on the fetched page — [Wikipedia](https://en.wikipedia.org/wiki/Hereford_Cathedral). "1611" and "largest surviving chained library" need their primary source in facts.json (the claim "largest in the world" is on the page).
- Haeinsa (`haeinsa`, "housed since 1398"): UNESCO page returned 403; not verified this session. Treat as unchecked.
- Long Room (`longroom`, 63.7 m, 1712-32): my fetch of the Wikipedia page returned the wrong article (Lord's Cricket Ground); not verified. The `facts.json` already marks bays per side and gallery height as unproven.
- Library of Congress (`loc`): 1890-97 build, opened 1897 per Wikipedia (data matches); dims marked UNPROVEN in the data. The Gutenberg record "BS75 1454" is flagged copy-identity unconfirmed.
- Gutenberg Bible at LoC: `https://www.loc.gov/item/52002339/manifest.json` remains unproven (403); repo note says the manifest URL is a pattern guess.

### Inferences
- Three data presentation risks: "first/largest/oldest" superlatives (Malatestiana, Hereford, Palafoxiana "first public library in the Americas"), mixed volume counts, and dates that conflate founding with the surviving hall. Add a `claim_type` of `fact | superlative | estimate` and require a primary source for superlatives.
- Two bigger structural gaps: 120 of 202 books have no library; 19 libraries have 0 or 1 book. These matter more than any single wrong number.

### Gaps
- Only 8 of the 10 requested libraries were meaningfully checked, and only against Wikipedia; no primary-source fetches this session except TCD rights (via repo note). Haeinsa and Long Room were not verified.
- Not checked: Alexandria (reading room 20,000 m², 11 levels), Binhai (33,700 m²), Vasconcelos (38,000 m²), Peabody, Stockholm, Strahov (Wikipedia 404 for the title I used).

---

## 7. Proposed data layer (summary of recommendations)

### Takeaway
Keep JSON, add a normalised `catalogue` file and a build step; do not add a database service. Pull from open metadata at build time, link to IIIF at runtime, and search with Pagefind.

### Cited Findings
- Wikidata (CC0, 307,086 items with an IIIF manifest URL) is the best seed; see section 1.
- LoC limits (20/min) and Gallica bot-blocking mean harvest slowly or by hand; see section 1.

### Inferences
Pipeline:
1. `data/catalogue/seed.sparql` per library QID -> `data/catalogue/wikidata-{lib}.json` (cache; respects 5 parallel queries and 60 s timeout).
2. Enrichment: Open Library dump (author/work IDs), Gutenberg CSV (public-domain texts), Europeana (rights, thumbnails).
3. `scripts/check-manifest.mjs`: for each IIIF URL fetch, store canvases, rights, thumbnail, CORS; set `status` passing/failing.
4. `books.json` stays hand-curated (the ~200 treasures with quotes and checks); `catalogue.ndjson` holds the 5k to 50k notable-books layer. Link them by `wikidata` ID and `shelfmark`.
5. Pagefind index from `addCustomRecord`, facets library/century/language/subject/access.
6. Per-library page: curated 8 to 15 treasures (signature, shelfmark, date, provenance, read link, citation) + "more from this library" from the catalogue.
Target counts (my proposal): 10 curated treasures per library for the 52 (520), plus 30 for new libraries; 5,000 catalogue records at launch from Wikidata plus Gutenberg bestsellers; grow only if the spike confirms Pagefind handles 50k.

### Gaps
- Effort and legal sign-off (Kells permission, NC licences on a commercial or ad-supported site) are owner decisions, not researched.
- I did not check the licence of Europeana thumbnails per partner, nor whether Open Library dumps carry additional attribution rules.
