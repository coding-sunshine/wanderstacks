import { expect, test } from '@playwright/test'
import { loadLib, roomRoot } from './iiif'
import { ready, watchErrors } from './util'
import { roomIdsD } from './util-d'

for (const room of roomIdsD()) {
  test(`d-smoke: ${room} mounts a ready room with the expected controls and a clean console`, async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto(`/room/${room}`)
    await ready(page, 'room')
    const root = roomRoot(page)
    await expect(root, 'mounts once').toHaveCount(1)
    await expect(root.locator('.room-controls button')).toHaveCount(room === 'mafra' ? 6 : 5)
    const lib = await loadLib(page, room)
    const spines = Number(await root.getAttribute('data-spines'))
    expect(spines, 'data-spines equals the shelves length').toBe(lib.shelves.length)
    expect(errors).toEqual([])
  })
}
