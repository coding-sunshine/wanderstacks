import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildAtlas, type Atlas, type Lib } from './atlas';
import { buildScale } from './extras';
import { clamp, MOBILE, RM } from './util';
import { go } from '../app';
import type { Mount } from '../types';
import './cinematic.css';

const HTML = `
<canvas id="gl" role="img" aria-label="A night-side Earth with 52 libraries across 2,700 years lit in gold"></canvas>
<section id="explore" aria-labelledby="xh1">
  <div class="xp">
    <h1 id="xh1">Libraries of the world<span>Present and past · 668 BCE to today</span></h1>
    <p class="hint">Drag the years. Pick a light on the globe or a name below.</p>
    <p class="yr" id="xyr">2026<small>CE</small></p>
    <p class="kicker" id="xera">Modern</p>
    <p class="p" id="xcount" aria-live="polite"></p>
    <div class="chips" id="achips"></div>
    <div id="xcard" class="plaque"></div>
    <div id="xlist" role="group" aria-label="Libraries founded by this year"></div>
  </div>
  <div class="xtime">
    <input type="range" id="xrange" min="-668" max="2026" step="1" value="2026" aria-label="Year">
    <div class="xticks" aria-hidden="true"><span style="left:0">668 BCE</span><span class="w" style="left:24.8%">1 CE</span><span style="left:43.4%">500</span><span class="w" style="left:61.9%">1000</span><span style="left:80.5%">1500</span><span style="left:100%">2026</span></div>
  </div>
</section>
<div class="cine-main">
  <section id="scale" aria-labelledby="sh">
    <div class="in">
      <p class="kicker">1 m = 1 m</p>
      <h2 class="big" id="sh">To scale.</h2>
      <p class="p">Every outline uses the same metre. Solid lines are measured. Dashed lines are our estimate.</p>
    </div>
    <div class="wrap" tabindex="0" role="region" aria-label="Library sections drawn to scale, scrolls sideways on small screens"><svg id="scalesvg" role="img" aria-label="Long Room, Admont, Strahov Philosophical Hall, Library of Congress reading room and Library of Celsus drawn at one scale"></svg></div>
  </section>
  <footer id="colophon">
    <div class="in">
      <p class="kicker">Credits</p>
      <h2 class="big">Measured where we can. Marked where we guess.</h2>
      <div class="credits">
        <div><h4>Data</h4><p>Dates, places and sizes come from the WorldLibs records, checked against Wikidata, Wikipedia and each library's own pages. Every figure carries the source tier shown beside it.</p></div>
        <div><h4>Stand-ins</h4><p>The books, busts, window glazing and harp in the rooms are modelled by hand. Treat them as placeholders until scans or measured drawings exist.</p></div>
        <div><h4>Earth</h4><p>NASA Black Marble night lights, public domain.</p></div>
        <div><h4>Type</h4><p>Libre Caslon by Impallari Type, a revival of Caslon's 1720s and 1730s faces. IBM Plex Mono.</p></div>
        <div><h4>Texts and scans</h4><p>Public-domain texts from Standard Ebooks, Project Gutenberg and Wikisource. Page scans come from each holder's IIIF service under the holder's own licence, credited on every scan.</p></div>
      </div>
      <ul class="routes">
        <li><a href="/byrne">Byrne</a></li><li><a href="/shelf">Shelf</a></li><li><a href="/babel">Babel</a></li><li><kbd>⌘K</kbd> Search</li>
      </ul>
    </div>
  </footer>
</div>`;

const ERAS: [number, string][] = [[-Infinity, 'Antiquity'], [500, 'Middle Ages'], [1500, 'Early modern'], [1800, 'Modern']];
const EV: Record<string, [string, string]> = { known: ['pri', 'Known'], probable: ['sec', 'Probable'], speculative: ['con', 'Speculative'] };
const KIND: Record<string, [string, string]> = { hall: ['Hall', 'Hall bay kit'], rotunda: ['Rotunda', 'Rotunda kit'], dome: ['Domed hall', 'Dome kit'], atrium: ['Atrium', 'Atrium kit'], site: ['Site', 'Ruin and site kit'] };
const LINK: Record<string, string> = { room: 'Enter the room', ledger: 'Read the ledger', stgall: 'Walk the plan', scan: 'Turn the pages', place: 'Read the record' };
const KL: Record<string, string> = { book: 'Text · turn the pages', scan: 'Page scans · turn the pages' };
// [exposure, bloom strength, radius, threshold]
const LOOK = [1, .75, .55, .85];
const NOW = 2026, Y0 = -668;
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
  const ac = new AbortController(), signal = ac.signal;
  let alive = true, raf = 0, rto = 0;
  const cv = $<HTMLCanvasElement>('#gl');
  const xrange = $<HTMLInputElement>('#xrange'), xlist = $('#xlist'), xcard = $('#xcard');
  const base = params.mode ? '/atlas' : '/';

  let R: THREE.WebGLRenderer | null = null;
  try { R = new THREE.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: 'high-performance' }); } catch { R = null; }
  if (!R) root.classList.add('no-gl');
  const DPR = () => Math.min(devicePixelRatio || 1, MOBILE ? 1.25 : 1.5);
  const pp = R ? (() => {
    R.toneMapping = THREE.ACESFilmicToneMapping;
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
  const shoot = (scene: THREE.Scene, cam: THREE.Camera, look: number[], t: number, dt: number) => {
    if (!R || !pp) return;
    [R.toneMappingExposure, pp.bloom.strength, pp.bloom.radius, pp.bloom.threshold] = look;
    pp.fin.uniforms.uFade.value = 0; pp.fin.uniforms.uT.value = t;
    pp.rp.scene = scene; pp.rp.camera = cam; pp.composer.render(dt);
  };

  let atlas: Atlas | null = null, LIBS: Lib[] = [], vw = innerWidth, vh = innerHeight;
  let gw = 0, gh = 0;
  function onResize(force: boolean) {
    vw = innerWidth; vh = innerHeight; if (!R || !pp) return;
    const w = innerWidth, h = innerHeight;
    if (!force && w === gw && Math.abs(h - gh) < 160) return;
    gw = w; gh = h; const d = DPR();
    R.setPixelRatio(d); R.setSize(w, h, false); pp.composer.setPixelRatio(d); pp.composer.setSize(w, h);
    pp.fin.uniforms.uRes.value.set(w * d, h * d);
    atlas?.resize(w, h, d);
  }
  addEventListener('resize', () => { clearTimeout(rto); rto = window.setTimeout(() => onResize(false), 150); }, { signal });
  let mx = 0, my = 0;
  addEventListener('pointermove', (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; mx = e.clientX / vw * 2 - 1; my = e.clientY / vh * 2 - 1; }, { passive: true, signal });

  // Nothing is selected on arrival: the globe idles and every library waits its turn.
  let xYear = NOW, sel = -1;
  function setYearX(yr: number): void {
    const y = xYear = clamp(Math.round(yr), Y0, NOW);
    xrange.value = String(y); xrange.setAttribute('aria-valuetext', yfmt(y)); atlas?.setYear(y);
    $('#xyr').innerHTML = `${Math.abs(y)}<small>${y < 0 ? 'BCE' : 'CE'}</small>`; $('#xera').textContent = era(y);
    const born = LIBS.filter(r => r.y <= y), lost = born.filter(r => typeof r.lost === 'number' && r.lost <= y);
    const unk = born.filter(r => r.lost === true).length, back = lost.filter(r => typeof r.found === 'number' && r.found <= y).length;
    $('#xcount').textContent = `${born.length - lost.length - unk} standing · ${lost.length} lost` + (back ? ` (${back} rediscovered)` : '') + (unk ? ` · ${unk} fate unknown` : '');
    if (sel >= 0 && LIBS[sel].y > y) { sel = -1; history.replaceState(history.state, '', base); }
    if (sel >= 0) return card();
    xcard.innerHTML = ''; renderList(); atlas?.clear();
  }
  function renderList() {
    xlist.innerHTML = LIBS.map((r, i) => [r, i] as const).filter(([r]) => r.y <= xYear).sort(([a], [b]) => a.y - b.y)
      .map(([r, i]) => `<button type="button" data-i="${i}" aria-pressed="${i === sel}"${lostBy(r, xYear) ? ' class="lost"' : ''}><span>${esc(r.n)}</span><small>${yfmt(r.y)}</small></button>`).join('');
  }
  function card() {
    const r = LIBS[sel];
    atlas?.focus(r.lat, r.lon);
    const [evc, evl] = EV[r.ev] || EV.speculative, [kn, kit] = KIND[r.k] || KIND.site;
    const row = (k: string, s?: string | null | false) => s ? `<dt>${k}</dt><dd>${esc(s)}</dd>` : '';
    const fate = r.lost === true ? 'Lost, date unknown' : typeof r.lost === 'number' && r.lost <= xYear ? `Lost ${yfmt(r.lost)}` : '';
    const found = typeof r.found === 'number' && r.found <= xYear && yfmt(r.found);
    const href = r.href ?? `/place/${r.id}`;
    const reads = (r.reads ?? []).filter(b => b.k !== 'card');
    xcard.innerHTML = '<button type="button" id="xback">All libraries</button>' +
      `<p class="kicker">${deg(r.lat, 'N', 'S')} · ${deg(r.lon, 'E', 'W')}</p><h2 tabindex="-1">${esc(r.n)}</h2><p class="p">${esc(r.p)} · ${esc(r.yl)} · ${kn}</p>` +
      `<div class="chips"><span class="cchip ${evc}"><i class="${evc === 'con' ? 'ring' : 'dot'}"></i>${evl}</span></div>` +
      `<dl>${row('Evidence', r.evNote)}${row('Size', r.dim)}${row('Holdings', r.vol)}${row('Treasure', r.book)}${xYear >= (r.stFrom ?? Infinity) ? row('Now', r.st) : ''}${row('Hours', r.hours)}${row('Fate', fate)}${row('Found again', found)}${row('Room', `${kit}${r.read ? ' · ' + r.read : ''}`)}</dl>` +
      `<a class="replay" href="${esc(href)}">${LINK[href.split('/')[1]] ?? 'Open'}</a>` +
      (reads.length ? `<h3 class="kicker">Read here</h3><ul class="reads">${reads.map((b, n) => { const ext = /^https?:/.test(b.href); return `<li style="--i:${n}"><a href="${esc(b.href)}"${ext ? ' target="_blank" rel="noopener"' : ''}><span>${esc(b.t)}</span><small>${[b.a, b.d, ext ? `Page scans · ${new URL(b.href).hostname} ↗` : KL[b.k]].filter(Boolean).map(esc).join(' · ')}</small></a></li>`; }).join('')}</ul>` : '');
    renderList();
  }
  function select(i: number, focus = true): void {
    const r = LIBS[i]; if (!r) return;
    sel = i; history.replaceState(history.state, '', '/atlas/' + r.id);
    if (r.y > xYear) setYearX(r.y); else card();
    $('.xp').scrollTop = 0;
    if (focus) xcard.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  }
  function deselect() {
    const prev = sel; sel = -1; history.replaceState(history.state, '', base); setYearX(xYear);
    xlist.querySelector<HTMLElement>(`[data-i="${prev}"]`)?.focus();
  }

  el.addEventListener('click', e => {
    const t = e.target as Element, a = t.closest('a');
    if (a?.closest('#xcard') && a.getAttribute('href')!.startsWith('/room/') && !(e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) {
      e.preventDefault(); e.stopPropagation(); go(a.getAttribute('href')!, { arrive: 'outside' }); return;
    }
    const b = t.closest('button'); if (!b) return;
    if (b.id === 'xback') deselect();
    else if (b.dataset.i) select(+b.dataset.i);
  }, { signal });
  xrange.addEventListener('input', () => setYearX(+xrange.value), { signal });
  cv.addEventListener('click', e => {
    if (!atlas) return;
    const i = atlas.pick(e.clientX / vw * 2 - 1, -(e.clientY / vh * 2 - 1), 28, vw, vh);
    if (i >= 0) select(i);
  }, { signal });
  addEventListener('keydown', (e: KeyboardEvent) => { if (e.key === 'Escape' && sel >= 0 && !document.querySelector('dialog[open]')) deselect(); }, { signal });

  // The globe sits behind the first screen only. Below it, stop drawing.
  let onscreen = true;
  const io = new IntersectionObserver(([e]) => { onscreen = e.isIntersecting; }, { threshold: .05 });
  io.observe($('#explore'));

  let last = performance.now(), time = 0, px = 0, py = 0, pE = .5, sxE = 0, syE = 0;
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    if (!atlas || !onscreen) return;
    time += dt;
    const still = RM.matches, k = 1 - Math.exp(-dt * 3), tm = still ? 0 : time;
    px += ((still ? 0 : mx) - px) * k; py += ((still ? 0 : my) - py) * k;
    const tgt = sel < 0 ? .5 : .72, sxT = vw > 760 ? .55 : 0, syT = vw > 760 ? 0 : .6;
    pE += (tgt - pE) * k; sxE += (sxT - sxE) * k; syE += (syT - syE) * k;
    atlas.update(still ? tgt : pE, tm, px, py, still ? sxT : sxE, still ? syT : syE);
    shoot(atlas.scene, atlas.camera, LOOK, tm, dt);
  }

  let stopScale = () => {};
  (async () => {
    try { stopScale = buildScale($<SVGSVGElement>('#scalesvg')); } catch (e) { console.error(e); }
    LIBS = await fetch('/lib/pins.json').then(r => r.ok ? r.json() : []).catch(() => []);
    if (!alive) return;
    const n = (e: string) => LIBS.filter(r => r.ev === e).length;
    $('#achips').innerHTML = `<span class="cchip pri"><i class="dot"></i>${n('known')} known</span><span class="cchip sec"><i class="dot"></i>${n('probable')} probable</span><span class="cchip con"><i class="ring"></i>${n('speculative')} speculative</span>`;
    if (R && pp) {
      const tex = await new THREE.TextureLoader().loadAsync('/globe/night.webp').catch(() => {
        const d = new THREE.DataTexture(new Uint8Array([6, 8, 14, 255]), 1, 1); d.needsUpdate = true; return d as THREE.Texture;
      });
      if (!alive) return;
      try {
        atlas = buildAtlas(tex, LIBS); atlas.setYear(NOW); onResize(true); atlas.update(.5, 0);
        shoot(atlas.scene, atlas.camera, LOOK, 0, 0);
      } catch (e) { console.error(e); atlas = null; root.classList.add('no-gl'); }
    }
    setYearX(NOW);
    if (params.lib) { const i = LIBS.findIndex(r => r.id === params.lib); if (i >= 0) select(i, false); else history.replaceState(history.state, '', base); }
    root.classList.add('open');
    el.dataset.ready = 'true';
    raf = requestAnimationFrame(frame);
  })();

  return () => {
    alive = false; ac.abort(); io.disconnect();
    cancelAnimationFrame(raf); clearTimeout(rto);
    stopScale();
    pp?.composer.dispose(); R?.dispose(); R?.forceContextLoss();
    root.classList.remove('open', 'no-gl');
    delete root.dataset.home; delete el.dataset.view; delete el.dataset.ready;
  };
};
