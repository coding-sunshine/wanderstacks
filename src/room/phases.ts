import * as THREE from 'three'
import phases from '../../data/phases.json'
import type { RoomApi } from './kit'

type Phase = { id: string; year: number; label: string; action: 'flat-ceiling' | 'barrel-vault'; height: number; basis: string; source: string; note: string }

export function attach(api: RoomApi): () => void {
  const entries = (phases as Record<string, Phase[]>)[api.lib.id]
  if (!entries?.length) return () => {}
  const button = document.createElement('button')
  button.type = 'button'
  button.dataset.action = 'phases'
  button.setAttribute('aria-expanded', 'false')
  button.textContent = 'Time phases'
  api.controls.append(button)
  let box: HTMLElement | null = null
  let flat: THREE.Mesh | null = null
  let geometry: THREE.PlaneGeometry | null = null
  let material: THREE.MeshLambertMaterial | null = null
  let current = entries[entries.length - 1]
  const length = Number((api.lib.hall as any).length.v)
  const width = Number((api.lib.hall as any).width.v)
  const springing = Number((api.lib.hall as any).storeys.v) * Number((api.lib.hall as any).galleryHeight.v)
  const originalHeight = Number((api.lib.hall as any).height.v)

  const apply = (phase: Phase) => {
    const previous = current
    current = phase
    const camera = api.camera.position.clone()
    const yaw = api.root.dataset.yaw
    const oldHeight = previous?.height ?? originalHeight
    for (const wall of api.parts.length ?? []) wall.scale.y = phase.height / oldHeight
    if (phase.action === 'flat-ceiling') {
      for (const vault of api.parts.vault ?? []) vault.visible = false
      if (!flat) {
        geometry = new THREE.PlaneGeometry(width, length)
        material = new THREE.MeshLambertMaterial({ color: 0xc8bca4, side: THREE.DoubleSide })
        flat = new THREE.Mesh(geometry, material)
        flat.rotation.x = Math.PI / 2
        api.core.add(flat)
      }
      flat.position.y = Math.max(springing, phase.height - 0.05)
      flat.visible = true
    } else {
      for (const vault of api.parts.vault ?? []) vault.visible = true
      if (flat) flat.visible = false
    }
    api.camera.position.copy(camera)
    api.root.dataset.yaw = yaw ?? ''
    api.root.dataset.phase = phase.id
    const label = box?.querySelector<HTMLOutputElement>('output')
    if (label) label.textContent = phase.label
    const note = box?.querySelector<HTMLElement>('[data-phase-note]')
    if (note) note.textContent = phase.note
    api.shadows?.()
    api.render()
  }

  const open = () => {
    box = document.createElement('section')
    box.dataset.phasePanel = ''
    box.setAttribute('aria-label', 'Architectural phases')
    box.style.cssText = 'flex:1 1 100%;box-sizing:border-box;padding:0.7rem;background:rgba(14,11,8,0.94);border:1px solid var(--oak-light);color:var(--paper)'
    const title = document.createElement('h2')
    title.textContent = 'Same viewpoint, different years'
    const output = document.createElement('output')
    output.textContent = current.label
    const input = document.createElement('input')
    input.type = 'range'
    input.min = '0'
    input.max = String(entries.length - 1)
    input.step = '1'
    input.value = String(entries.length - 1)
    input.setAttribute('aria-label', 'Architectural phase')
    const note = document.createElement('p')
    note.dataset.phaseNote = ''
    note.textContent = current.note
    const source = document.createElement('a')
    source.href = current.source
    source.target = '_blank'
    source.rel = 'noopener noreferrer'
    source.textContent = 'Source'
    input.addEventListener('input', () => {
      const phase = entries[Number(input.value)]!
      apply(phase)
      source.href = phase.source
    })
    box.append(title, output, input, note, source)
    api.controls.append(box)
    button.setAttribute('aria-expanded', 'true')
  }
  const close = () => {
    box?.remove()
    box = null
    button.setAttribute('aria-expanded', 'false')
  }
  button.onclick = () => box ? close() : open()
  return () => {
    close()
    apply(entries[entries.length - 1]!)
    if (flat) {
      flat.removeFromParent()
      geometry?.dispose()
      material?.dispose()
    }
    button.remove()
    delete api.root.dataset.phase
  }
}
