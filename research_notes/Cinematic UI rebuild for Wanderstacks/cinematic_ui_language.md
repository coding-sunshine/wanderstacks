# Cinematic UI language for Wanderstacks (research notes)

Method note: ~25 tool calls, mostly search snippets plus 12 page fetches. Claims tagged [UNVERIFIED] come from my background knowledge or snippets I could not open; treat as hypotheses. Several named exemplars (iamtechartist.com/every-joule, Bruno Simon, NYT/Guardian/Reuters graphics, The Pudding, Apple, Theatre.js, Howler/Tone.js) were NOT retrievable in this pass; see Gaps.

## 1. Exemplars 2022-2026: which are praised, and what UI they show/hide

### Takeaway
The best-documented exemplars (Rijksmuseum "Closer to Johannes Vermeer", Getty/Resn "Sculpting Harmony", Immersive Garden/Igloo Inc) share one move: the interface recedes, the artefact or camera path is the interface, and type is used as a designed object, not chrome. Museum sites in general lean on restraint (hidden menus, hero imagery).

### Cited Findings
- Closer to Johannes Vermeer (Rijksmuseum, Fabrique/Q42, 2023): UI "quickly fades into the background"; users arrange a grid of all 37 paintings or curate collections; 5-micron imagery lets you zoom to pigment particles, optimised for mobile; narrated tours by Stephen Fry (EN) and Joy Delima (NL); won two Webbys, a European Design Award, five Lovies; jury: "transcends the exhibition", 12-minute average session. — [Q42](https://q42.nl/en/work/johannes-vermeer); also [Rijksmuseum entry at Best in Heritage](https://presentations.thebestinheritage.com/2024/closer-to-johannes-vermeer)
- Sculpting Harmony (Getty Research Institute + Resn), Awwwards Site of the Month Nov 2023: scroll advances a choreographed aerial camera over the building; typography "became a vehicle to express ideas" (modified Sharp Grotesk, animated); SVG + GSAP ScrollTrigger stretch/contract vertical scale with scroll; brief was "vibrant celebration... and an elegant, editorial approach for a scholarly audience". No sound commentary in the write-up. — [Awwwards](https://www.awwwards.com/sculpting-harmony-wins-site-of-the-month-november-2023.html)
- Getty "Mesopotamia" online exhibition won a Webby (Crafted with Code) — [Webby](https://www.webbyawards.com/crafted-with-code/getty-presents-mesopotamia) (content not opened).
- Awwwards 2024: Site of the Year and Developer Site of the Year = Igloo Inc (Bureaux); Studio of the Year = Immersive Garden. Igloo team cites minimising initial load via custom geometry exporters and staged texture loading / shader precompile, in the initial load and in the background. — [Awwwards annual 2024](https://awwwards.com/annual-awards-2024); [Igloo case study](https://awwwards.com/igloo-inc-case-study.html) (paywalled, snippet only)
- Museum websites praised in 2026 roundup: Rijksmuseum (art front and centre, "Stories" video), National Gallery (discreet hamburger so hero imagery dominates), Van Gogh Museum (sideways-scrolling home, dropdowns tinted to page colour), Nordiska Museet (distinct per-exhibition palettes), Nottingham Contemporary (deliberately retro/brutalist, playful microinteractions), Cooper Hewitt (click-activated nav). — [Numiko 2026](https://numiko.com/insights/best-museum-and-gallery-websites-2026)
- Google Arts & Culture: Pocket Gallery (miniature 3D galleries, 50+ museums, AR on phone), 3D tours, "Talking Museum" (Gemini Q&A with ~200 3D objects). A UX critique argued AR gallery "failed me from appreciating the art" (the tool got in the way). — [TechCrunch](https://techcrunch.com/2021/10/14/google-brings-its-3d-pocket-gallery-art-exhibition-experiences-to-the-web); [Google blog](https://blog.google/company-news/outreach-and-initiatives/arts-culture/the-talking-museum-museum-memory/); [uxdesign.cc critique](https://uxdesign.cc/emerging-tech-traditional-experience-149aa0663e7d)
- Rijksmuseum "Infinite Rijksmuseum" (late 2024), immersive Linked Data/AI environment — [MuseumNext](https://www.museumnext.com/article/inside-the-infinite-rijksmuseum-how-one-museum-is-rethinking-digital-collections/) (not opened).

### Inferences
- Pattern for Wanderstacks: the artefact (book, shelf, room) carries narration; text/audio narration is the "UI". Vermeer's 12-min dwell suggests narrated guidance + free exploration beats menus.
- Loading is a design problem solved by engineering (staged texture/shader loading, custom geometry), matching Wanderstacks' existing 5 MB arrival budget.

### Gaps
- iamtechartist.com/every-joule: search returned nothing; not verified. Bruno Simon's portfolio, NYT/Guardian/Reuters immersive graphics, The Pudding, Apple product pages: not researched/fetched; no sourced claims given.
- Awwwards jury text for Igloo/Immersive Garden not accessible (paywall/404).

## 2. Film-language UI patterns on the web

### Takeaway
Little citable material found on web-specific letterbox/lower-third conventions; the sourced evidence is that scroll-driven camera, narrated captions, and in-scene (diegetic/spatial) labels are established patterns.

### Cited Findings
- Scroll-driven camera over a 3D subject (drone footage mapped to scroll) — Sculpting Harmony, [Awwwards](https://www.awwwards.com/sculpting-harmony-wins-site-of-the-month-november-2023.html)
- Diegetic UI = information lives in the world (Dead Space health on the suit spine); spatial UI = world-anchored labels facing camera, workable in three.js by projecting DOM/sprites to world coordinates; trend toward HUD-free modes and HUDs that appear only when needed. — [Wayline](https://www.wayline.io/blog/diegetic-interfaces-game-design), [Gfinity](https://www.gfinityesports.com/article/the-less-things-you-see-in-a-video-games-ui-the-better)
- Period film titles: The Age of Innocence (1993) titles by Elaine and Saul Bass use tightly spaced Bauer Bodoni italics over Bickham-style calligraphy. — [Fonts In Use](https://fontsinuse.com/uses/32000/the-age-of-innocence-1993-title-sequence)
- Smashing history of film title design: type matched to genre/period cues. — [Smashing](https://www.smashingmagazine.com/2010/10/the-art-of-the-film-title-throughout-cinema-history/)

### Inferences
- [UNVERIFIED, from experience] Recommended film-grammar toolkit that is cheap on static/mobile: (a) title card = one line of display type that fades in/out over the settled scene, no box; (b) lower-third = single caption line bottom-left with room name and year, auto-dismiss in 4-6 s; (c) subtitles-as-narration = bottom-centre, max ~2 lines, large, with a soft text-shadow instead of a panel; (d) chapter card on entering each library, not a persistent nav; (e) letterbox bars only as a transitional state (animate in during cinematic moves, out during walking), never permanent.
- Film precedent (Age of Innocence) shows period type is used for the title card only, with a restrained face; body/captions stay neutral.

### Gaps
- Art of the Title and Awwwards jury text on title-card/lower-third use on web: not retrieved.
- No sourced example of "loader as part of the story" beyond Igloo's loading engineering.

## 3. Motion: GSAP, Lenis, Theatre.js, View Transitions, reduced motion

### Takeaway
GSAP ScrollTrigger + Lenis is the standard stack; Lenis already degrades under reduced motion; View Transitions are now cross-browser for same-document use, which suits a single-page three.js app. Reduced motion should swap travel/parallax for dissolves, not remove the cinema.

### Cited Findings
- Sync recipe: update ScrollTrigger on Lenis scroll, drive Lenis raf from the GSAP ticker, disable GSAP lag smoothing; Lenis default easing `(t)=>Math.min(1,1.001-Math.pow(2,-10*t))`; Lenis forces lerp=1 / destroy() under prefers-reduced-motion. — search summary of Lenis docs/guides: [Lenis repo mirror](https://docsearch.algolia.com/mcp/docs/repo/darkroomengineering/lenis), [tessl cinematic GSAP+Lenis](https://tessl.io/registry/skills/github/MengTo/Skills/cinematic-gsap-lenis-motion-system) (secondary sources; verify against lenis docs)
- `prefers-reduced-motion` (reduce | no-preference), Baseline since Jan 2020; scaling/panning large objects can trigger vestibular discomfort; MDN example swaps a pulse for a slow opacity dissolve; helps meet WCAG 2.3.3. — [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- View Transitions: same-document Chrome/Edge 111+, Safari 18+, Firefox 144+; cross-document Chrome/Edge 126+, Safari 18.2+, no Firefox. Usage `document.startViewTransition(fn)`; MPA opt-in `@view-transition { navigation: auto; }`. — [Chrome docs](https://developer.chrome.com/docs/web-platform/view-transitions)
- Scroll long-form fits open-ended, discovery-driven content (NN/g view via secondary source). — [UXPin 2026](https://www.uxpin.com/studio/blog/4-types-creative-website-scrolling-patterns/) (NN/g original not found)

### Inferences
- Wanderstacks is a walkable scene, not a scroll page: Lenis/ScrollTrigger only pay off in the globe-to-library intro and book reading panes. Camera moves in the 3D scene are better driven by a small tween (GSAP or hand-rolled) with ease-in-out and 1.2-2.5 s durations [timings UNVERIFIED, convention].
- Reduced-motion mapping: replace camera flights with cross-dissolve (View Transition or opacity fade through black), keep head-bob/sway/parallax off, keep sound and text. Do not offer a "skip" only; make the fade the cinematic equivalent.
- Theatre.js: not researched; skip unless authored camera sequences become numerous.

### Gaps
- Easing/timing norms from award-site breakdowns (e.g. cubic-bezier values used by Immersive Garden/Resn): not found.
- Theatre.js evidence: none gathered.

## 4. Sound

### Takeaway
Sound must be opt-in, with a visible persistent toggle, lazy-loaded, remembered for the session, and the experience must be complete without it. Browser policy enforces this anyway.

### Cited Findings
- Chrome: AudioContext autoplay blocked until user interaction; call `resume()` after a gesture; Media Engagement Index can grant autoplay to sites users habitually play with sound (>7 s across most visits); policy shipped Chrome 71 (Dec 2018). — [Chrome Developers](https://developer.chrome.com/blog/web-audio-autoplay)
- Opt-in pattern: audio as an enhancement layer; visible persistent control; remember state via sessionStorage; fully functional with sound off; do not preload audio, load after enable; allow volume/layer controls. — [A Short Journey notes](https://ashortjourney-project.pages.dev/notes/sound-without-autoplay/)
- Readymag guidance: auto-mute with an unmute/mute button; pick the right moment rather than bolting sound on; sound adds weight, use MP3 and stream big files. Examples: financial-futures.org/4/ (voice narration), pendereckisgarden.pl/en (art + music). — [Readymag](https://blog.readymag.com/sound-on-the-web/)
- "Enter with sound?" gate as an immersive opt-in screen. — [uxdesign.cc "Back when websites had a pulse"](https://uxdesign.cc/back-when-websites-had-a-pulse-cccab1e4ab8c) (via search summary)
- Accessibility: never autoplay. — [A11y Project](https://a11yproject.com/posts/never-use-auto-play)

### Inferences
- The natural gate for Wanderstacks is the "Enter" gesture itself: one tap on the entry card that says "Enter / Enter with sound" starts the AudioContext and honours the choice. Layers: room tone (per library, crossfaded, ~-30 dB), footsteps (surface-keyed: stone, wood, carpet), page-turn foley on book open/turn, a single low swell on chapter cards. Duck on tab blur (`visibilitychange`).
- [UNVERIFIED] Howler.js is adequate for sample playback + sprites; raw Web Audio is enough for crossfades; Tone.js is overkill (synthesis). No source gathered.

### Gaps
- What best-in-class sites do on first load (e.g. Immersive Garden pages' sound prompts): not verified. Howler/Tone.js claims unsourced.

## 5. Period-appropriate typography

### Takeaway
Using a single family (EB Garamond) everywhere is a mild flaw rather than a fatal one: it flattens eras. Better: one quiet neutral for UI/body plus era-specific display faces used only on title cards and in-world signage, per film practice (Age of Innocence uses period display type for titles only). Most era mappings below are my typographic knowledge, not sourced; the Google Fonts availability/licence claim is sourced in part.

### Cited Findings
- Google Fonts revivals under SIL OFL include Cinzel (Roman inscriptional capitals), Uncial Antiqua (uncial/half-uncial hybrid), Pirata One, Grenze Gotisch, UnifrakturMaguntia (based on Berthold's Mainzer Fraktur after Fahrenwaldt, 1901); Cormorant (Christian Thalmann) is Garamond-influenced display; IM Fell is a revival of 17th-century types seen in old printing. — [Notebook & Penguin roundup](https://www.notebookandpenguin.com/old-english-blackletter-gothic-google-fonts/), [Cormorant repo](https://github.com/CatharsisFonts/Cormorant), [Made Good Designs](https://madegooddesigns.com/?p=106580)
- Spectral: screen-first serif (Production Type for Google). — [Google Design](https://design.google/library/spectral-new-screen-first-typeface/)
- Film precedent: period titles in Bodoni italic + Bickham script (Age of Innocence); Jesse James titles use 19th-c. broadsheet-style serif. — [Fonts In Use](https://fontsinuse.com/uses/32000/the-age-of-innocence-1993-title-sequence), [Made Good Designs](https://madegooddesigns.com/?p=16250)

### Inferences (era map; [UNVERIFIED] unless noted; check each family's page on fonts.google.com for licence and weights)
| Era / library type | Display candidate (OFL) | Notes |
|---|---|---|
| Classical (Alexandria, Pergamon, Celsus, Roman) | Cinzel (sourced above) | Inscriptional caps only, never lowercase body; Cinzel Decorative sparingly |
| Early medieval insular (Irish/Anglo-Saxon monasteries) | Uncial Antiqua (sourced above) | Weak on legibility; titles only, 1-3 words |
| Carolingian / Romanesque monastic | No faithful Google Fonts Carolingian; use a humane old-style text such as Cormorant or IM Fell DW Pica as stand-in | Honest gap; flag substitution |
| Gothic / late medieval (Sorbonne, Oxford) | Grenze Gotisch, Pirata One (sourced as textura-style), UnifrakturMaguntia (Fraktur, German-lands only) | Blackletter reads as "German/Gothic"; avoid for Italy/Spain/Islamic world |
| Renaissance humanist (Laurenziana, Vatican, Marciana) | Cormorant, EB Garamond (Jenson-ish proportions), Bellefair or Cardo | Cardo has Greek/Latin scholarly coverage |
| Baroque/Enlightenment (Mazarine, Bodleian Radcliffe, Trinity Long Room) | IM Fell English / Fell DW Pica, Libre Caslon Text/Display, Libre Baskerville | Caslon for English-speaking, Baskerville for 1750s+ |
| Neoclassical/19th c. (BnF Labrouste, Reading Room, LoC) | Playfair Display / Bodoni Moda (Didone), Old Standard TT | Didones suit post-1790 |
| Modern (Seattle, Alexandria 2002, etc.) | Neutral grotesque (Inter is a slop tell, see section 6; prefer Instrument Sans, Hanken Grotesk, or Work Sans) | |
| Non-Latin libraries (Al-Qarawiyyin, Nalanda, Hebrew, Chinese) | Noto family per script, Amiri (Arabic naskh), Frank Ruhl Libre (Hebrew), Noto Serif SC | Do not fake with Latin "exotic" fonts; consider per-language fallback |

- Recommendation: 3 roles. (1) UI/captions: one neutral, highly legible face at one size scale; (2) text/book reading: one humanist serif (EB Garamond or Spectral) with real italics and old-style numerals; (3) era display: one face per era cluster, only for chapter/title cards and in-world signage. Cap at roughly 4-5 families total; self-host subsets (Wanderstacks already budgets 5 MB).
- No-pastiche rules: era type belongs to artefacts (spines, signs, title cards), not to chrome; no fake aging, drop-shadow-gold or parchment textures behind text; set caps with generous tracking, lowercase text at normal tracking.

### Gaps
- Coverage/licence per family and Latin-extended or polytonic Greek support not checked; I did not open individual specimens.
- No authoritative source mapping Carolingian minuscule to an OFL font; treat as an open design decision.

## 6. What makes these look generic ("AI slop"), and what strong ones do

### Takeaway
Sameness comes from statistical-median defaults; strong work substitutes specific, constrained decisions (a typeface with character, a chosen palette, asymmetric layout, specific copy). The user's own list (glass pills, gold-on-black, nav over scene, micro-cap labels, decorative frames) is plausible but only partly sourced.

### Cited Findings
- Tells: Inter everywhere, indigo-to-purple gradient (Tailwind indigo-500 default), three rounded cards in a row, weightless copy and thin-line icons; antidote is constraint: specific typefaces, purposeful palette, asymmetric rhythm, specific copy. — [925 Studios](https://www.925studios.co/blog/ai-slop-design-tells)
- Glassmorphism trendy 2021-22, became an AI crutch; gradients, glass panels, centred heroes = "vibe-coded sameness". — search summaries: [Impeccable anti-patterns](https://www.mintlify.com/pbakaus/impeccable/concepts/anti-patterns), [Kompozy](https://kompozy.io/guides/the-ai-design-aesthetic), [Adrian Krebs](https://adriankrebs.ch/blog/design-slop/)
- Strong counter-examples: National Gallery hides nav behind a discreet hamburger so imagery leads; Vermeer UI "fades into the background"; Sculpting Harmony treats type as a motion object. — [Numiko](https://numiko.com/insights/best-museum-and-gallery-websites-2026), [Q42](https://q42.nl/en/work/johannes-vermeer), [Awwwards](https://www.awwwards.com/sculpting-harmony-wins-site-of-the-month-november-2023.html)

### Inferences (do/don't rules for Wanderstacks; judgment, not sourced)
DO
- One persistent control cluster at most: sound toggle + menu/map glyph, small, bottom corner, ~40% opacity until hover/focus; everything else appears contextually.
- Put information in the world: spine labels, plaques, lectern placards via world-anchored sprites/DOM; show on proximity or gaze, fade out after.
- Narrate with captions at the bottom, plain text with shadow, no panel; one lower-third per room entry.
- Single accent colour sampled from the room's own light (lamp amber, window blue), not a global gold.
- Chapter card per library: era display font + city + year, 3 s, fade, then gone.
- Loader = the first shot: a dark frame with one line of text and a thin progress hairline; reveal the globe the moment it is renderable; stream the rest.
- Mobile: drag-look + tap-to-move, 44 px targets for the few controls, hide HUD during movement.
DON'T
- Glass/blur pills, pill nav bars floating over the scene, card grids over 3D.
- Gold-on-black for every label; ornamental frames/flourishes around text; parchment textures behind UI.
- Rows of tiny all-caps tracked labels (limit micro-caps to one role, e.g. the year).
- Auto-playing audio, permanent letterbox, scroll-jacking in walking mode.
- One serif for chrome, narration and era titling.

### Gaps
- No published source specifically linking "gold-on-black", "micro-caps" or "decorative frames" to AI slop; those are inferences from the user's brief.
- Awwwards/FWA jury critiques of generic 3D sites not found.

## Source quality notes
- Q42/Fabrique, Awwwards, MDN, Chrome Developers, Fonts In Use: primary or near-primary.
- Lenis/GSAP integration details, AI-slop lists, game-UI articles: secondary blogs/aggregators, some via search summaries only; Lenis claims should be re-checked against lenis.darkroom.engineering.
- Search tool is US-only and returned many aggregator results; Igloo case study is paywalled.
