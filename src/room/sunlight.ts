import * as THREE from 'three'
import { sunLocal } from '../globe/geo'
import { daylight, sunAngles, type Place } from './daylight'
import type { RoomApi } from './kit'
import { precip } from './precip'
import { describe, localLine, precipOf, weatherAt, type Weather } from './weather'

const TICK = 30_000
const REFETCH = 15 * 60_000
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const c = (n: number) => new THREE.Color(n)

const NIGHT_SKY = c(0x070b16), DUSK = c(0x4a4358), DAY_SKY = c(0xa9c1d9), GREY = c(0x8d949c)
const HEMI_NIGHT = c(0x5a70b0), HEMI_DAY = c(0xffe2b0)
const SUN_LOW = c(0xff9a4a), SUN_HIGH = c(0xffe7b8)
const GLOW_NIGHT = c(0x16203a), GLOW_DAY = c(0xfff0c8)

// Sets the sun, sky, weather and lamp state hooks on the room root and drives the kit lights from them.
export function attach(api: RoomApi): () => void {
  const { root, lib, scene } = api
  const lights = api.lights
  const base = {
    hemi: lights?.hemi.intensity ?? 0,
    sun: lights?.sun?.intensity ?? 0,
    point: lights?.point?.intensity ?? 0,
    lamp: api.lamp?.intensity ?? 0,
    beam: lights?.beam?.opacity ?? 0,
  }
  const fog = scene.fog instanceof THREE.FogExp2 ? scene.fog : null
  const bg0 = scene.background instanceof THREE.Color ? scene.background.clone() : null
  const fog0 = fog ? { color: fog.color.clone(), density: fog.density } : null

  if (!root.dataset.place) root.dataset.place = lib.kit === 'site' ? 'site' : 'inside'
  const placeOf = (): Place => (root.dataset.place === 'outside' || root.dataset.place === 'site' ? root.dataset.place : 'inside')

  const strip = document.createElement('p')
  strip.className = 'room-local'
  strip.dataset.local = ''
  const text = document.createElement('span')
  text.dataset.localText = ''
  const src = document.createElement('span')
  const link = document.createElement('a')
  link.href = 'https://open-meteo.com/'
  link.target = '_blank'
  link.rel = 'noopener'
  link.textContent = 'Open-Meteo'
  src.append(' · ', link, ' · CC BY 4.0')
  strip.append(text, src)
  root.append(strip)

  let wx: Weather | null = null
  let settled = false
  let wxAt = 0
  let dead = false
  let sky: import('three/examples/jsm/objects/Sky.js').Sky | null = null
  let skyAsked = false

  const rain = precip(api, (n) => (root.dataset.particles = String(n)))
  root.dataset.particles = '0'

  const load = () => {
    wxAt = Date.now()
    weatherAt(lib.lat, lib.lon).then((w) => {
      if (dead) return
      wx = w
      settled = true
      root.dataset.weather = w ? describe(w.code) : 'unknown'
      root.dataset.cloud = String(w ? Math.round(w.cloud) : 0)
      root.dataset.precip = w ? precipOf(w.code) : 'none'
      refresh()
    })
  }

  function ensureSky() {
    if (skyAsked) return
    skyAsked = true
    import('three/examples/jsm/objects/Sky.js').then(({ Sky }) => {
      if (dead) return
      sky = new Sky()
      sky.scale.setScalar(90)
      sky.frustumCulled = false
      sky.renderOrder = -1
      sky.visible = false
      // Keep the dome centred on the camera so it never gets close.
      sky.onBeforeRender = (_r, _s, cam) => (sky!.position.copy(cam.position), sky!.updateMatrixWorld())
      scene.add(sky)
      refresh()
    })
  }

  function refresh() {
    const now = new Date()
    const v = sunLocal(lib.lat, lib.lon, now)
    const s = sunAngles(v)
    const cloud = settled ? (wx ? Math.round(wx.cloud) : 0) : 0
    const place = placeOf()
    const d = daylight(s, cloud, place)
    const r1 = (n: number) => Number(n.toFixed(1))
    root.dataset.sun = JSON.stringify({ alt: r1(s.alt), az: r1(s.az) % 360 })
    root.dataset.sky = d.sky
    root.dataset.lamps = d.lamps
    root.dataset.beams = d.beams
    text.textContent = localLine(wx, lib.lon, now)

    const cl = cloud / 100
    const amb = clamp((s.alt + 8) / 22)
    const dark = clamp((2 - s.alt) / 8)
    if (lights) {
      lights.hemi.intensity = base.hemi * (0.45 + 2.5 * amb * (1 - 0.25 * cl))
      lights.hemi.color.lerpColors(HEMI_NIGHT, HEMI_DAY, amb)
      if (lights.sun) {
        lights.sun.visible = d.key > 0
        lights.sun.intensity = base.sun * 8 * d.key
        lights.sun.position.copy(v).multiplyScalar(30)
        lights.sun.color.lerpColors(SUN_LOW, SUN_HIGH, clamp(s.alt / 25))
      }
      if (lights.point) lights.point.intensity = base.point * (0.25 + 0.75 * amb * (1 - 0.3 * cl))
      if (lights.glow) lights.glow.color.lerpColors(GLOW_NIGHT, GLOW_DAY, amb * (1 - 0.3 * cl))
      if (lights.beam) {
        lights.beam.visible = d.beams === 'on'
        lights.beam.opacity = base.beam * clamp(d.key * 1.5)
      }
    }
    if (api.lamp) api.lamp.intensity = base.lamp * (0.06 + 2.9 * dark)

    // Outdoors: Preetham sky by day, a flat dark blue by night; fog and clear colour match the haze.
    const out = place !== 'inside'
    if (out) {
      const haze = new THREE.Color().lerpColors(NIGHT_SKY, DUSK, clamp(amb * 2))
      if (amb > 0.5) haze.lerpColors(DUSK, DAY_SKY, (amb - 0.5) * 2)
      haze.lerp(GREY.clone().multiplyScalar(0.15 + 0.85 * amb), cl * 0.6)
      scene.background = haze
      if (fog) (fog.color.copy(haze), (fog.density = fog0!.density * 0.5))
      const showSky = s.alt > -9
      if (showSky) ensureSky()
      if (sky) {
        sky.visible = showSky
        const u = sky.material.uniforms
        u.sunPosition!.value.copy(v)
        u.turbidity!.value = 4 + 14 * cl
        u.rayleigh!.value = 1.6 - 1.3 * cl
        u.mieCoefficient!.value = 0.004 + 0.03 * cl
        u.mieDirectionalG!.value = 0.8
      }
    } else {
      if (sky) sky.visible = false
      if (bg0) scene.background = bg0.clone()
      if (fog && fog0) (fog.color.copy(fog0.color), (fog.density = fog0.density))
    }

    const precipKind = settled && wx ? precipOf(wx.code) : 'none'
    rain.set(out ? precipKind : 'none')
    api.shadows?.()
    api.render()
  }

  const tick = () => {
    if (settled && Date.now() - wxAt >= REFETCH) load()
    refresh()
  }
  load()
  refresh()
  const timer = setInterval(tick, TICK)
  const mo = new MutationObserver(refresh)
  mo.observe(root, { attributes: true, attributeFilter: ['data-place'] })

  return () => {
    dead = true
    clearInterval(timer)
    mo.disconnect()
    rain.dispose()
    if (sky) {
      scene.remove(sky)
      sky.geometry.dispose()
      sky.material.dispose()
    }
    strip.remove()
  }
}
