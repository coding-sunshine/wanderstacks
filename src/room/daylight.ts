import type { Vector3 } from 'three'

export type Place = 'inside' | 'outside' | 'site'

const DEG = 180 / Math.PI

// v is a sunLocal vector: x east, y up, z south.
export function sunAngles(v: Vector3) {
  return { alt: Math.asin(Math.max(-1, Math.min(1, v.y))) * DEG, az: (Math.atan2(v.x, -v.z) * DEG + 360) % 360 }
}

export function daylight({ alt }: { alt: number }, cloud: number, place: Place) {
  const c = Math.max(0, Math.min(100, cloud)) / 100
  return {
    sky: alt > 0 ? 'day' : alt >= -6 ? 'twilight' : 'night',
    lamps: alt < -4 ? 'on' : 'off',
    beams: alt > 0 && cloud < 70 && place === 'inside' ? 'on' : 'off',
    // Sun light factor 0..1: rises with the sine of altitude (saturating near 42 deg), cloud takes up to 60%.
    key: Math.max(0, Math.min(1, Math.sin(alt / DEG) * 1.5)) * (1 - 0.6 * c),
  }
}
