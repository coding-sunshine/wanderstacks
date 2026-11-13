# Real immersive captures, Wanderstacks libraries 1-26 (state: November 2026)

Scope: libs.json entries 1-26 in file order (longroom ... herculaneum). Extends `research_notes/Wanderstacks realtime walkable library visits/capture_inventory.md` (call it INV); numbers from INV are marked [INV] and were not re-measured except where stated. Rank key: A real walkable capture free; B real 360 stills only; C flat photos only; D nothing real.

Verification honesty: only URLs I fetched or curl-checked (HTTP 200) this session are listed as links. Google Street View, Mapillary and KartaView could not be queried (no key, no browser session); coverage statements for them are UNVERIFIED. Several official-tour providers were identified from search snippets only and their URLs were not opened; those are named without a link and listed under Gaps. The Commons equirect scan I ran (title search, width>=3000, ratio~2, 3 queries per library) found equirects only for Weimar (18) and Admont (1); searches for the other libraries returned none, matching INV.

## 1. Official virtual tours and embeddability

### Takeaway
Official tours exist for Prunksaal (ONB, Google Arts & Culture exhibit), Klementinum (Google Arts & Culture Street View), Admont (Lightcyde Media tour), Ottawa (NFB/Library of Parliament VR), and Trinity (CloudPano, but not the Long Room). None of these grants a reuse licence; treat them as link-out or iframe-only, never as assets to rip.

### Cited Findings
- Trinity College Library publishes three CloudPano 360 tours (Library Complex, Hamilton, John Stearne Medical); its page does not mention the Long Room. Tour URL loads (HTTP 200); embeddability not tested — [TCD 360 page](https://www.tcd.ie/library/using-library/360.php), [Library Complex tour](https://app.cloudpano.com/tours/_JKNOIx10eo)
- Panoramic Ireland sells/hosts a 360 panorama of the Long Room; commercial, no reuse licence stated — [page](https://panoramicireland.com/guide-to-ireland/360-degree-panoramas-of-ireland/trinity-college-360-degree-panorama)
- Prunksaal: Google Arts & Culture exhibit "Der Prunksaal der Österreichischen Nationalbibliothek" loads (200). A search summary says ONB also built a 360 online tour as a substitute during the renovation closure (URL not opened). Prunksaal is under renovation, first comprehensive work since 1955, per ORF snippet — [GA&C exhibit](https://artsandculture.google.com/exhibit/der-prunksaal-der-%C3%96sterreichischen-nationalbibliothek/kgIivxBkUWnhIQ?hl=de), [ORF](https://wien.orf.at/stories/3175483/)
- Klementinum: Czech National Library put the Baroque Library on Google Arts & Culture with Street View indoor imagery — [Google blog](https://blog.google/outreach-initiatives/arts-culture/discover-the-czech-national-librarys-treasures-with-google-arts-culture/)
- Admont: Austrian Foreign Ministry, the abbey and Lightcyde Media launched a 360 virtual tour with audio — search snippet only; direct URL not found — [Austria Kultur International](https://austriakulturinternational.at/en/?p=2951) (page fetch did not mention Admont, so treat as unconfirmed)
- Library of Parliament, Ottawa: NFB/Library of Parliament "Experience Parliament" VR/online tour includes the Library; page loads (200). Pre-renovation Centre Block capture, licence not stated — [experienceparliament.ca](http://www.experienceparliament.ca/), [NFB release](https://www.canada.ca/en/national-film-board/news/2020/05/virtual-experience-brings-historic-parliament-building-to-life-through-innovative-technologies-a-coproduction-by-the-library-of-parliament-and-the-.html)
- Bodleian: a Penn State IMEX "360 tour of the Bodleian" (Divinity School, Duke Humfrey's) was reported by search, but the URL now returns 404 — [dead link](https://imex.psu.edu/project/take-a-360-tour-of-the-bodleian/)
- Strahov: commercial 360cities gigapixel panoramas of the Theological and Philosophical Halls exist; 360gigapixels page loads (200); 360cities returned 403 to curl. 360cities images are all-rights-reserved unless stated — [360gigapixels](https://360gigapixels.com/strahov-library-gigapixel)
- Vatican Library Sistine Hall: a "virtual journey" is reported by a blog (not the Vatican site) — [michelangelobuonarrotietornato.com](https://michelangelobuonarrotietornato.com/2020/10/16/il-salone-sistino-della-biblioteca-apostolica-vaticana-la-storia-e-il-tour-virtuale); official URL not opened
- LoC Jefferson Building: only an archived 2008 flat-photo "virtual tour" found — [UNT web archive](https://webarchive.library.unt.edu/web/20090109125634/http:/www.loc.gov/jefftour/tour.html)
- No official 360 tour found by search for: St Gall, BnF Labrouste, Mafra, NYPL Rose, Bates Hall, Peabody, Escorial, Gabinete, Melk, Wiblingen, Weimar, Stockholm.

### Inferences
- iframe embedding of Google Arts & Culture and CloudPano is generally allowed by their share features but each library's terms still apply; none offers downloadable panoramas.

### Gaps
- Embeddability (X-Frame-Options / terms) not tested for any tour.
- Matterport Discover, Kuula, 3DVista searches were not run per library; Melk, Wiblingen, Escorial, Mafra, Gabinete, Stockholm, St Gall official sites not opened.

## 2. Street-level coverage (Street View, Mapillary, KartaView, Panoramax)

### Takeaway
Only Panoramax was measured [INV]; Street View and Mapillary are unverified. Klementinum is the only library with confirmed official indoor Street View (via Google Arts & Culture).

### Cited Findings
- Panoramax open pictures within about 165 m [INV]: BnF Richelieu 1000+ (315 are 360, 967 Etalab-2.0, 33 CC-BY-SA-4.0); Klementinum 164 (0 are 360, CC-BY-SA-4.0); Long Room 34 (8 are 360, mixed Etalab/CC-BY-SA); Prunksaal 20; Bodleian 11; Admont 4; BPL 1; Peabody 179 (172 are 360, CC-BY-SA-4.0). Zero for Strahov, LoC, Celsus, St Gall, Mafra, NYPL, Escorial, Gabinete, Melk, Vatican, Wiblingen, Weimar, Ottawa, Stockholm — [Panoramax API sample](https://api.panoramax.xyz/api/search?limit=2&bbox=-76.6170,39.2958,-76.6140,39.2987)
- Klementinum indoor Street View — [Google blog](https://blog.google/outreach-initiatives/arts-culture/discover-the-czech-national-librarys-treasures-with-google-arts-culture/)

### Inferences
- Google Street View imagery cannot legally be extracted or re-hosted; Maps Platform Embed/JS API with a key is the only compliant route (free tier terms not verified here).

### Gaps
- Mapillary and KartaView coverage near entrances not queried for any library.

## 3. Equirectangular 360 on Commons / Flickr / 360cities

### Takeaway
Open equirects exist for only Weimar (18 files, CC BY-SA 4.0) and Admont (1), plus one soft 16K sphere for Prunksaal [INV]. Everything else is stills.

### Cited Findings
- Weimar Rokokosaal: my API scan found 18 equirect files, 5376x2688, CC BY-SA 4.0 (Raimond Spekking, 22 Sept 2019), file names `Herzogin Anna Amalia Bibliothek - Rokokosaal - Kugelpanorama-00111xx.jpg` (e.g. 0011165, 0011166, 0011167, 0011169, 0011172, 0011173). Category loads — [example file](https://commons.wikimedia.org/wiki/File:Herzogin_Anna_Amalia_Bibliothek_-_Rokokosaal_-_Kugelpanorama-0011167.jpg), [Category 360° panoramics in Weimar](https://commons.wikimedia.org/wiki/Category:360%C2%B0_panoramics_in_Weimar)
- Admont: `Stiftsbibliothek Admont 360.jpg`, 3584x1792, CC BY-SA 4.0 — [file](https://commons.wikimedia.org/wiki/File:Stiftsbibliothek_Admont_360.jpg); [Category:Stiftsbibliothek Admont](https://commons.wikimedia.org/wiki/Category:Stiftsbibliothek_Admont)
- Prunksaal: `Library Hall (34740826012).jpg`, 16384x8192, CC BY 2.0, uploader notes it is blurry [INV] — [file](https://commons.wikimedia.org/wiki/File:Library_Hall_(34740826012).jpg)
- Commons has no generic "360° panoramas of libraries" category: a category-namespace search for that phrase returned nothing relevant.
- Flickr CC search not run (no API key); 360cities not reusable.

### Inferences
- BY-SA applies to anything derived from these spheres; credit and share-alike needed.

### Gaps
- Flickr CC equirects not searched. Commons scan used 3 query variants per library; non-English titles may be missed.

## 4. 3D scans, photogrammetry, splats

### Takeaway
Only Celsus has open downloadable CC BY photogrammetry. Radcliffe Camera and Mafra have CC BY point clouds of unverified scope. The La Trobe scan is NC.

### Cited Findings
- Celsus crowdsourced photogrammetry, CC BY, downloadable (login required), 1,097,107 faces, ~200 photos [INV] — [Sketchfab](https://sketchfab.com/3d-models/library-of-celsus-crowdsourced-photogrammetry-1cc6ad6af508422398f60f902cb70e88). Other Celsus CC BY models: 88k, 110k, 35k faces; 1.7M-face SketchUp model likely a reconstruction [INV, links not re-opened].
- Trimble laser-scanned Celsus with two X7 scanners; Ádám Németh made a reconstruction from it; point cloud licence not stated — [Trimble](https://www.trimble.com/blog/construction/en-US/article/head-in-the-point-clouds-how-adam-nemeth-used-our-scan-to-revive-the-library-of-celsus)
- Mafra National Palace, Museus e Monumentos de Portugal, CC BY, downloadable, 11.1M-vertex point cloud, interior/exterior unknown — [Sketchfab](https://sketchfab.com/3d-models/national-palace-of-mafra-9f0e51bf79ca478b95f60209b5d8fd04)
- Radcliffe Camera SIAD laser scans, CC BY, point cloud (Bodleian proper uncovered) [INV, link in INV]
- Villa of the Papyri: Getty/UCLA virtual model by Mantha Zarmakoupi (2012), a scholarly reconstruction; terms not stated — [Getty Iris](https://blogs.getty.edu/iris/a-virtual-model-of-the-villa-dei-papiri)
- Nineveh: Heidelberg team made a 3D model of a North Palace relief (not the library); no public library reconstruction found — [Smithsonian](https://www.smithsonianmag.com/smart-news/archaeologists-unearth-an-ancient-relief-depicting-an-assyrian-king-and-rare-deities-180986631/)
- Other INV items: LoC point cloud (no licence, link-only), LoC 3Dlights CC BY-NC, NYPL Scaniverse CC BY-NC-SA, BPL stair alcove CC BY (fragment), Wiblingen abbey CC BY-NC, Klementinum vault (link-only), Gabinete (link-only), Escorial (Editorial licence), Anna Amalia tactile model (link-only). SLV La Trobe is not in this half; its URL loads but irrelevant here.
- Open Heritage 3D / CyArk / Polycam / Luma: nothing found for these libraries in INV; I did not re-search.

### Inferences
- Splats would have to be generated from Commons stills (Weimar, Admont) or authored; no ready-made open splat found.

### Gaps
- Pergamon and Nineveh: no scan or reconstruction searched beyond the above (Pergamon Museum / DAI Pergamon excavation 3D data not checked). Alexandria Serapeum scans not checked. SuperSplat gallery, Europeana, Smithsonian 3D not searched.

## 5. Per-library table

Sources: [INV] = prior note; V = verified this session (HTTP 200 or API call). Street View/Mapillary UNVERIFIED unless stated.

| # | Library | Official tour | Street/street-level | 360 stills | 3D / scan | Licence | Rank |
|---|---|---|---|---|---|---|---|
| 1 | Long Room | TCD CloudPano tours exclude it (V); Panoramic Ireland commercial pano (V) | Panoramax 34 (8 are 360) [INV] | none on Commons | none | stills BY-SA 4.0 [INV]; tour terms unknown | C (pano exists but not free) |
| 2 | Admont | Lightcyde tour (unconfirmed URL) | Panoramax 4 [INV] | 1 sphere 3584x1792 Commons (V) | none | CC BY-SA 4.0 | B |
| 3 | Strahov | none official found; 360cities/360gigapixels commercial (V) | none [INV] | none open | none | stills BY-SA 4.0 x52 [INV] | C |
| 4 | Library of Congress | 2008 flat web tour only (V) | none Panoramax | none | point cloud link-only; 3Dlights BY-NC | PD/CC0 stills [INV] | C |
| 5 | Celsus (Ephesus) | none | none | none | Sketchfab CC BY photogrammetry, downloadable (V) | CC BY | A (exterior ruin only) |
| 6 | Alexandria (Alexandrina / lost library) | none | none | exterior sphere 5184x2592 BY-SA 4.0 [INV] | none for ancient library | BY-SA | D for ancient library; B exterior of modern building |
| 7 | Prunksaal | ONB tour + GA&C exhibit (V); closed for renovation | Panoramax 20 | 1 blurry 16K sphere (V) | none | CC BY 2.0 sphere; tour terms unknown | B |
| 8 | BnF Labrouste | none found | Panoramax 1000+ (315 are 360), Etalab (V) | none equirect; PD cylindrical pano 6786x2506 [INV] | low-poly purchase model | Etalab 2.0 / PD | B (street) / C (interior) |
| 9 | St Gall | none found | none | none | none | no Commons category [INV] | C or D (not verified beyond INV) |
| 10 | Mafra | none found | none | none | CC BY point cloud 11M verts (V) | CC BY | A? scope unverified, B-C otherwise |
| 11 | NYPL Rose | none found (Sam Rohn 360 tour blog mention only) | none | none | Scaniverse NC-SA exterior | NC-SA | C |
| 12 | Bates Hall BPL | none found | Panoramax 1 | none | alcove fragment CC BY | CC BY | C |
| 13 | Peabody | none found | Panoramax 179 (172 are 360) BY-SA [INV] | none equirect | none | BY-SA | B (street 360; interior unverified) |
| 14 | Bodleian Duke Humfrey's | Penn State tour dead (404) | Panoramax 11 | pano 4770x1680 BY 4.0 (not equirect) [INV] | Radcliffe Camera CC BY point cloud | CC BY | C (A only if point cloud proves to cover interior) |
| 15 | Escorial | none found | none | none | Editorial model link-only | restricted | C |
| 16 | Gabinete | none found | none | none | photogrammetry link-only, low quality | no CC | C |
| 17 | Melk | none found | none | none | church fragments NC | stills BY 4.0 x60 [INV] | C |
| 18 | Klementinum | Google Arts & Culture Street View indoors (V) | Panoramax 164 BY-SA | none equirect | vault model link-only | BY-SA stills; GA&C view-only | B (official indoor Street View) |
| 19 | Vatican Sistine Hall | blog-reported tour (unconfirmed) | none | none | none | PD manuscript scans only | C |
| 20 | Wiblingen | none found | none | none | abbey CC BY-NC | NC | C |
| 21 | Weimar Rokokosaal | none found | none | 18 equirects 5376x2688 (V) | tactile model link-only | CC BY-SA 4.0 | B (best, near-walkable by hopping spheres) |
| 22 | Library of Parliament, Ottawa | NFB Experience Parliament (V) | none | none | none | tour terms unknown | C (official VR link-out) |
| 23 | Stockholm | none found | none | none | none | stills BY 3.0/BY-SA 4.0 [INV] | C |
| 24 | Nineveh (Ashurbanipal) | none | none | none | no library reconstruction found | n/a | D |
| 25 | Pergamon | not searched | none | none | not searched | n/a | D (unsearched) |
| 26 | Villa of the Papyri | none | none | none | Getty/UCLA reconstruction model (V page) | terms unknown | D (scholarly reconstruction exists, no open asset) |

A grade with a caveat: only Celsus (exterior) is A; no interior in this half is A.

### Inferences
- Walkable interiors can be built honestly only for Weimar (hop between 18 spheres), Admont (single sphere), and Prunksaal (one sphere). Klementinum is best served by an official Google Arts & Culture link-out. Everything else needs stills or authored geometry.

### Gaps
- Street View / Mapillary / KartaView unverified for all 26.
- Rows marked "none found" mean none found by search snippets plus INV metadata, not proof of absence; Matterport, Kuula, 3DVista, Flickr CC, Europeana, SuperSplat, Smithsonian 3D, Open Heritage 3D, CyArk not systematically searched per library.
- St Gall, Mafra, Escorial, Wiblingen, Stockholm, Melk, Gabinete official sites were not opened.
- Pergamon and Alexandria (ancient) reconstructions not researched; Nalanda is in the other half.
