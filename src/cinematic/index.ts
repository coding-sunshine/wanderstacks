import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildAtlas, type Atlas, type Lib } from './atlas';
import { buildHall, type Hall } from './hall';
import { book, buildScale } from './extras';
import { clamp, smooth, MOBILE, RM } from './util';
import { go } from '../app';
import type { Mount } from '../types';
import './cinematic.css';

const HTML = `
<canvas id="gl" role="img" aria-label="A night-side Earth with 52 libraries across 2,700 years lit in gold, then a walk down the Long Room at Trinity College Dublin"></canvas>
<div class="lb t" aria-hidden="true"></div><div class="lb b" aria-hidden="true"></div>
<div class="ld" aria-hidden="true">WORLDLIBS · REEL ONE</div>
<header class="top">
  <span class="wm">WorldLibs</span>
  <span class="ch" id="chap">01 · Atlas</span>
  <span class="co" id="coord">668 BCE · 2026</span>
  <i class="cbar" id="bar"></i>
</header>
<div class="cine-main">
<section id="film" aria-label="Film">
  <div class="stage">
    <div class="scrim"></div>
    <div class="hero" id="hero">
      <div class="ov">WORLDLIBS · REEL ONE</div>
      <h1 class="sr">Libraries of the world</h1>
      <p class="sub">of the world, measured where we can and marked where we guess.</p>
      <div class="badge" aria-hidden="true"><svg viewBox="0 0 112 112"><defs><path id="cp" d="M56 56m-42 0a42 42 0 1 1 84 0a42 42 0 1 1-84 0"/></defs><text><textPath href="#cp" textLength="262" lengthAdjust="spacing">SCROLL TO ENTER · SCROLL TO ENTER · </textPath></text></svg></div>
    </div>
    <div class="cap" data-act="a" data-in=".22" data-out=".52">
      <p class="kicker">The atlas · 52 libraries</p>
      <h2 class="big"><span class="ln"><span>Fifty-two libraries.</span></span><span class="ln"><span style="--d:.08s">Nearly 2,700 years.</span></span></h2>
      <p class="p"><span class="ln"><span style="--d:.16s">From Ashurbanipal's tablets at Nineveh, 668 BCE, to Tianjin Binhai, 2017.</span></span></p>
      <div class="chips" id="achips"></div>
      <button class="replay" id="xopen" type="button">Explore all 52 by year</button>
    </div>
    <div class="cap r" data-act="a" data-in=".6" data-out=".8">
      <div class="plaque">
        <p class="kicker">53.34° N, 6.25° W</p>
        <p class="p" style="margin:0">Trinity College Dublin</p>
        <h2 class="big"><span class="ln"><span>The Long Room</span></span></h2>
        <p class="kicker">1712–1732 · Thomas Burgh</p>
        <div class="chips"><span class="cchip pri">Primary · tcd.ie</span></div>
      </div>
    </div>
    <div class="cap" data-act="h" data-in="0" data-out=".07">
      <p class="kicker">Trinity College Dublin · Reel two</p>
      <p class="p"><span class="ln"><span>63.7 m long, 12.2 m wide, 14.2 m high.</span></span></p>
      <div class="chips"><span class="cchip mea">Measured · tcd.ie</span></div>
    </div>
    <div class="cap" data-act="h" data-in=".13" data-out=".27">
      <h2 class="big"><span class="ln"><span>Forty alcoves,</span></span><span class="ln"><span style="--d:.08s">about 2,000 books each.</span></span></h2>
      <p class="p">Some 200,000 of the library's oldest books are kept here. The foundation stone was laid in May 1712. Work finished in 1732, and readers were using the room by the end of 1733.</p>
      <div class="chips"><span class="cchip pri">Primary · tcd.ie</span><span class="cchip con">Conjecture · spines are painted stand-ins</span></div>
    </div>
    <div class="cap" data-act="h" data-in=".3" data-out=".5">
      <div class="yr" id="year" aria-live="off">1860<small>AD</small></div>
      <div class="row"><span class="cchip pri">Primary</span><p class="p" style="margin:0">Before 1860 this room had a flat plaster ceiling.</p></div>
      <div class="row"><span class="cchip sec">Secondary</span><p class="p" style="margin:0">The roof was raised that year for the barrel vault and the upper bookcases.</p></div>
      <div class="row"><span class="cchip con">Conjecture</span><p class="p" style="margin:0">We have no measured drawing of Burgh's 1732 room, so the flat ceiling you see is our guess at its height.</p></div>
    </div>
    <div class="cap" data-act="h" data-in=".53" data-out=".67">
      <h2 class="big"><span class="ln"><span>How much of this is real?</span></span></h2>
      <p class="kicker">Press <kbd>E</kbd> or tap Evidence</p>
      <p class="p">Clay surfaces are measured. Blue glass is estimated from photographs. Hatched paper is our guess.</p>
    </div>
    <div class="cap" data-act="h" data-in=".73" data-out=".87">
      <h2 class="big"><span class="ln"><span>Four new faces in marble.</span></span></h2>
      <p class="p">Rosalind Franklin, Augusta Gregory, Ada Lovelace and Mary Wollstonecraft joined the busts in 2023, the first new ones in over a century. The busts you see here are generic stand-ins.</p>
      <div class="chips"><span class="cchip wik">Wikipedia</span><span class="cchip con">Conjecture · busts</span></div>
    </div>
    <div class="cap" data-act="h" data-in=".93" data-out="1.01">
      <h2 class="big"><span class="ln"><span>At the far end, a harp.</span></span></h2>
      <p class="p">The Brian Boru harp is the oldest surviving Gaelic harp in Ireland, medieval, probably 15th century. The room also keeps one of the few surviving copies of the 1916 Proclamation.</p>
      <p class="p">Conservation works run to 2030. The Book of Kells is due to move to the Printing House in late 2027.</p>
      <div class="chips"><span class="cchip pri">Primary · tcd.ie</span><span class="cchip sec">Secondary · University Times, Mar 2026</span></div>
    </div>
    <div class="dim" aria-hidden="true">63.7 m</div><div class="dim" aria-hidden="true">12.2 m</div><div class="dim" aria-hidden="true">14.2 m</div>
  </div>
</section>
<section id="book" aria-label="Gulliver's Travels, 1726">
  <div class="bstage">
    <div class="tome" id="bk">
      <div class="pg base"><div class="sheet ch1">
        <h3>CHAPTER I.</h3>
        <p><span class="drop">M</span>Y father had a small estate in Nottinghamshire: I was the third of five sons. He sent me to Emanuel College in Cambridge at fourteen years old, where I resided three years, and applied myself close to my studies; but the charge of maintaining me, although I had a very scanty allowance, being too great for a narrow fortune, I was bound apprentice to Mr. James Bates, an eminent surgeon in London, with whom I continued four years.</p>
      </div></div>
      <div class="pg leaf">
        <div class="sheet tp">
          <span class="l">TRAVELS</span><span>INTO SEVERAL</span><span class="it">Remote Nations</span><span>OF THE</span><span class="xl">WORLD.</span>
          <hr><span>In FOUR PARTS.</span><hr>
          <span>By LEMUEL GULLIVER,</span><span class="sm">First a Surgeon, and then a CAPTAIN of several SHIPS.</span>
          <hr><span>VOL. I.</span><hr>
          <span>LONDON:</span><span class="sm">Printed for BENJ. MOTTE, at the Middle Temple-Gate in Fleet-street.</span><span>MDCCXXVI.</span>
        </div>
        <div class="bk sheet pt"><span>PART I.</span><hr style="width:30%;margin:.4em auto;border:0;border-top:1px solid var(--ink)"><span>A VOYAGE TO</span><span class="xl">LILLIPUT.</span></div>
      </div>
      <div class="pg cover">
        <div class="calf" aria-hidden="true">
          <svg preserveAspectRatio="none" viewBox="0 0 100 156"><filter id="cn"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="3"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .05  0 0 0 0 .02  0 0 0 .55 0"/></filter><rect width="100" height="156" filter="url(#cn)"/></svg>
          <i class="fil"></i><i class="loz"></i>
        </div>
        <div class="bk marb" aria-hidden="true">
          <svg preserveAspectRatio="none" viewBox="0 0 200 312"><filter id="mb" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".011 .045" numOctaves="4" seed="11"/><feComponentTransfer><feFuncR type="discrete" tableValues=".52 .14 .80 .22 .64 .90 .30"/><feFuncG type="discrete" tableValues=".18 .22 .58 .30 .20 .82 .36"/><feFuncB type="discrete" tableValues=".14 .44 .30 .52 .14 .64 .50"/><feFuncA type="discrete" tableValues="1"/></feComponentTransfer></filter><rect width="200" height="312" filter="url(#mb)"/></svg>
        </div>
      </div>
    </div>
    <div class="bcap">
      <p class="kicker">Reel three · Trinity, Dublin</p>
      <p class="p"><i>Gulliver's Travels</i>, as Benjamin Motte printed its title page in 1726. Swift took his BA at Trinity in 1686; forty years later he published this.</p>
      <p class="kicker" style="text-transform:none;letter-spacing:.06em">Reset from the 1726 Motte edition. Text from Standard Ebooks (public domain).</p>
      <div class="chips"><span class="cchip con">Conjecture · binding</span></div>
    </div>
  </div>
</section>
<section id="scale" aria-labelledby="sh">
  <div class="in">
    <p class="kicker">Reel four · 1 m = 1 m</p>
    <h2 class="big" id="sh">To scale.</h2>
    <p class="p">Every outline uses the same metre. Solid lines are measured. Dashed lines are our estimate.</p>
  </div>
  <div class="wrap" tabindex="0" role="region" aria-label="Library sections drawn to scale, scrolls sideways on small screens"><svg id="scalesvg" role="img" aria-label="Long Room, Admont, Strahov Philosophical Hall, Library of Congress reading room and Library of Celsus drawn at one scale"></svg></div>
</section>
<footer id="colophon">
  <div class="in">
    <p class="kicker">Reel five · Credits</p>
    <h2 class="big">Measured where we can. Marked where we guess.</h2>
    <div class="credits">
      <div><h4>Data</h4><p>Dates, places and sizes come from the WorldLibs records, checked against Wikidata, Wikipedia and each library's own pages. Every figure carries the source tier shown beside it.</p></div>
      <div><h4>Stand-ins</h4><p>The books, busts, window glazing and harp are modelled by hand. Treat them as placeholders until scans or measured drawings exist.</p></div>
      <div><h4>Earth</h4><p>NASA Black Marble night lights, public domain.</p></div>
      <div><h4>Type</h4><p>Libre Caslon by Impallari Type, a revival of Caslon's 1720s and 1730s faces. IBM Plex Mono.</p></div>
      <div><h4>Text</h4><p>Gulliver's Travels via Standard Ebooks, public domain.</p></div>
    </div>
    <ul class="routes">
      <li><a href="/room/longroom">Long Room</a></li><li><a href="/byrne">Byrne</a></li><li><a href="/shelf">Shelf</a></li>
      <li><a href="/babel">Babel</a></li><li><a href="/atlas">Explore</a></li><li><kbd>⌘K</kbd> Search</li>
    </ul>
    <button class="replay" id="replay" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/></svg>Replay</button>
  </div>
</footer>
</div>
<section id="explore" hidden aria-label="Explore every library">
  <div class="xp">
    <div class="xh"><p class="kicker">Explore · 52 libraries</p><button id="xclose" type="button">Back to film</button></div>
    <p class="yr" id="xyr">2026<small>CE</small></p>
    <p class="kicker" id="xera">Modern</p>
    <p class="p" id="xcount" aria-live="polite"></p>
    <div id="xcard" class="plaque" aria-live="polite"></div>
    <div id="xlist" aria-label="Libraries founded by this year"></div>
  </div>
  <div class="xtime">
    <input type="range" id="xrange" min="-668" max="2026" step="1" value="2026" aria-label="Year">
    <div class="xticks" aria-hidden="true"><span style="left:0">668 BCE</span><span class="w" style="left:24.8%">1 CE</span><span style="left:43.4%">500</span><span class="w" style="left:61.9%">1000</span><span style="left:80.5%">1500</span><span style="left:100%">2026</span></div>
  </div>
</section>
<nav class="pill" aria-label="Chapters">
  <button id="prev" type="button" aria-label="Previous chapter"><svg viewBox="0 0 24 24"><path d="M14 6l-6 6 6 6"/></svg></button>
  <span class="pl" aria-live="polite"><b id="pn">01</b><span id="pt">Atlas</span></span>
  <button id="next" type="button" aria-label="Next chapter"><svg viewBox="0 0 24 24"><path d="M10 6l6 6-6 6"/></svg></button>
  <i class="sep"></i>
  <button id="xb" type="button" aria-pressed="false" aria-label="Explore all libraries"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/></svg><span class="t">Explore</span></button>
  <button id="evb" type="button" aria-pressed="false" aria-label="Evidence mode" disabled><svg viewBox="0 0 24 24"><path d="M4 17L17 4l3 3L7 20z"/><path d="M8 13l2 2M11 10l2 2M14 7l2 2"/></svg><span class="t">Evidence</span></button>
  <button id="snd" type="button" aria-pressed="false" aria-label="Sound"><svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="w" d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg></button>
</nav>
<aside class="legend" aria-label="Evidence legend">
  <span><i class="sw-m"></i>Measured</span><span><i class="sw-e"></i>Estimated</span><span><i class="sw-c"></i>Conjecture</span>
</aside>`;

const CH = [['01', 'Atlas', '668 BCE · 2026'], ['02', 'The Long Room', '53.34° N 6.25° W'], ['03', 'Gulliver, 1726', 'Trinity · Dublin'], ['04', 'To scale', '1 m = 1 m'], ['05', 'Credits', 'WorldLibs']];
const ERAS: [number, string][] = [[-Infinity, 'Antiquity'], [500, 'Middle Ages'], [1500, 'Early modern'], [1800, 'Modern']];
const EV: Record<string, [string, string]> = { known: ['pri', 'Known'], probable: ['sec', 'Probable'], speculative: ['con', 'Speculative'] };
const KIND: Record<string, [string, string]> = { hall: ['Hall', 'Hall bay kit'], rotunda: ['Rotunda', 'Rotunda kit'], dome: ['Domed hall', 'Dome kit'], atrium: ['Atrium', 'Atrium kit'], site: ['Site', 'Ruin and site kit'] };
const LINK: Record<string, string> = { room: 'Enter the room', ledger: 'Read the ledger', stgall: 'Walk the plan', scan: 'Turn the pages', place: 'Read the record' };
// [exposure, bloom strength, radius, threshold]
const LOOK = { atlas: [1, .75, .55, .85], hall: [1.1, .55, .7, 1], hallEv: [1.1, .22, .7, 1] };
const NOW = 2026, Y0 = -668, A = .3;

const era = (y: number) => ERAS.filter(([a]) => y >= a).pop()![1];
const yfmt = (y: number) => y < 0 ? `${-y} BCE` : `${y}`;
const deg = (v: number, a: string, b: string) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? a : b}`;
const esc = (s: unknown) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const lostBy = (r: Lib, y: number) => r.lost === true || (typeof r.lost === 'number' && r.lost <= y);

export const mount: Mount = (el, params) => {
  const root = document.documentElement;
  root.dataset.home = '';
  el.innerHTML = HTML; el.dataset.view = 'home';
  const $ = <T extends Element = HTMLElement>(s: string) => el.querySelector(s) as T;
  const $$ = (s: string) => [...el.querySelectorAll<HTMLElement>(s)];
  const ac = new AbortController(), signal = ac.signal;
  let alive = true, raf = 0, rto = 0, revealT = 0;

  const cv = $<HTMLCanvasElement>('#gl'), film = $('#film'), bookEl = $('#book'), bk = $('#bk'), hero = $('#hero'), bar = $('#bar');
  const yearEl = $('#year'), evb = $<HTMLButtonElement>('#evb'), sndB = $('#snd'), xb = $('#xb');
  const xrange = $<HTMLInputElement>('#xrange'), xlist = $('#xlist'), xcard = $('#xcard');
  const caps = $$('.cap').map(e => ({ el: e, act: e.dataset.act, a: +e.dataset.in!, b: +e.dataset.out!, on: false }));
  const dimEls = $$('.dim');

  let vw = innerWidth, vh = innerHeight, filmTop = 0, filmLen = 1, bookTop = 0, bookLen = 1, docLen = 1, starts = [0, 0, 0, 0, 0];
  const topOf = (e: Element) => e.getBoundingClientRect().top + scrollY;
  function measure() {
    vw = innerWidth; vh = innerHeight;
    filmTop = topOf(film); filmLen = Math.max(1, film.offsetHeight - vh);
    bookTop = topOf(bookEl); bookLen = Math.max(1, bookEl.offsetHeight - vh);
    docLen = Math.max(1, root.scrollHeight - vh);
    starts = [0, filmTop + filmLen * (A + (1 - A) * .045), bookTop, topOf($('#scale')), Math.min(topOf($('#colophon')), docLen)];
  }

  let R: THREE.WebGLRenderer | null = null;
  try { R = new THREE.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: 'high-performance' }); } catch { R = null; }
  if (!R) root.classList.add('no-gl');
  const DPR = () => Math.min(devicePixelRatio || 1, MOBILE ? 1.25 : 1.5);
  const pp = R ? (() => {
    R.toneMapping = THREE.ACESFilmicToneMapping;
    R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.shadowMap.autoUpdate = false;
    const composer = new EffectComposer(R, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: MOBILE ? 2 : 4 }));
    const rp = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .75, .55, .85);
    const fin = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uT: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uCA: { value: .012 }, uVig: { value: .55 }, uGrain: { value: .045 }, uFade: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `uniform sampler2D tDiffuse; uniform float uT, uCA, uVig, uGrain, uFade; uniform vec2 uRes; varying vec2 vUv;
        float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
        void main(){
          vec2 c=vUv-.5; float r2=dot(c,c); vec2 o=c*r2*uCA;
          vec3 col=vec3(texture2D(tDiffuse,vUv+o).r, texture2D(tDiffuse,vUv).g, texture2D(tDiffuse,vUv-o).b);
          col=mix(col, smoothstep(0.,1.,col), .18);
          col*=mix(1., 1.-smoothstep(.18,.95,length(c*vec2(1.05,1.2))), uVig);
          col+=(hash(vUv*uRes+floor(uT*24.)*17.)-.5)*uGrain;
          col*=1.-uFade;
          gl_FragColor=vec4(max(col,0.),1.);
        }`,
    });
    composer.addPass(rp); composer.addPass(bloom); composer.addPass(new OutputPass()); composer.addPass(fin);
    return { composer, rp, bloom, fin };
  })() : null;
  const shoot = (scene: THREE.Scene, cam: THREE.Camera, look: number[], fade: number, t: number, dt: number) => {
    if (!R || !pp) return;
    [R.toneMappingExposure, pp.bloom.strength, pp.bloom.radius, pp.bloom.threshold] = look;
    pp.fin.uniforms.uFade.value = fade; pp.fin.uniforms.uT.value = t;
    pp.rp.scene = scene; pp.rp.camera = cam; pp.composer.render(dt);
  };

  let atlas: Atlas | null = null, hall: Hall | null = null, LIBS: Lib[] = [];
  function ensureHall() {
    if (!alive || hall || !R) return;
    try { hall = buildHall(R); hall.resize(vw, vh); R.compile(hall.scene, hall.camera); } catch (e) { console.error(e); hall = null; }
  }

  let gw = 0, gh = 0;
  function onResize(force: boolean) {
    measure(); if (!R || !pp) return;
    const w = innerWidth, h = innerHeight;
    if (!force && w === gw && Math.abs(h - gh) < 160) return;
    gw = w; gh = h; const d = DPR();
    R.setPixelRatio(d); R.setSize(w, h, false); pp.composer.setPixelRatio(d); pp.composer.setSize(w, h);
    pp.fin.uniforms.uRes.value.set(w * d, h * d);
    if (atlas) { atlas.resize(w, h, d); for (const k of ['tt', 'tb', 'tl'] as const) root.style.setProperty('--' + k, atlas.css[k] + 'px'); }
    hall?.resize(w, h);
  }
  addEventListener('resize', () => { clearTimeout(rto); rto = window.setTimeout(() => onResize(false), 150); }, { signal });
  let mx = 0, my = 0;
  addEventListener('pointermove', (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; mx = e.clientX / vw * 2 - 1; my = e.clientY / vh * 2 - 1; }, { passive: true, signal });

  let ev = false;
  function setEv(on: boolean) { if (!hall) return; ev = on; hall.setEvidence(on); root.classList.toggle('ev', on); evb.setAttribute('aria-pressed', String(on)); }

  let audio: { ac: AudioContext; master: GainNode; noise: GainNode } | null = null, sOn = false;
  function buildSound() {
    const ctx = new AudioContext(), master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), ch = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; ch[i] = last * 3.5; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
    const noise = ctx.createGain(); noise.gain.value = .35; src.connect(lp).connect(noise).connect(master); src.start();
    const drone = ctx.createGain(); drone.gain.value = .5; drone.connect(master);
    for (const [f, g] of [[55, .10], [82.4, .06], [110.3, .025]]) { const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.value = f; og.gain.value = g; o.connect(og).connect(drone); o.start(); }
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .07; lg.gain.value = .04; lfo.connect(lg).connect(drone.gain); lfo.start();
    return { ac: ctx, master, noise };
  }
  function toggleSound() {
    try {
      audio ??= buildSound(); sOn = !sOn; audio.ac.resume();
      audio.master.gain.setTargetAtTime(sOn ? .8 : 0, audio.ac.currentTime, .6); sndB.setAttribute('aria-pressed', String(sOn));
    } catch (e) { console.error(e); }
  }

  let chap = -1;
  const goto = (i: number) => scrollTo({ top: starts[clamp(i, 0, CH.length - 1)], behavior: RM.matches ? 'auto' : 'smooth' });
  function setChap(i: number) {
    chap = i; const [n, name, co] = CH[i];
    $('#chap').textContent = `${n} · ${name}`; $('#coord').textContent = co; $('#pn').textContent = n; $('#pt').textContent = name;
    $<HTMLButtonElement>('#prev').disabled = i === 0; $<HTMLButtonElement>('#next').disabled = i === CH.length - 1;
  }

  let exploring = false, xYear = NOW, sel = -1;
  function setYearX(yr: number): void {
    const y = xYear = clamp(Math.round(yr), Y0, NOW);
    xrange.value = String(y); xrange.setAttribute('aria-valuetext', yfmt(y)); atlas?.setYear(y);
    $('#xyr').innerHTML = `${Math.abs(y)}<small>${y < 0 ? 'BCE' : 'CE'}</small>`; $('#xera').textContent = era(y);
    const born = LIBS.filter(r => r.y <= y), lost = born.filter(r => typeof r.lost === 'number' && r.lost <= y);
    const unk = born.filter(r => r.lost === true).length, back = lost.filter(r => typeof r.found === 'number' && r.found <= y).length;
    $('#xcount').textContent = `${born.length - lost.length - unk} standing · ${lost.length} lost` + (back ? ` (${back} rediscovered)` : '') + (unk ? ` · ${unk} fate unknown` : '');
    if (sel >= 0 && LIBS[sel].y > y) sel = -1;
    if (sel >= 0) return select(sel);
    xcard.innerHTML = ''; renderList();
    const nu = born.reduce<Lib | null>((m, r) => (!m || r.y >= m.y ? r : m), null);
    if (nu) atlas?.focus(nu.lat, nu.lon);
  }
  function renderList() {
    xlist.innerHTML = LIBS.map((r, i) => [r, i] as const).filter(([r]) => r.y <= xYear).sort(([a], [b]) => a.y - b.y)
      .map(([r, i]) => `<button type="button" data-i="${i}" aria-pressed="${i === sel}"${lostBy(r, xYear) ? ' class="lost"' : ''}><span>${esc(r.n)}</span><small>${yfmt(r.y)}</small></button>`).join('');
  }
  function select(i: number): void {
    const r = LIBS[i]; if (!r) return; sel = i;
    if (r.y > xYear) return setYearX(r.y);
    atlas?.focus(r.lat, r.lon);
    const [evc, evl] = EV[r.ev] || EV.speculative, [kn, kit] = KIND[r.k] || KIND.site;
    const row = (k: string, s?: string | null | false) => s ? `<dt>${k}</dt><dd>${esc(s)}</dd>` : '';
    const fate = r.lost === true ? 'Lost, date unknown' : typeof r.lost === 'number' && r.lost <= xYear ? `Lost ${yfmt(r.lost)}` : '';
    const found = typeof r.found === 'number' && r.found <= xYear && yfmt(r.found);
    const href = r.href ?? `/place/${r.id}`;
    const link = `<a class="replay" href="${esc(href)}">${LINK[href.split('/')[1]] ?? 'Open'}</a>`;
    xcard.innerHTML = '<button type="button" id="xback">All libraries</button>' +
      `<p class="kicker">${deg(r.lat, 'N', 'S')} · ${deg(r.lon, 'E', 'W')}</p><h2>${esc(r.n)}</h2><p class="p">${esc(r.p)} · ${esc(r.yl)} · ${kn}</p>` +
      `<div class="chips"><span class="cchip ${evc}"><i class="${evc === 'con' ? 'ring' : 'dot'}"></i>${evl}</span></div>` +
      `<dl>${row('Evidence', r.evNote)}${row('Size', r.dim)}${row('Holdings', r.vol)}${row('Treasure', r.book)}${xYear >= (r.stFrom ?? Infinity) ? row('Now', r.st) : ''}${row('Hours', r.hours)}${row('Fate', fate)}${row('Found again', found)}${row('Room', `${kit}${r.read ? ' · ' + r.read : ''}`)}</dl>` +
      link + (r.id === 'longroom' ? '<button class="replay" type="button" id="xwalk">Play the film</button>' : '');
    renderList(); $('.xp').scrollTop = 0;
  }
  function openX() {
    if (exploring) return; exploring = true;
    root.classList.add('exp'); $('#explore').hidden = false; xb.setAttribute('aria-pressed', 'true');
    if (location.pathname === '/') history.replaceState(history.state, '', '/atlas');
    setYearX(xYear); xrange.focus({ preventScroll: true });
  }
  function closeX() {
    if (!exploring) return; exploring = false;
    root.classList.remove('exp'); $('#explore').hidden = true; xb.setAttribute('aria-pressed', 'false');
    if (location.pathname === '/atlas') history.replaceState(history.state, '', '/');
    sel = -1; xcard.innerHTML = ''; atlas?.setYear(NOW);
    const home = LIBS.find(r => r.id === 'longroom'); if (home) atlas?.focus(home.lat, home.lon);
  }

  const BUTTONS: Record<string, () => void> = {
    prev: () => goto(chap - 1), next: () => goto(chap + 1), replay: () => goto(0),
    xb: () => exploring ? closeX() : openX(), xopen: openX, xclose: closeX,
    xback: () => { sel = -1; setYearX(xYear); }, xwalk: () => { closeX(); goto(1); },
    evb: () => setEv(!ev), snd: toggleSound,
  };
  el.addEventListener('click', e => {
    const t = e.target as Element, a = t.closest('a');
    if (a?.getAttribute('href') === '/atlas' && !(e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) {
      e.preventDefault(); e.stopPropagation(); scrollTo({ top: 0 }); openX(); return;
    }
    if (a?.closest('#xcard') && a.getAttribute('href')!.startsWith('/room/') && !(e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) {
      e.preventDefault(); e.stopPropagation(); go(a.getAttribute('href')!, { arrive: 'outside' }); return;
    }
    const b = t.closest('button'); if (!b) return;
    if (BUTTONS[b.id]) BUTTONS[b.id]();
    else if (b.dataset.i) select(+b.dataset.i);
  }, { signal });
  xrange.addEventListener('input', () => setYearX(+xrange.value), { signal });
  cv.addEventListener('click', e => {
    if (!exploring || !atlas) return;
    const i = atlas.pick(e.clientX / vw * 2 - 1, -(e.clientY / vh * 2 - 1), 28, vw, vh);
    if (i >= 0) select(i);
  }, { signal });
  addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && exploring) return closeX();
    if (e.key.toLowerCase() !== 'e' || e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.target as Element).closest?.('input,textarea,select,[contenteditable]')) return;
    if (root.classList.contains('inhall') && hall) setEv(!ev);
  }, { signal });

  let last = performance.now(), time = 0, px = 0, py = 0, pE = .5, sxE = 0, wasHall = false, prevIn = false;
  let heroO = 1, barS = -1, bookQ = -1, yr = 0;
  const v = new THREE.Vector3();
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(.1, (now - last) / 1000); last = now; time += dt;
    const y = scrollY, P = clamp((y - filmTop) / filmLen), pA = P / A, lH = (P - A) / (1 - A);
    const t = clamp((lH - 1 / 12) / (10 / 12)), inHall = !exploring && P >= A && y < bookTop;
    let c = 0; for (let i = 1; i < starts.length; i++) if (y >= starts[i] - 4) c = i;
    if (c !== chap) setChap(c);
    for (const k of caps) {
      const val = k.act === 'a' ? pA : (P < A ? -1 : t), on = val >= k.a && val < k.b;
      if (on !== k.on) { k.on = on; k.el.classList.toggle('on', on); }
    }
    const ho = +(1 - smooth(.1, .2, pA)).toFixed(3);
    if (ho !== heroO) { heroO = ho; hero.style.opacity = String(ho); hero.style.visibility = ho ? '' : 'hidden'; }
    const bs = +clamp(y / docLen).toFixed(4);
    if (bs !== barS) { barS = bs; bar.style.transform = `scaleX(${bs})`; }
    if (inHall !== prevIn) {
      prevIn = inHall; root.classList.toggle('inhall', inHall); evb.disabled = !inHall || !R;
      if (sOn && audio) audio.noise.gain.setTargetAtTime(inHall ? .6 : .3, audio.ac.currentTime, .8);
    }
    const still = RM.matches, k = 1 - Math.exp(-dt * 3), tm = still ? 0 : time;
    px += ((still ? 0 : mx) - px) * k; py += ((still ? 0 : my) - py) * k;
    if (atlas && exploring) {
      const tgt = sel < 0 ? .5 : .72, sxT = vw > 760 ? .55 : 0;
      pE += (tgt - pE) * k; sxE += (sxT - sxE) * k;
      atlas.update(still ? tgt : pE, tm, px, py, still ? sxT : sxE); wasHall = false;
      shoot(atlas.scene, atlas.camera, LOOK.atlas, 0, tm, dt);
    } else if (atlas && y < bookTop) {
      if (P < A) { atlas.update(Math.min(pA, 1), tm, px, py); wasHall = false; shoot(atlas.scene, atlas.camera, LOOK.atlas, smooth(.88, 1, pA), tm, dt); }
      else {
        ensureHall();
        if (hall) { hall.update(t, tm, dt, px, py, !wasHall); wasHall = true; shoot(hall.scene, hall.camera, ev ? LOOK.hallEv : LOOK.hall, 1 - smooth(0, .035, lH), tm, dt); }
      }
    }
    if (hall) {
      if (hall.year !== yr) { yr = hall.year; yearEl.innerHTML = `${yr}<small>AD</small>`; }
      if (ev && inHall) hall.dimPts.forEach((p, i) => {
        const d = dimEls[i]; if (!d) return;
        v.copy(p).project(hall!.camera);
        const sx = (v.x * .5 + .5) * vw, sy = (-v.y * .5 + .5) * vh, off = v.z > 1 || sx < -40 || sx > vw + 40 || sy < -40 || sy > vh + 40;
        d.style.transform = `translate(calc(${sx.toFixed(1)}px - 50%), calc(${sy.toFixed(1)}px - 50%))`; d.style.opacity = off ? '0' : '';
      });
    }
    if (y > bookTop - vh && y < bookTop + bookLen + vh) {
      const q = +clamp((y - bookTop) / bookLen).toFixed(4);
      if (q !== bookQ) { bookQ = q; book(bk, q); }
    }
  }

  let opened = false;
  const reveal = () => { if (opened || !alive) return; opened = true; root.classList.add('open'); };
  revealT = window.setTimeout(reveal, 5000);
  let stopScale = () => {};
  (async () => {
    measure();
    try { stopScale = buildScale($<SVGSVGElement>('#scalesvg')); } catch (e) { console.error(e); }
    LIBS = await fetch('/lib/pins.json').then(r => r.ok ? r.json() : []).catch(() => []);
    if (!alive) return;
    const n = (e: string) => LIBS.filter(r => r.ev === e).length;
    $('#achips').innerHTML = `<span class="cchip pri"><i class="dot"></i>${n('known')} known</span><span class="cchip sec"><i class="dot"></i>${n('probable')} probable</span><span class="cchip con"><i class="ring"></i>${n('speculative')} speculative</span>`;
    if (R && pp) {
      await Promise.race([
        Promise.all([document.fonts.load('400 100px "Libre Caslon Display"'), document.fonts.load('500 44px "IBM Plex Mono"')]),
        new Promise(r => setTimeout(r, 2500)),
      ]).catch(() => {});
      if (!alive) return;
      const tex = await new THREE.TextureLoader().loadAsync('/globe/night.webp').catch(() => {
        const d = new THREE.DataTexture(new Uint8Array([6, 8, 14, 255]), 1, 1); d.needsUpdate = true; return d as THREE.Texture;
      });
      if (!alive) return;
      try {
        atlas = buildAtlas(tex, LIBS); atlas.setYear(NOW); onResize(true); atlas.update(0, 0);
        shoot(atlas.scene, atlas.camera, LOOK.atlas, 0, 0, 0);
      } catch (e) { console.error(e); atlas = null; root.classList.add('no-gl'); }
      (window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 600)))(ensureHall, { timeout: 1500 });
    } else measure();
    reveal();
    if (params.mode === 'atlas') openX();
    el.dataset.ready = 'true';
    raf = requestAnimationFrame(frame);
  })();

  return () => {
    alive = false; ac.abort();
    cancelAnimationFrame(raf); clearTimeout(rto); clearTimeout(revealT);
    stopScale();
    pp?.composer.dispose(); R?.dispose(); R?.forceContextLoss();
    audio?.ac.close();
    root.classList.remove('open', 'exp', 'ev', 'inhall', 'no-gl');
    for (const k of ['tt', 'tb', 'tl']) root.style.removeProperty('--' + k);
    delete root.dataset.home; delete el.dataset.view; delete el.dataset.ready;
  };
};
