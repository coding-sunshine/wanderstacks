import type { Mount } from '../types'

export const mount: Mount = (el) => {
  el.innerHTML = '<section class="page" data-view="stgall" data-ready="true"><h1>St Gall</h1><p><a href="/">Back to the globe</a></p></section>'
}
