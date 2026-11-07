# Game-like UX patterns for exploration and learning (WorldLibs)

Method note: ~19 tool calls; several fetches failed (Variety 402, LBB 403, Minecraft.net timeout). Claims below rest on search-result summaries unless noted; primary-source verification still needed for numbers. No claim is listed without a link; everything else is in Inferences or Gaps.

## Assassin's Creed Discovery Tour: what worked, evidence

### Takeaway
Discovery Tour = same open world, combat off, historian-curated guided tours plus free roam; early studies (Éthier, Univ. de Montréal) report learning gains close to a teacher lesson, but a teacher still did better in the first study. Strongest transferable pattern: guided tours AND free roam in the same space, with stations as "museum exhibits".

### Cited Findings
- Egypt tour: Éthier study, 300 students aged 12-17 from nine schools; 20 did the tour vs 20 got a 12-minute teacher lecture; teacher group scored higher, tour group still improved from 22% to 44% — [Variety via search summary](https://variety.com/2018/gaming/news/assassins-creed-origins-discovery-tour-effectiveness-1202861325) (full article not retrievable; sample figures are ambiguous between "300" and "40" groups, verify).
- Later Univ. de Montréal work with ~400 students reported outcomes "practically identical" to classroom, without a teacher present — same Variety summary; unverified in full text.
- Framed as "just another tool for educators, not a replacement" — same source.
- Ancient Greece: 300+ stations, 30 guided tours, 29 regions, five themes (philosophy, famous cities, daily life, war, myths); world "evolves into a virtual museum" — [Ubisoft Discovery Tour page / search summary](https://www.assassinscreed.com/discoverytour); [Ubisoft Montréal behind-the-scenes](https://montreal.ubisoft.com/en/discovery-tour-ancient-greece-a-behind-the-scene-look-with-maxime-durand)
- Viking Age moved from museum-style tours to a more narrative-driven approach, nonviolent "educational playground" — [Ubisoft news](https://news.ubisoft.com/en-gb/article/6WpV6SBWGb59fcnYhT2KBb/assassins-creed-discovery-tour-viking-age-out-now)
- Series now spans Egypt, Greece, Viking Age, Medieval Baghdad, plus a mobile app and a webapp (shows the format ports to lighter clients) — same Ubisoft page.
- An Italian peer-reviewed article on Discovery Tour as educational tool exists — [IJET/CNR](https://ijet.itd.cnr.it/index.php/td/article/download/1399/1252) (not read in depth).

### Inferences
- Map to WorldLibs: "tours" = curated 5-8 stop paths per library (e.g. "Alexandria: what we know / what we guess"); free roam stays default. Cost: low-moderate (JSON of stops + camera waypoints + one HUD component).
- Learning evidence is modest and from the vendor-adjacent academic team; treat as "plausibly comparable to short lecture", not proof.
- Narrative tour (Viking) vs station tour (Egypt/Greece): offer both lengths.

### Gaps
- No independent critical reception/sales data found. Quiz mechanics in Discovery Tour (end-of-tour quizzes) not confirmed in my sources.

## Roblox, Minecraft Education, Uncensored Library, Fortnite heritage

### Takeaway
Stickiness on these platforms comes from avatar presence, social co-presence, novelty and goals; most is unavailable on a no-server site. The Uncensored Library is the closest conceptual sibling: a walkable library where the architecture is the interface and books are the payload.

### Cited Findings
- Uncensored Library: built by Reporters Without Borders with BlockWorks, launched 2020; ~300 books across 12 wings of banned journalism, readable as Minecraft books — [LBB / search summary](https://www.lbbonline.com/immortals/entry/3758); [Minecraft.net](https://www.minecraft.net/en-us/article/uncensored-library)
- Reported reach: 25M+ visitors (another summary: 20M+ gamers from 165 countries); 2022 Peabody (Interactive); used in schools and universities; permanent in London Design Museum exhibit — [Substack summary](https://justindownes.substack.com/p/minecrafts-uncensored-virtual-library); [PCPer](https://pcper.com/2020/07/reporters-without-borders-minecraft-the-uncensored-library/). Visitor figures conflict slightly and are secondary.
- Roblox positions education around students' existing associations: adventure, confidence, novelty, social connection; Learning Hub curates experiences — [Roblox newsroom](https://about.roblox.com/newsroom/2023/08/where-learning-happens); [Roblox Education](https://about.roblox.com/education)
- Museum examples on Roblox: Computer History Museum "TechQuest" with MELON; The Met "Replica" with Verizon (AR scan to Roblox) — [CHM press](https://computerhistory.org/press-releases/chm-roblox/); [PCGamesN](https://www.pcgamesn.com/roblox/techquest-immersive-learning)

### Inferences
- Borrow from Uncensored Library: wings = themes, book as the unit of reward, one-line mission statement on entry. Do not borrow: multiplayer reach.
- Roblox stickiness mechanics (obbies, collectibles, social) mostly need accounts/servers; the static equivalents are collectibles in localStorage and shareable images.
- Reader-facing line like "Read a banned/lost book" ties mission to emotion without gamified violence.

### Gaps
- No sourced data on Roblox retention for educational experiences, Minecraft Education library worlds beyond Uncensored, or Fortnite Creative heritage maps. Not found in this pass.

## Museum games and web explainers (predict, scrub, manipulate)

### Takeaway
The best-supported pattern is "place your bets": prediction before reveal, ending in a sandbox. Every Joule already uses it; the research base (self-explanation) backs it.

### Cited Findings
- Every Joule: students "predict, test and prove each idea, lift the flap for the answer and earn a stamp"; diagrams "lift off the page as a 3D ink drawing"; energy as glowing colour; live browser 3D — [Every Joule](https://iamtechartist.com/every-joule/)
- Nicky Case four patterns: Puzzle It Out (SineRider), Place Your Bets (NYT "You Draw It"), Role Play (BBC A Syrian Journey), Sandbox Mode (Earth: A Primer) — [ncase.me](https://blog.ncase.me/explorable-explanations-4-more-design-patterns/)
- Withholding explanation creates a "cognitive gate" that motivates seeking it; most explorables end in a sandbox; "start with my question, end with their questions" — [Explorable Explanations](https://blog.ncase.me/explorable-explanations); search summary
- Distill/UW five affordances: connect people and data, make systems playful, prompt self-reflection (prediction prompts, low-stakes quizzes improve recall), personalize reading, reduce cognitive load via details-on-demand — [Hohman et al., Distill 2020](https://distill.pub/2020/communicating-with-interactive-articles/)
- Same paper: such articles are labor-intensive to make — same source.
- Museum of the World (British Museum + Google, Nov 2015): ~4,500 objects on a timeline you can browse by time, continent and culture; WebGL "Chrome experiment" — [Design Week](https://www.designweek.co.uk/issues/16-22-november-2015/british-museum-moves-its-collection-online-with-museum-of-the-world-timeline/); [Google Experiments](https://experiments.withgoogle.com/the-museum-of-the-world)
- Ciechanowski: sliders/direct manipulation essays on mechanics, curves, engines; I found no author statement of method — [FlowingData tag](https://flowingdata.com/tag/bartosz-ciechanowski)

### Inferences
- "Living page" recipe: question -> predict (drag a handle / pick a guess) -> reveal with 3D animation -> sandbox slider -> one open question. E.g. Darwin's divergence diagram: "Predict which lineage splits first"; Euclid: guess the proof step before the coloured solid unfolds. Cost: moderate per page (hand-built three.js scene each), ~2-4 days; shared "predict/reveal/stamp" component is cheap.
- Timeline scrubbing across libraries (Museum of the World style) fits the globe: slider = year, libraries fade in/out. Cost low; data needs founding/destruction dates with uncertainty bars.
- Not tested: Rijksmuseum, Met Unlocked, Smithsonian, Arts & Culture experiments; no sourced notes obtained.

### Gaps
- No evidence on Rijksmuseum/Met Unlocked/Smithsonian games or Arts & Culture experiments engagement. Ciechanowski's own principles not found.

## Light mechanics without accounts or servers; ethics of gamifying loss

### Takeaway
Stamps, collections, timeline ordering and daily-style challenges are all static-site cheap (localStorage + URL hash). Evidence says points/badges raise engagement more than learning, so reward understanding and curiosity, not completion. Treat destruction as testimony, never as a win/lose game.

### Cited Findings
- Museum gamification studies: gamification boosts reward/engagement dimensions, effect on learning outcomes "less marked" — [Souropetsis et al. 2023 (UCLan)](https://clok.uclan.ac.uk/49519/1/Souropetsisetal.2023.pdf); search summary
- Prediction prompts and low-stakes quizzes aid recall — [Distill 2020](https://distill.pub/2020/communicating-with-interactive-articles/)
- Library of Babel (libraryofbabel.info): every 3,200-character page, 29 characters, ~10^4677 books, computed on demand by algorithm, nothing stored; location (hexagon, wall, shelf, volume) encodes the text — [Library of Babel About](https://libraryofbabel.info/About.html); [Smithsonian](https://www.smithsonianmag.com/innovation/digital-library-contains-every-phrase-that-could-ever-be-uttered-180956623)
- Ethics: scholarship on This War of Mine argues war games can build empathy when the player never feels in control and no choice is "correct"; "should disaster games be fun" is an open critique — [Play the Past](https://www.playthepast.org/?p=5618); [Endless Mode](https://www.endlessmode.com/article/romanticizing-tragedy-should-disaster-games-be-fun)
- Heaven's Vault: players may mistranslate and the game follows through; ~1,000-word invented script, ~20 prototypes; designed to feel like translating, not linguistics — [Game Developer](https://gamedeveloper.com/design/how-inkle-developed-its-own-ancient-language-for-i-heaven-s-vault-i-); [GoNintendo](https://gonintendo.com/archives/327504-heaven-s-vault-devs-on-the-importance-of-letting-players-get-things-wrong)
- Obra Dinn: freeze-frame death scenes, notebook, cross-referencing to deduce fates of 60 people — [Wikipedia](https://en.wikipedia.org/wiki/Return_of_the_Obra_Dinn); [Game Developer](https://gamedeveloper.com/design/for-lucas-pope-i-return-of-the-obra-dinn-i-was-a-bunch-of-appealing-design-problems)

### Inferences (design ideas, ranked by value/cost)
1. Library card / passport: one stamp per library visited, per tour finished, per Living Page proven. localStorage JSON, ~0.5 day. Add "export card as PNG" via canvas (~0.5 day). Reset button; page works without it.
2. Evidence ledger (Obra Dinn-style): for lost libraries, user sorts claims into attested / inferred / legend; reveals evidence tag. Doubles as the "never present myth as fact" mechanic. 1-2 days.
3. Timeline ordering puzzle (order libraries by founding). Cheap; only use libraries with secure dates; show uncertainty in answers.
4. Quest "find the book Darwin cites": deep link + shelf highlight. Cheap if catalog metadata exists.
5. Daily seed challenge via date-hash; no server needed. Low value unless audience returns; defer.
6. Infinite Library of Babel room: deterministic procedural shelf, seed in URL, genuinely static. Fun side room, flag as fiction (Borges), not a real library. ~1-2 days.
7. Mistranslation tolerance (Heaven's Vault): in a script/glyph Living Page, let users guess wrongly without game-over.
- Destruction: frame as "what survives / what we know", never "save the books before the fire" as a timer. Prefer witness voices and reconstruction confidence over win/lose. Alexandria, Timbuktu 2013, Weimar 2004: present as documented sources only; my searches did not return specific heritage-ethics guidance, so run a human sensitivity pass.
- Overjustification risk: keep stamps cosmetic; no streaks, no leaderboards, no "collect all" pressure.

### Gaps
- No sourced study on streaks/daily challenges for learning; no sourced ethics guidance specific to destroyed libraries; GDC Obra Dinn "deduction" details beyond summaries not read.

## Cozy and walking-sim references

### Takeaway
Gone Home's lesson fits: remove goals and let objects tell the story; walking is the discovery. Obra Dinn adds deduction; Heaven's Vault adds tolerant translation. Unpacking, Firewatch, The Witness, A Short Hike not researched here.

### Cited Findings
- Gone Home strips combat, objectives and quest markers; story lives in objects left behind; walking is the discovery — [Game Developer](https://www.gamedeveloper.com/design/how-i-gone-home-i-s-design-constraints-lead-to-a-powerful-story); [Mechanics of Magic](https://mechanicsofmagic.com/2021/04/28/the-genius-of-gone-home/)
- Noted accessibility barrier: heavy reliance on visual storytelling and reading — same Mechanics of Magic series.

### Inferences
- Borrow: each shelf holds a few "left-behind" objects (reader's marginalia, a lost-ticket slip, a plan fragment) revealed by proximity, no markers. Cheap content-driven.
- Borrow: A Short Hike style soft goals (unforced, small payoff) -- from general knowledge, unsourced.
- Reading-heavy design means narration/TTS and text-size controls matter (see accessibility).

### Gaps
- No sources fetched for Unpacking, Firewatch, The Witness, A Short Hike.

## Accessibility and non-gamer users

### Takeaway
Make the game layer opt-in and parallel to a plain reading path. Only partial sourcing; mostly engineering inference.

### Cited Findings
- Distill: personalization lets readers progress at their own pace; details-on-demand lowers load — [Distill 2020](https://distill.pub/2020/communicating-with-interactive-articles/)
- Discovery Tour itself separates exploration from combat as a toggle-style mode, proving a "no-pressure" mode can be a first-class product — [Variety summary](https://variety.com/2018/gaming/news/assassins-creed-origins-discovery-tour-effectiveness-1202861325)

### Inferences
- Modes: Guided tour (auto-camera), Free roam, Reader (list view with no 3D). Every 3D action has a button/keyboard equivalent; touch: tap-to-move waypoints rather than virtual joysticks.
- `prefers-reduced-motion`: replace page-turn and fly-ins with cross-fade; Living Pages show end-state with a step slider.
- Stamps and quests hidden behind a "Show activities" toggle; never gate content.
- Text alternatives for every diagram; keep tasks completable without timing.

### Gaps
- No sourced WCAG-for-WebGL guidance or reduced-motion study retrieved.

## Similar library/book 3D projects

### Takeaway
Only the Uncensored Library and Library of Babel were verified here. MyShelves three.js, 3dbookshop.com, Pergamon As It Once Was, Alexandria attempts, Internet Archive reader were not researched.

### Cited Findings
- Uncensored Library (see above) and Library of Babel (see above): both succeed on one strong conceit, minimal UI, and content that is real.
- Museum of the World shows timeline-first browsing at scale — [Design Week](https://www.designweek.co.uk/issues/16-22-november-2015/british-museum-moves-its-collection-online-with-museum-of-the-world-timeline/)

### Inferences
- Common lesson: one-sentence conceit + real texts + shareable moment beats feature breadth.

### Gaps
- Pergamon, 3dbookshop, MyShelves, Internet Archive BookReader, Alexandria VR: not searched; run a follow-up if WorldLibs wants competitive notes.
