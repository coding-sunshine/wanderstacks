# Real immersive captures for Wanderstacks entries 27-52 (nalanda to stegen)

As of 2026-11-10. Scope: entries 27-52 of `data/libs.json` (nalanda, dunhuang, buda, timbuktu, vikramashila, thanjavur, khudabakhsh, nli, asiatic, connemara, sassoon, alexandrina, baghdad, palafoxiana, vasconcelos, slv, tianyige, binhai, haeinsa, ashikaga, mcmillan, malatestiana, joanina, hereford, morgan, stegen). Entries 1-26 are covered by another researcher. Only URLs that were opened or returned by the Commons API are listed as sources; anything that returned 403/404 is in Gaps. Ranking: A = real walkable capture free, B = real 360 stills only, C = flat photos only, D = nothing real.

Method note: the Commons sweep (MediaWiki API, `generator=search`, namespace 6, licence from `extmetadata.LicenseShortName`) filtered for files with aspect ratio >= 1.9 and width >= 2500, or "360"/"panorama" in the title. It finished for nalanda through mcmillan; I stopped it before malatestiana, joanina, hereford, morgan and stegen (see Gaps). Earlier-session notes at `research_notes/Wanderstacks realtime walkable library visits/capture_inventory.md` (dated 2026-11-08) supplied Sketchfab, Panoramax and hires-pool counts; I re-cite the URLs from it below but did not re-open every one this session.

## Q1. Does each library have an official virtual tour, and can it be embedded?

### Takeaway
Only State Library Victoria (slv) has a confirmed official walkable interior tour (Google Street View), and it is not freely embeddable or reusable. Everything else has either no tour, a video, a Google Arts & Culture story, a defunct kiosk tour, or a closed digital twin.

### Cited Findings
- slv: official virtual tour is Google Maps Street View with listed starting points (La Trobe Reading Room, Swanston St Welcome Zone, Ian Potter Queen's Hall, Russell St Welcome Zone); page copyright "(c) 2026 State Library Victoria", no reuse terms for the tour — [SLV](https://www.slv.vic.gov.au/node/4824088)
- slv La Trobe Reading Room Street View link — [Google Maps](https://www.google.com/maps/@-37.8098878,144.9650585,2a,75y,69.87h,85.68t/data=!3m6!1e1!3m4!1sqaIlBdx9i2WBjb46yJVniA!2e0!7i13312!8i6656)
- alexandrina: official "BA 3D Virtual Tour Project" page shows "Temporarily Unavailable"; it was an on-site kiosk at the main entrance, no public URL, no embed or terms — [Bibliotheca Alexandrina](https://bibalex.org/en/page/ba_virtual_tour_project)
- nalanda: Google Arts & Culture story "Nalanda: From Mound to Monument" (ASI partner) advertises a "virtual walkthrough of the Nalanda excavated site"; format unspecified, Google generic terms — [Google Arts & Culture](https://artsandculture.google.com/story/cQWhgvVSyhQA8A)
- nalanda: Live History India film "virtual tour" is a video, not a 360 tour — [Live History India](https://livehistoryindia.com/films/monuments/nalanda-a-virtual-tour)
- dunhuang: Dunhuang Academy and Tencent built a "Digital Library Cave" game-engine digital twin from laser scans (cliff face, caves 16 and 17) — [Tencent](https://www.tencent.com/en-us/articles/2201835.html); Dunhuang digital caves project described — [China Daily](https://govt.chinadaily.com.cn/s/202304/28/WS644b28b1498ea274927b93ba/digital-caves-bring-history-alive.html)
- joanina: Commons Category:Biblioteca Joanina has 59 files plus subcategories Interior (30), Portal (44), Visit (66); no 360/panorama titles — [Commons](https://commons.wikimedia.org/wiki/Category:Biblioteca_Joanina)
- malatestiana: Commons category has subcategories Aula del Nuti (35 files), Biblioteca Piana, Collections, Lapidarium, Portal of the Elephant; about 80-90 interior photos, no 360/panorama labels in the first 200 files — [Commons](https://commons.wikimedia.org/wiki/Category:Biblioteca_Malatestiana)
- haeinsa: Commons Category:Haeinsa has 102 files; subcategories Janggyeong Panjeon (7 files) and Tripitaka Koreana (25) — [Commons](https://commons.wikimedia.org/wiki/Category:Haeinsa)
- tianyige: only news of AI guide glasses (Aug 2026) turned up; no VR/360 tour found (search only; no URL opened).
- No official tour found by search for: buda, vikramashila, thanjavur, khudabakhsh, nli, asiatic, connemara, sassoon, palafoxiana, vasconcelos, binhai, ashikaga, mcmillan, stegen.

### Inferences
- slv Street View is link-out only: Google Maps Platform terms govern embedding, so a developer cannot self-host it. Treat as view-only.
- dunhuang twin is a closed game-engine build with no stated open licence; treat as view-only.
- nalanda Arts & Culture walkthrough is not shown to be iframe-embeddable; treat as link-out until tested.

### Gaps
- Whether Google Arts & Culture stories (nalanda, timbuktu) permit iframe embedding was not tested.
- Malatestiana pandemic virtual tours (search snippet only) and Hereford virtual tours (sphericalimages.com URL returned 404) are unverified.
- Morgan: search snippets say the McKim interior is on Google Street View / Art Project; the Morgan press page returned 403, so unverified.
- Matterport tour for slv: media page returned 404, unverified.
- UC Coimbra 360 tours (Botanical Garden, Chemistry Laboratory) exist; the page returned 403 and Joanina is not confirmed in them.

## Q2. Is there street-level interior or entrance coverage (Google Street View, Mapillary, KartaView, Panoramax)?

### Takeaway
Interior Street View is confirmed only for slv. Panoramax has no coverage near any of these buildings. Mapillary and KartaView were not queried (token/API access not set up), so entrance coverage is unknown.

### Cited Findings
- slv interior Street View, see Q1 — [SLV](https://www.slv.vic.gov.au/node/4824088)
- timbuktu: Google Arts & Culture "Mali Magic" and Street View of Sankore Mosque and Djenne reported; Google terms — [Google blog](https://blog.google/outreach-initiatives/arts-culture/trials-and-triumphs-timbuktu-manuscripts) (from search snippet, page not fetched)
- Panoramax zero coverage near all checked buildings — [earlier inventory](file://research_notes/Wanderstacks%20realtime%20walkable%20library%20visits/capture_inventory.md)

### Inferences
- Exterior approach (outside the library) will need Commons stills for almost every entry.

### Gaps
- Mapillary and KartaView coverage near entrances: not checked for any of the 26.
- Street View coverage of exteriors was not verified per library (Google Maps cannot be reliably fetched headlessly).

## Q3. Are there equirectangular 360 panoramas (Commons, Flickr CC, 360cities)?

### Takeaway
Two true equirectangular files exist, both exterior: vasconcelos (CC BY 4.0) and alexandrina (CC BY-SA 4.0). No interior 360 on Commons for any library in this half. Several wide stitched panoramas exist but are partial-sphere, usable as backdrops, not as walkable 360.

### Cited Findings
- vasconcelos: `Panorámica 360 - 2026 - Biblioteca México José Vasconcelos - 07.jpg`, 15520x7760, CC BY 4.0, exterior — [Commons](https://commons.wikimedia.org/wiki/File:Panor%C3%A1mica_360_-_2026_-_Biblioteca_M%C3%A9xico_Jos%C3%A9_Vasconcelos_-_07.jpg) (also returned by the API sweep this session)
- alexandrina: 5184x2592, CC BY-SA 4.0, exterior/planetarium — [Commons](https://commons.wikimedia.org/wiki/File:Biblioteca_di_Alessandria_Alexandria_library_(37725721615).jpg)
- vikramashila: `Vikramshila University Panorama Cloudy Weather.jpg`, 14024x5332, taken 2021-09-28, CC BY-SA 4.0, Wiki Loves Monuments 2021, author Spotplayerx — [Commons](https://commons.wikimedia.org/wiki/File:Vikramshila_University_Panorama_Cloudy_Weather.jpg); `Vikramshila University Panorama View on sunny day.jpg`, 11966x3280, CC BY-SA 4.0 (API listing)
- dunhuang: `2015-09-20-113932 - Panorama von Mogao-Grotten aus.jpg`, 5102x1108, CC BY-SA 4.0, author Zossolino, cliff exterior with stupas — [Commons](https://commons.wikimedia.org/wiki/File:2015-09-20-113932_-_Panorama_von_Mogao-Grotten_aus.jpg)
- nli: Belvedere Building, 15344x6900, dual GFDL 1.2+ / CC BY 3.0, author Biswarup Ganguly, wide exterior stitched (not 360) — [Commons](https://commons.wikimedia.org/wiki/File:Belvedere_Building_-_Indian_National_Library_-_Belvedere_Estate_-_Kolkata_2014-05-02_4743-4761.JPG)
- ashikaga: `Ashikaga Ashikaga-School Panorama 1.JPG`, 4200x2800 (3:2, not 360), CC BY 3.0 (API listing)
- khudabakhsh: building 4000x1844, rare room 4208x1940, seminar hall 4000x1844, all CC BY-SA 4.0, wide not 360 (API listing)
- asiatic: `Asiatic Society of Mumbai.jpg` 4608x2112 CC BY-SA 4.0; several Town Hall photos 4080x1836 CC0 (API listing)
- sassoon: two wide shots 3264x1468 CC BY-SA 4.0 (API listing); exterior photos 5472x3648 CC BY 3.0 — [earlier inventory](file://research_notes/Wanderstacks%20realtime%20walkable%20library%20visits/capture_inventory.md)
- palafoxiana: panorama 4912x1080 CC BY 2.0 (not 360) — same earlier inventory
- Commons sweep returned nothing wide or 360 for: buda, timbuktu, thanjavur, connemara, nalanda, baghdad, slv, tianyige, binhai, haeinsa, mcmillan.
- Commons hires pool counts (earlier inventory): nalanda 261 (247 CC BY 4.0), thanjavur 54 (53 CC BY-SA 4.0), khudabakhsh 0 hires of 26, asiatic 12, connemara 6, sassoon 23, alexandrina 75, palafoxiana 27, vasconcelos 48, slv 22, binhai 0 of 10. No Commons category for NLI.

### Inferences
- Licences CC BY / CC BY-SA / CC0 allow self-hosting with credit (SA requires share-alike on the derivative image). CC BY 3.0 on ashikaga and nli is the same in practice.
- Wide partials can be mapped onto a cylinder or a partial sphere to sell "outside the building" without pretending to be full 360.

### Gaps
- 360cities pages exist for alexandrina (https://www.360cities.net/image/royal-library-of-alexandria) and joanina (https://homer.360cities.net/image/coimbra-university-joanine-library-portugal) but both returned 403; terms are unknown and they are almost certainly all-rights-reserved. Not usable.
- Flickr CC search was not run for any library.
- Commons panorama sweep not finished for malatestiana, joanina, hereford, morgan, stegen (job stopped); the category pages for the first two were read manually (no 360 titles).

## Q4. Do 3D scans, photogrammetry or Gaussian splats exist (Sketchfab CC, Smithsonian, Europeana, Open Heritage 3D, Polycam, Luma, SuperSplat)?

### Takeaway
Three usable-looking models: slv (scan of the real room, but CC BY-NC-SA), palafoxiana (exterior/facade, CC BY, downloadable), alexandrina (one printable model, no licence). Nothing found for Open Heritage 3D, Polycam, Luma or SuperSplat in this half (not exhaustively searched).

### Cited Findings
- palafoxiana: "Palafoxiana" by BrenSM, CC BY, downloadable, 79,767 faces, facade/exterior — [Sketchfab](https://sketchfab.com/3d-models/palafoxiana-402a8ca5218b4c8f8ca9fd059756b63b)
- slv: "Draft: La Trobe Reading Room (SLV)" by UoM Digitisation Centre, CC BY-NC-SA, downloadable, about 1.0M faces, RealityCapture scan of the actual room; NC flag blocks commercial use — [Sketchfab](https://sketchfab.com/3d-models/draft-la-trobe-reading-room-slv-081ac34de8dd42bd80ac452607578538); a second "Draft 2" model exists (id a954fd9e...) — [earlier inventory](file://research_notes/Wanderstacks%20realtime%20walkable%20library%20visits/capture_inventory.md)
- alexandrina: one 41k-face printable model, no licence stated — same earlier inventory
- No Sketchfab hits for nalanda, thanjavur, khudabakhsh, nli, asiatic, connemara, sassoon, vasconcelos, binhai — same earlier inventory
- haeinsa: a hobby 3D model of the Janggyeong Panjeon exists on ArtStation, terms unknown — [ArtStation](https://michaelcga.artstation.com/projects/J9PXK0) (from search, not opened)
- nalanda: ASI photogrammetric survey and AR/VR reconstruction reported underway — [India TV](https://www.indiatvnews.com/education/news/nalanda-university-visitors-to-ancient-varsity-site-may-soon-experience-lost-grandeur-through-augmented-real-updates-2023-01-26-842367) (search summary only)

### Inferences
- slv scan is the single best real interior asset in this half; if the site is non-commercial and shares alike it fits, otherwise link out.
- Palafoxiana model shows the facade only, so it helps "outside" but not the interior.

### Gaps
- Open Heritage 3D / CyArk, Europeana, Smithsonian 3D, Polycam, Luma, SuperSplat were not searched per library.
- Sketchfab creators for Coimbra ("centrodevirtualizacao", "rdfcabral") may hold a Joanina model; not checked.
- ArtStation licence and India TV claims are unverified.

## Q5. For ruined or lost libraries, what scholarly reconstructions or site scans exist?

### Takeaway
Baghdad (House of Wisdom / Round City) has only hypothetical reconstructions, no open 3D. Dunhuang has a closed digital twin. Nalanda and Vikramashila have real ruin photographs and (for Nalanda) a planned ASI survey. Buda (Corviniana) has nothing found.

### Cited Findings
- baghdad: Round City reconstructions are hypothetical because no excavation exists — [Cambridge, Iraq](https://cambridge.org/core/journals/iraq/article/images-of-round-baghdad-an-analysis-of-reconstructions-by-architectural-historians/8BD21CCA3B37DB2906D47749F0C0A99F); [EPOCH](https://epoch-magazine.com/post/the-city-of-peace-reconstructions-of-the-round-city-of-baghdad)
- dunhuang: laser-scan digital twin, see Q1 — [Tencent](https://www.tencent.com/en-us/articles/2201835.html)
- vikramashila: ruin panoramas, see Q3 — [Commons](https://commons.wikimedia.org/wiki/File:Vikramshila_University_Panorama_Cloudy_Weather.jpg)

### Inferences
- baghdad and buda need a procedural or illustrated reconstruction labelled as imagined (rank D).

### Gaps
- No scholarly 3D model found for buda, timbuktu manuscript libraries, or Nalanda's lost Dharmaganja library.
- Nothing found for the Buda library beyond the empty Commons sweep.

## Q6. Ranking and inventory (A walkable real / B real 360 stills / C flat photos / D nothing real)

### Takeaway
No library earns a clean A. slv is A for walkability but view-only (Google) plus an NC-licensed scan. vasconcelos and alexandrina are B (exterior 360 CC). The rest are C or D.

### Cited Findings
Table (URL columns are only those verified above; "-" means none found).

| # | id | Rank | Best real asset | Capture type / coverage | Licence | Reuse note |
|---|----|------|-----------------|-------------------------|---------|-----------|
| 27 | nalanda | C | 247 CC BY 4.0 hires Commons photos; Arts & Culture walkthrough [link](https://artsandculture.google.com/story/cQWhgvVSyhQA8A) | stills, ruin exterior | CC BY 4.0 / Google terms | Commons self-host; Google link-out only |
| 28 | dunhuang | C | [Panorama](https://commons.wikimedia.org/wiki/File:2015-09-20-113932_-_Panorama_von_Mogao-Grotten_aus.jpg) 5102x1108 | wide exterior; closed digital twin | CC BY-SA 4.0 | twin view-only |
| 29 | buda | D | - | none | - | reconstruction needed |
| 30 | timbuktu | C | Google Arts & Culture Mali Magic (unfetched) | Street View exteriors, manuscripts | Google terms | link-out only |
| 31 | vikramashila | C | [Panorama](https://commons.wikimedia.org/wiki/File:Vikramshila_University_Panorama_Cloudy_Weather.jpg) 14024x5332 | wide partial, ruin | CC BY-SA 4.0 | self-host with credit |
| 32 | thanjavur | C | 53 CC BY-SA 4.0 hires Commons files | stills | CC BY-SA 4.0 | self-host |
| 33 | khudabakhsh | C | wide 4000x1844 shots (building, rare room, seminar hall) | stills incl. interior | CC BY-SA 4.0 | self-host |
| 34 | nli | C | [Belvedere](https://commons.wikimedia.org/wiki/File:Belvedere_Building_-_Indian_National_Library_-_Belvedere_Estate_-_Kolkata_2014-05-02_4743-4761.JPG) 15344x6900 | wide exterior | GFDL 1.2+ / CC BY 3.0 | self-host with credit |
| 35 | asiatic | C | Town Hall photos 4080x1836 | stills | CC0 / CC BY-SA 4.0 | self-host |
| 36 | connemara | C | 6 hires Commons files | stills | per file | self-host after checking |
| 37 | sassoon | C | exterior 5472x3648; wide 3264x1468 | stills | CC BY 3.0 / CC BY-SA 4.0 | self-host |
| 38 | alexandrina | B | [Equirect](https://commons.wikimedia.org/wiki/File:Biblioteca_di_Alessandria_Alexandria_library_(37725721615).jpg) 5184x2592 | 360 exterior | CC BY-SA 4.0 | self-host; official tour offline |
| 39 | baghdad | D | - | only hypothetical reconstructions | - | reconstruction needed |
| 40 | palafoxiana | C | [Sketchfab facade](https://sketchfab.com/3d-models/palafoxiana-402a8ca5218b4c8f8ca9fd059756b63b) | 3D exterior; pano 4912x1080 | CC BY / CC BY 2.0 | downloadable; interior not captured |
| 41 | vasconcelos | B | [360 pano](https://commons.wikimedia.org/wiki/File:Panor%C3%A1mica_360_-_2026_-_Biblioteca_M%C3%A9xico_Jos%C3%A9_Vasconcelos_-_07.jpg) 15520x7760 | 360 exterior | CC BY 4.0 | self-host with credit |
| 42 | slv | A (view-only) | [Street View](https://www.slv.vic.gov.au/node/4824088); [Sketchfab scan](https://sketchfab.com/3d-models/draft-la-trobe-reading-room-slv-081ac34de8dd42bd80ac452607578538) | walkable interior; 1.0M-face scan | Google terms; CC BY-NC-SA | link-out; NC scan |
| 43 | tianyige | C | Commons stills only (sweep found no wide) | stills | per file | no tour found |
| 44 | binhai | C | 10 Commons files, none hires | stills | per file | weak |
| 45 | haeinsa | C | [Category](https://commons.wikimedia.org/wiki/Category:Haeinsa) 102 files | stills; halls restricted | per file | no CC 3D |
| 46 | ashikaga | C | Ashikaga School panorama 4200x2800 | stills | CC BY 3.0 | self-host |
| 47 | mcmillan | C (unverified) | - (sweep found nothing wide) | - | - | needs check |
| 48 | malatestiana | C | [Category](https://commons.wikimedia.org/wiki/Category:Biblioteca_Malatestiana) ~80-90 interior photos | stills incl. interior | per file | no 360 found |
| 49 | joanina | C | [Category](https://commons.wikimedia.org/wiki/Category:Biblioteca_Joanina) 30 interior files | stills incl. interior | per file | 360cities 403 |
| 50 | hereford | C (unverified) | - | virtual tour URL 404 | - | needs check |
| 51 | morgan | C (unverified) | - | Street View claim unverified | - | needs check |
| 52 | stegen | C (unverified) | - | not swept | - | needs check |

### Inferences
- Realistic plan: B-ranked entries get a real 360 backdrop outside; slv gets a link-out to Street View plus optional NC scan; everything else gets Commons stills with credit; buda and baghdad need an openly labelled reconstruction.
- Share-alike (CC BY-SA) items require the derived image to carry the same licence; the site needs a credits page.

### Gaps
- Ranks for mcmillan, hereford, morgan, stegen are provisional: sweeps and tour checks were incomplete.
- Per-file licences for tianyige, binhai, connemara, haeinsa, malatestiana, joanina were not itemised.
- Mapillary, KartaView, Flickr CC, Europeana, Open Heritage 3D, Polycam, Luma and SuperSplat were not queried per library.
