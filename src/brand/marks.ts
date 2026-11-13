// Brand marks as SVG strings. The nav mark, favicon, footer seal and share image (scripts/og.ts) all draw from here.
type P = [number, number]
type Ink = { ink: string; ground: string; accent: string }
const f = (n: number) => +n.toFixed(2)
const pt = (p: P) => `${f(p[0])} ${f(p[1])}`
const seg = (a: P, b: P) => `M${pt(a)}L${pt(b)}`
const pl = (ps: P[], z = false) => 'M' + ps.map(pt).join('L') + (z ? 'z' : '')
const rng = (s: number) => () => (s = (s * 16807) % 2147483647) / 2147483647
const rad = (d: number) => (d * Math.PI) / 180
const polar = (r: number, t: number, cy: number): P => [100 + r * Math.cos(rad(t)), cy - r * Math.sin(rad(t))]
const arc = (c: P, r: number, a0: number, a1: number, n = 32): P[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [c[0] + r * Math.cos(a), c[1] - r * Math.sin(a)] as P })
const star = ([x, y]: P, R: number, w = R * 0.13) =>
  `M${f(x)} ${f(y - R)}Q${f(x + w)} ${f(y - w)} ${f(x + R)} ${f(y)}Q${f(x + w)} ${f(y + w)} ${f(x)} ${f(y + R)}Q${f(x - w)} ${f(y + w)} ${f(x - R)} ${f(y)}Q${f(x - w)} ${f(y - w)} ${f(x)} ${f(y - R)}z`
const stroke = (d: string[], color: string, w: number) =>
  `<path d="${d.join('')}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`

// The engraving: an arched doorway onto a barrel-vaulted hall, shelves running to a lit far door with the star in it. 200x200.
export function hall(id: string, c: Ink) {
  const VP: P = [100, 132], Z = 1 / 0.16
  const pr = (p: P, z: number): P => [VP[0] + (p[0] - VP[0]) / z, VP[1] + (p[1] - VP[1]) / z]
  const L = 40, R = 160, S = 88, F = 188, AR = 60, AC: P = [100, S]
  const rand = rng(11), books: string[] = [], boards: string[] = [], vault: string[] = [], floor: string[] = []
  const lines = [90, 109, 128, 147, 166, 182]
  for (const X of [L, R]) {
    for (const y of [S, ...lines, F]) boards.push(seg(pr([X, y], 1), pr([X, y], Z)))
    for (let i = 0; i < lines.length - 1; i++) {
      const top = lines[i] + 1.5, bot = lines[i + 1]
      for (let z = 1; z < Z;) {
        const z2 = Math.min(z + Math.max(0.028 + rand() * 0.04, 0.012 * z * z), Z), h = (bot - top) * (0.55 + rand() * 0.45)
        books.push(pl([pr([X, bot], z), pr([X, bot - h], z), pr([X, bot - h], z2), pr([X, bot], z2)]))
        z = z2
      }
    }
  }
  for (let t = 0; t <= 180; t += 7.5) { const a = polar(AR, t, S); vault.push(seg(pr(a, 1), pr(a, Z))) }
  const ribs = [1.35, 1.85, 2.5, 3.4, 4.6, Z].map((z) => pl(arc(pr(AC, z), AR / z, 0, Math.PI)))
  const path = [86, 114]
  for (let x = L; x <= R; x += 6.5) if (x < path[0] - 2 || x > path[1] + 2) floor.push(seg(pr([x, F], 1), pr([x, F], Z)))
  for (const z of [1.25, 1.6, 2.05, 2.65, 3.45, 4.5]) floor.push(seg(pr([L, F], z), pr([path[0], F], z)), seg(pr([path[1], F], z), pr([R, F], z)))
  const runner = [seg(pr([path[0], F], 1), pr([path[0], F], Z)), seg(pr([path[1], F], 1), pr([path[1], F], Z))]
  // Solid stone frame; the joints are cut back in the ground colour.
  const frame = `M22 198L22 88A78 78 0 0 1 178 88L178 198zM${L} ${F}L${L} ${S}A${AR} ${AR} 0 0 1 ${R} ${S}L${R} ${F}z`
  const joints: string[] = []
  for (let t = 12; t < 180; t += 12) if (Math.abs(t - 90) > 8) joints.push(seg(polar(60.5, t, S), polar(78, t, S)))
  for (const t of [83, 97]) joints.push(seg(polar(60.5, t, S), polar(86, t, S)))
  for (let y = 104; y < 188; y += 16) joints.push(seg([22, y], [L, y]), seg([R, y], [178, y]))
  joints.push(seg([22, 88], [L, 88]), seg([R, 88], [178, 88]), seg([L - 0.5, F], [R + 0.5, F]))
  const key = pl([polar(78, 83, S), polar(86, 83, S), polar(86, 97, S), polar(78, 97, S)], true)
  const far = pr(AC, Z)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><filter id="${id}w" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="0.9" xChannelSelector="R" yChannelSelector="G"/></filter></defs>
<g filter="url(#${id}w)">${stroke(vault, c.ink, 0.32)}${stroke(ribs, c.ink, 0.6)}${stroke(books, c.ink, 0.4)}${stroke(boards, c.ink, 0.75)}${stroke(floor, c.ink, 0.38)}${stroke(runner, c.ink, 0.6)}</g>
<path d="${frame}${key}" fill="${c.ink}" fill-rule="evenodd"/>${stroke(joints, c.ground, 1.1)}
<path d="${star([100, far[1] + 4], 10)}" fill="${c.accent}"/></svg>`
}

// The small doorway: three shelf rows each side running to the far door. Reads at 16px. Fills x 17-83, y 17-92 of 100x100.
const k = 0.36
const corridor = [[50, 61], [63, 73], [75, 84]].flatMap(([y0, y1]) => [33.5, 66.5].map((X) => {
  const pr = (p: P): P => [50 + (p[0] - 50) * k, 66 + (p[1] - 66) * k]
  return pl([[X, y0], pr([X, y0]), pr([X, y1]), [X, y1]], true)
})).join('')
export const door = 'M17 92L17 50A33 33 0 0 1 83 50L83 92zM31 84L31 50A19 19 0 0 1 69 50L69 84z' + corridor
export const doorStar = star([50, 64], 9, 1.2)

export const favicon = (c: { ink: string; accent: string; tile: string }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="${c.tile}"/><path d="${door}" fill="${c.ink}" fill-rule="evenodd"/><path d="${doorStar}" fill="${c.accent}"/></svg>`

// The library stamp: a rubber ownership stamp with ring lettering round the doorway, one ink, speckled and pressed slightly askew. 200x200.
export function seal(id: string, ink: string) {
  const ring = (r: number, w: number) => `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${ink}" stroke-width="${w}"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs>
<filter id="${id}s" x="-5%" y="-5%" width="110%" height="110%">
<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="9" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -5 3.3" result="m"/>
<feComposite in="SourceGraphic" in2="m" operator="in" result="s"/>
<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="2" result="w"/>
<feDisplacementMap in="s" in2="w" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>
<path id="${id}t" d="M29 100A71 71 0 0 1 171 100"/><path id="${id}b" d="M16 100A84 84 0 0 0 184 100"/></defs>
<g filter="url(#${id}s)" transform="rotate(-6 100 100)">${ring(95, 3.2)}${ring(89.5, 1)}${ring(64, 1)}${ring(60, 2.6)}
<text font-family="'Libre Caslon Display', serif" font-size="17.5" letter-spacing="2.6" fill="${ink}"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">WANDERSTACKS</textPath></text>
<text font-family="'EB Garamond', serif" font-style="italic" font-size="13.5" letter-spacing="1.4" fill="${ink}"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">standing &amp; lost</textPath></text>
<path d="${star([23.5, 100], 5.5)}${star([176.5, 100], 5.5)}" fill="${ink}"/>
<g transform="translate(55 52) scale(0.9)"><path d="${door}" fill="${ink}" fill-rule="evenodd"/><path d="${doorStar}" fill="${ink}"/></g></g></svg>`
}
