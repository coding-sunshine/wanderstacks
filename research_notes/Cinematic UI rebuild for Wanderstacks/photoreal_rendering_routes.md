# Photoreal browser rendering routes for historic library interiors (as of 2026-11-10)

Method note: ~17 searches/fetches. Many sources are secondary blogs/aggregators; primary ToS pages were NOT fetched directly (flagged below). Legal summaries are not legal advice.

## Route 1: Pre-rendered plates as scroll-scrubbed video or image sequences

### Takeaway
All-intra (every frame a keyframe) is the established fix for choppy `video.currentTime` scrubbing, but it costs roughly 4-8x the bytes of a normal encode; at ~1280px/30fps one practitioner measured 8 MB (H.264) / 13 MB (VP9) per clip versus 1-2 MB normal. For a 5 MB first-load budget this means short clips, small resolution, or lazy-loaded chunks. Apple-style sites use image sequences (e.g. 312 frames for AirPods Pro) drawn to canvas.

### Cited Findings
- Stutter that updates ~once a second is a file problem; fix is all-intra `-g 1`, `-movflags faststart`, `-an`. — [hontran.dev](https://www.hontran.dev/blog/scroll-scrubbed-video-stutters-fix)
- Exact commands: H.264 `-vf scale=1280:-2 -r 30 -movflags faststart -vcodec libx264 -crf 23 -g 1 -pix_fmt yuv420p -an`; VP9 `-c:v libvpx-vp9 -crf 32 -b:v 0 -g 1 -row-mt 1`. — [hontran.dev](https://www.hontran.dev/blog/scroll-scrubbed-video-stutters-fix)
- Size comparison (~1280px, 30fps, same article): normal 1-2 MB vs all-intra 8 MB MP4 / 13 MB WebM. Rule: never encode all-intra larger than the element's largest rendered size. Ship WebM first with MP4 fallback because Safari VP9 is unreliable (author's claim). — [hontran.dev](https://www.hontran.dev/blog/scroll-scrubbed-video-stutters-fix)
- Other write-up: 1080p all-intra clips can exceed 100 MB; fewer keyframes force players to reconstruct delta frames when seeking. — search summary of [hontran.dev](https://www.hontran.dev/blog/scroll-scrubbed-video-stutters-fix) and [engineered.at](https://engineered.at/articles/scrubbing-videos-using-javascript) (second figure unverified, article body not fetched)
- Apple AirPods Pro page: 312-image sequence animated on scroll via canvas, desktop and mobile; 200 frames at 2000px width can be 400 MB+ uncompressed (so format/compression matters). — [GSAP forum thread](https://gsap.com/community/forums/topic/25188-airpods-image-sequence-animation-using-scrolltrigger/) (Apple's actual per-frame format/size not documented in sources found)
- HTMLVideoElement is not frame-accurate; WebCodecs gives frame-accurate decode to canvas, with an existing scroll-sync lib. — [diffusionstudio/webcodecs-scroll-sync](https://awesome.ecosyste.ms/projects/github.com%2Fdiffusionstudio%2Fwebcodecs-scroll-sync), [Chrome WebCodecs](https://developer.chrome.com/articles/webcodecs)
- Local skill `cinematic-scroll-video` already encodes the "~8s macro journey" pattern for this genre (installed skill, not a web source).

### Inferences
- Budget math: a 1280px 8 s clip at 30fps (240 frames) all-intra is ~8-13 MB, over the 5 MB first-load target but under Cloudflare's 25 MiB per-file cap; so lazy-load after first paint, or use ~960px, 24fps, higher CRF, or a WebP/AVIF sequence in a few chunks.
- Short-GOP (e.g. `-g 4` to 8) with a decoded-frame cache is a plausible middle ground; no sourced numbers found for it.
- Pre-rendered Cycles/Unreal output is the only route where path-traced lighting, glossy leather, gilding and window god-rays are "free"; cost is interactivity (camera path fixed).

### Gaps
- No verified AV1 or HEVC scrubbing benchmarks (Safari AV1 hardware decode only on newer iPhones; not verified). No sourced AVIF-sequence per-frame sizes. No primary write-up from Lusion/Active Theory on their scrub encodes. No Blender/Unreal render-time costs found.

## Route 2: AI-generated footage/stills for establishing shots

### Takeaway
Quality is high but architecture drifts (windows shift, impossible stairs), so it is risky for "real building" accuracy; licence terms for commercial use are generally available only on paid tiers, with visible/invisible provenance marks. Use only for non-factual atmosphere, or anchor with reference images.

### Cited Findings
- AI video tools produce hallucinated geometry (windows shift, layouts change between clips); benchmarks say models excel at fidelity but fail physical/causal reasoning. — [Hailuo knowledge pages](https://hailuoai.video/knowledge/architectural-realism-virtual-backlots-ai-prompting) and [themodelwire](https://www.themodelwire.com/article/new-benchmark-confirms-ai-video-generators-look-stunning-but-still-cant-reason-a-01KRR7AY8Y28ZYV02NWMWFJ0ZY) (vendor/aggregator sources, low-medium trust)
- AI "history" content distorting reality, e.g. Stonehenge example. — [TechRadar](https://www.techradar.com/ai-platforms-assistants/you-wont-believe-ais-take-on-the-history-of-stonehenge-and-i-am-so-over-ai-slop)
- Veo 3.1: commercial use reported permitted via Vertex AI / Flow paid tiers; SynthID invisible watermark on all outputs; visible watermark except Ultra. — [st-hakky summary](https://book.st-hakky.com/en/data-science/veo-3-1-usage-conditions-output-restrictions), [flowith](https://flowith.io/blog/veo-faq-commercial-rights-watermarks); CONFLICT: older article says Veo 3 commercial use prohibited as Pre-GA — [licenseorg](https://licenseorg.com/blog/ai-video-licensing-2026) (likely outdated)
- Runway Gen-4/Aleph: user keeps output ownership, commercial use allowed on all plans, watermark off from Standard ($15/mo); no using outputs to build competing products; Runway may train on content except Enterprise. — [licenseorg](https://licenseorg.com/blog/ai-video-licensing-2026), [terms.law](https://terms.law/ai-output-rights/runway/), [conductatlas ToS mirror](https://conductatlas.com/platform/runway/runway-terms-of-service/)
- Sora 2: commercial on Plus/Pro only; C2PA metadata; visible watermark on paid tiers per one source; API/business get IP indemnification. — [licenseorg](https://licenseorg.com/blog/ai-video-licensing-2026), [flowith](https://flowith.io/blog/sora-2-access-guide-public-release)
- Kling: commercial on paid plans; grants Kuaishou broad royalty-free licence; mandatory "KLING AI" branding/AI disclosure (per one source); China/Singapore arbitration. — [licenseorg](https://licenseorg.com/blog/ai-video-licensing-2026), [hackernoon checklist](https://hackernoon.com/can-you-use-ai-generated-video-commercially-heres-the-checklist-tool-by-tool)
- Human-authored vs AI copyright distinction still applies (you may own the file but have weak copyright). — [glbgpt](https://www.glbgpt.com/hub/can-i-use-veo-3-1-for-commercial-use/)

### Inferences
- For a site about real libraries, AI plates of the actual building would present invented details as fact; acceptable only for generic "mood" or labelled illustrative content.
- Runway and Sora paid tiers look lowest-friction on terms; Kling's branding clause is the heaviest.

### Gaps
- Primary ToS pages (Google, OpenAI, Kuaishou, Runway, Midjourney) not fetched; all terms are secondary summaries; verify before shipping. Midjourney video, Flux, Imagen terms not researched. No quantitative architecture-accuracy benchmark found.

## Route 3: Real-time three.js / WebGPU with baked lighting and post stack

### Takeaway
three.js now has WebGPURenderer with automatic WebGL2 fallback and a node-based post pipeline; pmndrs/postprocessing remains the mature WebGL option with the full realism effect list. Free CC0 PBR textures (Poly Haven, ambientCG) plus KTX2 make a cheap-per-MB material base.

### Cited Findings
- r183 (March 2026): `PostProcessing` renamed `RenderPipeline`, designed for WebGPURenderer; supports TRAA for volumetric lighting, temporal-stable SSR, HDR half-float output. — [Cinevva r183 summary](https://app.cinevva.com/news/2026-03-18-threejs-r183-render-pipeline) (secondary; effect list not given there)
- TSL post effects (bloom, DoF, GTAO) ported to WebGPURenderer as node classes, with MRT and automatic pass combination. — [three.js forum](https://discourse.threejs.org/t/three-js-webgpu-post-processing-effects/87390.md), [Utsubo migration guide](https://www.utsubo.com/blog/webgpu-threejs-migration-guide)
- r171 code-split WebGL/WebGPU entry points; WebGPURenderer falls back to WebGL2 automatically. — [Utsubo](https://www.utsubo.com/blog/webgpu-threejs-migration-guide), [digitalstrategyforce](https://digitalstrategyforce.com/journal/now-that-webgpu-works-on-iphone-should-your-website-use-3d/)
- WebGPU in Safari iOS 26 (iPhone); Android coverage ~60% GPU-driver dependent (aggregator figure, unverified). — [web.dev](https://web.dev/blog/webgpu-supported-major-browsers), [byteiota](https://byteiota.com/webgpu-2026-70-browser-support-15x-performance-gains/)
- pmndrs/postprocessing effects: bloom, DoF + vignette, god rays, SSAO, LUT/colour grading, noise, chromatic aberration, tone mapping; EffectPass merges effects into minimal passes. WebGPU status not stated. — [pmndrs/postprocessing README](https://github.com/pmndrs/postprocessing)
- three.js tone mappers: AgX (less saturated than ACES, follows Blender), ACESFilmic, Khronos PBR Neutral (13 lines GLSL; true-to-life colour for PBR, minimal opinion). — [three.js forum overview](https://discourse.threejs.org/t/tone-mapping-overview/75204), [gamedev.net](https://gamedev.net/news/khronos-pbr-neutral-tone-mapper-released-for-true-to-life-color-rendering-of-3d-objects-r2733)
- Poly Haven: all assets CC0 (780+ textures, 980+ HDRIs); ambientCG CC0 (2,000+ materials). 1K is the sensible default for browser; KTX2 cuts GPU memory ~4-8x. — [Poly Haven licence](https://polyhaven.com/license), [Cinevva guide](https://app.cinevva.com/guides/free-textures-hdris-materials)

### Inferences
- Realism per MB is best here: 1K KTX2 materials + one baked lightmap per room + HDRI for glossy reflections is likely tens of MB total at most; lazy-load to hit 5 MB first load.
- AgX or Khronos Neutral are safer than default ACES for wood/leather hue stability (taste-based inference from the "less saturated" finding).
- Volumetric light shafts: pmndrs god rays (WebGL) or TRAA-based volumetrics (WebGPU); mobile cost not sourced.

### Gaps
- No sourced mobile fps for WebGPURenderer post stacks on mid-range Android/iPhone. No official three.js changelog fetched (only secondary summaries). No sourced lightmap baking workflow details or triangle budgets. pmndrs WebGPU/TSL status unconfirmed.

## Route 4: Gaussian splats (new since mid-2025)

### Takeaway
Spark 2.0 (April 2026) adds continuous LoD and streaming with fixed splat budgets (500K mobile / 2.5M desktop); SOG (Sept 2025) gives ~95% size reduction. Relighting is still research, not production. Still limited by lack of licensable library captures (per your prior research).

### Cited Findings
- Spark 2.0, official rollout 2026-04-14, MIT licence: LoD splat tree, `.RAD` streaming format (64K-splat chunks, gzip), 16M-splat GPU pool paging, foveated rendering, global sorting. Budgets 500K mobile / 2.5M desktop. — [Radiance Fields](https://radiancefields.com/world-labs-releases-spark-v2.0)
- Claims: 100M+ splats streamed in a game; 40M-splat scenes smooth on phones/Quest. — same source (vendor-adjacent claim)
- SOG: 1 GB PLY (4M splats) to 42 MB; ~95% reduction, 2-3x better than compressed PLY; released 2025-09-17; PlayCanvas engine 2.11.0; SuperSplat compresses to SOG on publish; `splat-transform` CLI. — [PlayCanvas blog](https://blog.playcanvas.com/playcanvas-open-sources-sog-format-for-gaussian-splatting/)
- splat-transform v3.9.0 speeds SOG compression (Oct 2026). — [Radiance Fields](https://radiancefields.com/playcanvas-splat-transform-v3.9.0-speeds-up-sog-compression)
- Relightable splat research: NeAR (CVPR 2026), GS-PI, ReLightGS (deferred relighting, Gaussian G-buffer), BEAM. All research papers, no web runtime found. — [NeAR CVPR 2026](https://openaccess.thecvf.com/content/CVPR2026/papers/Li_NeAR_Coupled_Neural_Asset-Renderer_Stack_CVPR_2026_paper.pdf), [Radiance Fields Houdini PoC](https://radiancefields.com/toward-relightable-gaussian-splatting-a-houdini-based-proof-of-concept)

### Inferences
- A 500K-splat budget implies a ~10-30 MB .RAD/SOG-class file for an interior (size at that count not sourced); too big for 5 MB first load, ok as lazy upgrade.
- Splats photograph the real room (best "real" read) but you must capture it yourself; static lighting only.

### Gaps
- No per-scene SOG/RAD size at 500K splats; no independent mobile fps; no relighting in Spark/PlayCanvas; SPZ updates not researched.

## Route 5: Hybrid (backdrop + real-time foreground)

### Takeaway
No authoritative 2025-26 write-up found; the pattern is feasible with known pieces (render depth pass in Blender alongside plates, composite via depth in three.js).

### Cited Findings
- Spark 2.0 supports global sorting across multiple splat objects, enabling mixed splat scenes. — [Radiance Fields](https://radiancefields.com/world-labs-releases-spark-v2.0)
- three.js r183 RenderPipeline supports MRT/history buffers, usable for custom compositing. — [Cinevva](https://app.cinevva.com/news/2026-03-18-threejs-r183-render-pipeline)

### Inferences
- Practical recipe (unsourced, engineering judgement): Cycles render colour + Z (EXR→8-bit depth) per frame, matched FOV/camera path in three.js, depth-test foreground book against the depth texture; bake foreground contact shadow into a plate-matched shadow catcher.
- Matching exposure and grain of foreground to plate is where hybrids fail visibly.

### Gaps
- No sourced case studies or code for depth-composited video+3D on the web.

## Which route gives most "real" per MB and per solo hour?

### Takeaway
(Inference, not directly sourced.) Pre-rendered plates win on realism per hour of look-dev (Cycles does the lighting) but lose per MB once all-intra is needed; real-time three.js with baked lighting + CC0 KTX2 + a modest post stack wins per MB and interactivity; hybrid is best final quality but highest effort.

### Cited Findings
- Normal vs all-intra clip: 1-2 MB vs 8-13 MB at 1280px/30fps. — [hontran.dev](https://www.hontran.dev/blog/scroll-scrubbed-video-stutters-fix)
- SOG 42 MB for a 4M-splat scene. — [PlayCanvas](https://blog.playcanvas.com/playcanvas-open-sources-sog-format-for-gaussian-splatting/)
- CC0 PBR at 1K + KTX2 (4-8x GPU memory saving). — [Cinevva](https://app.cinevva.com/guides/free-textures-hdris-materials)

### Inferences
- Recommend: Route 3 as base (static site friendly, interactive book), plus 1-2 short pre-rendered Cycles hero plates (or a baked-lightmap approach) lazy-loaded; skip AI footage for factual shots and skip splats unless you capture your own.

### Gaps
- No hour estimates sourced.

## Concrete mobile limits

### Takeaway
Only splat budgets are sourced (500K mobile). Others are mostly unmeasured.

### Cited Findings
- Spark mobile budget 500K splats, 16M-splat GPU pool. — [Radiance Fields](https://radiancefields.com/world-labs-releases-spark-v2.0)
- KTX2 keeps textures GPU-compressed, 4-8x memory saving. — [Cinevva](https://app.cinevva.com/guides/free-textures-hdris-materials)
- iOS 26 WebGPU; Android ~60% (unverified). — [byteiota](https://byteiota.com/webgpu-2026-70-browser-support-15x-performance-gains/)
- Image-sequence memory: 200 frames at 2000px is 400 MB+ decoded, so decoded-frame caches must be bounded on phones. — [setproduct/GSAP community search summary](https://gsap.com/community/forums/topic/25188-airpods-image-sequence-animation-using-scrolltrigger/) (weak)

### Inferences
- Cap canvas DPR (e.g. 1.5), disable heavy post (DoF, volumetrics, SSR) on mobile; unsourced engineering judgement.

### Gaps
- No mid-range Android/iPhone fps numbers for any route; no triangle/draw-call budgets; no video decode limits for simultaneous seeks.

## Measurable "CG tells" and how studios avoid them

### Takeaway
I found no authoritative source on this; the list below is unsourced practitioner knowledge to be treated as hypotheses.

### Cited Findings
- AgX is less saturated than ACES by design; Khronos Neutral aims for true-to-life colour. — [three.js forum](https://discourse.threejs.org/t/tone-mapping-overview/75204)
- pmndrs offers vignette, chromatic aberration, noise (grain), DoF, bloom, LUT. — [pmndrs README](https://github.com/pmndrs/postprocessing)

### Inferences (unsourced)
- Tells: uniform clean edges (no bevels/wear), repeating tiling textures, too-low texel density on close books, flat ambient with no contact shadows/AO, missing light bounce colour bleed, over-sharp no-DoF, no lens behaviour (slight vignette, CA at edges, bloom on windows), over-saturated ACES, perfectly parallel/straight shelves, uniform dust-free air (no light shafts/dust motes), wrong scale cues (book size vs hand/ladder).
- Fixes: roughness/normal variation maps, decals for wear, baked AO/lightmaps, photographic HDRI exposure, film grain + subtle halation, pixel-stable camera shake.

### Gaps
- No studio case study (Lusion, Active Theory, Codrops) fetched; no measured thresholds (e.g. texels/cm).
