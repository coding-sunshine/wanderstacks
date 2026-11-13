# Wanderstacks open data

Generated 2026-11-11T17:59:22Z. Page: https://wanderstacks.com/data/

- libraries.json: one row per library. id, n (name), p (place), lat, lon, k (kind), y/yl (year, label), tier (mvp or lost), wd (Wikidata id).
- facts.json: one row per sourced claim. id (anchors the claim on its library page), lib, field, value, source (URL), tier, quote (the source's words, when held).
- events.json: dated events. id, lib, kind, year, label, source, tier, quote.
- libraries.jsonld: schema.org Library (LandmarksOrHistoricalBuildings for lost ones) with Wikidata sameAs.
- dispersal.json: current holders of surviving collections, with coordinates, source tier and any verified IIIF manifest.
- tours.json: external official and third-party tours, provider, scope, checked date and view-only notes.
- captures.json: real 3D candidates and ready captures, with author, licence, source, alignment and any version discrepancy.
- concordance.json: links between spatial hotspots and related manuscripts, including the limits of identification.
- conservation.json: restoration schedules and the real repeat captures still needed.
- phases.json: sourced architectural phases used by the same-camera comparison.

Tiers: primary (the institution or an original document), secondary (scholarship or press), wikipedia (Wikipedia, cited as such), unproven (stated but not yet sourced). Claims whose check failed are left out. A claim's page is https://wanderstacks.com/libraries/<lib>/#<id>.

Licence: the compilation is released under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Quoted source text stays under its own licence; Wikipedia-tier wording follows CC BY-SA. Corrections: open an issue at https://github.com/coding-sunshine/wanderstacks/issues.
