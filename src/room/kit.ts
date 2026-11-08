import type * as THREE from 'three'
import type { Library } from '../types'

export interface KitCtx {
  lib: Library
  scene: THREE.Scene
  own<T extends { dispose(): void }>(x: T): T
  dirty(): void
  reduced: boolean
}

/** Where a pickable book stands: floor point `at`, `out` is the horizontal unit vector the spine faces. */
export interface SpineSlot {
  at: [number, number, number]
  out: [number, number]
}

export interface Built {
  core: THREE.Object3D
  parts: Partial<Record<string, THREE.Object3D[]>>
  start: { pos: [number, number, number]; yaw: number }
  clamp(p: THREE.Vector3): void
  acoustics: { volume: number; surfaces: { material: string; area: number }[] }
  ready: Promise<void>
  dispose?(): void
  /** One stand per shelf entry, in shelf order; absent in rooms with nothing to pick. */
  spineSlots?(n: number): SpineSlot[]
  /** Progress line while the room is still filling in; null once complete. */
  status?(): string | null
}

export interface KitModule {
  params: [key: string, name: string, unit: string][]
  build(ctx: KitCtx): Built
}

export interface RoomApi {
  root: HTMLElement
  lib: Library
  controls: HTMLElement
  panel: HTMLElement
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  canvas: HTMLCanvasElement
  core: THREE.Object3D
  parts: Built['parts']
  acoustics: Built['acoustics']
  params: KitModule['params']
  reduced: boolean
  goTo(at: [number, number, number], look: [number, number, number], ms?: number): Promise<void>
  clamp(p: THREE.Vector3): void
  slots?: Built['spineSlots']
  /** Canvas tap hooks; the first to return true swallows the tap (no walk). */
  taps: ((e: PointerEvent) => boolean)[]
  render(): void
}

export function hash(s: string) {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return h >>> 0
}
