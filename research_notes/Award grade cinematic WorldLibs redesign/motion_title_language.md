# Motion and title-sequence language for a cinematic WorldLibs (research notes, 2026-11-10)

Evidence tiers: **Cited** = fetched this session. **Prior knowledge (unverified)** = my training knowledge / common practice, NOT checked against a source this session; treat as design starting points to tune by eye. Art of the Title returned HTTP 403, emilkowalski.com blog URL 404, so title-sequence specifics and curve tables are mostly unverified.

## 1. figmaformotion.com: who, what, why it looks premium

### Takeaway
Figma for Motion is a one-person template shop (Daniel Snows) selling animated Figma website concepts (scroll storytelling, 3D-ish hero art, product pages) built in Figma itself. Its "premium" look is the genre of award-style scroll sites, not a unique technique set.

### Cited Findings
- Creator: Daniel Snows, "Senior UI/UX Designer with 15+ years"; footer "© 2026 Figma for Motion" — [figmaformotion.com](https://figmaformotion.com/)
- Product: premium animated Figma templates (editable source files), not courses/plugins; no After Effects or Lottie needed, animations work directly in Figma — [figmaformotion.com](https://figmaformotion.com/)
- Pricing (Black November 2026 sale, verify later): Premium $44.95 (was $89.90), every file + animations, 11 AI prompts for website generation (Claude etc.), 4-7 new templates monthly, live build access; Basic $9.90 (was $39.90), static designs without animation. One-time payment, lifetime access — [figmaformotion.com](https://figmaformotion.com/)
- Licence: free to adapt/incorporate animations into commercial client deliverables; reselling/redistributing standalone files prohibited — [figmaformotion.com](https://figmaformotion.com/)
- Editable: colors, typography, content, layers, timing, visual details — [figmaformotion.com](https://figmaformotion.com/)
- /v2/templates lists 56 templates (fetch parsed 51 titles; no formal categories, no per-template descriptions or pages exposed). Titles include: Fedex - Advanced scroll; Why so curious? - Interactive 3D Mascot; BlueBird - Tech security; Step into Wonder - Immersive Fantasy 3D; Secret - Japanese Torii gate; Arborea - Organic; Neon Automotive; 3D Crystal Lotus; The Brain - Neural Health; Primal - Online jewelry store; Vibrant Metaverse; Dark Lion - Event landingpage; Floating Fish - Fluid Aqua; Red Boat - Marine Performance; Playful 3D Journey; Frost - Snow Mountain; Midway Hotel - Hospitality; Themyscira - Advanced Scroll; Axtra - Modern Chair; Classicism - Modern; Sandwich - Vegan; Milkshake - Slider; Single Key - Smart Tech; SmartPass; Dentist; Fractal Matter; Cyber Bee; VR; Skothya - Fantasy Storytelling; Unifokal; Hyper Car; Countryside resort; Ignite - Elemental Product; Precision Engineering; Move - Jacket; Gymband - Tech Wearable; Organic Mythos; Glassheart - Neon Anatomy; Tropical Destination - Slider; Industrial Tech; Atmos - SmartRing; Drone Product; Medieval Armor; Extreme Adventure; Dynamic E-Sports; Cyber Security; Hiroshi; Sunglass Store; Big.Ether; Luxury Timepiece; Hidden Treasure - Mouse hover effect — [figmaformotion.com/v2/templates](https://figmaformotion.com/v2/templates)
- Implied template archetypes from titles (my grouping): scroll-journey ("Advanced scroll"), 3D/mascot hero, product-hero (chair, jacket, ring, watch), fantasy/storytelling (Skothya, Themyscira, Medieval Armor, Organic Mythos), slider/carousel, hover-effect demo.

### Inferences
- Most relevant to WorldLibs: the "Fantasy Storytelling / Advanced Scroll / Medieval Armor / Classicism" titles: dark, one-subject-per-viewport, scroll as timeline.
- Visual traits below are the standard award-scroll-site recipe; I could not inspect the Figma files or previews (no screenshots obtainable via fetch). Treat as unverified inference: (a) one huge display headline per screen against one hero image with oversized negative space; (b) masked line reveals; (c) pinned sections where scroll scrubs a camera/object; (d) near-black ground, one warm accent, grain/vignette; (e) slow 600-1200 ms expo-out reveals with long holds; (f) tiny uppercase tracked labels (index numbers, "01 / 07") paired with the huge headline.

### Gaps
- Per-template descriptions, categories, motion specs, easing/timing values, fonts: not exposed in fetched text; no author social/YouTube/Dribbble posts found (searches returned nothing on Daniel Snows). Need a real browser visit (agent-browser) to screenshot and inspect.
- Whether the Figma animations are Smart Animate vs Figma Motion/prototype: site only says "directly in Figma". Figma launched a native "Figma Motion" product (figma.com/motion) per search results, relation unverified.

## 2. Film title-sequence and documentary grammar

### Takeaway
Cited material confirms the conceptual core (Bass: reduction, kinetic type tied to theme; Cooper: tactile, handmade, credits as in-world artefact). Numeric durations/sizes are conventions I supply from prior knowledge; use as starting values.

### Cited Findings
- Saul Bass invented a kind of kinetic typography (North by Northwest, Vertigo with John Whitney, Psycho); letters dash and move, often paired with non-text imagery; clean compositions, sans-serif, geometric shapes, limited palettes — [search summary of Art of the Title / Wikipedia / Smashing](https://www.smashingmagazine.com/2021/02/saul-bass-teach-web-design/)
- Anatomy of a Murder: cut-out animation, names placed over body parts — [Cool Hunting](https://coolhunting.com/design/saul-bass-anatomy-of-a-murder/)
- Se7en (Kyle Cooper, Prologue, 1995): credits scratched by hand on scratchboard/film stock and scanned back; "credits as handwriting"; extreme-close-up tabletop photography of obsessive preparation; shot on film, assembled by hand — [The Fincher Analyst](https://thefincheranalyst.com/2025/09/26/30-years-of-kyle-coopers-classic-title-sequence-for-se7en/), [Empire](https://empireonline.com/movies/features/david-fincher-fight-club-opening-credits)
- Se7en titles considered "one of the most important design innovations of the 1990s" (NYT, quoted in search summary) — see Fincher Analyst link above.

### Inferences (grammar for the web; prior knowledge, UNVERIFIED numbers)
- **One idea per card.** A title card = one line of text + hold. Typical film card: fade in 300-600 ms, hold 1.5-3 s (about 40-60 frames at 24 fps), fade out 300-500 ms. Dates/places: small caps or tracked caps line beneath or above a larger serif place name ("TRINITY COLLEGE DUBLIN" / "1732"), centered or lower-third, revealed after the name by 150-300 ms.
- **Documentary chapter card** (Burns/Cosmos/BBC Natural-History style): black ground, centered serif, 2-4 s hold, slow cross-dissolve (600-1000 ms) between cards; place/date lower-thirds in small tracked caps with a hairline rule, in on 400 ms, hold 3-4 s, out 300 ms.
- **Ken Burns:** slow scale 100%→108-115% plus 2-5% drift over 8-20 s, linear or very gentle ease-in-out, on still archival images. For web: CSS `transform` on a single image, `will-change: transform`.
- **Archival treatment:** desaturate/warm tint, grain, vignette, slight over-exposure bloom. Keep static grain overlay (PNG/SVG noise at 4-8% opacity) rather than animated filters for cost.
- **Se7en lesson:** texture and imperfection (jitter at 12 fps feel, scratches) signal authorship; do it sparingly for heritage: slight stepped (not smooth) micro-jitter on a single flourish, never on reading text.
- **Bass lesson:** a bold simple form transitions into the title; let the room silhouette (arch, shelf lines) wipe into the title.
- Elastic/Game of Thrones, The Crown, Imaginary Forces: not fetched; only general knowledge: model-based/mechanical "map becomes world" camera moves and tight serif titles with slow settle. Unverified.

### Gaps
- Art of the Title 403 for Se7en and GoT; no verified durations, font identification, or interviews. No Watch the Titles/Cosmos/BBC card measurements fetched.

## 3. Easing and timing

### Takeaway
Use a small token set: one expo/quint ease-out for entrances, one ease-in-out for moves, long durations only for hero moments. Values are widely used conventions; the Emil Kowalski curve is attributed via secondary skill summaries only.

### Cited Findings
- `cubic-bezier(0.23, 1, 0.32, 1)` described as a strong ease-out recommended in Emil Kowalski-derived guidance; default to ease-out or custom curves, take values from tables — [search results summary (secondary: skills.cat/instagit)](https://instagit.com/emilkowalski/skills/how-to-choose-the-right-easing-curve-for-ui-animations/) — primary Emil page not verified (blog URL 404).

### Inferences (prior knowledge, unverified; standard easings.net values)
| Token | cubic-bezier | Use |
|---|---|---|
| expo-out | 0.16, 1, 0.3, 1 | headline/line reveals, panel slides |
| quint-out | 0.22, 1, 0.36, 1 | image scale-in, general entrance |
| emil-out | 0.23, 1, 0.32, 1 | UI hover/press, menus |
| cubic-in-out | 0.65, 0, 0.35, 1 | camera-like moves, letterbox bars |
| quart-in-out | 0.76, 0, 0.24, 1 | page/curtain wipes |
| material standard | 0.2, 0, 0, 1 (M3 "emphasized" approximates 0.2,0,0,1) | UI parity |
- Durations: UI feedback 120-200 ms; menus/tooltips 200-300 ms; line reveal 700-1000 ms; hero title 1200-1600 ms; image scale-in 1400-2000 ms; letterbox bars 900-1200 ms; room-to-room dissolve 800-1200 ms. Exits ~60-70% of entrance time. Never ease-in on entrances.
- Stagger: per-line 80-120 ms, per-word 40-60 ms, per-letter 15-30 ms (letters only for short display words, ≤ 20 chars; per-line for anything read). Total stagger budget < 600 ms.
- Masked line reveal: wrapper `overflow: clip`, inner line `translateY(105%)`→0 (expo-out, ~900 ms); optionally `rotate(2deg)` start. Blur-to-focus: `filter: blur(12px)`→0 with opacity 0→1 over 800-1000 ms; cap blur radius and element count (blur is paint-expensive; do on 1-3 elements).
- Scale-in: 1.08→1.0 over 1.6 s quint-out on hero plates. Letterbox: 2.39:1 bars via `clip-path` or two fixed bars animating `height`/`transform: scaleY` on entering "cinema" moments; bars out on interaction.
- Pacing: alternate 1 hero beat (slow, 1-2 s) with quick UI beats (<300 ms); give each title a 1.5 s minimum hold before auto-advance; never autoplay-block reading.

### Gaps
- No primary source for Apple HIG/Material duration tables fetched; Rauno Freiberg writing not fetched.

## 4. Web implementation, 2026

### Takeaway
GSAP is fully free (SplitText, ScrollTrigger, Flip included). CSS scroll-driven animations are now cross-browser (Firefox 159, Oct 2026). Cross-document View Transitions still lack Firefox (per search; verify on caniuse). Lenis is MIT and respects reduced motion.

### Cited Findings
- GSAP 3.13 (April 29, 2025): entire toolset free incl. commercial; former Club plugins in public npm/GitHub; SplitText rewritten, ~50% smaller, 14 new features incl. screen-reader accessibility, responsive re-splitting, nested elements, `onSplit()`/`onRevert()`; absolute positioning and `lineThreshold` removed — [GSAP 3.13](https://gsap.com/blog/3-13/); corroborated [Webflow](https://webflow.com/blog/gsap-becomes-free). A 3.15.0 README exists on jsDelivr (current-ish version) — [jsDelivr](https://cdn.jsdelivr.net/npm/gsap@3.15.0/README.md). Licence nuance (GSAP "Standard" licence, restriction on building no-code competitors to Webflow): not verified; check gsap.com/standard-license before shipping.
- Scroll-driven animations (`animation-timeline: scroll()/view()`): Chrome/Edge 115+, Safari 26+, Firefox 159 (Baseline Newly available, October 2026) — [web.dev Oct 2026](https://web.dev/blog/web-platform-10-2026)
- Same-document View Transitions: Chrome/Edge 111+, Firefox 133+, Safari 18+; cross-document: Chrome/Edge 126+, Safari 18.2+, Firefox not yet as of search (Interop 2026 target) — [search summary of caniuse/Chrome docs](https://caniuse.com/cross-document-view-transitions); [Interop 2026](https://hacks.mozilla.org/2026/02/launching-interop-2026/). Recheck caniuse for Firefox cross-document status.
- Lenis 1.3.27, MIT, wraps native scroll (sticky/anchors/a11y keep working); smoothing auto-disables under `prefers-reduced-motion: reduce`, programmatic scrolls jump instantly — [Lenis GitHub](https://github.com/darkroomengineering/lenis)
- Motion (ex Framer Motion) is MIT; version 13.1.0 README exists — [jsDelivr](https://cdn.jsdelivr.net/npm/motion@13.1.0/README.md). Theatre.js: `@theatre/core` Apache-2.0, `@theatre/studio` AGPL-3.0 — [Theatre GitHub](https://github.com/theatre-js/theatre)

### Inferences
- Recommended stack for WorldLibs: GSAP core + SplitText (title reveals, `mask: "lines"`-style masking) + ScrollTrigger only for HTML overlay chapters; drive the three.js camera from one shared timeline value; CSS scroll-driven animations for simple parallax/progress bars with GSAP fallback; Lenis only on scrolling HTML pages, not in the walkable 3D view (pointer-lock/keyboard). Theatre.js is a candidate for authoring camera fly-ins but studio is AGPL (don't ship studio to prod; core is fine).
- Performance: animate only `transform`/`opacity`; clip-path and blur sparingly; `content-visibility`; one rAF loop shared by GSAP ticker, Lenis, and three.js (`gsap.ticker` + `lenis.raf`); respect the 5 MB arrival budget in repo history by lazy-loading fonts (subset, `font-display: swap`, preload only display face).
- Reduced motion: under `prefers-reduced-motion: reduce` replace movement with 200-300 ms opacity cross-fades, no letterbox slide, no Ken Burns, no blur, no camera auto-flights (offer "skip"/instant cut); also provide an in-app motion toggle. Use `gsap.matchMedia()` for this.

### Gaps
- Not verified: current GSAP version number in Nov 2026; Safari/Firefox support of `animation-range` details; Theatre.js 1.0 status.

## 5. Typography for cinematic heritage titles

### Takeaway
Pair one high-contrast display serif (Cormorant Garamond or Cinzel for caps) with a quiet text serif and a neutral sans for UI. All candidates below are on Google Fonts under SIL OFL 1.1 (prior knowledge: standard for the Google Fonts catalogue; per-family licence not individually fetched, verify in the font's repo).

### Inferences (prior knowledge, unverified individual licences)
| Face | Role | Notes (licence OFL 1.1 unless noted) |
|---|---|---|
| Cormorant / Cormorant Garamond (Christian Thalmann) | hero titles, light 300-500, large | hairline contrast; fragile below ~24 px; italic gorgeous for place names |
| Cinzel (Natanael Gama) | small-caps/all-caps titles, dates | inscriptional Roman caps, no lowercase; use 0.12-0.25em tracking |
| Fraunces (Undercase Type) | warm display/"wonk" | more contemporary, less period |
| Instrument Serif | single-weight condensed display, modern editorial | pairs well with mono labels |
| EB Garamond (Georgia Vaernes/Octavio Pardo) | long book text, captions | period-correct, excellent small caps via `font-variant-caps` |
| Libre Caslon Text/Display | book-page reading, 18th-c. feel | |
| IM Fell family (Igino Marini) | distressed letterpress for archival/book spines | rough; use for decorative, not UI |
| Playfair Display / Bodoni Moda | high-contrast Didone, Library of Congress-era neoclassical | Didone hairlines vanish when small |
| UI face: Inter / Geist / Hanken Grotesk | neutral UI, labels | Inter OFL; Geist OFL |
- Film-title treatments: ALL CAPS or small caps with wide tracking (0.15-0.35em), light weight; large display line with tight tracking (-0.01 to -0.03em, line-height 0.95-1.05); hairline rule (1 px, 30-50% opacity) separating place name from date; tiny label (11-12 px, uppercase, 0.2em) for numerals "01 / 12"; use `font-feature-settings` for old-style figures/ligatures (`onum`, `liga`, `smcp`) where the face supports it. Fluid type: `clamp(2.5rem, 7vw + 1rem, 8rem)` hero; body 18-20 px/1.6; measure 60-68 ch.
- Dates: Roman numerals or old-style numerals, e.g. "MDCCXXXII" for hero flourish, Arabic for UI. Introduce place first (large), date second (small, tracked), country/coordinates third (smallest, mono or sans).
- Colour: near-black warm ground (#0b0907-#14100c), parchment text (#e9dfc8-#f2ead6), single gilt accent (#b8985a-#c9a96a), muted deep red/green secondary; contrast check vs WCAG AA 4.5:1 on body.

### Gaps
- Licences and metrics not fetched per family; no verified font identification for specific film titles (Se7en look-alike page returned only in search listing, unread).

## 6. Sound design

### Takeaway
Not researched with sources (tool budget spent). Prior-knowledge guidance only.

### Inferences (unverified)
- Opt-in only: no autoplay; a clear "Enter with sound / without" gate on first interaction (also satisfies browser autoplay policies via user gesture); remember choice; global mute; honour reduced-motion as a hint to lower, not remove, audio.
- Layers: room tone per library (low-passed, ~-30 LUFS-ish ambience, 20-40 s seamless loop, 1.5-3 s crossfade between rooms), sparse foley (page turn, footsteps on parquet vs stone), one soft sub "hit"/air whoosh for title cards (200-500 ms, high-pass, low volume), no music loop that fights reading. Web Audio API with `AudioContext` resumed on gesture; compress to Opus/AAC; stream ambient beds, preload one-shots; total audio budget small relative to 5 MB arrival budget (lazy-load after entry).
- Fade audio on tab blur/visibilitychange.

### Gaps
- No sources fetched for cinematic-site sound patterns; no verified loudness targets.

## Source-access notes
figmaformotion.com resolves only without `www`. artofthetitle.com blocked (403). Emil Kowalski primary blog path 404. Net tool calls ~21 (over the 15 guideline due to retries).
