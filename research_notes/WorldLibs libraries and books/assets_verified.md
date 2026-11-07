# Verified 3D / photo / splat / drawing assets for top WorldLibs libraries (queried 2026-11-07)

Method: Sketchfab public API (`api.sketchfab.com/v3/search?type=models&q=...&count=24`, 2 query sets per library), Wikimedia Commons API (categoryinfo + first-40-file `LicenseShortName` sample), WebSearch for splats/Matterport/HABS. loc.gov returned HTTP 403 to curl, Python and WebFetch, so HABS item pages could not be opened. Sketchfab API shows `license: null` for most non-downloadable models; "none shown" below means null in API, NOT public domain, treat as all-rights-reserved. Sketchfab search is keyword based: absence = "not found by these queries", not proof of absence. Complements assets_tech_legal.md (which already has John Rylands Reading Room CC BY-NC and the SLV "Mouthful of Dust" splat note).

## Which Sketchfab models exist, and under what license?

### Takeaway
Only 4 full-interior library models are downloadable at all, and none is commercially clean: John Rylands (CC BY-NC), SLV La Trobe (CC BY-NC-SA), NYPL generic (CC BY-NC-SA, not the Rose room). Library of Celsus is the exception: 3 downloadable CC BY (attribution) exteriors/ruins, usable commercially with credit. Most hero interiors (Long Room, Admont, Strahov, Joanina, St. Gallen, Melk, Peabody, Mogao 17, Escorial library) have no Sketchfab model found.

### Cited Findings
Source for every row: Sketchfab API responses, query URL pattern `https://api.sketchfab.com/v3/search?type=models&q=<name>&count=24` (queries run 2026-11-07). "NC/ND flag" = not commercial-safe.

| Library | Models found (title / author / license / faces / downloadable) | Verdict |
|---|---|---|
| Trinity Long Room | None of the room. Only unrelated: "The Castle Otway harp (Trinity College Dublin)" simonchadwick, CC BY, 2.3M faces, dl yes ([link](https://sketchfab.com/3d-models/ee08e973b2ef4562be9f2da85f7b6812)); "TCD Library Square Statue" ktkchaos, none shown, 467,749 f, dl no; "Bacon" rafapages CC BY 287,652 f | no room model |
| Admont | None. Only "Admonter Madonna" museum-joanneum, none shown, 3.7M f, dl no | none |
| Strahov | None of the library. Exterior bits by alex.pripis.: "Old wall/Steps/Old door at Strahov Monastery" all CC BY-NC-SA, dl yes (NC flag) | none |
| Real Gabinete (Rio) | "Real Gabinete Português de Leitura" by danderson4, none shown, 99,999 f / 50,349 v, dl NO, published 2015 ([link](https://sketchfab.com/3d-models/5e3b6e89f9144194b2b6b10f73c61e9f)). Only hit; low-poly reference only | viewable only |
| Celsus (Ephesus) | "Library of Celsus - Crowdsourced photogrammetry" miguelbandera, CC BY, 1,097,107 f / 549,773 v, dl yes ([link](https://sketchfab.com/3d-models/1cc6ad6af508422398f60f902cb70e88)); "Library of Celsus" unhvrc, CC BY, 1,720,366 f / 1,060,089 v, dl yes ([link](https://sketchfab.com/3d-models/765d86f2269049029484801a5e14832c)); "3D Model of the Library of Celsus" iedu360.eu, CC BY, 88,299 f / 44,290 v, dl yes ([link](https://sketchfab.com/3d-models/75456d194b6b420f86cf2898fd909b41)); "Library of Celcus Ruins" CCreighton, CC BY, 109,796 f, dl yes. Non-downloadable: roofstacks (120,982 f), uremuseum (381,789 f), scutari line art, gozzque (7.5M f), "Statue of Arete" lebegopont (Standard, 3,896 f, dl no) | BEST: 4 CC BY downloadables (commercial OK with attribution; verify each model's textures). Facade only, no interior |
| Joanina (Coimbra) | None (queries "Biblioteca Joanina", "Joanina", "Coimbra library"). Only "Livro de 1739 do Concílio de Trento" carpetudo CC BY 990,073 f, dl yes (a book scan, could be a prop) | none |
| St. Gallen | None of the hall. "St Galler Globus" endeavour1, none shown, 13,722 f, dl no | none |
| LoC Jefferson Bldg | "The Great Hall, Library of Congress [Point Cloud]" nebulousflynn, none shown, 499,912 v, no faces, dl no; "Library Of Congress" 3Dlights, CC BY-NC, 79,886 f, dl yes (NC flag); "Library Of Congress Low Poly Game Ready" malovsky, Standard, 9,011 f, dl no (store/uncertain); "Lion Feature - NYPL" is NYPL not LoC. Main Reading Room: none | NC or not downloadable |
| NYPL Rose | "NYPL Rose Main Reading Room chair from SASB" nypl_diu, none shown, 500,000 f / 249,994 v, dl no ([link](https://sketchfab.com/3d-models/89e8c72300a041169c821d488a395793)); "New York Public Library" sungmatt, CC BY-NC-SA, 407,806 f, dl yes (NC, building not room); "Celeste Bartos Forum" Vlad.Dumitru Standard 457,152 f dl no; "Lion Feature" nebulousflynn none shown 728,768 f dl no; "Harlem Branch NYPL" UofA-CDH CC BY 2,305 f dl yes (different branch) | no Rose room model |
| Peabody | None ("Mount Vernon Statue" only) | none |
| El Escorial | "El Escorial" skaldy, Editorial, 2,966,300 f, dl no; "Escorial ... map/basilica scan" asensio, Editorial, 82,848 / 62,000 f, dl no. None of the library | Editorial = no commercial use |
| Klementinum | "Vault of Klementinum Baroque Library" haha_polimi, none shown, 63,243 f / 32,256 v, dl NO ([link](https://sketchfab.com/3d-models/e1fc3dcef950477f881a1641bb150dc8)); "Globe" haha_polimi, 440,613 f, dl no | academic (Polimi) viewable only; contact author possible (not tested) |
| Radcliffe Camera / Duke Humfrey | Radcliffe: siadstudio point clouds, "Radcliffe Camera - 360 Measurements (E,B)" and "(E,C)" CC BY, 3.67M vertices, 0 faces (point cloud), dl yes ([link](https://sketchfab.com/3d-models/2c19280b90b246f6baa50d347872d43b), [link](https://sketchfab.com/3d-models/c8f36c1d570f4baaba5610d7620f18ea)); "(E,M)" 1,692,946 f dl no; "Stone stairs from Oxford" sv.stats CC BY 500k f. Duke Humfrey: none. "oxford library church ... harry potter" asensio Editorial dl no (200,396 f) | Radcliffe: CC BY point clouds (exterior/measurement scans, points not mesh). Duke Humfrey none. Note: "(E,x)" meaning of siadstudio suffix unverified |
| John Rylands | TheJohnRylandsLibrary: "Historic Reading Room" CC BY-NC, 500,000 f / 249,978 v, dl yes; "Historic Staircase" CC BY-NC 19,800 f; "Historic Entrance" CC BY-NC 19,800 f; "Blueprint Model" CC BY-NC (16 f); "Latin MS 235" CC BY-NC; "Statue of Mrs Enriqueta Rylands" CC BY, 350,554 f dl yes; "Latin MS 108 - Psalterium" CC BY, 2,505,868 f dl yes ([room](https://sketchfab.com/3d-models/99e77453302c48f2af4a8127d360e743)) | rooms NC; statue and one manuscript CC BY |
| Melk | "Stift Melk" Castles-3D, CC BY, 659,214 f, dl yes ([link](https://sketchfab.com/3d-models/86f07455b62043948480c57f1c4a6621)) (exterior abbey; library not confirmed); another "Stift Melk" Castles-3D 2.5M f dl no; "[XR]noe human nature - Stift Melk" mwintersberger CC BY 32,360 f dl yes; "Jakob Prandtauer" noe-3d.at 286,468 f dl no | CC BY exterior only; library interior unverified |
| SLV La Trobe | "Draft: La Trobe Reading Room (SLV)" uomdigitisation (Univ. Melbourne), CC BY-NC-SA, 1,008,040 f / 506,459 v, dl yes ([link](https://sketchfab.com/3d-models/081ac34de8dd42bd80ac452607578538)); "Latrobe's statue" same author CC BY-NC-SA 749,999 f dl yes; "Pop-up Maker Space 2" CC BY-NC-SA; "SLV Emmerson Book - Trial Scan" CDHR_ANU CC BY 930,606 f dl yes | main room NC-SA: reference only |
| Mogao Cave 17 | No Cave 17 model. "[CC0]Mogao Caves-莫高窟" s10255129, license label "Free Standard" (title says CC0, API label is not CC0, treat as unverified), 2,247,064 f, dl yes ([link](https://sketchfab.com/3d-models/f4f3e524da5c440bb9c228de724192bc)); "Mogao Cave Landscape (Dunhuang)" xz317 CC BY 190,028 f dl yes; "Kneeling Attendant Bodhisattva" harvardartmuseums CC BY 999,296 f dl yes; "DunHuang" ZhuJinLi none shown 1.5M f dl no | cliff-landscape only |

### Inferences
- Clean commercial candidates: Celsus x4 (CC BY), Radcliffe point clouds (CC BY), Rylands statue/Psalterium (CC BY), Melk exterior (CC BY), Harvard bodhisattva (CC BY). Everything interior-relevant for Rylands, SLV is NC.
- For Long Room, Admont, Strahov, Joanina, St. Gallen, Peabody, LoC Reading Room, Rose room, Escorial library: must be modelled from photos.
- Low-poly or point-cloud counts mean even downloadable ones would need retopo for mobile (Celsus 1.1-1.7M f).

### Gaps
- Sketchfab `license: null` on non-downloadable models: real license not visible; could not verify on model pages (not fetched).
- Did not run `downloadable=true` variants separately; the downloadable flag in the full result set made it redundant, but search ranking could hide low-ranked items beyond 24 hits for generic queries (LoC, Melk, NYPL, Rylands returned 24 = cap).
- Sketchfab collections/user profiles (e.g. Trinity, ARCHiOx, Polimi, UConn) not browsed.

## Wikimedia Commons: categories, interior counts, licenses

### Takeaway
Every target except none has a Commons category with CC BY / CC BY-SA / CC0 / PD interior photos; best-covered: Main reading room LoC (180 files), Celsus (264), Radcliffe (421, only 10 interior), Strahov halls (61 + 64), Rose room (52), Admont (79). All are share-alike or attribution, usable for commercial texture reference only if SA obligations are handled (CC BY-SA 3.0/4.0 is dominant, so derived textures/imagery from them carry SA). CC0/PD subsets exist and are the safest.

### Cited Findings
Counts from Commons API `prop=categoryinfo` (files directly in category, subcats extra). License mix = first 40 files, `LicenseShortName`. URLs are `https://commons.wikimedia.org/wiki/Category:<name>`.

| Library | Category (URL slug) | Files (subcats) | License sample |
|---|---|---|---|
| Long Room | [Old_Library,_Trinity_College,_Dublin](https://commons.wikimedia.org/wiki/Category:Old_Library,_Trinity_College,_Dublin) | 22 (2) | CC BY-SA 3.0 x12, CC BY 4.0 x5, CC0 x1, CC BY 2.0/3.0, BY-SA 2.0/4.0 |
| Admont | [Stiftsbibliothek_Admont](https://commons.wikimedia.org/wiki/Category:Stiftsbibliothek_Admont) (+ Frescos in..., Sculptures in...) | 79 (3) | BY-SA 3.0 x30, BY-SA 4.0 x7, PD x2, "No restrictions" x1 |
| Strahov | [Strahov_Library](https://commons.wikimedia.org/wiki/Category:Strahov_Library) 21 files; [Philosophical_hall_of_Strahov_library](https://commons.wikimedia.org/wiki/Category:Philosophical_hall_of_Strahov_library) 61; [Theological_hall_of_Strahov_library](https://commons.wikimedia.org/wiki/Category:Theological_hall_of_Strahov_library) 64 | 146 total | Strahov_Library sample: CC0 x10, BY-SA 4.0 x5, PD x3, BY-SA 3.0 x2, BY 3.0 x1 (halls not license-sampled) |
| Real Gabinete | [Real_Gabinete_Português_de_Leitura_-_interior](https://commons.wikimedia.org/wiki/Category:Real_Gabinete_Portugu%C3%AAs_de_Leitura_-_interior) | 29 (1); parent 26 files | BY-SA 4.0 x11, BY-SA 3.0 x11, BY 2.0 x3, BY 3.0 br x2, PD x2 |
| Celsus | [Library_of_Celsus](https://commons.wikimedia.org/wiki/Category:Library_of_Celsus) | 264 (4) | BY-SA 4.0 x22, BY-SA 3.0 x5, BY 2.0 x4, PD x3, others. Facade, no real interior (ruin) |
| Joanina | [Biblioteca_Joanina](https://commons.wikimedia.org/wiki/Category:Biblioteca_Joanina) 59 files; [Interior_of_Biblioteca_Joanina](https://commons.wikimedia.org/wiki/Category:Interior_of_Biblioteca_Joanina) 30 | 89 | BY 2.0 x12, BY-SA 3.0 x10, BY-SA 2.0 x8, BY-SA 4.0 x8, PD x1 |
| St. Gallen | [Stiftsbibliothek_St._Gallen](https://commons.wikimedia.org/wiki/Category:Stiftsbibliothek_St._Gallen) | 35 (10) | PD x17 (likely manuscript scans), BY-SA 4.0 x13, BY-SA 3.0 x4 |
| LoC Main Reading Room | [Main_reading_room_of_the_Library_of_Congress](https://commons.wikimedia.org/wiki/Category:Main_reading_room_of_the_Library_of_Congress) (the similarly named "Library of Congress main reading room" is empty) | 180 (2) | not sampled (unverified) |
| NYPL Rose | [Rose_Main_Reading_Room](https://commons.wikimedia.org/wiki/Category:Rose_Main_Reading_Room) | 52 (0) | BY 2.0 x8, BY-SA 4.0 x7, BY-SA 3.0 x7, BY 3.0 x4, BY-SA 2.0 x4, "No restrictions" x4, PD x2, CC0 x1, BY 2.5 x2 |
| Peabody | [George_Peabody_Library](https://commons.wikimedia.org/wiki/Category:George_Peabody_Library) | 40 (2) | PD x18, BY-SA 4.0 x8, BY 2.0 x7, CC0 x4, BY 4.0 x2, BY-SA 3.0 x1 |
| Escorial | [Library_of_the_Monastery_of_El_Escorial](https://commons.wikimedia.org/wiki/Category:Library_of_the_Monastery_of_El_Escorial) | 35 (4) | PD x12, BY-SA 3.0 x6, BY-SA 4.0 x6, others; many likely manuscript scans |
| Klementinum | [Interior_of_Clementinum_Prague](https://commons.wikimedia.org/wiki/Category:Interior_of_Clementinum_Prague) (no dedicated Baroque Library category found) | 57 (9) | BY-SA 4.0 x30, PD x6, BY-SA 3.0 x2, BY 4.0, CC0 |
| Radcliffe / Duke Humfrey | [Radcliffe_Camera_(Interior)](https://commons.wikimedia.org/wiki/Category:Radcliffe_Camera_(Interior)) 10 files; [Radcliffe_Camera](https://commons.wikimedia.org/wiki/Category:Radcliffe_Camera) 421; [Duke_Humfrey's_Library_(interior)](https://commons.wikimedia.org/wiki/Category:Duke_Humfrey%27s_Library_(interior)) 23; Duke_Humfrey's_Library 14 | interiors 33 | Radcliffe interior: BY-SA 3.0 x4, BY 4.0 x4, BY-SA 4.0 x2 |
| Rylands | [John_Rylands_Library,_Deansgate](https://commons.wikimedia.org/wiki/Category:John_Rylands_Library,_Deansgate) 86 files; subcat Interior_of_John_Rylands_Library,_Deansgate (count not fetched) | 86+ (8) | all 40 sampled CC BY-SA 4.0 |
| Melk | [Library_of_Melk_Abbey](https://commons.wikimedia.org/wiki/Category:Library_of_Melk_Abbey) 58; Frescos_in_Melk_Abbey_library 5 | 63 | BY-SA 3.0 x21, BY-SA 4.0 x8, PD x3, CC0 x2, BY 2.5 x4, BY-SA 2.0 x2 |
| SLV | [Interior_of_the_State_Library_of_Victoria](https://commons.wikimedia.org/wiki/Category:Interior_of_the_State_Library_of_Victoria) (no "La Trobe Reading Room" category exists) | 76 | BY-SA 4.0 x16, BY-SA 3.0 x10, PD x7, CC0 x2, BY 2.0 x2 |
| Mogao Cave 17 | [Cave_17,_Mogao_Caves](https://commons.wikimedia.org/wiki/Category:Cave_17,_Mogao_Caves) | 50 (3) | 40/40 sampled Public domain (manuscript scans, not the cave interior; the cave is a tiny 3x3 m chamber) |

### Inferences
- Adequate texture/reference sets: Admont, Strahov, Joanina, LoC, Rose, Klementinum, Melk. Thin: Long Room (22), Radcliffe interior (10), Escorial library (35 incl. manuscripts), Mogao 17.
- Use CC0/PD subset for anything redistributed in the build; BY-SA photos are for reference only unless the SA obligation is accepted.

### Gaps
- License sampling covered only the first ~40 files per category, not all; LoC Main Reading Room, Strahov halls not sampled (API sample for LoC category name returned empty because the wrong category was queried first).
- "Interior photo" count is a category-level file count, not a manual check that each file is an interior.
- Two Commons API 429 rate limits hit; results completed after retry.

## Matterport / 360 tours / Gaussian splats

### Takeaway
Nothing downloadable found. Only a Matterport "Reading Room at State Library of Victoria" showcase page appears, and no splats of any target library surfaced in searches. Matterport scans are not extractable under normal terms (per prior notes).

### Cited Findings
- Search surfaced a Matterport media page titled "Reading Room at State Library of Victoria" — [matterport.com/de/media/873](https://matterport.com/de/media/873) (WebFetch of this URL returned 404, so tour owner, link, and embed/download status are unverified).
- A Matterport directory also lists St Edmund Hall Old Library, Oxford (not a target) — [WeGetAround thread](https://www.wegetaroundnetwork.com/topic/18173/matterport-examples-libraries/) (search snippet only).
- Search for Gaussian splats of Long Room, Admont, Strahov on Polycam, Luma, Scaniverse, SuperSplat returned no library-specific hits — WebSearch results, 2026-11-07 (not exhaustive; those galleries are JS apps not well indexed).
- Previously known: SLV Redmond Barry Reading Room splat in "Mouthful of Dust", asset not public — [three.js forum](https://discourse.threejs.org/t/mouthful-of-dust-a-ned-kelly-web-experience/85925).

### Inferences
- Absence in search is weak evidence; manual browse of polycam.ai/explore, lumalabs.ai/capture, superspl.at, scaniverse.com/explore, kiri engine galleries by hand with search terms is still needed. Their licenses are per-capture and typically all rights reserved unless stated.

### Gaps
- Did not check Polycam/Luma/Scaniverse/SuperSplat/KIRI sites directly (no API; JS rendered).
- No Matterport tours confirmed for Joanina, Long Room, Peabody, Real Gabinete (search found none).
- Google Arts & Culture, CyArk, Europeana 3D not checked.

## Public floor plans / measured drawings (HABS etc.)

### Takeaway
LoC Jefferson Building and likely Peabody have HABS documentation, but loc.gov blocked all programmatic and WebFetch access (403), so counts, sheet lists, and rights were not verified. NYPL HABS not confirmed.

### Cited Findings
- Search result summary: HABS DC-351 documents the Library of Congress Jefferson Building (NE corner of First St and Independence Ave SE, built 1888-1897); search listed loc.gov HABS items but I could not open them — [WebSearch result set](https://www.loc.gov/item/dc0221) (URL listed, content not verified; a DC-351 title was in the search tool's summary only).
- LoC digitized "nearly 1,000 architectural drawings documenting [the Jefferson Building's] construction" for its 125th birthday (Nov 2022); a 2024 post adds drawings 802-807 (Great Hall floor zodiac) — [LoC Picture This blog](https://blogs.loc.gov/picturethis/2024/01/more-jefferson-building-drawings-digitized/) (fetched; blog gives no rights statement or HABS number). These are original construction drawings by Smithmeyer & Pelz / Edward Pearce Casey era, search in Prints & Photographs Online Catalog.
- HABS collection totals: more than 581,000 measured drawings, photographs and histories for 43,000+ structures — [LoC HABS about page](https://www.loc.gov/collections/historic-american-buildings-landscapes-and-engineering-records/about-this-collection/) (search snippet). HABS material is generally US government work, public domain (general knowledge, unverified for each item).
- Peabody: a search summary cited "HABS MD-1209" and loc.gov item md1689, but I could not open either and the MD-1209 number conflicts with an item ID pattern (md1689); treat as unverified — [loc.gov/item/md1689](https://www.loc.gov/item/md1689) (403 on fetch).
- NYPL Central Building: NRHP listed 15 Oct 1966, NRIS 66000546 — [historypointer](https://historypointer.com/nris/resource/66000546). No HABS record found by search.
- Non-US: no measured-drawing sources searched (Trinity, Admont etc.). Sketchfab Radcliffe point clouds (siadstudio, 3.67M points, CC BY) are the only measured-survey data found for a non-US target.

### Inferences
- Jefferson Building is the best-documented target; the ~1000 construction drawings plus HABS give plans, sections, and Great Hall details.

### Gaps
- Couldn't verify HABS DC-351 sheet count, Peabody/NYPL HABS numbers, or rights; retry by hand in a browser at loc.gov.
- No search done for CyArk, Historic England/Dublin City council drawings, Czech/Austrian heritage drawings, or Swiss ISOS.
