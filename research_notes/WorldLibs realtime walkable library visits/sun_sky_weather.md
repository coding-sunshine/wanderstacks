---
type: research-note
domain: worldlibs
status: active
tags: [worldlibs, sun-sky-weather]
relatedTo: [reports/WorldLibs realtime walkable library visits.md]
---

# Sun, sky and live weather data for WorldLibs (as of 2026-11-08)

Research depth note: ~19 tool calls; several rendering/precedent questions only partly answered (see Gaps).

## Sun and moon position: library or 30 lines?

### Takeaway
SunCalc (BSD-2, small, ~0.1 deg) is plenty for window light; astronomy-engine (MIT, ~116 KB min) is overkill. A hand-rolled NOAA/Meeus sun formula is also viable, but SunCalc already gives sun+moon+phase in one tiny dependency, so use it.

### Cited Findings
- SunCalc licence BSD-2-Clause; API getPosition, getTimes, getMoonPosition, getMoonIllumination, getMoonTimes; based on Meeus "Astronomical Algorithms"; README claims typical error sun ~0.08 deg, moon ~0.09 deg, rise/set ~15 s; README mentions a "2.0" precision-focused rewrite with breaking changes (version/availability on npm not verified) — [mourner/suncalc](https://github.com/mourner/suncalc)
- astronomy-engine: MIT; JS bundle 116,485 bytes minified; accuracy within 1 arcminute of NOVAS; runs in browser with no deps; covers Sun, Moon, planets — [cosinekitty/astronomy](https://github.com/cosinekitty/astronomy)

### Inferences
- 0.08 deg and 1 arcmin are both far under the 1 deg target; sun apparent width is ~0.5 deg, so a shadow cannot show the difference. Choose by size/features, not accuracy.
- Moon phase/position need Meeus-lite series; a 30-line formula is realistic for the sun only (NOAA algorithm), not the moon. Not verified by a source here.
- Atmospheric refraction near horizon is not needed for a game feel.

### Gaps
- Did not fetch NOAA solar calculator spreadsheet docs or measure SunCalc gzip size (README shows only a badge; commonly cited ~1-2 KB, unverified).
- Did not confirm SunCalc 2.0 is published to npm.

## Free weather APIs

### Takeaway
Open-Meteo is the best fit: no key, CORS works, 15-minutely `current` data with cloud_cover/precip/snowfall/weather_code/is_day, free for non-profit sites with CC BY 4.0 attribution, 10,000 calls/day. Still route through a Worker cache so quotas are per-library, not per-visitor. MET Norway is the backup (CC BY 4.0, but UA/coordinate rules). NWS is US-only.

### Cited Findings
- Open-Meteo free = "private or non-profit websites or apps that do not have subscriptions or advertising"; limits 600/min, 5,000/hour, 10,000/day, 300,000/month; limits apply by IP and application; CC BY 4.0; commercial use (ads, subscriptions) needs paid plan — [Open-Meteo terms](https://open-meteo.com/en/terms)
- Open-Meteo `current` supports every hourly variable (temperature, is_day, precipitation, rain, showers, snowfall, weather_code, cloud_cover, pressure, wind speed/direction/gusts); current data based on 15-minutely model data — [Open-Meteo docs](https://open-meteo.com/en/docs)
- Open-Meteo CORS: preflight support fix merged Nov 2023 (PR #528, issue #526), implying browser calls work — [GitHub issues](https://github.com/open-meteo/open-meteo/issues?q=CORS) (indirect evidence; not a doc statement)
- MET Norway Locationforecast: identifying User-Agent required (or Origin/Referer when headers cannot be set); max 20 req/s; respect `Expires`, use `If-Modified-Since`; coordinates max 4 decimals else 403; CC BY 4.0 credit; simple cross-origin requests allowed for low-volume sites, non-simple (custom headers) not supported — [MET API ToS](https://api.met.no/doc/TermsOfService)
- NWS api.weather.gov: US only, ~2.5 km grid, free open data, User-Agent required (to be replaced by API key in future), rate limit undisclosed ("generous"); browsers: custom User-Agent triggers a CORS preflight that weather.gov rejects; works if omitted in Chrome/Firefox per forum reports; proxy is the supported fix — [NWS docs](https://www.weather.gov/documentation/services-web-api); [weather-gov/api discussion #312 and MagicMirror forum via search](https://github.com/weather-gov/api/discussions/312)
- Pirate Weather: API key mandatory (so must be Worker-side); free 10,000 calls/month ($2 donation = 20,000); NOAA GFS/HRRR/NBM data; CORS not documented; RapidAPI listing shows a different 200/month tier — [Pirate Weather docs](https://docs.pirateweather.net/en/latest/); [search result summary](https://rapidapi.com/alexander0042/api/pirateweather/pricing)
- OpenWeather: free 60 calls/min, 1,000,000/month, includes current weather; key required; One Call first 1,000 daily calls free (pay-per-call, needs card) — [OpenWeather pricing](https://openweathermap.org/price)
- Tomorrow.io free: 500/day, 25/hour, 3/s; key required — [Tomorrow.io support](https://support.tomorrow.io/hc/en-us/articles/20273728362644-Free-API-Plan-Rate-Limits)
- WeatherAPI.com free: 60 calls/min, 1,000 daily per a search summary; key required — [WeatherAPI blog](https://blog.weatherapi.com/?p=50) (secondary, weak)

### Inferences
- Open-Meteo `visibility` is a model variable too (not shown in the fetched list excerpt); verify before relying on it for fog.
- Open-Meteo accepts multi-location in one call (comma-separated coords) — from memory, unverified; would let one Worker request refresh all libraries.
- Keyed providers (Pirate, OWM, Tomorrow, WeatherAPI) only work via Worker with secret; no benefit over Open-Meteo for this use.

### Gaps
- 7Timer status/terms: no data found.
- Open-Meteo attribution exact wording and whether it must be visible on-page: only "CC BY 4.0" found.
- Open-Meteo `Access-Control-Allow-Origin` header not directly verified with curl.
- Pirate/OWM/WeatherAPI CORS and attribution text not verified.

## Caching on a static Cloudflare site

### Takeaway
Pages Function or Worker fronting Open-Meteo with Cache API, TTL ~15 min (matches model cadence), keyed per library (rounded lat/lon). 100 libraries x 4 refreshes/hr x 24 = ~9,600 upstream calls/day worst case, near the 10,000/day cap, so use 30-min TTL or batch locations.

### Cited Findings
- Workers Free: 100,000 requests/day (resets midnight UTC, error 1027 beyond), 10 ms CPU/request, 50 subrequests/request, Cache API calls count toward the 50 — [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- KV free (Feb 2026 figures per a third-party blog): 100,000 reads/day, 1,000 writes/day, 1 GB; Cache API has no metered quota, L1 per-datacenter — [search summary of eastondev/tensorfeed posts](https://eastondev.com/blog/en/posts/dev/20260526-cloudflare-free-limits/) (secondary; confirm on Cloudflare pricing page)
- Cache API works on custom domains and workers.dev per search summary of [Cloudflare cache limitations](https://developers.cloudflare.com/workers/cache/limitations/) (not fully read)

### Inferences
- Cache API is per-datacenter, so upstream calls scale with (libraries x active PoPs x refreshes/hour), not libraries alone. If traffic is global that multiplies the count; KV (global, 1,000 writes/day) or a Cron-triggered Worker writing one KV blob per refresh is more predictable: one cron every 30 min = 48 batch calls/day.
- Fallback: serve stale-while-error (last KV value), then client falls back to pure astronomy (clear sky, sun from SunCalc) so the site never depends on the API.
- Client should call own origin `/api/weather?lib=id`, never Open-Meteo directly, to stay under per-IP limits and hide upstream.

### Gaps
- Exact Cache API per-colo behaviour and tiered cache for workers.dev not verified from primary doc.
- Cron Trigger free-tier limits not checked.

## three.js rendering techniques

### Takeaway
Start with three's built-in Preetham `Sky` (WebGL) or `SkyMesh` (WebGPU) driven by SunCalc, plus a DirectionalLight with shadow through windows, and tone-mapping exposure keyed to sun altitude and cloud cover. Heavier physically-based atmosphere (three-geospatial) is an upgrade, not a requirement.

### Cited Findings
- three `Sky` is Preetham-based, WebGLRenderer only; `SkyMesh` for WebGPURenderer; uniforms turbidity, rayleigh, mieCoefficient, mieDirectionalG, sunPosition; hide sun disc (`showSunDisc`) when rendering env maps — [three.js Sky docs](https://threejs.org/docs/pages/Sky.html); [SkyMesh docs](https://threejs.org/docs/pages/SkyMesh.html)
- three-geospatial (Takram): MIT; packages atmosphere (Precomputed Atmospheric Scattering, beta), clouds (volumetric, beta), core and effects (alpha); WebGL supported, WebGPU/node-based rewrite in progress (atmosphere and core done, clouds pending); work "concluded March 2025" per README — [three-geospatial](https://github.com/takram-design-engineering/three-geospatial)

### Inferences (from general knowledge, not sourced here; verify before building)
- Indoors the sky matters mostly as light: sample Sky into a PMREM env map (`PMREMGenerator.fromScene`) occasionally (e.g. on 5-min sun change, not per frame) for IBL through windows; sun as DirectionalLight with PCFSoft shadow map; cloud cover scales sun intensity and lerps turbidity up.
- God rays: cheap fake = additive billboard/cone meshes per window with noise-modulated opacity, scaled by sun intensity; postprocessing GodRays is costly on mobile.
- Rain/snow: GPU Points or instanced quads near camera only; wet glass via normal-map droplets on window material; night: warm point lights/emissive lamps faded in by sun altitude below ~ -4 deg.
- Mobile: avoid volumetric clouds and full Bruneton; analytic sky + baked lightmaps + one shadow-casting light.

### Gaps
- No performance numbers, demo links for Hosek-Wilkie in three, god-ray repos, or HDRI time-of-day blending examples were fetched. Needs a follow-up pass.

## Historical and lost libraries

### Takeaway
No dedicated precedent found. Practical options: show the current sky at the site (matches "now" brand promise), and optionally label it; astronomy-engine/Stellarium-style tools can compute historical skies if a "date in history" mode is wanted.

### Cited Findings
- Stellarium simulates the sky anywhere, between 100,000 BCE and 100,000 CE; a plugin exists for 3D archaeological reconstructions — [search summary, Spektrum Dendera/Stellarium post](https://scilogs.spektrum.de/uhura-uraniae/die-dendera-sternkarte-in-stellarium/)
- No specific Library of Alexandria real-time-sky project was found — same search.

### Inferences
- Weather for a vanished building is just weather at the coordinates; Alexandria's coast is ~unchanged, so current lat/lon works. Sun/moon geometry for the present is correct enough; star field drift over 2,000 years is small for visuals.

### Gaps
- No precedents located; do not claim any.

## Existing real-time sun/weather-synced 3D web projects

### Takeaway
Not researched with sources in this pass.

### Gaps
- Google Earth sun, Cesium `scene.light`/sun lighting by clock, Bruno Simon's portfolio (day/night, weather) and similar not fetched. Follow-up needed.
