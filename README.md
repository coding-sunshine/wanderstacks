# Wanderstacks

A field guide to 52 of the world's great libraries, 42 still standing and 10 lost. You can spin them on a globe, walk through six of their halls in real 360-degree photographs, read 134 public-domain books page by page, and turn the pages of manuscripts their holders have digitised.

Live at <https://wanderstacks.com>.

Every fact on the site carries its source. Every photograph carries its photographer and licence. When a room is reconstructed rather than photographed, the page says so.

## What's on the site

- **Globe.** Every library pinned on a [globe](https://wanderstacks.com/atlas/) you can spin, standing and lost alike.
- **Library pages.** Each of the 52 libraries gets a page with its founding, losses, holdings and size. Every claim links to its source and is tagged primary, secondary, Wikipedia or unproven. The [calendar](https://wanderstacks.com/calendar/) lists the dated fires, closures and rebuilds across all of them.
- **Halls you can walk.** Six reading rooms (Admont, the Library of Celsus, the Library of Congress, the Long Room at Trinity College Dublin, State Library Victoria and Strahov) are stitched from real 360-degree photographs.
- **Books.** 134 public-domain texts read in the browser, page by page. They sit in a catalogue of 202 books tied to the libraries, shelved by century, language and author. Books can be saved for offline reading.
- **Manuscripts.** Digitised manuscripts, from the Diamond Sutra to the Codex Gigas, stream as IIIF from the libraries that hold them and zoom to full resolution.
- **Follow the collection.** For libraries whose books were scattered, a journey from the original building to the institutions that hold them now.
- **Compare.** Two halls in one frame with a swipe divider, and their dates, holdings and status side by side.
- **Display settings.** Text size, spacing, contrast and motion, kept in your browser.

## Open data

Everything the site states is downloadable from <https://wanderstacks.com/data/>: 726 sourced facts, 179 dated events, the library list as JSON and as schema.org JSON-LD linked to Wikidata, and the current holders of dispersed collections. `public/data/README.md` describes every field. The compilation is CC BY 4.0.

Found a wrong date or a dead source? [Open an issue](https://github.com/coding-sunshine/wanderstacks/issues). Each fact has its own anchor on its library page, so a link to it is the quickest way to point at the problem.

## How it's built

A static [Astro](https://astro.build) site, built with Bun and hosted on Cloudflare Pages. A push to `main` deploys. Nothing runs on a server at visit time. Facts, rooms and book texts are built into static files, and manuscript scans are fetched live from their holders.

The 360-degree halls use Photo Sphere Viewer, 3D rooms use three.js and Spark, manuscript zoom uses OpenSeadragon, and search is Pagefind. Data scripts live in `scripts/`, and the checked-in sources of truth live in `data/`.

## Run it

You need [Bun](https://bun.sh) 1.4.

```sh
bun install
bun run dev        # builds the data, then starts Astro on localhost:4173
bun run build      # the full static site in dist/
```

The first data build downloads the Gutenberg texts and IIIF manifests it needs and caches them in `.cache/`. Later builds reuse that cache.

Before a release, run the same gate CI runs:

```sh
bun run typecheck && bun run test && bun run build
```

Feature checks live in `scripts/checks/`. Each one reads `dist/` and prints `ok` or `FAIL`. `overhaul.json` and `todo.json` list which ones currently pass, and CI runs those.

## Licences

The code is MIT. See `LICENSE`.

The content keeps the licence it came with, which the MIT licence does not cover:

- **Book texts** come from Project Gutenberg and are in the public domain in the US.
- **Photographs** come from Wikimedia Commons. Each file has its own licence (CC0, CC BY, CC BY-SA or public domain), shown wherever the photo appears and recorded in `data/photos.json`.
- **Manuscript scans** belong to the libraries that hold them and are used under each holder's terms. Several are CC BY-NC 4.0, so they can't be reused commercially. Each scan's licence is in `public/scan/<id>/pages.json`.
- **The Mafra Library impulse response** (`public/ir/`) is from REVERBDATA under CC BY-NC-SA 4.0.

If you reuse anything from `public/`, check that file's own licence first.
