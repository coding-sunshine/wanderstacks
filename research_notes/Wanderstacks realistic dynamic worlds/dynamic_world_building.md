# Dynamic (procedural + streamed) world building for Wanderstacks

Scope: three.js r186 static site on Cloudflare Pages, ~30 parametric library rooms, 5 MB initial / 25 MB per room, mid-range Android + desktop. Researched 2026-11-08. Many searches returned thin results; gaps are listed per section and nothing below is invented.

## 1. What does Roblox streaming teach (StreamingEnabled, radius, model LOD, SLIM)?

### Takeaway
Roblox ships a coarse world skeleton first and streams detail by distance with a never-evict inner radius and a buffer zone. Its far-LOD (SLIM) is baked server-side from the published scene, not generated on the client, so the transferable lessons are "pause or gate at the loaded edge" and "coarse proxy first", not "generate on device".

### Cited Findings
- Instance streaming loads/unloads Workspace content by player position, device performance and other conditions. Join is fast because players "start playing in one part of the world while more of the world loads in the background", and low-memory devices can play because content streams in and out. — [Roblox streaming docs](https://create.roblox.com/docs/en-us/workspace/streaming.md)
- Defaults: StreamingMinRadius 64 studs (content inside never streams out), StreamingTargetRadius 1024 studs (max full-detail distance). Target should exceed min to create a buffer and avoid network pauses. Streaming out starts with the farthest regions. — [Roblox streaming docs](https://create.roblox.com/docs/en-us/workspace/streaming.md)
- StreamingIntegrityMode `PauseOutsideLoadedArea` is recommended: gameplay pauses if the player enters a region not yet streamed. — [Roblox streaming docs](https://create.roblox.com/docs/en-us/workspace/streaming.md)
- Persistent models are never streamed out, "intended for very rare circumstances". — [Roblox streaming docs](https://create.roblox.com/docs/en-us/workspace/streaming.md)
- ModelLevelOfDetail enum: Automatic (currently = Disabled), StreamingMesh (coarse coloured "imposter" mesh wrapping all child parts outside the radius, no textures), Disabled, SLIM (composite at progressively lower resolutions by distance, better quality than StreamingMesh). Impostors have no physics/raycast. — [Roblox ModelLevelOfDetail](https://create.roblox.com/docs/reference/engine/enums/ModelLevelOfDetail.md)
- SLIM pipeline: serialize geometry/materials/textures/transforms, upload to a cloud transcoding service on first publish/playtest, the cloud builds composited multi-LOD meshes (removing hidden geometry, optimizing textures), clients fetch from CDN. First generation can take 1-2 minutes for complex models. Static content only, no animation, requires publishing. — [Roblox SLIM docs](https://create.roblox.com/docs/workspace/streaming/slim)
- SLIM example: ~170,000 triangles / ~4,000 client instances vs ~2,600,000 triangles / ~60,000 instances with SLIM disabled (about 93% reduction in both). — [Roblox SLIM docs](https://create.roblox.com/docs/workspace/streaming/slim)

### Inferences
- Roblox's "dynamic world" is streaming of authored, server-held data, not client-side generation. Download savings come from not sending far content; Wanderstacks' equivalent is per-room lazy loading plus a coarse shell.
- Cheap analog of SLIM for Wanderstacks: build-time script emits a hall "shell" (merged walls, vault, floor, flat-shaded shelf-block boxes) as the far/first LOD; detail (books, mouldings) upgrades in near the player. This is a build-time bake (no cloud service needed).
- Gate the "loaded edge" like PauseOutsideLoadedArea: in a hall, hold the door/transition until the next bay chunk is generated rather than showing pop-in.

### Gaps
- No published numbers on Roblox StreamingMesh impostor sizes; docs do not say how they are generated.

## 2. Procedural architecture/books on the web: techniques, examples, mobile generation time

### Takeaway
Pure-parameter generation of shelves/books/mouldings is proven to fit tiny downloads (Total Library: whole infinite library in a 17-18 MB native build including engine), and rule/WFC systems (Townscaper) show the pattern. I found no measured mobile generation times for web library-scale generation; these must be benchmarked on Wanderstacks' own kit.

### Cited Findings
- Total Library (Godot): "everything is generated in real-time", no render distance limit, Windows/Linux builds about 17-18 MB, shadows are the main perf cost on weak machines. — [Total Library, itch.io](https://mathematastic.itch.io/total-library)
- Deterministic infinite-library demos map each coordinate to content via BigInt math (same address = same page), so nothing is stored. — [Library of Babel search results (deterministic browser demo)](https://kody-w.github.io/learnwithkody/examples/library-of-babel/); other variants listed: [Library of Babel 3D (Keiwan)](https://keiwan.itch.io/library-of-babel-3d), [WFC infinite library](https://wrenorsmthn.itch.io/infinite-library-of-babel-wfc)
- A three.js shelf of seven hardcovers uses procedural cloth/foil/paper/wood/roughness/normal textures, runtime canvas-generated textures, and cover/wood art as embedded WebP atlases. (Search snippet only; I did not open the original page.) — search result summary, source link not captured in the tool output
- Townscaper / Bad North: Oskar Stalberg uses wave function collapse over small building "puzzle pieces" with adjacency rules, blended with handcrafted detail to avoid repetition. — [XR AI Spotlight on Stalberg](https://xraispotlight.substack.com/p/how-to-make-procedural-generation); [Etao podcast](https://etao.blog/2020/10/13/podcast-94/)
- 3DWorld (blog) places book titles on spines of procedurally placed books on shelves, desks, tables. — [3dworldgen: procedural bookcases](https://3dworldgen.blogspot.com/2022/02/procedural-bookcases.html)
- Blender procedural-bookshelf approach: instance a small set of base books, squash/stretch/rotate by random values per instance. — [Blender Artists thread](https://blenderartists.org/t/arrays-of-books-geometry-nodes/1370428)
- three.js WebGPU compute: `StorageBufferAttribute`/`StorageInstancedBufferAttribute` + `Fn().compute(count)` via `renderer.compute()/computeAsync()` let compute shaders write vertex/instance data read by vertex shaders (WebGPURenderer only). — [three.js StorageBufferAttribute docs](https://threejs.org/docs/pages/StorageBufferAttribute.html)
- WebGPU shipped by default in Chrome/Edge, Safari 17+, Firefox (141 Windows, 145 Apple-silicon macOS); global caniuse about 76%, Android Chrome 121+ needs Android 12 and Qualcomm/ARM GPUs. Low-tier/legacy Android still lacks it. — [WebGPU support 2026 summary (search)](https://webo360solutions.com/blog/webgpu-browser-support); [web.dev announcement](https://web.dev/blog/webgpu-supported-major-browsers)

### Inferences
- Compute-shader generation is optional optimization: ~76% WebGPU coverage means a CPU/Worker path must exist anyway. For tens of thousands of book instances, a seeded JS loop writing a Float32Array is likely sub-100 ms on desktop; unmeasured on mobile (mark as to-benchmark).
- Per-hall generation reduces to: shell geometry from kit params (small count of meshes, merged), plus instance matrices/colour/atlas-index arrays for books. The "few KB of params" idea is viable for geometry; textures are the expensive part and should be shared atlases, not per-room.
- Hybrid recommended by the evidence: WFC/shape-grammar is overkill for symmetric halls; the hall kit's parameters are already a grammar.

### Gaps
- No measured mobile generation times found for any web procedural-architecture demo.
- Could not find CGA/CityEngine or Houdini-in-JS web ports with numbers; not covered.
- MyShelves three.js bookshelf: not found.

## 3. Instancing book spines: InstancedMesh / BatchedMesh, atlases, draw calls

### Takeaway
Use InstancedMesh per distinct book geometry (2-4 variants), with per-instance colour and an atlas index/UV offset for spine decals; use BatchedMesh only for many different geometries. This keeps draw calls to a handful per hall.

### Cited Findings
- Single geometry: InstancedMesh. A few geometries (2-4) with many instances: separate InstancedMesh each. Many geometries: BatchedMesh. BatchedMesh uses multiDraw, which "performs worse if you render a lot instances (more than 100k)". — [three.js forum: InstancedMesh vs BatchedMesh](https://discourse.threejs.org/t/how-to-choose-between-instancedmesh-and-batchedmesh/81221)
- BatchedMesh (r160+) culls and sorts per object (`perObjectFrustumCulled`, `sortObjects` on by default) and has `setVisibleAt`; both share a single material. — [same forum thread](https://discourse.threejs.org/t/how-to-choose-between-instancedmesh-and-batchedmesh/81221)
- r165 migration: BatchedMesh requires `addInstance` to render; r150: InstancedMesh frustumCulled defaults true, call `computeBoundingSphere()` after updating transforms. — [three.js migration guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide)
- InstancedMesh2 (`@three.ez/instanced-mesh`, third-party): per-instance frustum culling with dynamic BVH, instance-level LOD, per-instance uniforms, dynamic capacity. — [npm package](https://www.npmjs.com/package/@three.ez/instanced-mesh); [forum thread](https://discourse.threejs.org/t/three-ez-instancedmesh2-enhanced-instancedmesh-with-frustum-culling-fast-raycasting-bvh-sorting-visibility-management-lod-skinning-and-more/69344)

### Inferences
- Plain InstancedMesh frustum culls the whole mesh only. For a long hall, split books per bay/shelf-unit (one InstancedMesh per bay, or per-bay chunks) so built-in culling works and generation can be chunked across frames. InstancedMesh2 is an option if per-instance culling is needed, at the cost of a dependency.
- Memory: per instance 64 B matrix + 12 B colour + optional atlas index; 100k books is about 7-8 MB RAM, none of it downloaded. (Arithmetic from standard Float32 layouts, not from a source.)
- Spine look from a shader: base colour + height/width variation + atlas-sampled title strip chosen by index; titles from a pre-baked glyph/spine atlas (one 1-2K KTX2) rather than per-book canvas text.

### Gaps
- No benchmark numbers found for book-count vs FPS on mobile.

## 4. Progressive / LOD loading: glTF + Meshopt + KTX2, Spark, impostors

### Takeaway
Ship a small meshopt+KTX2 shell per room first, stream detail after; Spark 2.0 already implements the streaming-LOD pattern for splats and gives the budgets to copy.

### Cited Findings
- gltfpack: `-cc` meshopt-compressed output (needs EXT_meshopt_compression, supported in three.js r122+), `-tc` KTX2/BasisU textures, `-tw` WebP, `-mi` mesh instancing, `-si R` simplification ratio; `-cc` works best with gzip/deflate on the CDN; `-cz` for maximum compression. No size ratios published on that page. — [gltfpack docs](https://meshoptimizer.org/gltf/)
- Basis Universal: ETC1S about 0.3-1.25 bpp (medium quality), UASTC 4-8 bpp (high quality); KTX2 stays compressed to VRAM, transcoded to BC (desktop) or ASTC/ETC2 (mobile), typically 4x-8x less texture memory. — [Basis Universal repo](https://github.com/google/basis_universal) and search summary; I did not find transcode ms figures
- three.js r181: `KTX2Loader.detectSupportAsync()` deprecated, use `detectSupport()` after renderer init. — [migration guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide)
- Spark 2.0 (World Labs, three.js, WebGL2): LoD splat tree, fixed budgets of 500K splats mobile / 2.5M desktop, .RAD format with 64K-splat chunks, first chunk holds the 64K largest splats for instant coarse preview, byte-range seekable, three parallel Web Workers decode, 16M-splat pre-allocated GPU pool with 64K-splat pages and LRU eviction; 40M-splat scenes run on phones/Quest. — [RadianceFields: Spark 2.0](https://radiancefields.com/world-labs-releases-spark-v2.0)
- Cloudflare Pages: max 25 MiB per single asset, 20,000 files on Free. — [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)

### Inferences
- The 25 MiB asset cap equals Wanderstacks' per-room budget; any splat/glTF per room must be a single file under it, or be chunked (also better for range/progressive loading).
- Spark's "largest-first first chunk, then refine" is the template for splat rooms: ship a coarse first chunk (hundreds of KB) and stream the rest.
- Impostors: for a hall, a baked cube/billboard of the far end can hide the vault/bay generation; no source found for web impostor numbers (build-time bake, cheap to implement as one KTX2).

### Gaps
- 3D Tiles for interiors: no sources found; likely overkill for ~30 fixed rooms.
- No measured KTX2 transcode times on mid-range Android.
- Actual meshopt/KTX2 size reductions: not found with numbers.

## 5. Generate on first visit and cache (SW, Cache API, IndexedDB, OPFS, seeds, Workers)

### Takeaway
Because generation is deterministic from a seed/params, store nothing for geometry; regenerate each visit in a Worker. Cache only the expensive baked assets (KTX2, splats, shell glTF) via the Service Worker Cache API, optionally OPFS for large generated blobs.

### Cited Findings
- web.dev guidance: Cache Storage API for network resources, OPFS for file-based content, IndexedDB for other data; all three are supported in every modern browser and do not block the main thread. — [web.dev: storage for the web](https://web.dev/articles/storage-for-the-web)
- Quotas: Chrome origin up to 60% of disk (about 300 MB if "clear on close"; incognito about 5%); Firefox up to 50% of free disk, 2 GB per eTLD+1 group; Safari about 1 GB desktop and mobile (mobile prompts in 200 MB steps). — [web.dev](https://web.dev/articles/storage-for-the-web)
- Eviction: best-effort storage is evicted LRU under pressure; Safari caps script-writable storage (IndexedDB, Cache API, service workers) at seven days of inactivity (not for installed PWAs); persistent storage requires an explicit request. — [web.dev](https://web.dev/articles/storage-for-the-web)

### Inferences
- 30 rooms x 25 MB = 750 MB worst case; exceeds Safari's ~1 GB comfort once other things are cached, and Safari's 7-day eviction means "first visit" can recur. Cache LRU per room and cap (for example, 5-6 rooms), call `navigator.storage.persist()` where granted.
- Seeded PRNG (for example mulberry32) keyed on roomId+bayIndex gives identical output across sessions and devices if the generation code avoids Math.random and float-order nondeterminism; keep integer-hash seeds. Generating in a Worker (OffscreenCanvas for atlas textures, typed arrays transferred) avoids jank. These are standard patterns; I did not find a source with measured numbers.
- Skip IndexedDB/OPFS for generated geometry: regeneration is likely faster than a storage round-trip for small arrays. Revisit only if profiling shows generation over about 200 ms on target phones.

### Gaps
- No source on Worker/OffscreenCanvas generation timing for mobile.
- iOS-specific Cache API behaviour in 2026 beyond the web.dev figures not verified.

## 6. Build-time vs client-time split

### Takeaway
Bake lighting, splats, and shared texture atlases at build; generate geometry, book instances and variation on the client.

### Cited Findings
- Roblox bakes far-LOD composites in a cloud pipeline at publish time, not on clients. — [SLIM docs](https://create.roblox.com/docs/workspace/streaming/slim)
- Spark's .RAD LoD tree and chunking are built offline; clients only stream and page. — [RadianceFields](https://radiancefields.com/world-labs-releases-spark-v2.0)
- Total Library generates everything at runtime from procedural rules and ships ~17-18 MB. — [itch.io](https://mathematastic.itch.io/total-library)

### Inferences (recommendation for Wanderstacks)
| Item | Where | Why |
|---|---|---|
| Hall shell (walls, floor, vault, domes, columns, mouldings) from kit params | Client, Worker, seeded | Few KB of params; small vertex count |
| Shelf units, books (InstancedMesh per bay), book colours/sizes | Client, chunked per bay | Deterministic; zero download |
| Lightmaps / baked AO / vertex AO | Build (KTX2, per-room, shared where possible) | Costly on mobile |
| Spine/wood/stone/floor atlases | Build, shared across rooms, KTX2 | Cached once, reused by all 30 rooms |
| Splat/scan content | Build (.RAD or similar, chunked) | Cannot be procedural |
| Far shell / impostor | Build, tiny | Visible while client generates |
| Heavy or unique props (statues, globes) | Build glTF meshopt+KTX2 | Not parametric |
Cache: Service Worker Cache API for shared atlases and per-room baked files (immutable hashed names); do not cache generated geometry; cap rooms cached.
Rollout order: (1) CPU Worker generation + InstancedMesh, benchmark on a mid-range Android; (2) shared atlases; (3) shell-first + chunked bay generation; (4) WebGPU compute only if (1) misses budget.

### Gaps
- Whether generation fits "snappy" on mid-range Android: unmeasured, must be prototyped.

## 7. Real examples with numbers

### Takeaway
Numbers I could verify are sparse: several tiny three.js sites exist, but most claims come from forum posts. Treat as indicative.

### Cited Findings
- A three.js/R3F/drei/GSAP portfolio reports 4.16 MB gzipped base experience, 30+ fps on lower-end devices, sub-experience assets loaded on demand after Start, procedural instanced geometry and a procedurally generated galaxy. — [three.js forum](https://discourse.threejs.org/t/only-4-1mb-small-lightweight-highly-performant-three-js-r3f-drei-portfolio-website/56747)
- Bruno Simon's portfolio is claimed at about 2.8 MB gzipped bundle in a blog aggregator; not verified from a primary source, treat as unconfirmed. — [surrealstrokes blog](https://surrealstrokes.blogspot.com/2025/12/bruno-simons-3d-portfolio-sets-new.html); case study: [Medium](https://medium.com/@bruno_simon/bruno-simon-portfolio-case-study-960402cc259b)
- Messenger (abeto): WebGL/three.js with compressed textures/assets, runs on desktop and mobile; no size figures found. — [GamingPH](https://gamingph.com/2025/09/messenger-a-free-short-game-where-a-kid-delivers-messages-in-a-small-round-world-playable-in-browser)

### Gaps
- No numbers found for: abeto Messenger payload, Google Middle-earth, PlayCanvas/Needle sites, Poki/CrazyGames payloads, Townscaper web.
