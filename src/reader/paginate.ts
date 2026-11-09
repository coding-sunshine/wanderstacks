export interface Block { k: 'p' | 'h2' | 'h4'; html: string; q: boolean }

import { headpiece } from './ornament'

export function blocks(chapter: { title: string; html: string }): Block[] {
  const out: Block[] = [{ k: 'h2', html: esc(chapter.title), q: false }]
  let q = false
  for (const m of chapter.html.matchAll(/<(\/?)blockquote>|<p>([\s\S]*?)<\/p>|<h4>([\s\S]*?)<\/h4>/g)) {
    if (m[0].includes('blockquote')) q = !m[1]
    else if (m[2] !== undefined) out.push({ k: 'p', html: m[2], q })
    else out.push({ k: 'h4', html: m[3], q: false })
  }
  return out
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

// Splits after the first n whitespace-separated words, closing and reopening em/strong across the cut.
export function cut(html: string, n: number): [string, string] {
  const words = html.match(/\S+\s*/g) ?? []
  const head = words.slice(0, n).join('')
  const stack: string[] = []
  for (const m of head.matchAll(/<(\/?)(em|strong)>/g)) m[1] ? stack.pop() : stack.push(m[2])
  return [
    head.trimEnd() + stack.map((t) => `</${t}>`).reverse().join(''),
    stack.map((t) => `<${t}>`).join('') + words.slice(n).join(''),
  ]
}

export const wordCount = (html: string) => (html.match(/\S+\s*/g) ?? []).length

// Fills fixed-size pages in the DOM: `page` is a laid-out box with the reader's page styles, `text` its content node.
export function paginate(chapters: { title: string; html: string }[], page: HTMLElement, text: HTMLElement): string[] {
  const pages: string[] = []
  const over = () => page.scrollHeight > page.clientHeight
  const commit = () => {
    if (text.childElementCount) pages.push(text.innerHTML)
    text.replaceChildren()
  }
  const make = (b: Block, html: string, cont: boolean) => {
    const el = document.createElement(b.k)
    el.innerHTML = html
    el.className = [b.q && 'q', cont && 'c'].filter(Boolean).join(' ')
    return el
  }

  for (const ch of chapters) {
    commit()
    // A gilt headpiece opens every chapter, like a well-set printed book.
    const orn = document.createElement('div')
    orn.className = 'rd-orn'
    orn.style.backgroundImage = headpiece(ch.title)
    text.append(orn)
    let firstP = true
    for (const b of blocks(ch)) {
      let rest = b.html
      let cont = false
      while (rest) {
        const el = make(b, rest, cont)
        if (b.k === 'p' && firstP && !cont) el.classList.add('dc')
        if (b.k === 'p') firstP = false
        text.append(el)
        if (!over() || b.k !== 'p') break
        let lo = 0
        let hi = wordCount(rest) - 1
        while (lo < hi) {
          const mid = Math.ceil((lo + hi) / 2)
          el.innerHTML = cut(rest, mid)[0]
          if (over()) hi = mid - 1
          else lo = mid
        }
        if (lo === 0 && text.childElementCount > 1) { el.remove(); commit(); continue }
        const [head, tail] = cut(rest, Math.max(lo, 1))
        el.innerHTML = head
        commit()
        rest = tail
        cont = true
      }
      if (b.k === 'h2' && over()) commit()
    }
  }
  commit()
  return pages
}
