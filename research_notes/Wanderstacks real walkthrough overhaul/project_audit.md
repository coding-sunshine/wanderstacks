# Wanderstacks project audit (local state, branch cinematic-site, Nov 2026)

Method: local only. Sources are file paths, jq/rg/wc output, and screenshots from a vite dev server (port 5199) driven by agent-browser. Screenshots: /private/tmp/claude-501/-Users-hardik-Code-Personal-worldlibs/8614fc0b-ae39-42a9-abbd-5b2cee3fb4ef/scratchpad/ (home1.png, homefull.png, home_celsus.png, room_long.png, room_celsus.png, p_room_admont.png, p_place_admont.png, p_shelf.png, p_read_alice.png, p_ledger_alexandria.png, p_atlas_baghdad.png). Not run: `bun test src`, `tsc --noEmit`, e2e.

## 1. Stack, build, routing, page inventory

### Takeaway
Static Vite/TS SPA with a hand-rolled regex router. Seven distinct page types exist, but the 3D room (`/room/:lib`) is linked from nowhere in `src/`, so the headline feature is only reachable by typing a URL.

### Cited Findings
- Stack: Vite 8.3.6, TypeScript 7, three 0.187, page-flip 2.0.7, bun build scripts, Playwright e2e, Cloudflare Pages target (`data/planning-gaps.json`) — package.json
- Scripts: `data` = `bun scripts/build/index.ts`; `dev` = data + vite; `build` = data + vite build + copy docs/plan.html; `test` = `bun test src`.
- Data build steps (scripts/build/steps): 10-lib, 11-about, 15-ledger, 20-books, 25-scan, 30-globe. Output "52 pins, 22 with books, 230 catalog entries". `bun run data` ran clean, no tracked diffs.
- Router in src/main.ts, lazy `import()` + view transitions. `/` and `/atlas[/lib]` -> src/cinematic; `/room/:lib` -> room; `/read/:book` -> reader; also `/byrne /shelf /book /babel /ledger/:lib /place/:lib /stgall /darwin /scan/:book`.
- `rg '/room/' src` hits only the route in main.ts. No link to the 3D room anywhere.
- Home "Step inside / Step outside" (src/cinematic/index.ts ~L103) toggle photographs, not the 3D room.
- `src/room/place.ts` `firstPlace`/`remember` read `history.state.arrive`; nothing sets "outside", so `src/room/outside.ts` (rounded box + Poly Haven textures) is effectively unreachable.
- src is ~7,074 lines. Largest: room/index.ts 564, room/kits/hall.ts 404, reader/index.ts 355, cinematic/index.ts 283, room/spines.ts 280, scan/index.ts 273, room/kits/rotunda.ts 234, cinematic/atlas.ts 226. No giant file; sizes are fine.
- Stubs: src/stgall/index.ts and src/darwin/index.ts are 5 lines each; src/byrne/index.ts 25 lines. Routes exist for pages with no content.
- Search: src/palette.ts (Cmd+K) fetches /lib/catalog.json (230 entries: 135 book, 32 card, 52 room, 11 scan), substring rank on title+sub only, cap 12. src/shelf/index.ts is a substring filter over one flat list.

### Inferences
- Last rebuild (commit cf49945 "cinematic cut") moved the front door to photographs and orphaned the 3D work from earlier phases. Inferred from git log plus the missing links.
- Router is fine for size; not the problem.

### Gaps
- Did not run typecheck, unit tests, or e2e. Did not inspect /babel or /book pages visually.

## 2. How exterior and interior views are produced (real vs procedural)

### Takeaway
Visitors see real Wikimedia Commons stills outside and a photo slideshow "inside"; the procedural 3D rooms exist for 27 libraries but are hidden and look fake. Only 4 libraries have any exterior model data, and one of those is a placeholder box.

### Cited Findings
- data/photos.json: 51 of 52 libraries have photos (baghdad none). 95 outside + 157 inside photos total, webp at 960/1920 px, with credits. No panoramas/360 anywhere (rg for panorama terms found only sunlight/daylight code).
- 0 outside photos: loc, prunksaal, escorial, melk, nineveh, binhai. 0 inside photos: alexandria, dunhuang, khudabakhsh, mcmillan.
- data/hall/*.json: 27 files; data/tour/*.json: 27 files with 3-5 stops each (15 x3, 10 x4, 2 x5). 25 libraries have no hall: alexandria, ottawa, nineveh, pergamon, herculaneum, nalanda, dunhuang, buda, timbuktu, vikramashila, thanjavur, khudabakhsh, nli, asiatic, connemara, sassoon, alexandrina, baghdad, vasconcelos, slv, tianyige, binhai, haeinsa, ashikaga, mcmillan.
- Hall dimension "basis" tally: photo-estimate 278, measured 43, invented 36, excavated 5, attested 1. "Invented" values say "no source yet; ... is design fill" (bay count, pier width, lantern radius, drum wall height, cornice height). So 278 of 363 dimensions are eyeballed from photos.
- data/exterior.json: 4 libraries only (admont, loc, longroom, strahov). Admont is "Estimated massing" box w72 d17 h20.
- Kit labels in libs.json "k": hall 34, site 11, rotunda 3, dome 2, atrium 2. Kits in src/room/kits: hall, rotunda, site.
- public/rooms: only admont, celsus, loc, longroom, strahov have room assets (SVG impostors, stone SVG, tex/); loc folder empty.
- Screenshot /room/longroom: plausible but dim and flat; tiled herringbone floor, repeated spine textures; console repeats "THREE.WebGLRenderer: Texture marked for update but no image data found."; side panel first story entry is a placeholder (".").
- Screenshot /room/admont: brown wood barrel vault, white blob windows, checkerboard floor. Real hall is white/gold with frescoes. Clearly fake.
- Home: clicking a library shows a real Commons photo; Celsus facade photo is good. "Step inside" for Celsus shows another facade shot ("Columns and entablature ... from below") labeled as interior although the interior is lost.
- /atlas/baghdad (no photos): globe plus "Fate: Lost 1258" and "Read the record" only.

### Inferences
- Every one of the 27 procedural rooms is one of three generic kits parameterised by mostly estimated numbers; none can match a real place's character (frescoes, colour, ornament). This is structural, not a tuning problem.
- The honest fixes: use real photos/video for the "inside" of extant libraries and a clearly-labelled reconstruction for lost ones, rather than keep the generic kit as the visitor's default.

### Gaps
- Did not measure photo licence completeness or per-image quality. Did not test the Tour button inside /room. Did not check mobile.

## 3. Data depth per library and per book; search

### Takeaway
Wide but thin. 52 libraries and 202 book records, but only 17 readable texts attach to a library, 15 libraries have zero facts, a ledger exists for one library, and there is no full-text search.

### Cited Findings
- data/libs.json: 52 libraries. Tiers: w2 22, later 14, lost 10, mvp 6. Evidence: known 44, probable 7, speculative 1. Phase: later 26, C 15, B 5, E 5, A 1.
- data/books.json: 202 records. readable-text 135, catalog 50, readable-scan 11, ghost 6. 118 of 135 readable texts have lib null (generic Gutenberg classics: Alice, Anna Karenina, Don Quixote...). Only 17 attach to a library, covering 5 libraries; only 9 libraries have any readable text or scan.
- 7 catalog records have status "failing"; the gutenberg-loc record notes "Manifest URL is a pattern guess".
- data/facts.json: 269 facts over 37 lib keys (9 null), plus 58 events and 68 corrections. Status passing 241, failing 28. Tier primary 138, secondary 47, wikipedia 84. Fields: dims 61, recon 46, built 41, status_note 37, volumes 28, architect 25, collection 21, remains_today 9.
- 15-16 libraries with no facts: alexandrina, ashikaga, asiatic, baghdad, binhai, connemara, haeinsa, khudabakhsh, mcmillan, nli, sassoon, slv, thanjavur, tianyige, vasconcelos, vikramashila. Only 3 facts: hereford, joanina, malatestiana, morgan, palafoxiana, stegen.
- data/ledger/ has one file (alexandria.json, 220 bytes). data/hours.json is `{}`.
- /place/admont screenshot: 11 facts incl. near-duplicate "Size" rows (70 m, 14 m, 11 m repeated); shows dev note "Shares the hall bay kit with the Long Room" and "On its shelves: No single title confirmed yet".
- public/lib/about/ has 52 pages; per-library JSON for 27.
- Verification artefacts: data/verify/ (32 files + BRIEF.md); ver.json (untracked) counts rows 634, pass 530, books 202, libs 30 — i.e. verification covers 30 of 52 libraries.
- Naming drift: "stgallen" vs "stegen"; module `stgall`; "bpl" vs "peabody".

### Inferences
- The "research is thin" complaint is accurate for ~40% of libraries (no facts, no hall, no books). Book side is mostly unrelated public-domain novels padding the count.
- Internal dev notes leaking to public pages shows no editorial pass between data and display.

### Gaps
- Did not verify the truth of any fact against outside sources (local-only brief). Did not check duplicate-fact count exactly beyond the admont example.

## 4. What is messy

### Takeaway
Repo is heavy with binary assets (about 260 MB tracked) and carries leftover phase/planning files and one-off scripts, but the src code itself is reasonably sized.

### Cited Findings
- 1820 tracked files, 92 commits. public/book 1008 files (126 MB), public/photo 504 files (136 MB), data/verify 32, data/tour 27, data/hall 27, src/room 24, scripts/mapgen 14, public/rooms 11 (5 MB).
- Leftover: data/phase-a..d.json (5-26 KB, frozen criteria), data/planning-gaps.json (13 KB), data/prior-art.json (13 KB), scripts/mapgen/ver.json (older copy, rows 577), root ver.json (untracked), scripts/mapgen with its own node_modules and many one-off .mjs files plus plan.template.html.
- Orphaned code: src/room/outside.ts, room tours, stub modules (stgall, darwin, byrne), public/rooms assets for loc (empty).
- git status: untracked `research_notes/Wanderstacks real walkthrough overhaul/` and `ver.json` only.

### Inferences
- Binary weight (books + photos) in git will make clones slow and blocks Cloudflare Pages' 20,000-file / 25 MiB limits only if growth continues; not verified against current limits (outside brief).
- A cleanup candidate list: ver.json copies, phase files (archive), mapgen scripts, unused room assets.

### Gaps
- No dead-export analysis run (no knip/ts-prune). Test and typecheck status unknown.

## 5. Running site: what feels fake or broken

### Takeaway
Home looks cinematic but is information-heavy and empty of place imagery until a click; the rest of the site drops to plain text pages; the one 3D room that is supposed to deliver "being there" is hidden and unconvincing.

### Cited Findings
- Home 1440x900: night-Earth globe clipped on the right, big left glass panel (title "Libraries of the world", "2026 CE" counter, "41 standing · 10 lost (7 rediscovered) · 1 fate unknown", evidence chips, scrolling list ordered by founding date, year slider -668 to 2026). No library imagery until a click. Page height 2445 px.
- Below globe: "To scale." SVG with five empty outline rectangles (Long Room, Admont, Strahov, LoC, Celsus), credits, nav pills (Atlas, Shelf, Babel, Search).
- /shelf: flat reading list of 135 with filter box. /read/alice: working page-flip book. /ledger/alexandria: text only; only Alexandria has one.
- Direct visit to a library with no photos renders nearly empty (see baghdad).

### Inferences
- The user's dislike of the home is consistent with: heavy UI panel obscuring a clipped globe, a list-as-landing, and no single image-led first impression. Judgement, not measured.
- The "To scale" empty rectangles read as unfinished.

### Gaps
- No timing/performance numbers (LCP, bytes). No mobile screenshots. Did not screenshot /babel or /book.

## 6. The five earlier reports vs the code

### Takeaway
Little of the reports' core "world" recommendations are in the code: the globe and photo-led home landed; baked light, plate chapters, book-as-navigation, sun/weather and exterior-first walkabout did not. Hall data with provenance tags partly implements the "accuracy layer".

### Cited Findings
Report files in reports/ (word counts: Award grade 4385, Cinematic UI 2544, Libraries and books 4919, Realistic dynamic worlds 3461, Realtime walkable 2400).

- Award grade redesign (plates + book as spine, five acts, title-in-depth with foreground matte, certainty tiers rendered as photo/ghost/clay, Cormorant/Cinzel/Spectral/Hanken fonts, one control strip, 5 bespoke rooms):
  - Implemented: globe act exists; DOM page-flip reader exists; real photographs lead a library view (cinematic); evidence chips on home.
  - Not implemented: book as the navigation object; title-in-depth/matte layers; ghost/clay rendering of conjecture; five-act scroll chapters; paradata drawer. Fonts differ (package uses EB Garamond, Libre Caslon, IBM Plex Mono).
- Cinematic UI rebuild (real-time three.js with baked light, AgX/Neutral tone mapping, small post stack, opt-in sound, vanishing UI):
  - Implemented: procedural film-grain canvas in src/main.ts; Poly Haven PBR textures in rooms.
  - Not implemented / no evidence: baked lightmaps (rooms look flat/dim); opt-in sound (not checked in code); KTX2. Tone mapper not checked.
- Realistic dynamic worlds (NASA-texture globe, seeded parametric halls, lightmaps, quote-to-parameters, AI at build time only, Living Pages with predict/reveal/stamp, Long Room vault slider):
  - Implemented: custom three.js night-side globe with time slider; parametric hall/rotunda/site kits; basis tags (measured/photo-estimate/invented) on hall dimensions approximate the quote-to-parameters idea; facts.json has status/tier per claim.
  - Not implemented / unverified: baked day/candle lightmaps; Living Pages are stubs (stgall, darwin 5 lines each; byrne 25); vault-phase slider not found; poster-first LCP not checked.
- Realtime walkable visits (exterior forecourt, van Wijk fly-in, SunCalc sun, Open-Meteo via Worker, splats, tap-to-glide, curated pullable books):
  - Implemented: src/room/outside.ts exists but is unreachable; no splats.
  - Not found: SunCalc or weather Worker (not searched exhaustively), forecourt walking, fly-in transition into rooms, pullable books/2D index.
- Libraries and books (tiers 1-3, MVP of 5 rooms + 20-30 title shelf, lost-library handling, signature books):
  - Scope went the other way: all 52 libraries listed (vs 5-room MVP), 135 readable titles (vs 20-30), mostly unrelated Gutenberg classics. Tiering exists (libs.json tier w2/later/lost/mvp).
  - Some report claims have no code test (e.g. Bodleian First Folio scan) — not checked.

### Inferences
- The project followed breadth (52 libs, 135 books) against the reports' repeated advice to go deep on five rooms first. Largest recommendation miss.
- Where the reports were possibly wrong: "baked light solves realism" has not been proven here, and the reports admit it rests on one demo and one tutorial; this repo's lighting problem may be geometry/material fidelity rather than baking.

### Gaps
- I read headings plus recommendation sections of each report, not every paragraph. Did not grep the codebase exhaustively for sun/weather/sound code. Report claims about external facts (licences, prices) were not checked, by design.
