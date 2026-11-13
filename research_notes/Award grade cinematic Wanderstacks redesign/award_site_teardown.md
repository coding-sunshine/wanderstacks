# Award-grade cinematic WebGL sites: teardown for Wanderstacks redesign

Coverage note: ~17 tool calls. Several primary sources (Codrops Lusion 2026, Codrops Bruno 2026, Codrops Trionn, Medium Bruno case study) returned HTTP 403, so those are only known via search snippets. I could NOT inspect live sites (no network DevTools), so no measured JS/asset weights, loaders or camera easing numbers except where an author published them. Items marked UNVERIFIED are not sourced.

## 1. Exemplar teardown (URL, studio, year, award, stack, opening, nav, sound, scroll->camera, transitions)

### Takeaway
Stack is converging: three.js (raw or R3F) + GSAP (+ScrollTrigger) + Lenis, custom shaders, Blender/Houdini-authored assets, with WebGPU/TSL appearing in 2025-26 (Bruno Simon, Utsubo's IVRESS). The "film" read comes from authored assets and choreography more than from library choice. Opening-10-seconds, nav chrome and easing details are largely NOT documented in sources I could reach.

### Cited Findings
- **Igloo Inc** (igloo.inc), built by Abeto with Bureaux per search summary; Awwwards Site of the Year 2024 and Developer Site of the Year 2024. Stack: Three.js, three-mesh-bvh, Svelte, GSAP, Vite, vanilla JS; Houdini + Blender for 3D, Figma/Photoshop/Affinity for UI, DaVinci Resolve for audio. — [Awwwards case study](https://www.awwwards.com/igloo-inc-case-study.html); [Awwwards SOTY 2024](https://www.awwwards.com/annual-awards-2024/site-of-the-year)
- Igloo craft details: procedural algorithm mimicking ice-crystal growth to generate unique ice-block models; chromatic aberration in scene transitions and materials; frost effects in transitions; UI built in WebGL (SDF-texture text with glitch/scramble via SDF offset); custom VDB-to-browser volume exporter with compression; interactive particle sim forming volumetric shapes per link, colour by velocity, audio-synchronised; background shader compilation; continuous perf testing on low-end devices; "seamless intro animation flowing into main experience", three-section scroll navigation. — [Awwwards case study](https://www.awwwards.com/igloo-inc-case-study.html)
- Judge quote on Igloo: "combines an immersive 3d experience with an easy to navigate, scroll interaction." — [Awwwards SOTY 2024 (via search summary)](https://www.awwwards.com/annual-awards-2024/site-of-the-year)
- Igloo dev quotes: "Iterating directly in the browser makes it easier to explore options and prototype effects"; "Implementing UI in WebGL can unlock a range of high-performance effects." — [Awwwards case study](https://www.awwwards.com/igloo-inc-case-study.html)
- Igloo three.js forum thread has no technical breakdown; a commenter said the particles "remind me one project of Lusion". — [three.js forum](https://discourse.threejs.org/t/landing-site-igloo-inc/67249)
- **Bruno Simon folio 2025** (bruno-simon.com), solo, 1+ year build; Awwwards Site of the Month (search snippets conflict: January 2026 vs. an Awwwards URL slug "...site-of-the-month-november"; month unresolved). Stack: Three.js with WebGPU auto-use + TSL shaders (wrote shaders in JS), Blender (+Python scripting) world, GarageBand music, MIT-licensed repo. A search snippet (not verified on primary page) says React 19 + R3F 9 + three 0.182 + GSAP 3.14 + Vite 7 — treat as UNVERIFIED, may be from a mirror of a different project. — [Awwwards case study](https://www.awwwards.com/brunos-portfolio-case-study.html); [Awwwards site page](https://www.awwwards.com/sites/brunos-portfolio)
- Bruno specifics: ~78,400 single-triangle grass blades; SDF-textured leaves; day/night, seasons, wind, rain, snow, lightning; instancing, frustum culling, looping geometry (grass/water/terrain/rain follow camera), hidden-face removal, geometry merging, palette-based colouring, ETC1S + UASTC textures, Draco quantization; mobile preset disables blur/DOF and reduces shadow resolution; three CC0 commissioned music tracks plus spatialised 3D SFX (springs, hydraulics, engine, ambience, anvil, campfire); gamepad + touch; showcase projects as 3D objects not HTML; multiplayer "whispers" (30 concurrent, OpenAI moderation). — [Awwwards case study](https://www.awwwards.com/brunos-portfolio-case-study.html)
- Bruno 2025 forum thread (a different "open world space experience as a portfolio", Awwwards July 2025): creator admits slow initial load attributed to Draco decoding. — [three.js forum](https://discourse.threejs.org/t/an-open-world-space-experience-as-a-portfolio/74951.md)
- **Immersive Garden website** (immersive-g.com): Awwwards case study. Stack: three.js, Vue/Nuxt, GSAP, Lenis, Strapi CMS, Vercel; assets in Blender, Houdini, ZBrush; server-side KTX compression, channel packing, automated gltf-transform + Blender-script export pipeline; bas-relief 3D, Roman numerals in 3D as nav anchors; quote: "the real challenge lay in achieving a high level of realism while minimizing GPU load and memory usage." — [Awwwards case study](https://www.awwwards.com/case-study-immersive-gardens-new-website.html)
- **Cartier Watches & Wonders** (cartier.com/watchesandwonders), Immersive Garden, Awwwards SOTD + CSS Design Awards (year 2026 per source): digital twin of the pavilion, six self-contained 3D alcoves, scroll-driven room transitions, Web Audio narrative layer, hidden gesture interactions; stack three.js, GLSL, GSAP, Lenis, Web Audio. This is the closest analogue to Wanderstacks rooms. — [Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)
- **Oryzo** (oryzo.ai), Lusion, Awwwards SOTM April 2026 + Developer award: one hero object live in three.js with inertia, easing that mimics physics, scroll moving camera through true Z depth. — [Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)
- **IVRESS** (brand.ivress.co.jp), Utsubo, FWA SOTM May 2026: WebGPURenderer with WebGL fallback, TSL; "unfolds like a short film with no narrator: you arrive, the world notices, something happens". — [Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)
- **Hubtown** (hubtown.co.in), Unseen Studio, Awwwards SOTD June 2026: glowing monolith over dark reflective landscape, mouse-reveal, three.js+GSAP. **Explore Primland** (explore.ownprimland.com), SOTD Feb 2026: aerial flythrough, atmospheric fog, scroll-driven camera over terrain. **Sleep Well Creative**, SOTD Jan 2026: hand-drawn art blended on a three.js stage. **Shopify Editions Spring 2026**: scroll-sequenced, particle-dispersing type, depth-layered panels. — [Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)
- Unseen Studio scroll->camera: a forum question on how it is implemented (GSAP ScrollTrigger vs manual scrollY interpolation) is unanswered. — [three.js forum](https://discourse.threejs.org/t/how-is-the-scrolling-animation-implemented-on-the-unseen-studio-website/87789.md)
- **Lusion (own site, older)**: Awwwards SOTM May (year not stated in fetched text; stack three.js/TweenLite/webpack, so pre-2020, outside 2023-26 window). Techniques still instructive: cloth sim pre-baked in Houdini, vertex animation encoded in PNG textures (4,096 vertices desktop, 1,024 mobile; 983 KB desktop / 246 KB mobile), Redshift offline renders to 150 KB video with frame counter encoded in pixels, analytic volumetric lighting, cursor point light. Tagline: "We build epic, real-time, interactive experiences to blow people's minds". — [Awwwards case study](https://awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html)
- Lusion Labs: Awwwards SOTD 1 June 2023. — [Awwwards via search](https://www.awwwards.com/sites/lusion-labs)

### Inferences
- Pattern: the "premium" read is mostly pre-authored (Houdini/Blender bakes, vertex-animation textures, offline renders) with runtime kept cheap; matches Wanderstacks needs (baked room lighting).
- Cartier W&W (rooms/alcoves, Web Audio, scroll between rooms) and Igloo (WebGL UI, chromatic aberration transitions) are the most transferable references.

### Gaps
- Not verified/sourced: Active Theory, Resn, 14islands, Locomotive, Dogstudio, Abeto "Messenger" (only known to be three.js + three-mesh-bvh from search snippet; its 2025 SOTY status NOT confirmed, search suggested it was not), iamtechartist/every-joule (search returned nothing). Opening-10-second sequences, loader design, nav chrome per site: not documented in any fetched source.

## 2. Rendering tricks behind the cinematic read

### Takeaway
Documented tricks: chromatic aberration at transitions, frost/glitch transition shaders, fog for aerial flythroughs, volumetric light, baked/offline-rendered lighting, SDF text, particle fields, WebGPU/TSL. Specific numbers for bloom/grain/DOF/LUT/FOV are not in sources I reached.

### Cited Findings
- Chromatic aberration used in Igloo scene transitions and materials; frost effect in transitions. — [Awwwards](https://www.awwwards.com/igloo-inc-case-study.html)
- Offline Redshift renders as video with reprojected camera matrix to extract lighting; analytic volumetric lighting; matcap + baked AO/thickness for translucency. — [Awwwards Lusion](https://awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html)
- Atmospheric fog and aerial flythrough (Primland). — [Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)
- Bruno: blur/DOF exists on desktop and is turned off in mobile preset. — [Awwwards](https://www.awwwards.com/brunos-portfolio-case-study.html)
- Generic claim (non-primary, treat cautiously): award sites commonly use three EffectComposer with custom post passes. — [search summary](https://www.skillsdirectory.com/skills/tsogjavklann-awwwards-3d)

### Inferences
- Reasonable default stack for Wanderstacks (my judgment, not sourced): tone mapping + subtle bloom, vignette, light grain, gentle DOF only on desktop, baked lightmaps, dust-mote particles/god rays, fog.

### Gaps
- No sourced figures for grain intensity, bloom threshold, FOV/lens, letterbox ratio, camera shake amplitude. Need live-site inspection (Spector.js / DevTools) or Codrops tutorials.

## 3. Camera choreography tooling and easing

### Takeaway
Two dominant authoring routes: Theatre.js sheet scrubbed by scroll (Codrops tutorial, R3F) and GSAP ScrollTrigger timelines; Blender-authored camera paths exported to three.js are emerging (Codrops July 2026). Easing specifics not found.

### Cited Findings
- Codrops tutorial: camera fly-through on scroll with Theatre.js + R3F, using useCurrentSheet/useScroll/useFrame to set sheet position from scroll. — [Codrops 2023-02-14](https://tympanus.net/codrops/2023/02/14/animate-a-camera-fly-through-on-scroll-using-theatre-js-and-react-three-fiber/)
- Codrops 2026-07-07 "Building a Scroll-Driven 3D Gallery Using a Blender Camera Path with Three.js and GSAP" exists (content not retrievable, 403). — [Codrops](https://tympanus.net/codrops/2026/07/07/building-a-scroll-driven-3d-gallery-using-a-blender-camera-path-with-three-js-and-gsap/)
- Codrops "How to Build Cinematic 3D Scroll Experiences with GSAP" exists (not read). — [Codrops](https://tympanus.net/codrops/?p=103299)
- Oryzo: easing "mimics physics" with inertia. — [Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)
- Igloo uses GSAP + Svelte; Immersive Garden GSAP + Lenis. — sources above.

### Inferences
- For a walkable site, scroll->camera applies to the arrival/intro and catalogue only; in-room is free-look.

### Gaps
- Actual easing curves (e.g. expo/power4) per site: not found. Theatre.js use by specific studios: not confirmed.

## 4. Performance budgets

### Takeaway
Few published numbers. Documented tactics: KTX2/ETC1S/UASTC, Draco (with load-time cost), gltf-transform pipelines, channel packing, instancing, mobile presets, background shader compilation.

### Cited Findings
- Lusion vertex-animation: 983 KB desktop vs 246 KB mobile; video 150 KB. — [Awwwards Lusion](https://awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html)
- Immersive Garden: server-side KTX, channel packing, gltf-transform automation. — [Awwwards](https://www.awwwards.com/case-study-immersive-gardens-new-website.html)
- Bruno: ETC1S/UASTC, Draco quantization, mobile preset (no blur/DOF, smaller shadows). — [Awwwards](https://www.awwwards.com/brunos-portfolio-case-study.html)
- Draco decode can slow initial load on weak devices. — [three.js forum](https://discourse.threejs.org/t/an-open-world-space-experience-as-a-portfolio/74951.md)
- Igloo: testing on low-end devices, background shader compilation. — [Awwwards](https://www.awwwards.com/igloo-inc-case-study.html)
- Production timelines/cost (agency estimates, Utsubo marketing): 8-14 weeks standard, 5-9 months flagship worlds; $100K-$200K+ for full 3D worlds. — [Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)

### Gaps
- No measured JS size, total transfer, TTFF, DPR caps for any exemplar. Needs live measurement.

## 5. Case studies / talks

### Takeaway
Best primary material: Awwwards case studies (Igloo, Bruno, Immersive Garden, Lusion), Codrops (Lusion 2026-04-13 interview, Bruno 2026-06-11 "Sketching the impossible" is a different project per title, Trionn architecture article on coordinating GSAP/Three/Lenis/Web Audio).

### Cited Findings
- Codrops: [Lusion: Where Digital Craft Meets Ambitious Experimentation (2026-04-13)](https://tympanus.net/codrops/2026/04/13/lusion-where-digital-craft-meets-ambitious-experimentation/); [The Architecture Behind Trionn: Coordinating GSAP, Three.js, Lenis, and Web Audio](https://tympanus.net/codrops/?p=117096); [Sketching the Impossible: a 3D portfolio built without a single 3D model (2026-06-11)](https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/); [Stas Bondar '25 (2025-03-25)](https://tympanus.net/codrops/2025/03/25/stas-bondar-25-the-code-techniques-behind-a-next-level-portfolio/). All titles only; content not read (403).

### Gaps
- Conference talks (Awwwards conf, Frontend Nation) not found. Active Theory Medium posts (Neve) exist but are 2016-era.

## 6. Failure modes

### Takeaway
Community and accessibility critics flag scrolljacking, motion sensitivity, screen-reader inaccessibility and heavy loads on otherwise award-winning sites.

### Cited Findings
- Award sites score high on animation but low on accessibility: Lacoste Polo Factory 9.20 animation vs 6.00 accessibility; Spotify Wrapped Party accessibility 7.00. Garden Eight: motion "not treated as decoration, and the first priority is not to interfere with user actions or the flow of content." — [ZURB Radar](https://radar.zurb.com/article/your-award-winning-site-might-be-locking-people-out)
- Scrolljacking breaks touch, keyboard, reduced-motion, trackpad acceleration. — [Web Designer Depot](https://webdesignerdepot.com/how-scrolljacking-breaks-ux-fundamentals/); [A List Apart on motion sensitivity](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity)
- Slow first load from Draco decode. — [three.js forum](https://discourse.threejs.org/t/an-open-world-space-experience-as-a-portfolio/74951.md)

### Inferences
- For Wanderstacks: honour prefers-reduced-motion (cut shake/parallax), keep native scroll or provide skip, add text/DOM fallback for books (already a stated goal), cap loader.

### Gaps
- No quantified loader-length complaints; no Awwwards-specific a11y score data beyond the two examples.
