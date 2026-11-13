# Capture inventory: openly licensed photoreal material per Wanderstacks library

Run date 2026-11-08. All numbers come from scripted API calls made in this session (Sketchfab v3, Commons MediaWiki API + Wikidata, Panoramax STAC search). Scripts and raw JSON are in the session scratchpad (sk.mjs, skd.mjs, cm.mjs, px.mjs and their .json outputs); no model or image files were downloaded. Self-host rule used: CC0 / PD / CC BY / CC BY-SA (and Etalab 2.0) = self-host with credit; NC = flag; ND = flag; no CC licence shown = link only. Legal reading of BY-SA for derivatives (splat/mesh made from BY-SA photos) is UNVERIFIED.

Caveat on method: I looked at metadata only, never at the images or models. "Exterior vs interior" is inferred from titles/descriptions and marked "(unverified)" where I did not have text saying so.

## 1. Sketchfab (public API, no auth)

### Takeaway
Across 36 libraries and about 100 query variants, Sketchfab holds no downloadable CC model of any library interior; the only usable real-site 3D is the Library of Celsus (several CC BY, downloadable) plus laser-scan point clouds of the Radcliffe Camera and Mafra Palace. Downloads still need a Sketchfab login (the download endpoint returned HTTP 401 unauthenticated for every model tested), so the "isDownloadable" flag means "downloadable by a logged-in user".

### Cited Findings
- Celsus, CC BY, downloadable, 1,097,107 faces, photogrammetry from about 200 crowd-sourced photos, 441 likes (user Miguel Bandera) — [sketchfab 1cc6ad6a](https://sketchfab.com/3d-models/library-of-celsus-crowdsourced-photogrammetry-1cc6ad6af508422398f60f902cb70e88)
- Celsus, CC BY, downloadable, 88,299 faces (iedu360.eu) — [75456d19](https://sketchfab.com/3d-models/3d-model-of-the-library-of-celsus-75456d194b6b420f86cf2898fd909b41)
- Celsus, CC BY, downloadable, 1,720,366 faces, SketchUp-tagged (CatLAB; likely a reconstruction not a capture, unverified) — [765d86f2](https://sketchfab.com/3d-models/library-of-celsus-765d86f2269049029484801a5e14832c)
- Celsus, CC BY, downloadable: 109,796 faces (CCreighton, uid f78cd758...) and 34,725 faces (ORTACA-FINAL-OKU, uid 71fc5fbc...) — via API model endpoint
- Radcliffe Camera, SIAD Studio laser scans "360 Measurements (E,B)" and "(E,C)", CC BY, downloadable, 0 faces / 3,674,016 vertices (point cloud; "E" probably exterior, unverified) — [2c19280b](https://sketchfab.com/3d-models/radcliffe-camera-360-measurements-eb-2c19280b90b246f6baa50d347872d43b); sibling c8f36c1d... same licence. Other SIAD items in the set (360 Photos, 3D Point Cloud E,M) have no CC licence and are not downloadable.
- Mafra "National Palace of Mafra", Museus e Monumentos de Portugal, CC BY, downloadable, 0 faces / 11,126,859 vertices point cloud; no description, interior vs exterior unknown — [9f0e51bf](https://sketchfab.com/3d-models/national-palace-of-mafra-9f0e51bf79ca478b95f60209b5d8fd04)
- State Library Victoria, "Draft: La Trobe Reading Room (SLV)" and "Draft 2", UoM Digitisation Centre, CC BY-NC-SA, downloadable, about 1.0M and 0.97M faces, RealityCapture scan of the actual reading room (NC = flag) — [081ac34d](https://sketchfab.com/3d-models/draft-la-trobe-reading-room-slv-081ac34de8dd42bd80ac452607578538), a954fd9e...
- Wiblingen Abbey, LAD BW, CC BY-NC, downloadable, 750,018 faces (whole abbey; library content unverified) — [4a022312](https://sketchfab.com/3d-models/benediktinerabtei-wiblingen-4a02231297a7414da43a819cabdb31af)
- NYPL "New York Public Library", sungmatt, CC BY-NC-SA, downloadable, 407,806 faces, Scaniverse capture at the Bryant Park coordinates (exterior/park, unverified) — [d05932d0](https://sketchfab.com/3d-models/new-york-public-library-d05932d0f4f640bda5f335ef59a94573)
- Boston Public Library, lryang, CC BY, downloadable, 301,048 faces, only "the alcove at the bottom of the stairs between the 2nd and 3rd floors" (fragment) — [e96a15f0](https://sketchfab.com/3d-models/boston-public-library-e96a15f086ec47779f4c4a4b5ff143c4)
- Palafoxiana "Palafoxiana", BrenSM, CC BY, downloadable, 79,767 faces, description says facade (exterior) — [402a8ca5](https://sketchfab.com/3d-models/palafoxiana-402a8ca5218b4c8f8ca9fd059756b63b)
- Library of Congress "Library Of Congress", 3Dlights, CC BY-NC, downloadable, 79,886 faces (low detail) — [3a80fef5](https://sketchfab.com/3d-models/library-of-congress-3a80fef5d21f45bb940c89597ec497f0)
- Link-only (no CC licence in API, not downloadable): LoC Great Hall point cloud (Thomas Flynn, 499,912 verts, [2f0987ff](https://sketchfab.com/3d-models/2f0987ff635e4a7fa85631d54a62dc0b)); Real Gabinete Português de Leitura, 99,999 faces from 63 photos, low quality per author ([5e3b6e89](https://sketchfab.com/3d-models/real-gabinete-portugues-de-leitura-5e3b6e89f9144194b2b6b10f73c61e9f)); Klementinum Baroque Library vault, haha_polimi, 63,243 faces ([e1fc3dce](https://sketchfab.com/3d-models/e1fc3dcef950477f881a1641bb150dc8)); Anna Amalia tactile model, 705,596 faces ([a9d57b35](https://sketchfab.com/3d-models/a9d57b352282492e9f442b595a3fc608)); El Escorial, Editorial licence, 2.97M faces ([415fc492](https://sketchfab.com/3d-models/415fc492908448b2a6a6d08134eb000a)); Suleymaniye Mosque inside 360 capture, Standard licence ([107ff0ed](https://sketchfab.com/3d-models/107ff0ed17aa43cf8c7f3c6d2a07aed4)); Radcliffe Camera 360 Photos (E), Myles Zhang model (Free Standard licence, 55k faces, uid cd7cfa24...).
- Zero relevant hits (only unrelated objects or props): Long Room (only TCD statues and a harp), Admont, Strahov (only walls, steps, doors, NC-SA), Prunksaal, BnF (a 2,992-face fab.com low-poly), St Gall, Peabody, Melk (church fragments, NC), Vatican, Ottawa, Stockholm, Nalanda, Thanjavur, Khuda Bakhsh, NLI, Asiatic, Connemara, Sassoon, Qarawiyyin, Alexandrina (one 41k-face printable model, no licence), Vasconcelos, Binhai, Suleymaniye (no CC building).

### Inferences
- A usable open 3D shell exists only for Celsus (and point clouds for Radcliffe Camera / Mafra whose coverage is unverified). Everything else must be built from photos/panoramas or authored.
- Point-cloud entries (0 faces) need a splat/point renderer, not a mesh loader.

### Gaps
- Sketchfab terms for redistributing a downloaded CC BY file on another site were not read; CC BY itself permits it.
- Search is name-fuzzy; some relevant models with other-language names may be missed (e.g. Prunksaal returned only a mummy mask).

## 2. Wikimedia Commons (search + geosearch + Wikidata P373 category)

### Takeaway
Commons gives the best open interior material: equirectangular (2:1, width >= 3000 px) files exist for only four libraries, but high-resolution CC BY / CC BY-SA photo sets are plentiful for about twenty. Many Commons licences are BY-SA, so a self-hosted site must credit and share-alike.

### Cited Findings
Method: per library, searched namespace 6 for "<name> 360", "<name> panorama", "<name> interior"; ran list=geosearch (radius 300 m, up to 500 files); resolved the Wikidata entity for the library and read P373 to list the category's files plus up to 15 subcategories (up to 600 files). Flagged equirect = width/height within 2% of 2 and width >= 3000. "Hires" = JPEG >= 5000 px wide in the category+geosearch pool, which includes building exteriors and subcategory content, so it is a coarse indicator only.
- Admont: `Stiftsbibliothek Admont 360.jpg`, 3584x1792, CC BY-SA 4.0, by Julius2803 — [file](https://commons.wikimedia.org/wiki/File:Stiftsbibliothek_Admont_360.jpg)
- Weimar Anna Amalia (Rokokosaal): at least 10 spherical panoramas "Herzogin Anna Amalia Bibliothek - Rokokosaal - Kugelpanorama-00111xx.jpg", 5376x2688, CC BY-SA 4.0, by Raimond Spekking (category "360° panoramics in Weimar"); search total hits for "Rokokosaal Kugelpanorama" = 12 — [example](https://commons.wikimedia.org/wiki/File:Herzogin_Anna_Amalia_Bibliothek_-_Rokokosaal_-_Kugelpanorama-0011167.jpg)
- Prunksaal / Vienna: `Library Hall (34740826012).jpg`, 16384x8192, CC BY 2.0, description "Court Library in Vienna", uploader says it is blurry (low light, no tripod) — [file](https://commons.wikimedia.org/wiki/File:Library_Hall_(34740826012).jpg)
- Vasconcelos: `Panorámica 360 - 2026 - Biblioteca México José Vasconcelos - 07.jpg`, 15520x7760, CC BY 4.0, description says ground-level EXTERIOR 360 (exterior only, useful as arrival shot) — [file](https://commons.wikimedia.org/wiki/File:Panor%C3%A1mica_360_-_2026_-_Biblioteca_M%C3%A9xico_Jos%C3%A9_Vasconcelos_-_07.jpg)
- Alexandrina: 5184x2592 CC BY-SA 4.0 (planetarium dome and library building, exterior) and 3222x1599 CC BY-SA 2.0 (not truly 2:1 equirect; just flagged by ratio) — [file](https://commons.wikimedia.org/wiki/File:Biblioteca_di_Alessandria_Alexandria_library_(37725721615).jpg)
- False positives rejected: Stockholm `Stockholm 5725` 7360x3680 CC BY 2.0/3.0 (description: a Stockholm view from Observatoriekullen, not a library pano); Anna Amalia "Altstadt - panoramio (14)"; ONB category items (Istanbul 1493 woodcut, a medal, Heldenplatz).
- Non-equirect interior panoramas: BnF Salle Labrouste panorama 6786x2506, Public domain; Bodleian "interior panoramic view" 4770x1680, CC BY 4.0; Palafoxiana panorama 4912x1080, CC BY 2.0; Sassoon three exterior-ish photos 5472x3648 CC BY 3.0 (panoramio imports).
- No Commons category via Wikidata P373 for: Long Room, Admont, St Gall, NYPL, Escorial, Wiblingen, Klementinum (entity matched was an asteroid), Ottawa, NLI, Qarawiyyin; geosearch (500-file cap hit for Long Room) found no equirect for Long Room. Peabody and Melk categories returned 0 direct files (all in subcategories beyond what was walked; geosearch found 500).
- Hires pool size and licence mix (coarse): Klementinum 139 (128 BY-SA 4.0), Melk 135 (CC BY 4.0 x60, BY-SA 4.0 x51), Weimar 129 (BY-SA 3.0 x52, BY-SA 4.0 x44, CC0 x8, PD x24), Vatican 242 (241 Public domain, mostly manuscript scans, not architecture), Prunksaal 91, LoC 88 (PD x30, CC0 x8), Suleymaniye 98, Bodleian 75, Alexandrina 75, Celsus 65, Strahov 70 (BY-SA 4.0 x52), Mafra 40, Longroom 18, Peabody 14, Admont 14.
- Commons licences read from extmetadata LicenseShortName via API.

### Inferences
- For interior walks from stills, Weimar (Rokokosaal spheres), Admont (one sphere), Prunksaal (one 16K sphere, soft) are the only open equirects; others need splat/photogrammetry from many ordinary photos (BY-SA propagation applies, unverified).

### Gaps
- Panorama coverage at lower aspect (partial panos) was not exhaustively tagged; only title-matched ones listed above.
- Interior/exterior was not checked for the hires pool; no image was viewed.
- Commons search queries use only the first name variant per library.

## 3. Panoramax and Mapillary (street-level exterior)

### Takeaway
Panoramax has dense open coverage near the Paris, Prague, Baltimore and Dublin buildings and none near most others. Licence is per picture (CC-BY-SA-4.0 or Etalab-2.0), not per instance.

### Cited Findings
Queries: `https://api.panoramax.xyz/api/search?limit=1000&bbox=` +/-0.0015 deg latitude (about 165 m) around each coordinate. "360" = properties pers:interior_orientation.field_of_view >= 360. Pictures have hd/sd/thumb assets; sample item licence property "CC-BY-SA-4.0" with a CC-BY-SA link in links[rel=license]; sample 360 images from a GoPro MAX2 (7680x3840) — [API sample](https://api.panoramax.xyz/api/search?limit=2&bbox=-76.6170,39.2958,-76.6140,39.2987)
- BnF Richelieu: at least 1000 (search cap reached), 315 are 360, 967 Etalab-2.0, 33 CC-BY-SA-4.0
- Peabody: 179, 172 are 360 (4 sequences, newest sample captured 2026-09-28), all CC-BY-SA-4.0; whether any are inside is unverified
- Klementinum: 164, 0 are 360, CC-BY-SA-4.0 (3 sequences)
- Long Room: 34, 8 are 360, 14 Etalab-2.0 and 20 CC-BY-SA-4.0
- Prunksaal: 20 (20 sequences), CC-BY-SA-4.0; Bodleian: 11; Admont: 4; BPL: 1
- Zero within the box: Strahov, LoC, Celsus, St Gall, Mafra, NYPL, Escorial, Gabinete, Melk, Vatican, Wiblingen, Weimar, Ottawa, Stockholm, Nalanda, Thanjavur, Khuda Bakhsh, NLI, Asiatic, Connemara, Sassoon, Qarawiyyin, Alexandrina, Palafoxiana, Vasconcelos, SLV, Binhai, Suleymaniye
- Mapillary: not queried (needs a token). Coverage unknown. Imagery is CC BY-SA per the earlier note — [Mapillary API docs](https://www.mapillary.com/developer/api-documentation)

### Inferences
- Etalab 2.0 is an attribution-only open licence; self-hosting with credit is the expected reading (UNVERIFIED legal reading).

### Gaps
- Panoramax counts at other zoom/box sizes, and whether images are exterior only, were not checked. KartaView not checked.

## 4. Capture platforms and heritage repositories (top libraries only)

### Takeaway
Quick targeted searches found nothing usable; this part is thin and should not be read as proof of absence.

### Cited Findings
- Open Heritage 3D lists 534 datasets; search summary says most datasets are not licensed for commercial use, terms vary per project page; no library on the Wanderstacks list found (a UCSD Geisel Library dataset is the only library hit) — [openheritage3d.org/about](https://openheritage3d.org/about), [Geisel project](https://openheritage3d.org/project.php?id=D6V01X)
- Scan the World is an object/sculpture archive for 3D printing, no building interiors surfaced — [Medium](https://medium.com/scantheworld/scan-the-world-56d777adead9)
- Trimble scanned the Library of Celsus with two X7 laser scanners; point-cloud licence not stated in results — [Trimble blog](https://www.trimble.com/en/blog/construction/article/how-trimble-used-point-cloud-scanner-to-create-most-detailed-model-ever-of-ancient-library)
- Polycam splat gallery search for Admont/Strahov/Long Room/Bates Hall: no hits — [poly.cam](https://poly.cam/gaussian-splatting)

### Gaps
- Not searched: CyArk, Zamani, Luma captures, Polycam explore by individual library (no public API found). Three web searches only.

## 5. Per-library table

Key: SK = Sketchfab; EQ = Commons equirect; Hires = Commons JPEG >= 5000 px (coarse); PX = Panoramax pictures near building (360 count). Class: SELF = CC0/PD/BY/BY-SA/Etalab with credit; NC = flagged; LINK = link only; none = nothing found.

| Library | Sketchfab | Commons equirect | Commons hires | Panoramax | Verdict |
|---|---|---|---|---|---|
| longroom | none (harp, statues) | none | 18 (BY-SA 4.0 x10, BY 4.0 x5) | 34 (8) BY-SA/Etalab | SELF stills + street; official TCD tour is LINK |
| admont | none | 1: Stiftsbibliothek Admont 360, 3584x1792, BY-SA 4.0 | 14 (BY-SA 4.0 x12) | 4 (0) | SELF 1 sphere |
| strahov | none (NC-SA fragments) | none | 70 (BY-SA 4.0 x52) | 0 | SELF stills |
| loc | LoC Great Hall point cloud LINK; 3Dlights NC | none | 88 (PD 30, CC0 8, BY-SA 28) | 0 | SELF stills (PD/CC0 present) |
| celsus | 5 CC BY downloadable (1.1M, 1.7M, 110k, 88k, 35k faces) | none | 65 (BY-SA) | 0 | SELF 3D (exterior ruin) |
| prunksaal | none | 1: Library Hall 16384x8192 CC BY 2.0 (blurry) | 91 (BY-SA 4.0 x45, PD 20) | 20 (0) | SELF |
| bnf | low-poly purchase model LINK | none (PD 6786x2506 cylindrical pano) | 27 (BY 4.0 x13) | 1000+ (315) Etalab | SELF street + stills |
| stgallen | none | none, no category | none | 0 | none found |
| mafra | National Palace point cloud CC BY (11M verts, scope unverified) | none | 40 (BY-SA 4.0 x32) | 0 | SELF point cloud |
| nypl | Scaniverse NC-SA (exterior, unverified); library chair/objects LINK | none | no category | 0 | NC / none |
| bpl | stair alcove CC BY (fragment) | none | no category | 1 | SELF fragment only |
| peabody | none | none | 14 (BY-SA 4.0 x10) | 179 (172) BY-SA | SELF street 360 |
| bodleian | Radcliffe laser scans CC BY (point cloud) | none (interior pano 4770x1680 BY 4.0) | 75 (BY-SA 4.0 x65) | 11 (0) | SELF |
| escorial | Editorial model LINK | none | no category | 0 | LINK |
| gabinete | 100k-face photogrammetry LINK | none | none | 0 | LINK |
| melk | church fragments NC | none | 135 (BY 4.0 x60, BY-SA) | 0 | SELF stills |
| klementinum | vault model LINK | none | 139 (BY-SA 4.0 x128) | 164 (0) BY-SA | SELF stills + street |
| vatican | none | none | 242 (PD, mostly manuscripts) | 0 | SELF stills (few architectural) |
| wiblingen | abbey NC | none | 1 | 0 | NC |
| weimar | tactile model LINK | 10+ Rokokosaal 5376x2688 BY-SA 4.0 | 129 (BY-SA, CC0 8, PD 24) | 0 | SELF, best interior |
| ottawa | none | none | 38 (BY 2.0 x32) | 0 | SELF stills |
| stockholm | none | none (false positives) | 59 (BY 3.0 x23, BY-SA 4.0 x31) | 0 | SELF stills |
| nalanda | none | none | 261 (BY 4.0 x247, ruins site) | 0 | SELF stills |
| thanjavur | none | none | 54 (BY-SA 4.0 x53) | 0 | SELF stills |
| khudabakhsh | none | none | 0 (26 files) | 0 | none useful |
| nli | none | none | no category | 0 | none found |
| asiatic | none | none | 12 | 0 | weak |
| connemara | none | none | 6 | 0 | weak |
| sassoon | none | none | 23 (BY-SA 4.0 x12, CC0 2) | 0 | SELF stills |
| qarawiyyin | none | none | no category | 0 | none found |
| alexandrina | 41k-face model LINK | exterior only, 5184x2592 BY-SA 4.0 | 75 (BY-SA 4.0 x65) | 0 | SELF exterior |
| palafoxiana | facade CC BY 80k faces | none (panorama 4912x1080 BY 2.0) | 27 (BY-SA 4.0 x25) | 0 | SELF |
| vasconcelos | none | exterior 360 15520x7760 CC BY 4.0 | 48 (BY 4.0 x20, CC0 9) | 0 | SELF exterior |
| slv | La Trobe reading room scan NC-SA (1.0M faces) | none | 22 | 0 | NC |
| binhai | none | none | 0 (10 files) | 0 | none found |
| suleymaniye | none (Standard/Editorial) | none | 98 (mosque, not library) | 0 | SELF stills (mosque) |

## 6. Ranked top 5 for an exterior-to-interior walk (judgment, based on metadata only)

1. Weimar, Duchess Anna Amalia: 10+ open interior spheres at 5376x2688 CC BY-SA 4.0 plus 129 hires files including CC0/PD; no Panoramax or 3D, so exterior comes from stills.
2. BnF Richelieu: over 1000 Etalab-2.0 street-level pictures (315 360-degree) for the arrival, public-domain Labrouste panorama and 13 CC BY 4.0 hires stills; no equirect interior.
3. Bodleian / Radcliffe Camera: CC BY laser-scan point cloud, 75 hires files (BY-SA 4.0 x65), a CC BY 4.0 interior panorama, 11 Panoramax pictures; scan coverage of the interior is unverified.
4. Klementinum: 164 BY-SA Panoramax street pictures and 139 hires stills (128 BY-SA 4.0); the only 3D vault model is link-only.
5. Library of Celsus: the only real CC BY downloadable photogrammetry (1.1M faces); exterior-only subject, no interior, so it is a strong shell but not a full walk.
Runners-up: Peabody (172 CC BY-SA 360 street images, interior unknown), Prunksaal (16K CC BY 2.0 sphere but blurry), Admont (one BY-SA sphere).

### Gaps
- No ranked library has a confirmed open interior 3D capture; every ranking assumes building the interior from stills/spheres.
- Images and models were not opened; interior/exterior and quality are inferred from titles and descriptions.
