# Photoreal and culturally meaningful web 3D library rooms (WorldLibs), as of Nov 2026

Method note: ~25 searches/fetches. Search snippets were checked against fetched primary pages where possible. Items marked (snippet only) were not verified on the primary page.

## 1. Gaussian splatting on the web in 2026 (Spark, SOG, SPZ, GS3D): sizes, mobile, LOD, licences, capture sources

### Takeaway
Spark (World Labs, MIT, v2.0 released 6 Nov 2026) is the only actively developed three.js splat renderer; it has LoD, streaming (.RAD), SPZ/SOG/PLY support and mobile budgets. SPZ is ~10x and SOG ~15-20x smaller than PLY, so a room-size splat can plausibly fit in a fraction of 25 MB, but I found no published per-room-scene byte counts, and no existing public splat captures of the target libraries.

### Cited Findings
- Spark v2.0 released Nov 6 2026; MIT licensed; built on THREE.js; LoD splat tree, .RAD streaming format (64K-splat chunks, column order, gzip, randomly seekable by byte offset), virtual-memory paging, foveated rendering, global sort across objects. Fixed splat budgets quoted as 500K mobile / 2.5M desktop; demos of 100M+ splat scenes on phones and headsets — [Radiance Fields: Spark V2.0](https://radiancefields.com/world-labs-releases-spark-v2.0)
- Spark LoD docs: default render budget 1.5M desktop / 500K mobile; requires three.js r179+ and WebGL2; pre-built LoD trees stored in extended SPZ are only ~30% larger than source SPZ; streaming downloads with WebWorker pipelined decode. Page self-describes as incomplete/not fully up to date — [Spark LoD docs](https://sparkjs.dev/docs/new-spark-renderer/). Note budget defaults differ between the two sources (1.5M vs 2.5M desktop); verify against the current release.
- Spark supports .PLY, .SPZ, .SPLAT, .KSPLAT, .SOG; `build-lod` CLI converts a 3DGS file into a streamable .RAD (snippet only) — [Spark search result summary](https://github.com/AtlantixJJ/spark) and [Spark docs](https://sparkjs.dev/docs/packed-splats/)
- Spark packed-splat docs note PLY is uncompressed and huge; SPZ compresses by column order but needs the whole file before display (snippet only) — [Spark packed splats](https://sparkjs.dev/docs/packed-splats/)
- GaussianSplats3D (mkkellogg): MIT; no longer in active development, author recommends Spark; WebGL; supports .ply/.splat/.ksplat; docs admit sub-optimal mobile performance — [GaussianSplats3D repo](https://github.com/mkkellogg/GaussianSplats3D)
- SOG (PlayCanvas): ~15-20x smaller than equivalent PLY, lossy quantisation; meta.json plus lossless WebP textures, or a single .sog ZIP; made with SplatTransform; PlayCanvas spec v2 — [PlayCanvas SOG docs](https://developer.playcanvas.com/user-manual/gaussian-splatting/formats/sog/)
- SPZ (Niantic Spatial): MIT; SPZ 4 released May 5 2026, ZSTD streams, still ~10x smaller than PLY, SH quantisation 3-8 bits, no 10M-point cap, browser loading up to 20x faster, web converter at nianticspatial.com/spz-converter; v4 files unreadable by older readers — [Niantic Spatial SPZ 4](https://www.nianticspatial.com/blog/spz4); repo [nianticlabs/spz](https://github.com/nianticlabs/spz)
- Capture from unconstrained/tourist photo sets is an active research area: Wild-GS (NeurIPS 2024) and Splatfacto-W model per-image appearance and transient occluders — [Wild-GS](https://papers.neurips.cc/paper_files/paper/2024/hash/bb11f79ad86f5e33e2a7c850cbdfed42-Abstract-Conference.html), [Splatfacto-W (CMU)](https://mscvprojects.ri.cmu.edu/2025team4/gaussian-splatting-in-the-wild)
- Heritage splat captures are being done with Scaniverse, Luma and Polycam; ISPRS 2026 papers cover heritage 3DGS (snippet only) — [Frontiers Comp Sci 2025](https://www.frontiersin.org/articles/10.3389/fcomp.2025.1515609/full), [ISPRS XLIX-B2-2026](https://isprs-archives.copernicus.org/articles/XLIX-B2-2026/451/2026/isprs-archives-XLIX-B2-2026-451-2026.pdf)
- Three.js forum guidance for big splat scenes is a combination of LOD, spatial chunking, streaming, culling; no numeric targets given — [three.js discourse](https://discourse.threejs.org/t/how-can-i-optimize-large-3d-gaussian-splat-ply-scenes-for-better-web-performance/93758)

### Inferences
- Budget math (my arithmetic, unverified on real scenes): at ~10x PLY compression, a 1M-splat PLY (~250 MB at SH0-ish, more with SH) becomes roughly 20-25 MB SPZ. To stay well under 25 MB with mesh/textures/audio too, target ~300-500K splats per room, which also matches Spark's 500K mobile budget. Benchmark with real exports before committing.
- Commons photos are unlikely to give enough coverage for a clean interior splat (sparse, varied exposure, people in frame). Wild-GS-style methods exist but are research code; expect floaters in unseen areas. Splats are best used for a hero zone or as lighting/colour reference, not as the whole room.
- Splats are baked radiance: no dynamic relighting, poor behind-glass/reflective gilding, and weak for page-turn interaction. Hybrid (mesh kit + splat set-dressing) fits the "parametric kit" architecture better than splat-only rooms.
- Licence compatibility: splat trained from CC BY-SA Commons photos would plausibly be an adaptation (share-alike/attribution), needing per-photo credits. Legal review needed; not researched.
- GaussianSplats3D is a dead-end dependency; choose Spark. Spark needs r179+ and WebGL2, and the site is on r186 so that is satisfied; WebGPU compatibility of Spark not confirmed here.

### Gaps
- No verified byte sizes for a real room-size splat after SPZ/SOG compression (only ratios).
- No verified mobile fps figures for Spark on mid-range phones (only budgets and vendor claims).
- Luma web viewer (library/licence) not checked; skip unless needed.
- Whether Spark runs under three's WebGPURenderer (vs WebGL2 fallback) not confirmed.
- No public splat captures of Long Room, Admont, Strahov, etc. found (searched Polycam/Luma/Scaniverse terms; results were generic). Absence of evidence only.

## 2. Photogrammetry and scan sources and their licences

### Takeaway
Direct, openly licensed scans of the named interiors are scarce. The found usable item is a CC BY crowdsourced Celsus Library model (NoAI tag). CyArk/Open Heritage 3D data is CC BY-NC (fine for non-commercial), but huge (~25 GB/site) and mostly exteriors/monuments. Smithsonian is CC0 but not library rooms.

### Cited Findings
- Library of Celsus (Ephesus), Sketchfab by Miguel Bandera: CC BY 4.0, 1.1M triangles, built from ~200 publicly available photos with RealityScan, downloadable, "NoAI" flag prohibiting generative-AI dataset use — [Sketchfab model](https://sketchfab.com/3d-models/library-of-celsus-crowdsourced-photogrammetry-1cc6ad6af508422398f60f902cb70e88)
- CyArk Open Heritage data: CC BY-NC 4.0 (CyArk, Historic Environment Scotland, USF Libraries) — [CyArk Data Use Policy](https://www.cyark.org/data-use-policy), [Open Heritage 3D FAQ](https://openheritage3d.org/faq)
- Open Heritage 3D: licence varies by dataset, most non-commercial; avg ~25 GB per site; DOI per dataset; no account needed (name/email) — [Open Heritage 3D FAQ](https://openheritage3d.org/faq)
- Sketchfab Public Domain Dedication (CC0) programme for cultural-heritage institutions — [Sketchfab blog](https://sketchfab.com/blogs/community/sketchfab-launches-public-domain-dedication-for-3d-cultural-heritage)
- Smithsonian Open Access: CC0 for 3D models, OBJ/glTF — [Digital Production](https://digitalproduction.com/2020/03/04/open-access-mehr-als-2000-3d-modelle/)
- Europeana: 4,646 3D models at time of study; study found stated rights statements do not reliably reflect other encumbrances (heritage law, cultural rights, contracts) — [Europeana 3D rights report](https://leuven2012.europeana.eu/post/3d-models-and-rights-management-report)
- Strahov: found a 360 gigapixel panorama (360Cities), not a 3D model; no Admont or Long Room CC models found in the search — [360Cities Strahov](https://www.360cities.net/image/strahov-theological-library-prague)
- Zamani Project (Univ. Cape Town) does laser-scan/digital-model documentation of African heritage; no licence terms or Timbuktu library data found in results — [LiDAR News on Zamani](https://lidarnews.com/the-zamani-project-heritage-documentation-beyond-the-point-cloud/)
- Dunhuang: Dunhuang Academy x Tencent "Digital Library Cave" (launched April 18; digital twin of Mogao cliff face, caves 16 and 17, 60,000+ relics, 8 real historical figures as NPCs, 21 documents viewable) — [Tencent via search summary / China Daily](https://govt.chinadaily.com.cn/s/202304/28/WS644b28b1498ea274927b93ba/digital-caves-bring-history-alive.html). No open-reuse licence found; treat as reference only.
- Ubisoft's Alexandria Library in Discovery Tour was modelled on the Library of Celsus remnants, per its in-house historian — [Engadget](https://www.engadget.com/2018-02-13-assassins-creed-origins-discovery-tour.html) (snippet only)

### Inferences
- CC BY-NC models are legal for a non-commercial site but check whether the site could ever monetise or be used commercially (Cloudflare Pages, donations); keep the licence list per asset.
- Celsus can serve as a comparandum for the Alexandria/Pergamon reconstructions, and Ubisoft precedent supports tagging it "comparandum" in the evidence scheme. NoAI flag: do not feed the model to any generative pipeline.
- Do not assume Europeana "CC0/PDM" labels are safe for 3D without checking the underlying institution's terms.

### Gaps
- Direct scans of Admont, Strahov, Long Room, Mafra, Escorial, Real Gabinete, Vatican, St Gallen: none verified. Sketchfab itself was not exhaustively searched (WebFetch cannot run Sketchfab search).
- Timbuktu, Nalanda, Pergamon scans: not found.
- Dunhuang Academy / e-dunhuang licence terms: not found.

## 3. Realistic lighting cheaply (baking, probes, HDRI, god rays, PBR/KTX2)

### Takeaway
Browser-side bake with three-gpu-pathtracer + three-mesh-bvh + xatlas gives lightmaps compatible with MeshStandardMaterial.lightMap, shippable as KTX2. Evidence here is thin: one community demo and a tutorial.

### Cited Findings
- three-lightmap-baker: GPU lightmap generation in-browser using three-mesh-bvh, three-gpu-pathtracer, xatlas-three; UV unwrap gives a second UV set — [gonnavis/three-lightmap-baker](https://github.com/gonnavis/three-lightmap-baker)
- three-gpu-pathtracer is described as suitable for lightmap/AO baking; project moving toward WebGPU compute — [three.js discourse](https://discourse.threejs.org/t/three-gpu-pathtracer-a-modular-shader-based-path-tracing-extension-for-three-js/36903)
- Lightmaps are applied via `MeshStandardMaterial.lightMap` with UV2 and can be exported PNG/JPG and optionally converted to KTX2 — [How to bake lighting for web](https://www.svilenkovic.com/3d/how-to-bake-lighting-for-web)

### Inferences
- Pipeline for the kit: parametric hall -> offline path-traced bake (day and candle/night variants as two small lightmaps) -> KTX2/BasisU. Two lightmap sets at 1-2K each are plausibly a few MB; confirm with real output.
- Volumetric god rays and dust motes are cheap shader/particle effects (not researched with sources here); fake with additive cone meshes and a few hundred sprite particles.

### Gaps
- No sourced numbers for lightmap KTX2 sizes, light probe workflow in r186, or WebGPU-specific post-processing. Not researched: god-ray techniques, KTX2 PBR set budgets, HDRI sources (Poly Haven licence).

## 4. Cultural significance layer: sound, people, rituals, storytelling, without inventing facts

### Takeaway
Real acoustic data (OpenAIR, CC) allows authentic convolution reverb for living halls; for lost libraries, use clearly tagged proxies. Storytelling should follow evidence-tagged reconstruction practice (London Charter / Rome Reborn / Discovery Tour) with named primary sources per vignette.

### Cited Findings
- OpenAIR (Univ. of York Audiolab, AHRC): mostly Creative Commons IRs; users choose the licence per upload, so check each; 47 Ambisonic B-format SRIR datasets incl. heritage sites (Newgrange, St Albans Cathedral, York Minster) — [OpenAIR](https://www.openair.hosted.york.ac.uk), [Zenodo/OpenAIR search results](https://zenodo.org/records/5150020). No library-hall IR was found in these results.
- St Gallen: still operates as a lending library and study centre; visitors wear felt slippers to protect the floor; scriptorium dates to mid-8th century; Plan of St Gall c. 820 — [Stiftsbibliothek via unterwegs.sob.ch](https://unterwegs.sob.ch/en/stories/stiftsbibliothek-stgallen) (snippet only; check Stiftsbezirk primary site)
- Nalanda: chief sources are Xuanzang (2-3 yrs) and Yijing (10 yrs); gatekeeper tested newcomers with hard questions; Tibetan tradition names library Dharmaganja with three multi-storey buildings (Ratnaranjaka, Ratnodadhi, Ratnasagara) one nine storeys — [Anantamias summary](https://anantamias.com/nalanda-university/), [Lion's Roar](https://lionsroar.com/nalanda-powerful-then-powerful-now/). Tibetan names are late tradition, not excavated; tag "attested (late)" and treat the web summaries as secondary; verify against Xuanzang/Yijing translations.
- Villa of the Papyri: ~1,000 carbonised scrolls; small room seems to have been Philodemus's working library — [Oxford Herculaneum Society page](https://www.herculaneum.ox.ac.uk/index.php/papyri/). Vesuvius Challenge: PHerc. 1667 read in full July 2026, ~1.5 m of text, Stoic ethics, naming Aristocreon; 600+ sealed scrolls remain — [Archaeology Magazine](https://archaeologymag.com/2026/07/herculaneum-scroll-read-for-the-first-time/). Conflicts with another summary claiming Philodemus On Gods Book 8 identified (snippet from [Phys.org/Big Think](https://bigthink.com/the-past/vesuvius-challenge-ai/)); different scrolls/ dates possible, verify before display.
- Timbuktu: Hill Museum & Manuscript Library digitising 22,000+ documents of the Mamma Haidara Family Library; Google Arts & Culture "Timbuktu Manuscripts" experiment of ~40,000 manuscripts — [InfoDocket](https://www.infodocket.com/2015/03/30/minnesota-hill-museum-manuscript-library-digitizes-timbuktus-historic-manuscript-collections/), [Google Experiments](https://experiments.withgoogle.com/timbuktu-manuscripts)
- Dunhuang Digital Library Cave uses real historical figures as NPCs and 21 interactive documents; 14M visits in first week via WeChat mini-program — [China Daily](https://govt.chinadaily.com.cn/s/202304/28/WS644b28b1498ea274927b93ba/digital-caves-bring-history-alive.html)
- Discovery Tour (Ubisoft): combat removed, 75 narrated tours of 5-25 min, historian consultation, daily-life category — [Engadget](https://www.engadget.com/2018-02-13-assassins-creed-origins-discovery-tour.html)
- Virtual reconstruction standards: London Charter (2006), Principles of Seville, Nara; every reconstruction should declare authenticity level to separate real from interpreted; Rome Reborn (since 1996, modelled c. 320 CE) is building an online evidence/decision database — [Eurographics DH 2025: Rome Reborn status](https://diglib.eg.org/handle/10.2312/dh20253261), [ISPRS 2026 on certainty](https://isprs-archives.copernicus.org/articles/XLVIII-2-W12-2026/471/2026/isprs-archives-XLVIII-2-W12-2026-471-2026.pdf)

### Inferences
- Sound: for living halls, use OpenAIR-style convolver (Web Audio ConvolverNode, not sourced here) with a nearby real-space IR labelled "proxy acoustic, not this room" unless the room's own IR exists. Ambient bed should be low-key and attested only: footsteps, page turn, felt slippers (St Gallen), distant debate for Nalanda tagged "comparandum" since the debate-room audio is invented.
- People: render as faceless silhouettes or translucent figures with a source footnote per figure and per activity (e.g. Xuanzang's account for the gate-questioning vignette). Pick figures with documented roles: Philodemus (Villa), Xuanzang/Yijing (Nalanda), Mamma Haidara family (Timbuktu), Dunhuang's real people as in the Tencent project.
- Evidence tags map to London-Charter-style certainty levels; show tag colour on every hotspot, and offer a "show evidence only" toggle that hides invented elements (before/after).
- Destruction comparison: a slider between "reconstruction" and "what survives" is supported in principle by Rome Reborn/Discovery Tour practice but I found no sourced UI precedent; treat as design choice.

### Gaps
- No Web Audio / HRTF/ambisonic-in-browser source gathered (JSAmbisonics, Resonance Audio, Omnitone not checked).
- No OpenAIR IR for a library hall located; Mafra/Escorial/Trinity acoustics unresearched.
- Alexandria Mouseion, Pergamon, Nineveh (Ashurbanipal), Real Gabinete, Admont, Strahov primary-source ritual facts not researched.
- Google Arts & Culture, Notre-Dame AR, Smithsonian storytelling case studies not fetched.
- Ubisoft/Engadget and St Gallen claims are from search snippets, not fetched primary pages.

## 5. Showing an artefact's cultural value visually (cases, guides, annotations, before/after, time-lapse)

### Takeaway
Little sourced evidence gathered; the best-supported patterns are evidence-level labelling (London Charter), narrated short tours (Discovery Tour), and real-document close-ups (Digital Library Cave, Timbuktu viewer).

### Cited Findings
- Discovery Tour: short narrated themed tours rather than free-form lore — [Engadget](https://www.engadget.com/2018-02-13-assassins-creed-origins-discovery-tour.html)
- Digital Library Cave lets users zoom into 21 documents inside a 3D exhibition hall — [China Daily](https://govt.chinadaily.com.cn/s/202304/28/WS644b28b1498ea274927b93ba/digital-caves-bring-history-alive.html)
- Vesuvius Challenge shows a "virtually unrolled" scroll as a reveal of an object that cannot be opened physically — [Archaeology Magazine](https://archaeologymag.com/2026/07/herculaneum-scroll-read-for-the-first-time/)

### Inferences
- Glass-case artefacts (Herculaneum scroll, Dunhuang manuscript) can use a zoom card with transcription, source, and licence line, matching the existing "readable public-domain book" mechanic.
- Time-lapse of a room: only for rooms with dated documented phases (e.g. Papyri villa pre/post 79 CE); use phase slider with evidence tags per phase.

### Gaps
- No sourced studies of glass-case, annotation or time-lapse UIs in museum VR; not researched: Smithsonian X 3D, Notre-Dame AR, Google Arts & Culture case studies.
