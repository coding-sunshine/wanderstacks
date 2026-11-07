# WorldLibs: verified public-domain full-text sources

Method (2026-11-07): Gutendex `?ids=` lookups for candidate PG IDs (the `?search=` endpoint hung/timed out and the host returned 503 after repeated hits, so IDs were guessed from memory and then verified against the API response: title, author, translator, death years, download count). Standard Ebooks (SE) existence verified from live `standardebooks.org/ebooks?query=...` result pages (paths below are exactly as listed there). "Verified" = seen in a response this session. Everything else is marked unverified.
Legend: PG URL = `https://www.gutenberg.org/ebooks/<id>`; SE URL = `https://standardebooks.org<path>`; Gutendex record = `https://gutendex.com/books/<id>`.

## 1. Verified Project Gutenberg IDs (English editions)

### Takeaway
About 60 catalog books have a Gutendex-verified PG ID (table below). Of these, ~55 also have a verified SE edition. SE is the better text source wherever it exists; PG is the fallback.

### Cited Findings
Download counts are the Gutendex `download_count` field. "T" = translator (death year) as given by Gutendex. Source for every PG row: [Gutendex ids lookup](https://gutendex.com/books/?ids=1342) (same endpoint, ids swapped per row).

| # | Title / author | PG ID | dl | Translator (d.) | SE path (verified listing) |
|---|---|---|---|---|---|
| 1 | Pride and Prejudice, Austen | 1342 | 208430 | - | /ebooks/jane-austen/pride-and-prejudice |
| 2 | Emma, Austen | 158 | 24182 | - | /ebooks/jane-austen/emma |
| 3 | Frankenstein, Shelley (1831 text, per title field "or, The modern Prometheus") | 84 | 182729 | - | /ebooks/mary-shelley/frankenstein |
| 4 | Jane Eyre, C. Bronte | 1260 | 57519 | - | /ebooks/charlotte-bronte/jane-eyre |
| 5 | Wuthering Heights, E. Bronte | 768 | 35636 | - | /ebooks/emily-bronte/wuthering-heights |
| 6 | Great Expectations, Dickens | 1400 | 38268 | - | /ebooks/charles-dickens/great-expectations |
| 7 | A Christmas Carol, Dickens | 46 | 28618 | - | /ebooks/charles-dickens/a-christmas-carol |
| 8 | Middlemarch, Eliot | 145 | 70535 | - | /ebooks/george-eliot/middlemarch |
| 9 | Moby Dick, Melville | 2701 | 168089 | - | /ebooks/herman-melville/moby-dick |
| 10 | The Scarlet Letter, Hawthorne | 25344 | 40216 | - | /ebooks/nathaniel-hawthorne/the-scarlet-letter |
| 11 | Walden (and Civil Disobedience), Thoreau | 205 | 33667 | - | /ebooks/henry-david-thoreau/walden |
| 12 | Leaves of Grass, Whitman | 1322 | 12991 | - | /ebooks/walt-whitman/leaves-of-grass |
| 13 | Huckleberry Finn, Twain | 76 | 36044 | - | /ebooks/mark-twain/the-adventures-of-huckleberry-finn |
| 14 | Dracula, Stoker | 345 | 78131 | - | /ebooks/bram-stoker/dracula |
| 15 | Dorian Gray, Wilde | 174 | 52851 | - | /ebooks/oscar-wilde/the-picture-of-dorian-gray |
| 16 | Heart of Darkness, Conrad | 219 | 23064 | - | no standalone; inside /ebooks/joseph-conrad/short-fiction (inferred, contents not opened) |
| 17 | Gulliver's Travels, Swift | 829 | 18824 | - | /ebooks/jonathan-swift/gullivers-travels |
| 18 | Robinson Crusoe, Defoe | 521 | 16116 | - | /ebooks/daniel-defoe/the-life-and-adventures-of-robinson-crusoe |
| 19a | Complete Works, Shakespeare | 100 | 76146 | - | per-play SE: e.g. /ebooks/william-shakespeare/hamlet (37 plays listed) |
| 19b | Hamlet, Shakespeare | 1524 | 10535 | - | /ebooks/william-shakespeare/hamlet |
| 20 | Paradise Lost, Milton | 26 | 12923 | - | /ebooks/john-milton/paradise-lost |
| 21 | Canterbury Tales and Other Poems, Chaucer | 2383 | 13244 | - (Middle English) | /ebooks/geoffrey-chaucer/the-canterbury-tales |
| 22 | Beowulf, Hall tr. | 16328 | 50413 | J. L. Hall (1928) | /ebooks/anonymous/beowulf/john-lesslie-hall |
| 22b | Beowulf, Gummere tr. | 981 | 4755 | F. B. Gummere (1919) | - |
| 23 | Leviathan, Hobbes | 3207 | 42218 | - | /ebooks/thomas-hobbes/leviathan |
| 24 | Adventures of Sherlock Holmes, Doyle | 1661 | 96353 | - | /ebooks/arthur-conan-doyle/the-adventures-of-sherlock-holmes |
| 25 | Alice's Adventures in Wonderland, Carroll | 11 | 121623 | - | /ebooks/lewis-carroll/alices-adventures-in-wonderland/john-tenniel |
| 26 | Through the Looking-Glass, Carroll | 12 | 15769 | - | /ebooks/lewis-carroll/through-the-looking-glass/john-tenniel |
| 27 | The Time Machine, Wells (d. 1946) | 35 | 27738 | - | /ebooks/h-g-wells/the-time-machine |
| 28 | Treasure Island, Stevenson | 120 | 31688 | - | /ebooks/robert-louis-stevenson/treasure-island |
| 29 | Wonderful Wizard of Oz, Baum | 55 | 38574 | - | /ebooks/l-frank-baum/the-wonderful-wizard-of-oz |
| 30 | Peter Pan [Peter and Wendy], Barrie (d. 1937) | 16 | 25701 | - | /ebooks/j-m-barrie/peter-and-wendy |
| 31 | The Jungle Book, Kipling (d. 1936) | 236 | 18135 | - | /ebooks/rudyard-kipling/the-jungle-book |
| 32 | Wind in the Willows, Grahame (d. 1932) | 289 | 10554 | - | /ebooks/kenneth-grahame/the-wind-in-the-willows |
| 33 | Anne of Green Gables, Montgomery (d. 1942) | 45 | 31124 | - | /ebooks/l-m-montgomery/anne-of-green-gables |
| 34 | Little Women, Alcott | 514 | 23413 | - | /ebooks/louisa-may-alcott/little-women |
| 35 | Aesop, 300 fables | 21 | 12703 | G. F. Townsend (1900) | /ebooks/aesop/fables/v-s-vernon-jones (different translator, Jones; see PD notes) |
| 36 | Les Miserables, Hugo | 135 | 19245 | I. F. Hapgood (1928) | /ebooks/victor-hugo/les-miserables/isabel-f-hapgood |
| 37 | Notre-Dame de Paris (Hunchback), Hugo | 2610 | 7362 | I. F. Hapgood (1928) | /ebooks/victor-hugo/notre-dame-de-paris/isabel-f-hapgood |
| 38 | The Three Musketeers, Dumas | 1257 | 13775 | not given by Gutendex | /ebooks/alexandre-dumas/the-three-musketeers/william-robson |
| 39 | Count of Monte Cristo, Dumas | 1184 | 53145 | not given by Gutendex | /ebooks/alexandre-dumas/the-count-of-monte-cristo/chapman-and-hall |
| 40 | Madame Bovary, Flaubert | 2413 | 8686 | E. Marx-Aveling (1898) | /ebooks/gustave-flaubert/madame-bovary/eleanor-marx-aveling |
| 41 | Swann's Way, Proust | 7178 | 6445 | C. K. Scott-Moncrieff (1930) | /ebooks/marcel-proust/in-search-of-lost-time/c-k-scott-moncrieff |
| 43 | Candide, Voltaire | 19942 | 14674 | not given | /ebooks/voltaire/candide/the-modern-library |
| 45 | Faust Part 1, Goethe | 14591 | 12999 | Bayard Taylor (1878) | /ebooks/johann-wolfgang-von-goethe/faust (translator not in path) |
| 46 | Grimms' Fairy Tales | 2591 | 37383 | not given | no SE hit for "grimm" |
| 47 | Andersen's Fairy Tales | 1597 | 11350 | not given | /ebooks/hans-christian-andersen/fairy-tales/various-translators |
| 48 | Thus Spake Zarathustra, Nietzsche | 1998 | 28518 | Thomas Common (1919) | /ebooks/friedrich-nietzsche/thus-spake-zarathustra/thomas-common |
| 49 | Critique of Pure Reason, Kant | 4280 | 18165 | J. M. D. Meiklejohn (1902) | /ebooks/immanuel-kant/critique-of-pure-reason |
| 50 | Metamorphosis, Kafka | 5200 | 53906 | David Wyllie (death year null) | no SE hit for "kafka" |
| 51 | War and Peace, Tolstoy | 2600 | 48773 | Aylmer Maude (1938) + Louise Maude (1939) | no SE hit for War and Peace in the tolstoy query |
| 52 | Anna Karenina, Tolstoy | 1399 | 18887 | Constance Garnett (1946) | /ebooks/leo-tolstoy/anna-karenina/constance-garnett |
| 53 | Crime and Punishment, Dostoyevsky | 2554 | 62172 | C. Garnett (1946) | /ebooks/fyodor-dostoevsky/crime-and-punishment/constance-garnett |
| 54 | Brothers Karamazov, Dostoyevsky | 28054 | 30834 | C. Garnett (1946) | /ebooks/fyodor-dostoevsky/the-brothers-karamazov/constance-garnett |
| 55 | Eugene Onegin, Pushkin | 23997 | 3511 | Henry Spalding (null) | /ebooks/alexander-pushkin/eugene-onegin/henry-spalding |
| 56 | Dead Souls, Gogol | 1081 | 4228 | D. J. Hogarth (null) | /ebooks/nikolai-gogol/dead-souls/c-j-hogarth |
| 57 | Don Quixote, Cervantes | 996 | 20435 | John Ormsby (1895) | /ebooks/miguel-de-cervantes-saavedra/don-quixote/john-ormsby |
| 58 | Divine Comedy, Longfellow | 1004 | 4138 | H. W. Longfellow (1882) | /ebooks/dante-alighieri/the-divine-comedy/henry-wadsworth-longfellow |
| 58b | Divine Comedy, Cary tr. | 8800 | 23074 | H. F. Cary (1844) | - |
| 59 | Decameron, Boccaccio | 23700 | 7416 | John Payne (1916) | /ebooks/giovanni-boccaccio/the-decameron/john-payne |
| 60 | The Prince, Machiavelli | 1232 | 45102 | W. K. Marriott (1927) | /ebooks/niccolo-machiavelli/the-prince/w-k-marriott |
| 61 | The Betrothed, Manzoni | not found | - | - | /ebooks/alessandro-manzoni/the-betrothed (SE only; PG unverified) |
| 62 | Pinocchio, Collodi | 500 | 10906 | Carol Della Chiesa (d. 1972) | /ebooks/carlo-collodi/the-adventures-of-pinocchio (translator not in path) |
| 63 | The Aeneid, Virgil (Dryden) | 228 | 11517 | John Dryden (1700) | /ebooks/virgil/the-aeneid/john-dryden |
| 64 | Metamorphoses, Ovid (Riley, Books I-VII only) | 21765 | 15066 | H. T. Riley (1878) | /ebooks/ovid/metamorphoses/various-translators |
| 65 | The Iliad, Pope tr.? no: ID 6130 | 6130 | 16648 | Alexander Pope (1744) | /ebooks/homer/the-iliad/william-cullen-bryant |
| 65b | The Iliad, Butler prose | 2199 | 14063 | Samuel Butler (1902) | - |
| 66 | The Odyssey, Butler prose | 1727 | 46518 | Samuel Butler (1902) | /ebooks/homer/the-odyssey/william-cullen-bryant |
| 66b | The Odyssey, Pope tr. | 3160 | 5620 | Alexander Pope (1744) | - |
| 68 | The Republic, Plato | 1497 | 26842 | Benjamin Jowett (1893) | /ebooks/plato/dialogues/benjamin-jowett (dialogues volume, includes Republic per SE; contents not opened) |
| 69 | Nicomachean Ethics, Aristotle | 8438 | 18203 | not given | /ebooks/aristotle/nicomachean-ethics/f-h-peters |
| 70 | Meditations, Marcus Aurelius | 2680 | 53383 | not given (SE: George Long) | /ebooks/marcus-aurelius/meditations/george-long |
| 71 | History of Herodotus Vol 1 | 2707 | 11804 | G. C. Macaulay (1915) | /ebooks/herodotus/histories/g-c-macaulay |
| 72 | First Six Books of Euclid (Casey ed.) | 21076 | 4494 | - | none found; Byrne 1847 not searched |
| 73 | Plays of Sophocles (Oedipus, Oedipus at Colonus, Antigone) | 31 | 5654 | Francis Storr (1919) | /ebooks/sophocles/oedipus-rex/francis-storr |
| 74 | Arabian Nights, Lang (selection) | 128 | 3845 | - | none |
| 74b | Thousand Nights and a Night vol 1, Burton | 3435 | 3281 | R. F. Burton (1890); 10 volumes | SE has only /ebooks/richard-f-burton/vikram-and-the-vampire |
| 76 | Ramayana, Griffith | not found | - | R. T. H. Griffith | /ebooks/valmiki/the-ramayana/ralph-t-h-griffith |
| 77 | Song Celestial / Bhagavad Gita, Arnold | 2388 | 7113 | Edwin Arnold (1904) | no SE hit for "bhagavad" |
| 78 | Tao Teh King, Legge | 216 | 8408 | James Legge (1897) | /ebooks/laozi/tao-te-ching/james-legge |
| 79 | Analects of Confucius, Legge | 3330 | 10462 | James Legge (1897) | /ebooks/confucius/analects/james-legge |
| 80 | The Art of War, Sun Tzu | 132 | 20613 | Lionel Giles (1958) | /ebooks/sun-tzu/the-art-of-war/lionel-giles |
| 83 | Tale of Genji (SE only) | not found | - | Arthur Waley (d. 1966) | /ebooks/murasaki-shikibu/the-tale-of-genji/arthur-waley |
| 85 | Rubaiyat of Omar Khayyam, FitzGerald | 246 | 2840 | E. FitzGerald (1883) | /ebooks/omar-khayyam/the-rubaiyat-of-omar-khayyam/edward-fitzgerald |
| 88 | (none verified) Shahnameh | - | - | - | none |
| 90 | Kalevala, Crawford | 5186 | 4408 | J. M. Crawford (1916) | /ebooks/elias-lonnrot/the-kalevala/john-martin-crawford |
| 91 | Volsunga Saga (Morris/Magnusson) | 1152 | 2945 | W. Morris (1896); E. Magnusson (1913) | - |
| 91b | Poetic Edda (Bellows) | not found | - | H. A. Bellows (d. 1957) | /ebooks/anonymous/the-poetic-edda/henry-adams-bellows |
| 93 | Kwaidan, Hearn | 1210 | 4012 | - (Hearn d. 1904) | none |
| 95 | Origin of Species | 1228 (1st ed.-style title); 2009 | 21755 / 6846 | - | /ebooks/charles-darwin/the-origin-of-species |
| 96 | Principia (Latin original, not Motte) | 28233 | 4645 | - (lang `la`) | - |
| 99 | Opticks, Newton | 33504 | 5438 | - | - |
| 100 | King James Bible | 10 | 24756 | - | - |
| 101 | The Koran, Rodwell | 2800 | 3528 | J. M. Rodwell (1900) | - |
| 102 | Dhammapada, Muller | 2017 | 6523 | F. Max Muller (1900) | - |
| 67 | Old Babylonian Gilgamesh (Jastrow & Clay, 1920) | 11000 | 3709 | - | none (Thompson 1928 not found) |

Row notes: row 65 title cell is a typo-ish label from drafting; the Iliad rows are 6130 (Pope) and 2199 (Butler). SE paths for Iliad/Odyssey are the Bryant verse translations, not Butler/Pope.

Sources: [Gutendex](https://gutendex.com/books/?ids=1342) for every PG ID/translator/death year/download count above. SE paths: [SE search "twain"](https://standardebooks.org/ebooks?per-page=48&query=twain), [SE search "tolstoy"](https://standardebooks.org/ebooks?per-page=48&query=tolstoy), [SE search "hugo"](https://standardebooks.org/ebooks?per-page=48&query=hugo), [SE search "homer"](https://standardebooks.org/ebooks?per-page=48&query=homer), and the same URL pattern with `query=` for dumas, flaubert, proust, voltaire, goethe, andersen, nietzsche, kant, dostoevsky, pushkin, gogol, cervantes, dante, boccaccio, machiavelli, manzoni, virgil, ovid, plato, aristotle, aurelius, herodotus, sophocles, valmiki, tao te, confucius, sun tzu, khayyam, kalevala, edda, aesop, beowulf, murasaki, darwin, kipling, doyle, conrad, carroll. SE author-level listing pages (`/ebooks?per-page=48&page=N`, 1228 unique paths scraped) confirmed Austen, Shelley, Bronte, Dickens, Eliot, Melville, Hawthorne, Thoreau, Whitman, Stoker, Wilde, Swift, Defoe, Milton, Chaucer, Hobbes, Wells, Stevenson, Baum, Barrie, Grahame, Montgomery, Alcott, Collodi.

### Inferences
- Where Gutendex lists multiple editions, the highest download count is the default pick: Odyssey 1727 (Butler) over 3160 (Pope); Iliad 2199 (Butler) is the stronger prose pairing with 1727 though Pope 6130 has more downloads (16648 vs 14063).
- Where SE uses a different translator than PG's top edition (Iliad/Odyssey: Bryant; Aesop: Jones vs Townsend; Nicomachean Ethics: F. H. Peters), the text differs; pick one translator per work and keep the PD note matched.
- Gutendex shows no `translators` entry for Dumas (1257, 1184), Voltaire, Grimm, Andersen: translator identity is unverified for those PG IDs. SE paths name William Robson (Three Musketeers) and Chapman and Hall (Monte Cristo) as the sources.

### Gaps
- IDs not verified (never returned by API): Mahabharata (Ganguli), Ramayana (Griffith), Journey to the West / Mission to Heaven, Tale of Genji (Suematsu), Dream of the Red Chamber (Joly), Rumi (Nicholson), Hafez, Shahnameh (Warner), Gulistan, Poetic Edda PG edition, Kokoro (Hearn / Soseki), Hojoki, Hyakunin Isshu (Porter), Upanishads (SBE), Book of the Dead (Budge), Jataka (Cowell), Galileo Dialogue (Salusbury), Pickthall Koran, Epic of Gilgamesh (Thompson 1928), The Betrothed, Euclid (Byrne). The Gutendex `?search=` endpoint timed out repeatedly and the host returned HTTP 503 during the session, so title lookups were not possible; only direct ID lookups worked.
- PG IDs for the 1611 KJV (10) is the 1611-text? Gutendex title is only "The King James Version of the Bible"; spelling vintage not confirmed.
- Frankenstein PG 84 is the 1831-style edition per general knowledge; Gutendex title string does not state it.
- Heart of Darkness inside SE short-fiction, and Republic inside SE dialogues: inferred from collection titles, not opened.
- PG 1228 vs 2009 Origin of Species: which edition each is (1st vs 6th) not verified.

## 2. Standard Ebooks coverage

### Takeaway
SE has an edition for roughly 55 of the catalog's books, including every major Victorian/American/Russian novel and most classical translations. SE does not appear to have (search returned no match): Kafka, Grimm's Fairy Tales, War and Peace, Bhagavad Gita, Rumi, Hafez, Shahnameh, Gulistan, Hearn, Newton, Galileo, Bible, Koran, Dhammapada, Upanishads, La Fontaine, Journey to the West, Euclid, Gilgamesh, Arabian Nights (only unrelated titles).

### Cited Findings
- SE has Tolstoy: Anna Karenina (Garnett), Resurrection, Hadji Murad, A Confession, What Is Art, Short Fiction, but no War and Peace in the query results — [SE tolstoy search](https://standardebooks.org/ebooks?per-page=48&query=tolstoy)
- SE has 37 Shakespeare plays as individual ebooks plus poetry — [SE listing](https://standardebooks.org/ebooks?per-page=48&page=1) (scraped pages 1-35, `/ebooks/william-shakespeare/*`)
- SE has Dumas: Three Musketeers (William Robson), Monte Cristo (Chapman and Hall), Black Tulip, Twenty Years After, Vicomte de Bragelonne — [SE dumas search](https://standardebooks.org/ebooks?per-page=48&query=dumas)
- SE has Hugo: Les Miserables and Notre-Dame de Paris (both Hapgood), Ninety-three, Toilers of the Sea — [SE hugo search](https://standardebooks.org/ebooks?per-page=48&query=hugo)
- SE has Tale of Genji (Waley), Poetic Edda (Bellows), Ramayana (Griffith), Tao Te Ching (Legge), Analects (Legge), Art of War (Giles), Rubaiyat (FitzGerald), Kalevala (Crawford) — [SE murasaki](https://standardebooks.org/ebooks?per-page=48&query=murasaki), [edda](https://standardebooks.org/ebooks?per-page=48&query=edda), [valmiki](https://standardebooks.org/ebooks?per-page=48&query=valmiki), [tao te](https://standardebooks.org/ebooks?per-page=48&query=tao+te), [confucius](https://standardebooks.org/ebooks?per-page=48&query=confucius), [sun tzu](https://standardebooks.org/ebooks?per-page=48&query=sun+tzu), [khayyam](https://standardebooks.org/ebooks?per-page=48&query=khayyam), [kalevala](https://standardebooks.org/ebooks?per-page=48&query=kalevala)
- SE Origin of Species, Descent of Man, Voyage of the Beagle, Autobiography — [SE darwin](https://standardebooks.org/ebooks?per-page=48&query=darwin)
- SE feeds: `/feeds/atom/all` returned HTTP 401 (auth needed for automated bulk). Normal HTML listing pages and search worked with a UA header (HTTP 200). The pagination scrape of `/ebooks?per-page=48&page=N` returned 1228 unique two-segment paths (omits three-segment translator paths).

### Inferences
- SE book-page URL = `https://standardebooks.org` + path; direct-download links follow `/ebooks/<author>/<title>[/<translator>]/downloads/...epub` (pattern not fetched; confirm before scripting).
- For works with no SE edition use PG (stripped of PG branding per the earlier license note) or Wikisource.

### Gaps
- Not opened any SE book page, so I did not confirm contents of omnibus entries (Conrad short-fiction contains Heart of Darkness; Plato dialogues contains Republic).
- SE's Pinocchio and Faust translators are not named in their paths; not verified.

## 3. Translator and edition PD status

### Takeaway
Under US rules (pre-1931 publication) all PG editions in the table are PD today. For EU/UK life+70, translators who died 1956 or later are not yet PD there: Giles (d. 1958, Art of War), Della Chiesa (d. 1972, Pinocchio), Bellows (d. 1957, Poetic Edda), Waley (d. 1966, Genji). The Metamorphosis translator (Wyllie) has no death year in the data and needs a check.

### Cited Findings
Translator death years below are Gutendex's, from [Gutendex ids lookup](https://gutendex.com/books/?ids=2554).
- Constance Garnett (d. 1946): Crime and Punishment 2554, Brothers Karamazov 28054, Anna Karenina 1399. PD US and life+70 (since 2017).
- Aylmer Maude (d. 1938) and Louise Maude (d. 1939): War and Peace 2600. PD in US and EU.
- Samuel Butler (d. 1902): Iliad 2199, Odyssey 1727. Alexander Pope (d. 1744): Iliad 6130, Odyssey 3160.
- H. W. Longfellow (d. 1882) Dante 1004; H. F. Cary (d. 1844) Dante 8800.
- John Ormsby (d. 1895): Don Quixote 996. I. F. Hapgood (d. 1928): Les Miserables 135, Notre-Dame 2610. Eleanor Marx-Aveling (d. 1898): Bovary 2413. C. K. Scott-Moncrieff (d. 1930): Swann's Way 7178 (1922 publication, PD in US and EU).
- Thomas Common (d. 1919): Zarathustra 1998; Meiklejohn (d. 1902): Critique of Pure Reason 4280; Jowett (d. 1893): Republic 1497; Storr (d. 1919): Sophocles 31; Macaulay (d. 1915): Herodotus 2707; Marriott (d. 1927): The Prince 1232; John Payne (d. 1916): Decameron 23700; J. L. Hall (d. 1928): Beowulf 16328; Gummere (d. 1919): Beowulf 981; Crawford (d. 1916): Kalevala 5186; Legge (d. 1897): Tao 216, Analects 3330; Rodwell (d. 1900): Koran 2800; Muller (d. 1900): Dhammapada 2017; Arnold (d. 1904): Gita 2388; Burton (d. 1890): Nights 3435; FitzGerald (d. 1883): Rubaiyat 246; Bayard Taylor (d. 1878): Faust 14591.
- Lionel Giles (d. 1958, per Gutendex): Art of War 132. Translation published 1910, so US PD; EU/UK life+70 runs to end of 2028, so the work is PD there from 1 Jan 2029.
- Carol Della Chiesa (d. 1972 per Gutendex): Pinocchio 500. US publication date not verified here; EU/UK life+70 until 2043. Alternative: SE Pinocchio path has no translator named, so check what translation SE used.
- Henry Spalding (Onegin 23997), D. J. Hogarth (Dead Souls 1081), David Wyllie (Metamorphosis 5200): Gutendex shows null death year. Spalding's Onegin is 1881 (PD). Wyllie's Metamorphosis translation was published 1930s per general knowledge (unverified); treat as US-flag until checked.
- Arthur Waley (Genji, SE) died 1966 per general knowledge (not from a fetched page); volumes published 1925-33 so some are 1931+ — SE hosting implies they treat it as US PD, but not confirmed here. Flag.
- Henry Adams Bellows (Poetic Edda, SE) d. 1957: the Edda translation is 1923 in general knowledge; EU/UK PD from 2028. Flag. (The catalog's "1936" date appears wrong.)

### Inferences
- Safe-everywhere set (translator and author dead before 1956, publication before 1931): Garnett, Maude, Butler, Pope, Longfellow, Cary, Ormsby, Hapgood, Marx-Aveling, Scott-Moncrieff, Common, Meiklejohn, Jowett, Storr, Macaulay, Marriott, Payne, Hall, Gummere, Crawford, Legge, Rodwell, Muller, Arnold, Burton, FitzGerald, Taylor.
- Geo-flag set: Giles (Art of War), Della Chiesa (Pinocchio), Bellows (Edda), Waley (Genji), Wyllie (Metamorphosis). Either swap to another translation or geo-restrict.
- 1931+ editions: none among the PG IDs verified; the ones to watch are Waley's later Genji volumes and any Moncrieff vol. 4+ (not in the catalog's vol. 1 scope).

### Gaps
- No US copyright-renewal lookups run (Stanford/Cornell not fetched).
- Wyllie, Spalding, Hogarth, Waley, Bellows death or publication years not confirmed from a fetched page.

## 4. Catalog entries not found on Gutenberg (and alternatives)

### Takeaway
PG ID not verified for: The Betrothed (Manzoni), Ramayana (Griffith), Tale of Genji, Poetic Edda (Bellows), Mahabharata (Ganguli), Journey to the West, Dream of the Red Chamber, Rumi, Hafez, Shahnameh, Gulistan, Upanishads, Book of the Dead, Jataka, Galileo. "Not found" here means not seen in my API responses (title search was down), not that PG lacks them.

### Cited Findings
- SE has Manzoni's The Betrothed, Griffith's Ramayana, Waley's Genji, Bellows' Poetic Edda — [SE listings (manzoni query)](https://standardebooks.org/ebooks?per-page=48&query=manzoni), [valmiki](https://standardebooks.org/ebooks?per-page=48&query=valmiki), [murasaki](https://standardebooks.org/ebooks?per-page=48&query=murasaki), [edda](https://standardebooks.org/ebooks?per-page=48&query=edda)
- Principia on PG 28233 is the Latin original (language `la`), not Motte's 1729 English — [Gutendex](https://gutendex.com/books/?ids=28233)
- Gilgamesh on PG 11000 is Jastrow and Clay's 1920 Old Babylonian version, not Thompson 1928 — [Gutendex](https://gutendex.com/books/?ids=11000)
- Burton's Nights (PG 3435) is volume 1 of 10 only; each volume is a separate PG ID — [Gutendex](https://gutendex.com/books/?ids=3435)
- Euclid on PG 21076 is "First Six Books" (Casey), not Byrne's coloured edition — [Gutendex](https://gutendex.com/books/?ids=21076)
- Herodotus PG 2707 is "Volume 1" only — [Gutendex](https://gutendex.com/books/?ids=2707)
- Metamorphoses PG 21765 covers Books I-VII only (Riley) — [Gutendex](https://gutendex.com/books/?ids=21765)

### Inferences
- Wikisource (en.wikisource.org) and Internet Archive are the likely fallbacks for Mahabharata (Ganguli), Upanishads (SBE), Book of the Dead (Budge), Jataka (Cowell), Shahnameh (Warner), Hafez, Rumi (Nicholson), Principia (Motte 1729), Galileo (Salusbury); Sacred Texts for the Eastern scriptures. None of these were fetched.
- Page-turn reader scope: pick complete single-volume works; Herodotus, Burton Nights, Metamorphosis (Ovid) and Euclid need multi-ID assembly or a different edition.

### Gaps
- Wikisource and Internet Archive URLs not fetched (budget/time); no URL is claimed for them.
- Gutendex `?search=` was unusable during this run (timeouts, then 503), so unknown IDs could not be discovered by title. Re-run title searches later for the Gaps list above.
- Gutenberg ebook pages were not spot-checked.
