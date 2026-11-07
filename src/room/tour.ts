import type { RoomApi } from './kit'

export function attach(_api: RoomApi): () => void {
  return () => {}
}
