---
type: research-note
domain: wanderstacks
status: active
tags: [wanderstacks, splat-pipeline-licences]
relatedTo: [reports/Wanderstacks realtime walkable library visits.md]
---

# Splat pipeline, copyright and licences for Wanderstacks (as of 2026-11-08)

Method note: ~30 tool calls. Page text came through a small summarising model (WebFetch), so quoted strings should be spot-checked on the source before being relied on. Items marked UNVERIFIED are background knowledge or inference. Not legal advice; legal conclusions are quoted from sources only.

## 1. Free tools to build splats from photos or video

### Takeaway
Brush (WebGPU/Burn, runs on macOS) and OpenSplat (Metal, AGPLv3) are the only confirmed Apple Silicon options without CUDA; the usual front end is COLMAP for camera poses. Nerfstudio splatfacto, gsplat and Postshot were not confirmed on Mac in this pass (Postshot is Windows/NVIDIA per background knowledge, UNVERIFIED).

### Cited Findings
- Brush "runs on macOS, Windows, Linux, Android, and web browsers", supports AMD, Nvidia and Intel GPUs via WebGPU and the Burn ML framework; accepts COLMAP data or Nerfstudio-format datasets; live training viewer; "Rendering and training are generally faster than gsplat." — [Brush README](https://raw.githubusercontent.com/ArthurBrussee/brush/main/README.md). Licence line was not in the fetched text.
- OpenSplat: "AGPLv3" with portions from splatfacto "originally licensed under Apache 2.0"; runs on macOS with Metal or CPU-only; inputs from "ODX, OpenSfM, COLMAP, OpenMVG or nerfstudio"; "can also run entirely on the CPU (~100x slower)"; "A single gaussian takes ~2000 bytes of memory, so currenly you need ~2GB of GPU memory for each million gaussians." — [OpenSplat README](https://raw.githubusercontent.com/pierotofy/OpenSplat/main/README.md)
- Postshot (Jawset): Free tier restricted to non-commercial use; Jawset "may, at its sole discretion, terminate the License with immediate effect and without prior notice" for free licences; Indie tier removes watermark on rendering (search summary, not the EULA text itself) — [Jawset EULA](https://activation.jawset.com/eula), [pricing](https://activation.jawset.com/shop/pricing)
- KIRI Engine: Basic plan has unlimited free exports of OBJ, FBX, STL, GLB; "3DGS Scan with Mesh" is in the Pro plan (up to 500 photos and 5 GB per scan) — [KIRI pricing](https://www.kiriengine.app/pricing) (search summary)
- Polycam offers free Gaussian splat creation (from earlier pass) — [Polycam splat](https://poly.cam/gaussian-splatting)

### Inferences
- Open-source MIT/Apache repo that ships only output splats is not affected by AGPL of OpenSplat as a tool (output is not the program), but do not vendor OpenSplat code into the repo without checking AGPL (UNVERIFIED reading).
- Postshot free tier "non-commercial" is probably fine for a hobby site but the site is MIT and others may fork commercially; the splats themselves would still carry the photo licences, not Postshot's. EULA clause on output ownership not read.
- Recommended Mac path (inference): COLMAP (or GLOMAP) poses, then Brush, then SplatTransform to SOG/SPZ.

### Gaps
- Licences of Brush, Nerfstudio, gsplat (believed Apache-2.0), COLMAP (believed BSD), GLOMAP: not confirmed from a fetched licence file. Nerfstudio/gsplat require CUDA to my knowledge (UNVERIFIED), so they are off the Mac path.
- No timings or photo-count guidance for Brush/OpenSplat on M-series found. Scaniverse/Luma/Polycam free-tier splat creation limits (photo counts, time) not read.
- COLMAP on Apple Silicon (CPU-only SfM, slow dense features) not verified; GLOMAP not researched.

## 2. Can 20 to 100 Commons photos make a usable interior splat?

### Takeaway
Research on unstructured tourist photos (Photo Tourism, i.e. Brandenburg Gate, Sacre Coeur, Trevi Fountain) works for exteriors with hundreds to thousands of images; no source found for 20 to 100 photos of an interior. Treat it as unproven for Wanderstacks; expect floaters and holes for unseen regions.

### Cited Findings
- WildGaussians (NeurIPS 2024) adds per-Gaussian trainable appearance embeddings and a tone-mapping MLP plus uncertainty modelling; Photo Tourism PSNR: Brandenburg Gate 27.77 (SWAG 26.33, RefinedFields 26.64), Sacre Coeur 22.56 (RefinedFields 22.26), Trevi 23.63 (RefinedFields 23.42); 117 FPS rendering. Stated limits: cannot "capture highlights on objects", struggles when "regions are occluded in nearly all training images." Images were undistorted first because "3DGS cannot handle radially distorted images." — [WildGaussians arXiv 2407.08447](https://arxiv.org/html/2407.08447v2)
- Photo Tourism sets are "an unconstrained collection of images uploaded by users captured at different dates and times of day with different cameras and exposure levels" — [same](https://arxiv.org/pdf/2407.08447)

### Inferences
- Per-scene image counts are not in the fetched text; Photo Tourism scenes are known to have hundreds to thousands (UNVERIFIED), so 20 to 100 images is well below the tested regime.
- Interior photos from Commons are typically wide-angle from a few viewpoints, variable lighting, people in frame: poor baseline for SfM; expect COLMAP to register only a subset.
- Practical option: use a 3DGS-in-the-wild trainer only for exteriors; for interiors prefer own capture where a library allows photography, or a stylised mesh/proxy.

### Gaps
- Not fetched: NeRF in the Wild (Martin-Brualla et al. 2021), Gaussian in the Wild / GS-W, sparse-view 3DGS (InstantSplat, DUSt3R/MASt3R-based) papers. No real attempt on an interior from Commons found. WildGaussians code licence not checked.

## 3. Copyright of splats from CC BY / CC BY-SA photos, and freedom of panorama

### Takeaway
CC BY-SA 4.0 defines Adapted Material broadly ("transformed, or otherwise modified"), so a splat built from a BY-SA photo is plausibly Adapted Material needing BY-SA plus attribution; that conclusion is an inference, no source addresses splats. Freedom of panorama (FOP) per Commons: buildings OK in Ireland, Austria, USA, UK, India, Czechia; none in France and Italy; interiors vary.

### Cited Findings
- CC BY-SA 4.0: "Adapted Material" means "Material subject to Copyright and Similar Rights that is derived from or based upon the Licensed Material and in which the Licensed Material is translated, altered, arranged, transformed, or otherwise modified." ShareAlike requires applying a CC licence with identical License Elements or a compatible BY-SA licence, and no "additional restrictions or technological measures". Section 2(a)(4): "technical modifications necessary" to exercise rights do not themselves create Adapted Material. — [CC BY-SA 4.0 legal code](https://creativecommons.org/licenses/by-sa/4.0/legalcode.en)
- Commons says any photograph of a copyrighted work during the copyright period is a derivative work, provided (US law) it shows enough originality; Commons requires that publication of derivative works and commercial use be allowed — [Commons licensing search summary](https://c.enwp.org/wiki/Licensing)
- Commons hosts freely licensed 3D models and notes COLMAP and Regard 3D as free photogrammetry tools — [3dprint.com](https://3dprint.com/204668/wikimedia-commons-3d-models/) (secondary)
- FOP table (as summarised from the page; exact per-country wording not re-read) — [Commons:Freedom of panorama](https://commons.wikimedia.org/wiki/Commons:Freedom_of_panorama):

| Country | Buildings | Public interiors | Note |
|---|---|---|---|
| Ireland | yes | yes | follows UK craftsmanship standard (note 5) |
| Austria | yes | no | "Except for works, which themselves are components of the structure" (note 6) |
| Czech Republic | yes | unclear | "Limited to veřejná prostranství (public spaces)" (note 7) |
| USA | yes | yes | "Anyone may paint, draw, or photograph buildings from public places. This includes such interior public spaces as lobbies, auditoriums, etc." |
| France | no | no | no FOP provisions listed |
| Italy | no | no | no FOP provisions listed |
| India | yes | yes | follows UK craftsmanship standard |
| UK | yes | yes | "works of artistic craftsmanship" allowed; "graphic works" not allowed |

### Inferences
- A splat of a Commons-hosted photo set is likely at least as restricted as the most restrictive photo licence in the set. Mixing CC BY with CC BY-SA yields BY-SA output; CC BY-NC or ND photos must be excluded. UNVERIFIED legal reading; get the licence attribution list per library.
- FOP statutes usually name paintings, drawings, photographs, film; whether an interactive 3D reconstruction is covered is not addressed in any source I read. Safer: rely on the building being old enough to be public domain (architect dead >70 years in EU/UK; US pre-1929), or on the photographer's licence only. This age point is general knowledge, UNVERIFIED here.
- Where a photo exists on Commons at all, the Commons rule is that the photo's own licence already passed the FOP check in the country of origin and US; that does not extend automatically to a new 3D work (inference).
- Lead with exteriors of old buildings in all eight countries; interiors in Austria (Admont, ONB, Melk, Wiblingen-type sites) carry the most risk if the interior fittings are modern or protected works.

### Gaps
- Full text of each country section, Commons guidance on 3D reconstructions of buildings, and Commons FOP notes on "interior" in Czechia not read. The last 7,961 characters of the FOP page were not read.
- No court decision or Commons policy on Gaussian splats as derivative works found.

## 4. Platform and repository terms for redistributing captures

### Takeaway
Only content with an explicit CC licence from a downloadable source can be self-hosted. Luma and Scaniverse terms say users own their output but give no public-redistribution licence to others, so re-hosting third-party captures is not supported; your own captures made on these apps are yours to export and host. Heritage repositories are mostly CC BY-NC, which conflicts with MIT-style open use only if commercial reuse matters.

### Cited Findings
| Source | Finding |
|---|---|
| Polycam | Search summary: "All savable content on Polycam's Explore page is licensed under the Creative Commons 4.0 license" (variant not identified); Polycam "may license user-generated content to third parties ... including training artificial intelligence models"; enterprise orgs keep full ownership. Help page 403, terms URL 404, so wording is second-hand — [Usage Rights and Ownership](https://learn.poly.cam/hc/en-us/articles/27646853145748-Usage-Rights-and-Ownership) |
| Luma AI | "Customer owns and retains all right, title, and interest in and to the Output"; commercial use only if produced "during an active Subscription Term under Customer's paid subscription"; during free use Luma gets licence to "publicly display ... create derivative works of, and distribute Input"; users cannot "distribute Output through non-Luma marketplaces without commercial permission" — [Luma ToS](https://lumalabs.ai/legal/tos) |
| KIRI Engine | "The 3D scans created and exported are completely belong to each individual user"; "scanned proprietary objects may be subjected to copyright"; Basic plan exports OBJ/FBX/STL/GLB free; 3DGS in Pro (500 photos, 5 GB) — [KIRI FAQ](https://www.kiriengine.app/faq/do-i-own-the-3d-scans-i-create), [pricing](https://www.kiriengine.app/pricing). EULA (/user-agreement) not read; the /terms-of-service URL gave 404. |
| Scaniverse (Niantic Spatial) | "Niantic Spatial does not claim ownership rights in User Content"; user grants Niantic a "non-exclusive, worldwide, transferable, sub-licensable, royalty-free, perpetual" licence including to "create derivative works" and AI training; no public-sharing licence stated; export formats not specified in ToS — [Niantic Spatial terms](https://nianticspatial.com/terms/) |
| Teleport/Varjo | Not researched (no source) |
| Sketchfab | Earlier pass: API exposes licence and isDownloadable; CC0 option for heritage — [Sketchfab blog](https://sketchfab.com/blogs/community/sketchfab-launches-public-domain-dedication-for-3d-cultural-heritage). Help pages 404 or empty this pass. Splat-specific download status not checked. |
| Scan the World | "Every object is free to download from MyMiniFactory under the appropriate Creative Commons licenses"; individual objects vary, some CC BY-NC-SA 4.0; objects are sculptures/artefacts built from ~50 photos, not building interiors — [search summary, My Modern Met etc.](https://mymodernmet.com/3d-print-sculptures-scan-the-world) |
| CyArk | "All data is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License"; commercial use needs permission from info@cyark.org; BY-NC "permits sharing and adaptation ... provided recipients receive the same restrictions and proper attribution" — [CyArk Data Use Policy](https://www.cyark.org/data-use-policy) |
| Open Heritage 3D | "All datasets use Creative Commons licenses. The specific terms vary by dataset and are set by the content owner"; "Most datasets prohibit commercial purposes"; FAQ does not address embedding or redistribution — [OH3D FAQ](https://openheritage3d.org/faq) |
| Zamani Project | Home page shows "© Copyright 2022 Zamani Project - All Rights Reserved"; no terms of use found. Treat as all rights reserved; contact info@zamani-project.org — [zamaniproject.org](https://zamaniproject.org/) |

### Inferences
- Public Polycam captures are the only platform route that may carry a redistribution licence, but the exact CC variant and whether the licence covers downloaded files must be read per capture (UNVERIFIED).
- A MIT repo cannot carry BY-NC data as MIT; keep such data separate with its own licence file, or avoid. Sites commercial or ad-supported would violate NC.
- Using free tiers: Luma free use grants Luma broad rights over your Input, and commercial use of outputs needs a paid plan; avoid Luma free tier for anything you want to relicense.

### Gaps
- Not read: Teleport/Varjo terms, Polycam primary ToS and whether free plan allows PLY/SPZ export, Luma free splat export, Scaniverse export formats, KIRI EULA text, Sketchfab download rules and splat support, Scan the World per-object licence filter, Zamani data policy.

## 5. Delivery with Spark, formats and Cloudflare limits

### Takeaway
Spark (MIT) reads PLY, SPZ, SPLAT, KSPLAT, SOG and its own streamable .RAD; set a 500K to 2.5M splat budget and use LoD streaming. Cloudflare Pages caps every file at 25 MiB, so ship SOG/SPZ rooms under that, or put .RAD/large files on R2 (10 GB storage, free egress).

### Cited Findings
- Spark: MIT, World Labs; formats "PLY (also compressed), SPZ, SPLAT, KSPLAT, SOG"; "renders fast even on low-powered mobile devices"; aims at 98%+ WebGL2 — [Spark README](https://raw.githubusercontent.com/sparkjsdev/spark/main/README.md); CDN version shown as 2.4.0 on the docs page — [sparkjs.dev](https://sparkjs.dev/docs/)
- Spark 2.0: default splat count "500K - 2.5M depending on device type"; PackedSplats "16-byte/splat", ExtSplats "32-byte/splat"; GPU page table with default 16M splats; 100M to 1G+ splats claimed on mobile; `.RAD` supports "streaming arbitrary chunks of splats via HTTP Range requests"; `build-lod` CLI creates LoD trees; in-browser LoD build "1-3 sec for 1M input splats" — [Spark 2.0 features](https://sparkjs.dev/docs/new-features-2.0/)
- SPZ stores in column order and needs the whole file before display; first chunk holds the 64K largest splats so a coarse version appears almost instantly (search summary) — [radiancefields.com on Spark 2.0](https://radiancefields.com/world-labs-releases-spark-v2.0)
- SOG 15-20x smaller than PLY, SPZ about 10x (from earlier pass) — [PlayCanvas formats](https://developer.playcanvas.com/user-manual/gaussian-splatting/formats/)
- Rule of thumb: a raw PLY splat is about 248 bytes (62 floats); I did not confirm in a fetched source (UNVERIFIED), so 1M splats is roughly 250 MB PLY, 12-25 MB SOG, 25 MB SPZ (derived from the ratios above).
- Cloudflare Pages: "The maximum file size for a single Cloudflare Pages site asset is 25 MiB"; "up to 20,000 files on the Free plan"; 500 builds/month; 20-minute build timeout — [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- R2 free tier: "10 GB-month / month" storage; "1 million requests / month" Class A; "10 million requests / month" Class B; egress "Free"; free tier does not apply to Infrequent Access storage — [R2 pricing](https://developers.cloudflare.com/r2/pricing/)

### Inferences
- A 1M-splat room as SOG or SPZ is about 10-25 MB: fits one Pages file if kept at or below roughly 1M splats. Anything larger: split the .RAD into pieces or host on R2 behind a custom domain with CORS and Range headers (verify R2 supports Range, it does per S3 API, UNVERIFIED here).
- 10 GB R2 storage holds hundreds of room-scale splats; Class B (reads) 10M/month is the likely limit if each visit triggers many Range requests, so use few large chunks.
- Mobile target: keep `lodSplatCount` near the low end of 500K to 2.5M; Spark does not publish a measured 60 fps figure.
- Three.js r187 compatibility: earlier note says Spark needs three >= 0.179; no source tests r187. Pin and test.

### Gaps
- No real SOG/SPZ file sizes for measured room captures; no measured 60 fps splat counts on mid-range phones; Spark's exact three.js peerDependency range not fetched; R2 and Pages numbers as of November 2026 are from live pages fetched today, but a pricing page may differ from account behaviour.
