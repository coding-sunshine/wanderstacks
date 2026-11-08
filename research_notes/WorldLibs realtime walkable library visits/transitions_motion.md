---
type: research-note
domain: worldlibs
status: active
tags: [worldlibs, transitions-motion]
relatedTo: [reports/WorldLibs realtime walkable library visits.md]
---

# Globe-to-street-to-interior transitions, smoothness, and figmaformotion.com/v2

Research depth note: ~22 tool calls, mostly WebFetch summaries (a small model summarised each page, so quoted constants should be spot-checked against source before being relied on). Several sub-questions had no fetched primary source and are in Gaps.

## How Cesium / MapLibre / Google Earth / three-geospatial handle globe-to-ground flights (camera math, depth, LOD, atmosphere)

### Takeaway
Real engines fly a two-phase arc: pull up (zoom out) then dive, using van Wijk-style zoom/pan interpolation (MapLibre) or a height-vs-distance arc with pitch correction (Cesium). The reusable pieces for a three.js globe are: the van Wijk curve, a duration-from-distance rule, easing that is cubic-out when high and quintic-in-out when low, and 3D Tiles via 3DTilesRendererJS with Google's attribution/caching rules.

### Cited Findings
- MapLibre `flyTo` implements van Wijk and Nuij "Smooth and efficient zooming and panning": w0 = max(width,height) in px, w1 = w0 / scale-of-zoom, u1 = ground path length, rho clamped to `sqrt(wMax/u1*2)`, visible span `w(s) = cosh(r0)/cosh(r0 + rho*s)`, total path length S, per-frame `scale = 1/w(s)` with bearing/pitch interpolated separately; default `speed` 1.2, `screenSpeed` option, duration = `1000*S/V`; falls back to `easeTo` for near-zero distance or non-finite S. — [maplibre-gl-js camera.ts](https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/src/ui/camera.ts) (summarised by fetch tool); docs describe flyTo as "smooth, arc-like transitions that help users maintain orientation" — [MapLibre Map docs](https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/)
- Cesium `Camera.flyTo`: if duration omitted, "Cesium attempts to calculate an ideal duration based on the distance"; options include `maximumHeight`, `pitchAdjustHeight` ("if camera flies higher than that value, adjust pitch during the flight to look down, and keep Earth in viewport"), `flyOverLongitude`, `easingFunction`. — [Cesium Camera docs](https://cesium.com/learn/cesiumjs/ref-doc/Camera.html)
- Cesium source (CameraFlightPath.js): default duration approx `ceil(distance/1,000,000) + 2` s clamped to a 3 s ceiling as summarised (the fetch summary and a search snippet disagree: snippet says `+3.0`); arc altitude from frustum geometry scaled by 0.2; arc is a polynomial (power 8, factor 1e6) when maximumHeight is below computed altitude, else linear height interpolation; pitch pushed toward -90 deg at arc midpoint when above pitchAdjustHeight; default easing CUBIC_OUT when start height > 11,500 else QUINTIC_IN_OUT. — [CameraFlightPath.js](https://raw.githubusercontent.com/CesiumGS/cesium/main/packages/engine/Source/Scene/CameraFlightPath.js); contradicted on the +2/+3 constant by [search snippet](https://github.com/AnalyticalGraphicsInc/cesium/pull/2825)
- three.js depth precision: `logarithmicDepthBuffer` and `reversedDepthBuffer` are mutually exclusive; reversed depth is an init-time renderer option (toggling needs a new renderer); forum notes the spelling may appear as `reverseDepthBuffer` in places. Official example URL I tried returned 404. — [three.js forum](https://discourse.threejs.org/t/can-three-js-dynamically-set-reverseddepthbuffer-what-is-the-proper-way-to-do-it/90217)
- three-geospatial (Takram) provides `@takram/three-atmosphere` (precomputed atmospheric scattering, beta), `@takram/three-clouds` (volumetric clouds, temporal upscaling), core/effects packages; designed to pair with 3d-tiles-renderer, R3F. — [npm three-clouds](https://www.npmjs.com/package/@takram/three-clouds), [three-geospatial search summary](https://docsearch.algolia.com/mcp/docs/repo/takram-design-engineering/three-geospatial)
- 3DTilesRendererJS (NASA-AMMOS): three.js/Babylon/r3f renderer for 3D Tiles; supports Cesium Ion, Google Photorealistic Tiles, PLATEAU; plugin system; Apache-2.0. — [GitHub](https://github.com/NASA-AMMOS/3DTilesRendererJS)
- Google Photorealistic 3D Tiles policy: must show `asset.copyright` attribution; pre-fetching/indexing/caching prohibited except as agreement allows; no offline use; no non-visualization use (image analysis, object detection); you may overlay your own 3D objects if not derived from the tiles. — [Google policies](https://developers.google.com/maps/documentation/tile/policies). Billing/free tier not verified.
- Google Earth on web is the same C++ compiled to WebAssembly, constantly streaming, decompressing and preparing data; multithreaded via SharedArrayBuffer; at time of article did not run in Safari. — [web.dev case study](https://web.dev/case-studies/earth-webassembly)

### Inferences
- For a custom shader globe + one real library: do not need Cesium. Use own van Wijk interpolation over (lon/lat, log-altitude) with easing; optionally mount Google/OSM 3D Tiles via 3DTilesRendererJS only for the last few km if licence/cost OK.
- Interpolate altitude in log space (equivalent to van Wijk zoom span), so apparent speed on screen is constant; duration ~ proportional to S, capped (3-8 s typical for flight; this is a design choice, not sourced).
- Near/far: dynamically set `near` as a fraction of altitude (e.g. 1e-3 x altitude) and prefer reversed-Z over log-depth (log-depth disables early-z and breaks some custom shaders, inference); reversed-Z must be decided at renderer creation, so a single shared renderer for globe + building is required.
- Google 3D Tiles caching/attribution rules conflict with "free tier static site, preloaded"; a free alternative is a baked stylised city patch or OSM-derived extrusions (not researched).

### Gaps
- Exact atmosphere fade-out altitude thresholds in Cesium/Google Earth: not found.
- LOD swap timing/skirt/fade specifics for 3DTilesRendererJS (TilesFadePlugin etc.): plugin names not confirmed from fetched text.
- van Wijk & Nuij 2003 paper itself not fetched; formulas only via MapLibre code summary.
- Mapbox GL globe, deck.gl, NASA Eyes not researched.

## Streaming during the flight (Spark, SOG/SPZ, how long a flight can hide a load)

### Takeaway
Spark 2.0 streams LoD-tree splats under a fixed splat budget with background-worker traversal, so a destination splat can start loading at flight start and refine progressively on arrival. SOG is the smallest web format (15-20x vs PLY).

### Cited Findings
- Spark: MIT, World Labs, three.js renderer (needs three >= 0.179); Spark 2.0 adds streamable LoD; `.RAD` format stores precomputed LoD trees fetched with HTTP Range requests; reads PLY, SPZ, SPLAT, KSPLAT, SOG. — [search results incl. sparkjs.dev](https://sparkjs.dev/docs/new-spark-renderer/), [Product Hunt Spark 2.0](https://www.producthunt.com/p/marble-by-world-labs/spark-2-0-2)
- Spark LoD: octree-based, default LoD base 1.5 for smoother level transitions, priority queue of frontier nodes by screen-space size, traversal in WebWorkers, one budget across multiple SplatMesh instances, tunable via `lodSplatCount`/`lodSplatScale`, foveation params `outsideFoveate`/`behindFoveate`. — [Spark LoD docs](https://sparkjs.dev/docs/new-spark-renderer/)
- SOG: 15-20x smaller than PLY (lossy, WebP textures + codebook quantisation); SPZ ~10x; convert PLY to SOG with SplatTransform for delivery. — [PlayCanvas formats](https://developer.playcanvas.com/user-manual/gaussian-splatting/formats/)

### Inferences
- A 4-8 s flight can hide the first, coarse LoD chunk of the room splat (start fetch at click or on pin hover, use Range requests for the .RAD root). Hide the rest behind the "arrival at facade" dwell and door walk.
- Keep the building exterior (low-poly proxy mesh or small splat) as a separate cheap asset so the interior load is not on the critical path until the door approach.
- Cloudflare Pages free tier: individual file limit 25 MiB (from general knowledge, not fetched this session; verify), so large splats need R2 or chunked .RAD.

### Gaps
- Real-world .RAD/SOG sizes for room-scale scenes and mobile splat budgets: not found.
- Spark API for preloading/priming without rendering: not found.
- 3D Tiles priority/preload tuning: not found.

## Crossfade / portal techniques to avoid a cut

### Takeaway
Proven pattern: render each representation to its own render target and composite them in a final shader pass, driven by a single timeline; matched-camera handoff means both renderers use identical camera pose during the overlap.

### Cited Findings
- Aircord (Awwwards case study) achieves 2D-3D-2D seamless transitions with five stacked RenderTargets, each with its own camera, each layer's output used as a texture in the next; tweakpane + stats.js used for tuning; mobile JS cut ~1 MB by loading three.js modules selectively. — [Awwwards Aircord case study](https://www.awwwards.com/aircord-case-study.html)
- View Transitions API: same-document in Chrome/Edge 111+, Safari 18+, Firefox 144+; cross-document Chrome/Edge 126+, Safari 18.2+, no Firefox; opt-in CSS `@view-transition { navigation: auto; }`. No canvas/WebGL guidance in the page. — [Chrome docs](https://developer.chrome.com/docs/web-platform/view-transitions)
- Awwwards inspiration pages exist for globe/zoom/portal transitions (SkyFi interactive globe you can dive into; ERA custom WebGL map), but I did not read breakdowns. — [search results](https://www.awwwards.com/inspiration/clear-street-3d-globe-clear-street)

### Inferences
- Keep ONE WebGL context and one canvas across "routes" (SPA with state machine globe -> exterior -> interior). Use View Transitions only for DOM overlays (pin card -> info panel, captions), wrapped in `document.startViewTransition` with feature detection; the canvas should not be in a transition snapshot.
- Door "step through": ease camera to door at matched eye height, in last ~0.5 s fade exterior to interior via render-target dissolve masked by a doorway-shaped (or radial) alpha, with interior camera pre-positioned at same world pose; mask hides depth mismatch between mesh proxy and splat.
- Depth-aware blend between mesh and splat: Spark splats render in the same three.js scene and depth-sort with meshes, so exterior proxy mesh + interior splat can coexist in one scene and fade by material opacity rather than RT compositing (inference; verify depth write behaviour of splats).

### Gaps
- No verified breakdown of a globe->street Awwwards/FWA site.
- No tested Spark + mesh depth occlusion details.

## Motion craft (easing, duration, anticipation, blur, shake, reduced motion, sound)

### Takeaway
Source-backed: Cesium uses cubic-out when high and quintic-in-out when low, i.e. fast decisive start, long gentle landing. The rest below is design practice without a fetched primary source.

### Cited Findings
- Easing precedent: Cesium CUBIC_OUT above 11,500 m, QUINTIC_IN_OUT below. — [CameraFlightPath.js](https://raw.githubusercontent.com/CesiumGS/cesium/main/packages/engine/Source/Scene/CameraFlightPath.js)
- Cesium's pitch-adjust-during-flight (look down at apex, keep Earth in view) is a built-in anticipation/orientation device. — [Cesium Camera docs](https://cesium.com/learn/cesiumjs/ref-doc/Camera.html)

### Inferences (unsourced design guidance)
- Phases: ascend slightly (anticipation, 0.4 s) -> cruise (cubic-out) -> descend (quint-in-out) -> hover at facade (0.6 s settle) -> walk-in at constant slow speed (linear-ish, 1.2-1.5 m/s) -> doorway dissolve.
- Never add procedural camera shake during descent; use a tiny FOV change (e.g. +4 deg at peak speed) and radial/directional blur of the final composite only if it stays under frame budget.
- Reduced motion: `prefers-reduced-motion: reduce` -> replace flight with a 300-500 ms crossfade between keyframe poses (no travel), keep captions.
- Sound: low wind bed rising with altitude then fading to street ambience, door/room-tone swap at threshold; start only after user gesture.

### Gaps
- No sourced numbers for durations, blur, or sound; no Awwwards/FWA breakdown read.

## figmaformotion.com/v2

### Takeaway
It is a paid Figma-template store (Daniel Snows, senior UI/UX designer) selling editable animated Figma files plus 11 copy-paste AI prompts that turn the Figma designs into sites using an AI coding tool; it is not a motion library or code. Value for WorldLibs is low: motion inspiration, not three.js globe/flythrough technique.

### Cited Findings
- What: "premium, editable Figma animation templates for web design", created by Daniel Snows; 50+ templates (Fedex scroll animations, 3D mascot, Step into Wonder, 3D Crystal Lotus, Neon Automotive, etc.). — [figmaformotion.com/v2](https://figmaformotion.com/v2)
- Free: browsing templates/previews and Instagram links only; no free templates or public sample prompt. — [v2 page](https://figmaformotion.com/v2), [home](https://figmaformotion.com)
- Paid: Basic $9.90 (was $29.90, static Figma files); Premium listed $59.90 (was $89.90) on /v2, but the homepage showed Premium $44.95 (was $89.90) in a "Black November" sale, so prices vary by page/date. One-time payment, all sales final. Premium: 50+ templates, full animations, 11 AI prompts, monthly additions (2-3 files), live build access. — [v2 page](https://figmaformotion.com/v2); conflicting price at [home](https://figmaformotion.com)
- Licence: free to adapt into commercial client deliverables; strictly forbidden to resell, share or redistribute template files or source components. — [home](https://figmaformotion.com)
- Prompts are for "an AI coding tool like Claude or Codex" to generate sites from the Figma templates; prompt text not public, target stack (GSAP/React etc.) not stated. — [home](https://figmaformotion.com)

### Inferences
- Output is Figma prototypes/animations plus prompts, so it would be usable in a vanilla TS/three.js site only as design reference or via AI code generation of DOM/CSS/GSAP layers, not for 3D camera work.
- Techniques worth borrowing from this genre (judged from template names, not inspected files): (1) scroll/time-driven staged reveals for the DOM overlay, (2) smart-animate style shared-element morph for pin -> card -> title, (3) staggered text/UI entrances synchronised to camera phases, (4) 3D hero object interactions with eased pointer-follow, (5) restrained neon/glow accent transitions on arrival. All reproducible free with CSS/WAAPI/View Transitions.
- Recommendation: do not buy; if the user wants it, Basic ($9.90) at most, for visual reference. Premium adds prompts that are generic and unproven for this stack.

### Gaps
- Did not open /templates or any template file; no sample prompt visible; v1 vs v2 difference not stated; real licence text on /terms not read.
- Technique list above is speculation from names, flagged as inference.

## Performance budget for mid-range mobile

### Takeaway
Stutter during transitions usually comes from first-use GPU uploads and shader compiles, not steady-state cost; pre-render/initialise everything behind the flight and avoid GC allocations in the frame loop.

### Cited Findings
- `renderer.compileAsync()` only compiles shaders; textures/geometry upload on first `render`; fix by a pre-render pass with frustumCulled=false/visible=true, or `renderer.initTexture()` / `initRenderTarget()`; a 4096x4096 PNG of 1 MB is ~88 MB in VRAM so use compressed (KTX) textures. — [three.js forum](https://discourse.threejs.org/t/reduce-first-render-lag-renderer-compileasync-is-not-doing-anything/86191)
- With `KHR_parallel_shader_compile`, compile is off the main thread and pollable; without it every program reports ready immediately; a material compiled for the screen that later draws into a composer target recompiles on first frame, eating the gain. — [three.js issue/PR threads via search](https://github.com/mrdoob/three.js/pull/16662), [thread summary](https://discourse.threejs.org/t/why-a-heavy-three-js-scene-tanks-pagespeed-and-it-is-not-your-javascript/94734)
- Spark LoD traversal runs in WebWorkers, with a fixed splat budget to cap cost. — [Spark LoD docs](https://sparkjs.dev/docs/new-spark-renderer/)
- Aircord used stats.js to watch frame rate and trimmed mobile JS. — [Awwwards](https://www.awwwards.com/aircord-case-study.html)

### Inferences
- Targets (unsourced, standard practice): 16.6 ms frame at 60 Hz (aim for 8-10 ms GPU headroom on mobile), keep tasks under 50 ms, cap DPR at ~1.5-2 during transitions, drop `lodSplatCount` during flight and raise on arrival.
- Warm-up checklist: create all render targets and the dissolve material at the same format they will be used in, compileAsync for both scenes, initTexture on KTX2 textures, one hidden render per scene during the globe phase; preallocate vectors/quaternions in the camera path code to avoid GC spikes; do DOM changes in the same rAF, no layout reads in the loop.
- Fail-safe: if a frame-time monitor sees >24 ms average during flight, shorten/skip the flight (jump to arrival pose with crossfade).

### Gaps
- No measured numbers on mid-range Android for Spark or tiles; KTX2/Basis transcode timing not found; web.dev long-task page not fetched.
