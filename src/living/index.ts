import './living.css'
import { fade, reducedMotion } from '../app'

export type StampId = string
const KEY = 'wl.stamps'

export function readStamps(): StampId[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((x): x is StampId => typeof x === 'string') : []
  } catch {
    return []
  }
}

function saveStamp(id: StampId) {
  try {
    const all = readStamps()
    if (!all.includes(id)) localStorage.setItem(KEY, JSON.stringify([...all, id]))
  } catch {
    // storage unavailable: the stamp shows for this visit only
  }
}

export interface LivingSpec {
  id: StampId
  title: string
  statement: string
  cite: string
  question: string
  options: string[]
  answer: number
  // SVG inner markup; elements with data-step are drawn in order on reveal
  figure: string
  viewBox: string
  figureLabel: string
}

const STEP_MS = 1100

export function mountLiving(el: HTMLElement, spec: LivingSpec, view: string): () => void {
  let disposed = false
  const root = document.createElement('section')
  root.className = 'living'
  root.dataset.view = view
  root.innerHTML = `
    <h1></h1>
    <blockquote><p class="statement"></p><footer class="cite"></footer></blockquote>
    <svg class="figure" role="img" preserveAspectRatio="xMidYMid meet"><rect class="paper" x="-9999" y="-9999" width="19998" height="19998"/>${spec.figure}</svg>
    <div class="ask"><p class="question"></p><div class="options" role="group"></div></div>
    <p class="result" aria-live="polite"></p>
    <p class="stamp" hidden></p>`
  const q = <T extends Element>(s: string) => root.querySelector<T>(s)!
  q('h1').textContent = spec.title
  q('.statement').textContent = spec.statement
  q('.cite').textContent = spec.cite
  q('.question').textContent = spec.question
  const svg = q<SVGSVGElement>('svg')
  svg.setAttribute('viewBox', spec.viewBox)
  svg.setAttribute('aria-label', spec.figureLabel)
  const steps = [...svg.querySelectorAll<SVGGeometryElement>('[data-step]')]
  steps.forEach((s) => s.setAttribute('pathLength', '1'))
  const result = q('.result')
  const stamp = q<HTMLElement>('.stamp')
  stamp.dataset.stamp = spec.id
  stamp.textContent = 'Stamped'

  const showStamp = (animate: boolean) => {
    stamp.hidden = false
    if (animate) void fade(stamp, 1, reducedMotion() ? 180 : 500)
  }
  const buttons = spec.options.map((label, i) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.dataset.choice = String(i)
    b.textContent = label
    b.addEventListener('click', () => void play(i))
    q('.options').append(b)
    return b
  })

  async function play(pick: number) {
    buttons.forEach((b, i) => {
      b.disabled = true
      b.classList.toggle('picked', i === pick)
    })
    if (reducedMotion()) {
      steps.forEach((s) => s.classList.add('drawn'))
      await fade(svg, 1, 180)
    } else {
      for (const s of steps) {
        if (disposed) return
        s.classList.add('drawn')
        await s.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: STEP_MS, easing: 'ease-in-out', fill: 'forwards' }).finished
      }
    }
    if (disposed) return
    buttons[spec.answer].classList.add('answer')
    result.textContent = pick === spec.answer ? 'As you said.' : `Not quite. It is ${spec.options[spec.answer].toLowerCase()}.`
    saveStamp(spec.id)
    showStamp(true)
    root.dataset.revealed = 'true'
  }

  if (readStamps().includes(spec.id)) {
    steps.forEach((s) => s.classList.add('drawn', 'done'))
    buttons.forEach((b) => (b.disabled = true))
    buttons[spec.answer].classList.add('answer')
    showStamp(false)
    root.dataset.revealed = 'true'
  }

  el.append(root)
  root.dataset.ready = 'true'
  return () => {
    disposed = true
    svg.getAnimations({ subtree: true }).forEach((a) => a.cancel())
    root.remove()
  }
}
