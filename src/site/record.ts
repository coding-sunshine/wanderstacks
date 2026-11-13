// Sourced record for the library pages, the open-data release and the calendar.
// Reads data/facts.json itself so quotes and dates survive (src/site/data.ts drops them).
import { existsSync, readFileSync } from 'node:fs'
import type { Lib } from './data'

export const LICENCE = 'https://creativecommons.org/licenses/by/4.0/'
export const SITE = 'https://wanderstacks.com'
export const REPO = 'https://github.com/coding-sunshine/wanderstacks'

export interface Fact { id: string; lib: string; field: string; value: string; source: string; tier: string; quote?: string; earliest?: number; latest?: number }
export interface Ev { id: string; lib: string; kind: string; year: number | null; label: string; source: string; tier: string; quote?: string; earliest?: number; latest?: number }

const p = 'data/facts.json'
const raw = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : { facts: [], events: [], generated: '' }
const ok = (x: { status?: string }) => x.status !== 'failing'

// Anchors come from the claim itself, so they survive reordering of the data.
const hash = (s: string) => {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.codePointAt(0)!, 16777619)
  return (h >>> 0).toString(36).padStart(7, '0')
}
const pick = <T extends object>(x: any, keys: string[]): T => Object.fromEntries(keys.filter((k) => x[k] != null && x[k] !== '').map((k) => [k, x[k]])) as T

export const generated: string = raw.generated
export const checked = generated.slice(0, 10)
export const facts: Fact[] = raw.facts.filter(ok).map((x: any) =>
  ({ id: 'f-' + hash(`${x.lib}|${x.field}|${x.value}|${x.source}`), ...pick(x, ['lib', 'field', 'value', 'source', 'tier', 'quote', 'earliest', 'latest']) }))
export const events: Ev[] = raw.events.filter(ok).map((x: any) =>
  ({ id: 'e-' + hash(`${x.lib}|${x.kind}|${x.year}|${x.label}|${x.source}`), year: x.year ?? null, ...pick(x, ['lib', 'kind', 'label', 'source', 'tier', 'quote', 'earliest', 'latest']) }))

export const factsFor = (id: string) => facts.filter((x) => x.lib === id)
export const eventsFor = (id: string) => events.filter((x) => x.lib === id).sort((a, b) => (a.year ?? 0) - (b.year ?? 0))

export const fieldLabel: Record<string, string> = {
  notable: 'worth knowing', place: 'location', built: 'built', architect: 'architect', dims: 'size', volumes: 'volumes', collection: 'collection',
  remains_today: 'what remains', status_note: 'status today', recon: 'reconstruction',
}
export const yr = (y: number) => (y < 0 ? `${-y} BC` : String(y))
export const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return u } }
export const libUrl = (id: string, anchor = '') => `${SITE}/libraries/${id}/${anchor ? '#' + anchor : ''}`

/** One self-contained line that names its library, so it reads right when quoted alone. */
export const sentence = (name: string, lead: string, text: string) => `${name}, ${lead}: ${text}`

export function cite(c: { name: string; lead: string; text: string; source: string; tier: string; url: string }) {
  return [
    sentence(c.name, c.lead, c.text),
    `Source: ${c.source || 'none given'}`,
    `Evidence tier: ${c.tier}`,
    `Last checked: ${checked}`,
    `Wanderstacks: ${c.url}`,
  ].join('\n')
}

export function disputeUrl(c: { name: string; lead: string; text: string; source: string; tier: string; url: string }) {
  const body = [
    `Claim: ${sentence(c.name, c.lead, c.text)}`,
    `Current source: ${c.source || 'none given'}`,
    `Evidence tier: ${c.tier}`,
    `Fact: ${c.url}`,
    '',
    'What is wrong, and a source that shows it:',
    '',
  ].join('\n')
  return `${REPO}/issues/new?` + new URLSearchParams({ title: `Dispute: ${c.name}, ${c.lead}`, body }).toString().replace(/\+/g, '%20')
}

const iso = (y: number | null) => (y != null && y > 0 ? String(y).padStart(4, '0') : undefined)
/** schema.org entry for one library; lost ones are historical landmarks, not working libraries. */
export function libLd(l: Lib, evs: Ev[]) {
  const founded = ['founded', 'opened', 'built'].map((k) => evs.find((e) => e.kind === k)).find(Boolean)
  const gone = l.tier === 'lost'
  return {
    '@type': gone ? 'LandmarksOrHistoricalBuildings' : 'Library',
    '@id': libUrl(l.id),
    url: libUrl(l.id),
    name: l.n,
    address: l.p,
    geo: { '@type': 'GeoCoordinates', latitude: l.lat, longitude: l.lon },
    ...(l.wd ? { sameAs: [`https://www.wikidata.org/entity/${l.wd}`] } : {}),
    ...(!gone && iso(founded?.year ?? null) ? { foundingDate: iso(founded!.year) } : {}),
  }
}

export const crumbs = (l: Lib) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [['Wanderstacks', `${SITE}/`], ['Libraries', `${SITE}/libraries/`], [l.n, libUrl(l.id)]].map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
})

/** Calendar groups: the kinds of event worth putting on one timeline. */
export const groups: Record<string, string[]> = {
  closures: ['closed', 'sealed'], reopenings: ['reopened'], damage: ['damaged'], destruction: ['destroyed', 'lost'], rebuilding: ['rebuilt'],
}
export const groupOf = (kind: string) => Object.keys(groups).find((g) => groups[g].includes(kind))
