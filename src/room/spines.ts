import * as THREE from 'three'
import { hash, type RoomApi } from './kit'

const PALETTE = [0x5c3320, 0x40201a, 0x73241a, 0x243326, 0x292b42, 0x8c6b42, 0xb39e73, 0x4d4333]
const FACE = 0.27 // spine face distance from the stand, along `out`
const BOOK_Y = 1.465 // spine centre height
const DIST = 2.4 // viewing distance from the spine face

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, string> = {}, ...kids: (Node | string)[]) {
  const e = document.createElement(tag)
  for (const [k, v] of Object.entries(props)) e.setAttribute(k, v)
  e.append(...kids)
  return e
}

/** Pickable book spines on stands, the find buttons that walk to them, and the dialog that pulls one. */
export function attach(api: RoomApi) {
  const { root, lib, canvas, camera, panel, scene } = api
  const slots = api.slots?.(lib.shelves.length)
  if (!slots) {
    root.dataset.spines = '0'
    return () => {}
  }

  const owned: { dispose(): void }[] = []
  const own = <T extends { dispose(): void }>(x: T) => (owned.push(x), x)
  const box = (w: number, h: number, d: number) => own(new THREE.BoxGeometry(w, h, d))
  const wood = own(new THREE.MeshLambertMaterial({ color: 0x3b2614 }))
  const gilt = own(new THREE.MeshLambertMaterial({ color: 0xc9a24a, emissive: 0x2a2008 }))
  const post = box(0.08, 1.15, 0.08), ledge = box(0.5, 0.04, 0.42), book = box(0.12, 0.55, 0.34), band = box(0.126, 0.03, 0.01)

  const group = new THREE.Group()
  scene.add(group)
  const pickables: THREE.Mesh[] = []
  slots.forEach((s, i) => {
    const g = new THREE.Group()
    g.position.set(...s.at)
    g.rotation.y = Math.atan2(s.out[0], s.out[1])
    const add = (geo: THREE.BufferGeometry, m: THREE.Material, y: number, z: number, pick = false) => {
      const mesh = new THREE.Mesh(geo, m)
      mesh.position.set(0, y, z)
      if (pick) (mesh.userData.index = i), pickables.push(mesh)
      g.add(mesh)
    }
    const cover = own(new THREE.MeshLambertMaterial({ color: PALETTE[hash(lib.shelves[i]!.id) % PALETTE.length] }))
    add(post, wood, 0.575, 0)
    add(ledge, wood, 1.17, 0.1)
    add(book, cover, BOOK_Y, 0.1, true)
    add(band, gilt, BOOK_Y + 0.15, FACE, true)
    add(band, gilt, BOOK_Y - 0.15, FACE, true)
    group.add(g)
  })

  // ---- place: spines exist only inside ----
  const finds: HTMLButtonElement[] = []
  const update = () => {
    const inside = !root.dataset.place || root.dataset.place === 'inside'
    group.visible = inside
    root.dataset.spines = String(inside ? slots.length : 0)
    finds.forEach((b) => (b.hidden = !inside))
    api.render()
  }

  // ---- pick ----
  const ray = new THREE.Raycaster()
  const pick = (e: PointerEvent) => {
    if (!group.visible) return -1
    const b = canvas.getBoundingClientRect()
    camera.updateMatrixWorld()
    ray.setFromCamera(new THREE.Vector2(((e.clientX - b.left) / b.width) * 2 - 1, -(((e.clientY - b.top) / b.height) * 2 - 1)), camera)
    const hit = ray.intersectObjects(pickables, false)[0]
    return hit ? (hit.object.userData.index as number) : -1
  }

  // ---- hover title ----
  const tip = el('div', { 'data-spine-title': '', role: 'tooltip' })
  tip.hidden = true
  root.append(tip)
  const onMove = (e: PointerEvent) => {
    const i = e.pointerType === 'mouse' && !e.buttons ? pick(e) : -1
    tip.hidden = i < 0
    canvas.style.cursor = i < 0 ? '' : 'pointer'
    if (i < 0) return
    const r = root.getBoundingClientRect()
    tip.textContent = lib.shelves[i]!.title
    tip.style.left = `${e.clientX - r.left + 14}px`
    tip.style.top = `${e.clientY - r.top + 14}px`
  }
  const hideTip = () => (tip.hidden = true)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerleave', hideTip)

  // ---- pull ----
  let from: HTMLElement | null = null
  let dlg: HTMLDialogElement | null = null
  const close = () => {
    delete root.dataset.bookPulled
    const d = dlg
    dlg = null
    d?.remove()
    const back = from && !from.hidden && from.offsetParent ? from : canvas
    back.focus({ preventScroll: true })
  }
  const pull = (i: number) => {
    const s = lib.shelves[i]!
    from = finds[i] ?? null
    const id = `book-title-${s.id}`
    const put = el('button', { type: 'button', autofocus: '' }, 'Put back')
    put.onclick = () => d.close()
    const d = (dlg = el('dialog', { class: 'room-book', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': id, 'data-book': s.id },
      el('h2', { id }, s.title),
    ))
    if (s.author) d.append(el('p', {}, s.author))
    if (s.shelfmark) d.append(el('p', { class: 'mark' }, s.shelfmark))
    if (s.tier === 'readable-text') d.append(el('a', { href: `/read/${s.id}` }, 'Read it'))
    else if (s.url) d.append(el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, 'See it at the library'))
    d.append(put)
    d.addEventListener('close', close)
    d.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return
      const f = [...d.querySelectorAll<HTMLElement>('a[href], button')]
      const edge = f[e.shiftKey ? 0 : f.length - 1]
      if (document.activeElement === edge) (e.preventDefault(), f[e.shiftKey ? f.length - 1 : 0]!.focus())
    })
    root.append(d)
    d.showModal()
    put.focus()
    root.dataset.bookPulled = s.id
    delete root.dataset.bookFocus
  }
  api.taps.push((e) => {
    const i = pick(e)
    if (i < 0) return false
    pull(i)
    return true
  })

  // ---- find ----
  let seq = 0
  const clearFocus = () => (seq++, delete root.dataset.bookFocus)
  const toggle = root.querySelector<HTMLElement>('.room-toggle')
  const look = new THREE.Vector3(), at = new THREE.Vector3()
  lib.shelves.forEach((s, i) => {
    const li = panel.querySelector(`.room-shelves li[data-shelf="${s.id}"]`)
    if (!li) return
    const b = el('button', { type: 'button', 'data-action': 'find', 'aria-label': `Find ${s.title}` }, 'Find')
    b.onclick = () => {
      const k = slots[i]!
      look.set(k.at[0] + k.out[0] * FACE, BOOK_Y, k.at[2] + k.out[1] * FACE)
      at.set(look.x + k.out[0] * DIST, camera.position.y, look.z + k.out[1] * DIST)
      api.clamp(at)
      const ms = Math.min(3000, 800 + 50 * Math.hypot(at.x - camera.position.x, at.z - camera.position.z))
      const mine = ++seq
      delete root.dataset.bookFocus
      if (matchMedia('(max-width: 700px)').matches && toggle?.getAttribute('aria-expanded') === 'true') toggle.click()
      api.goTo([at.x, at.y, at.z], [look.x, look.y, look.z], ms).then(() => {
        if (mine === seq) root.dataset.bookFocus = s.id
      })
    }
    li.prepend(b)
    finds.push(b)
  })

  const onKey = (e: KeyboardEvent) => {
    if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key.length === 1 ? e.key.toLowerCase() : e.key)) clearFocus()
  }
  addEventListener('keydown', onKey)
  canvas.addEventListener('pointerdown', clearFocus)

  const mo = new MutationObserver(update)
  mo.observe(root, { attributes: true, attributeFilter: ['data-place'] })
  update()

  return () => {
    mo.disconnect()
    removeEventListener('keydown', onKey)
    canvas.removeEventListener('pointerdown', clearFocus)
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerleave', hideTip)
    dlg?.remove()
    tip.remove()
    finds.forEach((b) => b.remove())
    scene.remove(group)
    owned.forEach((o) => o.dispose())
  }
}
