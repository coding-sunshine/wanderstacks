---
type: research-note
domain: worldlibs
status: active
tags: [worldlibs, navigation-books-ux]
relatedTo: [reports/WorldLibs realtime walkable library visits.md]
---

# Navigation, book-picking, book listing and reading UX for a walkable 3D library site (WorldLibs)

Research depth note: ~25 tool calls, mostly search snippets plus a handful of page fetches. Search tool returned thin snippets for many topics; claims below are limited to what was actually returned. Anything marked (opinion) or under Inferences is not source-backed. Several key questions have large Gaps (see each section).

## (a) Movement models: what feels real, what makes people sick, desktop and mobile

### Takeaway
The only hard guidance found is from accessibility bodies: bobbing/shake/sway cause motion sickness through visual-vestibular mismatch, and FOV, bob, camera smoothing and auto-camera should be user-adjustable or off. Shipped web-walkthrough products (Shapespark) combine click-to-walk, WASD/arrows and tap-to-teleport on touch; museum-tour research says "find the arrow" point-based navigation frustrates users.

### Cited Findings
- Visual perception of body movement (e.g. a walking head-bob) that conflicts with the lack of real body movement contributes to motion sickness; Microsoft's XAG 117 says to avoid or provide an option to turn off camera shake, bobbing, motion blur, weapon sway and automatic camera angle changes, and to provide an adjustable FOV and look-sensitivity settings. — [Xbox Accessibility Guideline 117](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/117)
- XAG 117 examples of shipped options: Elder Scrolls Online head-bob intensity slider; Halo Infinite FOV slider with note that higher FOV gives a wider view but a "fishbowl" effect and lower FOV helps motion sickness; Minecraft FOV up to 110 degrees; Sea of Thieves auto-centre camera on/off plus delay and speed; Cyberpunk 2077 "additive camera motions" setting. — [XAG 117](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/117)
- Game Accessibility Guidelines: avoid, or let players disable, any difference between controller movement and camera movement (asynchronous walk bobbing, mouse smoothing, motion blur, camera shake/tilt, automatic camera movement). Rated Vision / Intermediate. — [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/avoid-or-provide-option-to-disable-any-difference-between-controller-movement-and-camera-movement/)
- A developer-accessibility write-up lists triggers as FOV range, screen shake/bobbing, motion blur, large repeated textures, frame rate, and says the cause varies per person and game; Minecraft offers toggles for View Bobbing, Distortion Effects, FOV Effects, Damage Tilt. Repeated textures need art fixes, not a settings toggle. — [Madeline Miller, Motion Sickness Accessibility](https://madelinemiller.dev/blog/motion-sickness-accessibility/)
- Shapespark (shipped WebGL walkthrough product) supports click-to-walk, keyboard arrows/WASD, scroll to walk straight; on touch devices tap to teleport; VR teleport by gaze timer or controller. Users can walk freely, not just between fixed viewpoints. — [Shapespark search summary / site](https://www.shapespark.com/blog/sell-properties-faster-with-browser-based-virtual-walkthroughs) (details from search result summary; not fully fetched)
- Virtual-museum research identifies two navigation strategies: exhibit-based (click an exhibit to go there) and point-based (click system navigation points, SNPs). Downside of point-based: users must hunt for available SNPs instead of focusing on the tour and are frustrated when none exist in the direction they want. Studies also compare "on rails" vs free movement and a guided path vs accompanying companion; phone vs desktop exploration differs, with rendered horizontal FOV a key factor. — search summary of [Analyzing Behavior and User Experience in Online Museum Virtual Tours (arXiv 2310.11176)](https://arxiv.org/pdf/2310.11176) (PDF could not be parsed; findings are from the search-result summary only, verify before quoting)
- Matterport is described in vendor/community comparisons as click-anywhere-to-move with more waypoints than Street View style tours, which use predefined hotspots; one practitioner note says Street View cannot wait to load while you move down a street (latency matters). — [We Get Around forum thread](https://wegetaroundnetwork.com/topic/2833/matterport-spaces-tour-vs-google-maps-tour) (forum opinion, low authority)
- Procore/Archilogic-style mobile viewers use virtual joysticks (analog: partial drag = slow, full drag = fast; separate move and look sticks) plus pinch/drag gestures. — [Procore joystick docs](https://v2.support.procore.com/en-au/product-manuals/model-manager-ios/joysticks-and-touch-gestures-ios) (via search summary)

### Inferences
- (opinion/inference) A hybrid is the safest: tap-on-floor glide (eased, 0.6 to 1.2 s, not an instant cut) + drag to look + optional joystick, with WASD on desktop. This mirrors Shapespark and avoids the SNP-hunting problem because any floor point is valid.
- (opinion) Speed should be near real walking (about 1.4 m/s is the commonly cited average; see Gaps) with eased start/stop; floatiness usually comes from instant velocity, no deceleration, or too high FOV, which the accessibility sources support only indirectly.
- Ship head bob off by default or very subtle with a setting; the sourced guidance only says provide option, not a default.
- Because "large repeated textures" are a trigger, tiling floors/wood needs variation (art fix).

### Gaps
- No peer-reviewed numbers found for ideal eye height, walking speed, or FOV in desktop/mobile web walkthroughs (a search returned only forum/Unreal answers; 1.4 m/s was a Wikipedia-style figure in a search summary, not a primary source). Commonly used values (eye 1.6 m, FOV 60-75 vertical) are unsourced here.
- No direct comparative study of click-to-move vs WASD vs joystick on mobile for nausea. The "I am a Giant" paper found was VR-only and not relevant.
- Matterport and Google Street View official docs not fetched.
- Head-bob amplitude/frequency values not found.

## (b) Choosing and taking a book off a shelf (game precedents)

### Takeaway
Gone Home is the best-documented precedent: any small object can be grabbed and rotated, interactables are signalled by a text prompt, books wedged in shelves are deliberately non-interactive while loose books are, and a Put Back action exists. No sourced detail was retrieved for the other titles.

### Cited Findings
- Gone Home's "Physics Examine" lets the player grab any small physical object and rotate it; devs say a mundane pencil is examined the same way as a note-bearing matchbook. — [Fullbright, A Non-Violent Immersive Sim](https://fullbright.company/2012/09/28/a-non-violent-immersive-sim)
- Books lying out can be picked up and read; books crammed into shelves cannot be interacted with, which avoids hundreds of readable texts and signals "loose book = matters". — [Fullbright](https://fullbright.company/2012/09/28/a-non-violent-immersive-sim)
- Put Back system: return the object by targeting its spot and clicking, or toss it elsewhere; devs framed it as player agency. — [Fullbright](https://fullbright.company/2012/09/28/a-non-violent-immersive-sim)
- Gone Home highlights interactables with white text prompts ("pick up key") and (per a secondary source) reduces mouse sensitivity over interactables. — [Gone Home design overview, Game Developer / secondary summaries via search](https://gamedeveloper.com/design/gone-home-a-non-violent-immersive-sim-) (search summary only)
- Skyrim: reading is presented as skeuomorphic UI (plaques as stone/metal/wood), described as designed to feel like leaning in to read an object, not opening another app; community mods exist to let books use all screen space and speed up the book-open animation, which signals the stock animation annoys players. — [InAir article on Skyrim plaque UI](https://inairspace.com/blogs/learn-with-inair/skeuomorphism-of-skyrim-immersive-plaque-reading-interface-design-guide); [Convenient Reading UI mod](https://stepmodifications.org/wiki/SkyrimSE:Convenient%20Reading%20UI%20-%20SE) (low-authority; mod purpose inferred from titles/summaries)

### Inferences
- (opinion, supported by Gone Home) Make only the curated books pullable; visually distinguish them (slightly protruding, brighter spine, gentle idle glint) so the "cannot click" majority of the shelf reads as set dressing.
- Pull-out sequence suggested by precedent: hover/focus highlight with title label, press, spine slides out ~10 cm, book lifts to camera and rotates to cover, room dims. Provide Put Back / Esc that returns the book to its exact slot.
- Keep the open animation short and skippable (mods for Skyrim suggest annoyance).

### Gaps
- No sourced details on Edith Finch, The Room, Myst, Oblivion, Hogwarts Legacy, Animal Crossing, Unpacking, A Short Hike. No GDC talks retrieved. Sound design and focus/blur practices for inspect modes not sourced.
- Skyrim claims are from low-authority sites.

## (c) Presenting a library's book list

### Takeaway
Virtual-shelf browsing (Harvard Stack View/StackLife) is a documented, library-world pattern that recreates "scanning" and structured serendipity using real metadata (height, page count as spine thickness). Evidence is for large catalogs; nothing sourced for a curated 5-50 set.

### Cited Findings
- Stack View uses catalog metadata including dimensions and page count to render spine-like items in a CSS/JS shelf, and items can sit on multiple shelves, so arrangements impossible physically are possible. — [Code4Lib 2012, Stack View](https://code4lib.org/conference/2012/cain/)
- StackLife combines shelves across Harvard's libraries; aims for "structured serendipity" and to give users the "scanning information" of real stacks; colour depth indicates usage, thickness page count. — [Harvard Library Innovation Lab](https://lil.law.harvard.edu/our-work/stack-life); [Aaron Tay survey of virtual shelves](https://aarontay.substack.com/p/a-survey-of-library-virtual-shelves-8)
- Survey of 8 library virtual shelves: addresses overwhelm from large result sets and enables serendipity; Huddersfield had 8,000+ monthly clicks at peak; weakness is it works only for physical items and ebooks, not articles. — [Aaron Tay](https://aarontay.substack.com/p/a-survey-of-library-virtual-shelves-8)

### Inferences
- (opinion) For 5-50 books, the 3D shelf itself is the list; add a parallel 2D index (title, author, year, length, language) reachable by a button/keyboard, which doubles as the accessibility path and as search. Hovering a spine shows a title label; the index click flies the camera to that shelf and highlights the book.
- Use real or plausible spine size variation (height/thickness from page count) as Stack View does; uniform spines look fake.

### Gaps
- Nothing retrieved on British Library, Smithsonian, Google Arts & Culture, Internet Archive, Open Library browse, Europeana, or Library of Babel sites. No comparative data on spines vs grid vs carousel for small curated sets.

## (d) Opening and reading

### Takeaway
One usability study (Waikato "Realistic electronic books") reports users preferred and were faster with a simulated-book interface with no accuracy loss; Xbox guidance cautions against moving content behind text. Net: realistic turn is acceptable if short and optional, and text must sit on a stable, opaque, accessible layer.

### Cited Findings
- Waikato thesis/paper: participants preferred the book-simulating interface and completed tasks more efficiently, without accuracy loss, vs HTML/PDF/physical comparisons. — [Realistic electronic books, Waikato](https://researchcommons.waikato.ac.nz/handle/10289/4739) (abstract only)
- Realistic page-turn animations can be computationally demanding and exceed the ability of many reading devices. — search summary of [USPTO/Waikato results](https://researchcommons.waikato.ac.nz/handle/10289/4739) (weak source)
- XAG 117: reading stationary text with moving elements behind it can trigger motion sickness and distraction; give an option for an opaque background behind text and a way to pause/hide moving content. — [XAG 117](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/117)
- Skyrim text stays crisp even on low graphics settings, suggesting text is rendered separately from the page texture. — [Unity forum thread](https://discussions.unity.com/t/skyrim-books-how-did-they-made-the-text-on-the-pages/88630) (speculation by forum posters; treat as unconfirmed)

### Inferences
- (opinion) Two-stage reading: 3D book opens to cover and flies to camera, then crossfades to a DOM text reader (real HTML text: selectable, resizable, screen-reader friendly), with a light page-turn flourish only on the 3D book. Avoid reading text via canvas textures on mobile.
- Reader must have: font size control, line length 55-75 chars, high-contrast theme, keyboard (arrows/space/Esc), progress, and a clear Back-to-shelf.
- Keep page turn under ~400 ms and skip when prefers-reduced-motion.

### Gaps
- No typography or reading-comfort studies retrieved; no screen-reader patterns for canvas apps retrieved beyond WCAG basics; no sourced data on page-turn vs fade on mobile.

## Wayfinding, diegetic labels, guided tours, signifiers

### Takeaway
Signifiers must be visible or users spend longer working out what is clickable (NN/g, 22% more time on flat designs). Guided narrated tours inside walkable worlds have a shipped precedent (AC Discovery Tour). 3D virtual world research ties usability problems mostly to navigation and wayfinding.

### Cited Findings
- NN/g found users spent 22% more time on flat designs trying to determine what was clickable. — [NN/g clickable elements](https://www.nngroup.com/articles/clickable-elements/) (figure appeared in a search summary; verify wording on the page)
- Signifiers are the perceivable cues for possible action; users cannot act on affordances they don't perceive. — [NN/g / Norman via search summaries](https://www.nngroup.com/articles/clickable-elements/)
- AC Origins Discovery Tour: 75 guided tours of 5-20 min with fully voiced nodes, free-roam without combat; a "virtual museum" built from game assets. — [Ubisoft news](https://news.ubisoft.com/en-us/article/13sXevEgX278m7jxcX5uhM/assassins-creed-origins-discovery-tour-shows-a-different-side-of-ancient-egypt); [MCV](https://www.mcvuk.com/explore-ancient-egypt-with-the-assassins-creed-discovery-tour/)
- Academic work on 3D learning worlds reports key usability problems are navigation and wayfinding, and that real-world wayfinding principles help. — [IFIP Minocha & Reeves](https://dl.ifip.org/hal-01056245v1) (search summary)

### Inferences
- (opinion) Use diegetic cues: warm light pools on pullable shelves, a slight gleam, reading-lamp glow; cursor change plus small label on hover; on touch, a brief pulse the first time a shelf is near. Offer a "Tour" (3-5 stops, short audio/caption) as optional docent, plus a "List all books" panel.
- Minimap: keep it a tiny floor plan with "you are here" dot; hide by default on phones.

### Gaps
- No sourced evidence for minimap value, audio effects, or touch discoverability patterns.

## Accessibility and reduced motion

### Takeaway
WCAG 2.3.3 (AAA) asks that interaction-triggered motion be disableable; prefers-reduced-motion is the mechanism. Xbox guidelines add FOV, bob and camera settings. A 2D alternative path is an inference, not found as a mandated standard in these sources.

### Cited Findings
- WCAG 2.3.3 Animation from Interactions (Level AAA): motion animation triggered by interaction can be disabled unless essential; implement with `prefers-reduced-motion` and `matchMedia` in JS to skip or make instant. — [W3C Understanding SC 2.3.3](https://w3c.github.io/wcag/understanding/animation-from-interactions)
- Vestibular disorders: non-essential movement can cause dizziness, headaches, nausea. — [W3C Understanding SC 2.3.3](https://w3c.github.io/wcag/understanding/animation-from-interactions)
- XAG 117 gives settings checklist (bob, shake, blur, FOV, auto-centre, sensitivity, pause moving UI). — [XAG 117](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/117)

### Inferences
- (opinion) Under reduced-motion: cut glides to short fades or instant jumps, disable bob, disable page-turn animation, and offer a "Skip 3D / Browse as list" entry that leads to the same book reader.

### Gaps
- No WebGL/canvas-specific a11y guidance retrieved (focus management, ARIA live regions, keyboard-only walking).

## Why 3D walkthroughs feel "off" (failure modes)

### Takeaway
Sourced causes: unexpected/uncontrolled camera motion, bobbing and mismatch between input and camera, tiling textures, hunting for hotspots, latency, hard-to-spot interactables. Sourced reviewer commentary on uncanny lighting and wrong scale was not found.

### Cited Findings
- Camera bob/shake/auto-camera and input-camera mismatch cause motion sickness ([XAG 117](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/117); [GAG](https://gameaccessibilityguidelines.com/avoid-or-provide-option-to-disable-any-difference-between-controller-movement-and-camera-movement/)).
- Large repeated textures are a trigger ([Madeline Miller](https://madelinemiller.dev/blog/motion-sickness-accessibility/)).
- Point-based navigation: users hunt for arrows/hotspots ([arXiv 2310.11176 summary](https://arxiv.org/pdf/2310.11176)).
- Latency while moving is called out for Street View-style loading ([We Get Around forum](https://wegetaroundnetwork.com/topic/2833/matterport-spaces-tour-vs-google-maps-tour)).
- Players of Skyrim modded the book UI to be faster / fill the screen ([Convenient Reading UI](https://stepmodifications.org/wiki/SkyrimSE:Convenient%20Reading%20UI%20-%20SE)).

### Inferences
- (opinion) Fix list: eased locomotion; honor reduced motion; preload next room/textures before the door; real-scale shelves (shelf top ~2 m, book spine 20-30 cm tall); consistent, soft lighting rather than sharp fake shadows on mobile; no HUD clutter; one clear pullable-book signifier; Put Back; 2D index.

### Gaps
- No NN/g 3D/VR article, no GDC Vault, no three.js forum or Awwwards case study fetched; claims about uncanny lighting, wrong scale and UI overlays are unsourced opinion.
