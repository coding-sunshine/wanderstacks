# Real-capture assets and 2026 web Gaussian-splat rendering for WorldLibs

Date of research: 2026-11-10. Coverage is thin by design: ~20 tool calls; several loc.gov / Commons pages returned 403/404, so those items are marked unverified. Nothing was downloaded.

Repo scope (read-only): `data/libs.json` lists 52 libraries (ids: longroom, admont, strahov, loc, celsus, alexandria, prunksaal, bnf, stgallen, mafra, nypl, bpl, peabody, bodleian, escorial, gabinete, melk, klementinum, vatican, wiblingen, weimar, ottawa, stockholm, nineveh, pergamon, herculaneum, nalanda, dunhuang, buda, timbuktu, ... joanina, hereford, morgan, stegen). `rg -l Admont src` returns nothing; hall data is in `data/libs.json`. Bespoke room folders exist only for longroom, admont, strahov, loc, celsus under `public/rooms/` (plus `tex`, 5 MB of shared textures).

## 1. Per-library asset inventory (licences, sizes, redistribution)

### Takeaway
Almost no open, redistributable, room-scale interior capture exists for the five bespoke halls. The one verified open 3D asset is an exterior, low-quality crowdsourced Celsus model (CC-BY 4.0, 1.1M tris). For interiors, the realistic open sources are Wikimedia Commons photos (licence per file) and institutional images (rights-reserved by default). Treat splats/photogrammetry of these rooms as something WorldLibs would have to capture or commission itself, which is not possible for interiors it cannot access.

### Cited Findings
- Celsus: Sketchfab "Library of Celsus - Crowdsourced photogrammetry" by Miguel Bandera, CC-BY 4.0, 1.1M triangles / 549.8k vertices, published 17 Jun 2018, downloadable, built from 200 public photos, flagged NoAI (cannot be used in generative-AI datasets/development). Facade/exterior model; 1.1M tris is far above web budget and needs decimation. Redistribution allowed with attribution, but NoAI tag is a constraint to respect. — [Sketchfab](https://sketchfab.com/3d-models/library-of-celsus-crowdsourced-photogrammetry-1cc6ad6af508422398f60f902cb70e88)
- Celsus: Trimble produced a terrestrial laser-scan point cloud (46 scan locations, 2.4 mm accuracy, 500,000 points/s scanner, completed 2023); virtual reconstructionist Adam Nemeth built a reconstruction from it. Licence/availability of the point cloud not stated in results (treat as not open). — [Trimble](https://www.trimble.com/en/blog/construction/article/how-trimble-used-point-cloud-scanner-to-create-most-detailed-model-ever-of-ancient-library), [Constructible](https://constructible.trimble.com/the-great-library/head-in-the-point-clouds-how-adam-nemeth-used-our-scan-to-revive-the-library-of-celsus)
- Celsus: other listings exist on CGTrader, TurboSquid, Fab, and a World History Encyclopedia 3D view; these are commercial or unclear licence, not verified. — [WHE 3D view](https://www.worldhistory.org/image3d/422/library-of-celsus---3d-view/), [CGTrader](https://www.cgtrader.com/3d-models/exterior/historic-exterior/library-of-celsus-ephesus-pbr)
- Celsus: ÖAI (Austrian Archaeological Institute) maintains a Sketchfab presence for Ephesus-related models; specific Celsus model and licence not checked. — [ÖAW/ÖAI Sketchfab](https://www.oeaw.ac.at/en/oeai/oeaidigital/sketchfab)
- Trinity Long Room: search found no Long Room 3D scan on Sketchfab (hits were Trinity College Oxford, not Dublin). — [search result Sketchfab Oxford](https://sketchfab.com/3d-models/trinity-college-360-measurement-eb-8d4bb878f2444e9aba24e32891f1113b)
- Trinity Long Room policy: non-flash photography allowed in the Long Room for personal use only; no photography in the Treasury (Book of Kells); library has an open-licensing policy for digitised collection content but Book of Kells excluded; new commissioned photography needs 3+ weeks via request form. Interior-scene photos by visitors are therefore personal-use, not a licence to republish. — [TCD Library copyright/rights](https://www.tcd.ie/library/dris/copyright.php), [TCD image requests](https://tcd.ie/artcollections/explore/image-requests)
- Admont: Wikimedia Commons has a category "Stift Admont" with library images (file count and licences not verified; direct category fetches 404'd). Official site stiftadmont.at images are credited (e.g. (c) Stefan Leitner) = all rights reserved. Stock agencies (Alamy, Photo12) are rights-managed. — [Commons category (via dewiki)](https://de.wikipedia.org/wiki/Commons:Category:Stift_Admont), [Stift Admont](https://stiftadmont.at/en/architektur/)
- Admont/Strahov/Long Room: a targeted search for splats/photogrammetry (Polycam, Luma, Sketchfab) of these halls found nothing. — search (no source)
- Library of Congress Main Reading Room: LoC publishes HABS/HAER/HALS drawings and photos at loc.gov; collection holds >500,000 drawings of 38,000 structures, with ~55,000 originals scanned in 2000-01 plus ~4,800 in 2004-05. Items are generally US-government/public domain with a rights statement per record. I could not open the Jefferson Building HABS record (403), so the HABS number and drawing count for the Main Reading Room are unverified. — [LoC HABS collection](https://www.loc.gov/collections/historic-american-buildings-landscapes-and-engineering-records/about-this-collection/)
- LoC: the Library ran a "LOC 3D" photogrammetry pilot (13 staff certified) for collection objects, not the reading room. LoC Prints & Photographs also hosts many Reading Room photographs (PD historic; e.g. Detroit Publishing/Carol Highsmith type sets — unverified for this room). — [Infodocket](https://www.infodocket.com/2020/01/09/librarys-collections-come-to-life-as-3d-models/)
- NPS Heritage Documentation Programs hosts panoramic tours and point-cloud viewers for HABS projects; none identified for these halls. — [NPS HDP](https://www.nps.gov/subjects/heritagedocumentation/virtual-content-overview.htm)
- CyArk Open Heritage: clearinghouse, 70+ datasets, member of Open Heritage Alliance; no Celsus/Ephesus dataset confirmed. — [CyArk](https://cyark.org/education)
- Sketchfab: cultural-institution CC0 public-domain dedication programme exists (100k+ heritage models), so institutional CC0 models are the best-case source. — [Sketchfab blog](https://sketchfab.com/blogs/community/sketchfab-launches-public-domain-dedication-for-3d-cultural-heritage)

### Inferences
- Of the 52 halls, only Celsus has a verified open 3D asset, and it is the wrong kind (exterior, heavy, noisy). The five bespoke interiors will likely rely on Commons photos and PD historic photos for texture/reference, not on 3D captures.
- For Alexandria, Pergamon, Ashurbanipal, Villa of the Papyri, Nalanda, etc. (conjectural or ruined), no "real interior" exists by definition; only ruin scans (exteriors/foundations).
- Per-asset size cannot be stated for most items; only the Celsus mesh is verified (1.1M tris, no file size).

### Gaps
- Strahov, Melk, Bodleian, Escorial, Joanina, Prunksaal, Klementinum, Wiblingen, Weimar, Peabody, NYPL, BnF: not individually searched (budget). No claim made.
- Commons category file counts, 360 panoramas, and per-file licences for Admont/Long Room/Strahov/LoC not verified (fetches 404/403).
- Google Street View / Matterport / Europeana for these halls not checked. Google Street View imagery is not licensable for redistribution regardless (Google Maps terms; not re-verified here).
- HABS number for Jefferson Building reading room not verified.
- Iconem holdings: not found for these halls.

## 2. Gaussian splats on the web, 2026

### Takeaway
Tooling is mature: Spark 2.4.0 (World Labs, MIT, three.js native) and PlayCanvas SOG/SuperSplat 3 give streamed, LoD'd splats on desktop and mobile, and splats co-exist with three.js meshes. But a room-scale capture is still tens of MB even compressed, so a 5 MB first load requires a tiny splat (about 300k-1M splats at best) or a lazy-loaded chapter; relighting is not realistic.

### Cited Findings
- Spark (World Labs): MIT-licensed 3DGS renderer for three.js; v2.4.0 current per the repo; docs reference three.js 0.180; renders multiple splat objects with correct sorting and shares a scene with ordinary meshes; reads PLY, SPZ, SPLAT, KSPLAT, SOG; Rust/WASM components; WebGL2 ("98%+" target) and claims fast on low-power mobile. — [GitHub sparkjsdev/spark](https://github.com/sparkjsdev/spark), [radiancefields platform page](https://radiancefields.com/platforms/spark)
- Spark 2.0 preview: LoD system rendering a budget of 500k-2.5M splats per frame depending on device; new .RAD format with HTTP Range requests so scenes appear coarse then refine; LRU "splat pager" to fixed GPU pool; ExtSplats (32-byte format). Coit Tower scene (40M+ splats) runs interactively in browser. — [radiancefields Spark 2.0](https://radiancefields.com/world-labs-previews-spark-2.0), [Spark platform](https://radiancefields.com/platforms/spark)
- Spark 2.4.0 reads SPZ v4 and accepts custom paged-LoD fetchers; a "Spark Radix" WebGPU splat path for three.js was announced (details not read). — [radiancefields 2.4.0](https://radiancefields.com/spark-2.4.0-reads-spz-v4-files-and-opens-paged-lod-to-custom-fetchers), [Spark Radix](https://radiancefields.com/spark-radix-brings-webgpu-splat-rendering-to-threejs)
- SOG (PlayCanvas, Spatially Ordered Gaussians): WebP-image container with meta.json; lossy quantisation, typically 15-20x smaller than PLY; v2 current spec; positions 16 bits/axis, quaternions 26 bits, 8-bit codebooks for scale/colour; optional SH bands; Spark also reads SOG. — [PlayCanvas SOG docs](https://developer.playcanvas.com/user-manual/gaussian-splatting/formats/sog/)
- Size examples: a church scene ~1 GB PLY became ~55 MB SOG (~20x); 7 GB became ~600 MB. So ~50 MB-class for a large church interior; extrapolating, a splat small enough for 5 MB would be roughly 5-10% of that scene. — [PlayCanvas blog SOGS](https://blog.playcanvas.com/playcanvas-adopts-sogs-for-20x-3dgs-compression), search summary
- PlayCanvas engine: new WebGPU compute path moved a 35M-splat scene from 13 fps (WebGL2) to 76 fps (5.7x); streamed LoD makes a 24M-Gaussian scan load near-instantly at 60 fps; SuperSplat 3.0 is a WebGPU-only editor rewrite (Sep 2026). — [PlayCanvas blog](https://blog.playcanvas.com/new-in-supersplat-webgpu-and-streaming-bring-huge-performance-wins), [SuperSplat 3.0](https://radiancefields.com/playcanvas-releases-supersplat-3.0)
- Mobile (secondary source, non-authoritative guide): iPhone 2020+ and Snapdragon 7xx Android handle ~1-2M splats at ~30 fps on WebGL; iPhone 13 Pro Max reported 78 fps vs 38 fps WebGL2 at 4M splats with WebGPU path; advice to keep under 1M splats for mobile. — [polyvia3d guide](https://polyvia3d.pages.dev/guides/gaussian-splatting-web-viewer), [PlayCanvas blog](https://blog.playcanvas.com/new-in-supersplat-webgpu-and-streaming-bring-huge-performance-wins)
- Other renderers (from my prior knowledge, not re-verified this session): mkkellogg GaussianSplats3D (three.js, now largely superseded by Spark), antimatter15 splat, gsplat.js (Hugging Face / dylanebert), Babylon.js built-in splat support, PlayCanvas engine native. three.js core has no native splat renderer (Spark is an add-on). — unverified
- Splat editing/relighting: Spark documents colour editing and a shader-graph for modifying splats on GPU, but not physically based relighting of baked captures. — [GitHub](https://github.com/sparkjsdev/spark)

### Inferences
- Sorting cost is the main CPU/GPU overhead; Spark moves it to WASM/worker and LoD caps the budget, so a 500k-1M splat budget is the safe mobile figure.
- Baked splats carry the capture's lighting; WorldLibs' dynamic daylight/weather/lamps (`src/room/daylight.ts`, `weather.ts`) would not affect them. Best use is a fixed-time-of-day hero chapter, or splats only as distant/backdrop elements with the live three.js foreground and UI layered on top.
- Splat bundle under 5 MB first load is only plausible for a small object or alcove (e.g. one bay, one lectern), not a 70 m hall.

### Gaps
- No measured fps of Spark specifically on mid-range Android; figures are from vendor blogs and one aggregator guide.
- No verified example of a splat of any of the target halls to size against.
- Exact Spark Radix/2.x release dates not read.

## 3. Other "real" routes

### Takeaway
For a 5 MB budget, photo-based techniques (panorama backdrops, photo-projected textures on simple geometry, 2.5D depth) are far cheaper than splats and are what the data actually supports for these halls; a mixed approach (hero equirect + projected textures) is the pragmatic route.

### Cited Findings
- Spark/SOG sizes above set the splat baseline (tens of MB for a room). — [PlayCanvas blog](https://blog.playcanvas.com/playcanvas-adopts-sogs-for-20x-3dgs-compression)
- NPS HDP and LoC provide measured drawings and panoramic content for US sites (LoC reading room only if HABS record exists; unverified). — [NPS HDP](https://www.nps.gov/subjects/heritagedocumentation/virtual-tours.htm)

### Inferences (no source; engineering judgment, my own estimates)
- An equirect panorama at 4096x2048 as AVIF/WebP is roughly 300-800 KB; 8192x4096 about 1-3 MB. HDR (RGBE/EXR) is much larger; prefer LDR plus a tiny separate lighting probe.
- Pano backdrops give true parallax only with depth or camera-on-rails; fixed-point only is accurate. Street-View-style node tours cost 0.5 MB per node lazily loaded.
- Photo-projected textures on proxy geometry (camera-projection mapping of one or two wide photos) deliver the highest realism per byte but only from near the capture viewpoint; needs high-res source photos that are licensable (see section 4).
- Depth-from-photo (monocular models) works for subtle 2.5D parallax in a hero shot; artifacts at disocclusions; depth map PNG about 100-300 KB.

### Gaps
- No measured sizes from real projects; numbers above are estimates.
- Commons 360 panoramas for the five halls not located.

## 4. Legal and ethics

### Takeaway
Licence status is per image and per jurisdiction; interior photos of Trinity's Long Room are personal-use only unless licensed by the college, and Austria's freedom of panorama covers building interiors (architecture only), which helps Admont architecture but not the books, statues or frescoes. Safest path: Commons CC0/CC-BY/PD files with attribution, plus own illustrations.

### Cited Findings
- Austria: freedom of panorama (Panoramafreiheit) extends to publicly accessible interiors of buildings per OGH case law (rooms, halls, atriums), covering architecture and parts integral to the structure (e.g. church windows), but not freestanding statues or other contents. Commons treats Austrian interior photos as acceptable under this rule for the architecture. Caveat: Admont's own policy and the Stefan Leitner photos remain copyrighted for the photographer's work. — [Commons: Copyright rules by territory/Austria](https://c.enwp.org/wiki/Commons:CRT/Austria), [Commons FoP Europe](https://c.enwp.org/wiki/Commons:Freedom_of_panorama/Europe)
- Ireland (Trinity): Library's own policy permits non-flash personal photography in the Long Room; image reuse via formal request; Book of Kells explicitly excluded from open licensing. The library's open-licence policy applies to digitised collection content, not to the building interior. Irish FoP legal position was not verified. — [TCD copyright](https://www.tcd.ie/library/dris/copyright.php)
- US (LoC): HABS and most LoC historic photos are free to reuse, subject to each record's rights statement (not verified for specific items). — [LoC HABS](https://www.loc.gov/collections/historic-american-buildings-landscapes-and-engineering-records/about-this-collection/)
- Sketchfab models carry per-model licence, and NoAI tags exist (Celsus model has one). — [Sketchfab Celsus](https://sketchfab.com/3d-models/library-of-celsus-crowdsourced-photogrammetry-1cc6ad6af508422398f60f902cb70e88)

### Inferences
- Commercial vs non-commercial: CC-BY-NC assets would block any monetised WorldLibs; stick to CC0/CC-BY/PD. Personal-use institutional policies do not authorise publishing.
- Photographing frescoes/sculptures in Admont and manuscripts at Trinity involves artist/institutional rights beyond FoP of architecture; dates make most old works PD, but modern photographs of them are separate rights.
- Not legal advice.

### Gaps
- Irish, Czech (Strahov), Turkish freedom-of-panorama and Strahov/Admont photography policies not verified.
- Whether Google Street View indoor imagery of any hall can be reused: not verified (generally not).
