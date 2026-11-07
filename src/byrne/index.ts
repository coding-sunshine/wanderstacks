import type { Mount } from '../types'

export const mount: Mount = (el, params) => {
  const h = document.createElement('h1')
  h.textContent = 'byrne ' + JSON.stringify(params)
  el.append(h)
}
