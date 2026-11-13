import type { RoomApi } from './kit'
import { exportTrail } from '../trail/export'

export function attach(api: RoomApi): () => void {
  const button = document.createElement('button')
  button.type = 'button'
  button.dataset.action = 'research-trail'
  button.textContent = 'Research trail'
  api.controls.append(button)
  button.onclick = () => exportTrail({
    library: api.lib.id,
    title: api.lib.name,
    url: location.href,
    camera: api.root.dataset.camera ?? null,
    capture: api.root.dataset.captureFile ?? null,
    stops: [...api.lib.tour?.stops ?? []].map((stop, index) => `Tour stop ${index + 1}: ${JSON.stringify(stop.at)}`),
    facts: api.lib.facts.map((fact) => ({ text: `${fact.field}: ${fact.value}`, sources: [fact.source] })),
  }, 'markdown')
  return () => button.remove()
}
