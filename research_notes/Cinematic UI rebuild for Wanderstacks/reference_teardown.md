# Reference teardown: "cinematic / real-life" web sites (every-joule, figmaformotion, peers)

Method: raw HTML + JS bundle inspection via curl (every-joule, figmaformotion), Codrops/Awwwards case studies via fetch. Codrops blocks WebFetch/curl (Cloudflare challenge, HTTP 403); I read it through the TinyFish fetch tool. Awwwards 2025 pages returned 403. Not visited in a real browser: no screenshots, no network waterfall, no measured transfer sizes except where stated. Anything marked UNVERIFIED comes from search snippets or my own prior knowledge.

## Q1. iamtechartist.com/every-joule: real-time WebGL, video, or hybrid?

### Takeaway
Real-time three.js (not pre-rendered video, not image sequences), shipped as a Vite-built app iframed into a WordPress page. It is also NOT photoreal: it is a stylised "3D ink drawing" look (toon materials, outlines, glow, bloom). So it is a reference for polish and loading UX, not for photoreal textures.

### Cited Findings
- The WordPress page https://iamtechartist.com/every-joule/ is a thin shell (GeneratePress theme) that embeds `<iframe src="/Apps/every-joule/">`; the shell shows a "needs graphics acceleration ... Open anyway" fallback message. — [page HTML](https://iamtechartist.com/every-joule/) (curl)
- Product description: "an interactive physics book in ten lessons ... Each diagram lifts off the page as a 3D ink drawing and energy flows as glowing colour between the stores." — same page.
- The app at https://iamtechartist.com/Apps/every-joule/ is a Vite/Rollup build (hashed ES-module chunks `main-*.js`, `three-*.js`, `post-*.js`, plus per-lesson chunks like `spring`, `cutaway`, `stream`, `lathe`, `spill`, `bounce`). Chunks are modulepreloaded. — [app HTML](https://iamtechartist.com/Apps/every-joule/)
- Measured (curl, raw / gzip): `three-*.js` 688 KB / 177 KB; `post-*.js` (post-processing) 302 KB / 151 KB; `main-*.js` 161 KB / 59 KB. Core JS is therefore roughly 390 KB gzip before lesson chunks. — my curl of https://iamtechartist.com/Apps/every-joule/assets/
- String scan of the bundles shows: EffectComposer, RenderPass, ShaderPass, Bloom, SMAA, ACESFilmic and AgX tone mapping, PMREM, MeshToonMaterial, MeshPhysicalMaterial, MeshStandardMaterial, many ShaderMaterial, shadowMap, vignette. NOT found: GSAP, Lenis, ScrollTrigger, GLTFLoader, KTX2, RGBELoader, Theatre, Spline, Rive, Lottie, video file refs. (Strings in minified code, so "found" means present in bundle; three.js itself contains many of them, so only the post-*.js hits are strong evidence of what the app uses.) The page contains no .mp4/.glb/.ktx2 references; the only "webm/rive" hits were incidental substrings.
- Geometry appears to be procedural (chunk names `lathe`, `spring`, `cutaway`, `stream`), so there are no model downloads. Inference, not confirmed by reading the code.
- Branded inline-CSS loader with a progress bar (`--ta-p`), a `theme-color` of #0D0B12, a dark radial-gradient background, and an orange to magenta gradient accent. Loader CSS is inlined so first paint is already branded. — app HTML

### Inferences
- "Real" feel here comes from stylisation + bloom + SMAA + tone mapping + vignette on cheap procedural geometry, not from photo textures. Cheap (~400 KB gzip JS, zero media).
- The inline branded loader + modulepreload pattern is directly reusable for a 5 MB first-load budget.

### Gaps
- Did not run the app in a browser: no confirmation of actual frame rate, mobile DPR cap, or lazy-loaded lesson sizes. Audio (three.js AudioContext string is just three's own code) unverified.
- Not a "real-life" photoreal reference. If the user's perception of "real-life" refers to a different page on that site (e.g. /demos/), I did not check it.

## Q2. figmaformotion.com/v2/templates: what is it?

### Takeaway
A paid marketplace of Figma source files (not web code) for animated, scroll-driven website concepts, many of them 3D/product/fantasy themed. Only the previews are on the web; the product is design files + "prompts" for vibe-coding. Useful as an art-direction/storyboard reference; zero code to reuse.

### Cited Findings
- Page title "All Website Templates | Figma for Motion"; "50+ Premium website Templates ... premium animations"; listing includes Fedex - Advanced scroll, Why so curious? - Interactive 3D Mascot, Step into Wonder - Immersive Fantasy 3D, Secret - Japanese Torii gate, Frost - Snow Mountain, Medieval Armor, Luxury Timepiece, Hyper Car, Atmos SmartRing, etc. Each card links "View on Instagram". — [templates](https://figmaformotion.com/v2/templates), [home](https://figmaformotion.com/v2/)
- Offer: Premium $59.90 (was $89.90): prompts + templates + live builds + every Figma source file + all animations; Basic $9.90: selected static Figma files without animation. FAQ: "The templates are created for Figma ... No After Effects needed"; editable colors/type/timing; "Transform templates into real websites with a simple copy and paste" via "Prompts vibe-coders love". — same pages
- Tech of the site itself: Next.js (`/_next/static/chunks/...`, rolldown runtime), a custom desktop cursor, `visible-video` and `optimized-media` chunks, media served from `/api/media/<uuid>.webp|.mp4|.webm`. Card previews are lazy/visible-gated video and webp. No three.js/GSAP/Lenis/Rive/Lottie chunk names appear in the HTML references. — raw HTML of https://figmaformotion.com/v2/templates
- The previews themselves are video loops of Figma prototypes/animations (inference from mp4/webm assets).

### Inferences
- Relevant takeaways for Wanderstacks: the genre is "one hero 3D object/scene + big type + scroll chapters"; the lazy-play-when-visible video card pattern is the cheap way to show many scenes. Not a source of real-time 3D techniques.

### Gaps
- Did not open individual template pages or the Instagram sources; do not know which are real WebGL builds vs. Figma-animated mockups. Did not see the "v2" page visually.

## Q3. Peer sites (2024-2026) and how they get the cinematic read

### Takeaway
The cinematic read is mostly art direction + restraint on real-time 3D: baked/pre-rendered lighting, few hero assets, projected painted textures on simple geometry, post (bloom, grain, vignette, chromatic aberration, scanline/CRT), slow camera tied to scroll, and reactive sound. Pre-rendered video/image sequences are the cheap path to genuine photoreal; real-time path-traced look is not feasible, so it is baked.

### Cited Findings (each peer)
1. **Igloo Inc** (Bureaux + Abeto; Awwwards Site of the Year 2024 and Developer SOTY 2024). Real-time three.js, not video. Stack: three.js, three-mesh-bvh, Svelte, GSAP, Vite, vanilla JS; Houdini + Blender for assets; custom VDB-to-browser volume exporter (compressed), custom fluid simulation, interactive particles morphing between shapes with velocity-based colour, procedural ice-crystal growth, chromatic aberration + tech displacement + frost on transitions, WebGL-rendered UI text effects, sound design synced to particles. Perf: measured continuously on low-end devices, custom geometry exporters to cut load, background shader compilation and texture loading. — [Awwwards case study](https://www.awwwards.com/igloo-inc-case-study.html); [Awwwards annual 2024](https://www.awwwards.com/annual-awards-2024/site-of-the-year) (title-level via search). Asset MB: not published.
2. **Lusion** (lusion.co v3; FWA, Awwwards, CSSDA SOTY; also Oryzo AI coaster, 2026). Studio says it builds every project from scratch ("own system, own logic"). Oryzo is rendered live in three.js/WebGL with inertia and weight (per DesignRush search snippet, secondary). Porsche "Dream Machine" is a 3-week CG film, i.e. the studio mixes pre-rendered film with real-time. — [Codrops: Lusion](https://tympanus.net/codrops/2026/04/13/lusion-where-digital-craft-meets-ambitious-experimentation/); Oryzo claim: [DesignRush](https://www.designrush.com/best-designs/websites/oryzo-website-design) (UNVERIFIED depth). Stack internals/asset sizes: not found.
3. **The Spark** (The Digital Panda, Jan 2026). A "short film that runs in a browser": scroll drives camera, characters and sound. Engine is cables.gl + Webflow front-end, GSAP for UI. Depth via projection mapping (detailed painted imagery projected on simple shapes); art started as Midjourney, upscaled (Magnific, Topaz), then hand-corrected (text, graffiti). CRT/interlace post pass softens aliasing. One scene active at a time, next scene loads as you reach the end, short loaders between scenes for slow connections; scroll container in DOM is the single source of truth; each scene owns a slice of scroll. Sound: ambient beds by altitude, train pans, footsteps scale with scroll SPEED. No voiceover, text as UI. Author says they would add an up-front preload choice for fast connections. — [Codrops](https://tympanus.net/codrops/2026/01/09/the-spark-engineering-an-immersive-story-first-web-experience/)
4. **The Monolith** (13-scene WebGL epic, built early 2024, Codrops Nov 2025). React Three Fiber + three.js; deferred rendering via multi-count WebGLRenderTarget G-buffers; composable ShaderMaterial module system (wind, flow-map, UV-map modules); scene transitions by rendering scene A and B to textures and blending through a runtime-generated grayscale mask; pre-TSL. — [Codrops](https://tympanus.net/codrops/2025/11/29/building-the-monolith-composable-rendering-systems-for-a-13-scene-webgl-epic/)
5. **Trionn** (FWA / CSSDA recognised, 4-month build, Codrops Jul 2026). GSAP + @gsap/react (with `gsap.matchMedia()` for separate desktop/mobile logic), Three.js, Lenis driven from `gsap.ticker`, Web Audio API with SYNTHESISED sound (no audio files, except a lion growl and curtain). Glow by layered THREE.Line instead of a bloom pass; scroll-scrubbed `<img>` frame swap instead of canvas/video; SDF rounded corners in shader; fake depth parallax from a single plane + precomputed depth map; full-screen fragment-shader fog reacting to audio frequency; shader pre-compile and texture upload in idle time; Next.js. — [Codrops](https://tympanus.net/codrops/2026/07/15/the-architecture-behind-trionn-coordinating-gsap-three-js-lenis-and-web-audio/)
6. **Apple product pages (AirPods Pro etc.)**. Scroll-driven image sequence drawn to `<canvas>`, frame chosen from scroll progress, frames must be preloaded; typically 100-300 frames. — [GSAP forum thread](https://gsap.com/community/forums/topic/25188-airpods-image-sequence-animation-using-scrolltrigger/), [CSS-Tricks](https://css-tricks.com/?p=308477). Apple's current exact pipeline (video vs sequence) UNVERIFIED for 2025-26.
7. **Codrops "How to Build Cinematic 3D Scroll Experiences with GSAP"** (Nov 2025): GSAP + WebGL/three.js tutorial; contents not read (403). — [link](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/)
8. **Gaussian splats**: tooling is mature (PlayCanvas SuperSplat 3.0, Sept 2026, requires WebGPU; publishes flythroughs to a gallery; a 4.4M-splat scene used 105 MB JS heap idle vs 1,557 MB in v2). I found no awarded splat-driven storytelling site; none verified. — [CG Channel](https://www.cgchannel.com/2026/09/playcanvas-releases-supersplat-editor-3-0/), [PlayCanvas blog](https://blog.playcanvas.com/new-in-supersplat-webgpu-and-streaming-bring-huge-performance-wins)
9. **Awwwards 2025 SOTY**: a search snippet named "Women At Work" (Trione) and "Monads" (VALMAX); UNVERIFIED, annual page returned 403.
10. **Resn, Active Theory, Locomotive, 14islands**: no technical sources retrieved (14islands only a Codrops agency-profile title seen in search). UNVERIFIED; not describing them.

### Inferences (cheap vs expensive)
| Technique | Cost | Fit for static ~5 MB first load |
|---|---|---|
| Post stack: tone mapping (ACES/AgX), vignette, subtle grain, bloom, SMAA | cheap (~150 KB gz of three examples, fragments) | yes |
| Slow scroll-tied camera + easing (Lenis+GSAP) | cheap (~25 KB) | yes |
| Baked lighting (lightmaps/AO baked in textures), static shadow maps | cheap runtime, moderate asset size | yes, KTX2/WebP |
| Painted/projected textures on simple geometry (The Spark) | cheap runtime | yes, strong fit to a library/atlas |
| Fake depth from depth map on a plane (Trionn) | very cheap | yes, good for hero plates |
| Fog / dust / light shafts as one fullscreen shader | cheap | yes |
| Synthesised or small ambient audio, reactive to scroll speed | cheap | yes, lazy after first gesture |
| Pre-rendered path-traced footage (video or image sequence) | cheap to play, EXPENSIVE in MB (hundreds of KB to many MB per second at quality) | only as lazy-loaded chapters, not first load |
| Gaussian splats | large (tens of MB scenes), WebGPU/heavy GPU | no for 5 MB first load; optional lazy opt-in |
| Volumetrics / fluid sim / deferred G-buffer (Igloo, Monolith) | expensive dev + GPU | no |

- Typical mobile/slow-net pattern in sources: load one scene at a time with short interstitial loaders (The Spark), per-breakpoint animation logic (`gsap.matchMedia`, Trionn), idle-time shader precompile, perf tested on low-end devices (Igloo), optional preload choice. Pattern from every-joule: tiny branded inline loader + progress bar + "no GPU" fallback message.

### Gaps
- No actual MB figures for Igloo, Lusion, The Spark, Trionn (only code sizes for every-joule). Typical asset budgets across peers remain unquantified.
- No verified Resn/Active Theory/Locomotive/14islands/Apple-2025 teardown, and no verified splat-based site.
- Local skill `cinematic-scroll-video` (installed) covers the scroll-scrubbed video pipeline if that route is chosen; not researched here.

## Q4. Recommendation for Wanderstacks (static, ~5 MB first load)
- Chosen reading: your reference sites are mainly about art direction + post + motion + sound, not heavy tech.
- Go real-time three.js with: baked lighting and KTX2/WebP textures, ACES/AgX tone map, subtle grain + vignette + gentle bloom (or layered-line glow), SMAA, Lenis + GSAP slow camera, one-scene-at-a-time loading, branded inline loader, scroll-speed-reactive ambient audio started on first gesture, `matchMedia` mobile tier (lower DPR, fewer effects).
- Keep pre-rendered clips or splats as lazy, post-first-load chapters only.
