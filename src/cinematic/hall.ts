import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clamp, smooth, lerp, fitFov, MOBILE, RM, rng } from './util';
import { planks, mullions, books, hallTitle } from './textures';
import { shafts, dust, evidenceMats, dimLines } from './fx';

// The Long Room, Trinity College Dublin: 63.7 m x 12.2 m x 14.2 m. Built 1712-1732, vaulted 1860.
const HZ = 31.85, HW = 6.1, HH = 14.2, SPR = 9, RISE = 5.2, BAY = 3.185, NB = 20, PI = Math.PI;
const SUN = new THREE.Vector3(-.78, -.55, -.3).normalize(); // direction sunlight travels
const SIDES = [-1, 1];
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), V2 = (x: number, y: number) => new THREE.Vector2(x, y);
const B = (w: number, h: number, d: number, x = 0, y = 0, z = 0) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
const std = (color: THREE.ColorRepresentation, roughness = .8, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...o });
const zcOf = (k: number) => HZ - (k + .5) * BAY, ziOf = (i: number) => HZ - i * BAY;

type Tier = 'mea' | 'est' | 'con';

function inst(geo: THREE.BufferGeometry, mat: THREE.Material, xs: number[][]) {
  const m = new THREE.InstancedMesh(geo, mat, xs.length), o = new THREE.Object3D();
  xs.forEach(([x, y, z, ry = 0], i) => { o.position.set(x, y, z); o.rotation.set(0, ry, 0); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
  m.computeBoundingSphere();
  return m;
}

export type Hall = ReturnType<typeof buildHall>;

export function buildHall(R: THREE.WebGLRenderer) {
  const R1 = rng(1712), dpr = R.getPixelRatio();
  const scene = new THREE.Scene(), world = new THREE.Group(), FOG = new THREE.Color('#120d09');
  const fog = new THREE.FogExp2(FOG, .013);
  scene.background = FOG; scene.fog = fog; scene.add(world);
  const upper = new THREE.Group(), vault = new THREE.Group();
  upper.position.y = 5.2; vault.position.y = SPR; world.add(upper, vault);
  const put = <T extends THREE.Object3D>(o: T, tier: Tier, parent: THREE.Object3D = world, cast = true) => { o.userData.tier = tier; o.castShadow = cast; o.receiveShadow = true; parent.add(o); return o; };
  const oak = std('#5a3a22', .62), dark = std('#3a2414', .7);

  // floor: oak boards running the length of the room
  const pt = planks(); pt.repeat.set(2 * HW / 2.4, 2 * HZ / 2.4);
  put(new THREE.Mesh(new THREE.PlaneGeometry(2 * HW, 2 * HZ).rotateX(-PI / 2), std('#ffffff', .42, { map: pt })), 'mea', world, false);

  // side walls: 20 bays, a tall lower window and a shorter gallery window in each
  const wg = [];
  for (const sd of SIDES) for (let k = 0; k < NB; k++) {
    const z = zcOf(k), x = sd * 6.4, pl = .8425, pu = .9425;
    for (const e of SIDES) wg.push(B(.6, 5.2, pl, x, 2.6, z + e * (.75 + pl / 2)), B(.6, 3.8, pu, x, 7.1, z + e * (.65 + pu / 2)));
    wg.push(B(.6, 1.2, 1.5, x, .6, z), B(.6, .8, 1.5, x, 4.8, z), B(.6, .6, 1.3, x, 5.5, z), B(.6, .6, 1.3, x, 8.7, z));
  }
  put(new THREE.Mesh(mergeGeometries(wg), std('#b8a88e', .9)), 'mea');

  // end walls follow the vault profile; the far one has a tall window
  const arch = () => { const s = new THREE.Shape(); s.moveTo(-HW, 0); s.lineTo(HW, 0); s.lineTo(HW, SPR); s.absellipse(0, SPR, HW, RISE, 0, PI, false); s.lineTo(-HW, 0); return s; };
  const farS = arch(), hole = new THREE.Path();
  hole.moveTo(-1.6, 3); hole.lineTo(1.6, 3); hole.lineTo(1.6, 11); hole.lineTo(-1.6, 11); hole.lineTo(-1.6, 3); farS.holes.push(hole);
  const ex = (s: THREE.Shape) => new THREE.ExtrudeGeometry(s, { depth: .6, bevelEnabled: false, curveSegments: 40 });
  put(new THREE.Mesh(mergeGeometries([ex(arch()).translate(0, 0, HZ), ex(farS).translate(0, 0, -HZ - .6)]), std('#a89a82', .9)), 'mea');

  // glazing: warm on the sun side, cool on the shade side
  const mt = mullions();
  const pane = (w: number, h: number, sd: number, y: number, z: number) => new THREE.PlaneGeometry(w, h).rotateY(-sd * PI / 2).translate(sd * 6.25, y, z);
  const glow = (hex: string, k: number) => new THREE.MeshBasicMaterial({ map: mt, color: new THREE.Color(hex).multiplyScalar(k), fog: false });
  for (const sd of SIDES) {
    const g = []; for (let k = 0; k < NB; k++) g.push(pane(1.5, 3.2, sd, 2.8, zcOf(k)), pane(1.3, 2.6, sd, 7.1, zcOf(k)));
    put(new THREE.Mesh(mergeGeometries(g), sd > 0 ? glow('#ffd9a8', 4.2) : glow('#cfe0ff', 1.7)), 'est', world, false);
  }
  put(new THREE.Mesh(new THREE.PlaneGeometry(3.2, 8).translate(0, 7, -HZ - .3), glow('#cfe0ff', 2.4)), 'est', world, false);

  // 1860 barrel vault (Deane & Woodward), elliptical, timber
  const vp = [], vn = [], vu = [], vi = [], NX = 48, NZ = 40;
  for (let j = 0; j <= NZ; j++) for (let i = 0; i < NX; i++) {
    const t = PI * i / (NX - 1), c = Math.cos(t), s = Math.sin(t), n = V3(-c / HW, -s / RISE, 0).normalize();
    vp.push(HW * c, RISE * s, -HZ + 2 * HZ * j / NZ); vn.push(n.x, n.y, 0); vu.push(i / (NX - 1), j / NZ * 6);
  }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX - 1; i++) { const a = j * NX + i, b = a + 1, c = a + NX, d = c + 1; vi.push(a, c, b, b, c, d); }
  const vg = new THREE.BufferGeometry();
  vg.setAttribute('position', new THREE.Float32BufferAttribute(vp, 3));
  vg.setAttribute('normal', new THREE.Float32BufferAttribute(vn, 3));
  vg.setAttribute('uv', new THREE.Float32BufferAttribute(vu, 2));
  vg.setIndex(vi);
  put(new THREE.Mesh(vg, std('#6b4a2e', .75, { side: THREE.DoubleSide })), 'mea', vault);
  const rp = []; for (let i = 0; i <= 32; i++) { const t = PI * i / 32; rp.push(V3((HW - .08) * Math.cos(t), (RISE - .08) * Math.sin(t), 0)); }
  put(inst(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rp), 64, .12, 6), dark, Array.from({ length: NB + 1 }, (_, k) => [0, 0, ziOf(k)])), 'est', vault);
  const lg = [36, 72, 108, 144].map(d => { const t = d * PI / 180; return new THREE.CylinderGeometry(.07, .07, 2 * HZ, 6).rotateX(PI / 2).translate((HW - .1) * Math.cos(t), (RISE - .1) * Math.sin(t), 0); });
  put(new THREE.Mesh(mergeGeometries(lg), dark), 'est', vault);
  put(new THREE.Mesh(mergeGeometries(SIDES.map(sd => B(.5, .45, 2 * HZ, sd * 5.85, 8.825))), dark), 'est');

  // bookcase ends (the alcove "fins") with pilaster and capital on the aisle side
  const finL = mergeGeometries([B(3, 5.2, .5), B(.14, 5.2, .62, -1.5), B(.22, .2, .7, -1.5, 2.5)]);
  const finU = mergeGeometries([B(2.2, 3.35, .5), B(.12, 3.35, .58, -1.1)]);
  const fins = (x: number, y: number) => { const a: number[][] = []; for (const sd of SIDES) for (let i = 1; i < NB; i++) a.push([sd * x, y, ziOf(i), sd > 0 ? 0 : PI]); return a; };
  put(inst(finL, oak, fins(4.6, 2.6)), 'est');
  put(inst(finU, oak, fins(5.0, 1.725)), 'est', upper);

  // books: both faces of every alcove, 3 bindings variants, shelves locked to a 3/7 m pitch
  const bt = [books(17), books(29), books(43)];
  const bm = bt.map(t => std('#ffffff', .78, { map: t, bumpMap: t, bumpScale: 1.5 }));
  const bg: THREE.BufferGeometry[][] = [[], [], [], [], [], []], lips: number[][][] = [[], []];
  for (const sd of SIDES) for (let b = 0; b < NB; b++) {
    const zf = ziOf(b), zb = zf - BAY;
    for (const [z, ry, dz] of [[(b ? zf - .25 : HZ) - .006, PI, -1], [(b < NB - 1 ? zb + .25 : -HZ) + .006, 0, 1]]) {
      for (const [lv, w, h, x, y0, n] of [[0, 3, 5.16, 4.6, .04, 13], [1, 2.2, 3.35, 5.0, .05, 8]]) {
        const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv, u0 = R1(), v0 = Math.floor(R1() * 7) / 7;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * w / 3, v0 + uv.getY(i) * h / 3);
        g.rotateY(ry).translate(sd * x, y0 + h / 2, z);
        bg[Math.floor(R1() * 3) * 2 + lv].push(g);
        for (let m = 0; m < n; m++) lips[lv].push([sd * x, y0 + m * 3 / 7 + .012, z + dz * .025]);
      }
    }
  }
  bg.forEach((a, i) => put(new THREE.Mesh(mergeGeometries(a), bm[i >> 1]), 'con', i & 1 ? upper : world, false));
  put(inst(B(3, .035, .05), dark, lips[0]), 'est', world, false);
  put(inst(B(2.2, .035, .05), dark, lips[1]), 'est', upper, false);

  // gallery: walkway, two rails, turned balusters every 15 cm
  const gal = []; for (const sd of SIDES) gal.push(B(3.3, .3, 2 * HZ, sd * 4.45, 5.1), B(.09, .07, 2 * HZ, sd * 2.85, 5.3), B(.09, .07, 2 * HZ, sd * 2.85, 6.2));
  put(new THREE.Mesh(mergeGeometries(gal), oak), 'est');
  const bal = new THREE.LatheGeometry([[.035, 0], [.035, .05], [.025, .08], [.045, .25], [.05, .35], [.03, .5], [.022, .62], [.03, .75], [.025, .85], [.035, .9]].map(([a, b]) => V2(a, b)), 8);
  const bx = []; for (const sd of SIDES) for (let z = -HZ + .1; z < HZ - .05; z += .15) bx.push([sd * 2.85, 5.25, z]);
  put(inst(bal, oak, bx), 'est', world, false);

  // marble busts on pedestals at each bookcase end
  const bust = mergeGeometries([
    B(.45, 1.15, .45, 0, .575),
    new THREE.LatheGeometry([V2(.26, 0), V2(.26, .04), V2(.19, .07), V2(.15, .12)], 16).translate(0, 1.15, 0),
    new THREE.SphereGeometry(1, 24, 16).scale(.26, .18, .15).translate(0, 1.42, 0),
    new THREE.CylinderGeometry(.055, .065, .16, 12).translate(0, 1.6, 0),
    new THREE.SphereGeometry(1, 24, 16).scale(.1, .13, .115).translate(0, 1.78, .015)]);
  const bp = []; for (const sd of SIDES) for (let i = 1; i < NB; i++) bp.push([sd * 2.75, 0, ziOf(i), -sd * PI / 2]);
  put(inst(bust, std('#d9d2c3', .35), bp), 'con');

  // the Trinity College harp: willow, 29 strings, under glass at the far end
  const hg = new THREE.Group(); hg.position.set(0, .9, -29.5); world.add(hg);
  const A = V3(-.25, .05, 0), Bh = V3(0, .66, 0), C = V3(.32, .58, 0), neck = new THREE.QuadraticBezierCurve3(Bh, V3(.16, .72, 0), C);
  put(new THREE.Mesh(mergeGeometries([
    new THREE.TubeGeometry(new THREE.LineCurve3(A, Bh), 8, .05, 10),
    new THREE.TubeGeometry(neck, 24, .03, 8),
    new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(C, V3(.30, .2, 0), V3(-.2, .02, 0)), 24, .032, 8)]), std('#6b4426', .5)), 'con', hg);
  const sv = []; for (let i = 0; i < 29; i++) { const u = i / 28, a = A.clone().lerp(Bh, .1 + .8 * u), b = neck.getPoint(.95 - .85 * u); sv.push(a.x, a.y, a.z, b.x, b.y, b.z); }
  const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3));
  hg.add(new THREE.LineSegments(sgeo, new THREE.LineBasicMaterial({ color: new THREE.Color('#e0b870').multiplyScalar(1.6) })));
  put(new THREE.Mesh(B(1.2, .9, .8, 0, .45, -29.5), std('#2a2420', .6)), 'mea');
  const caseG = B(1.1, 1.3, .7, 0, 1.55, -29.5);
  world.add(new THREE.Mesh(caseG, std('#cfe0ff', .05, { transparent: true, opacity: .12, depthWrite: false })));
  world.add(new THREE.LineSegments(new THREE.EdgesGeometry(caseG), new THREE.LineBasicMaterial({ color: '#c9a35a' })));
  const spot = new THREE.SpotLight('#ffd7a0', 60, 14, .32, .7, 2);
  spot.position.set(0, 6.5, -26.5); spot.target.position.set(0, 1.1, -29.5); world.add(spot, spot.target);

  // title card in the air, ghost flat ceiling for the pre-1860 scrub
  const title = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 1.55), new THREE.MeshBasicMaterial({ map: hallTitle(), color: new THREE.Color(2, 1.45, .75), transparent: true, depthWrite: false, fog: false }));
  title.position.set(0, 4.1, 18.5); world.add(title);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(2 * HW, 2 * HZ).rotateX(PI / 2).translate(0, SPR, 0), std('#d8cfbf', .9, { transparent: true, opacity: 0 }));
  ceil.visible = false; world.add(ceil);

  // light: one low sun through the south windows, sky fill, baked shadows
  const hemi = new THREE.HemisphereLight('#9fb4d6', '#3a2414', .35);
  const sun = new THREE.DirectionalLight('#ffcf9a', 3.6);
  sun.target.position.set(0, 6, 0); sun.position.copy(sun.target.position).addScaledVector(SUN, -45);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -34, right: 34, top: 16, bottom: -16, near: 1, far: 95 });
  sun.shadow.mapSize.setScalar(MOBILE ? 2048 : 4096); sun.shadow.bias = -.0005; sun.shadow.normalBias = .03;
  world.add(hemi, sun, sun.target);

  const win = []; for (let k = 0; k < NB; k++) win.push({ x: 6.1, y: 7.1, z: zcOf(k), w: 1.3, h: 2.6, L: 12, i: 1 }, { x: 6.1, y: 2.8, z: zcOf(k), w: 1.5, h: 3.2, L: 8, i: .5 });
  const sh = shafts(win, SUN), du = dust(win, SUN, 1.4 * dpr);
  world.add(sh, du);
  const evm = evidenceMats(SUN, dpr), dims = dimLines(HZ, HW, HH);
  world.add(dims.line);

  // bake a room-lit environment from mid-height: shift the world so the cube camera sits at y 4
  const hide = [sh, du, title, dims.line], vis = hide.map(o => o.visible);
  hide.forEach(o => { o.visible = false; }); scene.fog = null; world.position.y = -4; world.updateMatrixWorld(true);
  R.shadowMap.needsUpdate = true;
  const pmrem = new THREE.PMREMGenerator(R);
  scene.environment = pmrem.fromScene(scene, .04).texture; pmrem.dispose();
  world.position.y = 0; world.updateMatrixWorld(true); scene.fog = fog; hide.forEach((o, i) => { o.visible = vis[i]; });
  scene.environmentIntensity = .55; R.shadowMap.needsUpdate = true;

  // camera: six held shots joined by a dolly; key i sits at t = i/5
  const camera = new THREE.PerspectiveCamera(50, 1, .05, 140);
  const KP = [[0, 1.75, 30.5], [1.2, 1.7, 14.3], [1.4, 2.4, 8], [-2.2, 6.6, -6], [1.8, 2.0, -14], [0, 1.7, -24]].map(([x, y, z]) => V3(x, y, z));
  const KL = [[0, 3.2, 0], [-6.1, 2.5, 14.3], [-.5, 8.5, -24], [-3.6, 6.0, -26], [-3.1, 2.1, -28], [0, 2.2, -31.8]].map(([x, y, z]) => V3(x, y, z));
  const cp = new THREE.CatmullRomCurve3(KP, false, 'centripetal'), cl = new THREE.CatmullRomCurve3(KL, false, 'centripetal');
  const cur = { p: KP[0].clone(), l: KL[0].clone() }, tp = V3(), tl = V3();
  let ev = false, lastS = -1;

  const H = { scene, camera, dimPts: dims.pts, year: 1860,
  resize: (w: number, h: number) => {
    const d = R.getPixelRatio();
    camera.aspect = w / h; camera.fov = fitFov(50, w / h, 1.3); camera.updateProjectionMatrix();
    du.material.uniforms.uPx.value = 1.4 * d; evm.con.uniforms.uS.value = 8 * d;
  },
  update: (t: number, time: number, dt: number, px = 0, py = 0, snap = false) => {
    const s5 = 5 * t, f = clamp((s5 - .6 * Math.sin(2 * PI * s5) / (2 * PI)) / 5); // dwell on each key
    cp.getPoint(f, tp); cl.getPoint(f, tl);
    const still = RM.matches;
    if (!still) { tp.x += Math.sin(time * .31) * .03 + px * .1; tp.y += Math.sin(time * .43) * .02 - py * .05; }
    const k = snap || still ? 1 : 1 - Math.exp(-dt * 3.2);
    cur.p.lerp(tp, k); cur.l.lerp(tl, k);
    camera.position.copy(cur.p); camera.lookAt(cur.l);
    const s = smooth(.30, .36, t) * (1 - smooth(.44, .50, t)); // 1860 back to 1732
    if (Math.abs(s - lastS) > 1e-4) {
      lastS = s; upper.scale.y = Math.max(1e-3, 1 - s); upper.visible = s < .99;
      vault.scale.y = lerp(1, .02, s); ceil.material.opacity = s; ceil.visible = s > .01;
      R.shadowMap.needsUpdate = true; H.year = Math.round(lerp(1860, 1732, s));
    }
    const to = 1 - smooth(0, .07, t);
    title.material.opacity = to; title.visible = !ev && to > .01;
    sh.material.uniforms.uT.value = du.material.uniforms.uT.value = time;
  },
  setEvidence: (on: boolean) => {
    ev = on;
    world.traverse(o => {
      const t = o.userData.tier as Tier | undefined, m = o as THREE.Mesh; if (!t) return;
      if (on) { o.userData.orig ||= m.material; m.material = evm[t]; } else if (o.userData.orig) m.material = o.userData.orig;
    });
    sh.visible = du.visible = !on; title.visible = !on && title.material.opacity > .01; dims.line.visible = on;
    fog.density = on ? .005 : .013; hemi.intensity = on ? 1.1 : .35; scene.environmentIntensity = on ? .9 : .55;
  } };
  return H;
}
