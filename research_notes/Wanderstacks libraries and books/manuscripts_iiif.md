# Iconic manuscripts and rare books: IIIF availability, licences, and page-turn suitability (status Nov 2026)

Method note: roughly 20 tool calls. Several fetches failed (codexsinaiticus.org, Yale, roger-pearse.com refused connections), so many per-item facts could NOT be verified live. Everything with a link below was seen this session. Items marked "[BG]" are from background knowledge, unverified, and must be checked against the live manifest and rights statement before use.

## 1. Landscape: which institutions publish IIIF at scale, aggregators, and 2024-2026 changes

### Takeaway
e-codices (CC BY-NC 4.0 manifests), Bodleian, Vatican DigiVatLib, Yale/Beinecke, Gallica, LoC are the strongest IIIF sources. British Library digitised manuscripts are only partly back online post-cyberattack, with limited metadata and (as of the last source seen) no image download. Biblissima aggregates IIIF manifests across institutions.

### Cited Findings
- e-codices (Univ. Fribourg, started 2005) publishes IIIF manifests for Swiss medieval manuscripts; manifests carry a CC BY-NC 4.0 licence — [search summary](https://e-codices.unifr.ch/en/list/csg/Shelfmark/20/24); example manifest pattern: https://www.e-codices.ch/metadata/iiif/csg-1394-02/manifest.json (shows URL scheme `https://www.e-codices.ch/metadata/iiif/{id}/manifest.json`) — [e-codices](https://www.e-codices.ch/metadata/iiif/csg-1394-02/manifest.json)
- Vatican DigiVatLib manifest scheme: https://digi.vatlib.it/iiif/MSS_Vat.lat.3225/manifest.json (Vergilius Vaticanus; also MSS_Pal.lat.1632 pattern) — [search result summary](https://hyperallergic.com/vatican-digitized-a-1600-year-old-illuminated-manuscript-of-the-aeneid)
- Biblissima hosts an IIIF collections manifest page that covers Bodleian MS. Arch. Selden. A. 1 (Codex Mendoza): https://iiif.biblissima.fr/collections/manifest/7ad3ca222ef311585fd3d0755ac8b26d352704e1 — [Biblissima](https://iiif.biblissima.fr/collections/manifest/7ad3ca222ef311585fd3d0755ac8b26d352704e1)
- Trinity College Dublin: out-of-copyright, unrestricted items are CC BY 4.0 (credit "The Board of Trinity College Dublin"); Book of Kells (IE TCD MS 58) is an explicit exception needing written permission — [TCD rights page](https://www.tcd.ie/library/dris/copyright.php)
- Digital Bodleian terms are CC BY-NC 4.0 on the Codex Mendoza item per a search summary (not confirmed on the page itself) — [search result](https://en.wikipedia.org/wiki/Codex_Mendoza)
- BL cyberattack Oct 2023: first 1,000 manuscripts (of >4,500 formerly online) returned by Oct 2024; pages had "limited information" and "do not offer the ability to download images"; no IIIF mention — [Medievalists.net](https://www.medievalists.net/2024/10/medieval-manuscripts-return-british-library/)
- BL: it will not be possible to restore the digitised manuscripts site as it was; management expected full operational capacity by end of 2026 assuming no new incident; much of the catalogue restored by Dec 2025 — [search summary of BL Annual Report 2025-26 and press](https://assets.publishing.service.gov.uk/media/6a57634e6d6d5c7e2845c9c0/British_Library_Annual_Report_and_Accounts_2025-26_WEB_NAO_14_July_v2.pdf); also [Computer Weekly](https://www.computerweekly.com/news/366566355/British-Library-catalogues-back-online-after-ransomware-attack)
- A Feb 2026 blog post titled "Can we do anything to get British Library manuscripts back online?" implies material remained missing in Feb 2026 (page could not be fetched; title only) — [Roger Pearse](https://www.roger-pearse.com/weblog/2026/02/04/can-we-do-anything-to-get-british-library-manuscripts-back-online/)
- Over 20 IIIF-enabled Gutenberg Bible copies (34 volumes) were gathered for Paul Needham's 2021 Lyell Lectures — [Lyell 2021 page](https://tdungate.github.io/lyell-2021)

### Inferences
- Build the reader against IIIF Presentation manifests generically (v2 and v3 parsers), since Bodleian, e-codices, Yale, Vatican, Gallica, LoC differ in version and image-service level.
- BL items are the highest risk: treat as "verify manifest live" and prefer alternate sources (Sinaiticus via codexsinaiticus.org, Lindisfarne via facsimile/Wikimedia Commons).
- [BG] Other at-scale IIIF publishers: BnF Gallica (manifest `https://gallica.bnf.fr/iiif/ark:/12148/{id}/manifest.json`, mostly Public Domain/Etalab-style open reuse), Library of Congress (loc.gov/item/{id}/?fo=json and iiif manifests, mostly no known restrictions), Heidelberg (Bibliotheca Palatina, CC BY-SA 3.0 DE / PDM), Harvard, Cambridge Digital Library (CC BY-NC), Wellcome, Princeton, Yale (`https://collections.library.yale.edu/manifests/{oid}`), NYPL (CC0/PD for public-domain items), Europeana. Discovery: Biblissima+ (iiif.biblissima.fr), IIIF Universe, Mirador/UV catalogs, Wikimedia Commons (IIIF manifests per file/category).

### Gaps
- Current (Nov 2026) count of restored BL manuscripts, and whether BL now exposes IIIF manifests: no source found.
- Exact current licence wording on Bodleian, Yale, LoC, Gallica pages: not fetched.

## 2. Per-item catalog (holding library, completeness, access, licence, text layer)

### Takeaway
Fully verified in this session: Book of Kells (complete but permission-restricted), Codex Sinaiticus (IIIF + transcription, non-commercial only), Bodleian First Folio (CC BY 3.0, TEI text), Gutenberg copies list, Vergilius Vaticanus manifest URL, Voynich (complete, Yale manifest exists). The rest is [BG].

### Cited Findings
- Book of Kells, TCD MS 58, c. 800 CE, Iona/Kells. All 680 pages digitised and free to view in TCD Digital Collections — [Aleteia](https://it-front.aleteia.org/2022/04/11/irelands-famed-book-of-kells-has-been-digitized-for-online-viewing). Licence: explicit exception to CC BY; permission required (Digital.Collections@tcd.ie) — [TCD](https://www.tcd.ie/library/dris/copyright.php). FLAG: not usable commercially without written permission.
- Codex Sinaiticus, BL Add MS 43725 (plus Leipzig, St Catherine's, National Library of Russia), 4th c., Greek Bible. Portal codexsinaiticus.org uses IIIF for images and Web Annotation model for transcriptions; "provided only for non-commercial personal and educational use" — [search summary of codexsinaiticus.org](https://codexsinaiticus.org/el/copyright.aspx). FLAG: non-commercial only. Transcription layer exists (word-level), per same source.
- Voynich Manuscript, Beinecke MS 408, 15th c. (radiocarbon, early 1400s) [BG]; "completely digitized", catalogue record has a Manifest Link — [Yale record](https://collections.library.yale.edu/catalog/2002046). Also on Internet Archive as `voynich_MS_408` — [archive.org](https://archive.org/details/voynich_MS_408/mode/2up). Rights text not retrieved. No readable transcription (undeciphered; EVA transliterations exist elsewhere, e.g. voynich.nu).
- Gutenberg Bible IIIF copies: BnF (4 vols), Mazarine (2), Saint-Omer (1), Berlin SBB (1), SUB Göttingen (2), BSB Munich (2), NLS (2), Cambridge UL (1), BL (3), Rylands (2), Bodleian (2), Harry Ransom Center (1), Houghton (2, selected images only), Beinecke (2), Scheide Princeton (2), Library of Congress (1), Keio (1), Seville (1), Vatican (2) — [Lyell 2021 list](https://tdungate.github.io/lyell-2021). HRC scanned its copy in 2002 (~1,300 images) — [HRC magazine](https://sites.utexas.edu/ransomcentermagazine/2010/08/03/see-full-digitized-version-of-the-gutenberg-bible). Göttingen announced a final digitised version — [same search](https://www.hrc.utexas.edu/gutenberg-bible/). Per-copy licence not checked.
- Plan of St Gall, Cod. Sang. 1092 (Stiftsbibliothek St. Gallen), c. 820-830 CE: on e-codices, high-resolution — [e-codices list](https://e-codices.unifr.ch/en/list/csg/Shelfmark/20/24); e-codices manifests CC BY-NC 4.0. FLAG: NC. Stiftsbezirk digitised-codices page also exists — [Stiftsbezirk](https://www.stiftsbezirk.ch/en/digitised-codices). Note: single large sheet (a few parchment sheets sewn), not a page-turn book.
- Codex Gigas (Devil's Bible), National Library of Sweden (KB), c. 1200s, Bohemia: official KB site shows every page with commentary; work is public domain by age — [KB](https://www.kb.se/eng/the-codex-gigas/content-of-the-codex-gigas.html). IIIF not confirmed.
- Shakespeare First Folio, Bodleian Arch. G c.7 (not "A c.9"): full digital facsimile, IIIF-compatible, images and TEI text under CC BY 3.0; Universal Viewer; downloads of images/text/XML — [Bodleian blog](https://blogs.bodleian.ox.ac.uk/digital/2016/04/23/introducing-the-iiif-first-folio/), [downloads](https://firstfolio.bodleian.ox.ac.uk/downloads.html). Text layer: yes (TEI per play). Best-licensed complete iconic book found.
- Codex Mendoza, Bodleian MS. Arch. Selden. A. 1, c. 1541-1542: in Digital Bodleian with IIIF manifest registered in Biblissima — [Biblissima](https://iiif.biblissima.fr/collections/manifest/7ad3ca222ef311585fd3d0755ac8b26d352704e1); terms CC BY-NC 4.0 reported — [search](https://en.wikipedia.org/wiki/Codex_Mendoza). FLAG: NC if confirmed.
- Vergilius Vaticanus, BAV Vat. lat. 3225, c. 400 CE: 76 surviving folios/pages, 50 illustrations; manifest https://digi.vatlib.it/iiif/MSS_Vat.lat.3225/manifest.json — [search](https://hyperallergic.com/vatican-digitized-a-1600-year-old-illuminated-manuscript-of-the-aeneid). Licence not retrieved.
- Dead Sea Scrolls (IAA/Israel Museum): Leon Levy DSS Digital Library with Google; ~5,000 images; five complete scrolls (Great Isaiah, Community Rule, Habakkuk Commentary, Temple, War) — [IAA/JTA/BAS](https://www.biblicalarchaeology.org/daily/news/digital-dead-sea-scrolls-finally-available-online/), [Featured Scrolls](https://deadseascrolls.org.il/featured-scrolls). IIIF and terms of use not found. Many other holdings are fragments.
- Rylands P52 (Papyrus Rylands Greek 457), John Rylands, 2nd c.: single small fragment, imaged — [CSNTM](https://manuscripts.csntm.org/Manuscript/Group/GA_P52). Not a "read cover to cover" item (one leaf, recto/verso).
- Lindisfarne Gospels, BL Cotton MS Nero D IV, c. 700: BL holds digitisation; 2026 online status NOT confirmed — [BL manuscripts viewer](https://bl.uk/manuscripts/Viewer.aspx).

### Inferences
Catalog table. Columns: item | holder + shelfmark | complete? | access | licence | text. "[BG]" = unverified; confirm live.

| Item | Holder / shelfmark | Complete? / size | Access | Licence | Text layer |
|---|---|---|---|---|---|
| Book of Kells | TCD MS 58 | Yes, 680 pp (verified) | TCD Digital Collections (digitalcollections.tcd.ie); IIIF [BG] | Permission required | No (Vulgate Gospels, text known) |
| Codex Sinaiticus | BL Add MS 43725 + Leipzig, Sinai, St Petersburg | Yes, reunified ~400 leaves surviving [BG] | codexsinaiticus.org IIIF (verified); no public manifest URL found | Non-commercial only | Yes, transcription + translations |
| Gutenberg Bible | many (see list) | Yes for HRC, BL, Göttingen, LoC etc. (1,282 pp/copy approx [BG]) | IIIF per copy | Varies; HRC [BG] CC BY-NC; BL PDM-ish [BG] | No (Latin Vulgate; text available elsewhere) |
| Voynich | Beinecke MS 408 | Yes, ~240 pp [BG] | Yale manifest (verified exists) | Yale open access PDM/CC0 [BG] | None (undeciphered) |
| Lindisfarne Gospels | BL Cotton Nero D IV | [BG] yes (258 ff) | BL viewer, status unverified | BL PDM [BG] | Old English gloss transcription [BG] |
| Codex Gigas | KB Stockholm, A 148 [BG] | Yes (310 ff [BG]) | kb.se viewer; IIIF unverified | Public domain | Latin; commentary |
| Plan of St Gall | Stiftsbibliothek Cod. Sang. 1092 | Single plan | e-codices IIIF | CC BY-NC 4.0 | No |
| St Gallen codices | Cod. Sang. (e.g. 1394 pattern) | Hundreds, complete | e-codices manifests | CC BY-NC 4.0 | Descriptions, some transcription |
| Très Riches Heures | Musée Condé, Chantilly, MS 65 [BG] | Yes 206 ff [BG]; Wikimedia Commons scans PD | Condé site/Commons [BG] | PD age, check host terms | No |
| First Folio | Bodleian Arch. G c.7 (verified); Folger | Yes (verified) | IIIF (verified) | CC BY 3.0 (verified) | Yes TEI (verified) |
| Codex Leicester | Bill Gates (private) | Not freely digitised; Leonardo Arundel: BL Arundel MS 263 [BG] | BL (status unknown); Codex Atlanticus etc. on Biblioteca Ambrosiana | restricted/unknown | Transcriptions exist (book editions) |
| Diamond Sutra | BL Or.8210/P.2 [BG] | 5m scroll, scrolls not pages | IDP (idp.bl.uk) [BG] | IDP terms (non-commercial) [BG] | Chinese text |
| Dead Sea Scrolls | IAA / Israel Museum | 5 complete scrolls; others fragments | deadseascrolls.org.il | Not verified; likely restrictive [BG] | Transcriptions on site [BG] |
| Aberdeen Bestiary | Aberdeen Univ. MS 24 [BG] | Yes (verified existence only through background) | abdn.ac.uk bestiary site; IIIF [BG] | CC BY-NC? [BG] | Latin + English transl. |
| Nuremberg Chronicle | many copies; e.g. NLM, Morgan | Yes, 600+ pp [BG] | e-rara (ETH) IIIF, BSB, Wikimedia | PD/CC0 on e-rara [BG] | No |
| Audubon Birds of America | LoC/ NYPL / Univ Pittsburgh [BG] | 435 plates | LoC IIIF [BG], NYPL | PD/CC0 [BG] | Text volumes (Ornithological Biography) separate |
| Kelmscott Chaucer | multiple (e.g. Bodleian, Harvard, LoC) | Yes [BG] | various | PD (1896) | Chaucer text |
| Codex Seraphinianus | Luigi Serafini, publisher | In copyright | none legal | restricted | undeciphered |
| Dresden Codex | SLUB Mscr.Dresd.R.310 | Yes, 74 pp [BG] | digital.slub-dresden.de / sachsen.digital (redirect seen) | CC BY-SA 4.0 or PDM [BG] | Glyph transcriptions (academic) |
| Codex Mendoza | Bodleian Arch. Selden A.1 | Yes (72 ff [BG]) | IIIF (verified) | CC BY-NC 4.0 reported | Spanish glosses, English translation |
| Shahnameh of Shah Tahmasp | Dispersed (Met, Aga Khan, private); Met pages PD/CC0 | Dispersed leaves | Met Open Access | CC0 | Persian |
| Blue Qur'an | Dispersed (Tunis Raqqada; Met, Bibliothèque nat. etc.) | Partial | varied | varied | Arabic |
| Hamzanama | Dispersed (MAK Vienna, V&A, Brooklyn) | Partial | varied | varied | Persian |
| Hereford Mappa Mundi | Hereford Cathedral | Single map | herefordcathedral.org zoomable | restricted [BG] | Latin labels |
| Magna Carta | BL Cotton Augustus ii.106; Lincoln; Salisbury | Single sheets | BL | PDM/limited | Latin + English |
| Euclid's Elements (Ratdolt 1482) | many; e.g. Biblioteca Apostolica, Linda Hall | Yes | varied IIIF | PD | Latin |
| Archimedes Palimpsest | Walters Art Museum W.571 | Yes, multispectral | archimedespalimpsest.org, Walters Digital Walters; CC licence [BG] | CC BY 3.0 [BG] | Heiberg/Netz transcriptions |
| Codex Argenteus | Uppsala UB DG 1 | Yes, 187 ff [BG] | Alvin portal IIIF [BG] | PD | Gothic text transcribed |
| Vergilius Vaticanus | BAV Vat. lat. 3225 | Yes, 76 ff (verified) | IIIF (verified URL) | check | Latin Aeneid |
| Rylands P52 | John Rylands Greek Papyrus 457 | One fragment | Manchester Digital Collections | check | Greek |

### Gaps
- Not researched or verified: Très Riches Heures, Codex Leicester, Leonardo Arundel (BL), Diamond Sutra, Aberdeen Bestiary, Nuremberg Chronicle, Audubon, Kelmscott, Dresden licence/manifest, Shahnameh/Blue Qur'an/Hamzanama, Mappa Mundi, Magna Carta, Euclid, Archimedes Palimpsest, Codex Argenteus, Admont, Strahov, El Escorial, Coimbra, ÖNB, NYPL, Morgan. Table entries for them are [BG] only.
- Folger First Folio licence/IIIF: search did not return it.
- No Codex Sinaiticus or Gutenberg per-copy example manifest URLs retrieved; use viewer "Manifest" links on each library page.
- Total page counts for Voynich, Lindisfarne, Gigas are [BG] approximations.

## 3. Ranked shortlist of 20 for "full read with page turn" (tentative; verify each live)

### Takeaway
Rank = complete + open licence + iconic. Only items 1-3 are strongly evidenced here; the rest need a rights/manifest check.

### Cited Findings
- Bodleian First Folio: CC BY 3.0, complete, IIIF, TEI text — [Bodleian](https://blogs.bodleian.ox.ac.uk/digital/2016/04/23/introducing-the-iiif-first-folio/)
- Vergilius Vaticanus: complete (76 pp), manifest known — [source](https://hyperallergic.com/vatican-digitized-a-1600-year-old-illuminated-manuscript-of-the-aeneid)
- Voynich: complete, Yale manifest exists — [Yale](https://collections.library.yale.edu/catalog/2002046)
- Book of Kells and Codex Sinaiticus are the iconic ones but restricted (permission / non-commercial) — [TCD](https://www.tcd.ie/library/dris/copyright.php), [Sinaiticus](https://codexsinaiticus.org/el/copyright.aspx)

### Inferences
Ranked list (1 = best for open, commercial-safe app):
1. Bodleian First Folio (CC BY 3.0, verified)
2. Voynich MS 408 (Yale, verify PD/CC0)
3. Gutenberg Bible, Göttingen or HRC/BL/LoC copy (verify licence per copy)
4. Vergilius Vaticanus (Vatican; verify terms)
5. Codex Gigas (KB; public domain, verify IIIF)
6. Dresden Codex (SLUB; verify)
7. Codex Argenteus (Uppsala Alvin; verify)
8. Très Riches Heures (Chantilly/Commons)
9. Nuremberg Chronicle (e-rara/BSB)
10. Audubon Birds of America (LoC/NYPL)
11. Kelmscott Chaucer (LoC/other PD scans)
12. Lindisfarne Gospels (BL, status uncertain; Commons fallback)
13. Codex Mendoza (Bodleian, CC BY-NC)
14. Aberdeen Bestiary (verify licence)
15. Euclid's Elements 1482 (PD scans)
16. Archimedes Palimpsest (Walters, CC)
17. Select e-codices Cod. Sang. (CC BY-NC; includes Plan of St Gall as a special viewer)
18. Codex Sinaiticus (non-commercial only; excellent text layer)
19. Book of Kells (permission required)
20. Diamond Sutra / Magna Carta (single sheets: scroll or flip-card treatment, not page turn)
- If the app is non-commercial, move Sinaiticus up to ~3 and Kells up (with permission).

### Gaps
- Ranking not validated against live manifests; run a script fetching each manifest, counting canvases, reading `rights`/`license`, and testing `{id}/full/!2000,2000/0/default.jpg` before shipping.
- Items 2-17 rights statements not quoted from source.
