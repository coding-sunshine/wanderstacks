# WorldLibs

A field guide to 52 of the world's great libraries, 42 still standing and 10 lost. You can spin them on a globe, walk through six of their halls in real 360-degree photographs, read 134 public-domain books page by page, and turn the pages of manuscripts their holders have digitised.

Live at <https://worldlibs.pages.dev>.

Every fact on the site carries its source. Every photograph carries its photographer and licence. When a room is reconstructed rather than photographed, the page says so.

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
