# Official and third-party virtual tours and 3D scans for the 52 Wanderstacks libraries

As of November 2026. PARTIAL: this pass verified tours for roughly 15 libraries. Rows marked "not checked" were not searched, which is different from "none found". Only URLs I opened are cited, with the HTTP status seen. Embed test used `curl -sIL -A "Mozilla/5.0"`; a missing X-Frame-Options (XFO) or CSP frame-ancestors header means no restriction was observed, not that embedding is permitted by the terms.

## Which libraries have a real, free, walkable tour or 3D scan, and can it be embedded?

### Takeaway
Verified walkable interiors exist for Admont, Weimar, Vatican Sistine Hall, Prunksaal (Google Arts & Culture, renovation-era), Trinity (adjacent rooms only, not the Long Room) and State Library Victoria (a 3D scan). Most are link-out only; Admont (discover-culture), Weimar (3dtopevent, rooom), Trinity (CloudPano) and the Sketchfab models are embeddable by observation. Terms of reuse were not confirmed for any tour platform page.

### Cited Findings

Table. Columns: library | tour or scan found | verified URL (HTTP) | platform | coverage | iframe-embeddable | licence or terms.

| # | Library (id) | Tour / scan found | Verified URL (HTTP) | Platform | Coverage | Embeddable | Licence / terms |
|---|---|---|---|---|---|---|---|
| 1 | Trinity Long Room (longroom) | No Long Room tour found. Trinity lists CloudPano tours of the Library Complex, Hamilton and John Stearne | [tcd.ie 360 page](https://www.tcd.ie/library/using-library/360.php) (200); CloudPano ids `_JKNOIx10eo`, `BhcHd8gSh`, `pc6zMSbWh` (200 each) | CloudPano | Other Trinity library spaces, not the Long Room | Yes by observation (no XFO/CSP); no official embed code seen | Not stated; unverified |
| 1b | Long Room, third party | Panoramic Ireland page | [Panoramic Ireland Long Room](https://www.panoramicireland.com) page tested (200) | Panoramic Ireland | Long Room | No, XFO SAMEORIGIN | Commercial site; terms not read |
| 2 | Admont (admont) | Admont Abbey Library tour | [tour.discover-culture.com/?prod=25](https://tour.discover-culture.com/?prod=25) (200); linked from [stiftadmont.at about-the-abbey-library](https://www.stiftadmont.at/en/about-the-abbey-library/) (200) | Discover Culture | Library hall | Yes by observation (no XFO/CSP); stiftadmont.at itself sends CSP frame-ancestors 'self' | Terms not read |
| 3 | Strahov (strahov) | No official tour found. 360gigapixels page tested; 360cities pages exist (403 to curl) | 360gigapixels Strahov (200, no XFO) | 360gigapixels, 360cities | Philosophical and Theological Halls (gigapixel stills) | 360gigapixels yes by observation; 360cities unknown | 360cities: all rights reserved per search result; not verified |
| 4 | Library of Congress (loc) | Sketchfab Great Hall point cloud uid 2f0987ff635e4a7fa85631d54a62dc0b; loc.gov/visit page | [loc.gov/visit](https://www.loc.gov/visit/) (200) | Sketchfab | Great Hall | loc.gov page: no (XFO sameorigin). Sketchfab embed route not tested for this uid | Not downloadable, no licence shown |
| 5 | Celsus (celsus) | Crowdsourced photogrammetry uid 1cc6ad6af508422398f60f902cb70e88 | Sketchfab embed route tested (200, no XFO) | Sketchfab | Exterior ruin, 1,097,107 faces | Yes, official Sketchfab embed | CC BY, downloadable, tagged noai |
| 6 | Alexandria (alexandria) | Bibliotheca Alexandrina 3D tour page | [bibalex.org virtual tour project](https://www.bibalex.org/en/page/ba_virtual_tour_project) (200 after redirects); earlier note: "Temporarily Unavailable" | Own site | Unavailable | Not testable | Unknown |
| 6b | Alexandria, reconstructions | Sketchfab "Reconstruction Libary of Alexandria" 51ed617d0f7a4cc2b6624226d559df46; "Alex Library" 257017ad9b5042fd84461cf4499adedd | Sketchfab API (200) | Sketchfab | Artist reconstructions of the ancient library, not a real building | Not tested | Not downloadable, no licence shown |
| 7 | Prunksaal (prunksaal) | ONB "Virtual State Hall" page; Google Arts & Culture 360 exhibit | [onb.ac.at virtual-state-hall](https://onb.ac.at/en/museums/state-hall/visit/virtual-state-hall) (302 then 200, title "Virtual State Hall"); GA&C exhibit (302 then 200) | ONB page; Google Arts & Culture | State Hall | ONB page: no XFO seen on final 200; the tour itself was not located inside the page. GA&C: no, XFO SAMEORIGIN | Not read. Hall is closed for renovation per earlier notes |
| 8 | BnF (bnf) | none found (searches for Richelieu/Tolbiac tours; one snippet mentions a companion webapp, unverified) | none | n/a | n/a | n/a | n/a |
| 9 | St Gall (stgallen) | none found; stiftsbibliothek.ch not opened; stiftsbezirk.ch/en 404 | none | n/a | n/a | n/a | n/a |
| 10 | Mafra (mafra) | Sketchfab point cloud uid 9f0e51bf79ca478b95f60209b5d8fd04 by museusemonumentosdeportugal; GA&C partner page | Sketchfab embed route (200, no XFO); [GA&C partner page](https://artsandculture.google.com/partner/mafra-national-palace) (200, XFO SAMEORIGIN) | Sketchfab; Google Arts & Culture | 11,126,859 vertices, created 2024-04-26. Interior scope UNRESOLVED (no description, no tags, thumbnail is a placeholder) | Sketchfab yes; GA&C no | CC BY, downloadable |
| 11 | NYPL (nypl) | none found; Sketchfab hits are a chair and a statue only | [nypl.org Schwarzman](https://www.nypl.org/locations/schwarzman) (200) | n/a | n/a | n/a | n/a |
| 12 | Boston Public Library (bpl) | Sketchfab uid e96a15f086ec47779f4c4a4b5ff143c4 | Sketchfab API (200); bpl.org Central returned 202 (no content) | Sketchfab | 301,048 faces; earlier notes call it a stair-alcove fragment | Not tested | CC BY, downloadable |
| 13 | Peabody (peabody) | none found; only a statue on Sketchfab; site returned 000 | none | n/a | n/a | n/a | n/a |
| 14 | Bodleian (bodleian) | Old IMEX tour 404 (dead). VHL RSL induction tour 404 (dead). No live 360 replacement found. Sketchfab Radcliffe Camera exterior models | [visit.bodleian.ox.ac.uk](https://visit.bodleian.ox.ac.uk/) (200, XFO SAMEORIGIN) lists guided tours only; Sketchfab "360 Measurements (E,B)" uid 2c19280b90b246f6baa50d347872d43b | Sketchfab | Radcliffe Camera exterior only; Duke Humfrey's not found | Bodleian page no; Sketchfab embed not tested | Sketchfab model CC BY, downloadable; "3D Point Cloud (E,C)" not downloadable |
| 15 | Escorial (escorial) | Patrimonio Nacional / Spain Film Commission photogrammetry project site | [assetsdigitales-escorial.spainfilmcommission.com/en](https://assetsdigitales-escorial.spainfilmcommission.com/en/) (200, no XFO/CSP); content not extracted (page renders via script) | Spain Film Commission | Unknown; whether the library is included was not confirmed | Page yes by observation | Unknown. Sketchfab "El Escorial" 415fc492908448b2a6a6d08134eb000a is Editorial, not downloadable; armillary sphere 962f96fb5cc3464091e03f639c3f3053 is an object, CC BY-NC-SA |
| 16 | Gabinete Português (gabinete) | Sketchfab uid 5e3b6e89f9144194b2b6b10f73c61e9f | Sketchfab API (200) | Sketchfab | Unverified | Not tested | Not downloadable, no licence shown |
| 17 | Melk (melk) | none found; stiftmelk.at not opened | none | n/a | n/a | n/a | n/a |
| 18 | Klementinum (klementinum) | Sketchfab vault uid e1fc3dcef950477f881a1641bb150dc8; GA&C partner page for the National Library of the Czech Republic | [GA&C partner page](https://artsandculture.google.com/partner/national-library-of-the-czech-republic) (200, XFO SAMEORIGIN) | Sketchfab; Google Arts & Culture | Unverified | Sketchfab not tested; GA&C no | Sketchfab: not downloadable, no licence shown |
| 19 | Vatican (vatican) | Official Sistine Hall virtual tour | [museivaticani.va salone-sistino tour](https://www.museivaticani.va/content/dam/museivaticani/tour-virtuali/salone-sistino/tour.html) (200, title "Salone Sistino", XFO SAMEORIGIN) | Vatican Museums | Salone Sistino | No | Not read |
| 20 | Wiblingen (wiblingen) | none for the library hall. Sketchfab "Benediktinerabtei Wiblingen" uid 4a02231297a7414da43a819cabdb31af is the abbey | Sketchfab API (200) | Sketchfab | Abbey, 750,018 faces | Not tested | CC BY-NC, downloadable |
| 21 | Weimar Anna Amalia (weimar) | Klassik Stiftung 3D tour of the Rococo Hall; rooom 360 views; Sketchfab Anna Amalia Bibliothek uid a9d57b352282492e9f442b595a3fc608 | [3dtopevent.info/haab](http://3dtopevent.info/haab/) (301 then 200, no XFO/CSP); [klassik-stiftung.de 360 tours](https://www.klassik-stiftung.de/en/home/digital/virtual-insights/360-virtual-tours/) (200); rooom views [g6Ut3r8dKTw](https://rooom.com/360-view/g6Ut3r8dKTw), [vhoh6Eg9xBZ](https://rooom.com/360-view/vhoh6Eg9xBZ), [bVosVKFeMLH](https://www.rooom.com/360-view/bVosVKFeMLH) (200, no XFO) | 3dtopevent; rooom; Sketchfab | Rococo Hall (3dtopevent). Which rooom views are library rooms is not confirmed | 3dtopevent and rooom yes by observation | Terms not read. Sketchfab model 705,596 faces, not downloadable, no licence shown. Commons equirects are CC BY-SA 4.0 per earlier notes |
| 22 | Ottawa Parliament (ottawa) | Experience Parliament | [experienceparliament.ca](https://experienceparliament.ca) (301 then 200, no XFO); parl.ca/visit 404 | Own site | Not confirmed to include the Library | Page yes by observation | Not read |
| 23 | Stockholm (stockholm) | none found | none | n/a | n/a | n/a | n/a |
| 24 | Nineveh (nineveh) | none found on Sketchfab | none | n/a | n/a | n/a | n/a |
| 25 | Pergamon (pergamon) | Sketchfab Athena object only | none verified | Sketchfab | Object, not the library | n/a | CC BY-NC-SA |
| 26 | Herculaneum (herculaneum) | not checked | none | n/a | n/a | n/a | n/a |
| 27 | Nalanda (nalanda) | GA&C story; Sketchfab "Monastery room" uid 87ca44d0d4f34879b54b4fafe067fe0c | [GA&C story](https://artsandculture.google.com/story/cQWhgvVSyhQA8A) (200, XFO SAMEORIGIN) | Google Arts & Culture; Sketchfab | Relevance of the Sketchfab model unverified (391,816 faces) | GA&C no | Sketchfab CC BY-NC-SA, downloadable |
| 28 | Dunhuang (dunhuang) | Digital Library Cave (Tencent with Dunhuang Academy) via Digital Dunhuang site or WeChat mini-program, per press. Exact URL not found | none opened | Digital Dunhuang / WeChat | Library Cave | Unknown | Unknown. Sketchfab Bodhisattva is an object, CC BY |
| 29 | Buda (buda) | none found on Sketchfab; other platforms not checked | none | n/a | n/a | n/a | n/a |
| 30 | Timbuktu (timbuktu) | none found on Sketchfab; other platforms not checked | none | n/a | n/a | n/a | n/a |
| 31 | Vikramashila (vikramashila) | not checked | none | n/a | n/a | n/a | n/a |
| 32 | Thanjavur (thanjavur) | none found on Sketchfab; other platforms not checked | none | n/a | n/a | n/a | n/a |
| 33 | Khuda Bakhsh (khudabakhsh) | not checked | none | n/a | n/a | n/a | n/a |
| 34 | National Library of Ireland (nli) | not checked | none | n/a | n/a | n/a | n/a |
| 35 | Asiatic Society (asiatic) | not checked | none | n/a | n/a | n/a | n/a |
| 36 | Connemara (connemara) | not checked | none | n/a | n/a | n/a | n/a |
| 37 | Sassoon (sassoon) | not checked | none | n/a | n/a | n/a | n/a |
| 38 | Alexandrina (alexandrina) | see rows 6 and 6b; no live replacement found | see row 6 | n/a | n/a | n/a | n/a |
| 39 | Baghdad (baghdad) | not checked | none | n/a | n/a | n/a | n/a |
| 40 | Palafoxiana (palafoxiana) | Sketchfab facade uid 402a8ca5218b4c8f8ca9fd059756b63b | Sketchfab embed route (200, no XFO) | Sketchfab | Facade only, 79,767 faces | Yes | CC BY, downloadable |
| 41 | Vasconcelos (vasconcelos) | none found on Sketchfab; site returned 000 | none | n/a | n/a | n/a | n/a |
| 42 | State Library Victoria (slv) | La Trobe Reading Room scan uid 081ac34de8dd42bd80ac452607578538 by uomdigitisation; SLV page | Sketchfab embed route (200, no XFO); [slv.vic.gov.au/node/4824088](https://www.slv.vic.gov.au/node/4824088) (200, XFO SAMEORIGIN, CSP frame-ancestors allowlist); Matterport media page 404 | Sketchfab | Actual room, RealityCapture, 670 photos, 1,008,040 faces | Sketchfab yes; SLV page no | CC BY-NC-SA, downloadable (non-commercial) |
| 43 | Tianyige (tianyige) | none found on Sketchfab | none | n/a | n/a | n/a | n/a |
| 44 | Binhai (binhai) | none found on Sketchfab | none | n/a | n/a | n/a | n/a |
| 45 | Haeinsa (haeinsa) | none found on Sketchfab | none | n/a | n/a | n/a | n/a |
| 46 | Ashikaga (ashikaga) | none found on Sketchfab | none | n/a | n/a | n/a | n/a |
| 47 | McMillan (mcmillan) | not checked | none | n/a | n/a | n/a | n/a |
| 48 | Malatestiana (malatestiana) | Sketchfab Library Cesena uid a49bdc02f48c493ab392d420a6f42d28 (1.44M faces); Plutei uid 9c5f91d3c7194d7690ef5175cc5cac7e (1.97M faces) | Sketchfab API (200) | Sketchfab | Likely the real interior; not visually verified | Not tested | Not downloadable, no licence shown. Needs a licence check with the uploader |
| 49 | Joanina (joanina) | Coimbra "Space of Knowledge" app, per search result; noticias.uc.pt returned 403 to curl | none opened | University of Coimbra | Unverified | Unknown | Unknown |
| 50 | Hereford (hereford) | Old sphericalimages.com tour 404 (dead). Cathedral site opened; no tour link extracted | [herefordcathedral.org](https://www.herefordcathedral.org/) and [/chained-library](https://www.herefordcathedral.org/chained-library) (200) | n/a | n/a | n/a | n/a |
| 51 | Morgan (morgan) | Sketchfab "JP Morgan Library" uid 77d151df960d4db9a6810da32e66d3b5 (96,436 faces) and "Morgan Library Front Cat" uid 5fc2faee448b4eb1b3728ea035a2305a (1M faces), unverified relevance. themorgan.org returned 403 (Cloudflare challenge) | Sketchfab API (200) | Sketchfab | Unverified | Not tested | CC BY, downloadable |
| 52 | Stegen (stegen) | not checked | none | n/a | n/a | n/a | n/a |

- Sketchfab model pages send XFO SAMEORIGIN, but the official route `https://sketchfab.com/models/<uid>/embed` returned 200 with no XFO for Mafra, Celsus, SLV and Palafoxiana; Sketchfab offers official embed code. The public API `api.sketchfab.com/v3/search` and `/v3/models/<uid>` work without a key.
- Google Arts & Culture pages (Prunksaal exhibit, Nalanda story, Mafra and Klementinum partner pages) all sent XFO SAMEORIGIN, so they are link-out only.
- Open Heritage 3D (openheritage3d.org, 200) and CyArk (cyark.org, 200, XFO SAMEORIGIN) site roots opened; no per-library project lists were read. Smithsonian 3D (3d.si.edu) and the Europeana 3D topic page returned 403 to curl.
- Dead tours: Bodleian IMEX 404, Bodleian VHL RSL induction tour 404, Hereford sphericalimages 404, SLV Matterport media page 404. Bibliotheca Alexandrina's tour page loads but was reported "Temporarily Unavailable".

### Inferences
- The Mafra scan is a whole-building point cloud of about 11M vertices; interior coverage cannot be assumed from the evidence.
- Only the SLV and Malatestiana Sketchfab models are plausible walkable-interior geometry; SLV is non-commercial only.
- Link-out is the safe default for Google Arts & Culture, Vatican, ONB and SLV pages; embedding is realistic only for Sketchfab, Admont, Weimar and Trinity tours, after terms are read.

### Gaps
- Rows marked "not checked" (26, 31, 33 to 37, 39, 47, 52) were not searched.
- Kuula, 3DVista, Matterport, Polycam, Luma and SuperSplat were not searched per library beyond incidental hits.
- Europeana and Smithsonian 3D (403) and Open Heritage 3D / CyArk per-library records were not read.
- Mafra interior scope, the Mafra virtual tour mentioned in search snippets (unverified), Escorial site contents, Dunhuang Library Cave URL, Joanina app coverage, ONB tour location inside the Virtual State Hall page, Morgan, Hereford and BPL site tours were not resolved.
- Terms of use for CloudPano, rooom, 3dtopevent and discover-culture tours were not read.
- Licences for the non-downloadable Sketchfab models (LoC, Klementinum, Weimar, Malatestiana, Gabinete) are not shown; the uploaders would need to be asked.
