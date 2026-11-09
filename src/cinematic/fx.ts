import * as THREE from 'three';
import { rng, MOBILE, TAIL } from './util';

const INST = `vec4 p=vec4(position,1.); vec3 n=normal;
#ifdef USE_INSTANCING
p=instanceMatrix*p; n=mat3(instanceMatrix)*n;
#endif
vec4 w=modelMatrix*p; vW=w.xyz; vN=normalize(mat3(modelMatrix)*n); gl_Position=projectionMatrix*viewMatrix*w;`;

// Sun shafts: one open prism per sun-side window, swept along the light direction.
// win: [{x,y,z,w,h,L,i}] with x on the wall's inner face, w along z, h along y.
export type Win = { x: number; y: number; z: number; w: number; h: number; L: number; i: number }
export function shafts(win: Win[], dir: THREE.Vector3) {
  const pos: number[] = [], nor: number[] = [], at: number[] = [], ai: number[] = [], au: number[] = [];
  const D = dir.clone().normalize();
  for (const s of win) {
    const c = [[0, -1, -1], [0, 1, -1], [0, 1, 1], [0, -1, 1]].map(([, a, b]) =>
      new THREE.Vector3(s.x, s.y + a * s.h / 2, s.z + b * s.w / 2));
    const e = c.map(p => p.clone().addScaledVector(D, s.L));
    for (let k = 0; k < 4; k++) {
      const a = c[k], b = c[(k + 1) % 4], a2 = e[k], b2 = e[(k + 1) % 4];
      const n = new THREE.Vector3().subVectors(b, a).cross(D).normalize();
      for (const [p, t, u] of [[a, 0, 0], [b, 0, 1], [b2, 1, 1], [a, 0, 0], [b2, 1, 1], [a2, 1, 0]] as [THREE.Vector3, number, number][]) {
        pos.push(p.x, p.y, p.z); nor.push(n.x, n.y, n.z); at.push(t); ai.push(s.i); au.push(u);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('aT', new THREE.Float32BufferAttribute(at, 1));
  g.setAttribute('aI', new THREE.Float32BufferAttribute(ai, 1));
  g.setAttribute('aU', new THREE.Float32BufferAttribute(au, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uI: { value: 1 }, uC: { value: new THREE.Color(1, .78, .52).multiplyScalar(.32) } },
    vertexShader: `attribute float aT; attribute float aI; attribute float aU; varying float vT; varying float vI; varying float vU; varying vec3 vN; varying vec3 vW;
      void main(){ vT=aT; vI=aI; vU=aU; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform float uT; uniform float uI; uniform vec3 uC; varying float vT; varying float vI; varying float vU; varying vec3 vN; varying vec3 vW;
      void main(){
        vec3 v=normalize(cameraPosition-vW);
        float t=clamp(vT,0.,1.), u=clamp(vU,0.,1.); // MSAA can extrapolate varyings past the triangle; pow() of a negative is NaN
        float e=sin(3.14159*u); e*=e; // feather each face across its width so beams read as light, not panes
        float near=smoothstep(.8,6.,length(cameraPosition-vW)); // fade faces the camera is passing through
        float a=pow(abs(dot(normalize(vN),v)),1.5)*pow(1.-t,1.6)*smoothstep(0.,.06,t)*e*near*uI*vI*(.8+.2*sin(uT*.5+vW.z*.6+vW.y*.4));
        gl_FragColor=vec4(uC,a);
        ${TAIL}}`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.frustumCulled = false;
  return mesh;
}

// Motes seeded inside the shafts, so only lit air sparkles.
export function dust(win: Win[], dir: THREE.Vector3, px: number) {
  const R = rng(9), N = MOBILE ? 700 : 1500, D = dir.clone().normalize();
  const pos = new Float32Array(N * 3), as = new Float32Array(N), at = new Float32Array(N), ph = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const s = win[Math.floor(R() * win.length)], t = Math.pow(R(), 1.4);
    const p = new THREE.Vector3(s.x, s.y + (R() - .5) * s.h, s.z + (R() - .5) * s.w).addScaledVector(D, t * s.L);
    pos.set([p.x, p.y, p.z], i * 3); as[i] = R(); at[i] = t; ph[i] = R() * 6.283;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aS', new THREE.BufferAttribute(as, 1));
  g.setAttribute('aT', new THREE.BufferAttribute(at, 1));
  g.setAttribute('aP', new THREE.BufferAttribute(ph, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uPx: { value: px }, uC: { value: new THREE.Color(1, .86, .64).multiplyScalar(2.2) } },
    vertexShader: `attribute float aS; attribute float aT; attribute float aP; uniform float uT; uniform float uPx; varying float vA;
      void main(){
        vec3 p=position+vec3(sin(uT*.23+aP)*.12, cos(uT*.17+aP*1.3)*.08, sin(uT*.19+aP*.7)*.12);
        vec4 mv=modelViewMatrix*vec4(p,1.);
        gl_PointSize=clamp(uPx*(1.2+aS*1.8)*(6./-mv.z),1.,6.);
        vA=(1.-aT)*(.55+.45*sin(uT*(1.+aS*2.)+aP*5.));
        gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uC; varying float vA;
      void main(){ float d=length(gl_PointCoord-.5)*2.; float a=exp(-d*d*4.)*vA*.7; if(a<.004) discard; gl_FragColor=vec4(uC,a);
        ${TAIL}}`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(g, m);
  pts.frustumCulled = false;
  return pts;
}

// Evidence materials. mea: plain clay. est: ghost outline. con: pencil hatch on sienna paper.
export function evidenceMats(sunDir: THREE.Vector3, dpr: number) {
  const mea = new THREE.MeshStandardMaterial({ color: '#e8e2d6', roughness: .95, metalness: 0 });
  const est = new THREE.ShaderMaterial({
    uniforms: { uC: { value: new THREE.Color('#8fb8ff') } },
    vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ ${INST} }`,
    fragmentShader: `uniform vec3 uC; varying vec3 vN; varying vec3 vW;
      void main(){ vec3 v=normalize(cameraPosition-vW); float a=.06+pow(max(0.,1.-abs(dot(normalize(vN),v))),2.)*.55; gl_FragColor=vec4(uC,a);
        ${TAIL}}`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  const con = new THREE.ShaderMaterial({
    uniforms: { uL: { value: sunDir.clone().negate().normalize() }, uS: { value: 8 * dpr },
      uPaper: { value: new THREE.Color('#a8673e') }, uInk: { value: new THREE.Color('#2a1a10') } },
    vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ ${INST} }`,
    fragmentShader: `uniform vec3 uL; uniform float uS; uniform vec3 uPaper; uniform vec3 uInk; varying vec3 vN; varying vec3 vW;
      void main(){
        vec3 n=normalize(vN), v=normalize(cameraPosition-vW);
        if(dot(n,v)<0.) n=-n;
        float dark=1.-(dot(n,uL)*.5+.5);
        vec2 f=gl_FragCoord.xy;
        float d1=abs(fract((f.x+f.y)/uS)-.5)*uS, d2=abs(fract((f.x-f.y)/uS)-.5)*uS;
        float ink=max((1.-smoothstep(.4,1.4,d1))*step(.25,dark),(1.-smoothstep(.4,1.4,d2))*step(.55,dark));
        float edge=smoothstep(.55,.95,1.-abs(dot(n,v)));
        gl_FragColor=vec4(mix(uPaper,uInk,max(ink*.85,edge)),1.);
        ${TAIL}}`,
    side: THREE.DoubleSide,
  });
  return { mea, est, con };
}

// Gold measuring lines, drawn over everything in evidence mode.
export function dimLines(HZ: number, HW: number, HH: number) {
  const v: number[] = [], seg = (a: number[], b: number[]) => v.push(...a, ...b);
  const y = .03, T = .3;
  seg([0, y, HZ], [0, y, -HZ]); seg([-T, y, HZ], [T, y, HZ]); seg([-T, y, -HZ], [T, y, -HZ]);
  seg([-HW, y, -6], [HW, y, -6]); seg([-HW, y, -6 - T], [-HW, y, -6 + T]); seg([HW, y, -6 - T], [HW, y, -6 + T]);
  seg([0, 0, -20], [0, HH, -20]); seg([-T, HH, -20], [T, HH, -20]); seg([-T, 0, -20], [T, 0, -20]);
  for (let m = 1; m < HH; m++) seg([-.08, m, -20], [.08, m, -20]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  const line = new THREE.LineSegments(g, new THREE.LineBasicMaterial({
    color: new THREE.Color('#d8a65a').multiplyScalar(2), transparent: true, opacity: .9, depthTest: false, depthWrite: false, fog: false,
  }));
  line.renderOrder = 10; line.visible = false;
  const pts = [new THREE.Vector3(0, y, 12), new THREE.Vector3(3, y, -6), new THREE.Vector3(0, HH * .62, -20)];
  return { line, pts };
}
