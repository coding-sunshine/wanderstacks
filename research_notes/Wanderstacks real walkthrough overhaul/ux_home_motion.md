# Wanderstacks redesign: interface, information architecture, home page and motion

Method note: about 15 tool calls (live-status curl sweep of 35 URLs on 10 Nov 2026, 9 fetches, 8 searches). Earlier notes read first (heads only: award_site_teardown.md, cinematic_ui_language.md, motion_title_language.md headings). Many claims below are tagged [UNVERIFIED] where I could not open a primary source; the report writer should not promote those. I did not open most reference sites in a browser, so "what works" for them is limited to what fetches/search returned plus my own labelled inference.

## 0. Where the earlier notes may have led the design astray

### Takeaway
The two earlier note sets optimised for award-site gloss (WebGL scroll films, film-title UI, letterbox, chapter cards) and said almost nothing about reference function (list, search, books), which is the owner's second requirement. Following them plausibly produced a cinematic home that hides content and a messy site with no clear IA.

### Cited Findings
- The award teardown's exemplars are all single-purpose showpieces (Igloo Inc, Bruno Simon portfolio, Immersive Garden, Cartier Watches & Wonders, Oryzo, IVRESS), with stack lists but no catalogue/search patterns; the note itself admits it could not inspect live sites, and had no measured load weights. — [award_site_teardown.md](research_notes/Award grade cinematic Wanderstacks redesign/award_site_teardown.md)
- The UI-language note's film-grammar toolkit (title card, lower-third, subtitle-narration, chapter card per library, transient letterbox) is labelled [UNVERIFIED, from experience] by its own author. — [cinematic_ui_language.md](research_notes/Cinematic UI rebuild for Wanderstacks/cinematic_ui_language.md)
- The note's own best sourced exemplar says the opposite of "more chrome": Rijksmuseum's Vermeer site has UI that "quickly fades into the background", lets you arrange a grid of all 37 paintings, and had a 12-minute average session. — [Q42](https://q42.nl/en/work/johannes-vermeer)
- Motion note recommends heavy long hero moments and Lenis/GSAP scroll choreography; NN/g found most participants "at least mildly disoriented" by scrolljacking, task-oriented users far less patient, mobile worse. — [NN/g Scrolljacking 101, Aug 2023](https://www.nngroup.com/articles/scrolljacking-101/)

### Inferences
- Likely failure modes of following the old notes: (1) home is a film, not a door; (2) every library gets cinematic chrome, so nothing is consistent or scannable; (3) no catalogue layer (A-Z list, filters, book search) because award sites have none; (4) 3D/WebGL ambition spent where plain editorial type and photographs would carry more place feeling.
- Reorder priorities: reference spine first (fast, text-forward, searchable), immersion second (entered on purpose, inside a library), film third (optional, 60-90 s, never gating).

### Gaps
- I did not see the current Wanderstacks build, so which specific instructions caused the mess is inferred, not observed.

## 1. Reference sites to open (URL, what works, what to borrow)

### Takeaway
The sites that combine place and dense reference all put search and "browse by" facets in the first screen, keep immersive pieces as destinations linked from catalogue pages, and let imagery rather than chrome carry mood. Live status below is HTTP status from curl on 10 Nov 2026 (403/429 = bot block, not dead).

### Cited Findings
- **Google Arts & Culture** — https://artsandculture.google.com (200). Header: Home, Explore, Play, Nearby, Profile, The Lab. First screen is a search bar ("What are you looking for?") plus a "Click for a surprise" button. Browse axes: Artists, Mediums, Art movements, Historical events, Historical figures, Places; Collections, Themes, Museums. Borrow: search-first plus one serendipity button, and a Places axis. — [fetched homepage](https://artsandculture.google.com)
- **Rijksmuseum** — https://www.rijksmuseum.nl/en (200). Nav: Visit and tickets, Collection, Stories, prominent search. Hero is a tagline over art, then four link cards. Borrow: three-word top nav (Collection / Stories / Visit) and "Stories" as the editorial layer over the catalogue. — [fetched homepage](https://www.rijksmuseum.nl/en)
- **Rijksmuseum "Closer to Johannes Vermeer"** (Q42/Fabrique, 2023). Original subdomain closer-to-vermeer.rijksmuseum.nl did not resolve (000) on 10 Nov 2026; use the case study. Grid of all 37 paintings, deep zoom, narrated tours, mobile-optimised, two Webbys. Borrow: an overview grid of every item, then zoom/narrate. — [Q42 case](https://q42.nl/en/work/johannes-vermeer) (live per earlier note; not re-fetched)
- **Vatican Sistine Chapel virtual tour** — https://www.vatican.va/various/cappelle/sistina_vr/index.html (200). Not opened; [UNVERIFIED] that it is the classic panorama-with-hotspots tour. Borrow only after inspection.
- **Louvre** — https://www.louvre.fr/en (200), **Mauritshuis** https://www.mauritshuis.nl/en/ (403 to bot, not inspected), **Atlas Obscura** https://www.atlasobscura.com (403, not inspected), **Europeana** https://www.europeana.eu/en (403, not inspected), **NYT visual stories** (403), **Reuters graphics** https://graphics.reuters.com (200, not inspected). Listed so the designer can open them; I have no verified claims about their patterns.
- **Getty "Sculpting Harmony"** (Resn): scroll drives an aerial camera over the building, type as designed object, editorial brief for scholarly audience; Awwwards SOTM Nov 2023. Borrow: scroll-driven camera for ONE story page, not the site. — [Awwwards](https://www.awwwards.com/sculpting-harmony-wins-site-of-the-month-november-2023.html)
- **Museum site roundup 2026** (Numiko): National Gallery hides its menu so imagery dominates; Van Gogh Museum sideways-scrolling home; Nordiska Museet per-exhibition palettes. Borrow: per-library colour palette on library pages. — [Numiko](https://numiko.com/insights/best-museum-and-gallery-websites-2026)
- Library digital collections, live: British Library https://www.bl.uk (200), Bodleian Digital https://digital.bodleian.ox.ac.uk (200), e-codices https://www.e-codices.unifr.ch/en (200), Gallica (403 to bot). Use as the model for book pages (metadata + viewer), not for look. Not opened.
- Awwwards history list https://www.awwwards.com/websites/history/ (200) and FWA https://www.thefwa.com (200) are live for browsing 2024-26 culture/heritage winners; I did not extract specific winners from them. Known 2026 winners from earlier note via Utsubo: Cartier Watches & Wonders (six 3D alcoves, scroll room transitions), Explore Primland (aerial flythrough). — [Utsubo roundup](https://www.utsubo.com/blog/best-threejs-websites-2026)
- Apple Maps Look Around: no source gathered. Gap.

### Inferences
- Pattern across the verified ones: top nav is 3-5 nouns, search is always visible, the catalogue is a first-class section, and "stories/tours" are curated layers on top. Wanderstacks equivalent: Libraries / Books / Visit (walk-throughs) / Stories, plus search.

### Gaps
- Louvre, Mauritshuis, Sistine tour, Atlas Obscura, Europeana, Reuters, NYT, Look Around not analysed (blocked or unfetched). Awwwards/FWA 2024-26 heritage winners not enumerated.

## 2. Home page: first-screen patterns and the scroll-film evidence

### Takeaway
Recommended concept: a quiet, fast, search-first "doorway" (full-bleed real photograph of one library chosen daily or randomly, large search field, three entry paths: Globe, A-Z list, Surprise me), with any cinematic film as an optional 60-90 s "Watch the film" button, not the page. NN/g evidence says scrolljacking disorients most users and punishes task-oriented ones.

### Cited Findings
- NN/g usability test: "The majority of our study participants were at least mildly disoriented by scrolljacking"; task-oriented users had less patience than exploratory; mobile much worse; text plus altered scroll rate worst. Better: shorter scrolljacks with functional value, faster scroll rate, sticky nav as "escape hatch", normal-scroll sections mixed in. Practices: only for valuable progressive disclosure, avoid direction change, limit text, skip on mobile, reserve for below the fold. NN/g bottom line: "more user pain than benefits". — [NN/g, 6 Aug 2023](https://www.nngroup.com/articles/scrolljacking-101/)
- Google Arts & Culture pairs search with a randomiser on its first screen. — [homepage](https://artsandculture.google.com)
- Rijksmuseum home leads with identity tagline, practical info, search and Collection link. — [homepage](https://www.rijksmuseum.nl/en)
- Secondary/low-quality claims (not to be relied on): "68% of mobile users found autoplay video annoying and left" attributed to NN/g by a vendor blog; I could not find the NN/g original. — [pixeledeggs, unverified](https://pixeledeggs.com/sustainable-website-tips-get-rid-of-autoplaying-videos)
- Rijksmuseum Vermeer 12-minute average dwell shows immersive pieces can hold attention when they are chosen destinations. — [Q42](https://q42.nl/en/work/johannes-vermeer)

### Inferences
- Pattern ranking for a first screen that leads into 52 places: (1) search + featured place photo + 3 paths (best fit); (2) index grid of 52 thumbnails (best for scanning, weak mood); (3) globe as one of the paths, not the hero (globe is slow to read, hard on mobile); (4) film as opt-in; (5) daily featured place as the photo choice (cheap, gives return visits, gives "visiting a real place" feel on arrival).
- Suggested sequence on home, one page, normal scrolling: hero doorway; "Today at ..." featured library with 4-6 photographs and a one-line story; a horizontal shelf of libraries by region; a shelf of books ("Open on the table today"); "Browse by" row (region, era, type, language of holdings); footer. No scroll pinning.
- Hard rule candidate: never pin or scrub on the first two viewport heights; any scroll-scene lives on a library's story page and has a visible Skip/Index control.

### Gaps
- No hard bounce-rate dataset for cinematic intros versus index homes found. The only quantitative claims are secondary and flagged. Awwwards judging does not publish bounce data.

## 3. Globe and map for 52 points

### Takeaway
Use MapLibre GL JS with globe projection and a flat-map fallback, with a synchronised list beside the map; at 52 points clustering is optional (labels and a region filter do more). Keep keyboard and screen-reader access via the list, which is the accessible equivalent of the map.

### Cited Findings
- MapLibre supports globe projection via `map.setProjection({ type: 'globe' })` and GeoJSON source clustering (`cluster: true`, `clusterRadius` default 50, `clusterMaxZoom`), combinable in v5. — [MapLibre cluster example](https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/); [shkspr.mobi clustered globe with OpenFreeMap](https://shkspr.mobi/blog/2025/01/minimum-viable-clustered-marker-globe-using-openfreemap-and-maplibre-gl/). The globe example URL I tried (maplibre.org/.../examples/globe/) returned 404 on 10 Nov 2026; search the examples index instead.
- Live library sites: globe.gl https://globe.gl (200), three-globe https://github.com/vasturiano/three-globe (200), deck.gl https://deck.gl (200), Cesium https://cesium.com (200). I did not read their docs.
- OpenFreeMap tiles (free, no key) used in the shkspr example. — [shkspr.mobi](https://shkspr.mobi/blog/2025/01/minimum-viable-clustered-marker-globe-using-openfreemap-and-maplibre-gl/)

### Inferences
- [UNVERIFIED, my experience] Library choice for one developer: MapLibre globe (real tiles, zoom to street, free) if the globe must be a real map; globe.gl/three-globe if it must look stylised and fit with three.js; Cesium and deck.gl are overkill for 52 points.
- Design rules: list beside/below map (not hidden), hover/focus on a list row highlights the pin and vice versa, region chips pan the camera, a "flat map" toggle, no auto-rotate after first interaction, pins sized for 24 px minimum target (WCAG 2.5.8), arrow-key navigation within the list, click on pin opens a card with photo + "Enter library" + "Open page".
- Mobile: globe as a full-screen sheet with the list as a bottom drawer; avoid two-finger conflicts with page scroll (keep the map non-capturing until tapped).

### Gaps
- No tested figures for globe frame rate on mid phones; no verified comparison of the five libraries' bundle sizes.

## 4. Wayfinding in 360 and 3D interiors

### Takeaway
Evidence I found is thin; the supportable guidance is: floor plan/minimap plus hotspots are the standard orientation tools, offer guided path and free roam together, and use short fades rather than long camera flights for comfort.

### Cited Findings
- Virtual tour platforms commonly use interactive hotspots (info, media, navigation), floor plans, and minimaps with real-time location indicators. — search summary of [panoraven](https://panoraven.com/blog/en/360-virtual-tour/amp/) and others; weak commercial source
- Academic work proposes design guidelines for 360-degree video virtual tours and notes motion-sickness effects in headsets; I did not open the guidelines. — [Haifa: Virtual Tourism: Towards Better User Experience in Online Virtual Tours](https://cris.haifa.ac.il/en/publications/virtual-tourism-towards-better-user-experience-in-online-virtual-/); [Springer 10.1007/s00779-020-01373-8](https://link.springer.com/article/10.1007/s00779-020-01373-8)
- Photo Sphere Viewer (MIT licence): equirectangular and cubemap panoramas, 360 video, gyroscope/touch input, marker system for text/image/video overlays, plugin architecture. https://photo-sphere-viewer.js.org (200). — [fetched](https://photo-sphere-viewer.js.org). Pannellum https://pannellum.org also live (200), not read.
- Earlier Wanderstacks notes already hold navigation research; see [navigation_books_ux.md](research_notes/Wanderstacks realtime walkable library visits/navigation_books_ux.md) (not re-read here).

### Inferences
- Concrete pattern: room-to-room "node" navigation (photographic stops, Photo Sphere Viewer virtual-tour style) with a mini floor plan, "Next stop" guided arrow and a list of stops; captions bound to the current stop and to hotspot focus; gyroscope off until the user taps "Use device motion"; reduced-motion: crossfade only, no camera glide, no auto-rotate, narration by text.
- Comfort: avoid camera acceleration, avoid FOV zoom-on-transition, keep horizon level, give a fixed visual anchor (plan + caption). [UNVERIFIED as numeric thresholds.]

### Gaps
- No source on audio best practice, nor on gyroscope permission (iOS requires explicit permission via DeviceOrientationEvent.requestPermission, from my memory, unverified here). No source gathered for Apple Look Around or Matterport.

## 5. Motion: tools and support (state at Nov 2026)

### Takeaway
Browser support is now good enough to use native features: CSS scroll-driven animations are Baseline Newly available (Firefox 159, Oct 2026). Cross-document view transitions work in Chrome/Edge 126+ and Safari 18.2+, but Firefox still lacks them (Interop 2026 target). GSAP is free. Use motion for orientation and continuity, not spectacle.

### Cited Findings
- Scroll-driven animations: Firefox 159 enabled by default, joining Chrome (115+) and Safari (26+), now Baseline Newly available (Oct 2026). — [web.dev Oct 2026](https://web.dev/blog/web-platform-10-2026); [search summary](https://www.buildmvpfast.com/blog/css-scroll-driven-animations-replace-js-2026)
- Cross-document View Transitions: Chrome 126+, Edge 126+, Safari 18.2+; Firefox not supported by default (Nightly flag `dom.viewTransitions.enabled`); is the headline Interop 2026 feature. — [caniuse](https://caniuse.com/cross-document-view-transitions); [Mozilla Interop 2026](https://hacks.mozilla.org/2026/02/launching-interop-2026/) (search summary; Firefox status after Oct 2026 not re-verified)
- Same-document view transitions were the Interop 2025 target. — [Mozilla Interop 2026](https://hacks.mozilla.org/2026/02/launching-interop-2026/)
- GSAP: "GSAP is now free for everyone, thanks to Webflow's support!" (plugin-level licence terms not shown on the page; check Terms of Use). — [gsap.com](https://gsap.com)
- Lenis https://lenis.darkroom.engineering (200), Theatre.js https://www.theatrejs.com (200), Rive https://rive.app (200): live, not read. Earlier note states Lenis is MIT and respects reduced motion (not re-verified). — [motion_title_language.md](research_notes/Award grade cinematic Wanderstacks redesign/motion_title_language.md)

### Inferences
- Motion principles for Wanderstacks: (1) every motion answers "where am I going / where did I come from" (shared-element transition from library card to library hero via `view-transition-name`; this degrades to a plain navigation in Firefox, acceptable); (2) one easing family and 3 durations (fast ~150-200 ms, standard ~300-400 ms, scene ~800-1200 ms) [my convention, unsourced]; (3) scroll-linked effects limited to opacity/transform on a story page, using native `animation-timeline`; (4) no smooth-scroll library on catalogue pages; (5) `prefers-reduced-motion` removes parallax and flights, keeps fades.
- For one developer on free tools: native View Transitions + CSS scroll-driven animations cover most needs with zero JS; add GSAP only for the in-room camera moves; skip Theatre.js and Rive unless a specific authored sequence demands them.

### Gaps
- Figures for Theatre.js and Rive browser support not gathered; Lenis bundle size and accessibility behaviour not verified; Safari numbering for view transitions from search summary only.

## 6. Reference browsing: catalogue, search, IIIF

### Takeaway
Keep the editorial feel by using large images, serif titles and quiet filter chips, while following the standard faceted-search rules: visible applied filters, multiple values per facet, clear-all. Use IIIF viewers for manuscripts.

### Cited Findings
- Baymard: show applied filters above results as removable chips with "Clear all"; 20% of sites do not keep applied filters visible; its filtering scores use 35 guidelines in four themes (Available Filters, Filter Logic, Filtering Interface, Applied Filter State). — [Baymard filter UI](https://baymard.com/learn/ecommerce-filter-ui); [applied filters](https://baymard.com/research-articles/how-to-design-applied-filters); [multi-value filters](https://baymard.com/research-articles/allow-applying-of-multiple-filter-values)
- IIIF tools live: Mirador https://projectmirador.org (200), OpenSeadragon https://openseadragon.github.io (200), IIIF https://iiif.io (200). The project's own IIIF notes: [manuscripts_iiif.md](research_notes/Wanderstacks libraries and books/manuscripts_iiif.md) (not re-read here).
- Google Arts & Culture browse axes (people, medium, movement, event, place, theme) are a ready taxonomy to copy. — [homepage](https://artsandculture.google.com)

### Inferences
- Suggested catalogue facets: library, region/country, era built, type (national, monastic, private, lost), book language, subject, has digital copy/free to read. Views: grid of covers, a timeline strip (libraries by founding date), and an A-Z list. Search: one box across libraries and books with typed results ("Library", "Book", "Author") and keyboard-friendly autocomplete. Book page: cover, metadata, "Open reader" (OpenSeadragon/Mirador for IIIF items), "Held in" link back to the library room.
- Shelf pattern: horizontal scroll-snap rows with visible "See all" link and a button pair (not just swipe) for accessibility.

### Gaps
- Not verified: NN/g guidance on search autocomplete, Pagefind/Fuse client-side search for static sites (my suggestion, unverified), Europeana's actual facet design (403).

## 7. Performance and accessibility budgets

### Takeaway
Hold the Core Web Vitals "good" thresholds on the catalogue and home (LCP 2.5 s, INP 200 ms, CLS 0.1 at the 75th percentile), and keep all heavy media behind user intent. Immersive sites typically fail WCAG 2.2 on target size, dragging, focus visibility, and motion.

### Cited Findings
- Thresholds, 75th percentile, mobile and desktop segmented: LCP 2.5 s, INP 200 ms, CLS 0.1. — [web.dev vitals](https://web.dev/articles/vitals)
- WCAG 2.2 (W3C Recommendation 5 Oct 2023): 2.5.8 Target Size (Minimum) AA, at least 24x24 CSS px; 2.4.11 Focus Not Obscured (Minimum) AA; 2.5.7 Dragging Movements AA, every drag action needs a single-pointer alternative. — [W3C What's New in WCAG 2.2](https://w3.org/WAI/standards-guidelines/wcag/new-in-22/); [Deque](https://dequeuniversity.com/resources/wcag-2.2)
- Igloo's team cites staged texture loading, shader precompile in background and low-end device testing; one open-world portfolio creator admits slow loads from Draco decoding. — [Awwwards case](https://www.awwwards.com/igloo-inc-case-study.html); [three.js forum](https://discourse.threejs.org/t/an-open-world-space-experience-as-a-portfolio/74951.md)
- Earlier Wanderstacks notes cite a 5 MB arrival budget. — [cinematic_ui_language.md](research_notes/Cinematic UI rebuild for Wanderstacks/cinematic_ui_language.md)

### Inferences
- Budget proposal [my numbers, not sourced]: home and catalogue pages under ~1 MB JS+CSS and ~1.5 MB first-view images; LCP image is a real photo with `fetchpriority=high`, AVIF/WebP with explicit width/height; panorama: ship a 1k preview, upgrade to 4k/8k tiles after interaction; 3D/WebGL never loads on home or catalogue; load the viewer chunk on "Enter".
- A11y checklist for immersive views: every hotspot and plan stop is a real `<button>` in DOM order with a text label; list alternative to every map/3D view (the list of stops); focus ring never hidden under sticky captions (2.4.11); no required drag (2.5.7) so provide arrow buttons; 24 px minimum pins and controls (2.5.8); `prefers-reduced-motion` respected; captions for any narration, pause/stop for audio and any auto-moving content; skip link past the viewer; do not trap scroll or keyboard inside the viewer (Esc exits).

### Gaps
- No verified data for panorama tile sizes or per-device GPU budgets; no check of how the live Wanderstacks build scores on CWV.

## Recommended structure (synthesis, for the writer)

- Top nav (5 items max): Libraries, Books, Visit, Stories, Search. Footer: About, Sources and credits.
- Home: search-first photographic doorway with Globe / A-Z / Surprise me; Today's library; region shelf; books shelf; optional "Watch the film".
- Library page: real exterior photograph hero, facts strip (founded, city, holdings, status), "Walk through" CTA (opens the interior viewer), books held, timeline, sources. The interior viewer is a separate full-screen mode with plan, stop list, captions, Esc to exit.
- Books: searchable catalogue with facets; book page with reader.
- Motion: native View Transitions between catalogue and library; native scroll-driven animations on Stories only.
