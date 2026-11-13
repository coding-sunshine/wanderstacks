# Techniques and free services for a real in-browser walk-around of a real library (as of 2026-11-10)

Method: ~25 tool calls on top of the two earlier note sets (`Wanderstacks realistic dynamic worlds`, `Wanderstacks realtime walkable library visits`). Page text came through a small summarising model (WebFetch), so exact strings should be spot-checked. Items marked UNVERIFIED are background knowledge or inference. Not legal advice.

Corrections to the earlier notes: (1) Marzipano is now archived (read-only 2026-04-20), so it is no longer a safe pick. (2) VGGT has a separate commercial checkpoint and a May 2026 "VGGT-Omega" update. (3) Apple SHARP and DA360 are new since the earlier pass. (4) The Google pricing page now lists a Static Street View SKU at 10,000 free (the earlier note listed only Tiles/Dynamic).

## 1. Map and street imagery: quotas, terms, what may be stored

### Takeaway
Only the Google Maps Embed API (Street View iframe) is free and unlimited, but it must be shown live as Google's iframe and cannot be cached or merged into our scene. Every Google imagery SKU forbids caching, pre-fetching and offline use, so Google gives "live embed only". The storable street-level sources are Mapillary, KartaView and Panoramax (all CC BY-SA 4.0, attribution plus share-alike), and the storable map data is OSM, Overture buildings (ODbL) and OpenFreeMap tiles.

### Cited Findings
- Google pricing page, global first-tier list (the page showed no "last updated" date; fetched 2026-11-10): Static Street View = Essentials, 10,000 free/month, then $7.00 per 1K; Dynamic Street View = Pro, 5,000 free, $14.00/1K; Street View Tiles = Essentials, 100,000 free, $2.00/1K; Map Tiles API 2D = Essentials, 100,000 free, $0.60/1K; Photorealistic 3D Tiles = Enterprise, 1,000 free, $6.00/1K; Maps Embed = Essentials, unlimited, free; Dynamic Maps (JS) = Essentials, 10,000 free, $7.00/1K. Higher volume tiers are cheaper (not captured) — [Google Maps pricing](https://developers.google.com/maps/billing-and-pricing/pricing)
- Maps Embed API: "Maps Embed usage is available at no charge", no QPS or daily limit, API key required — [Embed usage](https://developers.google.com/maps/documentation/embed/usage-and-billing)
- Google Maps Platform service terms (summary): no caching of Map Tiles or Street View for offline use, no bulk pre-fetching, no scraping; only lat/lng, place IDs and place data may be cached, up to 30 days; Street View "must be requested dynamically" — [Maps service terms](https://cloud.google.com/maps-platform/terms/maps-service-terms) (exact clause wording not read; summariser paraphrase)
- Photorealistic 3D Tiles: attribution from each tile's glTF copyright required; caching only per Cache-Control; no image analysis, geodata extraction or offline use — [3D Tiles policies](https://developers.google.com/maps/documentation/tile/policies)
- Cesium ion Community tier (page undated): 10 GB storage, 15 GB/month streaming, Google Photorealistic 3D Tiles 1,000 root tiles/month, 1,000 Global Imagery sessions, 50,000 geocodes, 20 gigapixels reality modelling; "personal and non-commercial use"; upgrade if revenue above $50K, funds raised above $50K, government work, or over quota — [Cesium ion pricing](https://cesium.com/platform/cesium-ion/pricing/). Export/caching rights not stated there.
- Mapillary API: entity API 60,000 req/min/app, search 10,000 req/min/app, tiles 50,000 req/day/app; access token required on all calls; `is_pano` flag for 360 images; "© Mapillary" attribution; cache/retention policy not in the API docs — [Mapillary API docs](https://www.mapillary.com/developer/api-documentation). Imagery licence CC BY-SA 4.0 (with extra permission to derive data for OSM/Commons) — [OSM wiki street-level imagery](https://wiki.openstreetmap.org/wiki/Street-level_imagery)
- KartaView images usable under CC BY-SA 4.0; Panoramax uses CC BY-SA 4.0 and etalab-2.0 (per picture) — [OSM wiki](https://wiki.openstreetmap.org/wiki/KartaView), [search summary](https://wiki.openstreetmap.org/wiki/Street-level_imagery_services). KartaView API quotas not found.
- OpenFreeMap: free public instance, no registration, no API key, no usage limit stated, commercial use allowed, attribution handled by MapLibre, MIT, self-hostable, styles include a "3D" style; offline bulk download limited to 3,000 tiles or 50 MB per request pattern — [OpenFreeMap](https://openfreemap.org/)
- Overture Maps Buildings theme: ODbL with per-source attributions (OSM, Esri CC BY 4.0, Microsoft ODbL, Google Open Buildings CC BY 4.0); storage and redistribution allowed if attribution and share-alike kept; doc last updated 2026-05-15 — [Overture attribution](https://docs.overturemaps.org/attribution/)
- Earlier note (not re-fetched): Mapillary and Panoramax are street-level (outdoor) and interior coverage of libraries is unestablished — [capture_sources.md](research_notes/Wanderstacks%20realtime%20walkable%20library%20visits/capture_sources.md)

### Inferences
- Rank for "real surroundings outside": (1) Google Maps Embed Street View iframe as a "Look around" panel or link-out (free, real, zero storage, but isolated from our 3D); (2) Mapillary/KartaView/Panoramax 360 images stored and re-served with attribution, if coverage exists near each library (also CC BY-SA, so derived panoramas should be BY-SA); (3) Commons panoramas; (4) OSM/Overture building extrusions on an OpenFreeMap basemap for a neutral but honest surroundings model, fully storable under ODbL.
- Photorealistic 3D Tiles are unusable for a free static site (1,000 events/month, no offline, no derived geometry). Cesium ion Community is non-commercial and 1,000 root tiles, so likewise a demo only.
- Mapillary token is free, but ToS storage terms were not confirmed; storing images is permitted by the CC BY-SA licence in principle, but check `mapillary.com/terms` before bulk mirroring (UNVERIFIED).
- Do not mix Google imagery with anything we store: derive nothing from it.

### Gaps
- Google Maps Platform ToS exact wording on iframe embedding on third-party sites and key referrer restrictions: not read. Google pricing tiers beyond the first and the pricing page date: not available.
- Mapillary terms of use, KartaView API limits, Protomaps terms/limits (not fetched; PMTiles single-file hosting on Cloudflare R2 is UNVERIFIED background): not confirmed.
- Per-library street-level coverage in Mapillary/Panoramax/KartaView: not queried.

## 2. Panorama tours: viewers, tiling, faking movement

### Takeaway
Photo Sphere Viewer v5 (MIT, three.js-based) with its Virtual Tour, Markers, Gallery, Map/Plan and Compass plugins is the best maintained open-source choice. Marzipano is archived; Pannellum is tiny (about 21 KB) but has weaker tour tooling. Faked movement between panoramas is best done as a crossfade plus camera rotate/zoom toward the link, upgraded to a depth-warped transition if depth maps exist.

### Cited Findings
- Photo Sphere Viewer: MIT, monorepo with plugin packages, 2.4k stars, rewritten in TypeScript, uses three.js — [GitHub](https://github.com/mistic100/Photo-Sphere-Viewer), [portalzine 2026 roundup](https://portalzine.de/open-source-virtual-tour-360-panorama-libraries-in-javascript-2026/)
- Virtual Tour plugin: client mode (all nodes upfront) or server mode (async load); links placed manually or by GPS (EPSG:4326); 2D or 3D arrows; transitions with fade and rotation, default speed "20rpm"; optional preloading of nodes; multiresolution/tile support; integrates with Gallery, Map, Plan, Compass — [PSV Virtual Tour docs](https://photo-sphere-viewer.js.org/plugins/virtual-tour.html)
- Marzipano: Apache-2.0, tile-based streaming and hotspots, but repo is archived, read-only as of 2026-04-20 — [Marzipano GitHub](https://github.com/google/marzipano)
- Pannellum recommended for lightweight single panoramas (21 KB), PSV for feature-rich tours; krpano and 3DVista are commercial — [portalzine 2026 roundup](https://portalzine.de/open-source-virtual-tour-360-panorama-libraries-in-javascript-2026/) (secondary)
- DA360 (Depth Anything in 360 degrees, Insta360 Research, 2025-12-28): panorama-adapted Depth Anything V2 that outputs scale-invariant depth for well-formed point clouds, circular padding to avoid seams, about 30% lower relative error than PanDA — [arXiv 2512.22819](https://arxiv.org/html/2512.22819). Licence not found.

### Inferences
- Tiling: cut equirectangulars into a cube-face or equirect tile pyramid with `nona`/`libvips` (UNVERIFIED tool choice); PSV's equirectangular tiles adapter reads these. A 8K pano compressed to WebP is roughly 1-3 MB; a low-res base plus tiles keeps first paint fast on phones.
- Fake movement ladder (cheap to rich): (a) crossfade with the camera turning to face the link; (b) add a forward zoom (FOV narrowing) of 10-20% during the fade; (c) project each pano onto a depth mesh from DA360 and tween the virtual camera between the two capture points while crossfading (parallax, no true geometry); (d) dollhouse overview from a floorplan with pano pins. (c) is custom three.js work, no off-the-shelf PSV plugin found.
- Edge: any interior photo set from Commons rarely has linked, positioned panoramas, so tours apply mostly to libraries with official or Mapillary 360s.

### Gaps
- Pannellum and Marzipano details were from a secondary roundup only. DA360 licence and weights, depth-warp transition quality, and tile pyramid tooling (nona/libvips/PSV tools): not confirmed.
- PSV current version number and release date: not retrieved.

## 3. Photos to 3D: reconstruction and generation, Mac and licence status

### Takeaway
No tool turns 10-50 casual Commons interior photos into a reliable walkable splat; the strong systems need hundreds of overlapping images or CUDA. On an Apple Silicon Mac, the confirmed paths are COLMAP poses plus Brush (WebGPU) or OpenSplat (Metal, AGPL), and Apple SHARP for single-image-to-splat (MPS). Many of the best feed-forward models (MASt3R, VGGT original) are non-commercial.

### Cited Findings
- Brush: runs on macOS/Windows/Linux/Android/web via WebGPU and Burn; COLMAP or Nerfstudio datasets — [Brush README](https://raw.githubusercontent.com/ArthurBrussee/brush/main/README.md). OpenSplat: AGPLv3, Metal on macOS, about 2 GB GPU memory per million Gaussians — [OpenSplat README](https://raw.githubusercontent.com/pierotofy/OpenSplat/main/README.md) (both from earlier note).
- MASt3R: code CC BY-NC-SA 4.0 (non-commercial); checkpoint notice says the mapfree dataset licence "is very restrictive"; setup targets CUDA 12.1, no MPS mention — [MASt3R GitHub](https://github.com/naver/mast3r)
- VGGT (Meta/Oxford): original VGGT-1B is non-commercial; VGGT-1B-Commercial is available via an application form with automated approval, commercial except military; handles single images to hundreds of views; outputs cameras, depth, point maps, tracks; COLMAP export works with gsplat 1.3.0; CUDA oriented, MPS not mentioned; May 2026 "VGGT-Omega" gives roughly 2-3x more input frames per GPU budget — [VGGT GitHub](https://github.com/facebookresearch/vggt)
- HunyuanWorld-Mirror (Tencent): multi-view (and optional priors) to point clouds, depth, normals, cameras and 3D Gaussians in one forward pass; weights released 2025-10-22; updated 2026-05-20 (ICML 2026); needs CUDA 12.4 and gsplat; licence territory terms not shown on the page — [GitHub](https://github.com/Tencent-Hunyuan/HunyuanWorld-Mirror). Earlier note: Hunyuan3D 2.0 licence excludes EU/UK/South Korea — [HF LICENSE](https://huggingface.co/tencent/Hunyuan3D-2/blob/main/LICENSE)
- Apple SHARP (ml-sharp): one photograph to 3D Gaussians in under a second on a standard GPU, feed-forward; prediction runs on CPU, CUDA and MPS (Apple Silicon), video rendering needs CUDA; output standard 3DGS `.ply`; code and model weights have separate LICENSE and LICENSE_MODEL files (terms not read) — [ml-sharp GitHub](https://github.com/apple/ml-sharp)
- World Labs Marble: Free cannot export; Standard exports SPZ/PLY splats, panoramas and collider mesh; Pro adds textured GLB and commercial rights; recommends Spark for web — [Marble export docs](https://docs.worldlabs.ai/marble/export/gaussian-splat). API pricing from earlier note: $1.00 = 1,250 credits, world = 1,500 credits (about $1.20), draft 150 credits — [World Labs API pricing](https://docs.worldlabs.ai/api/pricing.md). Subscription prices ($20 Standard, $35 Pro) came from an aggregator dated Aug 2026 and were not re-checked.
- Single-panorama to roamable splat is an active 2026 research area: Genie Sim PanoWorld (feed-forward ERP panorama to Gaussian scene, single consumer GPU; arXiv 2607.26646, 2026-07-29), InstantVR (sparse equirectangular sequence to walkable 6-DoF 3DGS), One2Scene — [alphaxiv PanoWorld](https://www.alphaxiv.org/abs/2607.26646), [search summary](https://arxiv.org/abs/2604.07105). Code/licence availability unchecked.
- Photo Tourism style sets work for exteriors with WildGaussians; limits include regions occluded in nearly all images — [WildGaussians arXiv 2407.08447](https://arxiv.org/html/2407.08447v2) (from earlier note)
- Postshot: free tier non-commercial, Windows/NVIDIA per background knowledge (UNVERIFIED) — [Jawset EULA](https://activation.jawset.com/eula)

### Inferences
- Can Commons photo sets of one room be reconstructed? For interiors: only as a vantage-limited result. Rough rule (UNVERIFIED, from experience with 3DGS): below about 30-50 well-overlapped images with varied positions, SfM registers few views; 100-300 are needed for a walkable result. Typical Commons coverage of one reading room is 5-30 images from a few spots with people and mixed lighting, so expect partial COLMAP registration, floaters and holes. Treat as unproven.
- Good fit: SHARP or Marble on a single good wide photo gives a parallax "2.5D" slice for a gentle in-place head-move, not a walk. That is honest if labelled.
- Licence of outputs: a splat built from CC BY-SA photos is plausibly Adapted Material (BY-SA, per earlier note's reading of CC legalcode); Marble output rights depend on plan (commercial rights only on Pro). MASt3R and original VGGT weights block commercial use; the Commercial VGGT checkpoint, Brush, OpenSplat and COLMAP are the clean-ish chain (Brush/COLMAP licences themselves not re-verified).
- Mac pipeline: poses via COLMAP (CPU) or VGGT-Commercial on a rented CUDA GPU, then train with Brush locally; use rented GPU for VGGT/MASt3R-class steps.

### Gaps
- Licences of Brush, COLMAP, gsplat, InstantSplat, WonderWorld, SHARP (file text), DA360, PanoWorld: not read. InstantSplat and WonderWorld not researched this pass.
- No measured results on Commons interiors or Mac timings.
- Marble ToS ownership terms and Marble current plan prices on the primary pricing page: not read.

## 4. Web splat rendering: engines, formats, sizes, controls

### Takeaway
Spark (MIT, three.js) and the PlayCanvas engine both render splats in browsers; the SOG format (15-20x smaller than PLY) is the best web format, built with the MIT-licensed `splat-transform` CLI. Production examples cap at about 1.4M splats on mobile and 3.5M on desktop.

### Cited Findings
- Spark: MIT, `npm install @sparkjsdev/spark`; docs cover v2.0, LoD, formats, performance, mobile and XR; Spark 2.0 defaults 500K-2.5M splats depending on device, `.RAD` streaming via HTTP Range, `build-lod` CLI — [Spark docs](https://sparkjs.dev/docs/), [Spark 2.0](https://sparkjs.dev/docs/new-features-2.0/) (from earlier note)
- PlayCanvas formats: SOG "15-20x smaller than PLY", lossy, best for web; Streamed SOG for progressive loading; SPZ "roughly 10x smaller"; GLB with KHR_gaussian_splatting; LCC2 — [PlayCanvas formats](https://developer.playcanvas.com/user-manual/gaussian-splatting/formats/)
- SplatTransform: MIT CLI, reads PLY, compressed PLY, SOG, Streamed SOG, SPZ, SPLAT, KSPLAT, LCC, LCC2; writes PLY, SOG, Streamed SOG, SPZ, GLB, LOD, voxel and HTML viewer; filtering, decimation, merging, and voxelisation to make collision meshes — [splat-transform GitHub](https://github.com/playcanvas/splat-transform)
- Grace Cathedral (PlayCanvas, capture by Vincent Woo): about 3.5M splats on desktop, 1.4M on mobile; Streamed SOG starting at a coarse LOD; on-demand rendering; capped device pixel ratio; interior collision mesh doubles as depth pre-pass occluder; WebGPU hybrid renderer with WebGL2 fallback; interior navigation via authored waypoint graphs with spline interpolation, exterior via orbit controller — [PlayCanvas blog](https://blog.playcanvas.com/building-the-grace-cathedral-experience)
- Cloudflare Pages: 25 MiB per file, 20,000 files free; R2 free 10 GB with free egress — [Pages limits](https://developers.cloudflare.com/pages/platform/limits/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/) (earlier note)

### Inferences
- Budget: 1M splats is about 12-25 MB as SOG/SPZ, so one room per file on Pages; larger scenes go to R2 or Streamed SOG.
- First-person: waypoint-graph walking (as Grace Cathedral does) beats free walking for sparse captures, since holes appear when the camera leaves captured positions; add a simple collision mesh via voxelisation.
- Pick Spark if staying in the existing three.js scene (page-turn reads, globe); PlayCanvas engine if the splat scene is the whole page.
- KSPLAT/GaussianSplats3D: not covered by a primary source this pass; treat as legacy and prefer SOG/SPZ.

### Gaps
- Real measured mobile fps, SOG sizes for a room-scale scene, and Spark's three.js peer range: not found. GaussianSplats3D status/licence: not checked.

## 5. Image extension: outpainting, honesty, labelling

### Takeaway
Outpainting a flat photo to an equirectangular panorama invents most of the sphere, so it must be shown as "AI-extended, not a real place". I found no primary source this pass on specific panorama-outpainting tools; the labelling advice comes from heritage standards found earlier.

### Cited Findings
- London Charter: principles of intellectual and technical transparency for 3D visualisation; paradata recorded with the model — [londoncharter.org](https://londoncharter.org/introduction.html) (from earlier note)
- Seville Principles include authenticity, historical rigour and scientific transparency — [VWHL Indiana](https://vwhl.luddy.indiana.edu/sevillePrinciples/index.html) (from earlier note)
- "Hallucinated heritage": convincing AI visuals spread fabrications to non-expert audiences — [EGU26-21526](https://meetingorganizer.copernicus.org/EGU26/EGU26-21526.html) (search summary, from earlier note)

### Inferences
- Label scheme: three visible states on every view: "Photograph" (real, with credit and licence), "Reconstructed from N photographs" (splat), "AI-generated, imagined" (outpainting, Marble, SHARP-from-text); store model, version, prompt and source image in the info panel.
- Do not outpaint over spaces that have a real photo of that area; never generate inscriptions, book spines or faces.
- For lost libraries it is the only option, so make the generated state the visible default and carry the label in the HUD, not a footnote.

### Gaps
- No tool-level data (Skybox/Blockade, SDXL panorama LoRA, FLUX outpainting) retrieved or licence-checked. EU AI Act Article 50 labelling duties: not researched.

## 6. Reference sites that do real heritage walk-arounds

### Takeaway
The best current examples use captured splats rendered in the browser with authored waypoint navigation and streamed compressed formats, not photos stitched on spheres.

### Cited Findings
- CyArk Tapestry "America 250" collection: three US heritage interiors captured with a handheld XGRIDS PortalCam (interiors) and drone (exteriors), rendered with PlayCanvas Engine plus Spark over WebGPU, SPZ and SOG formats, 3D Tiles streaming, first-person "Explore in 3D" walk mode — [Radiance Fields](https://radiancefields.com/cyark-launches-america-250-tapestry-collection-with-gaussian-splatting). CyArk data is CC BY-NC 4.0 (earlier note) — [CyArk data use](https://www.cyark.org/data-use-policy)
- Grace Cathedral experience, described above — [PlayCanvas blog](https://blog.playcanvas.com/building-the-grace-cathedral-experience)
- Montreal Museum of Fine Arts gallery splat R&D on PlayCanvas with SOGS v2; World Labs "Musee du Monde" showcase — [search listing](https://www.worldlabs.ai/musee-du-monde) (details not opened)

### Inferences
- All reference sites rely on purpose-made captures (scanner or dense photography), not Commons photos. That is the gap Wanderstacks cannot close from free web sources alone.

### Gaps
- Matterport, Google Arts and Culture, and Vatican Museums tour tech were not examined. Musee du Monde and Montreal pages not opened.

## 7. Ranked comparison and recommended pipeline per tier

### Takeaway
Rank by honest realism per unit of effort: (1) licensed real 360 tour or own-captured splat, (2) stored CC 360 stills in Photo Sphere Viewer with fake movement, (3) live Google Street View embed outside, (4) Marble/SHARP generated worlds labelled as imagined, (5) COLMAP splat from Commons interiors (lowest odds). Recommended tiers below.

### Cited Findings
- Ranked table (cost, licence, quality, browser load, build effort; drawn from the sections above):

| Rank | Approach | Cost | Licence | Quality | Browser | Effort |
|---|---|---|---|---|---|---|
| 1 | Real 360 tour link-out or embed (official) | free | all rights reserved, link only | real | iframe | very low |
| 2 | PSV Virtual Tour on stored CC/PD 360s | free | per-image, BY-SA share-alike | real, linked stills | light (tiles) | medium |
| 3 | Google Street View embed iframe (outside) | free, key | ToS: live only | real | iframe | very low |
| 4 | Mapillary/KartaView/Panoramax stored 360 | free token | CC BY-SA | real but patchy | light | medium |
| 5 | Own-captured splat (Brush/Postshot) to SOG, Spark | free tools | own | highest | 1-3.5M splats, 12-25 MB+ | high, needs on-site capture |
| 6 | Marble world (paid export) | about $1.20/world API or $20-35/mo | Pro for commercial | imagined | SPZ ~500K-2M | low, labelled imagined |
| 7 | SHARP single-photo splat | free, Mac MPS | LICENSE_MODEL unread | 2.5D parallax | small | low |
| 8 | COLMAP/VGGT/WildGaussians from Commons | free + GPU rental | BY-SA propagates; VGGT-Commercial form | unproven for interiors | SOG | high, uncertain |
| 9 | Google Photorealistic 3D Tiles / Cesium | free 1,000/month | no cache, non-commercial | real exterior | tiles | unviable at scale |

### Inferences
- Tier A, libraries with a real 360 tour (e.g. Trinity Long Room per earlier note): embed or link the official tour with credit; keep our own scene for outside only. If the owner allows reuse, use PSV with their tiles; otherwise iframe/link-out. Outside: Street View iframe or stored Mapillary 360 with attribution.
- Tier B, libraries with a few 360 stills (Commons or Mapillary): PSV Virtual Tour with 2-6 nodes, fade-and-turn transitions, floorplan or Map plugin, optional DA360 depth parallax. Label "N real panoramas"; no invented rooms between them.
- Tier C, flat photos only: Commons photo gallery wrapped in a gentle SHARP or Marble 2.5D parallax per hero photo, labelled "photo with generated depth". Do not outpaint to a full sphere unless labelled imagined. Try COLMAP on the best-covered 1-2 libraries as an experiment; keep only if registration succeeds.
- Tier D, lost libraries: Marble or hand-built hall kit from sourced dimensions, flagged "imagined", with the evidence tags from the earlier notes.
- Common stack: Spark/three.js (already in the repo), SOG via splat-transform, tiles on Cloudflare Pages/R2, basemap from OpenFreeMap with Overture/OSM 3D buildings (ODbL attribution), all attributions in an info panel.
- Biggest risks: ToS reading of Google iframe use, CC BY-SA propagation, and unproven Commons interior reconstruction.

### Gaps
- Per-library tier assignment not done (needs Commons and Mapillary queries per library, noted in earlier note). Pricing for Marble subscriptions and Postshot on Mac unconfirmed on primary pages.
