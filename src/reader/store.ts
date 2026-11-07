import type { BookMeta, BookPart } from '../types'

let dbp: Promise<IDBDatabase> | undefined
const db = () =>
  (dbp ??= new Promise((res, rej) => {
    const r = indexedDB.open('worldlibs', 1)
    r.onupgradeneeded = () => r.result.createObjectStore('books')
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  }))

async function idb<T>(mode: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  try {
    const store = (await db()).transaction('books', mode).objectStore('books')
    return await new Promise((res, rej) => {
      const r = f(store)
      r.onsuccess = () => res(r.result)
      r.onerror = () => rej(r.error)
    })
  } catch {
    return undefined
  }
}

async function load<T>(key: string, url: string, preferStored: boolean): Promise<T> {
  if (preferStored) {
    const hit = await idb<T>('readonly', (s) => s.get(key))
    if (hit) return hit
  }
  try {
    const r = await fetch(url)
    if (!r.ok) throw new Error(`${r.status} ${url}`)
    const v: T = await r.json()
    void idb('readwrite', (s) => s.put(v, key))
    return v
  } catch (e) {
    const hit = await idb<T>('readonly', (s) => s.get(key))
    if (hit) return hit
    throw e
  }
}

export const getMeta = (id: string) => load<BookMeta>(`${id}/meta`, `/book/${id}/meta.json`, false)
export const getPart = (id: string, n: number) => load<BookPart>(`${id}/${n}`, `/book/${id}/${n}.json`, true)

export function persistOnce() {
  try {
    if (localStorage.getItem('wl.persist')) return
    localStorage.setItem('wl.persist', '1')
  } catch {}
  void navigator.storage?.persist?.()
}
