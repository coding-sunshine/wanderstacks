import type { Mount } from '../types'

export const mount: Mount = (el, params) => {
  el.innerHTML =
    params.lib === 'alexandria'
      ? '<section class="page" data-view="ledger" data-ready="true"><h1>Ledger</h1><p><a href="/">Back to the globe</a></p></section>'
      : '<section class="page" data-view="ledger" data-ready="true"><h1>Not on any shelf</h1><p><a href="/">Back to the globe</a></p></section>'
}
