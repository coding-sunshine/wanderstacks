// Build-time loader for data/hotspots.json (clickable objects and readable text inside the panoramas).
import { existsSync, readFileSync } from 'node:fs'

export type Tier = 'primary' | 'secondary' | 'wikipedia' | 'unproven'
export type Basis = 'excavated' | 'attested' | 'comparandum' | 'invented'
export interface Hotspot {
  id: string; yaw: number; pitch: number; kind: 'object' | 'shelf' | 'text'
  title: string; body: string; tier: Tier; source: string
  basis?: Basis // reconstruction stops only: how far the record supports the thing shown
  text?: { original: string; lang: string; translation: string }
}
export interface LibHotspots { route?: string[]; nodes: Record<string, Hotspot[]> }

export const hotspots: Record<string, LibHotspots> = existsSync('data/hotspots.json') ? JSON.parse(readFileSync('data/hotspots.json', 'utf8')) : {}
export const hotspotsOf = (lib?: string) => (lib ? hotspots[lib] : undefined)
