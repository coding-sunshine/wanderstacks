import type { Mount } from '../types'

export const mount: Mount = (el) => {
  el.innerHTML = '<section class="page" data-view="darwin" data-ready="true"><h1>Darwin</h1><p><a href="/">Back to the globe</a></p></section>'
}
