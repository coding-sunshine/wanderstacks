import { readFileSync } from 'node:fs'
import { libs, photos, spheres, booksOf } from './data'

export interface ExternalTour {
  id: string; lib: string; title: string; url: string; provider: string; official: boolean
  kind: '360' | '3d' | 'digital-twin' | 'video'; scope: 'interior' | 'exterior' | 'mixed'
  checked: string; note: string
}
export interface CaptureCandidate {
  id: string; lib: string; title: string; kind: 'mesh' | 'point-cloud'
  scope: 'interior' | 'exterior' | 'interior-detail' | 'unknown'
  status: 'candidate' | 'review' | 'permission-required' | 'ready'
  by: string; lic: string; src: string; download: string | null
  photos: number | null; triangles: number | null; note: string
  f?: string; bytes?: number; align?: { position: [number, number, number]; rotation: [number, number, number]; scale: number }
}

export const tours = JSON.parse(readFileSync('data/tours.json', 'utf8')) as ExternalTour[]
export const captures = JSON.parse(readFileSync('data/captures.json', 'utf8')) as CaptureCandidate[]
export const toursOf = (id: string) => tours.filter((t) => t.lib === id)
export const capturesOf = (id: string) => captures.filter((c) => c.lib === id)

export function coverageOf(id: string) {
  const nodes = spheres[id]?.nodes ?? []
  const interior = nodes.filter((n) => n.real && n.kind === 'interior').length
  const exterior = nodes.filter((n) => n.real && n.kind === 'exterior').length
  const reconstruction = nodes.filter((n) => !n.real).length
  const linked = toursOf(id)
  const captured = capturesOf(id).some((c) => c.status === 'ready' && c.scope === 'interior')
  const label = captured ? 'Real captured 3D'
    : interior ? 'Real interior 360'
      : exterior ? 'Real exterior 360'
        : linked.some((t) => t.scope === 'interior' || t.scope === 'mixed') ? 'Official or linked tour'
          : reconstruction ? 'Reconstruction' : 'Photographs'
  return { interior, exterior, reconstruction, linked, label }
}

export const coverageRows = () => libs.map((lib) => ({
  lib,
  coverage: coverageOf(lib.id),
  captures: capturesOf(lib.id),
  books: booksOf(lib.id).length,
  photographs: (photos[lib.id]?.in.length ?? 0) + (photos[lib.id]?.out.length ?? 0),
}))
