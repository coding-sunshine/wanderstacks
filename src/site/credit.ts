// Ready-to-paste attribution for a Commons photograph: title, author, source, licence.
import type { Photo } from './data'

// "CC BY-SA 3.0 igo" -> https://creativecommons.org/licenses/by-sa/3.0/igo/; public domain has no deed.
export function licUrl(lic: string): string | undefined {
  if (lic === 'CC0') return 'https://creativecommons.org/publicdomain/zero/1.0/'
  const m = /^CC (BY(?:-SA)?) (\d\.\d)(?: (\w+))?$/.exec(lic)
  return m ? `https://creativecommons.org/licenses/${m[1].toLowerCase()}/${m[2]}/${m[3] ? m[3] + '/' : ''}` : undefined
}

export function credit(p: Pick<Photo, 'cap' | 'by' | 'lic' | 'src'>): string {
  const u = licUrl(p.lic)
  return `${p.cap}. Photo: ${p.by}, ${p.lic}${u ? ` (${u})` : ''}, via Wikimedia Commons: ${p.src}`
}
