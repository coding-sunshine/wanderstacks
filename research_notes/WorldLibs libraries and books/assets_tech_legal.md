# WorldLibs: 3D assets, capture/render tech, AI generation, legal, comparables (as of 2026-11-07)

Method note: ~25 tool calls. Search was thin on library-specific 3D assets; many Sketchfab pages are not indexed by the search tool, so absence of a hit is NOT proof a model does not exist. Items from my own background knowledge are marked "(unverified, recall)" and are not cited.

## 1. Existing 3D assets (Sketchfab, Smithsonian, Poly Haven, splat galleries)

### Takeaway
No ready-made, permissively licensed model of any of the target libraries (Long Room, Admont, LoC, Peabody, Real Gabinete, Strahov, NYPL Rose) was found. Only generic library/reading-room scans exist, often CC BY-NC. Practical plan: hand-model/kitbash the hero rooms, use CC0 (Poly Haven, Smithsonian) for props, and treat Sketchfab as reference only unless license is CC BY / CC0.

### Cited Findings
- Search for a Trinity Long Room Sketchfab model returned only Trinity College Oxford building models and generic libraries; no dedicated Long Room model surfaced — [search](https://sketchfab.com/3d-models/the-library-c79dd4508b4a4c4ba28ad08de931e584) (generic result; see Gaps)
- No Sketchfab scan of Admont Abbey Library surfaced; only other abbeys (Padise, Mellifont) — [Sketchfab cultural heritage blog](https://sketchfab.com/blogs/community/over-100000-cultural-heritage-3d-models-on-sketchfab)
- John Rylands Library Historic Reading Room: by The John Rylands Library, photogrammetry (~700 photos, Agisoft Metashape), ~500k triangles, license **CC BY-NC 4.0**, downloadable, deliberately left raw (cobweb-like noise). NC means unusable in a commercial product — [Sketchfab](https://sketchfab.com/3d-models/the-john-rylands-library-historic-reading-room-99e77453302c48f2af4a8127d360e743)
- Other generic library models seen in results (licenses NOT checked): Charterhouse Old Library [link](https://sketchfab.com/3d-models/the-charterhouse-old-library-5357e513c91440968c32242de5e100ac); "lowpoly victorian library wall with books" [link](https://sketchfab.com/3d-models/lowpoly-victorian-library-wall-with-books-79c18870c92c49e3b94360571f2cc0d0); Oxford library/church [link](https://sketchfab.com/3d-models/oxfordlibrarychurchuniversityharry-potter-a4d9df0fc7a448298ff2ef3a83e112f4); Harvard Library Barberini collection [link](https://sketchfab.com/HarvardLibrary/collections/barberini); UConn Library [link](https://sketchfab.com/uconn_library/models)
- Sketchfab license tiers: CC BY-NC bars commercial use; Store "Editorial" licensed material cannot be used for commercial, promotional, advertising or merchandising use; Store "Standard" allows worldwide commercial use in derivative works — [Sketchfab help: store license FAQ](https://help.sketchfab.com/en/articles/16152225-store-license-usage-faq), [license filters](https://sketchfab.com/blogs/community/refine-downloadable-model-searches-with-new-license-filters)
- Sketchfab has a public-domain dedication path for 3D cultural heritage — [Sketchfab blog](https://sketchfab.com/blogs/community/sketchfab-launches-public-domain-dedication-for-3d-cultural-heritage)
- Smithsonian: 2,000+ 3D models under CC0 (commercial use, no attribution), downloadable as OBJ/glTF, also on Sketchfab — [CG Channel](https://www.cgchannel.com/2020/03/get-2000-free-3d-models-from-the-smithsonian-collection/), [Smithsonian 3D explore](https://3d.si.edu/explore). Collection is mostly artifacts/aerospace/natural history, I found no library interiors there. 3d.si.edu also has a Gaussian splatting page — [3d.si.edu/node/53](https://3d.si.edu/node/53)
- Poly Haven: 100% CC0 models/HDRIs/textures, any purpose — [Poly Haven](https://polyhaven.com). Useful for wood/leather/paper textures, HDRIs for lighting; no library-specific kits confirmed (e.g. GothicCabinet_01 exists: [link](https://polyhaven.com/a/GothicCabinet_01)).
- Official 360 tours exist (not 3D, not reusable as assets): Trinity Library 360 [tcd.ie](https://tcd.ie/library/using-library/360.php) (covers Hamilton and Stearne libraries per result); LoC Main Reading Room "Virtual Views" [loc.gov](https://www.loc.gov/visit/maps-and-floor-plans/reading-rooms-and-research-centers/main-reading-room/)
- 80.lv community "3D Metasites: Library of Congress" exists as an artist reconstruction (details/license not read) — [80.lv](https://80.lv/articles/3d-metasites-by-80-lv-community-library-of-congress)
- State Library Victoria Redmond Barry Reading Room was reconstructed as a Gaussian splat for the "Mouthful of Dust" experience (proof splats of library reading rooms are feasible; asset not public) — [three.js forum](https://discourse.threejs.org/t/mouthful-of-dust-a-ned-kelly-web-experience/85925), [experience](https://www.slv.vic.gov.au/mouthful-of-dust/)

### Inferences
- Plan to model Long Room, Admont, Strahov, Real Gabinete, NYPL Rose, Peabody from reference photos (Wikimedia Commons / own photos) as modular kits; no capture to download.
- Alexandria must be fully invented; Ubisoft itself based its Alexandria library on the Library of Celsus at Ephesus ([Ubisoft/aggregator coverage](https://assassinscreedwiki.accesstheanimus.com/wiki/Library_of_Alexandria)), so no ground truth exists and no copyright issue with an original design.
- Filter Sketchfab to downloadable + CC0/CC BY; assume anything NC/Editorial is reference only.

### Gaps
- Could not verify Sketchfab models (author, license, tris) for Long Room, Admont, LoC, Peabody, Real Gabinete, Strahov, NYPL Rose. Dev should run Sketchfab search manually with license filter.
- Not checked: Europeana 3D, CyArk, Google Arts & Culture 3D, Matterport public tours (Matterport TOS generally bars extraction), Polycam/Luma/Scaniverse/KIRI/SuperSplat galleries for these libraries. Recall (unverified): Google Arts & Culture has Street View-style indoor imagery of several of these libraries but no downloadable geometry.

## 2. Capture/render approaches for web

### Takeaway
Best fit: hybrid. Hand-modeled modular shell with baked lightmaps (hero rooms, mobile-safe, full legal control) plus instanced procedural books and a small number of fully modeled "pull-out" books. Gaussian splats are viable as an optional "photoreal" layer for desktop, but mobile budget is ~200-500k splats / 15-30 MB, and splats cannot be relit or collide.

### Cited Findings
- Spark (World Labs): MIT, three.js renderer, supports PLY, SPZ, SPLAT, KSPLAT, SOG; latest v2.4.0 adds SPZ v4 reading and custom paged-LoD chunk fetchers; splats and meshes share one scene with correct sorting; WebGL2 only needed (98%+ coverage); npm `@sparkjsdev/spark` — [GitHub](https://github.com/sparkjsdev/spark), [RadianceFields on 2.4.0](https://radiancefields.com/spark-2.4.0-reads-spz-v4-files-and-opens-paged-lod-to-custom-fetchers)
- @mkkellogg/gaussian-splats-3d reported as no longer actively maintained; Spark recommended for production — [Utsubo guide](https://www.utsubo.com/blog/gaussian-splatting-guide) (secondary source)
- Compression vs PLY: SPLAT ~2x, KSPLAT ~3x, SPZ ~10x (Niantic), SOG ~15-20x (PlayCanvas) — [Utsubo](https://www.utsubo.com/blog/gaussian-splatting-guide) (secondary; treat as approximate)
- Splat budgets from same source: mobile 200-500K splats, 15-30 MB, 30-45 fps; laptop 500K-1M; desktop 1-2M — [Utsubo](https://www.utsubo.com/blog/gaussian-splatting-guide) (single secondary source; validate on device)
- World Labs Marble exports: SPZ/PLY at ~2M or ~500k splats; collider mesh GLB 100-200k tris; HQ mesh GLB 600k tris textured or 1M vertex-colored; pano 2560x1280; HQ mesh takes up to an hour, rate-limited 4/hr; OpenCV coordinate system (flip Y, Z for OpenGL) — [World Labs export specs](https://docs.worldlabs.ai/marble/export/specs)
- three.js WebGPU: production-ready since r171 (Nov 2024 per source), current r186 (Sept 2026); `WebGPURenderer` auto-falls back to WebGL2; Safari 26 (macOS/iOS/iPadOS) ships WebGPU; global ~87% support Aug 2026; Chrome Android 12+ since v121; Firefox 141 on Windows — [Utsubo migration guide](https://www.utsubo.com/blog/webgpu-threejs-migration-guide)
- Caveats from same guide: EffectComposer / pmndrs postprocessing do not run on WebGPURenderer (use TSL RenderPipeline); custom GLSL (ShaderMaterial, onBeforeCompile) unsupported on that renderer and needs TSL; drei Text breaks. Test the WebGL fallback on real devices. (Single secondary source, verify against three.js docs/migration notes.)
- InstancedMesh: one draw call for thousands of identical-geometry objects (source claims 10k trees 60fps vs 15fps mobile); BatchedMesh (r159+) merges different geometries sharing one material into one draw call; KTX2/Basis gives ~4-6x GPU memory reduction vs RGBA — [DigitalStrategyForce](https://digitalstrategyforce.com/journal/how-do-you-optimize-threejs-performance-for-mobile-devices/), [Hyperyond](https://hyperyond-website.pages.dev/blog/webgl-performance-optimization-2025) (low-quality blogs; claims are generic)
- Musée du Monde (World Labs showcase) uses three.js + Spark with portal transitions between splat worlds — [World Labs](https://www.worldlabs.ai/musee-du-monde)
- Splat quality caveat: a Blickling Hall 37.5 m long ceiling case study used 3DGS for a long baroque-ish interior — [Frontiers 2025](https://www.frontiersin.org/articles/10.3389/fcomp.2025.1515609/full)

### Inferences
- Book scaling: 100k+ books is a non-problem if spines come from a texture atlas (e.g. 2048x2048 KTX2, ~64-256 spine tiles with hue/height variation in shader/instance attributes) on a single InstancedMesh per shelf bay (box geometry with per-instance scale + atlas UV offset via InstancedBufferAttribute). Only the picked book swaps to a high-detail rigged book mesh. This is standard three.js practice; no source found that benchmarks it for this exact case.
- Prefer WebGL2 baseline with optional WebGPU; keep to built-in materials + baked lightmaps (avoids TSL port). Spark runs on WebGL2, so WebGPURenderer compatibility with Spark was NOT verified; check Spark docs/issues before choosing the WebGPU renderer.
- Long Room (65 m x 12 m, two galleries): modular bay kit (shelf bay, gallery rail, ladder, barrel vault ribs, bust plinths) repeated by instancing; bake AO/GI per bay type. Admont, Strahov, Peabody: same kit approach with different ornament textures/normal maps.
- 360 panoramas are good for transitions/loading previews and as lighting references (HDRI), but not walkable; the official tours above are reference only.

### Gaps
- No verified benchmark of real mobile frame rates for Spark on iPhone/Android in 2026; no verified file sizes for a typical library-interior splat beyond the generic ranges above.
- Meshopt/Draco numbers, LOD strategies (e.g. meshoptimizer simplify, three-mesh-bvh for collisions), lightmap tooling (Blender bake, xatlas) were not researched with sources.
- Luma web, Polycam, Scaniverse, KIRI, SuperSplat export/licensing specifics not verified.

## 3. AI-assisted generation (2026)

### Takeaway
Fine for props (lamps, globes, busts, scroll jars) as a starting point; poor for architectural interiors. Licenses vary: TRELLIS.2 is MIT, Tripo free tier outputs are CC BY 4.0, Meshy Free is personal/academic only, Hunyuan3D excludes EU/UK/South Korea. Marble worlds need Pro ($35/mo) for commercial use.

### Cited Findings
- TRELLIS.2 (Microsoft): MIT, fully commercial; Hunyuan3D: community license, free under 1M MAU, excludes EU, UK, South Korea; Tripo Free outputs CC BY 4.0 (commercial with attribution); Meshy Free: personal/academic only — [3D AI Studio state of AI 3D 2026](https://www.3daistudio.com/state-of-ai-3d-generation-2026), [free generators comparison](https://www.3daistudio.com/blog/best-free-ai-3d-model-generators-2026) (vendor blog, verify on each vendor's terms)
- Marble: commercial rights start on Pro at $35/month (Pro adds Expand, HQ mesh export, commercial rights); Max $95/month; API users must review output licensing terms — [Invideo summary](https://invideo.io/blog/world-labs-marble-3d-worlds/), [Rosebud](https://lab.rosebud.ai/blog/what-is-marble-world-labs), [RadianceFields launch](https://radiancefields.com/world-labs-formally-launches-marble-a-generative-world-model) (secondary; check worldlabs.ai terms). Export docs list no licensing statements — [export specs](https://docs.worldlabs.ai/marble/export/specs)
- Marble generates splats plus collider and visual meshes; usable in three.js via Spark — [World Labs docs](https://docs.worldlabs.ai/marble/export/gaussian-splat.md)

### Inferences
- Rodin/Hyper3D license and TRELLIS (v1) not verified. Hunyuan3D region exclusion matters if the developer or users are in the EU/UK.
- AI-generated "famous library" interiors risk reproducing a protected design or logos; for modern libraries still under copyright, AI output derived from photos of them is still a derivative.
- US copyright in purely AI-generated output is weak/uncertain (recall, unverified); do not rely on exclusivity of AI assets.

### Gaps
- Rodin/Hyper3D terms, Tripo/Meshy paid-tier terms, Marble ToS text not read directly. Quality of any of these on arched baroque halls not verified.

## 4. Legal

### Takeaway
Safest: pre-1900 buildings (author long dead; Long Room, Admont 1776, Strahov, Peabody 1878, Real Gabinete 1880s, LoC 1897, NYPL Rose Room 1911/restored 2018 with new elements) built as original reconstructions from photos, with no logos. Avoid Tianjin Binhai (MVRDV, 2017) and Seattle Central (OMA, 2004) unless license/permission is obtained. Not legal advice; get counsel before launch.

### Cited Findings
- US: AWCPA 1990 extended copyright to architectural works; 17 USC 120(a) lets anyone make pictures/pictorial representations of a building "located in or ordinarily visible from a public place" — [17 USC 120 (Justia)](https://law.justia.com/codes/us/2021/title-17/chapter-1/sec-120/). Commentary: the exception covers constructed exteriors and publicly accessible portions, and interior spaces not ordinarily visible from a public place are arguably outside it — [Columbia JLA article](https://journals.library.columbia.edu/index.php/lawandarts/article/view/12495); a Wikimedia summary lists US among countries allowing photos of publicly accessible interiors — [Commons FOP overview](https://commons.wikimedia.org/wiki/Freedom_of_panorama). Sources disagree; treat US interior coverage as unsettled. Also note 120(a) covers "pictorial representations", and whether an interactive 3D model qualifies is untested (see Inferences).
- Ireland: FOP covers buildings and sculptures "permanently situated in a public place"; interiors not specified — [Commons FOP Europe](https://commons.wikimedia.org/wiki/Commons:Freedom_of_panorama/Europe)
- Austria: Commons Europe page says exteriors only, interiors not covered — same source; a search-result summary claimed Austrian Supreme Court case law covers public interiors — [Commons Austria](https://blogs.ashmolean.org/commons.wikimedia.org/wiki/Commons_Copyright_rules_by_territory/Austria.html). CONFLICT, unresolved. Admont is 1776 so moot for the building, but ceiling frescoes (Bartolomeo Altomonte, d. 1783) and statues (Josef Stammel) are public domain too.
- Czechia: covers works "permanently located on a square, in a street, in a park, on a public route"; interior interpretation disputed, likely excluded; reproducing architecture "in the form of erecting a building" excluded — Commons FOP Europe.
- Portugal: works "intended to be located permanently in public places"; public place defined as place to which access is offered "even if the right of admission is reserved," read by scholars to include public interiors — Commons FOP Europe; [IPKat on Portugal](https://ipkitten.blogspot.com/2017/08/freedom-of-panorama-in-portugal-content.html)
- UK: buildings and sculptures/models/artistic craftsmanship "permanently situated in a public place or in premises open to the public" (covers interiors open to public) — Commons FOP Europe
- Switzerland: FOP "does not apply to works located in interior spaces"; church interiors unsettled — Commons FOP Europe
- Spain: works "permanently located in parks, streets, squares or other public thoroughfares"; courts restricted commercial use where work is extracted from surroundings (Toro de Osborne) — Commons FOP Europe
- China: summary says photography of 3D works in outdoor public places allowed — [Commons FOP overview](https://commons.wikimedia.org/wiki/Freedom_of_panorama) (interiors not covered per brief; not confirmed in my sources)
- Brazil: FOP exists in national law — Commons FOP overview (interior scope not verified)
- Tianjin Binhai Library (MVRDV, opened Oct 2017) and Seattle Central (OMA/Koolhaas, opened 2004): both modern and under copyright; photos of Binhai are credited to MVRDV and Ossip van Duivenbode — [Archeyes](https://archeyes.com/the-tianjin-binhai-library-by-mvrdv-fusing-culture-architecture/); [Wikipedia-like info via Designing Buildings](https://www.designingbuildings.co.uk/wiki/Tianjin_Binhai_Library)
- Wikimedia Commons policy: where no FOP, needs copyright holder release for photos of buildings — Commons FOP overview.

### Inferences
- Copyright duration in EU/UK is life + 70, so a building by an architect who died before ~1955 is public domain; all primary target libraries likely clear this (not verified architect by architect). Restorations/new additions (e.g. NYPL Rose Main Reading Room restoration 2018, Long Room barrel vault is 1860s, Trinity 2023 Brian Boru harp etc.) could add protected elements; modern furniture, murals and art installations in the rooms may be separately protected.
- Safer than FOP reliance: build from public domain sources and from the physical building's expired-copyright design, not from copyrighted photos. Photos taken by others are copyrighted (even if the building is PD); use own photos, Commons CC0/PD-marked images, or pre-1900 engravings.
- Institution rules: libraries often restrict commercial photography of interiors (contractual, separate from copyright); trademark: avoid official logos, use descriptive names ("Long Room-inspired") plus a "not affiliated" disclaimer. Not sourced here; confirm with each institution.
- Pull-out books: use public-domain texts (Gutenberg/Internet Archive/Wikisource) and PD scans of Book of Kells-style manuscripts only after checking holder terms; Trinity's Book of Kells digital images are under institutional terms (recall, unverified).

### Gaps
- No sourced text on trademarks of library names/logos, institutional photography/commercial-use policies (TCD, LoC, NYPL, Strahov, Admont), or typical disclaimers used by similar projects. No source found on whether an interactive 3D replica counts as a "pictorial representation" under 120(a). Austria interior conflict unresolved; China, Brazil interior scope unverified.

## 5. Comparable products and inspiration

### Takeaway
Official tours are mostly 360 panoramas with no book interaction; the genre leader for playable history is Assassin's Creed Discovery Tour; web-splat showcases (Musée du Monde, Mouthful of Dust) prove the tech. The open niche is a walkable, multi-library, book-reading experience, with page-turn interaction.

### Cited Findings
- Discovery Tour: Ancient Egypt (2018, AC Origins) is a guided educational no-combat mode curated by historians, free to Origins owners (v1.3.0 patch) or standalone £15.99 launch; includes the Library of Alexandria modeled after the Library of Celsus — [Ubisoft](https://news.ubisoft.com/en-us/article/13sXevEgX278m7jxcX5uhM/assassins-creed-origins-discovery-tour-shows-a-different-side-of-ancient-egypt), [AC wiki](https://assassinscreedwiki.accesstheanimus.com/wiki/Library_of_Alexandria)
- Mouthful of Dust (State Library Victoria): three.js experience with Gaussian splat reading room — [forum post](https://discourse.threejs.org/t/mouthful-of-dust-a-ned-kelly-web-experience/85925)
- Musée du Monde (World Labs): three.js + Spark portal walkthrough of splat worlds from paintings — [World Labs](https://www.worldlabs.ai/musee-du-monde)
- Official tours: TCD Library 360 — [tcd.ie](https://tcd.ie/library/using-library/360.php); LoC virtual views — [loc.gov](https://www.loc.gov/visit/maps-and-floor-plans/reading-rooms-and-research-centers/main-reading-room/); library virtual tour roundups — [ilovelibraries](https://ilovelibraries.org/?p=3940)
- Three.js showcase roundups: [Utsubo best three.js sites 2026](https://www.utsubo.com/blog/best-threejs-websites-2026); Awwwards SOTD 2026 examples seen: Hubtown (June 2026), Primland (Feb 2026) — via search results; three.js forum: "davesocozy" portfolio as walkable 3D house [link](https://discourse.threejs.org/t/davesocozy-my-art-portfolio-and-print-shop-as-a-3d-house-you-walk-through/95566.md), interior virtual tour demo [link](https://discourse.threejs.org/t/interior-virtual-tour-demo-with-bananas/80292.md)

### Inferences
- Differentiators: (1) many libraries in one place with a shared "pull a book" interaction; (2) mobile-first touch walking; (3) lost libraries (Alexandria) as reconstructions with scholarly notes; (4) real readable public-domain books.
- Library of Babel (Borges / libraryofbabel.info), MengTo/threeui showcases, VR apps (e.g. Meta Quest titles), Google Arts & Culture library stories: mentioned in brief but NOT researched or verified here.

### Gaps
- Did not verify Bodleian/Admont official tours, Awwwards/FWA library interior winners, viral 2025-26 AI-built three.js worlds, VR apps, or MengTo/threeui content. Mouthful of Dust technical details (splat size, mobile) were not disclosed.

## 6. Recommended MVP (my judgment; sources are in sections above)

### Takeaway
Build 4: (1) Trinity Long Room, (2) Admont Abbey, (3) Library of Alexandria (original reconstruction), (4) Strahov Theological Hall or Real Gabinete Portugues. Add LoC/NYPL later.

### Cited Findings
- Reference for the tech stack: three.js r186 with WebGPURenderer-or-WebGL2 fallback, Spark 2.4.0 for optional splat layers, KTX2 textures — sources in section 2.

### Inferences
- Why these: Long Room and Admont have the strongest visual impact, pre-1800 architecture (no copyright on the building), and distinctive repeatable bay geometry that suits a modular kit; Alexandria is legally the safest (no ground truth, invented design) and has the brand pull; Strahov/Real Gabinete add variety (Rococo/Baroque painted vs Neo-Manueline). LoC/NYPL are US, 1897/1911, public domain by age but the rooms contain modern fittings and the institutions are protective of branding; defer. Skip Binhai/Seattle for copyright.
- Architecture sketch: Vite + TypeScript + three.js; per-library scene = glTF (Meshopt + KTX2) of bay kit + baked lightmaps; books = one InstancedMesh per shelf bay with spine atlas (procedural color/height/title from seeded RNG); ray-pick instance id, swap in a hero book (rigged/skinned page-flip with ~20-40 page planes, or curl shader), text from PD sources via on-demand JSON/EPUB chunks; nipplejs-style touch joystick + pointer lock desktop; capsule collision against simplified collider mesh (three-mesh-bvh); optional Spark splat "photoreal mode" for desktop only (cap ~500k splats mobile); lazy-load per room; target <15 MB initial per room on mobile.
- Priority risk: Austria interior and institutional photo rules; resolve with counsel and by building from own/PD references.

### Gaps
- No cost/time estimates, no user research. Mobile benchmark of instanced books + lightmapped interior not verified.
