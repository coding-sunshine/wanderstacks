# Historical accuracy and cinematic realism for digital historic-library reconstructions

Coverage note: ~19 tool calls. Many claims come from search-result summaries (snippet level), not full-page reads. Several requested items (Notre-Dame twin, Alexandria, Lascaux/Chauvet, British Library/Bodleian, Google Arts, per-hall binding colours, fire rules, aged-leather colour) were NOT verified; they are in Gaps. Wikipedia-only or snippet-only claims are marked [W] / [snippet].

## Part A1 - What do the London Charter and Seville Principles require, and how is uncertainty shown?

### Takeaway
London Charter v2.1 has six principles (implementation, aims/methods, research sources, documentation, sustainability, access); the Seville Principles extend it for archaeology (interdisciplinarity first) and offer a compliance seal. Uncertainty is typically shown by colour/opacity/line-sharpness coding per source confidence; there is no single standard.

### Cited Findings
- London Charter six principles: Implementation; Aims and Methods (use visualisation only when most suitable); Research Sources ("identified and evaluated in a structured and documented way"); Documentation ("sufficient information... to allow computer-based visualisation methods and outcomes to be understood and evaluated"); Sustainability; Access. — [londoncharter.org principles](https://www.londoncharter.org/principles.html)
- The fetched page did not itself spell out "paradata" or "levels of certainty" text; those details need the full principle documents. — same source
- Seville Principles = International Principles of Virtual Archaeology, ratified by ICOMOS; created via SEAV (Spanish Society of Virtual Archaeology, 2008); aim: measure project quality, responsible use of tech. Principle 1 is Interdisciplinarity. A "Seal of Compliance" distinguishes source-based reconstruction from speculative rendering. [snippet] — [vi-mm.eu](https://www.vi-mm.eu/?p=391), [Indiana VWHL Seville page](https://vwhl.luddy.indiana.edu/sevillePrinciples/index.html), [López Menchero Grande PDF](https://www.cipaheritagedocumentation.org/wp-content/uploads/2018/12/López-Menchero-Grande-The-principles-of-the-Seville-Charter.pdf)
- Uncertainty visualisation practice: colour mapping or opacity of components indicates phase, source, or certainty; other strategies alter line sharpness/curvature/detail; e.g. one colour (green) for average-uncertainty elements. [snippet] — [arXiv 2503.11653, Maxentius mausoleum immersive analytics](https://arxiv.org/html/2503.11653v1), [Cazzaro thesis](https://amsdottorato.unibo.it/id/eprint/10817/1/irene_cazzaro_digital_3d_reconstructions.pdf)
- Rome Reborn: running since 1996, Indiana University, led by Bernard Frischer, models Rome c. 320 AD. — [Big Think](https://bigthink.com/the-past/rome-reborn-model/); methodology paper: [Frischer et al., Roman Forum (PDF)](https://www.iath.virginia.edu/images/pdfs/FrischerEtAlRomanForum.pdf) (not read in full)

### Inferences
- Practical scheme for WorldLibs: per-object certainty tier (attested / inferred from parallel / conjectural) stored as data, surfaced in UI via a toggle (e.g. desaturate or dither conjectural items), plus a "sources and conjecture" panel per hall. Mirrors Charter documentation + paradata.
- Cinematic grade can stay on by default; uncertainty overlay is opt-in, as in reviewed projects.

### Gaps
- Exact London Charter wording on paradata and "intellectual transparency"; not fetched. Read londoncharter.org full text.
- Exact Seville Principles list (8 principles) not verified; Wikipedia fetch 404'd.

## Part A2 - Exemplar projects

### Takeaway
Credible cinema-plus-accuracy projects pair named academic advisers with explicit disclosure of what is unknown (e.g. Ubisoft says House of Wisdom's location and shape were unknown).

### Cited Findings
- AC Mirage / Discovery Tour: Medieval Baghdad (free educational mode) consulted Dr Vanessa Van Renterghem (medieval Baghdad specialist), Dr Ali Olomi, and in-house historian Dr Raphael Weyland. [snippet from aggregator-heavy results] — [MobileSyrup interview](https://mobilesyrup.com/2023/10/07/assassins-creed-mirage-interview-ubisoft-montreal-raphael-weyland-historian-interview/), [Ubisoft news](https://news.ubisoft.com/en-us/article/3jsMF7A3sNwJQIZnAR3zkA/games-as-historical-immersion-and-preservation-creating-fun-and-plausible-worlds-for-players), [Den of Geek](https://www.denofgeek.com/games/assassins-creed-mirage-lost-city)
- House of Wisdom: "We didn't really know where it was exactly or even the shape of it"; devs drew on other cities and writings (i.e. openly conjectural). [snippet] — [Den of Geek](https://www.denofgeek.com/games/assassins-creed-mirage-lost-city)
- Cambridge (IJMES) article on teaching Islamicate history via the games exists: [Cambridge Core PDF](https://core-cms.cambridgecore.org/core/services/aop-cambridge-core/content/view/8F4DB03AEA109C3F5AF21226C3F026BC/S0020743824000795a.pdf/the-200-million-student-classroom-teaching-islamicate-history-one-video-game-at-a-time.pdf) (not read)
- Library of Celsus (Ephesus): excavated by Austrian archaeologists 1903-04; façade re-erected by anastylosis 1970-78 under Volker Michael Strocka. [W] — [Wikipedia](https://en.wikipedia.org/wiki/Library_of_Celsus)

### Inferences
- A "what we don't know" note per scene (Ubisoft-style candour) is a cheap trust win.

### Gaps
- Not researched: Notre-Dame digital twin (Ubisoft/Assassin's Creed Unity link, Andrew Tallon scan), Alexandria/Bibliotheca Alexandrina, Lascaux/Chauvet, Google Arts & Culture, British Library/Bodleian exhibitions, Discovery Tour Egypt/Greece/Viking UI treatment of sources. No evidence gathered; do not assert.

## Part B1 - Ancient materials

### Takeaway
Roman rolls: ~25-33 cm tall, ~20 sheets/roughly 3-4 m typical (accounts vary up to ~9-10 m), on a rod (umbilicus) with a tag (sillybos/titulus); stored in niches and cylindrical capsae/boxes. Celsus: ~12,000 scrolls in tiered niches with double walls.

### Cited Findings
- Roll height normally 25-33 cm in the Roman period; ends fastened to a stick (umbilicus); a ticket (titulus; Greek sillybos/sittubos) of papyrus or parchment hung over an edge. [snippet] — [historyofinformation.com](https://historyofinformation.com/detail.php?id=2677); heights: [Pliny and standardized roll heights (Chicago)](https://www.journals.uchicago.edu/doi/10.1086/367336)
- Length: contradicting snippets: "eleven or twelve feet" (~3.4-3.7 m) vs "average thirty feet, seldom more than thirty-five". [snippet] — [historyofinformation.com](https://historyofinformation.com/detail.php?id=2677); Encyclopaedia Romana says ~20 sheets, 11-12 ft, but its height of "9.5-10.5 in" (~24-27 cm) — [Encyclopaedia Romana](https://penelope.uchicago.edu/encyclopaedia_romana/scroll/scrollcodex.html)
- Umbilicus/cornua = projecting knobs on rod ends, could be brightly coloured; Pompeii art omits them. Storage: stacked horizontally on shelves, or upright in cylindrical capsae (lids, straps); larger box = scrinium; beech preferred. Codex replaced roll by 4th c. AD. — [Encyclopaedia Romana](https://penelope.uchicago.edu/encyclopaedia_romana/scroll/scrollcodex.html)
- Celsus library: three levels of bookcases; niches avg 2.55 x 1.1 x 0.58 m; ~12,000 scrolls (up to 16,000 with free-standing boxes); double walls possibly for humidity/temperature control; faces east for eastern light; built c. 110s-135 CE. [W] — [Wikipedia](https://en.wikipedia.org/wiki/Library_of_Celsus)
- Nineveh: BM counts 30,943 "tablets" in the Ashurbanipal collection; one example 27.5 x 10.5 x 2.6 cm; tablets kiln-baked (damp Assyrian climate), and survived the burning of Nineveh. [snippet/W-derived] — [Wikipedia Library of Ashurbanipal](https://en.wikipedia.org/wiki/Library_of_Ashurbanipal)

### Inferences
- Do not fill Celsus niches with codices; use rolls (lying in niches) and capsae. Pergamon/Alexandria interiors are conjectural; mark as such.

### Gaps
- Papyrus colour (tan/straw; darker with age) not sourced. Nineveh tablet colour, original shelving (reported baskets/shelves), Pergamon niche spacing, oil-lamp light levels/lamp types: unsourced. Do not rely on memory.

## Part B2 - Medieval, Asian, African

### Takeaway
Medieval chained books: fore-edge outward, flat or on lecterns, chain on fore-edge-side; titles on fore-edge; clasps/bosses on boards. Dunhuang bundles: scrolls wrapped in bamboo-splint sutra wrappers with silk. Palm-leaf: strung leaves between wooden boards.

### Cited Findings
- Hereford: largest surviving chained library; 227 medieval MSS, ~1,200 early printed books; chain via ring to iron rod along shelf; books shelved with fore-edge out so they can be set down and opened without twisting the chain. [snippet/W] — [Wikipedia Chained library](https://en.wikipedia.org/wiki/Chained_library), [Guinness](https://www.guinnessworldrecords.com/world-records/677659-largest-chained-library)
- Hereford's stall/lectern system adopted a few years later at Duke Humfrey's (Bodleian). [W-derived] — same Wikipedia
- Medieval books laid flat, fore-edge out; brass corner/centre bosses protected leather; shelfmarks and titles written on fore-edges; wooden boards + fore-edge clasps keep parchment flat; most bindings plain with metal bosses. [snippet] — [Cornell medieval book exhibit](https://exhibits.library.cornell.edu/medievalbook/feature/leather-and-chains), [British Library "Written on the edge"](https://britishlibrary.typepad.co.uk/digitisedmanuscripts/2015/02/written-on-the-edge.html), [Princeton closures](https://static-prod.lib.princeton.edu/visual_materials/hb/cases/closures/index.html)
- Dunhuang Cave 17: Stein estimated 1,050 Chinese and 80 Tibetan bundles, each over a dozen scrolls; sutra wrappers = bamboo splints bound with twined silk; bundles often without cloth cover. [snippet] — [IDP blog](https://idpuk.blogspot.com/2015/09/beyond-paper-silk.html), [V&A wrapper](https://collections.vam.ac.uk/item/O85717/the-stein-collection-sutra-wrapper-unknown), [earlytibet.com](https://earlytibet.com/about/whereabouts/)
- Palm leaf: hole through each leaf for stringing; wooden boards at front and back. [snippet] — [Wikipedia Palm-leaf manuscript](https://en.wikipedia.org/wiki/Palm-leaf_manuscript)
- Nalanda's library was called Dharmaganja ("Treasury of Knowledge"); the popular "millions of books" figure comes from low-rigor sources. [low-confidence] — [organiser.org](https://organiser.org/2025/12/13/329939/bharat/ancient-wisdom-of-nalanda-mahavihara-exploring-the-legendary-library-and-its-global-scholarly-influence/amp/)
- Timbuktu: Ahmed Baba Institute founded 1973, ~18,000 MSS; local families rescued tens of thousands in 2012-13. — [Africanews](https://www.africanews.com/2025/11/16/timbuktus-ancient-manuscripts-return-after-years-away/)

### Inferences
- A chained-library scene: spines inward/hidden, fore-edge titles, rod on shelf, lectern with bench. Book sizes vary widely (folios dominate).

### Gaps
- Timbuktu leather wrappers/satchels/boxes: no reliable source found. Duke Humfrey's specifics (dates, colours, finishes), Hereford shelf wood/finish: not sourced. Nalanda physical fabric: no scholarly source retrieved.

## Part B3 - Baroque/Rococo halls

### Takeaway
Only basic facts verified; per-hall binding colours, fire policy and fresco palettes are unverified.

### Cited Findings
- Admont: 1776, architect Josef Hueber, hall 70 m long, tripartite; seven ceiling frescoes by Bartolomeo Altomonte (80+ years old); ~60,000 volumes displayed of ~200,000 total, 1,400+ MSS, 530 incunabula; design motto about light filling the room. — [Stift Admont](https://stiftadmont.at/en/about-the-abbey-library/)
- Admont bindings: described as soft vellum and aged leather [snippet, unverified]; page did not detail them. The "white/pale bindings" idea is NOT confirmed. — [Mickey Shannon photo essay](https://www.mickeyshannon.com/photo/bindings-of-belief-the-ancient-tomes-of-admont-abbey/) (photographer blog, low authority)
- Strahov Philosophical Hall: begun by Jan Ignac Palliardi 1783; walnut neoclassical interior by Jan Lahofer; Maulbertsch ceiling 1794 (with Martin Michl, ~6 months; theme "Journey of mankind to wisdom"); shelving was carved gilded floor-to-ceiling walnut rescued from another South Bohemian monastery. — [Strahov Monastery](https://www.strahovskyklaster.cz/en/architecture/library-halls), [prague.eu](https://www.prague.eu/en/object/places/403/strahov-library-theological-hall-philosophical-hall-strahovska-knihovna)
- Prunksaal: Johann Bernhard Fischer von Erlach designed, built 1723-26 by son Joseph Emanuel; frescoes Daniel Gran. — [ONB Prunksaal PDF](https://webarchiv.onb.ac.at/web/20150803104515/http://www.onb.ac.at/files/Prunksaal_en.pdf)

### Inferences
- Strahov = dark warm walnut + gilt; Admont = white/cream stucco with pastel gilt; this is general knowledge, treat as unverified until checked against official sites.

### Gaps
- Wiblingen, Melk, St Gallen, Mafra: nothing retrieved. Why candles/fire were barred (widely stated; no primary source retrieved). Shelving finishes, daylight design specifics, fresco palettes: not sourced. Source disagreement not assessable.

## Part B4 - 18th-19th c.

### Takeaway
Long Room barrel vault and gallery date to 1860s; Labrouste's Sainte-Geneviève is 1843-50 exposed iron and an early gas-lit library; publisher's cloth appears 1820s, with credit disputed.

### Cited Findings
- Trinity Long Room: Deane and Woodward design; barrel-vaulted oak-sheeted roof replacing flat plaster ceiling and transverse bookcases on remodelled gallery, complete by May 1861 (so the original 1712-32 hall was flat-ceilinged, single-level). — [TCD Library](https://www.tcd.ie/library/exhibitions/choicebooks/newlibrary.php), [TCD Long Room](https://www.tcd.ie/Library/old-library/long-room/)
- Sainte-Geneviève: built 1843-50, exposed iron columns/arches; Labrouste experimented with indoor gas lighting. — [Britannica Labrouste](https://www.britannica.com/biography/Henri-Labrouste), [MoMA](https://www.moma.org/explore/inside_out/2013/05/08/henri-labroustes-precision-and-liberty-2/)
- State Library Victoria reading room fitted with gas lighting May 1856 (one local data point). — [SLV blog](https://blogs.slv.vic.gov.au/our-stories/ask-a-librarian/let-there-be-light)
- Cloth bindings: Pickering credited, Baxter's Poetical Fragments (1821) possibly first; cloth impervious to glue c. 1823; Leighton's 1849 circular claims 1825 for Archibald Leighton. Sources disagree. — [bookbinding.com](https://bookbinding.com/origins-of-cloth-bindings/), [Ligatus](https://www.ligatus.org.uk/node/550)

### Inferences
- Anything before ~1825 should be leather/vellum/paper boards, not cloth; Long Room scenes pre-1860 must be flat-ceilinged.

### Gaps
- Library of Congress (1897) details, electric lighting dates for libraries, aged leather/paper colour values (red rot, foxing, tanning): not sourced. Ligatus glossary pages for calf/morocco terms not read.

## Part B5 - Common inaccuracies

### Takeaway
No scholarly source found cataloguing these; the list below is inference from verified facts above.

### Cited Findings
- (none specific; see sections above for the facts they derive from)

### Inferences
- Uniform modern spines: medieval books were fore-edge out with titles on fore-edges; pre-1500 spines mostly unlettered.
- Spine labels and gilt tooling arrive with early modern/Baroque calf and later; cloth only after 1820s.
- Candles beside books: reported widely as banned in great halls; unverified here.
- Scroll size: papyrus rolls ~25-33 cm tall, not giant; Celsus niches ~2.55 m tall, i.e. one niche held many rolls, not a single large item.
- Clay tablets: baked, palm-sized to ~27 cm; not codex-like.
- Too-clean surfaces: evidence-based aging (foxed paper, worn leather) is expected but needs sourcing.

### Gaps
- Dedicated critique of film/game/AI library depictions: not found.
