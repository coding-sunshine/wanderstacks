import { FLAT_WIDTH } from './geo'

const common = /* glsl */ `
const float PI = 3.14159265;
const float A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
const float FLAT_SCALE = ${(FLAT_WIDTH / 2).toFixed(4)} / (2.0 * 1.7320508 * PI / (3.0 * A1));
vec3 spherePos(float lon, float lat) { return vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon)); }
vec3 flatPos(float lon, float lat) {
  float th = asin(0.8660254 * sin(lat));
  float t2 = th * th, t6 = t2 * t2 * t2;
  float x = 2.0 * 1.7320508 * lon * cos(th) / (3.0 * (9.0 * A4 * t6 * t2 + 7.0 * A3 * t6 + 3.0 * A2 * t2 + A1));
  float y = th * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
  return vec3(x, y, 0.0) * FLAT_SCALE;
}
`

export const vertex = /* glsl */ `
${common}
uniform float uMorph;
varying vec2 vUv;
varying vec3 vSph;
varying vec3 vPos;
void main() {
  float lon = (uv.x - 0.5) * 2.0 * PI;
  float lat = (uv.y - 0.5) * PI;
  vSph = spherePos(lon, lat);
  vPos = mix(vSph, flatPos(lon, lat), uMorph);
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * vec4(vPos, 1.0);
}
`

export const fragment = /* glsl */ `
${common}
uniform sampler2D tDay, tNight, tMask, tRelief, tClouds;
uniform vec3 uSun;
uniform float uMorph, uTime;
varying vec2 vUv;
varying vec3 vSph;
varying vec3 vPos;
void main() {
  float lon = (vUv.x - 0.5) * 2.0 * PI;
  vec3 N = normalize(vSph);
  vec3 east = vec3(cos(lon), 0.0, -sin(lon));
  vec3 north = cross(N, east);
  vec3 rel = texture2D(tRelief, vUv).xyz * 2.0 - 1.0;
  vec3 Np = normalize(N + (east * rel.x + north * rel.y) * 0.5);

  float ndl = dot(Np, uSun);
  float day = smoothstep(-0.12, 0.2, ndl);
  day = mix(day, 0.5 + 0.5 * day, uMorph);
  float cloud = texture2D(tClouds, vec2(vUv.x + uTime * 0.0015, vUv.y)).r;

  vec3 land = mix(texture2D(tDay, vUv).rgb, vec3(0.96, 0.95, 0.92), cloud * 0.7);
  vec3 sunLight = mix(vec3(0.20, 0.24, 0.36), vec3(1.0, 0.93, 0.80) * (0.35 + 0.75 * clamp(ndl * 1.2 + 0.25, 0.0, 1.0)), day);
  vec3 col = land * sunLight;

  vec3 lights = texture2D(tNight, vUv).rgb * vec3(1.0, 0.78, 0.45) * 1.7;
  col += lights * (1.0 - day) * (1.0 - cloud * 0.8);

  vec3 V = normalize(cameraPosition - vPos);
  float spec = pow(max(dot(reflect(-uSun, N), V), 0.0), 140.0) * texture2D(tMask, vUv).r * day * (1.0 - cloud) * (1.0 - uMorph);
  col += vec3(1.0, 0.86, 0.55) * spec * 0.6;

  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0) * (1.0 - uMorph);
  col += vec3(0.79, 0.64, 0.29) * rim * (0.3 + 0.9 * smoothstep(-0.4, 0.5, dot(N, uSun)));

  gl_FragColor = vec4(col, 1.0);
}
`
