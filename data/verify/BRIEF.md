---
type: spec
status: active
tags: [wanderstacks, verification, data]
relatedTo: ["../libs.json", "../../reports/Wanderstacks libraries and books.md"]
---

# Wanderstacks fact verification brief

Wanderstacks is a three.js experience of the world's great libraries, past and present. Every
fact it shows (dates, dimensions, floor plans, books on the shelves, readable texts) must
trace to a source fetched and quoted. You are one of several verifiers, each covering a
slice. Accuracy beats coverage: a short list of proven facts is better than a long list
of guesses.

Inputs:

- `data/libs.json`: one row per library. Fields:
  `id`, `n` name, `p` place, `y` built year (negative = BCE), `yl` year label (`*` = from
  background knowledge, unproven), `lost`, `found`, `dim`, `vol`, `st` status note,
  `book` signature book, `ev` evidence level.
- `reports/Wanderstacks libraries and books.md`: the
  earlier research report. Its claims are leads, not proof.

## Rules

1. `status` is `"passing"` only when you fetched the source in this run and it states the
   value. Put the exact supporting text (at most 200 characters) in `quote`. Otherwise
   `"failing"`. Never infer, never fill from memory. Unproven = failing.
2. `check` is the exact command that re-proves the row, e.g.
   `curl -sL 'https://example.org/page' | rg -o -m1 '1712.{0,60}'`. Prefer sources that
   curl can read. When only WebFetch works, write `WebFetch 'URL'` and rely on `quote`.
3. `tier` ranks the source: `primary` (holding institution, excavation authority,
   official catalogue, HABS/heritage register, peer-reviewed publication), `secondary`
   (reputable press, museum or university page that is not the holder), `wikipedia`.
   Use Wikipedia only to find better sources; a Wikipedia-only row is allowed but must
   say `"tier": "wikipedia"`.
4. Years: integers, negative for BCE. For uncertain dates give `earliest` and `latest`.
5. If a libs.json value is wrong or imprecise, add a `corrections` row.
6. Be polite to servers (no bulk crawling) and efficient: about 40 tool calls at most.
   Never print secrets.

## Output

Write one JSON file (valid JSON, no comments) to the path in your task:

```json
{
  "cluster": "name",
  "facts": [
    {"lib": "longroom", "field": "built", "value": "1712-1732", "earliest": 1712, "latest": 1732,
     "source": "URL", "tier": "primary", "quote": "...", "status": "passing", "check": "..."}
  ],
  "events": [
    {"lib": "nineveh", "kind": "destroyed", "year": -612, "earliest": -612, "latest": -612,
     "label": "Nineveh sacked; palace burned", "source": "URL", "tier": "primary",
     "quote": "...", "status": "passing", "check": "..."}
  ],
  "plans": [
    {"lib": "loc", "kind": "measured-drawing", "title": "HABS DC-...", "url": "URL",
     "licence": "public domain", "status": "passing", "check": "..."}
  ],
  "books": [
    {"id": "kells", "lib": "longroom", "title": "Book of Kells", "author": null, "date": "c. 800",
     "relation": "held", "holder": "Trinity College Dublin", "shelfmark": "MS 58",
     "catalogue_url": "URL", "access": "readable-scan",
     "read": {"kind": "iiif", "id": null, "url": "manifest URL", "licence": "...",
              "edition": "...", "complete": true},
     "why": "one line: why it belongs on this shelf",
     "source": "URL", "tier": "primary", "quote": "...", "status": "passing", "check": "..."}
  ],
  "corrections": [
    {"lib": "longroom", "field": "yl", "old": "...", "new": "...", "source": "URL"}
  ]
}
```

Field values:

- `facts.field`: `name`, `place`, `built`, `architect`, `dims` (length x width x height in
  metres), `volumes`, `status_note` (closures, restorations), `remains_today` (for lost
  libraries: what physically survives on site).
- `events.kind`: `founded`, `built`, `opened`, `damaged`, `destroyed`, `lost`, `sealed`,
  `rediscovered`, `excavated`, `rebuilt`, `closed`, `reopened`.
- `plans.kind`: `measured-drawing`, `published-plan`, `excavation-plan`, `3d-scan`,
  `photo-set`, `none-found`. Give the licence exactly as the source states it.
- `books.relation`: `held` (in this room or library today), `survived` (from a lost
  library, now elsewhere; holder = where it is now), `known-lost` (attested by a named
  ancient or historical source, no copy survives), `associated` (made or famous there,
  held elsewhere).
- `books.access`:
  - `readable-text`: a complete public-domain or CC0 text exists. Verify Gutenberg with
    `curl -s 'https://gutendex.com/books/?search=TITLE'` and
    `curl -s 'https://gutendex.com/books/ID'`; Standard Ebooks with
    `curl -sI 'https://standardebooks.org/ebooks/AUTHOR/TITLE'`. Record translator and
    translation year; US public domain needs publication before 1931. Set
    `complete: false` and list all volume IDs in `edition` when the work spans volumes.
  - `readable-scan`: an IIIF manifest URL returns 200 and its licence allows reuse (say
    if non-commercial or permission-only).
  - `catalog`: no open full text or scan. Shown as a closed book with basic info only.
  - `ghost`: known-lost; title only.

Aim for 3 to 8 books per library: the items a visitor would most want to see, real
holdings first.

When done, reply with at most 120 words: counts of passing and failing rows, the three
most important corrections, and anything you could not settle.
