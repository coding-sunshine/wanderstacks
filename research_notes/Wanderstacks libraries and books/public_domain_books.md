# Public-domain books and sources for the Wanderstacks three.js page-turn library

Research date: 2026-11-07. Budget: ~14 tool calls. Items marked **[unverified]** come from background knowledge, not a fetched page, and need a check before shipping. Several fetches failed (HathiTrust 403, IA IIIF docs 502/cert error), so those areas rely on [unverified] knowledge.

## 1. Sources: APIs, formats, terms, rate limits, commercial use

### Takeaway
Best stack: Standard Ebooks (CC0, clean EPUB) first, Project Gutenberg (via a self-hosted mirror or Gutendex, with its name stripped) second, Internet Archive / LoC / Wikimedia Commons scans for page-image books. Gutenberg forbids automated crawling of the website, and ctext.org forbids scraping. Plan to ingest once and self-host.

### Cited Findings
- Project Gutenberg site is "intended for human users only"; automated access gets IP-blocked. Approved methods: a private mirror, `wget -w 2 -m -H` harvesting with a 2 s delay, and the offline machine-readable catalog. — [PG robot access](https://www.gutenberg.org/policy/robot_access.html)
- PG trademark: using the "Project Gutenberg" name requires verbatim, unchanged text, the full license, and royalties (20% of profits) if charging. Commercial use needs written permission from the Foundation and the Trademark LLC. If you strip the PG license and every reference to PG, the public-domain text is "unrestricted by U.S. intellectual property law". — [PG license](https://www.gutenberg.org/policy/license.html)
- Implication: a reader that re-paginates text is not verbatim. Strip the PG header/footer and the name, or use Standard Ebooks. This applies to US-PD works only (see section 2). — [PG license](https://www.gutenberg.org/policy/license.html)
- Gutendex: JSON API with `/books` (paginated) and `/books/<id>`. Filters: `search`, `languages`, `author_year_start/end`, `copyright`, `ids`, `mime_type`, `topic`, `sort`. Each book has a `formats` map of MIME type to URL. Docs recommend running your own instance for long-term use. — [Gutendex](https://gutendex.com/)
- Standard Ebooks: content it produces is dedicated to the public domain via CC0 1.0. Third-party content shown on the site may be copyrighted. OPDS feeds and bulk downloads exist (details are on /feeds and /bulk-downloads pages, not fetched). — [SE manual](https://standardebooks.org/manual/latest/), [SE help](https://standardebooks.org/help/how-to-use-our-ebooks)
- Library of Congress loc.gov JSON/YAML API: no key or auth. Requests over capacity are blocked, and paging stops at the 100,000th result. It covers items, collections, images and metadata but not catalog records. — [LoC API](https://www.loc.gov/apis/json-and-yaml/)
- ctext.org: JSON API and Python module only for institutional subscribers. Scraping violates its terms, and detected scrapers may get intentionally corrupted data. Rate limits and commercial terms are not stated. — [ctext FAQ](https://ctext.org/faq/en)

### Inferences
- Treat ctext.org as link-out or use PD Chinese texts from Wikisource / Gutenberg instead of embedding ctext data.
- Pipeline: one-time ingest through approved PG mirror or Standard Ebooks bulk download, then host static pages yourself. No live API calls from the browser.
- Standard Ebooks CC0 covers their typography and markup. The underlying text is PD in the US. Their cover art is separately PD.

### Gaps (not verified by fetch; verify before relying)
- **[unverified] Internet Archive**: Metadata API `https://archive.org/metadata/{id}`, advancedsearch.php, full-text via `/download/{id}/{id}_djvu.txt`, page images via BookReader `BookReaderImages.php` and IIIF at `https://iiif.archive.org/iiif/...` (docs fetch returned 502). Many items are PD but "lending library" items (Open Library borrow) are in copyright. Filter by license field / `collection:americana` and avoid `inlibrary`. Scans are generally PD-mark; IA asks for reasonable rate use; check per-item `licenseurl`.
- **[unverified] HathiTrust**: full-view for US-PD (pre-1931 US publications as of 2026; 1931 at Jan 1 2027); non-US works have a 'pd-non-US' status, which is full view only outside the US. Data API (`babel.hathitrust.org/cgi/htd`) needs key and non-commercial/research-oriented terms. Fetch of terms page returned 403.
- **[unverified]** Wikisource (CC BY-SA for transcriptions' wikitext; underlying texts PD), Wikimedia Commons (PD scans, check each file), Gallica (BnF reuse: free for PD, commercial reuse of high-res may need a licence, check "Conditions d'utilisation"), BHL (API key, mostly PD/CC, check item), Google Books (full-view PD but ToS discourage bulk download), Europeana (metadata CC0; items carry rightsstatements per object, API key), DPLA (API key; metadata CC0; items vary), NDL Japan (many PD scans, NDL Digital Collections API/IIIF, reuse terms vary), Sacred Texts (site notes: Public domain texts but not-for-redistribution of site copyright claims; check), GRETIL/Perseus (Perseus texts usually CC BY-SA, some NC; **flag NC**), Ganjoor (open DB on GitHub; check per-poet licence), Rekhta (site terms restrict reuse; **assume NC/link-out**), Digital Library of India (scans of mixed status; unclear licence, **avoid**). No fetched pages for these.

## 2. Copyright rules and geo-differences

### Takeaway
Works published in 1930 entered the US public domain Jan 1 2026; works published in 1931 enter on Jan 1 2027 (sound recordings from 1926; unpublished works by authors who died in 1956). For global reach, restrict the catalog to authors who died before 1956 (life+70 in EU/UK as of 2026: died before 1 Jan 1956) and pre-1931 US publications. Modern translations are the main trap.

### Cited Findings
- US: books published in 1931 enter the public domain in 2027, along with sound recordings from 1926 and unpublished works of authors who died in 1956. 1931 films like Frankenstein and Dracula (Universal), City Lights, M. — [search summary of Duke / Wikipedia, 2027 in public domain](https://Www.Wikipedia.org/wiki/2027_in_public_domain); [Jan 2026 context](https://www.bespacific.com/?p=120053)
- Canada: term moved from life+50 to life+70 on Dec 30 2022, not retroactive; works whose authors died 1971 or earlier stay PD. No new Canadian PD additions until Jan 1 2043 (authors dying in 1972). — [SFU Library](https://www.lib.sfu.ca/node/37644), [York U](https://copyright.info.yorku.ca/2022/12/general-term-of-canadian-copyright-extended-from-50-to-70-years-details/)

### Inferences
- Canada effectively PD for authors who died by end of 1971 (life+50 rule locked in); this is broader than EU/UK for 1956–1971 deaths. EU/UK are narrower: author died before 1956.
- Geo-handling: ship only works PD in both US and life+70 countries (author died before 1956 and published before 1931). Everything else gets a geo-flag or exclusion.
- Frankenstein 1818, Pride and Prejudice 1813, Moby-Dick 1851 etc. are safe everywhere.

### Gaps
- **[unverified]** India life+60 (authors died before 1966 from 2026 perspective; actually authors dead 60 years: died 1965 or earlier). Not fetched.
- **[unverified]** Which translations are PD. Rules of thumb: Homer: Butler (Odyssey 1900, Iliad 1898), Pope, Chapman, Lang/Leaf/Myers Iliad 1883, Murray (d. 1957, **not safe in life+70 until 2028**), Fagles/Lattimore/Fitzgerald/Fagles **in copyright**. Dante: Longfellow (1867), Cary (1814), Norton (1891); Sinclair, Musa, Mandelbaum in copyright. Tolstoy: Garnett (d. 1946; PD life+70 since 2017), Maudes (Aylmer Maude d. 1938; PD), Pevear-Volokhonsky in copyright. Genji: Suematsu (1882, partial), Waley (1925–33; Waley d. 1966, **not PD in EU/UK until 2037**, PD in US only for pre-1931 volumes; Seidensticker/Tyler in copyright). Verify each translator's death year before listing.
- Stanford renewal database and Cornell chart not fetched.

## 3. Scans vs reflowed text: best first-edition scans

### Takeaway
No fetched evidence of scan quality or exact item IDs. Below is a shortlist of where to look, all **[unverified]**. Reflowed EPUB is the reliable default; scans are an upgrade for ~10 showpiece books.

### Cited Findings
- LoC API gives public item and image access without a key, so LoC rare-book scans are scriptable. — [LoC API](https://www.loc.gov/apis/json-and-yaml/)

### Inferences
- Shortlist to hunt for scans (search by title on archive.org, loc.gov, Commons, BHL):
  - Alice 1865/66 (Macmillan, Tenniel): British Library digitisation and Commons; Alice's Adventures Under Ground manuscript (1864) at the British Library.
  - Origin of Species 1859: Darwin Online (cc-by-style, check), Internet Archive, BHL.
  - Frankenstein 1818 first edition: IA / Commons / HathiTrust.
  - Pride and Prejudice 1813, Moby-Dick 1851 (Harper US edition; also London "The Whale"): IA, HathiTrust, LoC.
  - Grimm illustrated by Rackham (1909), Doré Divine Comedy (1860s), Audubon Birds of America (Havell edition, BHL / LoC / Commons), Kelmscott Chaucer (1896; IA, LoC), Byrne's Euclid (1847, color; IA, Commons).
  - Newton Principia 1687/1726/Motte 1729 translation: IA / Cambridge Digital Library (check Cambridge reuse terms).

### Gaps
- No exact URLs verified for any scan. All of these need a search to get item IDs and a licence check.

## 4. Catalog (~100 books)

### Takeaway
Candidates are chosen for PD in US and life+70 countries. Text source default: Standard Ebooks (standardebooks.org/ebooks/{author-slug}/{title-slug}) where available, else Project Gutenberg title search `https://www.gutenberg.org/ebooks/search/?query=<title>`. **All entries [unverified]** against live pages; I did not verify individual URLs or PG IDs. Translator status uses death-year knowledge; confirm before shipping. Code: ST = Standard Ebooks likely, PG = Gutenberg, SC = notable scan exists.

### Cited Findings
- None of the individual entries below were fetched. Source schema and licensing facts come from sections 1–2.

### Inferences (the catalog)
English / American novels and drama
1. Pride and Prejudice, Jane Austen, 1813. ST/PG, SC.
2. Emma, Austen, 1815. ST/PG
3. Frankenstein, Mary Shelley, 1818 text. ST/PG, SC
4. Jane Eyre, Charlotte Brontë, 1847. ST/PG
5. Wuthering Heights, Emily Brontë, 1847. ST/PG
6. Great Expectations, Dickens, 1861. ST/PG
7. A Christmas Carol, Dickens, 1843. ST/PG (SC: Leech illustrations)
8. Middlemarch, George Eliot, 1871. ST/PG
9. Moby-Dick, Melville, 1851. ST/PG, SC
10. The Scarlet Letter, Hawthorne, 1850. ST/PG
11. Walden, Thoreau, 1854. ST/PG
12. Leaves of Grass, Whitman, 1855/1892. ST/PG
13. Adventures of Huckleberry Finn, Twain, 1884. ST/PG
14. Dracula, Stoker, 1897. ST/PG
15. The Picture of Dorian Gray, Wilde, 1890/91. ST/PG
16. Heart of Darkness, Conrad, 1899. ST/PG
17. Gulliver's Travels, Swift, 1726. ST/PG
18. Robinson Crusoe, Defoe, 1719. ST/PG
19. Hamlet / Complete Works, Shakespeare (First Folio 1623 scans on IA/Commons). PG/SC
20. Paradise Lost, Milton, 1667. ST/PG
21. The Canterbury Tales, Chaucer, c. 1400 (Kelmscott Chaucer 1896 scan). PG/SC
22. Beowulf, anonymous; Gummere or Morris/Wyatt translation (PD). PG
23. Leviathan, Hobbes, 1651. PG
24. Sherlock Holmes (Adventures), Conan Doyle, 1892 (Strand illustrations). ST/PG
25. Wonderland: Alice's Adventures in Wonderland, Carroll, 1865. ST/PG, SC
26. Through the Looking-Glass, Carroll, 1871. ST/PG, SC
27. The Time Machine, H.G. Wells, 1895. ST/PG (Wells died 1946, PD)
28. Treasure Island, Stevenson, 1883. ST/PG
29. The Wonderful Wizard of Oz, Baum, 1900. ST/PG, SC
30. Peter Pan (Peter and Wendy), Barrie, 1911. PG (note UK special Great Ormond Street rights: **flag**)
31. The Jungle Book, Kipling, 1894 (Kipling d. 1936, PD). ST/PG
32. The Wind in the Willows, Grahame, 1908. ST/PG
33. Anne of Green Gables, L.M. Montgomery, 1908 (d. 1942). ST/PG
34. Little Women, Alcott, 1868. ST/PG
35. Aesop's Fables (Jacobs or Townsend translation). PG

French, German, Russian, Spanish, Italian, other European
36. Les Misérables, Hugo, 1862 (Wilbour translation, PD). ST/PG
37. The Hunchback of Notre-Dame, Hugo, 1831. PG
38. The Three Musketeers, Dumas, 1844. ST/PG
39. The Count of Monte Cristo, Dumas, 1844. ST/PG
40. Madame Bovary, Flaubert, 1857 (Marx-Aveling, PD). ST/PG
41. In Search of Lost Time vol. 1, Proust (Moncrieff d. 1930; vol. 1 Swann's Way PD; later vols check **[flag]**). PG
42. The Little Prince, Saint-Exupéry, 1943: **in copyright (d. 1944, EU life+70 until 2015? he died 1944 → PD in EU from 2015 but French wartime extension; US copyrighted). Exclude.**
43. Candide, Voltaire, 1759. ST/PG
44. Fables, La Fontaine, 1668. PG
45. Faust, Goethe, 1808/1832 (Bayard Taylor or Latham). PG
46. Grimm's Fairy Tales, 1812 (Rackham 1909 ed.). PG, SC
47. Fairy Tales, Hans Christian Andersen. PG, SC
48. Thus Spoke Zarathustra, Nietzsche, 1883 (Common translation, PD). PG
49. Critique of Pure Reason, Kant, 1781 (Meiklejohn, PD). PG
50. The Metamorphosis, Kafka, 1915 (Wyllie, 1937 translation, **check**; Kafka d. 1924). ST/PG
51. War and Peace, Tolstoy, 1869 (Maude). ST/PG
52. Anna Karenina, Tolstoy, 1878 (Garnett). ST/PG
53. Crime and Punishment, Dostoevsky, 1866 (Garnett). ST/PG
54. The Brothers Karamazov, Dostoevsky, 1880 (Garnett). ST/PG
55. Eugene Onegin, Pushkin (Spalding 1881 / Deutsch-Yarmolinsky 1936 **check**). PG
56. Dead Souls, Gogol, 1842. PG
57. Don Quixote, Cervantes, 1605/1615 (Jarvis or Ormsby translation, PD; Doré illustrations). ST/PG, SC
58. The Divine Comedy, Dante, c. 1320 (Longfellow 1867; Doré illustrations). PG, SC
59. The Decameron, Boccaccio (Rigg or Payne). PG
60. The Prince, Machiavelli, 1532 (Marriott). ST/PG
61. The Betrothed, Manzoni (Swan 1828 translation). PG
62. Pinocchio, Collodi, 1883. PG, SC
63. The Aeneid, Virgil (Dryden 1697 / Fairclough). ST/PG
64. Metamorphoses, Ovid (Golding / Melville). PG

Ancient epics, philosophy, classical
65. The Iliad, Homer (Butler 1898 prose; Pope 1715; Lang/Leaf/Myers). ST/PG
66. The Odyssey, Homer (Butler 1900; Pope, Chapman). ST/PG
67. Epic of Gilgamesh (Thompson 1928; Sandars is copyrighted). PG, **[verify]**
68. The Republic, Plato (Jowett 1871). ST/PG
69. Nicomachean Ethics, Aristotle (Chase/Ross, Ross d. 1971: **flag**; use Chase/Peters). PG
70. Meditations, Marcus Aurelius (Long). ST/PG
71. Histories, Herodotus (Rawlinson/Macaulay). PG
72. Elements, Euclid, Byrne 1847 (color; IA/Commons). SC
73. Oedipus Rex, Sophocles (Jebb/Plumptre). PG
74. Arabian Nights, Burton (Supp. d. 1890) and Lane 1839 (illustrated). PG, SC
75. Mahabharata (Kisari Mohan Ganguli, 1883–96). Sacred Texts/PG; PD
76. Ramayana (Griffith, 1870–74). Sacred Texts/PG
77. Bhagavad Gita (Arnold "Song Celestial" 1885 or Besant). PG
78. Tao Te Ching (Legge 1891 or Carus). Sacred Texts/PG
79. Analects (Legge 1861/1893; Giles). Wikisource/PG
80. The Art of War, Sun Tzu (Giles 1910). PG
81. Dream of the Red Chamber (Bramwell Joly 1892, partial). PG/Wikisource **[check completeness]**
82. Journey to the West (Waley d. 1966, **not PD in EU/UK**; Richard 1913 "A Mission to Heaven" abridged). **Flag**
83. The Tale of Genji (Suematsu 1882 partial; Waley 1925–33 **geo-flag**). **Flag**
84. The Pillow Book (Waley excerpts) **flag**. skip unless Waley PD.
85. Rubaiyat of Omar Khayyam (FitzGerald 1859–89; Rackham/Dulac ill.). ST/PG, SC
86. Rumi, Masnavi/Selected Poems (Nicholson d. 1945; PD). Sacred Texts/IA
87. Hafez, Divan (Clarke / Bell). IA/Ganjoor
88. Shahnameh (Warner 1905–25; Zimmern). IA/PG
89. The Gulistan of Sa'di (Eastwick or Arbuthnot). PG
90. Kalevala (Crawford 1888). PG
91. Sagas: Poetic Edda (Bellows 1936, d. 1957 **flag**; Thorpe), Volsunga Saga (Morris). PG
92. Man'yoshu / Hyakunin Isshu (Porter, 1909). PG
93. Hojoki / Kokoro (Hearn d. 1904: Kwaidan, Kokoro). PG
94. Kokoro by Natsume Sōseki, 1914 (Japanese original at Aozora Bunko; English translations check). Aozora (PD)

Science and religion
95. On the Origin of Species, Darwin, 1859. ST/PG, SC
96. Principia, Newton (Motte 1729). IA/Wikisource, SC
97. Dialogue Concerning the Two Chief World Systems, Galileo (Salusbury 1661 or Drake: Drake copyrighted, **flag**). PG
98. De revolutionibus, Copernicus 1543 (Latin scans; ETH e-rara, IA). SC
99. Opticks, Newton 1704. PG/IA
100. The King James Bible, 1611 (scans: 1611 first edition). PG/SC
101. The Qur'an (Pickthall 1930, PD in US from 2026, check UK; Rodwell 1861 PD). PG/Sacred Texts
102. Dhammapada (Müller 1881). Sacred Texts
103. Upanishads (Müller, SBE 1879–1884). Sacred Texts
104. Book of the Dead (Budge d. 1934; PD). IA/Sacred Texts
105. Tripitaka/Jataka tales (Cowell 1895–1907). Sacred Texts
106. Adventures of Sinbad: covered in 74.

### Gaps
- No source URLs for individual books have been confirmed; a build script should resolve IDs via Gutendex (`/books?search=title+author&languages=en`) and manually review. Exclude entry 42 (The Little Prince is under copyright in the US).
- Items flagged "check" (Waley, Bellows, Ross, Murray, Pickthall, Moncrieff vol. 2+, Kafka translations) need translator death-year checks.

## 5. Page-turn reader tech

### Takeaway
StPageFlip (MIT, zero dependencies) is the pragmatic 2D choice; turn.js v4 is commercial and v3 is non-commercial BSD, so avoid it. For three.js, write a custom curl shader on a subdivided plane.

### Cited Findings
- StPageFlip (`page-flip` on npm): MIT, zero dependencies, works with canvas images (`loadFromImages`) or HTML blocks (`loadFromHtml`), API with `flipNext/flipPrev/turnToPage`, events `flip`, `changeOrientation`, `changeState`, `init`. ~905 stars, 97 commits, React wrapper react-pageflip. Portrait mode clones HTML elements (possible perf cost). — [StPageFlip](https://github.com/Nodlik/StPageFlip)
- turn.js: v3 is a non-commercial BSD licence; v4 is sold at turnjs.com. — [turn.js repo](https://github.com/blasten/turn.js)
- Gutendex `formats` map supplies EPUB/HTML/plain URLs per book for the ingest step. — [Gutendex](https://gutendex.com/)

### Inferences
- Use StPageFlip rendering to canvas, then upload as a three.js `CanvasTexture`, or skip it and drive a custom page-curl shader (cylindrical bend on a subdivided PlaneGeometry, bend radius animated by drag progress).
- Pagination: pre-render EPUB to fixed pages offline (headless browser measuring column layout via CSS multi-column, or epub.js `rendition.flow("paginated")`), emit one image/texture per spread; lazy-load textures per visible spread.

### Gaps
- **[unverified]** epub.js (BSD-2), foliate-js (MIT), Readium (BSD-3); licences and maintenance status not fetched. No concrete three.js page-curl example repos were verified.
