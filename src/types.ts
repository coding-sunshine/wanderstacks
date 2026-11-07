export type Basis = 'measured' | 'photo-estimate' | 'excavated' | 'attested' | 'comparandum' | 'invented'

export interface Param<T> {
  v: T
  basis: Basis
  src: string
  building?: string
}

export type Vault = 'barrel' | 'dome' | 'flat' | 'coffered'

export interface Hall {
  length: Param<number>
  width: Param<number>
  height: Param<number>
  storeys: Param<number>
  baysPerSide: Param<number>
  alcoveDepth: Param<number>
  galleryHeight: Param<number>
  vault: Param<Vault>
  domes: Param<number>
  windows: Param<number>
  shelfUnit: Param<{ width: number; shelves: number }>
  wood: Param<string>
  floor: Param<string>
  light: Param<string>
  domeHeight?: Param<number>
}

export interface Rotunda {
  span: Param<number>
  domeHeight: Param<number>
  crownHeight: Param<number>
  sides: Param<number>
  alcoveDepth: Param<number>
  alcoveWidth: Param<number>
  piers: Param<number>
  plinthHeight: Param<number>
  galleryHeight: Param<number>
  shelfUnit: Param<{ width: number; shelves: number }>
  materials: Param<string>
}

export interface Site {
  length: Param<number>
  depth: Param<number>
  height: Param<number>
  nicheHeight: Param<number>
  nicheWidth: Param<number>
  niches: Param<number>
  storeys: Param<number>
  roof: Param<string>
}

export type KitId = 'hall' | 'rotunda' | 'site'

export function basisLabel(p: Param<unknown>): string | null {
  switch (p.basis) {
    case 'photo-estimate': return 'estimated'
    case 'attested': return 'described in sources'
    case 'comparandum': return `based on ${p.building ?? 'a comparable building'}`
    case 'invented': return 'reconstruction'
    case 'measured':
    case 'excavated': return null
  }
}

export interface Fact {
  lib: string
  field: string
  value: string
  tier: string
  source: string
}

export interface Shelf {
  id: string
  title: string
  author: string | null
  tier: 'readable-text' | 'catalog'
  shelfmark: string | null
  url: string | null
  note: string | null
}

export interface Credit {
  file: string
  author: string
  licence: string
  url: string
}

export interface TourStop {
  fact: number
  at: [number, number, number]
  look: [number, number, number]
}

interface LibraryBase {
  id: string
  wd: string
  name: string
  place: string
  years: string
  facts: Fact[]
  shelves: Shelf[]
  credits: Credit[]
  reconstruction?: boolean
  tour?: { stops: TourStop[] }
}

export type Library = LibraryBase &
  ({ kit: 'hall'; hall: Hall } | { kit: 'rotunda'; hall: Rotunda } | { kit: 'site'; hall: Site })

export interface BookMeta {
  id: string
  title: string
  author: string | null
  edition: string
  licence: string
  source: string
  parts: number
  toc: { title: string; part: number }[]
}

export interface BookPart {
  book: string
  part: number
  of: number
  chapters: { title: string; html: string }[]
}

export type Mount = (el: HTMLElement, params: Record<string, string>) => (() => void) | void
