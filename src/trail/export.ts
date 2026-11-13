export interface TrailFact { text: string; sources: string[] }
export interface Trail {
  library: string
  title: string
  url: string
  camera?: string | null
  capture?: string | null
  stops: string[]
  facts: TrailFact[]
}

const save = (data: object | string, filename: string, type: string) => {
  const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'library'

export function trailFromPage(library: string): Trail {
  const room = document.querySelector<HTMLElement>('[data-view="room"]')
  return {
    library,
    title: document.querySelector('h1')?.textContent?.trim() || library,
    url: location.href,
    camera: room?.dataset.camera ?? null,
    capture: room?.dataset.captureFile ?? null,
    stops: [...document.querySelectorAll<HTMLElement>('.stops > li')].map((li) => `${li.querySelector('button')?.textContent?.trim() ?? li.dataset.node}${li.querySelector('.seen:not([hidden])') ? ' (visited)' : ''}`),
    facts: [...document.querySelectorAll<HTMLElement>('.fact')].map((fact) => ({
      text: fact.querySelector('.claim')?.textContent?.trim() ?? fact.textContent?.trim() ?? '',
      sources: [...fact.querySelectorAll<HTMLAnchorElement>('.meta a[href^="http"]')].map((a) => a.href),
    })),
  }
}

export function exportTrail(trail: Trail, format: 'markdown' | 'csl') {
  const date = new Date().toISOString().slice(0, 10)
  if (format === 'csl') {
    save([{
      id: `worldlibs-${slug(trail.library)}`,
      type: 'webpage',
      title: `${trail.title}: WorldLibs research trail`,
      URL: trail.url,
      accessed: { 'date-parts': [[...date.split('-').map(Number)]] },
      note: JSON.stringify({ camera: trail.camera, capture: trail.capture, stops: trail.stops, facts: trail.facts }),
    }], `${slug(trail.library)}-research-trail.json`, 'application/vnd.citationstyles.csl+json')
    return
  }
  const lines = [
    `# ${trail.title}: WorldLibs research trail`,
    '',
    `Library: ${trail.library}`,
    `URL: ${trail.url}`,
    `Exported: ${date}`,
    trail.capture ? `Capture: ${trail.capture}` : '',
    trail.camera ? `Camera [x,y,z]: ${trail.camera}` : '',
    '',
    '## Route and viewpoints',
    ...trail.stops.map((stop) => `- ${stop}`),
    '',
    '## Facts and sources',
    ...trail.facts.flatMap((fact) => [`- ${fact.text}`, ...fact.sources.map((source) => `  - ${source}`)]),
  ].filter(Boolean)
  save(lines.join('\n'), `${slug(trail.library)}-research-trail.md`, 'text/markdown')
}
