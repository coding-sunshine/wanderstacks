---
type: research-note
domain: wanderstacks
status: active
tags: [wanderstacks, capture-sources]
relatedTo: [reports/Wanderstacks realtime walkable library visits.md]
---

# Capture sources for walkable real-library visits (Wanderstacks)

Status: PARTIAL. Research was cut at the tool-call budget; many web fetches returned empty or blocked. Verified items cite a page. Anything marked UNVERIFIED comes from model background knowledge and must be checked before relying on it. The per-library table is mostly unresolved, and is honestly marked so.

## Google Street View / Maps Embed / Maps JS

### Takeaway
Maps Embed (incl. Street View mode) is free and unlimited, but needs an API key and can only be shown as Google's iframe (no own rendering, no walking logic of ours). Dynamic Street View and Photorealistic 3D Tiles are metered; 3D Tiles free cap is tiny.

### Cited Findings
- Maps Embed API: "Maps Embed usage is available at no charge"; no QPS or daily limits; API key required on all requests — [Embed usage and billing](https://developers.google.com/maps/documentation/embed/usage-and-billing)
- Pricing table (as returned by fetch of the pricing page, global list): Photorealistic 3D Tiles = Enterprise category, 1,000 free events/month, then $6.00 per 1K (first tier); Dynamic Street View = Pro, 5,000 free, $14.00 per 1K; Street View Tiles API = Essentials, 100,000 free, $2.00 per 1K; Maps Embed = Essentials, unlimited; Dynamic Maps (JS) = Essentials, 10,000 free, $7.00 per 1K — [Google pricing](https://developers.google.com/maps/billing-and-pricing/pricing). Note: the fetch summariser gave only the first tier; confirm on page.
- Photorealistic 3D Tiles policy: must display attribution from each tile's glTF `asset.copyright`; caching only as Cache-Control headers/agreement allow; forbidden: image analysis, machine interpretation, object detection, geodata extraction/resale, offline use; own 3D overlays allowed only if not derived/traced from the tiles — [3D Tiles policies](https://developers.google.com/maps/documentation/tile/policies)
- Maps Embed permitted use is governed by Maps Platform ToS "License Restrictions" (not read) — [Embed usage](https://developers.google.com/maps/documentation/embed/usage-and-billing)

### Inferences
- Google 3D Tiles at 1,000 free events/month is not viable for a public free-tier site; this matches the user's decision to drop them. Static self-hosted tile caching/offline is forbidden anyway.
- Street View Tiles API (100K free) is cheaper but a card-backed billing account is required; ToS on pre-fetching/caching Street View imagery not verified (UNVERIFIED: Google generally prohibits caching/re-hosting imagery).
- An Embed iframe can give "start outside" for the real exterior with zero cost, but cannot be fused with our three.js scene.

### Gaps
- Embed ToS wording on iframe use on third-party sites, key HTTP-referrer restriction behaviour: not fetched.
- Indoor Street View ("Trusted"/business photo tours) of specific libraries: not checked per library.

## Cesium ion

### Takeaway
Community tier is free for non-commercial use but streams Google tiles at only 1,000 root tiles/month; not a fix for scale.

### Cited Findings
- Community: free, 10 GB storage, 15 GB/month streaming, Google Photorealistic 3D Tiles 1,000 root tiles/month, 1,000 global imagery sessions/month; for "non-commercial personal projects" or exploratory commercial work; orgs >$50K annual revenue, funded research or government need paid; paid plans $149-$524/month — [Cesium ion pricing](https://cesium.com/platform/cesium-ion/pricing/)

### Inferences
- A public open-source site with unbounded visitors would exceed 1,000 root tiles/month quickly. Google tile policy above still applies via ion.

### Gaps
- OSM Buildings asset terms (ODbL via ion) and whether Community allows public deployment: not fetched.

## Mapillary / KartaView / Panoramax

### Takeaway
Mapillary is CC BY-SA imagery with a token-gated API; Panoramax is fully open. All are street-level (outdoor); interior coverage of libraries is not established.

### Cited Findings
- Mapillary imagery is CC BY-SA; API needs client/user token; limits: entity 60,000/min/app, search 10,000/min/app, tiles 50,000/day; bbox search must be under 0.01 degrees square — [Mapillary API docs](https://www.mapillary.com/developer/api-documentation)
- Panoramax: free, open-source, federated street-level photo platform, anyone can upload; imagery "freely available for viewing and reuse" (specific licence per picture not read) — [Panoramax docs](https://docs.panoramax.fr/)

### Inferences
- CC BY-SA means a derivative (e.g. splat/mesh) would likely need to be shared under BY-SA with attribution. UNVERIFIED legal reading.

### Gaps
- Mapillary licence help page returned 403. KartaView licence/API: not checked. No 360 sequences near any listed library were queried.

## Sketchfab / splat platforms / heritage repositories

### Takeaway
Sketchfab API search works without auth and exposes licence and isDownloadable fields, so per-library discovery can be scripted. Generic "library interior" CC BY results are game props, not real libraries; no real-library capture was confirmed.

### Cited Findings
- Sketchfab public API `https://api.sketchfab.com/v3/search?type=models&q=...&license=by` returns licence label and downloadable flag; first results for "library interior" were unrelated props (books, bookcases, lobby) all CC Attribution + downloadable — [API query](https://api.sketchfab.com/v3/search?type=models&q=library%20interior&license=by&sort_by=-likeCount&count=24)
- Query "Long Room Trinity" returned zero Sketchfab models — [API query](https://api.sketchfab.com/v3/search?type=models&q=Long%20Room%20Trinity&count=10)
- Sketchfab supports CC0 public-domain dedication for cultural heritage 3D — [Sketchfab blog](https://sketchfab.com/blogs/community/sketchfab-launches-public-domain-dedication-for-3d-cultural-heritage)
- Polycam offers free Gaussian splat creation and public splat gallery; Luma has a web splat app — [Polycam splat](https://poly.cam/gaussian-splatting)
- Open Heritage 3D is a heritage dataset repository; licence/redistribution terms not shown on the home page — [openheritage3d.org](https://openheritage3d.org/)
- Niantic Spatial "Places Library": 100 real-world environments as USDZ with Gaussian splats plus collision meshes (not libraries; terms unchecked) — [radiancefields.com](https://radiancefields.com/niantic-spatial-launches-places-library)

### Inferences
- Rule of thumb (UNVERIFIED, check each model): Sketchfab CC BY / CC0 + downloadable = can self-host with attribution; CC BY-NC/ND or non-downloadable = embed only; no licence info = link only.
- Embedding a Sketchfab viewer iframe cannot be merged into our scene (no walking colliders), so only downloadable CC BY/CC0 are useful for the walk-in goal.

### Gaps
- Sketchfab download/embedding help page unreachable. Polycam/Luma/KIRI/Scaniverse licence terms for public captures: not read (default assumption: owner-all-rights, embed/link only unless a CC licence is stated).
- Scan the World, CyArk, Zamani, Europeana, Open Heritage 3D per-site licences: not checked.

## Wikimedia Commons panoramas and photos

### Takeaway
Not resolved. Two Commons API probes returned zero hits (search query too specific; category name guessed wrong), so no licence/file list yet.

### Cited Findings
- None verified.

### Gaps
- Needs proper queries, e.g. `action=query&list=search&srsearch=incategory:"Interior of Trinity College Library" ` or `Category:360° panoramas` subcategories, plus `prop=imageinfo&iiprop=extmetadata` for licence. Commons photos are mostly CC BY-SA/CC BY/PD; equirectangulars exist but per-library coverage unconfirmed.

## Official library virtual tours

### Takeaway
Trinity (Dublin) has an official 360 tour page; licence not stated in results, almost certainly all rights reserved (UNVERIFIED).

### Cited Findings
- TCD Library offers "Library Virtual Tours & 3D Floorplans" — [tcd.ie 360 page](https://www.tcd.ie/library/using-library/360.php)
- Panoramic Ireland has a commercial 360 of the Long Room — [panoramicireland.com](https://panoramicireland.com/guide-to-ireland/360-degree-panoramas-of-ireland/trinity-college-360-degree-panorama)
- TCD V-SENSE has a Long Room mixed-reality project — [v-sense.scss.tcd.ie](https://v-sense.scss.tcd.ie/?p=2213)

### Gaps
- Admont, Strahov, LoC, ONB, Melk, Klementinum, Bodleian, BnF tours: not searched. Iframe permission (X-Frame-Options) not tested for any.

## Tools to make own splats

### Takeaway
Not researched this pass.

### Gaps
- COLMAP (BSD), gsplat (Apache-2.0), Nerfstudio (Apache-2.0), Brush (Apache-2.0), Postshot (proprietary, free tier terms?) licences are UNVERIFIED background knowledge. Whether a CC BY-SA photo set may be turned into a redistributed splat: UNVERIFIED; likely a derivative requiring BY-SA + attribution, and ND-licensed photos excluded. Needs legal read of CC BY-SA 4.0 "Adapted Material".

## Per-library availability

### Takeaway
No library confirmed with a self-hostable capture. Only Long Room has known non-free options (official tour, Panoramic Ireland, TCD V-SENSE).

### Cited Findings
| Library | Known capture | Licence | Class |
|---|---|---|---|
| Long Room, Trinity Dublin | [TCD 360 tour](https://www.tcd.ie/library/using-library/360.php) | not stated (assume all rights reserved) | link only |
| Long Room (commercial) | [Panoramic Ireland](https://panoramicireland.com/guide-to-ireland/360-degree-panoramas-of-ireland/trinity-college-360-degree-panorama) | commercial | link only |
| Bodleian | [Bodleian photogrammetry blog](https://blogs.bodleian.ox.ac.uk/theconveyor/up-close-and-3d-photogrammetric-models-at-the-bodleian/) (objects, not the building; licence unchecked) | unknown | link only |
| Other 33 libraries | none found / not searched | n/a | unresolved |

### Gaps
- Entire remainder of the list (Admont, Strahov, LoC, Celsus, ONB, BnF, St Gall, Mafra, NYPL, BPL, Peabody, El Escorial, Gabinete, Melk, Klementinum, Vatican, Wiblingen, Anna Amalia, Ottawa, Stockholm, Nalanda, Indian libraries, al-Qarawiyyin, Alexandrina, Palafoxiana, Vasconcelos, State Library Victoria, Binhai, Suleymaniye) not checked. Suggested next pass: script Sketchfab API per name (free, no auth) and Commons API `imageinfo|extmetadata` per name, then fetch the official tour pages for headers.
