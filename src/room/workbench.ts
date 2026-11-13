import * as THREE from 'three'
import type { Param } from '../types'
import type { RoomApi } from './kit'

const scales = new WeakMap<HTMLElement, THREE.Vector3>()
const dimensions = new Set(['length', 'width', 'height', 'domeHeight'])

export function resetWorkbench(api: RoomApi) {
  scales.get(api.root) && api.core.scale.copy(scales.get(api.root)!)
  api.root.querySelector('.workbench')?.remove()
  delete api.root.dataset.preview
}

export function showWorkbench(api: RoomApi, key: string, host: HTMLElement) {
  resetWorkbench(api)
  if (!scales.has(api.root)) scales.set(api.root, api.core.scale.clone())
  const hall = api.lib.hall as unknown as Record<string, Param<unknown>>
  const param = hall[key]
  if (!param) return
  const section = document.createElement('details')
  section.className = 'workbench'
  const summary = document.createElement('summary')
  summary.textContent = 'Propose a sourced correction'
  const current = document.createElement('p')
  current.textContent = `Current: ${JSON.stringify(param.v)} · ${param.basis}`
  const valueLabel = document.createElement('label')
  valueLabel.textContent = 'Proposed value'
  const value = document.createElement('input')
  value.value = typeof param.v === 'number' ? String(param.v) : JSON.stringify(param.v)
  const sourceLabel = document.createElement('label')
  sourceLabel.textContent = 'Evidence URL'
  const source = document.createElement('input')
  source.type = 'url'
  source.value = param.src.startsWith('http') ? param.src : ''
  const noteLabel = document.createElement('label')
  noteLabel.textContent = 'Why this correction is needed'
  const note = document.createElement('textarea')
  note.rows = 3
  const actions = document.createElement('p')
  actions.className = 'workbench-actions'
  const preview = document.createElement('button')
  preview.type = 'button'
  preview.textContent = 'Preview and reset'
  preview.disabled = !dimensions.has(key) || typeof param.v !== 'number'
  const download = document.createElement('button')
  download.type = 'button'
  download.textContent = 'Download paradata'
  const issue = document.createElement('button')
  issue.type = 'button'
  issue.textContent = 'Open issue draft'
  actions.append(preview, download, issue)
  const status = document.createElement('p')
  status.setAttribute('role', 'status')
  section.append(summary, current, valueLabel, value, sourceLabel, source, noteLabel, note, actions, status)
  host.append(section)

  const proposal = () => ({
    '@context': 'https://schema.org/',
    '@type': 'CreativeWork',
    about: `WorldLibs ${api.lib.id} reconstruction`,
    library: api.lib.id,
    element: key,
    current: { value: param.v, basis: param.basis, source: param.src },
    proposed: { value: typeof param.v === 'number' ? Number(value.value) : value.value, source: source.value, rationale: note.value },
    previewScale: api.core.scale.toArray(),
    exportedAt: new Date().toISOString(),
    url: location.href,
  })
  const valid = () => {
    if (!source.value.startsWith('https://')) {
      status.textContent = 'Add an HTTPS evidence source before exporting a correction.'
      return false
    }
    if (typeof param.v === 'number' && !(Number(value.value) > 0)) {
      status.textContent = 'The proposed dimension must be greater than zero.'
      return false
    }
    return true
  }
  preview.onclick = () => {
    if (!valid()) return
    if (api.root.dataset.preview === key) {
      resetWorkbench(api)
      return
    }
    const next = Number(value.value)
    const base = param.v as number
    const initial = scales.get(api.root)!
    api.core.scale.copy(initial)
    if (key === 'length') api.core.scale.z = initial.z * next / base
    else if (key === 'width') api.core.scale.x = initial.x * next / base
    else api.core.scale.y = initial.y * next / base
    api.root.dataset.preview = key
    preview.textContent = 'Reset preview'
    status.textContent = `Previewing ${key} ${base} → ${next}. The source data is unchanged.`
    api.shadows?.()
    api.render()
  }
  download.onclick = () => {
    if (!valid()) return
    const blob = new Blob([JSON.stringify(proposal(), null, 2)], { type: 'application/ld+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${api.lib.id}-${key}-correction.json`
    a.click()
    URL.revokeObjectURL(url)
    status.textContent = 'Downloaded the proposal and its evidence trail.'
  }
  issue.onclick = () => {
    if (!valid()) return
    const q = new URLSearchParams({
      title: `Reconstruction correction: ${api.lib.id} / ${key}`,
      body: `\`\`\`json\n${JSON.stringify(proposal(), null, 2)}\n\`\`\``,
    })
    window.open(`https://github.com/coding-sunshine/worldlibs/issues/new?${q}`, '_blank', 'noopener,noreferrer')
  }
}
