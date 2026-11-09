export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
export const smooth = (a: number, b: number, x: number) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x) }
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
// keep horizontal coverage on tall screens: widen vertical fov below the reference aspect
export const fitFov = (base: number, aspect: number, ref: number, cap = 92) =>
  aspect >= ref ? base : Math.min(cap, 2 * Math.atan(Math.tan(base * Math.PI / 360) * ref / aspect) * 180 / Math.PI)
export const rng = (s: number) => () => {
  s = (s + 0x6d2b79f5) | 0
  let t = Math.imul(s ^ (s >>> 15), 1 | s)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
export const MOBILE = matchMedia('(max-width: 760px), (pointer: coarse)').matches
export const RM = matchMedia('(prefers-reduced-motion: reduce)')
export const canvas = (w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!]
}
// shader tail shared by custom materials: renderer applies tone map + sRGB only when drawing straight to screen
export const TAIL = '#include <tonemapping_fragment>\n#include <colorspace_fragment>\n'
