import * as THREE from 'three';
import { rng, canvas, MOBILE } from './util';

const wrap = (c: HTMLCanvasElement, srgb = true) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
};
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};

// oak floor boards: one 2.4 m tile, 8 boards running down the room
export function planks() {
  const S = MOBILE ? 512 : 1024, [c, x] = canvas(S, S), R = rng(1733), w = S / 8;
  for (let i = 0; i < 8; i++) {
    const base = ['#5c3d24', '#6a4529', '#553820', '#70492b', '#62422a'][Math.floor(R() * 5)];
    x.fillStyle = base; x.fillRect(i * w, 0, w, S);
    for (let g = 0; g < 26; g++) { // grain
      x.strokeStyle = R() < .5 ? 'rgba(20,10,4,.18)' : 'rgba(150,110,70,.10)';
      x.lineWidth = .6 + R() * 1.4;
      const gx = i * w + R() * w, amp = 1 + R() * 3, ph = R() * 6;
      x.beginPath();
      for (let y = 0; y <= S; y += 16) x.lineTo(gx + Math.sin(y / 90 + ph) * amp, y);
      x.stroke();
    }
    const j = R() * S; // butt joint, staggered per board
    x.fillStyle = 'rgba(12,6,2,.75)'; x.fillRect(i * w, j, w, 2);
    x.fillStyle = 'rgba(12,6,2,.8)'; x.fillRect(i * w, 0, 2, S); // seam
    const wear = x.createLinearGradient(i * w, 0, i * w + w, 0); // centre of the room is worn paler
    wear.addColorStop(0, 'rgba(0,0,0,.12)'); wear.addColorStop(.5, 'rgba(255,230,190,.04)'); wear.addColorStop(1, 'rgba(0,0,0,.12)');
    x.fillStyle = wear; x.fillRect(i * w, 0, w, S);
  }
  return wrap(c);
}

// leaded panes: 3 x 6 lights of slightly uneven crown glass
export function mullions() {
  const [c, x] = canvas(256, 512), R = rng(40);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 6; j++) {
    const v = 200 + R() * 55;
    x.fillStyle = `rgb(${v},${v},${v})`;
    x.fillRect(i * 256 / 3, j * 512 / 6, 256 / 3, 512 / 6);
  }
  x.fillStyle = '#120c08';
  for (let i = 0; i <= 3; i++) x.fillRect(i * 256 / 3 - 4, 0, 8, 512);
  for (let j = 0; j <= 6; j++) x.fillRect(0, j * 512 / 6 - 4, 256, 8);
  x.lineWidth = 20; x.strokeRect(0, 0, 256, 512);
  const t = wrap(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

// one 3 m x 3 m bay of shelving: 7 shelves, calf and vellum bindings
const PAL = ['#5a3520', '#6b3f22', '#7a4a28', '#4a2c18', '#8a5a32', '#a07040', '#5e1f1a'];
export function books(seed: number) {
  const S = MOBILE ? 512 : 1024, [c, x] = canvas(S, S), R = rng(seed);
  const px = S / 3, shelf = S / 7, board = Math.round(S / 128);
  x.fillStyle = '#0e0805'; x.fillRect(0, 0, S, S);
  for (let k = 0; k < 7; k++) {
    const floor = (k + 1) * shelf - board, room = shelf - board;
    const tall = .55 + .35 * (k / 6); // folios low, octavos high
    let u = 0, run = 0, runCol: string | null = null, runH = 0;
    while (u < S) {
      if (R() < .035) { u += (.03 + R() * .05) * px; continue; } // gap where a volume is out
      if (run <= 0 && R() < .12) { run = 3 + Math.floor(R() * 7); runCol = null; }
      const r = R();
      let col = r < .03 ? '#2e3a2a' : r < .08 ? '#cdbf9e' : PAL[Math.floor(R() * PAL.length)];
      let h = room * Math.min(.96, tall + (R() - .5) * .18);
      if (run > 0) { runCol = runCol || col; runH = runH || h; col = runCol; h = runH * (.98 + R() * .04); run--; }
      const bw = Math.max(5, (run > 0 ? .035 : .022 + R() * .05) * px), top = floor - h;
      const g = x.createLinearGradient(u, 0, u + bw, 0);
      g.addColorStop(0, shade(col, .35)); g.addColorStop(.28, shade(col, 1.12));
      g.addColorStop(.7, shade(col, .9)); g.addColorStop(1, shade(col, .3));
      x.fillStyle = g; x.fillRect(u, top, bw - 1, h);
      x.fillStyle = 'rgba(201,163,90,.55)'; // raised bands, gilt
      const bands = 4 + (R() < .5 ? 1 : 0);
      for (let b = 0; b < bands; b++) x.fillRect(u + 1, top + h * (.1 + b * .8 / (bands - 1)), bw - 3, Math.max(1, S / 700));
      if (R() < .55) { // lettering piece
        x.fillStyle = R() < .5 ? '#6e1e18' : '#1a1410';
        const ly = top + h * .14, lh = h * .12;
        x.fillRect(u + 1.5, ly, bw - 4, lh);
        x.fillStyle = 'rgba(201,163,90,.5)'; x.fillRect(u + 3, ly + lh * .45, bw - 7, Math.max(1, S / 900));
      }
      const age = x.createLinearGradient(0, top, 0, floor); // dust settles on top edges
      age.addColorStop(0, 'rgba(0,0,0,.45)'); age.addColorStop(.15, 'rgba(0,0,0,0)');
      x.fillStyle = age; x.fillRect(u, top, bw - 1, h);
      u += bw;
    }
    const sh = x.createLinearGradient(0, k * shelf, 0, k * shelf + room * .4); // shelf above casts shadow
    sh.addColorStop(0, 'rgba(0,0,0,.75)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = sh; x.fillRect(0, k * shelf, S, room * .4);
    x.fillStyle = '#3a2414'; x.fillRect(0, floor, S, board);
    x.fillStyle = 'rgba(255,220,170,.12)'; x.fillRect(0, floor, S, 1);
  }
  return wrap(c);
}

export function hallTitle() {
  const [c, x] = canvas(2048, 512);
  x.fillStyle = '#fff'; x.textAlign = 'center';
  x.shadowColor = 'rgba(0,0,0,.9)'; x.shadowBlur = 34; // dark halo keeps glyphs legible against the end-window glare
  const fit = (s: string, px: number, font: string, y: number) => { // shrink until the line fits, whichever face actually loaded
    x.font = `${font.replace('#', String(px))}`; const w = x.measureText(s).width;
    if (w > 1880) x.font = font.replace('#', String(Math.floor(px * 1880 / w)));
    x.fillText(s, 1024, y);
  };
  fit('The Long Room', 300, '400 #px "Libre Caslon Display", Georgia, serif', 330);
  if ('letterSpacing' in x) x.letterSpacing = '14px';
  fit('TRINITY COLLEGE DUBLIN  ·  BUILT 1712–1732', 44, '500 #px "IBM Plex Mono", monospace', 450);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
