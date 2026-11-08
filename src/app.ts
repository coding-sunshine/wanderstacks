export function go(path: string, state: unknown = null) {
  history.pushState(state, '', path)
  dispatchEvent(new PopStateEvent('popstate'))
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export const FADE_MS = 180

export const fade = (el: Element, to: 0 | 1, ms = FADE_MS) =>
  el.animate([{ opacity: 1 - to }, { opacity: to }], { duration: ms, easing: 'ease-out', fill: 'forwards' }).finished
