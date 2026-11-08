---
ontology: true
type: spec
domain: worldlibs
summary: World bible for the Illuminated Atlas design overhaul - visual grammar, tokens, components, motion, and per-surface art direction
status: active
tags: [worldlibs, design, spec]
relatedTo: [build-spec]
---

# WorldLibs world bible — The Illuminated Atlas

Design contract for the overhaul. Behaviour, data and budgets stay in
`docs/specs/build-spec.md`; this file says how the product *looks and moves*.
The owner judges the visuals; these rules keep every surface consistent.

## Thesis

A reading room by lamplight, at planetary scale. Scholarly instrument first,
cinema second: every effect must serve the books, the evidence or the wayfinding.
If a flourish does not, it is cut.

## Principles

1. **Poetry over chrome, cataloguing over decoration.** Giant EB Garamond
   display against microscopic letterspaced caps. The contrast is the brand.
2. **Lamplight, not neon.** Warm sources (gilt, lamp, ember) on near-black.
   Cool colors appear only where the world provides them (Earth imagery, sky).
3. **The evidence is the ornament.** Stamps, basis tints and source links are
   designed objects, not compliance UI. Honesty is the visual signature.
4. **Slow mass, never bounce.** One easing family, generous durations,
   interruptions resolve rather than snap.
5. **Stillness is a feature.** Idle scenes hold pixel-still (except the globe's
   slow drift and dust). Reduced motion degrades every move to a short fade.

## Color

| Token | Value | Role |
| --- | --- | --- |
| `--night` | `#0B0806` | App background, deepest shadow |
| `--oak` | `#3B2614` | Warm structural darks, panel cores |
| `--oak-light` | `#6B4A2B` | Wood mids, borders on dark |
| `--paper` | `#EFE4CC` | Primary text, page surfaces (inverted) |
| `--paper-dim` | `#C9B994` | Secondary text, ghost pins, metadata |
| `--ink` | `#1F1810` | Text on paper surfaces |
| `--gilt` | `#C9A24A` | Hairlines, frames, stamps, accents |
| `--lamp` | `#F2C97A` | Interactive warmth: links, hovers, lit pins |
| `--ember` | `#B4552D` | Fire chapters only. Never decorative. |

Surfaces: dark glass is `rgb(11 8 6 / 0.72)` over the scene with a 1px
`--gilt` hairline at 45% alpha. Paper surfaces (catalogue cards, reader)
use `--paper` bg, `--ink` text, and may carry a faint warm gradient.

Rules: max one gilt element per glance; ember only inside destruction
chapters; never place `--lamp` text under 4.5:1 contrast on its background.

## Typography

One family: EB Garamond (SIL OFL, self-hosted Latin subset).

| Level | Spec | Use |
| --- | --- | --- |
| Display | italic 400, `clamp(2.6rem, 7vw, 6.5rem)`, line-height 1.04, tight tracking | Hero lines, room titles |
| Title | 400, `clamp(1.6rem, 3vw, 2.4rem)` | Section heads, card titles |
| Body | 18px/1.55 | Prose, facts |
| Micro | 10–11px, caps, `letter-spacing 0.18–0.22em` | Eyebrows, metadata, stamps, credits, coordinates |
| Data | `font-variant-numeric: tabular-nums` | Years, measurements, readouts |

Micro-labels precede every display line (eyebrow rule). Never set display
text in non-italic caps; never letterspace lowercase.

## Texture & atmosphere

- **Grain**: one 128px canvas, regenerated procedurally at runtime, fixed,
  `pointer-events: none`, `opacity 0.05`, `mix-blend: overlay`. Drawn once
  under reduced motion. No `data:` images, no committed rasters.
- **Vignette**: pure CSS `radial-gradient` fixed layer, 55% strength at edges.
- **Plate frame**: a 1px gilt hairline inset 12px from the viewport with four
  corner ornaments, on every route. Never intercepts pointer events.
- **Room atmosphere**: dust motes (≤2000 points) only inside rooms with
  window light; dropped by the DPR governor before anything else.

## The stamp system

The provenance basis is a stamp: inked, slightly rotated (−6° to +4°),
rounder corners, a hairline inner rule, micro caps. Variants:

| Stamp | Color | Use |
| --- | --- | --- |
| `MEASURED` | gilt on dark | stated in a source |
| `EXCAVATED` | gilt on dark | from an excavation report |
| `ATTESTED` | paper on dark | described in an ancient/period text |
| `ESTIMATED` | paper-dim outline | photo-estimate |
| `COMPARANDUM` | paper-dim outline | borrowed from a named building |
| `RECONSTRUCTION` | ember-tinted | any invented design fill |
| `MYTH` | ember, hatched rule | panel-only, never on facts |

Stamps sit flush to the element they certify (card corner, HUD row, room
part). The Evidence tint uses the same hue logic: measured → gilt,
estimated/comparandum → parchment, invented → ink-wash ember.

## Components

- **Nav island**: floating pill, detached from the top (`mt 14px`, centered),
  glass blur, hairline gilt ring. Brand in italic gilt; links paper → lamp on
  hover. Mobile: island shrinks to brand + menu affordance.
- **Buttons**: ghost style — 1px gilt hairline, micro caps, pill on dark;
  filled gilt with `--ink` text only for the single primary action per view.
  Hover: lamp tint + inner icon nudge. Press: `scale(0.98)`.
- **Chips**: micro caps in a hairline pill for status (`VISITABLE`,
  `CATALOGUE`, `GLOBE ONLY`, era tags).
- **Catalogue card**: dark glass, gilt hairline, corner stamp, title (Title),
  meta line (place · years · Micro), one verified fact with source link,
  actions. On paper (reader/book contexts): paper bg, ink text, gilt rules.
- **Era slider**: a gilt gradient track on a 1px rule; circular paper thumb
  with gilt ring; year readout tabular; century ticks labelled in micro caps.
- **HUD marginalia**: room data lives in the lower corners, 11px caps, 55%
  paper, quiet until hovered or focused. Never overlays the scene center.
- **Myth panel**: ember hairline, hatched stamp, copy prefixed "The sources
  do not support this:" — visually quarantined from fact panels.

## Motion grammar

One family: `cubic-bezier(0.2, 0.7, 0.2, 1)`.

| Pattern | Duration | Notes |
| --- | --- | --- |
| View/route change | 180–200 ms | View Transitions where supported |
| Hero word reveal | 500–700 ms, 60 ms stagger | masked rise, only on first mount |
| Hover/focus | 200–300 ms | transform/opacity only |
| Camera (fly-to, dolly) | 2000–4000 ms | eased, no overshoot |
| Stamp press | 350 ms | rotate −8° → rest, scale 1.15 → 1, ease-out |
| Page turn | 450–600 ms | StPageFlip; fade ≤200 ms under reduced motion |
| Slider/pins response | ≤200 ms | immediate, physical |

Never animate width/height/top/left; transform + opacity only. Ambient
motion (globe drift, clouds, dust) stops under reduced motion and when the
tab is hidden. Every animation listens to `prefers-reduced-motion` and
degrades to opacity fades ≤200 ms or instant state.

## Surfaces

**Globe hero.** Earth is the protagonist; UI orbits it. Bottom-left: display
line "Walk the world's great libraries." with eyebrow "AN ILLUMATED ATLAS ·
30 LIBRARIES · 2,400 YEARS". Bottom center: era slider object. Bottom-right:
mode chips (GUIDED / ROAM / INDEX) — INDEX toggles the index strip. Pins are
gilt dots that bloom into paper on selection; ghost pins are dim rings.
Hovering a pin whispers its name + years in the caption line. The visit card
is a catalogue card with a `VISITABLE` chip or `GLOBE ONLY`.

**Atlas.** Unrolled Equal Earth as a plate: paper-dark land, ink graticule,
serif labels, pins as seals. The unroll morph stays the signature transition.

**Fly-to.** Rise–arc–settle with stars; assets stream during flight; cut to
room entry on arrival. Reduced motion: straight cut.

**Rooms.** Entry: exposure rises 0.4 → 1.0 over ~1.2 s like eyes adjusting;
dust hangs in beams; the far end starts as an impostor and resolves.
Controls: evidence / tour / sound as three quiet icons lower-right; enter /
exit as text buttons. Books pull with a stamp press on their card.

**Reader.** Nothing but paper and type: folio number outer-bottom, chapter in
small caps centered, lamp gradient at the spine, page edges darkened. Chrome
appears only on hover/focus/escape.

**Ledger & scan & living pages.** Ledger columns (attested / disputed /
unknown) are three catalogue stacks. Scan reader keeps the Bodleian credit
visible as a micro line. Living pages: predict → reveal → wax-seal stamp
under `wl.stamps`.

**Errors & empty states.** Honest, in-voice: "Not on any shelf." for 404,
"The globe could not be drawn in this browser." for WebGL failure, always
with a way back to the atlas.

## Accessibility & performance

- 4.5:1 minimum for text; 3:1 for stamps and hairlines on their surfaces.
- Every control reachable and labelled; focus ring is a 2px lamp outline.
- Static first frame: poster paints before JS; content readable without
  WebGL; no layout shift when the live globe takes over.
- Budgets from the build spec are design constraints: 5 MB initial, 25 MB
  per room, 4 MB globe, ≤200 draw calls, p95 frame ≤20 ms.

## Asset & provenance rules

- No committed raster assets beyond the whitelisted globe textures and SVGs;
  grain and textures generate at runtime or load from licensed hosts.
- Every image carries author + licence + URL in the credits surface.
- AI generates geometry, materials and decoration at build time only, tagged
  `invented`/`comparandum`; AI never authors facts, prose, faces or
  inscriptions. Every AI asset records model + date in credits.
- No paid-template assets, code or prompts. Genre traits only.
