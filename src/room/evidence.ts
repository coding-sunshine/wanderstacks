import * as THREE from 'three'
import { basisLabel, type Basis, type Param } from '../types'
import type { RoomApi } from './kit'

const TINT: Record<Basis, number> = {
  measured: 0x3f9d6a, excavated: 0x2f8f9d, 'photo-estimate': 0xd9a431, attested: 0x4a78c8, comparandum: 0x8a5cc8, invented: 0xc84a4a,
}
const css = (e: HTMLElement, s: string) => (e.style.cssText = s)
const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

function show(v: unknown, unit: string) {
  if (v && typeof v === 'object') {
    const u = v as { width: number; shelves: number }
    return `${u.width} m wide, ${u.shelves} shelves`
  }
  return `${v}${unit}`
}

export function attach(api: RoomApi): () => void {
  const hall = api.lib.hall as unknown as Record<string, Param<unknown> | undefined>
  const keys = Object.keys(api.parts)
  const keyOf = new Map<THREE.Object3D, string>()
  const index = () => {
    keyOf.clear()
    for (const k of keys) for (const o of api.parts[k] ?? []) o.traverse((m) => keyOf.has(m) || keyOf.set(m, k))
  }

  const button = document.createElement('button')
  button.type = 'button'
  button.dataset.action = 'evidence'
  button.setAttribute('aria-pressed', 'false')
  button.textContent = 'Evidence'
  api.controls.append(button)

  let box: HTMLElement | null = null
  let info: HTMLElement | null = null
  const saved = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>()
  const tints = new Map<string, THREE.Material>()

  const choose = (key: string) => {
    const p = hall[key]
    if (!box || !p) return
    info?.remove()
    const name = api.params.find(([k]) => k === key)
    info = document.createElement('div')
    info.dataset.elementInfo = ''
    info.dataset.basis = p.basis
    info.setAttribute('role', 'status')
    css(info, 'margin-top:0.5rem;padding-top:0.4rem;border-top:1px solid var(--oak-light)')
    const text = document.createElement('p')
    text.style.margin = '0'
    text.textContent = `${name?.[1] ?? key}: ${show(p.v, name?.[2] ?? '')}. Basis: ${basisLabel(p) ?? p.basis}. `
    info.append(text)
    if (p.src.startsWith('http')) {
      const a = document.createElement('a')
      a.href = p.src
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.textContent = 'Source'
      text.append(a)
    } else text.append(p.src)
    box.append(info)
    box.querySelectorAll('[data-element]').forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-element') === key)))
  }

  const tint = (basis: Basis, side: THREE.Side) => {
    const id = `${basis}${side}`
    let m = tints.get(id)
    if (!m) tints.set(id, (m = new THREE.MeshLambertMaterial({ color: TINT[basis], side })))
    return m
  }

  const paint = () => {
    for (const [mesh, key] of keyOf) {
      const p = hall[key]
      if (!(mesh instanceof THREE.Mesh) || !p) continue
      saved.set(mesh, mesh.material)
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map((m) => tint(p.basis, m.side)) : tint(p.basis, mesh.material.side)
    }
  }

  const unpaint = () => {
    saved.forEach((m, mesh) => (mesh.material = m))
    saved.clear()
    tints.forEach((m) => m.dispose())
    tints.clear()
  }

  const open = () => {
    box = document.createElement('div')
    box.dataset.evidencePanel = ''
    css(box, ['flex:1 1 100%;box-sizing:border-box;max-height:40vh;overflow-y:auto;padding:0.5rem 0.7rem', 'background:rgba(14,11,8,0.9);border:1px solid var(--oak-light);color:var(--paper);font-size:0.9rem'].join(';'))

    const legend = document.createElement('ul')
    legend.dataset.legend = ''
    css(legend, 'margin:0 0 0.5rem;padding:0;list-style:none')
    const seen = new Set<Basis>()
    for (const p of Object.values(hall)) {
      if (!p || seen.has(p.basis)) continue
      seen.add(p.basis)
      const li = document.createElement('li')
      li.dataset.basis = p.basis
      const sw = document.createElement('span')
      css(sw, `display:inline-block;width:0.8rem;height:0.8rem;margin-right:0.4rem;` + `background:${hex(TINT[p.basis])}`)
      li.append(sw, basisLabel(p) ?? p.basis)
      legend.append(li)
    }
    box.append(legend)

    const list = document.createElement('div')
    css(list, 'display:flex;flex-wrap:wrap;gap:0.3rem')
    for (const k of keys) {
      const b = document.createElement('button')
      b.type = 'button'
      b.dataset.element = k
      b.setAttribute('aria-pressed', 'false')
      b.textContent = api.params.find(([key]) => key === k)?.[1] ?? k
      b.onclick = () => choose(k)
      list.append(b)
    }
    box.append(list)
    api.controls.append(box)
    index()
    paint()
    api.root.dataset.evidence = 'on'
    api.render()
  }

  const close = () => {
    unpaint()
    box?.remove()
    box = info = null
    api.root.dataset.evidence = 'off'
    api.render()
  }

  button.onclick = () => {
    const on = button.getAttribute('aria-pressed') !== 'true'
    button.setAttribute('aria-pressed', String(on))
    on ? open() : close()
  }

  const ray = new THREE.Raycaster()
  let down: { x: number; y: number; t: number } | null = null
  const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY, t: e.timeStamp })
  const onUp = (e: PointerEvent) => {
    const d = down
    down = null
    if (!box || !d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6 || e.timeStamp - d.t > 400) return
    const r = api.canvas.getBoundingClientRect()
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)), api.camera)
    const hit = ray.intersectObject(api.core, true).find((h) => keyOf.has(h.object))
    if (hit) choose(keyOf.get(hit.object)!)
  }
  api.canvas.addEventListener('pointerdown', onDown)
  api.canvas.addEventListener('pointerup', onUp)

  return () => {
    api.canvas.removeEventListener('pointerdown', onDown)
    api.canvas.removeEventListener('pointerup', onUp)
    unpaint()
    box?.remove()
    button.remove()
    api.root.dataset.evidence = 'off'
  }
}
