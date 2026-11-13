# Wanderstacks globe / map entry screen: realism vs speed (research as of 2026-11-08)

Research budget was exceeded slightly; several sub-questions are only partly sourced. Items from background knowledge are NOT cited and are listed under Gaps or marked "unverified".

## 1. Google Photorealistic 3D Tiles (Map Tiles API)

### Takeaway
Technically usable from three.js with a referrer-restricted browser key, but it is an Enterprise-SKU product with only 1,000 free root-tile requests/month, mandatory attribution, no caching beyond response headers, and no offline use. A popular free site can exceed 1,000 sessions quickly and then bills $6/1000. Use it only as an optional, capped "zoom to real place" layer, not as the base entry globe.

### Cited Findings
- Photorealistic 3D Tiles is in the Enterprise SKU category; free monthly cap 1,000 billable events; $6.00 per 1,000 root tile requests up to 100,000, then $5.10, $4.20, $3.30, $2.40 at higher tiers. SKU ID C6E1-98B2-DBD0 — [Google pricing](https://developers.google.com/maps/billing-and-pricing/pricing)
- By contrast 2D Map Tiles get 100,000 free events/month — [Google pricing](https://developers.google.com/maps/billing-and-pricing/pricing)
- Only root tileset requests are billed (not each tile); a session token allows up to three hours of renderer tile requests from one root request. Daily quota docs: 10,000 root tileset queries/day for 3D tiles. Billing must be enabled and an API key or OAuth token is required on all requests — [Usage and billing](https://developers.google.com/maps/documentation/tile/usage-and-billing)
- Tile requests must carry the API key plus the session parameter from the root tileset response; the key can be restricted to specific HTTP referrers/domains — [3D Tiles docs](https://developers.google.com/maps/documentation/tile/3d-tiles) (via search summary)
- Policies: caching only as allowed by Maps Platform Service Specific Terms and must obey Cache-Control headers (max-age, must-revalidate, private). Prohibited: bulk download/extraction, offline use of any kind, tracing/digitising, non-visualisation use (ML/object detection), exporting content. Must show Google Maps logo (or text "Google Maps") and data attributions from tile responses, not obscured — [Map Tiles policies](https://developers.google.com/maps/documentation/tile/policies)
- Custom renderers are allowed provided they support copyright attribution — [Create renderer](https://developers.google.com/maps/documentation/tile/create-renderer)
- NASA-AMMOS 3DTilesRendererJS: Apache-2.0 (Caltech/JPL); has a Google Photorealistic Tiles example needing "a Google Tiles API Key"; supports three.js, plugins incl. fade transitions, map tiles, GeoJSON, vector tiles; cache limits are hard caps (`maxBytesSize`) — [GitHub](https://github.com/NASA-AMMOS/3DTilesRendererJS)
- A static-site Google Earth clone exists using env-var API key — [jeantimex/google-earth](https://github.com/jeantimex/google-earth)

### Inferences
- A key in client JS is visible; referrer restriction plus an API-restriction to Map Tiles API plus a quota/budget cap in Cloud Console is the only protection. Referrers can be spoofed outside browsers, so set a hard daily quota (e.g. 300 root requests/day) so abuse stalls rather than bills. (Standard Google practice; quota-setting specifics not verified here.)
- Each page session that opens the 3D layer = 1 billable root request; gating it behind a user click on one of ~30 sites keeps counts low. 1,000 free sessions/month is thin for a public site.
- Data per fly-in is probably tens of MB (unverified; not measured), which would break the 25 MB/room budget if counted. Google tile bytes are fetched from Google, not Cloudflare, so they may not count against site egress, but they hit user data.
- Several ancient sites (Alexandria, Nalanda) are ruins/destroyed; modern 3D mesh shows today's city, not the lost building. Value is only context.

### Gaps
- Whether 3dtiles-renderer WebGPU/r186 is supported: not found.
- Whether Google's Service Specific Terms restrict non-Google "basemap" mixing with custom overlays beyond attribution: not retrieved.
- Real per-session MB for Google 3D tiles: not found.
- Any non-commercial/free-programme exemption: none found; assume none.

## 2. Cesium ion / CesiumJS

### Takeaway
Community tier is free but only for personal/non-commercial/unfunded educational use, with 5 GB-class limits, so Wanderstacks qualifies but must stay small. Cesium is a heavy second renderer, conflicts with the three.js stack, so use ion only as a data source if at all.

### Cited Findings
- Community (free): 10 GB storage, 15 GB/month streaming; "personal and non-commercial use"; fits "individual projects and evaluation" and "unfunded educational activities"; includes 1,000 sessions/month for global imagery from Bing Maps and Google Maps — [Cesium ion pricing](https://cesium.com/platform/cesium-ion/pricing/)
- CesiumJS library is open source (Apache-2.0) — unverified here, from background knowledge.

### Inferences
- 1,000 imagery sessions/month is the same order as Google's 3D free cap; no better than Google direct.
- Pulling Cesium World Terrain / Bing through ion from a three.js app is possible via 3DTilesRenderer ion plugin (unverified) but adds token exposure; no gain over static data.

### Gaps
- Cesium World Terrain availability, attribution rules and community-tier limits: not in fetched content.
- Whether "non-commercial" includes a donation-supported free site: not stated.

## 3. Free/open imagery and basemap options

### Takeaway
Best fit for budgets: self-hosted static NASA Blue Marble (public domain) at 4k-8k as KTX2 plus a small relief/specular/night set, which stays under 5 MB total if compressed carefully. Streamed tiles (EOX, OpenFreeMap) are free but need attribution; EOX imagery is CC BY-NC-SA, which is acceptable only because Wanderstacks is non-commercial and share-alike is satisfied only if you redistribute derivative imagery (avoid baking into your own bundle).

### Cited Findings
- NASA content is generally not copyrighted in the US; NASA should be acknowledged; must not imply endorsement of commercial goods/services — [NASA media guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)
- Blue Marble Next Generation: 12 months of true-colour imagery, published 2005; The Blue Marble (2002) 1 km resolution — [NASA Earth Observatory collection](https://science.nasa.gov/earth/earth-observatory/collections/blue-marble). Exact file sizes not available from the page.
- EOX Sentinel-2 cloudless 2024: CC BY-NC-SA 4.0; attribution "Sentinel-2 cloudless - https://s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2024)"; commercial use needs a paid EOX licence — [EOX 2024 post](https://eox.at/2025/03/sentinel-2-cloudless-2024/), [EOX licence](https://cloudless.eox.at/documentation/license)
- EOX non-commercial use is described as unrestricted with attribution visible wherever displayed; sub-licensing and selling raw imagery are prohibited — [EOX licence](https://cloudless.eox.at/documentation/license)
- OpenFreeMap: public instance free, no limits on views/requests, commercial use allowed, MIT-licensed code, attribution required ("OpenFreeMap © OpenMapTiles, Data from OpenStreetMap"), self-host possible, weekly planet downloads — [OpenFreeMap](https://openfreemap.org/)
- MapLibre GL JS v5 added globe projection with terrain and a merged atmosphere/sky, with option for realistic atmosphere on globe — [v5.0.0 release](https://newreleases.io/project/github/maplibre/maplibre-gl-js/release/v5.0.0), [globe example](https://maplibre.org/maplibre-gl-js/docs/examples/display-a-globe-with-an-atmosphere/)

### Inferences
- Rough budget (my estimate, not sourced): 8192x4096 day map as KTX2/UASTC or ETC1S ~2-6 MB; 4096x2048 ~0.5-1.5 MB. Plan 4k day + 4k night + 2k specular/cloud/relief mask ~3-4 MB, or use 2k for mobile and upgrade on demand.
- Stream EOX/OpenFreeMap tiles only when the camera dives below globe level; keeps first 5 MB budget.
- MapLibre is the fastest route to a good-looking high-zoom map, but it is a separate WebGL renderer from three.js; mixing requires a custom layer or two canvases.

### Gaps
- Natural Earth licence (believed public domain), Protomaps PMTiles (BSD-style code, ODbL data from OSM; static hosting via HTTP range requests, Cloudflare Pages 25 MiB per-file limit matters) and MapTiler free-tier terms: not fetched; unverified.
- NASA Black Marble (VIIRS) file sizes and exact usage page: not fetched.
- Cloudflare Pages per-file size limit and range-request behaviour: not verified in this session.

## 4. Realism techniques in three.js

### Takeaway
@takram/three-atmosphere gives physically based atmospheric scattering (MIT) but is Beta, depends on a WebGPU rewrite in progress, and its LUT cost on mobile is unmeasured. A cheaper custom fresnel/Rayleigh-style shell is the safe default for mobile.

### Cited Findings
- three-geospatial (MIT): @takram/three-atmosphere (Beta, precomputed atmospheric scattering), @takram/three-clouds (Beta, volumetric clouds), three-geospatial (Alpha), three-geospatial-effects (Alpha); WebGPU rewrite in progress: atmosphere and core done, clouds in progress, effects to merge into core. Install needs Git LFS, pnpm, Nx monorepo — [GitHub](https://github.com/takram-design-engineering/three-geospatial)

### Inferences
- Because Wanderstacks targets r186 WebGPU+WebGL2 fallback, the rewrite status matters: confirm the WebGL path still works before depending on it.
- Standard cheap stack for mobile (background knowledge, unverified): day/night mix by dot(normal, sunDir) with smoothstep terminator, night lights multiplied by (1-day), ocean specular from a land/ocean mask, one 2k cloud layer scrolling slightly faster, bump or normal from small relief map, fresnel atmosphere rim. All of this is a few texture reads per fragment, well within mobile budgets. Volumetric clouds and full LUT atmosphere are desktop-tier.
- Time-driven sun direction can reuse the time slider.

### Gaps
- No measured mobile frame times for any technique; vasturiano/three-globe was not fetched (it's a ready-made globe with polygons/points/arcs; licence believed MIT, unverified).
- Bruneton implementation specifics not researched.

## 5. Historical overlays and time slider

### Takeaway
Use historical-basemaps GeoJSON (GPL-3.0) for borders only if GPL is acceptable; otherwise skip borders and drive time purely from your own library data (open/close years). Pleiades (CC BY) gives ancient place coordinates; OHM gives CC0 vector tiles; Rumsey is CC BY-NC-SA, usable for non-commercial.

### Cited Findings
- aourednik/historical-basemaps: GPL-3.0; GeoJSON per year `world_[YEAR].geojson`, also `places.geojson`; covers ancient times to present; "work in progress", disputed borders, precision field BORDERPRECISION 1-3 — [GitHub](https://github.com/aourednik/historical-basemaps)
- OpenHistoricalMap: data CC0 (some features CC BY / CC BY-SA); suggested credit "Map data courtesy of the OpenHistoricalMap project, in the public domain unless otherwise noted."; no tile rate guidance on the copyright page; site uses vector tiles — [OHM copyright](https://openhistoricalmap.org/copyright)
- Pleiades: all content cc-by; bulk dumps and RDF available; Pleiades Datasets 4.0.1 released Feb 2025 — [NYU archive](https://archive.nyu.edu/handle/2451/74877), [search summary of dumps](https://ancientworldonline.blogspot.com/2018/09/open-data-from-pleiades.html)
- David Rumsey Map Collection: CC BY-NC-SA 3.0; "commercial use" means selling reproductions; 150,000+ maps — [search summaries](https://www.davidrumsey.com/about), [Wikipedia mirror](https://en.wikipedia.com/wiki/David_Rumsey_Map_Collection). Contact for commercial: rumseymapcenter@stanford.edu. IIIF availability not confirmed.

### Inferences
- GPL-3.0 on data: likely applies to the dataset and derivative data, not necessarily your code, but this is a legal grey area; safest is to load it as a separate runtime file with attribution, or avoid. Not legal advice.
- Time slider logic: store `{founded, destroyed|null}` per library (negative years for BCE); `visible = year >= founded && (destroyed==null || year < destroyed)`. Style pins by state: living (bright), destroyed-before-year (ghost), not yet founded (hidden). Optionally snap border layer to nearest available basemap year file (files exist per snapshot, not per year).
- Fetch only the one border file near the selected year; lazy load keeps entry payload minimal.
- Rumsey images are better linked/credited per room than baked into the globe.

### Gaps
- Chronas: not researched (licence and project status unknown; may be inactive).
- Old Maps Online licence/API: not researched.
- OHM vector tile endpoint URL, date-filter mechanism and usage policy: wiki unreachable (DNS failure); not confirmed.
- File sizes of historical-basemaps year files: not retrieved.

## 6. Cinematic fly-in

### Takeaway
No source was fetched on Earth Voyager or Cesium stories; recommended pattern is from general practice and unverified.

### Cited Findings
- 3DTilesRendererJS offers fade transitions between tile levels and an ellipsoid/globe example set — [GitHub](https://github.com/NASA-AMMOS/3DTilesRendererJS) (ellipsoid support itself not confirmed in the fetched text)

### Inferences
- Pattern: slerp camera position along the great circle toward the target at altitude, ease height with an arc (raise then drop, "fly-to" curve as in Cesium's flyTo/MapLibre flyTo using van Wijk-Nuij zoom-pan interpolation), rotate up-vector to local ENU frame at target, cross-fade globe into a high-zoom tile layer while the room assets stream.
- Mask loading behind the animation: start fetching the room's 25 MB budget during fly-in.
- MapLibre `flyTo` already implements the arc-curve interpolation if MapLibre is chosen.

### Gaps
- Google Earth Voyager / Cesium stories technique: not researched.

## Recommendation (inference from the above)
1. Base: custom three.js globe with self-hosted 4k KTX2 day/night/specular/cloud textures from NASA Blue Marble and Black Marble (public domain; acknowledge NASA), fresnel atmosphere, day/night terminator driven by the time slider. Target < 4 MB.
2. Close zoom (optional, lazy): free tile source with attribution, OpenFreeMap vector tiles via MapLibre or EOX Sentinel-2 raster (CC BY-NC-SA, non-commercial OK). Avoid Google 3D Tiles as default; if wanted, make it a click-to-load per-library "see it today" toggle with referrer restriction and hard daily quota, within the 1,000 free/month.
3. Time: JSON of libraries with founded/destroyed years; Pleiades coordinates for ancient sites; optional historical-basemaps borders (check GPL) lazy loaded per era.
4. Revisit takram three-atmosphere only after confirming the WebGL2 fallback path and mobile cost.
