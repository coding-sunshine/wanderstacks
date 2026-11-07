import { geoEqualEarth, geoOrthographic, geoPath, geoGraticule, geoCentroid, geoCircle, geoDistance } from "d3-geo";
import { feature } from "topojson-client";
import topo from "world-atlas/land-110m.json" with { type: "json" };
import { writeFileSync } from "fs";

const land = feature(topo, topo.objects.land);
// drop Antarctica: nothing to show there, wastes a fifth of the height
land.features = land.features.map(f => ({ ...f, geometry: { ...f.geometry,
  coordinates: f.geometry.coordinates.filter(poly => geoCentroid({ type: "Polygon", coordinates: poly })[1] > -60) } }));

const W = 1000;
const proj = geoEqualEarth().fitWidth(W, { type: "Sphere" });
const path = geoPath(proj).digits(1);
const [[, y0], [, y1]] = path.bounds(land);
const top = Math.floor(y0) - 6, bottom = Math.ceil(y1) + 6;

const xy = (lon, lat) => proj([lon, lat]).map(v => +v.toFixed(1));
const eu = [xy(-13, 60), xy(36, 60), xy(-13, 29), xy(36, 29)];
const ex = Math.min(...eu.map(p => p[0])), ey = Math.min(...eu.map(p => p[1]));
const europe = [ex, ey, +(Math.max(...eu.map(p => p[0])) - ex).toFixed(1), +(Math.max(...eu.map(p => p[1])) - ey).toFixed(1)];

const libs = JSON.parse(await Bun.file(new URL("./libs.json", import.meta.url)).text());
for (const l of libs) [l.px, l.py] = xy(l.lon, l.lat);

// static globe sketch for the plan page: orthographic, sun set so the terminator crosses Europe.
const G = 300, center = [20, 32], sun = [-78, 6], anti = [sun[0] + 180, -sun[1]];
const gp = geoOrthographic().rotate([-center[0], -center[1]]).fitExtent([[4, 4], [G - 4, G - 4]], { type: "Sphere" });
const gpath = geoPath(gp).digits(1), rad = Math.PI / 180;
const globe = { size: G, land: gpath(land), grat: geoPath(gp).digits(0)(geoGraticule().step([30, 30])()),
  twi: gpath(geoCircle().center(anti).radius(96)()), night: gpath(geoCircle().center(anti).radius(90)()),
  pins: libs.filter(l => geoDistance([l.lon, l.lat], center) < 88 * rad)
    .map(l => [...gp([l.lon, l.lat]).map(v => +v.toFixed(1)), geoDistance([l.lon, l.lat], anti) < 90 * rad ? 1 : 0, l.id]) };

const out = { globe,
  view: [0, top, W, bottom - top], europe,
  land: path(land),
  grat: geoPath(proj).digits(0)(geoGraticule().step([30, 30])()),
  libs: libs.map(({ lat, lon, ...rest }) => rest),
};
writeFileSync(new URL("./map.json", import.meta.url), JSON.stringify(out));
console.log("land", out.land.length, "grat", out.grat.length, "view", out.view, "europe", europe, "total", JSON.stringify(out).length);
