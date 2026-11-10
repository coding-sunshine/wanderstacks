import * as THREE from 'three';
import { smooth, lerp, fitFov, MOBILE, rng, TAIL } from './util';

// one record of public/lib/pins.json, as the home reads it
export type Ev = 'known' | 'probable' | 'speculative';
export interface Read { id: string; t: string; a: string | null; d: string | null; k: 'book' | 'scan' | 'card'; href: string }
// f is a base path served as `${f}-1920.webp` and `${f}-960.webp`; src is the Commons file page
export interface Photo { f: string; w: number; h: number; cap: string; by: string; lic: string; src: string }
export interface Lib {
  id: string; n: string; p: string; yl: string; y: number; lat: number; lon: number;
  lost?: number | boolean; found?: number; k: string; ev: Ev; evNote?: string;
  st?: string; stFrom?: number; dim?: string; vol?: string; book?: string; read?: string;
  wd?: string; href: string | null; hours: string | null; reads?: Read[];
  ph?: { out: Photo[]; in: Photo[] };
}
type Mark = 'k' | 'p' | 's';

export const SUN = new THREE.Vector3(1, .35, -.6).normalize();

// matches SphereGeometry's uv layout, so a point lands on its own pixel of the equirect map
const ll = (lat: number, lon: number, r = 1) => {
  const p = (lon + 180) * Math.PI / 180, t = lat * Math.PI / 180;
  return new THREE.Vector3(-Math.cos(p) * Math.cos(t), Math.sin(t), Math.sin(p) * Math.cos(t)).multiplyScalar(r);
};

const WV = `varying vec2 vUv; varying vec3 vN; varying vec3 vW;
void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;

const EARTH_F = `uniform sampler2D map; uniform vec3 uSun; uniform float uCity; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
void main(){
  vec3 n=normalize(vN), v=normalize(cameraPosition-vW);
  float d=dot(n,uSun); float night=1.-smoothstep(-.18,.14,d);
  vec3 t=texture2D(map,vUv).rgb; float L=dot(t,vec3(.2126,.7152,.0722));
  float city=smoothstep(.10,.55,L), land=smoothstep(.006,.05,L);
  vec3 lights=vec3(1.,.70,.38)*pow(L,1.25)*city*5.5*uCity;
  vec3 nightCol=vec3(.010,.013,.022)*(1.+land*(2.5+4.*(1.-uCity)))+lights;
  vec3 dayCol=mix(vec3(.010,.028,.06),vec3(.09,.12,.12),land)*(.25+1.4*smoothstep(-.1,.9,d));
  vec3 col=mix(dayCol,nightCol,night)+vec3(1.,.42,.16)*exp(-pow(d*5.5,2.))*.06
    +vec3(.25,.5,1.)*pow(1.-max(dot(n,v),0.),3.)*(.12+.9*smoothstep(-.4,.5,d));
  gl_FragColor=vec4(col,1.);
  ${TAIL}}`;

const HALO_F = `uniform vec3 uSun; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
void main(){
  vec3 n=normalize(vN), v=normalize(cameraPosition-vW);
  float f=clamp(-dot(n,v)/.45,0.,1.), g=f*f*f;
  vec3 col=vec3(.32,.58,1.)*g*(.15+1.6*smoothstep(-.45,.6,dot(n,uSun)));
  gl_FragColor=vec4(col,1.);
  ${TAIL}}`;

const PIN_V = `attribute float aSize; attribute vec3 aColor; attribute float aKind;
uniform float uPx; varying vec3 vC; varying float vK; varying float vF;
void main(){
  vec4 w=modelMatrix*vec4(position,1.); vec4 mv=viewMatrix*w;
  vec3 wn=normalize(mat3(modelMatrix)*position);
  vF=smoothstep(-.05,.15,dot(wn,normalize(cameraPosition-w.xyz)));
  gl_PointSize=min(aSize*uPx*(3.4/-mv.z),40.);
  vC=aColor; vK=aKind; gl_Position=projectionMatrix*mv;
}`;
const PIN_F = `uniform float uA; varying vec3 vC; varying float vK; varying float vF;
void main(){
  float d=length(gl_PointCoord-.5)*2.;
  float a=vK>.5 ? smoothstep(.12,0.,abs(d-.6)) : exp(-d*d*6.)+smoothstep(.25,0.,d)*.6;
  a*=uA*vF; if(a<.003) discard;
  gl_FragColor=vec4(vC,a);
  ${TAIL}}`;

export type Atlas = ReturnType<typeof buildAtlas>;

export function buildAtlas(tex: THREE.Texture, libs: Lib[]) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#030303');
  const camera = new THREE.PerspectiveCamera(35, 1, .01, 200);
  camera.position.set(0, 0, 5.2);
  scene.add(camera);

  const outer = new THREE.Group(), inner = new THREE.Group();
  outer.add(inner); scene.add(outer);

  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1, MOBILE ? 64 : 96, MOBILE ? 48 : 64),
    new THREE.ShaderMaterial({ uniforms: { map: { value: tex }, uSun: { value: SUN }, uCity: { value: 1 } }, vertexShader: WV, fragmentShader: EARTH_F })
  );
  inner.add(earth);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 48),
    new THREE.ShaderMaterial({ uniforms: { uSun: { value: SUN } }, vertexShader: WV, fragmentShader: HALO_F,
      side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  halo.scale.setScalar(1.12);
  outer.add(halo);

  // pins + spikes, one per record. h eases 0..1 as a room is founded, x eases 0..1 as it is lost.
  const H: Record<Mark, number> = { k: .06, p: .045, s: .035 }, SZ: Record<Mark, number> = { k: 1, p: .85, s: 1.1 };
  const COL: Record<Mark, number[]> = { k: [1, .68, .32].map(c => c * 3.2), p: [.78, .84, 1].map(c => c * 2.2), s: [.95, .75, 1].map(c => c * 2.2) };
  const EMBER = [1, .3, .12].map(c => c * 1.3), SPIKE = [1, .72, .4].map(c => c * .9);
  const n = libs.length, ev = libs.map(r => r.ev[0] as Mark);
  const foot = libs.map(r => ll(r.lat, r.lon, 1.002)), dir = foot.map(v => v.clone().normalize());
  const h = new Float32Array(n).fill(1), x = new Float32Array(n), hT = new Float32Array(n).fill(1), xT = new Float32Array(n);
  const pos = new Float32Array(n * 3), size = new Float32Array(n), col = new Float32Array(n * 3), seg = new Float32Array(n * 6), segC = new Float32Array(n * 6);
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pg.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  pg.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  pg.setAttribute('aKind', new THREE.Float32BufferAttribute(ev.map(e => e === 's' ? 1 : 0), 1));
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(seg, 3));
  sg.setAttribute('color', new THREE.BufferAttribute(segC, 3));
  // ponytail: CPU rewrite of every pin when one moves; fine for 52, move to a uYear uniform past a few thousand
  function writePins() {
    for (let i = 0; i < n; i++) {
      const e = ev[i], b = foot[i], top = dir[i].clone().multiplyScalar(1.002 + H[e] * h[i] * (1 - .55 * x[i]));
      pos.set([top.x, top.y, top.z], i * 3);
      size[i] = SZ[e] * h[i] * (1 - .3 * x[i]);
      for (let c = 0; c < 3; c++) {
        col[i * 3 + c] = lerp(COL[e][c], EMBER[c], x[i]);
        segC[i * 6 + c] = segC[i * 6 + 3 + c] = lerp(SPIKE[c], EMBER[c] * .5, x[i]) * h[i];
      }
      seg.set([b.x, b.y, b.z, top.x, top.y, top.z], i * 6);
    }
    for (const a of [pg.attributes.position, pg.attributes.aSize, pg.attributes.aColor, sg.attributes.position, sg.attributes.color]) a.needsUpdate = true;
  }
  writePins();
  const pinMat = new THREE.ShaderMaterial({ uniforms: { uPx: { value: 12 }, uA: { value: .55 } }, vertexShader: PIN_V, fragmentShader: PIN_F,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  inner.add(new THREE.Points(pg, pinMat));
  inner.add(new THREE.LineSegments(sg, new THREE.LineBasicMaterial({ vertexColors: true,
    transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending })));

  // lost:true means lost on an unknown date: half-ember from founding, never counted as standing
  // the night texture is today's electric light; before the grid, only the libraries glow
  function setYear(yr: number) {
    earth.material.uniforms.uCity.value = smooth(1880, 1990, yr);
    libs.forEach((r, i) => {
      hT[i] = r.y <= yr ? 1 : 0;
      xT[i] = r.lost === true ? .5 : typeof r.lost === 'number' && r.lost <= yr ? 1 : 0;
    });
  }

  // focus: angles that bring a point to face the camera. Nothing is focused on arrival; the globe drifts.
  const angles = (v: THREE.Vector3) => [Math.atan2(-v.x, v.z), Math.atan2(v.y, Math.hypot(v.x, v.z))];
  const [nY, nX] = angles(ll(20, 20));
  let [fY, fX] = [nY, nX], [tY, tX] = [fY, fX], lt = 0, focused = false;
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#d8a65a').multiplyScalar(4), transparent: true, opacity: 0,
    side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(new THREE.RingGeometry(.012, .016, 64), ringMat);
  inner.add(ring);
  function focus(lat: number, lon: number) {
    const v = ll(lat, lon);
    [tY, tX] = angles(v);
    ring.position.copy(v).multiplyScalar(1.003);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), v);
    focused = true;
  }
  function clear() { focused = false; tX = nX; }

  // nearest founded, front-facing pin to a click, in normalised device coords; -1 when none is close
  const tmp = new THREE.Vector3();
  function pick(nx: number, ny: number, maxPx: number, w: number, h2: number) {
    inner.updateMatrixWorld(); camera.updateMatrixWorld();
    let best = -1, bd = maxPx * maxPx;
    for (let i = 0; i < n; i++) {
      if (h[i] < .5) continue;
      tmp.fromArray(pos, i * 3).applyMatrix4(inner.matrixWorld);
      const facing = tmp.clone().sub(outer.position).normalize().dot(camera.position.clone().sub(tmp).normalize());
      if (facing < .15) continue;
      tmp.project(camera);
      const dx = (tmp.x - nx) * w / 2, dy = (tmp.y - ny) * h2 / 2, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  // stars
  const R = rng(668), N = MOBILE ? 1800 : 3000, sp = new Float32Array(N * 3), sc = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const u = R() * 2 - 1, th = R() * Math.PI * 2, r = 60 + R() * 30, s = Math.sqrt(1 - u * u);
    sp.set([Math.cos(th) * s * r, u * r, Math.sin(th) * s * r], i * 3);
    const b = R() < .04 ? 2 + R() * 2 : .15 + R() ** 3 * 1.2, tint = R();
    sc.set(tint < .2 ? [b * .8, b * .9, b * 1.15] : tint > .9 ? [b * 1.1, b * .95, b * .75] : [b, b, b], i * 3);
  }
  const stg = new THREE.BufferGeometry();
  stg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  stg.setAttribute('color', new THREE.BufferAttribute(sc, 3));
  const starMat = new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, depthWrite: false });
  const stars = new THREE.Points(stg, starMat);
  scene.add(stars);

  let baseFov = 35;
  function resize(w: number, h: number, dpr = 1) {
    camera.aspect = w / h; baseFov = fitFov(35, w / h, 1.0); camera.fov = baseFov; camera.updateProjectionMatrix();
    pinMat.uniforms.uPx.value = 12 * dpr;
    starMat.size = 1.6 * Math.min(dpr, 1.5);
  }

  const wrap = (d: number) => ((d + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  function update(pA: number, time: number, px = 0, py = 0, sx = 0, sy = 0) {
    const dt = time - lt; lt = time;
    const k = dt > 0 ? 1 - Math.exp(-dt * 3.2) : 1, kp = dt > 0 ? 1 - Math.exp(-dt * 2.4) : 1;
    if (!focused) tY -= dt * .05;
    fY += wrap(tY - fY) * k; fX += (tX - fX) * k;
    let moved = false;
    for (let i = 0; i < n; i++) {
      if (Math.abs(hT[i] - h[i]) > 1e-3 || Math.abs(xT[i] - x[i]) > 1e-3) {
        h[i] += (hT[i] - h[i]) * kp; x[i] += (xT[i] - x[i]) * kp; moved = true;
      } else if (h[i] !== hT[i] || x[i] !== xT[i]) { h[i] = hT[i]; x[i] = xT[i]; moved = true; }
    }
    if (moved) writePins();
    const e1 = smooth(.12, .5, pA), e2 = smooth(.5, .78, pA), e3 = smooth(.8, 1, pA);
    outer.position.set(sx, sy, 0);
    inner.rotation.y = lerp(fY - 1.25 + Math.sin(time * .05) * .25, fY, smooth(.05, .55, pA));
    outer.rotation.x = lerp(.22, fX, smooth(.15, .55, pA));
    const f = 1 - e3;
    camera.position.set(px * .06 * f, -py * .06 * f, 5.2 - 1.8 * e1 - 1 * e2 - .95 * e3);
    camera.fov = baseFov * lerp(1, .7, e3); camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
    pinMat.uniforms.uA.value = .55 + .45 * smooth(.2, .4, pA);
    ringMat.opacity = focused ? (.55 + .45 * Math.sin(time * 2.4)) * smooth(.45, .65, pA) : 0;
    stars.rotation.y = time * .004;
  }

  return { scene, camera, resize, update, setYear, focus, clear, pick };
}
