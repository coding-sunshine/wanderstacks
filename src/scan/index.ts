import type { Mount } from '../types'

export const mount: Mount = (el, params) => {
  el.innerHTML =
    params.book === 'firstfolio'
      ? '<section class="page" data-view="scan" data-ready="true"><h1>Scan</h1><p><a href="/">Back to the globe</a></p></section>'
      : '<section class="page" data-view="scan" data-ready="true"><h1>Not on any shelf</h1><p><a href="/">Back to the globe</a></p></section>'
}
