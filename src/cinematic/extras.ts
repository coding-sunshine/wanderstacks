import { RM } from './util';

// Reel four: five rooms in long section at one metre. Solid = measured, dashed = estimated.
const K = 9, Y = 520, BONE = 'rgba(236,228,212,.92)', GILT = '#d8a65a';
const m = (v: number) => +(v * K).toFixed(1), up = (h: number) => +(Y - h * K).toFixed(1);
const solid = (d: string) => `<path d="${d}" fill="none" stroke="${BONE}" stroke-width="2.5"/>`;
const dash = (d: string) => `<path d="${d}" fill="none" stroke="${GILT}" stroke-width="2" stroke-dasharray="8 7"/>`;
const tick = (x: number, h: number, label: string, right = true) => {
  const y = up(h), x2 = right ? x + 14 : x - 14;
  return `<path d="M${x} ${y}H${x2}" stroke="${GILT}" stroke-width="2"/><text class="smeta" x="${right ? x2 + 8 : x2 - 8}" y="${y + 7}" text-anchor="${right ? 'start' : 'end'}" fill="${GILT}" style="fill:${GILT}">${label}</text>`;
};
const note = (x: number, y: number, s: string) => `<text class="smeta" x="${x}" y="${y}" style="font-size:16px">${s}</text>`;
const label = (x: number, name: string, lines: string[]) => `<text class="sname" x="${x}" y="${Y + 46}">${name}</text>` +
  lines.map((s: string, i: number) => `<text class="smeta" x="${x}" y="${Y + 80 + i * 28}">${s}</text>`).join('');

function rooms() {
  const out: string[] = [];
  // The Long Room: 63.7 x 14.2. Gallery and the pre-1860 ceiling line are our estimates.
  let x = 60, w = m(63.7);
  out.push(solid(`M${x} ${Y}V${up(14.2)}H${x + w}V${Y}`) +
    dash(`M${x} ${up(9)}H${x + w}`) + dash(`M${x} ${up(5.2)}H${x + w}`) +
    note(x + 12, up(9) - 10, '1732 ceiling? 9 m') + note(x + 12, up(5.2) - 10, 'gallery 5.2 m') +
    // a 1.8 m person by the door
    `<g stroke="${BONE}" stroke-width="2" fill="none"><circle cx="${x + 40}" cy="${up(1.62)}" r="1.9"/><path d="M${x + 40} ${up(1.45)}V${up(.85)}M${x + 37} ${Y}L${x + 40} ${up(.85)}L${x + 43} ${Y}M${x + 36} ${up(1.3)}L${x + 40} ${up(1.38)}L${x + 44} ${up(1.3)}"/></g>` +
    note(x + 50, up(1.2), '1.8 m') +
    label(x, 'The Long Room', ['Dublin · 1712–1732 · vault 1860', '63.7 × 12.2 × 14.2 m']));

  // Admont Abbey: 70 x 11, seven domes, the central one to 12.7 m
  x = 703; w = m(70);
  let d = `M${x} ${Y}V${up(11)}`;
  for (let i = 0; i < 7; i++) d += `M${x + i * w / 7} ${up(11)}`;
  out.push(solid(`M${x} ${Y}V${up(11)}H${x + w}V${Y}`) +
    dash(Array.from({ length: 7 }, (_, i) => {
      const a = x + i * w / 7, b = a + w / 7, r = i === 3 ? 1.7 : .9;
      return `M${a.toFixed(1)} ${up(11)}Q${((a + b) / 2).toFixed(1)} ${up(11 + 2 * r)} ${b.toFixed(1)} ${up(11)}`;
    }).join('')) +
    // leader up from the central dome's apex, label above the roofline
    `<path d="M${x + w / 2} ${up(12.7)}V${up(15.4)}" stroke="${GILT}" stroke-width="2"/><text class="smeta" x="${x + w / 2}" y="${up(15.4) - 10}" text-anchor="middle" style="fill:${GILT}">dome 12.7 m</text>` +
    label(x, 'Admont Abbey', ['1776 · 70 × 14 × 11 m', 'seven domes, frescoed']));

  // Strahov Philosophical Hall: 32 x 14
  x = 1403; w = m(32);
  out.push(solid(`M${x} ${Y}V${up(14)}H${x + w}V${Y}`) +
    label(x, 'Strahov', ['Philosophical Hall', '32 × 10 × 14 m']));

  // Library of Congress Main Reading Room: floor measured, walls and dome drawn from the two heights we have
  x = 1761; w = m(30.5);
  const cx = x + w / 2;
  out.push(solid(`M${x} ${Y}H${x + w}`) +
    dash(`M${x} ${Y}V${up(22)}A${w / 2} ${m(38.1 - 22)} 0 0 1 ${x + w} ${up(22)}V${Y}`) +
    dash(`M${cx - m(2)} ${up(38.1)}V${up(48.8)}H${cx + m(2)}V${up(38.1)}`) +
    tick(cx + m(2) + 6, 38.1, '38.1 m') + tick(cx + m(2) + 6, 48.8, '48.8 m') +
    label(x, 'Library of Congress', ['Main Reading Room', '1890–97 · 30.5 m across']));

  // Library of Celsus, Ephesus: room 16.7 m measured, facade over 16 m
  x = 2105; w = m(16.7);
  out.push(solid(`M${x} ${Y}H${x + w}`) +
    dash(`M${x} ${Y}V${up(16)}H${x + w}V${Y}M${x} ${up(8)}H${x + w}`) +
    tick(x + w + 6, 16, '> 16 m') +
    label(x, 'Celsus', ['Ephesus · c.110–135 CE', 'room 16.7 m · facade', 'interior lost 262 CE']));
  return out;
}

export function buildScale(svg: SVGSVGElement): () => void {
  svg.setAttribute('viewBox', '0 0 2440 640');
  const bar = `<g><path d="M60 150H${60 + m(10)}M60 142V158M${60 + m(5)} 146V154M${60 + m(10)} 142V158" stroke="${BONE}" stroke-width="2" fill="none"/>` +
    `<text class="smeta" x="60" y="128">0</text><text class="smeta" x="${60 + m(10)}" y="128" text-anchor="end">10 m</text>` +
    `<path d="M${60 + m(10) + 40} 150h40" stroke="${BONE}" stroke-width="2.5"/><text class="smeta" x="${60 + m(10) + 90}" y="157">measured</text>` +
    `<path d="M${60 + m(10) + 250} 150h40" stroke="${GILT}" stroke-width="2" stroke-dasharray="8 7"/><text class="smeta" x="${60 + m(10) + 300}" y="157">estimated</text></g>`;
  const ground = `<path d="M30 ${Y}H2410" stroke="rgba(236,228,212,.22)" stroke-width="1.5"/>`;
  svg.innerHTML = ground + [bar, ...rooms()].map((g, i) =>
    `<g class="sg" style="opacity:0;transition:opacity 1s ease ${(i * .14).toFixed(2)}s">${g}</g>`).join('');
  const show = () => svg.querySelectorAll<SVGGElement>('.sg').forEach(g => { g.style.opacity = '1'; });
  if (RM.matches || !('IntersectionObserver' in window)) { show(); return () => {}; }
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { show(); io.disconnect(); } }, { threshold: .25 });
  io.observe(svg);
  return () => io.disconnect();
}
