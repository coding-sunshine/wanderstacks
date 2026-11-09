# Museum, heritage and editorial 3D storytelling: exemplars, certainty signalling, UX patterns for WorldLibs

Research session note (Nov 2026): ~21 tool calls. Web search returned thin results for several named projects; anything I could not source this session is in Gaps, not asserted. The catalogue is therefore shorter than the 10-15 target (8 sourced, others flagged).

## 1. Editorial 3D scrollytelling: camera, captions, chapters, mobile, loading

### Takeaway
Sourced evidence is thin. NYT's 2019 Notre-Dame piece shows the "fast, restrained, three.js + glTF" model; NYT's 2023 Notre-Dame sound piece shows that a planned free-roam interior was cut back to a restricted camera path. The Pudding gives concrete mobile rules.

### Cited Findings
- NYT Notre-Dame fire 3D model (April 2019) was built with three.js and glTF "in a lightning-fast turnaround"; a commenter noted visible JPEG artifacts on the roof texture (fast production traded texture quality) — [three.js forum, 18 Apr 2019](https://discourse.threejs.org/t/new-york-times-notre-dame-visualization/7144) (poster did not work on it; no creator attribution; secondhand)
- NYT published a rotating, zoomable 3D model 24h after the fire was out, used to diagram how attic changes could have protected it; zoom/rotation highlights the relevant points — [search summary of NYT/FlowingData coverage](https://flowingdata.com/2019/04/17/what-happened-at-notre-dame) (snippet-level, not read in full)
- NYT "The Quest to Restore Notre Dame's Glorious Sound" (2023; Malika Khurana, Yuliya Parshina-Kottas) used 3D visualisation + spatial audio, monochrome black-and-white design; team "initially wanted a continuous interior experience where users could explore Notre Dame freely, but we had to compromise on a more restricted camera path"; visuals plus spatial sound were "resource-intensive and led to unexpected bugs" — [Storybench, Dec 2024](https://www.storybench.org/?p=22115)
- The Pudding mobile scrollytelling rules: mobile-first "forces you to pare down your experience to the nuts and bolts"; avoid CSS `vh` for sticky graphics (mobile URL bar resizes cause jank) and use px from `window.innerHeight`; keep steps short and few; stack content statically when animation strains performance; drop hover states on mobile — [The Pudding](https://pudding.cool/process/responsive-scrollytelling/)
- Guardian Thai cave rescue graphics (2018) were updated live as cross-sections/diagrams; SCMP's interactive on the rescue won Malofiej 27 / Information is Beautiful / SND awards — [Storybench](https://www.storybench.org/?p=9701), [SCMP](https://multimedia.scmp.com/news/world/article/2154457/thai-cave-rescue/index.html) (I did NOT confirm an NYT Tham Luang 3D piece)

### Inferences
- Editorial 3D wins by constraint: one object, monochrome or restrained palette, scripted camera, few steps. WorldLibs chapter cards between walkable rooms should follow that.
- Cut-down camera (rail with limited free look) is a precedent for guarding quality and performance; free roam is the first thing to be cut under load.

### Gaps
- No primary making-of found for NYT Olympics 3D, Washington Post, Reuters Graphics, Bloomberg, or Guardian 3D pieces; couldn't verify captions/loading strategies for them.
- NYT Tham Luang 3D: not found.

## 2. Museum and heritage exemplars (what each does well)

### Takeaway
Best heritage platforms pair a high-fidelity object/place with layered, optional depth (annotations, articles, tours) and open sources. Verified exemplars below; the rest could not be sourced.

### Cited Findings
1. **Smithsonian Voyager** (open source, dpo-voyager): Explorer + Story authoring + Mini; three narrative modes: Annotations (clickable points on the surface), "Read More" articles, and curated Tours ("a great place to start"); multilingual, audio, glTF/Draco; accessibility is listed as roadmap, i.e. not solved — [Voyager docs](https://smithsonian.github.io/dpo-voyager/explorer/overview), [3d.si.edu](https://3d.si.edu/open-source-resources)
2. **Rijksmuseum Operation Night Watch** (2019-): painting restored in a glass chamber by Wilmotte, livestreamed; 44.8-gigapixel image from 528 photos published online (May 2019); the process, not just the result, is the story — [Frieze](https://frieze.com/article/rembrandts-night-watch-will-be-restored-full-public-view), [Rijksmuseum live updates](https://rijksmuseum.nl/en/live-updates-of-operation-night-watch), [Smithsonian Mag](https://www.smithsonianmag.com/smart-news/restoration-rembrandts-most-ambitious-work-will-be-view-museum-galleryand-online-180970565/). Rijksmuseum site is "image first", full-screen images, 2025 Webby among awards — [Numiko](https://numiko.com/insights/best-museum-and-gallery-websites-2026) (secondary)
3. **Assassin's Creed Discovery Tour (Egypt 2018, Greece 2019)**: Ubisoft historian-led guided tours (Maxime Durand), free roam alongside; classroom pilots reported students engaged for 60-minute sessions, requested more time, voluntarily did worksheets; "an additional tool for education" — [Ubisoft](https://www.ubisoft.com/en-au/game/assassins-creed/news/2Qdtl7NjlUPC5XO2JkJdLo/what-happens-when-students-and-teachers-go-handson-with-discovery-tour-ancient-greece). Reported to mark what is historical fiction vs accurate and to offer "criticise history" talking points — [Euroclio summary / search snippet](https://euroclio.eu/2020/05/20/one-day-free-offer-assassins-creed-discovery-tour-2/) (not read in full; Ubisoft is self-reporting)
4. **Rome Reborn / Flyover Zone** (Bernard Frischer; version 4.0; Flyover Zone founded 2016): city-scale reconstruction; the field critique is that such models imply unwarranted certainty and that "uncertainty modeling" (blurred or wireframe where evidence is missing) is called for — [Archeomatica paper](https://mediageo.it/ojs/index.php/archeomatica/article/download/1985/1799/8843) (snippet-level; I did not verify what Rome Reborn itself shows)
5. **Book of Kells Experience, Trinity College Dublin** (opened January 2024; 360 degree pavilion incl. a "digital reconstruction of the Long Room"; pavilion permitted to 2029; Harvard interest) — physical immersive, not web, but directly on-theme; visit sequence starts with real manuscript, then Long Room — [Artnet](https://news.artnet.com/art-world/dublin-book-kells-manuscript-immersive-experience-2384605), [Medievalists.net](https://www.medievalists.net/2024/06/explore-the-book-of-kells-like-never-before/)
6. **CyArk Open Heritage** with Google Arts & Culture: 70+ datasets at launch, a portal for 3D heritage data — [CyArk](https://cyark.org/education), [WEF](https://www.weforum.org/stories/2018/04/3d-modelling-is-helping-to-restore-the-worlds-destroyed-heritage-sites/)
7. **Iconem** (Palmyra Bel temple showing damage, Mosul, Jam minaret; BIG3D with CNRS and Sketchfab): photogrammetry of at-risk sites; Mosul 3D helped UNESCO prioritise restoration — [Art Newspaper](https://www.theartnewspaper.com/news/french-military-funds-technology-to-document-heritage-in-conflict-zones), [Sketchfab BIG3D](https://sketchfab.com/blogs/community/sketchfab-project-receives-1-1-million-in-funding/)
8. **Google Arts & Culture Notre-Dame**: archive photographs/daguerreotypes (CMN) and story pages; Street View keeps some interior imagery — [Pickr](https://www.pickr.com.au/news/2019/keeping-notre-dame-alive-online/), [GA&C story](https://artsandculture.google.com/story/LgXxvv_8l5fsfw). "Hidden Worlds" not confirmed.

### Inferences
- Voyager's tour/annotation/article trio maps directly onto WorldLibs: Tour = guided chapter path, Annotation = pins on a book/shelf/architecture, Article = the readable book text.
- Operation Night Watch shows "process as content": WorldLibs could show how a room was built (sources, scans) as an optional layer.

### Gaps
- Not sourced this session: Notre-Dame VR (Ubisoft), Smithsonian-curated tours, British Museum, Getty, Library of Congress online exhibits, Virtual Trinity Library, Sketchfab specific stories, WaPo/Reuters/Bloomberg 3D. Treat as unverified; I have background knowledge only.
- No confirmed web-based Long Room digital twin by TCD (searches returned only the Kells pavilion).

## 3. Signalling certainty vs conjecture

### Takeaway
The literature converges on a small vocabulary: solid = attested, semi-transparent = hypothetical, clay/NPR = interpretation, photoreal only for verified data, plus paradata documenting reasoning. Terminology is not standardised.

### Cited Findings
- London Charter v2.1 (draft 1.1 June 2006; final by Feb 2009), six principles incl. Research Sources, Documentation, Access; 4.6 paradata: decisions "should be disseminated in such a way that the relationship between research sources, implicit knowledge, explicit reasoning, and visualisation-based outcomes can be understood" — [londoncharter.org](https://www.londoncharter.org/introduction.html)
- Seville Principles: Principle 4 Authenticity (distinguish reality from speculation, state accuracy levels), Principle 7 Scientific Transparency (documentation publicly accessible) — [Indiana VWHL](https://vwhl.luddy.indiana.edu/sevillePrinciples/index.html)
- Unger et al., Internet Archaeology 72 (2026): attested structures solid; hypothetical/reconstructed semi-transparent; movable artefacts and vegetation even more transparent; photorealism restricted to verified data because it "implies a high degree of certainty"; clay render and NPR (after Isenberg et al. 2006) signal interpretation; selective colour (after Demetrescu 2015) — [Internet Archaeology 72.13](https://intarch.ac.uk/journal/issue72/13/full-text.html)
- Evidence-based and inferred elements are often visually blended, producing "unwarranted certainty"; terms like plausibility/reliability/probability are used inconsistently — [Dublin Core paper](https://dcpapers.dublincore.org/article/952627904), [Archeomatica](https://mediageo.it/ojs/index.php/archeomatica/article/download/1985/1799/8843)
- Schäfer (2018, Humboldt) surveys uncertainty visualisation across geography, infoviz and archaeology, proposing NPR, visual cues and recontextualisation — [DAH journal](https://dahj.org/article/uncertainty) (excerpt only)
- Strothotte et al. 1999 on NPR for reconstructions — [Isenberg page](https://tobias.isenberg.cc/p/Strothotte1999VKV)

### Inferences
- WorldLibs UI proposal (my synthesis, not a cited design): a per-element evidence tag with three states (surviving / documented / conjectural); toggle that renders conjectural geometry as clay or semi-transparent; "what we know / what we guessed" panel on each room; paradata drawer listing sources per room. Books themselves: label photographed vs transcribed vs placeholder text.
- Photoreal rendering of the Long Room is justifiable (scanned, extant); Alexandria and Celsus (reconstructed or lost) should visibly shift style.

### Gaps
- No concrete shipped consumer UI (screenshot-level) found of a certainty toggle; the examples are research prototypes. Not verified how Rome Reborn, Discovery Tour or Notre-Dame VR label it.

## 4. Narrative devices: guided vs free roam, chapters, time sliders, narrator, sound, before/after

### Takeaway
Guided-first with optional free roam is the repeated pattern (Discovery Tour, Voyager tours, NYT restricted rail). Spatial audio is a proven NYT device.

### Cited Findings
- Discovery Tour: tours led by named historian plus self-directed exploration — [Ubisoft](https://www.ubisoft.com/en-au/game/assassins-creed/news/2Qdtl7NjlUPC5XO2JkJdLo/what-happens-when-students-and-teachers-go-handson-with-discovery-tour-ancient-greece)
- Voyager: tour animation engine, audio support — [Voyager docs](https://smithsonian.github.io/dpo-voyager/explorer/overview)
- NYT 2023: spatial audio + restricted camera — [Storybench](https://www.storybench.org/?p=22115)
- Notre-Dame 2019 NYT: before/after of cause (what attic changes would do) via rotation/zoom — [FlowingData](https://flowingdata.com/2019/04/17/what-happened-at-notre-dame)
- Book of Kells Experience: sequence real object first, then immersive Long Room — [Artnet](https://news.artnet.com/art-world/dublin-book-kells-manuscript-immersive-experience-2384605)

### Inferences
- Then/now sliders and narrator voice: no sourced examples; recommend as design options only.

### Gaps
- Time-slider and then/now exemplars (e.g. Rome Reborn, Pompeii) not verified.

## 5. What critics and researchers say works or fails

### Takeaway
Engagement is strong when guided; motion sickness mainly a VR/locomotion issue and mitigated by teleport; accessibility is the least-addressed area.

### Cited Findings
- Teleport can reduce motion sickness by removing visible translation, though users prefer direct control; a 60-participant museum study compared joystick, point-and-teleport and arm swinging on sickness, presence and flow; sickness lower in wearable than mobile VR — [Springer chapter](https://link.springer.com/chapter/10.1007/978-3-030-05819-7_13), [Springer VR 2025](https://link.springer.com/article/10.1007/s10055-025-01140-1), [arXiv 2312.09737](https://arxiv.org/html/2312.09737v1) (via search summaries; figures not independently verified)
- Teachers reported high engagement and cross-disciplinary use in Discovery Tour; self-reported by publisher — [Ubisoft](https://www.ubisoft.com/en-au/game/assassins-creed/news/2Qdtl7NjlUPC5XO2JkJdLo/what-happens-when-students-and-teachers-go-handson-with-discovery-tour-ancient-greece)
- Voyager lists accessibility as future work — [Voyager docs](https://smithsonian.github.io/dpo-voyager/explorer/overview)
- Critical appraisal of virtual reconstructions in archaeology (Nottingham) exists — [eprints](https://eprints.nottingham.ac.uk/77900) (not read)

### Inferences
- For WorldLibs desktop/mobile web (not headset), sickness risk is modest but real with head-bob/smooth acceleration: offer click-to-move/teleport, no bob, FOV control, reduced-motion toggle.
- Accessibility gap means a keyboard-navigable book list and text-first reading mode would differentiate.

### Gaps
- No independent engagement study of editorial 3D scrollytelling; no accessibility critique of specific projects found.

## Top UX patterns to copy (synthesis; each tied to above)
1. Tour / Annotation / Article triad (Voyager) with a "start here" guided tour.
2. Restricted camera rail as default, free roam opt-in (NYT 2023, Discovery Tour).
3. Three-state evidence styling plus clay/transparent toggle for conjecture; photoreal only for verified (Unger 2026).
4. Per-room paradata drawer (London Charter 4.6, Seville 7): sources, decisions, confidence.
5. Process-as-story layer (Night Watch).
6. Real object first, then room (Kells Experience): show the actual book page before the world.
7. Mobile: mobile-first, short steps, px not vh, static fallback, no hover (The Pudding).
8. Spatial audio as optional ambient layer (NYT 2023), with captions.
9. Teleport/click-to-move, reduced motion, text-first alternative.
