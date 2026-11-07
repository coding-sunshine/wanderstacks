# Snappiness and performance for a heavy three.js static site (WorldLibs), as of Nov 2026

Scope note: ~25 tool calls; several searches returned thin or off-topic results (Bruno Simon search failed; 403/404 on two fetches). Items without a citation are in Inferences or Gaps. Search-engine-derived blog summaries (buildmvpfast, openreplay, vr.org, youngju.dev, abratabia) were NOT fetched and are treated as weak; only primary pages fetched are in Cited Findings.

## 1. WebGPU vs WebGL2 in late 2026 (support, WebGPURenderer, pitfalls)

### Takeaway
WebGPU is now shipped in all four engines, but with platform gaps (Firefox Android and Intel Mac not yet; Chrome Android needs Android 12+ and specific GPUs). WebGPURenderer falls back to WebGL2 automatically, so WebGL2-only code paths must stay supported and tested; WebGPU is not free speed.

### Cited Findings
- WebGPU officially supported in Chrome, Edge, Firefox, Safari. Chrome/Edge 113+ (Windows D3D12, macOS, ChromeOS); Chrome Android 12+ (v121+) on Qualcomm/ARM GPUs; Linux in progress. — [web.dev](https://web.dev/blog/webgpu-supported-major-browsers)
- Firefox: Windows 141+, macOS 145+ (ARM64, macOS Tahoe 26 only); Linux, Android, Intel Macs "in progress". — [web.dev](https://web.dev/blog/webgpu-supported-major-browsers)
- Safari 26: WebGPU on macOS Tahoe 26, iOS 26, iPadOS 26, visionOS 26. WebKit says it maps better to Metal than WebGL did; three.js, Babylon, PlayCanvas, Unity listed as working. — [web.dev](https://web.dev/blog/webgpu-supported-major-browsers), [WebKit blog](https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/)
- three.js WebGPURenderer "attempts WebGPU if supported; automatically falls back to WebGL 2". Options: `forceWebGL` (default false), `antialias` (default false; MSAA 4 samples when true), `outputBufferType` default `HalfFloatType` (set `UnsignedByteType` to save memory), `reversedDepthBuffer`, `logarithmicDepthBuffer`. — [three.js docs](https://threejs.org/docs/pages/WebGPURenderer.html)
- Spark (World Labs' splat renderer for three.js) targets "98%+ WebGL2 support", i.e. WebGL2 is its baseline; formats PLY, SPZ, SPLAT, KSPLAT, SOG. — [Spark GitHub](https://github.com/sparkjsdev/spark)

### Inferences
- HalfFloat default output buffer in WebGPURenderer doubles framebuffer bandwidth vs 8-bit; on mobile set `UnsignedByteType` unless HDR/post needs it (derived from docs option, not measured).
- Because Spark and most libraries are WebGL2-first, and fallback exists, the lowest-risk path: ship WebGLRenderer as the default for 2026, make WebGPURenderer an opt-in A/B (feature flag) and measure on M1 Air and iPhone before switching. "Three.js maintainers say not to expect free performance from the swap" is from a secondary search summary (not verified on a primary page).
- Async compile: `renderer.compileAsync(scene, camera)` exists for WebGLRenderer (merged Oct 2023 per a search summary, unverified on primary page). Plan: call it during the fly-in, behind the globe, for each room's materials (and `KHR_parallel_shader_compile` underneath on WebGL).

### Gaps
- No primary-source measurements of WebGPU vs WebGL2 in three.js r18x for scenes like ours; no verified shader-compile-stall or pipeline-caching numbers; TSL specifics not fetched (three.js manual URL 404'd). Needs own benchmark.
- Current three.js version/bundle numbers for r186 not verified; r186 behavior assumed per the brief.

## 2. First paint and code splitting

### Takeaway
Canvas/WebGL is not an LCP candidate, so LCP will be the HTML shell's poster image or text; make that an `<img>`/CSS poster that paints before any three.js loads. three.js WebGPU build is large (~160 KB gz full, ~176 KB gz minimal tree-shaken per PR bots), so load it as a separate lazy chunk.

### Cited Findings
- LCP candidates: `<img>`, SVG `<image>`, `<video>` (poster), background-image via `url()`, block text. Canvas/WebGL not listed. Good LCP = 2.5 s or less at p75 (Lighthouse's own mobile target in the brief is 3 s). — [web.dev LCP](https://web.dev/articles/lcp)
- three.js PR bundle-size bots: full ESM WebGPU build ~580 KB min / ~160 KB gzip; tree-shaken minimal WebGPU build (renderer, camera, empty scene) ~650 KB min / ~176 KB gzip. These numbers come from a search snippet of PRs #31879/#32154/#31830, not the PR pages. — [three.js PR 31879](https://github.com/mrdoob/three.js/pull/31879) (snippet-level; verify).
- Tree-shaking note: GLSL shader chunks are still pulled in even if you use a single material. — [three.js forum](https://discourse.threejs.org/t/tree-shaking-three-js/1349?page=3) (old thread, snippet-level)
- A particle canvas hero animation pushed one site's Lighthouse LCP to 5.3 s; fix was deferring canvas setup via `requestIdleCallback`. — [savvy.co.il](https://savvy.co.il/blog/wordpress-speed/hero-animation-lcp-optimization/) (blog, snippet-level)
- View Transitions: same-document supported Chrome/Edge 111+, Safari 18+, Firefox 144+; cross-document Chrome/Edge 126+, Safari 18.2+, Firefox not yet. — [Chrome docs](https://developer.chrome.com/docs/web-platform/view-transitions)
- Long tasks: >50 ms blocks input; use `scheduler.yield()`; batch and yield only past ~50 ms deadline; avoid `isInputPending()`. — [web.dev](https://web.dev/articles/optimize-long-tasks)

### Inferences
- Architecture: static HTML with inline critical CSS + a pre-rendered globe poster (AVIF/WebP, <60 KB, `fetchpriority=high`, preloaded) as the LCP element; three chunk loaded on idle or first pointer/intent; canvas fades in over poster (opacity transition so the poster stays the LCP candidate).
- Use same-document View Transitions (SPA) for globe -> room -> reader, with a no-op fallback; cross-document not needed and unsupported in Firefox.
- "Initial 5 MB" budget is generous; recommend a tighter internal target (see section 8).

### Gaps
- No verified numbers on actual tree-shaken size of our r186 imports (GLTFLoader, KTX2Loader, MeshoptDecoder) — measure with `vite build --report`/rollup-visualizer.
- Progressive JPEG / KTX2 mip streaming / splat LOD: no primary sources found in this pass.

## 3. Perceived performance: prefetch, intent, off-main-thread

### Takeaway
Speculation rules work only for page navigations (Chrome/Edge); for an SPA, prefetch assets yourself on intent and during the fly-in. KTX2 transcoding already runs in workers.

### Cited Findings
- Speculation Rules: `prefetch`/`prerender` JSON; eagerness levels `immediate` (default for static lists), `eager` (desktop 10 ms hover; mobile 50 ms in viewport), `moderate` (desktop 200 ms hover; mobile 500 ms after scroll stops), `conservative` (pointer/touch down). Chrome limits: immediate 50 prefetch/10 prerender; eager/moderate mobile 6/2, desktop 2/2. Support Chrome/Edge 109+ (eagerness 121+); Firefox preview only; Safari experimental flag. — [Chrome docs](https://developer.chrome.com/docs/web-platform/prerender-pages)
- KTX2Loader transcodes via WASM Basis transcoder, supports a max worker count; KTX2 textures stay GPU-compressed in VRAM at 4-8x less than raw RGBA (a 2048x2048 PNG/WebP ~22 MB in VRAM regardless of file size). — [three.js KTX2Loader docs](https://threejs.org/docs/pages/KTX2Loader.html), [Cinevva guide](https://app.cinevva.com/guides/optimize-glb-for-web) (vendor guide)
- Optimization order for GLB: cap textures 1024/2048, KTX2, quantize vertices, then Meshopt. — [Cinevva guide](https://app.cinevva.com/guides/optimize-glb-for-web)

### Inferences
- Prefetch room N+1 assets (`fetch` into SW cache, or `<link rel=prefetch>`) on hover/focus of a door/pin and at globe-zoom start; GLB + KTX2 decode in workers; upload textures incrementally (a few per frame) to avoid long tasks.
- Use `createImageBitmap` with `imageOrientation`/`resizeWidth` for IIIF tiles to decode off-thread (technique, not sourced here).
- OffscreenCanvas worker rendering is possible but complicates UI/DOM and Spark; not recommended initially.

### Gaps
- No sourced evidence on `compileAsync` timing, GC-jank mitigation numbers, or OffscreenCanvas on iOS.

## 4. Mobile

### Takeaway
Use tiered DPR/quality with runtime frame-time feedback, not detect-gpu alone (its benchmark data stopped updating Dec 2025). iOS memory/context loss is real; budget textures strictly.

### Cited Findings
- detect-gpu tiers: 0 unsupported, 1 >=15 fps, 2 >=30, 3 >=60; default thresholds [0,15,30,60]; benchmark data from gfxbench.com which "stopped updating in December 2025"; benchmark fetch from CDN can fail (`BENCHMARK_FETCH_FAILED`), self-hosting data URL supported. — [detect-gpu](https://github.com/pmndrs/detect-gpu)
- Suggested DPR mapping (tier 3: min(dpr,2), tier 2: 1.5, tier 1: 1.0); 1.5 vs 2.0 is ~1.77x fewer pixels. — [community discussion](https://github.com/zakky8/web-optimization/discussions/1) (low-trust, snippet-level)
- iOS Safari: stricter memory than Android Chrome; crashes seen above ~256 MB GPU memory on older devices; context can be lost on memory pressure/background; listen for `webglcontextlost`/`restored`, `preventDefault()`; canvas resize on iOS may leak backing stores. — [abratabia](https://abratabia.com/mobile-web-games/ios-safari-gotchas.php) (blog), [WebKit bug 289601](https://bugs.webkit.org/show_bug.cgi?id=289601), [three.js forum](https://discourse.threejs.org/t/three-js-broken-on-ios-17-with-context-lost/58025)

### Inferences
- Use `PerformanceObserver`/rAF delta moving average: if p95 > ~20 ms over 2 s, drop DPR in 0.25 steps (floor ~1.0), then disable post/shadows; raise only after sustained headroom; cap fps at 30 on thermal throttling signals (battery/`navigator.getBattery` not reliable on iOS).
- Never resize the canvas on every frame/viewport tick; dispose rooms on exit (geometry/textures/render targets), keep one renderer.
- Per-room VRAM target on mobile: <=150-200 MB (inference from the 256 MB iOS crash datapoint).

### Gaps
- No sourced thermal throttling numbers; no verified iOS 26 memory ceilings.

## 5. Caching

### Takeaway
Hashed assets: `immutable` one-year via `_headers`; HTML always revalidated; Service Worker cache-first for hashed/KTX2/GLB, stale-while-revalidate for manifests. Request persistent storage; iOS may evict.

### Cited Findings
- Pages default `Cache-Control: public, max-age=0, must-revalidate`; `_headers` needed for long caching; example `public, max-age=31556952, immutable`. — [randombits.dev](https://randombits.dev/articles/tips/cloudflare-pages-caching) (blog, snippet-level), [CF docs](https://developers.cloudflare.com/pages/configuration/headers/)
- `_headers`: max 100 rules, 2,000 chars/line, applies only to static assets (not Functions). — [Cloudflare docs](https://developers.cloudflare.com/pages/configuration/headers/)
- Pages free plan: 20,000 files per site, 25 MiB max per file; larger -> R2. — [Cloudflare limits](https://developers.cloudflare.com/pages/platform/limits/)
- Free plan: unlimited bandwidth/static requests, HTTP/3, Brotli on text assets (snippet-level from third-party pages). — [Cloudflare Pages](https://pages.cloudflare.com/)
- Workbox/SW strategies: cache-first for immutable assets, SWR for non-critical, network-first for fresh data, cache-only for precache. — [Chrome Workbox docs](https://developer.chrome.com/docs/workbox/caching-strategies-overview)
- Storage: Chrome origin up to 60% disk; Firefox ~50% of free disk (2 GB per eTLD+1 group); Safari ~1 GB with 200 MB prompts; Safari evicts after 7 days of Safari use without interaction (not for installed PWAs); `persist()` protects from best-effort eviction. — [web.dev storage](https://web.dev/articles/storage-for-the-web)

### Inferences
- IIIF images from third-party servers: SW cache only if CORS-enabled; use an LRU cap (e.g. 300-500 MB) to stay under Safari's ~1 GB.
- Rooms >25 MiB per file are not an issue (25 MB/room total, split across files); keep each file well under 25 MiB; room count must stay under 20,000 files.
- Brotli: no gain for KTX2/JPEG/AVIF/meshopt'd GLB (already entropy-coded; meshopt benefits slightly from gzip/brotli on top, but small) — inference, unsourced here.

### Gaps
- No verified Cloudflare statement on bandwidth in primary docs fetched (limits page silent); `Accept-Ranges`/Range handling in SW (Workbox range-requests plugin) not verified.

## 6. Measurement

### Takeaway
Lighthouse sees only the poster/shell; use field RUM plus scripted frame-time capture.

### Cited Findings
- LCP excludes canvas (see section 2); thresholds good <=2.5 s at p75 — [web.dev](https://web.dev/articles/lcp). Long tasks >50 ms hurt INP — [web.dev](https://web.dev/articles/optimize-long-tasks).

### Inferences
- Add `PerformanceObserver` for `longtask`/`long-animation-frame`, custom `performance.mark` for "room interactive", and a Playwright test that records rAF deltas over a scripted fly-in (headless Chromium uses SwiftShader unless run headed with GPU; run on real M1 headed, report p50/p95/p99).
- stats-gl and `renderer.info` (calls, triangles, textures, geometries) for CI budget asserts.

### Gaps
- Not researched with sources: stats-gl specifics, Playwright GPU flags, CLS handling for canvas.

## 7. Real-world examples

### Cited Findings
- Bruno Simon folio-2025 (MIT): Vite; textures through KTX-Software `toktx --etc1s --quality 255` and gltf-transform CLI; UI images WebP; instanced rendering; ordered 15-phase game loop. — [GitHub](https://github.com/brunosimon/folio-2025)

### Gaps
- Igloo Inc, Lusion, Active Theory, Messenger by Abeto, Google Earth web, Sketchfab: no usable sources found in this pass.

## 8. Recommended architecture and budgets (derived; proposals, not sourced facts)

- Shell: static HTML + inline CSS + poster `<img>` (<=60 KB) = LCP; target LCP <=2.0 s on Lighthouse mobile (headroom under 3 s). Initial transfer target <=1.5 MB (limit 5 MB): shell + poster + app JS (~150-250 KB gz) before intent; three chunk (~180-250 KB gz) lazy on idle/intent.
- Renderer: WebGL2 default, WebGPURenderer behind flag after benchmarks; `antialias` off on mobile; DPR by tier with runtime governor (floor 1.0, cap 2.0 desktop / 1.5 mobile).
- Room pipeline: GLB (Meshopt) + KTX2 (ETC1S for diffuse, UASTC for normals), per-room 25 MB cap: ~8 MB geometry/mesh, ~14 MB textures, ~3 MB audio/misc; VRAM <=200 MB mobile. Prefetch next room on door hover and during fly-in; `compileAsync` before reveal; stagger texture uploads.
- Reader: IIIF tiles via `createImageBitmap` in a worker; low-res thumbnail first, tiles refine; page-turn textures capped at 1024-2048.
- Splats (if used): SPZ/SOG formats, cap splat count (e.g. 1-2M desktop, <=500k mobile; numbers are proposals), LOD/stream.
- SW: precache shell; cache-first hashed assets; SWR manifests; LRU cap ~500 MB; call `navigator.storage.persist()` after first meaningful engagement.
- `_headers`: `/assets/*` immutable 1 y; `/*.html`, `/` no-cache; `/sw.js` no-cache.
- Frame budget: p95 <=20 ms on M1 Air; yield every 50 ms in loaders; no allocations in render loop (reuse vectors/matrices).
- Gate in CI: Lighthouse mobile on shell; Playwright headed p95 frame-time on scripted flight; renderer.info asserts (draw calls, textures).
