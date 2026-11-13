import './desk.css'
import { iiifImage, type IIIFPage } from '../iiif'
import type { Mount } from '../types'
import { exportTrail } from '../trail/export'

type Holder = { id: string; holder: string; title: string; source: string; manifest: string; pages: IIIFPage[]; error: string | null }
type Index = { lib: string; holders: { id: string; holder: string; count: number; error: string | null }[] }

export const mount: Mount = (el, params) => {
  el.innerHTML = `<section class="page desk" data-view="desk" data-ready="false">
    <header class="desk-head"><p class="kicker">One desk, many surviving copies</p><h1>The reading desk</h1><p>Choose two holders and turn their pages together. Images remain at their home institutions.</p></header>
    <div class="desk-controls" role="group" aria-label="Reading desk controls">
      <label>Left copy <select data-side="left" aria-label="Left holder"></select></label>
      <span><button type="button" data-prev>Previous</button><span role="status" data-count>Opening the desk</span><button type="button" data-next>Next</button></span>
      <label>Right copy <select data-side="right" aria-label="Right holder"></select></label>
      <button type="button" data-export>Export desk trail</button>
    </div>
    <div class="desk-copies"><article data-copy="left"></article><article data-copy="right"></article></div>
    <p class="desk-note">IIIF v2 and v3 manifests are cached at build time. Page images are requested from each holder. Rights and source links stay beside each copy.</p>
  </section>`
  const root = el.firstElementChild as HTMLElement
  let holders: Holder[] = []
  const query = new URLSearchParams(location.search)
  const requestedPage = Number(query.get('page') ?? 0)
  const sides: Record<'left' | 'right', number> = { left: Number(query.get('left') ?? 0), right: Number(query.get('right') ?? 1) }
  let at = Number.isInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0

  const count = root.querySelector<HTMLElement>('[data-count]')!
  const show = (side: 'left' | 'right') => {
    const holder = holders[sides[side]]
    const article = root.querySelector<HTMLElement>(`[data-copy="${side}"]`)!
    if (!holder) { article.textContent = 'No holder selected.'; return }
    const page = holder.pages[at]
    article.replaceChildren()
    const title = document.createElement('h2')
    title.textContent = holder.holder
    const meta = document.createElement('p')
    meta.className = 'desk-holder-meta'
    const source = document.createElement('a')
    source.href = holder.source
    source.target = '_blank'
    source.rel = 'noopener noreferrer'
    source.textContent = 'Evidence'
    const manifest = document.createElement('a')
    manifest.href = holder.manifest
    manifest.target = '_blank'
    manifest.rel = 'noopener noreferrer'
    manifest.textContent = 'IIIF manifest'
    meta.append(source, ' · ', manifest)
    article.append(title, meta)
    if (!page) {
      const error = document.createElement('p')
      error.className = 'desk-error'
      error.textContent = holder.error ? `This holder could not be read: ${holder.error}` : 'No page at this position. Choose another holder or turn back.'
      article.append(error)
      return
    }
    const image = new Image()
    image.src = iiifImage(page, 1000)
    image.alt = `${holder.title}, ${page.label}`
    image.width = page.w
    image.height = page.h
    image.loading = at < 2 ? 'eager' : 'lazy'
    image.decoding = 'async'
    image.onerror = () => {
      image.replaceWith(Object.assign(document.createElement('p'), { className: 'desk-error', textContent: `The image at ${holder.holder} could not be loaded. Open the IIIF manifest to try the holder directly.` }))
    }
    const caption = document.createElement('p')
    caption.textContent = page.label
    article.append(image, caption)
  }
  const paint = () => {
    const max = Math.max(...holders.map((h) => h.pages.length), 0)
    at = Math.max(0, Math.min(at, Math.max(0, max - 1)))
    count.textContent = max ? `Image ${at + 1} of ${max}` : 'No readable images'
    root.querySelector<HTMLButtonElement>('[data-prev]')!.disabled = at === 0
    root.querySelector<HTMLButtonElement>('[data-next]')!.disabled = !max || at >= max - 1
    show('left'); show('right')
    const url = new URL(location.href)
    url.searchParams.set('left', String(sides.left))
    url.searchParams.set('right', String(sides.right))
    url.searchParams.set('page', String(at))
    history.replaceState(null, '', url)
    for (const holder of holders) {
      const page = holder.pages[at + 1]
      if (page) new Image().src = iiifImage(page, 1000)
    }
  }
  const turn = (direction: number) => { at += direction; paint() }
  root.querySelector('[data-prev]')!.addEventListener('click', () => turn(-1))
  root.querySelector('[data-next]')!.addEventListener('click', () => turn(1))
  root.querySelector('[data-export]')!.addEventListener('click', () => {
    const left = holders[sides.left], right = holders[sides.right]
    exportTrail({
      library: params.lib,
      title: `${left.title} and ${right.title}, reading desk`,
      url: location.href,
      camera: `Image ${at + 1}`,
      stops: [`Left: ${left.holder}`, `Right: ${right.holder}`],
      facts: [left, right].map((holder) => ({
        text: `${holder.title}, ${holder.pages[at]?.label ?? 'no image at this position'}`,
        sources: [holder.source, holder.manifest, holder.pages[at]?.service].filter((source): source is string => !!source),
      })),
    }, 'markdown')
  })
  root.querySelectorAll<HTMLSelectElement>('select[data-side]').forEach((select) => select.addEventListener('change', () => {
    sides[select.dataset.side as 'left' | 'right'] = Number(select.value)
    paint()
  }))
  const keys = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key === 'ArrowLeft') { event.preventDefault(); turn(-1) }
    else if (event.key === 'ArrowRight') { event.preventDefault(); turn(1) }
  }
  document.addEventListener('keydown', keys)

  fetch(`/desk/${params.lib}/index.json`)
    .then((response) => response.ok ? response.json() as Promise<Index> : Promise.reject(new Error(String(response.status))))
    .then(async (index) => {
      holders = await Promise.all(index.holders.map(async (holder) => {
        const response = await fetch(`/desk/${params.lib}/${holder.id}.json`)
        if (!response.ok) throw new Error(`${holder.holder}: ${response.status}`)
        return response.json() as Promise<Holder>
      }))
      for (const side of ['left', 'right'] as const) {
        sides[side] = Math.max(0, Math.min(holders.length - 1, Number.isInteger(sides[side]) ? sides[side] : side === 'left' ? 0 : 1))
        const select = root.querySelector<HTMLSelectElement>(`select[data-side="${side}"]`)!
        for (const [i, holder] of holders.entries()) {
          const option = document.createElement('option')
          option.value = String(i)
          option.textContent = `${holder.holder}${holder.pages.length ? ` (${holder.pages.length} images)` : ' (unavailable)'}`
          select.append(option)
        }
        select.value = String(sides[side])
      }
      root.dataset.ready = 'true'
      paint()
    })
    .catch(() => {
      count.textContent = 'The desk could not be opened. Return to the collection journey and try the holder links directly.'
      root.dataset.ready = 'error'
    })
  return () => document.removeEventListener('keydown', keys)
}
