// Search terms carried in the URL: highlight them on the page and pick the page that holds most of them.
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const re = (words: string[]) => new RegExp(`(?<![\\p{L}\\p{N}])(?:${words.map(esc).join('|')})[\\p{L}]*`, 'giu')

export const terms = (q: string | null) => (q ?? '').toLowerCase().replace(/["“”]/g, ' ').split(/\s+/).filter((w) => w.length > 1)

// Wraps matches in text nodes only, so tags and attributes are never touched.
export function mark(html: string, words: string[]): string {
  if (!words.length) return html
  const r = re(words)
  return html.split(/(<[^>]*>)/).map((s) => (s.startsWith('<') ? s : s.replace(r, '<mark>$&</mark>'))).join('')
}

// Index of the page matching the most distinct words (first on a tie), or -1.
export function locate(pages: string[], words: string[]): number {
  let best = -1
  let score = 0
  pages.forEach((p, i) => {
    const text = p.replace(/<[^>]*>/g, ' ').toLowerCase()
    const n = words.filter((w) => re([w]).test(text)).length
    if (n > score) { score = n; best = i }
  })
  return best
}
